import { useState, forwardRef } from "react";

const TiebreakerCard = forwardRef<
  HTMLDivElement,
  {
    tieBreakerQuestion: string | null;
    onTouch: () => void;
    initialValue?: number;
  }
>(({ tieBreakerQuestion, onTouch, initialValue }, ref) => {
  // todo: get min and max from the sheet
  const MIN = -20;
  const MAX = 500;
  const randomBetween = () =>
    Math.floor(Math.random() * (MAX - MIN + 1) + MIN);
  const [value, setValue] = useState<number>(
    () => initialValue ?? randomBetween()
  );

  const handleChange = (value: number) => {
    onTouch();
    setValue(value);
  };

  return (
    <div
      className="card card-bordered bg-accent/10 shadow-xl scroll-mt-24"
      ref={ref}
    >
      <div className="card-body">
        <div className="flex items-center gap-3 mb-4">
          <div className="badge badge-accent badge-lg font-bold px-4 py-3">
            ⚔️ TIE BREAKER
          </div>
        </div>

        <h2 className="card-title text-xl font-bold mb-6">
          {tieBreakerQuestion}
        </h2>

        <div className="bg-base-200 rounded-xl p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="stat bg-base-100 rounded-box shadow-lg">
              <div className="stat-value text-primary text-center">{value}</div>
              <div className="stat-desc text-center font-semibold">
                Your Pick
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold opacity-60">
              <span>Min: {MIN}</span>
              <span>Max: {MAX}</span>
            </div>
            <input
              type="range"
              min={MIN}
              max={MAX}
              value={value}
              name="tieBreaker"
              className="range range-primary range-lg w-full"
              onChange={(e) => handleChange(Number(e.target.value))}
            />
            <div className="flex gap-2 justify-center mt-4">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => handleChange(Math.max(MIN, value - 10))}
              >
                -10
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => handleChange(Math.max(MIN, value - 1))}
              >
                -1
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => handleChange(Math.min(MAX, value + 1))}
              >
                +1
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => handleChange(Math.min(MAX, value + 10))}
              >
                +10
              </button>
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-4">
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
          <span className="text-sm">
            This determines the winner if there's a tie in correct answers!
          </span>
        </div>
      </div>
    </div>
  );
});

export default TiebreakerCard;
