export default function Header({ isPlaying, onTogglePlay, isDemo, onToggleDemo, onShowDocs }) {
  return (
    <header className="flex flex-none items-center justify-between border-b border-line bg-panel px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-lg text-accent">∿</span>
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-[0.15em] text-ink">
            ALGORITHMIC CANVAS
          </h1>
          <p className="text-[11px] text-inkDim">Mathematical generative art system</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDemo}
          className={`rounded-md border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
            isDemo
              ? 'border-accentWarm text-accentWarm'
              : 'border-line text-inkDim hover:border-accent hover:text-accent'
          }`}
        >
          {isDemo ? '◉ AUTO-DEMO' : 'AUTO-DEMO'}
        </button>
        <button
          onClick={onTogglePlay}
          className="rounded-md border border-line px-3 py-1.5 font-mono text-[11px] tracking-wide text-inkDim transition-colors hover:border-accent hover:text-accent"
        >
          {isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}
        </button>
        <button
          onClick={onShowDocs}
          className="rounded-md border border-line px-3 py-1.5 font-mono text-[11px] tracking-wide text-inkDim transition-colors hover:border-accent hover:text-accent"
        >
          MANUAL
        </button>
      </div>
    </header>
  )
}
