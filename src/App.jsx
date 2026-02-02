import { useState } from 'react'
import WalletConnect from './components/WalletConnect'
import JudgeScreen from './components/JudgeScreen'

export default function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [walletObj, setWalletObj] = useState(null)

  function handleConnected(payload) {
    setWalletObj(payload)
    setWalletAddress(payload?.address || '')
  }

  function disconnect() {
    setWalletObj(null)
    setWalletAddress('')
  }

  if (!walletAddress) {
    return <WalletConnect onConnected={handleConnected} />
  }

  return (
    <JudgeScreen
      walletAddress={walletAddress}
      wallet={walletObj}
      onDisconnect={disconnect}
    />
  )
}
