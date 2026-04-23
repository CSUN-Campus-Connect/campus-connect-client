"use client";

// @/components/StudentRecCenter/Services/ServicesSearch.tsx

import * as React from "react";
import { Box, TextField, InputAdornment, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

interface Props {
  search: string;
  onChange: (val: string) => void;
  resultCount: number;
}

export default function ServicesSearch({ search, onChange, resultCount }: Props) {
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, maxWidth: 560 }}>
        <TextField
          value={search}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search services, equipment, spaces..."
          inputProps={{ "aria-label": "Search services, equipment, or spaces" }}
          fullWidth
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.07)",
              color: "white",
              fontSize: 13.5,
              "& input::placeholder": { color: "rgba(255,255,255,0.35)", opacity: 1 },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.18)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.38)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(168,5,50,0.7)" },
            },
          }}
        />
        {search && (
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
