function canonicalHerdSpecies(raw) {
  const t = (raw ?? "").toLowerCase().trim();
  if ([
    "beef",
    "beef-cattle",
    "beef cattle",
    "dairy",
    "dairy-cattle",
    "dairy cattle",
    "suckler",
    "suckling",
    "suckler cow",
    "cow",
    "cows",
    "bovine"
  ].includes(t) || t.includes("beef") || t.includes("dairy") || t.includes("suckler") || t.includes("bovine")) return "cattle";
  if (t === "pig" || t === "swine") return "pigs";
  if (t === "goat") return "goats";
  if (["lamb", "lambs", "ewe", "ewes", "ram", "rams"].includes(t)) return "sheep";
  if ([
    "chicken",
    "chickens",
    "turkey",
    "turkeys",
    "broiler",
    "broilers",
    "layer",
    "layers",
    "hen",
    "hens"
  ].includes(t) || t.includes("poultry")) return "poultry";
  return t;
}
function herdSpeciesDisplayLabel(raw) {
  const s = canonicalHerdSpecies(raw);
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function herdProductionSubtype(raw, productionType) {
  if (productionType) {
    return productionType.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
  }
  const t = (raw ?? "").toLowerCase().trim();
  const canonical = canonicalHerdSpecies(t);
  if (t === canonical) return null;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
export {
  herdProductionSubtype as a,
  canonicalHerdSpecies as c,
  herdSpeciesDisplayLabel as h
};
