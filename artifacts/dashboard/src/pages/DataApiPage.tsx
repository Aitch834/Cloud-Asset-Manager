import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Key, Plus, Trash2, Copy, Check, Database, ShieldCheck, Clock,
  FileSpreadsheet, ChartBar, Code2, AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

interface KeysResponse {
  keys: ApiKey[];
}

interface CreateKeyResponse {
  key: ApiKey;
  rawKey: string;
}

const ENDPOINTS = [
  {
    path: "/data-export/fields",
    title: "Field Register",
    description: "All fields on the holding: name, field reference, area (ha), farmable area, soil type, current use, organic flag, NVZ designation.",
    dateFilter: false,
    example: "GET /data-export/fields",
  },
  {
    path: "/data-export/livestock-movements",
    title: "Livestock Movements",
    description: "On/off movements: movement type, date, species, animal count, from/to location, licence number, ear tag numbers, transporter details.",
    dateFilter: true,
    example: "GET /data-export/livestock-movements?from=2025-01-01&to=2025-12-31",
  },
  {
    path: "/data-export/medicine-records",
    title: "Medicine Records",
    description: "Medicine administration: product name, batch number, dosage, administration route, operator, withdrawal period (days) and withdrawal end date.",
    dateFilter: true,
    example: "GET /data-export/medicine-records?from=2025-01-01",
  },
  {
    path: "/data-export/spray-records",
    title: "Spray Applications",
    description: "Spray applications: date, area sprayed (ha), application rate, water volume (L), wind speed (km/h), wind direction, temperature (°C), operator, certificate number, equipment used.",
    dateFilter: true,
    example: "GET /data-export/spray-records?format=csv",
  },
  {
    path: "/data-export/soil-tests",
    title: "Soil Tests",
    description: "Soil sample records joined with nutrient results — one row per nutrient per sample. Includes sample reference, laboratory, depth, and result index/status.",
    dateFilter: true,
    example: "GET /data-export/soil-tests?from=2024-01-01",
  },
  {
    path: "/data-export/inspections",
    title: "Inspections",
    description: "Formal inspection records: type, inspector name, assessing body, inspection date, overall result, summary, next inspection due date.",
    dateFilter: true,
    example: "GET /data-export/inspections",
  },
  {
    path: "/data-export/staff-training",
    title: "Staff Training",
    description: "Training records: course title, provider, training date, expiry date, competency achieved, assessor name.",
    dateFilter: true,
    example: "GET /data-export/staff-training?format=csv",
  },
  {
    path: "/data-export/equipment",
    title: "Equipment Register",
    description: "Equipment: asset number, name, type, make, model, serial number, year of manufacture, current value (pence), status, location.",
    dateFilter: false,
    example: "GET /data-export/equipment",
  },
  {
    path: "/data-export/financial-records",
    title: "Financial Records",
    description: "Financial transactions: type (income/expense), category, description, amount (pence), VAT amount (pence), VAT rate, vendor/customer, payment method, reference.",
    dateFilter: true,
    example: "GET /data-export/financial-records?from=2025-04-01&to=2026-03-31",
  },
  {
    path: "/data-export/risk-assessments",
    title: "Risk Assessments",
    description: "Risk assessments: title, area, hazard description, risk level, control measures, assessed by, assessment date, review date, status.",
    dateFilter: false,
    example: "GET /data-export/risk-assessments",
  },
];

const BASE_URL = "https://bdefarmtrac.co.uk/api";

const QUICK_START = {
  powerQuery: (key: string) => `// Excel Power Query — paste into Advanced Editor
let
    ApiKey = "${key}",
    BaseUrl = "${BASE_URL}",
    GetData = (endpoint as text) =>
        let
            Headers = [#"X-API-Key" = ApiKey],
            Source = Json.Document(Web.Contents(BaseUrl & endpoint, [Headers = Headers])),
            Data = Source[data]
        in
            Table.FromRecords(Data),
    Fields = GetData("/data-export/fields")
in
    Fields`,
  googleSheets: (key: string) => `// Google Sheets — paste into any cell
=LET(
  url, "${BASE_URL}/data-export/fields",
  headers, {"X-API-Key", "${key}"},
  data, IMPORTDATA(url)
)

// Or use Apps Script for authenticated requests:
function getFieldData() {
  const response = UrlFetchApp.fetch(
    '${BASE_URL}/data-export/fields',
    { headers: { 'X-API-Key': '${key}' } }
  );
  const data = JSON.parse(response.getContentText()).data;
  const sheet = SpreadsheetApp.getActiveSheet();
  if (data.length > 0) {
    sheet.appendRow(Object.keys(data[0]));
    data.forEach(row => sheet.appendRow(Object.values(row)));
  }
}`,
  python: (key: string) => `import requests
import pandas as pd

API_KEY = "${key}"
BASE_URL = "${BASE_URL}"
HEADERS = {"X-API-Key": API_KEY}

def get_data(endpoint: str, **params) -> pd.DataFrame:
    response = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, params=params)
    response.raise_for_status()
    return pd.DataFrame(response.json()["data"])

# Examples
fields = get_data("/data-export/fields")
movements = get_data("/data-export/livestock-movements", **{"from": "2025-01-01"})
spray_csv = requests.get(f"{BASE_URL}/data-export/spray-records",
    headers=HEADERS, params={"format": "csv"}).text`,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function DataApiPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<string>({
    page: "data-api",
    farmId,
    validIds: ["powerQuery", "googleSheets", "python"],
    defaultTab: "powerQuery",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<KeysResponse>({
    queryKey: ["data-api-keys", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/api-keys`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const createKey = useMutation({
    mutationFn: async (name: string) => {
      const r = await fetch(`/api/farms/${farmId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Failed to create key");
      }
      return r.json() as Promise<CreateKeyResponse>;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["data-api-keys", farmId] });
      setCreatedKey(res.rawKey);
      setNewKeyName("");
      setShowNewKeyDialog(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const revokeKey = useMutation({
    mutationFn: async (keyId: number) => {
      const r = await fetch(`/api/farms/${farmId}/api-keys/${keyId}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Failed to revoke key");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-api-keys", farmId] });
      setRevokeConfirmId(null);
      toast({ title: "API key revoked", description: "The key can no longer be used to access data." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const activeKeys = (data?.keys ?? []).filter((k) => !k.revokedAt);
  const revokedKeys = (data?.keys ?? []).filter((k) => k.revokedAt);
  const exampleKey = activeKeys[0]?.keyPrefix
    ? `${activeKeys[0].keyPrefix}…`
    : "bdeft_<your-key>";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Data API Access
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Secure, read-only API keys to connect your farm data to Excel, Power BI, Google Sheets, and Python.
          </p>
        </div>
        <Button onClick={() => setShowNewKeyDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Generate New Key
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Read-only</p>
            <p className="text-xs text-muted-foreground">API keys grant read access only — no data can be modified via the API.</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Rate limited</p>
            <p className="text-xs text-muted-foreground">100 requests per minute per key. Date-range filtering keeps payloads small.</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
          <Key className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Per-farm keys</p>
            <p className="text-xs text-muted-foreground">Each key is scoped to this farm only. Revoke any key instantly from this page.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active API Keys</CardTitle>
          <CardDescription>Keys are shown by name and prefix only. The full key is shown once at creation.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
          ) : activeKeys.length === 0 ? (
            <div className="py-8 text-center">
              <Key className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active keys yet. Generate your first key to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{key.keyPrefix}…</code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(key.createdAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.lastUsedAt ? format(new Date(key.lastUsedAt), "d MMM yyyy HH:mm") : "Never"}
                    </TableCell>
                    <TableCell>
                      {revokeConfirmId === key.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => revokeKey.mutate(key.id)}
                            disabled={revokeKey.isPending}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setRevokeConfirmId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setRevokeConfirmId(key.id)}
                          title="Revoke key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {revokedKeys.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Revoked Keys</p>
              <div className="space-y-1">
                {revokedKeys.map((key) => (
                  <div key={key.id} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded line-through">{key.keyPrefix}…</code>
                    <span>{key.name}</span>
                    <Badge variant="outline" className="text-xs text-red-500 border-red-200">Revoked {format(new Date(key.revokedAt!), "d MMM yyyy")}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Start</CardTitle>
          <CardDescription>
            Authenticate using:{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer &lt;key&gt;</code>{" "}
            or{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">X-API-Key: &lt;key&gt;</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="powerQuery" className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Power Query
              </TabsTrigger>
              <TabsTrigger value="googleSheets" className="flex items-center gap-1.5">
                <ChartBar className="w-3.5 h-3.5" /> Google Sheets
              </TabsTrigger>
              <TabsTrigger value="python" className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Python / R
              </TabsTrigger>
            </TabsList>

            {(["powerQuery", "googleSheets", "python"] as const).map((tab) => (
              <TabsContent key={tab} value={tab}>
                <div className="relative">
                  <div className="absolute top-2 right-2">
                    <CopyButton text={QUICK_START[tab](exampleKey)} />
                  </div>
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono pr-10">
                    {QUICK_START[tab](exampleKey)}
                  </pre>
                </div>
                {tab === "googleSheets" && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                    IMPORTDATA does not support custom headers. Use the Apps Script method above for authenticated access.
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Endpoints</CardTitle>
          <CardDescription>
            All endpoints are prefixed with{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{BASE_URL}</code>.
            Append <code className="text-xs bg-muted px-1.5 py-0.5 rounded">?format=csv</code> to any endpoint for CSV output.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {ENDPOINTS.map((ep) => (
              <AccordionItem key={ep.path} value={ep.path}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono shrink-0">{ep.path}</code>
                    <span className="font-medium">{ep.title}</span>
                    {ep.dateFilter && (
                      <Badge variant="outline" className="text-xs shrink-0">Date filter</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-1 pb-2 space-y-3 pl-1">
                    <p className="text-sm text-muted-foreground">{ep.description}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1">{ep.example}</code>
                      <CopyButton text={`${BASE_URL}${ep.example.replace("GET ", "")}`} />
                    </div>
                    {ep.dateFilter && (
                      <p className="text-xs text-muted-foreground">
                        Supports <code className="bg-muted px-1 rounded">?from=YYYY-MM-DD</code> and <code className="bg-muted px-1 rounded">?to=YYYY-MM-DD</code> query parameters.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Give the key a descriptive name so you can identify it later (e.g. "Excel Dashboard", "Power BI Report").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newKeyName.trim()) {
                  createKey.mutate(newKeyName.trim());
                }
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createKey.mutate(newKeyName.trim())}
                disabled={!newKeyName.trim() || createKey.isPending}
              >
                {createKey.isPending ? "Generating…" : "Generate Key"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!createdKey} onOpenChange={(open) => { if (!open) setCreatedKey(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" /> API Key Created
            </DialogTitle>
            <DialogDescription>
              Copy this key now — it will not be shown again. Store it securely (e.g. in your Excel workbook or environment variables).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <code className="text-sm font-mono flex-1 break-all">{createdKey}</code>
              <CopyButton text={createdKey ?? ""} />
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>This is the only time the full key will be displayed. If you lose it, revoke it and generate a new one.</span>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCreatedKey(null)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
