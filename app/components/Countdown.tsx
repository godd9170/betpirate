import { useEffect, useState } from "react";

type CountdownTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function Countdown({
  closesAt,
}: {
  closesAt: string | Date | null;
}) {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!closesAt) return;

    const calculateTimeLeft = () => {
      const targetDate = new Date(closesAt).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [closesAt]);

  return (
    <div className="countdown font-mono text-lg text-center">
      <span style={{ "--value": timeLeft.days } as React.CSSProperties} />d
      <span style={{ "--value": timeLeft.hours } as React.CSSProperties} />h
      <span style={{ "--value": timeLeft.minutes } as React.CSSProperties} />m
      <span style={{ "--value": timeLeft.seconds } as React.CSSProperties} />s
    </div>
  );
}
