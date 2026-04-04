import React, { useState, useRef, useEffect } from "react";
import { Input } from "./input";

interface TypeaheadInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function TypeaheadInput({ value, onChange, suggestions, placeholder, required, className }: TypeaheadInputProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase())
    : [];

  useEffect(() => { setHighlighted(-1); }, [filtered.length]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); onChange(filtered[highlighted]); setOpen(false); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <Input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)", overflow: "hidden",
        }}>
          {filtered.slice(0, 8).map((s, i) => (
            <div
              key={s}
              onMouseDown={() => { onChange(s); setOpen(false); }}
              style={{
                padding: "8px 14px", fontSize: "0.875rem", cursor: "pointer",
                background: highlighted === i ? "#f0fdf4" : "#fff",
                color: highlighted === i ? "#166534" : "#111827",
                fontWeight: highlighted === i ? 600 : 400,
                borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
