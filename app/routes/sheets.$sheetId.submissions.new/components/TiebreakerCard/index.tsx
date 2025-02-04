import { useState } from "react";

export default function TiebreakerCard({
  tieBreakerQuestion,
}: {
  tieBreakerQuestion: string | null;
}) {
  // todo: get min and max from the sheet
  const MIN = -20;
  const MAX = 500;
  const randBetween = Math.floor(Math.random() * (MAX - MIN + 1) + MIN);
  const [value, setValue] = useState<number>(randBetween);
  return (
    <div className="card card-compact w-full bg-base-100 shadow-xl mb-4 first:mt-4">
      <div className="card-body">
        <h2 className="card-title">Tie Breaker: {tieBreakerQuestion}</h2>
        <div className="card-actions pt-2 flex flex-col items-center">
          <div className="stat-value">{value}</div>
          <input
            type="range"
            min={-10}
            max="500"
            value={value}
            name="tieBreaker"
            className="range"
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
