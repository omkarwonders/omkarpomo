"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Mode = "focus" | "break";

const MODES: Record<Mode, { label: string; duration: number; color: string }> =
  {
    focus: { label: "Focus", duration: 25 * 60, color: "#ef4444" },
    break: { label: "Break", duration: 5 * 60, color: "#22c55e" },
  };

export default function Timer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = MODES[mode].duration;
  const progress = (timeLeft / totalDuration) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [running, clearTimer]);

  const handleModeSwitch = (newMode: Mode) => {
    clearTimer();
    setRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  };

  const handleStartPause = () => setRunning((prev) => !prev);

  const handleReset = () => {
    clearTimer();
    setRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const accentColor = MODES[mode].color;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode selector */}
      <div className="flex gap-2 rounded-full bg-white/10 p-1">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
              mode === m
                ? "bg-white text-gray-900 shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Circular progress ring */}
      <div className="relative flex items-center justify-center">
        <svg width="280" height="280" className="-rotate-90">
          {/* Background ring */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={accentColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Time display */}
        <div className="absolute flex flex-col items-center select-none">
          <span className="text-6xl font-extralight tracking-widest text-white tabular-nums">
            {minutes}:{seconds}
          </span>
          <span
            className="mt-2 text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-300"
            style={{ color: accentColor }}
          >
            {MODES[mode].label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Reset timer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <button
          onClick={handleStartPause}
          className="flex h-16 w-16 items-center justify-center rounded-full text-gray-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: accentColor }}
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7"
            >
              <path
                fillRule="evenodd"
                d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 translate-x-0.5"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Spacer to keep the play button centered */}
        <div className="h-10 w-10" />
      </div>
    </div>
  );
}
