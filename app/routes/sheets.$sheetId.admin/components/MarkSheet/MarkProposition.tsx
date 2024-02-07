import { useFetcher } from "@remix-run/react";

type Option = {
  shortTitle: string;
  id: string;
};

type Props = {
  proposition: {
    shortTitle: string;
    sheetId: string;
    id: string;
    answerId: string;
    options: Option[];
  };
};

export default function MarkProposition({ proposition }: Props) {
  const fetcher = useFetcher({ key: proposition.id });
  return (
    <fetcher.Form
      method="post"
      action={`/sheets/${proposition.sheetId}/propositions/${proposition.id}/answer`}
      className="pt-4"
    >
      <div>{proposition.shortTitle}</div>
      <div>
        <select
          name="answerId"
          defaultValue={proposition.answerId || undefined}
          className="select select-bordered w-full max-w-xs"
          onChange={(event) => fetcher.submit(event.currentTarget.form)}
        >
          <option>-</option>
          <option value={proposition.options[0]?.id}>
            {proposition.options[0]?.shortTitle}
          </option>
          <option value={proposition.options[1]?.id}>
            {proposition.options[1]?.shortTitle}
          </option>
        </select>
      </div>
    </fetcher.Form>
  );
}
