import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { IoCheckmark, IoClose, IoTrashBin } from "react-icons/io5";

export default function SubmissionRow({ submission }) {
  const fetcher = useFetcher({ key: submission.id });
  const [deleteConfirmationEnabled, setDeleteConfirmationEnabled] =
    useState(false);
  const dateTimeFormat = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  const created = dateTimeFormat.format(new Date(submission.createdAt));
  return (
    <tr key={submission.id}>
      <th>
        <fetcher.Form
          method="post"
          action={`/sheets/${submission.sheetId}/submissions/${submission.id}/paid`}
        >
          <input
            type="hidden"
            name="isPaid"
            value={!submission?.isPaid}
            className="invisible absolute"
          />
          <input
            className="checkbox"
            type="checkbox"
            checked={!!submission?.isPaid}
            onChange={(event) => fetcher.submit(event.currentTarget.form)}
          />
        </fetcher.Form>
      </th>
      <th>
        <div className="text-sm">{submission?.sailor?.username}</div>
        <div className="text-xs">{`${submission?.sailor?.firstName} ${submission?.sailor?.lastName}`}</div>
        <div className="text-xs">
          <a href={`tel:${submission.sailor.phone}`}>
            {submission.sailor.phone}
          </a>
        </div>
      </th>
      <th className="text-xs">
        <div>
          {new Intl.DateTimeFormat("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(submission.createdAt))}
        </div>
        <div>
          {new Intl.DateTimeFormat("en", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(submission.createdAt))}
        </div>
      </th>
      <th className="min-w-8">
        <fetcher.Form
          method="delete"
          action={`/sheets/${submission.sheetId}/submissions/${submission.id}`}
        >
          {deleteConfirmationEnabled ? (
            <div className="flex flex-col sm:flex-row">
              <button
                className="text-success-content bg-success rounded-sm"
                type="submit"
              >
                <IoCheckmark size={24} />
              </button>
              <button
                className="text-error-content bg-error rounded-sm"
                onClick={() => setDeleteConfirmationEnabled(false)}
              >
                <IoClose size={24} />
              </button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirmationEnabled(true)}>
              <IoTrashBin size={24} />
            </button>
          )}
        </fetcher.Form>
      </th>
    </tr>
  );
}
