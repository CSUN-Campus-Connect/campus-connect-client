"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import {
  SITE_LANGUAGES,
  type SiteLangCode,
  getStoredSiteLang,
  applySiteLanguage,
  labelForSiteLang,
} from "@/lib/siteLanguage";

const red = "#B11226";

export default function LanguageSettingsPage() {
  const [lang, setLang] = useState<SiteLangCode>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLang(getStoredSiteLang());
    setReady(true);
  }, []);

  const applyAndReload = () => {
    applySiteLanguage(lang);
    window.location.reload();
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#111827" }}>Website language</Typography>
        <Typography sx={{ color: "#6B7280", mt: 0.5, fontSize: 16 }}>
          Translate the site with Google Translate. A full reload applies your choice everywhere.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 420 }}>
        <FormControl fullWidth size="small" disabled={!ready}>
          <InputLabel id="site-lang-label">Language</InputLabel>
          <Select
            labelId="site-lang-label"
            label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value as SiteLangCode)}
          >
            {SITE_LANGUAGES.map((l) => (
              <MenuItem key={l.code} value={l.code}>
                {l.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 1.5 }}>
          Current selection: <strong>{labelForSiteLang(lang)}</strong>
        </Typography>

        <Button
          variant="contained"
          disableElevation
          onClick={applyAndReload}
          sx={{
            mt: 2.5,
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            bgcolor: red,
            "&:hover": { bgcolor: "#8E0E1F" },
          }}
        >
          Apply and reload
        </Button>
      </Box>
    </Box>
  );
}
