import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSailorWithSubmissions } from "~/models/sailor.server";
import { readSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import SubmissionsList from "./components/SubmissionsList";
import { IoAddCircle } from "react-icons/io5";
import PaymentWarning from "./components/PaymentWarning";

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

  return (
    <div className="flex flex-col items-center">
      <PaymentWarning sailor={sailor} />
      <Link
        className="btn btn-accent"
        to={`/sheets/${sheet.id}/submissions/new`}
      >
        <IoAddCircle size={24} /> New Submission
      </Link>
      <SubmissionsList submissions={sailor.submissions} />
    </div>
  );
}
