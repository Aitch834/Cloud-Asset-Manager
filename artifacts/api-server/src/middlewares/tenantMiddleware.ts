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
      isImpersonating?: boolean;
      originalUserId?: string;
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

  const [callerMembership] = await db
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

  const impersonateUserId = req.headers["x-impersonate-user"] as string | undefined;
  if (impersonateUserId && callerMembership?.isSuperAdmin) {
    const [targetMembership] = await db
      .select()
      .from(userTenantsTable)
      .where(
        and(
          eq(userTenantsTable.userId, impersonateUserId),
          eq(userTenantsTable.tenantId, tenant.id),
          eq(userTenantsTable.isActive, true),
        ),
      )
      .limit(1);

    if (targetMembership) {
      req.tenantId = tenant.id;
      req.tenantSlug = tenant.slug;
      req.roleId = targetMembership.roleId;
      req.isSuperAdmin = false;
      req.isImpersonating = true;
      req.originalUserId = req.user.id;
      next();
      return;
    }
  }

  if (!callerMembership) {
    const superAdminAny = await db
      .select()
      .from(userTenantsTable)
      .where(
        and(
          eq(userTenantsTable.userId, req.user.id),
          eq(userTenantsTable.isSuperAdmin, true),
          eq(userTenantsTable.isActive, true),
        ),
      )
      .limit(1);

    if (superAdminAny.length > 0) {
      req.tenantId = tenant.id;
      req.tenantSlug = tenant.slug;
      req.isSuperAdmin = true;
      next();
      return;
    }

    res.status(403).json({ error: "Not authorized for this tenant" });
    return;
  }

  req.tenantId = tenant.id;
  req.tenantSlug = tenant.slug;
  req.roleId = callerMembership.roleId;
  req.isSuperAdmin = callerMembership.isSuperAdmin;

  next();
}
