import { Proposition } from "@prisma/client";

export default function ProgressBar({
  propositions,
  selections,
  onPropositionClick,
}: {
  propositions: Proposition[];
  selections: object;
  onPropositionClick: (index: number) => void;
}) {
  const propositionCount = propositions.length;
  const selectionCount = Object.keys(selections).length;

  return (
    <div className="sticky top-0 z-30 bg-base-100 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Your Progress</span>
          <span className="text-sm font-bold text-primary">
            {selectionCount} / {propositionCount}
          </span>
        </div> */}
        <div className="flex items-center gap-1 flex-wrap">
          {propositions.map((proposition, index) => {
            const isAnswered = selections.hasOwnProperty(proposition.id);
            return (
              <button
                key={proposition.id}
                type="button"
                onClick={() => onPropositionClick(index)}
                className={`w-6 h-6 rounded-full font-bold text-xs transition-all ${
                  isAnswered
                    ? "bg-primary text-primary-content shadow-md"
                    : "bg-base-200 text-base-content hover:bg-base-300"
                }`}
                title={`Question ${proposition.order}`}
              >
                {proposition.order}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
