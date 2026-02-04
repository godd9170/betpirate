import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageUploadField from "../ImageUploadField";

const MIN_OPTIONS = 2;

type OptionItem = {
  key: number;
};

export default function CreatePropositionCard({
  sheetId,
}: {
  sheetId: string;
}) {
  const fetcher = useFetcher<{ ok?: boolean }>();
  const formRef = useRef<HTMLFormElement>(null);
  const [resetKey, setResetKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const isSubmitting = fetcher.state !== "idle";
  const nextOptionKey = useRef(0);

  const buildInitialOptions = useCallback(() => {
    nextOptionKey.current = MIN_OPTIONS;
    return Array.from({ length: MIN_OPTIONS }, (_, index) => ({
      key: index,
    }));
  }, []);

  const [options, setOptions] = useState<OptionItem[]>(buildInitialOptions);

  const addOption = () => {
    setOptions((current) => [
      ...current,
      { key: nextOptionKey.current++ },
    ]);
  };

  const moveOption = (index: number, direction: "up" | "down") => {
    setOptions((current) => {
      const next = [...current];
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= next.length) return current;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  };

  const removeOption = (index: number) => {
    setOptions((current) => current.filter((_, idx) => idx !== index));
  };

  const optionLabel = (index: number) =>
    index < 26 ? String.fromCharCode(65 + index) : `${index + 1}`;

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.ok) return;
    formRef.current?.reset();
    setResetKey((value) => value + 1);
    setOptions(buildInitialOptions());
    setShowSuccess(true);
    const timeout = setTimeout(() => setShowSuccess(false), 2500);
    return () => clearTimeout(timeout);
  }, [fetcher.state, fetcher.data, buildInitialOptions]);
  return (
    <fetcher.Form
      method="post"
      action={`/sheets/${sheetId}/propositions`}
      ref={formRef}
    >
      <div className="card w-full border border-dashed border-primary/40 bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">Create new question</h3>
              <p className="text-sm text-base-content/70">
                Add the next prop to this sheet.
              </p>
            </div>
            <span
              className={`badge ${
                showSuccess
                  ? "badge-success"
                  : isSubmitting
                  ? "badge-warning"
                  : "badge-outline badge-primary"
              }`}
            >
              {showSuccess ? "Saved" : isSubmitting ? "Saving" : "New"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Title</span>
              </div>
              <input
                type="text"
                name="title"
                className="input input-bordered w-full"
                placeholder="Will the coin toss be heads?"
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
                placeholder="Coin toss"
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
              placeholder="Heads or tails"
            />
          </label>

          <ImageUploadField
            key={`question-${resetKey}`}
            sheetId={sheetId}
            name="imageUrl"
            label="Question image"
            helpText="Shown at the top of the question card."
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
            {options.map((option, index) => (
              <div key={option.key} className="card bg-base-200/70">
                <div className="card-body gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Option {optionLabel(index)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => moveOption(index, "up")}
                        disabled={index === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => moveOption(index, "down")}
                        disabled={index === options.length - 1}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost text-error"
                        onClick={() => removeOption(index)}
                        disabled={options.length <= MIN_OPTIONS}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Title</span>
                    </div>
                    <input
                      type="text"
                      name={`options[${index}].title`}
                      className="input input-bordered w-full"
                      placeholder="Heads"
                    />
                  </label>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Short title</span>
                    </div>
                    <input
                      type="text"
                      name={`options[${index}].shortTitle`}
                      className="input input-bordered w-full"
                      placeholder="Heads"
                    />
                  </label>
                  <ImageUploadField
                    key={`option-${option.key}-${resetKey}`}
                    sheetId={sheetId}
                    name={`options[${index}].imageUrl`}
                    label="Option image"
                    helpText="Displayed inside the option button."
                    variant="square"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create question"}
          </button>
        </div>
      </div>
    </fetcher.Form>
  );
}
