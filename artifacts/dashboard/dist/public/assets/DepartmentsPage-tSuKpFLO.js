import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, n as Card, o as CardContent, B as Building2, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-Cb0221q6.js";
import { A as AppLayout, U as Users } from "./AppLayout-DDVlQv9i.js";
import { B as Badge } from "./badge-CgVxmgid.js";
import { C as ConfirmDialog } from "./confirm-dialog-DbBnj-Nl.js";
import { R as RefreshCw } from "./refresh-cw-BwLZ6M8E.js";
import { E as Eye } from "./eye-Bf2oTb_j.js";
import { P as Pencil } from "./pencil-PU8jmNoJ.js";
import { T as Trash2 } from "./trash-2-BwfN0BI-.js";
import { U as UserX } from "./user-x-scx0yE63.js";
import "./use-safe-clerk-Dnx3VMN9.js";
import "./database-HUp9CfoM.js";
import "./shield-alert-2fRHrWpC.js";
import "./triangle-alert-O5sMirCq.js";
import "./shield-check-DqyR58vH.js";
import "./tractor-D2Mxbjoy.js";
function authHeaders() {
  return {};
}
const PRESET_COLOURS = [
  "#16a34a",
  "#b45309",
  "#1d4ed8",
  "#7c3aed",
  "#be123c",
  "#0f766e",
  "#c2410c",
  "#6d28d9",
  "#0369a1",
  "#374151"
];
const FARM_ROLE_LABELS = {
  operator: "Operator",
  senior: "Senior Operator",
  manager: "Manager",
  owner: "Owner"
};
function DeptMembersDialog({ farmId, dept, open, onClose }) {
  const [showFormer, setShowFormer] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: open && !!farmId
  });
  const allInDept = (data?.members ?? []).filter(
    (m) => m.departmentId === dept.id || m.secondaryDepartments?.some((sd) => sd.id === dept.id)
  );
  const activeMembers = allInDept.filter((m) => m.isActive);
  const formerMembers = allInDept.filter((m) => !m.isActive);
  const displayed = showFormer ? allInDept : activeMembers;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "w-4 h-4 rounded-full shrink-0",
          style: { background: dept.colour }
        }
      ),
      dept.name,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-muted-foreground ml-1", children: "— Staff" })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-10 gap-2 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }),
      "Loading…"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      formerMembers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          formerMembers.length,
          " former staff member",
          formerMembers.length !== 1 ? "s" : "",
          " not shown"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowFormer((v) => !v),
            className: "text-xs font-medium text-primary hover:underline",
            children: showFormer ? "Hide former staff" : "Show former staff"
          }
        )
      ] }),
      displayed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-10 gap-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-8 h-8 text-muted-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: showFormer ? "No staff have ever been assigned to this department." : "No current staff assigned to this department." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/40 rounded-lg border border-border/60 overflow-hidden", children: displayed.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex items-center gap-3 px-4 py-3 ${!m.isActive ? "opacity-60 bg-muted/30" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-primary", children: [
              m.firstName[0],
              m.lastName[0]
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
                m.firstName,
                " ",
                m.lastName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: m.jobTitle || FARM_ROLE_LABELS[m.farmRole] || m.farmRole })
            ] }),
            m.departmentId !== dept.id && m.secondaryDepartments?.some((sd) => sd.id === dept.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] shrink-0 text-muted-foreground", children: "Secondary" }),
            !m.isActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "w-2.5 h-2.5 mr-1" }),
              "Former"
            ] }),
            m.employedFrom && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground shrink-0", children: [
              "From ",
              new Date(m.employedFrom).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
            ] })
          ]
        },
        m.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground pt-1", children: [
        activeMembers.length,
        " current · ",
        formerMembers.length,
        " former"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, children: "Close" }) })
  ] }) });
}
function DeptFormDialog({ farmId, dept, open, onClose }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = reactExports.useState(dept?.name ?? "");
  const [description, setDescription] = reactExports.useState(dept?.description ?? "");
  const [colour, setColour] = reactExports.useState(dept?.colour ?? PRESET_COLOURS[0]);
  function reset() {
    setName(dept?.name ?? "");
    setDescription(dept?.description ?? "");
    setColour(dept?.colour ?? PRESET_COLOURS[0]);
  }
  const save = useMutation({
    mutationFn: async () => {
      const url = dept ? `/api/farms/${farmId}/departments/${dept.id}` : `/api/farms/${farmId}/departments`;
      const res = await fetch(url, {
        method: dept ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, colour })
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-departments", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      toast({ title: dept ? "Department updated" : "Department created" });
      onClose();
    },
    onError: () => toast({ title: "Failed to save department", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      save.reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "32rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dept ? "Edit Department" : "Add Department" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dept-name", children: "Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "dept-name",
            className: "mt-1",
            placeholder: "e.g. Arable, Livestock, Dairy…",
            value: name,
            onChange: (e) => setName(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dept-desc", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "dept-desc",
            className: "mt-1",
            placeholder: "Optional short description",
            value: description,
            onChange: (e) => setDescription(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colour" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [
          PRESET_COLOURS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setColour(c),
              className: `w-7 h-7 rounded-full border-2 transition-all ${colour === c ? "border-foreground scale-110" : "border-transparent"}`,
              style: { background: c },
              title: c,
              type: "button"
            },
            c
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "color",
              value: colour,
              onChange: (e) => setColour(e.target.value),
              className: "w-7 h-7 rounded cursor-pointer border border-border",
              title: "Custom colour"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: "ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white",
              style: { background: colour },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-white/40" }),
                "Preview"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        reset();
        save.reset();
        onClose();
      }, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: !name.trim() || save.isPending, children: save.isPending ? "Saving…" : dept ? "Save Changes" : "Add Department" })
    ] })
  ] }) });
}
function DepartmentsPage() {
  const { farmId } = useAppStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogDept, setDialogDept] = reactExports.useState(null);
  const [viewDept, setViewDept] = reactExports.useState(null);
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["farm-departments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/departments`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const departments = data?.departments ?? [];
  const active = departments.filter((d) => d.isActive);
  const deleteDept = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/farms/${farmId}/departments/${id}`, {
        method: "DELETE",
        headers: authHeaders()
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-departments", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      toast({ title: "Department removed" });
    },
    onError: () => toast({ title: "Failed to remove department", variant: "destructive" })
  });
  if (!farmId) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Departments", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Organise your staff into departments. Departments can be assigned to individual staff members." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setDialogDept("new"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
        "Add Department"
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-center py-16 gap-3 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }),
      "Loading departments…"
    ] }) }),
    isError && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 gap-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Failed to load departments." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Retry" })
    ] }) }),
    !isLoading && !isError && departments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-20 gap-4 text-center px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-7 h-7 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "No departments yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-sm", children: "Create departments to organise your staff — for example Arable, Livestock, Dairy, or Maintenance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setDialogDept("new"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
        "Add first department"
      ] })
    ] }) }),
    !isLoading && !isError && departments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-3 border-b border-border/50 bg-black/[0.02] flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-primary" }),
        "Farm Departments",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-normal", children: [
          active.length,
          " active"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/40", children: departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            style: { background: d.colour + "22" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full", style: { background: d.colour } })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: d.name }),
          d.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: d.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white shrink-0",
            style: { background: d.colour },
            children: d.name
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => setViewDept(d),
              className: "h-8 w-8 p-0 text-muted-foreground hover:text-foreground",
              title: "View staff",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => setDialogDept(d),
              className: "h-8 w-8 p-0",
              title: "Edit",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => setPendingDelete(d),
              className: "h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              title: "Delete",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
            }
          )
        ] })
      ] }, d.id)) })
    ] }) }),
    dialogDept !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeptFormDialog,
      {
        farmId,
        dept: dialogDept === "new" ? null : dialogDept,
        open: true,
        onClose: () => setDialogDept(null)
      }
    ),
    viewDept !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeptMembersDialog,
      {
        farmId,
        dept: viewDept,
        open: true,
        onClose: () => setViewDept(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelete !== null,
        title: "Remove department",
        message: pendingDelete ? `Remove "${pendingDelete.name}"? Any staff assigned to this department will be unlinked.` : "",
        confirmLabel: "Remove",
        confirmVariant: "destructive",
        mutation: deleteDept,
        onConfirm: () => {
          if (pendingDelete) deleteDept.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          deleteDept.reset();
        }
      }
    )
  ] });
}
export {
  DepartmentsPage as default
};
