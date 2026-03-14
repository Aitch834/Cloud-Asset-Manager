import { type Request, type Response, type NextFunction } from "express";
import { db, permissionsTable, rolesTable, modulesTable } from "@workspace/db";
import { eq, and, or, isNull } from "drizzle-orm";

type PermissionLevel = "read" | "write" | "delete" | "approve";

const CLIENT_ADMIN_ROLE_NAMES = ["BDE Super Admin", "Client Admin"];

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
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
