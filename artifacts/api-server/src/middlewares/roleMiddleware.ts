import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, permissionsTable, rolesTable, modulesTable } from "@workspace/db";
import { eq, and, or, isNull } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

type PermissionLevel = "read" | "write" | "delete" | "approve";

const CLIENT_ADMIN_ROLE_NAMES = ["BDE Super Admin", "Client Admin"];

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Dev bypass and admin portal middlewares set req.userId directly
  if (req.userId) {
    next();
    return;
  }

  // Clerk JWT verification
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId as string | undefined || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  req.userId = userId;
  next();
}

export function requireTenant(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.tenantId) {
    res.status(400).json({ error: "Tenant context required (set x-tenant-slug header)" });
    return;
  }
  next();
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isSuperAdmin) {
    res.status(403).json({ error: "Super admin access required" });
    return;
  }
  next();
}

export async function requireClientAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.isSuperAdmin) {
    next();
    return;
  }

  if (!req.roleId) {
    res.status(403).json({ error: "Client Admin access required" });
    return;
  }

  const [role] = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.id, req.roleId))
    .limit(1);

  if (!role || !CLIENT_ADMIN_ROLE_NAMES.includes(role.name)) {
    res.status(403).json({ error: "Client Admin access required" });
    return;
  }

  next();
}

export function requireModulePermission(moduleId: number, level: PermissionLevel) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.isSuperAdmin) {
      next();
      return;
    }

    if (!req.roleId) {
      res.status(403).json({ error: "No role assigned" });
      return;
    }

    const farmId = req.body?.farmId ?? req.query?.farmId ?? req.params?.farmId;
    const farmIdNum = farmId ? parseInt(String(farmId), 10) : null;

    const permissions = await db
      .select()
      .from(permissionsTable)
      .where(
        and(
          eq(permissionsTable.roleId, req.roleId),
          eq(permissionsTable.moduleId, moduleId),
          farmIdNum
            ? or(eq(permissionsTable.farmId, farmIdNum), isNull(permissionsTable.farmId))
            : isNull(permissionsTable.farmId),
        ),
      )
      .limit(1);

    const permission = permissions[0];

    if (!permission) {
      res.status(403).json({ error: "No permission for this module" });
      return;
    }

    const hasPermission =
      (level === "read" && permission.canRead) ||
      (level === "write" && permission.canWrite) ||
      (level === "delete" && permission.canDelete) ||
      (level === "approve" && permission.canApprove);

    if (!hasPermission) {
      res.status(403).json({ error: `Insufficient permission: ${level} access required` });
      return;
    }

    next();
  };
}

const moduleIdCache = new Map<string, number>();

async function resolveModuleId(key: string): Promise<number | null> {
  if (moduleIdCache.has(key)) return moduleIdCache.get(key)!;
  const [mod] = await db
    .select({ id: modulesTable.id })
    .from(modulesTable)
    .where(eq(modulesTable.key, key))
    .limit(1);
  if (mod) {
    moduleIdCache.set(key, mod.id);
    return mod.id;
  }
  return null;
}

// MODULE_BUNDLES — implicit module grants bundled into higher-tier subscriptions.
//
// Structure: impliedModuleKey → triggerModuleKeys[]
//   A farm that holds an active subscription for ANY trigger module also gets
//   access to the implied module at no extra charge.
//
// SECURITY: each entry must be explicitly reviewed before go-live.
//   Adding an overly broad trigger module here silently grants write access
//   across module boundaries for every farm on that subscription.
//
// Current bundles (all approved for Viticulture tier — 2026-07-12):
//   Viticulture subscribers need spray, risk, training, equipment, and stock
//   management as integrated parts of the viticulture workflow. These are
//   bundled rather than sold separately to keep the viticultural package simple.
export const MODULE_BUNDLES: Record<string, string[]> = {
  // Spray & Inputs: required for pesticide application records in viticulture.
  "sprays-inputs":        ["viticulture", "organic-viticulture"],
  // Risk & Waste: required for COSHH/waste compliance across the holding.
  "risk-waste":           ["viticulture", "organic-viticulture"],
  // Staff Training: required for operator certificate tracking under winemaker schemes.
  "staff-training":       ["viticulture", "organic-viticulture"],
  // Equipment Management: required for sprayer inspection and calibration records.
  "equipment-management": ["viticulture", "organic-viticulture"],
  // Stock & Suppliers: required for agrochemical and input stock management.
  "stock-suppliers":      ["viticulture", "organic-viticulture"],
};

// Returns all module keys a farm effectively has, including bundled ones.
export function expandModuleKeys(actualKeys: string[]): string[] {
  const expanded = new Set(actualKeys);
  for (const [impliedKey, triggerKeys] of Object.entries(MODULE_BUNDLES)) {
    if (triggerKeys.some(k => expanded.has(k))) {
      expanded.add(impliedKey);
    }
  }
  return [...expanded];
}

async function checkModulePermission(
  roleId: number,
  moduleKey: string,
  level: PermissionLevel,
  farmIdNum: number | null,
): Promise<boolean> {
  const moduleId = await resolveModuleId(moduleKey);
  if (!moduleId) return false;
  const rows = await db
    .select()
    .from(permissionsTable)
    .where(
      and(
        eq(permissionsTable.roleId, roleId),
        eq(permissionsTable.moduleId, moduleId),
        farmIdNum
          ? or(eq(permissionsTable.farmId, farmIdNum), isNull(permissionsTable.farmId))
          : isNull(permissionsTable.farmId),
      ),
    )
    .limit(1);
  const p = rows[0];
  if (!p) return false;
  return (
    (level === "read" && p.canRead) ||
    (level === "write" && p.canWrite) ||
    (level === "delete" && p.canDelete) ||
    (level === "approve" && p.canApprove)
  );
}

export function requireModuleByKey(moduleKey: string, level: PermissionLevel) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.isSuperAdmin) {
      next();
      return;
    }

    if (!req.roleId) {
      res.status(403).json({ error: "No role assigned" });
      return;
    }

    const moduleId = await resolveModuleId(moduleKey);
    if (!moduleId) {
      res.status(500).json({ error: "Module not configured" });
      return;
    }

    const farmId = req.params?.farmId;
    const farmIdNum = farmId ? parseInt(String(farmId), 10) : null;

    // Direct permission check
    if (await checkModulePermission(req.roleId, moduleKey, level, farmIdNum)) {
      next();
      return;
    }

    // Bundle fallback — check if any trigger module grants implicit access
    const triggerKeys = MODULE_BUNDLES[moduleKey];
    if (triggerKeys) {
      for (const triggerKey of triggerKeys) {
        if (await checkModulePermission(req.roleId, triggerKey, level, farmIdNum)) {
          next();
          return;
        }
      }
    }

    res.status(403).json({ error: "No permission for this module" });
  };
}
