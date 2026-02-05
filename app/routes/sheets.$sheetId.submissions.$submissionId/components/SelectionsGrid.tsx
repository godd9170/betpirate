import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoCheckmark, IoClose } from "react-icons/io5";
import type { SubmissionWithPropositionSelections } from "~/models/submission.server";
import type { SheetWithPropositions } from "~/models/sheet.server";

type SaveState = "idle" | "saving" | "saved" | "error";

const toSelectionMap = (
  selections: SubmissionWithPropositionSelections["selections"]
) =>
  Object.fromEntries(
    selections.map((selection) => [
      selection.option.proposition.id,
      selection.optionId,
    ])
  );

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
  const initialMap = useMemo(
    () => toSelectionMap(initialSelections),
    [initialSelections]
  );
  const [baseSelections, setBaseSelections] =
    useState<Record<string, string>>(initialMap);
  const [selections, setSelections] =
    useState<Record<string, string>>(initialMap);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveRequestId = useRef(0);
  const handledRequestId = useRef(0);
  const pendingSnapshotRef = useRef<Record<string, string> | null>(null);
  const prevInitialMapRef = useRef(initialMap);

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

  const pendingCount = useMemo(() => {
    let count = 0;
    for (const proposition of sheet.propositions) {
      const current = selections[proposition.id];
      const base = baseSelections[proposition.id];
      if (current && current !== base) {
        count += 1;
      }
    }
    return count;
  }, [selections, sheet.propositions, baseSelections]);

  const hasPendingChanges = pendingCount > 0;
  const showSaveBanner = canEdit && (hasPendingChanges || saveState !== "idle");
  const isSaving = saveState === "saving";

  // Sync with server data only when initialMap actually changes (e.g., navigation, revalidation)
  useEffect(() => {
    if (initialMap === prevInitialMapRef.current) return;
    prevInitialMapRef.current = initialMap;

    if (saveState === "saving" || hasPendingChanges) return;
    setBaseSelections(initialMap);
    setSelections(initialMap);
  }, [initialMap, hasPendingChanges, saveState]);

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (saveRequestId.current === handledRequestId.current) return;

    handledRequestId.current = saveRequestId.current;
    if (fetcher.data?.ok) {
      setBaseSelections(pendingSnapshotRef.current ?? { ...selections });
      pendingSnapshotRef.current = null;
      setSaveState("saved");
    } else {
      setSaveState("error");
    }
  }, [fetcher.data, fetcher.state, selections]);

  useEffect(() => {
    if (saveState !== "saved") return;
    const timeout = setTimeout(() => {
      setSaveState("idle");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [saveState]);

  const handleOptionSelect = (propositionId: string, optionId: string) => {
    if (!canEdit || isSaving) return;

    setSelections((prev) => ({
      ...prev,
      [propositionId]: optionId,
    }));
    if (saveState !== "idle") {
      setSaveState("idle");
    }
  };

  const handleSave = () => {
    if (!canEdit || isSaving || !hasPendingChanges) return;

    const optionIds: string[] = [];
    for (const proposition of sheet.propositions) {
      const current = selections[proposition.id];
      const base = baseSelections[proposition.id];
      if (current && current !== base) {
        optionIds.push(current);
      }
    }

    if (optionIds.length === 0) return;

    saveRequestId.current += 1;
    pendingSnapshotRef.current = { ...selections };
    setSaveState("saving");

    const formData = new FormData();
    formData.append("intent", "selections");
    optionIds.forEach((optionId) => formData.append("optionId", optionId));
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div
      className={`mb-6 ${
        showSaveBanner ? "pb-[calc(5rem+env(safe-area-inset-bottom))]" : ""
      }`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
                <p className="opacity-70 text-xs mt-2">
                  {proposition.subtitle}
                </p>
              )}

              {canEdit ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {proposition.options.map((option) => {
                    const isSelected =
                      selections[proposition.id] === option.id;
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
                        disabled={isSaving}
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
                  {isCorrect === null && (
                    <span className="opacity-60">Pending</span>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {showSaveBanner && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300 bg-base-100 shadow-2xl"
          aria-live="polite"
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">
                {saveState === "saving"
                  ? "Saving your picks..."
                  : saveState === "saved"
                  ? "Picks saved."
                  : saveState === "error"
                  ? "Save failed."
                  : "Unsaved changes"}
              </div>
              <div className="text-xs opacity-70">
                {saveState === "saving"
                  ? "Hang tight while we update your picks."
                  : saveState === "saved"
                  ? "All changes are now saved."
                  : saveState === "error"
                  ? "Tap save to try again."
                  : `${pendingCount} pick${pendingCount === 1 ? "" : "s"} changed`}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm min-w-[110px]"
              onClick={handleSave}
              disabled={!hasPendingChanges || isSaving}
            >
              {saveState === "saving" ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving
                </>
              ) : saveState === "error" ? (
                "Retry save"
              ) : saveState === "saved" ? (
                "Saved"
              ) : (
                "Save picks"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
