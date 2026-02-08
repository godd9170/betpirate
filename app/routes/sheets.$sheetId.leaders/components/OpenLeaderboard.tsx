import { Sailor, Sheet } from "@prisma/client";
import { useMemo } from "react";
import {
  IoBoatOutline,
  IoCashOutline,
  IoPeopleOutline,
  IoSparklesOutline,
  IoTimeOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import Countdown from "~/components/Countdown";
import type { SubmissionPreview } from "~/models/submission.server";

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

const formatRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) {
    return `${Math.floor(diff / (60 * 60_000))}h ago`;
  }
  return `${Math.floor(diff / (24 * 60 * 60_000))}d ago`;
};

const displayName = (username: string | null, fallbackIndex: number) =>
  username?.trim() ? username : `Sailor ${fallbackIndex + 1}`;

export default function OpenLeaderboard({
  sailor,
  sheet,
  submissions,
  paidCount,
}: {
  sailor: Sailor;
  sheet: Sheet;
  submissions: SubmissionPreview[];
  paidCount: number;
}) {
  const closesAt = sheet.closesAt ? new Date(sheet.closesAt) : null;

  const { uniqueSailors, recentSubmissions } = useMemo(() => {
    const unique = new Set(
      submissions.map((submission) => submission.sailor.id),
    );
    return {
      uniqueSailors: unique.size,
      recentSubmissions: submissions.slice(0, 5),
    };
  }, [sailor.id, submissions]);

  const prizePool = calculatePrizePool(paidCount);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            Live Leaderboard Preview
          </h1>
          <p className="opacity-70">
            Entries are public, picks stay sealed until submissions close.
          </p>
        </div>

        <div className="alert shadow-lg mb-6">
          <IoSparklesOutline size={24} className="text-primary" />
          <div>
            <h3 className="font-bold">Picks stay hidden</h3>
            <div className="text-sm opacity-70">
              No selections or rankings are shown until the sheet closes.
            </div>
          </div>
        </div>

        <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-100 w-full">
          <div className="stat min-w-0">
            <div className="stat-figure text-primary">
              <IoBoatOutline size={26} />
            </div>
            <div className="stat-title">Paid Entries</div>
            <div className="stat-value">{paidCount}</div>
            <div className="stat-desc whitespace-normal break-words">
              across {sheet.title}
            </div>
          </div>
          <div className="stat min-w-0">
            <div className="stat-figure text-primary">
              <IoTimeOutline size={26} />
            </div>
            <div className="stat-title">Closes In</div>
            <div className="stat-value text-xl sm:text-2xl">
              {closesAt ? <Countdown closesAt={closesAt} /> : "TBD"}
            </div>
            <div className="stat-desc whitespace-normal break-words">
              {closesAt
                ? closesAt.toLocaleString("en-CA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Closing time not set"}
            </div>
          </div>
          <div className="stat min-w-0">
            <div className="stat-figure text-success">
              <IoCashOutline size={26} />
            </div>
            <div className="stat-title">Prize Pool</div>
            <div className="stat-value text-success text-xl sm:text-2xl">
              ${prizePool.afterRake.toFixed(0)}
            </div>
            <div className="stat-desc whitespace-normal break-words">
              1st: ${prizePool.winnerPrize.toFixed(0)} • Last: $
              {prizePool.loserPrize.toFixed(0)}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Recent Submissions</h2>
              {recentSubmissions.length === 0 ? (
                <div className="text-sm opacity-70">
                  No entries have been submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSubmissions.map((submission, index) => {
                    const createdAt = new Date(submission.createdAt);
                    return (
                      <div
                        key={submission.id}
                        className="flex items-center gap-3"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={
                              submission.sailor.profilePictureUrl ??
                              "/fallback-avatar.svg"
                            }
                            alt={submission.sailor.username ?? "Sailor"}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-base-300 bg-accent"
                          />
                          {submission.sailor.id === sailor.id && (
                            <span className="badge badge-primary badge-xs absolute -bottom-1.5 -right-1.5">
                              you
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">
                            {submission.nickname || displayName(submission.sailor.username, index)}
                          </div>
                          {submission.nickname && (
                            <div className="text-xs opacity-60">
                              @{displayName(submission.sailor.username, index)}
                            </div>
                          )}
                          <div className="text-xs opacity-60">
                            {formatRelativeTime(createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
