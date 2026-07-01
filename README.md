# Replicon Protocol

**Decentralized Research Interpretation and Replication Consensus**

Replicon uses GenLayer Intelligent Contracts and decentralized AI consensus to determine whether research findings are meaningful, credible, and reproducible.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Blockchain | GenLayer StudioNet, GEN Token |
| Contract SDK | genlayer-js 1.1.8 |
| Wallet | Injected (MetaMask, Rainbow, Zerion, WalletConnect) |
| Deployment | Vercel (frontend) + GenLayer Studio (contract) |

## Quick Start

```powershell
cd replicon-app
npm install
copy .env.example .env.local
# Edit .env.local — add your contract address after deployment
npm run dev
```

Open http://localhost:3000

## Contract Deployment

1. Open https://studio.genlayer.com
2. Create a new Intelligent Contract
3. Paste the contents of `contract/replicon.py`
4. Deploy to StudioNet
5. Copy the contract address
6. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...your_address...
   ```
7. Restart dev server: `npm run dev`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | GenLayer StudioNet RPC | `https://studio.genlayer.com/api` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | *(required after deploy)* |
| `NEXT_PUBLIC_EXPLORER_URL` | GenLayer explorer base URL | `https://studio.genlayer.com` |

## App Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Research case overview + stats |
| `/cases` | Browse all research cases |
| `/cases/new` | Create a new research case |
| `/cases/[id]` | Case detail, evidence, AI verdict |
| `/evidence` | Global evidence registry |
| `/settings` | Wallet + network settings |

## Primary Workflow

```
1. Connect Wallet (MetaMask / WalletConnect)
   ↓
2. Create Research Case
   title, domain, authors, research question,
   summary, main claim, hypothesis, evidence summary
   ↓
3. Submit Evidence (public URLs only)
   arXiv papers, DOI links, GitHub repos,
   PubMed, clinical trials, datasets...
   ↓
4. Request AI Review
   GenLayer validators evaluate credibility
   using non-deterministic AI consensus
   ↓
5. Consensus Verdict (on-chain)
   Replication Score, Statistical Significance,
   Methodology Quality, Evidence Strength,
   Novelty Score, Confidence Score, Credibility Verdict
```

## Consensus Output Model

The AI produces:

- **Replication Score** (0–100%)
- **Statistical Significance** (Very Strong → Very Weak)
- **Methodology Quality** (Very High → Very Low)
- **Evidence Strength** (Very High → Very Low)
- **Novelty Score** (0–100%)
- **Confidence Score** (0–100%)
- **Contradiction Level** (None → Very High)
- **Credibility Verdict** (highly_credible → not_credible)
- **Recommended Follow-Up Research**
- **Reasoning Summary**
- **Key Supporting Evidence**
- **Key Concerns**

## Vercel Deployment

```powershell
npx vercel --prod
```

Set environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

## Design System

- **Primary Background**: `#49225B`
- **Action Buttons**: `#6E3482`
- **Highlights**: `#A56ABD`
- **Secondary Surfaces**: `#E7DBEF`
- **Typography / Cards**: `#F5EBFA`
- **Font**: Shantell Sans (Google Fonts)
- **Direction**: Scientific Noir — research intelligence terminal aesthetic
