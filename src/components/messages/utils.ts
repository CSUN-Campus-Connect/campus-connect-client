import type { Attachment, ID, Message } from "@/types/messages";

export const scrollBarSx = {
  "&::-webkit-scrollbar": { width: 10, height: 10 },
  "&::-webkit-scrollbar-track": { bgcolor: "rgba(0,0,0,0.05)", borderRadius: 8 },
  "&::-webkit-scrollbar-thumb": {
    bgcolor: "rgba(0,0,0,0.25)",
    borderRadius: 8,
    "&:hover": { bgcolor: "rgba(0,0,0,0.35)" },
  },
} as const;

export const panelScrollSx = {
  overflowY: "auto",
  overflowX: "hidden",
  minHeight: 0,
  overscrollBehavior: "contain",
  ...scrollBarSx,
} as const;

export type DraftState = { text: string; files: File[]; gifs: Attachment[] };

export function emptyDraft(): DraftState {
  return { text: "", files: [], gifs: [] };
}

export function formatAgo(nowMs: number, createdAt: number): string {
  const diff = nowMs - createdAt;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function activityText(nowMs: number, lastActiveAt: number): string {
  const diffM = Math.floor((nowMs - lastActiveAt) / 60000);
  if (diffM <= 2) return "Active now";
  if (diffM < 60) return `Active ${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `Active ${diffH}h ago`;
  return `Active ${Math.floor(diffH / 24)}d ago`;
}

export function getLastMessage(all: Message[], threadId: ID): Message | null {
  const ms = all.filter((m) => m.threadId === threadId);
  if (!ms.length) return null;
  return ms.sort((a, b) => b.createdAt - a.createdAt)[0];
}

export function isThreadUnread(all: Message[], threadId: ID, meId: ID): boolean {
  const last = getLastMessage(all, threadId);
  if (!last || last.fromUserId === meId) return false;
  return !new Set(last.seenByUserIds ?? []).has(meId);
}

const RAW_GIF_LIST: { url: string; title: string }[] = [
  { url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif", title: "wow" },
  { url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "lets go" },
  { url: "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif", title: "nice" },
  { url: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif", title: "typing" },
  { url: "https://media.giphy.com/media/xT0GqFhyNd0Wmfo6sM/giphy.gif", title: "omg" },
  { url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif", title: "party" },
  { url: "https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif", title: "hype" },
  { url: "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif", title: "yay" },
  { url: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif", title: "nope" },
  { url: "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif", title: "facepalm" },
  { url: "https://media.giphy.com/media/3o6ZsWwQGQWbFhJ6xO/giphy.gif", title: "fire" },
  { url: "https://media.giphy.com/media/l0HlMG1EX2H38cZeE/giphy.gif", title: "shocked" },

  { url: "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif", title: "clapping" },
  { url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", title: "mind blown" },
  { url: "https://media.giphy.com/media/3orieUe6ejxSFxYCXe/giphy.gif", title: "thinking" },
  { url: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif", title: "laughing" },
  { url: "https://media.giphy.com/media/l3vR85PnGsBwu1PFK/giphy.gif", title: "crying" },
  { url: "https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif", title: "confused" },
  { url: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif", title: "excited" },
  { url: "https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif", title: "happy dance" },
  { url: "https://media.giphy.com/media/3o7TKsQ8UQxZq0kF0s/giphy.gif", title: "deal with it" },
  { url: "https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif", title: "thumbs up" },

  { url: "https://media.giphy.com/media/3og0IPxMM0erATueVW/giphy.gif", title: "thumbs down" },
  { url: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif", title: "sleepy" },
  { url: "https://media.giphy.com/media/l0MYu38R0PPhIXe36/giphy.gif", title: "awkward" },
  { url: "https://media.giphy.com/media/3orieWABCODOOw4x7G/giphy.gif", title: "applause" },
  { url: "https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif", title: "suspicious" },
  { url: "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif", title: "slow clap" },
  { url: "https://media.giphy.com/media/3o7TKVSE5isogWqnwk/giphy.gif", title: "cheers" },
  { url: "https://media.giphy.com/media/xT5LMGIKgT6U6M3p2g/giphy.gif", title: "celebration" },
  { url: "https://media.giphy.com/media/l0MYu5M1H2bF2hJ2w/giphy.gif", title: "bruh" },
  { url: "https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif", title: "yikes" },

  { url: "https://media.giphy.com/media/l0MYL2SNbbztrug1y/giphy.gif", title: "angry" },
  { url: "https://media.giphy.com/media/3orieR8m9r1CwC0vUA/giphy.gif", title: "evil laugh" },
  { url: "https://media.giphy.com/media/3o6Zt7hRj9KjC3h8iY/giphy.gif", title: "shrug" },
  { url: "https://media.giphy.com/media/xT9IgIc0lryrxvqVGM/giphy.gif", title: "blushing" },
  { url: "https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif", title: "side eye" },
  { url: "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif", title: "cool" },
  { url: "https://media.giphy.com/media/xT5LMQ8rHYTDGFG07e/giphy.gif", title: "sweating" },
  { url: "https://media.giphy.com/media/3orieZDAp40AhhOOsg/giphy.gif", title: "panic" },
  { url: "https://media.giphy.com/media/l0MYu5M1H2bF2hJ2w/giphy.gif", title: "cringe" },
  { url: "https://media.giphy.com/media/3o7TKMfn35NL1ll44U/giphy.gif", title: "victory" },

  { url: "https://media.giphy.com/media/l3vR85PnGsBwu1PFK/giphy.gif", title: "sad" },
  { url: "https://media.giphy.com/media/3orieQ3nLzIdR7bGxO/giphy.gif", title: "confetti" },
  { url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif", title: "thinking hard" },
  { url: "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif", title: "not bad" },
  { url: "https://media.giphy.com/media/xUPGcEliCc5bET0E3m/giphy.gif", title: "good job" },
  { url: "https://media.giphy.com/media/3o7TKL0H7a0F8sT5Di/giphy.gif", title: "mic drop" },
  { url: "https://media.giphy.com/media/xT0BKH2iV3N1y5n3nG/giphy.gif", title: "nervous" },
  { url: "https://media.giphy.com/media/3orieYvhT5EVfSFyBa/giphy.gif", title: "oops" },
  { url: "https://media.giphy.com/media/l0MYF0mZlM9IY0wOk/giphy.gif", title: "what" },
  { url: "https://media.giphy.com/media/xUPGctGk7U2z8y9S6Y/giphy.gif", title: "legend" },
];

export const GIF_LIST: { url: string; title: string }[] = (() => {
  const seen = new Set<string>();
  const out: { url: string; title: string }[] = [];
  for (const g of RAW_GIF_LIST) {
    if (!g?.url || seen.has(g.url)) continue;
    seen.add(g.url);
    out.push(g);
  }
  return out;
})();
