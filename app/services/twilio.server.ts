import twilio from "twilio";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export async function sendSMS(
  to = "+16139211286",
  body = "🏴‍☠️🏴‍☠️🏴‍☠️🏴‍☠️🏴‍☠️🏴‍☠️🏴‍☠️🏴‍☠️🏴‍☠️"
): Promise<MessageInstance> {
  const client = twilio(accountSid, authToken);
  return await client.messages.create({
    from: "+16137079034",
    to,
    body,
  });
}
