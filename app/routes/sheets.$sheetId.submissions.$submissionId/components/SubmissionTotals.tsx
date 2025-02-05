import { SubmissionWithPropositionSelections } from "~/models/submission.server";

export default function SubmissionTotals({
  submission,
}: {
  submission: SubmissionWithPropositionSelections;
}) {
  const correctSelections = submission.selections.filter((selection) => {
    return selection.optionId === selection.option.proposition.answerId;
  }, 0).length;
  const totalSelections = submission.selections.length;

  return (
    <div className="flex">
      <div className="stat">
        <div className="stat-title">Correct Submissions</div>
        <div className="stat-value">{`${correctSelections}/${totalSelections}`}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Picks Remaining</div>
        <div className="stat-value">{`${correctSelections}/${totalSelections}`}</div>
      </div>
    </div>
  );
}
