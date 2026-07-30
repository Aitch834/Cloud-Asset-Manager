function currentCropYear() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth() + 1;
  return month >= 8 ? now.getFullYear() + 1 : now.getFullYear();
}
function cropYearLabel(year) {
  if (year === 0) return "All years";
  return `${year - 1}/${String(year).slice(2)}`;
}
function cropYearStart(year) {
  return new Date(year - 1, 7, 1);
}
function cropYearEnd(year) {
  return new Date(year, 6, 31, 23, 59, 59, 999);
}
function isInCropYear(dateStr, year) {
  if (!dateStr) return false;
  if (year === 0) return true;
  const d = new Date(dateStr);
  return d >= cropYearStart(year) && d <= cropYearEnd(year);
}
function cropYearOptions(count = 7) {
  const current = currentCropYear();
  return Array.from({ length: count }, (_, i) => current - i);
}
export {
  cropYearOptions as a,
  cropYearLabel as b,
  currentCropYear as c,
  isInCropYear as i
};
