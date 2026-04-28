import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSecret } from "@/lib/auth";
import { api, type HelpArticle } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BookOpen, Plus, Trash2, Save, RefreshCw, Search, Eye, EyeOff } from "lucide-react";

type DraftArticle = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  published: boolean;
  sortOrder: number;
};

const BLANK: DraftArticle = {
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  content: "",
  published: false,
  sortOrder: 0,
};

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function HelpCentre() {
  const secret = getSecret() ?? "";
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<DraftArticle>(BLANK);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-help-articles"],
    queryFn: () => api.getHelpArticles(secret),
  });

  const articles = data?.articles ?? [];
  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce<Record<string, HelpArticle[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-help-articles"] });

  const createMut = useMutation({
    mutationFn: () => api.createHelpArticle(draft, secret),
    onSuccess: ({ article }) => {
      invalidate();
      setSelectedId(article.id);
      toast({ title: "Article created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: () => api.updateHelpArticle(selectedId as number, draft, secret),
    onSuccess: () => { invalidate(); toast({ title: "Saved" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: () => api.deleteHelpArticle(selectedId as number, secret),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setDraft(BLANK);
      toast({ title: "Article deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const seedMut = useMutation({
    mutationFn: () => api.seedDefaultHelpArticles(secret),
    onSuccess: ({ inserted, skipped }) => {
      invalidate();
      toast({ title: `Defaults loaded: ${inserted} added, ${skipped} already existed` });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function selectArticle(a: HelpArticle) {
    setSelectedId(a.id);
    setDraft({
      title: a.title,
      slug: a.slug,
      category: a.category,
      excerpt: a.excerpt ?? "",
      content: a.content,
      published: a.published,
      sortOrder: a.sortOrder,
    });
  }

  function newArticle() {
    setSelectedId("new");
    setDraft(BLANK);
  }

  function handleTitleChange(val: string) {
    setDraft((d) => ({
      ...d,
      title: val,
      slug: selectedId === "new" ? toSlug(val) : d.slug,
    }));
  }

  function handleSave() {
    if (!draft.title.trim() || !draft.slug.trim() || !draft.category.trim()) {
      toast({ title: "Title, slug and category are required", variant: "destructive" });
      return;
    }
    if (selectedId === "new") {
      createMut.mutate();
    } else {
      updateMut.mutate();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;
  const isNew = selectedId === "new";
  const hasSelection = selectedId !== null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 border-r flex flex-col bg-muted/30">
        <div className="px-4 py-4 border-b bg-background">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Help Articles</span>
              <Badge variant="secondary" className="text-xs">{articles.length}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 gap-1" onClick={newArticle}>
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => seedMut.mutate()}
              disabled={seedMut.isPending}
              title="Load default article stubs"
            >
              {seedMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {search ? "No matches" : "No articles yet — click New or Load Defaults"}
            </div>
          ) : (
            Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
              <div key={cat}>
                <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {cat}
                </div>
                {items.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => selectArticle(a)}
                    className={`w-full text-left px-4 py-2.5 transition-colors border-b border-border/40 ${
                      selectedId === a.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-sm font-medium leading-snug line-clamp-2">{a.title}</span>
                      <span
                        className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${a.published ? "bg-green-500" : "bg-muted-foreground/40"}`}
                        title={a.published ? "Published" : "Draft"}
                      />
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Editor panel ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!hasSelection ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <BookOpen className="w-10 h-10 opacity-20" />
            <p className="text-sm">Select an article to edit, or click New</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">
                {isNew ? "New Article" : "Edit Article"}
              </h1>
              <div className="flex items-center gap-2">
                {!isNew && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete article?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{draft.title}" will be permanently deleted and removed from the Help Centre.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMut.mutate()}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <button
                onClick={() => setDraft((d) => ({ ...d, published: !d.published }))}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  draft.published ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {draft.published
                  ? <><Eye className="w-4 h-4" /> Published — visible to all farmers</>
                  : <><EyeOff className="w-4 h-4" /> Draft — hidden from Help Centre</>
                }
              </button>
              <div className="ml-auto">
                <button
                  onClick={() => setDraft((d) => ({ ...d, published: !d.published }))}
                  className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${
                    draft.published ? "bg-green-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      draft.published ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Core fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input
                  value={draft.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Recording Spray Applications"
                />
              </div>

              <div className="space-y-1">
                <Label>Slug <span className="text-destructive">*</span></Label>
                <Input
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                  placeholder="recording-spray-applications"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">URL-safe identifier — no spaces</p>
              </div>

              <div className="space-y-1">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Input
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  placeholder="e.g. Sprays & Inputs"
                />
                <p className="text-xs text-muted-foreground">Groups articles in the sidebar</p>
              </div>

              <div className="col-span-2 space-y-1">
                <Label>Excerpt</Label>
                <Input
                  value={draft.excerpt}
                  onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                  placeholder="Short summary shown in article list…"
                />
              </div>

              <div className="space-y-1">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) => setDraft((d) => ({ ...d, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-28"
                />
                <p className="text-xs text-muted-foreground">Lower = shown first within category</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <Label>Content (HTML or plain text)</Label>
              <Textarea
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                placeholder="<p>Full article content goes here. HTML is supported.</p>"
                className="font-mono text-sm min-h-[320px] resize-y"
              />
            </div>

            {/* Save footer */}
            <div className="flex justify-end pt-2 border-t">
              <Button onClick={handleSave} disabled={saving} className="gap-1">
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : isNew ? "Create Article" : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
