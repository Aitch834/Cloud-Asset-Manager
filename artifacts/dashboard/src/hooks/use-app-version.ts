import { useQuery } from "@tanstack/react-query";
import { APP_VERSION_FULL as FALLBACK } from "@/version";

export function useAppVersion(): string {
  const { data } = useQuery<{ version: string; build: string; full: string }>({
    queryKey: ["app-version"],
    queryFn: () => fetch("/api/version").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return data?.full ?? FALLBACK;
}
