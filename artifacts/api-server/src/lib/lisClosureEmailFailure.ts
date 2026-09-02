export const LIS_CLOSURE_INCIDENT_REF = "INC0208722";

export interface LisClosureSubmission {
  success: boolean;
  sandbox: boolean;
  reference?: string;
  submissionId: number;
}

export interface LisClosureEmailResult {
  sent: boolean;
  reason?: string;
}

export interface LisClosureFailureTicket {
  id: number;
  createdAt: Date;
  status: string;
  ticketRef?: string | null;
  name: string;
  email: string;
  subject: string;
  description: string;
  source: string;
  farmId: number | null;
  tenantSlug: string | null;
}

interface NewLisClosureFailureTicket {
  name: string;
  email: string;
  subject: string;
  description: string;
  source: "system";
  farmId: number;
  tenantSlug: string | null;
}

interface InternalSupportAlert {
  ticketRef: string;
  ticketId: number;
  name: string;
  email: string;
  subject: string;
  description: string;
  source: "system";
  tenantSlug: string | null;
  farmId: number;
}

export interface LisClosureFailureAlertDependencies {
  insertTicket: (ticket: NewLisClosureFailureTicket) => Promise<LisClosureFailureTicket>;
  updateTicketRef: (ticketId: number, ticketRef: string) => Promise<void>;
  sendInternalAlert: (alert: InternalSupportAlert) => Promise<LisClosureEmailResult>;
}

export interface LisClosureFailureAlert {
  ticket: LisClosureFailureTicket;
  ticketRef: string;
  alertResult: LisClosureEmailResult;
}

/**
 * Keep the durable BDE alert separate from LIS and SMTP delivery. The route
 * calls this only after a successful live submission's closure email attempt
 * reports sent=false; injected dependencies make that operational guarantee
 * testable without contacting either external service.
 */
export async function recordLisClosureEmailFailure(
  params: {
    submission: LisClosureSubmission;
    emailResult: LisClosureEmailResult;
    farmId: number;
    tenantSlug: string | null;
  },
  deps: LisClosureFailureAlertDependencies,
): Promise<LisClosureFailureAlert | null> {
  const { submission, emailResult, farmId, tenantSlug } = params;
  if (!submission.success || submission.sandbox || emailResult.sent) {
    return null;
  }

  const lisRef = submission.reference
    ?? `(submission-id:${submission.submissionId} — ref not returned by LIS API)`;
  const subject = `${LIS_CLOSURE_INCIDENT_REF} closure email failed — manual LIS follow-up required`;
  const description = [
    `The automated closure email for LIS incident ${LIS_CLOSURE_INCIDENT_REF} could not be sent after a successful live CLA production submission.`,
    `LIS Movement Document Reference: ${lisRef}`,
    `Email error: ${emailResult.reason ?? "unknown"}`,
    `Action required: send the closure email manually to incidentmanagement@livestockinformation.org.uk, referencing ${LIS_CLOSURE_INCIDENT_REF} and the LIS movement document reference above.`,
  ].join("\n\n");

  const ticket = await deps.insertTicket({
    name: "BDE Farm Trac automated monitoring",
    email: "hello@bdefarmtrac.co.uk",
    subject,
    description,
    source: "system",
    farmId,
    tenantSlug,
  });
  const ticketRef = `BDE-${ticket.createdAt.getFullYear().toString().slice(2)}${String(ticket.createdAt.getMonth() + 1).padStart(2, "0")}-${String(ticket.id).padStart(4, "0")}`;
  await deps.updateTicketRef(ticket.id, ticketRef);

  const alertResult = await deps.sendInternalAlert({
    ticketRef,
    ticketId: ticket.id,
    name: ticket.name,
    email: ticket.email,
    subject,
    description,
    source: "system",
    tenantSlug,
    farmId,
  });

  return {
    ticket: { ...ticket, ticketRef, status: ticket.status || "open" },
    ticketRef,
    alertResult,
  };
}