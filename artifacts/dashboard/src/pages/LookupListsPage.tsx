import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/use-user-role";
import {
  ChevronRight,
  Loader2,
  Plus,
  X,
  Search,
  ShieldOff,
} from "lucide-react";

interface SummaryDef {
  key: string;
  label: string;
  description: string;
  authority: string;
  standardCount: number;
  customCount: number;
}

interface LookupItem {
  id: number;
  value: string;
  label: string;
  groupLabel: string | null;
  isCustom: boolean;
}

const MODULE_GROUPS: { id: string; label: string; description: string; match: (key: string) => boolean }[] = [
  {
    id: "general",
    label: "General",
    description: "Lists used across all farm activities — inspections, grants, transactions, sprays and more.",
    match: (k) => !k.startsWith("vineyard_") && !k.startsWith("organic_"),
  },
  {
    id: "viticulture",
    label: "Viticulture",
    description: "Vineyard-specific lists for varieties, rootstocks, operations and spray records.",
    match: (k) => k.startsWith("vineyard_"),
  },
  {
    id: "organic",
    label: "Organic Production",
    description: "Lists for organic certification, inputs and copper product records.",
    match: (k) => k.startsWith("organic_"),
  },
];

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-2 border-b border-border mb-4">
      <h3 className="text-base font-bold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

function LookupListRow({
  def,
  farmId,
  canEdit,
}: {
  def: SummaryDef;
  farmId: number;
  canEdit: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [addValue, setAddValue] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const itemsQ = useQuery<{ items: LookupItem[] }>({
    queryKey: ["lookup-items", def.key],
    queryFn: () => fetch(`/api/lookups/${def.key}`).then((r) => r.json()),
    enabled: isOpen,
  });

  const addMut = useMutation({
    mutationFn: (label: string) =>
      fetch(`/api/farms/${farmId}/lookups/${def.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      }).then((r) => {
        if (!r.ok) return r.json().then((e: { error?: string }) => Promise.reject(e));
        return r.json();
      }),
    onSuccess: () => {
      setAddValue("");
      queryClient.invalidateQueries({ queryKey: ["lookup-items", def.key] });
      queryClient.invalidateQueries({ queryKey: ["lookups-summary", farmId] });
      toast({ title: "Item added" });
    },
    onError: (e: { error?: string }) =>
      toast({ title: e?.error ?? "Failed to add item", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (itemId: number) =>
      fetch(`/api/farms/${farmId}/lookups/${def.key}/${itemId}`, {
        method: "DELETE",
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lookup-items", def.key] });
      queryClient.invalidateQueries({ queryKey: ["lookups-summary", farmId] });
    },
    onError: () => toast({ title: "Failed to remove item", variant: "destructive" }),
  });

  const items = itemsQ.data?.items ?? [];
  const standardItems = items.filter((i) => !i.isCustom);
  const customItems = items.filter((i) => i.isCustom);

  // Build grouped structure for standard items that carry a groupLabel
  const hasGroups = standardItems.some((i) => i.groupLabel);
  const standardGroups: { group: string; items: LookupItem[] }[] = [];
  if (hasGroups) {
    const seen = new Map<string, LookupItem[]>();
    for (const item of standardItems) {
      const key = item.groupLabel ?? "Other";
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(item);
    }
    seen.forEach((groupItems, group) => standardGroups.push({ group, items: groupItems }));
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setIsOpen((o) => !o)}
      >
        <ChevronRight
          size={15}
          className={`shrink-0 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{def.label}</p>
          {def.description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-1">
              {def.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {def.standardCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {def.standardCount} standard
            </span>
          )}
          {def.customCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
              +{def.customCount} custom
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border bg-muted/10 p-4 space-y-4">
          {itemsQ.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={13} className="animate-spin" />
              Loading items…
            </div>
          )}

          {standardItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Standard items
              </p>
              {hasGroups ? (
                <div className="space-y-3">
                  {standardGroups.map(({ group, items: gItems }) => (
                    <div key={group}>
                      <p className="text-xs font-medium text-foreground mb-1.5">{group}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {gItems.map((item) => (
                          <span
                            key={item.id}
                            className="text-xs px-2.5 py-1 bg-background border border-border rounded-full text-muted-foreground"
                          >
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {standardItems.map((item) => (
                    <span
                      key={item.id}
                      className="text-xs px-2.5 py-1 bg-background border border-border rounded-full text-muted-foreground"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {customItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Your custom items
              </p>
              <div className="flex flex-wrap gap-1.5">
                {customItems.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-green-900"
                  >
                    {item.label}
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMut.mutate(item.id);
                        }}
                        disabled={deleteMut.isPending}
                        className="hover:text-red-600 transition-colors ml-0.5 leading-none"
                        title="Remove custom item"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!itemsQ.isLoading && customItems.length === 0 && standardItems.length > 0 && (
            <p className="text-xs text-muted-foreground italic">
              No custom items yet — add your own below.
            </p>
          )}

          {canEdit && (
            <div className="flex gap-2 pt-1">
              <Input
                placeholder={`Add a custom item to ${def.label}…`}
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addValue.trim()) addMut.mutate(addValue.trim());
                }}
                className="text-sm h-8"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={!addValue.trim() || addMut.isPending}
                onClick={() => addMut.mutate(addValue.trim())}
                className="h-8 px-3 shrink-0"
              >
                {addMut.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={12} className="mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          )}

          {!canEdit && (
            <p className="text-xs text-muted-foreground italic">
              Manager role or above is required to add or remove custom items.
            </p>
          )}

          {def.authority && (
            <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">
              Standard items sourced from: {def.authority}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function LookupListsPage() {
  const { farmId, tenantSlug } = useAppStore();
  const { isAtLeast } = useUserRole();
  const [search, setSearch] = useState("");

  const canEdit = isAtLeast("manager");

  const summaryQ = useQuery<{ definitions: SummaryDef[] }>({
    queryKey: ["lookups-summary", tenantSlug],
    queryFn: async () => {
      const res = await fetch(`/api/lookups/summary`);
      if (!res.ok) throw new Error(`Failed to load lookup lists (${res.status})`);
      return res.json();
    },
    retry: 1,
  });

  const allDefs = summaryQ.data?.definitions ?? [];

  const filtered = search.trim()
    ? allDefs.filter(
        (d) =>
          d.label.toLowerCase().includes(search.toLowerCase()) ||
          d.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : allDefs;

  const visibleGroups = MODULE_GROUPS.map((group) => ({
    ...group,
    defs: filtered.filter((d) => group.match(d.key)),
  })).filter((g) => g.defs.length > 0);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-xl font-bold">Lookup Lists</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the dropdown options used throughout BDE Farm Trac. Standard
            items are maintained by BDE and cannot be removed. You can add your
            own custom entries to any list — they appear alongside the standard
            options for everyone on your farm.
          </p>
        </div>

        {!canEdit && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <ShieldOff size={15} className="mt-0.5 shrink-0" />
            <p>
              You are viewing in read-only mode. Manager role or above is
              required to add or remove custom items.
            </p>
          </div>
        )}

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search lookup lists…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        {summaryQ.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 size={16} className="animate-spin" />
            Loading lookup lists…
          </div>
        )}

        {!summaryQ.isLoading && visibleGroups.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No lookup lists match your search.
            </CardContent>
          </Card>
        )}

        {visibleGroups.map((group) => (
          <Card key={group.id}>
            <CardContent className="p-6 space-y-3">
              <SectionHeader title={group.label} description={group.description} />
              {group.defs.map((def) => (
                <LookupListRow
                  key={def.key}
                  def={def}
                  farmId={farmId!}
                  canEdit={canEdit}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
