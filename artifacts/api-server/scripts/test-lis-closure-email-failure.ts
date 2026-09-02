import assert from "node:assert/strict";
import { recordLisClosureEmailFailure, LIS_CLOSURE_INCIDENT_REF } from "../src/lib/lisClosureEmailFailure";

const createdAt = new Date("2026-09-02T10:15:00.000Z");
const storedTickets: Array<{
  id: number;
  createdAt: Date;
  status: string;
  ticketRef: string | null;
  name: string;
  email: string;
  subject: string;
  description: string;
  source: string;
  farmId: number;
  tenantSlug: string | null;
}> = [];
const internalAlerts: Array<Record<string, unknown>> = [];
let closureEmailAttempts = 0;

const liveSubmission = {
  success: true,
  sandbox: false,
  reference: "CLA-LIVE-20260902-0042",
  submissionId: 42,
};

async function sendClosureEmailForLiveSubmission(
  submission: typeof liveSubmission,
): Promise<{ sent: boolean; reason: string }> {
  assert.equal(submission.success, true);
  assert.equal(submission.sandbox, false);
  closureEmailAttempts += 1;
  return { sent: false, reason: "SMTP relay rejected the LIS recipient" };
}

const closureEmailResult = await sendClosureEmailForLiveSubmission(liveSubmission);
assert.equal(closureEmailResult.sent, false);

const alert = await recordLisClosureEmailFailure({
  submission: liveSubmission,
  emailResult: closureEmailResult,
  farmId: 71,
  tenantSlug: "lis-closure-test",
}, {
  insertTicket: async (ticket) => {
    const storedTicket = {
      ...ticket,
      id: 9001,
      createdAt,
      status: "open",
      ticketRef: null,
    };
    storedTickets.push(storedTicket);
    return storedTicket;
  },
  updateTicketRef: async (ticketId, ticketRef) => {
    const ticket = storedTickets.find((candidate) => candidate.id === ticketId);
    assert.ok(ticket, "the created support ticket should be updated with its reference");
    ticket.ticketRef = ticketRef;
  },
  sendInternalAlert: async (internalAlert) => {
    internalAlerts.push(internalAlert);
    return { sent: false, reason: "SMTP intentionally disabled in regression test" };
  },
});

assert.equal(closureEmailAttempts, 1, "the failed closure-email result should come from one attempted send");
assert.equal(storedTickets.length, 1);
assert.equal(alert?.ticket.status, "open");
assert.equal(alert?.ticket.source, "system");
assert.equal(alert?.ticket.ticketRef, "BDE-2609-9001");
assert.match(alert?.ticket.subject ?? "", new RegExp(LIS_CLOSURE_INCIDENT_REF));
assert.match(alert?.ticket.description ?? "", new RegExp(LIS_CLOSURE_INCIDENT_REF));
assert.match(alert?.ticket.description ?? "", /CLA-LIVE-20260902-0042/);
assert.match(alert?.ticket.description ?? "", /SMTP relay rejected the LIS recipient/);
assert.match(alert?.ticket.description ?? "", /send the closure email manually/);
assert.match(alert?.ticket.description ?? "", /incidentmanagement@livestockinformation\.org\.uk/);

assert.equal(internalAlerts.length, 1, "the existing internal support-alert sender should be attempted");
assert.equal(internalAlerts[0]?.ticketRef, "BDE-2609-9001");
assert.equal(internalAlerts[0]?.ticketId, 9001);
assert.equal(internalAlerts[0]?.source, "system");
assert.match(String(internalAlerts[0]?.description), /manual LIS follow-up required|send the closure email manually/);

console.log("LIS closure-email failure alert regression checks passed without LIS or SMTP calls.");