import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import ImageUploadField from "../ImageUploadField";

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

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.ok) return;
    formRef.current?.reset();
    setResetKey((value) => value + 1);
    setShowSuccess(true);
    const timeout = setTimeout(() => setShowSuccess(false), 2500);
    return () => clearTimeout(timeout);
  }, [fetcher.state, fetcher.data]);
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

          <div className="divider">Options</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card bg-base-200/70">
              <div className="card-body gap-3 p-4">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Option A</span>
                  </div>
                  <input
                    type="text"
                    name="options[0].title"
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
                    name="options[0].shortTitle"
                    className="input input-bordered w-full"
                    placeholder="Heads"
                  />
                </label>
                <ImageUploadField
                  key={`option-a-${resetKey}`}
                  sheetId={sheetId}
                  name="options[0].imageUrl"
                  label="Option image"
                  helpText="Displayed inside the option button."
                  variant="square"
                />
              </div>
            </div>
            <div className="card bg-base-200/70">
              <div className="card-body gap-3 p-4">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Option B</span>
                  </div>
                  <input
                    type="text"
                    name="options[1].title"
                    className="input input-bordered w-full"
                    placeholder="Tails"
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
                    placeholder="Tails"
                  />
                </label>
                <ImageUploadField
                  key={`option-b-${resetKey}`}
                  sheetId={sheetId}
                  name="options[1].imageUrl"
                  label="Option image"
                  helpText="Displayed inside the option button."
                  variant="square"
                />
              </div>
            </div>
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
