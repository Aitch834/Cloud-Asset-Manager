import type { Farm } from "@/lib/types";

/**
 * Shape returned by GET /api/my-farms. Identity references are nullable text
 * columns in the API and must remain nullable when copied into persisted farm
 * state; report templates distinguish an unset reference from a value.
 */
export interface ApiFarm {
  id: number;
  name: string;
  tenantSlug: string;
  sectorArable: boolean;
  sectorBeef: boolean;
  sectorDairy: boolean;
  sectorPigs: boolean;
  sectorPoultry: boolean;
  sectorViticulture: boolean;
  cphNumber?: unknown;
  sbiNumber?: unknown;
  redTractorId?: unknown;
  wineGbMembershipNumber?: unknown;
  aphaRegistrationNumber?: unknown;
  fsaWineRegistrationNumber?: unknown;
  vineyardRegisterNumber?: unknown;
  idleBarrelDays?: number | null;
  approachingNeutralFills?: number | null;
}

function nullableText(value: unknown): string | null | undefined {
  if (typeof value === "string" || value === null) return value;
  return undefined;
}

/** Maps the mobile farms endpoint response without coercing report references. */
export function mapApiFarm(farm: ApiFarm): Farm {
  return {
    id: String(farm.id),
    name: farm.name,
    tenantSlug: farm.tenantSlug,
    sectorArable: farm.sectorArable,
    sectorBeef: farm.sectorBeef,
    sectorDairy: farm.sectorDairy,
    sectorPigs: farm.sectorPigs,
    sectorPoultry: farm.sectorPoultry,
    sectorViticulture: farm.sectorViticulture ?? false,
    cphNumber: nullableText(farm.cphNumber),
    sbiNumber: nullableText(farm.sbiNumber),
    redTractorId: nullableText(farm.redTractorId),
    wineGbMembershipNumber: nullableText(farm.wineGbMembershipNumber),
    aphaRegistrationNumber: nullableText(farm.aphaRegistrationNumber),
    fsaWineRegistrationNumber: nullableText(farm.fsaWineRegistrationNumber),
    vineyardRegisterNumber: nullableText(farm.vineyardRegisterNumber),
    idleBarrelDays: farm.idleBarrelDays ?? null,
    approachingNeutralFills: farm.approachingNeutralFills ?? null,
  };
}