import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Loader2, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { CONTRACTOR_TYPES, RecordStepper } from "./shared";
import type { MortalityRecord, FallenStockContractor } from "./shared";

// ─── Stage 2: Arrange Disposal Dialog ────────────────────────────────────────

export function ArrangeDisposalDialog({ farmId, record, contractors, onClose }: {
  farmId: number; record: MortalityRecord; contractors: FallenStockContractor[]; onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/mortality-records`;
  const [contractorId, setContractorId] = useState(record.contractorId ? String(record.contractorId) : "");
  const [disposalOperator, setDisposalOperator] = useState(record.disposalOperator ?? "");
  const [bcmsNotified, setBcmsNotified] = useState(record.bcmsNotified);
  const [bcmsNotificationRef, setBcmsNotificationRef] = useState(record.bcmsNotificationRef ?? "");
  const isCattle = record.species?.toLowerCase().includes("cattle") || record.species?.toLowerCase().includes("bovine");
  const selectedContractor = contractors.find(c => String(c.id) === contractorId);

  function handleContractorSelect(v: string) {
    if (v === "__none__") { setContractorId(""); setDisposalOperator(""); return; }
    const c = contractors.find(x => String(x.id) === v);
    if (c) { setContractorId(v); setDisposalOperator(c.name); }
  }

  const mut = useMutation({
    mutationFn: () => fetch(`${base}/${record.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractorId: contractorId ? Number(contractorId) : null,
        disposalOperator: disposalOperator || null,
        bcmsNotified, bcmsNotificationRef: bcmsNotificationRef || null,
        status: "disposal_arranged",
      }),
    }).then(r => { if (!r.ok) throw new Error("Failed"); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); onClose(); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) { mut.reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-amber-600" /> Arrange Disposal
          </DialogTitle>
          <DialogDescription>Step 2 of 4 — confirm disposal contractor and statutory notification.</DialogDescription>
        </DialogHeader>
        <RecordStepper status="disposal_arranged" />
        <div className="space-y-4">
          <div>
            <Label>Disposal Contractor / Operator</Label>
            {contractors.length > 0 ? (
              <Select value={contractorId || "__none__"} onValueChange={handleContractorSelect}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select registered contractor…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not yet selected —</SelectItem>
                  {contractors.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} <span className="text-gray-400">({CONTRACTOR_TYPES[c.operatorType] ?? c.operatorType})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input className="mt-1" value={disposalOperator} onChange={e => setDisposalOperator(e.target.value)} placeholder="Operator name" />
            )}
            {selectedContractor && (
              <div className="mt-1.5 rounded bg-purple-50 border border-purple-100 px-3 py-2 text-xs text-purple-800 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span>APHA Approval No: <strong className="font-mono">{selectedContractor.approvalNumber}</strong></span>
                {selectedContractor.phone && <span>· {selectedContractor.phone}</span>}
              </div>
            )}
          </div>

          <div className={`border rounded-lg p-3 space-y-2 ${isCattle ? "bg-amber-50/60 border-amber-200" : "bg-gray-50"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              {isCattle ? "BCMS Notification — Required for Cattle" : "Statutory Notification"}
            </p>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={bcmsNotified} onChange={e => setBcmsNotified(e.target.checked)} className="rounded" />
              {isCattle ? "Notified to BCMS within 7 days of death" : "Other statutory notification completed"}
            </label>
            {!bcmsNotified && isCattle && (
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Cattle deaths must be reported to BCMS within 7 days.
              </p>
            )}
            {bcmsNotified && (
              <div>
                <Label className="text-xs">{isCattle ? "BCMS Notification Reference" : "Notification Reference"}</Label>
                <Input className="mt-1" value={bcmsNotificationRef} onChange={e => setBcmsNotificationRef(e.target.value)} placeholder={isCattle ? "BCMS submission reference" : "Notification reference"} />
              </div>
            )}
          </div>
        </div>
        <DialogMutationError mutation={mut} message="Failed to save — your entries are still here." />
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving…</> : <>Mark Disposal Arranged <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stage 3: Log Collection Dialog ──────────────────────────────────────────

export function LogCollectionDialog({ farmId, record, onClose }: {
  farmId: number; record: MortalityRecord; onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/mortality-records`;
  const [disposalRef, setDisposalRef] = useState(record.disposalRef ?? "");

  const mut = useMutation({
    mutationFn: () => fetch(`${base}/${record.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disposalRef: disposalRef || null, status: "disposed" }),
    }).then(r => { if (!r.ok) throw new Error("Failed"); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); onClose(); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const contractorLabel = record.contractorName || record.disposalOperator || "Contractor";

  return (
    <Dialog open onOpenChange={o => { if (!o) { mut.reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-600" /> Log Collection
          </DialogTitle>
          <DialogDescription>Step 3 of 4 — record the collection reference from the contractor.</DialogDescription>
        </DialogHeader>
        <RecordStepper status="disposed" />
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>{contractorLabel}</strong> has collected the animal.
            Record the reference number from the collection note or NFAS certificate.
          </div>
          <div>
            <Label>Disposal Reference / Collection Certificate No.</Label>
            <Input className="mt-1" value={disposalRef} onChange={e => setDisposalRef(e.target.value)}
              placeholder="e.g. NFAS-2024-00412 or collection note ref" autoFocus />
            <p className="text-xs text-gray-500 mt-1">
              This is the NFAS certificate, knacker's receipt, or collection note reference. Required for Red Tractor and organic inspections.
            </p>
          </div>
        </div>
        <DialogMutationError mutation={mut} message="Failed to save — your entries are still here." />
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !disposalRef.trim()}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving…</> : <>Mark Collected <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stage 4: Close Record Dialog ────────────────────────────────────────────

export function CloseRecordDialog({ farmId, record, vetOptions, onClose }: {
  farmId: number; record: MortalityRecord;
  vetOptions: { label: string; value: string }[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/mortality-records`;
  const [veterinaryAttended, setVeterinaryAttended] = useState(record.veterinaryAttended);
  const [vetName, setVetName] = useState(record.vetName ?? "");
  const [useOtherVet, setUseOtherVet] = useState(false);
  const [postMortemCarriedOut, setPostMortemCarriedOut] = useState(record.postMortemCarriedOut);
  const [postMortemFindings, setPostMortemFindings] = useState(record.postMortemFindings ?? "");
  const [invoiceStatus, setInvoiceStatus] = useState(record.invoiceStatus ?? "none");
  const [invoiceRef, setInvoiceRef] = useState(record.invoiceRef ?? "");
  const [invoiceAmount, setInvoiceAmount] = useState(record.invoiceAmount ?? "");
  const [invoicePaidDate, setInvoicePaidDate] = useState(record.invoicePaidDate ?? "");

  const mut = useMutation({
    mutationFn: () => fetch(`${base}/${record.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        veterinaryAttended, vetName: vetName || null,
        postMortemCarriedOut, postMortemFindings: postMortemFindings || null,
        invoiceStatus, invoiceRef: invoiceRef || null,
        invoiceAmount: invoiceAmount || null, invoicePaidDate: invoicePaidDate || null,
        status: "closed",
      }),
    }).then(r => { if (!r.ok) throw new Error("Failed"); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); onClose(); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) { mut.reset(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> Close Record
          </DialogTitle>
          <DialogDescription>Step 4 of 4 — record vet/post-mortem findings and invoice status.</DialogDescription>
        </DialogHeader>
        <RecordStepper status="closed" />
        <div className="space-y-4">
          <div className="border rounded-lg p-3 space-y-3 bg-slate-50/60">
            <p className="text-sm font-semibold text-gray-700">Veterinary</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={veterinaryAttended} onChange={e => setVeterinaryAttended(e.target.checked)} className="rounded" />
                Vet attended
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={postMortemCarriedOut} onChange={e => setPostMortemCarriedOut(e.target.checked)} className="rounded" />
                Post-mortem carried out
              </label>
            </div>
            {veterinaryAttended && (
              <div>
                <Label className="text-xs">Attending Vet / Practice</Label>
                {vetOptions.length > 0 ? (
                  <>
                    <Select
                      value={(!useOtherVet && vetOptions.find(v => v.value === vetName)) ? vetName : (useOtherVet ? "__other__" : "__none__")}
                      onValueChange={v => {
                        if (v === "__none__") { setUseOtherVet(false); setVetName(""); }
                        else if (v === "__other__") { setUseOtherVet(true); setVetName(""); }
                        else { setUseOtherVet(false); setVetName(v); }
                      }}
                    >
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select vet…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Select vet —</SelectItem>
                        {vetOptions.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                        <SelectItem value="__other__">Other / manual entry…</SelectItem>
                      </SelectContent>
                    </Select>
                    {useOtherVet && <Input className="mt-2" value={vetName} onChange={e => setVetName(e.target.value)} placeholder="e.g. Mr A. Jones BVSc — Shire Vets" autoFocus />}
                  </>
                ) : (
                  <Input className="mt-1" value={vetName} onChange={e => setVetName(e.target.value)} placeholder="Vet name / practice" />
                )}
              </div>
            )}
            {postMortemCarriedOut && (
              <div>
                <Label className="text-xs">Post-mortem Findings</Label>
                <Textarea className="mt-1" value={postMortemFindings} onChange={e => setPostMortemFindings(e.target.value)} placeholder="Summary of PM findings…" rows={2} />
              </div>
            )}
            {!veterinaryAttended && !postMortemCarriedOut && (
              <p className="text-xs text-gray-400 italic">Tick above if a vet attended or a post-mortem was carried out.</p>
            )}
          </div>

          <div className="border rounded-lg p-3 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Collection Invoice</p>
            <div>
              <Label className="text-xs">Invoice status</Label>
              <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No invoice expected</SelectItem>
                  <SelectItem value="awaiting">Awaiting invoice from collector</SelectItem>
                  <SelectItem value="received">Invoice received — payment pending</SelectItem>
                  <SelectItem value="paid">Invoice received and paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {invoiceStatus !== "none" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Invoice reference</Label><Input className="mt-1" value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)} placeholder="e.g. INV-2024-0041" /></div>
                <div><Label className="text-xs">Amount (£)</Label><Input className="mt-1" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="e.g. 45.00" /></div>
                {invoiceStatus === "paid" && (
                  <div><Label className="text-xs">Date paid</Label><Input type="date" className="mt-1" value={invoicePaidDate} onChange={e => setInvoicePaidDate(e.target.value)} /></div>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogMutationError mutation={mut} message="Failed to save — your entries are still here." />
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending} className="bg-green-600 hover:bg-green-700">
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving…</> : <><CheckCircle2 className="w-4 h-4 mr-1" /> Close Record</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
