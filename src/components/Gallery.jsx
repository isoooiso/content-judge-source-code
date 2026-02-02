import { clampText, formatAddress, scoreColor } from '../services/contractService'

export default function Gallery({ items, isLoading, onRefresh }) {
  return (
    <div className="bg-slate-900/50 border border-indigo-500/10 rounded-3xl shadow-xl p-8 w-full fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">🏛️ Public Gallery</h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-slate-200/10 text-slate-200 px-5 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10 disabled:opacity-60"
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <p className="text-slate-400 text-sm mt-2">
        Only high-scoring submissions are stored on-chain.
      </p>

      <div className="mt-6 space-y-4">
        {items.length === 0 && (
          <div className="text-slate-400 text-sm bg-slate-950/30 border border-indigo-500/10 rounded-2xl p-5">
            No public entries yet. Submit something strong and get featured ✨
          </div>
        )}

        {items.slice(0, 10).map((row, idx) => (
          <div key={idx} className="bg-slate-950/35 border border-indigo-500/10 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-slate-200 font-semibold">
                  {row.title ? clampText(row.title, 110) : 'Untitled'}
                  <span className="ml-2 text-[10px] bg-slate-200/10 border border-slate-200/10 text-slate-200 px-2 py-0.5 rounded-full">{String(row.mode || 'general')}</span>
                </div>
                {row.url && (
                  <a
                    className="text-xs text-indigo-300 hover:text-indigo-200 transition break-all"
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {clampText(row.url, 120)}
                  </a>
                )}
              </div>

              <div className={`text-xl font-extrabold whitespace-nowrap ${scoreColor(row.total)}`}>
                {Number(row.total)}/50
              </div>
            </div>

            {row.feedback && (
              <div className="mt-3 text-slate-300 text-sm leading-relaxed">
                {clampText(row.feedback, 240)}
              </div>
            )}

            {row.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {row.tags.slice(0, 6).map((t, i) => (
                  <span key={i} className="text-xs bg-slate-200/10 border border-slate-200/10 text-slate-200 px-3 py-1 rounded-full">
                    #{String(t)}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 text-xs text-slate-500">
              Author: {formatAddress(row.author)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
