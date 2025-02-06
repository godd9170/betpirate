import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import SubmissionTable from "./components/SubmissionTable";
import {
  readSheetSubmissionRanking,
  readSubmission,
} from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";
import SubmissionTotals from "./components/SubmissionTotals";
import { readSheetSummary } from "~/models/sheet.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(!!sailorId, `sailorId is required`);

  const sheetId = params.sheetId;
  invariant(!!sheetId, `params.sheetId is required`);

  const submissionId = params.submissionId;
  invariant(!!submissionId, `params.submissionId is required`);

  const submission = await readSubmission(submissionId);

  const sheetSummary = await readSheetSummary(sheetId);
  const submissionRank = await readSheetSubmissionRanking(submissionId);

  return json({ sailorId, submission, submissionRank, sheetSummary });
};

export default function Submission() {
  const { sailorId, submission, submissionRank, sheetSummary } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-black">{`${submission?.sailor.username}'s Picks`}</h1>
      <SubmissionTotals
        sheetSummary={sheetSummary}
        submissionRank={submissionRank}
      />{" "}
      <h2 className="text-center font-bold pt-3 pb-5">
        Tie Breaker: {submission?.tieBreaker}
      </h2>
      <SubmissionTable submission={submission} />
    </div>
  );
}
