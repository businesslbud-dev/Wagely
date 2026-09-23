# Wagely Frontend

A refined Next.js frontend for Wagely — a wage protection and job-record platform for daily-wage workers and contractors.

## What is included

- Homepage based on the user's three wireframes, refined into a polished product layout.
- Navigation tabs: Find Work, Post a Job, Dashboard, Profile.
- Work Passport at `/passport/[address]`.
- Find Work marketplace with search, job type filtering and seeded demo jobs.
- Job details and application flow.
- Post Job form mapped to the supplied `WageEscrow.sol` lifecycle.
- Separate Worker / Contractor dashboard experience.
- Worker cannot see contractor payment-release actions.
- Local Hardhat + MetaMask integration.
- ABI aligned to the supplied WageEscrow contract functions and events.

## Design system

`app/globals.css` is a single organised stylesheet (tokens -> base -> components ->
pages -> responsive). Earlier builds had three stacked "final polish" passes
overriding each other; that is gone. Change a colour or radius in the `:root`
token block at the top and it propagates everywhere.

- Type: Archivo (display) + Inter (body), loaded via `<link>` in `app/layout.tsx`
  so a build never fails on a font fetch. Falls back to system sans.
- Money figures use `tabular-nums` so columns of rupees line up.
- Radius carries hierarchy: 4px for slips/receipts, 8px for controls, 12px for cards.
- Logo lives in `components/Logo.tsx`; the favicon is `app/icon.svg` (same artwork).

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Demo Mode is enabled by default. The demo jobs are seeded in code, so the marketplace should show jobs even when there is no wallet or contract deployment yet.

If the browser still shows an old interface after replacing the project, stop the Next.js server, delete the `.next` folder and run `npm run dev` again. A hard refresh in the browser also helps.

## Local Hardhat

Create `.env.local` from `.env.example` and set the deployed contract address:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_LOCAL_DEPLOYED_WAGEESCROW_ADDRESS
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

Start the local Hardhat node and deploy the contract before testing on-chain actions.

## Payment permissions

The supplied contract makes `approveAndRelease(jobId)` contractor-only. The frontend only exposes that action to the contractor role. The worker action is limited to confirming job start.

The supplied `autoReleaseAfterTimeout(jobId)` function is not contractor-restricted at the Solidity level, so the frontend hides it from workers but this is not a blockchain-level permission. Restrict the Solidity function itself if the intended product rule is contractor-only timeout release.

## Important contract boundary

The current Solidity contract does not implement job applications, ratings, attendance, identity documents, disputes or a separate passport mapping. Those screens are presented as frontend/demo views and are not described as on-chain features.
