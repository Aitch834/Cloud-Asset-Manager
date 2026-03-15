import { Router, type IRouter } from "express";
import { db, supportTicketsTable } from "@workspace/db";
import { SupportChatBody, CreateSupportTicketBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are a helpful support assistant for BDE Farm Trac, a UK-based SaaS platform that helps farmers achieve Red Tractor Scheme compliance.

Key product information:
- Monthly per-farm subscription with module-based pricing
- Modules include: Red Tractor Compliance, Field & Crop Management, Stock & Supplier Tracking, Equipment & Vehicle Management, Document Management, Financial Records, Weather Tracking, Livestock Management, Nutrient Management, Biosecurity, Staff Training
- Mobile apps with offline-first capability, GPS field mapping, and photo capture
- Supports arable and livestock farming (beef, dairy, pig, poultry)
- UK GDPR compliant
- Domain: bdefarmtrac.co.uk

Answer questions about the product helpfully and concisely. If the question is about pricing specifics, technical support for an existing account, or complaints, suggest the user speak to a human team member by setting suggestEscalation to true in your response.

Keep responses under 150 words. Be professional, warm, and knowledgeable about UK farming.

IMPORTANT: You must respond with valid JSON in this exact format:
{"reply": "your response text here", "suggestEscalation": false}

Set suggestEscalation to true only when the user needs human help (account issues, complaints, detailed pricing quotes, technical problems).`;

router.post("/support/chat", async (req, res): Promise<void> => {
  const parsed = SupportChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, conversationHistory } = parsed.data;

  const chatMessages: Array<{role: "system" | "user" | "assistant"; content: string}> = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (conversationHistory && conversationHistory.length > 0) {
    const lastHistoryMsg = conversationHistory[conversationHistory.length - 1];
    const historyAlreadyContainsMessage = lastHistoryMsg?.role === "user" && lastHistoryMsg?.content === message;

    for (const msg of conversationHistory) {
      chatMessages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    if (!historyAlreadyContainsMessage) {
      chatMessages.push({ role: "user", content: message });
    }
  } else {
    chatMessages.push({ role: "user", content: message });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: chatMessages,
    });

    const rawContent = completion.choices[0]?.message?.content || "";

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

router.post("/support/tickets", async (req, res): Promise<void> => {
  const parsed = CreateSupportTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conversationJson = parsed.data.conversationHistory
    ? JSON.stringify(parsed.data.conversationHistory)
    : null;

  try {
    const [ticket] = await db.insert(supportTicketsTable).values({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      description: parsed.data.description,
      conversationHistory: conversationJson,
    }).returning();

    // TODO: Send email notification to support team about new ticket
    console.log(`[EMAIL PLACEHOLDER] New support ticket #${ticket.id} created`);

    res.status(201).json({
      id: ticket.id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Support ticket creation error:", err);
    res.status(500).json({ error: "Failed to create support ticket. Please try again." });
  }
});

export default router;
