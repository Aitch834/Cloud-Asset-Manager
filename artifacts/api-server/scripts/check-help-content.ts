import { readFileSync } from "node:fs";

import {
  CONTENT,
  DEFAULT_HELP_ARTICLES,
  LEGACY_HELP_NAVIGATION_UPDATES,
  TITLES,
  isKnownSeededHelpArticle,
} from "../src/lib/defaultHelpArticles.ts";

const RETIRED_SMS_PATHS = [
  {
    pattern: /\bPlatform Add-ons\s*→\s*SMS Alerts(?:\s*→\s*Config)?\b/i,
  },
  {
    pattern: /\bStandard Alerts section\b/i,
  },
] as const;

const RETIRED_NAVIGATION_PATHS = [
  {
    pattern: /\bWeather Records\s*→\s*(?:Device Register|Readings)\b/i,
  },
  {
    pattern:
      /\bLivestock\s*&\s*Feed Management\s*→\s*(?:Movements|Medicines)\b/i,
  },
  {
    pattern:
      /\bIntegrations\s*&\s*API\s*→\s*(?:Data API|Report Builder)\b/i,
  },
] as const;

function normaliseContent(content: string): string {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:rarr|#x2192|#8594);/gi, "→")
    .replace(/&(?:gt|#x3e|#62);/gi, "→")
    .replace(/(?:->|=>|›|»)/g, "→")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normaliseHeading(text: string): string {
  return normaliseContent(text)
    .normalize("NFKC")
    .replace(/[“”"]/g, "")
    .replace(/[‘’']/g, "")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function headingCorrespondsToTitle(heading: string, title: string): boolean {
  return normaliseHeading(heading) === normaliseHeading(title);
}

function extractFirstH2(content: string): string | null {
  const match = content.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  return match?.[1] ? normaliseContent(match[1]) : null;
}

const failures: string[] = [];
const fallbackSource = readFileSync(
  new URL("../src/routes/farms.ts", import.meta.url),
  "utf8",
);

if (TITLES.length !== CONTENT.length) {
  failures.push(
    `TITLES and CONTENT length mismatch: ${TITLES.length} titles, ${CONTENT.length} content entries`,
  );
}

for (const [index, article] of DEFAULT_HELP_ARTICLES.entries()) {
  const content = article.content.trim();
  if (!article.excerpt.trim() || !content) {
    failures.push(
      `Article ${index + 1} "${article.title}" has empty excerpt or content`,
    );
    continue;
  }

  if (
    content.includes("This article is being prepared.") ||
    content.startsWith(`Help article: ${article.title}`)
  ) {
    failures.push(
      `Article ${index + 1} "${article.title}" contains placeholder content`,
    );
  }

  const heading = extractFirstH2(content);
  if (!heading) {
    failures.push(`Article ${index + 1} "${article.title}" has no <h2> heading`);
  } else if (!headingCorrespondsToTitle(heading, article.title)) {
    failures.push(
      `Article ${index + 1} "${article.title}" has <h2> "${heading}"`,
    );
  }

  const normalisedText = normaliseContent(content);
  for (const { pattern } of RETIRED_SMS_PATHS) {
    const match = normalisedText.match(pattern);
    if (match) {
      failures.push(
        `Article ${index + 1} "${article.title}" contains retired SMS settings path "${match[0]}"`,
      );
    }
  }

  for (const { pattern } of RETIRED_NAVIGATION_PATHS) {
    const match = normalisedText.match(pattern);
    if (match) {
      failures.push(
        `Article ${index + 1} "${article.title}" contains retired navigation path "${match[0]}"`,
      );
    }
  }
}

const normalisedFallbackSource = normaliseContent(fallbackSource);
for (const { pattern } of RETIRED_NAVIGATION_PATHS) {
  const match = normalisedFallbackSource.match(pattern);
  if (match) {
    failures.push(
      `Help endpoint fallback contains retired navigation path "${match[0]}"`,
    );
  }
}

const updatedArticleTitles = new Set(
  LEGACY_HELP_NAVIGATION_UPDATES.map(({ title }) => title),
);
for (const title of updatedArticleTitles) {
  const article = DEFAULT_HELP_ARTICLES.find((candidate) => candidate.title === title);
  const updates = LEGACY_HELP_NAVIGATION_UPDATES.filter(
    (update) => update.title === title,
  );
  if (!article) {
    failures.push(`Legacy navigation update references missing article "${title}"`);
    continue;
  }

  let legacyContent = article.content;
  for (const update of updates) {
    if (!legacyContent.includes(update.newText)) {
      failures.push(
        `Legacy navigation update for "${title}" does not match the current default article`,
      );
      continue;
    }
    legacyContent = legacyContent.replace(update.newText, update.oldText);
  }
  const legacyArticle = {
    ...article,
    content: legacyContent,
  };
  if (!isKnownSeededHelpArticle(legacyArticle, article)) {
    failures.push(
      `Previously seeded article "${title}" is not eligible for a safe default refresh`,
    );
  }

  const customisedArticle = {
    ...legacyArticle,
    content: `${legacyArticle.content}\n<p>Administrator note</p>`,
  };
  if (isKnownSeededHelpArticle(customisedArticle, article)) {
    failures.push(
      `Customized legacy article "${title}" would be overwritten by the default refresh`,
    );
  }
}

if (failures.length > 0) {
  console.error("Help content integrity check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Help content integrity check passed: checked ${DEFAULT_HELP_ARTICLES.length} default articles.`,
);