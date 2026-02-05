import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { readSailorWithSheetSubmissions } from "~/models/sailor.server";
import { readLatestSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const latestSheet = await readLatestSheet();
  invariant(latestSheet, "No sheet exists");

  const sailor = await readSailorWithSheetSubmissions(sailorId, latestSheet.id);

  if (sailor === null) {
    await authenticator.logout(request, { redirectTo: "/login" });
    return;
  }

  // If user has submissions, go to submissions list; otherwise check onboarding
  if (sailor.submissions.length > 0) {
    return redirect(`/sheets/${latestSheet.id}/submissions`);
  }

  // Only require onboarding for users without submissions
  if (!sailor.username || !sailor.profilePictureUrl) {
    return redirect("/onboard");
  }

  return redirect(`/sheets/${latestSheet.id}/submissions/new`);
};
