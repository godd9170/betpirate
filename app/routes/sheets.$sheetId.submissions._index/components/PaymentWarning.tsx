import { useState } from "react";

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
    <div
      role="alert"
      className="alert alert-warning my-4 cursor-pointer"
      onClick={copyText}
      onTouchStart={copyText}
    >
      {copied ? (
        <span className="text-xl font-extrabold">Copied to clipboard!</span>
      ) : (
        <span>
          <span>
            Please e-transfer{" "}
            <span className="font-extrabold text-lg">{amountOwed}</span> to{" "}
          </span>
          <span className="text-xl font-extrabold">
            <>
              hayz_149@hotmail
              <wbr />
              .com
            </>
          </span>
          <span> and include your username in the memo.</span>
        </span>
      )}
    </div>
  );
}
