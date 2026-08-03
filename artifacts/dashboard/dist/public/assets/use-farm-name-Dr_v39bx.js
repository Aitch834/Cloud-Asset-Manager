import { l as useQuery } from "./index-DYkNmH5F.js";
function useFarmsList() {
  return useQuery({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e5
  });
}
function useFarmName(farmId) {
  const { data } = useFarmsList();
  return (Array.isArray(data?.farms) ? data.farms.find((f) => f.id === farmId)?.name : void 0) ?? `Farm ${farmId}`;
}
export {
  useFarmName as u
};
