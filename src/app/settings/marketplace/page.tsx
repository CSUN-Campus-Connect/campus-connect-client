"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import {
  SettingsPageHeader,
  SettingsSectionLabel,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
  SettingsInsetDivider,
  SettingsChevron,
} from "@/components/settings";

const BUYER_CATEGORIES = ["Books", "Tech", "Furniture", "Housing", "Services", "Other"] as const;
const RADIUS_MILES = [1, 3, 5, 10, 25] as const;

export default function MarketplaceSettingsPage() {
  const [allowOffers, setAllowOffers] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [listingVisibility, setListingVisibility] = useState<"campus" | "public">("campus");
  const [autoMarkSold, setAutoMarkSold] = useState(false);
  const [sellerDefaultMeetupAddress, setSellerDefaultMeetupAddress] = useState("");

  const [buyerCategories, setBuyerCategories] = useState<string[]>(["Books", "Tech"]);
  const [radiusMiles, setRadiusMiles] = useState<number>(5);
  const [savedSearches, setSavedSearches] = useState(true);

  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyPriceDrops, setNotifyPriceDrops] = useState(true);
  const [notifyNewListings, setNotifyNewListings] = useState(true);
  const [itemSoldAlerts, setItemSoldAlerts] = useState(true);

  const [whoCanMessage, setWhoCanMessage] = useState<"everyone" | "students" | "campus" | "nobody">("students");
  const [showProfileOnListings, setShowProfileOnListings] = useState(false);
  const [reportListingShortcut, setReportListingShortcut] = useState(true);

  const [preferredPayment, setPreferredPayment] = useState<"zelle" | "venmo" | "cash" | "other">("zelle");
  const [enableInAppPayments, setEnableInAppPayments] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState(true);

  const [defaultMeetup, setDefaultMeetup] = useState<string>("student_center");
  const [campusOnlyTrading, setCampusOnlyTrading] = useState(true);

  const [showSellerRating, setShowSellerRating] = useState(true);
  const [allowBuyerReviews, setAllowBuyerReviews] = useState(true);

  const toggleCategory = (c: string) => {
    setBuyerCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <Box>
      <SettingsPageHeader
        title="Marketplace settings"
        subtitle="Buying, selling, meetups, and safety. Saved on this device until account sync is enabled."
      />

      <SettingsSectionLabel>Seller settings</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="rose"
          icon={<LocalOfferOutlinedIcon fontSize="small" />}
          title="Allow offers"
          action={<SettingsToggle checked={allowOffers} onChange={setAllowOffers} inputProps={{ "aria-label": "Allow offers" }} />}
        />
        <SettingsRow
          divider
          tint="blue"
          icon={<ContactMailOutlinedIcon fontSize="small" />}
          title="Show contact info"
          action={<SettingsToggle checked={showContactInfo} onChange={setShowContactInfo} inputProps={{ "aria-label": "Show contact info to buyers" }} />}
        />
        <SettingsRow
          divider
          tint="violet"
          icon={<VisibilityOutlinedIcon fontSize="small" />}
          title="Listing visibility"
          action={
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="listing-vis-label">Visibility</InputLabel>
              <Select
                labelId="listing-vis-label"
                label="Visibility"
                value={listingVisibility}
                onChange={(e) => setListingVisibility(e.target.value as "campus" | "public")}
              >
                <MenuItem value="campus">Campus only</MenuItem>
                <MenuItem value="public">Public</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="amber"
          icon={<SellOutlinedIcon fontSize="small" />}
          title="Auto mark as sold"
          description="When a buyer confirms pickup or payment."
          action={<SettingsToggle checked={autoMarkSold} onChange={setAutoMarkSold} inputProps={{ "aria-label": "Auto mark as sold" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Default meetup when selling</SettingsSectionLabel>
      <SettingsCard>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem", color: "text.primary" }}>Meetup address</Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.35, mb: 1.25 }}>
            Pre-fills on new listings so buyers know where you usually hand off items. You can still change it per listing.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            label="Address or meeting point"
            placeholder="e.g. Student Center east entrance, 123 Campus Dr, or a public spot you prefer"
            value={sellerDefaultMeetupAddress}
            onChange={(e) => setSellerDefaultMeetupAddress(e.target.value)}
            inputProps={{ "aria-label": "Default meetup address when selling" }}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: (t: any) => t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#F9FAFB" },
            }}
          />
        </Box>
      </SettingsCard>

      <SettingsSectionLabel>Buyer preferences</SettingsSectionLabel>
      <SettingsCard>
        <Box sx={{ display: "flex", gap: 1.5, px: 2, py: 1.5, alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "text.secondary",
            }}
          >
            <CategoryOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem", color: "text.primary" }}>Preferred categories</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.35 }}>Highlight listings that match your interests.</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              {BUYER_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  onClick={() => toggleCategory(c)}
                  variant={buyerCategories.includes(c) ? "filled" : "outlined"}
                  sx={{
                    fontWeight: 600,
                    ...(buyerCategories.includes(c)
                      ? { bgcolor: "#B11226", color: "#fff", "&:hover": { bgcolor: "#8E0E1F" } }
                      : {}),
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
        <SettingsInsetDivider />
        <SettingsRow
          divider
          tint="emerald"
          icon={<PlaceOutlinedIcon fontSize="small" />}
          title="Max distance"
          action={
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="radius-label">Miles</InputLabel>
              <Select
                labelId="radius-label"
                label="Miles"
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(Number(e.target.value))}
              >
                {RADIUS_MILES.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m} miles
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="cyan"
          icon={<BookmarkBorderOutlinedIcon fontSize="small" />}
          title="Saved searches"
          action={<SettingsToggle checked={savedSearches} onChange={setSavedSearches} inputProps={{ "aria-label": "Saved searches" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Notifications</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="orange"
          icon={<MarkEmailUnreadOutlinedIcon fontSize="small" />}
          title="New messages"
          action={<SettingsToggle checked={notifyMessages} onChange={setNotifyMessages} inputProps={{ "aria-label": "New message notifications" }} />}
        />
        <SettingsRow
          divider
          tint="green"
          icon={<TrendingDownOutlinedIcon fontSize="small" />}
          title="Price drops"
          action={<SettingsToggle checked={notifyPriceDrops} onChange={setNotifyPriceDrops} inputProps={{ "aria-label": "Price drop notifications" }} />}
        />
        <SettingsRow
          divider
          tint="cyan"
          icon={<AddShoppingCartOutlinedIcon fontSize="small" />}
          title="New listings"
          action={<SettingsToggle checked={notifyNewListings} onChange={setNotifyNewListings} inputProps={{ "aria-label": "New listings notifications" }} />}
        />
        <SettingsRow
          tint="amber"
          icon={<NotificationsActiveOutlinedIcon fontSize="small" />}
          title="Item sold alerts"
          action={<SettingsToggle checked={itemSoldAlerts} onChange={setItemSoldAlerts} inputProps={{ "aria-label": "Item sold alerts" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Privacy &amp; safety</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="sky"
          icon={<ForumOutlinedIcon fontSize="small" />}
          title="Who can message you"
          action={
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="msg-who-label">Audience</InputLabel>
              <Select
                labelId="msg-who-label"
                label="Audience"
                value={whoCanMessage}
                onChange={(e) => setWhoCanMessage(e.target.value as typeof whoCanMessage)}
              >
                <MenuItem value="everyone">Everyone</MenuItem>
                <MenuItem value="students">Students only</MenuItem>
                <MenuItem value="campus">Campus only</MenuItem>
                <MenuItem value="nobody">Nobody</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="slate"
          icon={<PersonOutlineIcon fontSize="small" />}
          title="Show profile on listings"
          action={<SettingsToggle checked={showProfileOnListings} onChange={setShowProfileOnListings} inputProps={{ "aria-label": "Show profile on listings" }} />}
        />
        <SettingsRow
          divider
          tint="red"
          icon={<BlockOutlinedIcon fontSize="small" />}
          title="Blocked users"
          action={
            <Box component={Link} href="/settings/privacy" sx={{ display: "flex", alignItems: "center", color: "inherit" }}>
              <SettingsChevron />
            </Box>
          }
        />
        <SettingsRow
          tint="rose"
          icon={<FlagOutlinedIcon fontSize="small" />}
          title="Report listing shortcut"
          action={<SettingsToggle checked={reportListingShortcut} onChange={setReportListingShortcut} inputProps={{ "aria-label": "Report listing shortcut" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Payments</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="green"
          icon={<PaymentOutlinedIcon fontSize="small" />}
          title="Preferred payment method"
          action={
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="pay-label">Method</InputLabel>
              <Select
                labelId="pay-label"
                label="Method"
                value={preferredPayment}
                onChange={(e) => setPreferredPayment(e.target.value as typeof preferredPayment)}
              >
                <MenuItem value="zelle">Zelle</MenuItem>
                <MenuItem value="venmo">Venmo</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="violet"
          icon={<SmartphoneOutlinedIcon fontSize="small" />}
          title="Enable in-app payments"
          action={<SettingsToggle checked={enableInAppPayments} onChange={setEnableInAppPayments} inputProps={{ "aria-label": "Enable in-app payments" }} />}
        />
        <SettingsRow
          tint="blue"
          icon={<ReceiptLongOutlinedIcon fontSize="small" />}
          title="Transaction history"
          action={<SettingsToggle checked={transactionHistory} onChange={setTransactionHistory} inputProps={{ "aria-label": "Transaction history" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Location</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="orange"
          icon={<LocationOnOutlinedIcon fontSize="small" />}
          title="Default meetup spot"
          action={
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="meetup-label">Spot</InputLabel>
              <Select
                labelId="meetup-label"
                label="Spot"
                value={defaultMeetup}
                onChange={(e) => setDefaultMeetup(e.target.value)}
              >
                <MenuItem value="student_center">Student Center</MenuItem>
                <MenuItem value="library">Library</MenuItem>
                <MenuItem value="dorms">Residence halls</MenuItem>
                <MenuItem value="custom">Ask each time</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="brand"
          icon={<SchoolOutlinedIcon fontSize="small" />}
          title="Campus-only trading"
          action={<SettingsToggle checked={campusOnlyTrading} onChange={setCampusOnlyTrading} inputProps={{ "aria-label": "Campus-only trading" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Ratings &amp; reviews</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="amber"
          icon={<StarOutlineOutlinedIcon fontSize="small" />}
          title="Show seller rating"
          action={<SettingsToggle checked={showSellerRating} onChange={setShowSellerRating} inputProps={{ "aria-label": "Show seller rating" }} />}
        />
        <SettingsRow
          tint="cyan"
          icon={<RateReviewOutlinedIcon fontSize="small" />}
          title="Allow buyer reviews"
          action={<SettingsToggle checked={allowBuyerReviews} onChange={setAllowBuyerReviews} inputProps={{ "aria-label": "Allow buyer reviews" }} />}
        />
      </SettingsCard>
    </Box>
  );
}
