import { type Request, type Response, type NextFunction } from "express";
import { db, permissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

type PermissionLevel = "read" | "write" | "delete" | "approve";

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

    const [permission] = await db
      .select()
      .from(permissionsTable)
      .where(
        and(
          eq(permissionsTable.roleId, req.roleId),
          eq(permissionsTable.moduleId, moduleId),
        ),
      )
      .limit(1);

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
