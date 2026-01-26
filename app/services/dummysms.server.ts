import { createSMS } from "~/models/sms.server";

type SendSMSOptions = {
  phone: string;
  magicLink: string;
};

export let sendSMS = async (options: SendSMSOptions) => {
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
