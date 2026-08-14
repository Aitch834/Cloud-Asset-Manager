import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUpload } from "@workspace/object-storage-web";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Loader2, Save, MapPin, Copy, ExternalLink, RefreshCw, Phone, UserRound, Eye, EyeOff, ShieldCheck, Shield, Wifi, WifiOff, Trash2, Building2, CreditCard, Upload, ImageIcon, X, Cpu, LogIn, LogOut, Truck, Satellite, Key, Link2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";

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
  { key: "sectorDeer", label: "Deer / Venison" },
] as const;

const HOLDING_TYPES = [
  { value: "owned", label: "Owner occupied" },
  { value: "tenanted", label: "Tenanted" },
  { value: "contract", label: "Contract farmed" },
  { value: "managed", label: "Managed / Share farmed" },
] as const;

const ASSURANCE_BODIES = [
  "Acoura",
  "ADAS",
  "Control Union",
  "CERT UK",
  "NSF",
  "SGS",
  "Other",
] as const;

type SectorKey = typeof SECTORS[number]["key"];

type Farm = any;

interface FarmFormData {
  name: string;
  phone: string;
  cphNumber: string;
  sbiNumber: string;
  address: string;
  postcode: string;
  gridReference: string;
  latitude: string;
  longitude: string;
  what3words: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  totalAcreage: string;
  totalHectares: string;
  redTractorId: string;
  farmManager: string;
  holdingType: string;
  assuranceBody: string;
  isNvzDesignated: boolean;
  sectors: Record<SectorKey, boolean>;
  country: string;
  eaml2Email: string;
  flockMark: string;
  herdMark: string;
  pigHerdMark: string;
  bcmsHoldingNumber: string;
  scotEidNumber: string;
  eidCymruNumber: string;
  companyNumber: string;
  vatNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankSortCode: string;
  paymentTermsDays: string;
  invoiceFooterText: string;
  invoiceLogoPath: string;
  appaRef: string;
  appaRegistrationDate: string;
  fsaWineProductionRef: string;
  fsaVineRegisterRef: string;
  winegbMembershipNumber: string;
  harvestStrictStorage: boolean;
}

function farmToFormData(farm: Farm & {
  redTractorId?: string | null;
  sbiNumber?: string | null;
  totalHectares?: string | null;
  farmManager?: string | null;
  holdingType?: string | null;
  assuranceBody?: string | null;
  isNvzDesignated?: boolean | null;
}): FarmFormData {
  return {
    name: farm.name || "",
    phone: (farm as any).contactPhone || "",
    cphNumber: farm.cphNumber || "",
    sbiNumber: (farm as any).sbiNumber || "",
    address: farm.address || "",
    postcode: farm.postcode || "",
    gridReference: farm.gridReference || "",
    latitude: (farm as any).latitude || "",
    longitude: (farm as any).longitude || "",
    what3words: (farm as any).what3words || "",
    emergencyContactName: (farm as any).emergencyContactName || "",
    emergencyContactRelationship: (farm as any).emergencyContactRelationship || "",
    emergencyContactPhone: (farm as any).emergencyContactPhone || "",
    emergencyContactEmail: (farm as any).emergencyContactEmail || "",
    totalAcreage: farm.totalAcreage?.toString() || "",
    totalHectares: (farm as any).totalHectares?.toString() || "",
    redTractorId: (farm as any).redTractorId || "",
    farmManager: (farm as any).farmManager || "",
    holdingType: (farm as any).holdingType || "",
    assuranceBody: (farm as any).assuranceBody || "",
    isNvzDesignated: !!(farm as any).isNvzDesignated,
    sectors: {
      sectorArable: !!farm.sectorArable,
      sectorBeef: !!farm.sectorBeef,
      sectorSheep: !!(farm as any).sectorSheep,
      sectorDairy: !!farm.sectorDairy,
      sectorPigs: !!farm.sectorPigs,
      sectorPoultry: !!farm.sectorPoultry,
      sectorEggs: !!(farm as any).sectorEggs,
      sectorGoats: !!(farm as any).sectorGoats,
      sectorEquine: !!(farm as any).sectorEquine,
      sectorHorticulture: !!farm.sectorHorticulture,
      sectorViticulture: !!(farm as any).sectorViticulture,
      sectorFreshProduce: !!(farm as any).sectorFreshProduce,
      sectorDeer: !!(farm as any).sectorDeer,
    },
    country: (farm as any).country || "england",
    eaml2Email: (farm as any).eaml2Email || "",
    flockMark: (farm as any).flockMark || "",
    herdMark: (farm as any).herdMark || "",
    pigHerdMark: (farm as any).pigHerdMark || "",
    bcmsHoldingNumber: (farm as any).bcmsHoldingNumber || "",
    scotEidNumber: (farm as any).scotEidNumber || "",
    eidCymruNumber: (farm as any).eidCymruNumber || "",
    companyNumber: (farm as any).companyNumber || "",
    vatNumber: (farm as any).vatNumber || "",
    bankName: (farm as any).bankName || "",
    bankAccountName: (farm as any).bankAccountName || "",
    bankAccountNumber: (farm as any).bankAccountNumber || "",
    bankSortCode: (farm as any).bankSortCode || "",
    paymentTermsDays: (farm as any).paymentTermsDays?.toString() || "30",
    invoiceFooterText: (farm as any).invoiceFooterText || "",
    invoiceLogoPath: (farm as any).invoiceLogoPath || "",
    appaRef: (farm as any).appaRef || "",
    appaRegistrationDate: (farm as any).appaRegistrationDate || "",
    fsaWineProductionRef: (farm as any).fsaWineProductionRef || "",
    fsaVineRegisterRef: (farm as any).fsaVineRegisterRef || "",
    winegbMembershipNumber: (farm as any).winegbMembershipNumber || "",
    harvestStrictStorage: !!(farm as any).harvestStrictStorage,
  };
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-2 border-b border-border mb-5">
      <h3 className="text-base font-bold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default", mutation }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive"; mutation?: { isError: boolean; isPending: boolean; error: unknown } }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        {mutation && <DialogMutationError mutation={mutation} message="Failed — please try again." />}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={mutation?.isPending}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BcmsCredentialsCard({ farmId, bcmsHoldingNumber }: { farmId: number; bcmsHoldingNumber?: string }) {
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [holding, setHolding] = useState(bcmsHoldingNumber ?? "");
  const [dirty, setDirty] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);

  const credsQ = useQuery({
    queryKey: ["bcms-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bcms-credentials`).then(r => r.json()),
    enabled: !!farmId,
  });
  const creds = credsQ.data;

  useEffect(() => {
    if (creds?.ctwsUsername) setUsername(creds.ctwsUsername);
    if (creds?.holdingNumber) setHolding(creds.holdingNumber);
    else if (bcmsHoldingNumber) setHolding(bcmsHoldingNumber);
  }, [creds, bcmsHoldingNumber]);

  const saveMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/bcms-credentials`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "BCMS credentials saved" }); credsQ.refetch(); setDirty(false); setPassword(""); },
    onError: () => toast({ title: "Failed to save credentials", variant: "destructive" }),
  });
  const testMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/bcms-credentials/test`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => toast({ title: d.success ? (d.sandbox ? "Sandbox test passed" : "Connected to CTWS") : "Connection failed", description: d.message, variant: d.success ? "default" : "destructive" }),
    onError: () => toast({ title: "Test failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/bcms-credentials`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Credentials removed" }); credsQ.refetch(); setUsername(""); setPassword(""); setHolding(bcmsHoldingNumber ?? ""); setPendingConfirm(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const statusBadge = () => {
    if (!creds) return null;
    if (!creds.configured) return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <WifiOff size={12} />Not configured
      </span>
    );
    if (creds.sandboxMode) return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fef3c7", color: "#92400e", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <Shield size={12} />Sandbox mode — credentials saved
      </span>
    );
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <ShieldCheck size={12} />Live — connected to CTWS
      </span>
    );
  };

  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-5">
        <SectionHeader
          title="BCMS / CTS One-Click Submission"
          description="Connect your CTS Web Services (CTWS) credentials to enable one-click cattle movement submission directly from the Movements register. Sandbox mode is active until BDE obtains DEFRA software vendor credentials."
        />

        {/* Platform status banner */}
        <div style={{ background: creds?.ddtsConfigured ? "#f0fdf4" : "#fffbeb", border: `1px solid ${creds?.ddtsConfigured ? "#bbf7d0" : "#fde68a"}`, borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ marginTop: 2 }}>{creds?.ddtsConfigured ? <ShieldCheck size={15} color="#166534" /> : <Shield size={15} color="#92400e" />}</div>
          <div>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: creds?.ddtsConfigured ? "#166534" : "#92400e", marginBottom: 2 }}>
              {creds?.ddtsConfigured ? "Platform live credentials active" : "Awaiting DEFRA vendor registration"}
            </p>
            <p style={{ fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }}>
              {creds?.ddtsConfigured
                ? "BDE Farm Trac is registered with DEFRA as an approved CTWS software vendor. Submissions go directly to BCMS."
                : "BDE has submitted a vendor registration application to DEFRA/RPA and is awaiting approval (typically 1–2 weeks). Until vendor credentials are issued, submissions simulate the full CTWS flow and log the XML payload — no cattle data is sent to BCMS. Enter your CTS credentials now so the system is ready the moment registration completes. In the meantime, continue notifying BCMS directly via BCMS Online or your existing software."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>Credential status:</p>
          {credsQ.isLoading ? <Loader2 size={14} className="animate-spin" /> : statusBadge()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>CTWS Username</Label>
            <Input
              placeholder="nnn-nnn-nnn"
              value={username}
              onChange={e => { setUsername(e.target.value); setDirty(true); }}
              className="mt-1 font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">Your CTS Web Services username — format <span className="font-mono">nnn-nnn-nnn</span>. <strong>Different</strong> from your LIS portal login. Contact the APHA livestock helpline (0300 020 0301) if you don't have one.</p>
          </div>
          <div>
            <Label>CTWS Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPass ? "text" : "password"}
                placeholder={creds?.configured && !dirty ? "••••••••••• (saved)" : "Enter password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setDirty(true); }}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your CTWS portal password. Stored with base64 encoding — do not share this page.</p>
          </div>
          <div>
            <Label>Holding Number</Label>
            <Input
              placeholder="e.g. 32/541/0001"
              value={holding}
              onChange={e => { setHolding(e.target.value); setDirty(true); }}
              className="mt-1 font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">Your CPH / BCMS holding number. Pre-filled from Livestock Movement Reporting above if set.</p>
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <Button
              disabled={saveMut.isPending || !username || !holding}
              onClick={() => saveMut.mutate({ ctwsUsername: username, ctwsPassword: password || undefined, holdingNumber: holding })}
              className="bg-green-800 hover:bg-green-900 text-white"
            >
              {saveMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
              Save Credentials
            </Button>
            <Button
              variant="outline"
              disabled={testMut.isPending || !creds?.configured}
              onClick={() => testMut.mutate()}
              title={!creds?.configured ? "Save credentials first" : "Test connection to CTWS"}
            >
              {testMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Wifi size={14} className="mr-1" />}
              Test Connection
            </Button>
            {creds?.configured && (
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setPendingConfirm({ msg: "Remove BCMS credentials for this farm?", fn: () => deleteMut.mutate() })}>
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        {creds?.lastTestedAt && (
          <div style={{ fontSize: "0.78rem", color: creds.testStatus === "ok" ? "#166534" : "#dc2626", display: "flex", alignItems: "center", gap: 6 }}>
            {creds.testStatus === "ok" ? <ShieldCheck size={13} /> : <WifiOff size={13} />}
            Last test: {new Date(creds.lastTestedAt).toLocaleString("en-GB")} — {creds.testMessage}
          </div>
        )}

        <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "0.875rem 1rem" }}>
          <p style={{ fontSize: "0.78rem", color: "#3730a3", fontWeight: 600, marginBottom: 4 }}>How to get your CTWS credentials</p>
          <ol style={{ fontSize: "0.78rem", color: "#4338ca", paddingLeft: "1.25rem", lineHeight: 1.8, margin: 0 }}>
            <li>Call the APHA livestock helpline on <strong>0300 020 0301</strong> (Mon–Fri 8:30–17:00) and ask for your CTS Web Services (CTWS) username and password.</li>
            <li>Your CTWS username is in the format <span className="font-mono">nnn-nnn-nnn</span> — it is <strong>not</strong> the same as your LIS portal login at <a href="https://portal.livestockinformation.org.uk" target="_blank" rel="noopener noreferrer" className="underline">portal.livestockinformation.org.uk</a>.</li>
            <li>Once saved, click "Test Connection" to verify your credentials against the BCMS test server.</li>
          </ol>
        </div>
      <ConfirmDialog
        open={!!pendingConfirm}
        title="Remove BCMS Credentials"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); }}
        onCancel={() => { setPendingConfirm(null); deleteMut.reset(); }}
        confirmLabel="Remove"
        confirmVariant="destructive"
        mutation={deleteMut}
      />
      </CardContent>
    </Card>
  );
}

type LisSyncResult = {
  success: boolean;
  sandbox?: boolean;
  cphNumber?: string;
  cphValid?: boolean | null;
  message: string;
  pendingReviews: unknown[];
  recentTransfers: unknown[];
  approvedMovements: unknown[];
  attempts: Record<string, { status: number; ok: boolean; data: unknown } | { error: string }>;
};

function LipConnectionCard({ farmId }: { farmId: number }) {
  const { toast } = useToast();

  const credsQ = useQuery({
    queryKey: ["lip-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-credentials`).then(r => r.json()),
    enabled: !!farmId,
  });
  const creds = credsQ.data;

  // Handle OAuth return params (?lip_connected=true or ?lip_error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("lip_connected");
    const error = params.get("lip_error");
    if (connected === "true") {
      toast({ title: "LIS Cattle account connected", description: "Your LIS sign-in was successful." });
      credsQ.refetch();
      const u = new URL(window.location.href);
      u.searchParams.delete("lip_connected");
      window.history.replaceState({}, "", u.toString());
      // Notify the opener tab (this may be a popup window) so it refreshes its
      // connection status immediately instead of waiting for a manual refresh.
      try {
        new BroadcastChannel("lip-connection").postMessage({ farmId, type: "connected" });
      } catch {
        // BroadcastChannel unsupported — opener will still pick up the change
        // next time it refetches (e.g. Test API, or a manual page reload).
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

  // Listen for the popup tab announcing a successful connection so this
  // (opener) tab's card updates without needing a manual refresh.
  useEffect(() => {
    let channel: BroadcastChannel | undefined;
    try {
      channel = new BroadcastChannel("lip-connection");
      channel.onmessage = (event) => {
        if (event.data?.farmId === farmId && event.data?.type === "connected") {
          credsQ.refetch();
        }
      };
    } catch {
      // BroadcastChannel unsupported in this browser — no-op.
    }
    return () => channel?.close();
  }, [farmId]);

  const testMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/lip-credentials/test`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => {
      toast({ title: d.success ? "LIP API reachable" : "LIP API test result", description: d.message, variant: d.success ? "default" : "destructive" });
      credsQ.refetch();
    },
    onError: () => toast({ title: "Test failed", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/lip-credentials`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      return r.json();
    },
    onSuccess: () => { toast({ title: "LIS Cattle account disconnected" }); credsQ.refetch(); },
    onError: () => toast({ title: "Failed to disconnect", variant: "destructive" }),
  });

  const handleSignIn = async () => {
    const returnUrl = window.location.href.split("?")[0];
    try {
      const r = await fetch(`/api/lip/authorize?farmId=${farmId}&returnUrl=${encodeURIComponent(returnUrl)}`, {
        headers: { Accept: "application/json" },
      });
      const data = await r.json();
      if (!r.ok || !data.url) throw new Error(data?.error ?? "Failed to start LIS sign-in");
      window.open(data.url, "_blank", "noopener");
    } catch (e: any) {
      toast({ title: "Sign-in failed", description: e?.message, variant: "destructive" });
    }
  };

  const isConnected = creds?.configured;

  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-5">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <SectionHeader
            title="LIS Cattle (LIP) Integration"
            description="LIS Cattle (LIP) API submissions are temporarily paused from 21 July 2026 while the Livestock Information Service transitions cattle traceability services. Existing records are preserved. Further guidance expected from LIS in September/October 2026."
          />
          <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700 }}>
            <AlertTriangle size={10} /> Paused
          </span>
        </div>

        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={15} color="#92400e" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#92400e", marginBottom: 4 }}>Service Temporarily Paused — Effective 21 July 2026</p>
            <p style={{ fontSize: "0.78rem", color: "#78350f", lineHeight: 1.5 }}>
              The Livestock Information Service has confirmed that the LIP Cattle API and Alpha Developer Hub are pausing while cattle traceability services transition to a new service operated by Defra. <strong>New cattle submissions via LIP are not available at this time.</strong> Please continue reporting cattle movements via <strong>BCMS (CTS Web Services)</strong> as usual. LIS will provide further guidance and a revised migration approach in September/October 2026 ahead of the BEID mandate in 2027.
            </p>
          </div>
        </div>

        {isConnected ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ShieldCheck size={15} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#166534", marginBottom: 2 }}>
                LIS Cattle account connected{creds?.sandboxMode ? " (sandbox)" : ""}
              </p>
              <p style={{ fontSize: "0.78rem", color: "#4b7c59", lineHeight: 1.5 }}>
                {creds?.testMessage ?? "Your farm is linked to LIS LIP. Cattle movement notifications will be submitted via this account."}
              </p>
            </div>
            <button
              onClick={() => deleteMut.mutate()}
              disabled={deleteMut.isPending}
              style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
            >
              {deleteMut.isPending ? <Loader2 size={11} className="animate-spin" /> : <LogOut size={11} />}
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Cpu size={15} color="#7c3aed" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#7c3aed", marginBottom: 2 }}>Connect your LIS account</p>
              <p style={{ fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }}>
                LIP uses the same LIS sign-in flow as the sheep/goat/deer integration — you sign in once with your LIS credentials and BDE Farm Trac is authorised to submit cattle movements on your behalf. No password is stored.
              </p>
            </div>
          </div>
        )}

        {creds?.testStatus && creds.testStatus !== "ok" && (
          <div style={{ fontSize: "0.78rem", color: creds.testStatus === "partial" ? "#92400e" : "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.5rem 0.875rem" }}>
            {creds.testMessage}
          </div>
        )}

        {creds?.lastTestedAt && creds.testStatus !== "ok" && (
          <div style={{ fontSize: "0.72rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: 5 }}>
            <Shield size={11} />
            Last tested: {new Date(creds.lastTestedAt).toLocaleString("en-GB")}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            disabled
            title="LIS Cattle API sign-in is temporarily unavailable during the service transition"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e5e7eb", color: "#9ca3af", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: "0.82rem", fontWeight: 600, cursor: "not-allowed" }}
          >
            <LogIn size={13} />
            Sign in with LIS
          </button>
          <button
            onClick={() => testMut.mutate()}
            disabled={testMut.isPending || credsQ.isLoading}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "#7c3aed", border: "1px solid #ddd6fe", borderRadius: 8, padding: "7px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: testMut.isPending ? "not-allowed" : "pointer", opacity: testMut.isPending ? 0.7 : 1 }}
          >
            {testMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Test API
          </button>
        </div>

        {!creds?.configured && (
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>How to connect:</p>
            <ol style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                "Click Sign in with LIS — you will be taken to the official Livestock Information Service login page.",
                "Sign in with your LIS account email and password (the same credentials you use at livestockinformation.org.uk).",
                "After sign-in, LIS redirects you back here and your account is connected. No password is stored in BDE Farm Trac.",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }}>{item}</li>
              ))}
            </ol>
          </div>
        )}

        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>What LIP will enable once the LIS service transition is complete (expected Q1 2027):</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              "One-click cattle movement notifications (replacing manual BCMS Online entry)",
              "Direct cattle birth and death registration with LIS acknowledgement",
              "Real-time herd sync — animals verified against the national cattle database",
              "Automatic movement reference numbers stored alongside your register",
            ].map(item => (
              <li key={item} style={{ display: "flex", gap: 8, fontSize: "0.78rem", color: "#6b7280" }}>
                <span style={{ color: "#7c3aed", fontWeight: 700, flexShrink: 0 }}>›</span>{item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function LisConnectionCard({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [syncResult, setSyncResult] = useState<LisSyncResult | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const credsQ = useQuery({
    queryKey: ["lis-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-credentials`).then(r => r.json()),
    enabled: !!farmId,
  });
  const creds = credsQ.data;

  // Handle OAuth return params (?lis_connected=true or ?lis_error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("lis_connected");
    const error = params.get("lis_error");
    if (connected === "true") {
      toast({ title: "LIS account connected", description: "Your LIS sign-in was successful." });
      credsQ.refetch();
      const u = new URL(window.location.href);
      u.searchParams.delete("lis_connected");
      window.history.replaceState({}, "", u.toString());
      // If this tab was opened as a popup by the sign-in flow, close it so the
      // user lands back on their original tab. window.close() is a no-op on
      // tabs the user opened directly, so this is safe to call unconditionally.
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
    onSuccess: (d) => { credsQ.refetch(); toast({ title: d.success ? (d.sandbox ? "Sandbox test passed" : "Connected to LIS") : "Connection failed", description: d.message, variant: d.success ? "default" : "destructive" }); },
    onError: (e: any) => toast({ title: "Test failed", description: e?.message, variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/lis-credentials`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      return r.json();
    },
    onSuccess: () => { toast({ title: "LIS account disconnected" }); credsQ.refetch(); setPendingConfirm(null); },
    onError: () => toast({ title: "Failed to disconnect", variant: "destructive" }),
  });
  const syncMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/lis/sync-herds`, { method: "POST" });
      const data = await r.json() as LisSyncResult;
      if (!r.ok) throw new Error(data?.message ?? "Sync failed");
      return data;
    },
    onSuccess: (d) => {
      setSyncResult(d);
      credsQ.refetch();
      toast({ title: d.success ? "LIS sync complete" : "LIS sync returned no data", description: d.message, variant: d.success ? "default" : "destructive" });
    },
    onError: (e: any) => toast({ title: "Sync failed", description: e?.message, variant: "destructive" }),
  });

  const handleSignIn = async () => {
    // Use the full absolute URL so the callback on api.bdefarmtrac.co.uk
    // can redirect back to the correct domain after sign-in.
    const returnUrl = window.location.href.split("?")[0];
    try {
      const r = await fetch(`/api/lis/authorize?farmId=${farmId}&returnUrl=${encodeURIComponent(returnUrl)}`, {
        headers: { Accept: "application/json" },
      });
      const data = await r.json();
      if (!r.ok || !data.url) throw new Error(data?.error ?? "Failed to start LIS sign-in");
      // Open in a new tab — B2C login pages block iframe embedding (X-Frame-Options),
      // and window.top is cross-origin in dev environments like Replit's preview.
      window.open(data.url, "_blank", "noopener");
    } catch (e: any) {
      toast({ title: "LIS sign-in failed", description: e?.message, variant: "destructive" });
    }
  };

  const statusBadge = () => {
    if (!creds) return null;
    if (!creds.configured) return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <WifiOff size={12} />Not connected
      </span>
    );
    if (creds.sandboxMode) return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <Shield size={12} />Sandbox mode — signed in
      </span>
    );
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <ShieldCheck size={12} />Connected to LIS
      </span>
    );
  };

  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-5">
        <SectionHeader
          title="LIS / Livestock Information Service"
          description="Connect your Livestock Information Service (LIS) account to enable one-click sheep, goat, pig and deer movement submission directly from the Movements register. LIS is the England government platform replacing eAML2 for sheep, goat, pig and deer movement reporting."
        />

        {/* Platform status banner */}
        <div style={{ background: creds?.subscriptionKeyConfigured ? "#f0fdf4" : "#eff6ff", border: `1px solid ${creds?.subscriptionKeyConfigured ? "#bbf7d0" : "#bfdbfe"}`, borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ marginTop: 2 }}>{creds?.subscriptionKeyConfigured ? <ShieldCheck size={15} color="#166534" /> : <Shield size={15} color="#1d4ed8" />}</div>
          <div>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: creds?.subscriptionKeyConfigured ? "#166534" : "#1d4ed8", marginBottom: 2 }}>
              {creds?.subscriptionKeyConfigured ? "Platform subscription key active" : "Sandbox mode active"}
            </p>
            <p style={{ fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }}>
              {creds?.subscriptionKeyConfigured
                ? "BDE Farm Trac has a registered LIS Developer Hub subscription key. Submissions go directly to the Livestock Information Service."
                : "A LIS Developer Hub subscription key has not yet been configured by BDE. Submissions will simulate the full CLA API flow and log the JSON payload — no data will be sent to LIS."}
            </p>
          </div>
        </div>

        {/* Connection status + sign-in */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>Connection:</p>
            {credsQ.isLoading ? <Loader2 size={14} className="animate-spin" /> : statusBadge()}
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleSignIn}>
              <ExternalLink size={14} className="mr-1.5" />
              {creds?.configured ? "Re-sign in with LIS" : "Sign in with LIS"}
            </Button>
            {creds?.configured && (
              <>
                <Button variant="outline" size="sm" disabled={testMut.isPending} onClick={() => testMut.mutate()}>
                  {testMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Wifi size={14} className="mr-1" />}
                  Test Connection
                </Button>
                {creds?.testStatus === "ok" && (
                  <Button variant="outline" size="sm" disabled={syncMut.isPending} onClick={() => syncMut.mutate()}>
                    {syncMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <RefreshCw size={14} className="mr-1" />}
                    Sync from LIS
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setPendingConfirm({ msg: "Disconnect LIS account for this farm? You can reconnect at any time.", fn: () => deleteMut.mutate() })}>
                  <Trash2 size={14} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* How sign-in works */}
        {!creds?.configured && (
          <div style={{ background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.875rem 1rem" }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>How sign-in works</p>
            <ol style={{ fontSize: "0.78rem", color: "#4b5563", paddingLeft: "1.25rem", lineHeight: 1.8, margin: 0 }}>
              <li>Click <strong>Sign in with LIS</strong> — you will be taken to the official Livestock Information Service login page.</li>
              <li>Sign in with your LIS account email and password (the same credentials you use at <a href="https://cla.livestockinformation.org.uk" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">cla.livestockinformation.org.uk</a>).</li>
              <li>After sign-in, LIS redirects you back here and your account is connected. No password is stored in BDE Farm Trac.</li>
            </ol>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }}>
              Don't have a LIS account? Register free at <a href="https://cla.livestockinformation.org.uk" target="_blank" rel="noopener noreferrer" className="underline">cla.livestockinformation.org.uk</a>.
            </p>
          </div>
        )}

        {creds?.lastTestedAt && (
          <div style={{ fontSize: "0.78rem", color: creds.testStatus === "ok" ? "#166534" : "#dc2626", display: "flex", alignItems: "center", gap: 6 }}>
            {creds.testStatus === "ok" ? <ShieldCheck size={13} /> : <WifiOff size={13} />}
            Last test: {new Date(creds.lastTestedAt).toLocaleString("en-GB")} — {creds.testMessage}
          </div>
        )}
        {(creds as any)?.lisLastSyncedAt && (
          <div style={{ fontSize: "0.78rem", color: "#374151", display: "flex", alignItems: "flex-start", gap: 6 }}>
            <RefreshCw size={13} style={{ color: "#6b7280", flexShrink: 0, marginTop: 2 }} />
            <span>
              <span style={{ fontWeight: 600 }}>Last synced:</span>{" "}
              {new Date((creds as any).lisLastSyncedAt).toLocaleString("en-GB")}
              {(creds as any).lisLastSyncSummary
                ? <span style={{ color: "#6b7280" }}> — {(creds as any).lisLastSyncSummary}</span>
                : null}
            </span>
          </div>
        )}

        {Array.isArray((creds as any)?.lisSyncHistory) && (creds as any).lisSyncHistory.length > 0 && (
          <details style={{ fontSize: "0.78rem" }}>
            <summary style={{ cursor: "pointer", color: "#6b7280", userSelect: "none", listStyle: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: "0.7rem" }}>▸</span>
              Sync history ({(creds as any).lisSyncHistory.length} {(creds as any).lisSyncHistory.length === 1 ? "entry" : "entries"})
            </summary>
            <div style={{ marginTop: 6, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              {((creds as any).lisSyncHistory as Array<{ syncedAt: string; summary: string; cphValid: boolean | null; imported: { approved: number; transfers: number; reviews: number } }>).slice(0, 10).map((entry, i, arr) => (
                <div key={i} style={{ padding: "6px 10px", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, fontWeight: 700, color: entry.cphValid === true ? "#16a34a" : entry.cphValid === false ? "#dc2626" : "#6b7280" }}>
                    {entry.cphValid === true ? "✓" : entry.cphValid === false ? "✗" : "○"}
                  </span>
                  <span>
                    <span style={{ color: "#374151", fontWeight: 500 }}>{new Date(entry.syncedAt).toLocaleString("en-GB")}</span>
                    {" — "}
                    <span style={{ color: "#6b7280" }}>{entry.summary}</span>
                    {entry.imported && (entry.imported.approved + entry.imported.transfers + entry.imported.reviews) > 0 && (
                      <span style={{ marginLeft: 6, color: "#0369a1", fontSize: "0.72rem" }}>
                        ({[
                          entry.imported.approved > 0 ? `${entry.imported.approved} approved` : null,
                          entry.imported.transfers > 0 ? `${entry.imported.transfers} transfer${entry.imported.transfers !== 1 ? "s" : ""}` : null,
                          entry.imported.reviews > 0 ? `${entry.imported.reviews} review${entry.imported.reviews !== 1 ? "s" : ""}` : null,
                        ].filter(Boolean).join(", ")})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}

        {syncResult && (
          <div style={{ border: `1px solid ${syncResult.success ? "#bbf7d0" : "#fecaca"}`, borderRadius: 10, padding: "0.875rem 1rem", background: syncResult.success ? "#f0fdf4" : "#fef2f2" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: syncResult.success ? "#166534" : "#dc2626" }}>
                {syncResult.success ? "✓ " : "✗ "}{syncResult.message}
              </p>
              <button
                onClick={() => setShowDebug(!showDebug)}
                style={{ fontSize: "0.72rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", flexShrink: 0 }}
              >
                {showDebug ? "Hide" : "Show"} API debug
              </button>
            </div>

            {syncResult.success && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {syncResult.cphValid != null && (
                  <div style={{ background: syncResult.cphValid ? "#dcfce7" : "#fee2e2", borderRadius: 6, padding: "4px 10px", fontSize: "0.76rem", color: syncResult.cphValid ? "#166534" : "#dc2626", fontWeight: 600 }}>
                    {syncResult.cphValid ? "✓" : "✗"} CPH {syncResult.cphNumber} — {syncResult.cphValid ? "Registered in LIS" : "Not recognised by LIS"}
                  </div>
                )}
                {syncResult.pendingReviews.length > 0 && (
                  <div style={{ background: "#fef3c7", borderRadius: 6, padding: "4px 10px", fontSize: "0.76rem", color: "#92400e", fontWeight: 600 }}>
                    ⚠ {syncResult.pendingReviews.length} movement(s) awaiting review
                  </div>
                )}
                {syncResult.recentTransfers.length > 0 && (
                  <div style={{ background: "#eff6ff", borderRadius: 6, padding: "4px 10px", fontSize: "0.76rem", color: "#1e40af" }}>
                    {syncResult.recentTransfers.length} recent transfer request(s)
                  </div>
                )}
                {syncResult.approvedMovements.length > 0 && (
                  <div style={{ background: "#f0f9ff", borderRadius: 6, padding: "4px 10px", fontSize: "0.76rem", color: "#0369a1" }}>
                    {syncResult.approvedMovements.length} approved movement(s)
                  </div>
                )}
              </div>
            )}

            {showDebug && (
              <div style={{ marginTop: 10, background: "#1e293b", borderRadius: 6, padding: "0.75rem", overflowX: "auto" }}>
                <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>API endpoint attempts</p>
                {Object.entries(syncResult.attempts).map(([path, result]: [string, any]) => (
                  <div key={path} style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: "0.72rem", fontFamily: "monospace", color: result.ok ? "#4ade80" : result.error ? "#f87171" : "#fbbf24", marginBottom: 2 }}>
                      {result.ok ? "✓" : result.error ? "✗" : "○"} {path} {result.status ? `HTTP ${result.status}` : ""}
                    </p>
                    <pre style={{ fontSize: "0.68rem", color: "#cbd5e1", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                      {JSON.stringify(result.data ?? result.error, null, 2).slice(0, 800)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "0.875rem 1rem" }}>
          <p style={{ fontSize: "0.78rem", color: "#1d4ed8", fontWeight: 600, marginBottom: 4 }}>How to get your LIS credentials &amp; how to go live</p>
          <ol style={{ fontSize: "0.78rem", color: "#1e40af", paddingLeft: "1.25rem", lineHeight: 1.8, margin: 0 }}>
            <li>Register or sign in at <a href="https://cla.livestockinformation.org.uk" target="_blank" rel="noopener noreferrer" className="underline">cla.livestockinformation.org.uk</a> using your email address.</li>
            <li>Enter your LIS username (email) and password above and click <strong>Save Credentials</strong>.</li>
            <li>Click <strong>Test Connection</strong> to verify — in sandbox mode this simulates a successful connection.</li>
            <li>Once connected, a blue <strong>Test Submit (LIS)</strong> button will appear on each sheep, goat, pig and deer movement row in the Movements register.</li>
            <li>For live submissions: BDE must register on the <a href="https://livestockinformation.org.uk/developer-hub/" target="_blank" rel="noopener noreferrer" className="underline">LIS Developer Hub</a> and set the <span className="font-mono">LIS_SUBSCRIPTION_KEY</span> environment variable. Submissions then go directly to LIS automatically.</li>
          </ol>
        </div>
      <ConfirmDialog
        open={!!pendingConfirm}
        title="Remove LIS Credentials"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); }}
        onCancel={() => { setPendingConfirm(null); deleteMut.reset(); }}
        confirmLabel="Remove"
        confirmVariant="destructive"
        mutation={deleteMut}
      />
      </CardContent>
    </Card>
  );
}

const PAYMENT_TERMS_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "21", label: "21 days" },
  { value: "30", label: "30 days" },
  { value: "45", label: "45 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
] as const;

// ─── GPS Integration Card ─────────────────────────────────────────────────────

type GpsIntegration = {
  id: number; provider: string; status: string;
  apiKeySet: boolean; webhookSecretSet: boolean;
  accessTokenSet: boolean; tokenExpiresAt: string | null;
  last_sync_at: string | null; last_error: string | null; display_name: string | null;
};

const GPS_PROVIDER_META: Record<string, { label: string; logo: string; type: "apikey" | "oauth" | "oauth_active" | "credentials"; description: string }> = {
  teltonika: {
    label: "Teltonika RMS",
    logo: "T",
    type: "oauth_active",
    description: "Connect your Teltonika RMS fleet account via OAuth. Live positions polled every 5 minutes from all linked devices.",
  },
  samsara: {
    label: "Samsara",
    logo: "S",
    type: "apikey",
    description: "Connect your Samsara fleet account via API key. Vehicle positions update via Samsara webhooks.",
  },
  webfleet: {
    label: "Webfleet (TomTom)",
    logo: "W",
    type: "credentials",
    description: "Connect using your Webfleet account credentials. Requires a Webfleet subscription with API access.",
  },
  john_deere: {
    label: "John Deere Operations Center",
    logo: "JD",
    type: "oauth_active",
    description: "Sync positions from John Deere machines with JDLink telematics via Operations Center.",
  },
  agco: {
    label: "AGCO Connect (Fendt / MF)",
    logo: "AG",
    type: "oauth",
    description: "Sync positions from Fendt, Massey Ferguson, Valtra and Challenger machines via AGCO Fuse telematics. Requires a direct API agreement with AGCO.",
  },
};

function GpsIntegrationCard({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [wfCreds, setWfCreds] = useState({ account: "", username: "", password: "", apiKey: "" });
  const [showWfPass, setShowWfPass] = useState(false);

  const integrationsQ = useQuery<{ integrations: GpsIntegration[] }>({
    queryKey: ["gps-integrations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/gps-integrations`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const integrationsByProvider = Object.fromEntries(
    (integrationsQ.data?.integrations ?? []).map(i => [i.provider, i])
  );

  const webhookBaseUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/farms/${farmId}/gps/webhook`
    : `/api/farms/${farmId}/gps/webhook`;

  async function saveApiKey(provider: string) {
    const apiKey = apiKeyInputs[provider] ?? "";
    if (!apiKey.trim()) return;
    setSaving(provider);
    try {
      const r = await fetch(`/api/farms/${farmId}/gps-integrations/${provider}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "GPS integration saved", description: `${GPS_PROVIDER_META[provider]?.label} connected.` });
      setApiKeyInputs(p => ({ ...p, [provider]: "" }));
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
        body: JSON.stringify(wfCreds),
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

  async function removeIntegration(provider: string) {
    setRemoving(provider);
    try {
      await fetch(`/api/farms/${farmId}/gps-integrations/${provider}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      toast({ title: "GPS integration removed" });
      integrationsQ.refetch();
    } catch {
      toast({ title: "Remove failed", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Satellite size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-base">GPS Tracking Integration</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Connect vehicle and plant GPS tracking providers to show live asset positions on the Resource Map.
              Each holding can use one or more providers simultaneously.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(GPS_PROVIDER_META).map(([provider, meta]) => {
            const existing = integrationsByProvider[provider];
            const connected = existing?.status === "connected";
            const isExpanded = expandedProvider === provider;
            const isOAuth = meta.type === "oauth";
            const isOAuthActive = meta.type === "oauth_active";
            const isCredentials = meta.type === "credentials";

            return (
              <div key={provider} className={`rounded-lg border transition-colors ${connected ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white"}`}>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setExpandedProvider(isExpanded ? null : provider)}
                >
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {meta.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{meta.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {connected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <Wifi size={10} /> Connected
                      </span>
                    ) : isOAuth ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Pending registration
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <WifiOff size={10} /> Not configured
                      </span>
                    )}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                    {isOAuthActive ? (
                      /* ── Active OAuth providers (Teltonika, John Deere, …) ── */
                      connected ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg">
                            <Wifi size={15} className="text-green-600 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-green-900">Connected to {meta.label}</p>
                              <p className="text-xs text-green-700 mt-0.5">
                                {existing?.last_sync_at
                                  ? `Last sync: ${new Date(existing.last_sync_at).toLocaleString("en-GB")}`
                                  : "Waiting for first poll (runs every 5 minutes)"}
                              </p>
                              {existing?.tokenExpiresAt && (
                                <p className="text-xs text-green-600 mt-0.5">
                                  Token valid until: {new Date(existing.tokenExpiresAt).toLocaleString("en-GB")}
                                </p>
                              )}
                            </div>
                          </div>
                          {existing?.last_error && (
                            <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
                              <WifiOff size={12} className="shrink-0 mt-0.5" />
                              <span>{existing.last_error}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-xs text-muted-foreground">Positions polled every 5 minutes</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 h-7 text-xs"
                              onClick={() => removeIntegration(provider)}
                              disabled={removing === provider}
                            >
                              {removing === provider ? <Loader2 size={12} className="animate-spin mr-1" /> : <Trash2 size={12} className="mr-1" />}
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <Link2 size={15} className="text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-blue-900">
                              <p className="font-semibold mb-1">Connect your {meta.label} account</p>
                              <p className="text-xs text-blue-800">
                                Click the button below to sign in and authorise BDE Farm Trac to read your machine list and live positions. You&apos;ll be redirected back here automatically.
                              </p>
                            </div>
                          </div>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            onClick={() => {
                              window.location.href = `/api/gps/${provider}/authorize?farmId=${farmId}`;
                            }}
                          >
                            <Link2 size={14} />
                            Connect with {meta.label}
                          </Button>
                          <div className="text-xs text-muted-foreground space-y-1 pt-1">
                            <p className="font-medium">Scopes requested:</p>
                            {provider === "teltonika" && (
                              <>
                                <p><span className="font-mono bg-gray-100 px-1 rounded">devices:read</span> — list your devices</p>
                                <p><span className="font-mono bg-gray-100 px-1 rounded">device_location:read</span> — read live GPS positions</p>
                              </>
                            )}
                            {provider === "john_deere" && (
                              <>
                                <p><span className="font-mono bg-gray-100 px-1 rounded">ag1</span> — read your Operations Center account</p>
                                <p><span className="font-mono bg-gray-100 px-1 rounded">eq1</span> — read machine list and GPS positions</p>
                                <p><span className="font-mono bg-gray-100 px-1 rounded">offline_access</span> — keep the connection active</p>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    ) : isCredentials ? (
                      /* ── Webfleet — 3-field credential form ── */
                      connected ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg">
                            <Wifi size={15} className="text-green-600 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-green-900">Connected to Webfleet</p>
                              <p className="text-xs text-green-700 mt-0.5">
                                {existing?.last_sync_at
                                  ? `Last sync: ${new Date(existing.last_sync_at).toLocaleString("en-GB")}`
                                  : "Waiting for first poll (runs every 5 minutes)"}
                              </p>
                            </div>
                          </div>
                          {existing?.last_error && (
                            <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
                              <WifiOff size={12} className="shrink-0 mt-0.5" />
                              <span>{existing.last_error}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-xs text-muted-foreground">Positions polled every 5 minutes via Webfleet.connect</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 h-7 text-xs"
                              onClick={() => removeIntegration(provider)}
                              disabled={removing === provider}
                            >
                              {removing === provider ? <Loader2 size={12} className="animate-spin mr-1" /> : <Trash2 size={12} className="mr-1" />}
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <Key size={15} className="text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-blue-900">
                              <p className="font-semibold mb-1">Enter your Webfleet account credentials</p>
                              <p className="text-xs text-blue-800">Use the same account name, username and password you log in to Webfleet with. Your credentials are stored encrypted and never shared.</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Webfleet Account Name</Label>
                            <Input
                              placeholder="e.g. mycompany"
                              value={wfCreds.account}
                              onChange={e => setWfCreds(p => ({ ...p, account: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Username</Label>
                            <Input
                              placeholder="Webfleet username"
                              value={wfCreds.username}
                              onChange={e => setWfCreds(p => ({ ...p, username: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Password</Label>
                            <div className="relative">
                              <Input
                                type={showWfPass ? "text" : "password"}
                                placeholder="Webfleet password"
                                value={wfCreds.password}
                                onChange={e => setWfCreds(p => ({ ...p, password: e.target.value }))}
                                className="text-sm pr-9"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowWfPass(p => !p)}
                              >
                                {showWfPass ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Webfleet API Key</Label>
                            <Input
                              placeholder="Your fleet API key from Webfleet"
                              value={wfCreds.apiKey}
                              onChange={e => setWfCreds(p => ({ ...p, apiKey: e.target.value }))}
                              className="text-sm font-mono"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Find this in your Webfleet account under <span className="font-medium">Tools → Webfleet Integration → API key</span>
                            </p>
                          </div>
                          <Button
                            className="w-full gap-2"
                            onClick={saveWebfleetCreds}
                            disabled={saving === "webfleet" || !wfCreds.account.trim() || !wfCreds.username.trim() || !wfCreds.password.trim() || !wfCreds.apiKey.trim()}
                          >
                            {saving === "webfleet" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save & Connect Webfleet
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Requires a Webfleet subscription with API access enabled. Contact your Webfleet account manager if API access is not available on your plan.
                          </p>
                        </div>
                      )
                    ) : isOAuth ? (
                      <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                        <Link2 size={15} className="text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-amber-900">
                          <p className="font-semibold mb-1">Developer registration required</p>
                          <p className="text-xs">
                            {provider === "john_deere" && "Apply at developer.deere.com — John Deere API access requires a formal application review (typically 2–4 weeks). OAuth connection will appear here once approved."}
                            {provider === "agco" && "Apply via the AGCO Connect developer programme — approval typically takes 2–4 weeks. OAuth connection will appear here once issued."}
                          </p>
                          {existing?.last_sync_at && (
                            <p className="text-xs mt-2 text-amber-700">Last sync: {new Date(existing.last_sync_at).toLocaleString("en-GB")}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* API Key */}
                        <div>
                          <Label htmlFor={`gps-apikey-${provider}`} className="flex items-center gap-1.5">
                            <Key size={12} />
                            {provider === "teltonika" ? "Teltonika Cloud API Key" : "Samsara API Token"}
                          </Label>
                          {connected && !apiKeyInputs[provider] && (
                            <div className="flex items-center gap-2 mt-1.5 p-2.5 bg-green-50 border border-green-200 rounded-md">
                              <ShieldCheck size={14} className="text-green-600 shrink-0" />
                              <span className="text-xs text-green-800 font-medium">API key is saved and encrypted</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-auto text-xs h-7 text-green-700 hover:text-green-800"
                                onClick={() => setApiKeyInputs(p => ({ ...p, [provider]: " " }))}
                              >
                                Replace
                              </Button>
                            </div>
                          )}
                          {(!connected || apiKeyInputs[provider] !== undefined) && (
                            <div className="flex gap-2 mt-1.5">
                              <div className="relative flex-1">
                                <Input
                                  id={`gps-apikey-${provider}`}
                                  type={showKey[provider] ? "text" : "password"}
                                  className="pr-9 font-mono text-sm"
                                  placeholder={provider === "samsara" ? "samsara_api_XXXXXXXXX" : "Enter API key..."}
                                  value={apiKeyInputs[provider] ?? ""}
                                  onChange={e => setApiKeyInputs(p => ({ ...p, [provider]: e.target.value }))}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  onClick={() => setShowKey(p => ({ ...p, [provider]: !p[provider] }))}
                                >
                                  {showKey[provider] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => saveApiKey(provider)}
                                disabled={saving === provider || !(apiKeyInputs[provider] ?? "").trim()}
                              >
                                {saving === provider ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                <span className="ml-1">Save</span>
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Webhook URL (Teltonika) */}
                        {provider === "teltonika" && (
                          <div>
                            <Label className="flex items-center gap-1.5 mb-1.5">
                              <Link2 size={12} />
                              Webhook URL — paste into Teltonika RMS
                            </Label>
                            <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-md font-mono text-xs text-gray-700 break-all">
                              <span className="flex-1">{webhookBaseUrl}/teltonika</span>
                              <button
                                type="button"
                                className="shrink-0 text-gray-400 hover:text-gray-700"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${webhookBaseUrl}/teltonika`);
                                  toast({ title: "Copied to clipboard" });
                                }}
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              In Teltonika RMS: open your device → Configuration → Codec → HTTP posting → paste this URL. Set <span className="font-mono bg-gray-100 px-1 rounded">Content-Type: application/json</span> and POST method.
                            </p>
                          </div>
                        )}

                        {/* Samsara webhook info */}
                        {provider === "samsara" && (
                          <div>
                            <Label className="flex items-center gap-1.5 mb-1.5">
                              <Link2 size={12} />
                              Samsara Webhook URL
                            </Label>
                            <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-md font-mono text-xs text-gray-700 break-all">
                              <span className="flex-1">{webhookBaseUrl}/samsara</span>
                              <button
                                type="button"
                                className="shrink-0 text-gray-400 hover:text-gray-700"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${webhookBaseUrl}/samsara`);
                                  toast({ title: "Copied to clipboard" });
                                }}
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              In the Samsara Cloud developer portal: go to Webhooks → Add Webhook → paste this URL, select <span className="font-mono bg-gray-100 px-1 rounded">Vehicle Location</span> events.
                            </p>
                          </div>
                        )}

                        {/* Last sync + remove */}
                        {connected && (
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-xs text-muted-foreground">
                              {existing?.last_sync_at
                                ? `Last data received: ${new Date(existing.last_sync_at).toLocaleString("en-GB")}`
                                : "No data received yet — waiting for first position update"}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 h-7 text-xs"
                              onClick={() => removeIntegration(provider)}
                              disabled={removing === provider}
                            >
                              {removing === provider ? <Loader2 size={12} className="animate-spin mr-1" /> : <Trash2 size={12} className="mr-1" />}
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
          <Truck size={15} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            <strong>Multiple providers can be active simultaneously</strong> — a JD tractor via the OEM API, a Land Rover via Teltonika, and a hired machine via Samsara will all appear as separate pins on the Resource Map. Positions update in real-time via webhook.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sensor Integration Card ──────────────────────────────────────────────────

type SensorIntegration = {
  id: number;
  provider: string;
  status: string;
  hasApiKey: boolean;
  hasApiKey2: boolean;
  hasAccessToken: boolean;
  tokenExpiresAt?: string | null;
  lastSyncAt?: string | null;
  lastError?: string | null;
};

const SENSOR_PROVIDER_META: Record<string, {
  label: string;
  logo: string;
  type: "two_keys" | "one_token" | "oauth_active";
  key1Label: string;
  key1Placeholder: string;
  key2Label?: string;
  key2Placeholder?: string;
  description: string;
  helpText: string;
}> = {
  fieldclimate: {
    label: "FieldClimate (Pessl/METOS)",
    logo: "FC",
    type: "two_keys",
    key1Label: "Public Key",
    key1Placeholder: "Your FieldClimate public key",
    key2Label: "Private Key",
    key2Placeholder: "Your FieldClimate private key",
    description: "Covers soil sensors and weather stations. Very common in UK/EU commercial farming.",
    helpText: "Find your API credentials in FieldClimate → Settings → API. Both the Public Key and Private Key are required.",
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
    helpText: "Log in to weatherlink.com → My Account → API Keys to generate your API Key and Secret.",
  },
  zentra: {
    label: "METER ZENTRA Cloud",
    logo: "ZC",
    type: "one_token",
    key1Label: "API Token",
    key1Placeholder: "Your ZENTRA Cloud API token",
    description: "METER/Decagon soil sensors — the standard in research-grade UK soil monitoring.",
    helpText: "In ZENTRA Cloud: Settings → API Access → Generate Token. Copy the token here.",
  },
  sencrop: {
    label: "Sencrop",
    logo: "SC",
    type: "oauth_active",
    key1Label: "",
    key1Placeholder: "",
    description: "Agricultural weather sensor network with strong UK presence. Measures rainfall, temperature, wind and leaf wetness.",
    helpText: "Click Connect to authorise BDE Farm Trac to read your Sencrop station data.",
  },
};

function SensorIntegrationCard({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [key1, setKey1] = useState<Record<string, string>>({});
  const [key2, setKey2] = useState<Record<string, string>>({});
  const [showKey1, setShowKey1] = useState<Record<string, boolean>>({});
  const [showKey2, setShowKey2] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const integrationsQ = useQuery<{ integrations: SensorIntegration[] }>({
    queryKey: ["sensor-integrations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sensor-integrations`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const integrationsByProvider = Object.fromEntries(
    (integrationsQ.data?.integrations ?? []).map(i => [i.provider, i])
  );

  async function saveCredentials(provider: string) {
    const meta = SENSOR_PROVIDER_META[provider];
    if (!meta) return;
    const k1 = (key1[provider] ?? "").trim();
    const k2 = (key2[provider] ?? "").trim();
    if (!k1) return;
    if (meta.type === "two_keys" && !k2) return;
    setSaving(provider);
    try {
      let body: Record<string, string> = {};
      if (provider === "fieldclimate") body = { publicKey: k1, privateKey: k2 };
      else if (provider === "davis") body = { apiKey: k1, apiSecret: k2 };
      else if (provider === "zentra") body = { apiToken: k1 };

      const r = await fetch(`/api/farms/${farmId}/sensor-integrations/${provider}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "Integration saved", description: `${meta.label} connected.` });
      setKey1(p => ({ ...p, [provider]: "" }));
      setKey2(p => ({ ...p, [provider]: "" }));
      integrationsQ.refetch();
    } catch {
      toast({ title: "Save failed", description: "Could not save credentials.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }

  async function triggerSync(provider: string) {
    setSyncing(provider);
    try {
      const r = await fetch(`/api/farms/${farmId}/sensor-integrations/${provider}/sync`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "Sync triggered", description: "Latest readings are being fetched." });
      setTimeout(() => integrationsQ.refetch(), 3000);
    } catch {
      toast({ title: "Sync failed", variant: "destructive" });
    } finally {
      setSyncing(null);
    }
  }

  async function removeIntegration(provider: string) {
    setRemoving(provider);
    try {
      await fetch(`/api/farms/${farmId}/sensor-integrations/${provider}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      toast({ title: "Integration removed" });
      integrationsQ.refetch();
    } catch {
      toast({ title: "Remove failed", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Cpu size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Soil Sensors & Weather Station Integration</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Connect third-party sensor platforms to pull soil moisture, temperature, and weather readings automatically every 30 minutes.
              Readings feed into the Soil Management module.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(SENSOR_PROVIDER_META).map(([provider, meta]) => {
            const existing = integrationsByProvider[provider];
            const connected = existing?.status === "connected";
            const isExpanded = expandedProvider === provider;
            const isOAuth = meta.type === "oauth_active";
            const isTwoKeys = meta.type === "two_keys";

            const hasExistingKey1 = existing?.hasApiKey ?? false;
            const hasExistingKey2 = existing?.hasApiKey2 ?? false;
            const hasExistingToken = existing?.hasAccessToken ?? false;

            return (
              <div key={provider} className={`rounded-lg border transition-colors ${connected ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white"}`}>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setExpandedProvider(isExpanded ? null : provider)}
                >
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {meta.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{meta.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {connected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <Wifi size={10} /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <WifiOff size={10} /> Not configured
                      </span>
                    )}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                    {isOAuth ? (
                      connected ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg">
                            <Wifi size={15} className="text-green-600 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-green-900">Connected to {meta.label}</p>
                              <p className="text-xs text-green-700 mt-0.5">
                                {existing?.lastSyncAt
                                  ? `Last sync: ${new Date(existing.lastSyncAt).toLocaleString("en-GB")}`
                                  : "Waiting for first poll (runs every 30 minutes)"}
                              </p>
                              {existing?.tokenExpiresAt && (
                                <p className="text-xs text-green-600 mt-0.5">
                                  Token valid until: {new Date(existing.tokenExpiresAt).toLocaleString("en-GB")}
                                </p>
                              )}
                            </div>
                          </div>
                          {existing?.lastError && (
                            <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
                              <WifiOff size={12} className="shrink-0 mt-0.5" />
                              <span>{existing.lastError}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => triggerSync(provider)}
                              disabled={syncing === provider}
                            >
                              {syncing === provider ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                              Sync now
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 h-7 text-xs"
                              onClick={() => removeIntegration(provider)}
                              disabled={removing === provider}
                            >
                              {removing === provider ? <Loader2 size={12} className="animate-spin mr-1" /> : <Trash2 size={12} className="mr-1" />}
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <Link2 size={15} className="text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-blue-900">
                              <p className="font-semibold mb-1">Connect your {meta.label} account</p>
                              <p className="text-xs text-blue-800">{meta.helpText}</p>
                            </div>
                          </div>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            onClick={() => {
                              window.location.href = `/api/sensors/${provider}/authorize?farmId=${farmId}`;
                            }}
                          >
                            <Link2 size={14} />
                            Connect with {meta.label}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Requires an approved Sencrop partner account. Contact <span className="font-medium">hello@sencrop.com</span> to request developer access.
                          </p>
                        </div>
                      )
                    ) : (
                      /* Credential-based providers (FieldClimate, Davis, ZENTRA) */
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
                          <Key size={15} className="text-blue-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-blue-800">{meta.helpText}</p>
                        </div>

                        {/* Key 1 */}
                        <div>
                          <Label className="text-xs mb-1 block flex items-center gap-1.5">
                            <Key size={11} />
                            {meta.key1Label}
                          </Label>
                          {connected && hasExistingKey1 && !key1[provider] ? (
                            <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-md">
                              <ShieldCheck size={14} className="text-green-600 shrink-0" />
                              <span className="text-xs text-green-800 font-medium">{meta.key1Label} saved & encrypted</span>
                              <Button
                                size="sm" variant="ghost"
                                className="ml-auto text-xs h-7 text-green-700 hover:text-green-800"
                                onClick={() => setKey1(p => ({ ...p, [provider]: " " }))}
                              >Replace</Button>
                            </div>
                          ) : (
                            <div className="relative">
                              <Input
                                type={showKey1[provider] ? "text" : "password"}
                                className="pr-9 font-mono text-sm"
                                placeholder={meta.key1Placeholder}
                                value={key1[provider] ?? ""}
                                onChange={e => setKey1(p => ({ ...p, [provider]: e.target.value }))}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowKey1(p => ({ ...p, [provider]: !p[provider] }))}
                              >
                                {showKey1[provider] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Key 2 (two_keys providers only) */}
                        {isTwoKeys && (
                          <div>
                            <Label className="text-xs mb-1 block flex items-center gap-1.5">
                              <Key size={11} />
                              {meta.key2Label}
                            </Label>
                            {connected && hasExistingKey2 && !key2[provider] ? (
                              <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-md">
                                <ShieldCheck size={14} className="text-green-600 shrink-0" />
                                <span className="text-xs text-green-800 font-medium">{meta.key2Label} saved & encrypted</span>
                                <Button
                                  size="sm" variant="ghost"
                                  className="ml-auto text-xs h-7 text-green-700 hover:text-green-800"
                                  onClick={() => setKey2(p => ({ ...p, [provider]: " " }))}
                                >Replace</Button>
                              </div>
                            ) : (
                              <div className="relative">
                                <Input
                                  type={showKey2[provider] ? "text" : "password"}
                                  className="pr-9 font-mono text-sm"
                                  placeholder={meta.key2Placeholder ?? ""}
                                  value={key2[provider] ?? ""}
                                  onChange={e => setKey2(p => ({ ...p, [provider]: e.target.value }))}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  onClick={() => setShowKey2(p => ({ ...p, [provider]: !p[provider] }))}
                                >
                                  {showKey2[provider] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <Button
                          className="w-full gap-2"
                          onClick={() => saveCredentials(provider)}
                          disabled={
                            saving === provider ||
                            !(key1[provider] ?? "").trim() ||
                            (isTwoKeys && !(key2[provider] ?? "").trim())
                          }
                        >
                          {saving === provider ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Save & Connect {meta.label}
                        </Button>

                        {connected && (
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {existing?.lastSyncAt
                                  ? `Last sync: ${new Date(existing.lastSyncAt).toLocaleString("en-GB")}`
                                  : "Waiting for first poll (runs every 30 minutes)"}
                              </p>
                              {existing?.lastError && (
                                <p className="text-xs text-red-600 mt-0.5">{existing.lastError}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => triggerSync(provider)}
                                disabled={syncing === provider}
                              >
                                {syncing === provider ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                Sync now
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 h-7 text-xs"
                                onClick={() => removeIntegration(provider)}
                                disabled={removing === provider}
                              >
                                {removing === provider ? <Loader2 size={12} className="animate-spin mr-1" /> : <Trash2 size={12} className="mr-1" />}
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Cpu size={15} className="text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-800">
            <strong>Multiple providers can be active simultaneously</strong> — a FieldClimate weather station, METER soil probes, and a Davis rain gauge will all sync readings independently. Data appears in the Soil Management module under each sensor&apos;s station name.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Invoicing Card ───────────────────────────────────────────────────────────

function InvoicingCard({
  farmId,
  formData,
  updateField,
  onLogoPathChange,
}: {
  farmId: number | null;
  formData: FarmFormData;
  updateField: (field: keyof Omit<FarmFormData, "sectors" | "isNvzDesignated" | "harvestStrictStorage">, value: string) => void;
  onLogoPathChange: (path: string) => void;
}) {
  const { toast } = useToast();
  const { uploadFile } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (formData.invoiceLogoPath) {
      setLogoPreviewUrl(`/api/storage/objects/${formData.invoiceLogoPath}`);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [formData.invoiceLogoPath]);

  const handleLogoUpload = async (file: File) => {
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

  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-6">
        <SectionHeader
          title="Invoicing & Documents"
          description="Business information, bank details and branding that appear on invoices, agreements and other printed documents."
        />

        {/* Logo */}
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2"><ImageIcon size={14} /> Farm Logo</p>
          <p className="text-xs text-muted-foreground mb-3">
            Appears at the top of printed invoices and documents. Recommended: PNG or JPG, landscape format, max 2 MB.
          </p>
          <div className="flex items-start gap-4">
            {logoPreviewUrl ? (
              <div className="relative border border-border rounded-lg p-2 bg-muted/30">
                <img
                  src={logoPreviewUrl}
                  alt="Invoice logo preview"
                  className="max-w-[200px] max-h-[70px] object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                style={{ minWidth: 200 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={20} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload logo</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {logoPreviewUrl ? "Replace Logo" : "Upload Logo"}
              </Button>
              {logoPreviewUrl && (
                <Button variant="ghost" size="sm" onClick={handleRemoveLogo} className="gap-1.5 text-destructive hover:text-destructive">
                  <X size={13} />Remove
                </Button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }}
          />
        </div>

        {/* Company Details */}
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Building2 size={14} /> Company Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="inv-company-number">Companies House Number</Label>
              <Input
                id="inv-company-number"
                className="mt-1"
                placeholder="e.g. 12345678"
                value={formData.companyNumber}
                onChange={e => updateField("companyNumber", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">8-digit Companies House registration number</p>
            </div>
            <div>
              <Label htmlFor="inv-vat-number">VAT Registration Number</Label>
              <Input
                id="inv-vat-number"
                className="mt-1"
                placeholder="e.g. GB 123 4567 89"
                value={formData.vatNumber}
                onChange={e => updateField("vatNumber", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Shown on all invoices where VAT is charged</p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2"><CreditCard size={14} /> Bank Details</p>
          <p className="text-xs text-muted-foreground mb-3">
            Shown in the payment details panel at the bottom of printed invoices so customers know where to send payment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="inv-bank-name">Bank Name</Label>
              <Input
                id="inv-bank-name"
                className="mt-1"
                placeholder="e.g. Lloyds Bank"
                value={formData.bankName}
                onChange={e => updateField("bankName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="inv-account-name">Account Name</Label>
              <Input
                id="inv-account-name"
                className="mt-1"
                placeholder="e.g. Acme Farms Ltd"
                value={formData.bankAccountName}
                onChange={e => updateField("bankAccountName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="inv-account-number">Account Number</Label>
              <Input
                id="inv-account-number"
                className="mt-1"
                placeholder="e.g. 12345678"
                value={formData.bankAccountNumber}
                onChange={e => updateField("bankAccountNumber", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="inv-sort-code">Sort Code</Label>
              <Input
                id="inv-sort-code"
                className="mt-1"
                placeholder="e.g. 30-96-26"
                value={formData.bankSortCode}
                onChange={e => updateField("bankSortCode", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div>
          <p className="text-sm font-semibold mb-3">Invoice Settings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="inv-payment-terms">Default Payment Terms</Label>
              <Select
                value={formData.paymentTermsDays || "30"}
                onValueChange={v => updateField("paymentTermsDays", v)}
              >
                <SelectTrigger id="inv-payment-terms" className="mt-1">
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Shown on printed invoices as "Payment due within X days"</p>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="inv-footer-text">Invoice Footer Text</Label>
              <Textarea
                id="inv-footer-text"
                className="mt-1 text-sm"
                rows={3}
                placeholder="e.g. Thank you for your business. Late payments may be subject to interest under the Late Payment of Commercial Debts Act 1998."
                value={formData.invoiceFooterText}
                onChange={e => updateField("invoiceFooterText", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Appears at the bottom of every printed invoice and credit note</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Completeness status bar ──────────────────────────────────────────────────

function FarmCompletenessBar({
  formData,
  isViticulture,
}: {
  formData: FarmFormData;
  isViticulture: boolean;
}) {
  const s = formData.sectors;
  // Any sector that requires a CPH / holding number
  const hasAnyLivestock =
    s.sectorBeef || s.sectorSheep || s.sectorDairy || s.sectorPigs ||
    s.sectorGoats || s.sectorEquine || s.sectorDeer || s.sectorPoultry || s.sectorEggs;
  const hasSheepGoats = s.sectorSheep || s.sectorGoats;
  const hasCattle = s.sectorBeef || s.sectorDairy;
  const hasPigs = s.sectorPigs;

  const checks = [
    { key: "name", label: "Farm name", filled: !!formData.name.trim(), targetId: "settings-name" },
    { key: "address", label: "Address", filled: !!formData.address.trim(), targetId: "settings-address" },
    ...(hasAnyLivestock
      ? [{ key: "cphNumber", label: "CPH Number", filled: !!formData.cphNumber.trim(), targetId: "settings-cph" }]
      : []),
    ...(hasSheepGoats
      ? [{ key: "flockMark", label: "Flock Mark", filled: !!formData.flockMark.trim(), targetId: "settings-flock-mark" }]
      : []),
    ...(hasCattle
      ? [{ key: "herdMark", label: "Herd Mark", filled: !!formData.herdMark.trim(), targetId: "settings-herd-mark" }]
      : []),
    ...(hasPigs
      ? [{ key: "pigHerdMark", label: "Pig Herd Mark", filled: !!formData.pigHerdMark.trim(), targetId: "settings-pig-herd-mark" }]
      : []),
    ...(isViticulture
      ? [
          { key: "fsaVineRegisterRef", label: "FSA Vine Register Ref", filled: !!formData.fsaVineRegisterRef.trim(), targetId: "settings-fsa-vine-ref" },
          { key: "fsaWineProductionRef", label: "FSA Wine Production Ref", filled: !!formData.fsaWineProductionRef.trim(), targetId: "settings-fsa-wine-ref" },
        ]
      : []),
  ];

  const allComplete = checks.every(c => c.filled);
  const missingCount = checks.filter(c => !c.filled).length;

  const scrollToField = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Brief highlight so growers can see exactly which input to fill
    el.focus({ preventScroll: true });
    el.classList.add("ring-2", "ring-amber-400", "ring-offset-1");
    setTimeout(() => el.classList.remove("ring-2", "ring-amber-400", "ring-offset-1"), 2000);
  };

  if (allComplete) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
        <CheckCircle2 size={16} className="text-green-600 shrink-0" />
        <span className="font-semibold">Farm Settings complete</span>
        <span className="text-green-600 ml-0.5">— all key fields are filled in</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="text-amber-500 shrink-0" />
        <span className="text-sm font-semibold text-amber-900">
          {missingCount} key field{missingCount !== 1 ? "s" : ""} still to complete
        </span>
        <span className="text-xs text-amber-700 ml-1">— click any amber badge to jump to that field</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map(c =>
          c.filled ? (
            <span
              key={c.key}
              className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
            >
              <CheckCircle2 size={11} />
              {c.label}
            </span>
          ) : (
            <button
              key={c.key}
              type="button"
              onClick={() => scrollToField(c.targetId)}
              className="inline-flex items-center gap-1 rounded-full bg-amber-200 hover:bg-amber-300 active:bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-amber-900 transition-colors cursor-pointer"
            >
              <AlertTriangle size={11} />
              {c.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function FarmSettings() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: farmDetailData, isLoading } = useQuery<{ record: Record<string, unknown> & { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const currentFarm = farmDetailData?.record;

  const { mutate: updateFarm, isPending: isSaving } = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update farm");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-detail", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-dashboard", farmId] });
      toast({ title: "Farm updated", description: "Your changes have been saved." });
    },
    onError: () => {
      toast({ title: "Failed to update farm", variant: "destructive" });
    },
  });

  const [formData, setFormData] = useState<FarmFormData | null>(null);
  const [loadedFarmId, setLoadedFarmId] = useState<number | null>(null);
  const [postcodeBlurred, setPostcodeBlurred] = useState(false);
  const [locatingPostcode, setLocatingPostcode] = useState(false);
  const [convertingW3W, setConvertingW3W] = useState(false);
  const [w3wNoKey, setW3wNoKey] = useState(false);
  const [coordsCopied, setCoordsCopied] = useState(false);

  useEffect(() => {
    if (currentFarm && currentFarm.id !== loadedFarmId) {
      setFormData(farmToFormData(currentFarm));
      setLoadedFarmId(currentFarm.id);
    }
  }, [currentFarm, loadedFarmId]);

  if (!farmId) return <Redirect href="/select" />;

  if (isLoading) {
    return (
      <AppLayout title="Farm Settings">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-black/5 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!currentFarm) {
    return <Redirect href="/select" />;
  }

  if (!formData) {
    return (
      <AppLayout title="Farm Settings">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-black/5 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i;

  /** Uppercase and insert the missing space before the 3-char inward code. */
  function normalisePostcode(raw: string): string {
    const v = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (v.length >= 4) return v.slice(0, -3) + " " + v.slice(-3);
    return raw.trim().toUpperCase();
  }

  const postcodeVal = formData?.postcode?.trim() ?? "";
  const postcodeWarn =
    postcodeBlurred &&
    postcodeVal.length > 0 &&
    !UK_POSTCODE_RE.test(postcodeVal);

  const updateField = (field: keyof Omit<FarmFormData, "sectors" | "isNvzDesignated" | "harvestStrictStorage">, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const toggleSector = (key: SectorKey) => {
    setFormData(prev => prev ? {
      ...prev,
      sectors: { ...prev.sectors, [key]: !prev.sectors[key] },
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
        setFormData(prev => prev ? { ...prev, latitude: String(latitude), longitude: String(longitude) } : prev);
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
      setFormData(prev => prev ? { ...prev, what3words: data.words } : prev);
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
      setTimeout(() => setCoordsCopied(false), 2000);
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: "Farm name is required", variant: "destructive" });
      return;
    }

    // Normalise postcode before saving so the server always receives a correctly
    // formatted value regardless of whether the grower blurred the field first.
    const normalisedPostcode = normalisePostcode(formData.postcode ?? "");
    updateField("postcode", normalisedPostcode);

    // Reveal postcode warning if the grower hasn't blurred the field yet
    setPostcodeBlurred(true);

    const sbiTrimmed = formData.sbiNumber.trim();
    if (sbiTrimmed && !/^\d{9}$/.test(sbiTrimmed)) {
      toast({ title: "SBI Number must be exactly 9 digits", variant: "destructive" });
      return;
    }

    updateFarm({
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      cphNumber: formData.cphNumber.trim() || undefined,
      address: formData.address.trim() || undefined,
      postcode: normalisedPostcode || undefined,
      gridReference: formData.gridReference.trim() || undefined,
      latitude: formData.latitude.trim() || undefined,
      longitude: formData.longitude.trim() || undefined,
      what3words: formData.what3words.trim() || undefined,
      emergencyContactName: formData.emergencyContactName.trim() || undefined,
      emergencyContactRelationship: formData.emergencyContactRelationship.trim() || undefined,
      emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
      emergencyContactEmail: formData.emergencyContactEmail.trim() || undefined,
      totalAcreage: formData.totalAcreage ? parseInt(formData.totalAcreage, 10) : undefined,
      ...formData.sectors,
      redTractorId: formData.redTractorId.trim() || undefined,
      sbiNumber: formData.sbiNumber.trim() || undefined,
      totalHectares: formData.totalHectares.trim() || undefined,
      farmManager: formData.farmManager.trim() || undefined,
      holdingType: formData.holdingType || undefined,
      assuranceBody: formData.assuranceBody.trim() || undefined,
      isNvzDesignated: formData.isNvzDesignated,
      harvestStrictStorage: formData.harvestStrictStorage,
      country: formData.country || "england",
      eaml2Email: formData.eaml2Email.trim() || undefined,
      flockMark: formData.flockMark.trim() || undefined,
      herdMark: formData.herdMark.trim() || undefined,
      pigHerdMark: formData.pigHerdMark.trim() || undefined,
      bcmsHoldingNumber: formData.bcmsHoldingNumber.trim() || undefined,
      scotEidNumber: formData.scotEidNumber.trim() || undefined,
      eidCymruNumber: formData.eidCymruNumber.trim() || undefined,
      appaRef: formData.appaRef.trim() || undefined,
      appaRegistrationDate: formData.appaRegistrationDate.trim() || undefined,
      fsaWineProductionRef: formData.fsaWineProductionRef.trim() || undefined,
      fsaVineRegisterRef: formData.fsaVineRegisterRef.trim() || undefined,
      winegbMembershipNumber: formData.winegbMembershipNumber.trim() || undefined,
      companyNumber: formData.companyNumber.trim() || undefined,
      vatNumber: formData.vatNumber.trim() || undefined,
      bankName: formData.bankName.trim() || undefined,
      bankAccountName: formData.bankAccountName.trim() || undefined,
      bankAccountNumber: formData.bankAccountNumber.trim() || undefined,
      bankSortCode: formData.bankSortCode.trim() || undefined,
      paymentTermsDays: formData.paymentTermsDays ? parseInt(formData.paymentTermsDays, 10) : undefined,
      invoiceFooterText: formData.invoiceFooterText.trim() || undefined,
      invoiceLogoPath: formData.invoiceLogoPath.trim() || undefined,
    });
  };

  return (
    <AppLayout title="Farm Settings">
      <div className="max-w-3xl space-y-6">

        {/* ── Completeness bar ── */}
        <FarmCompletenessBar formData={formData} isViticulture={formData.sectors.sectorViticulture} />

        {/* ── Farm Identity ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Farm Identity"
              description="Core identifiers used on compliance reports and correspondence."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="settings-name">Farm Name *</Label>
                <Input
                  id="settings-name"
                  placeholder="e.g. Manor Farm"
                  value={formData.name}
                  onChange={e => updateField("name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="settings-phone">Contact Phone</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  placeholder="e.g. 01234 567890"
                  value={formData.phone}
                  onChange={e => updateField("phone", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Main farm contact number</p>
              </div>

              <div>
                <Label htmlFor="settings-cph">CPH Number</Label>
                <Input
                  id="settings-cph"
                  placeholder="e.g. 12/345/6789"
                  value={formData.cphNumber}
                  onChange={e => updateField("cphNumber", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">County Parish Holding number (APHA / BCMS)</p>
              </div>

              <div>
                <Label htmlFor="settings-sbi">SBI Number</Label>
                <Input
                  id="settings-sbi"
                  placeholder="e.g. 105123456"
                  value={formData.sbiNumber}
                  onChange={e => updateField("sbiNumber", e.target.value)}
                  className={formData.sbiNumber.trim() && !/^\d{9}$/.test(formData.sbiNumber.trim()) ? "border-red-400 focus-visible:ring-red-400" : ""}
                />
                {formData.sbiNumber.trim() && !/^\d{9}$/.test(formData.sbiNumber.trim()) ? (
                  <p className="text-xs text-red-600 mt-1">SBI must be exactly 9 digits (e.g. 105123456)</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Single Business Identifier (Rural Payments Agency)</p>
                )}
              </div>

              <div>
                <Label htmlFor="settings-rt-id">Red Tractor Membership Number</Label>
                <Input
                  id="settings-rt-id"
                  placeholder="e.g. 12345678"
                  value={formData.redTractorId}
                  onChange={e => updateField("redTractorId", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Appears on all compliance reports</p>
              </div>

              <div>
                <Label htmlFor="settings-assurance-body">Certification / Assurance Body</Label>
                <Select
                  value={formData.assuranceBody || "__none__"}
                  onValueChange={v => updateField("assuranceBody", v === "__none__" ? "" : v)}
                >
                  <SelectTrigger id="settings-assurance-body">
                    <SelectValue placeholder="Select body…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {ASSURANCE_BODIES.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">The body that carries out your Red Tractor inspection</p>
              </div>

              <div>
                <Label htmlFor="settings-manager">Farm Manager / Responsible Person</Label>
                <Input
                  id="settings-manager"
                  placeholder="e.g. John Smith"
                  value={formData.farmManager}
                  onChange={e => updateField("farmManager", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Named on compliance exports and inspection reports</p>
              </div>

              <div>
                <Label htmlFor="settings-holding-type">Holding Type</Label>
                <Select
                  value={formData.holdingType || "__none__"}
                  onValueChange={v => updateField("holdingType", v === "__none__" ? "" : v)}
                >
                  <SelectTrigger id="settings-holding-type">
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {HOLDING_TYPES.map(ht => (
                      <SelectItem key={ht.value} value={ht.value}>{ht.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Location ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Location"
              description="Farm address and map reference."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label htmlFor="settings-address">Address</Label>
                <Input
                  id="settings-address"
                  placeholder="Farm address"
                  value={formData.address}
                  onChange={e => updateField("address", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="settings-postcode">Postcode</Label>
                <Input
                  id="settings-postcode"
                  placeholder="e.g. YO1 7HJ"
                  value={formData.postcode}
                  onChange={e => updateField("postcode", e.target.value)}
                  onBlur={() => {
                    updateField("postcode", normalisePostcode(formData.postcode ?? ""));
                    setPostcodeBlurred(true);
                  }}
                />
                {postcodeWarn && (
                  <p className="text-xs text-amber-600 mt-1">
                    This doesn't look like a valid UK postcode (e.g. DT1 1AA). You can still save if you're sure.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="settings-grid">OS Grid Reference</Label>
                <Input
                  id="settings-grid"
                  placeholder="e.g. SE 605 515"
                  value={formData.gridReference}
                  onChange={e => updateField("gridReference", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="settings-country">Country / Devolved Nation</Label>
                <Select
                  value={formData.country || "england"}
                  onValueChange={v => updateField("country", v)}
                >
                  <SelectTrigger id="settings-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="england">England</SelectItem>
                    <SelectItem value="scotland">Scotland</SelectItem>
                    <SelectItem value="wales">Wales</SelectItem>
                    <SelectItem value="northern_ireland">Northern Ireland</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Determines which livestock movement portals apply to this holding (eAML2, ScotEID, EIDCymru, or NIFAIS)</p>
              </div>

              {/* ── GPS Coordinates ── */}
              <div className="md:col-span-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">GPS Coordinates &amp; What3Words</span>
                  <span className="text-xs text-muted-foreground">— for emergency services, contractors and compliance site visits</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label htmlFor="settings-lat">Latitude</Label>
                    <Input
                      id="settings-lat"
                      className="mt-1 font-mono text-sm"
                      placeholder="e.g. 53.958333"
                      value={formData.latitude}
                      onChange={e => updateField("latitude", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="settings-lng">Longitude</Label>
                    <Input
                      id="settings-lng"
                      className="mt-1 font-mono text-sm"
                      placeholder="e.g. -1.080278"
                      value={formData.longitude}
                      onChange={e => updateField("longitude", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={locateFromPostcode}
                    disabled={locatingPostcode || !formData.postcode?.trim()}
                  >
                    {locatingPostcode ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : <MapPin size={13} className="mr-1.5" />}
                    Locate from Postcode
                  </Button>

                  {formData.latitude && formData.longitude && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyCoordinates}
                      >
                        <Copy size={13} className="mr-1.5" />
                        {coordsCopied ? "Copied!" : "Copy Coordinates"}
                      </Button>
                      <a
                        href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button type="button" variant="outline" size="sm">
                          <ExternalLink size={13} className="mr-1.5" />
                          View in Maps
                        </Button>
                      </a>
                    </>
                  )}
                </div>

                {/* What3Words */}
                <div>
                  <Label htmlFor="settings-w3w">What3Words Address</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#e11d48] select-none">///</span>
                      <Input
                        id="settings-w3w"
                        className="pl-9 font-mono text-sm"
                        placeholder="three.word.address"
                        value={formData.what3words}
                        onChange={e => updateField("what3words", e.target.value.replace(/^\/+/, ""))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={convertToW3W}
                      disabled={convertingW3W || !formData.latitude || !formData.longitude}
                      title="Auto-convert from GPS coordinates"
                    >
                      {convertingW3W ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                      <span className="ml-1.5 hidden sm:inline">Auto-convert</span>
                    </Button>
                    {formData.what3words && (
                      <a
                        href={`https://what3words.com/${formData.what3words}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button type="button" variant="outline" size="sm">
                          <ExternalLink size={13} />
                        </Button>
                      </a>
                    )}
                  </div>

                  {w3wNoKey && (
                    <div className="mt-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-600 text-xs font-semibold mt-0.5">⚠</span>
                      <p className="text-xs text-amber-700">
                        Auto-convert needs a <strong>W3W_API_KEY</strong> environment secret. Register for a free key at{" "}
                        <a href="https://developer.what3words.com" target="_blank" rel="noopener noreferrer" className="underline">developer.what3words.com</a>{" "}
                        and add it to your project secrets. You can also type or paste the W3W address manually above.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Used by emergency services, delivery drivers and Red Tractor assessors. Find yours at{" "}
                    <a href="https://what3words.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">what3words.com</a>.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Land & NVZ ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Land & Compliance Details"
              description="Total farm size and regulatory designations that affect compliance rules."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="settings-hectares">Total Area (hectares)</Label>
                <Input
                  id="settings-hectares"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 101.2"
                  value={formData.totalHectares}
                  onChange={e => {
                    const ha = e.target.value;
                    updateField("totalHectares", ha);
                    const n = parseFloat(ha);
                    updateField("totalAcreage", ha && !isNaN(n) ? (n * 2.47105).toFixed(2) : "");
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">Used for NVZ, biofuel, and spray compliance calculations</p>
              </div>

              <div>
                <Label htmlFor="settings-acreage">Total Area (acres)</Label>
                <Input
                  id="settings-acreage"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 250"
                  value={formData.totalAcreage}
                  onChange={e => {
                    const ac = e.target.value;
                    updateField("totalAcreage", ac);
                    const n = parseFloat(ac);
                    updateField("totalHectares", ac && !isNaN(n) ? (n / 2.47105).toFixed(2) : "");
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">Auto-calculated from hectares — or enter directly to set both</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={formData.isNvzDesignated}
                  onCheckedChange={checked =>
                    setFormData(prev => prev ? { ...prev, isNvzDesignated: !!checked } : prev)
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium group-hover:text-foreground">
                    Farm is within a Nitrate Vulnerable Zone (NVZ)
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enables NVZ closed period warnings and the 170 kg N/ha organic manure limit across all relevant modules. You can also flag individual fields within the Field Register.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-black/5 transition-colors group">
                <Checkbox
                  checked={formData.harvestStrictStorage}
                  onCheckedChange={checked =>
                    setFormData(prev => prev ? { ...prev, harvestStrictStorage: !!checked } : prev)
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium group-hover:text-foreground">
                    Require storage record for every harvest
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When enabled, the harvest reconciliation panel will flag any harvest that has no storage record — even where only transport legs have been recorded. Suitable for farms where all crop must pass through an on-farm or third-party store before sale. Leave off if crop is sometimes collected directly from the field by the buyer.
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* ── Sectors ── */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <SectionHeader
              title="Farm Sectors"
              description="Select all types of farming activity on this holding. Sectors determine which Red Tractor standards apply."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SECTORS.map(s => (
                <label
                  key={s.key}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <Checkbox
                    checked={formData.sectors[s.key]}
                    onCheckedChange={() => toggleSector(s.key)}
                  />
                  <span className="text-sm font-medium">{s.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Livestock Movement Reporting ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Livestock Movement Reporting"
              description="Reference identifiers for electronic livestock movement reporting. Stored here and included in movement exports — submission to the relevant government portal is done separately."
            />

            {/* Country-specific guidance banner */}
            {formData.country === "scotland" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Scotland:</strong> All livestock movements (cattle, sheep, goats, pigs) are reported to <strong>ScotEID</strong> — Scotland's national electronic identification database. Register at{" "}
                <a href="https://www.scoteid.com" target="_blank" rel="noopener noreferrer" className="underline">scoteid.com</a>.
              </div>
            )}
            {formData.country === "wales" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Wales:</strong> Sheep and goat movements are reported via <strong>EIDCymru</strong> (eidcymru.org). Cattle movements are reported via <strong>LIS</strong> (portal.livestockinformation.org.uk). Pig movements use <strong>eAML2.org.uk</strong>.
              </div>
            )}
            {formData.country === "northern_ireland" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Northern Ireland:</strong> Livestock movements are recorded on <strong>NIFAIS</strong> (Northern Ireland Food Animal Information System) for cattle and <strong>APHIS</strong> for sheep and pigs. Contact DAERA for registration.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label htmlFor="settings-eaml2-email">Registered Email Address</Label>
                <Input
                  id="settings-eaml2-email"
                  type="email"
                  placeholder="e.g. farmer@example.com"
                  value={formData.eaml2Email}
                  onChange={e => updateField("eaml2Email", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Email registered with your livestock movement portal (LIS / EIDCymru / ScotEID / NIFAIS)</p>
              </div>

              <div>
                <Label htmlFor="settings-flock-mark">Flock Mark (Sheep &amp; Goats)</Label>
                <Input
                  id="settings-flock-mark"
                  placeholder="e.g. UK123456"
                  value={formData.flockMark}
                  onChange={e => updateField("flockMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">APHA-issued flock number (UK + 6 digits) for sheep and goats. Appears on ear tags and LIS / EIDCymru / ScotEID movement documents. Pigs use the Herd Mark below.</p>
              </div>

              <div>
                <Label htmlFor="settings-herd-mark">Herd Mark (Cattle)</Label>
                <Input
                  id="settings-herd-mark"
                  placeholder="e.g. UK654321"
                  value={formData.herdMark}
                  onChange={e => updateField("herdMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">APHA-issued herd mark for cattle. Printed on cattle passports and required for BCMS movement notifications. Issued separately from the pig herd mark below.</p>
              </div>

              <div>
                <Label htmlFor="settings-pig-herd-mark">Herd Mark (Pigs)</Label>
                <Input
                  id="settings-pig-herd-mark"
                  placeholder="e.g. UK789012"
                  value={formData.pigHerdMark}
                  onChange={e => updateField("pigHerdMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">APHA-issued herd mark for pigs. Appears on pig ear tags and slap marks, and required for LIS (formerly eAML2) pig movement documents. Registered separately from your cattle herd mark.</p>
              </div>

              <div>
                <Label htmlFor="settings-bcms-holding">BCMS Holding Number (Cattle)</Label>
                <Input
                  id="settings-bcms-holding"
                  placeholder="e.g. 32541/0001"
                  value={formData.bcmsHoldingNumber}
                  onChange={e => updateField("bcmsHoldingNumber", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Your BCMS-registered holding number for cattle movements. Used in England and Wales.</p>
              </div>

              {(formData.country === "scotland") && (
                <div>
                  <Label htmlFor="settings-scoteid">ScotEID Flock / Herd Number</Label>
                  <Input
                    id="settings-scoteid"
                    placeholder="e.g. SC123456"
                    value={formData.scotEidNumber}
                    onChange={e => updateField("scotEidNumber", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your ScotEID-registered flock or herd number for electronic movement reporting in Scotland.</p>
                </div>
              )}

              {(formData.country === "wales") && (
                <div>
                  <Label htmlFor="settings-eidcymru">EIDCymru Flock Number (Sheep &amp; Goats)</Label>
                  <Input
                    id="settings-eidcymru"
                    placeholder="e.g. WL123456"
                    value={formData.eidCymruNumber}
                    onChange={e => updateField("eidCymruNumber", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your EIDCymru-registered flock number for electronic sheep and goat movement reporting in Wales.</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 mt-2">
              <strong>How movement reporting works with BDE Farm Trac:</strong> Record all livestock movements in the Movements section. Use the "Export CSV" button to download a structured report as a reference when submitting to your relevant portal. Paste the movement reference number back into each record once submitted.
              {" "}<strong>Cattle</strong> must be reported within 3 days.{" "}
              {formData.country === "scotland" && <>All species in Scotland are reported to <strong>ScotEID</strong>.</>}
              {formData.country === "wales" && <>In Wales, sheep and goats use <strong>EIDCymru</strong>; cattle use <strong>LIS</strong>; pigs use <strong>eAML2</strong>.</>}
              {(formData.country === "england" || !formData.country) && <>In England, sheep, goats and pigs use <strong>LIS</strong> (replacing eAML2); cattle use <strong>LIS / CTWS</strong>.</>}
              {formData.country === "northern_ireland" && <>In Northern Ireland, use <strong>NIFAIS</strong> for cattle and <strong>APHIS</strong> for sheep and pigs.</>}
            </div>
          </CardContent>
        </Card>

        {/* ── BCMS / CTS One-Click Submission ── */}
        {/* Greyed out: BCMS vendor registration is on hold pending LITP review. Code preserved. */}
        {farmId && (
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "rgba(249,250,251,0.6)", zIndex: 10, pointerEvents: "all", cursor: "not-allowed" }} />
            <div style={{ position: "absolute", top: 14, right: 14, zIndex: 11, display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 700 }}>
              <AlertTriangle size={10} style={{ color: "#f59e0b" }} /> Temporarily unavailable
            </div>
            <div style={{ opacity: 0.45, pointerEvents: "none", userSelect: "none" }}>
              <BcmsCredentialsCard farmId={farmId} bcmsHoldingNumber={formData.bcmsHoldingNumber || undefined} />
            </div>
          </div>
        )}

        {/* ── LIS / Livestock Information Service ── */}
        {farmId && <LisConnectionCard farmId={farmId} />}
        {/* LIP Cattle: greyed out — LIS LIP Cattle postponed to late 2027. Code preserved. */}
        {farmId && (
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "rgba(249,250,251,0.6)", zIndex: 10, pointerEvents: "all", cursor: "not-allowed" }} />
            <div style={{ position: "absolute", top: 14, right: 14, zIndex: 11, display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 700 }}>
              <AlertTriangle size={10} style={{ color: "#f59e0b" }} /> Temporarily unavailable
            </div>
            <div style={{ opacity: 0.45, pointerEvents: "none", userSelect: "none" }}>
              <LipConnectionCard farmId={farmId} />
            </div>
          </div>
        )}

        {/* ── GPS Tracking Integration ── */}
        {farmId && <GpsIntegrationCard farmId={farmId} />}

        {/* ── Soil Sensors & Weather Station Integration ── */}
        {farmId && <SensorIntegrationCard farmId={farmId} />}

        {/* ── Viticulture Registrations — only shown when Viticulture sector is active ── */}
        {formData.sectors.sectorViticulture && (
          <Card>
            <CardContent className="p-6 md:p-8 space-y-5">
              <SectionHeader
                title="Viticulture Registrations"
                description="Registration references for UK viticulture regulatory bodies. These are stored at farm level and referenced across the Viticulture module."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="settings-fsa-wine-ref">FSA Wine Production Registration Ref</Label>
                  <Input
                    id="settings-fsa-wine-ref"
                    placeholder="e.g. WPR-12345"
                    value={formData.fsaWineProductionRef}
                    onChange={e => updateField("fsaWineProductionRef", e.target.value)}
                    className="mt-1 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Issued by the FSA when you register a winery at food.gov.uk. This is your holding-level wine production registration reference.
                  </p>
                </div>
                <div>
                  <Label htmlFor="settings-appa-ref">HMRC APPA Reference</Label>
                  <Input
                    id="settings-appa-ref"
                    placeholder="e.g. APPA-123456"
                    value={formData.appaRef}
                    onChange={e => updateField("appaRef", e.target.value)}
                    className="mt-1 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your <strong>Alcoholic Products Producer Approval</strong> reference, issued by HMRC via Government Gateway. Required if you produce wine for sale. Quoted on all alcohol duty returns filed through HMRC's online service.
                  </p>
                </div>
                <div>
                  <Label htmlFor="settings-appa-date">APPA Registration Date</Label>
                  <Input
                    id="settings-appa-date"
                    type="date"
                    value={formData.appaRegistrationDate}
                    onChange={e => updateField("appaRegistrationDate", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Date your APPA was granted by HMRC</p>
                </div>
                <div>
                  <Label htmlFor="settings-fsa-vine-ref">FSA Vine Register Reference</Label>
                  <Input
                    id="settings-fsa-vine-ref"
                    placeholder="e.g. VR-12345"
                    value={formData.fsaVineRegisterRef}
                    onChange={e => updateField("fsaVineRegisterRef", e.target.value)}
                    className="mt-1 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your holding-level <strong>FSA Vine Register</strong> reference, issued when you register your vineyard planting with the RPA. This is pulled through automatically to Vine Register entries — you only need to enter it once here.
                  </p>
                </div>
                <div>
                  <Label htmlFor="settings-winegb-number">WineGB Membership Number</Label>
                  <Input
                    id="settings-winegb-number"
                    placeholder="e.g. WGB-12345"
                    value={formData.winegbMembershipNumber}
                    onChange={e => updateField("winegbMembershipNumber", e.target.value)}
                    className="mt-1 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your <strong>WineGB</strong> membership number, issued on joining Wines of Great Britain. Used to identify your vineyard in WineGB's annual Harvest Yield Survey and industry reporting. Join at <strong>winegb.co.uk</strong>.
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <strong>How these registrations work:</strong> The <strong>FSA Wine Production Registration</strong> records your vineyard or winery with the Food Standards Agency (the UK vine planting register and wine standards authority post-Brexit). The <strong>HMRC APPA</strong> is your excise approval to produce and sell wine — required before you remove any wine from your premises on which duty is payable. Apply for your APPA via Government Gateway; contact HMRC Excise on <strong>0300 200 3700</strong>.
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Invoicing & Documents ── */}
        <InvoicingCard
          farmId={farmId}
          formData={formData}
          updateField={updateField}
          onLogoPathChange={(path) => setFormData(prev => prev ? { ...prev, invoiceLogoPath: path } : prev)}
        />

        {/* ── Emergency Contact ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Emergency Contact"
              description="The person to contact first in the event of a serious accident or incident on this holding. Visible to all staff with access to Farm Settings."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="settings-ec-name">Full Name</Label>
                <div className="relative mt-1">
                  <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="settings-ec-name"
                    className="pl-8"
                    placeholder="e.g. Jane Smith"
                    value={formData.emergencyContactName}
                    onChange={e => updateField("emergencyContactName", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="settings-ec-rel">Relationship</Label>
                <Input
                  id="settings-ec-rel"
                  className="mt-1"
                  placeholder="e.g. Spouse, Farm Owner, Business Partner"
                  value={formData.emergencyContactRelationship}
                  onChange={e => updateField("emergencyContactRelationship", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="settings-ec-phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="settings-ec-phone"
                    type="tel"
                    className="pl-8"
                    placeholder="e.g. 07700 900123"
                    value={formData.emergencyContactPhone}
                    onChange={e => updateField("emergencyContactPhone", e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Include country code if outside the UK</p>
              </div>

              <div>
                <Label htmlFor="settings-ec-email">Email Address</Label>
                <Input
                  id="settings-ec-email"
                  type="email"
                  className="mt-1"
                  placeholder="e.g. jane@example.com"
                  value={formData.emergencyContactEmail}
                  onChange={e => updateField("emergencyContactEmail", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-lg">
              <Phone size={15} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-800">
                <strong>In a life-threatening emergency, always call 999 first.</strong>{" "}
                This contact is for follow-up notification and farm management decisions, not as a substitute for emergency services.
                {formData.emergencyContactPhone && (
                  <> Quick-dial: <a href={`tel:${formData.emergencyContactPhone.replace(/\s/g, "")}`} className="font-semibold underline">{formData.emergencyContactPhone}</a>.</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Save ── */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}
