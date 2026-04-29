"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "pomodoro" | "shortBreak" | "longBreak";

const DEFAULT_DURATIONS: Record<Mode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_META: Record<Mode, { label: string; color: string }> = {
  pomodoro: { label: "Pomodoro", color: "#ef4444" },
  shortBreak: { label: "Short Break", color: "#22c55e" },
  longBreak: { label: "Long Break", color: "#3b82f6" },
};

interface TimerProps {
  onSessionComplete?: (mode: Mode) => void;
}

export default function Timer({ onSessionComplete }: TimerProps) {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [durations, setDurations] = useState<Record<Mode, number>>(DEFAULT_DURATIONS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.pomodoro);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draftDurations, setDraftDurations] = useState<Record<Mode, number>>(DEFAULT_DURATIONS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = durations[mode];
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
            onSessionComplete?.(mode);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [running, clearTimer, mode, onSessionComplete]);

  const handleModeSwitch = (newMode: Mode) => {
    clearTimer();
    setRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  };

  const handleStartPause = () => setRunning((prev) => !prev);

  const handleReset = () => {
    clearTimer();
    setRunning(false);
    setTimeLeft(durations[mode]);
  };

  const openSettings = () => {
    setDraftDurations({ ...durations });
    setShowSettings(true);
  };

  const saveSettings = () => {
    setDurations(draftDurations);
    clearTimer();
    setRunning(false);
    setTimeLeft(draftDurations[mode]);
    setShowSettings(false);
  };

  const accentColor = MODE_META[mode].color;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode selector */}
      <div className="flex gap-1 rounded-full bg-white/10 p-1">
        {(Object.keys(MODE_META) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
              mode === m
                ? "bg-white text-gray-900 shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            {MODE_META[m].label}
          </button>
        ))}
      </div>

      {/* Circular progress ring */}
      <div className="relative flex items-center justify-center">
        <svg width="280" height="280" className="-rotate-90">
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <motion.circle
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
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-extralight tracking-widest text-white tabular-nums">
            {minutes}:{seconds}
          </span>
          <span
            className="mt-2 text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-300"
            style={{ color: accentColor }}
          >
            {MODE_META[mode].label}
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

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartPause}
          className="flex h-16 w-16 items-center justify-center rounded-full text-gray-900 shadow-lg"
          style={{ backgroundColor: accentColor }}
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 translate-x-0.5">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>

        <button
          onClick={openSettings}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-2xl ring-1 ring-white/10"
            >
              <h2 className="mb-5 text-lg font-semibold text-white">Timer Settings</h2>
              <div className="flex flex-col gap-4">
                {(Object.keys(MODE_META) as Mode[]).map((m) => (
                  <div key={m} className="flex items-center justify-between gap-4">
                    <label className="text-sm text-white/70 w-28">{MODE_META[m].label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={Math.round(draftDurations[m] / 60)}
                        onChange={(e) =>
                          setDraftDurations((prev) => ({
                            ...prev,
                            [m]: Math.max(1, Math.min(120, Number(e.target.value))) * 60,
                          }))
                        }
                        className="w-16 rounded-lg bg-white/10 px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <span className="text-sm text-white/40">min</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="flex-1 rounded-xl bg-white py-2.5 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
