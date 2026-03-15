import { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import { Plus, Search, RefreshCw, FileDown, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface ColumnDef {
  key: string;
  label: string;
  render?: (val: string | number | boolean | null | undefined, row: Record<string, unknown>) => string;
}

interface FormFieldDef {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
}

interface ModulePageProps {
  title: string;
  apiPath: string;
  columns: ColumnDef[];
  formFields?: FormFieldDef[];
  responseKey?: string;
  scope?: "farm" | "global";
}

function formatDate(val: unknown): string {
  if (!val) return "-";
  try { return new Date(String(val)).toLocaleDateString("en-GB"); } catch { return String(val); }
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "-";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}/)) return formatDate(val);
  return String(val);
}

export default function ModulePage({ title, apiPath, columns, formFields, responseKey, scope = "farm" }: ModulePageProps) {
  const { farmId } = useAppStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  if (scope === "farm" && !farmId) return <Redirect href="/select" />;

  const fetchUrl = scope === "farm" ? `/api/farms/${farmId}/${apiPath}` : `/api/${apiPath}`;

  const LoadingSkeleton = () => (
    <AppLayout title={title}>
      <div className="animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 bg-black/5 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-black/5 rounded-lg" />
            <div className="h-9 w-24 bg-black/5 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <div className="space-y-4">
            <div className="h-8 bg-black/5 rounded w-full" />
            <div className="h-8 bg-black/5 rounded w-full" />
            <div className="h-8 bg-black/5 rounded w-full" />
            <div className="h-8 bg-black/5 rounded w-3/4" />
          </div>
        </div>
      </div>
    </AppLayout>
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["farm-module", farmId, apiPath],
    queryFn: async () => {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<Record<string, unknown>>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, string | number>) => {
      const res = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json() as Promise<Record<string, unknown>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-module", farmId, apiPath] });
      setShowForm(false);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, string | number> }) => {
      const res = await fetch(`${fetchUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json() as Promise<Record<string, unknown>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-module", farmId, apiPath] });
      setEditingRecord(null);
      setFormData({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${fetchUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json() as Promise<Record<string, unknown>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-module", farmId, apiPath] });
      setDeleteConfirmId(null);
    },
  });

  const rKey = responseKey || "records";
  const rawRecords = data?.[rKey] ?? data?.records;
  const records: Record<string, unknown>[] = Array.isArray(rawRecords) ? rawRecords : [];
  const filtered = records.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return columns.some((c) => {
      const val = r[c.key];
      return val != null && String(val).toLowerCase().includes(s);
    });
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id as number, body: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditForm = (record: Record<string, unknown>) => {
    setEditingRecord(record);
    const prefilled: Record<string, string | number> = {};
    if (formFields) {
      for (const field of formFields) {
        const val = record[field.key];
        if (val != null) prefilled[field.key] = val as string | number;
      }
    }
    setFormData(prefilled);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <AppLayout title={title}>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Failed to load data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was a problem loading your {title.toLowerCase()} records. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

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
            <Button size="sm" onClick={() => { setShowForm(!showForm); setEditingRecord(null); setFormData({}); }}>
              <Plus className="w-4 h-4 mr-1" /> Add New
            </Button>
          )}
        </div>
      </div>

      {(showForm || editingRecord) && formFields && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">
                {editingRecord ? "Edit Record" : "Add New Record"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingRecord(null); setFormData({}); }} className="p-1 rounded hover:bg-black/5">
                <X className="w-5 h-5 text-foreground/50" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">{field.label}</label>
                  {field.type === "select" && field.options ? (
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={String(formData[field.key] ?? "")}
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
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    />
                  ) : (
                    <Input
                      type={field.type || "text"}
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) => setFormData({ ...formData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2 flex gap-2 justify-end pt-2">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingRecord(null); setFormData({}); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  {editingRecord ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
          </DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure you want to delete this record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {formFields && <th className="text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((record, i: number) => (
                  <tr key={(record.id as number) || i} className="hover:bg-black/[0.02] transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="p-4 text-sm text-foreground/80">
                        {col.render
                          ? col.render(record[col.key] as string | number | boolean | null | undefined, record)
                          : formatValue(record[col.key])}
                      </td>
                    ))}
                    {formFields && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditForm(record)}
                            className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(record.id as number)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
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
