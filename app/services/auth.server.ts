import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { Sailor } from "@prisma/client";
import { sendSMS } from "./sms.server";
import { SMSLinkStrategy } from "~/lib/remix-auth-sms-link";
import { createSailor, readSailorByPhone } from "~/models/sailor.server";

// This secret is used to encrypt the token sent in the magic link and the
// session used to validate someone else is not trying to sign-in as another
// user.
let secret = "supersecretkey"; //process.env.MAGIC_LINK_SECRET
if (!secret) throw new Error("Missing MAGIC_LINK_SECRET env variable.");

export let authenticator = new Authenticator<Sailor>(sessionStorage, {
  sessionKey: "sailor",
});

const verifyCallback = async ({
  phone,
  form,
  magicLinkVerify,
}: {
  phone: string;
  form: FormData;
  magicLinkVerify: boolean;
}) => {
  let sailor = await readSailorByPhone(phone);

  if (!sailor) sailor = await createSailor({ phone }); // register if new

  return sailor;
};

authenticator.use(
  new SMSLinkStrategy(
    { sendSMS, secret, callbackURL: "/magic" },
    verifyCallback
  )
);
