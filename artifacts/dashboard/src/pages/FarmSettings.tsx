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
import { Loader2, Save, MapPin, Copy, ExternalLink, RefreshCw, Phone, UserRound, Eye, EyeOff, ShieldCheck, Shield, Wifi, WifiOff, Trash2, Building2, CreditCard, Upload, ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
    },
    country: (farm as any).country || "england",
    eaml2Email: (farm as any).eaml2Email || "",
    flockMark: (farm as any).flockMark || "",
    herdMark: (farm as any).herdMark || "",
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

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
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
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/bcms-credentials`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "BCMS credentials saved" }); credsQ.refetch(); setDirty(false); setPassword(""); },
    onError: () => toast({ title: "Failed to save credentials", variant: "destructive" }),
  });
  const testMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/bcms-credentials/test`, { method: "POST" }).then(r => r.json()),
    onSuccess: (d) => toast({ title: d.success ? (d.sandbox ? "Sandbox test passed" : "Connected to CTWS") : "Connection failed", description: d.message, variant: d.success ? "default" : "destructive" }),
    onError: () => toast({ title: "Test failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/bcms-credentials`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Credentials removed" }); credsQ.refetch(); setUsername(""); setPassword(""); setHolding(bcmsHoldingNumber ?? ""); },
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
              {creds?.ddtsConfigured ? "Platform live credentials active" : "Sandbox mode active"}
            </p>
            <p style={{ fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.5 }}>
              {creds?.ddtsConfigured
                ? "BDE Farm Trac is registered with DEFRA as an approved CTWS software vendor. Submissions go directly to BCMS."
                : "DEFRA/DDTS vendor credentials have not yet been configured by BDE. Submissions will simulate the full CTWS flow and log the XML payload — no data will be sent to BCMS. This lets you set up and test your credentials now so the system is ready to go live the moment BDE completes DEFRA registration."}
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
            <p className="text-xs text-muted-foreground mt-1">Your CTS Web Services username — format <span className="font-mono">nnn-nnn-nnn</span>. <strong>Different</strong> from your CTS Online web login. Contact BCMS (0345 050 1234) if you don't have one.</p>
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
            <li>Call BCMS on <strong>0345 050 1234</strong> (Mon–Fri 8:30–17:00) and ask for your CTS Web Services username and password.</li>
            <li>Your CTWS username is in the format <span className="font-mono">nnn-nnn-nnn</span> — it is <strong>not</strong> the same as your CTS Online web login.</li>
            <li>Once saved, click "Test Connection" to verify your credentials against the BCMS test server.</li>
          </ol>
        </div>
      <ConfirmDialog
        open={!!pendingConfirm}
        title="Remove BCMS Credentials"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Remove"
        confirmVariant="destructive"
      />
      </CardContent>
    </Card>
  );
}

function LisConnectionCard({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);

  const credsQ = useQuery({
    queryKey: ["lis-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-credentials`).then(r => r.json()),
    enabled: !!farmId,
  });
  const creds = credsQ.data;

  useEffect(() => {
    if (creds?.lisUsername) setUsername(creds.lisUsername);
  }, [creds]);

  const saveMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/lis-credentials`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "LIS credentials saved" }); credsQ.refetch(); setDirty(false); setPassword(""); },
    onError: () => toast({ title: "Failed to save credentials", variant: "destructive" }),
  });
  const testMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/lis-credentials/test`, { method: "POST" }).then(r => r.json()),
    onSuccess: (d) => { credsQ.refetch(); toast({ title: d.success ? (d.sandbox ? "Sandbox test passed" : "Connected to LIS") : "Connection failed", description: d.message, variant: d.success ? "default" : "destructive" }); },
    onError: () => toast({ title: "Test failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/lis-credentials`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "LIS credentials removed" }); credsQ.refetch(); setUsername(""); setPassword(""); },
  });

  const statusBadge = () => {
    if (!creds) return null;
    if (!creds.configured) return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", color: "#6b7280", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <WifiOff size={12} />Not configured
      </span>
    );
    if (creds.sandboxMode) return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <Shield size={12} />Sandbox mode — credentials saved
      </span>
    );
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
        <ShieldCheck size={12} />Live — connected to LIS
      </span>
    );
  };

  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-5">
        <SectionHeader
          title="LIS / Livestock Information Service"
          description="Connect your Livestock Information Service (LIS) account to enable one-click sheep, goat and deer movement submission directly from the Movements register. LIS is the England government platform for sheep/goat/deer movement reporting, replacing the old paper AML forms."
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
                : "A LIS Developer Hub subscription key has not yet been configured by BDE. Submissions will simulate the full CLA API flow and log the JSON payload — no data will be sent to LIS. This lets you set up and test your credentials now so the system is ready the moment BDE completes developer hub registration."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>Connection status:</p>
          {credsQ.isLoading ? <Loader2 size={14} className="animate-spin" /> : statusBadge()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>LIS Username</Label>
            <Input
              placeholder="e.g. john.smith@example.com"
              value={username}
              onChange={e => { setUsername(e.target.value); setDirty(true); }}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Your Livestock Information Service login email. Register or log in at <a href="https://cla.livestockinformation.org.uk" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">cla.livestockinformation.org.uk</a>.</p>
          </div>
          <div>
            <Label>LIS Password</Label>
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
            <p className="text-xs text-muted-foreground mt-1">Your LIS portal password. Stored with base64 encoding. Credentials are used to authenticate with the LIS Azure B2C service on your behalf.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            disabled={saveMut.isPending || (!dirty && !username)}
            onClick={() => saveMut.mutate({ lisUsername: username, ...(password && { lisPassword: password }) })}
          >
            {saveMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Credentials
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={testMut.isPending || !creds?.configured}
            onClick={() => testMut.mutate()}
            title={!creds?.configured ? "Save credentials first" : "Test LIS authentication"}
          >
            {testMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Wifi size={14} className="mr-1" />}
            Test Connection
          </Button>
          {creds?.configured && (
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setPendingConfirm({ msg: "Remove LIS credentials for this farm?", fn: () => deleteMut.mutate() })}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>

        {creds?.lastTestedAt && (
          <div style={{ fontSize: "0.78rem", color: creds.testStatus === "ok" ? "#166534" : "#dc2626", display: "flex", alignItems: "center", gap: 6 }}>
            {creds.testStatus === "ok" ? <ShieldCheck size={13} /> : <WifiOff size={13} />}
            Last test: {new Date(creds.lastTestedAt).toLocaleString("en-GB")} — {creds.testMessage}
          </div>
        )}

        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "0.875rem 1rem" }}>
          <p style={{ fontSize: "0.78rem", color: "#1d4ed8", fontWeight: 600, marginBottom: 4 }}>How to get your LIS credentials &amp; how to go live</p>
          <ol style={{ fontSize: "0.78rem", color: "#1e40af", paddingLeft: "1.25rem", lineHeight: 1.8, margin: 0 }}>
            <li>Register or sign in at <a href="https://cla.livestockinformation.org.uk" target="_blank" rel="noopener noreferrer" className="underline">cla.livestockinformation.org.uk</a> using your email address.</li>
            <li>Enter your LIS username (email) and password above and click <strong>Save Credentials</strong>.</li>
            <li>Click <strong>Test Connection</strong> to verify — in sandbox mode this simulates a successful connection.</li>
            <li>Once connected, a blue <strong>Test Submit (LIS)</strong> button will appear on each sheep, goat and deer movement row in the Movements register.</li>
            <li>For live submissions: BDE must register on the <a href="https://livestockinformation.org.uk/developer-hub/" target="_blank" rel="noopener noreferrer" className="underline">LIS Developer Hub</a> and set the <span className="font-mono">LIS_SUBSCRIPTION_KEY</span> environment variable. Submissions then go directly to LIS automatically.</li>
          </ol>
        </div>
      <ConfirmDialog
        open={!!pendingConfirm}
        title="Remove LIS Credentials"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Remove"
        confirmVariant="destructive"
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

function InvoicingCard({
  farmId,
  formData,
  updateField,
  onLogoPathChange,
}: {
  farmId: number | null;
  formData: FarmFormData;
  updateField: (field: keyof Omit<FarmFormData, "sectors" | "isNvzDesignated">, value: string) => void;
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

  const updateField = (field: keyof Omit<FarmFormData, "sectors" | "isNvzDesignated">, value: string) => {
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

    updateFarm({
      name: formData.name.trim(),
      cphNumber: formData.cphNumber.trim() || undefined,
      address: formData.address.trim() || undefined,
      postcode: formData.postcode.trim() || undefined,
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
      country: formData.country || "england",
      eaml2Email: formData.eaml2Email.trim() || undefined,
      flockMark: formData.flockMark.trim() || undefined,
      herdMark: formData.herdMark.trim() || undefined,
      bcmsHoldingNumber: formData.bcmsHoldingNumber.trim() || undefined,
      scotEidNumber: formData.scotEidNumber.trim() || undefined,
      eidCymruNumber: formData.eidCymruNumber.trim() || undefined,
      appaRef: formData.appaRef.trim() || undefined,
      appaRegistrationDate: formData.appaRegistrationDate.trim() || undefined,
      fsaWineProductionRef: formData.fsaWineProductionRef.trim() || undefined,
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

        {/* ── Farm Identity ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Farm Identity"
              description="Core identifiers used on compliance reports and correspondence."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label htmlFor="settings-name">Farm Name *</Label>
                <Input
                  id="settings-name"
                  placeholder="e.g. Manor Farm"
                  value={formData.name}
                  onChange={e => updateField("name", e.target.value)}
                />
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
                />
                <p className="text-xs text-muted-foreground mt-1">Single Business Identifier (Rural Payments Agency)</p>
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
                />
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
                  onChange={e => updateField("totalHectares", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Used for NVZ, biofuel, and spray compliance calculations</p>
              </div>

              <div>
                <Label htmlFor="settings-acreage">Total Area (acres)</Label>
                <Input
                  id="settings-acreage"
                  type="number"
                  placeholder="e.g. 250"
                  value={formData.totalAcreage}
                  onChange={e => updateField("totalAcreage", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">For reference — enter either or both</p>
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
                <strong>Wales:</strong> Sheep and goat movements are reported via <strong>EIDCymru</strong> (eidcymru.org). Cattle movements use <strong>BCMS Online</strong> as in England. Pig movements use <strong>eAML2.org.uk</strong>.
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
                <p className="text-xs text-muted-foreground mt-1">Email registered with your livestock movement portal (eAML2 / BCMS / ScotEID / EIDCymru)</p>
              </div>

              <div>
                <Label htmlFor="settings-flock-mark">Flock Mark (Sheep, Goats &amp; Pigs)</Label>
                <Input
                  id="settings-flock-mark"
                  placeholder="e.g. UK123456"
                  value={formData.flockMark}
                  onChange={e => updateField("flockMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">APHA-issued 8-character flock mark (UK + 6 digits). Required for all sheep, goat and pig movement documents.</p>
              </div>

              <div>
                <Label htmlFor="settings-herd-mark">Herd Mark (Cattle)</Label>
                <Input
                  id="settings-herd-mark"
                  placeholder="e.g. UK654321"
                  value={formData.herdMark}
                  onChange={e => updateField("herdMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">BCMS / ScotEID herd mark for cattle. Printed on cattle passports and required for movement notifications.</p>
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
              {formData.country === "wales" && <>In Wales, sheep and goats use <strong>EIDCymru</strong>; cattle use <strong>BCMS Online</strong>.</>}
              {(formData.country === "england" || !formData.country) && <>In England, sheep, goats and pigs use <strong>eAML2.org.uk</strong>; cattle use <strong>BCMS Online</strong>.</>}
              {formData.country === "northern_ireland" && <>In Northern Ireland, use <strong>NIFAIS</strong> for cattle and <strong>APHIS</strong> for sheep and pigs.</>}
            </div>
          </CardContent>
        </Card>

        {/* ── BCMS / CTS One-Click Submission ── */}
        {farmId && <BcmsCredentialsCard farmId={farmId} bcmsHoldingNumber={formData.bcmsHoldingNumber || undefined} />}

        {/* ── LIS / Livestock Information Service ── */}
        {farmId && <LisConnectionCard farmId={farmId} />}

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
                    Issued by the <strong>Food Standards Agency</strong> (FSA) when you register a vineyard or winery at food.gov.uk. This is your holding-level wine production registration — separate from the per-block FSA Vine Register entries in the Viticulture module.
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
