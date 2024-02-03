import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { readSailor } from "~/models/sailor.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const sailor = await readSailor(sailorId);
  invariant(sailor !== null, "No such sailor");
  if (!sailor.username) return redirect("/onboard");
  return redirect(`/sheets/${process.env.DEFAULT_SHEET_ID}`);
};
