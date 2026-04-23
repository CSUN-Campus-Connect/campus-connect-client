// =============================================================================
// pages/MarketplacePage.tsx
// Buy/sell listings grid. Uses mock data until backend is ready.
// =============================================================================

import type { MarketItem } from "../types/feed.types";

const MOCK_ITEMS: MarketItem[] = [
  { id:"m1", title:"Calculus Textbook 8th Ed.",    price:"$35",    sellerName:"Elijah C.",   condition:"Good",      postedAt:"3h"  },
  { id:"m2", title:"MacBook Pro 2021 M1",           price:"$1,100", sellerName:"Justin A.",   condition:"Excellent", postedAt:"6h"  },
  { id:"m3", title:"Desk Lamp (adjustable)",         price:"$12",    sellerName:"Gisselle B.", condition:"Like New",  postedAt:"1d"  },
  { id:"m4", title:"CSUN Parking Pass (Fall)",      price:"$80",    sellerName:"Vram G.",     condition:"Valid",     postedAt:"2d"  },
  { id:"m5", title:"Psychology Textbook Bundle",    price:"$55",    sellerName:"Sara H.",    condition:"Good",      postedAt:"3d"  },
  { id:"m6", title:"Mini Fridge (Galanz 3.1 cu ft)",price:"$90",    sellerName:"Ivan J.",     condition:"Good",      postedAt:"4d"  },
];

interface MarketplacePageProps {
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
  onNavigate?: (page: string) => void;
}

export function MarketplacePage({ onToast, onNavigate }: MarketplacePageProps) {
  return (
    <div style={{ padding:16, animation:"fadeUp 240ms ease both" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Campus Marketplace</h2>
          <p style={{ fontSize:13, color:"var(--text-muted)", marginTop:4, marginBottom:0 }}>Buy and sell with fellow Matadors</p>
        </div>
        <a
          href="/marketplace"
          style={{ fontSize:12, fontWeight:600, color:"var(--csun-red)", textDecoration:"none", padding:"7px 16px", border:"1px solid var(--csun-red)", borderRadius:99, whiteSpace:"nowrap", transition:"all 150ms" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--csun-red)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--csun-red)"; }}
        >
          Browse Full Marketplace →
        </a>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {MOCK_ITEMS.map((item, i) => (
          <MarketCard key={item.id} item={item} delay={i * 50} onToast={onToast} />
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ marginTop:16, padding:"14px 18px", background:"var(--bg-elevated)", borderRadius:"var(--radius-lg)", border:"1px solid var(--border-subtle)", textAlign:"center" }}>
        <p style={{ fontSize:13, color:"var(--text-muted)", margin:0 }}>
          Want to post an item?{" "}
          <a href="/marketplace" style={{ color:"var(--csun-red)", fontWeight:600, textDecoration:"none" }}>
            Visit the full Marketplace →
          </a>
        </p>
      </div>
    </div>
  );
}

function MarketCard({
  item, delay, onToast,
}: {
  item: MarketItem;
  delay: number;
  onToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View listing: ${item.title}, ${item.price}`}
      onClick={() => onToast(`Opening listing: ${item.title}`, "info")}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToast(`Opening listing: ${item.title}`, "info"); } }}
      style={{
        background:"var(--bg-surface)", border:"1px solid var(--border-subtle)",
        borderRadius:"var(--radius-lg)", overflow:"hidden",
        animation:"fadeUp 240ms ease both", animationDelay:`${delay}ms`,
        cursor:"pointer", transition:"transform 150ms, box-shadow 150ms",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Placeholder image area */}
      <div style={{ height:110, background:"var(--bg-elevated)", display:"flex", alignItems:"center", justifyContent:"center", borderBottom:"1px solid var(--border-subtle)" }}>
        <svg aria-hidden="true" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24" style={{ color:"var(--text-muted)", opacity:.4 }}>
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      </div>
      <div style={{ padding:12 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", marginBottom:3, lineHeight:1.3 }}>{item.title}</div>
        <div style={{ fontSize:16, fontWeight:700, color:"var(--csun-red)", marginBottom:6 }}>{item.price}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:11, color:"var(--text-muted)" }}>{item.condition}</span>
          <span style={{ fontSize:11, color:"var(--text-muted)" }}>{item.postedAt}</span>
        </div>
        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>by {item.sellerName}</div>
      </div>
    </div>
  );
}
