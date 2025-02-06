import { useState } from "react";
import { IoIosWarning } from "react-icons/io";

export default function SubmissionsList({ sailor }: { sailor: any }) {
  const [copied, setCopied] = useState(false);
  const outstandingPayments = sailor.submissions.filter(
    (submission: { isPaid: any }) => !submission.isPaid
  ).length;

  const amountOwed = (10 * outstandingPayments).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
  });
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText("hayz_149@hotmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (outstandingPayments === 0) return null;

  return (
    <div role="alert" className="alert alert-warning my-4" onClick={copyText}>
      <span>
        <div>
          Please e-transfer{" "}
          <span className="font-extrabold text-lg">{amountOwed}</span> to{" "}
        </div>
        <div className="text-xl cursor-pointer font-extrabold underline">
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
        </div>
        <div> Include your username in the memo.</div>
      </span>
    </div>
  );
}
