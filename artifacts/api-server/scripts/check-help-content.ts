import { DEFAULT_HELP_ARTICLES } from "../src/lib/defaultHelpArticles.ts";

const RETIRED_SMS_PATHS = [
  {
    pattern: /\bPlatform Add-ons\s*→\s*SMS Alerts(?:\s*→\s*Config)?\b/i,
  },
  {
    pattern: /\bStandard Alerts section\b/i,
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

const failures = DEFAULT_HELP_ARTICLES.flatMap((article) => {
  const content = normaliseContent(article.content);
  return RETIRED_SMS_PATHS.flatMap(({ pattern }) => {
    const match = content.match(pattern);
    return match
      ? [{ articleTitle: article.title, offendingPhrase: match[0] }]
      : [];
  });
});

if (failures.length > 0) {
  console.error("Retired SMS settings paths found in default help content:");
  for (const { articleTitle, offendingPhrase } of failures) {
    console.error(`- ${articleTitle}: "${offendingPhrase}"`);
  }
  process.exit(1);
}

console.log(
  `Help content guard passed: checked ${DEFAULT_HELP_ARTICLES.length} default articles; no retired SMS settings paths found.`,
);