import { openai } from "@workspace/integrations-openai-ai-server";

export const PEST_VISION_MODEL = "gpt-4o";

export interface DetectedPest {
  species: string;
  commonName: string;
  count: number;
  confidence: number; // 0–1
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

const SYSTEM_PROMPT = `You are a vineyard pest-monitoring assistant. The image shows a pest trap (sticky card or drowning cup) placed in a UK vineyard to monitor flying insect pressure.

Your task:
1. Identify and count ALL insects visible on the trap.
2. Count SWD males separately: SWD males have a single dark spot on each wing tip.
3. Count SWD females separately: smaller, with cream-coloured thorax stripes but NO wing spots.
4. List any OTHER flying pest species observed (e.g. common fruit flies, fungus gnats, aphids, midges, wasps, thrips, vine weevils, leafrollers, leafhoppers, etc.) with counts and grape-crop risk.
5. Assign an overall pest-pressure rating: none / low / medium / high.

Respond ONLY with valid JSON matching this exact structure — no markdown, no prose:
{
  "swdMaleCount": <integer>,
  "swdFemaleCount": <integer>,
  "otherPests": [
    {
      "species": "<scientific name or best guess>",
      "commonName": "<plain name>",
      "count": <integer>,
      "confidence": <0.0–1.0>,
      "riskToGrapes": "high" | "medium" | "low" | "none"
    }
  ],
  "totalInsectCount": <integer>,
  "pestPressure": "none" | "low" | "medium" | "high",
  "summary": "<1–2 sentence plain-English summary of findings and any recommended action>"
}

If the image is unclear or does not appear to be a pest trap, return all counts as 0, pestPressure as "none", and explain in the summary field.`;

export async function analysePestTrapImage(
  base64Image: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<PestAnalysisResult> {
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const response = await openai.chat.completions.create({
    model: PEST_VISION_MODEL,
    max_tokens: 1024,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          { type: "text", text: "Please analyse this pest trap image and return the JSON result." },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "";
  // Strip any accidental markdown fences
  const jsonText = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let parsed: PestAnalysisResult;
  try {
    parsed = JSON.parse(jsonText) as PestAnalysisResult;
  } catch {
    throw new Error(`AI returned invalid JSON: ${jsonText.slice(0, 300)}`);
  }

  parsed.swdMaleCount = Math.max(0, parsed.swdMaleCount ?? 0);
  parsed.swdFemaleCount = Math.max(0, parsed.swdFemaleCount ?? 0);
  parsed.totalInsectCount = Math.max(0, parsed.totalInsectCount ?? 0);
  parsed.otherPests = Array.isArray(parsed.otherPests) ? parsed.otherPests : [];
  parsed.pestPressure = (["none", "low", "medium", "high"] as const).includes(parsed.pestPressure)
    ? parsed.pestPressure
    : "none";
  parsed.summary = parsed.summary ?? "";

  return parsed;
}
