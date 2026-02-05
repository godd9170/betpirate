import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { IoCheckmark, IoClose, IoTrashBin } from "react-icons/io5";

type Submission = {
  id: string;
  isPaid: boolean;
  createdAt: string;
  sheetId: string;
  sailor: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
  };
};

type SubmissionRowProps = {
  submission: Submission;
};

export default function SubmissionRow({ submission }: SubmissionRowProps) {
  const fetcher = useFetcher({ key: submission.id });
  const [deleteConfirmationEnabled, setDeleteConfirmationEnabled] =
    useState(false);

  const isOptimisticPaid =
    fetcher.formData?.get("isPaid") === "true"
      ? true
      : fetcher.formData?.get("isPaid") === "false"
        ? false
        : submission.isPaid;

  return (
    <tr className="hover:bg-base-200/50 transition-colors duration-150">
      <td className="w-16">
        <fetcher.Form
          method="post"
          action={`/sheets/${submission.sheetId}/submissions/${submission.id}/paid`}
        >
          <input
            type="hidden"
            name="isPaid"
            value={String(!submission.isPaid)}
          />
          <input
            className="checkbox checkbox-success"
            type="checkbox"
            checked={isOptimisticPaid}
            onChange={(event) => fetcher.submit(event.currentTarget.form)}
            aria-label={`Mark ${submission.sailor?.username || "submission"} as ${submission.isPaid ? "unpaid" : "paid"}`}
          />
        </fetcher.Form>
      </td>
      <td>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-base-content">
            {submission.sailor?.username || "Unknown"}
          </span>
          {(submission.sailor?.firstName || submission.sailor?.lastName) && (
            <span className="text-sm text-base-content/70">
              {[submission.sailor?.firstName, submission.sailor?.lastName]
                .filter(Boolean)
                .join(" ")}
            </span>
          )}
          <a
            href={`tel:${submission.sailor?.phone}`}
            className="text-sm text-primary hover:underline"
          >
            {submission.sailor?.phone}
          </a>
        </div>
      </td>
      <td className="text-sm text-base-content/70">
        <div className="flex flex-col gap-0.5">
          <span>
            {new Intl.DateTimeFormat("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }).format(new Date(submission.createdAt))}
          </span>
          <span className="text-xs">
            {new Intl.DateTimeFormat("en", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(submission.createdAt))}
          </span>
        </div>
      </td>
      <td className="w-24">
        <fetcher.Form
          method="delete"
          action={`/sheets/${submission.sheetId}/submissions/${submission.id}`}
        >
          {deleteConfirmationEnabled ? (
            <div className="flex items-center gap-1">
              <button
                className="btn btn-success btn-xs"
                type="submit"
                aria-label="Confirm delete"
              >
                <IoCheckmark size={16} />
              </button>
              <button
                className="btn btn-error btn-xs"
                type="button"
                onClick={() => setDeleteConfirmationEnabled(false)}
                aria-label="Cancel delete"
              >
                <IoClose size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-sm text-base-content/50 hover:text-error"
              type="button"
              onClick={() => setDeleteConfirmationEnabled(true)}
              aria-label={`Delete submission from ${submission.sailor?.username || "unknown"}`}
            >
              <IoTrashBin size={18} />
            </button>
          )}
        </fetcher.Form>
      </td>
    </tr>
  );
}
