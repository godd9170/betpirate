import { LoaderArgs, redirect } from "@remix-run/node";
import { readLatestSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });
  const latestSheet = await readLatestSheet();
  const redirectRoute = !!latestSheet
    ? `/sheets/${latestSheet.id}`
    : "/submissions";

  return redirect(redirectRoute);
};
