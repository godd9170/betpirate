import { useMemo } from "react";
import { IoTrophy, IoMedal, IoRibbon } from "react-icons/io5";

function AvatarImage({ profilePictureUrl, username }: { profilePictureUrl: string | null; username: string }) {
  if (profilePictureUrl) {
    return (
      <img
        src={profilePictureUrl}
        alt={username}
        className="w-7 h-7 rounded-full object-cover border-2 border-base-100 shadow-md"
      />
    );
  }

  // Fallback avatar with first letter
  const initial = username.charAt(0).toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm border-2 border-base-100 shadow-md">
      {initial}
    </div>
  );
}

export default function RaceView({
  sheet,
  leaders,
}: {
  sheet: any;
  leaders: any;
}) {
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

      {/* Race View */}
      <div className="card bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">Race View</h2>
          <div className="space-y-1.5">
            {leaders.map((leader: any, index: number) => {
              // Calculate bar width based on total questions, not max correct
              const barWidth = stats.totalProps > 0 ? (leader.correct / stats.totalProps) * 100 : 0;
              const isTopThree = leader.ranking <= 3;

              let barColor = "bg-gradient-to-r from-primary/60 to-primary/40";
              if (leader.ranking === 1) {
                barColor = "bg-gradient-to-r from-warning to-warning/70";
              } else if (leader.ranking === 2) {
                barColor = "bg-gradient-to-r from-info to-info/70";
              } else if (leader.ranking === 3) {
                barColor = "bg-gradient-to-r from-accent to-accent/70";
              }

              return (
                <div key={index} className="relative group">
                  <div className="flex items-center gap-2">
                    {/* Rank Badge */}
                    <div className="w-8 text-center flex-shrink-0">
                      {leader.ranking === 1 && <IoTrophy className="inline text-warning" size={16} />}
                      {leader.ranking === 2 && <IoMedal className="inline text-info" size={16} />}
                      {leader.ranking === 3 && <IoRibbon className="inline text-accent" size={16} />}
                      {leader.ranking > 3 && (
                        <span className="text-xs font-semibold text-base-content/70">
                          {leader.ranking}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <AvatarImage
                        profilePictureUrl={leader.profilePictureUrl}
                        username={leader.username}
                      />
                    </div>

                    {/* Username */}
                    <div className="w-32 flex-shrink-0">
                      <span className="font-semibold text-xs text-base-content truncate block">
                        {leader.username}
                      </span>
                    </div>

                    {/* Bar Container */}
                    <div className="flex-1 relative">
                      {/* Background bar */}
                      <div className="h-7 bg-base-200/50 rounded-md overflow-hidden relative">
                        {/* Progress bar */}
                        <div
                          className={`h-full ${barColor} transition-all duration-500 ease-out shadow-md`}
                          style={{ width: `${barWidth}%` }}
                        />

                        {/* Score overlay */}
                        <div className="absolute inset-0 flex items-center justify-end px-2 pointer-events-none">
                          <span className="badge badge-xs badge-primary font-bold">
                            {leader.correct}/{stats.totalProps}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
