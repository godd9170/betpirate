import { Authenticator } from "remix-auth";
import { login, register, sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import { Sailor } from "@prisma/client";
import invariant from "tiny-invariant";

export let authenticator = new Authenticator<Sailor>(sessionStorage, {
  sessionKey: "sailor",
});

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    let email = form.get("email");
    let password = form.get("password");
    invariant(typeof email === "string", "email must be a string");
    invariant(email.length > 0, "email must not be empty");
    invariant(typeof password === "string", "password must be a string");
    invariant(password.length > 0, "password must not be empty");
    switch (context?.type) {
      case "login":
        const existingSailor = await login(email, password);
        invariant(
          existingSailor != null,
          "Ye made a mistake, or ye be unregistered"
        );
        return existingSailor;
      case "register":
        let username = form.get("username");
        invariant(typeof username === "string", "username must be a string");
        const newSailor = await register(username, email, password);
        invariant(newSailor != null, "Ye be unable to register");
        return newSailor;
      default:
        invariant(false, "missing login context. Must be login or register");
    }
  }),
  "email-password"
);
