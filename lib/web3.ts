import { BrowserProvider, JsonRpcProvider, Network, TransactionResponse, isAddress } from "ethers";
import { CHAIN_ID, RPC_URL, contractInterface, getContract } from "./contract";

declare global { interface Window { ethereum?: any; } }

export async function getBrowserProvider() {
  if (!window.ethereum) throw new Error("No wallet detected. Install MetaMask.");
  return new BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = await getBrowserProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  return { address: await signer.getAddress(), chainId: Number(network.chainId), provider };
}

export async function currentWallet() {
  if (!window.ethereum) return null;
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (!accounts?.length) return null;
  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  return { address: accounts[0], chainId: Number(network.chainId), provider };
}

export async function switchToLocal() {
  if (!window.ethereum) throw new Error("No wallet detected.");
  const hex = "0x" + CHAIN_ID.toString(16);
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
  } catch (error: any) {
    if (error?.code !== 4902) throw error;
    await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{
      chainId: hex, chainName: "Hardhat Local", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: [RPC_URL]
    }] });
  }
}

export function readProvider() { return new JsonRpcProvider(RPC_URL, Network.from({ name: "hardhat-local", chainId: CHAIN_ID })); }
export async function assertContract() { if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) throw new Error("Contract address is not configured."); const provider = readProvider(); const code = await provider.getCode(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS); if (code === "0x") throw new Error("No contract bytecode found at the configured address."); return getContract(provider); }
export function decodeRevert(error: any) {
  if (error?.code === "ACTION_REJECTED" || error?.code === 4001) return "Transaction rejected in MetaMask.";
  if (error?.code === "INSUFFICIENT_FUNDS") return "Not enough ETH in the local wallet for gas or escrow funding.";
  const data = error?.data || error?.info?.error?.data || error?.error?.data || error?.revert?.data;
  if (data && typeof data === "string" && data.startsWith("0x")) {
    try { const parsed = contractInterface.parseError(data); if (parsed) return parsed.name === "Error" ? String(parsed.args[0]) : parsed.name; } catch {}
  }
  return String(error?.shortMessage || error?.reason || error?.message || "Transaction failed.");
}
export function isValidAddress(value: string) { return isAddress(value); }
export async function waitForTx(txPromise: Promise<TransactionResponse>, onSubmitted: (tx: TransactionResponse) => void) { const tx = await txPromise; onSubmitted(tx); const receipt = await tx.wait(); if (!receipt) throw new Error("Transaction was not mined."); return receipt; }
