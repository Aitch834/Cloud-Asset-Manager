import { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import { Plus, Search, RefreshCw, FileDown, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ModulePageProps {
  title: string;
  apiPath: string;
  columns: { key: string; label: string; render?: (val: any, row: any) => string }[];
  formFields?: { key: string; label: string; type?: string; required?: boolean; options?: string[] }[];
  responseKey?: string;
  scope?: "farm" | "global";
}

function formatDate(val: any): string {
  if (!val) return "-";
  try { return new Date(val).toLocaleDateString("en-GB"); } catch { return String(val); }
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return "-";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}/)) return formatDate(val);
  return String(val);
}

export default function ModulePage({ title, apiPath, columns, formFields, responseKey, scope = "farm" }: ModulePageProps) {
  const { farmId } = useAppStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  if (scope === "farm" && !farmId) return <Redirect href="/select" />;

  const fetchUrl = scope === "farm" ? `/api/farms/${farmId}/${apiPath}` : `/api/${apiPath}`;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["farm-module", farmId, apiPath],
    queryFn: async () => {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, any>) => {
      const res = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-module", farmId, apiPath] });
      setShowForm(false);
      setFormData({});
    },
  });

  const rKey = responseKey || "records";
  const records: any[] = data?.[rKey] || data?.records || [];
  const filtered = records.filter((r: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return columns.some((c) => {
      const val = r[c.key];
      return val && String(val).toLowerCase().includes(s);
    });
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <AppLayout title={title}>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          {formFields && (
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-1" /> Add New
            </Button>
          )}
        </div>
      </div>

      {showForm && formFields && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-bold text-lg mb-4">Add New Record</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">{field.label}</label>
                  {field.type === "select" && field.options ? (
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    >
                      <option value="">Select...</option>
                      {field.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    />
                  ) : (
                    <Input
                      type={field.type || "text"}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2 flex gap-2 justify-end pt-2">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setFormData({}); }}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <FileDown className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No records yet</h3>
              <p className="text-foreground/50 text-sm">
                {search ? "No records match your search." : `Get started by adding your first ${title.toLowerCase()} record.`}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((record: any, i: number) => (
                  <tr key={record.id || i} className="hover:bg-black/[0.02] transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="p-4 text-sm text-foreground/80">
                        {col.render ? col.render(record[col.key], record) : formatValue(record[col.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-sm text-foreground/50">
            Showing {filtered.length} of {records.length} records
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
