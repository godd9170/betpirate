import { useFetcher } from "@remix-run/react";

type Props = {
  sheet: {
    id: string;
    status: "DRAFT" | "OPEN" | "CLOSED";
  };
};

export default function StatusSelector({ sheet }: Props) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action={`/sheets/${sheet.id}/status`}>
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text text-xs uppercase tracking-wide text-base-content/60">
            Sheet status
          </span>
        </div>
        <select
          name="status"
          defaultValue={sheet.status}
          className="select select-bordered w-full"
          onChange={(event) => fetcher.submit(event.currentTarget.form)}
        >
          <option>DRAFT</option>
          <option>OPEN</option>
          <option>CLOSED</option>
        </select>
      </label>
    </fetcher.Form>
  );
}
