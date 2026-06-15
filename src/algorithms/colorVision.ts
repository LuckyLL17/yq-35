function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getGridSize(level: number, diffMultiplier: number): { size: number; diff: number } {
  if (level <= 2) return { size: 2, diff: Math.max(1, Math.round(15 * diffMultiplier)) };
  if (level <= 4) return { size: 3, diff: Math.max(1, Math.round(12 * diffMultiplier)) };
  if (level <= 6) return { size: 3, diff: Math.max(1, Math.round(10 * diffMultiplier)) };
  if (level <= 9) return { size: 4, diff: Math.max(1, Math.round(8 * diffMultiplier)) };
  if (level <= 12) return { size: 4, diff: Math.max(1, Math.round(6 * diffMultiplier)) };
  if (level <= 16) return { size: 5, diff: Math.max(1, Math.round(5 * diffMultiplier)) };
  if (level <= 20) return { size: 5, diff: Math.max(1, Math.round(4 * diffMultiplier)) };
  return { size: 6, diff: Math.max(1, Math.round(3 * diffMultiplier)) };
}

function adjustColorComponent(c: number, diff: number): number {
  return Math.max(0, Math.min(255, c + (Math.random() > 0.5 ? diff : -diff)));
}

function parseRgbString(rgbStr: string): [number, number, number] | null {
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return null;
  return [parseInt(match[0], 10), parseInt(match[1], 10), parseInt(match[2], 10)];
}

export { hslToRgb, getGridSize, adjustColorComponent, parseRgbString };
