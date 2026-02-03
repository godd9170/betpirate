import SubmissionTotals from "./SubmissionTotals";

export default function TotalsCard({
  show,
  sheetSummary,
  submissionRank,
}: {
  show: boolean;
  sheetSummary: { totalPropositions: number; answeredPropositions: number };
  submissionRank: { correctCount: number; tieCount: number; rank: number };
}) {
  if (!show) return null;

  return (
    <div className="card card-bordered bg-base-100 shadow-md mb-6">
      <div className="card-body">
        <SubmissionTotals
          sheetSummary={sheetSummary}
          submissionRank={submissionRank}
        />
      </div>
    </div>
  );
}
