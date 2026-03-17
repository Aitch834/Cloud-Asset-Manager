import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { ChevronRight, ChevronDown, Table2, Play, Clock, AlertCircle, Database as DbIcon } from "lucide-react";

type SchemaColumn = { name: string; type: string; nullable: boolean };
type SchemaMap = Record<string, SchemaColumn[]>;

type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  durationMs: number;
  limited: boolean;
};

const LIMITS = [100, 250, 500, 1000, 2000];
const STARTER_QUERY = "SELECT * FROM tenants LIMIT 20";

function SchemaBrowser({
  schema,
  loading,
  onInsert,
}: {
  schema: SchemaMap | null;
  loading: boolean;
  onInsert: (text: string) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function toggle(table: string) {
    setOpen((prev) => ({ ...prev, [table]: !prev[table] }));
  }

  if (loading) {
    return (
      <div className="p-4 text-xs text-muted-foreground">Loading schema…</div>
    );
  }
  if (!schema) return null;

  return (
    <div className="text-xs">
      {Object.entries(schema).map(([table, cols]) => (
        <div key={table}>
          <button
            onClick={() => toggle(table)}
            className="flex items-center gap-1.5 w-full px-3 py-1.5 hover:bg-sidebar-accent text-sidebar-foreground/90 font-medium group"
          >
            {open[table] ? (
              <ChevronDown className="w-3 h-3 shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 shrink-0" />
            )}
            <Table2 className="w-3 h-3 shrink-0 text-sidebar-primary" />
            <span
              className="truncate cursor-pointer hover:text-sidebar-accent-foreground"
              title={`Click to insert table name`}
              onClick={(e) => {
                e.stopPropagation();
                onInsert(table);
              }}
            >
              {table}
            </span>
            <span className="ml-auto text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60">
              {cols.length}
            </span>
          </button>
          {open[table] && (
            <div className="pl-8 pb-1">
              {cols.map((col) => (
                <button
                  key={col.name}
                  onClick={() => onInsert(col.name)}
                  className="flex items-center justify-between w-full px-2 py-0.5 hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground rounded text-left"
                  title={`${col.type}${col.nullable ? " (nullable)" : ""}`}
                >
                  <span className="truncate">{col.name}</span>
                  <span className="ml-2 text-sidebar-foreground/40 shrink-0 font-mono">
                    {col.type.replace("character varying", "varchar").replace("timestamp without time zone", "timestamp")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResultsTable({ result }: { result: QueryResult }) {
  if (result.columns.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Query returned no rows.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="text-xs w-full border-collapse min-w-max">
        <thead className="sticky top-0 z-10">
          <tr>
            {result.columns.map((col) => (
              <th
                key={col}
                className="text-left px-3 py-2 bg-muted border-b border-border text-muted-foreground font-semibold whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
              {result.columns.map((col) => {
                const val = row[col];
                const display =
                  val === null || val === undefined
                    ? ""
                    : typeof val === "object"
                    ? JSON.stringify(val)
                    : String(val);
                return (
                  <td
                    key={col}
                    className="px-3 py-1.5 border-b border-border/50 whitespace-nowrap max-w-xs truncate align-top"
                    title={display}
                  >
                    {val === null || val === undefined ? (
                      <span className="text-muted-foreground italic">null</span>
                    ) : (
                      display
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Database() {
  const secret = getSecret()!;
  const [query, setQuery] = useState(STARTER_QUERY);
  const [limit, setLimit] = useState(500);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: schemaData, isLoading: schemaLoading } = useQuery({
    queryKey: ["admin-schema"],
    queryFn: () => api.getSchema(secret),
    staleTime: 60_000,
  });

  const { mutate: runQuery, isPending } = useMutation({
    mutationFn: () => api.runSql(query, limit, secret),
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setResult(null);
    },
  });

  function execute() {
    if (!query.trim() || isPending) return;
    runQuery();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        execute();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [query, isPending]);

  const insertAtCursor = useCallback(
    (text: string) => {
      const el = textareaRef.current;
      if (!el) {
        setQuery((q) => q + " " + text);
        return;
      }
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newVal = query.slice(0, start) + text + query.slice(end);
      setQuery(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + text.length;
        el.focus();
      });
    },
    [query]
  );

  return (
    <div className="flex h-full">
      <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border overflow-y-auto flex flex-col">
        <div className="px-4 py-3 border-b border-sidebar-border flex items-center gap-2">
          <DbIcon className="w-4 h-4 text-sidebar-primary" />
          <span className="text-sm font-semibold text-sidebar-accent-foreground">Schema</span>
        </div>
        <SchemaBrowser
          schema={schemaData?.tables ?? null}
          loading={schemaLoading}
          onInsert={insertAtCursor}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border p-4 pb-3">
          <h1 className="text-lg font-semibold">SQL Console</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Read-only SELECT queries only. Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+Enter</kbd> to run.
          </p>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="border border-border rounded-lg overflow-hidden">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              rows={8}
              className="w-full p-4 bg-[#0f1117] text-[#e2e8f0] font-mono text-sm resize-none outline-none leading-relaxed"
              placeholder="SELECT * FROM tenants LIMIT 20;"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={execute}
              disabled={isPending || !query.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              {isPending ? "Running…" : "Run Query"}
            </button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Row limit:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground"
              >
                {LIMITS.map((l) => (
                  <option key={l} value={l}>
                    {l.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {result && (
              <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{result.durationMs}ms</span>
                <span className="mx-1">·</span>
                <span>
                  {result.rowCount.toLocaleString()} row{result.rowCount !== 1 ? "s" : ""}
                  {result.limited ? ` (limited to ${limit.toLocaleString()})` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 mx-4 mb-4 border border-border rounded-lg overflow-hidden min-h-0">
          {error ? (
            <div className="flex items-start gap-3 p-4 text-sm text-destructive bg-destructive/5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
            </div>
          ) : result ? (
            <ResultsTable result={result} />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Run a query to see results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
