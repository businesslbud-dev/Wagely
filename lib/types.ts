export const STATES = ["Created", "Funded", "Started", "CompletionClaimed", "Released"] as const;
export type StateName = typeof STATES[number];

export type JobMeta = {
  id: string;
  title: string;
  company: string;
  description: string;
  jobType: string;
  workersRequired: number;
  duration: string;
  location: string;
  requirements: string[];
  wageDisplay?: string;
  createdAt: number;
};

export type DemoJob = JobMeta & {
  contractor: string;
  worker: string;
  supervisor: string;
  wageAmount: string;
  completionTimeout: number;
  claimedAt: number;
  proofHash: string;
  state: number;
  txHash?: string;
};

export type Activity = {
  label: string;
  detail: string;
  timestamp: number;
  txHash?: string;
  type: "job" | "fund" | "start" | "claim" | "release";
};
