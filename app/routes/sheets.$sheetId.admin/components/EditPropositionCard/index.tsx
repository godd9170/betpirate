import { Proposition, PropositionOption } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import ImageUploadField from "../ImageUploadField";

const MIN_OPTIONS = 2;

type OptionItem = {
  key: string;
  id?: string;
  data?: PropositionOption;
};

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
  const action = `/sheets/${sheetId}/propositions/${proposition.id}`;
  const orderAction = `/sheets/${sheetId}/propositions/order`;
  const nextOptionKey = useRef(0);
  const buildInitialOptions = (): OptionItem[] => {
    const seeded: OptionItem[] = proposition.options.map((option) => ({
      key: option.id,
      id: option.id,
      data: option,
    }));
    const results = [...seeded];
    while (results.length < MIN_OPTIONS) {
      results.push({ key: `new-${nextOptionKey.current++}` });
    }
    return results;
  };
  const [options, setOptions] = useState<OptionItem[]>(buildInitialOptions);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const collapseAfterSave = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isSubmitting = updateFetcher.state !== "idle";
  const hasError = Boolean(
    updateFetcher.data &&
      updateFetcher.data !== "success" &&
      typeof updateFetcher.data === "object"
  );
  const isSuccess = updateFetcher.data === "success";

  // Handle success state with timeout, and collapse if requested
  useEffect(() => {
    if (updateFetcher.state !== "idle" || !isSuccess) return;
    setShowSuccess(true);
    setIsDirty(false);
    if (collapseAfterSave.current) {
      collapseAfterSave.current = false;
      setIsExpanded(false);
    }
    const timeout = setTimeout(() => setShowSuccess(false), 2500);
    return () => clearTimeout(timeout);
  }, [updateFetcher.state, isSuccess]);

  const handleSaveAndCollapse = () => {
    if (!formRef.current) return;
    collapseAfterSave.current = true;
    formRef.current.requestSubmit();
  };

  const addOption = () => {
    setOptions((current) => [
      ...current,
      { key: `new-${nextOptionKey.current++}` },
    ]);
  };

  const moveOption = (optionIndex: number, direction: "up" | "down") => {
    setOptions((current) => {
      const next = [...current];
      const swapWith = direction === "up" ? optionIndex - 1 : optionIndex + 1;
      if (swapWith < 0 || swapWith >= next.length) return current;
      [next[optionIndex], next[swapWith]] = [
        next[swapWith],
        next[optionIndex],
      ];
      return next;
    });
  };

  const removeOption = (optionIndex: number) => {
    setOptions((current) => current.filter((_, idx) => idx !== optionIndex));
  };

  const optionLabel = (optionIndex: number) =>
    optionIndex < 26
      ? String.fromCharCode(65 + optionIndex)
      : `${optionIndex + 1}`;

  // Collapsed view
  if (!isExpanded) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="badge badge-primary badge-lg font-bold shrink-0">
                #{index + 1}
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
              <p className="font-semibold truncate">{proposition.title}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <orderFetcher.Form
                method="post"
                action={orderAction}
                className="flex items-center gap-1"
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
                  ↑
                </button>
                <button
                  type="submit"
                  name="direction"
                  value="down"
                  className="btn btn-sm btn-ghost"
                  disabled={index === totalCount - 1}
                >
                  ↓
                </button>
              </orderFetcher.Form>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setIsExpanded(true)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="badge badge-primary badge-lg font-bold">
              #{index + 1}
            </div>
            <div>
              <p className="text-sm font-semibold">Question</p>
              <p className="text-xs text-base-content/60">
                Edit the question details below
              </p>
            </div>
            {showSuccess && (
              <span className="badge badge-success">Saved</span>
            )}
            {hasError && <span className="badge badge-error">Error</span>}
            {isSubmitting && (
              <span className="badge badge-warning">Saving...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
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
            {isDirty ? (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleSaveAndCollapse}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save & Collapse"}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </button>
            )}
          </div>
        </div>

        {hasError && (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Failed to save</span>
              <pre className="text-xs bg-error/20 p-2 rounded overflow-x-auto max-w-full">
                {JSON.stringify(
                  (updateFetcher.data as { error?: unknown })?.error,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        <updateFetcher.Form
          ref={formRef}
          method="post"
          action={action}
          className="space-y-5"
          onChange={() => setIsDirty(true)}
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

          <div className="flex items-center justify-between">
            <div className="divider flex-1">Options</div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={addOption}
            >
              + Add option
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {options.map((option, optionIndex) => (
              <div key={option.key} className="card bg-base-200/70">
                <div className="card-body gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Option {optionLabel(optionIndex)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => moveOption(optionIndex, "up")}
                        disabled={optionIndex === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => moveOption(optionIndex, "down")}
                        disabled={optionIndex === options.length - 1}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost text-error"
                        onClick={() => removeOption(optionIndex)}
                        disabled={options.length <= MIN_OPTIONS}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <input
                    type="hidden"
                    name={`options[${optionIndex}].id`}
                    value={option.id || ""}
                  />
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Title</span>
                    </div>
                    <input
                      type="text"
                      name={`options[${optionIndex}].title`}
                      className="input input-bordered w-full"
                      defaultValue={option.data?.title || undefined}
                      placeholder="Over"
                    />
                  </label>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Short title</span>
                    </div>
                    <input
                      type="text"
                      name={`options[${optionIndex}].shortTitle`}
                      className="input input-bordered w-full"
                      defaultValue={option.data?.shortTitle || undefined}
                      placeholder="Over"
                    />
                  </label>
                  <ImageUploadField
                    sheetId={sheetId}
                    name={`options[${optionIndex}].imageUrl`}
                    label="Option image"
                    helpText="Displayed inside the option button."
                    value={option.data?.imageUrl}
                    variant="square"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            className={`btn w-full ${hasError ? "btn-error" : "btn-secondary"}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : showSuccess ? (
              "Saved!"
            ) : hasError ? (
              "Retry Update"
            ) : (
              "Save"
            )}
          </button>
        </updateFetcher.Form>
      </div>
    </div>
  );
}
