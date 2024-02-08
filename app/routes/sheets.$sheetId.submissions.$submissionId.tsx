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
  return json({ submission });
};

export default function Submission() {
  const { submission } = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="text-center font-bold">{submission?.sailor.username}</h1>
      <h2 className="text-center font-bold">
        Tie Breaker: {submission?.tieBreaker}
      </h2>
      <SubmissionTable submission={submission} />
    </>
  );
}
