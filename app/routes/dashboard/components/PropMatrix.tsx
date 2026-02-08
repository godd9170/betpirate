import { useMemo } from "react";
import { IoTrophy, IoMedal, IoRibbon, IoCheckmarkCircle, IoCloseCircle, IoHelpCircle } from "react-icons/io5";
import Ordinal from "~/components/Ordinal";

function PropCell({ option, isWinning }: any) {
  const isAnswered = !!option.answerId;
  const isCorrect = option.answerId === option.id;

  let cellClass = "p-1 text-center text-[10px] font-medium transition-colors ";
  let icon = null;

  if (isAnswered) {
    if (isCorrect) {
      cellClass += isWinning
        ? "bg-success text-success-content shadow-inner"
        : "bg-success/70 text-success-content";
      icon = <IoCheckmarkCircle className="inline mr-0.5" size={12} />;
    } else {
      cellClass += "bg-error/60 text-error-content";
      icon = <IoCloseCircle className="inline mr-0.5 opacity-50" size={10} />;
    }
  } else {
    cellClass += "bg-base-100/50";
    icon = <IoHelpCircle className="inline mr-0.5 opacity-30" size={10} />;
  }

  return (
    <td className={cellClass}>
      <div className="flex items-center justify-center gap-0.5">
        {icon}
        <span className="truncate max-w-[70px]">{option.shortTitle}</span>
      </div>
    </td>
  );
}

function RankBadge({ ranking }: { ranking: number }) {
  if (ranking === 1) {
    return (
      <div className="badge badge-warning badge-sm gap-0.5 font-bold shadow-md">
        <IoTrophy size={14} />
        1st
      </div>
    );
  } else if (ranking === 2) {
    return (
      <div className="badge badge-info badge-sm gap-0.5 font-semibold shadow-sm">
        <IoMedal size={14} />
        2nd
      </div>
    );
  } else if (ranking === 3) {
    return (
      <div className="badge badge-accent badge-sm gap-0.5 font-semibold shadow-sm">
        <IoRibbon size={14} />
        3rd
      </div>
    );
  } else {
    return (
      <div className="badge badge-ghost badge-sm font-medium">
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
  const options = sheet.propositions.reduce((acc: any, proposition: any) => {
    proposition.options.forEach((option: any) => {
      acc[option.id] = {
        ...option,
        propositionId: proposition.id,
        answerId: proposition.answerId,
      };
    });
    return acc;
  }, {} as Record<string, any>);

  const stats = useMemo(() => {
    const totalProps = sheet.propositions.length;
    const answeredProps = sheet.propositions.filter((p: any) => p.answerId).length;
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
  const topLeaders = leaders.filter((l: any) => l.ranking === topRanking);

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
      <div className="card bg-base-100 shadow-2xl overflow-hidden">
        <div className="card-body p-0 max-h-[calc(100vh-300px)] overflow-auto">
          <table className="table table-xs table-pin-rows table-pin-cols">
            <thead>
              <tr className="bg-base-300">
                <th className="bg-base-300 z-20 text-center min-w-[120px] sticky left-0">
                  <div className="text-xs font-bold">Sailor</div>
                </th>
                <th className="bg-base-300 z-20 text-center min-w-[80px] sticky left-[120px]">
                  <div className="text-xs font-bold">Rank</div>
                </th>
                {sheet.propositions.map((proposition: any, index: number) => (
                  <th
                    key={index}
                    className="bg-base-300 text-xs p-1 min-w-[100px]"
                    title={proposition.title}
                  >
                    <div className="flex items-center justify-center h-24">
                      <div
                        className="font-medium text-center text-[10px]"
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
                <th className="bg-base-300 text-center min-w-[70px] sticky right-0">
                  <div className="text-xs font-bold">Score</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader: any, rIndex: number) => {
                const isTopThree = leader.ranking <= 3;
                const rowClass = isTopThree
                  ? "bg-base-200/50 hover:bg-base-200"
                  : "hover:bg-base-100";

                return (
                  <tr key={rIndex} className={rowClass}>
                    <td className="font-semibold bg-base-200/80 z-10 sticky left-0">
                      <div className="flex items-center gap-1 px-2">
                        {leader.ranking === 1 && (
                          <IoTrophy className="text-warning" size={16} />
                        )}
                        {leader.ranking === 2 && (
                          <IoMedal className="text-info" size={16} />
                        )}
                        {leader.ranking === 3 && (
                          <IoRibbon className="text-accent" size={16} />
                        )}
                        <span className="text-xs">{leader.username}</span>
                      </div>
                    </td>
                    <td className="text-center bg-base-200/80 z-10 sticky left-[120px]">
                      <RankBadge ranking={leader.ranking} />
                    </td>
                    {sheet.propositions.map((proposition: any, aIndex: number) => {
                      // Find the selection for this proposition
                      const selection = leader.selections.find((sel: any) =>
                        options[sel.optionId]?.propositionId === proposition.id
                      );
                      const option = selection ? options[selection.optionId] : null;

                      return option ? (
                        <PropCell
                          key={aIndex}
                          option={option}
                          isWinning={leader.ranking === 1}
                        />
                      ) : (
                        <td key={aIndex} className="p-1 text-center bg-base-100/50">
                          <span className="text-[10px] opacity-30">—</span>
                        </td>
                      );
                    })}
                    <td className="text-center font-bold bg-base-200/80 sticky right-0">
                      <div className="badge badge-sm badge-primary font-bold">
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
