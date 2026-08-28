import { ImapFlow } from "imapflow";
import { simpleParser, type ParsedMail, type AddressObject } from "mailparser";
import { Readable } from "stream";
import { resolve4 } from "node:dns/promises";

const DEFAULT_IMAP_HOST = "imap.123-reg.co.uk";
const DEFAULT_IMAP_PORT = 993;
const DEFAULT_IMAP_USER = "hello@bdefarmtrac.co.uk";
const DEFAULT_IMAP_CONNECTION_TIMEOUT_MS = 15_000;
const IMAP_PASS = process.env.TITAN_IMAP_PASSWORD ?? "";

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getImapConnectionConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    host: env.TITAN_IMAP_HOST?.trim() || DEFAULT_IMAP_HOST,
    port: positiveInteger(env.TITAN_IMAP_PORT, DEFAULT_IMAP_PORT),
    user: env.TITAN_IMAP_USER?.trim() || DEFAULT_IMAP_USER,
    connectionTimeout: positiveInteger(
      env.TITAN_IMAP_CONNECTION_TIMEOUT_MS,
      DEFAULT_IMAP_CONNECTION_TIMEOUT_MS,
    ),
  };
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

export interface EmailAttachmentMeta {
  index: number;
  filename: string;
  contentType: string;
  size: number;
}

export interface FullEmail extends InboxEmail {
  body: string;
  bodyHtml: string | null;
  replyTo: string | null;
  messageId: string | null;
  inReplyTo: string | null;
  references: string | null;
  attachments: EmailAttachmentMeta[];
}

function attachmentMetas(parsed: ParsedMail): EmailAttachmentMeta[] {
  return (parsed.attachments ?? []).map((a, i) => ({
    index: i,
    filename: a.filename || `attachment-${i + 1}`,
    contentType: a.contentType || "application/octet-stream",
    size: a.size ?? a.content?.length ?? 0,
  }));
}

function buildClient(
  config: ReturnType<typeof getImapConnectionConfig>,
  host: string,
  connectionTimeout: number,
): ImapFlow {
  const client = new ImapFlow({
    host,
    port: config.port,
    secure: true,
    auth: {
      user: config.user,
      pass: IMAP_PASS,
    },
    connectionTimeout,
    logger: false,
    tls: {
      rejectUnauthorized: true,
      servername: config.host,
    },
  });
  // Prevent unhandled 'error' events from crashing the process when the
  // underlying TLS socket drops mid-write (EPIPE). Errors are still caught
  // by the try/catch in each exported function.
  client.on("error", () => {});
  return client;
}

function isRetryableConnectionError(error: unknown): boolean {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  return [
    "CONNECT_TIMEOUT",
    "ECONNREFUSED",
    "ECONNRESET",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "ETIMEDOUT",
  ].includes(code);
}

async function createClient(): Promise<ImapFlow> {
  const config = getImapConnectionConfig();
  let resolvedHosts: string[] = [];

  try {
    resolvedHosts = await resolve4(config.host);
  } catch (error) {
    console.warn(`[IMAP] Could not resolve ${config.host}; trying the hostname directly`, error);
  }

  const hosts = [...new Set([...resolvedHosts, config.host])];
  const attemptTimeout = hosts.length > 1
    ? Math.min(config.connectionTimeout, 5_000)
    : config.connectionTimeout;
  let lastError: unknown;

  for (const [index, host] of hosts.entries()) {
    const client = buildClient(config, host, attemptTimeout);
    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      try { client.close(); } catch {}

      if (!isRetryableConnectionError(error) || index === hosts.length - 1) {
        throw error;
      }
      console.warn(`[IMAP] Connection to ${host} failed; trying another resolved endpoint`);
    }
  }

  throw lastError ?? new Error("No IMAP endpoints were available");
}

function addressString(addr: AddressObject | AddressObject[] | undefined): string {
  if (!addr) return "";
  const a = Array.isArray(addr) ? addr[0] : addr;
  if (!a || !a.value || a.value.length === 0) return "";
  const first = a.value[0];
  return first.name ? `${first.name} <${first.address}>` : (first.address ?? "");
}

function addressEmail(addr: AddressObject | AddressObject[] | undefined): string {
  if (!addr) return "";
  const a = Array.isArray(addr) ? addr[0] : addr;
  if (!a || !a.value || a.value.length === 0) return "";
  return a.value[0].address ?? "";
}

function refsToString(refs: string | string[] | undefined): string | null {
  if (!refs) return null;
  return Array.isArray(refs) ? refs.join(" ") : refs;
}

export async function fetchInbox(limit = 50): Promise<InboxEmail[]> {
  if (!IMAP_PASS) {
    throw new Error("IMAP password not configured (TITAN_IMAP_PASSWORD missing)");
  }

  const client = await createClient();
  const results: InboxEmail[] = [];

  try {
    await client.mailboxOpen("INBOX");

    const status = await client.status("INBOX", { messages: true });
    const total = status.messages ?? 0;
    if (total === 0) return [];

    const seqFrom = Math.max(1, total - limit + 1);
    const seqRange = `${seqFrom}:${total}`;

    for await (const msg of client.fetch(seqRange, {
      envelope: true,
      flags: true,
      bodyStructure: true,
      bodyParts: ["TEXT"],
      source: { partial: "0.512" } as any,
    })) {
      const env = msg.envelope;
      if (!env) continue;
      const seen = msg.flags?.has("\\Seen") ?? false;

      const fromAddr = env.from?.[0];
      const fromName = fromAddr?.name ?? fromAddr?.address ?? "Unknown";
      const fromEmail = fromAddr?.address ?? "";
      const toAddr = env.to?.[0];
      const toStr = toAddr ? (toAddr.name ? `${toAddr.name} <${toAddr.address}>` : (toAddr.address ?? "")) : "";

      let preview = "";
      try {
        if (msg.source) {
          const raw = msg.source.toString("utf8").slice(0, 500);
          preview = raw.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
        }
      } catch {}

      const hasAttachments = Boolean(
        msg.bodyStructure &&
          (msg.bodyStructure as any).childNodes?.some(
            (n: any) => n.disposition?.toLowerCase() === "attachment"
          )
      );

      results.push({
        uid: msg.uid,
        seq: msg.seq,
        subject: env.subject ?? "(no subject)",
        from: fromName,
        fromEmail,
        to: toStr,
        date: (env.date ?? new Date()).toISOString(),
        preview,
        seen,
        hasAttachments,
      });
    }

    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }

  return results.reverse();
}

export async function fetchEmail(uid: number): Promise<FullEmail> {
  if (!IMAP_PASS) {
    throw new Error("IMAP password not configured (TITAN_IMAP_PASSWORD missing)");
  }

  const client = await createClient();

  try {
    await client.mailboxOpen("INBOX");

    let fullEmail: FullEmail | null = null;

    for await (const msg of client.fetch(String(uid), {
      uid: true,
      envelope: true,
      flags: true,
      source: true,
    }, { uid: true })) {
      if (!msg.source) continue;

      const readable = Readable.from(msg.source);
      const parsed: ParsedMail = await simpleParser(readable);

      const seen = msg.flags?.has("\\Seen") ?? false;
      const env = msg.envelope;
      if (!env) continue;
      const fromAddr = env.from?.[0];
      const fromName = fromAddr?.name ?? fromAddr?.address ?? "Unknown";
      const fromEmail = fromAddr?.address ?? "";
      const toAddr = env.to?.[0];
      const toStr = toAddr ? (toAddr.name ? `${toAddr.name} <${toAddr.address}>` : (toAddr.address ?? "")) : "";

      const bodyText = typeof parsed.text === "string" ? parsed.text : "";
      const bodyHtml = typeof parsed.html === "string" ? parsed.html : null;
      const preview = bodyText.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);

      fullEmail = {
        uid: msg.uid,
        seq: msg.seq,
        subject: env.subject ?? parsed.subject ?? "(no subject)",
        from: fromName,
        fromEmail,
        to: toStr,
        date: (env.date ?? parsed.date ?? new Date()).toISOString(),
        preview,
        seen,
        hasAttachments: (parsed.attachments?.length ?? 0) > 0,
        body: bodyText,
        bodyHtml,
        replyTo: addressString(parsed.replyTo) || addressEmail(parsed.from) || fromEmail,
        messageId: parsed.messageId ?? null,
        inReplyTo: parsed.inReplyTo ?? null,
        references: refsToString(parsed.references),
        attachments: attachmentMetas(parsed),
      };
    }

    await client.logout();

    if (!fullEmail) throw new Error("Message not found");
    return fullEmail;
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export interface EmailAttachmentFile extends EmailAttachmentMeta {
  content: Buffer;
}

export async function fetchAttachment(folder: string, uid: number, index: number): Promise<EmailAttachmentFile> {
  if (!IMAP_PASS) {
    throw new Error("IMAP password not configured (TITAN_IMAP_PASSWORD missing)");
  }

  const client = await createClient();

  try {
    await client.mailboxOpen(folder);

    let file: EmailAttachmentFile | null = null;

    for await (const msg of client.fetch(String(uid), {
      uid: true,
      source: true,
    }, { uid: true })) {
      if (!msg.source) continue;

      const readable = Readable.from(msg.source);
      const parsed: ParsedMail = await simpleParser(readable);
      const att = (parsed.attachments ?? [])[index];
      if (!att) continue;

      file = {
        index,
        filename: att.filename || `attachment-${index + 1}`,
        contentType: att.contentType || "application/octet-stream",
        size: att.size ?? att.content?.length ?? 0,
        content: att.content as Buffer,
      };
    }

    await client.logout();

    if (!file) throw new Error("Attachment not found");
    return file;
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function markAsRead(uid: number): Promise<void> {
  if (!IMAP_PASS) return;

  const client = await createClient();
  try {
    await client.mailboxOpen("INBOX");
    await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function markAsUnread(uid: number): Promise<void> {
  if (!IMAP_PASS) return;

  const client = await createClient();
  try {
    await client.mailboxOpen("INBOX");
    await client.messageFlagsRemove(String(uid), ["\\Seen"], { uid: true });
    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function deleteEmail(uid: number): Promise<void> {
  if (!IMAP_PASS) return;

  const client = await createClient();
  try {
    await client.mailboxOpen("INBOX");

    const trashBoxes = ["Trash", "Deleted Messages", "INBOX.Trash", "[Gmail]/Trash"];
    let moved = false;
    for (const box of trashBoxes) {
      try {
        await client.messageMove(String(uid), box, { uid: true });
        moved = true;
        break;
      } catch {}
    }

    if (!moved) {
      await client.messageFlagsAdd(String(uid), ["\\Deleted"], { uid: true });
      await client.messageDelete(String(uid), { uid: true });
    }

    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function isImapConfigured(): Promise<boolean> {
  return Boolean(IMAP_PASS);
}

export async function listMailboxes(): Promise<string[]> {
  if (!IMAP_PASS) return [];
  const client = await createClient();
  try {
    const boxes: string[] = [];
    const tree = await client.list();
    for (const mb of tree) {
      if (mb.path) boxes.push(mb.path);
    }
    await client.logout();
    return boxes;
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

/**
 * Get unseen (unread) message counts for a set of mailboxes using a single
 * connection and the lightweight IMAP STATUS command (no message fetching).
 */
export async function getUnreadCounts(folders: string[]): Promise<Record<string, number>> {
  if (!IMAP_PASS) {
    throw new Error("IMAP password not configured (TITAN_IMAP_PASSWORD missing)");
  }

  const client = await createClient();
  const counts: Record<string, number> = {};

  try {
    for (const folder of folders) {
      try {
        const status = await client.status(folder, { unseen: true });
        counts[folder] = status.unseen ?? 0;
      } catch (err) {
        console.error(`[IMAP] status(${folder}) error:`, err);
        counts[folder] = 0;
      }
    }
    await client.logout();
    return counts;
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function fetchFolder(folder: string, limit = 50): Promise<InboxEmail[]> {
  if (!IMAP_PASS) {
    throw new Error("IMAP password not configured (TITAN_IMAP_PASSWORD missing)");
  }

  const client = await createClient();
  const results: InboxEmail[] = [];

  try {
    await client.mailboxOpen(folder);

    const status = await client.status(folder, { messages: true });
    const total = status.messages ?? 0;
    if (total === 0) { await client.logout(); return []; }

    const seqFrom = Math.max(1, total - limit + 1);
    const seqRange = `${seqFrom}:${total}`;

    for await (const msg of client.fetch(seqRange, {
      envelope: true,
      flags: true,
      bodyStructure: true,
      bodyParts: ["TEXT"],
      source: { partial: "0.512" } as any,
    })) {
      const env = msg.envelope;
      if (!env) continue;
      const seen = msg.flags?.has("\\Seen") ?? false;

      const fromAddr = env.from?.[0];
      const fromName = fromAddr?.name ?? fromAddr?.address ?? "Unknown";
      const fromEmail = fromAddr?.address ?? "";
      const toAddr = env.to?.[0];
      const toStr = toAddr ? (toAddr.name ? `${toAddr.name} <${toAddr.address}>` : (toAddr.address ?? "")) : "";

      let preview = "";
      try {
        if (msg.source) {
          const raw = msg.source.toString("utf8").slice(0, 500);
          preview = raw.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
        }
      } catch {}

      const hasAttachments = Boolean(
        msg.bodyStructure &&
          (msg.bodyStructure as any).childNodes?.some(
            (n: any) => n.disposition?.toLowerCase() === "attachment"
          )
      );

      results.push({
        uid: msg.uid,
        seq: msg.seq,
        subject: env.subject ?? "(no subject)",
        from: fromName,
        fromEmail,
        to: toStr,
        date: (env.date ?? new Date()).toISOString(),
        preview,
        seen,
        hasAttachments,
      });
    }

    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }

  return results.reverse();
}

export async function fetchEmailFromFolder(folder: string, uid: number): Promise<FullEmail> {
  if (!IMAP_PASS) {
    throw new Error("IMAP password not configured (TITAN_IMAP_PASSWORD missing)");
  }

  const client = await createClient();

  try {
    await client.mailboxOpen(folder);

    let fullEmail: FullEmail | null = null;

    for await (const msg of client.fetch(String(uid), {
      uid: true,
      envelope: true,
      flags: true,
      source: true,
    }, { uid: true })) {
      if (!msg.source) continue;

      const readable = Readable.from(msg.source);
      const parsed: ParsedMail = await simpleParser(readable);

      const seen = msg.flags?.has("\\Seen") ?? false;
      const env = msg.envelope;
      if (!env) continue;
      const fromAddr = env.from?.[0];
      const fromName = fromAddr?.name ?? fromAddr?.address ?? "Unknown";
      const fromEmail = fromAddr?.address ?? "";
      const toAddr = env.to?.[0];
      const toStr = toAddr ? (toAddr.name ? `${toAddr.name} <${toAddr.address}>` : (toAddr.address ?? "")) : "";

      const bodyText = typeof parsed.text === "string" ? parsed.text : "";
      const bodyHtml = typeof parsed.html === "string" ? parsed.html : null;
      const preview = bodyText.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);

      fullEmail = {
        uid: msg.uid,
        seq: msg.seq,
        subject: env.subject ?? parsed.subject ?? "(no subject)",
        from: fromName,
        fromEmail,
        to: toStr,
        date: (env.date ?? parsed.date ?? new Date()).toISOString(),
        preview,
        seen,
        hasAttachments: (parsed.attachments?.length ?? 0) > 0,
        body: bodyText,
        bodyHtml,
        replyTo: addressString(parsed.replyTo) || addressEmail(parsed.from) || fromEmail,
        messageId: parsed.messageId ?? null,
        inReplyTo: parsed.inReplyTo ?? null,
        references: refsToString(parsed.references),
        attachments: attachmentMetas(parsed),
      };
    }

    await client.logout();

    if (!fullEmail) throw new Error("Message not found");
    return fullEmail;
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function markFolderEmailRead(folder: string, uid: number): Promise<void> {
  if (!IMAP_PASS) return;
  const client = await createClient();
  try {
    await client.mailboxOpen(folder);
    await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function permanentlyDeleteFromFolder(folder: string, uid: number): Promise<void> {
  if (!IMAP_PASS) return;
  const client = await createClient();
  try {
    await client.mailboxOpen(folder);
    await client.messageFlagsAdd(String(uid), ["\\Deleted"], { uid: true });
    await client.messageDelete(String(uid), { uid: true });
    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function moveToInbox(folder: string, uid: number): Promise<void> {
  if (!IMAP_PASS) return;
  const client = await createClient();
  try {
    await client.mailboxOpen(folder);
    await client.messageMove(String(uid), "INBOX", { uid: true });
    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}
