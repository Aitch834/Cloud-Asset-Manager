const QUALITY_GRADE_OPTIONS = [
  { value: "milling", label: "Milling Wheat", group: "Wheat" },
  { value: "bread_wheat", label: "Bread Wheat", group: "Wheat" },
  { value: "feed_wheat", label: "Feed Wheat", group: "Wheat" },
  { value: "malting", label: "Malting Barley", group: "Barley" },
  { value: "feed_barley", label: "Feed Barley", group: "Barley" },
  { value: "milling_oil", label: "Milling Oil (OSR)", group: "Oilseed" },
  { value: "feed", label: "Feed", group: "Other" },
  { value: "premium", label: "Premium Grade", group: "Other" },
  { value: "standard", label: "Standard Grade", group: "Other" },
  { value: "rejected", label: "Rejected", group: "Other" },
  { value: "pending", label: "Pending Assessment", group: "Other" }
];
const LABEL_MAP = Object.fromEntries(
  QUALITY_GRADE_OPTIONS.map((g) => [g.value, g.label])
);
function gradeLabel(code) {
  if (!code) return "—";
  return LABEL_MAP[code] ?? code;
}
const GRADE_COLORS = {
  milling: { bg: "#dcfce7", color: "#166534" },
  bread_wheat: { bg: "#dcfce7", color: "#166534" },
  malting: { bg: "#dbeafe", color: "#1d4ed8" },
  premium: { bg: "#dcfce7", color: "#166534" },
  standard: { bg: "#dbeafe", color: "#1d4ed8" },
  feed_wheat: { bg: "#fef3c7", color: "#92400e" },
  feed_barley: { bg: "#fef3c7", color: "#92400e" },
  feed: { bg: "#fef3c7", color: "#92400e" },
  milling_oil: { bg: "#fdf4ff", color: "#7e22ce" },
  rejected: { bg: "#fee2e2", color: "#991b1b" },
  pending: { bg: "#f3f4f6", color: "#6b7280" }
};
const DEFAULT_COLOR = { bg: "#f3f4f6", color: "#6b7280" };
function gradeColors(code) {
  if (!code) return DEFAULT_COLOR;
  return GRADE_COLORS[code] ?? DEFAULT_COLOR;
}
export {
  QUALITY_GRADE_OPTIONS as Q,
  gradeColors as a,
  gradeLabel as g
};
