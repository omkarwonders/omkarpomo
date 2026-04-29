"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, done: false },
    ]);
    setInput("");
  };

  const toggleTask = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTask();
  };

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Tasks</h2>
        {tasks.length > 0 && (
          <span className="text-xs text-white/40">
            {completedCount}/{tasks.length} done
          </span>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a task…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addTask}
          disabled={!input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-30"
          aria-label="Add task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.button>
      </div>

      {/* Task list */}
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/5"
            >
              <button
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                style={{
                  borderColor: task.done ? "#22c55e" : "rgba(255,255,255,0.2)",
                  backgroundColor: task.done ? "#22c55e" : "transparent",
                }}
              >
                {task.done && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 text-sm transition-colors ${
                  task.done ? "text-white/30 line-through" : "text-white/80"
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="flex h-6 w-6 items-center justify-center rounded-lg text-white/20 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10 hover:text-white/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {tasks.length === 0 && (
        <p className="text-center text-xs text-white/20 py-4">
          No tasks yet. Add one above!
        </p>
      )}
    </div>
  );
}
