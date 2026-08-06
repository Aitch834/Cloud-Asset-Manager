import { openai } from "@workspace/integrations-openai-ai-server";
import { ObjectStorageService } from "./objectStorage";

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
  "You are an expert agricultural entomologist analysing a phot