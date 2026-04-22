"use client";

import * as React from "react";
import { Card, CardContent, Stack, TextField, Button, Chip, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { WidgetHeader } from "./WidgetHeader";

export const MarketplaceSuggestWidget: React.FC<{ onDelete?: () => void }> = ({ onDelete }) => {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Array<{id:string; title:string; price?:string}>>([]);
  const suggested = ["MacBook", "TI-84", "Calc II Textbook", "Noise-canceling headphones"];

  const search = async () => {
    // TODO: replace with GET /api/marketplace/search?q=...
    const mock = [
      { id: "1", title: `${q} (like new)`, price: "$250" },
      { id: "2", title: `${q} — student discount`, price: "$199" },
    ];
    setResults(q ? mock : []);
  };

  return (
    <Card className="widget-card" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <WidgetHeader title="Marketplace Suggestions" onDelete={onDelete} />
      <CardContent sx={{ flex: 1, overflow: "auto" }}>
        <Stack direction={{xs:"column", sm:"row"}} spacing={1} mb={1}>
          <TextField size="small" placeholder="Search used electronics, textbooks…" inputProps={{ "aria-label": "Search marketplace items" }} value={q} onChange={(e)=>setQ(e.target.value)} fullWidth />
          <Button startIcon={<SearchIcon />} variant="contained" onClick={search}>Search</Button>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
          {suggested.map((s) => (<Chip key={s} label={s} onClick={()=>setQ(s)} />))}
        </Stack>
        <Stack spacing={1}>
          {results.map(r => (
            <Stack key={r.id} sx={{ p: 1.25, border: "1px solid #eee", borderRadius: 2 }}>
              <Typography fontWeight={700}>{r.title}</Typography>
              {r.price && <Typography variant="body2" color="text.secondary">{r.price}</Typography>}
            </Stack>
          ))}
          {results.length === 0 && <Typography variant="body2" color="text.secondary">Try a search or pick a suggestion above.</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
};
