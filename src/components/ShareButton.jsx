export default function ShareButton({ text }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch {
      alert('Failed to copy')
    }
  }

  return (
    <button
      onClick={copy}
      className="bg-slate-200/10 text-slate-200 px-6 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10"
    >
      Share 📤
    </button>
  )
}
