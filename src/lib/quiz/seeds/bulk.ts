import type { MetricSeed } from "../types";

const rows: Array<{
  id: string;
  name: string;
  factor: number;
  exp: string;
}> = [
  { id: "si-quetta", name: "SI prefix quetta (Q)", factor: 1e30, exp: "10³⁰" },
  { id: "si-ronna", name: "SI prefix ronna (R)", factor: 1e27, exp: "10²⁷" },
  { id: "si-yotta", name: "SI prefix yotta (Y)", factor: 1e24, exp: "10²⁴" },
  { id: "si-zetta", name: "SI prefix zetta (Z)", factor: 1e21, exp: "10²¹" },
  { id: "si-exa", name: "SI prefix exa (E)", factor: 1e18, exp: "10¹⁸" },
  { id: "si-peta", name: "SI prefix peta (P)", factor: 1e15, exp: "10¹⁵" },
  { id: "si-tera", name: "SI prefix tera (T)", factor: 1e12, exp: "10¹²" },
  { id: "si-giga", name: "SI prefix giga (G)", factor: 1e9, exp: "10⁹" },
  { id: "si-mega", name: "SI prefix mega (M)", factor: 1e6, exp: "10⁶" },
  { id: "si-kilo", name: "SI prefix kilo (k)", factor: 1e3, exp: "10³" },
  { id: "si-hecto", name: "SI prefix hecto (h)", factor: 1e2, exp: "10²" },
  { id: "si-deca", name: "SI prefix deca (da)", factor: 1e1, exp: "10¹" },
  { id: "si-deci", name: "SI prefix deci (d)", factor: 1e-1, exp: "10⁻¹" },
  { id: "si-centi", name: "SI prefix centi (c)", factor: 1e-2, exp: "10⁻²" },
  { id: "si-milli", name: "SI prefix milli (m)", factor: 1e-3, exp: "10⁻³" },
  { id: "si-micro", name: "SI prefix micro (μ)", factor: 1e-6, exp: "10⁻⁶" },
  { id: "si-nano", name: "SI prefix nano (n)", factor: 1e-9, exp: "10⁻⁹" },
  { id: "si-pico", name: "SI prefix pico (p)", factor: 1e-12, exp: "10⁻¹²" },
  { id: "si-femto", name: "SI prefix femto (f)", factor: 1e-15, exp: "10⁻¹⁵" },
  { id: "si-atto", name: "SI prefix atto (a)", factor: 1e-18, exp: "10⁻¹⁸" },
  { id: "si-zepto", name: "SI prefix zepto (z)", factor: 1e-21, exp: "10⁻²¹" },
  { id: "si-yocto", name: "SI prefix yocto (y)", factor: 1e-24, exp: "10⁻²⁴" },
  { id: "si-ronto", name: "SI prefix ronto (r)", factor: 1e-27, exp: "10⁻²⁷" },
  { id: "si-quecto", name: "SI prefix quecto (q)", factor: 1e-30, exp: "10⁻³⁰" },
];

export function bulkSiSeeds(): MetricSeed[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: "science",
    low: r.factor * 0.98,
    high: r.factor * 1.02,
    unit: "multiplier",
    context: `Decimal multiple ${r.exp}.`,
    explanation: `The SI system defines ${r.name.split("(")[0].trim()} as ${r.exp}—band shown tiny for quiz mechanics.`,
    spacing: "log",
  }));
}

const binPrefixes: Array<{ id: string; name: string; power: number }> = [
  { id: "bi-kibi", name: "IEC kibi multiplier", power: 10 },
  { id: "bi-mebi", name: "IEC mebi multiplier", power: 20 },
  { id: "bi-gibi", name: "IEC gibi multiplier", power: 30 },
  { id: "bi-tebi", name: "IEC tebi multiplier", power: 40 },
  { id: "bi-pebi", name: "IEC pebi multiplier", power: 50 },
];

export function bulkBinaryPrefixSeeds(): MetricSeed[] {
  return binPrefixes.map((b) => {
    const v = 2 ** b.power;
    return {
      id: b.id,
      name: b.name,
      category: "technology",
      low: v * 0.995,
      high: v * 1.005,
      unit: "bytes ×",
      context: `2^${b.power} bytes.`,
      explanation: "Storage vendors argue with operating systems; humans suffer.",
      spacing: "log",
    } satisfies MetricSeed;
  });
}

const cosmic: MetricSeed[] = [
  {
    id: "cos-universe-age",
    name: "Age of observable universe (Planck-era rounded)",
    category: "science",
    low: 13.6,
    high: 13.9,
    unit: "Gyr",
    context: "Cosmology standard model snapshot.",
    explanation: "~13.8 Gyr is the common popular anchor.",
    spacing: "linear",
  },
  {
    id: "cos-cmb-redshift",
    name: "CMB redshift z (decoupling)",
    category: "science",
    low: 1080,
    high: 1120,
    unit: "z",
    context: "Last scatter surface.",
    explanation: "z ~1100 is textbook.",
    spacing: "linear",
  },
  {
    id: "cos-baryon-fraction",
    name: "Baryon fraction of critical density (rough)",
    category: "science",
    low: 0.04,
    high: 0.065,
    unit: "Ω_b h² vibe",
    context: "Parameterization fights.",
    explanation: "Most energy isn't baryonic; ordinary matter is a minority.",
    spacing: "linear",
  },
  {
    id: "cos-dark-energy-fraction",
    name: "Dark energy density fraction (concordance model, rounded)",
    category: "science",
    low: 0.66,
    high: 0.72,
    unit: "Ω_Λ-ish",
    context: "Accelerating expansion.",
    explanation: "~0.69 is the rounded modern storytelling number.",
    spacing: "linear",
  },
];

const orders: MetricSeed[] = [
  {
    id: "ord-atoms-human",
    name: "Order of atoms in adult human body",
    category: "science",
    low: 6e27,
    high: 7e28,
    unit: "atoms",
    context: "Hydrogen loves you.",
    explanation: "~7×10²⁷ is a famous order-of-magnitude estimate.",
    spacing: "log",
  },
  {
    id: "ord-stars-milky",
    name: "Stars in Milky Way (order)",
    category: "science",
    low: 1e11,
    high: 4e11,
    unit: "stars",
    context: "Survey uncertainties.",
    explanation: "Hundreds of billions is the usual cocktail‑party range.",
    spacing: "log",
  },
  {
    id: "ord-galaxies-visible",
    name: "Galaxies in observable universe (order)",
    category: "science",
    low: 2e11,
    high: 2e12,
    unit: "galaxies",
    context: "JWST revisits.",
    explanation: "Older \"200 billion\" guesses were conservative; still order 10¹¹–10¹².",
    spacing: "log",
  },
  {
    id: "ord-grains-sand-earth",
    name: "Grains of sand on Earth beaches (very rough)",
    category: "earth",
    low: 1e18,
    high: 1e21,
    unit: "grains",
    context: "Fermi problem classic.",
    explanation: "Estimates span orders of magnitude—this captures plausible spitball ranges.",
    spacing: "log",
  },
];

export function bulkSeeds(): MetricSeed[] {
  return [...bulkSiSeeds(), ...bulkBinaryPrefixSeeds(), ...cosmic, ...orders];
}
