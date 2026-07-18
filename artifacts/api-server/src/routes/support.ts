import { Router, type IRouter } from "express";
import multer from "multer";
import { db, supportTicketsTable } from "@workspace/db";
import { SupportChatBody, CreateSupportTicketBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq } from "drizzle-orm";
import { sendTicketConfirmationEmail, sendNewTicketInternalAlert } from "../lib/mailer";

const router: IRouter = Router();

// Per-recipient rate limit for outbound confirmation emails on the public ticket
// endpoint. Prevents inbox flooding via repeated submissions using the same email.
const EMAIL_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_RATE_MAX = 3;
const recipientEmailTimestamps = new Map<string, number[]>();

function isEmailRateLimited(email: string): boolean {
  const now = Date.now();
  const recent = (recipientEmailTimestamps.get(email) ?? []).filter(
    (t) => now - t < EMAIL_RATE_WINDOW_MS,
  );
  if (recent.length >= EMAIL_RATE_MAX) return true;
  recent.push(now);
  recipientEmailTimestamps.set(email, recent);
  return false;
}

const SYSTEM_PROMPT = `You are a helpful support assistant for BDE Farm Trac, a UK-based SaaS platform that helps farmers achieve Red Tractor Scheme compliance.

Key product information:
- Monthly per-farm subscription with module-based pricing
- Core modules: Red Tractor Compliance, Livestock, Crops, Machinery, Financial, Health & Safety
- Target users: UK farmers, farm managers, and agricultural businesses
- Supports Red Tractor Scheme, Assured Food Standards, and general farm management

Your role:
- Answer questions about using BDE Farm Trac features
- Help troubleshoot common issues
- Guide users through the platform's functionality
- Escalate to human support when issues are complex or require account access

Response format:
- Keep responses concise and practical
- Use bullet points for step-by-step instructions
- If you cannot resolve the issue, suggest escalating to human support
- Respond in JSON format: { "reply": "your response here", "suggestEscalation": true/false }`;

router.post("/support/chat", async (req, res): Promise<void> => {
  const parsed = SupportChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...(parsed.data.conversationHistory ?? []),
      { role: "user" as const, content: parsed.data.message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";
    let reply = rawContent;
    let suggestEscalation = false;

    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.reply) reply = parsed.reply;
        if (typeof parsed.suggestEscalation === "boolean") suggestEscalation = parsed.suggestEscalation;
      }
    } catch {
      reply = rawContent;
    }

    res.json({ reply, suggestEscalation });
  } catch (err) {
    console.error("OpenAI chat error:", err);
    res.status(500).json({ error: "Failed to generate response. Please try again." });
  }
});

function buildTicketRef(id: number, createdAt: Date): string {
  const yy = createdAt.getFullYear().toString().slice(2);
  const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
  return `BDE-${yy}${mm}-${String(id).padStart(4, "0")}`;
}

// Multer: memory storage, max 5 files, 5 MB each, images + PDFs + common docs only
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

router.post(
  "/support/tickets",
  upload.array("attachments", 5),
  async (req, res): Promise<void> => {
    // Body may come from JSON or multipart — normalise
    const raw = typeof req.body === "object" ? req.body : {};
    const parsed = CreateSupportTicketBody.safeParse({
      ...raw,
      farmId: raw.farmId != null ? Number(raw.farmId) : undefined,
    });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const conversationJson = parsed.data.conversationHistory
      ? JSON.stringify(parsed.data.conversationHistory)
      : null;

    const source = parsed.data.source ?? "app";
    const farmId = parsed.data.farmId ?? null;
    const tenantSlug = parsed.data.tenantSlug ?? null;

    // Collect uploaded files
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const attachments = files.map((f) => ({
      filename: f.originalname,
      content: f.buffer,
      contentType: f.mimetype,
    }));

    try {
      const [ticket] = await db.insert(supportTicketsTable).values({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        description: parsed.data.description,
        conversationHistory: conversationJson,
        source,
        farmId,
        tenantSlug,
      }).returning();

      const ticketRef = buildTicketRef(ticket.id, ticket.createdAt);
      await db.update(supportTicketsTable).set({ ticketRef }).where(eq(supportTicketsTable.id, ticket.id));

      console.log(`[SUPPORT] New ticket ${ticketRef} from ${ticket.email} (source: ${source}${tenantSlug ? `, tenant: ${tenantSlug}` : ""}${attachments.length ? `, attachments: ${attachments.length}` : ""})`);

      const rawSubject = parsed.data.subject;
      const categoryMatch = rawSubject.match(/^\[([^\]]+)\]/);
      const category = categoryMatch ? categoryMatch[1] : "General";

      const emailLimited = isEmailRateLimited(ticket.email);
      if (emailLimited) {
        console.warn(`[SUPPORT] Per-recipient email rate limit hit for ${ticketRef} — confirmation email suppressed`);
      }

      const confirmPromise = emailLimited
        ? Promise.resolve({ sent: false, reason: "per-recipient rate limit" })
        : sendTicketConfirmationEmail({
            toEmail: ticket.email,
            toName: ticket.name,
            ticketRef,
            ticketSubject: rawSubject,
            category,
            source,
          });

      const [confirmResult, alertResult] = await Promise.allSettled([
        confirmPromise,
        sendNewTicketInternalAlert({
          ticketRef,
          ticketId: ticket.id,
          name: ticket.name,
          email: ticket.email,
          subject: rawSubject,
          description: ticket.description,
          source,
          tenantSlug,
          farmId,
          attachments: attachments.length ? attachments : undefined,
        }),
      ]);

      if (confirmResult.status === "fulfilled" && !confirmResult.value.sent) {
        console.warn(`[SUPPORT] Confirmation email not sent for ${ticketRef}: ${confirmResult.value.reason}`);
      }
      if (alertResult.status === "fulfilled" && !alertResult.value.sent) {
        console.warn(`[SUPPORT] Internal alert not sent for ${ticketRef}: ${alertResult.value.reason}`);
      }

      res.status(201).json({
        id: ticket.id,
        ticketRef,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        source,
        createdAt: ticket.createdAt.toISOString(),
      });
    } catch (err) {
      console.error("Support ticket creation error:", err);
      res.status(500).json({ error: "Failed to create support ticket. Please try again." });
    }
  },
);

export default router;
