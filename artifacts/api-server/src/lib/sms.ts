const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? null;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? null;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER ?? null;

function isTwilioConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
}

export async function sendSms(to: string, body: string): Promise<{ sent: boolean; reason?: string }> {
  if (!isTwilioConfigured()) {
    console.warn("[SMS] Twilio is not configured — SMS sending is disabled.");
    return { sent: false, reason: "Twilio not configured" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  const params = new URLSearchParams({
    To: to,
    From: TWILIO_FROM_NUMBER!,
    Body: body,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[SMS] Twilio error ${response.status}: ${text}`);
      return { sent: false, reason: `Twilio error ${response.status}` };
    }

    console.log(`[SMS] Message sent to ${to.replace(/\d(?=\d{4})/g, "*")}`);
    return { sent: true };
  } catch (err) {
    console.error("[SMS] Failed to send message:", err);
    return { sent: false, reason: String(err) };
  }
}
