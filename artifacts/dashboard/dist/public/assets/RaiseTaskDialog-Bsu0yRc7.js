import { a as useToast, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, d as Button, e as LoaderCircle } from "./index-DkPmuGTu.js";
import { T as Textarea } from "./textarea-COREhELl.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, e as SelectGroup, f as SelectLabel, g as SelectSeparator } from "./select-DOC9rfCF.js";
import { c as ClipboardList } from "./AppLayout-qUltwIkA.js";
function buildDeptGroups(members) {
  const map = /* @__PURE__ */ new Map();
  for (const m of members) {
    const key = m.departmentName ?? "__none__";
    if (!map.has(key)) {
      map.set(key, {
        deptId: m.departmentId ?? null,
        deptName: m.departmentName ?? "No Department",
        deptColour: m.departmentColour ?? null,
        members: []
      });
    }
    map.get(key).members.push(m);
  }
  const groups = Array.from(map.values());
  groups.sort((a, b) => {
    if (a.deptName === "No Department") return 1;
    if (b.deptName === "No Department") return -1;
    return a.deptName.localeCompare(b.deptName);
  });
  return groups;
}
function RaiseTaskDialog({
  farmId,
  open,
  onClose,
  defaultTitle = "",
  defaultDescription = "",
  defaultNote = "",
  defaultDueDate = "",
  taskType = "custom",
  taskSourceId,
  module = "General",
  allowEditTitle = false,
  onAssigned
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [assignedToMemberId, setAssignedToMemberId] = reactExports.useState("");
  const [dueDate, setDueDate] = reactExports.useState(defaultDueDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [note, setNote] = reactExports.useState(defaultNote);
  const [editableTitle, setEditableTitle] = reactExports.useState(defaultTitle);
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: open && !!farmId
  });
  const members = (membersQ.data?.members ?? []).filter((m) => m.isActive !== false);
  const groups = buildDeptGroups(members);
  const hasDepts = groups.some((g) => g.deptName !== "No Department");
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-assignments", farmId] });
      toast({ title: "Task raised and assigned" });
      handleClose();
      onAssigned?.();
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" })
  });
  function handleClose() {
    setAssignedToMemberId("");
    setDueDate(defaultDueDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    setNote(defaultNote);
    setEditableTitle(defaultTitle);
    onClose();
  }
  function handleSubmit() {
    const title = allowEditTitle ? editableTitle.trim() : defaultTitle;
    if (!title) {
      toast({ title: "Please enter a task title", variant: "destructive" });
      return;
    }
    if (!assignedToMemberId) {
      toast({ title: "Please select a staff member", variant: "destructive" });
      return;
    }
    createMut.mutate({
      assignedToMemberId: parseInt(assignedToMemberId),
      title,
      description: defaultDescription || null,
      dueDate: dueDate || null,
      assignmentNote: note || null,
      taskType,
      taskSourceId: taskSourceId || null,
      module
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) handleClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, "aria-describedby": void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4 text-primary" }),
      allowEditTitle ? "New Task" : "Raise Task"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1", children: [
      allowEditTitle ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          "Task title ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "e.g. Fix broken gate in north field",
            value: editableTitle,
            onChange: (e) => setEditableTitle(e.target.value),
            autoFocus: true
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 border rounded-lg px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5", children: "Task" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: defaultTitle || "—" }),
        defaultDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: defaultDescription })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          "Assign to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: assignedToMemberId, onValueChange: setAssignedToMemberId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: membersQ.isLoading ? "Loading staff…" : "Select staff member" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            !membersQ.isLoading && members.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", disabled: true, children: "No staff registered" }),
            hasDepts ? groups.map((g, gi) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectLabel, { className: "flex items-center gap-1.5 text-xs font-semibold text-muted-foreground", children: [
                g.deptColour && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    style: {
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: g.deptColour,
                      flexShrink: 0
                    }
                  }
                ),
                g.deptName
              ] }),
              g.members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                m.firstName,
                " ",
                m.lastName,
                m.jobTitle ? ` · ${m.jobTitle}` : ""
              ] }, m.id)),
              gi < groups.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectSeparator, {})
            ] }, g.deptName)) : members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
              m.firstName,
              " ",
              m.lastName,
              m.jobTitle ? ` · ${m.jobTitle}` : ""
            ] }, m.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: dueDate, onChange: (e) => setDueDate(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Instructions for assignee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Any specific instructions or context…", value: note, onChange: (e) => setNote(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: createMut.isPending || !assignedToMemberId, children: createMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Raise Task" })
    ] })
  ] }) });
}
export {
  RaiseTaskDialog as R
};
