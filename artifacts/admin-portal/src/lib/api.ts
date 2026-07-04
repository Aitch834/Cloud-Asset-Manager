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

async function postFormData<T>(path: string, formData: FormData, secret: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "x-admin-secret": secret },
    body: formData,
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

export interface LeadSourceEntry {
  source: string;
  count: number;
}

export interface ModuleAdoptionEntry {
  moduleKey: string;
  moduleName: string;
  activeCount: number;
}

export interface Stats {
  totalTenants: number;
  totalFarms: number;
  activeSubscriptions: number;
  totalUsers: number;
  mrrPence: number;
  churnedTenants: number;
  churnRatePct: number;
  leadSourceBreakdown: LeadSourceEntry[];
  moduleAdoption: ModuleAdoptionEntry[];
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
  referralCode?: string | null;
  referredBy?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
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
  roleName: string | null;
  isActive: boolean;
  receiveAlerts: boolean;
}

export interface SupportTicket {
  id: number;
  ticketRef?: string;
  tenantId?: number;
  name: string;
  email: string;
  subject: string;
  description: string;
  status: string;
  source?: string;
  farmId?: number;
  tenantSlug?: string;
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

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPricePence: number;
  netPence: number;
}

export interface Invoice {
  id: number;
  tenantId: number;
  invoiceNumber: string;
  status: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  invoiceDate: string;
  dueDate: string;
  billingName: string;
  billingAddress?: string | null;
  billingEmail: string;
  lineItems: InvoiceLineItem[];
  netAmountPence: number;
  vatRatePct: number;
  vatAmountPence: number;
  grossAmountPence: number;
  notes?: string | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  sentAt?: string | null;
  sentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
  tenantName?: string;
  tenantSlug?: string;
}

export interface Lead {
  id: number;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  farmCount: number;
  modulesInterested: string[];
  message?: string | null;
  source?: string | null;
  status: string;
  notes?: string | null;
  lastContactedAt?: string | null;
  createdAt: string;
}

export interface ReferralTenant {
  id: number;
  name: string;
  slug: string;
  referralCode: string | null;
  referredBy: string | null;
  isActive: boolean;
  cancelledAt: string | null;
  createdAt: string;
  referralCount: number;
}

export interface LookupMasterItem {
  id: number;
  value: string;
  label: string;
  groupLabel: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface LookupReviewEntry {
  id: number;
  reviewedBy: string;
  notes: string | null;
  nextReviewDue: string | null;
  reviewedAt: string;
}

export interface LookupGroup {
  key: string;
  label: string;
  description: string;
  authority: string;
  authorityUrl: string | null;
  reviewFrequency: string;
  masterItems: LookupMasterItem[];
  customCount: number;
  lastReview: LookupReviewEntry | null;
}

export interface PlatformConfigItem {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
  currentValue: string | null;
  updatedAt: string | null;
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

  updateUserReceiveAlerts: (tenantId: number, userId: string, receiveAlerts: boolean, secret: string) =>
    patch<{ success: boolean }>(`/admin/tenants/${tenantId}/users/${userId}/alerts`, { receiveAlerts }, secret),

  getSystemRoles: (secret: string) =>
    get<{ roles: Array<{ id: number; name: string; description: string | null }> }>("/admin/system-roles", secret),

  updateUserRole: (tenantId: number, userId: string, roleId: number | null, secret: string) =>
    patch<{ success: boolean }>(`/admin/tenants/${tenantId}/users/${userId}/role`, { roleId }, secret),

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

  getFolderCounts: (secret: string) =>
    get<{ counts: { inbox: number; spam: number; trash: number } }>("/admin/folder-counts", secret),

  getEmail: (uid: number, secret: string) =>
    get<{ email: FullEmail }>(`/admin/inbox/${uid}`, secret),

  markEmailRead: (uid: number, read: boolean, secret: string) =>
    patch<{ ok: boolean }>(`/admin/inbox/${uid}/read`, { read }, secret),

  deleteInboxEmail: (uid: number, secret: string) =>
    del<{ deleted: boolean }>(`/admin/inbox/${uid}`, secret),

  replyToEmail: (uid: number, body: string, secret: string, attachments?: File[]) => {
    const fd = new FormData();
    fd.append("body", body);
    (attachments ?? []).forEach((f) => fd.append("attachments", f));
    return postFormData<{ sent: boolean; reason?: string }>(`/admin/inbox/${uid}/reply`, fd, secret);
  },

  forwardEmail: (uid: number, to: string, body: string, secret: string) =>
    post<{ sent: boolean; reason?: string }>(`/admin/inbox/${uid}/forward`, { to, body }, secret),

  listMailboxes: (secret: string) =>
    get<{ mailboxes: string[] }>("/admin/mailboxes", secret),

  getFolderEmails: (folder: string, secret: string, limit = 50) =>
    get<{ emails: InboxEmail[] }>(`/admin/folder/${encodeURIComponent(folder)}?limit=${limit}`, secret),

  getFolderEmail: (folder: string, uid: number, secret: string) =>
    get<{ email: FullEmail }>(`/admin/folder/${encodeURIComponent(folder)}/${uid}`, secret),

  deleteFolderEmail: (folder: string, uid: number, secret: string) =>
    del<{ deleted: boolean }>(`/admin/folder/${encodeURIComponent(folder)}/${uid}`, secret),

  restoreFolderEmail: (folder: string, uid: number, secret: string) =>
    post<{ restored: boolean }>(`/admin/folder/${encodeURIComponent(folder)}/${uid}/restore`, {}, secret),

  getSentEmails: (secret: string) =>
    get<{ emails: AdminEmailSent[] }>("/admin/emails/sent", secret),

  sendEmail: (data: { to: string; toName?: string; subject: string; body: string; templateId?: number }, secret: string, attachments?: File[]) => {
    const fd = new FormData();
    fd.append("to", data.to);
    if (data.toName) fd.append("toName", data.toName);
    fd.append("subject", data.subject);
    fd.append("body", data.body);
    if (data.templateId != null) fd.append("templateId", String(data.templateId));
    (attachments ?? []).forEach((f) => fd.append("attachments", f));
    return postFormData<{ sent: boolean; email?: AdminEmailSent; reason?: string }>("/admin/emails/send", fd, secret);
  },

  getSmtpConfig: (secret: string) =>
    get<{ smtpHost: string; smtpPort: string; smtpUser: string; smtpPassSet: boolean; smtpFrom: string }>("/admin/emails/config", secret),

  sendTestEmail: (to: string, secret: string) =>
    post<{ sent: boolean; reason?: string }>("/admin/emails/test", { to }, secret),

  getEmailTemplates: (secret: string) =>
    get<{ templates: EmailTemplate[] }>("/admin/email-templates", secret),

  createEmailTemplate: (data: { name: string; category: string; subject: string; body: string }, secret: string) =>
    post<{ template: EmailTemplate }>("/admin/email-templates", data, secret),

  updateEmailTemplate: (id: number, data: Partial<{ name: string; category: string; subject: string; body: string; isActive: boolean }>, secret: string) =>
    put<{ template: EmailTemplate }>(`/admin/email-templates/${id}`, data, secret),

  deleteEmailTemplate: (id: number, secret: string) =>
    del<{ deleted: boolean }>(`/admin/email-templates/${id}`, secret),

  getLeads: (secret: string) =>
    get<{ leads: Lead[] }>("/admin/leads", secret),

  updateLead: (id: number, data: { status?: string; notes?: string; source?: string }, secret: string) =>
    patch<{ lead: Lead }>(`/admin/leads/${id}`, data, secret),

  updateTenant: (id: number, data: { isActive?: boolean; cancelReason?: string; cancelledAt?: string | null; referredBy?: string | null }, secret: string) =>
    patch<{ tenant: Tenant }>(`/admin/tenants/${id}`, data, secret),

  generateReferralCode: (tenantId: number, secret: string) =>
    post<{ referralCode: string }>(`/admin/tenants/${tenantId}/referral-code`, {}, secret),

  getReferrals: (secret: string) =>
    get<{ tenants: ReferralTenant[] }>("/admin/referrals", secret),

  listInvoices: (status: string | undefined, tenantId: number | undefined, secret: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (tenantId) params.set("tenantId", String(tenantId));
    const qs = params.toString();
    return get<{ invoices: Invoice[] }>(`/admin/invoices${qs ? "?" + qs : ""}`, secret);
  },

  getInvoice: (id: number, secret: string) =>
    get<{ invoice: Invoice }>(`/admin/invoices/${id}`, secret),

  generateInvoice: (tenantId: number, body: { billingPeriodStart: string; billingPeriodEnd: string; vatRatePct: number; notes: string }, secret: string) =>
    post<{ invoice: Invoice }>(`/admin/invoices/generate/${tenantId}`, body, secret),

  createAdHocInvoice: (
    body: {
      tenantId: number;
      billingPeriodStart: string;
      billingPeriodEnd: string;
      lineItems: Array<{ description: string; quantity: number; unitPricePence: number; netPence: number }>;
      vatRatePct: number;
      notes?: string;
      billingName: string;
      billingEmail: string;
      billingAddress?: string;
    },
    secret: string
  ) =>
    post<{ invoice: Invoice }>("/admin/invoices", body, secret),

  updateInvoice: (id: number, updates: Record<string, unknown>, secret: string) =>
    patch<{ invoice: Invoice }>(`/admin/invoices/${id}`, updates, secret),

  deleteInvoice: (id: number, secret: string) =>
    del<{ success: boolean }>(`/admin/invoices/${id}`, secret),

  emailInvoice: (id: number, secret: string) =>
    post<{ sent: boolean; invoice?: Invoice; reason?: string }>(`/admin/invoices/${id}/email`, {}, secret),

  bulkGenerateInvoices: (
    body: { billingPeriodStart: string; billingPeriodEnd: string; vatRatePct: number; notes?: string },
    secret: string
  ) =>
    post<{
      generated: Array<{ tenantId: number; tenantName: string; invoiceNumber: string }>;
      skipped: Array<{ tenantId: number; tenantName: string; reason: string }>;
      errors: Array<{ tenantId: number; tenantName: string; error: string }>;
    }>("/admin/invoices/bulk-generate", body, secret),

  bulkEmailInvoices: (body: { invoiceIds: number[] }, secret: string) =>
    post<{
      results: Array<{ invoiceId: number; invoiceNumber: string; billingName: string; sent: boolean; reason?: string }>;
    }>("/admin/invoices/bulk-email", body, secret),

  getPlatformConfig: (secret: string) =>
    get<{ items: PlatformConfigItem[] }>("/admin/platform-config", secret),

  setPlatformConfig: (key: string, value: string, secret: string) =>
    put<{ success: boolean; key: string; value: string }>(`/admin/platform-config/${key}`, { value }, secret),

  resetPlatformConfig: (key: string, secret: string) =>
    del<{ success: boolean }>(`/admin/platform-config/${key}`, secret),

  getLookups: (secret: string) =>
    get<{ groups: LookupGroup[] }>("/admin/lookups", secret),

  addLookupItem: (key: string, label: string, groupLabel: string | undefined, secret: string) =>
    post<{ item: LookupMasterItem }>(`/admin/lookups/${key}`, { label, groupLabel }, secret),

  updateLookupItem: (key: string, id: number, updates: { label?: string; isActive?: boolean; displayOrder?: number; groupLabel?: string }, secret: string) =>
    put<{ item: LookupMasterItem }>(`/admin/lookups/${key}/${id}`, updates, secret),

  deleteLookupItem: (key: string, id: number, secret: string) =>
    del<{ success: boolean }>(`/admin/lookups/${key}/${id}`, secret),

  reorderLookupItems: (key: string, orderedIds: number[], secret: string) =>
    post<{ success: boolean }>(`/admin/lookups/${key}/reorder`, { orderedIds }, secret),

  getLookupReviews: (key: string, secret: string) =>
    get<{ reviews: LookupReviewEntry[] }>(`/admin/lookups/${key}/review`, secret),

  logLookupReview: (key: string, data: { reviewedBy: string; notes?: string; nextReviewDue?: string }, secret: string) =>
    post<{ log: LookupReviewEntry }>(`/admin/lookups/${key}/review`, data, secret),

  startTrial: (tenantId: number, farmId: number, trialDays: number, secret: string) =>
    post<{ success: boolean; modulesProvisioned: number; trialEndsAt: string }>(
      `/admin/tenants/${tenantId}/farms/${farmId}/start-trial`,
      { trialDays },
      secret,
    ),

  getHelpArticles: (secret: string) =>
    get<{ articles: HelpArticle[] }>("/admin/help-articles", secret),

  createHelpArticle: (data: Omit<HelpArticle, "id" | "createdAt" | "updatedAt">, secret: string) =>
    post<{ article: HelpArticle }>("/admin/help-articles", data, secret),

  updateHelpArticle: (id: number, data: Partial<Omit<HelpArticle, "id" | "createdAt" | "updatedAt">>, secret: string) =>
    put<{ article: HelpArticle }>(`/admin/help-articles/${id}`, data, secret),

  deleteHelpArticle: (id: number, secret: string) =>
    del<{ success: boolean }>(`/admin/help-articles/${id}`, secret),

  seedDefaultHelpArticles: (secret: string) =>
    post<{ success: boolean; inserted: number; skipped: number }>("/admin/help-articles/seed-defaults", {}, secret),
};

export interface HelpArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
