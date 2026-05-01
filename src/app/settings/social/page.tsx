"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";
import MotionPhotosOffOutlinedIcon from "@mui/icons-material/MotionPhotosOffOutlined";

import {
  SettingsPageHeader,
  SettingsSectionLabel,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
  SettingsChevron,
} from "@/components/settings";

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: connected ? "#15803D" : "#767676" }}>
      {connected ? "Connected" : "Not connected"}
    </Typography>
  );
}

export default function SocialFeedSettingsPage() {
  const [showProfilePublicly, setShowProfilePublicly] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);
  const [showFriendsConnections, setShowFriendsConnections] = useState(true);

  const [autoplayVideos, setAutoplayVideos] = useState(false);
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);
  const [defaultFeedSort, setDefaultFeedSort] = useState<"latest" | "top" | "popular">("latest");
  const [languageFilter, setLanguageFilter] = useState<"english" | "all">("english");

  const [postLikes, setPostLikes] = useState(true);
  const [commentsNotif, setCommentsNotif] = useState(true);
  const [mentionsNotif, setMentionsNotif] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);

  const [whoCanMessageYou, setWhoCanMessageYou] = useState<"everyone" | "friends" | "none">("friends");
  const [whoCanViewPosts, setWhoCanViewPosts] = useState<"public" | "campus" | "friends">("campus");
  const [whoCanTagYou, setWhoCanTagYou] = useState<"everyone" | "friends" | "none">("friends");

  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark">("system");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <Box>
      <SettingsPageHeader
        title="Social settings"
        subtitle="Profile, feed, notifications, and linked accounts. Stored on this device until profile sync is available."
      />

      <SettingsSectionLabel>Profile &amp; visibility</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="blue"
          icon={<PersonOutlineIcon fontSize="small" />}
          title="Show profile publicly"
          description="Let others find your profile outside mutual connections."
          action={<SettingsToggle checked={showProfilePublicly} onChange={setShowProfilePublicly} inputProps={{ "aria-label": "Show profile publicly" }} />}
        />
        <SettingsRow
          divider
          tint="violet"
          icon={<VisibilityOutlinedIcon fontSize="small" />}
          title="Show activity status"
          description="Let friends see when you are active."
          action={<SettingsToggle checked={showActivityStatus} onChange={setShowActivityStatus} inputProps={{ "aria-label": "Show activity status" }} />}
        />
        <SettingsRow
          divider
          tint="rose"
          icon={<LabelOutlinedIcon fontSize="small" />}
          title="Allow tagging"
          description="Others can tag you in posts and photos."
          action={<SettingsToggle checked={allowTagging} onChange={setAllowTagging} inputProps={{ "aria-label": "Allow tagging" }} />}
        />
        <SettingsRow
          tint="cyan"
          icon={<PeopleOutlineIcon fontSize="small" />}
          title="Show friends / connections"
          description="Display your network on your profile."
          action={<SettingsToggle checked={showFriendsConnections} onChange={setShowFriendsConnections} inputProps={{ "aria-label": "Show friends and connections" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Content preferences</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="orange"
          icon={<PlayCircleOutlineIcon fontSize="small" />}
          title="Autoplay videos"
          description="Play videos in the feed automatically."
          action={<SettingsToggle checked={autoplayVideos} onChange={setAutoplayVideos} inputProps={{ "aria-label": "Autoplay videos" }} />}
        />
        <SettingsRow
          divider
          tint="amber"
          icon={<WarningAmberOutlinedIcon fontSize="small" />}
          title="Show sensitive content"
          description="May include mature or graphic material."
          action={<SettingsToggle checked={showSensitiveContent} onChange={setShowSensitiveContent} inputProps={{ "aria-label": "Show sensitive content" }} />}
        />
        <SettingsRow
          divider
          tint="slate"
          icon={<SortOutlinedIcon fontSize="small" />}
          title="Default feed sort"
          description="How posts are ordered when you open the feed."
          action={
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="feed-sort-label">Sort</InputLabel>
              <Select
                labelId="feed-sort-label"
                label="Sort"
                value={defaultFeedSort}
                onChange={(e) => setDefaultFeedSort(e.target.value as typeof defaultFeedSort)}
              >
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="top">Top</MenuItem>
                <MenuItem value="popular">Popular</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="green"
          icon={<TranslateOutlinedIcon fontSize="small" />}
          title="Language filter"
          description="Prioritize posts in a specific language."
          action={
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="lang-filter-label">Language</InputLabel>
              <Select
                labelId="lang-filter-label"
                label="Language"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value as typeof languageFilter)}
              >
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="all">All languages</MenuItem>
              </Select>
            </FormControl>
          }
        />
      </SettingsCard>

      <SettingsSectionLabel>Notifications</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="rose"
          icon={<FavoriteBorderOutlinedIcon fontSize="small" />}
          title="Post likes"
          action={<SettingsToggle checked={postLikes} onChange={setPostLikes} inputProps={{ "aria-label": "Post likes notifications" }} />}
        />
        <SettingsRow
          divider
          tint="blue"
          icon={<ChatBubbleOutlineIcon fontSize="small" />}
          title="Comments"
          action={<SettingsToggle checked={commentsNotif} onChange={setCommentsNotif} inputProps={{ "aria-label": "Comments notifications" }} />}
        />
        <SettingsRow
          divider
          tint="violet"
          icon={<AlternateEmailOutlinedIcon fontSize="small" />}
          title="Mentions"
          action={<SettingsToggle checked={mentionsNotif} onChange={setMentionsNotif} inputProps={{ "aria-label": "Mentions notifications" }} />}
        />
        <SettingsRow
          tint="emerald"
          icon={<PersonAddAltOutlinedIcon fontSize="small" />}
          title="New followers"
          action={<SettingsToggle checked={newFollowers} onChange={setNewFollowers} inputProps={{ "aria-label": "New followers notifications" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Privacy</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="sky"
          icon={<ForumOutlinedIcon fontSize="small" />}
          title="Who can message you"
          action={
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="soc-msg-label">Audience</InputLabel>
              <Select
                labelId="soc-msg-label"
                label="Audience"
                value={whoCanMessageYou}
                onChange={(e) => setWhoCanMessageYou(e.target.value as typeof whoCanMessageYou)}
              >
                <MenuItem value="everyone">Everyone</MenuItem>
                <MenuItem value="friends">Friends only</MenuItem>
                <MenuItem value="none">No one</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="cyan"
          icon={<ArticleOutlinedIcon fontSize="small" />}
          title="Who can view posts"
          action={
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="soc-view-label">Audience</InputLabel>
              <Select
                labelId="soc-view-label"
                label="Audience"
                value={whoCanViewPosts}
                onChange={(e) => setWhoCanViewPosts(e.target.value as typeof whoCanViewPosts)}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="campus">Campus only</MenuItem>
                <MenuItem value="friends">Friends</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="pink"
          icon={<LabelOutlinedIcon fontSize="small" />}
          title="Who can tag you"
          action={
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="soc-tag-label">Audience</InputLabel>
              <Select
                labelId="soc-tag-label"
                label="Audience"
                value={whoCanTagYou}
                onChange={(e) => setWhoCanTagYou(e.target.value as typeof whoCanTagYou)}
              >
                <MenuItem value="everyone">Everyone</MenuItem>
                <MenuItem value="friends">Friends</MenuItem>
                <MenuItem value="none">No one</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="red"
          icon={<BlockOutlinedIcon fontSize="small" />}
          title="Blocked users"
          description="Manage accounts you have blocked."
          action={
            <Box component={Link} href="/settings/privacy" sx={{ display: "flex", alignItems: "center", color: "inherit" }}>
              <SettingsChevron />
            </Box>
          }
        />
      </SettingsCard>

      <SettingsSectionLabel>Account connections</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="rose"
          icon={<InstagramIcon fontSize="small" />}
          title="Instagram"
          description="Share stories or cross-post when enabled."
          action={<ConnectionStatus connected />}
        />
        <SettingsRow
          divider
          tint="blue"
          icon={<LinkedInIcon fontSize="small" />}
          title="LinkedIn"
          description="Show professional link on profile."
          action={<ConnectionStatus connected />}
        />
        <SettingsRow
          tint="slate"
          icon={<MusicNoteOutlinedIcon fontSize="small" />}
          title="TikTok"
          description="Optional link-out for creators."
          action={<ConnectionStatus connected={false} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Customization</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="violet"
          icon={<PaletteOutlinedIcon fontSize="small" />}
          title="Theme"
          description="Match system appearance or lock light/dark."
          action={
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="soc-theme-label">Theme</InputLabel>
              <Select
                labelId="soc-theme-label"
                label="Theme"
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as typeof themeMode)}
              >
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="amber"
          icon={<TextFieldsOutlinedIcon fontSize="small" />}
          title="Font size"
          action={
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="soc-font-label">Size</InputLabel>
              <Select
                labelId="soc-font-label"
                label="Size"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as typeof fontSize)}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="slate"
          icon={<MotionPhotosOffOutlinedIcon fontSize="small" />}
          title="Reduce motion"
          description="Less animation across the social feed."
          action={<SettingsToggle checked={reduceMotion} onChange={setReduceMotion} inputProps={{ "aria-label": "Reduce motion" }} />}
        />
      </SettingsCard>
    </Box>
  );
}
