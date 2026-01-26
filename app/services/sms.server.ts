import { sendSMS as sendTwilioSMS } from "./twilio.server";
import { createSMS } from "~/models/sms.server";

type SendSMSOptions = {
  phone: string;
  magicLink: string;
};

export let sendSMS = async (options: SendSMSOptions) => {
  let body = options.magicLink;
  try {
    const response = await sendTwilioSMS(options.phone, body);
    await createSMS({ to: options.phone, body, response }); // keep a record in the db
  } catch (e) {
    console.error("Couldn't send: ", e);
    throw new Error("SMS Could not be sent.");
  }
};
