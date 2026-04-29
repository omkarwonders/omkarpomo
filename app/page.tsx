import Timer from "@/components/Timer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Pomodoro
          </h1>
          <p className="mt-1 text-sm text-white/40">Stay focused. Rest well.</p>
        </div>

        {/* Timer card */}
        <div className="w-full rounded-3xl bg-white/5 p-8 shadow-2xl backdrop-blur-sm ring-1 ring-white/10">
          <Timer />
        </div>

        {/* Footer hint */}
        <p className="text-xs text-white/20">
          25 min focus · 5 min break
        </p>
      </div>
    </main>
  );
}
