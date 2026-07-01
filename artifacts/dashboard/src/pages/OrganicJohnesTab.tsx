import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, Printer } from "lucide-react";
import { DocAttach } from "@/components/DocAttach";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { openPrintWindow } from "@/lib/print-report";

const JOHNES_TYPES = [
  { value: "bulk_milk_elisa", label: "Bulk Milk ELISA" },
  { value: "individual_milk_elisa", label: "Individual Milk ELISA" },
  { value: "individual_blood_elisa", label: "Individual Blood ELISA" },
  { value: "faecal_pcr", label: "Faecal PCR (individual)" },
  { value: "pooled_faecal_pcr", label: "Pooled Faecal PCR" },
  { value: "post_mortem", label: "Post-mortem confirmation" },
];
const JOHNES_RISK = [
  { value: "1_very_low", label: "1 — Very Low Risk" },
  { value: "2_low", label: "2 — Low Risk" },
  { value: "3_moderate", label: "3 — Moderate Risk" },
  { value: "4_high", label: "4 — High Risk" },
];
const JOHNES_SCHEMES = [
  { value: "johnes_management_in_milk", label: "Johne's Management in Milk (AHDB)" },
  { value: "farm_health_connect", label: "Farm Health Connect" },
  { value: "voluntary", label: "Voluntary / Vet-led" },
  { value: "other", label: "Other" },
];

export function OrganicJohnesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewRec, setViewRec] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [yearFilter, setYearFilter] = useState("all");

  const { data: allRecordsRaw = [], isLoading } = useQuery({
    queryKey: ["johnes-monitoring", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/johnes-monitoring`, { credentials: "include" })
        .then(r => r.json())
        .then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const allRecords: any[] = allRecordsRaw;

  const years = useMemo(() => {
    const s = new Set(
      allRecords.map((r: any) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean) as string[]
    );
    return Array.from(s).sort().reverse();
  }, [allRecords]);

  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/herds`, { credentials: "include" })
        .then(r => r.json())
        .then(d =>
          (d.records ?? []).filter((h: any) => {
            const t = String(h.type ?? "").toLowerCase();
            return ["cattle", "beef", "dairy", "suckler", "bovine"].some(k => t.includes(k));
          })
        ),
    enabled: !!farmId,
  });

  return (
    <div className="p-4 text-sm text-gray-500">
      Johnes hooks-only stub — farmId={farmId} records={allRecords.length} herds={(herds as any[]).length} years={years.length}
    </div>
  );
}
