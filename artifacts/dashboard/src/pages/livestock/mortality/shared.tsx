import { CheckCircle2 } from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface MortalityRecord {
  id: number;
  farmId: number;
  herdId: number | null;
  animalId: number | null;
  contractorId: number | null;
  contractorName: string | null;
  contractorApprovalNumber: string | null;
  tagNumber: string | null;
  species: string;
  breed: string | null;
  dateOfDeath: string;
  causeOfDeath: string;
  disposalMethod: string;
  disposalOperator: string | null;
  disposalRef: string | null;
  veterinaryAttended: boolean;
  vetName: string | null;
  postMortemCarriedOut: boolean;
  postMortemFindings: string | null;
  bcmsNotified: boolean;
  bcmsNotificationRef: string | null;
  notes: string | null;
  invoiceStatus: string;
  invoiceRef: string | null;
  invoiceAmount: string | null;
  invoicePaidDate: string | null;
  status: string;
  createdAt: string;
}

export interface FallenStockContractor {
  id: number;
  farmId: number;
  name: string;
  approvalNumber: string;
  operatorType: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface VetHealthPlan {
  id: number;
  farmId: number;
  planYear: number;
  vetName: string;
  practiceName: string | null;
  practicePhone: string | null;
}

export interface Animal {
  id: number;
  farmId: number;
  herdId: number | null;
  tagNumber: string | null;
  earTagNumber: string | null;
  species: string;
  breed: string | null;
  status: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const CAUSE_LABELS: Record<string, string> = {
  disease: "Disease / Illness", injury: "Injury / Trauma", metabolic: "Metabolic Disorder",
  "difficult-birth": "Difficult Birth", hypothermia: "Hypothermia / Exposure",
  predation: "Predation", accidental: "Accidental", euthanised: "Euthanised",
  unknown: "Unknown / Sudden Death", other: "Other",
};

export const DISPOSAL_LABELS: Record<string, string> = {
  nfas: "Fallen Stock (NFAS)", "hunt-kennel": "Hunt Kennel / Knacker",
  incineration: "Incineration / Cremation", "burial-licensed": "On-farm Burial",
  rendering: "Rendering Plant", other: "Other",
};

export const CONTRACTOR_TYPES: Record<string, string> = {
  "nfas-collector": "NFAS Fallen Stock Collector",
  "hunt-kennel": "Hunt Kennel",
  "knacker": "Knacker / Slaughterer",
  "rendering": "Rendering Plant",
  "incinerator": "Licensed Incinerator",
  "other": "Other",
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  reported:          { label: "Awaiting Disposal",  color: "bg-orange-50 text-orange-700 border-orange-200", step: 1 },
  disposal_arranged: { label: "Disposal Arranged",  color: "bg-amber-50 text-amber-700 border-amber-200",   step: 2 },
  disposed:          { label: "Collected",           color: "bg-blue-50 text-blue-700 border-blue-200",      step: 3 },
  closed:            { label: "Closed",              color: "bg-green-50 text-green-700 border-green-200",   step: 4 },
};

export const STAGE_LABELS = ["Death Reported", "Disposal Arranged", "Collected", "Closed"];

export const EMPTY_STAGE1 = {
  animalId: "", tagNumber: "", species: "", breed: "",
  dateOfDeath: new Date().toISOString().slice(0, 10),
  causeOfDeath: "", disposalMethod: "", notes: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.reported;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── Record Stepper ───────────────────────────────────────────────────────────

export function RecordStepper({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 1;
  return (
    <div className="flex items-start gap-0 mb-5">
      {STAGE_LABELS.map((label, i) => {
        const step = i + 1;
        const done = step < currentStep;
        const active = step === currentStep;
        return (
          <div key={label} className="flex items-start flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2
                ${done ? "bg-green-500 border-green-500 text-white" : active ? "bg-primary border-primary text-primary-foreground" : "bg-white border-gray-300 text-gray-400"}`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
              </div>
              <span className={`text-xs mt-1 text-center leading-tight max-w-[60px]
                ${active ? "font-semibold text-primary" : done ? "text-green-600" : "text-gray-400"}`}>{label}</span>
            </div>
            {i < STAGE_LABELS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mt-3 ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
