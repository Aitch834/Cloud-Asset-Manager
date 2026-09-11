import { b as useAppStore, a as useToast, r as reactExports, c as useQueryClient, m as useQuery, j as jsxRuntimeExports, R as Redirect, S as useMutation, n as Card, p as CardContent, $ as RefreshCw, d as Button, I as Input, T as Plus, X, e as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, N as DialogMutationError, J as DialogFooter, H as DialogDescription } from "./index-CTNdWNpd.js";
import { p as printProReport } from "./print-report-ClU8-1P0.js";
import { A as AppLayout } from "./AppLayout-UnB4Z3KW.js";
import { S as Search } from "./search-Ddlevn9L.js";
import { P as Printer } from "./printer-o6IfmwUB.js";
import { F as FileDown } from "./file-down-DJRGVdGa.js";
import { P as Pencil } from "./pencil-DbmEUE1M.js";
import { T as Trash2 } from "./trash-2-B-Z0JBqp.js";
import "./use-safe-clerk-Y4-rOQQn.js";
import "./database-B3JsLWfZ.js";
import "./shield-alert-BmiBeqnv.js";
import "./triangle-alert-C2XQ3roM.js";
import "./shield-check-DXlKaonl.js";
import "./tractor-E5BpJDTm.js";
function formatDate(val) {
  if (!val) return "-";
  try {
    return new Date(String(val)).toLocaleDateString("en-GB");
  } catch {
    return String(val);
  }
}
function formatValue(val) {
  if (val === null || val === void 0) return "-";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}/)) return formatDate(val);
  return String(val);
}
function ModulePage({ title, apiPath, columns, formFields, responseKey, scope = "farm" }) {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = reactExports.useState("");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingRecord, setEditingRecord] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({});
  const [deleteConfirmId, setDeleteConfirmId] = reactExports.useState(null);
  const [printOpen, setPrintOpen] = reactExports.useState(false);
  const queryClient = useQueryClient();
  const { data: farmData } = useQuery({
    queryKey: ["farm-for-print", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}`);
      return r.json();
    },
    enabled: !!farmId && scope === "farm"
  });
  const farm = farmData?.record;
  if (scope === "farm" && !farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  const fetchUrl = scope === "farm" ? `/api/farms/${farmId}/${apiPath}` : `/api/${apiPath}`;
  const LoadingSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-64 bg-black/5 rounded-lg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-24 bg-black/5 rounded-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-24 bg-black/5 rounded-lg" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-black/5 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-black/5 rounded w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-black/5 rounded w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-black/5 rounded w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-black/5 rounded w-3/4" })
    ] }) })
  ] }) });
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["farm-module", farmId, apiPath],
    queryFn: async () => {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });
  const createMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-module", farmId, apiPath] });
      setShowForm(false);
      setFormData({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`${fetchUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-module", farmId, apiPath] });
      setEditingRecord(null);
      setFormData({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${fetchUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-module", farmId, apiPath] });
      setDeleteConfirmId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const rKey = responseKey || "records";
  const rawRecords = data?.[rKey] ?? data?.records;
  const records = Array.isArray(rawRecords) ? rawRecords : [];
  const filtered = records.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return columns.some((c) => {
      const val = r[c.key];
      return val != null && String(val).toLowerCase().includes(s);
    });
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, body: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  const openEditForm = (record) => {
    setEditingRecord(record);
    const prefilled = {};
    if (formFields) {
      for (const field of formFields) {
        const val = record[field.key];
        if (val != null) prefilled[field.key] = val;
      }
    }
    setFormData(prefilled);
  };
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const handlePrint = () => {
    const headerCells = columns.map((c) => `<th>${c.label}</th>`).join("");
    const bodyRows = records.map(
      (record, i) => `<tr class="${i % 2 === 0 ? "" : "alt"}">` + columns.map((c) => `<td>${c.render ? c.render(record[c.key], record) : formatValue(record[c.key])}</td>`).join("") + `</tr>`
    ).join("");
    const farmName = farm?.name ?? "Farm";
    [
      farm?.address ? `${farm.address}${farm.postcode ? `, ${farm.postcode}` : ""}` : null,
      farm?.cphNumber ? `CPH: ${farm.cphNumber}` : null
    ].filter(Boolean).join(" &nbsp;|&nbsp; ");
    printProReport({
      title,
      farmName,
      cphNumber: farm?.cphNumber ?? void 0,
      recordCount: records.length,
      tableHtml: `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
    });
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {});
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-6 h-6 text-red-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2", children: "Failed to load data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [
        "There was a problem loading your ",
        title.toLowerCase(),
        " records. Please try again."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => refetch(), variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
        " Retry"
      ] })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {
          body > * { display: none !important; }
          [role="dialog"] #module-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: `Search ${title.toLowerCase()}...`,
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-1" }),
          " Refresh"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setPrintOpen(true), disabled: records.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          " Print"
        ] }),
        formFields && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setShowForm(!showForm);
          setEditingRecord(null);
          setFormData({});
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          " Add New"
        ] })
      ] })
    ] }),
    (showForm || editingRecord) && formFields && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-lg", children: editingRecord ? "Edit Record" : "Add New Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setShowForm(false);
          setEditingRecord(null);
          setFormData({});
        }, className: "p-1 rounded hover:bg-black/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-foreground/50" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        formFields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: field.label }),
          field.type === "select" && field.options ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
              value: String(formData[field.key] ?? ""),
              onChange: (e) => setFormData({ ...formData, [field.key]: e.target.value }),
              required: field.required,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select..." }),
                field.options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o, children: o }, o))
              ]
            }
          ) : field.type === "textarea" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]",
              value: String(formData[field.key] ?? ""),
              onChange: (e) => setFormData({ ...formData, [field.key]: e.target.value }),
              required: field.required
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: field.type || "text",
              value: String(formData[field.key] ?? ""),
              onChange: (e) => setFormData({ ...formData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }),
              required: field.required
            }
          )
        ] }, field.key)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 flex gap-4 justify-end pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", type: "button", onClick: () => {
            setShowForm(false);
            setEditingRecord(null);
            setFormData({});
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
            isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
            editingRecord ? "Update" : "Save"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteConfirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteConfirmId(null);
        deleteMutation.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Are you sure you want to delete this record? This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMutation, message: "Failed to delete — the record is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteConfirmId && deleteMutation.mutate(deleteConfirmId), disabled: deleteMutation.isPending, children: [
          deleteMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
          "Delete"
        ] })
      ] })
    ] }) }),
    printOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setPrintOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-5xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-5 h-5 text-green-600" }),
          "Print — ",
          title
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Review the records below, then click Print to produce a compliance document for Red Tractor audit." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "module-print-area", className: "border border-border rounded-lg p-6 space-y-4 text-sm mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start border-b pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-foreground", children: farm?.name ?? "Farm" }),
            farm?.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60", children: [
              farm.address,
              farm.postcode ? `, ${farm.postcode}` : ""
            ] }),
            farm?.cphNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60 mt-0.5", children: [
              "CPH: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: farm.cphNumber })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-foreground/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Printed: ",
              printedDate
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              records.length,
              " record",
              records.length !== 1 ? "s" : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs border-collapse", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-green-50 text-foreground/70", children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold whitespace-nowrap", children: col.label }, col.key)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((record, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: i % 2 === 0 ? "bg-white" : "bg-black/[0.02]", children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2 align-top", children: col.render ? col.render(record[col.key], record) : formatValue(record[col.key]) }, col.key)) }, record.id || i)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground/40 border-t pt-3 italic", children: [
          "This is an on-farm record for Red Tractor compliance purposes. Retain for a minimum of 3 years and make available for inspection at audit. BDE Farm Trac · Printed ",
          printedDate
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPrintOpen(false), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
          " Print Records"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-8 h-8 text-primary/40" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No records yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search ? "No records match your search." : `Get started by adding your first ${title.toLowerCase()} record.` })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
          columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: col.label }, col.key)),
          formFields && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: filtered.map((record, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-black/[0.02] transition-colors", children: [
          columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/80", children: col.render ? col.render(record[col.key], record) : formatValue(record[col.key]) }, col.key)),
          formFields && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => openEditForm(record),
                className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary transition-colors",
                title: "Edit",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setDeleteConfirmId(record.id),
                className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500 transition-colors",
                title: "Delete",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] }) })
        ] }, record.id || i)) })
      ] }) }),
      filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-t border-border text-sm text-foreground/50", children: [
        "Showing ",
        filtered.length,
        " of ",
        records.length,
        " records"
      ] })
    ] })
  ] });
}
export {
  ModulePage as default
};
