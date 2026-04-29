"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Session {
  date: string; // "YYYY-MM-DD"
  mode: "pomodoro" | "shortBreak" | "longBreak";
}

interface Props {
  sessions: Session[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return formatDate(d);
  });
}

function buildHeatmapGrid(sessions: Session[]): { date: string; count: number }[] {
  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    if (s.mode === "pomodoro") counts[s.date] = (counts[s.date] ?? 0) + 1;
  }
  for (let i = 51; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    for (let w = 0; w < 7; w++) {
      const day = new Date(d);
      day.setDate(d.getDate() - d.getDay() + w);
      const key = formatDate(day);
      cells.push({ date: key, count: counts[key] ?? 0 });
    }
  }
  return cells;
}

function heatColor(count: number): string {
  if (count === 0) return "rgba(255,255,255,0.06)";
  if (count === 1) return "#ef444480";
  if (count === 2) return "#ef4444aa";
  if (count <= 4) return "#ef4444cc";
  return "#ef4444";
}

// Custom tooltip for bar chart
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg ring-1 ring-white/10">
      <p className="font-medium">{label}</p>
      <p className="text-white/60">{payload[0].value} pomodoro{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
}

export default function Analytics({ sessions }: Props) {
  const dailyData = useMemo(() => {
    const last7 = getLast7Days();
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      if (s.mode === "pomodoro") counts[s.date] = (counts[s.date] ?? 0) + 1;
    }
    return last7.map((date) => {
      const d = new Date(date);
      return {
        day: DAY_LABELS[d.getDay()],
        date,
        count: counts[date] ?? 0,
      };
    });
  }, [sessions]);

  const totalToday = dailyData[6]?.count ?? 0;
  const totalWeek = dailyData.reduce((s, d) => s + d.count, 0);
  const bestDay = Math.max(...dailyData.map((d) => d.count), 0);

  const heatmap = useMemo(() => buildHeatmapGrid(sessions), [sessions]);

  // Group heatmap into weeks (columns of 7)
  const weeks = useMemo(() => {
    const cols: { date: string; count: number }[][] = [];
    for (let i = 0; i < heatmap.length; i += 7) {
      cols.push(heatmap.slice(i, i + 7));
    }
    return cols;
  }, [heatmap]);

  // Month labels for heatmap header
  const monthHeaders = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTH_LABELS[month], col });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-white">Analytics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today", value: totalToday },
          { label: "This Week", value: totalWeek },
          { label: "Best Day", value: bestDay },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center rounded-xl bg-white/5 py-4 ring-1 ring-white/5">
            <span className="text-2xl font-light text-white">{value}</span>
            <span className="mt-1 text-xs text-white/40">{label}</span>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/30">
          Daily Overview
        </p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} barSize={24}>
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                {dailyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.count === 0
                        ? "rgba(255,255,255,0.08)"
                        : index === 6
                        ? "#ef4444"
                        : "#ef444466"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/30">
          Productivity Heatmap
        </p>
        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: weeks.length * 14 + 16 }}>
            {/* Month labels */}
            <div className="relative h-4 mb-1">
              {monthHeaders.map(({ label, col }) => (
                <span
                  key={`${label}-${col}`}
                  className="absolute text-[10px] text-white/30"
                  style={{ left: col * 14 }}
                >
                  {label}
                </span>
              ))}
            </div>
            {/* Grid */}
            <div className="flex gap-[2px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((cell) => (
                    <div
                      key={cell.date}
                      title={`${cell.date}: ${cell.count} pomodoro${cell.count !== 1 ? "s" : ""}`}
                      className="h-3 w-3 rounded-[2px] transition-colors"
                      style={{ backgroundColor: heatColor(cell.count) }}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] text-white/30">Less</span>
              {[0, 1, 2, 3, 5].map((n) => (
                <div
                  key={n}
                  className="h-3 w-3 rounded-[2px]"
                  style={{ backgroundColor: heatColor(n) }}
                />
              ))}
              <span className="text-[10px] text-white/30">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
