import { b as useAppStore, m as useQuery } from "./index-D3ci1CPp.js";
function useLookup(key) {
  const tenantSlug = useAppStore((s) => s.tenantSlug);
  return useQuery({
    queryKey: ["lookup", key, tenantSlug],
    queryFn: async () => {
      const res = await fetch(`/api/lookups/${key}`);
      if (!res.ok) throw new Error("Failed to fetch lookup");
      const data = await res.json();
      return data.items;
    },
    enabled: !!tenantSlug,
    staleTime: 5 * 60 * 1e3
  });
}
function useLookupStrings(key, fallback = []) {
  const { data } = useLookup(key);
  if (!data) return fallback;
  return data.filter((i) => !("isCustom" in i) || i.isCustom !== void 0 ? true : true).map((i) => i.value);
}
export {
  useLookup as a,
  useLookupStrings as u
};
