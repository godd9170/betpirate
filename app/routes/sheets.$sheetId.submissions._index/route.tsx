import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSailorWithSubmissions } from "~/models/sailor.server";
import { readSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import SubmissionsList from "./components/SubmissionsList";

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

  return json({ sailor, sheet });
};

// Show the sailor all of their submissions
export default function Submissions() {
  const { sailor, sheet } = useLoaderData<typeof loader>();
  return <SubmissionsList submissions={sailor.submissions} />;
}
