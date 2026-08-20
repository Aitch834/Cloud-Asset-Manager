import assert from "node:assert/strict";
import {
  buildEidcymruMovementEnvelope,
  eidcymruMovementReasonCode,
  parseEidcymruResponse,
  type EidcymruCredentials,
  type EidcymruMovementPayload,
} from "../src/lib/eidcymru";

const credentials: EidcymruCredentials = {
  username: "keeper@example.test",
  password: "secret&safe",
  applicationName: "BDE Farm Trac",
  applicationVersion: "1.0",
  sandboxMode: true,
};

const payload: EidcymruMovementPayload = {
  movementDate: "2026-08-20",
  movementType: "between",
  departureCph: "12/345/6789/001",
  destinationCph: "98/765/4321",
  species: "goat",
  numberOfAnimals: 2,
  flockNumber: "WL123456",
  earTags: ["UK 123456 000001", "UK 123456 000002"],
  externalReference: "BDE-42-8",
};

const envelope = buildEidcymruMovementEnvelope(payload, credentials, new Date("2026-08-20T10:15:30.000Z"));
assert.match(envelope, /<MovementSpecies>44<\/MovementSpecies>/);
assert.match(envelope, /<MovementType>3<\/MovementType>/);
assert.match(envelope, /<MovementReason>2<\/MovementReason>/);
assert.match(envelope, /<DepartureCph>12\/345\/6789<\/DepartureCph>/);
assert.match(envelope, /<Password>secret&amp;safe<\/Password>/);
assert.equal(eidcymruMovementReasonCode(payload), 2);

const successWithWarning = parseEidcymruResponse(`<?xml version="1.0"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="https://api.eidcymru.org/ews/">
  <SOAP-ENV:Body><ns1:CreateMovementRequest><submission_id>42</submission_id>
    <Success><Code>S001V</Code><Description>Submission Processed</Description><Mid>EW-123</Mid></Success>
    <Warnings><Warning><Code>S004D</Code><Description>CPH Not Recognised</Description><Element>DestinationCph</Element></Warning></Warnings>
  </ns1:CreateMovementRequest></SOAP-ENV:Body>
</SOAP-ENV:Envelope>`);
assert.equal(successWithWarning.success, true);
assert.equal(successWithWarning.reference, "EW-123");
assert.equal(successWithWarning.warnings.length, 1);
assert.equal(successWithWarning.warnings[0]?.element, "DestinationCph");

const businessFailure = parseEidcymruResponse(`<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>
  <CreateMovementRequest><Failures><Failure><Code>S015E</Code><Description>Movement quantity is invalid</Description><Element>MovementQty</Element></Failure></Failures></CreateMovementRequest>
</soap:Body></soap:Envelope>`);
assert.equal(businessFailure.success, false);
assert.match(businessFailure.errorMessage ?? "", /Movement quantity is invalid/);

const fault = parseEidcymruResponse(`<?xml version="1.0"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"><SOAP-ENV:Body>
  <SOAP-ENV:Fault><faultcode>SOAP-ENV:Client</faultcode><faultstring>Authentication failed</faultstring></SOAP-ENV:Fault>
</SOAP-ENV:Body></SOAP-ENV:Envelope>`);
assert.equal(fault.success, false);
assert.match(fault.errorMessage ?? "", /Authentication failed/);

console.log("EIDCymru SOAP adapter contract tests passed");