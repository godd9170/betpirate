import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import LeaderBoard from "./components/LeaderBoard";
import { readSailorWithSubmissions } from "~/models/sailor.server";
import { readSheet, readSheetLeaders } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import Countdown from "./components/Countdown";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(sailorId, `sailorId is required`);

  const sailor = await readSailorWithSubmissions(sailorId);
  if (sailor === null) {
    await authenticator.logout(request, { redirectTo: "/login" });
    return;
  }

  const sheetId = params.sheetId;
  invariant(sheetId, `sheetId is required`);

  const sheet = await readSheet(sheetId);
  invariant(!!sheet, "No sheet exists with this id");

  const leaders = await readSheetLeaders(sheetId);

  return json({ sailor, sheet, leaders });
};

// A leaderboard of all the submissions for the sheet
export default function Leaders() {
  const { sailor, sheet, leaders } = useLoaderData<typeof loader>();
  if (sheet.status !== "CLOSED") return <Countdown leaders={leaders} />;
  return <LeaderBoard sheet={sheet} leaders={leaders} />;
}
