import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { sendSMS } from "~/services/sms.server"; // todo: use locally "~/services/dummysms.server"; //
import { sendSMS as sendDummySMS } from "~/services/dummysms.server";
import {
  SMSLinkStrategy,
  SMSLinkStrategyVerifyParams,
} from "~/lib/remix-auth-sms-link";
import { createSailor, readSailorByPhone } from "~/models/sailor.server";
import {
  PhoneNumberStrategy,
  PhoneNumberStrategyVerifyParams,
} from "~/lib/remix-auth-phone-number";

// This secret is used to encrypt the token sent in the magic link and the
// session used to validate someone else is not trying to sign-in as another
// user.
let secret = "supersecretkey"; //process.env.MAGIC_LINK_SECRET
if (!secret) throw new Error("Missing MAGIC_LINK_SECRET env variable.");

// export let authenticator = new Authenticator<SailorId>(sessionStorage, {
//   sessionKey: "sailor",
// });

// const verifyCallback = async ({
//   phone,
//   form,
//   magicLinkVerify,
// }: SMSLinkStrategyVerifyParams): Promise<SailorId> => {
//   let sailor = await readSailorByPhone(phone);

//   if (!sailor) sailor = await createSailor({ phone }); // register if new

//   return sailor.id;
// };

// authenticator.use(
//   new SMSLinkStrategy(
//     {
//       sendSMS: process.env.NODE_ENV === "development" ? sendDummySMS : sendSMS,
//       secret,
//       callbackURL: "/magic",
//     },
//     verifyCallback
//   )
// );

const verifyCallback = async ({
  phone,
}: PhoneNumberStrategyVerifyParams): Promise<SailorId> => {
  let sailor = await readSailorByPhone(phone);

  if (!sailor) sailor = await createSailor({ phone }); // register if new

  return sailor.id;
};

export let authenticator = new Authenticator<SailorId>(sessionStorage, {
  sessionKey: "sailor",
});

authenticator.use(new PhoneNumberStrategy({}, verifyCallback));
