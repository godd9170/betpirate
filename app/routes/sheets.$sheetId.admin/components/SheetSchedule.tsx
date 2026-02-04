import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";

type TimeLeft = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const parseDateValue = (value?: string | Date | null) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const trimmed = `${value}`.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const normalized = trimmed.replace(" ", "T");
  const retry = new Date(normalized);
  return Number.isNaN(retry.getTime()) ? null : retry;
};

const formatForInput = (value: string | Date | null) => {
  const date = parseDateValue(value);
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
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

type Props = {
  sheet: {
    id: string;
    status: "DRAFT" | "OPEN" | "CLOSED";
    closesAt: string | Date | null;
  };
};

export default function SheetSchedule({ sheet }: Props) {
  const fetcher = useFetcher();
  const [localValue, setLocalValue] = useState(() =>
    formatForInput(sheet.closesAt)
  );
  const closesAt = useMemo(
    () => parseDateValue(sheet.closesAt),
    [sheet.closesAt]
  );
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    buildTimeLeft(closesAt)
  );

  useEffect(() => {
    setLocalValue(formatForInput(sheet.closesAt));
  }, [sheet.closesAt]);

  useEffect(() => {
    if (sheet.status !== "OPEN") return;
    setTimeLeft(buildTimeLeft(closesAt));
    if (!closesAt) return;
    const timer = setInterval(() => {
      setTimeLeft(buildTimeLeft(closesAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [closesAt, sheet.status]);

  const isoValue = useMemo(() => {
    if (!localValue) return "";
    const parsed = new Date(localValue);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  }, [localValue]);

  if (sheet.status === "OPEN") {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold">Closing Time</h3>
              <p className="text-sm text-base-content/70">
                Countdown is locked while the sheet is open.
              </p>
            </div>
            <span className="badge badge-primary badge-outline">OPEN</span>
          </div>

          <div className="stats stats-vertical md:stats-horizontal shadow bg-base-200/40 mt-4">
            <div className="stat">
              <div className="stat-title">Closes In</div>
              <div className="stat-value text-2xl">
                {formatTimeLeft(timeLeft)}
              </div>
              <div className="stat-desc">
                {closesAt
                  ? closesAt.toLocaleString("en-CA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Closing time not set"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <fetcher.Form
      method="post"
      action={`/sheets/${sheet.id}/status`}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold">Closing Time</h3>
            <p className="text-sm text-base-content/70">
              Controls the countdown on the leaderboard and when picks lock.
            </p>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm self-start md:self-auto"
          >
            Save closing time
          </button>
        </div>

        <div className="grid gap-2 max-w-sm">
          <label className="form-control">
            <div className="label">
              <span className="label-text text-xs uppercase tracking-wide text-base-content/60">
                Closes at (local time)
              </span>
            </div>
            <input
              type="datetime-local"
              className="input input-bordered"
              value={localValue}
              onChange={(event) => setLocalValue(event.currentTarget.value)}
            />
          </label>
          <input type="hidden" name="closesAt" value={isoValue} />
          <p className="text-xs text-base-content/60">
            Leave blank to remove the closing time.
          </p>
        </div>
      </div>
    </fetcher.Form>
  );
}
