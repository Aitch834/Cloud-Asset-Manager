import { ImapFlow } from "imapflow";
import { simpleParser, type ParsedMail, type AddressObject } from "mailparser";
import { Readable } from "stream";

const IMAP_HOST = "imap.secureserver.net";
const IMAP_PORT = 993;
const IMAP_USER = process.env.TITAN_IMAP_USER ?? "hello@bdefarmtrac.co.uk";
const IMAP_PASS = process.env.TITAN_IMAP_PASSWORD ?? "";

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

function createClient(): ImapFlow {
  return new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: {
      user: IMAP_USER,
      pass: IMAP_PASS,
    },
    logger: false,
    tls: {
      rejectUnauthorized: false,
    },
  });
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

  const client = createClient();
  const results: InboxEmail[] = [];

  try {
    await client.connect();
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

  const client = createClient();

  try {
    await client.connect();
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

export async function markAsRead(uid: number): Promise<void> {
  if (!IMAP_PASS) return;

  const client = createClient();
  try {
    await client.connect();
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

  const client = createClient();
  try {
    await client.connect();
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

  const client = createClient();
  try {
    await client.connect();
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
  const client = createClient();
  try {
    await client.connect();
    const boxes: string[] = [];
    for await (const mb of client.listMailboxes()) {
      if (mb.name) boxes.push(mb.path ?? mb.name);
    }
    await client.logout();
    return boxes;
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}

export async function fetchFolder(folder: string, limit = 50): Promise<InboxEmail[]> {
  if (!IMAP_PASS) {
    throw new Error("IMAP password not configured (TITAN_IMAP_PASSWORD missing)");
  }

  const client = createClient();
  const results: InboxEmail[] = [];

  try {
    await client.connect();
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

  const client = createClient();

  try {
    await client.connect();
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
  const client = createClient();
  try {
    await client.connect();
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
  const client = createClient();
  try {
    await client.connect();
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
  const client = createClient();
  try {
    await client.connect();
    await client.mailboxOpen(folder);
    await client.messageMove(String(uid), "INBOX", { uid: true });
    await client.logout();
  } catch (err) {
    try { client.close(); } catch {}
    throw err;
  }
}
