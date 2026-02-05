import { sendSMS as sendTwilioSMS } from "./twilio.server";
import { createSMS } from "~/models/sms.server";

const isProduction = process.env.NODE_ENV === "production";

type SendSMSOptions = {
  phone: string;
  magicLink: string;
};

export let sendSMS = async (options: SendSMSOptions) => {
  let body = options.magicLink;
  try {
    if (isProduction) {
      const response = await sendTwilioSMS(options.phone, body);
      await createSMS({ to: options.phone, body, response });
    } else {
      console.log(`[DummySMS] To: ${options.phone}, Body: ${body}`);
      await createSMS({
        to: options.phone,
        body,
        response: { message: "Dummy SMS (dev mode)" },
      });
    }
  } catch (e) {
    console.error("Couldn't send: ", e);
    throw new Error("SMS Could not be sent.");
  }
};

type SendConfirmationSMSOptions = {
  phone: string;
  sheetName: string;
};

type SendPaymentReminderSMSOptions = {
  phone: string;
  sheetName: string;
  sheetOpensAt?: string | Date | null;
};

const formatSheetOpensAt = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export let sendSubmissionConfirmationSMS = async (
  options: SendConfirmationSMSOptions,
) => {
  const body = `Ahoy! Your picks for "${options.sheetName}" have been received. Good luck, matey!\n\nFollow along live at https://betpirate.ca`;
  try {
    if (isProduction) {
      const response = await sendTwilioSMS(options.phone, body);
      await createSMS({ to: options.phone, body, response });
    } else {
      console.log(`[DummySMS] To: ${options.phone}, Body: ${body}`);
      await createSMS({
        to: options.phone,
        body,
        response: { message: "Dummy SMS (dev mode)" },
      });
    }
  } catch (e) {
    // Log the error but don't throw - SMS failure should not block submission
    console.error("Couldn't send confirmation SMS: ", e);
  }
};

export let sendSubmissionPaymentReminderSMS = async (
  options: SendPaymentReminderSMSOptions,
) => {
  const opensAtLabel = formatSheetOpensAt(options.sheetOpensAt);
  const deadlineText = opensAtLabel ?? "the sheet opens";
  const body = `Reminder: eTransfer $10 to hayz_149@hotmail.com before ${deadlineText} for your submission to "${options.sheetName}" to be valid.`;
  try {
    if (isProduction) {
      const response = await sendTwilioSMS(options.phone, body);
      await createSMS({ to: options.phone, body, response });
    } else {
      console.log(`[DummySMS] To: ${options.phone}, Body: ${body}`);
      await createSMS({
        to: options.phone,
        body,
        response: { message: "Dummy SMS (dev mode)" },
      });
    }
  } catch (e) {
    // Log the error but don't throw - SMS failure should not block submission
    console.error("Couldn't send payment reminder SMS: ", e);
  }
};
