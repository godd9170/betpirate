import type { SendSMSFunction } from "~/lib/remix-auth-sms-link";
import type { Sailor } from "@prisma/client";
import { sendSMS as sendTwilioSMS } from "./twilio.server";
import { createSMS } from "~/models/sms.server";

export let sendSMS: SendSMSFunction<Sailor> = async (options) => {
  let body = `Ahoy! Click the link to submit yer sheet. ${options.magicLink}`;
  try {
    const response = await sendTwilioSMS(options.phone, body);
    await createSMS({ to: options.phone, body, response }); // keep a record in the db
  } catch (e) {
    console.error("Couldn't send: ", e);
  }
};
