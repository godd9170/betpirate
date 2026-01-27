import { useState } from "react";
import { IoCopyOutline, IoCheckmarkCircle, IoWallet } from "react-icons/io5";

export default function PaymentWarning({ sailor }: { sailor: any }) {
  const [copied, setCopied] = useState(false);
  const outstandingPayments = sailor.submissions.filter(
    (submission: { isPaid: any }) => !submission.isPaid,
  ).length;

  const amountOwed = (10 * outstandingPayments).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
  });

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText("hayz_149@hotmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (outstandingPayments === 0) return null;

  return (
    <div className="card bg-warning text-warning-content shadow-xl mb-6 overflow-hidden">
      <div className="card-body">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="card-title text-2xl font-black mb-3">
              <IoWallet /> Payment Required
            </h2>
            <div className="space-y-2">
              <p className="text-lg">
                Please e-transfer{" "}
                <span className="font-black text-2xl px-2 py-1 bg-warning-content text-warning rounded">
                  {amountOwed}
                </span>{" "}
                to:
              </p>

              <button
                onClick={copyText}
                onTouchStart={copyText}
                className="btn btn-lg btn-block bg-warning-content text-warning hover:scale-[1.02] transition-transform border-0 shadow-lg"
              >
                <span className="font-black text-xl  break-all">
                  hayz_149@hotmail.com
                </span>
                {copied ? (
                  <IoCheckmarkCircle size={24} />
                ) : (
                  <IoCopyOutline size={24} />
                )}
              </button>

              {copied && (
                <div className="alert alert-success shadow-md">
                  <IoCheckmarkCircle size={20} />
                  <span className="font-bold">Copied to clipboard!</span>
                </div>
              )}

              <p className="text-sm opacity-90 mt-3">
                💡 <strong>Important:</strong> Include your username (
                {sailor.username}) in the memo. It's not real time, we will mark
                it paid as soon as we can.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
