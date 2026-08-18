/**
 * Lightweight pub/sub for WineGB submission state invalidation.
 * vine-phenology.tsx emits after a successful PUT to /winegb-submissions/:key
 * so the home screen can re-fetch pending-survey counts without waiting for a
 * pull-to-refresh or navigation focus cycle.
 */
type Listener = () => void;
const listeners = new Set<Listener>();

export const winegbSubmissionEvents = {
  /** Notify all subscribers that submission state may have changed. */
  emit(): void {
    listeners.forEach(fn => fn());
  },
  /** Subscribe to submission-change events. Returns an unsubscribe function. */
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
