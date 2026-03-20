import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown, ChevronUp, BookOpen, Loader2 } from "lucide-react";

interface HelpArticle {
  id: number;
  title: string;
  category: string;
  content: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Getting Started": "bg-blue-50 text-blue-700",
  "Sprays & Inputs": "bg-cyan-50 text-cyan-700",
  "Fields & Crops": "bg-emerald-50 text-emerald-700",
  "Equipment": "bg-orange-50 text-orange-700",
  "Livestock": "bg-amber-50 text-amber-700",
  "Inspections": "bg-violet-50 text-violet-700",
  "Compliance": "bg-red-50 text-red-700",
  "Biosecurity": "bg-lime-50 text-lime-700",
  "Staff & Training": "bg-indigo-50 text-indigo-700",
  "Risk & Waste": "bg-rose-50 text-rose-700",
  "Financial": "bg-green-50 text-green-700",
  "Weather": "bg-sky-50 text-sky-700",
  "Documents": "bg-gray-50 text-gray-700",
  "Biofuel / RTFO": "bg-teal-50 text-teal-700",
  "Mobile App": "bg-purple-50 text-purple-700",
  "Dashboards": "bg-fuchsia-50 text-fuchsia-700",
  "Nutrient Management": "bg-yellow-50 text-yellow-700",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-600";
}

export default function HelpCentre() {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery<{ records: HelpArticle[] }>({
    queryKey: ["help-articles"],
    queryFn: async () => {
      const res = await fetch("/api/help/articles");
      if (!res.ok) throw new Error("Failed to load articles");
      return res.json();
    },
  });

  const articles = data?.records ?? [];

  const filtered = articles.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(s) ||
      a.category.toLowerCase().includes(s) ||
      a.content.toLowerCase().includes(s)
    );
  });

  const grouped = filtered.reduce<Record<string, HelpArticle[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <AppLayout title="Help Centre">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white h-12 text-base"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <Card className="p-8 text-center text-foreground/60">
            Failed to load help articles. Please try again later.
          </Card>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
            <p className="text-foreground/50">No articles match your search.</p>
          </Card>
        )}

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColor(category)}`}>
                {category}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {items.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => toggle(article.id)}
                >
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-primary/60 flex-shrink-0" />
                      <span className="font-semibold text-foreground">{article.title}</span>
                    </div>
                    {openId === article.id
                      ? <ChevronUp className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                      : <ChevronDown className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                    }
                  </div>
                  {openId === article.id && (
                    <div className="px-5 pb-5 pt-0 border-t border-border bg-black/[0.015]">
                      <div className="mt-4 help-article-body">
                        {article.content.includes("<") ? (
                          <div
                            className="help-html-content"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                          />
                        ) : (
                          <div className="space-y-3">
                            {article.content.split("\n\n").map((para, i) => (
                              <p key={i} className="text-foreground/75 text-sm leading-relaxed">
                                {para}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
