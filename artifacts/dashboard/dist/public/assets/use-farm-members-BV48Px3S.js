import { m as useQuery } from "./index-BciYlE5o.js";
function memberFullName(m) {
  return `${m.firstName} ${m.lastName}`.trim();
}
function useFarmMembers(farmId) {
  return useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()),
    enabled: !!farmId
  });
}
export {
  memberFullName as m,
  useFarmMembers as u
};
