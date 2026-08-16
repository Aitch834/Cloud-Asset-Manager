/**
 * Lightweight pub/sub for vineyard compliance count invalidation.
 * History screens emit after any in-table block-link change so the
 * home screen can re-fetch unlinked counts without waiting for a
 * navigation focus event.
 */
type Listener = () => void;
const listeners = new Set<Listener>();

export const vineyardCountEvents = {
  /** Notify all subscribers that unlinked counts may have changed. */
  emit(): void {
    listeners.forEach(fn => fn());
  },
  /** Subscribe to count-change events. Returns an unsubscribe function. */
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
