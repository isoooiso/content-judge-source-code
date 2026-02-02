import { useState } from 'react'
import ScoreGrid from './ScoreGrid'
import ShareButton from './ShareButton'
import { getLastDebug, scoreColor } from '../services/contractService'

export default function ResultCard({ result, onNew, walletAddress }) {
  const total = Number(result?.total ?? 0)
  const aiMode = result?.fallback ? 'Fallback' : 'On-chain AI'
  const judgeMode = String(result?.mode || 'general')

  const [debug, setDebug] = useState(null)
  const [debugLoading, setDebugLoading] = useState(false)

  async function loadDebug() {
    try {
      setDebugLoading(true)
      const d = await getLastDebug(walletAddress)
      setDebug(d)
    } finally {
      setDebugLoading(false)
    }
  }

  const shareText = [
    `Content Judge — ${total}/50`,
    `AI Mode: ${aiMode}`
    + `\nJudge: ${result?.mode || 'general'}`,
    result?.title ? `Title: ${result.title}` : '',
    result?.url ? `URL: ${result.url}` : '',
    '',
    result?.feedback ? `Feedback: ${result.feedback}` : '',
    result?.improvements?.length ? `Improvements: ${result.improvements.join(' | ')}` : ''
  ].filter(Boolean).join('\n')

  return (
    <div className="bg-slate-900/70 border border-indigo-500/20 rounded-3xl shadow-2xl p-8 w-full fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Judgement</h2>
          <div className="mt-1 text-xs text-slate-400">
            AI Mode: <span className="text-slate-200 font-semibold">{aiMode}</span> · Judge: <span className="text-slate-200 font-semibold">{judgeMode}</span>
          </div>
        </div>

        <div className={`text-4xl font-extrabold ${scoreColor(total)}`}>
          {total}/50
        </div>
      </div>

      <div className="mt-5">
        <ScoreGrid scores={result?.scores} />
      </div>

      <div className="mt-5 bg-slate-950/35 border border-indigo-500/10 rounded-2xl p-5">
        <div className="text-sm text-slate-300 font-semibold">AI Feedback</div>
        <div className="mt-2 text-slate-100 whitespace-pre-wrap leading-relaxed">
          {result?.feedback || '—'}
        </div>

        {result?.improvements?.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-slate-300 font-semibold">Top improvements</div>
            <ul className="mt-2 space-y-1 text-slate-100">
              {result.improvements.slice(0, 3).map((it, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-indigo-300">•</span>
                  <span className="leading-relaxed">{String(it)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {result.tags.slice(0, 6).map((t, idx) => (
              <span key={idx} className="text-xs bg-slate-200/10 border border-slate-200/10 text-slate-200 px-3 py-1 rounded-full">
                #{String(t)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-300">
            {result?.saved ? (
              <span className="text-emerald-300 font-semibold">✨ Saved to gallery</span>
            ) : (
              <span className="text-slate-400">(not saved)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ShareButton text={shareText} />
            <button
              onClick={onNew}
              className="bg-slate-200/10 text-slate-200 px-6 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10"
            >
              New ↻
            </button>
          </div>
        </div>

        {result?.fallback && (
          <div className="mt-4">
            <button
              onClick={loadDebug}
              disabled={debugLoading}
              className="bg-slate-200/10 text-slate-200 px-5 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10 disabled:opacity-60"
            >
              {debugLoading ? 'Loading debug…' : 'Show debug'}
            </button>

            {debug && (
              <div className="mt-3 text-xs text-slate-300 bg-slate-950/40 border border-indigo-500/10 rounded-2xl p-4 whitespace-pre-wrap">
                <div className="text-slate-400">eq:</div>
                <div className="text-slate-200">{String(debug.eq ?? '')}</div>
                <div className="mt-3 text-slate-400">error:</div>
                <div className="text-rose-300">{String(debug.error ?? '')}</div>
                <div className="mt-3 text-slate-400">raw:</div>
                <div className="text-slate-200">{String(debug.raw ?? '')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
