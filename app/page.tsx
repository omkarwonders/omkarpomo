"use client";

import { useState, useCallback } from "react";
import Timer from "@/components/Timer";
import TaskList from "@/components/TaskList";
import Analytics from "@/components/Analytics";

type Mode = "pomodoro" | "shortBreak" | "longBreak";

interface Session {
  date: string;
  mode: Mode;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const handleSessionComplete = useCallback((mode: Mode) => {
    setSessions((prev) => [...prev, { date: today(), mode }]);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Pomodoro
          </h1>
          <p className="mt-1 text-sm text-white/40">Stay focused. Rest well.</p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Timer card */}
          <div className="rounded-3xl bg-white/5 p-8 shadow-2xl backdrop-blur-sm ring-1 ring-white/10 flex flex-col items-center">
            <Timer onSessionComplete={handleSessionComplete} />
          </div>

          {/* Tasks card */}
          <div className="rounded-3xl bg-white/5 p-6 shadow-2xl backdrop-blur-sm ring-1 ring-white/10">
            <TaskList />
          </div>

          {/* Analytics card */}
          <div className="rounded-3xl bg-white/5 p-6 shadow-2xl backdrop-blur-sm ring-1 ring-white/10 md:col-span-2 lg:col-span-1">
            <Analytics sessions={sessions} />
          </div>
        </div>

        <p className="text-center text-xs text-white/20">
          Complete a Pomodoro session to track your progress
        </p>
      </div>
    </main>
  );
}
