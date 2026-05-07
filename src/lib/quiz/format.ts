function sciOrPlain(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e15 || (a < 0.0001 && a > 0)) return n.toExponential(1);
  if (a >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (a >= 10_000) return `${Math.round(n).toLocaleString("en-US")}`;
  if (a >= 100) return `${Math.round(n)}`;
  if (a >= 1) return `${Number(n.toFixed(2))}`;
  return `${Number(n.toFixed(4))}`;
}

export function formatEndpoint(n: number, unit: string): string {
  const u = unit.trim();
  const base = `${sciOrPlain(n)}${u && u !== "—" ? ` ${u}` : ""}`;
  return base.trim();
}

export function formatBand(min: number, max: number, unit: string): string {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "—";
  if (Math.abs(min - max) / Math.max(Math.abs(min), Math.abs(max), 1e-9) < 1e-6) {
    return formatEndpoint(min, unit);
  }
  return `${formatEndpoint(min, unit)} – ${formatEndpoint(max, unit)}`;
}
