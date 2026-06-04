/**
 * Herd type / species normalisation helpers.
 *
 * The herd `type` field stores the species selected at creation, lowercased.
 * Farm-level custom lookup entries (or legacy data) may hold production-type
 * aliases such as "beef" or "dairy". These are NOT species — the biological
 * species in both cases is Cattle. These helpers normalise any stored value to
 * the canonical form for display and downstream logic.
 */

/**
 * Maps any stored herd type string to the canonical lowercase species slug.
 *
 * Examples:
 *   "beef"    → "cattle"
 *   "dairy"   → "cattle"
 *   "suckler" → "cattle"
 *   "cattle"  → "cattle"
 *   "pig"     → "pigs"
 *   "goat"    → "goats"
 *   "sheep"   → "sheep"
 */
export function canonicalHerdSpecies(raw: string): string {
  const t = (raw ?? "").toLowerCase().trim();
  if (
    ["beef", "beef-cattle", "beef cattle", "dairy", "dairy-cattle", "dairy cattle",
     "suckler", "suckling", "suckler cow", "cow", "cows", "bovine"].includes(t) ||
    t.includes("beef") || t.includes("dairy") || t.includes("suckler") || t.includes("bovine")
  ) return "cattle";
  if (t === "pig" || t === "swine") return "pigs";
  if (t === "goat") return "goats";
  if (["lamb", "lambs", "ewe", "ewes", "ram", "rams"].includes(t)) return "sheep";
  if (
    ["chicken", "chickens", "turkey", "turkeys", "broiler", "broilers",
     "layer", "layers", "hen", "hens"].includes(t) || t.includes("poultry")
  ) return "poultry";
  return t;
}

/** Returns the title-case display label for the canonical species ("beef" → "Cattle"). */
export function herdSpeciesDisplayLabel(raw: string): string {
  const s = canonicalHerdSpecies(raw);
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Returns a short production sub-type label when the stored value encodes more
 * than just species, or null when it is already a plain species name.
 *
 * Examples:
 *   "beef"    → "Beef"
 *   "dairy"   → "Dairy"
 *   "suckler" → "Suckler"
 *   "cattle"  → null
 *   "sheep"   → null
 */
export function herdProductionSubtype(raw: string): string | null {
  const t = (raw ?? "").toLowerCase().trim();
  const canonical = canonicalHerdSpecies(t);
  if (t === canonical) return null;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
