export type VineRegisterFarmMeta = Record<string, unknown> | null | undefined;

export function resolveVineRegisterFsaRef(
  farmMeta: VineRegisterFarmMeta,
  fallbackFsaVineRef = "",
): string {
  return (
    String(farmMeta?.fsaVineRegisterRef ?? "").trim() ||
    fallbackFsaVineRef.trim()
  );
}

export function getVineRegisterMissingHeaderFields(
  farmMeta: VineRegisterFarmMeta,
  fallbackFsaVineRef = "",
): string[] {
  const value = (field: string) => String(farmMeta?.[field] ?? "").trim();
  const fsaVineRegisterRef = resolveVineRegisterFsaRef(
    farmMeta,
    fallbackFsaVineRef,
  );

  return [
    !value("address") ? "Farm Address" : "",
    !fsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !value("fsaWineProductionRef") ? "FSA Wine Production Ref" : "",
    !value("appaRef") ? "APPA Ref" : "",
    !value("winegbMembershipNumber") ? "WineGB Membership No" : "",
  ].filter(Boolean);
}