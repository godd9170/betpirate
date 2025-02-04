import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { createSailor, readSailorByPhone } from "~/models/sailor.server";
import {
  PhoneNumberStrategy,
  PhoneNumberStrategyVerifyParams,
} from "~/lib/remix-auth-phone-number";

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
