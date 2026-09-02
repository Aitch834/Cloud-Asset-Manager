import { c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, e as LoaderCircle, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-Dq7ETKNw.js";
import { T as Textarea } from "./textarea-BshaKqm-.js";
import { a as api, f as formatDate } from "./SccEquipmentSection-DokF7pBR.js";
import { T as TriangleAlert } from "./triangle-alert-YuC7-1rz.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-B051Nk0V.js";
import { C as ChevronRight } from "./tractor-BCHVit-1.js";
import { C as CircleCheck } from "./circle-check-CO5rUT5B.js";
import { P as Pencil } from "./pencil-CJLXYShC.js";
function AbrKitStockSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editingItem, setEditingItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [panelOpen, setPanelOpen] = reactExports.useState(false);
  const stockQ = useQuery({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`), { credentials: "include" }).then((r) => r.json())
  });
  const stock = stockQ.data?.stock ?? [];
  const lowStock = stock.filter((s) => s.quantityRemaining <= s.lowStockThreshold && s.quantityRemaining >= 0);
  const save = useMutation({
    mutationFn: (body) => {
      const url = editingItem ? api(`farms/${farmId}/dairy/abr-test-kit-stock/${editingItem.id}`) : api(`farms/${farmId}/dairy/abr-test-kit-stock`);
      return fetch(url, { method: editingItem ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setEditingItem(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditingItem(null);
    setForm({ quantityPurchased: 0, quantityUsed: 0, lowStockThreshold: 5 });
    setOpen(true);
  }
  function openEdit(s) {
    setEditingItem(s);
    setForm({ ...s });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
        onClick: () => setPanelOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm text-gray-800", children: [
              "ABR Test Kit Stock (",
              stock.length,
              " products)"
            ] }),
            lowStock.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              lowStock.length,
              " low stock"
            ] })
          ] }),
          panelOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-500" })
        ]
      }
    ),
    panelOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Track antibiotic residue test kit batches, lot numbers, expiry dates, and remaining stock. When linked to a milk record, stock automatically decrements." }),
      stockQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : stock.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No kit stock logged yet. Add your first kit batch below." }) : stock.map((s) => {
        const isLow = s.quantityRemaining <= s.lowStockThreshold;
        const isOut = s.quantityRemaining === 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start justify-between rounded-md border px-3 py-2.5 ${isOut ? "bg-red-50 border-red-200" : isLow ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900", children: s.productName }),
              s.supplier && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: s.supplier }),
              isOut ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full", children: "Out of stock" }) : isLow ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                "Low stock"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                "In stock"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 text-xs text-gray-500", children: [
              s.lotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Lot: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-gray-700", children: s.lotNumber })
              ] }),
              s.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Batch: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-gray-700", children: s.batchNumber })
              ] }),
              s.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Expires: ",
                formatDate(s.expiryDate)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-700", children: [
                s.quantityRemaining,
                " of ",
                s.quantityPurchased,
                " remaining"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "(",
                s.quantityUsed,
                " used)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, s.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add Kit Batch"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingItem ? "Edit Kit Batch" : "Add ABR Test Kit Batch" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Delvotest Accelerator, BRT Tube Kit", value: form.productName || "", onChange: (e) => set("productName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Neogen, Charm Sciences", value: form.supplier || "", onChange: (e) => set("supplier", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate || "", onChange: (e) => set("expiryDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From kit box", value: form.lotNumber || "", onChange: (e) => set("lotNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From kit box", value: form.batchNumber || "", onChange: (e) => set("batchNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty Purchased" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.quantityPurchased ?? "", onChange: (e) => set("quantityPurchased", parseInt(e.target.value) || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty Used (to date)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.quantityUsed ?? "", onChange: (e) => set("quantityUsed", parseInt(e.target.value) || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Low Stock Alert Threshold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.lowStockThreshold ?? 5, onChange: (e) => set("lowStockThreshold", parseInt(e.target.value) || 5) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.productName?.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editingItem ? "Save Changes" : "Add Batch"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AbrKitStockSection as A
};
