import type { MetricSeed } from "../types";
import { bulkSeeds } from "./bulk";
import { earthSeeds } from "./earth";
import { economicsSeeds } from "./economics";
import { engineeringSeeds } from "./engineering";
import { financeSeeds } from "./finance";
import { generalSeeds } from "./general";
import { medicineSeeds } from "./medicine";
import { psychologySeeds } from "./psychology";
import { scienceSeeds } from "./science";
import { technologySeeds } from "./technology";

export const ALL_METRIC_SEEDS: MetricSeed[] = [
  ...financeSeeds,
  ...economicsSeeds,
  ...medicineSeeds,
  ...scienceSeeds,
  ...engineeringSeeds,
  ...technologySeeds,
  ...earthSeeds,
  ...psychologySeeds,
  ...generalSeeds,
  ...bulkSeeds(),
];

export const METRIC_COUNT = ALL_METRIC_SEEDS.length;
