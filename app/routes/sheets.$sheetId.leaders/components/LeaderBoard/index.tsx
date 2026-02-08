import { Sailor, Sheet } from "@prisma/client";
import { Link } from "@remix-run/react";
import { IoCashOutline, IoTrophyOutline } from "react-icons/io5";
import Ordinal from "~/components/Ordinal";
import { SheetLeader } from "~/models/sheet.server";

const calculatePrizePool = (paidCount: number) => {
  const ENTRY_FEE = 10;
  const RAKE = 0.2;
  const WINNER_SHARE = 0.9;
  const LOSER_SHARE = 0.1;

  const totalPot = paidCount * ENTRY_FEE;
  const afterRake = totalPot * (1 - RAKE);
  const winnerPrize = afterRake * WINNER_SHARE;
  const loserPrize = afterRake * LOSER_SHARE;

  return {
    totalPot,
    afterRake,
    winnerPrize,
    loserPrize,
  };
};

export default function LeaderBoard({
  sailor,
  sheet,
  leaders,
  paidCount,
}: {
  sailor: Sailor;
  sheet: Sheet;
  leaders: SheetLeader[];
  paidCount: number;
}) {
  const prizePool = calculatePrizePool(paidCount);
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
            Leaderboard
          </h1>
          <p className="opacity-70">Top performers for {sheet.title}</p>
        </div>

        <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-100 w-full mb-6">
          <div className="stat">
            <div className="stat-figure text-success">
              <IoCashOutline size={32} />
            </div>
            <div className="stat-title">Total Prize Pool</div>
            <div className="stat-value text-success">
              ${prizePool.afterRake.toFixed(0)}
            </div>
            <div className="stat-desc">
              {paidCount} paid entries • 20% rake applied
            </div>
          </div>
          <div className="stat">
            <div className="stat-figure text-warning">
              <IoTrophyOutline size={32} />
            </div>
            <div className="stat-title">1st Place Prize</div>
            <div className="stat-value text-warning">
              ${prizePool.winnerPrize.toFixed(0)}
            </div>
            <div className="stat-desc">90% of prize pool</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-info">
              <IoTrophyOutline size={32} />
            </div>
            <div className="stat-title">Last Place Prize</div>
            <div className="stat-value text-info">
              ${prizePool.loserPrize.toFixed(0)}
            </div>
            <div className="stat-desc">10% of prize pool</div>
          </div>
        </div>

        <div className="alert alert-info shadow-lg mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            <strong>Tip:</strong> Click on any sailor below to view their full
            submission
          </span>
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
                      className="flex flex-col items-center gap-3 p-4 rounded-lg bg-base-200 hover:bg-primary hover:text-primary-content transition-all hover:scale-105 cursor-pointer shadow-md hover:shadow-xl border-2 border-transparent hover:border-primary"
                      title={`View ${leader.username}'s submission`}
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
                          <span className="badge badge-primary badge-xs absolute -bottom-1.5 -right-1.5">
                            you
                          </span>
                        )}
                      </div>
                      <div className="text-center w-full">
                        <div className="font-bold text-xs sm:text-sm">
                          {leader.nickname || leader.username}
                        </div>
                        {leader.nickname && (
                          <div className="text-xs opacity-60">
                            @{leader.username}
                          </div>
                        )}
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
