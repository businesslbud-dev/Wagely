import { Contract, Interface } from "ethers";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
export const EXPLORER_TX = process.env.NEXT_PUBLIC_EXPLORER_TX || "";

// ABI mirrors the supplied WageEscrow.sol. Keep this in sync with the contract.
export const WAGE_ESCROW_ABI = [
  "function nextJobId() view returns (uint256)",
  "function postJob(address payable worker,address supervisor,uint256 wageAmount,uint256 completionTimeout) returns (uint256 jobId)",
  "function fundEscrow(uint256 jobId) payable",
  "function confirmJobStart(uint256 jobId)",
  "function submitCompletionProof(uint256 jobId,bytes32 proofHash)",
  "function approveAndRelease(uint256 jobId)",
  "function autoReleaseAfterTimeout(uint256 jobId)",
  "function getJob(uint256 jobId) view returns (address contractor,address worker,address supervisor,uint256 wageAmount,uint256 completionTimeout,uint256 claimedAt,bytes32 proofHash,uint8 state)",
  "event JobPosted(uint256 indexed jobId,address indexed contractor,address indexed worker)",
  "event EscrowFunded(uint256 indexed jobId,uint256 amount)",
  "event JobStarted(uint256 indexed jobId)",
  "event CompletionClaimed(uint256 indexed jobId)",
  "event Released(uint256 indexed jobId,address indexed worker,uint256 amount)"
] as const;

export const contractInterface = new Interface(WAGE_ESCROW_ABI);

export type OnChainJob = {
  id: string;
  contractor: string;
  worker: string;
  supervisor: string;
  wageAmount: bigint;
  completionTimeout: bigint;
  claimedAt: bigint;
  proofHash: string;
  state: number;
  txHash?: string;
};

export function getContract(providerOrSigner: any) {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address is not configured. Add NEXT_PUBLIC_CONTRACT_ADDRESS to .env.local.");
  return new Contract(CONTRACT_ADDRESS, WAGE_ESCROW_ABI, providerOrSigner);
}

export function explorerTx(hash: string) {
  return EXPLORER_TX ? `${EXPLORER_TX}${hash}` : "";
}
