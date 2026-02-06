import { useFetcher } from "@remix-run/react";
import { useState } from "react";

type Option = {
  shortTitle: string | null;
  id: string;
  imageUrl: string | null;
};

type Props = {
  proposition: {
    title: string;
    shortTitle: string | null;
    sheetId: string;
    id: string;
    answerId: string | null;
    imageUrl: string | null;
    options: Option[];
    order: number | null;
  };
};

export default function MarkProposition({ proposition }: Props) {
  const fetcher = useFetcher({ key: proposition.id });
  const [localAnswer, setLocalAnswer] = useState(proposition.answerId || "");

  const isSubmitting = fetcher.state !== "idle";
  const selectedOption = proposition.options.find(
    (opt) => opt.id === (localAnswer || proposition.answerId)
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setLocalAnswer(value);
    if (value && value !== "-") {
      fetcher.submit(event.currentTarget.form);
    }
  };

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="badge badge-primary badge-lg font-bold shrink-0">
              #{(proposition.order ?? 0) + 1}
            </div>
            {proposition.imageUrl && (
              <div className="h-10 w-16 rounded-lg overflow-hidden border border-base-300 shrink-0">
                <img
                  src={proposition.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{proposition.title}</p>
              {proposition.shortTitle && proposition.shortTitle !== proposition.title && (
                <p className="text-sm text-base-content/60 truncate">
                  {proposition.shortTitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {selectedOption && selectedOption.imageUrl && (
              <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-success shrink-0">
                <img
                  src={selectedOption.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {isSubmitting && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
          </div>
        </div>

        <fetcher.Form
          method="post"
          action={`/sheets/${proposition.sheetId}/propositions/${proposition.id}/answer`}
        >
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Correct Answer</span>
              {selectedOption && (
                <span className="label-text-alt text-success">
                  ✓ {selectedOption.shortTitle}
                </span>
              )}
            </label>
            <select
              name="answerId"
              value={localAnswer || "-"}
              className="select select-bordered w-full"
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="-">-- Select correct answer --</option>
              {proposition.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.shortTitle}
                </option>
              ))}
            </select>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
