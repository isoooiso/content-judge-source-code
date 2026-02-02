import { useMemo, useState } from 'react'

const MODES = [
  { value: 'genlayer', label: 'GenLayer project' },
  { value: 'startup', label: 'Startup pitch' },
  { value: 'article', label: 'Article' },
  { value: 'meme', label: 'Meme idea' },
  { value: 'general', label: 'General' },
]

export default function ContentForm({ onSubmit, disabled }) {
  const [mode, setMode] = useState('genlayer')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')

  const remaining = useMemo(() => 4000 - content.length, [content.length])

  function handleSubmit() {
    onSubmit({ mode, title, url, content })
  }

  return (
    <div className="bg-slate-900/70 border border-indigo-500/20 rounded-3xl shadow-2xl p-8 w-full fade-in">
      <h2 className="text-xl font-bold text-slate-100">Submit content</h2>
      <p className="text-slate-300 text-sm mt-2">
        Pick a judging mode. Any language is OK. Keep the main text under 4000 characters.
      </p>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="text-xs text-slate-400 mb-2">Mode</div>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition"
            disabled={disabled}
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition md:col-span-1"
          placeholder="Title (optional)"
          disabled={disabled}
        />

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition md:col-span-1"
          placeholder="URL (optional) https://..."
          disabled={disabled}
        />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mt-4 w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl h-44 resize-none focus:border-indigo-400 focus:outline-none transition"
        placeholder="Paste an idea, project description, article draft, or anything you'd like evaluated..."
        disabled={disabled}
      />

      <div className="flex items-center justify-between mt-3">
        <span className={`text-xs ${remaining < 0 ? 'text-rose-300' : 'text-slate-400'}`}>
          {remaining} characters left
        </span>
        <span className="text-xs text-slate-400">Tip: include target audience and why it matters</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        Judge Content ✨
      </button>
    </div>
  )
}
