interface Selection {
  id: string;
  optionId: string;
  option: {
    id: string;
    proposition: {
      id: string;
      order: number | null;
      answerId: string | null;
    };
  };
}

interface Submission {
  sailor: {
    username: string | null;
  };
  selections: Selection[];
}

interface ProgressStats {
  correct: number;
  incorrect: number;
  pending: number;
  total: number;
}

function calculateStats(selections: Selection[]): ProgressStats {
  let correct = 0;
  let incorrect = 0;
  let pending = 0;

  selections.forEach((sel) => {
    const proposition = sel.option.proposition;
    if (!proposition.answerId) {
      pending++;
    } else if (sel.optionId === proposition.answerId) {
      correct++;
    } else {
      incorrect++;
    }
  });

  return {
    correct,
    incorrect,
    pending,
    total: selections.length,
  };
}

function ProgressBar({
  label,
  stats,
}: {
  label: string;
  stats: ProgressStats;
}) {
  const correctPercent = (stats.correct / stats.total) * 100;
  const incorrectPercent = (stats.incorrect / stats.total) * 100;
  const pendingPercent = (stats.pending / stats.total) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs opacity-70">
          <span className="text-success font-bold">{stats.correct}</span>
          {" / "}
          <span className="text-error font-bold">{stats.incorrect}</span>
          {" / "}
          <span className="text-warning font-bold">{stats.pending}</span>
        </span>
      </div>
      <div className="flex h-6 rounded-lg overflow-hidden bg-base-300">
        {stats.correct > 0 && (
          <div
            className="bg-success flex items-center justify-center text-success-content text-xs font-bold"
            style={{ width: `${correctPercent}%` }}
          >
            {stats.correct > 0 && stats.correct}
          </div>
        )}
        {stats.incorrect > 0 && (
          <div
            className="bg-error flex items-center justify-center text-error-content text-xs font-bold"
            style={{ width: `${incorrectPercent}%` }}
          >
            {stats.incorrect > 0 && stats.incorrect}
          </div>
        )}
        {stats.pending > 0 && (
          <div
            className="bg-warning flex items-center justify-center text-warning-content text-xs font-bold"
            style={{ width: `${pendingPercent}%` }}
          >
            {stats.pending > 0 && stats.pending}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubmissionProgressBars({
  viewedSubmission,
  activeSailorSubmission,
}: {
  viewedSubmission: Submission;
  activeSailorSubmission: Submission | null;
}) {
  const viewedStats = calculateStats(viewedSubmission.selections);
  const activeSailorStats = activeSailorSubmission
    ? calculateStats(activeSailorSubmission.selections)
    : null;

  return (
    <div className="card card-bordered bg-base-100 shadow-md mb-6">
      <div className="card-body p-4 space-y-3">
        <ProgressBar
          label={viewedSubmission.sailor.username || "Submission"}
          stats={viewedStats}
        />
        {activeSailorSubmission && activeSailorStats && (
          <ProgressBar label="You" stats={activeSailorStats} />
        )}
      </div>
    </div>
  );
}
