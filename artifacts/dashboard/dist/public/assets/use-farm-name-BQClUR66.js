import { m as useQuery } from "./index-UT9am3Zj.js";
function useFarmsList() {
  return useQuery({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e5
  });
}
function useRawFarmName(farmId) {
  const { data } = useFarmsList();
  const name = Array.isArray(data?.farms) ? data.farms.find((f) => f.id === farmId)?.name : void 0;
  return typeof name === "string" ? name : void 0;
}
function useFarmName(farmId) {
  return useRawFarmName(farmId) ?? `Farm ${farmId}`;
}
function useFarmReportMeta(farmId) {
  const { data } = useFarmsList();
  const farm = Array.isArray(data?.farms) ? data.farms.find((candidate) => candidate.id === farmId) : void 0;
  const text = (key) => {
    const value = farm?.[key];
    return typeof value === "string" && value.trim() ? value : void 0;
  };
  return {
    farmName: text("name"),
    farmAddress: text("address") ?? ([text("addressLine1"), text("addressLine2"), text("postcode")].filter(Boolean).join(", ") || void 0),
    contactPhone: text("contactPhone"),
    cphNumber: text("cphNumber"),
    sbiNumber: text("sbiNumber")
  };
}
export {
  useRawFarmName as a,
  useFarmName as b,
  useFarmReportMeta as u
};
