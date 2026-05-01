"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthorize } from "@/lib/useAuthorize";
import { api } from "@/lib/axios";
import { PublicUser } from "@/types/profile";
import { getProfile } from "@/lib/get-profile";
import { loadProfile } from "@/lib/load-profile";


import {
  Box, Container, Stack, Typography, TextField, Button, Card, CardContent,
  Autocomplete, Select, MenuItem, FormControl, InputLabel, Slider,
  ToggleButtonGroup, ToggleButton, FormControlLabel, Switch
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import PhotoIcon from "@mui/icons-material/Photo";
import ColorLensIcon from "@mui/icons-material/ColorLens";

type Pos = { x:number; y:number; scale:number };

type Profile = {
  first:string; middle?:string; last:string;
  username:string; email:string;
  major?:string; year?:string; bio?:string;
  interests:string[];
  avatar?:string; banner?:string; background?:string;
  followers:number; following:number; posts:number;
  avatarPos?:Pos; bannerPos?:Pos; backgroundPos?:Pos;
  portfolio?:string; discord?:string; linkedin?:string; pronouns?:string;
};

type UiPrefs = {
  mode: "dark"|"light";
  cardColor?: string;
  useBannerColor?: boolean;  bannerColor?: string;
  useBackgroundColor?: boolean; backgroundColor?: string;
};

const PROFILE_KEY = "user";
const UIPREFS_KEY = "profile:uiPrefs";

const MAJORS = [
  "Computer Science","Data Science","Design","Biology",
  "Business Administration","Mechanical Engineering","Mathematics","Film","Art"
];

// const loadProfile = ():Profile => {
//   if (typeof window === "undefined")
//     return { first:"", last:"", username:"", email:"", interests:[], followers:0, following:0, posts:0 } as Profile;
//   try { const raw = localStorage.getItem(PROFILE_KEY); if (raw) return JSON.parse(raw) as Profile; } catch {}
//   return { first:"", last:"", username:"", email:"", interests:[], followers:0, following:0, posts:0 } as Profile;
// };

// save profile via api
const saveProfile = async (p:Profile) => { 
  try { 
    const token = localStorage.getItem("token");
    const profileKey = JSON.parse(localStorage.getItem(PROFILE_KEY));
    const userId = JSON.parse(localStorage.getItem("user")!).id;

    console.log("user id: " + userId);
    const response = await api.put<{ token: string, user: PublicUser }>(
      "api/v1/users/upsert-profile", p,
      { 
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log(response);

    const backendUser = await getProfile(userId);
    if (backendUser){
      localStorage.setItem("user", JSON.stringify(backendUser));
      window.dispatchEvent(new Event("profile:update"));
      window.dispatchEvent(new Event("ui:update"));
    }
    else
      console.log("backend user not set");

  } catch (error: any) {
    alert(error?.response?.data?.message ||
      "frontend/src/app/profile/edit/page.tsx/saveProfile: Something went wrong"
    );
  } 
};

const loadUi = ():UiPrefs => {
  try { const raw = localStorage.getItem(UIPREFS_KEY); if (raw) return JSON.parse(raw) as UiPrefs; } catch {}
  return { mode:"dark", cardColor:"#64748b", useBannerColor:false, bannerColor:"#7a3033", useBackgroundColor:false, backgroundColor:"#7a3033" };
};
const saveUi = (u:UiPrefs) => { try { localStorage.setItem(UIPREFS_KEY, JSON.stringify(u)); } catch {} };

function hexToRgba(hex:string, alpha:number){
  try{
    const h = hex.replace("#","");
    const full = h.length===3 ? h.split("").map(c=>c+c).join("") : h;
    const v = parseInt(full,16);
    const r=(v>>16)&255, g=(v>>8)&255, b=v&255;
    return `rgba(${r},${g},${b},${alpha})`;
  }catch{ return `rgba(100,116,139,${alpha})`; }
}

function GlassCard({children, ui, title, sx}:{children:React.ReactNode; ui:UiPrefs; title?:string; sx?:any}){
  const dark = ui.mode==="dark";
  const tint = ui.cardColor || "#64748b";
  const bg   = dark ? hexToRgba(tint, .38) : hexToRgba(tint, .14);
  const text = dark ? "#fff" : "#111";
  const border = dark ? hexToRgba(tint,.48) : hexToRgba(tint,.28);
  return (
    <Card sx={{ borderRadius:3, color:text, bgcolor:bg, backdropFilter:"blur(12px)", border:`1px solid ${border}`, ...sx }}>
      {title && <Box sx={{px:2,py:1.1, fontWeight:800, borderBottom:`1px solid ${border}`}}>{title}</Box>}
      <CardContent sx={{ pt:title?1.5:2 }}>{children}</CardContent>
    </Card>
  );
}

export default function EditProfilePage(){
  const router = useRouter();

  // authorization
  const { auth, user, token, loading } = useAuthorize();
  
  React.useEffect(() => {
    if(loading) return;
    
    if (auth && token)
    console.log("Stored user: ", user);
    else {
      console.log("User not logged in.");
      console.log("auth: " + auth, ". token: " + token);
      router.replace("/");
    }
  }, [auth, token, user, loading, router]);  

  const [p,setP]   = React.useState(loadProfile());
  const [ui,setUi] = React.useState<UiPrefs>(loadUi());

  const dark = ui.mode==="dark";
  const neutralBtn = {
    bgcolor: dark ? "#3a3a3a" : "#e5e7eb",
    color:   dark ? "#fff"    : "#111",
    "&:hover": { bgcolor: dark ? "#2f2f2f" : "#d6d9de" },
    textTransform:"none"
  } as const;
  const inputSx = { "& .MuiInputBase-root": { bgcolor: dark? "rgba(255,255,255,.06)":"rgba(0,0,0,.04)", color: dark? "#fff":"#111" } };

  // image uploads
  const onImg = (e:React.ChangeEvent<HTMLInputElement>, key:"avatar"|"banner"|"background")=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>setP(prev=>({...prev,[key]:String(r.result)})); r.readAsDataURL(f);
  };

  // drag-to-pan for images
  const startDrag = (field:"avatarPos"|"bannerPos"|"backgroundPos") => (ev:React.MouseEvent<HTMLDivElement>)=>{
    const sx=ev.clientX, sy=ev.clientY;
    const start = { ...(p[field]||{x:0,y:0,scale:1}) } as Pos;
    const move=(e:MouseEvent)=> setP(prev=>({...prev,[field]:{...start, x:start.x+(e.clientX-sx), y:start.y+(e.clientY-sy)}}));
    const up=()=>{window.removeEventListener("mousemove",move); window.removeEventListener("mouseup",up);};
    window.addEventListener("mousemove",move); window.addEventListener("mouseup",up);
  };

  const handleSave = ()=>{
    const trim = (v:string | null | undefined):string | undefined => {
      if(typeof v !== "string") return undefined;
      
      const t = v.trim();
      return t === "" ? undefined : t;
    };

    const payload:Profile = {
      ...p,
      username: trim(p.username),
      interests: p.interests,
      portfolio: trim(p.portfolio),
      discord:   trim(p.discord),
      linkedin:  trim(p.linkedin),
      pronouns:  trim(p.pronouns),
      followers: p.followers,
      following: p.following,
      posts: p.posts,
    };
    saveProfile(payload);
    saveUi(ui);
    window.dispatchEvent(new Event("profile:update"));
    window.dispatchEvent(new Event("ui:update"));
    router.push("/profile");
  };

  // const bannerBoxStyle = ui.useBannerColor
  //   ? { background: ui.bannerColor, backgroundImage:"none" }
  //   : { backgroundImage:`url(${p.banner || "/banner_placeholder.jpg"})`, backgroundRepeat:"no-repeat", backgroundSize:`${(p.bannerPos?.scale||1)*100}%`, backgroundPosition:`${p.bannerPos?.x||0}px ${p.bannerPos?.y||0}px` };

  // const backgroundBoxStyle = ui.useBackgroundColor
  //   ? { background: ui.backgroundColor, backgroundImage:"none" }
  //   : { backgroundImage:`url(${p.background || "/profile_bg_texture.jpg"})`, backgroundRepeat:"no-repeat", backgroundSize:`${(p.backgroundPos?.scale||1)*100}%`, backgroundPosition:`${p.backgroundPos?.x||0}px ${p.backgroundPos?.y||0}px` };

  if (!auth) return null;
  return (
    <Box sx={{ minHeight:"100vh", ...(ui.useBackgroundColor? {background:ui.backgroundColor}:{ backgroundImage:`url(${p.background || "/profile_bg_texture.jpg"})`, backgroundSize:"cover" }) }}>
      <Container maxWidth="lg" sx={{ pt:3, pb:6, color: dark ? "#fff" : "#111" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={900}>Edit Profile</Typography>
          <Button component={Link} href="/profile" startIcon={<ArrowBackIcon/>} variant="contained" sx={neutralBtn}>
            Back to Profile
          </Button>
        </Stack>

        <Stack direction={{ xs:"column", lg:"row" }} spacing={3} alignItems="flex-start">
          {/* LEFT: form */}
          <GlassCard ui={ui} sx={{ flex:3 }}>
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch checked={ui.mode==="dark"} onChange={(_,v)=>setUi(u=>({...u, mode: v? "dark":"light"}))}/>}
                label={ui.mode==="dark" ? "Dark mode" : "Light mode"}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <ColorLensIcon/>
                <Typography>Box color</Typography>
                <Button component="label" variant="outlined" size="small" sx={neutralBtn}>
                  Pick
                  <input hidden type="color" value={ui.cardColor||"#64748b"} onChange={(e)=>setUi(u=>({...u, cardColor:e.target.value}))}/>
                </Button>
                <Box sx={{ width:24, height:24, borderRadius:1, border:"1px solid rgba(0,0,0,.2)", background: ui.cardColor }}/>
              </Stack>

              <Stack direction={{ xs:"column", sm:"row" }} spacing={2}>
                <TextField label="First" value={p.first} onChange={e=>setP({...p,first:e.target.value})} fullWidth sx={inputSx}/>
                <TextField label="Middle (optional)" value={p.middle||""} onChange={e=>setP({...p,middle:e.target.value})} fullWidth sx={inputSx}/>
                <TextField label="Last" value={p.last} onChange={e=>setP({...p,last:e.target.value})} fullWidth sx={inputSx}/>
              </Stack>

              <Stack direction={{ xs:"column", sm:"row" }} spacing={2}>
                <TextField label="Pronouns (optional)" value={p.pronouns||""} onChange={e=>setP({...p,pronouns:e.target.value})} fullWidth sx={inputSx}/>
                <TextField label="Display username (@handle)" value={p.username || ""} onChange={e=>setP({...p,username:e.target.value})} fullWidth sx={inputSx}/>
                <TextField label="School email" type="email" value={p.email} onChange={e=>setP({...p,email:e.target.value})} fullWidth sx={inputSx}/>
              </Stack>

              <Stack direction={{ xs:"column", sm:"row" }} spacing={2}>
                <Autocomplete
                  options={MAJORS}
                  value={p.major||null}
                  onChange={(_,v)=>setP({...p,major:v||""})}
                  renderInput={(params)=>(<TextField {...params} label="Major (searchable)" sx={inputSx}/>)}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel id="yr">Year</InputLabel>
                  <Select labelId="yr" label="Year" value={p.year||"First"} onChange={(e)=>setP({...p,year:String(e.target.value)})}>
                    {["First","Second","Third","Fourth","Graduate"].map(y=> <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>

              <TextField label="Short bio" value={p.bio||""} onChange={e=>setP({...p,bio:e.target.value})} multiline minRows={3} fullWidth sx={inputSx}/>

              <Stack direction={{ xs:"column", sm:"row" }} spacing={2}>
                <TextField label="LinkedIn (optional)" value={p.linkedin||""} onChange={e=>setP({...p,linkedin:e.target.value})} fullWidth sx={inputSx}/>
                <TextField label="Discord (optional)" value={p.discord||""} onChange={e=>setP({...p,discord:e.target.value})} fullWidth sx={inputSx}/>
                <TextField
                  label="Portfolio (Google Drive link or direct PDF URL)"
                  value={p.portfolio||""}
                  onChange={e=>setP({...p,portfolio:e.target.value})}
                  fullWidth
                  sx={inputSx}
                />
              </Stack>

              {/* Banner controls */}
              <Typography fontWeight={900}>Banner</Typography>
              <ToggleButtonGroup
                exclusive
                value={ui.useBannerColor? "color":"image"}
                onChange={(_,v)=> v && setUi(u=>({...u, useBannerColor: v==="color"}))}
                size="small"
              >
                <ToggleButton value="image">Image</ToggleButton>
                <ToggleButton value="color">Color</ToggleButton>
              </ToggleButtonGroup>
              {ui.useBannerColor ? (
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <Button component="label" startIcon={<ColorLensIcon/>} variant="outlined" sx={neutralBtn}>
                    Pick banner color
                    <input hidden type="color" value={ui.bannerColor||"#7a3033"} onChange={(e)=>setUi(u=>({...u,bannerColor:e.target.value}))}/>
                  </Button>
                  <Box sx={{ width:36, height:22, borderRadius:1, border:"1px solid rgba(0,0,0,.2)", background: ui.bannerColor }}/>
                </Stack>
              ) : (
                <>
                  <Box
                    onMouseDown={startDrag("bannerPos")}
                    sx={{
                      position:"relative",height:140,borderRadius:3,overflow:"hidden",
                      border:"1px solid rgba(255,255,255,.25)",cursor:"grab",bgcolor:"rgba(0,0,0,.2)", mt:1,
                      // ...bannerBoxStyle
                    }}
                  />
                  <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                    <Button component="label" startIcon={<PhotoIcon/>} variant="outlined" sx={neutralBtn}>
                      Upload
                      <input hidden type="file" accept="image/*" onChange={(e)=>onImg(e,"banner")}/>
                    </Button>
                    <Slider aria-label="Banner image scale" sx={{width:220}} min={0.5} max={3} step={0.01}
                      value={p.bannerPos?.scale||1}
                      onChange={(_,v)=>setP(prev=>({...prev, bannerPos:{...(prev.bannerPos||{x:0,y:0,scale:1}), scale:Number(v)}}))}
                    />
                  </Stack>
                </>
              )}

              {/* Background controls */}
              <Typography fontWeight={900} mt={2}>Background</Typography>
              <ToggleButtonGroup
                exclusive
                value={ui.useBackgroundColor? "color":"image"}
                onChange={(_,v)=> v && setUi(u=>({...u, useBackgroundColor: v==="color"}))}
                size="small"
              >
                <ToggleButton value="image">Image</ToggleButton>
                <ToggleButton value="color">Color</ToggleButton>
              </ToggleButtonGroup>
              {ui.useBackgroundColor ? (
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <Button component="label" startIcon={<ColorLensIcon/>} variant="outlined" sx={neutralBtn}>
                    Pick background color
                    <input hidden type="color" value={ui.backgroundColor||"#7a3033"} onChange={(e)=>setUi(u=>({...u,backgroundColor:e.target.value}))}/>
                  </Button>
                  <Box sx={{ width:36, height:22, borderRadius:1, border:"1px solid rgba(0,0,0,.2)", background: ui.backgroundColor }}/>
                </Stack>
              ) : (
                <>
                  <Box
                    onMouseDown={startDrag("backgroundPos")}
                    sx={{
                      position:"relative",height:140,borderRadius:3,overflow:"hidden",
                      border:"1px solid rgba(255,255,255,.25)",cursor:"grab",bgcolor:"rgba(0,0,0,.2)", mt:1,
                      // ...backgroundBoxStyle
                    }}
                  />
                  <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                    <Button component="label" startIcon={<PhotoIcon/>} variant="outlined" sx={neutralBtn}>
                      Upload
                      <input hidden type="file" accept="image/*" onChange={(e)=>onImg(e,"background")}/>
                    </Button>
                    <Slider aria-label="Background image scale" sx={{width:220}} min={0.5} max={3} step={0.01}
                      value={p.backgroundPos?.scale||1}
                      onChange={(_,v)=>setP(prev=>({...prev, backgroundPos:{...(prev.backgroundPos||{x:0,y:0,scale:1}), scale:Number(v)}}))}
                    />
                  </Stack>
                </>
              )}

              {/* Avatar */}
              <Typography fontWeight={900} mt={2}>Profile picture</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  onMouseDown={startDrag("avatarPos")}
                  sx={{width:120,height:120,borderRadius:2,overflow:"hidden",border:"3px solid rgba(255,255,255,.9)",cursor:"grab",bgcolor:"rgba(0,0,0,.25)"}}
                >
                  <img
                    src={p.avatar || "/avatar_placeholder.png"}
                    alt=""
                    style={{
                      width:"100%",height:"100%",objectFit:"cover",
                      transform:`scale(${p.avatarPos?.scale||1}) translate(${p.avatarPos?.x||0}px,${p.avatarPos?.y||0}px)`
                    }}
                  />
                </Box>
                <Button component="label" startIcon={<PhotoIcon/>} variant="contained" sx={neutralBtn}>
                  Upload
                  <input hidden type="file" accept="image/*" onChange={(e)=>onImg(e,"avatar")}/>
                </Button>
                <Slider size="small" aria-label="Profile picture scale" sx={{width:220}} min={0.5} max={3} step={0.01}
                  value={p.avatarPos?.scale||1}
                  onChange={(_,v)=>setP(prev=>({...prev, avatarPos:{...(prev.avatarPos||{x:0,y:0,scale:1}), scale:Number(v)}}))}
                />
              </Stack>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button component={Link} href="/profile" variant="text" sx={neutralBtn}>Cancel</Button>
                <Button startIcon={<SaveIcon/>} variant="contained" sx={neutralBtn} onClick={handleSave}>Save changes</Button>
              </Stack>
            </Stack>
          </GlassCard>

          {/* RIGHT: live preview — shows avatar overlay */}
          <GlassCard ui={ui} title="Live Preview" sx={{ flex:2 }}>
            <Box sx={{ position:"relative" }}>
              <Box
                sx={{
                  height:140, borderRadius:2, overflow:"hidden", border:"1px solid rgba(0,0,0,.2)",
                  ...(ui.useBannerColor
                    ? { background:ui.bannerColor }
                    : {
                        backgroundImage:`url(${p.banner || "/banner_placeholder.jpg"})`,
                        backgroundRepeat:"no-repeat",
                        backgroundSize:`${(p.bannerPos?.scale||1)*100}%`,
                        backgroundPosition:`${p.bannerPos?.x||0}px ${p.bannerPos?.y||0}px`
                      })
                }}
              />
              <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ position:"absolute", left:12, bottom:8 }}>
                <Box sx={{ width:60, height:60, borderRadius:1.5, overflow:"hidden", border:"3px solid rgba(255,255,255,.9)" }}>
                  <img
                    src={p.avatar || "/avatar_placeholder.png"}
                    alt=""
                    style={{
                      width:"100%", height:"100%", objectFit:"cover",
                      transform:`scale(${p.avatarPos?.scale||1}) translate(${p.avatarPos?.x||0}px,${p.avatarPos?.y||0}px)`
                    }}
                  />
                </Box>
                <Box>
                  <Typography fontWeight={900}>
                    {[p.first,p.middle,p.last].filter(Boolean).join(" ") || "Your Name"}
                  </Typography>
                  <Typography variant="caption" sx={{opacity:.85}}>
                    @{p.username || "username"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Typography fontWeight={900} mt={2} mb={1}>Background</Typography>
            <Box
              sx={{
                height:140, borderRadius:2, overflow:"hidden", border:"1px solid rgba(0,0,0,.2)",
                ...(ui.useBackgroundColor
                  ? { background:ui.backgroundColor }
                  : {
                      backgroundImage:`url(${p.background || "/profile_bg_texture.jpg"})`,
                      backgroundRepeat:"no-repeat",
                      backgroundSize:`${(p.backgroundPos?.scale||1)*100}%`,
                      backgroundPosition:`${p.backgroundPos?.x||0}px ${p.backgroundPos?.y||0}px`
                    })
              }}
            />
          </GlassCard>
        </Stack>
      </Container>
    </Box>
  );
}
