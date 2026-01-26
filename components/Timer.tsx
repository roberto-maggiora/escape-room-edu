"use client";

import { useEffect } from "react";

type TimerProps = {
  label: string;
  seconds: number;
  isRunning: boolean;
  onTick: React.Dispatch<React.SetStateAction<number>>;
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function Timer({ label, seconds, isRunning, onTick }: TimerProps) {
  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(() => {
      onTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, onTick]);

  return (
    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
      {label}: {formatTime(seconds)}
    </div>
  );
}
