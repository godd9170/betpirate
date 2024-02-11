import { createCookieSessionStorage } from "@remix-run/node";

export const sessionKey = "sailor";

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ["s3cr3t"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
    maxAge: 604800,
  },
});

export let { getSession, commitSession, destroySession } = sessionStorage;
