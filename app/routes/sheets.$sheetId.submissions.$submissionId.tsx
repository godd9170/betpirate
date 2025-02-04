import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import SubmissionTable from "~/components/SubmissionTable";
import { readSubmission } from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";
import { IoIosWarning } from "react-icons/io";

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
          <IoIosWarning />
          <span>
            Unpaid Submission: Please e-transfer <strong>$10.00</strong> to{" "}
            <span className="cursor-pointer font-extrabold underline">
              {copied ? (
                "Copied!"
              ) : (
                <span>
                  Hayz_149
                  <wbr />
                  @hotmail
                  <wbr />
                  .com
                </span>
              )}
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
