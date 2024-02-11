import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import SubmissionTable from "~/components/SubmissionTable";
import { readSubmission } from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";

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
  const showPaymentRequired =
    submission?.sailorId === sailorId && !submission?.isPaid;
  return (
    <>
      <h1 className="text-center font-bold pb-2">
        {submission?.sailor.username}
      </h1>
      {showPaymentRequired && (
        <div role="alert" className="alert alert-info">
          <span>
            Please e-transfer $10 to Hayz_149@hotmail.com or your submission
            will not be counted!
          </span>
        </div>
      )}
      <SubmissionTable submission={submission} />
      <h2 className="text-center font-bold pt-3">
        Tie Breaker: {submission?.tieBreaker}
      </h2>
    </>
  );
}
