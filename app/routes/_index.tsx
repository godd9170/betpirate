import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { readSailor } from "~/models/sailor.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const sailor = await readSailor(sailorId);

  if (sailor === null) {
    await authenticator.logout(request, { redirectTo: "/login" });
    return;
  }

  if (!sailor.username || !sailor.profilePicture) return redirect("/onboard");
  return redirect(`/sheets/${process.env.DEFAULT_SHEET_ID}`);
};
