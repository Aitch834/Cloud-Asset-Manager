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

async function getBlob(path: string, secret: string): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${BASE}${path}`, { headers: { "x-admin-secret": secret } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const cd = res.headers.get("content-disposition") ?? "";
  const match = cd.match(/filename="([^"]+)"/);
  const filename = match ? match[1] : "download.pdf";
  const blob = await res.blob();
  return { blob, filename };
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

async function put<T>(path: string, body: unknown, secret: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: headers(secret),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function del<T>(path: string, secret: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: headers(secret),
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
  description: string;
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

export interface InboxEmail {
  uid: number;
  seq: number;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  date: string;
  preview: string;
  seen: boolean;
  hasAttachments: boolean;
}

export interface FullEmail extends InboxEmail {
  body: string;
  bodyHtml: string | null;
  replyTo: string | null;
  messageId: string | null;
  inReplyTo: string | null;
  references: string | null;
}

export interface EmailTemplate {
  id: number;
  name: string;
  category: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEmailSent {
  id: number;
  toAddress: string;
  toName?: string;
  subject: string;
  body: string;
  templateId?: number;
  ticketId?: number;
  status: string;
  errorMessage?: string;
  sentAt: string;
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

  createTicket: (data: { name: string; email: string; subject: string; description: string; source?: string }, _secret: string) =>
    post<SupportTicket>("/support/tickets", data, _secret),

  downloadSetupGuide: (tenantId: number, farmId: number, secret: string) =>
    getBlob(`/admin/tenants/${tenantId}/farms/${farmId}/setup-guide.pdf`, secret),

  sendSetupGuide: (tenantId: number, farmId: number, secret: string) =>
    post<{ sent: boolean; to?: string; reason?: string }>(
      `/admin/tenants/${tenantId}/farms/${farmId}/send-setup-guide`,
      {},
      secret
    ),

  getInbox: (secret: string, limit = 50) =>
    get<{ emails: InboxEmail[] }>(`/admin/inbox?limit=${limit}`, secret),

  getEmail: (uid: number, secret: string) =>
    get<{ email: FullEmail }>(`/admin/inbox/${uid}`, secret),

  markEmailRead: (uid: number, read: boolean, secret: string) =>
    patch<{ ok: boolean }>(`/admin/inbox/${uid}/read`, { read }, secret),

  deleteInboxEmail: (uid: number, secret: string) =>
    del<{ deleted: boolean }>(`/admin/inbox/${uid}`, secret),

  replyToEmail: (uid: number, body: string, secret: string) =>
    post<{ sent: boolean; reason?: string }>(`/admin/inbox/${uid}/reply`, { body }, secret),

  getSentEmails: (secret: string) =>
    get<{ emails: AdminEmailSent[] }>("/admin/emails/sent", secret),

  sendEmail: (data: { to: string; toName?: string; subject: string; body: string; templateId?: number }, secret: string) =>
    post<{ sent: boolean; email?: AdminEmailSent; reason?: string }>("/admin/emails/send", data, secret),

  getEmailTemplates: (secret: string) =>
    get<{ templates: EmailTemplate[] }>("/admin/email-templates", secret),

  createEmailTemplate: (data: { name: string; category: string; subject: string; body: string }, secret: string) =>
    post<{ template: EmailTemplate }>("/admin/email-templates", data, secret),

  updateEmailTemplate: (id: number, data: Partial<{ name: string; category: string; subject: string; body: string; isActive: boolean }>, secret: string) =>
    put<{ template: EmailTemplate }>(`/admin/email-templates/${id}`, data, secret),

  deleteEmailTemplate: (id: number, secret: string) =>
    del<{ deleted: boolean }>(`/admin/email-templates/${id}`, secret),
};
