import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiUrl as api } from "@/lib/api";

type FsaField = {
  key: "fsaVineRegisterRef" | "fsaWineProductionRef" | "appaRef" | "winegbMembershipNumber";
  label: string;
  value: unknown;
};

/** Shows the registration references that will be blank in printed reports. */
export function FsaCompletenessBar({ farmId }: { farmId: number }) {
  const { data: farmRecord, isLoading } = useQuery<Record<string, unknown> | null>({
    queryKey: ["farm-meta", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}`), { credentials: "include" });
      if (!r.ok) return null;
      const d = await r.json();
      return (d.record ?? d) as Record<string, unknown>;
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<FsaField | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [savedReferences, setSavedReferences] = useState<Partial<Record<FsaField["key"], string>>>({});

  useEffect(() => {
    setSavedReferences({});
  }, [farmId]);

  const updateRegistration = useMutation({
    mutationFn: async ({ field, value }: { field: FsaField["key"]; value: string }) => {
      const response = await fetch(api(`farms/${farmId}`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value.trim() }),
      });
      if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(message || `Request failed (${response.status})`);
      }
      return response.json() as Promise<{ record?: Record<string, unknown> }>;
    },
    onSuccess: (data, variables) => {
      const record = data.record ?? data;
      queryClient.setQueryData(["farm-meta", farmId], record);
      setSavedReferences(current => ({ ...current, [variables.field]: variables.value.trim() }));
      setEditingField(null);
      setDraftValue("");
      toast({ title: "Registration reference saved" });
      // Farm-scoped writes commit when the response finishes. Keep the returned
      // record visible immediately, then verify it once that transaction has
      // had time to commit instead of letting a too-early refetch restore stale data.
      window.setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["farm-meta", farmId] });
      }, 500);
    },
  });

  if (isLoading) return null;

  const FIELD_TARGET_IDS: Record<string, string> = {
    "FSA Vine Register Ref": "settings-fsa-vine-ref",
    "FSA Wine Production Ref": "settings-fsa-wine-ref",
    "APPA Ref": "settings-appa-ref",
    "WineGB Membership No": "settings-winegb-number",
  };

  const fields: FsaField[] = [
    { key: "fsaVineRegisterRef", label: "FSA Vine Register Ref", value: savedReferences.fsaVineRegisterRef ?? farmRecord?.fsaVineRegisterRef },
    { key: "fsaWineProductionRef", label: "FSA Wine Production Ref", value: savedReferences.fsaWineProductionRef ?? farmRecord?.fsaWineProductionRef },
    { key: "appaRef", label: "APPA Ref", value: savedReferences.appaRef ?? farmRecord?.appaRef },
    { key: "winegbMembershipNumber", label: "WineGB Membership No", value: savedReferences.winegbMembershipNumber ?? farmRecord?.winegbMembershipNumber },
  ];

  const allComplete = fields.every(f => !!f.value && String(f.value).trim() !== "");

  if (allComplete) return null;

  return (
    <>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
        <div className="flex items-start gap-2.5 mb-2.5">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">FSA / APPA / WineGB registration incomplete</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Missing references will appear blank in printed reports. Add them in{" "}
              <button
                type="button"
                className="underline underline-offset-2 hover:text-amber-900 font-medium"
                onClick={() => {
                  navigate("/settings/farm");
                  const firstMissingTargetId = fields
                    .filter(f => !f.value || String(f.value).trim() === "")
                    .map(f => FIELD_TARGET_IDS[f.label])
                    .find(Boolean);
                  setTimeout(() => {
                    document.getElementById(firstMissingTargetId ?? "settings-appa-ref")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 400);
                }}
              >
                Farm Settings → Viticulture Registrations
              </button>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {fields.map(f => {
            const filled = !!f.value && String(f.value).trim() !== "";
            return (
              <button
                key={f.label}
                type="button"
                className={
                  filled
                    ? "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800 cursor-default"
                    : "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                }
                onClick={() => {
                  if (!filled) {
                    updateRegistration.reset();
                    setEditingField(f);
                    setDraftValue("");
                  }
                }}
                disabled={filled}
              >
                {filled
                  ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" />
                  : <XCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                }
                {f.label}
                {!filled && <span className="text-amber-500 ml-0.5">→</span>}
              </button>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!editingField}
        onOpenChange={(open) => {
          if (!open && !updateRegistration.isPending) {
            setEditingField(null);
            setDraftValue("");
            updateRegistration.reset();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add {editingField?.label}</DialogTitle>
            <DialogDescription>
              Add this registration reference without leaving your current viticulture page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="registration-reference">{editingField?.label}</Label>
            <Input
              id="registration-reference"
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              placeholder={`Enter ${editingField?.label.toLowerCase()}`}
              autoFocus
              disabled={updateRegistration.isPending}
              onKeyDown={(event) => {
                if (event.key === "Enter" && draftValue.trim()) {
                  event.preventDefault();
                  if (editingField) updateRegistration.mutate({ field: editingField.key, value: draftValue });
                }
              }}
            />
          </div>
          <DialogMutationError mutation={updateRegistration} message="Failed to save — your reference is still here." />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingField(null);
                setDraftValue("");
                updateRegistration.reset();
              }}
              disabled={updateRegistration.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingField && draftValue.trim()) {
                  updateRegistration.mutate({ field: editingField.key, value: draftValue });
                }
              }}
              disabled={!editingField || !draftValue.trim() || updateRegistration.isPending}
            >
              {updateRegistration.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save reference
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}