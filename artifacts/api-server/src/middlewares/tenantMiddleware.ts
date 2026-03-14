import { type Request, type Response, type NextFunction } from "express";
import { db, userTenantsTable, tenantsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      tenantId?: number;
      tenantSlug?: string;
      userRole?: string;
      roleId?: number;
      isSuperAdmin?: boolean;
    }
  }
}

export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    next();
    return;
  }

  const tenantSlug = req.headers["x-tenant-slug"] as string | undefined;

  if (!tenantSlug) {
    next();
    return;
  }

  const [tenant] = await db
    .select()
    .from(tenantsTable)
    .where(and(eq(tenantsTable.slug, tenantSlug), eq(tenantsTable.isActive, true)))
    .limit(1);

  if (!tenant) {
    res.status(404).json({ error: "Tenant not found" });
    return;
  }

  const [userTenant] = await db
    .select()
    .from(userTenantsTable)
    .where(
      and(
        eq(userTenantsTable.userId, req.user.id),
        eq(userTenantsTable.tenantId, tenant.id),
        eq(userTenantsTable.isActive, true),
      ),
    )
    .limit(1);

  if (!userTenant) {
    res.status(403).json({ error: "Not authorized for this tenant" });
    return;
  }

  req.tenantId = tenant.id;
  req.tenantSlug = tenant.slug;
  req.roleId = userTenant.roleId;
  req.isSuperAdmin = userTenant.isSuperAdmin;

  next();
}
