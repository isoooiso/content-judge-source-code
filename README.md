# Content Judge (GenLayer)

A simple on-chain AI consensus app that evaluates content in different modes: GenLayer project, Startup pitch, Article, Meme idea.

## Features
- MetaMask connect
- Switch to GenLayer Studio network (Chain ID 61999)
- On-chain AI scoring (0–50) across 5 criteria
- Shareable score summary
- Public on-chain gallery for top entries
- Debug panel if AI falls back

## Install & Run
```bash
npm install
cp .env.example .env
```

Edit `.env`:
```bash
VITE_GENLAYER_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
VITE_GENLAYER_RPC=https://studio.genlayer.com/api
```

Start:
```bash
npm run dev
```

## Deploy contract (GenLayer Studio)
Open `contracts/contract.py` in GenLayer Studio and deploy.
Copy the deployed contract address into `.env` / `.env.production`.

## GitHub Pages
1) Update `vite.config.js` base to `/<repo-name>/` if your repo name is different.
2) Create `.env.production`:
```bash
VITE_GENLAYER_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
VITE_GENLAYER_RPC=https://studio.genlayer.com/api
```
3) Build:
```bash
npm run build
```
4) Upload the **contents** of `dist/` to your repo root, then enable GitHub Pages.

