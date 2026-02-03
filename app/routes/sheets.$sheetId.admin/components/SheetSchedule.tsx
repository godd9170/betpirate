import { useFetcher } from "@remix-run/react";
import { useMemo, useState } from "react";

const formatForInput = (value: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

type Props = {
  sheet: {
    id: string;
    closesAt: string | Date | null;
  };
};

export default function SheetSchedule({ sheet }: Props) {
  const fetcher = useFetcher();
  const [localValue, setLocalValue] = useState(() =>
    formatForInput(sheet.closesAt)
  );

  const isoValue = useMemo(() => {
    if (!localValue) return "";
    const parsed = new Date(localValue);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  }, [localValue]);

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
