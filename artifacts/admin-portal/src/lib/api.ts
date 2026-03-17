const BASE = "/api";

function headers(secret: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-secret": secret,
  };
}

async function get<T>(path: string, secret: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(secret) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function post<T>(path: string, body: unknown, secret: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: headers(secret),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function patch<T>(path: string, body: unknown, secret: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: headers(secret),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export interface Stats {
  totalTenants: number;
  totalFarms: number;
  activeSubscriptions: number;
  totalUsers: number;
  mrrPence: number;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface Farm {
  id: number;
  tenantId: number;
  name: string;
  address?: string;
  postcode?: string;
  cphNumber?: string;
  redTractorId?: string;
  totalAcreage?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Subscription {
  id: number;
  farmId: number;
  moduleId: number;
  moduleName: string;
  status: string;
  currentPeriodEnd?: string;
}

export interface TenantUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  isActive: boolean;
}

export interface SupportTicket {
  id: number;
  tenantId?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderType: string;
  message: string;
  createdAt: string;
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
}

export interface SqlResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  durationMs: number;
  limited: boolean;
}

export const api = {
  verifySecret: (secret: string) =>
    get<{ stats: Stats }>("/admin/stats", secret),

  getStats: (secret: string) =>
    get<{ stats: Stats }>("/admin/stats", secret),

  getSchema: (secret: string) =>
    get<{ tables: Record<string, SchemaColumn[]> }>("/admin/schema", secret),

  runSql: (query: string, limit: number, secret: string) =>
    post<SqlResult>("/admin/sql", { query, limit }, secret),

  getTenants: (secret: string) =>
    get<{ tenants: Tenant[] }>("/admin/tenants", secret),

  getTenantDetail: (id: number, secret: string) =>
    get<{ tenant: Tenant; farms: Farm[]; subscriptions: Subscription[]; users: TenantUser[] }>(
      `/admin/tenants/${id}`,
      secret
    ),

  getSupportTickets: (secret: string) =>
    get<{ tickets: SupportTicket[] }>("/admin/support-tickets", secret),

  getSupportTicket: (id: number, secret: string) =>
    get<{ ticket: SupportTicket; messages: TicketMessage[] }>(
      `/admin/support-tickets/${id}`,
      secret
    ),

  replyToTicket: (id: number, message: string, secret: string) =>
    post<{ message: TicketMessage }>(`/admin/support-tickets/${id}/reply`, { message }, secret),

  updateTicketStatus: (id: number, status: string, secret: string) =>
    patch<{ ticket: SupportTicket }>(`/admin/support-tickets/${id}/status`, { status }, secret),
};
