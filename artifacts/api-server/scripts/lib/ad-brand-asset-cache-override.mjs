export const BLOCKED_CACHE_OVERRIDE_MESSAGE =
  "Cache override endpoint is blocked (NODE_ENV=production?) — cannot run integration checks";

export async function overrideAdBrandAssetCache(call, logoUri, qrUri) {
  const response = await call(
    "PUT",
    "/admin/ad-brand-assets/cache",
    { logoUri, qrUri },
  );

  if (response.status === 404) {
    throw new Error(BLOCKED_CACHE_OVERRIDE_MESSAGE);
  }
  if (response.status !== 200 || !response.json?.overridden) {
    throw new Error(
      `Cache override failed: ${response.status} ${JSON.stringify(response.json)}`,
    );
  }
}