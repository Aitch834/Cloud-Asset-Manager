/**
 * Resolve a value against a stable version token.
 *
 * If the underlying data changes while resolveValue is in flight, retry with
 * the new version rather than publishing an inconsistent snapshot to a shared
 * cache. A later write remains safe because the next cache lookup will see its
 * new version before using the cached value.
 */
export async function resolveStableVersionedValue<T>(
  initialVersion: string,
  resolveValue: () => Promise<T>,
  readVersion: () => Promise<string>,
): Promise<{ value: T; version: string }> {
  let version = initialVersion;
  for (;;) {
    const value = await resolveValue();
    const versionAfterResolve = await readVersion();
    if (versionAfterResolve === version) {
      return { value, version };
    }
    version = versionAfterResolve;
  }
}