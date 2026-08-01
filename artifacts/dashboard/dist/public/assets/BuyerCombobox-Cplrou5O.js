import { r as reactExports, a as useToast, t as useQueryClient, u as useLocation, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, ay as Check, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter } from "./index-DF30SY2m.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-Bfc3K7_D.js";
import { C as Command, a as CommandInput, b as CommandList, c as CommandEmpty, d as CommandGroup, e as CommandItem, f as CommandSeparator } from "./command-t2fIwf26.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-DUYK8nm3.js";
import { U as UserPlus } from "./user-plus-l2x9cFjy.js";
function BuyerCombobox({
  farmId,
  types,
  valueId,
  valueName,
  onChange,
  onChangeFull,
  required,
  placeholder = "Search or select...",
  typeLabel = "Contact",
  disabled,
  postAddNavigatePath
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [addName, setAddName] = reactExports.useState("");
  const [addAccount, setAddAccount] = reactExports.useState("");
  const [goToContacts, setGoToContacts] = reactExports.useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const qKey = ["buyers", String(farmId), types.join(",")];
  const { data } = useQuery({
    queryKey: qKey,
    queryFn: () => fetch(`/api/farms/${farmId}/buyers?types=${encodeURIComponent(types.join(","))}`).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 3e4
  });
  const buyers = reactExports.useMemo(() => data?.records ?? [], [data]);
  const addMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/buyers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then((r) => r.json()),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: qKey });
      if (result.record) {
        onChange(result.record.id, result.record.name);
      }
      const shouldNavigate = goToContacts && !!postAddNavigatePath;
      setAddOpen(false);
      setAddName("");
      setAddAccount("");
      setGoToContacts(false);
      toast({ title: `${typeLabel} added${shouldNavigate ? " — opening Suppliers & Contacts" : ""}` });
      if (shouldNavigate) navigate(postAddNavigatePath);
    },
    onError: () => toast({ title: "Failed to add", variant: "destructive" })
  });
  const handleSelect = (buyer) => {
    onChange(buyer.id, buyer.name);
    onChangeFull?.(buyer);
    setOpen(false);
  };
  const handleClear = () => {
    onChange(null, "");
    onChangeFull?.(null);
  };
  const triggerLabel = valueName || (valueId ? `ID: ${valueId}` : null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            role: "combobox",
            "aria-expanded": open,
            disabled,
            className: "flex-1 justify-between font-normal text-left h-9 px-3",
            type: "button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: triggerLabel ? "text-foreground" : "text-muted-foreground", children: triggerLabel ?? placeholder }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-72 p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: `Search ${typeLabel.toLowerCase()}s...` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "No matches found." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: `${typeLabel}s`, children: buyers.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CommandItem,
              {
                value: b.name,
                onSelect: () => handleSelect(b),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Check,
                    {
                      className: `mr-2 h-4 w-4 ${valueId === b.id ? "opacity-100" : "opacity-0"}`
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: b.name }),
                    b.accountNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                      "Acct: ",
                      b.accountNumber
                    ] })
                  ] })
                ]
              },
              b.id
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CommandItem,
              {
                onSelect: () => {
                  setOpen(false);
                  setAddOpen(true);
                },
                className: "text-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
                  "Quick add new ",
                  typeLabel.toLowerCase()
                ]
              }
            ) })
          ] })
        ] }) })
      ] }),
      (valueId !== null || valueName) && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "ghost",
          size: "sm",
          onClick: handleClear,
          className: "px-2 h-9 text-muted-foreground hover:text-destructive",
          title: "Clear selection",
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: setAddOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
        "Add ",
        typeLabel
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: addName,
              onChange: (e) => setAddName(e.target.value),
              placeholder: `e.g. ${typeLabel} name`,
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account / Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: addAccount,
              onChange: (e) => setAddAccount(e.target.value),
              placeholder: "Optional account number"
            }
          )
        ] }),
        postAddNavigatePath && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2.5 cursor-pointer group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: goToContacts,
              onChange: (e) => setGoToContacts(e.target.checked),
              className: "mt-0.5 h-4 w-4 rounded border-border accent-brand shrink-0"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/80 group-hover:text-foreground leading-relaxed", children: "Open Suppliers & Contacts to complete this record after adding" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: postAddNavigatePath ? "A full record lets you add contact details, account number, certification numbers and more." : "This will be saved to your contacts list. You can add more details in Suppliers & Contacts." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), type: "button", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              if (!addName.trim()) return;
              addMut.mutate({
                name: addName.trim(),
                accountNumber: addAccount.trim() || void 0,
                supplierType: types[0] ?? "other",
                isActive: true
              });
            },
            disabled: !addName.trim() || addMut.isPending,
            type: "button",
            children: addMut.isPending ? "Adding..." : "Add & Select"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  BuyerCombobox as B
};
