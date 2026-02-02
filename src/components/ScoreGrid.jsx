import { scoreColor } from '../services/contractService'

function ScoreItem({ label, value }) {
  return (
    <div className="bg-slate-950/35 border border-indigo-500/10 rounded-2xl p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${scoreColor(value * 5)}`}>
        {value}/10
      </div>
    </div>
  )
}

export default function ScoreGrid({ scores }) {
  const s = scores || {}
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <ScoreItem label="Originality" value={Number(s.originality ?? 0)} />
      <ScoreItem label="Clarity" value={Number(s.clarity ?? 0)} />
      <ScoreItem label="Value" value={Number(s.value ?? 0)} />
      <ScoreItem label="Execution" value={Number(s.execution ?? 0)} />
      <ScoreItem label="Virality" value={Number(s.virality ?? 0)} />
    </div>
  )
}
