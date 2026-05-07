export type QuizCategory =
  | "finance"
  | "economics"
  | "medicine"
  | "science"
  | "engineering"
  | "technology"
  | "earth"
  | "psychology"
  | "general";

export type MetricSeed = {
  id: string;
  name: string;
  category: QuizCategory;
  /** Inclusive typical band practitioners anchor on (not a medical recommendation). */
  low: number;
  high: number;
  unit: string;
  context: string;
  explanation: string;
  /** Wider values benefit from log spacing of distractors */
  spacing?: "linear" | "log";
};

export type RangeChoice = {
  label: string;
  min: number;
  max: number;
};

export type QuizQuestion = {
  id: string;
  seedId: string;
  variant: number;
  name: string;
  category: QuizCategory;
  context: string;
  unit: string;
  spacing: "linear" | "log";
  /** Index into choices (after shuffle) that is correct */
  correctIndex: number;
  choices: RangeChoice[];
  explanation: string;
};
