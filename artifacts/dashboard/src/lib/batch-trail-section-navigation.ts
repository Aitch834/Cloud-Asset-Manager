export const TRAIL_SECTION_IDS = [
  "bt-pressing",
  "bt-so2",
  "bt-phta",
  "bt-fermentation",
  "bt-cellar",
  "bt-so2tests",
  "bt-bottling",
  "bt-barrel",
] as const;

export type TrailSectionId = (typeof TRAIL_SECTION_IDS)[number];

export const TRAIL_STICKY_NAV_CLASSNAME =
  "sticky top-0 z-20 -mx-6 flex gap-1.5 overflow-x-auto border-y bg-background/95 px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/90 scrollbar-thin";

export function scrollToTrailSection(
  sectionId: string,
  contentBody: HTMLElement,
  scrollContainer: HTMLElement,
  behavior: "instant" | "smooth",
  topInset = 0,
): boolean {
  const target = contentBody.querySelector<HTMLElement>(`#${sectionId}`);
  if (!target) return false;

  const offset = target.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top - topInset - 8;
  scrollContainer.scrollBy({ top: offset, behavior });
  return true;
}

export function restoreStoredTrailSection(
  sectionKey: string,
  contentBody: HTMLElement,
  scrollContainer: HTMLElement,
  topInset = 0,
): TrailSectionId | null {
  let savedId: string | null = null;
  try {
    savedId = localStorage.getItem(sectionKey);
  } catch {
    return null;
  }

  if (!savedId) return null;
  if (!TRAIL_SECTION_IDS.includes(savedId as TrailSectionId)) {
    try { localStorage.removeItem(sectionKey); } catch { /* unavailable */ }
    return null;
  }
  if (!contentBody.querySelector<HTMLElement>(`#${savedId}`)) {
    try { localStorage.removeItem(sectionKey); } catch { /* unavailable */ }
    return null;
  }

  scrollToTrailSection(savedId, contentBody, scrollContainer, "instant", topInset);
  return savedId as TrailSectionId;
}