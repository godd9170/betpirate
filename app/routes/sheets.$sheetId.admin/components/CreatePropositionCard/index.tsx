import { useFetcher } from "@remix-run/react";
import ImageUploadField from "../ImageUploadField";

export default function CreatePropositionCard({
  sheetId,
}: {
  sheetId: string;
}) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action={`/sheets/${sheetId}/propositions`}>
      <div className="card w-full border border-dashed border-primary/40 bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">Create new question</h3>
              <p className="text-sm text-base-content/70">
                Add the next prop to this sheet.
              </p>
            </div>
            <span className="badge badge-outline badge-primary">New</span>
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
                  sheetId={sheetId}
                  name="options[1].imageUrl"
                  label="Option image"
                  helpText="Displayed inside the option button."
                  variant="square"
                />
              </div>
            </div>
          </div>

          <button className="btn btn-primary" type="submit">
            Create question
          </button>
        </div>
      </div>
    </fetcher.Form>
  );
}
