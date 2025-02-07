import { useEffect, useState } from "react";

// todo: get a date for sheet closure from the sheet itself
export default function Countdown({ leaders }: { leaders: any }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(`2025-02-09T18:00:00`) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  const RAKE = 0.1;
  const prizePool = leaders.length * 10;
  const rakedPrizePool = prizePool * (1 - RAKE);
  const grandPrize = rakedPrizePool * 0.9;
  const lastPlacePrize = rakedPrizePool - grandPrize;

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-col items-center justify-center h-full mt-10">
      <div className="text-center font-black text-4xl">
        {`Grand Prize ${grandPrize.toLocaleString("en-CA", {
          style: "currency",
          currency: "CAD",
        })}`}
      </div>
      <div className="text-center font-bold text-xl">
        {`Last Place Prize ${lastPlacePrize.toLocaleString("en-CA", {
          style: "currency",
          currency: "CAD",
        })}`}
      </div>

      <div className="mt-10">
        <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
          <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span className="countdown font-mono text-5xl">
              <span style={{ "--value": timeLeft.days }}></span>
            </span>
            days
          </div>
          <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span className="countdown font-mono text-5xl">
              <span style={{ "--value": timeLeft.hours }}></span>
            </span>
            hours
          </div>
          <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span className="countdown font-mono text-5xl">
              <span style={{ "--value": timeLeft.minutes }}></span>
            </span>
            min
          </div>
          <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span className="countdown font-mono text-5xl">
              <span style={{ "--value": timeLeft.seconds }}></span>
            </span>
            sec
          </div>
        </div>
      </div>
      <div className="text-lg my-10 text-center">
        Leaderboard will open when the game begins.
      </div>
    </div>
  );
}
