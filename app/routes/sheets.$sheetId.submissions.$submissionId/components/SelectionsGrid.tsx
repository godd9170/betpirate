import { useFetcher } from "@remix-run/react";
import { useMemo, useState } from "react";
import { IoCheckmark, IoClose } from "react-icons/io5";
import type { SubmissionWithPropositionSelections } from "~/models/submission.server";
import type { SheetWithPropositions } from "~/models/sheet.server";

export default function SelectionsGrid({
  sheet,
  selections: initialSelections,
  canEdit,
}: {
  sheet: SheetWithPropositions;
  selections: SubmissionWithPropositionSelections["selections"];
  canEdit: boolean;
}) {
  const fetcher = useFetcher();
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialSelections.map((selection) => [
        selection.option.proposition.id,
        selection.optionId,
      ])
    )
  );

  const selectionDetails = useMemo(() => {
    return sheet.propositions.map((proposition) => {
      const selectedOptionId = selections[proposition.id];
      const selectedOption = proposition.options.find(
        (option) => option.id === selectedOptionId
      );
      const isCorrect =
        sheet.status === "CLOSED" && proposition.answerId
          ? selectedOptionId === proposition.answerId
          : null;
      return {
        proposition,
        selectedOption,
        isCorrect,
      };
    });
  }, [sheet.propositions, selections, sheet.status]);

  const handleOptionSelect = (propositionId: string, optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [propositionId]: optionId,
    }));

    if (!canEdit) return;

    const formData = new FormData();
    formData.append("intent", "option");
    formData.append("optionId", optionId);
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {selectionDetails.map(({ proposition, selectedOption, isCorrect }) => (
        <div
          key={proposition.id}
          className="card card-bordered bg-base-100 shadow-md"
        >
          <div className="card-body p-4">
            <div className="text-xs font-semibold uppercase opacity-60">
              {proposition.shortTitle || proposition.title}
            </div>
            <div className="text-sm font-bold mt-1">
              {selectedOption?.shortTitle ||
                selectedOption?.title ||
                "No pick"}
            </div>

            {proposition.subtitle && (
              <p className="opacity-70 text-xs mt-2">{proposition.subtitle}</p>
            )}

            {canEdit ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {proposition.options.map((option) => {
                  const isSelected = selections[proposition.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`btn btn-xs ${
                        isSelected ? "btn-primary font-bold" : "btn-outline"
                      }`}
                      onClick={() =>
                        handleOptionSelect(proposition.id, option.id)
                      }
                    >
                      {option.shortTitle || option.title}
                    </button>
                  );
                })}
              </div>
            ) : sheet.status === "CLOSED" ? (
              <div className="mt-3 text-xs font-semibold">
                {isCorrect === true && (
                  <span className="text-success inline-flex items-center gap-1">
                    <IoCheckmark />
                    Correct
                  </span>
                )}
                {isCorrect === false && (
                  <span className="text-error inline-flex items-center gap-1">
                    <IoClose />
                    Incorrect
                  </span>
                )}
                {isCorrect === null && <span className="opacity-60">Pending</span>}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
