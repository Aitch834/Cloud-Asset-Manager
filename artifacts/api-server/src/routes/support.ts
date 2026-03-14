import { Router, type IRouter } from "express";
import { db, supportTicketsTable } from "@workspace/db";
import { SupportChatBody, CreateSupportTicketBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/support/chat", async (req, res): Promise<void> => {
  const parsed = SupportChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, conversationHistory } = parsed.data;

  const systemContext = `You are a helpful support assistant for BDE Farm Trac, a UK-based SaaS platform that helps farmers achieve Red Tractor Scheme compliance. 

Key product information:
- Monthly per-farm subscription with module-based pricing
- Modules include: Red Tractor Compliance, Field & Crop Management, Stock & Supplier Tracking, Equipment Management, Document Management, Financial Records, Weather Tracking, Livestock Management, Nutrient Management, Biosecurity, Staff Training
- Mobile apps with offline-first capability, GPS field mapping, and photo capture
- Supports arable and livestock farming (beef, dairy, pig, poultry)
- UK GDPR compliant
- Domain: bdefarmtrac.co.uk

Answer questions about the product helpfully. If the question is about pricing specifics, technical support for an existing account, or complaints, suggest the user speak to a human team member.

Keep responses concise and professional. If you cannot help, set suggestEscalation to true.`;

  const conversationMessages = (conversationHistory || []).map((msg: { role: string; content: string }) => ({
    role: msg.role,
    content: msg.content,
  }));

  const reply = generateSimpleResponse(message, conversationMessages);
  const suggestEscalation = shouldEscalate(message);

  res.json({ reply, suggestEscalation });
});

function generateSimpleResponse(message: string, _history: Array<{role: string; content: string}>): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("pricing") || lowerMsg.includes("cost") || lowerMsg.includes("price")) {
    return "BDE Farm Trac uses a module-based pricing model. You pay a monthly fee per farm, and you choose which compliance modules each farm needs. This means you only pay for what you use. For a detailed quote tailored to your operation, I'd recommend filling in our Register Interest form or speaking to our team directly.";
  }

  if (lowerMsg.includes("red tractor") || lowerMsg.includes("compliance")) {
    return "BDE Farm Trac is specifically designed to help UK farmers achieve and maintain Red Tractor Scheme compliance. Our system provides digital record-keeping templates, gap analysis against current standards, inspection preparation checklists, and a full compliance audit trail. We cover all major Red Tractor categories including crop protection, livestock welfare, environmental management, and food safety.";
  }

  if (lowerMsg.includes("module") || lowerMsg.includes("feature")) {
    return "We offer a comprehensive range of modules: Red Tractor Compliance, Field & Crop Management, Stock & Supplier Tracking, Equipment & Vehicle Management, Document Management, Financial Records, Weather Tracking, Livestock Management (beef/dairy/pig/poultry), Nutrient Management, Biosecurity, and Staff Training. Each module can be added individually to your subscription. Would you like more detail about any specific module?";
  }

  if (lowerMsg.includes("mobile") || lowerMsg.includes("app") || lowerMsg.includes("offline")) {
    return "Yes! BDE Farm Trac includes mobile apps for both iOS and Android. They're designed to work offline-first, so you can record data in the field even without signal. Features include GPS field boundary mapping, photo capture linked directly to records, and automatic sync when you're back online.";
  }

  if (lowerMsg.includes("livestock") || lowerMsg.includes("cattle") || lowerMsg.includes("sheep") || lowerMsg.includes("poultry") || lowerMsg.includes("pig")) {
    return "Our livestock modules cover herd/flock registers, movement records, medicine administration logs, feed records, and breeding records. We support beef, dairy, pig, and poultry operations with templates specific to each sector. All records are structured to meet Red Tractor audit requirements.";
  }

  if (lowerMsg.includes("trial") || lowerMsg.includes("demo") || lowerMsg.includes("try")) {
    return "We'd love to show you how BDE Farm Trac works! Please fill in our Register Interest form with your details and the modules you're interested in, and our team will arrange a personalised demonstration for your farm operation.";
  }

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
    return "Hello! Welcome to BDE Farm Trac support. I'm here to help you learn about our farm compliance management system. What would you like to know? I can help with information about our features, modules, pricing structure, or how we help with Red Tractor compliance.";
  }

  return "Thank you for your interest in BDE Farm Trac. We help UK farmers streamline their Red Tractor compliance with digital record-keeping, field management, livestock tracking, and more. Is there a specific aspect of our platform you'd like to know more about? I can help with information about features, modules, pricing, or compliance support.";
}

function shouldEscalate(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  const escalationKeywords = ["complaint", "problem", "issue", "broken", "not working", "refund", "cancel", "speak to someone", "human", "manager", "account"];
  return escalationKeywords.some(keyword => lowerMsg.includes(keyword));
}

router.post("/support/tickets", async (req, res): Promise<void> => {
  const parsed = CreateSupportTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conversationJson = parsed.data.conversationHistory
    ? JSON.stringify(parsed.data.conversationHistory)
    : null;

  const [ticket] = await db.insert(supportTicketsTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    description: parsed.data.description,
    conversationHistory: conversationJson,
  }).returning();

  res.status(201).json({
    id: ticket.id,
    name: ticket.name,
    email: ticket.email,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
  });
});

export default router;
