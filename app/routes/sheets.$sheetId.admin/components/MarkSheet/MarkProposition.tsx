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
          className="select select-bordered w-full"
          onChange={(event) => fetcher.submit(event.currentTarget.form)}
        >
          <option>-</option>
          {proposition.options.map((option) => (
            <option value={option?.id}>{option?.shortTitle}</option>
          ))}
        </select>
      </div>
    </fetcher.Form>
  );
}
