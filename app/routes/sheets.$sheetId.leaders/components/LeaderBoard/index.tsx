import { Sailor, Sheet } from "@prisma/client";
import { Link } from "@remix-run/react";
import { IoTrophyOutline } from "react-icons/io5";
import Ordinal from "~/components/Ordinal";
import { SheetLeader } from "~/models/sheet.server";

export default function LeaderBoard({
  sailor,
  sheet,
  leaders,
}: {
  sailor: Sailor;
  sheet: Sheet;
  leaders: SheetLeader[];
}) {
  const groupedLeaders = leaders.reduce((acc, leader) => {
    const rankingGroup = acc.find((group) => group.ranking === leader.ranking);
    if (rankingGroup) {
      rankingGroup.leaders.push(leader);
    } else {
      acc.push({
        ranking: leader.ranking,
        correct: leader.correct,
        leaders: [leader],
      });
    }
    return acc;
  }, [] as { ranking: number; correct: number; leaders: SheetLeader[] }[]);

  const getRankColor = (ranking: number) => {
    if (ranking === 1) return "text-warning";
    if (ranking === 2) return "text-slate-400";
    if (ranking === 3) return "text-amber-600";
    return "text-base-content";
  };

  const getRankBadge = (ranking: number) => {
    if (ranking === 1) return "badge-warning";
    if (ranking === 2) return "badge-neutral";
    if (ranking === 3) return "badge-accent";
    return "badge-ghost";
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
            <IoTrophyOutline className="text-primary" />
            Leaderboard
          </h1>
          <p className="opacity-70">Top performers for {sheet.title}</p>
        </div>

        <div className="space-y-6">
          {groupedLeaders.map((group) => (
            <div key={group.ranking} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`text-4xl font-black ${getRankColor(
                      group.ranking,
                    )}`}
                  >
                    <Ordinal number={group.ranking} />
                  </div>
                  <div
                    className={`badge badge-lg ${getRankBadge(
                      group.ranking,
                    )} font-bold shadow-md`}
                  >
                    {group.correct} Correct
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {group.leaders.map((leader) => (
                    <Link
                      key={leader.submissionId}
                      to={`/sheets/${sheet.id}/submissions/${leader.submissionId}`}
                      className="flex flex-col items-center gap-3 p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-all hover:scale-105 cursor-pointer shadow-md hover:shadow-xl"
                    >
                      <div className="relative">
                        <img
                          src={
                            leader.profilePictureUrl ?? "/fallback-avatar.svg"
                          }
                          alt={leader.username}
                          width={64}
                          height={64}
                          className="sm:w-20 sm:h-20 w-16 h-16 rounded-full object-cover ring-4 ring-base-300 bg-accent"
                        />
                        {sailor.id === leader.sailorId && (
                          <span className="badge badge-primary badge-xs absolute -bottom-1.5 -right-1.5">you</span>
                        )}
                      </div>
                      <div className="text-center w-full">
                        <div className="font-bold text-xs sm:text-sm">
                          {leader.username}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
