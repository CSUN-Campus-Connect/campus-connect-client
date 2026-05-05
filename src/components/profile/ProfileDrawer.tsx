"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LinkIcon from "@mui/icons-material/Link";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { api } from "@/lib/axios";
import { avatarColor, avatarInitials } from "@/components/messages/utils";

const RED = "#CC0033";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  city?: string;
  websites?: string[];
  userType: string;
  createdAt: string;
};

type Post = {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  isLikedByUser: boolean;
  _count: { Like: number; Comment: number };
};

type ProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [postsLoading, setPostsLoading] = React.useState(true);
  const [liking, setLiking] = React.useState<Set<string>>(new Set());
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ bio: "", city: "", website: "" });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [pendingAvatar, setPendingAvatar] = React.useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setPostsLoading(true);

    api
      .get("/api/v1/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const u = res.data.user ?? res.data;
        setUser(u);
        setEditForm({
          bio: u.bio ?? "",
          city: u.city ?? "",
          website: u.websites?.[0] ?? "",
        });
        return api.get(`/api/v1/posts/user/${u.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => setPosts(res.data.posts ?? []))
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setPostsLoading(false);
      });
  }, [open]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setPendingAvatar(file);
    setPendingAvatarPreview(URL.createObjectURL(file));
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    let profilePictureUrl = user.profilePicture ?? undefined;
    if (pendingAvatar) {
      const formData = new FormData();
      formData.append("file", pendingAvatar);
      formData.append("folder", "profiles");
      const uploadRes = await api.post("/api/v1/upload", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      profilePictureUrl = uploadRes.data.imageUrl;
      setPendingAvatar(null);
      setPendingAvatarPreview(null);
    }
    try {
      const res = await api.put(
        "/api/v1/users/upsert-profile",
        {
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: profilePictureUrl,
          bio: editForm.bio.trim() || undefined,
          city: editForm.city.trim() || undefined,
          websites: editForm.website.trim() && editForm.website.trim().startsWith("http") ? [editForm.website.trim()] : undefined,        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.data ?? res.data;
      setUser((prev) => prev ? { ...prev, ...updated } : prev);

      try {
        const stored = JSON.parse(localStorage.getItem("user") ?? "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));
      } catch {}

      setEditing(false);
    } catch (err: any) {
      console.error("Profile save failed:", err?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const toggleLike = async (post: Post) => {
    const token = localStorage.getItem("token");
    if (!token || liking.has(post.id)) return;

    setLiking((prev) => new Set([...prev, post.id]));
    try {
      if (post.isLikedByUser) {
        await api.delete(`/api/v1/posts/${post.id}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(`/api/v1/posts/${post.id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLikedByUser: !p.isLikedByUser,
                _count: {
                  ...p._count,
                  Like: p.isLikedByUser ? p._count.Like - 1 : p._count.Like + 1,
                },
              }
            : p
        )
      );
    } catch (err) {
      console.error("Like failed:", err);
    } finally {
      setLiking((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    }
  };

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden", maxHeight: "90vh" } }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>Profile</Typography>
        <Stack direction="row" spacing={1}>
          {!editing ? (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
              sx={{ textTransform: "none", fontWeight: 900, borderRadius: 999, color: RED, borderColor: RED }}
              variant="outlined"
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                size="small"
                startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
                onClick={handleSaveProfile}
                disabled={saving}
                sx={{ textTransform: "none", fontWeight: 900, borderRadius: 999, bgcolor: RED, color: "white" }}
                variant="contained"
              >
                Save
              </Button>
              <Button
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => setEditing(false)}
                sx={{ textTransform: "none", fontWeight: 900, borderRadius: 999 }}
              >
                Cancel
              </Button>
            </>
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 0, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: RED }} />
          </Box>
        ) : (
          <>
            <Box sx={{ px: 3, py: 2.5 }}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                {/* Clickable avatar with upload */}
                <Box sx={{ position: "relative", flexShrink: 0 }}>
                  <Avatar
                    src={pendingAvatarPreview ?? user?.profilePicture ?? undefined}
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: user?.profilePicture ? "white" : avatarColor(displayName),
                      fontSize: 24,
                      fontWeight: 900,
                      cursor: "pointer",
                      opacity: avatarUploading ? 0.5 : 1,
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {!user?.profilePicture && avatarInitials(displayName)}
                  </Avatar>
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: RED,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "2px solid white",
                    }}
                  >
                    {avatarUploading ? (
                      <CircularProgress size={12} sx={{ color: "white" }} />
                    ) : (
                      <CameraAltIcon sx={{ fontSize: 12, color: "white" }} />
                    )}
                  </Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarUpload}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 1000, fontSize: 20 }}>{displayName}</Typography>
                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.55)", mt: 0.25 }}>{user?.email}</Typography>
                  <Chip
                    label={user?.userType}
                    size="small"
                    sx={{ mt: 0.75, bgcolor: "rgba(204,0,51,0.08)", color: RED, fontWeight: 900, fontSize: 11 }}
                  />
                </Box>
              </Stack>

              {/* Editable fields */}
              {editing ? (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <TextField
                    label="Bio"
                    multiline
                    minRows={2}
                    fullWidth
                    size="small"
                    value={editForm.bio}
                    onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                    inputProps={{ maxLength: 160 }}
                    helperText={`${editForm.bio.length}/160`}
                  />
                  <TextField
                    label="City"
                    fullWidth
                    size="small"
                    value={editForm.city}
                    onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                  />
                  <TextField
                    label="Website"
                    fullWidth
                    size="small"
                    placeholder="https://..."
                    value={editForm.website}
                    onChange={(e) => setEditForm((p) => ({ ...p, website: e.target.value }))}
                  />
                </Stack>
              ) : (
                <>
                  {user?.bio && (
                    <Typography sx={{ mt: 2, fontSize: 14, color: "rgba(0,0,0,0.75)", lineHeight: 1.6 }}>
                      {user.bio}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} flexWrap="wrap">
                    {user?.city && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOnIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }} />
                        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>{user.city}</Typography>
                      </Stack>
                    )}
                    {user?.websites?.[0] && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LinkIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }} />
                        <Typography
                          component="a"
                          href={user.websites[0]}
                          target="_blank"
                          rel="noreferrer"
                          sx={{ fontSize: 13, color: RED, textDecoration: "none" }}
                        >
                          {user.websites[0].replace(/^https?:\/\//, "")}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </>
              )}

              <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                <Box textAlign="center">
                  <Typography sx={{ fontWeight: 1000, fontSize: 18 }}>{posts.length}</Typography>
                  <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>Posts</Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Posts */}
            <Box sx={{ px: 3, py: 2 }}>
              <Typography sx={{ fontWeight: 1000, fontSize: 14, mb: 1.5 }}>Posts</Typography>
              {postsLoading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                  <CircularProgress size={24} sx={{ color: RED }} />
                </Box>
              ) : posts.length === 0 ? (
                <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.45)", textAlign: "center", py: 3 }}>
                  No posts yet.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {posts.map((post) => (
                    <Box
                      key={post.id}
                      sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "rgba(0,0,0,0.01)" }}
                    >
                      {post.content && (
                        <Typography sx={{ fontSize: 14, mb: post.images?.length ? 1 : 0 }}>
                          {post.content}
                        </Typography>
                      )}
                      {post.images?.length > 0 && (
                        <Box
                          component="img"
                          src={post.images[0]}
                          alt=""
                          sx={{ width: "100%", borderRadius: 1.5, maxHeight: 240, objectFit: "cover", mb: 1 }}
                        />
                      )}
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                        <IconButton size="small" onClick={() => toggleLike(post)} disabled={liking.has(post.id)} sx={{ p: 0.5 }}>
                          {post.isLikedByUser ? (
                            <FavoriteIcon sx={{ fontSize: 16, color: RED }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.45)" }} />
                          )}
                        </IconButton>
                        <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>{post._count.Like}</Typography>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.45)" }} />
                        <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>{post._count.Comment}</Typography>
                        <Box sx={{ flex: 1 }} />
                        <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}