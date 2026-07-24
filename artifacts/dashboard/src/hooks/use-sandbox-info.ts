import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";

interface SandboxInfo {
  isSandbox: boolean;
  sandboxOfTenantId: number | null;
  liveTenant: { id: number; name: string; slug: string } | null;
  sandboxTenant: { id: number; name: string; slug: string } | null;
}

export function useSandboxInfo() {
  const { tenantSlug } = useAppStore();

  return useQuery<SandboxInfo>({
    queryKey: ["sandbox-info", tenantSlug],
    queryFn: () => fetch("/api/tenants/current/sandbox-info").then(r => r.json()),
    enabled: !!tenantSlug,
    staleTime: 30_000,
  });
}
