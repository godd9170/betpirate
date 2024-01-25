import type { SessionStorage } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import crypto from "crypto-js";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import type { AuthenticateOptions, StrategyVerifyCallback } from "remix-auth";
import { Strategy } from "remix-auth";

export type SendSMSOptions<User> = {
  phone: string;
  magicLink: string;
  user?: User | null;
  domainUrl: string;
  form: FormData;
};

export type SendSMSFunction<User> = {
  (options: SendSMSOptions<User>): Promise<void>;
};

/**
 * The content of the magic link payload. Keys are minified so that the resulting link is as short as possible.
 */
export type MagicLinkPayload = {
  /**
   * Phone number used to authenticate.
   */
  p: string;
  /**
   * Form data received in the request.
   */
  f?: Record<string, unknown>;
  /**
   * Creation date of the magic link, as an ISO string. This is used to check
   * the email link is still valid.
   */
  c: number;
};

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export type SMSLinkStrategyOptions<User> = {
  /**
   * The endpoint the user will go after clicking on the sms link.
   * A whole URL is not required, the pathname is enough, the strategy will
   * detect the host of the request and use it to build the URL.
   * @default "/magic"
   */
  callbackURL?: string;
  /**
   * A function to send the email. This function should receive the email
   * address of the user and the URL to redirect to and should return a Promise.
   * The value of the Promise will be ignored.
   */
  sendSMS: SendSMSFunction<User>;
  /**
   * A secret string used to encrypt and decrypt the token and magic link.
   */
  secret: string;
  /**
   * The name of the form input used to get the phone.
   * @default "phone"
   */
  phoneField?: string;
  /**
   * The param name the strategy will use to read the token from the sms link.
   * @default "token"
   */
  magicLinkSearchParam?: string;
  /**
   * How long the magic link will be valid. Default to 30 minutes.
   * @default 1_800_000
   */
  linkExpirationTime?: number;
  /**
   * The key on the session to store any error message.
   * @default "auth:error"
   */
  sessionErrorKey?: string;
  /**
   * The key on the session to store the magic link.
   * @default "auth:magiclink"
   */
  sessionMagicLinkKey?: string;
  /**
   * Add an extra layer of protection and validate the magic link is valid.
   * @default false
   */
  validateSessionMagicLink?: boolean;

  /**
   * The key on the session to store the phone.
   * It's unset the same time the sessionMagicLinkKey is.
   * @default "auth:phone"
   */
  sessionPhoneKey?: string;
};

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export type SMSLinkStrategyVerifyParams = {
  phone: string;
  form: FormData;
  /**
   * True, if the verify callback is called after clicking on the magic link
   */
  magicLinkVerify: boolean;
};

export class SMSLinkStrategy<User> extends Strategy<
  User,
  SMSLinkStrategyVerifyParams
> {
  public name = "sms-link";

  private readonly phoneField: string = "phone";

  private readonly callbackURL: string;

  private readonly sendSMS: SendSMSFunction<User>;

  private readonly secret: string;

  private readonly magicLinkSearchParam: string;

  private readonly linkExpirationTime: number;

  private readonly sessionErrorKey: string;

  private readonly sessionMagicLinkKey: string;

  private readonly validateSessionMagicLink: boolean;

  private readonly sessionPhoneKey: string;

  constructor(
    options: SMSLinkStrategyOptions<User>,
    verify: StrategyVerifyCallback<User, SMSLinkStrategyVerifyParams>
  ) {
    super(verify);
    this.sendSMS = options.sendSMS;
    this.callbackURL = options.callbackURL ?? "/magic";
    this.secret = options.secret;
    this.sessionErrorKey = options.sessionErrorKey ?? "auth:error";
    this.sessionMagicLinkKey = options.sessionMagicLinkKey ?? "auth:magiclink";
    this.phoneField = options.phoneField ?? this.phoneField;
    this.magicLinkSearchParam = options.magicLinkSearchParam ?? "token";
    this.linkExpirationTime = options.linkExpirationTime ?? 1000 * 60 * 30; // 30 minutes
    this.validateSessionMagicLink = options.validateSessionMagicLink ?? false;
    this.sessionPhoneKey = options.sessionPhoneKey ?? "auth:phone";
  }

  public async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions
  ): Promise<User> {
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    const form = new URLSearchParams(await request.text());
    const formData = new FormData();

    // Convert the URLSearchParams to FormData
    for (const [name, value] of form) {
      formData.append(name, value);
    }

    // This should only be called in an action if it's used to start the login process
    if (request.method === "POST") {
      if (!options.successRedirect) {
        throw new Error(
          "Missing successRedirect. The successRedirect is required for POST requests."
        );
      }

      // get the phone number from the request body
      const phone = form.get(this.phoneField);

      // if it doesn't have an phone number,
      if (!phone || typeof phone !== "string") {
        const message = "Missing phone number.";
        if (!options.failureRedirect) {
          throw new Error(message);
        }
        session.flash(this.sessionErrorKey, { message });
        const cookie = await sessionStorage.commitSession(session);
        throw redirect(options.failureRedirect, {
          headers: { "Set-Cookie": cookie },
        });
      }

      try {
        // validate the phone number
        if (!isValidPhoneNumber(phone, "CA")) {
          throw new Error(
            `Invalid Phone Number. Must be a real Canadian number of format (555) 666-7777`
          );
        }

        // normalize the phone number
        const normalizedPhoneNumber = parsePhoneNumber(phone, "CA").number;

        const domainUrl = this.getDomainURL(request);
        const magicLink = await this.sendToken(
          normalizedPhoneNumber,
          domainUrl,
          formData
        );

        session.set(this.sessionMagicLinkKey, await this.encrypt(magicLink));
        session.set(this.sessionPhoneKey, phone);

        throw redirect(options.successRedirect, {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
        });
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).status === 302) {
          // If it's a redirect, then just throw the redirect as it is
          throw error;
        }
        if (!options.failureRedirect) {
          throw error;
        }
        const { message } = error as Error;
        session.flash(this.sessionErrorKey, { message });
        const cookie = await sessionStorage.commitSession(session);
        throw redirect(options.failureRedirect, {
          headers: { "Set-Cookie": cookie },
        });
      }
    }

    let user: User;

    try {
      // If we get here, the user clicked on the magic link inside sms
      const magicLink = session.get(this.sessionMagicLinkKey) ?? "";
      const { phone, form } = await this.validateMagicLink(
        request.url,
        await this.decrypt(magicLink)
      );
      // now that we have the user email we can call verify to get the user
      user = await this.verify({ phone, form, magicLinkVerify: true });
    } catch (error) {
      // if something happens, we should redirect to the failureRedirect
      // and flash the error message, or just throw the error if failureRedirect
      // is not defined
      if (!options.failureRedirect) {
        throw error;
      }
      const { message } = error as Error;
      session.flash(this.sessionErrorKey, { message });
      const cookie = await sessionStorage.commitSession(session);
      throw redirect(options.failureRedirect, {
        headers: { "Set-Cookie": cookie },
      });
    }

    if (!options.successRedirect) {
      return user;
    }

    // remove the magic link and phone from the session
    session.unset(this.sessionMagicLinkKey);
    session.unset(this.sessionPhoneKey);

    session.set(options.sessionKey, user);
    const cookie = await sessionStorage.commitSession(session);
    throw redirect(options.successRedirect, {
      headers: { "Set-Cookie": cookie },
    });
  }

  public async getMagicLink(
    emailAddress: string,
    domainUrl: string,
    form: FormData
  ): Promise<string> {
    const payload = this.createMagicLinkPayload(emailAddress, form);
    const stringToEncrypt = JSON.stringify(payload);
    const encryptedString = await this.encrypt(stringToEncrypt);
    const url = new URL(domainUrl);
    url.pathname = this.callbackURL;
    url.searchParams.set(this.magicLinkSearchParam, encryptedString);
    return url.toString();
  }

  private getDomainURL(request: Request): string {
    const host =
      request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

    if (!host) {
      throw new Error("Could not determine domain URL.");
    }

    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : request.headers.get("X-Forwarded-Proto") ?? "https";

    return `${protocol}://${host}`;
  }

  private async sendToken(phone: string, domainUrl: string, form: FormData) {
    const magicLink = await this.getMagicLink(phone, domainUrl, form);
    const user = await this.verify({
      phone,
      form,
      magicLinkVerify: false,
    }).catch(() => null);

    await this.sendSMS({
      phone,
      magicLink,
      user,
      domainUrl,
      form,
    });

    return magicLink;
  }

  private createFormPayload(form: FormData): MagicLinkPayload["f"] {
    const formKeys = [...form.keys()];
    return formKeys.length === 1
      ? undefined
      : Object.fromEntries(
          formKeys
            .filter((key) => key !== this.phoneField)
            .map((key) => [
              key,
              form.getAll(key).length > 1 ? form.getAll(key) : form.get(key),
            ])
        );
  }

  private createMagicLinkPayload(
    phone: string,
    form: FormData
  ): MagicLinkPayload {
    const formPayload = this.createFormPayload(form);
    return {
      p: phone,
      ...(formPayload && { f: formPayload }),
      c: Date.now(),
    };
  }

  private async encrypt(value: string): Promise<string> {
    return crypto.AES.encrypt(value, this.secret).toString();
  }

  private async decrypt(value: string): Promise<string> {
    const bytes = crypto.AES.decrypt(value, this.secret);
    return bytes.toString(crypto.enc.Utf8);
  }

  private getMagicLinkCode(link: string) {
    try {
      const url = new URL(link);
      return url.searchParams.get(this.magicLinkSearchParam) ?? "";
    } catch {
      return "";
    }
  }

  private async validateMagicLink(
    requestUrl: string,
    sessionMagicLink?: string
  ) {
    const linkCode = this.getMagicLinkCode(requestUrl);
    const sessionLinkCode = sessionMagicLink
      ? this.getMagicLinkCode(sessionMagicLink)
      : null;

    let phone;
    let linkCreationTime;
    let form: Record<string, unknown>;
    try {
      const decryptedString = await this.decrypt(linkCode);
      const payload = JSON.parse(decryptedString) as MagicLinkPayload;
      phone = payload.p;
      form = payload.f ?? {};
      form[this.phoneField] = phone;
      linkCreationTime = payload.c;
    } catch (error: unknown) {
      console.error(error);
      throw new Error("Sign in link invalid. Please request a new one.");
    }

    if (typeof phone !== "string") {
      throw new TypeError("Sign in link invalid. Please request a new one.");
    }

    if (this.validateSessionMagicLink) {
      if (!sessionLinkCode) {
        throw new Error("Sign in link invalid. Please request a new one.");
      }
      if (linkCode !== sessionLinkCode) {
        throw new Error(
          `You must open the magic link on the same device it was created from for security reasons. Please request a new link.`
        );
      }
    }

    if (typeof linkCreationTime !== "number") {
      throw new TypeError("Sign in link invalid. Please request a new one.");
    }

    const expirationTime = linkCreationTime + this.linkExpirationTime;
    if (Date.now() > expirationTime) {
      throw new Error("Magic link expired. Please request a new one.");
    }
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (Array.isArray(form[key])) {
        (form[key] as unknown[]).forEach((value) => {
          formData.append(key, value as string | Blob);
        });
      } else {
        formData.append(key, form[key] as string | Blob);
      }
    });
    return { phone, form: formData };
  }
}
