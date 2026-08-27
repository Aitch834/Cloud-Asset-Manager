import { m as useQuery } from "./index-B79fdy4q.js";
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
export {
  useRawFarmName as a,
  useFarmName as u
};
