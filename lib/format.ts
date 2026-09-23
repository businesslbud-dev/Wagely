import { formatEther, isAddress } from "ethers";

export function shortAddress(value: string, chars = 4) {
  if (!value) return "—";
  return `${value.slice(0, chars + 2)}…${value.slice(-chars)}`;
}

export function shortHash(value: string, chars = 8) {
  if (!value) return "—";
  return `${value.slice(0, chars + 2)}…${value.slice(-chars)}`;
}

export function weiToMatic(value: bigint | string | number) {
  return formatEther(BigInt(value));
}

export function rupeesFromWei(value: bigint | string | number) {
  const matic = Number(formatEther(BigInt(value)));
  return `₹${matic.toLocaleString("en-IN", { maximumFractionDigits: 4 })}`;
}

export function validAddress(value: string) {
  return isAddress(value);
}

export function dateTime(seconds: number | bigint) {
  return new Date(Number(seconds) * 1000).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function remainingSeconds(claimedAt: number, timeout: number) {
  return Math.max(0, claimedAt + timeout - Math.floor(Date.now() / 1000));
}

export function countdownText(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}