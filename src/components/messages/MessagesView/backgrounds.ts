import bg1 from "../backgroundImages/ai-generated-ruled-paper-background-free-photo.jpg";
import bg2 from "../backgroundImages/RYr5wp.png.webp";
import bg3 from "../backgroundImages/Messenger-Sky-Chat-Theme-Hero.png.webp";
import bg4 from "../backgroundImages/Messenger-Valentines-Day-Chat-Theme-Hero.png.webp";
import bg5 from "../backgroundImages/7e7349a10a37cf62330cd9c4dd356b27.jpg";
import bg6 from "../backgroundImages/7351b72a516a99f1d024bcd113cb1b1b.jpg";
import bg7 from "../backgroundImages/8ff1e61516ecd920472d5f746aea62f1.jpg";

export const BACKGROUNDS = [
  { id: 1, label: "Background 1", src: (bg1 as any).src ?? (bg1 as any) },
  { id: 2, label: "Background 2", src: (bg2 as any).src ?? (bg2 as any) },
  { id: 3, label: "Background 3", src: (bg3 as any).src ?? (bg3 as any) },
  { id: 4, label: "Background 4", src: (bg4 as any).src ?? (bg4 as any) },
  { id: 5, label: "Background 5", src: (bg5 as any).src ?? (bg5 as any) },
  { id: 6, label: "Background 6", src: (bg6 as any).src ?? (bg6 as any) },
  { id: 7, label: "Background 7", src: (bg7 as any).src ?? (bg7 as any) },
] as const;

export function hexToHue(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 260;
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const c = max - min;
  if (c === 0) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / c) % 6;
  else if (max === g) h = (b - r) / c + 2;
  else h = (r - g) / c + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

export type AnimatedBg =
  | { type: "grainient"; color1: string; color2: string; color3: string }
  | { type: "gridscan" }
  | { type: "lightning"; color: string }
  | { type: "particles"; colors: string[] }
  | null;
