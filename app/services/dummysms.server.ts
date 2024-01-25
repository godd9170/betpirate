import type { SendSMSFunction } from "~/lib/remix-auth-sms-link";
import type { Sailor } from "@prisma/client";
import { createSMS } from "~/models/sms.server";

export let sendSMS: SendSMSFunction<Sailor> = async (options) => {
  try {
    console.log(`Sign in link: ${options.magicLink}`);
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
