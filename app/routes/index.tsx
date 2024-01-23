import { LoaderArgs, redirect } from "@remix-run/node";
import { readLatestSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const sailor = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (!sailor.username) return redirect("/register"); // let's get this sailor a name

  // todo: should we hardcode LVIII sheet?
  const latestSheet = await readLatestSheet();
  const redirectRoute = !!latestSheet
    ? `/sheets/${latestSheet.id}`
    : "/submissions";

  return redirect(redirectRoute);
};
