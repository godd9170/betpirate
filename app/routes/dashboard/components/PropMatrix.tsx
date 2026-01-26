import { useMemo } from "react";
import { IoTrophy, IoMedal, IoRibbon, IoCheckmarkCircle, IoCloseCircle, IoHelpCircle } from "react-icons/io5";
import Ordinal from "~/components/Ordinal";

function PropCell({ option, isWinning }: any) {
  const isAnswered = !!option.answerId;
  const isCorrect = option.answerId === option.id;

  let cellClass = "p-2 text-center text-xs font-medium transition-colors ";
  let icon = null;

  if (isAnswered) {
    if (isCorrect) {
      cellClass += isWinning
        ? "bg-success text-success-content shadow-inner"
        : "bg-success/70 text-success-content";
      icon = <IoCheckmarkCircle className="inline mr-1" size={14} />;
    } else {
      cellClass += "bg-error/60 text-error-content";
      icon = <IoCloseCircle className="inline mr-1 opacity-50" size={12} />;
    }
  } else {
    cellClass += "bg-base-100/50";
    icon = <IoHelpCircle className="inline mr-1 opacity-30" size={12} />;
  }

  return (
    <td className={cellClass}>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="truncate max-w-[80px]">{option.shortTitle}</span>
      </div>
    </td>
  );
}

function RankBadge({ ranking }: { ranking: number }) {
  if (ranking === 1) {
    return (
      <div className="badge badge-warning badge-lg gap-1 font-bold shadow-lg">
        <IoTrophy size={18} />
        1st
      </div>
    );
  } else if (ranking === 2) {
    return (
      <div className="badge badge-info badge-lg gap-1 font-semibold shadow-md">
        <IoMedal size={18} />
        2nd
      </div>
    );
  } else if (ranking === 3) {
    return (
      <div className="badge badge-accent badge-lg gap-1 font-semibold shadow-md">
        <IoRibbon size={18} />
        3rd
      </div>
    );
  } else {
    return (
      <div className="badge badge-ghost badge-lg font-medium">
        <Ordinal number={ranking} />
      </div>
    );
  }
}

export default function PropMatrix({
  sheet,
  leaders,
}: {
  sheet: any;
  leaders: any;
}) {
  const options = sheet.propositions.reduce((acc, proposition) => {
    proposition.options.forEach((option) => {
      acc[option.id] = {
        ...option,
        propositionId: proposition.id,
        answerId: proposition.answerId,
      };
    });
    return acc;
  }, {});

  const stats = useMemo(() => {
    const totalProps = sheet.propositions.length;
    const answeredProps = sheet.propositions.filter(p => p.answerId).length;
    const totalParticipants = leaders.length;
    const progress = totalProps > 0 ? (answeredProps / totalProps) * 100 : 0;
    const topScore = leaders.length > 0 ? leaders[0].correct : 0;

    return {
      totalProps,
      answeredProps,
      totalParticipants,
      progress,
      topScore
    };
  }, [sheet, leaders]);

  const topRanking = leaders.length > 0 ? leaders[0].ranking : 0;
  const topLeaders = leaders.filter(l => l.ranking === topRanking);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="card bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {sheet.title}
              </h1>
              {sheet.subtitle && (
                <p className="text-xl text-base-content/70 mt-2">{sheet.subtitle}</p>
              )}
            </div>

            <div className="stats shadow-lg">
              <div className="stat place-items-center">
                <div className="stat-title text-xs">Participants</div>
                <div className="stat-value text-3xl text-primary">{stats.totalParticipants}</div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title text-xs">Progress</div>
                <div className="stat-value text-3xl text-secondary">
                  {stats.answeredProps}/{stats.totalProps}
                </div>
                <div className="stat-desc">
                  <progress
                    className="progress progress-secondary w-20"
                    value={stats.progress}
                    max="100"
                  ></progress>
                </div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title text-xs">Top Score</div>
                <div className="stat-value text-3xl text-accent">{stats.topScore}</div>
                <div className="stat-desc">
                  {topLeaders.length > 1 ? `${topLeaders.length} tied` : "Leading"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Matrix */}
      <div className="card bg-base-100 shadow-2xl overflow-x-auto">
        <div className="card-body p-0">
          <table className="table table-sm table-pin-rows table-pin-cols">
            <thead>
              <tr className="bg-base-300">
                <th className="bg-base-300 z-20 text-center min-w-[140px]">
                  <div className="text-sm font-bold">Sailor</div>
                </th>
                <th className="bg-base-300 z-20 text-center min-w-[100px]">
                  <div className="text-sm font-bold">Rank</div>
                </th>
                {sheet.propositions.map((proposition, index) => (
                  <th
                    key={index}
                    className="bg-base-300 text-xs p-2 min-w-[120px]"
                    title={proposition.title}
                  >
                    <div className="flex items-center justify-center h-32">
                      <div
                        className="font-medium text-center"
                        style={{
                          transform: "rotate(-55deg)",
                          whiteSpace: "nowrap",
                          transformOrigin: "center center",
                        }}
                      >
                        {proposition.shortTitle || proposition.title}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="bg-base-300 text-center min-w-[80px]">
                  <div className="text-sm font-bold">Score</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader, rIndex) => {
                const isTopThree = leader.ranking <= 3;
                const rowClass = isTopThree
                  ? "bg-base-200/50 hover:bg-base-200"
                  : "hover:bg-base-100";

                return (
                  <tr key={rIndex} className={rowClass}>
                    <td className="font-semibold bg-base-200/80 z-10">
                      <div className="flex items-center gap-2 px-2">
                        {leader.ranking === 1 && (
                          <IoTrophy className="text-warning" size={20} />
                        )}
                        {leader.ranking === 2 && (
                          <IoMedal className="text-info" size={20} />
                        )}
                        {leader.ranking === 3 && (
                          <IoRibbon className="text-accent" size={20} />
                        )}
                        <span className="text-sm">{leader.username}</span>
                      </div>
                    </td>
                    <td className="text-center bg-base-200/80 z-10">
                      <RankBadge ranking={leader.ranking} />
                    </td>
                    {leader.selections.map((selection, aIndex) => (
                      <PropCell
                        key={aIndex}
                        option={options[selection.optionId]}
                        isWinning={leader.ranking === 1}
                      />
                    ))}
                    <td className="text-center font-bold bg-base-200/80">
                      <div className="badge badge-lg badge-primary font-bold">
                        {leader.correct}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with Legend */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body py-4">
          <div className="flex items-center justify-center gap-8 text-xs">
            <div className="flex items-center gap-2">
              <div className="badge badge-success gap-1">
                <IoCheckmarkCircle size={14} />
                Correct
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="badge badge-error badge-outline gap-1">
                <IoCloseCircle size={14} />
                Incorrect
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="badge badge-ghost gap-1">
                <IoHelpCircle size={14} />
                Not Yet Answered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
