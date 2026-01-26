import { redirect, SessionData, SessionStorage } from "@remix-run/node";
import {
  AuthenticateOptions,
  Strategy,
  StrategyVerifyCallback,
} from "remix-auth";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export type PhoneNumberStrategyVerifyParams = {
  phone: string;
};

export const payloadSchema = z.object({
  phone: z.string(),
});

/**
 * This auth strategy is incredibly naive. It uses a phone number as a
 * passphrase. It validates its a legitimate Canadian phone number, and
 * calls an external verify function to obtain a user by their phone.
 */
export class PhoneNumberStrategy<User> extends Strategy<
  User,
  { phone: string }
> {
  public name = "phone-number";

  constructor(
    options: {},
    verify: StrategyVerifyCallback<User, PhoneNumberStrategyVerifyParams>
  ) {
    super(verify);
  }

  /**
   * Authenticates a user based on the phone number provided in the request.
   *
   * @param request - The incoming request object.
   * @param sessionStorage - The session storage to manage user sessions.
   * @param options - Options for authentication, including failure and success redirects.
   *
   * @throws {Error} If `failureRedirect` is not defined in options.
   * @throws {Redirect} If the phone number is not provided or is invalid, a redirect to the failure page is thrown.
   *
   * @returns {Promise<void>} This function does not return a value as it either redirects or throws an error.
   */
  public async authenticate(
    request: Request,
    sessionStorage: SessionStorage<SessionData, SessionData>,
    options: AuthenticateOptions
  ): Promise<User> {
    // get session
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    // get the phone number from the request
    const formData = await request.formData();
    const payload = parseWithZod(formData, { schema: payloadSchema });

    const handleFailureRedirect = async (message: string) => {
      if (!options.failureRedirect) {
        throw new Error("failureRedirect is not defined");
      }
      session.flash("error", { message });
      const cookie = await sessionStorage.commitSession(session);
      throw redirect(options.failureRedirect, {
        headers: { "Set-Cookie": cookie },
      });
    };

    // if the phone number is not present or validation failed, we failure redirect
    if (payload.status !== 'success' || !payload.value.phone) {
      console.log("No Phone or validation failed");
      await handleFailureRedirect("No phone number provided");
      throw new Error(""); // tell .ts that phone will be safe below
    }

    const phone = payload.value.phone;

    // if the phone number is not a valid format, we failure redirect
    if (!isValidPhoneNumber(phone, "CA")) {
      console.log("Invaid Number: ", phone);
      await handleFailureRedirect("Invalid phone number");
    }

    // todo: normalize phone number for storage
    const normalizedPhoneNumber = parsePhoneNumberWithError(phone, "CA").number;

    // we store the phone number in the session
    await session.set("auth:phone", normalizedPhoneNumber);

    // we call the verify function to authenticate the user
    let user = await this.verify({ phone: normalizedPhoneNumber });

    // if no success redirect, we'll just return
    if (!options.successRedirect) {
      return user;
    }

    // redirect the user to the successRedirect page
    session.set(options.sessionKey, user);
    const cookie = await sessionStorage.commitSession(session);
    throw redirect(options.successRedirect, {
      headers: { "Set-Cookie": cookie },
    });
  }
}
