import { SubmissionWithPropositionSelections } from "~/models/submission.server";

export default function SubmissionTotals({
  submission,
}: {
  submission: SubmissionWithPropositionSelections;
}) {
  const correctSelections = submission.selections.filter(
    (selection) => selection.optionId === selection.option.proposition.answerId
  ).length;
  const totalSelections = submission.selections.filter(
    (selection) => !!selection.option.proposition.answerId
  ).length;

  return (
    <div className="flex w-full">
      <div className="stat">
        <div className="stat-title">Ranking</div>
        <div className="stat-value">{`T1`}</div>
        <div className="stat-desc">{`12/122`}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Correct</div>
        <div className="stat-value">{`${correctSelections}/${totalSelections}`}</div>
        <div className="stat-desc">
          {totalSelections === 0
            ? "-"
            : `${((correctSelections / totalSelections) * 100).toFixed(2)}%`}
        </div>
      </div>
    </div>
  );
}
