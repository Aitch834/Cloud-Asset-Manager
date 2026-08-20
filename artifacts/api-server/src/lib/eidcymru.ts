/**
 * EIDCymru EWS v1.3 SOAP provider.
 *
 * This provider is intentionally self-contained: the movements workflow talks
 * to this boundary rather than knowing SOAP details, so a future EIDCymru API
 * can replace it without changing routes or user-facing submission history.
 */

const STAGING_ENDPOINT = "https://stagews.eidcymru.org/ews";
const PRODUCTION_ENDPOINT = "https://ews.eidcymru.org/ews";
const EWS_NAMESPACE = "https://ews.eidcymru.org/ews/";

export interface EidcymruCredentials {
  username: string;
  password: string;
  applicationName: string;
  applicationVersion: string;
  sandboxMode: boolean;
}

export interface EidcymruMovementPayload {
  movementDate: string;
  movementType: "on" | "off" | "between" | "birth" | "death";
  departureCph: string;
  destinationCph: string;
  species: "sheep" | "goat";
  numberOfAnimals: number;
  flockNumber?: string;
  earTags?: string[];
  licenceNumber?: string;
  transporterName?: string;
  vehicleRegistration?: string;
  reason?: string;
  externalReference: string;
}

export interface EidcymruIssue {
  code?: string;
  description: string;
  element?: string;
}

export interface EidcymruResult {
  success: boolean;
  sandboxMode: boolean;
  reference?: string;
  warnings: EidcymruIssue[];
  rawResponse?: unknown;
  errorMessage?: string;
  payload: EidcymruMovementPayload;
}

interface XmlNode {
  name: string;
  children: XmlNode[];
  text: string;
}

function localName(name: string): string {
  return name.split(":").at(-1) ?? name;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeXml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * A small namespace-tolerant XML reader for EWS response documents. It uses a
 * token stack rather than response-specific regular expressions, which keeps
 * SOAP faults, repeated warnings and namespace prefixes safe to process.
 */
function readXml(xml: string): XmlNode {
  const root: XmlNode = { name: "root", children: [], text: "" };
  const stack = [root];
  const tokens = xml.matchAll(/<!\[CDATA\[([\s\S]*?)\]\]>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/g);
  for (const match of tokens) {
    const token = match[0];
    if (token.startsWith("<!--") || token.startsWith("<?") || token.startsWith("<!DOCTYPE")) continue;
    if (token.startsWith("<![CDATA[")) {
      stack.at(-1)!.text += match[1] ?? "";
      continue;
    }
    if (!token.startsWith("<")) {
      stack.at(-1)!.text += decodeXml(token);
      continue;
    }
    if (token.startsWith("</")) {
      const expected = localName(token.slice(2, -1).trim());
      if (stack.length === 1 || localName(stack.at(-1)!.name) !== expected) {
        throw new Error("Malformed XML response from EIDCymru");
      }
      stack.pop();
      continue;
    }
    if (token.startsWith("<!")) continue;
    const inner = token.slice(1, -1).trim();
    const selfClosing = inner.endsWith("/");
    const tagName = inner.replace(/\/$/, "").trim().split(/\s+/, 1)[0];
    if (!tagName) throw new Error("Malformed XML response from EIDCymru");
    const node: XmlNode = { name: tagName, children: [], text: "" };
    stack.at(-1)!.children.push(node);
    if (!selfClosing) stack.push(node);
  }
  if (stack.length !== 1) throw new Error("Malformed XML response from EIDCymru");
  return root;
}

function descendants(node: XmlNode, name: string): XmlNode[] {
  const found: XmlNode[] = [];
  for (const child of node.children) {
    if (localName(child.name) === name) found.push(child);
    found.push(...descendants(child, name));
  }
  return found;
}

function firstText(node: XmlNode, name: string): string | undefined {
  const found = descendants(node, name)[0];
  const value = found?.text.trim();
  return value || undefined;
}

function issuesFrom(node: XmlNode, itemName: "Warning" | "Failure"): EidcymruIssue[] {
  return descendants(node, itemName).map((item) => ({
    code: firstText(item, "Code"),
    description: firstText(item, "Description") ?? "EIDCymru returned an unspecified response.",
    element: firstText(item, "Element"),
  }));
}

function formatIssues(issues: EidcymruIssue[]): string {
  return issues.map((issue) => [issue.code, issue.description, issue.element ? `(${issue.element})` : ""].filter(Boolean).join(" ")).join("; ");
}

export function parseEidcymruResponse(xml: string): {
  success: boolean;
  reference?: string;
  warnings: EidcymruIssue[];
  errorMessage?: string;
  response: Record<string, unknown>;
} {
  const root = readXml(xml);
  const fault = descendants(root, "Fault")[0];
  if (fault) {
    const faultCode = firstText(fault, "faultcode");
    const faultString = firstText(fault, "faultstring") ?? "EIDCymru SOAP fault";
    return {
      success: false,
      warnings: [],
      errorMessage: [faultCode, faultString].filter(Boolean).join(": "),
      response: { fault: { code: faultCode, description: faultString } },
    };
  }

  const failures = issuesFrom(root, "Failure");
  const warnings = issuesFrom(root, "Warning");
  const success = descendants(root, "Success")[0];
  const reference = success ? firstText(success, "Mid") : undefined;
  const submissionId = firstText(root, "submission_id") ?? firstText(root, "SubmissionId");
  if (!success || failures.length > 0) {
    return {
      success: false,
      warnings,
      errorMessage: formatIssues(failures) || "EIDCymru rejected this request.",
      response: { submissionId, failures, warnings },
    };
  }

  return {
    success: true,
    reference,
    warnings,
    response: {
      submissionId,
      success: {
        code: firstText(success, "Code"),
        description: firstText(success, "Description"),
        mid: reference,
      },
      warnings,
    },
  };
}

function isoTimestamp(now = new Date()): string {
  return now.toISOString().replace(/\.\d{3}Z$/, "");
}

function normaliseCph(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 9) return value.trim().replace(/\s+/g, "");
  // EWS requires CPH only, not a sub-location. A supplied sub-location follows
  // the 2/3/4 CPH digits and is deliberately excluded.
  const cph = digits.slice(0, 9);
  return `${cph.slice(0, 2)}/${cph.slice(2, 5)}/${cph.slice(5)}`;
}

export function eidcymruSpeciesCode(species: EidcymruMovementPayload["species"]): number {
  if (species === "sheep") return 4;
  if (species === "goat") return 44;
  throw new Error(`EIDCymru does not support '${species}' in this provider.`);
}

export function eidcymruMovementReasonCode(payload: EidcymruMovementPayload): number | undefined {
  if (payload.movementType === "between") return 2;
  const reason = payload.reason?.toLowerCase() ?? "";
  if (reason.includes("common land") || reason.includes("rounding")) return 1;
  if (reason.includes("own business") || reason.includes("within business")) return 2;
  if (reason.includes("market") || reason.includes("mart") || reason.includes("collection")) return 3;
  return undefined;
}

export function buildEidcymruMovementEnvelope(payload: EidcymruMovementPayload, credentials: EidcymruCredentials, now = new Date()): string {
  if (!["on", "off", "between"].includes(payload.movementType)) {
    throw new Error("EIDCymru EWS submits on, off and between-holding movements. Record births and deaths separately in the keeper portal.");
  }
  if (!Number.isInteger(payload.numberOfAnimals) || payload.numberOfAnimals < 1 || payload.numberOfAnimals > 999) {
    throw new Error("EIDCymru movements must contain between 1 and 999 animals.");
  }
  const departureCph = normaliseCph(payload.departureCph);
  const destinationCph = normaliseCph(payload.destinationCph);
  if (!departureCph || !destinationCph) throw new Error("Both departure and destination CPH numbers are required for EIDCymru.");
  const tags = payload.earTags?.map((tag) => tag.trim()).filter(Boolean) ?? [];
  const reasonCode = eidcymruMovementReasonCode(payload);
  const transport = payload.transporterName || payload.vehicleRegistration
    ? `<TransportInformation>${payload.transporterName ? `<TransportName>${escapeXml(payload.transporterName)}</TransportName>` : ""}${payload.vehicleRegistration ? `<TransportVehicleReg>${escapeXml(payload.vehicleRegistration)}</TransportVehicleReg>` : ""}</TransportInformation>`
    : "";
  const tagReadings = tags.length
    ? `<MovementReads>${tags.length}</MovementReads><TagReadings>${tags.map((tag) => `<TagReading FreeTag="${escapeXml(tag)}" Type="manual" Timestamp="${isoTimestamp(now)}"/>`).join("")}</TagReadings>`
    : "";
  const flockTags = payload.flockNumber
    ? `<FlockTags><FlockTag FlockNumber="${escapeXml(payload.flockNumber)}" TagCount="${payload.numberOfAnimals}"/></FlockTags>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ews="${EWS_NAMESPACE}">
  <soapenv:Header/>
  <soapenv:Body>
    <ews:CreateMovementRequest>
      <UserName>${escapeXml(credentials.username)}</UserName>
      <Password>${escapeXml(credentials.password)}</Password>
      <ApplicationName>${escapeXml(credentials.applicationName)}</ApplicationName>
      <ApplicationVersion>${escapeXml(credentials.applicationVersion)}</ApplicationVersion>
      <SchemaVersion>1.0</SchemaVersion>
      <Timestamp>${isoTimestamp(now)}</Timestamp>
      <Movement>
        <ExternalReference>${escapeXml(payload.externalReference)}</ExternalReference>
        <ExternalSystem>BDE Farm Trac</ExternalSystem>
        <LotNumber>${escapeXml(payload.externalReference)}</LotNumber>
        ${payload.licenceNumber ? `<MovementReference>${escapeXml(payload.licenceNumber)}</MovementReference>` : ""}
        <MovementSpecies>${eidcymruSpeciesCode(payload.species)}</MovementSpecies>
        <MovementQty>${payload.numberOfAnimals}</MovementQty>
        <MovementType>3</MovementType>
        ${reasonCode ? `<MovementReason>${reasonCode}</MovementReason>` : ""}
        <DepartureCph>${escapeXml(departureCph)}</DepartureCph>
        <DepartureDate>${escapeXml(payload.movementDate)}</DepartureDate>
        <DestinationCph>${escapeXml(destinationCph)}</DestinationCph>
        <ArrivalDate>${escapeXml(payload.movementDate)}</ArrivalDate>
        ${tagReadings}
        ${flockTags}
        ${transport}
      </Movement>
    </ews:CreateMovementRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildOutstandingEnvelope(credentials: EidcymruCredentials): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <GetOutstandingMovementsRequest xmlns="${EWS_NAMESPACE}">
      <UserName xmlns="">${escapeXml(credentials.username)}</UserName>
      <Password xmlns="">${escapeXml(credentials.password)}</Password>
      <ApplicationName xmlns="">${escapeXml(credentials.applicationName)}</ApplicationName>
      <ApplicationVersion xmlns="">${escapeXml(credentials.applicationVersion)}</ApplicationVersion>
      <SchemaVersion xmlns="">1.0</SchemaVersion>
      <Timestamp xmlns="">${isoTimestamp()}</Timestamp>
      <Outstanding xmlns=""><Page>1</Page></Outstanding>
    </GetOutstandingMovementsRequest>
  </s:Body>
</s:Envelope>`;
}

async function callEws(envelope: string, credentials: EidcymruCredentials): Promise<{ httpStatus: number; xml: string }> {
  const endpoint = credentials.sandboxMode ? STAGING_ENDPOINT : PRODUCTION_ENDPOINT;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "text/xml, application/soap+xml",
      SOAPAction: "",
    },
    body: envelope,
  });
  return { httpStatus: response.status, xml: await response.text() };
}

export function isEidcymruSandbox(credentials?: Pick<EidcymruCredentials, "sandboxMode"> | null): boolean {
  return credentials?.sandboxMode ?? true;
}

export async function submitEidcymruMovement(payload: EidcymruMovementPayload, credentials: EidcymruCredentials): Promise<EidcymruResult> {
  try {
    const envelope = buildEidcymruMovementEnvelope(payload, credentials);
    const { httpStatus, xml } = await callEws(envelope, credentials);
    const parsed = parseEidcymruResponse(xml);
    return {
      success: parsed.success,
      sandboxMode: credentials.sandboxMode,
      reference: parsed.reference,
      warnings: parsed.warnings,
      errorMessage: parsed.errorMessage ?? (httpStatus >= 400 ? `EIDCymru returned HTTP ${httpStatus}` : undefined),
      payload,
      rawResponse: { httpStatus, ...parsed.response },
    };
  } catch (error) {
    return {
      success: false,
      sandboxMode: credentials.sandboxMode,
      warnings: [],
      errorMessage: error instanceof Error ? error.message : "Unable to contact EIDCymru.",
      payload,
    };
  }
}

export async function testEidcymruConnection(credentials: EidcymruCredentials): Promise<{ success: boolean; message: string }> {
  try {
    const { httpStatus, xml } = await callEws(buildOutstandingEnvelope(credentials), credentials);
    const parsed = parseEidcymruResponse(xml);
    if (!parsed.success) return { success: false, message: parsed.errorMessage ?? `EIDCymru returned HTTP ${httpStatus}.` };
    return {
      success: true,
      message: `${credentials.sandboxMode ? "Staging" : "Production"} EIDCymru connection accepted. ${parsed.warnings.length ? `Warnings: ${formatIssues(parsed.warnings)}` : "Credentials and registered application verified."}`,
    };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Unable to contact EIDCymru." };
  }
}