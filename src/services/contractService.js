import { createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'
import { TransactionStatus } from 'genlayer-js/types'

const CONTRACT_ADDRESS = import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS
const ENDPOINT = import.meta.env.VITE_GENLAYER_RPC || 'https://studio.genlayer.com/api'

function requireAddress() {
  if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x')) {
    throw new Error('Missing VITE_GENLAYER_CONTRACT_ADDRESS. Rebuild the app with correct env.')
  }
}

let cached = {
  address: '',
  endpoint: '',
  account: '',
  client: null,
  initPromise: null
}

async function getClient(userAddress) {
  requireAddress()

  const addr = String(CONTRACT_ADDRESS)
  const ep = String(ENDPOINT)
  const acct = String(userAddress || '')

  if (!acct.startsWith('0x')) {
    throw new Error('Invalid user address')
  }

  const same =
    cached.client &&
    cached.address === addr &&
    cached.endpoint === ep &&
    cached.account.toLowerCase() === acct.toLowerCase()

  if (same && cached.initPromise) {
    await cached.initPromise
    return cached.client
  }

  const client = createClient({
    chain: studionet,
    endpoint: ep,
    account: acct
  })

  const initPromise = client.initializeConsensusSmartContract()

  cached = {
    address: addr,
    endpoint: ep,
    account: acct,
    client,
    initPromise
  }

  await initPromise
  return client
}

function safeJsonParse(value, fallback) {
  try {
    if (typeof value === 'string') return JSON.parse(value)
    return value ?? fallback
  } catch {
    return fallback
  }
}

export function formatAddress(address) {
  if (!address || typeof address !== 'string' || address.length < 10) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function clampText(text, max) {
  const s = String(text || '')
  return s.length > max ? `${s.slice(0, max)}…` : s
}

export function scoreColor(score) {
  const s = Number(score || 0)
  if (s >= 42) return 'text-emerald-300'
  if (s >= 35) return 'text-indigo-300'
  if (s >= 25) return 'text-amber-300'
  return 'text-rose-300'
}

export async function judgeContent(userAddress, payload) {
  const client = await getClient(userAddress)

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'judge_content',
    args: [
      String(payload?.mode || 'general'),
      String(payload?.title || ''),
      String(payload?.url || ''),
      String(payload?.content || '')
    ],
    value: 0n
  })

  await client.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    retries: 80,
    interval: 5000
  })

  const jsonStr = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_last_result',
    args: [userAddress]
  })

  const parsed = safeJsonParse(jsonStr, null)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid result from contract')
  }

  return {
    mode: String(parsed.mode || 'general'),
    title: String(parsed.title || ''),
    url: String(parsed.url || ''),
    total: Number(parsed.total ?? 0),
    scores: parsed.scores || {},
    feedback: String(parsed.feedback || ''),
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
    saved: Boolean(parsed.saved ?? false),
    fallback: Boolean(parsed.fallback ?? false),
  }
}

export async function getGallery(userAddress) {
  const client = await getClient(userAddress)

  const jsonStr = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_gallery',
    args: []
  })

  const arr = safeJsonParse(jsonStr, [])
  if (!Array.isArray(arr)) return []

  return arr
    .map((row) => ({
      title: String(row.title ?? ''),
      url: String(row.url ?? ''),
      total: Number(row.total ?? 0),
      author: String(row.author ?? ''),
      feedback: String(row.feedback ?? ''),
      tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    }))
    .sort((a, b) => b.total - a.total)
}

export async function getLastDebug(userAddress) {
  const client = await getClient(userAddress)

  const jsonStr = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_last_debug',
    args: [userAddress]
  })

  return safeJsonParse(jsonStr, { error: 'no debug', eq: '', raw: '' })
}
