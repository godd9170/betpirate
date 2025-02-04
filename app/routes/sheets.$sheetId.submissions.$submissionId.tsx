import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
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
  const [copied, setCopied] = useState(false);
  const { sailorId, submission } = useLoaderData<typeof loader>();
  const showPaymentRequired =
    submission?.sailorId === sailorId && !submission?.isPaid;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText("hayz_149@hotmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      {showPaymentRequired && (
        <div role="alert" className="alert alert-warning" onClick={copyText}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            Unpaid Submission: Please e-transfer <strong>$10.00</strong> to{" "}
            <span className="cursor-pointer font-extrabold underline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`inline align-middle`}
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {copied ? "Copied!" : "Hayz_149@hotmail.com"}
            </span>{" "}
            or your submission will not be counted!
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
