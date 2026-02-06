import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import Ordinal from "~/components/Ordinal";

export default function SubmissionTitle({
  submissionLabel,
  nickname,
  initialValue,
  canEdit,
  submissionRank,
  showRank,
}: {
  submissionLabel: string;
  nickname: string | null;
  initialValue: number;
  canEdit: boolean;
  submissionRank?: { correctCount: number; tieCount: number; rank: number };
  showRank: boolean;
}) {
  const tieBreakerFetcher = useFetcher();
  const nicknameFetcher = useFetcher();
  const [value, setValue] = useState<number>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [nicknameValue, setNicknameValue] = useState(nickname ?? "");
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  useEffect(() => {
    const data = tieBreakerFetcher.data as { ok?: boolean } | undefined;
    if (tieBreakerFetcher.state === "idle" && data?.ok) {
      setIsEditing(false);
    }
  }, [tieBreakerFetcher.data, tieBreakerFetcher.state]);

  useEffect(() => {
    const data = nicknameFetcher.data as { ok?: boolean } | undefined;
    if (nicknameFetcher.state === "idle" && data?.ok) {
      setIsEditingNickname(false);
    }
  }, [nicknameFetcher.data, nicknameFetcher.state]);

  const displayName = nicknameValue.trim() || submissionLabel;

  return (
    <div className="card card-bordered bg-base-100 shadow-md mb-6">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase opacity-60">
              Submission
            </div>
            {canEdit ? (
              isEditingNickname ? (
                <nicknameFetcher.Form
                  method="post"
                  className="flex items-center gap-2 mt-1"
                >
                  <input type="hidden" name="intent" value="nickname" />
                  <input
                    type="text"
                    name="nickname"
                    className="input input-bordered w-48"
                    value={nicknameValue}
                    onChange={(event) => setNicknameValue(event.target.value)}
                    placeholder="Add a nickname"
                  />
                  <button className="btn btn-primary btn-sm" type="submit">
                    {nicknameFetcher.state === "submitting"
                      ? "Saving..."
                      : "Save"}
                  </button>
                </nicknameFetcher.Form>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-1"
                  onClick={() => setIsEditingNickname(true)}
                >
                  <span className="text-base font-bold">{displayName}</span>
                  <span className="text-xs opacity-60 ml-2">
                    {nicknameValue.trim() ? "Edit" : "Add nickname"}
                  </span>
                </button>
              )
            ) : (
              <div className="text-lg font-bold mt-1">{displayName}</div>
            )}
          </div>

          {showRank && submissionRank && (
            <div className="text-center">
              <div className="text-xs font-semibold uppercase opacity-60">
                Rank
              </div>
              <div className="text-2xl font-black mt-1">
                {submissionRank.tieCount > 0 ? "T" : ""}
                <Ordinal number={submissionRank.rank} />
              </div>
              {submissionRank.tieCount > 0 && (
                <div className="text-xs opacity-60 mt-1">
                  with {submissionRank.tieCount} others
                </div>
              )}
            </div>
          )}

          <div className="text-right">
            <div className="text-xs font-semibold uppercase opacity-60">
              Tie Breaker
            </div>
            {canEdit ? (
              isEditing ? (
                <tieBreakerFetcher.Form
                  method="post"
                  className="flex items-center gap-2 justify-end mt-1"
                >
                  <input type="hidden" name="intent" value="tieBreaker" />
                  <input
                    type="number"
                    name="tieBreaker"
                    className="input input-bordered w-28"
                    inputMode="numeric"
                    value={value}
                    onChange={(event) => setValue(Number(event.target.value))}
                  />
                  <button className="btn btn-primary btn-sm" type="submit">
                    {tieBreakerFetcher.state === "submitting"
                      ? "Saving..."
                      : "Save"}
                  </button>
                </tieBreakerFetcher.Form>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-1"
                  onClick={() => setIsEditing(true)}
                >
                  <span className="text-lg font-black">{value}</span>
                  <span className="text-xs opacity-60 ml-2">Edit</span>
                </button>
              )
            ) : (
              <div className="text-2xl font-black mt-1">{value}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
