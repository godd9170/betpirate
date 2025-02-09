import Ordinal from "~/components/Ordinal";

export default function SubmissionTotals({
  sheetSummary,
  submissionRank,
}: {
  sheetSummary: { totalPropositions: number; answeredPropositions: number };
  submissionRank: { correctCount: number; tieCount: number; rank: number };
}) {
  const accuracyPercentage =
    sheetSummary.answeredPropositions === 0
      ? "-"
      : (
          (submissionRank?.correctCount / sheetSummary?.answeredPropositions) *
          100
        ).toFixed(2);

  return (
    <div className="flex w-full">
      <div className="stat text-center">
        <div className="stat-title">Rank</div>
        <div className="stat-value">
          {submissionRank?.tieCount > 1 ? "T" : ""}
          <Ordinal number={submissionRank?.rank} />
        </div>
        <div className="stat-desc">
          {submissionRank.tieCount
            ? `with ${submissionRank.tieCount} others`
            : ""}
        </div>
      </div>
      <div className="stat text-center">
        <div className="stat-title">Correct</div>
        <div className="stat-value">{`${submissionRank.correctCount}/${sheetSummary.answeredPropositions}`}</div>
        <div className="stat-desc">{`${accuracyPercentage}% Accuracy`}</div>
      </div>
      <div className="stat text-center">
        <div className="stat-title">Remaining</div>
        <div className="stat-value">
          {sheetSummary.totalPropositions - sheetSummary.answeredPropositions}
        </div>
        <div className="stat-desc">{`${sheetSummary.totalPropositions} Total`}</div>
      </div>
    </div>
  );
}
