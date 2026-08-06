import { openai } from "@workspace/integrations-openai-ai-server";

export const PEST_VISION_MODEL = "gpt-4o";

export interface DetectedPest {
  species: string;
  commonName: string;
  count: number;
  confidence: number; // 0-1
  riskToGrapes: "high" | "medium" | "low" | "none";
}

export interface PestAnalysisResult {
  swdMaleCount: number;
  swdFemaleCount: number;
  otherPests: DetectedPest[];
  totalInsectCount: number;
  pestPressure: "none" | "low" | "medium" | "high";
  summary: string;
}

const SYSTEM_PROMPT = [
  "You are a vineyard pest-monitoring assistant. The image is a photo of a sticky trap or drowning trap from a UK vineyard.",
  "Identify and count the insects visible.",
  "Priority species: Drosophila suz