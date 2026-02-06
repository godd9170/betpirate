import { useSearchParams } from "@remix-run/react";

interface Submission {
  id: string;
  createdAt: string;
  nickname: string | null;
}

export default function SubmissionSelector({
  submissions,
  selectedSubmissionId,
}: {
  submissions: Submission[];
  selectedSubmissionId: string | null;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (submissions.length <= 1) {
    return null;
  }

  const handleChange = (submissionId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (submissionId) {
      newParams.set("compare", submissionId);
    } else {
      newParams.delete("compare");
    }
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="card card-bordered bg-base-100 shadow-md mb-4">
      <div className="card-body p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-primary shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-semibold mb-1">
              You have {submissions.length} submissions
            </div>
            <div className="text-xs opacity-70">
              Select which submission to compare with:
            </div>
          </div>
          <select
            className="select select-bordered select-sm w-full sm:w-auto bg-base-200"
            value={selectedSubmissionId || submissions[0]?.id || ""}
            onChange={(e) => handleChange(e.target.value)}
          >
            {submissions.map((submission, index) => {
              const label =
                submission.nickname ||
                `Submission ${submissions.length - index}`;
              const date = new Date(submission.createdAt).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }
              );
              return (
                <option key={submission.id} value={submission.id}>
                  {label} - {date}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}
