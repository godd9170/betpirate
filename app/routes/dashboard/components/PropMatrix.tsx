import { IoTrophy, IoMedal, IoRibbon } from "react-icons/io5";
import Ordinal from "~/components/Ordinal";

function AvatarImage({ profilePictureUrl, username }: { profilePictureUrl: string | null; username: string }) {
  if (profilePictureUrl) {
    return (
      <img
        src={profilePictureUrl}
        alt={username}
        className="w-9 h-9 rounded-full object-cover border-2 border-base-100 shadow-md"
      />
    );
  }

  // Fallback avatar with first letter
  const initial = username.charAt(0).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-base border-2 border-base-100 shadow-md">
      {initial}
    </div>
  );
}

function PropCell({ option, isWinning }: any) {
  const isAnswered = !!option.answerId;
  const isCorrect = option.answerId === option.id;

  let cellClass = "p-0.5 text-center text-[9px] font-medium transition-colors ";

  if (isAnswered) {
    if (isCorrect) {
      cellClass += isWinning
        ? "bg-success text-success-content shadow-inner font-semibold"
        : "bg-success/80 text-success-content";
    } else {
      cellClass += "bg-error/80 text-error-content";
    }
  } else {
    cellClass += "bg-base-200/60 text-base-content/50";
  }

  return (
    <td className={cellClass}>
      <span className="truncate block">{option.shortTitle}</span>
    </td>
  );
}

function RankBadge({ ranking }: { ranking: number }) {
  if (ranking === 1) {
    return (
      <div className="badge badge-warning badge-xs gap-0.5 font-bold shadow-md">
        <IoTrophy size={10} />
        1st
      </div>
    );
  } else if (ranking === 2) {
    return (
      <div className="badge badge-info badge-xs gap-0.5 font-semibold shadow-sm">
        <IoMedal size={10} />
        2nd
      </div>
    );
  } else if (ranking === 3) {
    return (
      <div className="badge badge-accent badge-xs gap-0.5 font-semibold shadow-sm">
        <IoRibbon size={10} />
        3rd
      </div>
    );
  } else {
    return (
      <div className="badge badge-ghost badge-xs font-medium text-[9px]">
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

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      <div className="card-body p-0 max-h-[calc(100vh-200px)] overflow-auto">
        <table className="table table-xs table-pin-rows table-pin-cols">
          <thead>
            <tr className="bg-base-300">
              <th className="bg-base-300 z-20 text-center w-[130px] sticky left-0">
                <div className="text-xs font-bold">Sailor</div>
              </th>
              <th className="bg-base-300 z-20 text-center w-[60px] sticky left-[130px]">
                <div className="text-xs font-bold">Rank</div>
              </th>
              {sheet.propositions.map((proposition: any, index: number) => (
                <th
                  key={index}
                  className="bg-base-300 text-xs p-0.5 w-[55px]"
                  title={proposition.title}
                >
                  <div className="flex items-center justify-center h-20">
                    <div
                      className="font-medium text-center text-[9px]"
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
              <th className="bg-base-300 text-center w-[50px] sticky right-0">
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
                    <div className="flex items-center gap-1 px-1 py-0.5">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <AvatarImage
                          profilePictureUrl={leader.profilePictureUrl}
                          username={leader.username}
                        />
                      </div>
                      {/* Username and Nickname */}
                      <div className="flex flex-col gap-0 min-w-0 flex-1">
                        <div className="flex items-center gap-0.5">
                          {leader.ranking === 1 && (
                            <IoTrophy className="text-warning flex-shrink-0" size={10} />
                          )}
                          {leader.ranking === 2 && (
                            <IoMedal className="text-info flex-shrink-0" size={10} />
                          )}
                          {leader.ranking === 3 && (
                            <IoRibbon className="text-accent flex-shrink-0" size={10} />
                          )}
                          <span className="text-[10px] truncate">{leader.username}</span>
                        </div>
                        {leader.nickname && (
                          <span className="text-[8px] opacity-60 truncate">
                            {leader.nickname}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-center bg-base-200/80 z-10 sticky left-[130px]">
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
                      <td key={aIndex} className="p-0.5 text-center bg-base-100/50">
                        <span className="text-[9px] opacity-30">—</span>
                      </td>
                    );
                  })}
                  <td className="text-center font-bold bg-base-200/80 sticky right-0 p-0.5">
                    <div className="badge badge-xs badge-primary font-bold">
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
  );
}
