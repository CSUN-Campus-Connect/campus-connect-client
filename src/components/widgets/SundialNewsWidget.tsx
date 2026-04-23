"use client";

import * as React from "react";
import { Box, IconButton, Typography, Chip, Skeleton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NewspaperIcon from "@mui/icons-material/Newspaper";

// ─── Types ────────────────────────────────────────────────────────────────────

type SundialCategory = "news" | "sports" | "culture" | "multimedia";

interface SundialArticle {
  id: string;
  category: SundialCategory;
  title: string;
  date: Date | string;
  link: string;
  image: string | null;
  createdAt: Date | string;
}

interface SundialResponse {
  total: number;
  data: SundialArticle[];
}

// ─── Fallback Data ─────────────────────────────────────────────────────────────
// Used when API is unavailable (e.g., dev environment before backend merge)

const FALLBACK_ARTICLES: SundialArticle[] = [
  {
    id: "fallback-1",
    category: "news",
    title: "Sundial Newspaper Launches Inside Toro Connect — A Campus Social & Academic Hub Built by Matadors, for Matadors",
    date: new Date().toISOString(),
    link: "https://sundial.csun.edu",
    image: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    category: "culture",
    title: "Toro Connect Redefines Campus Life at CSUN With Unified Dashboard for Classes, Events, and Student Resources",
    date: new Date(Date.now() - 86400000).toISOString(),
    link: "https://sundial.csun.edu",
    image: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    category: "sports",
    title: "CSUN Matadors Athletics Integration Comes to Toro Connect — Live Scores and Schedules Now on Your Dashboard",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    link: "https://sundial.csun.edu",
    image: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-4",
    category: "multimedia",
    title: "From the Editors: Why We Built Toro Connect and What It Means for Matador Journalism",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    link: "https://sundial.csun.edu",
    image: null,
    createdAt: new Date().toISOString(),
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<SundialCategory, string> = {
  news: "#cc0000",
  sports: "#1a6b3c",
  culture: "#8b4513",
  multimedia: "#1a3a6b",
};

const formatDate = (raw: Date | string): string => {
  const d = raw instanceof Date ? raw : new Date(raw);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const MastheadDivider = () => (
  <Box sx={{ display: "flex", alignItems: "center", my: 0.5, gap: 0.5 }}>
    <Box sx={{ flex: 1, height: "3px", bgcolor: "#111" }} />
    <Box sx={{ flex: 1, height: "1px", bgcolor: "#111" }} />
    <Box sx={{ flex: 1, height: "3px", bgcolor: "#111" }} />
  </Box>
);

const CategoryBadge: React.FC<{ category: SundialCategory }> = ({ category }) => (
  <Box
    component="span"
    sx={{
      display: "inline-block",
      fontSize: "9px",
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: CATEGORY_COLORS[category],
      borderLeft: `2px solid ${CATEGORY_COLORS[category]}`,
      pl: 0.5,
      lineHeight: 1,
    }}
  >
    {category}
  </Box>
);

const HeadlineArticle: React.FC<{ article: SundialArticle }> = ({ article }) => (
  <Box
    component="a"
    href={article.link}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      display: "block",
      textDecoration: "none",
      color: "inherit",
      "&:hover .headline-title": { textDecoration: "underline", textDecorationColor: "#cc0000" },
    }}
  >
    <CategoryBadge category={article.category} />
    {article.image && (
      <Box
        component="img"
        src={article.image}
        alt={article.title}
        sx={{
          width: "100%",
          height: 120,
          objectFit: "cover",
          mt: 0.75,
          mb: 0.75,
          display: "block",
          filter: "grayscale(20%)",
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    )}
    <Typography
      className="headline-title"
      sx={{
        fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: 1.25,
        mt: 0.5,
        color: "#111",
        letterSpacing: "-0.01em",
      }}
    >
      {article.title}
    </Typography>
    <Typography
      sx={{
        fontFamily: "'IM Fell English', 'Georgia', serif",
        fontSize: "10px",
        color: "#777",
        mt: 0.25,
        fontStyle: "italic",
      }}
    >
      {formatDate(article.date)}
    </Typography>
  </Box>
);

const SmallArticle: React.FC<{ article: SundialArticle; showDivider?: boolean }> = ({
  article,
  showDivider = true,
}) => (
  <>
    <Box
      component="a"
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex",
        gap: 1,
        textDecoration: "none",
        color: "inherit",
        py: 0.75,
        "&:hover .small-title": { color: "#cc0000" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <CategoryBadge category={article.category} />
        <Typography
          className="small-title"
          sx={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "11.5px",
            fontWeight: 600,
            lineHeight: 1.3,
            mt: 0.3,
            color: "#111",
            transition: "color 0.15s",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Georgia, serif",
            fontSize: "9.5px",
            color: "#888",
            mt: 0.25,
            fontStyle: "italic",
          }}
        >
          {formatDate(article.date)}
        </Typography>
      </Box>
      {article.image && (
        <Box
          component="img"
          src={article.image}
          alt=""
          sx={{
            width: 52,
            height: 52,
            objectFit: "cover",
            flexShrink: 0,
            filter: "grayscale(15%)",
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </Box>
    {showDivider && <Divider sx={{ borderColor: "#ddd", borderStyle: "dashed" }} />}
  </>
);

// ─── Main Widget ───────────────────────────────────────────────────────────────

interface SundialNewsWidgetProps {
  onDelete?: () => void;
}

type FilterTab = "all" | SundialCategory;

export const SundialNewsWidget: React.FC<SundialNewsWidgetProps> = ({ onDelete }) => {
  const [articles, setArticles] = React.useState<SundialArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFallback, setIsFallback] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>("all");

  // Fetch from API; fall back gracefully
  React.useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    (async () => {
      try {
        const res = await fetch("/api/v1/sundial", { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: SundialResponse = await res.json();
        setArticles(json.data);
        setIsFallback(false);
      } catch {
        setArticles(FALLBACK_ARTICLES);
        setIsFallback(true);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    })();

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  const filtered =
    activeFilter === "all" ? articles : articles.filter((a) => a.category === activeFilter);

  const headline = filtered[0] ?? null;
  const rest = filtered.slice(1);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const TABS: FilterTab[] = ["all", "news", "sports", "culture", "multimedia"];

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fdf8f2",
        border: "1px solid #c8b99a",
        borderRadius: 1,
        overflow: "hidden",
        fontFamily: "Georgia, serif",
        // Subtle paper texture via repeating gradient
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180,160,120,0.07) 28px)",
      }}
    >
      {/* ── Drag Handle / Masthead ── */}
      <Box
        className="widget-drag"
        sx={{
          cursor: "move",
          bgcolor: "#fff",
          borderBottom: "3px double #111",
          px: 1.25,
          pt: 1,
          pb: 0.5,
        }}
      >
        {/* Top bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.25 }}>
          <Typography
            sx={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "9px",
              letterSpacing: "0.14em",
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            {isFallback ? "★ Toro Connect Launch Edition ★" : `${articles.length} stories today`}
          </Typography>
          {onDelete && (
            <IconButton size="small" onClick={onDelete} sx={{ p: 0.25 }} aria-label="close sundial widget">
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>

        {/* Big masthead */}
        <Box sx={{ textAlign: "center", lineHeight: 1 }}>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', 'UnifrakturMaguntia', Georgia, 'Times New Roman', serif",
              fontSize: "22px",
              fontWeight: 900,
              color: "#111",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            The Sundial
          </Typography>
          <MastheadDivider />
          <Typography
            sx={{
              fontFamily: "Georgia, serif",
              fontSize: "8.5px",
              color: "#555",
              fontStyle: "italic",
              letterSpacing: "0.04em",
            }}
          >
            California State University, Northridge &nbsp;·&nbsp; csun.edu
          </Typography>
          <Typography
            sx={{
              fontFamily: "Georgia, serif",
              fontSize: "8px",
              color: "#888",
              mt: 0.25,
            }}
          >
            {today}
          </Typography>
        </Box>

        {/* Category filter tabs */}
        <Box sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}>
          {TABS.map((tab) => (
            <Box
              key={tab}
              onClick={() => setActiveFilter(tab)}
              sx={{
                px: 0.75,
                py: 0.2,
                fontSize: "8.5px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "Georgia, serif",
                cursor: "pointer",
                border: "1px solid",
                borderColor: activeFilter === tab ? "#111" : "#bbb",
                bgcolor: activeFilter === tab ? "#111" : "transparent",
                color: activeFilter === tab ? "#fff" : "#555",
                borderRadius: 0,
                transition: "all 0.15s",
                "&:hover": { borderColor: "#111", color: activeFilter === tab ? "#fff" : "#111" },
              }}
            >
              {tab === "all" ? "All" : tab}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.25, py: 1, "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#c8b99a", borderRadius: 1 } }}>
        {loading ? (
          // Skeleton loading
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Skeleton variant="rectangular" height={14} width="60%" sx={{ bgcolor: "#e8dcc8" }} />
            <Skeleton variant="rectangular" height={90} sx={{ bgcolor: "#e8dcc8" }} />
            <Skeleton variant="rectangular" height={12} width="40%" sx={{ bgcolor: "#e8dcc8" }} />
            <Divider sx={{ borderColor: "#ddd" }} />
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, py: 0.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="rectangular" height={10} width="50%" sx={{ bgcolor: "#e8dcc8", mb: 0.5 }} />
                  <Skeleton variant="rectangular" height={10} sx={{ bgcolor: "#e8dcc8" }} />
                  <Skeleton variant="rectangular" height={10} width="80%" sx={{ bgcolor: "#e8dcc8", mt: 0.5 }} />
                </Box>
                <Skeleton variant="rectangular" width={52} height={52} sx={{ bgcolor: "#e8dcc8" }} />
              </Box>
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
            <NewspaperIcon sx={{ fontSize: 36, opacity: 0.3 }} />
            <Typography sx={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", mt: 1 }}>
              No articles in this section.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Fallback notice */}
            {isFallback && (
              <Box
                sx={{
                  mb: 1,
                  p: 0.75,
                  bgcolor: "#fff8e1",
                  border: "1px dashed #c8a000",
                  borderRadius: 0.5,
                }}
              >
                <Typography sx={{ fontFamily: "Georgia, serif", fontSize: "9px", color: "#7a5c00", fontStyle: "italic", textAlign: "center" }}>
                  ✦ Showing preview content — live Sundial feed connects at launch ✦
                </Typography>
              </Box>
            )}

            {/* Headline story */}
            {headline && (
              <>
                <HeadlineArticle article={headline} />
                {rest.length > 0 && (
                  <MastheadDivider />
                )}
              </>
            )}

            {/* Rest of articles */}
            {rest.map((article, i) => (
              <SmallArticle
                key={article.id}
                article={article}
                showDivider={i < rest.length - 1}
              />
            ))}
          </>
        )}
      </Box>

      {/* ── Footer ── */}
      <Box
        sx={{
          borderTop: "2px solid #111",
          px: 1.25,
          py: 0.5,
          bgcolor: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Georgia, serif",
            fontSize: "8.5px",
            color: "#ccc",
            fontStyle: "italic",
          }}
        >
          sundial.csun.edu
        </Typography>
        <Typography
          sx={{
            fontFamily: "Georgia, serif",
            fontSize: "8px",
            color: "#cc4444",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Toro Connect
        </Typography>
      </Box>
    </Box>
  );
};

export default SundialNewsWidget;
