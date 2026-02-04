import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { readSailor } from "~/models/sailor.server";
import { readLatestSheet } from "~/models/sheet.server";
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

  if (!sailor.username || !sailor.profilePictureUrl) {
    return redirect("/onboard");
  }
  const latestSheet = await readLatestSheet();
  invariant(latestSheet, "No sheet exists");
  return redirect(`/sheets/${latestSheet.id}`);
};
