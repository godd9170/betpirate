import { Proposition, PropositionOption } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import ImageUploadField from "../ImageUploadField";

export default function EditPropositionCard({
  sheetId,
  proposition,
  index,
  totalCount,
}: {
  sheetId: string;
  proposition: Proposition & { options: PropositionOption[] };
  index: number;
  totalCount: number;
}) {
  const updateFetcher = useFetcher({
    key: `${proposition.id}-update`,
  });
  const orderFetcher = useFetcher({
    key: `${proposition.id}-order`,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const action = `/sheets/${sheetId}/propositions/${proposition.id}`;
  const orderAction = `/sheets/${sheetId}/propositions/order`;
  const submission = updateFetcher.data as
    | {
        status?: "error" | "success";
        error?: Record<string, string[] | string | null> | null;
      }
    | undefined;

  const updateErrors = useMemo(() => {
    if (!submission || typeof submission !== "object" || !submission.error) {
      return [];
    }
    const errors = Object.values(submission.error)
      .flatMap((value) => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
      })
      .filter((value) => value && value.trim());
    return Array.from(new Set(errors));
  }, [submission]);
  const hasErrors =
    !!submission &&
    typeof submission === "object" &&
    "error" in submission &&
    !!submission.error;

  useEffect(() => {
    if (hasErrors) setIsExpanded(true);
  }, [hasErrors]);

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="badge badge-primary badge-lg font-bold">
              #{index + 1}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {isExpanded
                  ? "Question"
                  : proposition.title || "Untitled question"}
              </p>
              <p className="text-xs text-base-content/60">
                Use the arrows to reorder
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setIsExpanded((value) => !value)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
            <orderFetcher.Form
              method="post"
              action={orderAction}
              className="flex items-center gap-2"
            >
              <input
                type="hidden"
                name="propositionId"
                value={proposition.id}
              />
              <button
                type="submit"
                name="direction"
                value="up"
                className="btn btn-sm btn-ghost"
                disabled={index === 0}
              >
                ↑ Move up
              </button>
              <button
                type="submit"
                name="direction"
                value="down"
                className="btn btn-sm btn-ghost"
                disabled={index === totalCount - 1}
              >
                ↓ Move down
              </button>
            </orderFetcher.Form>
          </div>
        </div>

        {hasErrors && (
          <div className="alert alert-error text-sm">
            <div className="space-y-1">
              <p className="font-semibold">Unable to save question.</p>
              {updateErrors.length > 0 ? (
                <ul className="list-disc pl-5">
                  {updateErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : (
                <p>Please review the fields and try again.</p>
              )}
            </div>
          </div>
        )}

        {!isExpanded && (
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 bg-base-200/40 p-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="h-16 w-16 rounded">
                  {proposition.imageUrl ? (
                    <img
                      src={proposition.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded bg-base-200 text-xs text-base-content/60">
                      No image
                    </div>
                  )}
                </div>
              </div>
              <div>
                {proposition.shortTitle ? (
                  <p className="text-xs text-base-content/60">
                    {proposition.shortTitle}
                  </p>
                ) : proposition.subtitle ? (
                  <p className="text-xs text-base-content/60">
                    {proposition.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <updateFetcher.Form
          method="post"
          action={action}
          className={isExpanded ? "space-y-5" : "hidden"}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Title</span>
              </div>
              <input
                type="text"
                name="title"
                className="input input-bordered w-full"
                defaultValue={proposition.title}
                placeholder="National anthem length?"
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Short title</span>
              </div>
              <input
                type="text"
                name="shortTitle"
                className="input input-bordered w-full"
                defaultValue={proposition.shortTitle || undefined}
                placeholder="Anthem length"
              />
            </label>
          </div>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Subtitle</span>
            </div>
            <input
              type="text"
              name="subtitle"
              className="input input-bordered w-full"
              defaultValue={proposition.subtitle || undefined}
              placeholder="Over/under 2 minutes"
            />
          </label>

          <ImageUploadField
            sheetId={sheetId}
            name="imageUrl"
            label="Question image"
            helpText="Shown at the top of the question card."
            value={proposition.imageUrl}
            variant="wide"
          />

          <div className="divider">Options</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card bg-base-200/70">
              <div className="card-body gap-3 p-4">
                <input
                  type="hidden"
                  name="options[0].id"
                  value={proposition.options[0]?.id || ""}
                />
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Option A</span>
                  </div>
                  <input
                    type="text"
                    name="options[0].title"
                    className="input input-bordered w-full"
                    defaultValue={proposition.options[0]?.title || undefined}
                    placeholder="Over"
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Short title</span>
                  </div>
                  <input
                    type="text"
                    name="options[0].shortTitle"
                    className="input input-bordered w-full"
                    defaultValue={
                      proposition.options[0]?.shortTitle || undefined
                    }
                    placeholder="Over"
                  />
                </label>
                <ImageUploadField
                  sheetId={sheetId}
                  name="options[0].imageUrl"
                  label="Option image"
                  helpText="Displayed inside the option button."
                  value={proposition.options[0]?.imageUrl}
                  variant="square"
                />
              </div>
            </div>
            <div className="card bg-base-200/70">
              <div className="card-body gap-3 p-4">
                <input
                  type="hidden"
                  name="options[1].id"
                  value={proposition.options[1]?.id || ""}
                />
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Option B</span>
                  </div>
                  <input
                    type="text"
                    name="options[1].title"
                    className="input input-bordered w-full"
                    defaultValue={proposition.options[1]?.title || undefined}
                    placeholder="Under"
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Short title</span>
                  </div>
                  <input
                    type="text"
                    name="options[1].shortTitle"
                    className="input input-bordered w-full"
                    defaultValue={
                      proposition.options[1]?.shortTitle || undefined
                    }
                    placeholder="Under"
                  />
                </label>
                <ImageUploadField
                  sheetId={sheetId}
                  name="options[1].imageUrl"
                  label="Option image"
                  helpText="Displayed inside the option button."
                  value={proposition.options[1]?.imageUrl}
                  variant="square"
                />
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" type="submit">
            Update question
          </button>
        </updateFetcher.Form>
      </div>
    </div>
  );
}
