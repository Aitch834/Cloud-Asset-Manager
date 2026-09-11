#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const AD_FILES = [
  "../public/ads/ad-viticulture-portrait.html",
  "../public/ads/ad-viticulture-halfpage.html",
];

const RESOURCE_ATTRIBUTES = {
  audio: ["src"],
  img: ["src", "srcset"],
  script: ["src"],
  source: ["src", "srcset"],
  video: ["src", "poster"],
};

function attributesFrom(tagSource) {
  const attributes = new Map();
  const attributePattern =
    /(?:^|\s)([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of tagSource.matchAll(attributePattern)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attributes;
}

function isEmbeddedResource(value) {
  const resource = value.trim();
  return resource === "" || resource.startsWith("#") || /^data:/i.test(resource);
}

function srcsetResources(value) {
  const resources = [];
  let position = 0;

  while (position < value.length) {
    while (/[\s,]/.test(value[position] ?? "")) position += 1;
    if (position >= value.length) break;

    const start = position;
    if (value.slice(position, position + 5).toLowerCase() === "data:") {
      const payloadStart = value.indexOf(",", position);
      position = payloadStart === -1 ? value.length : payloadStart + 1;
    }
    while (position < value.length && !/[\s,]/.test(value[position])) position += 1;
    resources.push(value.slice(start, position));

    while (position < value.length && value[position] !== ",") position += 1;
  }

  return resources;
}

export function findNetworkResources(html) {
  const violations = [];
  const tagPattern = /<\s*([a-z][\w:-]*)\b([^>]*)>/gi;

  for (const match of html.matchAll(tagPattern)) {
    const tag = match[1].toLowerCase();
    const attributes = attributesFrom(match[2]);

    for (const attribute of RESOURCE_ATTRIBUTES[tag] ?? []) {
      if (!attributes.has(attribute)) continue;
      const values =
        attribute === "srcset"
          ? srcsetResources(attributes.get(attribute))
          : [attributes.get(attribute)];

      for (const value of values) {
        if (!isEmbeddedResource(value)) {
          violations.push({ kind: `${tag}[${attribute}]`, value });
        }
      }
    }

    if (tag === "link") {
      const rel = (attributes.get("rel") ?? "").toLowerCase().split(/\s+/);
      const as = (attributes.get("as") ?? "").toLowerCase();
      const loadsResource =
        rel.includes("stylesheet") ||
        rel.includes("modulepreload") ||
        ((rel.includes("preload") || rel.includes("prefetch")) &&
          ["audio", "font", "image", "script", "style", "video"].includes(as));
      const href = attributes.get("href");

      if (loadsResource && href !== undefined && !isEmbeddedResource(href)) {
        violations.push({ kind: "link[href]", value: href });
      }
    }
  }

  const cssResourcePattern = /(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)|@import\s+(?:"([^"]*)"|'([^']*)'|url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)))/gi;
  for (const match of html.matchAll(cssResourcePattern)) {
    const value = match.slice(1).find((candidate) => candidate !== undefined);
    if (value !== undefined && !isEmbeddedResource(value)) {
      violations.push({ kind: match[0].trimStart().startsWith("@") ? "@import" : "url()", value });
    }
  }

  return violations;
}

export function checkPrintAds() {
  const failures = [];

  for (const relativePath of AD_FILES) {
    const fileUrl = new URL(relativePath, import.meta.url);
    const violations = findNetworkResources(readFileSync(fileUrl, "utf8"));
    failures.push(
      ...violations.map((violation) => ({
        file: fileURLToPath(fileUrl),
        ...violation,
      })),
    );
  }

  if (failures.length > 0) {
    console.error("Print-ad offline asset guard failed. Embed each resource as a data: URL:");
    for (const failure of failures) {
      console.error(`  ${failure.file}: ${failure.kind} loads ${JSON.stringify(failure.value)}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Print-ad offline asset guard passed (${AD_FILES.length} handoff files checked).`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkPrintAds();
}