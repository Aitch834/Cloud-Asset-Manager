import { s as createLucideIcon, b as useAppStore, j as jsxRuntimeExports, T as Plus, n as Card, r as reactExports, c as useQueryClient, a as useToast, m as useQuery, S as useMutation, e as LoaderCircle, d as Button, I as Input, X } from "./index-CR3lChv3.js";
import { A as AppLayout, m as LifeBuoy } from "./AppLayout-oWIdmNtK.js";
import { T as Textarea } from "./textarea-BgpPGvOR.js";
import { u as usePersistedTab } from "./use-persisted-tab-C0T-lg69.js";
import { u as useSafeUser } from "./use-safe-clerk-CcwL31Va.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { M as MessageSquare } from "./message-square-B6wNjxTw.js";
import { a as Clock } from "./database-n_SJ4gKn.js";
import { A as ArrowLeft, C as ChevronRight } from "./tractor-BNYAgg-9.js";
import { R as RefreshCw } from "./refresh-cw-DxF_O5sT.js";
import { S as Send } from "./send-BQ2qC2pQ.js";
import { C as CircleCheck } from "./circle-check-DxU9fxvd.js";
import { P as Paperclip } from "./paperclip-CV9qx3Cw.js";
import { I as Image } from "./image-Cb2UJmQw.js";
import { F as FileText } from "./shield-alert-CiH_J1fs.js";
import "./trash-2-DQHM9Xwt.js";
import "./triangle-alert-BsVdHgKp.js";
import "./shield-check-Dxp9XfqL.js";
const __iconNode = [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
];
const Hash = createLucideIcon("hash", __iconNode);
const CATEGORIES = [
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "compliance", label: "Red Tractor Compliance" },
  { value: "account", label: "Account & Access" },
  { value: "data", label: "Data & Records" },
  { value: "general", label: "General Enquiry" }
];
const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600"
};
const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed"
};
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
];
const ALLOWED_LABEL = "Images (JPG, PNG, GIF, WebP), PDF, Word documents, or text files";
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDate(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function StatusBadge({ status }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`, children: STATUS_LABELS[status] ?? status });
}
function FileIcon({ type }) {
  if (type.startsWith("image/")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-3.5 h-3.5 text-blue-500" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 text-muted-foreground" });
}
function MyTickets({ farmId }) {
  const [selected, setSelected] = reactExports.useState(null);
  const [replyText, setReplyText] = reactExports.useState("");
  const qc = useQueryClient();
  const { toast } = useToast();
  const ticketsQ = useQuery({
    queryKey: ["support-tickets", farmId],
    queryFn: () => api.get(`/farms/${farmId}/support-tickets`),
    staleTime: 3e4
  });
  const detailQ = useQuery({
    queryKey: ["support-ticket", farmId, selected?.id],
    queryFn: () => api.get(`/farms/${farmId}/support-tickets/${selected.id}`),
    enabled: !!selected,
    staleTime: 15e3
  });
  const replyMut = useMutation({
    mutationFn: (message) => api.post(`/farms/${farmId}/support-tickets/${selected.id}/reply`, { message }),
    onSuccess: () => {
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["support-ticket", farmId, selected?.id] });
      qc.invalidateQueries({ queryKey: ["support-tickets", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const tickets = ticketsQ.data?.tickets ?? [];
  if (selected) {
    const ticket = detailQ.data?.ticket ?? selected;
    const messages = detailQ.data?.messages ?? [];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setSelected(null);
            setReplyText("");
          },
          className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Back to all tickets"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: ticket.status }),
              ticket.ticketRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "w-3 h-3" }),
                ticket.ticketRef
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: ticket.subject }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "Raised ",
              formatDate(ticket.createdAt)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => detailQ.refetch(),
              className: "text-muted-foreground hover:text-foreground transition-colors",
              title: "Refresh",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 ${detailQ.isFetching ? "animate-spin" : ""}` })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 space-y-3 max-h-[420px] overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
              formatDate(ticket.createdAt),
              " · Your original message"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground whitespace-pre-wrap", children: ticket.description })
          ] }),
          detailQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-muted-foreground" }) }) : messages.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `rounded-lg p-3 text-sm ${msg.senderType === "admin" ? "bg-primary/10 ml-6" : "bg-muted/40 mr-6"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                  formatDate(msg.createdAt),
                  " ·",
                  " ",
                  msg.senderType === "admin" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-semibold", children: "BDE Farm Trac Support" }) : "You"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground whitespace-pre-wrap", children: msg.message })
              ]
            },
            msg.id
          ))
        ] }),
        ticket.status !== "closed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Add a reply" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: replyText,
                onChange: (e) => setReplyText(e.target.value),
                placeholder: "Type your reply or additional information…",
                rows: 2,
                className: "flex-1 resize-none text-sm"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => replyMut.mutate(replyText.trim()),
                disabled: !replyText.trim() || replyMut.isPending,
                className: "shrink-0 self-end",
                children: replyMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5 mr-1.5" }),
                  "Send"
                ] })
              }
            )
          ] }),
          replyMut.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive mt-1.5", children: "Failed to send reply. Please try again." })
        ] }),
        ticket.status === "closed" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-3 border-t border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", children: "This ticket is closed. Raise a new ticket if you need further help." }) })
      ] })
    ] });
  }
  if (ticketsQ.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 bg-card border border-border rounded-xl animate-pulse" }, i)) });
  }
  if (ticketsQ.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Could not load your tickets. Please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "mt-4", onClick: () => ticketsQ.refetch(), children: "Retry" })
    ] });
  }
  if (tickets.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground mb-1", children: "No support tickets yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'Use the "New Ticket" tab to raise a support request.' })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: tickets.map((ticket) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: () => setSelected(ticket),
      className: "w-full text-left",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "px-4 py-3.5 hover:border-primary/40 transition-colors cursor-pointer group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: ticket.status }),
            ticket.ticketRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-mono font-medium text-primary/80 bg-primary/8 px-1.5 py-0.5 rounded", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "w-3 h-3" }),
              ticket.ticketRef
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: ticket.subject }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: formatDate(ticket.createdAt) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground mt-1 shrink-0 group-hover:text-primary transition-colors" })
      ] }) })
    },
    ticket.id
  )) });
}
const EMPTY_FORM = {
  name: "",
  email: "",
  category: "technical",
  subject: "",
  description: ""
};
function NewTicketForm({ farmId, tenantSlug, onSubmitted }) {
  const { user: clerkUser } = useSafeUser();
  const [form, setForm] = reactExports.useState(EMPTY_FORM);
  const [errors, setErrors] = reactExports.useState({});
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [ticketRef, setTicketRef] = reactExports.useState(null);
  const [attachments, setAttachments] = reactExports.useState([]);
  const [attachmentError, setAttachmentError] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const { toast } = useToast();
  reactExports.useEffect(() => {
    if (clerkUser) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "",
        email: prev.email || clerkUser.primaryEmailAddress?.emailAddress || ""
      }));
    }
  }, [clerkUser]);
  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: void 0 }));
  }
  function handleFiles(selected) {
    if (!selected) return;
    setAttachmentError(null);
    const incoming = Array.from(selected);
    const combined = [...attachments];
    for (const file of incoming) {
      if (combined.length >= MAX_FILES) {
        setAttachmentError(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setAttachmentError(`"${file.name}" is not an allowed type. ${ALLOWED_LABEL}.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setAttachmentError(`"${file.name}" exceeds 5 MB (${formatBytes(file.size)}).`);
        continue;
      }
      if (combined.find((f) => f.name === file.name && f.size === file.size)) continue;
      combined.push(file);
    }
    setAttachments(combined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.description.trim() || form.description.trim().length < 20) e.description = "Please provide at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const categoryLabel = CATEGORIES.find((c) => c.value === form.category)?.label ?? form.category;
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("subject", `[${categoryLabel}] ${form.subject.trim()}`);
      fd.append("description", form.description.trim());
      fd.append("source", "app");
      if (farmId) fd.append("farmId", String(farmId));
      if (tenantSlug) fd.append("tenantSlug", tenantSlug);
      for (const file of attachments) fd.append("attachments", file, file.name);
      const res = await fetch("/api/support/tickets", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTicketRef(data.ticketRef ?? null);
    } catch {
      toast({ title: "Submission Failed", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }
  if (ticketRef) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-12 h-12 text-green-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-1", children: "Ticket Submitted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary rounded-lg px-4 py-2 mb-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "w-4 h-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-lg tracking-wider", children: ticketRef })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm mb-2", children: [
        "We've received your request and sent a confirmation to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: form.email }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs mb-6", children: 'Keep your reference handy — you can also track it in the "My Tickets" tab.' }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-center flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => {
              setForm((p) => ({ ...EMPTY_FORM, name: p.name, email: p.email }));
              setTicketRef(null);
              setAttachments([]);
            },
            children: "Submit Another"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSubmitted, children: "View My Tickets" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground", children: "Your Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => set("name", e.target.value), placeholder: "John Smith", className: errors.name ? "border-destructive" : "" }),
        errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground", children: "Reply Email *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.email, onChange: (e) => set("email", e.target.value), placeholder: "john@example.com", className: errors.email ? "border-destructive" : "" }),
        errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.email })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground", children: "Category" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.category, onChange: (e) => set("category", e.target.value), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring", children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.value, children: c.label }, c.value)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground", children: "Subject *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.subject, onChange: (e) => set("subject", e.target.value), placeholder: "Brief description of your issue", className: errors.subject ? "border-destructive" : "" }),
      errors.subject && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.subject })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground", children: "Description *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: form.description,
          onChange: (e) => set("description", e.target.value),
          placeholder: "Describe your issue in detail. Include any error messages, steps already tried, and what you expected to happen.",
          rows: 6,
          className: errors.description ? "border-destructive" : ""
        }
      ),
      errors.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        form.description.length,
        " characters"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground", children: [
        "Attachments ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground", children: "(optional)" })
      ] }),
      attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: attachments.map((file, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/40 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileIcon, { type: file.type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-foreground", children: file.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: formatBytes(file.size) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAttachments((p) => p.filter((_, j) => j !== i)), className: "ml-1 rounded hover:bg-destructive/10 p-0.5 text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
      ] }, i)) }),
      attachments.length < MAX_FILES && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt", className: "sr-only", onChange: (e) => handleFiles(e.target.files), id: "support-attachments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "support-attachments", className: "flex items-center gap-2 px-3 py-2.5 rounded-md border border-dashed border-border bg-background hover:bg-muted/40 cursor-pointer transition-colors text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-4 h-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: attachments.length === 0 ? "Attach screenshots or documents" : `Add more files (${MAX_FILES - attachments.length} remaining)` })
        ] })
      ] }),
      attachmentError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: attachmentError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Up to ",
        MAX_FILES,
        " files · 5 MB each · ",
        ALLOWED_LABEL
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full h-11", disabled: submitting, children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }),
      " Submitting…"
    ] }) : "Submit Ticket" })
  ] }) });
}
function InfoCard({ icon: Icon, title, body }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 text-primary" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: body })
    ] })
  ] });
}
function SupportPage() {
  const { farmId, tenantSlug } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "support", farmId, validIds: ["my-tickets", "new-ticket"], defaultTab: "my-tickets" });
  const tabs = [
    { id: "my-tickets", label: "My Tickets", icon: MessageSquare },
    { id: "new-ticket", label: "New Ticket", icon: Plus }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LifeBuoy, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Support" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Track your open requests and get in touch with our team." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit", children: tabs.map(({ id, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setTab(id),
        className: `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
          label
        ]
      },
      id
    )) }),
    tab === "my-tickets" ? farmId ? /* @__PURE__ */ jsxRuntimeExports.jsx(MyTickets, { farmId }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No farm selected — please select a farm to view your support tickets." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        NewTicketForm,
        {
          farmId,
          tenantSlug,
          onSubmitted: () => setTab("my-tickets")
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "What to Expect" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { icon: Hash, title: "Ticket Reference", body: "You'll receive a unique BDE-YYMM-NNNN reference and an email confirmation instantly." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { icon: Clock, title: "Response Time", body: "We aim to respond within 1 business day, Mon–Fri." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { icon: MessageSquare, title: "Track Progress", body: "All replies appear in your My Tickets tab — no need to dig through email." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoCard, { icon: LifeBuoy, title: "Help Centre", body: "Check the Help Centre for instant answers to common questions." })
      ] }) })
    ] })
  ] }) });
}
export {
  SupportPage as default
};
