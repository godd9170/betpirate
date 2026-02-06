import { IoCheckmark, IoClose } from "react-icons/io5";

type SelectionStatus = "pending" | "correct" | "incorrect";

interface PropositionOption {
  id: string;
  title: string;
  shortTitle: string | null;
  order: number | null;
  propositionId: string;
}

interface Proposition {
  id: string;
  title: string;
  shortTitle: string | null;
  subtitle: string | null;
  order: number | null;
  answerId: string | null;
  options: PropositionOption[];
}

interface Sheet {
  propositions: Proposition[];
}

interface Selection {
  id: string;
  optionId: string;
  option: {
    proposition: Proposition;
  };
}

interface Submission {
  sailor: {
    username: string | null;
  };
  selections: Selection[];
}

export default function SubmissionComparison({
  sheet,
  viewedSubmission,
  activeSailorSubmission,
}: {
  sheet: Sheet;
  viewedSubmission: Submission;
  activeSailorSubmission: Submission | null;
}) {
  // Create maps for quick lookup
  const viewedSelectionMap = new Map(
    viewedSubmission.selections.map((sel) => [
      sel.option.proposition.id,
      sel.optionId,
    ]),
  );

  const activeSailorSelectionMap = activeSailorSubmission
    ? new Map(
        activeSailorSubmission.selections.map((sel) => [
          sel.option.proposition.id,
          sel.optionId,
        ]),
      )
    : null;

  const getStatus = (
    propositionId: string,
    answerId: string | null,
    selectedOptionId: string | undefined,
  ): SelectionStatus => {
    if (!answerId || !selectedOptionId) return "pending";
    return selectedOptionId === answerId ? "correct" : "incorrect";
  };

  const renderOption = (
    proposition: Proposition,
    selectedOptionId: string | undefined,
  ) => {
    const selectedOption = proposition.options.find(
      (opt: PropositionOption) => opt.id === selectedOptionId,
    );
    const status = getStatus(
      proposition.id,
      proposition.answerId,
      selectedOptionId,
    );

    if (!selectedOption) {
      return <span className="text-base-content/50 italic">No pick</span>;
    }

    const statusIcon =
      status === "correct" ? (
        <IoCheckmark className="text-success" />
      ) : status === "incorrect" ? (
        <IoClose className="text-error" />
      ) : null;

    const statusColor =
      status === "correct"
        ? "text-success font-bold"
        : status === "incorrect"
        ? "text-error"
        : "text-base-content";

    return (
      <div className="flex items-center gap-2">
        {statusIcon}
        <span className={statusColor}>
          {selectedOption.shortTitle || selectedOption.title}
        </span>
      </div>
    );
  };

  const sortedPropositions = [...sheet.propositions].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {sortedPropositions.map((proposition) => {
          const viewedOptionId = viewedSelectionMap.get(proposition.id);
          const activeSailorOptionId = activeSailorSelectionMap?.get(
            proposition.id,
          );
          return (
            <div
              key={proposition.id}
              className="card card-bordered bg-base-100 shadow-md"
            >
              <div className="card-body p-4">
                <div className="text-xs font-semibold uppercase opacity-60 mb-2">
                  {proposition.shortTitle || proposition.title}
                </div>

                {proposition.subtitle && (
                  <p className="opacity-70 text-xs mb-3">
                    {proposition.subtitle}
                  </p>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold opacity-60 mb-1">
                      {viewedSubmission.sailor.username}
                    </div>
                    <div className="text-sm">
                      {renderOption(proposition, viewedOptionId)}
                    </div>
                  </div>

                  {activeSailorSubmission && (
                    <div>
                      <div className="text-xs font-semibold opacity-60 mb-1">
                        You
                      </div>
                      <div className="text-sm">
                        {renderOption(proposition, activeSailorOptionId)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
