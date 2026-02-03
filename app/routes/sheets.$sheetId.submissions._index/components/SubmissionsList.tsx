import { Link } from "@remix-run/react";
import {
  IoCheckmarkCircle,
  IoTimeOutline,
  IoTrophyOutline,
  IoAmericanFootballOutline,
} from "react-icons/io5";

export default function SubmissionsList({
  submissions,
  sheet,
}: {
  submissions: any[];
  sheet: { status: string };
}) {
  if (submissions.length === 0 && sheet.status === "CLOSED") {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center py-12">
          <IoAmericanFootballOutline size={64} className="mb-4 text-primary" />
          <h2 className="card-title text-2xl font-bold">
            Missed the boat, matey!
          </h2>
          <p className="opacity-70">
            Submissions for this sheet are closed. Better luck next time.
          </p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center py-12">
          <IoTrophyOutline size={64} className="mb-4 text-primary" />
          <h2 className="card-title text-2xl font-bold">No Submissions Yet</h2>
          <p className="opacity-70">
            Get started by submitting your first set of picks!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission, i) => (
        <Link
          key={submission.id}
          to={`/sheets/${submission.sheetId}/submissions/${submission.id}`}
          className="card card-bordered bg-base-100 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.01] cursor-pointer"
        >
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="card-title text-2xl font-black">
                    {submission.nickname || `Submission ${i + 1}`}
                  </h2>
                  {submission.isPaid ? (
                    <div className="badge badge-success badge-lg gap-1 font-bold shadow-md">
                      <IoCheckmarkCircle size={16} />
                      Paid
                    </div>
                  ) : (
                    <div className="badge badge-warning badge-lg gap-1 font-bold shadow-md">
                      <IoTimeOutline size={16} />
                      Unpaid
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-sm opacity-70 font-semibold">
                      Submitted
                    </div>
                    <div className="font-bold">
                      {new Date(submission.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm opacity-70 font-semibold">
                      Tie Breaker
                    </div>
                    <div className="font-bold text-primary text-xl">
                      {submission.tieBreaker}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-4xl opacity-20">→</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
