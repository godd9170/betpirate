import { useFetcher } from "@remix-run/react";

export default function SubmissionRow({ submission }) {
  const fetcher = useFetcher({ key: submission.id });
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
      <th className="text-xs">{`${submission?.sailor?.firstName} ${submission?.sailor?.lastName}`}</th>
      <th className="text-xs">{created}</th>
    </tr>
  );
}
