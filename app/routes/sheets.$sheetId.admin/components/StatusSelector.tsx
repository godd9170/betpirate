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
      <select
        name="status"
        defaultValue={sheet.status}
        className="select select-bordered select-lg w-full"
        onChange={(event) => fetcher.submit(event.currentTarget.form)}
      >
        <option>DRAFT</option>
        <option>OPEN</option>
        <option>CLOSED</option>
      </select>
    </fetcher.Form>
  );
}
