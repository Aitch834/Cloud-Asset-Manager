import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "./button";
import { Pen, Trash2 } from "lucide-react";

interface SignaturePadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label: string;
  height?: number;
}

export function SignaturePad({ value, onChange, label, height = 160 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  function getPos(e: MouseEvent | Touch, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "clientX" in e ? e.clientX : e.clientX;
    const clientY = "clientY" in e ? e.clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth || 600;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  }, [height]);

  function startDraw(x: number, y: number) {
    drawing.current = true;
    lastPos.current = { x, y };
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    setHasStrokes(true);
  }

  function draw(x: number, y: number) {
    if (!drawing.current || !lastPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = { x, y };
  }

  function endDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current!;
    onChange(canvas.toDataURL("image/png"));
  }

  function onMouseDown(e: React.MouseEvent) {
    const p = getPos(e.nativeEvent, canvasRef.current!);
    startDraw(p.x, p.y);
  }
  function onMouseMove(e: React.MouseEvent) {
    const p = getPos(e.nativeEvent, canvasRef.current!);
    draw(p.x, p.y);
  }
  function onTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    const p = getPos(e.touches[0], canvasRef.current!);
    startDraw(p.x, p.y);
  }
  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    const p = getPos(e.touches[0], canvasRef.current!);
    draw(p.x, p.y);
  }

  function handleClear() {
    clearCanvas();
    onChange(null);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
          <Pen size={13} style={{ color: "#6b7280" }} />{label}
        </span>
        {hasStrokes && (
          <button type="button" onClick={handleClear} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "#ef4444", display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 4 }}>
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>
      <div style={{ position: "relative", border: "2px dashed #d1d5db", borderRadius: 10, overflow: "hidden", background: "#fff", height }}>
        {!hasStrokes && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", gap: 4 }}>
            <Pen size={20} style={{ color: "#d1d5db" }} />
            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Sign here using stylus, finger or mouse</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={endDraw}
        />
        <div style={{ position: "absolute", bottom: 8, left: 12, right: 12, borderTop: "1px solid #e5e7eb", paddingTop: 4 }} />
      </div>
    </div>
  );
}

interface SignatureModalProps {
  open: boolean;
  label: string;
  declarationText: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
  visitorName?: string;
  farmName?: string;
}

export function SignatureModal({ open, label, declarationText, onConfirm, onCancel, visitorName, farmName }: SignatureModalProps) {
  const [sig, setSig] = useState<string | null>(null);

  useEffect(() => { if (open) setSig(null); }, [open]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px 24px", width: "min(680px, 96vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>{label}</h2>
        {farmName && <p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: "0 0 14px" }}>{farmName}</p>}
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: "0.8125rem", color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>
          {declarationText}
        </div>
        {visitorName && (
          <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: 10 }}>
            Signatory: <strong style={{ color: "#111827" }}>{visitorName}</strong>
          </p>
        )}
        <SignaturePad value={sig} onChange={setSig} label="Signature" height={180} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            type="button"
            disabled={!sig}
            onClick={() => sig && onConfirm(sig)}
            style={{ background: "#166534", color: "#fff", border: "none" }}
          >
            Confirm Signature
          </Button>
        </div>
      </div>
    </div>
  );
}
