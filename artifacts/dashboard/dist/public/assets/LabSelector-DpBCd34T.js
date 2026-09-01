import { c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, e as LoaderCircle, U as FlaskConical, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, H as DialogDescription, I as Input, J as DialogFooter, d as Button, T as Plus } from "./index-BAbMksZ_.js";
const EMPTY_LAB_FORM = { name: "", contactName: "", email: "", phone: "", address: "", ukasAccreditationNumber: "" };
function LabSelector({ farmId, value, labName, onChange, label = "Testing Laboratory", placeholder = "Select laboratory...", className }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(EMPTY_LAB_FORM);
  const { data, isLoading } = useQuery({
    queryKey: ["labs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labs`, { credentials: "include" }).then((r) => r.json())
  });
  const labs = data?.records ?? [];
  const createLab = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/labs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then((r) => {
      if (!r.ok) throw new Error("Failed to add laboratory");
      return r.json();
    }),
    onSuccess: (data2) => {
      qc.invalidateQueries({ queryKey: ["labs", farmId] });
      if (data2.record) {
        onChange(data2.record.id, data2.record.name);
      }
      setAddOpen(false);
      setForm(EMPTY_LAB_FORM);
      toast({ title: "Laboratory added" });
    },
    onError: () => toast({ title: "Failed to add laboratory", variant: "destructive" })
  });
  function handleSelectChange(e) {
    const val = e.target.value;
    if (val === "__add__") {
      setAddOpen(true);
      return;
    }
    if (val === "") {
      onChange(null, null);
      return;
    }
    const lab = labs.find((l) => String(l.id) === val);
    if (lab) onChange(lab.id, lab.name);
  }
  function handleAddSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createLab.mutate(form);
  }
  const selectedDisplay = value ? labs.find((l) => l.id === value)?.name ?? labName ?? "Lab selected" : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
      label && /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            value: value ? String(value) : "",
            onChange: handleSelectChange,
            disabled: isLoading,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: isLoading ? "Loading labs..." : placeholder }),
              labs.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(l.id), children: [
                l.name,
                l.accountNumber ? ` (UKAS: ${l.accountNumber})` : ""
              ] }, l.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__add__", children: "+ Add new laboratory..." })
            ]
          }
        ),
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin self-center text-foreground/40" })
      ] }),
      selectedDisplay && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-primary font-medium mt-1 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3" }),
        " ",
        selectedDisplay
      ] }),
      !value && labName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-1 italic", children: [
        'Previously recorded as: "',
        labName,
        '" — select from the list above or add the lab to link it'
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setForm(EMPTY_LAB_FORM);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "28rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-5 h-5 text-primary" }),
          "Add Testing Laboratory"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Labs are saved as suppliers so they can be reused across soil tests, water quality, grain tests, and any other testing records." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAddSubmit, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
            "Laboratory Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. NRM Group, ADAS Analytical Services",
              value: form.name,
              onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
              required: true,
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "UKAS Accreditation Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. 0041 — leave blank if not UKAS accredited",
              value: form.ukasAccreditationNumber,
              onChange: (e) => setForm((f) => ({ ...f, ukasAccreditationNumber: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Contact Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. John Smith",
                value: form.contactName,
                onChange: (e) => setForm((f) => ({ ...f, contactName: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. 01234 567890",
                value: form.phone,
                onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "email",
              placeholder: "samples@lab.co.uk",
              value: form.email,
              onChange: (e) => setForm((f) => ({ ...f, email: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Lab address (optional)",
              value: form.address,
              onChange: (e) => setForm((f) => ({ ...f, address: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setAddOpen(false);
            setForm(EMPTY_LAB_FORM);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: createLab.isPending || !form.name.trim(), children: [
            createLab.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            " Add Laboratory"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  LabSelector as L
};
