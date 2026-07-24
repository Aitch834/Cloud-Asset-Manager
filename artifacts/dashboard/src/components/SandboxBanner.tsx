import { useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { useSandboxInfo } from "@/hooks/use-sandbox-info";
import { useGetMyTenants } from "@workspace/api-client-react/src/generated/api";
import { useToast } from "@/hooks/use-toast";

export function SandboxBanner() {
  const [, setLocation] = useLocation();
  const { tenantSlug, setTenantSlug, setFarmId } = useAppStore();
  const { data: sandboxInfo } = useSandboxInfo();
  const { data: tenantsData } = useGetMyTenants();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const isSandbox = sandboxInfo?.isSandbox ?? false;

  const currentTenant = tenantsData?.tenants?.find(
    (t: any) => t.tenantSlug === tenantSlug,
  );
  const isSuperAdmin = currentTenant?.isSuperAdmin ?? false;

  const { mutate: resetSandbox, isPending: isResetting } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tenants/current/sandbox/reset", {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Reset failed");
      }
      return res.json() as Promise<{ deleted: number; tablesCleared: number; farmCount: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast({
        title: "Sandbox reset",
        description: `Cleared ${data.deleted} record(s) across ${data.farmCount} farm(s). Your farm structure is intact.`,
      });
      setShowResetDialog(false);
    },
    onError: (err: Error) => {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
      setShowResetDialog(false);
    },
  });

  const handleReturnToLive = () => {
    const liveSlug = sandboxInfo?.liveTenant?.slug;
    if (liveSlug) {
      setTenantSlug(liveSlug);
    } else {
      setFarmId(null);
      localStorage.removeItem("farmtrac_tenantSlug");
    }
    setLocation("/select-context");
  };

  if (!isSandbox) return null;

  return (
    <>
      <div className="bg-amber-400 text-amber-950 px-4 py-2.5 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2.5 min-w-0">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold tracking-wide uppercase">
            Sandbox — Test Environment
          </span>
          <span className="hidden sm:inline text-sm font-normal opacity-80">
            &bull; Data entered here will not affect your live account and no
            real-world integrations will fire.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSuperAdmin && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-3 text-amber-950 hover:bg-amber-500 hover:text-amber-950 text-xs font-medium"
              onClick={() => setShowResetDialog(true)}
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              )}
              Reset Sandbox
            </Button>
          )}

          <Button
            size="sm"
            className="h-7 px-3 bg-amber-950 hover:bg-amber-900 text-amber-50 text-xs font-medium"
            onClick={handleReturnToLive}
          >
            Return to Live Dashboard
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset sandbox data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all records entered in this sandbox
              (sprays, livestock movements, compliance logs, etc.). Your farm
              structure, settings, and credentials will be preserved. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetSandbox()}
              disabled={isResetting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isResetting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, reset sandbox
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
