import { s as createLucideIcon, b as useAppStore, r as reactExports, m as useQuery, j as jsxRuntimeExports, I as Input, e as LoaderCircle, n as Card, o as CardContent, c as useQueryClient, a as useToast, S as useMutation, X, d as Button, T as Plus } from "./index-C4QiwZad.js";
import { u as useUserRole, A as AppLayout } from "./AppLayout-BNIJ4rL3.js";
import { S as Search } from "./search-C3u3_oQi.js";
import { C as ChevronRight } from "./tractor-Dw4_0sBC.js";
import "./use-safe-clerk-DAAxxxx2.js";
import "./trash-2-B0CZSXUp.js";
import "./database-CqfKDfCz.js";
import "./shield-alert-BjRKoLQm.js";
import "./triangle-alert-Z_GE-s-u.js";
import "./shield-check-mP8aelyG.js";
const __iconNode = [
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  [
    "path",
    {
      d: "M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71",
      key: "1jlk70"
    }
  ],
  [
    "path",
    {
      d: "M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264",
      key: "18rp1v"
    }
  ]
];
const ShieldOff = createLucideIcon("shield-off", __iconNode);
const MODULE_GROUPS = [
  {
    id: "general",
    label: "General",
    description: "Lists used across all farm activities — inspections, grants, transactions, sprays and more.",
    match: (k) => !k.startsWith("vineyard_") && !k.startsWith("organic_")
  },
  {
    id: "viticulture",
    label: "Viticulture",
    description: "Vineyard-specific lists for varieties, rootstocks, operations and spray records.",
    match: (k) => k.startsWith("vineyard_")
  },
  {
    id: "organic",
    label: "Organic Production",
    description: "Lists for organic certification, inputs and copper product records.",
    match: (k) => k.startsWith("organic_")
  }
];
const PARENT_CHILD_KEYS = {
  commodity_types: {
    childKey: "crop_varieties",
    parentUnit: "crops",
    childUnit: "varieties"
  },
  livestock_species: {
    childKey: "livestock_breeds",
    parentUnit: "species",
    childUnit: "breeds"
  }
};
function SectionHeader({
  title,
  description
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-2 border-b border-border mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: description })
  ] });
}
function ParentChildSubRow({
  parentValue,
  children,
  childKey,
  childUnit,
  farmId,
  canEdit,
  onChildAdded,
  onChildDeleted
}) {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [addValue, setAddValue] = reactExports.useState("");
  const { toast } = useToast();
  const standardItems = children.filter((v) => !v.isCustom);
  const customItems = children.filter((v) => v.isCustom);
  const addMut = useMutation({
    mutationFn: (label) => fetch(`/api/farms/${farmId}/lookups/${childKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, groupLabel: parentValue })
    }).then((r) => {
      if (!r.ok)
        return r.json().then((e) => Promise.reject(e));
      return r.json();
    }),
    onSuccess: () => {
      const added = addValue.trim();
      setAddValue("");
      onChildAdded();
      toast({ title: `${added} added to ${parentValue}` });
    },
    onError: (e) => toast({
      title: e?.error ?? `Failed to add ${childUnit}`,
      variant: "destructive"
    })
  });
  const deleteMut = useMutation({
    mutationFn: (itemId) => fetch(`/api/farms/${farmId}/lookups/${childKey}/${itemId}`, {
      method: "DELETE"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => onChildDeleted(),
    onError: () => toast({
      title: `Failed to remove ${childUnit}`,
      variant: "destructive"
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors",
        onClick: () => setIsOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChevronRight,
            {
              size: 13,
              className: `shrink-0 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium flex-1", children: parentValue }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
            standardItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium", children: [
              standardItems.length,
              " standard"
            ] }),
            customItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium", children: [
              "+",
              customItems.length,
              " custom"
            ] })
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border bg-muted/10 p-3 space-y-3", children: [
      standardItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: [
          "Standard ",
          childUnit
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: standardItems.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "text-xs px-2.5 py-1 bg-background border border-border rounded-full text-muted-foreground",
            children: v.label
          },
          v.id
        )) })
      ] }),
      customItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: [
          "Your custom ",
          childUnit
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: customItems.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-green-900",
            children: [
              v.label,
              canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    deleteMut.mutate(v.id);
                  },
                  disabled: deleteMut.isPending,
                  className: "hover:text-red-600 transition-colors ml-0.5 leading-none",
                  title: `Remove custom ${childUnit.replace(/s$/, "")}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 10 })
                }
              )
            ]
          },
          v.id
        )) })
      ] }),
      canEdit && customItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground italic", children: [
        "No custom ",
        childUnit,
        " yet — add your own below."
      ] }),
      !canEdit && standardItems.length === 0 && customItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground italic", children: [
        "No ",
        childUnit,
        " listed for this entry."
      ] }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: `Add a ${parentValue} ${childUnit.replace(/s$/, "")}…`,
            value: addValue,
            onChange: (e) => setAddValue(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && addValue.trim())
                addMut.mutate(addValue.trim());
            },
            className: "text-sm h-8"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            disabled: !addValue.trim() || addMut.isPending,
            onClick: () => addMut.mutate(addValue.trim()),
            className: "h-8 px-3 shrink-0",
            children: addMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12, className: "mr-1" }),
              "Add"
            ] })
          }
        )
      ] }),
      !canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground italic", children: [
        "Manager role or above is required to add or remove custom",
        " ",
        childUnit,
        "."
      ] })
    ] })
  ] });
}
function ParentChildLookupRow({
  def,
  childDef,
  childKey,
  parentUnit,
  childUnit,
  farmId,
  canEdit
}) {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const { tenantSlug } = useAppStore();
  const queryClient = useQueryClient();
  const parentQ = useQuery({
    queryKey: ["lookup-items", def.key],
    queryFn: () => fetch(`/api/lookups/${def.key}`).then((r) => r.json()),
    enabled: isOpen
  });
  const childrenQ = useQuery({
    queryKey: ["lookup-items", childKey],
    queryFn: () => fetch(`/api/lookups/${childKey}`).then((r) => r.json()),
    enabled: isOpen
  });
  const parentItems = parentQ.data?.items ?? [];
  const allChildren = childrenQ.data?.items ?? [];
  const handleChildChange = () => {
    queryClient.invalidateQueries({ queryKey: ["lookup-items", childKey] });
    queryClient.invalidateQueries({ queryKey: ["lookups-summary", tenantSlug] });
  };
  const isLoading = (parentQ.isLoading || childrenQ.isLoading) && isOpen;
  const customChildCount = childDef?.customCount ?? 0;
  const totalChildCount = (childDef?.standardCount ?? 0) + customChildCount;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors",
        onClick: () => setIsOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChevronRight,
            {
              size: 15,
              className: `shrink-0 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold leading-snug", children: def.label }),
            def.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-1", children: def.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 shrink-0 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium", children: [
              def.standardCount,
              " ",
              parentUnit
            ] }),
            totalChildCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium", children: [
              totalChildCount,
              " ",
              childUnit
            ] }),
            customChildCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium", children: [
              "+",
              customChildCount,
              " custom"
            ] })
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border bg-muted/10 p-4 space-y-2", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }),
        "Loading…"
      ] }),
      !isLoading && parentItems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        ParentChildSubRow,
        {
          parentValue: p.value,
          children: allChildren.filter((c) => c.groupLabel === p.value),
          childKey,
          childUnit,
          farmId,
          canEdit,
          onChildAdded: handleChildChange,
          onChildDeleted: handleChildChange
        },
        p.id
      )),
      def.authority && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground pt-2 border-t border-border mt-2", children: [
        def.label,
        ": ",
        def.authority,
        childDef?.authority ? ` · ${childDef.label}: ${childDef.authority}` : ""
      ] })
    ] })
  ] });
}
function LookupListRow({
  def,
  farmId,
  canEdit
}) {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [addValue, setAddValue] = reactExports.useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const itemsQ = useQuery({
    queryKey: ["lookup-items", def.key],
    queryFn: () => fetch(`/api/lookups/${def.key}`).then((r) => r.json()),
    enabled: isOpen
  });
  const addMut = useMutation({
    mutationFn: (label) => fetch(`/api/farms/${farmId}/lookups/${def.key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label })
    }).then((r) => {
      if (!r.ok)
        return r.json().then((e) => Promise.reject(e));
      return r.json();
    }),
    onSuccess: () => {
      setAddValue("");
      queryClient.invalidateQueries({ queryKey: ["lookup-items", def.key] });
      queryClient.invalidateQueries({ queryKey: ["lookups-summary", farmId] });
      toast({ title: "Item added" });
    },
    onError: (e) => toast({
      title: e?.error ?? "Failed to add item",
      variant: "destructive"
    })
  });
  const deleteMut = useMutation({
    mutationFn: (itemId) => fetch(`/api/farms/${farmId}/lookups/${def.key}/${itemId}`, {
      method: "DELETE"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lookup-items", def.key] });
      queryClient.invalidateQueries({ queryKey: ["lookups-summary", farmId] });
    },
    onError: () => toast({ title: "Failed to remove item", variant: "destructive" })
  });
  const items = itemsQ.data?.items ?? [];
  const standardItems = items.filter((i) => !i.isCustom);
  const customItems = items.filter((i) => i.isCustom);
  const hasGroups = standardItems.some((i) => i.groupLabel);
  const standardGroups = [];
  if (hasGroups) {
    const seen = /* @__PURE__ */ new Map();
    for (const item of standardItems) {
      const key = item.groupLabel ?? "Other";
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(item);
    }
    seen.forEach(
      (groupItems, group) => standardGroups.push({ group, items: groupItems })
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors",
        onClick: () => setIsOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChevronRight,
            {
              size: 15,
              className: `shrink-0 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold leading-snug", children: def.label }),
            def.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-1", children: def.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 shrink-0 ml-2", children: [
            def.standardCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium", children: [
              def.standardCount,
              " standard"
            ] }),
            def.customCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium", children: [
              "+",
              def.customCount,
              " custom"
            ] })
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border bg-muted/10 p-4 space-y-4", children: [
      itemsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }),
        "Loading items…"
      ] }),
      standardItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Standard items" }),
        hasGroups ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: standardGroups.map(({ group, items: gItems }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground mb-1.5", children: group }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: gItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-xs px-2.5 py-1 bg-background border border-border rounded-full text-muted-foreground",
              children: item.label
            },
            item.id
          )) })
        ] }, group)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: standardItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "text-xs px-2.5 py-1 bg-background border border-border rounded-full text-muted-foreground",
            children: item.label
          },
          item.id
        )) })
      ] }),
      customItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Your custom items" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: customItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-green-900",
            children: [
              item.label,
              canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    deleteMut.mutate(item.id);
                  },
                  disabled: deleteMut.isPending,
                  className: "hover:text-red-600 transition-colors ml-0.5 leading-none",
                  title: "Remove custom item",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 11 })
                }
              )
            ]
          },
          item.id
        )) })
      ] }),
      !itemsQ.isLoading && customItems.length === 0 && standardItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "No custom items yet — add your own below." }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: `Add a custom item to ${def.label}…`,
            value: addValue,
            onChange: (e) => setAddValue(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && addValue.trim())
                addMut.mutate(addValue.trim());
            },
            className: "text-sm h-8"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            disabled: !addValue.trim() || addMut.isPending,
            onClick: () => addMut.mutate(addValue.trim()),
            className: "h-8 px-3 shrink-0",
            children: addMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12, className: "mr-1" }),
              "Add"
            ] })
          }
        )
      ] }),
      !canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "Manager role or above is required to add or remove custom items." }),
      def.authority && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground pt-1 border-t border-border mt-2", children: [
        "Standard items sourced from: ",
        def.authority
      ] })
    ] })
  ] });
}
function LookupListsPage() {
  const { farmId, tenantSlug } = useAppStore();
  const { isAtLeast } = useUserRole();
  const [search, setSearch] = reactExports.useState("");
  const canEdit = isAtLeast("manager");
  const summaryQ = useQuery({
    queryKey: ["lookups-summary", tenantSlug],
    queryFn: async () => {
      const res = await fetch(`/api/lookups/summary`);
      if (!res.ok)
        throw new Error(`Failed to load lookup lists (${res.status})`);
      return res.json();
    },
    retry: 1
  });
  const allDefs = summaryQ.data?.definitions ?? [];
  const hiddenChildKeys = new Set(
    Object.values(PARENT_CHILD_KEYS).map((v) => v.childKey)
  );
  const filtered = (search.trim() ? allDefs.filter(
    (d) => d.label.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase())
  ) : allDefs).filter((d) => !hiddenChildKeys.has(d.key));
  const visibleGroups = MODULE_GROUPS.map((group) => ({
    ...group,
    defs: filtered.filter((d) => group.match(d.key))
  })).filter((g) => g.defs.length > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Lookup Lists" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Manage the dropdown options used throughout BDE Farm Trac. Standard items are maintained by BDE and cannot be removed. You can add your own custom entries to any list — they appear alongside the standard options for everyone on your farm." })
    ] }),
    !canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { size: 15, className: "mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You are viewing in read-only mode. Manager role or above is required to add or remove custom items." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Search,
        {
          size: 14,
          className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search lookup lists…",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "pl-8 h-9"
        }
      )
    ] }),
    summaryQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }),
      "Loading lookup lists…"
    ] }),
    !summaryQ.isLoading && visibleGroups.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6 text-center text-sm text-muted-foreground", children: "No lookup lists match your search." }) }),
    visibleGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: group.label,
          description: group.description
        }
      ),
      group.defs.map((def) => {
        const pcConfig = PARENT_CHILD_KEYS[def.key];
        if (pcConfig) {
          const childDef = allDefs.find(
            (d) => d.key === pcConfig.childKey
          );
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            ParentChildLookupRow,
            {
              def,
              childDef,
              childKey: pcConfig.childKey,
              parentUnit: pcConfig.parentUnit,
              childUnit: pcConfig.childUnit,
              farmId,
              canEdit
            },
            def.key
          );
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          LookupListRow,
          {
            def,
            farmId,
            canEdit
          },
          def.key
        );
      })
    ] }) }, group.id))
  ] }) });
}
export {
  LookupListsPage as default
};
