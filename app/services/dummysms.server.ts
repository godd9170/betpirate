import type { SendSMSFunction } from "~/lib/remix-auth-sms-link";
import { createSMS } from "~/models/sms.server";

export let sendSMS: SendSMSFunction<SailorId> = async (options) => {
  try {
    await createSMS({
      to: options.phone,
      body: "",
      response: { message: "Dummy text" },
    }); // keep a record in the db
  } catch (e) {
    console.error("Couldn't send: ", e);
    throw new Error("SMS Could not be sent.");
  }
};
