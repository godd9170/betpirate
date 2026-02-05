import { Sailor, Sheet } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import {
  IoBoatOutline,
  IoPeopleOutline,
  IoSparklesOutline,
  IoTimeOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import type { SubmissionPreview } from "~/models/submission.server";

type TimeLeft = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const buildTimeLeft = (target: Date | null): TimeLeft | null => {
  if (!target) return null;
  const total = target.getTime() - Date.now();
  const clamped = Math.max(total, 0);

  return {
    total,
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
};

const formatTimeLeft = (timeLeft: TimeLeft | null) => {
  if (!timeLeft) return "TBD";
  if (timeLeft.total <= 0) return "Closing";

  const parts = [] as string[];
  if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
  parts.push(`${timeLeft.hours}h`, `${timeLeft.minutes}m`);
  return parts.join(" ");
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
}: {
  sailor: Sailor;
  sheet: Sheet;
  submissions: SubmissionPreview[];
}) {
  const closesAt = sheet.closesAt ? new Date(sheet.closesAt) : null;
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    buildTimeLeft(closesAt)
  );

  useEffect(() => {
    if (!closesAt) return;
    const timer = setInterval(() => {
      setTimeLeft(buildTimeLeft(closesAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [sheet.closesAt]);

  const { uniqueSailors, myEntries, recentSubmissions } = useMemo(() => {
    const unique = new Set(submissions.map((submission) => submission.sailor.id));
    return {
      uniqueSailors: unique.size,
      myEntries: submissions.filter(
        (submission) => submission.sailor.id === sailor.id
      ).length,
      recentSubmissions: submissions.slice(0, 5),
    };
  }, [sailor.id, submissions]);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <IoTrophyOutline className="text-primary" />
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
            <div className="stat-title">Entries</div>
            <div className="stat-value">{submissions.length}</div>
            <div className="stat-desc whitespace-normal break-words">
              across {sheet.title}
            </div>
          </div>
          <div className="stat min-w-0">
            <div className="stat-figure text-primary">
              <IoPeopleOutline size={26} />
            </div>
            <div className="stat-title">Sailors</div>
            <div className="stat-value">{uniqueSailors}</div>
            <div className="stat-desc whitespace-normal break-words">
              unique captains so far
            </div>
          </div>
          <div className="stat min-w-0">
            <div className="stat-figure text-primary">
              <IoBoatOutline size={26} />
            </div>
            <div className="stat-title">Your Entries</div>
            <div className="stat-value">{myEntries}</div>
            <div className="stat-desc whitespace-normal break-words">
              your submissions on deck
            </div>
          </div>
          <div className="stat min-w-0">
            <div className="stat-figure text-primary">
              <IoTimeOutline size={26} />
            </div>
            <div className="stat-title">Closes In</div>
            <div className="stat-value text-xl sm:text-2xl">
              {formatTimeLeft(timeLeft)}
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
        </div>

        <div className="grid gap-6 mt-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Current Fleet</h2>
                <span className="badge badge-outline">
                  {submissions.length} entries
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-10 opacity-70">
                  No submissions yet. Be the first to chart a course.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
                  {submissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-base-200"
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
                          <span className="badge badge-primary badge-xs absolute -bottom-1.5 -right-1.5">you</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">
                          {displayName(submission.sailor.username, index)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
                            <span className="badge badge-primary badge-xs absolute -bottom-1.5 -right-1.5">you</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">
                            {displayName(submission.sailor.username, index)}
                          </div>
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
