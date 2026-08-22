import { s as createLucideIcon, b as useAppStore, a as useToast, c as useQueryClient, m as useQuery, S as useMutation, r as reactExports, j as jsxRuntimeExports, R as Redirect, n as Card, o as CardContent, L as Label, I as Input, M as MapPin, d as Button, e as LoaderCircle, C as Checkbox, X, B as Building2, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, N as DialogMutationError, J as DialogFooter } from "./index-dOwizOzO.js";
import { u as useUpload } from "./use-upload-C_iT_3ke.js";
import { A as AppLayout, o as LogOut, j as Truck } from "./AppLayout-DxVOt1e5.js";
import { T as Textarea } from "./textarea-CtBJ8gnr.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DQkn2syB.js";
import { C as Copy } from "./copy-BN2enLPl.js";
import { E as ExternalLink } from "./external-link-ahdoe3Iq.js";
import { R as RefreshCw } from "./refresh-cw-Bd1kRNxV.js";
import { T as TriangleAlert } from "./triangle-alert-D1dPGvoB.js";
import { U as UserRound } from "./user-round-BJasHU0M.js";
import { P as Phone } from "./phone-DFNrY0Rl.js";
import { S as Save } from "./save-CCOGYRTf.js";
import { C as CircleCheck } from "./circle-check-DQpFq1ze.js";
import { S as ShieldCheck } from "./shield-check-D0h4MUGc.js";
import { S as Shield } from "./shield-DpmD7gDR.js";
import { E as EyeOff } from "./eye-off-C7IDmI1H.js";
import { E as Eye } from "./eye-rh9yUpxo.js";
import { T as Trash2 } from "./trash-2-Cia-aNs-.js";
import { W as WifiOff } from "./wifi-off-Bc5JcMYS.js";
import { C as Cpu } from "./cpu-Ca6st92y.js";
import { L as Link2 } from "./link-2-BGBBxZi-.js";
import { K as Key } from "./key-CIn-BP-p.js";
import { I as Image } from "./image-DhTQcW_G.js";
import { U as Upload } from "./upload-Bh_UBNDA.js";
import { C as CreditCard } from "./credit-card-ej_uUbFN.js";
import "./use-safe-clerk-YwdTw6WL.js";
import "./database-BRM0OUE2.js";
import "./shield-alert-C8T4oV9r.js";
import "./tractor-Cxn8N8za.js";
import "./index-CDU9tKoH.js";
import "./index-D6wgdV58.js";
import "./chevron-up-DmXKv5PB.js";
const __iconNode$2 = [
  ["path", { d: "m10 17 5-5-5-5", key: "1bsop3" }],
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }]
];
const LogIn = createLucideIcon("log-in", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5",
      key: "dzhfyz"
    }
  ],
  ["path", { d: "M16.5 7.5 19 5", key: "1ltcjm" }],
  [
    "path",
    {
      d: "m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5",
      key: "nfoymv"
    }
  ],
  ["path", { d: "M9 21a6 6 0 0 0-6-6", key: "1iajcf" }],
  [
    "path",
    {
      d: "M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z",
      key: "nv9zqy"
    }
  ]
];
const Satellite = createLucideIcon("satellite", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 20h.01", key: "zekei9" }],
  ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "dnpr2z" }],
  ["path", { d: "M5 12.859a10 10 0 0 1 14 0", key: "1x1e6c" }],
  ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }]
];
const Wifi = createLucideIcon("wifi", __iconNode);
const SECTORS = [
  { key: "sectorArable", label: "Arable" },
  { key: "sectorBeef", label: "Beef Cattle" },
  { key: "sectorSheep", label: "Sheep / Lamb" },
  { key: "sectorDairy", label: "Dairy" },
  { key: "sectorPigs", label: "Pigs" },
  { key: "sectorPoultry", label: "Poultry (Broilers / Turkeys)" },
  { key: "sectorEggs", label: "Eggs (Laying Flocks)" },
  { key: "sectorGoats", label: "Goats" },
  { key: "sectorEquine", label: "Equine" },
  { key: "sectorHorticulture", label: "Horticulture" },
  { key: "sectorViticulture", label: "Viticulture" },
  { key: "sectorFreshProduce", label: "Fresh Produce" },
  { key: "sectorDeer", label: "Deer / Venison" }
];
const HOLDING_TYPES = [
  { value: "owned", label: "Owner occupied" },
  { value: "tenanted", label: "Tenanted" },
  { value: "contract", label: "Contract farmed" },
  { value: "managed", label: "Managed / Share farmed" }
];
const ASSURANCE_BODIES = [
  "Acoura",
  "ADAS",
  "Control Union",
  "CERT UK",
  "NSF",
  "SGS",
  "Other"
];
function farmToFormData(farm) {
  return {
    name: farm.name || "",
    phone: farm.contactPhone || "",
    cphNumber: farm.cphNumber || "",
    sbiNumber: farm.sbiNumber || "",
    address: farm.address || "",
    postcode: farm.postcode || "",
    county: farm.county || "",
    gridReference: farm.gridReference || "",
    latitude: farm.latitude || "",
    longitude: farm.longitude || "",
    what3words: farm.what3words || "",
    emergencyContactName: farm.emergencyContactName || "",
    emergencyContactRelationship: farm.emergencyContactRelationship || "",
    emergencyContactPhone: farm.emergencyContactPhone || "",
    emergencyContactEmail: farm.emergencyContactEmail || "",
    totalAcreage: farm.totalAcreage?.toString() || "",
    totalHectares: farm.totalHectares?.toString() || "",
    redTractorId: farm.redTractorId || "",
    farmManager: farm.farmManager || "",
    holdingType: farm.holdingType || "",
    assuranceBody: farm.assuranceBody || "",
    isNvzDesignated: !!farm.isNvzDesignated,
    sectors: {
      sectorArable: !!farm.sectorArable,
      sectorBeef: !!farm.sectorBeef,
      sectorSheep: !!farm.sectorSheep,
      sectorDairy: !!farm.sectorDairy,
      sectorPigs: !!farm.sectorPigs,
      sectorPoultry: !!farm.sectorPoultry,
      sectorEggs: !!farm.sectorEggs,
      sectorGoats: !!farm.sectorGoats,
      sectorEquine: !!farm.sectorEquine,
      sectorHorticulture: !!farm.sectorHorticulture,
      sectorViticulture: !!farm.sectorViticulture,
      sectorFreshProduce: !!farm.sectorFreshProduce,
      sectorDeer: !!farm.sectorDeer
    },
    country: farm.country || "england",
    eaml2Email: farm.eaml2Email || "",
    flockMark: farm.flockMark || "",
    herdMark: farm.herdMark || "",
    pigHerdMark: farm.pigHerdMark || "",
    bcmsHoldingNumber: farm.bcmsHoldingNumber || "",
    scotEidNumber: farm.scotEidNumber || "",
    eidCymruNumber: farm.eidCymruNumber || "",
    companyNumber: farm.companyNumber || "",
    vatNumber: farm.vatNumber || "",
    bankName: farm.bankName || "",
    bankAccountName: farm.bankAccountName || "",
    bankAccountNumber: farm.bankAccountNumber || "",
    bankSortCode: farm.bankSortCode || "",
    paymentTermsDays: farm.paymentTermsDays?.toString() || "30",
    invoiceFooterText: farm.invoiceFooterText || "",
    invoiceLogoPath: farm.invoiceLogoPath || "",
    appaRef: farm.appaRef || "",
    appaRegistrationDate: farm.appaRegistrationDate || "",
    fsaWineProductionRef: farm.fsaWineProductionRef || "",
    fsaVineRegisterRef: farm.fsaVineRegisterRef || "",
    winegbMembershipNumber: farm.winegbMembershipNumber || "",
    harvestStrictStorage: !!farm.harvestStrictStorage,
    irrigationCostPerMmHa: farm.irrigationCostPerMmHa?.toString() || "",
    irrigationAbstractionSource: farm.irrigationAbstractionSource || "",
    idleBarrelDays: farm.idleBarrelDays?.toString() || "",
    approachingNeutralFills: farm.approachingNeutralFills?.toString() || ""
  };
}
function SectionHeader({ title, description }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-2 border-b border-border mb-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: description })
  ] });
}
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default", mutation }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    mutation && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation, message: "Failed — please try again." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: onConfirm, disabled: mutation?.isPending, children: confirmLabel })
    ] })
  ] }) });
}
function BcmsCredentialsCard({ farmId, bcmsHoldingNumber }) {
  const { toast } = useToast();
  const [showPass, setShowPass] = reactExports.useState(false);
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [holding, setHolding] = reactExports.useState(bcmsHoldingNumber ?? "");
  const [dirty, setDirty] = reactExports.useState(false);
  const [pendingConfirm, setPendingConfirm] = reactExports.useState(null);
  const credsQ = useQuery({
    queryKey: ["bcms-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bcms-credentials`).then((r) => r.json()),
    enabled: !!farmId
  });
  const creds = credsQ.data;
  reactExports.useEffect(() => {
    if (creds?.ctwsUsername) setUsername(creds.ctwsUsername);
    if (creds?.holdingNumber) setHolding(creds.holdingNumber);
    else if (bcmsHoldingNumber) setHolding(bcmsHoldingNumber);
  }, [creds, bcmsHoldingNumber]);
  const saveMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/bcms-credentials`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "BCMS credentials saved" });
      credsQ.refetch();
      setDirty(false);
      setPassword("");
    },
    onError: () => toast({ title: "Failed to save credentials", variant: "destructive" })
  });
  const testMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/bcms-credentials/test`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => toast({ title: d.success ? d.sandbox ? "Sandbox test passed" : "Connected to CTWS" : "Connection failed", description: d.message, variant: d.success ? "default" : "destructive" }),
    onError: () => toast({ title: "Test failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/bcms-credentials`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Credentials removed" });
      credsQ.refetch();
      setUsername("");
      setPassword("");
      setHolding(bcmsHoldingNumber ?? "");
      setPendingConfirm(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const statusBadge = () => {
    if (!creds) return null;
    if (!creds.configured) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 12 }),
      "Not configured"
    ] });
    if (creds.sandboxMode) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#fef3c7", color: "#92400e", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 12 }),
      "Sandbox mode — credentials saved"
    ] });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 12 }),
      "Live — connected to CTWS"
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SectionHeader,
      {
        title: "BCMS / CTS One-Click Submission",
        description: "Connect your CTS Web Services (CTWS) credentials to enable one-click cattle movement submission directly from the Movements register. Sandbox mode is active until BDE obtains DEFRA software vendor credentials."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: creds?.ddtsConfigured ? "#f0fdf4" : "#fffbeb", border: `1px solid ${creds?.ddtsConfigured ? "#bbf7d0" : "#fde68a"}`, borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 2 }, children: creds?.ddtsConfigured ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 15, color: "#166534" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 15, color: "#92400e" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: creds?.ddtsConfigured ? "#166534" : "#92400e", marginBottom: 2 }, children: creds?.ddtsConfigured ? "Platform live credentials active" : "Awaiting DEFRA vendor registration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }, children: creds?.ddtsConfigured ? "BDE Farm Trac is registered with DEFRA as an approved CTWS software vendor. Submissions go directly to BCMS." : "BDE has submitted a vendor registration application to DEFRA/RPA and is awaiting approval (typically 1–2 weeks). Until vendor credentials are issued, submissions simulate the full CTWS flow and log the XML payload — no cattle data is sent to BCMS. Enter your CTS credentials now so the system is ready the moment registration completes. In the meantime, continue notifying BCMS directly via BCMS Online or your existing software." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: "#374151" }, children: "Credential status:" }),
      credsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : statusBadge()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CTWS Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "nnn-nnn-nnn",
            value: username,
            onChange: (e) => {
              setUsername(e.target.value);
              setDirty(true);
            },
            className: "mt-1 font-mono"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "Your CTS Web Services username — format ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: "nnn-nnn-nnn" }),
          ". ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Different" }),
          " from your LIS portal login. Contact the APHA livestock helpline (0300 020 0301) if you don't have one."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CTWS Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: showPass ? "text" : "password",
              placeholder: creds?.configured && !dirty ? "••••••••••• (saved)" : "Enter password",
              value: password,
              onChange: (e) => {
                setPassword(e.target.value);
                setDirty(true);
              },
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: showPass ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your CTWS portal password. Stored with base64 encoding — do not share this page." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Holding Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "e.g. 32/541/0001",
            value: holding,
            onChange: (e) => {
              setHolding(e.target.value);
              setDirty(true);
            },
            className: "mt-1 font-mono"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your CPH / BCMS holding number. Pre-filled from Livestock Movement Reporting above if set." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 pb-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: saveMut.isPending || !username || !holding,
            onClick: () => saveMut.mutate({ ctwsUsername: username, ctwsPassword: password || void 0, holdingNumber: holding }),
            className: "bg-green-800 hover:bg-green-900 text-white",
            children: [
              saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14, className: "mr-1" }),
              "Save Credentials"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            disabled: testMut.isPending || !creds?.configured,
            onClick: () => testMut.mutate(),
            title: !creds?.configured ? "Save credentials first" : "Test connection to CTWS",
            children: [
              testMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 14, className: "mr-1" }),
              "Test Connection"
            ]
          }
        ),
        creds?.configured && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600 hover:text-red-700", onClick: () => setPendingConfirm({ msg: "Remove BCMS credentials for this farm?", fn: () => deleteMut.mutate() }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
      ] })
    ] }),
    creds?.lastTestedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: creds.testStatus === "ok" ? "#166534" : "#dc2626", display: "flex", alignItems: "center", gap: 6 }, children: [
      creds.testStatus === "ok" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 13 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 13 }),
      "Last test: ",
      new Date(creds.lastTestedAt).toLocaleString("en-GB"),
      " — ",
      creds.testMessage
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "0.875rem 1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#3730a3", fontWeight: 600, marginBottom: 4 }, children: "How to get your CTWS credentials" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { fontSize: "0.78rem", color: "#4338ca", paddingLeft: "1.25rem", lineHeight: 1.8, margin: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Call the APHA livestock helpline on ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "0300 020 0301" }),
          " (Mon–Fri 8:30–17:00) and ask for your CTS Web Services (CTWS) username and password."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Your CTWS username is in the format ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: "nnn-nnn-nnn" }),
          " — it is ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "not" }),
          " the same as your LIS portal login at ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://portal.livestockinformation.org.uk", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "portal.livestockinformation.org.uk" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Once saved, click "Test Connection" to verify your credentials against the BCMS test server.' })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!pendingConfirm,
        title: "Remove BCMS Credentials",
        message: pendingConfirm?.msg ?? "",
        onConfirm: () => {
          pendingConfirm?.fn();
        },
        onCancel: () => {
          setPendingConfirm(null);
          deleteMut.reset();
        },
        confirmLabel: "Remove",
        confirmVariant: "destructive",
        mutation: deleteMut
      }
    )
  ] }) });
}
function EidcymruConnectionCard({ farmId, flockNumber }) {
  const { toast } = useToast();
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [applicationName, setApplicationName] = reactExports.useState("");
  const [applicationVersion, setApplicationVersion] = reactExports.useState("");
  const [isStaging, setIsStaging] = reactExports.useState(true);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [pendingConfirm, setPendingConfirm] = reactExports.useState(false);
  const credsQ = useQuery({
    queryKey: ["eidcymru-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/eidcymru-credentials`).then(async (r) => {
      if (!r.ok) throw new Error("Could not load EIDCymru settings");
      return r.json();
    }),
    enabled: !!farmId
  });
  const creds = credsQ.data;
  reactExports.useEffect(() => {
    if (!creds) return;
    setApplicationName(creds.applicationName ?? "");
    setApplicationVersion(creds.applicationVersion ?? "");
    setIsStaging(creds.sandboxMode !== false);
  }, [creds]);
  const saveMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/eidcymru-credentials`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username || void 0,
        password: password || void 0,
        flockNumber: flockNumber ?? "",
        applicationName,
        applicationVersion,
        sandboxMode: isStaging
      })
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? "Could not save EIDCymru credentials");
      return r.json();
    }),
    onSuccess: () => {
      setPassword("");
      toast({ title: "EIDCymru credentials saved", description: `Ready to test against the ${isStaging ? "staging" : "production"} service.` });
      credsQ.refetch();
    },
    onError: (error) => toast({ title: "Could not save EIDCymru credentials", description: error instanceof Error ? error.message : void 0, variant: "destructive" })
  });
  const testMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/eidcymru-credentials/test`, { method: "POST" }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? "Connection test failed");
      return r.json();
    }),
    onSuccess: (result) => {
      toast({ title: result.success ? "EIDCymru connection verified" : "EIDCymru connection failed", description: result.message, variant: result.success ? "default" : "destructive" });
      credsQ.refetch();
    },
    onError: (error) => toast({ title: "Connection test failed", description: error instanceof Error ? error.message : void 0, variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/eidcymru-credentials`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) throw new Error("Could not remove EIDCymru credentials");
      return r.json();
    }),
    onSuccess: () => {
      setUsername("");
      setPassword("");
      setApplicationName("");
      setApplicationVersion("");
      setPendingConfirm(false);
      toast({ title: "EIDCymru credentials removed" });
      credsQ.refetch();
    },
    onError: () => toast({ title: "Could not remove EIDCymru credentials", variant: "destructive" })
  });
  const readyToSave = !!applicationName.trim() && !!applicationVersion.trim() && (!!username.trim() || !!creds?.usernameConfigured) && (!!password || !!creds?.passwordConfigured);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SectionHeader,
      {
        title: "EIDCymru Movement Reporting",
        description: "Connect this Welsh holding to EIDCymru’s current EWS service for direct sheep and goat on/off movement reporting."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 16, className: "text-blue-700 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-blue-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Per-keeper EIDCymru credentials" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-800 mt-1 leading-relaxed", children: "EIDCymru EWS uses your keeper username and password in a secure HTTPS SOAP request, together with the application name and version that EIDCymru registered for BDE Farm Trac. Passwords are encrypted at rest and are never shown again." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EIDCymru Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: username, onChange: (e) => setUsername(e.target.value), placeholder: creds?.usernameConfigured ? "Saved — enter only to change" : "EIDCymru username", className: "mt-1", autoComplete: "username" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EIDCymru Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: creds?.passwordConfigured ? "Saved — enter only to change" : "EIDCymru password", className: "pr-10", autoComplete: "new-password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPassword((value) => !value), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Registered Application Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: applicationName, onChange: (e) => setApplicationName(e.target.value), placeholder: "Exact name issued by EIDCymru", className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Version" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: applicationVersion, onChange: (e) => setApplicationVersion(e.target.value), placeholder: "e.g. 1.0", className: "mt-1 font-mono" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Service environment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: isStaging ? "Staging: sends real SOAP test requests only to stagews.eidcymru.org." : "Production: sends movement notifications to ews.eidcymru.org." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: isStaging ? "outline" : "default", size: "sm", onClick: () => setIsStaging((value) => !value), children: isStaging ? "Use production" : "Use staging" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: saveMut.isPending || !readyToSave, onClick: () => saveMut.mutate(), className: "bg-green-800 hover:bg-green-900 text-white", children: [
        saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14, className: "mr-1" }),
        " Save credentials"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: testMut.isPending || !creds?.configured, onClick: () => testMut.mutate(), children: [
        testMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 14, className: "mr-1" }),
        " Test connection"
      ] }),
      creds?.configured && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600 hover:text-red-700", onClick: () => setPendingConfirm(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }),
      creds?.configured && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium ml-1 ${creds.sandboxMode ? "text-amber-700" : "text-green-700"}`, children: creds.sandboxMode ? "Staging configured" : "Production configured" })
    ] }),
    creds?.lastTestedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs flex items-center gap-1.5 ${creds.testStatus === "ok" ? "text-green-700" : "text-red-700"}`, children: [
      creds.testStatus === "ok" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 13 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 13 }),
      "Last test: ",
      new Date(creds.lastTestedAt).toLocaleString("en-GB"),
      " — ",
      creds.testMessage
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The flock number comes from the Livestock Movement Reporting section above. EIDCymru has indicated that EWS will be replaced in future; this connection is isolated so the movements workflow can move to the replacement service without changing your ledger." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingConfirm,
        title: "Remove EIDCymru credentials",
        message: "This removes this holding’s encrypted EIDCymru login. Existing movement submission records will remain.",
        onConfirm: () => deleteMut.mutate(),
        onCancel: () => {
          setPendingConfirm(false);
          deleteMut.reset();
        },
        confirmLabel: "Remove",
        confirmVariant: "destructive",
        mutation: deleteMut
      }
    )
  ] }) });
}
function LipConnectionCard({ farmId }) {
  const { toast } = useToast();
  const credsQ = useQuery({
    queryKey: ["lip-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-credentials`).then((r) => r.json()),
    enabled: !!farmId
  });
  const creds = credsQ.data;
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("lip_connected");
    const error = params.get("lip_error");
    if (connected === "true") {
      toast({ title: "LIS Cattle account connected", description: "Your LIS sign-in was successful." });
      credsQ.refetch();
      const u = new URL(window.location.href);
      u.searchParams.delete("lip_connected");
      window.history.replaceState({}, "", u.toString());
      try {
        new BroadcastChannel("lip-connection").postMessage({ farmId, type: "connected" });
      } catch {
      }
      setTimeout(() => window.close(), 1500);
    }
    if (error) {
      toast({ title: "LIS Cattle connection failed", description: decodeURIComponent(error), variant: "destructive" });
      const u = new URL(window.location.href);
      u.searchParams.delete("lip_error");
      window.history.replaceState({}, "", u.toString());
    }
  }, []);
  reactExports.useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel("lip-connection");
      channel.onmessage = (event) => {
        if (event.data?.farmId === farmId && event.data?.type === "connected") {
          credsQ.refetch();
        }
      };
    } catch {
    }
    return () => channel?.close();
  }, [farmId]);
  const testMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/lip-credentials/test`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      toast({ title: d.success ? "LIP API reachable" : "LIP API test result", description: d.message, variant: d.success ? "default" : "destructive" });
      credsQ.refetch();
    },
    onError: () => toast({ title: "Test failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/lip-credentials`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "LIS Cattle account disconnected" });
      credsQ.refetch();
    },
    onError: () => toast({ title: "Failed to disconnect", variant: "destructive" })
  });
  const isConnected = creds?.configured;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "LIS Cattle (LIP) Integration",
          description: "LIS Cattle (LIP) API submissions are temporarily paused from 21 July 2026 while the Livestock Information Service transitions cattle traceability services. Existing records are preserved. Further guidance expected from LIS in September/October 2026."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }),
        " Paused"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, color: "#92400e", style: { marginTop: 2, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", fontWeight: 700, color: "#92400e", marginBottom: 4 }, children: "Service Temporarily Paused — Effective 21 July 2026" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#78350f", lineHeight: 1.5 }, children: [
          "The Livestock Information Service has confirmed that the LIP Cattle API and Alpha Developer Hub are pausing while cattle traceability services transition to a new service operated by Defra. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "New cattle submissions via LIP are not available at this time." }),
          " Please continue reporting cattle movements via ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BCMS (CTS Web Services)" }),
          " as usual. LIS will provide further guidance and a revised migration approach in September/October 2026 ahead of the BEID mandate in 2027."
        ] })
      ] })
    ] }),
    isConnected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 15, color: "#16a34a", style: { marginTop: 2, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: "#166534", marginBottom: 2 }, children: [
          "LIS Cattle account connected",
          creds?.sandboxMode ? " (sandbox)" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#4b7c59", lineHeight: 1.5 }, children: creds?.testMessage ?? "Your farm is linked to LIS LIP. Cattle movement notifications will be submitted via this account." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => deleteMut.mutate(),
          disabled: deleteMut.isPending,
          style: { flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" },
          children: [
            deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 11, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 11 }),
            "Disconnect"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 15, color: "#7c3aed", style: { marginTop: 2, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: "#7c3aed", marginBottom: 2 }, children: "Connect your LIS account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }, children: "LIP uses the same LIS sign-in flow as the sheep/goat/deer integration — you sign in once with your LIS credentials and BDE Farm Trac is authorised to submit cattle movements on your behalf. No password is stored." })
      ] })
    ] }),
    creds?.testStatus && creds.testStatus !== "ok" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: creds.testStatus === "partial" ? "#92400e" : "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.5rem 0.875rem" }, children: creds.testMessage }),
    creds?.lastTestedAt && creds.testStatus !== "ok" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: 5 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 11 }),
      "Last tested: ",
      new Date(creds.lastTestedAt).toLocaleString("en-GB")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          disabled: true,
          title: "LIS Cattle API sign-in is temporarily unavailable during the service transition",
          style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#e5e7eb", color: "#9ca3af", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: "0.82rem", fontWeight: 600, cursor: "not-allowed" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { size: 13 }),
            "Sign in with LIS"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => testMut.mutate(),
          disabled: testMut.isPending || credsQ.isLoading,
          style: { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "#7c3aed", border: "1px solid #ddd6fe", borderRadius: 8, padding: "7px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: testMut.isPending ? "not-allowed" : "pointer", opacity: testMut.isPending ? 0.7 : 1 },
          children: [
            testMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 12 }),
            "Test API"
          ]
        }
      )
    ] }),
    !creds?.configured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "How to connect:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { style: { margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: 4 }, children: [
        "Click Sign in with LIS — you will be taken to the official Livestock Information Service login page.",
        "Sign in with your LIS account email and password (the same credentials you use at livestockinformation.org.uk).",
        "After sign-in, LIS redirects you back here and your account is connected. No password is stored in BDE Farm Trac."
      ].map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { style: { fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }, children: item }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "What LIP will enable once the LIS service transition is complete (expected Q1 2027):" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5 }, children: [
        "One-click cattle movement notifications (replacing manual BCMS Online entry)",
        "Direct cattle birth and death registration with LIS acknowledgement",
        "Real-time herd sync — animals verified against the national cattle database",
        "Automatic movement reference numbers stored alongside your register"
      ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { style: { display: "flex", gap: 8, fontSize: "0.78rem", color: "#6b7280" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#7c3aed", fontWeight: 700, flexShrink: 0 }, children: "›" }),
        item
      ] }, item)) })
    ] })
  ] }) });
}
function LisConnectionCard({ farmId }) {
  const { toast } = useToast();
  const [pendingConfirm, setPendingConfirm] = reactExports.useState(null);
  const [syncResult, setSyncResult] = reactExports.useState(null);
  const [showDebug, setShowDebug] = reactExports.useState(false);
  const credsQ = useQuery({
    queryKey: ["lis-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-credentials`).then((r) => r.json()),
    enabled: !!farmId
  });
  const creds = credsQ.data;
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("lis_connected");
    const error = params.get("lis_error");
    if (connected === "true") {
      toast({ title: "LIS account connected", description: "Your LIS sign-in was successful." });
      credsQ.refetch();
      const u = new URL(window.location.href);
      u.searchParams.delete("lis_connected");
      window.history.replaceState({}, "", u.toString());
      setTimeout(() => window.close(), 1500);
    }
    if (error) {
      toast({ title: "LIS connection failed", description: decodeURIComponent(error), variant: "destructive" });
      const u = new URL(window.location.href);
      u.searchParams.delete("lis_error");
      window.history.replaceState({}, "", u.toString());
    }
  }, []);
  const testMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/lis-credentials/test`, { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.message ?? data?.error ?? "Test failed");
      return data;
    },
    onSuccess: (d) => {
      credsQ.refetch();
      toast({ title: d.success ? d.sandbox ? "Sandbox test passed" : "Connected to LIS" : "Connection failed", description: d.message, variant: d.success ? "default" : "destructive" });
    },
    onError: (e) => toast({ title: "Test failed", description: e?.message, variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/lis-credentials`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "LIS account disconnected" });
      credsQ.refetch();
      setPendingConfirm(null);
    },
    onError: () => toast({ title: "Failed to disconnect", variant: "destructive" })
  });
  const syncMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/lis/sync-herds`, { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.message ?? "Sync failed");
      return data;
    },
    onSuccess: (d) => {
      setSyncResult(d);
      credsQ.refetch();
      toast({ title: d.success ? "LIS sync complete" : "LIS sync returned no data", description: d.message, variant: d.success ? "default" : "destructive" });
    },
    onError: (e) => toast({ title: "Sync failed", description: e?.message, variant: "destructive" })
  });
  const handleSignIn = async () => {
    const returnUrl = window.location.href.split("?")[0];
    try {
      const r = await fetch(`/api/lis/authorize?farmId=${farmId}&returnUrl=${encodeURIComponent(returnUrl)}`, {
        headers: { Accept: "application/json" }
      });
      const data = await r.json();
      if (!r.ok || !data.url) throw new Error(data?.error ?? "Failed to start LIS sign-in");
      window.open(data.url, "_blank", "noopener");
    } catch (e) {
      toast({ title: "LIS sign-in failed", description: e?.message, variant: "destructive" });
    }
  };
  const statusBadge = () => {
    if (!creds) return null;
    if (!creds.configured) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 12 }),
      "Not connected"
    ] });
    if (creds.sandboxMode) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 12 }),
      "Sandbox mode — signed in"
    ] });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 12 }),
      "Connected to LIS"
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SectionHeader,
      {
        title: "LIS / Livestock Information Service",
        description: "Connect your Livestock Information Service (LIS) account to enable one-click sheep, goat, pig and deer movement submission directly from the Movements register. LIS is the England government platform replacing eAML2 for sheep, goat, pig and deer movement reporting."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: creds?.subscriptionKeyConfigured ? "#f0fdf4" : "#eff6ff", border: `1px solid ${creds?.subscriptionKeyConfigured ? "#bbf7d0" : "#bfdbfe"}`, borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 2 }, children: creds?.subscriptionKeyConfigured ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 15, color: "#166534" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 15, color: "#1d4ed8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: creds?.subscriptionKeyConfigured ? "#166534" : "#1d4ed8", marginBottom: 2 }, children: creds?.subscriptionKeyConfigured ? "Platform subscription key active" : "Sandbox mode active" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }, children: creds?.subscriptionKeyConfigured ? "BDE Farm Trac has a registered LIS Developer Hub subscription key. Submissions go directly to the Livestock Information Service." : "A LIS Developer Hub subscription key has not yet been configured by BDE. Submissions will simulate the full CLA API flow and log the JSON payload — no data will be sent to LIS." })
      ] })
    ] }),
    creds?.configured && creds?.tokenScopeMismatch && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 2, flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, color: "#92400e" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }, children: "Re-authorisation required — LIS production is now live" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#78350f", lineHeight: 1.5, marginBottom: 8 }, children: [
          "Your LIS account was connected under the sandbox environment. BDE Farm Trac now submits to the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "production" }),
          " Livestock Information Service and your existing sign-in needs to be refreshed. Click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Re-sign in with LIS" }),
          " below to complete the one-click re-authorisation — it only takes a few seconds and no movements will be lost."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleSignIn,
            style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#f59e0b", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: "0.78rem", fontWeight: 700, color: "#fff", cursor: "pointer" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 13 }),
              "Re-sign in with LIS"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: "#374151" }, children: "Connection:" }),
        credsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : statusBadge()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSignIn, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 14, className: "mr-1.5" }),
          creds?.configured ? "Re-sign in with LIS" : "Sign in with LIS"
        ] }),
        creds?.configured && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: testMut.isPending, onClick: () => testMut.mutate(), children: [
            testMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 14, className: "mr-1" }),
            "Test Connection"
          ] }),
          creds?.testStatus === "ok" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: syncMut.isPending, onClick: () => syncMut.mutate(), children: [
            syncMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14, className: "mr-1" }),
            "Sync from LIS"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600 hover:text-red-700", onClick: () => setPendingConfirm({ msg: "Disconnect LIS account for this farm? You can reconnect at any time.", fn: () => deleteMut.mutate() }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
        ] })
      ] })
    ] }),
    !creds?.configured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.875rem 1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "How sign-in works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { fontSize: "0.78rem", color: "#4b5563", paddingLeft: "1.25rem", lineHeight: 1.8, margin: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sign in with LIS" }),
          " — you will be taken to the official Livestock Information Service login page."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Sign in with your LIS account email and password (the same credentials you use at ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://cla.livestockinformation.org.uk", target: "_blank", rel: "noopener noreferrer", className: "underline text-blue-600", children: "cla.livestockinformation.org.uk" }),
          ")."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "After sign-in, LIS redirects you back here and your account is connected. No password is stored in BDE Farm Trac." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }, children: [
        "Don't have a LIS account? Register free at ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://cla.livestockinformation.org.uk", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "cla.livestockinformation.org.uk" }),
        "."
      ] })
    ] }),
    creds?.lastTestedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: creds.testStatus === "ok" ? "#166534" : "#dc2626", display: "flex", alignItems: "center", gap: 6 }, children: [
      creds.testStatus === "ok" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 13 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 13 }),
      "Last test: ",
      new Date(creds.lastTestedAt).toLocaleString("en-GB"),
      " — ",
      creds.testMessage
    ] }),
    creds?.lisLastSyncedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: "#374151", display: "flex", alignItems: "flex-start", gap: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13, style: { color: "#6b7280", flexShrink: 0, marginTop: 2 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: "Last synced:" }),
        " ",
        new Date(creds.lisLastSyncedAt).toLocaleString("en-GB"),
        creds.lisLastSyncSummary ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
          " — ",
          creds.lisLastSyncSummary
        ] }) : null
      ] })
    ] }),
    Array.isArray(creds?.lisSyncHistory) && creds.lisSyncHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { style: { fontSize: "0.78rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { style: { cursor: "pointer", color: "#6b7280", userSelect: "none", listStyle: "none", display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem" }, children: "▸" }),
        "Sync history (",
        creds.lisSyncHistory.length,
        " ",
        creds.lisSyncHistory.length === 1 ? "entry" : "entries",
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 6, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: creds.lisSyncHistory.slice(0, 10).map((entry, i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "6px 10px", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", gap: 8, alignItems: "flex-start" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { flexShrink: 0, fontWeight: 700, color: entry.cphValid === true ? "#16a34a" : entry.cphValid === false ? "#dc2626" : "#6b7280" }, children: entry.cphValid === true ? "✓" : entry.cphValid === false ? "✗" : "○" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#374151", fontWeight: 500 }, children: new Date(entry.syncedAt).toLocaleString("en-GB") }),
          " — ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280" }, children: entry.summary }),
          entry.imported && entry.imported.approved + entry.imported.transfers + entry.imported.reviews > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 6, color: "#0369a1", fontSize: "0.72rem" }, children: [
            "(",
            [
              entry.imported.approved > 0 ? `${entry.imported.approved} approved` : null,
              entry.imported.transfers > 0 ? `${entry.imported.transfers} transfer${entry.imported.transfers !== 1 ? "s" : ""}` : null,
              entry.imported.reviews > 0 ? `${entry.imported.reviews} review${entry.imported.reviews !== 1 ? "s" : ""}` : null
            ].filter(Boolean).join(", "),
            ")"
          ] })
        ] })
      ] }, i)) })
    ] }),
    syncResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: `1px solid ${syncResult.success ? "#bbf7d0" : "#fecaca"}`, borderRadius: 10, padding: "0.875rem 1rem", background: syncResult.success ? "#f0fdf4" : "#fef2f2" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.82rem", fontWeight: 600, color: syncResult.success ? "#166534" : "#dc2626" }, children: [
          syncResult.success ? "✓ " : "✗ ",
          syncResult.message
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowDebug(!showDebug),
            style: { fontSize: "0.72rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", flexShrink: 0 },
            children: [
              showDebug ? "Hide" : "Show",
              " API debug"
            ]
          }
        )
      ] }),
      syncResult.success && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" }, children: [
        syncResult.cphValid != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: syncResult.cphValid ? "#dcfce7" : "#fee2e2", borderRadius: 6, padding: "4px 10px", fontSize: "0.76rem", color: syncResult.cphValid ? "#166534" : "#dc2626", fontWeight: 600 }, children: [
          syncResult.cphValid ? "✓" : "✗",
          " CPH ",
          syncResult.cphNumber,
          " — ",
          syncResult.cphValid ? "Registered in LIS" : "Not recognised by LIS"
        ] }),
        syncResult.pendingReviews.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", borderRadius: 6, padding: "4px 10px", fontSize: "0.76rem", color: "#92400e", fontWeight: 600 }, children: [
          "⚠ ",
          syncResult.pendingReviews.length,
          " movement(s) awaiting review"
        ] }),
        syncResult.recentTransfers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", borderRadius: 6, padding: "4px 10px", fontSize: "0.76rem", color: "#1e40af" }, children: [
          syncResult.recentTransfers.length,
          " recent transfer request(s)"
        ] }),
        syncResult.approvedMovements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f9ff", borderRadius: 6, padding: "4px 10px", fontSize: "0.76rem", color: "#0369a1" }, children: [
          syncResult.approvedMovements.length,
          " approved movement(s)"
        ] })
      ] }),
      showDebug && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 10, background: "#1e293b", borderRadius: 6, padding: "0.75rem", overflowX: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#94a3b8", marginBottom: 6, fontWeight: 600 }, children: "API endpoint attempts" }),
        Object.entries(syncResult.attempts).map(([path, result]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", fontFamily: "monospace", color: result.ok ? "#4ade80" : result.error ? "#f87171" : "#fbbf24", marginBottom: 2 }, children: [
            result.ok ? "✓" : result.error ? "✗" : "○",
            " ",
            path,
            " ",
            result.status ? `HTTP ${result.status}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { style: { fontSize: "0.68rem", color: "#cbd5e1", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: JSON.stringify(result.data ?? result.error, null, 2).slice(0, 800) })
        ] }, path))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "0.875rem 1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#1d4ed8", fontWeight: 600, marginBottom: 4 }, children: "How to get your LIS credentials & how to go live" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { fontSize: "0.78rem", color: "#1e40af", paddingLeft: "1.25rem", lineHeight: 1.8, margin: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Register or sign in at ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://cla.livestockinformation.org.uk", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "cla.livestockinformation.org.uk" }),
          " using your email address."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Enter your LIS username (email) and password above and click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Save Credentials" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Test Connection" }),
          " to verify — in sandbox mode this simulates a successful connection."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Once connected, a blue ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Test Submit (LIS)" }),
          " button will appear on each sheep, goat, pig and deer movement row in the Movements register."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "For live submissions: BDE must register on the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://livestockinformation.org.uk/developer-hub/", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "LIS Developer Hub" }),
          " and set the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: "LIS_SUBSCRIPTION_KEY" }),
          " environment variable. Submissions then go directly to LIS automatically."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!pendingConfirm,
        title: "Remove LIS Credentials",
        message: pendingConfirm?.msg ?? "",
        onConfirm: () => {
          pendingConfirm?.fn();
        },
        onCancel: () => {
          setPendingConfirm(null);
          deleteMut.reset();
        },
        confirmLabel: "Remove",
        confirmVariant: "destructive",
        mutation: deleteMut
      }
    )
  ] }) });
}
const PAYMENT_TERMS_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "21", label: "21 days" },
  { value: "30", label: "30 days" },
  { value: "45", label: "45 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" }
];
const GPS_PROVIDER_META = {
  teltonika: {
    label: "Teltonika RMS",
    logo: "T",
    type: "oauth_active",
    description: "Connect your Teltonika RMS fleet account via OAuth. Live positions polled every 5 minutes from all linked devices."
  },
  samsara: {
    label: "Samsara",
    logo: "S",
    type: "apikey",
    description: "Connect your Samsara fleet account via API key. Vehicle positions update via Samsara webhooks."
  },
  webfleet: {
    label: "Webfleet (TomTom)",
    logo: "W",
    type: "credentials",
    description: "Connect using your Webfleet account credentials. Requires a Webfleet subscription with API access."
  },
  john_deere: {
    label: "John Deere Operations Center",
    logo: "JD",
    type: "oauth_active",
    description: "Sync positions from John Deere machines with JDLink telematics via Operations Center."
  },
  agco: {
    label: "AGCO Connect (Fendt / MF)",
    logo: "AG",
    type: "oauth",
    description: "Sync positions from Fendt, Massey Ferguson, Valtra and Challenger machines via AGCO Fuse telematics. Requires a direct API agreement with AGCO."
  }
};
function GpsIntegrationCard({ farmId }) {
  const { toast } = useToast();
  const [expandedProvider, setExpandedProvider] = reactExports.useState(null);
  const [apiKeyInputs, setApiKeyInputs] = reactExports.useState({});
  const [showKey, setShowKey] = reactExports.useState({});
  const [saving, setSaving] = reactExports.useState(null);
  const [removing, setRemoving] = reactExports.useState(null);
  const [wfCreds, setWfCreds] = reactExports.useState({ account: "", username: "", password: "", apiKey: "" });
  const [showWfPass, setShowWfPass] = reactExports.useState(false);
  const integrationsQ = useQuery({
    queryKey: ["gps-integrations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/gps-integrations`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const integrationsByProvider = Object.fromEntries(
    (integrationsQ.data?.integrations ?? []).map((i) => [i.provider, i])
  );
  const webhookBaseUrl = typeof window !== "undefined" ? `${window.location.origin}/api/farms/${farmId}/gps/webhook` : `/api/farms/${farmId}/gps/webhook`;
  async function saveApiKey(provider) {
    const apiKey = apiKeyInputs[provider] ?? "";
    if (!apiKey.trim()) return;
    setSaving(provider);
    try {
      const r = await fetch(`/api/farms/${farmId}/gps-integrations/${provider}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "GPS integration saved", description: `${GPS_PROVIDER_META[provider]?.label} connected.` });
      setApiKeyInputs((p) => ({ ...p, [provider]: "" }));
      integrationsQ.refetch();
    } catch {
      toast({ title: "Save failed", description: "Could not save API key.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }
  async function saveWebfleetCreds() {
    if (!wfCreds.account.trim() || !wfCreds.username.trim() || !wfCreds.password.trim() || !wfCreds.apiKey.trim()) return;
    setSaving("webfleet");
    try {
      const r = await fetch(`/api/farms/${farmId}/gps-integrations/webfleet/credentials`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wfCreds)
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "Webfleet connected", description: "Credentials saved — vehicles will appear on the map within 5 minutes." });
      setWfCreds({ account: "", username: "", password: "", apiKey: "" });
      integrationsQ.refetch();
    } catch {
      toast({ title: "Save failed", description: "Could not save Webfleet credentials.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }
  async function removeIntegration(provider) {
    setRemoving(provider);
    try {
      await fetch(`/api/farms/${farmId}/gps-integrations/${provider}`, {
        method: "DELETE",
        credentials: "include"
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      toast({ title: "GPS integration removed" });
      integrationsQ.refetch();
    } catch {
      toast({ title: "Remove failed", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Satellite, { size: 20, className: "text-blue-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-base", children: "GPS Tracking Integration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Connect vehicle and plant GPS tracking providers to show live asset positions on the Resource Map. Each holding can use one or more providers simultaneously." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Object.entries(GPS_PROVIDER_META).map(([provider, meta]) => {
      const existing = integrationsByProvider[provider];
      const connected = existing?.status === "connected";
      const isExpanded = expandedProvider === provider;
      const isOAuth = meta.type === "oauth";
      const isOAuthActive = meta.type === "oauth_active";
      const isCredentials = meta.type === "credentials";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border transition-colors ${connected ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: "w-full flex items-center gap-3 p-4 text-left",
            onClick: () => setExpandedProvider(isExpanded ? null : provider),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`, children: meta.logo }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: meta.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: meta.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 10 }),
                  " Connected"
                ] }) : isOAuth ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full", children: "Pending registration" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 10 }),
                  " Not configured"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: `w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })
              ] })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4 border-t border-gray-100 pt-4 space-y-4", children: isOAuthActive ? (
          /* ── Active OAuth providers (Teltonika, John Deere, …) ── */
          connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 15, className: "text-green-600 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-green-900", children: [
                  "Connected to ",
                  meta.label
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-0.5", children: existing?.last_sync_at ? `Last sync: ${new Date(existing.last_sync_at).toLocaleString("en-GB")}` : "Waiting for first poll (runs every 5 minutes)" }),
                existing?.tokenExpiresAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 mt-0.5", children: [
                  "Token valid until: ",
                  new Date(existing.tokenExpiresAt).toLocaleString("en-GB")
                ] })
              ] })
            ] }),
            existing?.last_error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 12, className: "shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: existing.last_error })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-gray-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Positions polled every 5 minutes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "text-red-600 hover:text-red-700 h-7 text-xs",
                  onClick: () => removeIntegration(provider),
                  disabled: removing === provider,
                  children: [
                    removing === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12, className: "mr-1" }),
                    "Disconnect"
                  ]
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 15, className: "text-blue-600 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-blue-900", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-1", children: [
                  "Connect your ",
                  meta.label,
                  " account"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-800", children: "Click the button below to sign in and authorise BDE Farm Trac to read your machine list and live positions. You'll be redirected back here automatically." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                className: "w-full bg-blue-600 hover:bg-blue-700 text-white gap-2",
                onClick: () => {
                  window.location.href = `/api/gps/${provider}/authorize?farmId=${farmId}`;
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 14 }),
                  "Connect with ",
                  meta.label
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Scopes requested:" }),
              provider === "teltonika" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-gray-100 px-1 rounded", children: "devices:read" }),
                  " — list your devices"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-gray-100 px-1 rounded", children: "device_location:read" }),
                  " — read live GPS positions"
                ] })
              ] }),
              provider === "john_deere" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-gray-100 px-1 rounded", children: "ag1" }),
                  " — read your Operations Center account"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-gray-100 px-1 rounded", children: "eq1" }),
                  " — read machine list and GPS positions"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-gray-100 px-1 rounded", children: "offline_access" }),
                  " — keep the connection active"
                ] })
              ] })
            ] })
          ] })
        ) : isCredentials ? (
          /* ── Webfleet — 3-field credential form ── */
          connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 15, className: "text-green-600 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-green-900", children: "Connected to Webfleet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-0.5", children: existing?.last_sync_at ? `Last sync: ${new Date(existing.last_sync_at).toLocaleString("en-GB")}` : "Waiting for first poll (runs every 5 minutes)" })
              ] })
            ] }),
            existing?.last_error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 12, className: "shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: existing.last_error })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-gray-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Positions polled every 5 minutes via Webfleet.connect" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "text-red-600 hover:text-red-700 h-7 text-xs",
                  onClick: () => removeIntegration(provider),
                  disabled: removing === provider,
                  children: [
                    removing === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12, className: "mr-1" }),
                    "Disconnect"
                  ]
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { size: 15, className: "text-blue-600 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-blue-900", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Enter your Webfleet account credentials" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-800", children: "Use the same account name, username and password you log in to Webfleet with. Your credentials are stored encrypted and never shared." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Webfleet Account Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g. mycompany",
                  value: wfCreds.account,
                  onChange: (e) => setWfCreds((p) => ({ ...p, account: e.target.value })),
                  className: "text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Username" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Webfleet username",
                  value: wfCreds.username,
                  onChange: (e) => setWfCreds((p) => ({ ...p, username: e.target.value })),
                  className: "text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: showWfPass ? "text" : "password",
                    placeholder: "Webfleet password",
                    value: wfCreds.password,
                    onChange: (e) => setWfCreds((p) => ({ ...p, password: e.target.value })),
                    className: "text-sm pr-9"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                    onClick: () => setShowWfPass((p) => !p),
                    children: showWfPass ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Webfleet API Key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Your fleet API key from Webfleet",
                  value: wfCreds.apiKey,
                  onChange: (e) => setWfCreds((p) => ({ ...p, apiKey: e.target.value })),
                  className: "text-sm font-mono"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                "Find this in your Webfleet account under ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Tools → Webfleet Integration → API key" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                className: "w-full gap-2",
                onClick: saveWebfleetCreds,
                disabled: saving === "webfleet" || !wfCreds.account.trim() || !wfCreds.username.trim() || !wfCreds.password.trim() || !wfCreds.apiKey.trim(),
                children: [
                  saving === "webfleet" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14 }),
                  "Save & Connect Webfleet"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Requires a Webfleet subscription with API access enabled. Contact your Webfleet account manager if API access is not available on your plan." })
          ] })
        ) : isOAuth ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 15, className: "text-amber-600 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-amber-900", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Developer registration required" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
              provider === "john_deere" && "Apply at developer.deere.com — John Deere API access requires a formal application review (typically 2–4 weeks). OAuth connection will appear here once approved.",
              provider === "agco" && "Apply via the AGCO Connect developer programme — approval typically takes 2–4 weeks. OAuth connection will appear here once issued."
            ] }),
            existing?.last_sync_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-2 text-amber-700", children: [
              "Last sync: ",
              new Date(existing.last_sync_at).toLocaleString("en-GB")
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: `gps-apikey-${provider}`, className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { size: 12 }),
              provider === "teltonika" ? "Teltonika Cloud API Key" : "Samsara API Token"
            ] }),
            connected && !apiKeyInputs[provider] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1.5 p-2.5 bg-green-50 border border-green-200 rounded-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14, className: "text-green-600 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-800 font-medium", children: "API key is saved and encrypted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "ml-auto text-xs h-7 text-green-700 hover:text-green-800",
                  onClick: () => setApiKeyInputs((p) => ({ ...p, [provider]: " " })),
                  children: "Replace"
                }
              )
            ] }),
            (!connected || apiKeyInputs[provider] !== void 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: `gps-apikey-${provider}`,
                    type: showKey[provider] ? "text" : "password",
                    className: "pr-9 font-mono text-sm",
                    placeholder: provider === "samsara" ? "samsara_api_XXXXXXXXX" : "Enter API key...",
                    value: apiKeyInputs[provider] ?? "",
                    onChange: (e) => setApiKeyInputs((p) => ({ ...p, [provider]: e.target.value }))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                    onClick: () => setShowKey((p) => ({ ...p, [provider]: !p[provider] })),
                    children: showKey[provider] ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  onClick: () => saveApiKey(provider),
                  disabled: saving === provider || !(apiKeyInputs[provider] ?? "").trim(),
                  children: [
                    saving === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1", children: "Save" })
                  ]
                }
              )
            ] })
          ] }),
          provider === "teltonika" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5 mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12 }),
              "Webhook URL — paste into Teltonika RMS"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-md font-mono text-xs text-gray-700 break-all", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
                webhookBaseUrl,
                "/teltonika"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "shrink-0 text-gray-400 hover:text-gray-700",
                  onClick: () => {
                    navigator.clipboard.writeText(`${webhookBaseUrl}/teltonika`);
                    toast({ title: "Copied to clipboard" });
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 13 })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1.5", children: [
              "In Teltonika RMS: open your device → Configuration → Codec → HTTP posting → paste this URL. Set ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-gray-100 px-1 rounded", children: "Content-Type: application/json" }),
              " and POST method."
            ] })
          ] }),
          provider === "samsara" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5 mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12 }),
              "Samsara Webhook URL"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-md font-mono text-xs text-gray-700 break-all", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
                webhookBaseUrl,
                "/samsara"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "shrink-0 text-gray-400 hover:text-gray-700",
                  onClick: () => {
                    navigator.clipboard.writeText(`${webhookBaseUrl}/samsara`);
                    toast({ title: "Copied to clipboard" });
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 13 })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1.5", children: [
              "In the Samsara Cloud developer portal: go to Webhooks → Add Webhook → paste this URL, select ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-gray-100 px-1 rounded", children: "Vehicle Location" }),
              " events."
            ] })
          ] }),
          connected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-gray-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: existing?.last_sync_at ? `Last data received: ${new Date(existing.last_sync_at).toLocaleString("en-GB")}` : "No data received yet — waiting for first position update" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "text-red-600 hover:text-red-700 h-7 text-xs",
                onClick: () => removeIntegration(provider),
                disabled: removing === provider,
                children: [
                  removing === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12, className: "mr-1" }),
                  "Remove"
                ]
              }
            )
          ] })
        ] }) })
      ] }, provider);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 15, className: "text-blue-600 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Multiple providers can be active simultaneously" }),
        " — a JD tractor via the OEM API, a Land Rover via Teltonika, and a hired machine via Samsara will all appear as separate pins on the Resource Map. Positions update in real-time via webhook."
      ] })
    ] })
  ] }) });
}
const SENSOR_PROVIDER_META = {
  fieldclimate: {
    label: "FieldClimate (Pessl/METOS)",
    logo: "FC",
    type: "two_keys",
    key1Label: "Public Key",
    key1Placeholder: "Your FieldClimate public key",
    key2Label: "Private Key",
    key2Placeholder: "Your FieldClimate private key",
    description: "Covers soil sensors and weather stations. Very common in UK/EU commercial farming.",
    helpText: "Find your API credentials in FieldClimate → Settings → API. Both the Public Key and Private Key are required."
  },
  davis: {
    label: "Davis WeatherLink",
    logo: "DW",
    type: "two_keys",
    key1Label: "API Key",
    key1Placeholder: "Your WeatherLink API key",
    key2Label: "API Secret",
    key2Placeholder: "Your WeatherLink API secret",
    description: "Davis weather stations via WeatherLink Live hub. Popular standalone weather station brand.",
    helpText: "Log in to weatherlink.com → My Account → API Keys to generate your API Key and Secret."
  },
  zentra: {
    label: "METER ZENTRA Cloud",
    logo: "ZC",
    type: "one_token",
    key1Label: "API Token",
    key1Placeholder: "Your ZENTRA Cloud API token",
    description: "METER/Decagon soil sensors — the standard in research-grade UK soil monitoring.",
    helpText: "In ZENTRA Cloud: Settings → API Access → Generate Token. Copy the token here."
  },
  sencrop: {
    label: "Sencrop",
    logo: "SC",
    type: "oauth_active",
    key1Label: "",
    key1Placeholder: "",
    description: "Agricultural weather sensor network with strong UK presence. Measures rainfall, temperature, wind and leaf wetness.",
    helpText: "Click Connect to authorise BDE Farm Trac to read your Sencrop station data."
  }
};
function SensorIntegrationCard({ farmId }) {
  const { toast } = useToast();
  const [expandedProvider, setExpandedProvider] = reactExports.useState(null);
  const [key1, setKey1] = reactExports.useState({});
  const [key2, setKey2] = reactExports.useState({});
  const [showKey1, setShowKey1] = reactExports.useState({});
  const [showKey2, setShowKey2] = reactExports.useState({});
  const [saving, setSaving] = reactExports.useState(null);
  const [syncing, setSyncing] = reactExports.useState(null);
  const [removing, setRemoving] = reactExports.useState(null);
  const integrationsQ = useQuery({
    queryKey: ["sensor-integrations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sensor-integrations`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const integrationsByProvider = Object.fromEntries(
    (integrationsQ.data?.integrations ?? []).map((i) => [i.provider, i])
  );
  async function saveCredentials(provider) {
    const meta = SENSOR_PROVIDER_META[provider];
    if (!meta) return;
    const k1 = (key1[provider] ?? "").trim();
    const k2 = (key2[provider] ?? "").trim();
    if (!k1) return;
    if (meta.type === "two_keys" && !k2) return;
    setSaving(provider);
    try {
      let body = {};
      if (provider === "fieldclimate") body = { publicKey: k1, privateKey: k2 };
      else if (provider === "davis") body = { apiKey: k1, apiSecret: k2 };
      else if (provider === "zentra") body = { apiToken: k1 };
      const r = await fetch(`/api/farms/${farmId}/sensor-integrations/${provider}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "Integration saved", description: `${meta.label} connected.` });
      setKey1((p) => ({ ...p, [provider]: "" }));
      setKey2((p) => ({ ...p, [provider]: "" }));
      integrationsQ.refetch();
    } catch {
      toast({ title: "Save failed", description: "Could not save credentials.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }
  async function triggerSync(provider) {
    setSyncing(provider);
    try {
      const r = await fetch(`/api/farms/${farmId}/sensor-integrations/${provider}/sync`, {
        method: "POST",
        credentials: "include"
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "Sync triggered", description: "Latest readings are being fetched." });
      setTimeout(() => integrationsQ.refetch(), 3e3);
    } catch {
      toast({ title: "Sync failed", variant: "destructive" });
    } finally {
      setSyncing(null);
    }
  }
  async function removeIntegration(provider) {
    setRemoving(provider);
    try {
      await fetch(`/api/farms/${farmId}/sensor-integrations/${provider}`, {
        method: "DELETE",
        credentials: "include"
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      toast({ title: "Integration removed" });
      integrationsQ.refetch();
    } catch {
      toast({ title: "Remove failed", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 20, className: "text-emerald-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-base", children: "Soil Sensors & Weather Station Integration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Connect third-party sensor platforms to pull soil moisture, temperature, and weather readings automatically every 30 minutes. Readings feed into the Soil Management module." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Object.entries(SENSOR_PROVIDER_META).map(([provider, meta]) => {
      const existing = integrationsByProvider[provider];
      const connected = existing?.status === "connected";
      const isExpanded = expandedProvider === provider;
      const isOAuth = meta.type === "oauth_active";
      const isTwoKeys = meta.type === "two_keys";
      const hasExistingKey1 = existing?.hasApiKey ?? false;
      const hasExistingKey2 = existing?.hasApiKey2 ?? false;
      existing?.hasAccessToken ?? false;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border transition-colors ${connected ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: "w-full flex items-center gap-3 p-4 text-left",
            onClick: () => setExpandedProvider(isExpanded ? null : provider),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`, children: meta.logo }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: meta.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: meta.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 10 }),
                  " Connected"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 10 }),
                  " Not configured"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: `w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })
              ] })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4 border-t border-gray-100 pt-4 space-y-4", children: isOAuth ? connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 15, className: "text-green-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-green-900", children: [
                "Connected to ",
                meta.label
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-0.5", children: existing?.lastSyncAt ? `Last sync: ${new Date(existing.lastSyncAt).toLocaleString("en-GB")}` : "Waiting for first poll (runs every 30 minutes)" }),
              existing?.tokenExpiresAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 mt-0.5", children: [
                "Token valid until: ",
                new Date(existing.tokenExpiresAt).toLocaleString("en-GB")
              ] })
            ] })
          ] }),
          existing?.lastError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 12, className: "shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: existing.lastError })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-gray-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "h-7 text-xs gap-1",
                onClick: () => triggerSync(provider),
                disabled: syncing === provider,
                children: [
                  syncing === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 12 }),
                  "Sync now"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "text-red-600 hover:text-red-700 h-7 text-xs",
                onClick: () => removeIntegration(provider),
                disabled: removing === provider,
                children: [
                  removing === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12, className: "mr-1" }),
                  "Disconnect"
                ]
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 15, className: "text-blue-600 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-blue-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-1", children: [
                "Connect your ",
                meta.label,
                " account"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-800", children: meta.helpText })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              className: "w-full bg-blue-600 hover:bg-blue-700 text-white gap-2",
              onClick: () => {
                window.location.href = `/api/sensors/${provider}/authorize?farmId=${farmId}`;
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 14 }),
                "Connect with ",
                meta.label
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Requires an approved Sencrop partner account. Contact ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "hello@sencrop.com" }),
            " to request developer access."
          ] })
        ] }) : (
          /* Credential-based providers (FieldClimate, Davis, ZENTRA) */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { size: 15, className: "text-blue-600 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-800", children: meta.helpText })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs mb-1 block flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { size: 11 }),
                meta.key1Label
              ] }),
              connected && hasExistingKey1 && !key1[provider] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14, className: "text-green-600 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-800 font-medium", children: [
                  meta.key1Label,
                  " saved & encrypted"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "ml-auto text-xs h-7 text-green-700 hover:text-green-800",
                    onClick: () => setKey1((p) => ({ ...p, [provider]: " " })),
                    children: "Replace"
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: showKey1[provider] ? "text" : "password",
                    className: "pr-9 font-mono text-sm",
                    placeholder: meta.key1Placeholder,
                    value: key1[provider] ?? "",
                    onChange: (e) => setKey1((p) => ({ ...p, [provider]: e.target.value }))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                    onClick: () => setShowKey1((p) => ({ ...p, [provider]: !p[provider] })),
                    children: showKey1[provider] ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 })
                  }
                )
              ] })
            ] }),
            isTwoKeys && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs mb-1 block flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { size: 11 }),
                meta.key2Label
              ] }),
              connected && hasExistingKey2 && !key2[provider] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14, className: "text-green-600 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-800 font-medium", children: [
                  meta.key2Label,
                  " saved & encrypted"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "ml-auto text-xs h-7 text-green-700 hover:text-green-800",
                    onClick: () => setKey2((p) => ({ ...p, [provider]: " " })),
                    children: "Replace"
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: showKey2[provider] ? "text" : "password",
                    className: "pr-9 font-mono text-sm",
                    placeholder: meta.key2Placeholder ?? "",
                    value: key2[provider] ?? "",
                    onChange: (e) => setKey2((p) => ({ ...p, [provider]: e.target.value }))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                    onClick: () => setShowKey2((p) => ({ ...p, [provider]: !p[provider] })),
                    children: showKey2[provider] ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                className: "w-full gap-2",
                onClick: () => saveCredentials(provider),
                disabled: saving === provider || !(key1[provider] ?? "").trim() || isTwoKeys && !(key2[provider] ?? "").trim(),
                children: [
                  saving === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14 }),
                  "Save & Connect ",
                  meta.label
                ]
              }
            ),
            connected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-gray-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: existing?.lastSyncAt ? `Last sync: ${new Date(existing.lastSyncAt).toLocaleString("en-GB")}` : "Waiting for first poll (runs every 30 minutes)" }),
                existing?.lastError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-0.5", children: existing.lastError })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-7 text-xs gap-1",
                    onClick: () => triggerSync(provider),
                    disabled: syncing === provider,
                    children: [
                      syncing === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 12 }),
                      "Sync now"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "text-red-600 hover:text-red-700 h-7 text-xs",
                    onClick: () => removeIntegration(provider),
                    disabled: removing === provider,
                    children: [
                      removing === provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12, className: "mr-1" }),
                      "Disconnect"
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ) })
      ] }, provider);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 15, className: "text-emerald-600 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-emerald-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Multiple providers can be active simultaneously" }),
        " — a FieldClimate weather station, METER soil probes, and a Davis rain gauge will all sync readings independently. Data appears in the Soil Management module under each sensor's station name."
      ] })
    ] })
  ] }) });
}
function InvoicingCard({
  farmId,
  formData,
  updateField,
  onLogoPathChange
}) {
  const { toast } = useToast();
  const { uploadFile } = useUpload();
  const fileInputRef = reactExports.useRef(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (formData.invoiceLogoPath) {
      setLogoPreviewUrl(`/api/storage/objects/${formData.invoiceLogoPath}`);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [formData.invoiceLogoPath]);
  const handleLogoUpload = async (file) => {
    if (!farmId) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Logo too large", description: "Maximum file size is 2 MB.", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload a PNG, JPG or WebP image.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (!response?.objectPath) throw new Error("Upload failed");
      onLogoPathChange(response.objectPath);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreviewUrl(objectUrl);
      toast({ title: "Logo uploaded" });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload logo. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };
  const handleRemoveLogo = () => {
    onLogoPathChange("");
    setLogoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast({ title: "Logo removed", description: "Save changes to apply." });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SectionHeader,
      {
        title: "Invoicing & Documents",
        description: "Business information, bank details and branding that appear on invoices, agreements and other printed documents."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 14 }),
        " Farm Logo"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "Appears at the top of printed invoices and documents. Recommended: PNG or JPG, landscape format, max 2 MB." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        logoPreviewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative border border-border rounded-lg p-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: logoPreviewUrl,
              alt: "Invoice logo preview",
              className: "max-w-[200px] max-h-[70px] object-contain"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleRemoveLogo,
              className: "absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 })
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors",
            style: { minWidth: 200 },
            onClick: () => fileInputRef.current?.click(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 20, className: "mx-auto text-muted-foreground mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Click to upload logo" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              disabled: uploading,
              onClick: () => fileInputRef.current?.click(),
              className: "gap-1.5",
              children: [
                uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 13 }),
                logoPreviewUrl ? "Replace Logo" : "Upload Logo"
              ]
            }
          ),
          logoPreviewUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: handleRemoveLogo, className: "gap-1.5 text-destructive hover:text-destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13 }),
            "Remove"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "image/png,image/jpeg,image/webp",
          className: "hidden",
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) handleLogoUpload(f);
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 14 }),
        " Company Details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-company-number", children: "Companies House Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "inv-company-number",
              className: "mt-1",
              placeholder: "e.g. 12345678",
              value: formData.companyNumber,
              onChange: (e) => updateField("companyNumber", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "8-digit Companies House registration number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-vat-number", children: "VAT Registration Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "inv-vat-number",
              className: "mt-1",
              placeholder: "e.g. GB 123 4567 89",
              value: formData.vatNumber,
              onChange: (e) => updateField("vatNumber", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Shown on all invoices where VAT is charged" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 14 }),
        " Bank Details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "Shown in the payment details panel at the bottom of printed invoices so customers know where to send payment." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-bank-name", children: "Bank Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "inv-bank-name",
              className: "mt-1",
              placeholder: "e.g. Lloyds Bank",
              value: formData.bankName,
              onChange: (e) => updateField("bankName", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-account-name", children: "Account Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "inv-account-name",
              className: "mt-1",
              placeholder: "e.g. Acme Farms Ltd",
              value: formData.bankAccountName,
              onChange: (e) => updateField("bankAccountName", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-account-number", children: "Account Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "inv-account-number",
              className: "mt-1",
              placeholder: "e.g. 12345678",
              value: formData.bankAccountNumber,
              onChange: (e) => updateField("bankAccountNumber", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-sort-code", children: "Sort Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "inv-sort-code",
              className: "mt-1",
              placeholder: "e.g. 30-96-26",
              value: formData.bankSortCode,
              onChange: (e) => updateField("bankSortCode", e.target.value)
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold mb-3", children: "Invoice Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-payment-terms", children: "Default Payment Terms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.paymentTermsDays || "30",
              onValueChange: (v) => updateField("paymentTermsDays", v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "inv-payment-terms", className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select terms" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_TERMS_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: 'Shown on printed invoices as "Payment due within X days"' })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "inv-footer-text", children: "Invoice Footer Text" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "inv-footer-text",
              className: "mt-1 text-sm",
              rows: 3,
              placeholder: "e.g. Thank you for your business. Late payments may be subject to interest under the Late Payment of Commercial Debts Act 1998.",
              value: formData.invoiceFooterText,
              onChange: (e) => updateField("invoiceFooterText", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Appears at the bottom of every printed invoice and credit note" })
        ] })
      ] })
    ] })
  ] }) });
}
function FarmCompletenessBar({
  formData,
  isViticulture
}) {
  const s = formData.sectors;
  const hasAnyLivestock = s.sectorBeef || s.sectorSheep || s.sectorDairy || s.sectorPigs || s.sectorGoats || s.sectorEquine || s.sectorDeer || s.sectorPoultry || s.sectorEggs;
  const hasSheepGoats = s.sectorSheep || s.sectorGoats;
  const hasCattle = s.sectorBeef || s.sectorDairy;
  const hasPigs = s.sectorPigs;
  const checks = [
    { key: "name", label: "Farm name", filled: !!formData.name.trim(), targetId: "settings-name" },
    { key: "address", label: "Address", filled: !!formData.address.trim(), targetId: "settings-address" },
    ...hasAnyLivestock ? [{ key: "cphNumber", label: "CPH Number", filled: !!formData.cphNumber.trim(), targetId: "settings-cph" }] : [],
    ...hasSheepGoats ? [{ key: "flockMark", label: "Flock Mark", filled: !!formData.flockMark.trim(), targetId: "settings-flock-mark" }] : [],
    ...hasCattle ? [{ key: "herdMark", label: "Herd Mark", filled: !!formData.herdMark.trim(), targetId: "settings-herd-mark" }] : [],
    ...hasPigs ? [{ key: "pigHerdMark", label: "Pig Herd Mark", filled: !!formData.pigHerdMark.trim(), targetId: "settings-pig-herd-mark" }] : [],
    ...isViticulture ? [
      { key: "fsaVineRegisterRef", label: "FSA Vine Register Ref", filled: !!formData.fsaVineRegisterRef.trim(), targetId: "settings-fsa-vine-ref" },
      { key: "fsaWineProductionRef", label: "FSA Wine Production Ref", filled: !!formData.fsaWineProductionRef.trim(), targetId: "settings-fsa-wine-ref" }
    ] : []
  ];
  const allComplete = checks.every((c) => c.filled);
  const missingCount = checks.filter((c) => !c.filled).length;
  const scrollToField = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
    el.classList.add("ring-2", "ring-amber-400", "ring-offset-1");
    setTimeout(() => el.classList.remove("ring-2", "ring-amber-400", "ring-offset-1"), 2e3);
  };
  if (allComplete) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-green-600 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Farm Settings complete" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 ml-0.5", children: "— all key fields are filled in" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, className: "text-amber-500 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-amber-900", children: [
        missingCount,
        " key field",
        missingCount !== 1 ? "s" : "",
        " still to complete"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-700 ml-1", children: "— click any amber badge to jump to that field" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: checks.map(
      (c) => c.filled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: "inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 11 }),
            c.label
          ]
        },
        c.key
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => scrollToField(c.targetId),
          className: "inline-flex items-center gap-1 rounded-full bg-amber-200 hover:bg-amber-300 active:bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-amber-900 transition-colors cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
            c.label
          ]
        },
        c.key
      )
    ) })
  ] });
}
function FarmSettings() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: farmDetailData, isLoading } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const currentFarm = farmDetailData?.record;
  const { data: platformConfig } = useQuery({
    queryKey: ["platform-config"],
    queryFn: () => fetch("/api/platform-config").then((r) => r.json()).then((d) => d.config),
    staleTime: 5 * 60 * 1e3
  });
  const { mutate: updateFarm, isPending: isSaving } = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/farms/${farmId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update farm");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-detail", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-dashboard", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-settings", farmId] });
      toast({ title: "Farm updated", description: "Your changes have been saved." });
    },
    onError: () => {
      toast({ title: "Failed to update farm", variant: "destructive" });
    }
  });
  const [formData, setFormData] = reactExports.useState(null);
  const [loadedFarmId, setLoadedFarmId] = reactExports.useState(null);
  const [postcodeBlurred, setPostcodeBlurred] = reactExports.useState(false);
  const [locatingPostcode, setLocatingPostcode] = reactExports.useState(false);
  const [convertingW3W, setConvertingW3W] = reactExports.useState(false);
  const [w3wNoKey, setW3wNoKey] = reactExports.useState(false);
  const [coordsCopied, setCoordsCopied] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (currentFarm && currentFarm.id !== loadedFarmId) {
      setFormData(farmToFormData(currentFarm));
      setLoadedFarmId(currentFarm.id);
    }
  }, [currentFarm, loadedFarmId]);
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Farm Settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 bg-black/5 rounded-2xl" }) }) });
  }
  if (!currentFarm) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  }
  if (!formData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Farm Settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 bg-black/5 rounded-2xl" }) }) });
  }
  const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i;
  function normalisePostcode(raw) {
    const v = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (v.length >= 4) return v.slice(0, -3) + " " + v.slice(-3);
    return raw.trim().toUpperCase();
  }
  const postcodeVal = formData?.postcode?.trim() ?? "";
  const postcodeWarn = postcodeBlurred && postcodeVal.length > 0 && !UK_POSTCODE_RE.test(postcodeVal);
  const updateField = (field, value) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : prev);
  };
  const toggleSector = (key) => {
    setFormData((prev) => prev ? {
      ...prev,
      sectors: { ...prev.sectors, [key]: !prev.sectors[key] }
    } : prev);
  };
  const locateFromPostcode = async () => {
    if (!formData?.postcode?.trim()) {
      toast({ title: "Enter a postcode first", variant: "destructive" });
      return;
    }
    setLocatingPostcode(true);
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(formData.postcode.trim())}`);
      const data = await res.json();
      if (data.status === 200 && data.result) {
        const { latitude, longitude } = data.result;
        setFormData((prev) => prev ? { ...prev, latitude: String(latitude), longitude: String(longitude) } : prev);
        setW3wNoKey(false);
        toast({ title: "Coordinates set", description: `${latitude}, ${longitude} — drag the pin in W3W to fine-tune.` });
      } else {
        toast({ title: "Postcode not found", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to look up postcode", variant: "destructive" });
    } finally {
      setLocatingPostcode(false);
    }
  };
  const convertToW3W = async () => {
    if (!formData?.latitude || !formData?.longitude) {
      toast({ title: "Set GPS coordinates first", variant: "destructive" });
      return;
    }
    setConvertingW3W(true);
    setW3wNoKey(false);
    try {
      const res = await fetch(`/api/utils/w3w-convert?lat=${encodeURIComponent(formData.latitude)}&lng=${encodeURIComponent(formData.longitude)}`);
      const data = await res.json();
      if (res.status === 503 && data.noKey) {
        setW3wNoKey(true);
        return;
      }
      if (!res.ok) {
        toast({ title: "W3W conversion failed", description: data.error ?? "Unknown error", variant: "destructive" });
        return;
      }
      setFormData((prev) => prev ? { ...prev, what3words: data.words } : prev);
      toast({ title: "What3Words address set", description: `///${data.words}${data.nearestPlace ? ` — near ${data.nearestPlace}` : ""}` });
    } catch {
      toast({ title: "Failed to contact W3W service", variant: "destructive" });
    } finally {
      setConvertingW3W(false);
    }
  };
  const copyCoordinates = () => {
    if (!formData?.latitude || !formData?.longitude) return;
    navigator.clipboard.writeText(`${formData.latitude}, ${formData.longitude}`).then(() => {
      setCoordsCopied(true);
      setTimeout(() => setCoordsCopied(false), 2e3);
    });
  };
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: "Farm name is required", variant: "destructive" });
      return;
    }
    const normalisedPostcode = normalisePostcode(formData.postcode ?? "");
    updateField("postcode", normalisedPostcode);
    setPostcodeBlurred(true);
    const sbiTrimmed = formData.sbiNumber.trim();
    if (sbiTrimmed && !/^\d{9}$/.test(sbiTrimmed)) {
      toast({ title: "SBI Number must be exactly 9 digits", variant: "destructive" });
      return;
    }
    updateFarm({
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      cphNumber: formData.cphNumber.trim() || void 0,
      address: formData.address.trim() || void 0,
      postcode: normalisedPostcode || void 0,
      county: formData.county.trim() || void 0,
      gridReference: formData.gridReference.trim() || void 0,
      latitude: formData.latitude.trim() || void 0,
      longitude: formData.longitude.trim() || void 0,
      what3words: formData.what3words.trim() || void 0,
      emergencyContactName: formData.emergencyContactName.trim() || void 0,
      emergencyContactRelationship: formData.emergencyContactRelationship.trim() || void 0,
      emergencyContactPhone: formData.emergencyContactPhone.trim() || void 0,
      emergencyContactEmail: formData.emergencyContactEmail.trim() || void 0,
      totalAcreage: formData.totalAcreage ? parseInt(formData.totalAcreage, 10) : void 0,
      ...formData.sectors,
      redTractorId: formData.redTractorId.trim() || void 0,
      sbiNumber: formData.sbiNumber.trim() || void 0,
      totalHectares: formData.totalHectares.trim() || void 0,
      farmManager: formData.farmManager.trim() || void 0,
      holdingType: formData.holdingType || void 0,
      assuranceBody: formData.assuranceBody.trim() || void 0,
      isNvzDesignated: formData.isNvzDesignated,
      harvestStrictStorage: formData.harvestStrictStorage,
      country: formData.country || "england",
      eaml2Email: formData.eaml2Email.trim() || void 0,
      flockMark: formData.flockMark.trim() || void 0,
      herdMark: formData.herdMark.trim() || void 0,
      pigHerdMark: formData.pigHerdMark.trim() || void 0,
      bcmsHoldingNumber: formData.bcmsHoldingNumber.trim() || void 0,
      scotEidNumber: formData.scotEidNumber.trim() || void 0,
      eidCymruNumber: formData.eidCymruNumber.trim() || void 0,
      appaRef: formData.appaRef.trim() || void 0,
      appaRegistrationDate: formData.appaRegistrationDate.trim() || void 0,
      fsaWineProductionRef: formData.fsaWineProductionRef.trim() || void 0,
      fsaVineRegisterRef: formData.fsaVineRegisterRef.trim() || void 0,
      winegbMembershipNumber: formData.winegbMembershipNumber.trim() || void 0,
      companyNumber: formData.companyNumber.trim() || void 0,
      vatNumber: formData.vatNumber.trim() || void 0,
      bankName: formData.bankName.trim() || void 0,
      bankAccountName: formData.bankAccountName.trim() || void 0,
      bankAccountNumber: formData.bankAccountNumber.trim() || void 0,
      bankSortCode: formData.bankSortCode.trim() || void 0,
      paymentTermsDays: formData.paymentTermsDays ? parseInt(formData.paymentTermsDays, 10) : void 0,
      invoiceFooterText: formData.invoiceFooterText.trim() || void 0,
      invoiceLogoPath: formData.invoiceLogoPath.trim() || void 0,
      irrigationCostPerMmHa: formData.irrigationCostPerMmHa.trim() || null,
      idleBarrelDays: formData.idleBarrelDays.trim() ? parseInt(formData.idleBarrelDays, 10) : null,
      approachingNeutralFills: formData.approachingNeutralFills.trim() ? parseInt(formData.approachingNeutralFills, 10) : null,
      irrigationAbstractionSource: formData.irrigationAbstractionSource.trim() || null
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Farm Settings", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FarmCompletenessBar, { formData, isViticulture: formData.sectors.sectorViticulture }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Farm Identity",
          description: "Core identifiers used on compliance reports and correspondence."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-name", children: "Farm Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-name",
              placeholder: "e.g. Manor Farm",
              value: formData.name,
              onChange: (e) => updateField("name", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-phone", children: "Contact Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-phone",
              type: "tel",
              placeholder: "e.g. 01234 567890",
              value: formData.phone,
              onChange: (e) => updateField("phone", e.target.value),
              className: formData.phone.trim() && formData.phone.replace(/\D/g, "").length < 10 ? "border-amber-400 focus-visible:ring-amber-400" : ""
            }
          ),
          formData.phone.trim() && formData.phone.replace(/\D/g, "").length < 10 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "This doesn't look like a valid phone number — fewer than 10 digits. You can still save if you're sure." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Main farm contact number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-cph", children: "CPH Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-cph",
              placeholder: "e.g. 12/345/6789",
              value: formData.cphNumber,
              onChange: (e) => updateField("cphNumber", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "County Parish Holding number (APHA / BCMS)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-sbi", children: "SBI Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-sbi",
              placeholder: "e.g. 105123456",
              value: formData.sbiNumber,
              onChange: (e) => updateField("sbiNumber", e.target.value),
              className: formData.sbiNumber.trim() && !/^\d{9}$/.test(formData.sbiNumber.trim()) ? "border-red-400 focus-visible:ring-red-400" : ""
            }
          ),
          formData.sbiNumber.trim() && !/^\d{9}$/.test(formData.sbiNumber.trim()) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-1", children: "SBI must be exactly 9 digits (e.g. 105123456)" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Single Business Identifier (Rural Payments Agency)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-rt-id", children: "Red Tractor Membership Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-rt-id",
              placeholder: "e.g. 12345678",
              value: formData.redTractorId,
              onChange: (e) => updateField("redTractorId", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Appears on all compliance reports" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-assurance-body", children: "Certification / Assurance Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.assuranceBody || "__none__",
              onValueChange: (v) => updateField("assuranceBody", v === "__none__" ? "" : v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "settings-assurance-body", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select body…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                  ASSURANCE_BODIES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: b }, b))
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "The body that carries out your Red Tractor inspection" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-manager", children: "Farm Manager / Responsible Person" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-manager",
              placeholder: "e.g. John Smith",
              value: formData.farmManager,
              onChange: (e) => updateField("farmManager", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Named on compliance exports and inspection reports" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-holding-type", children: "Holding Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.holdingType || "__none__",
              onValueChange: (v) => updateField("holdingType", v === "__none__" ? "" : v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "settings-holding-type", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                  HOLDING_TYPES.map((ht) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ht.value, children: ht.label }, ht.value))
                ] })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Location",
          description: "Farm address and map reference."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-address", children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-address",
              placeholder: "Farm address",
              value: formData.address,
              onChange: (e) => updateField("address", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-postcode", children: "Postcode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-postcode",
              placeholder: "e.g. YO1 7HJ",
              value: formData.postcode,
              onChange: (e) => updateField("postcode", e.target.value),
              onBlur: () => {
                updateField("postcode", normalisePostcode(formData.postcode ?? ""));
                setPostcodeBlurred(true);
              }
            }
          ),
          postcodeWarn && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "This doesn't look like a valid UK postcode (e.g. DT1 1AA). You can still save if you're sure." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-county", children: "County" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-county",
              placeholder: "e.g. Norfolk",
              value: formData.county,
              onChange: (e) => updateField("county", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Used to filter regional disease and plant health alerts to the correct farms." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-grid", children: "OS Grid Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-grid",
              placeholder: "e.g. SE 605 515",
              value: formData.gridReference,
              onChange: (e) => updateField("gridReference", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-country", children: "Country / Devolved Nation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.country || "england",
              onValueChange: (v) => updateField("country", v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "settings-country", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "england", children: "England" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "scotland", children: "Scotland" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "wales", children: "Wales" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "northern_ireland", children: "Northern Ireland" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Determines which livestock movement portals apply to this holding (eAML2, ScotEID, EIDCymru, or NIFAIS)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 pt-2 border-t border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14, className: "text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: "GPS Coordinates & What3Words" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "— for emergency services, contractors and compliance site visits" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-lat", children: "Latitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "settings-lat",
                  className: "mt-1 font-mono text-sm",
                  placeholder: "e.g. 53.958333",
                  value: formData.latitude,
                  onChange: (e) => updateField("latitude", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-lng", children: "Longitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "settings-lng",
                  className: "mt-1 font-mono text-sm",
                  placeholder: "e.g. -1.080278",
                  value: formData.longitude,
                  onChange: (e) => updateField("longitude", e.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                onClick: locateFromPostcode,
                disabled: locatingPostcode || !formData.postcode?.trim(),
                children: [
                  locatingPostcode ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "mr-1.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13, className: "mr-1.5" }),
                  "Locate from Postcode"
                ]
              }
            ),
            formData.latitude && formData.longitude && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  onClick: copyCoordinates,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 13, className: "mr-1.5" }),
                    coordsCopied ? "Copied!" : "Copy Coordinates"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 13, className: "mr-1.5" }),
                    "View in Maps"
                  ] })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-w3w", children: "What3Words Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#e11d48] select-none", children: "///" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "settings-w3w",
                    className: "pl-9 font-mono text-sm",
                    placeholder: "three.word.address",
                    value: formData.what3words,
                    onChange: (e) => updateField("what3words", e.target.value.replace(/^\/+/, ""))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  onClick: convertToW3W,
                  disabled: convertingW3W || !formData.latitude || !formData.longitude,
                  title: "Auto-convert from GPS coordinates",
                  children: [
                    convertingW3W ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: "Auto-convert" })
                  ]
                }
              ),
              formData.what3words && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `https://what3words.com/${formData.what3words}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 13 }) })
                }
              )
            ] }),
            w3wNoKey && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 text-xs font-semibold mt-0.5", children: "⚠" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700", children: [
                "Auto-convert needs a ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "W3W_API_KEY" }),
                " environment secret. Register for a free key at",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://developer.what3words.com", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "developer.what3words.com" }),
                " ",
                "and add it to your project secrets. You can also type or paste the W3W address manually above."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1.5", children: [
              "Used by emergency services, delivery drivers and Red Tractor assessors. Find yours at",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://what3words.com", target: "_blank", rel: "noopener noreferrer", className: "underline hover:text-foreground", children: "what3words.com" }),
              "."
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Land & Compliance Details",
          description: "Total farm size and regulatory designations that affect compliance rules."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-hectares", children: "Total Area (hectares)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-hectares",
              type: "number",
              step: "0.01",
              placeholder: "e.g. 101.2",
              value: formData.totalHectares,
              onChange: (e) => {
                const ha = e.target.value;
                updateField("totalHectares", ha);
                const n = parseFloat(ha);
                updateField("totalAcreage", ha && !isNaN(n) ? (n * 2.47105).toFixed(2) : "");
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Used for NVZ, biofuel, and spray compliance calculations" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-acreage", children: "Total Area (acres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-acreage",
              type: "number",
              step: "0.01",
              placeholder: "e.g. 250",
              value: formData.totalAcreage,
              onChange: (e) => {
                const ac = e.target.value;
                updateField("totalAcreage", ac);
                const n = parseFloat(ac);
                updateField("totalHectares", ac && !isNaN(n) ? (n / 2.47105).toFixed(2) : "");
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Auto-calculated from hectares — or enter directly to set both" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: formData.isNvzDesignated,
              onCheckedChange: (checked) => setFormData((prev) => prev ? { ...prev, isNvzDesignated: !!checked } : prev),
              className: "mt-0.5"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium group-hover:text-foreground", children: "Farm is within a Nitrate Vulnerable Zone (NVZ)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Enables NVZ closed period warnings and the 170 kg N/ha organic manure limit across all relevant modules. You can also flag individual fields within the Field Register." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-black/5 transition-colors group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: formData.harvestStrictStorage,
              onCheckedChange: (checked) => setFormData((prev) => prev ? { ...prev, harvestStrictStorage: !!checked } : prev),
              className: "mt-0.5"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium group-hover:text-foreground", children: "Require storage record for every harvest" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "When enabled, the harvest reconciliation panel will flag any harvest that has no storage record — even where only transport legs have been recorded. Suitable for farms where all crop must pass through an on-farm or third-party store before sale. Leave off if crop is sometimes collected directly from the field by the buyer." })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Farm Sectors",
          description: "Select all types of farming activity on this holding. Sectors determine which Red Tractor standards apply."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: SECTORS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "label",
        {
          id: `settings-sector-${s.key}`,
          className: "flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: formData.sectors[s.key],
                onCheckedChange: () => toggleSector(s.key)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: s.label })
          ]
        },
        s.key
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Livestock Movement Reporting",
          description: "Reference identifiers for electronic livestock movement reporting. Stored here and included in movement exports — submission to the relevant government portal is done separately."
        }
      ),
      formData.country === "scotland" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Scotland:" }),
        " All livestock movements (cattle, sheep, goats, pigs) are reported to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ScotEID" }),
        " — Scotland's national electronic identification database. Register at",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.scoteid.com", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "scoteid.com" }),
        "."
      ] }),
      formData.country === "wales" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Wales:" }),
        " Sheep and goat movements are reported via ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "EIDCymru" }),
        " (eidcymru.org). Cattle movements are reported via ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LIS" }),
        " (portal.livestockinformation.org.uk). Pig movements use ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "eAML2.org.uk" }),
        "."
      ] }),
      formData.country === "northern_ireland" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Northern Ireland:" }),
        " Livestock movements are recorded on ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NIFAIS" }),
        " (Northern Ireland Food Animal Information System) for cattle and ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "APHIS" }),
        " for sheep and pigs. Contact DAERA for registration."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-eaml2-email", children: "Registered Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-eaml2-email",
              type: "email",
              placeholder: "e.g. farmer@example.com",
              value: formData.eaml2Email,
              onChange: (e) => updateField("eaml2Email", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Email registered with your livestock movement portal (LIS / EIDCymru / ScotEID / NIFAIS)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-flock-mark", children: "Flock Mark (Sheep & Goats)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-flock-mark",
              placeholder: "e.g. UK123456",
              value: formData.flockMark,
              onChange: (e) => updateField("flockMark", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "APHA-issued flock number (UK + 6 digits) for sheep and goats. Appears on ear tags and LIS / EIDCymru / ScotEID movement documents. Pigs use the Herd Mark below." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-herd-mark", children: "Herd Mark (Cattle)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-herd-mark",
              placeholder: "e.g. UK654321",
              value: formData.herdMark,
              onChange: (e) => updateField("herdMark", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "APHA-issued herd mark for cattle. Printed on cattle passports and required for BCMS movement notifications. Issued separately from the pig herd mark below." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-pig-herd-mark", children: "Herd Mark (Pigs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-pig-herd-mark",
              placeholder: "e.g. UK789012",
              value: formData.pigHerdMark,
              onChange: (e) => updateField("pigHerdMark", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "APHA-issued herd mark for pigs. Appears on pig ear tags and slap marks, and required for LIS (formerly eAML2) pig movement documents. Registered separately from your cattle herd mark." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-bcms-holding", children: "BCMS Holding Number (Cattle)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-bcms-holding",
              placeholder: "e.g. 32541/0001",
              value: formData.bcmsHoldingNumber,
              onChange: (e) => updateField("bcmsHoldingNumber", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your BCMS-registered holding number for cattle movements. Used in England and Wales." })
        ] }),
        formData.country === "scotland" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-scoteid", children: "ScotEID Flock / Herd Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-scoteid",
              placeholder: "e.g. SC123456",
              value: formData.scotEidNumber,
              onChange: (e) => updateField("scotEidNumber", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your ScotEID-registered flock or herd number for electronic movement reporting in Scotland." })
        ] }),
        formData.country === "wales" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-eidcymru", children: "EIDCymru Flock Number (Sheep & Goats)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-eidcymru",
              placeholder: "e.g. WL123456",
              value: formData.eidCymruNumber,
              onChange: (e) => updateField("eidCymruNumber", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your EIDCymru-registered flock number for electronic sheep and goat movement reporting in Wales." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How movement reporting works with BDE Farm Trac:" }),
        ' Record all livestock movements in the Movements section. Use the "Export CSV" button to download a structured report as a reference when submitting to your relevant portal. Paste the movement reference number back into each record once submitted.',
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cattle" }),
        " must be reported within 3 days.",
        " ",
        formData.country === "scotland" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "All species in Scotland are reported to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ScotEID" }),
          "."
        ] }),
        formData.country === "wales" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "In Wales, sheep and goats use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "EIDCymru" }),
          "; cattle use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LIS" }),
          "; pigs use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "eAML2" }),
          "."
        ] }),
        (formData.country === "england" || !formData.country) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "In England, sheep, goats and pigs use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LIS" }),
          " (replacing eAML2); cattle use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LIS / CTWS" }),
          "."
        ] }),
        formData.country === "northern_ireland" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "In Northern Ireland, use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NIFAIS" }),
          " for cattle and ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "APHIS" }),
          " for sheep and pigs."
        ] })
      ] })
    ] }) }),
    farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", inset: 0, borderRadius: 12, background: "rgba(249,250,251,0.6)", zIndex: 10, pointerEvents: "all", cursor: "not-allowed" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "absolute", top: 14, right: 14, zIndex: 11, display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 700 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10, style: { color: "#f59e0b" } }),
        " Temporarily unavailable"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { opacity: 0.45, pointerEvents: "none", userSelect: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BcmsCredentialsCard, { farmId, bcmsHoldingNumber: formData.bcmsHoldingNumber || void 0 }) })
    ] }),
    farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(LisConnectionCard, { farmId }),
    farmId && formData.country === "wales" && /* @__PURE__ */ jsxRuntimeExports.jsx(EidcymruConnectionCard, { farmId, flockNumber: formData.eidCymruNumber }),
    farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", inset: 0, borderRadius: 12, background: "rgba(249,250,251,0.6)", zIndex: 10, pointerEvents: "all", cursor: "not-allowed" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "absolute", top: 14, right: 14, zIndex: 11, display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 700 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10, style: { color: "#f59e0b" } }),
        " Temporarily unavailable"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { opacity: 0.45, pointerEvents: "none", userSelect: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LipConnectionCard, { farmId }) })
    ] }),
    farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(GpsIntegrationCard, { farmId }),
    farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(SensorIntegrationCard, { farmId }),
    formData.sectors.sectorViticulture && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Viticulture Registrations",
          description: "Registration references for UK viticulture regulatory bodies. These are stored at farm level and referenced across the Viticulture module."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-fsa-wine-ref", children: "FSA Wine Production Registration Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-fsa-wine-ref",
              placeholder: "e.g. WPR-12345",
              value: formData.fsaWineProductionRef,
              onChange: (e) => updateField("fsaWineProductionRef", e.target.value),
              className: "mt-1 font-mono"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Issued by the FSA when you register a winery at food.gov.uk. This is your holding-level wine production registration reference." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-appa-ref", children: "HMRC APPA Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-appa-ref",
              placeholder: "e.g. APPA-123456",
              value: formData.appaRef,
              onChange: (e) => updateField("appaRef", e.target.value),
              className: "mt-1 font-mono"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Your ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Alcoholic Products Producer Approval" }),
            " reference, issued by HMRC via Government Gateway. Required if you produce wine for sale. Quoted on all alcohol duty returns filed through HMRC's online service."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-appa-date", children: "APPA Registration Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-appa-date",
              type: "date",
              value: formData.appaRegistrationDate,
              onChange: (e) => updateField("appaRegistrationDate", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Date your APPA was granted by HMRC" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-fsa-vine-ref", children: "FSA Vine Register Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-fsa-vine-ref",
              placeholder: "e.g. VR-12345",
              value: formData.fsaVineRegisterRef,
              onChange: (e) => updateField("fsaVineRegisterRef", e.target.value),
              className: "mt-1 font-mono"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Your holding-level ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "FSA Vine Register" }),
            " reference, issued when you register your vineyard planting with the RPA. This is pulled through automatically to Vine Register entries — you only need to enter it once here."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-winegb-number", children: "WineGB Membership Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-winegb-number",
              placeholder: "e.g. WGB-12345",
              value: formData.winegbMembershipNumber,
              onChange: (e) => updateField("winegbMembershipNumber", e.target.value),
              className: "mt-1 font-mono"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Your ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "WineGB" }),
            " membership number, issued on joining Wines of Great Britain. Used to identify your vineyard in WineGB's annual Harvest Yield Survey and industry reporting. Join at ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "winegb.co.uk" }),
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How these registrations work:" }),
        " The ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "FSA Wine Production Registration" }),
        " records your vineyard or winery with the Food Standards Agency (the UK vine planting register and wine standards authority post-Brexit). The ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "HMRC APPA" }),
        " is your excise approval to produce and sell wine — required before you remove any wine from your premises on which duty is payable. Apply for your APPA via Government Gateway; contact HMRC Excise on ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "0300 200 3700" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Barrel Alert Thresholds",
          description: "Adjust these to match your winery's practices. Defaults are used when left blank."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-idle-barrel-days", children: "Idle Barrel Threshold (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-idle-barrel-days",
              type: "number",
              min: "1",
              placeholder: "Default: 90",
              value: formData.idleBarrelDays,
              onChange: (e) => updateField("idleBarrelDays", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "A barrel empty for longer than this many days is flagged as idle in the vessel register. Leave blank to use the platform default of 90 days." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-approaching-neutral-fills", children: "Neutral Oak Threshold (fills)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-approaching-neutral-fills",
              type: "number",
              min: "1",
              placeholder: "Default: 4",
              value: formData.approachingNeutralFills,
              onChange: (e) => updateField("approachingNeutralFills", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Barrels at or beyond this fill number are flagged as approaching neutral oak influence. Leave blank to use the platform default of 4 fills." })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoicingCard,
      {
        farmId,
        formData,
        updateField,
        onLogoPathChange: (path) => setFormData((prev) => prev ? { ...prev, invoiceLogoPath: path } : prev)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Water & Irrigation",
          description: "Default irrigation economics for this holding. Used by the Irrigation Advisor to calculate the cost and return of each irrigation decision. Platform-wide defaults apply where these are left blank."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-irrig-cost", children: "Irrigation Cost (£ per mm per ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-irrig-cost",
              type: "number",
              step: "0.01",
              min: "0",
              placeholder: "e.g. 3.50",
              value: formData.irrigationCostPerMmHa,
              onChange: (e) => updateField("irrigationCostPerMmHa", e.target.value)
            }
          ),
          !formData.irrigationCostPerMmHa && platformConfig?.["irrigation.costPerMmHa"] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1", children: [
            "Using platform default: £",
            Number(platformConfig["irrigation.costPerMmHa"]).toFixed(2),
            "/mm/ha"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Combined pump + abstraction cost per mm applied per hectare. Leave blank to use the platform default." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-irrig-source", children: "Default Abstraction Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-irrig-source",
              placeholder: "e.g. Borehole, River Wye, Reservoir",
              value: formData.irrigationAbstractionSource,
              onChange: (e) => updateField("irrigationAbstractionSource", e.target.value)
            }
          ),
          !formData.irrigationAbstractionSource && platformConfig?.["irrigation.abstractionSource"] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1", children: [
            "Using platform default: ",
            platformConfig["irrigation.abstractionSource"]
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Shown alongside field summary cards in the Irrigation Advisor. Leave blank to use the platform default." })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 md:p-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionHeader,
        {
          title: "Emergency Contact",
          description: "The person to contact first in the event of a serious accident or incident on this holding. Visible to all staff with access to Farm Settings."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-ec-name", children: "Full Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "settings-ec-name",
                className: "pl-8",
                placeholder: "e.g. Jane Smith",
                value: formData.emergencyContactName,
                onChange: (e) => updateField("emergencyContactName", e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-ec-rel", children: "Relationship" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-ec-rel",
              className: "mt-1",
              placeholder: "e.g. Spouse, Farm Owner, Business Partner",
              value: formData.emergencyContactRelationship,
              onChange: (e) => updateField("emergencyContactRelationship", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-ec-phone", children: "Phone Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "settings-ec-phone",
                type: "tel",
                className: `pl-8${formData.emergencyContactPhone.trim() && formData.emergencyContactPhone.replace(/\D/g, "").length < 10 ? " border-amber-400 focus-visible:ring-amber-400" : ""}`,
                placeholder: "e.g. 07700 900123",
                value: formData.emergencyContactPhone,
                onChange: (e) => updateField("emergencyContactPhone", e.target.value)
              }
            )
          ] }),
          formData.emergencyContactPhone.trim() && formData.emergencyContactPhone.replace(/\D/g, "").length < 10 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "This doesn't look like a valid phone number — fewer than 10 digits. You can still save if you're sure." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Include country code if outside the UK" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "settings-ec-email", children: "Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "settings-ec-email",
              type: "email",
              className: "mt-1",
              placeholder: "e.g. jane@example.com",
              value: formData.emergencyContactEmail,
              onChange: (e) => updateField("emergencyContactEmail", e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 15, className: "text-red-600 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "In a life-threatening emergency, always call 999 first." }),
          " ",
          "This contact is for follow-up notification and farm management decisions, not as a substitute for emergency services.",
          formData.emergencyContactPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            " Quick-dial: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${formData.emergencyContactPhone.replace(/\s/g, "")}`, className: "font-semibold underline", children: formData.emergencyContactPhone }),
            "."
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: isSaving, size: "lg", children: [
      isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
      "Save Changes"
    ] }) })
  ] }) });
}
export {
  FarmSettings as default
};
