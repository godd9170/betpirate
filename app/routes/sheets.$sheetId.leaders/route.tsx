import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import LeaderBoard from "./components/LeaderBoard";
import OpenLeaderboard from "./components/OpenLeaderboard";
import { readSailorWithSubmissions } from "~/models/sailor.server";
import { readSheet, readSheetLeaders } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import { readSheetSubmissionsPreview } from "~/models/submission.server";

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

  const leaders =
    sheet.status === "CLOSED" ? await readSheetLeaders(sheetId) : [];
  const previewSubmissions =
    sheet.status === "OPEN" ? await readSheetSubmissionsPreview(sheetId) : [];

  return json({ sailor, sheet, leaders, previewSubmissions });
};

// A leaderboard of all the submissions for the sheet
export default function Leaders() {
  const { sailor, sheet, leaders, previewSubmissions } =
    useLoaderData<typeof loader>();
  if (sheet.status === "OPEN") {
    return (
      <OpenLeaderboard
        sailor={sailor}
        sheet={sheet}
        submissions={previewSubmissions}
      />
    );
  }
  if (sheet.status !== "CLOSED") {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <h1 className="text-3xl font-black mb-2">Leaderboard Locked</h1>
          <p className="opacity-70">
            The leaderboard will open once submissions are live.
          </p>
        </div>
      </div>
    );
  }
  return <LeaderBoard sailor={sailor} sheet={sheet} leaders={leaders} />;
}
