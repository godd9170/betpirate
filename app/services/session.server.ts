import { createCookieSessionStorage } from "@remix-run/node";
import { readSailorByEmail, createSailor } from "~/models/sailor.server";
import bcrypt from "bcryptjs";

export const sessionKey = "sailor";

export const login = async (email: string, password: string) => {
  const sailor = await readSailorByEmail(email);
  if (!sailor) return null;
  if (!(await bcrypt.compare(password, sailor.passwordHash))) return null;
  return sailor;
};

export const register = async (
  username: string,
  email: string,
  password: string
) => {
  const passwordHash = await bcrypt.hash(password, 10);
  // todo: check for weak passwords
  const sailor = await createSailor({ username, email, passwordHash });
  if (!sailor) return null;
  return sailor;
};

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ["s3cr3t"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

export let { getSession, commitSession, destroySession } = sessionStorage;
