"use client";

import * as React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuthorize } from "@/lib/useAuthorize";

dayjs.extend(relativeTime);

import { Box, Container, Stack, Typography, Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  TextField,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
//import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
//import FavoriteIcon from "@mui/icons-material/Favorite";
//import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
//import RepeatIcon from "@mui/icons-material/Repeat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PollIcon from "@mui/icons-material/Poll";
import SendIcon from "@mui/icons-material/Send";
import SaveOutlinedIcon from "@mui/icons-material/SaveAlt";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";


type Pos = { x: number; y: number; scale: number };

export type Profile = {
  first: string;
  middle?: string;
  last: string;
  username?: string;
  email: string;
  discord?: string;
  major?: string;
  year?: string;
  bio?: string;
  linkedin?: string;
  interests?: string[];
  portfolio?: string; // Google Drive or direct PDF URL
  avatar?: string;
  banner?: string;
  background?: string;
  followers?: number;
  following?: number;
  posts?: number;
  avatarPos?: Pos;
  bannerPos?: Pos;
  backgroundPos?: Pos;
  pronouns?: string;
};


type Comment = { id: string; text: string; createdAt: string };
type Poll = {
  question: string;
  options: { id: string; text: string; votes: number }[];
  votedOptionId?: string;
};
type Post = {
  id: string;
  text?: string;
  images?: string[];
  poll?: Poll;
  createdAt: string;
  likes: number;
  liked: boolean;
  reposts: number;
  bookmarked: boolean;
  pinned?: boolean;
  comments: Comment[];
};

type UiPrefs = {
  mode: "dark" | "light";
  cardColor?: string;
  useBannerColor?: boolean;
  bannerColor?: string;
  useBackgroundColor?: boolean;
  backgroundColor?: string;
};

const PROFILE_KEY = "profile:data";
const POSTS_KEY = "profile:posts";
const UIPREFS_KEY = "profile:uiPrefs";

// ---------- storage helpers ----------
const loadProfile = (): Profile => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user)
      return null;

    const newProfile: Profile = {
      first: user.firstName,
      middle: user?.middleName || null,
      last: user.lastName,
      username: user.username || null,
      email: user.email,
      discord: user?.discord || null,
      major: user?.major || null,
      year: user?.year || null,
      bio: user?.bio,
      linkedin: user?.linkedin || null,
      interests: user?.interests || null,
      portfolio: user?.websites || null, // Google Drive or direct PDF URL
      avatar: user?.avatar || null,
      banner: user?.banner || null,
      background: user?.background || null,
      followers: user?.followers || 0,
      following: user?.following || 0,
      posts: user?.posts || 0,
      avatarPos: user?.avatarPos || null,
      bannerPos: user?.bannerPos || null,
      backgroundPos: user?.backgroundPos || null,
      pronouns: user?.pronouns || null,
    }; 

    return newProfile;
  } catch {
    return null;
  }
};

const saveProfile = (p: Profile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
};
const loadPosts = (): Post[] => {
  try {
    const r = localStorage.getItem(POSTS_KEY);
    if (r) return JSON.parse(r) as Post[];
  } catch {}
  return [];
};
const savePosts = (p: Post[]) => {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(p));
  } catch {}
};
const loadUi = (): UiPrefs => {
  try {
    const r = localStorage.getItem(UIPREFS_KEY);
    if (r) return JSON.parse(r);
  } catch {}
  return { mode: "dark" };
};

// ---------- style helpers ----------
function hexToRgba(hex: string, alpha: number) {
  try {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const v = parseInt(full, 16);
    const r = (v >> 16) & 255,
      g = (v >> 8) & 255,
      b = v & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  } catch {
    return `rgba(100,116,139,${alpha})`;
  }
}

function GlassCard({
  children,
  ui,
  title,
  sx,
}: {
  children: React.ReactNode;
  ui: UiPrefs;
  title?: string;
  sx?: any;
}) {
  const dark = ui.mode === "dark";
  const tint = ui.cardColor || "#64748b";
  const bg = dark ? hexToRgba(tint, 0.38) : hexToRgba(tint, 0.14);
  const text = dark ? "#fff" : "#111";
  const border = dark ? hexToRgba(tint, 0.48) : hexToRgba(tint, 0.28);

  return (
    <Card
      sx={{
        borderRadius: 3,
        color: text,
        bgcolor: bg,
        backdropFilter: "blur(12px)",
        border: `1px solid ${border}`,
        ...sx,
      }}
    >
      {title && (
        <Box
          sx={{
            px: 2,
            py: 1.1,
            fontWeight: 800,
            borderBottom: `1px solid ${border}`,
          }}
        >
          {title}
        </Box>
      )}
      <CardContent sx={{ pt: title ? 1.5 : 2 }}>{children}</CardContent>
    </Card>
  );
}
const neutralBtn = (ui: UiPrefs) =>
  ({
    bgcolor: ui.mode === "dark" ? "#3a3a3a" : "#e5e7eb",
    color: ui.mode === "dark" ? "#fff" : "#111",
    "&:hover": { bgcolor: ui.mode === "dark" ? "#2f2f2f" : "#d6d9de" },
    textTransform: "none",
  } as const);

// ---------- Composer ----------
function Composer({ onPost }: { onPost: (p: Partial<Post>) => void }) {
  const ui = loadUi();
  const dark = ui.mode === "dark";
  const btn = neutralBtn(ui);
  const [text, setText] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [pollOn, setPollOn] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [opts, setOpts] = React.useState<string[]>(["", ""]);
  const inputSx = {
    "& .MuiInputBase-root": {
      bgcolor: dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
      color: dark ? "#fff" : "#111",
    },
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files)
      .slice(0, 4)
      .forEach((f) => {
        const r = new FileReader();
        r.onload = () => setImages((p) => [...p, String(r.result)]);
        r.readAsDataURL(f);
      });
  };
  const addOpt = () => setOpts((o) => [...o, ""]);
  const updateOpt = (i: number, val: string) =>
    setOpts((o) => o.map((v, idx) => (idx === i ? val : v)));
  const submit = () => {
    if (
      !text.trim() &&
      images.length === 0 &&
      (!pollOn || !question.trim())
    )
      return;
    const poll: Poll | undefined = pollOn
      ? {
          question,
          options: opts
            .filter(Boolean)
            .map((t, i) => ({ id: "o" + i, text: t, votes: 0 })),
        }
      : undefined;
    onPost({
      text: text.trim() || undefined,
      images: images.length ? images : undefined,
      poll,
    });
    setText("");
    setImages([]);
    setPollOn(false);
    setQuestion("");
    setOpts(["", ""]);
  };
  
  return (
    <GlassCard ui={ui}>
      <Stack spacing={1.25}>
        <TextField
          placeholder="Share something with campus…"
          inputProps={{ "aria-label": "Share something with campus" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          minRows={2}
          fullWidth
          sx={inputSx}
        />
        {images.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,.12)",
                }}
              />
            ))}
          </Stack>
        )}
        {pollOn && (
          <GlassCard
            ui={ui}
            sx={{
              bgcolor:
                ui.mode === "dark"
                  ? "rgba(31,41,55,.55)"
                  : "rgba(255,255,255,.85)",
            }}
          >
            <Stack spacing={1}>
              <TextField
                label="Poll question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                fullWidth
                sx={inputSx}
              />
              {opts.map((o, i) => (
                <TextField
                  key={i}
                  label={`Option ${i + 1}`}
                  value={o}
                  onChange={(e) => updateOpt(i, e.target.value)}
                  fullWidth
                  sx={inputSx}
                />
              ))}
              <Button size="small" onClick={addOpt} startIcon={<PollIcon />} sx={btn}>
                Add option
              </Button>
            </Stack>
          </GlassCard>
        )}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1}>
            <IconButton component="label" aria-label="Add photo" sx={{ color: dark ? "#fff" : "#111" }}>
              <AddPhotoAlternateIcon aria-hidden="true" />
              <input hidden type="file" accept="image/*" multiple onChange={addImage} />
            </IconButton>
            <IconButton
              onClick={() => setPollOn((v) => !v)}
              aria-label={pollOn ? "Remove poll" : "Add poll"}
              sx={{ color: dark ? "#fff" : "#111" }}
            >
              <PollIcon aria-hidden="true" />
            </IconButton>
          </Stack>
          <Button variant="contained" onClick={submit} endIcon={<SendIcon />} sx={btn}>
            Post
          </Button>
        </Stack>
      </Stack>
    </GlassCard>
  );
}

// ---------- Post Card ----------
function PostCard({
  post,
  onLike,
  onDelete,
  onUpdate,
  onBookmark,
  onRepost,
  onPin,
  onVote,
  onComment,
}: {
  post: Post;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onBookmark: (id: string) => void;
  onRepost: (id: string) => void;
  onPin: (id: string) => void;
  onVote: (id: string, optId: string) => void;
  onComment: (id: string, text: string) => void;
}) {
  const ui = loadUi();
  const dark = ui.mode === "dark";
  const btn = neutralBtn(ui);
  const [editing, setEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(post.text || "");
  const [reply, setReply] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  const inputSx = {
    "& .MuiInputBase-root": {
      bgcolor: dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
      color: dark ? "#fff" : "#111",
    },
  };

  return (
    <GlassCard ui={ui}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#1f2937" }} />
          <Box>
            <Typography fontWeight={800}>
              {post.pinned ? "You • Pinned" : "You"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {dayjs(post.createdAt).fromNow()}
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Tooltip title="More">
            <IconButton onClick={handleMenu} sx={{ color: dark ? "#fff" : "#111" }}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
            <MenuItem
              onClick={() => {
                setEditing(true);
                closeMenu();
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(post.id);
                closeMenu();
              }}
            >
              Delete
            </MenuItem>
            <MenuItem
              onClick={() => {
                onBookmark(post.id);
                closeMenu();
              }}
            >
              {post.bookmarked ? "Remove bookmark" : "Bookmark"}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onPin(post.id);
                closeMenu();
              }}
            >
              {post.pinned ? "Unpin" : "Pin to top"}
            </MenuItem>
          </Menu>
        </Stack>

        {editing ? (
          <Stack spacing={1}>
            <TextField
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              inputProps={{ "aria-label": "Edit post content" }}
              multiline
              fullWidth
              sx={inputSx}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  onUpdate(post.id, editText);
                  setEditing(false);
                }}
                sx={btn}
              >
                Save
              </Button>
              <Button size="small" onClick={() => setEditing(false)} sx={btn}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        ) : (
          post.text && <Typography>{post.text}</Typography>
        )}

        {post.images && post.images.length > 0 && (
          <Stack spacing={1}>
            {post.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.12)",
                }}
              />
            ))}
          </Stack>
        )}

        {post.poll && (
          <Stack spacing={1}>
            <Typography fontWeight={700}>{post.poll.question}</Typography>
            <Stack spacing={1}>
              {post.poll.options.map((o) => (
                <Button
                  key={o.id}
                  variant="outlined"
                  onClick={() => onVote(post.id, o.id)}
                  sx={{ justifyContent: "space-between" }}
                >
                  <span>{o.text}</span>
                  <Chip size="small" label={o.votes} />
                </Button>
              ))}
            </Stack>
          </Stack>
        )}

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="Write a comment…"
            inputProps={{ "aria-label": "Write a comment" }}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            sx={inputSx}
          />
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              if (reply.trim()) {
                onComment(post.id, reply.trim());
                setReply("");
              }
            }}
            startIcon={<SaveOutlinedIcon />}
            sx={btn}
          >
            Reply
          </Button>
        </Stack>
      </Stack>
    </GlassCard>
  );
}

// ---------- Page ----------
export default function ProfilePage() {

// authorization
const router = useRouter();
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

  const [profile, setProfile] = React.useState<Profile>(loadProfile());
  const [posts, setPosts] = React.useState<Post[]>(loadPosts());
  const [ui, setUi] = React.useState<UiPrefs>(loadUi());

  React.useEffect(() => {
    const refresh = () => {
      setProfile(loadProfile());
      setUi(loadUi());
    };
    window.addEventListener("profile:update", refresh);
    window.addEventListener("ui:update", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("profile:update", refresh);
      window.removeEventListener("ui:update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  React.useEffect(() => {
    const p = { ...profile, posts: posts.length };
    setProfile(p);
    saveProfile(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length]);

  const name = [profile?.first, profile?.middle, profile?.last]
    .filter(Boolean)
    .join(" ");
  const bgStyle = (img?: string, pos?: Pos) => ({
    backgroundImage: `url(${img || ""})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${(pos?.scale || 1) * 100}%`,
    backgroundPosition: `${pos?.x || 0}px ${pos?.y || 0}px`,
  });

  const bannerStyle = ui.useBannerColor
    ? { background: ui.bannerColor }
    : bgStyle(profile?.banner, profile?.bannerPos);
  const pageBg = ui.useBackgroundColor
    ? { background: ui.backgroundColor }
    : bgStyle(profile?.background, profile?.backgroundPos);
  const btn = neutralBtn(ui);
  const dark = ui.mode === "dark";

  // post helpers
  const addPost = (p: Partial<Post>) => {
    const post: Post = {
      id: crypto.randomUUID(),
      text: p.text,
      images: p.images,
      poll: p.poll,
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
      reposts: 0,
      bookmarked: false,
      comments: [],
    };
    const next = [post, ...posts];
    setPosts(next);
    savePosts(next);
  };
  const like = (id: string) =>
    setPosts((prev) => {
      const next = prev.map((po) =>
        po.id === id
          ? { ...po, liked: !po.liked, likes: po.liked ? po.likes - 1 : po.likes + 1 }
          : po
      );
      savePosts(next);
      return next;
    });
  const remove = (id: string) => {
    const next = posts.filter((p) => p.id !== id);
    setPosts(next);
    savePosts(next);
  };
  const update = (id: string, text: string) => {
    const next = posts.map((p) => (p.id === id ? { ...p, text } : p));
    setPosts(next);
    savePosts(next);
  };
  const bookmark = (id: string) => {
    const next = posts.map((p) =>
      p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
    );
    setPosts(next);
    savePosts(next);
  };
  const repost = (id: string) => {
    const target = posts.find((p) => p.id === id);
    if (!target) return;
    const copy = {
      ...target,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const next = [copy, ...posts];
    setPosts(next);
    savePosts(next);
  };
  const pin = (id: string) => {
    const next = posts.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p));
    next.sort(
      (a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    );
    setPosts(next);
    savePosts(next);
  };
  const vote = (id: string, optId: string) => {
    const next = posts.map((p) => {
      if (p.id !== id || !p.poll || p.poll.votedOptionId) return p;
      return {
        ...p,
        poll: {
          ...p.poll,
          votedOptionId: optId,
          options: p.poll.options.map((o) =>
            o.id === optId ? { ...o, votes: o.votes + 1 } : o
          ),
        },
      };
    });
    setPosts(next);
    savePosts(next);
  };
  const comment = (id: string, text: string) => {
    const next = posts.map((p) =>
      p.id === id
        ? {
            ...p,
            comments: [
              ...p.comments,
              { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() },
            ],
          }
        : p
    );
    setPosts(next);
    savePosts(next);
  };

   if (!auth) return null;

  return (
    <Box sx={{ minHeight: "100vh", ...pageBg, color: dark ? "#fff" : "#111" }}>
      {/* Banner + header */}
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Box sx={{ position: "relative", mb: 2 }}>
          <Box
            sx={{
              height: 140,
              borderRadius: 3,
              overflow: "hidden",
              ...bannerStyle,
              border: "1px solid rgba(255,255,255,.15)",
            }}
          />
          <Stack
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between"
            sx={{ position: "absolute", inset: 0, p: 2 }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-end">
              <Box
                sx={{
                  width: 110,
                  height: 110,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "3px solid rgba(255,255,255,.9)",
                  boxShadow: "0 10px 30px rgba(0,0,0,.45)",
                  bgcolor: "rgba(0,0,0,.2)",
                }}
              >
                <img
                  src={profile?.avatar}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${profile?.avatarPos?.scale || 1}) translate(${profile?.avatarPos?.x || 0
                      }px, ${profile?.avatarPos?.y || 0}px)`,
                  }}
                />
              </Box>
              <Box sx={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.35)" }}>
                <Typography variant="h5" fontWeight={900}>
                  {name}
                </Typography>
                <Typography sx={{ opacity: 0.9 }}>@{profile?.username}</Typography>
                <Stack direction="row" spacing={2} mt={0.5} sx={{ opacity: 0.95 }}>
                  <Typography variant="body2">
                    <b>{profile?.posts}</b> posts
                  </Typography>
                  <Typography variant="body2">
                    <b>{profile?.followers}</b> followers
                  </Typography>
                  <Typography variant="body2">
                    <b>{profile?.following}</b> following
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component={Link}
                href="/profile/edit"
                startIcon={<EditIcon />}
                variant="contained"
                sx={btn}
              >
                Edit Profile
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          {/* LEFT column */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 300 }}>
            <GlassCard ui={ui} title="About">
              <Typography variant="body2">{profile?.bio}</Typography>
              <Divider sx={{ my: 1.5, opacity: 0.3 }} />
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  <b>Major:</b> {profile?.major || "—"}
                </Typography>
                <Typography variant="body2">
                  <b>Year:</b> {profile?.year || "—"}
                </Typography>
                <Typography variant="body2">
                  <b>Email:</b> {profile?.email}
                </Typography>
                {profile?.pronouns && (
                  <Typography variant="body2">
                    <b>Pronouns:</b> {profile?.pronouns}
                  </Typography>
                )}
                {profile?.linkedin && (
                  <Typography variant="body2">
                    <b>LinkedIn:</b>{" "}
                    <a href={profile.linkedin} target="_blank" rel="noreferrer">
                      {profile.linkedin}
                    </a>
                  </Typography>
                )}
                {profile?.discord && (
                  <Typography variant="body2">
                    <b>Discord:</b> {profile?.discord}
                  </Typography>
                )}
              </Stack>
              <Divider sx={{ my: 1.5, opacity: 0.3 }} />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {profile?.interests?.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    sx={{
                      mb: 1,
                      bgcolor:
                        ui.mode === "dark"
                          ? "rgba(255,255,255,.16)"
                          : "rgba(0,0,0,.06)",
                      color: ui.mode === "dark" ? "#fff" : "#111",
                      border: `1px solid ${
                        ui.mode === "dark"
                          ? "rgba(255,255,255,.28)"
                          : "rgba(0,0,0,.12)"
                      }`,
                    }}
                  />
                ))}
              </Stack>
            </GlassCard>

            {profile?.portfolio && (
              <GlassCard ui={ui} title="Portfolio">
                <Stack spacing={1.25}>
                  <Button
                    href={profile?.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    startIcon={<PictureAsPdfIcon />}
                    variant="contained"
                    sx={btn}
                  >
                    Open Portfolio
                  </Button>
                  <Box
                    sx={{
                      height: 360,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: `1px solid ${
                        ui.mode === "dark"
                          ? "rgba(255,255,255,.25)"
                          : "rgba(0,0,0,.15)"
                      }`,
                    }}
                  >
                    <object
                      data={profile?.portfolio}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                    >
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2">
                          If this link is a Google Drive file, set sharing to
                          “Anyone with the link”. If the PDF can’t render
                          inline, click “Open Portfolio”.
                        </Typography>
                      </Box>
                    </object>
                  </Box>
                </Stack>
              </GlassCard>
            )}
          </Stack>

          {/* RIGHT column: composer + posts */}
          <Stack spacing={2} sx={{ flex: 2 }}>
            <Composer onPost={addPost} />
            {posts
              .slice()
              .sort(
                (a, b) =>
                  (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
                  dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
              )
              .map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onLike={like}
                  onDelete={remove}
                  onUpdate={update}
                  onBookmark={bookmark}
                  onRepost={repost}
                  onPin={pin}
                  onVote={vote}
                  onComment={comment}
                />
              ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}