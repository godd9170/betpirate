import { Proposition, PropositionOption } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { useRef, useState } from "react";
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
  const buildInitialOptions = () => {
    const seeded = proposition.options.map((option) => ({
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
                Use the arrows to reorder
              </p>
            </div>
          </div>
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

        <updateFetcher.Form method="post" action={action} className="space-y-5">
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

          <button className="btn btn-secondary" type="submit">
            Update question
          </button>
        </updateFetcher.Form>
      </div>
    </div>
  );
}
