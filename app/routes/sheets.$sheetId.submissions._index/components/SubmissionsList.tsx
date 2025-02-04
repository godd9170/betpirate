import { Link, Outlet } from "@remix-run/react";

export default function SubmissionsList({
  submissions,
}: {
  submissions: any[];
}) {
  return submissions.map((submission, i) => (
    <div className="card w-full bg-base-200 shadow-xl my-4 hover:bg-base-300">
      <Link
        to={`/sheets/${submission.sheetId}/submissions/${submission.id}`}
        className="card-body"
      >
        <h2 className="card-title">
          {`Submission #${i + 1}`}{" "}
          <div
            className={`badge gap-2 ${
              submission.isPaid ? "bg-success" : "bg-warning"
            }`}
          >
            <span
              className={submission.isPaid ? "text-content" : "text-accent"}
            >
              {submission.isPaid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </h2>
        <p>{`Current Position: T1`}</p>
        <p>{`Tie Breaker: ${submission.tieBreaker}`}</p>
      </Link>
    </div>
  ));
}
