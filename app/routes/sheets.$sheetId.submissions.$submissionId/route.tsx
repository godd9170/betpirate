import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import SubmissionTable from "./components/SubmissionTable";
import { readSubmission } from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";
import SubmissionTotals from "./components/SubmissionTotals";

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
  return json({ sailorId, submission });
};

export default function Submission() {
  const { sailorId, submission } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-black">{`${submission?.sailor.username}'s Picks`}</h1>
      <SubmissionTotals submission={submission} />
      <SubmissionTable submission={submission} />
      <h2 className="text-center font-bold pt-3 pb-5">
        Tie Breaker: {submission?.tieBreaker}
      </h2>
    </div>
  );
}
