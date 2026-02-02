import { useEffect, useMemo, useState } from 'react'
import TopBar from './TopBar'
import NetworkGuard from './NetworkGuard'
import ContentForm from './ContentForm'
import LoadingCard from './LoadingCard'
import ResultCard from './ResultCard'
import Gallery from './Gallery'
import { getGallery, judgeContent } from '../services/contractService'

export default function JudgeScreen({ walletAddress, onDisconnect }) {
  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState('submitting')
  const [result, setResult] = useState(null)

  const [gallery, setGallery] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)

  const canSubmit = useMemo(() => Boolean(walletAddress) && !isLoading, [walletAddress, isLoading])

  async function refreshGallery() {
    try {
      setGalleryLoading(true)
      const items = await getGallery(walletAddress)
      setGallery(items)
    } catch {
      setGallery([])
    } finally {
      setGalleryLoading(false)
    }
  }

  useEffect(() => {
    refreshGallery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress])

  async function handleSubmit(payload) {
    const mode = String(payload?.mode || 'general').trim()
    const title = String(payload?.title || '').trim()
    const url = String(payload?.url || '').trim()
    const content = String(payload?.content || '').trim()

    if (!content) {
      alert('Please paste some content first.')
      return
    }
    if (content.length < 50) {
      alert('Please provide at least 50 characters for meaningful evaluation.')
      return
    }
    if (content.length > 4000) {
      alert('Please keep the main text under 4000 characters.')
      return
    }

    setResult(null)
    setIsLoading(true)
    setStage('submitting')

    try {
      setStage('judging')
      const res = await judgeContent(walletAddress, { mode, title, url, content })
      setResult(res)
      await refreshGallery()
    } catch (e) {
      alert(e?.message || 'Failed to judge content')
    } finally {
      setIsLoading(false)
    }
  }

  function handleNew() {
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 px-4">
      <div className="max-w-4xl mx-auto">
        <TopBar address={walletAddress} onDisconnect={onDisconnect} />

        <div className="pb-10">
          <div className="text-center mt-2 mb-6">
            <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight">
              Rate ideas like a judge ⚖️
            </h1>
            <p className="text-slate-300 mt-3">
              Originality, clarity, value, execution, and virality — scored by on-chain AI consensus.
            </p>
          </div>

          <div className="space-y-6">
            <NetworkGuard />

            {!result && !isLoading && (
              <ContentForm onSubmit={handleSubmit} disabled={!canSubmit} />
            )}

            {isLoading && <LoadingCard stage={stage} />}

            {result && !isLoading && (
              <ResultCard result={result} onNew={handleNew} walletAddress={walletAddress} />
            )}

            <Gallery items={gallery} isLoading={galleryLoading} onRefresh={refreshGallery} />
          </div>

          <div className="text-center text-xs text-slate-500 mt-10 pb-6">
            AI evaluation for iteration and fun. Not financial, legal, or medical advice.
          </div>
        </div>
      </div>
    </div>
  )
}
