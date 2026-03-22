import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lab {
  id: number;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  accountNumber: string | null;
}

interface LabSelectorProps {
  farmId: number;
  value: number | null | undefined;
  labName?: string | null;
  onChange: (labId: number | null, labName: string | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const EMPTY_LAB_FORM = { name: "", contactName: "", email: "", phone: "", address: "", ukasAccreditationNumber: "" };

export function LabSelector({ farmId, value, labName, onChange, label = "Testing Laboratory", placeholder = "Select laboratory...", className }: LabSelectorProps) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_LAB_FORM>(EMPTY_LAB_FORM);

  const { data, isLoading } = useQuery<{ records: Lab[] }>({
    queryKey: ["labs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labs`, { credentials: "include" }).then(r => r.json()),
  });

  const labs = data?.records ?? [];

  const createLab = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/labs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["labs", farmId] });
      if (data.record) {
        onChange(data.record.id, data.record.name);
      }
      setAddOpen(false);
      setForm(EMPTY_LAB_FORM);
      toast({ title: "Laboratory added" });
    },
  });

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "__add__") {
      setAddOpen(true);
      return;
    }
    if (val === "") {
      onChange(null, null);
      return;
    }
    const lab = labs.find(l => String(l.id) === val);
    if (lab) onChange(lab.id, lab.name);
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createLab.mutate(form);
  }

  const selectedDisplay = value ? (labs.find(l => l.id === value)?.name ?? labName ?? "Lab selected") : null;

  return (
    <>
      <div className={className}>
        {label && <label className="text-sm font-medium text-foreground/70 mb-1 block">{label}</label>}
        <div className="flex gap-2">
          <select
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={value ? String(value) : ""}
            onChange={handleSelectChange}
            disabled={isLoading}
          >
            <option value="">{isLoading ? "Loading labs..." : placeholder}</option>
            {labs.map(l => (
              <option key={l.id} value={String(l.id)}>
                {l.name}{l.accountNumber ? ` (UKAS: ${l.accountNumber})` : ""}
              </option>
            ))}
            <option value="__add__">+ Add new laboratory...</option>
          </select>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin self-center text-foreground/40" />}
        </div>
        {selectedDisplay && (
          <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
            <FlaskConical className="w-3 h-3" /> {selectedDisplay}
          </p>
        )}
        {!value && labName && (
          <p className="text-xs text-foreground/50 mt-1 italic">
            Previously recorded as: "{labName}" — select from the list above or add the lab to link it
          </p>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setForm(EMPTY_LAB_FORM); } }}>
        <DialogContent style={{ maxWidth: "28rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              Add Testing Laboratory
            </DialogTitle>
            <DialogDescription>
              Labs are saved as suppliers so they can be reused across soil tests, water quality, grain tests, and any other testing records.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Laboratory Name <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. NRM Group, ADAS Analytical Services"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">UKAS Accreditation Number</label>
              <Input
                placeholder="e.g. 0041 — leave blank if not UKAS accredited"
                value={form.ukasAccreditationNumber}
                onChange={e => setForm(f => ({ ...f, ukasAccreditationNumber: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Contact Name</label>
                <Input
                  placeholder="e.g. John Smith"
                  value={form.contactName}
                  onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Phone</label>
                <Input
                  placeholder="e.g. 01234 567890"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="samples@lab.co.uk"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Address</label>
              <Input
                placeholder="Lab address (optional)"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setForm(EMPTY_LAB_FORM); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLab.isPending || !form.name.trim()}>
                {createLab.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Plus className="w-4 h-4 mr-1" /> Add Laboratory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
