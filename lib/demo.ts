import type { Activity, DemoJob, JobMeta } from "./types";

export const DEMO_ADDRESSES = {
  contractor: "0x1111111111111111111111111111111111111111",
  worker: "0x2222222222222222222222222222222222222222",
  supervisor: "0x3333333333333333333333333333333333333333"
};

const JOBS_KEY = "wagely-demo-jobs-v3";
const META_KEY = "wagely-job-meta-v1";
const ACTIVITY_KEY = "wagely-demo-activity-v3";
const now = () => Math.floor(Date.now() / 1000);

const INITIAL_JOBS: DemoJob[] = [
  {
    id: "1042", title: "Community Hall Renovation", company: "Sri Buildworks", description: "Assist with renovation work, material movement and general site support for a community hall.", jobType: "Construction", workersRequired: 2, duration: "6 days", location: "Perungalathur, Chennai", requirements: ["Basic construction experience", "Available for 6 days", "Report to site on time"], wageDisplay: "₹8,500", createdAt: now() - 74000,
    contractor: DEMO_ADDRESSES.contractor, worker: DEMO_ADDRESSES.worker, supervisor: DEMO_ADDRESSES.supervisor, wageAmount: "8500", completionTimeout: 60, claimedAt: now() - 2120, proofHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", state: 3,
    txHash: "0x7d4e8c5f3a9b2d1e6f7081928374655647382910abcdefabcdefabcdefabcd"
  },
  {
    id: "1038", title: "Apartment Tiling", company: "Metro Contractors", description: "Support a residential tiling team with surface preparation, material handling and cleanup.", jobType: "Masonry", workersRequired: 1, duration: "9 days", location: "Tambaram, Chennai", requirements: ["Previous site experience", "Comfortable with physical work"], wageDisplay: "₹12,400", createdAt: now() - 300000,
    contractor: "0x4444444444444444444444444444444444444444", worker: DEMO_ADDRESSES.worker, supervisor: DEMO_ADDRESSES.supervisor, wageAmount: "12400", completionTimeout: 60, claimedAt: now() - 172800, proofHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", state: 4,
    txHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  },
  {
    id: "1031", title: "Electrical Refit", company: "Southside Works", description: "Assist an electrician with cable routing, fittings and basic site preparation.", jobType: "Electrical", workersRequired: 1, duration: "5 days", location: "Chromepet, Chennai", requirements: ["Basic electrical site experience", "Safety-first working style"], wageDisplay: "₹7,200", createdAt: now() - 1000100,
    contractor: "0x5555555555555555555555555555555555555555", worker: DEMO_ADDRESSES.worker, supervisor: DEMO_ADDRESSES.supervisor, wageAmount: "7200", completionTimeout: 60, claimedAt: now() - 998000, proofHash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc", state: 4,
    txHash: "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
  },
  {
    id: "1026", title: "Warehouse Loading Crew", company: "Eastline Logistics", description: "Short-term loading and unloading support for a warehouse shift.", jobType: "General Labour", workersRequired: 4, duration: "3 days", location: "Guindy, Chennai", requirements: ["Physically fit", "Morning shift availability"], wageDisplay: "₹1,100 / day", createdAt: now() - 1600000,
    contractor: "0x6666666666666666666666666666666666666666", worker: "0x7777777777777777777777777777777777777777", supervisor: DEMO_ADDRESSES.supervisor, wageAmount: "3300", completionTimeout: 60, claimedAt: 0, proofHash: "0x0000000000000000000000000000000000000000000000000000000000000000", state: 1,
    txHash: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  }
];

const INITIAL_ACTIVITY: Record<string, Activity[]> = {
  "1042": [
    { label: "JobPosted", detail: "Contractor posted job #1042", timestamp: now() - 74000, type: "job" },
    { label: "EscrowFunded", detail: "₹8,500 locked in escrow", timestamp: now() - 73500, type: "fund" },
    { label: "JobStarted", detail: "Worker confirmed the job started", timestamp: now() - 70000, type: "start" },
    { label: "CompletionClaimed", detail: "Supervisor submitted completion proof", timestamp: now() - 2120, type: "claim" }
  ],
  "1038": [
    { label: "JobPosted", detail: "Contractor posted job #1038", timestamp: now() - 300000, type: "job" },
    { label: "EscrowFunded", detail: "₹12,400 locked in escrow", timestamp: now() - 299000, type: "fund" },
    { label: "JobStarted", detail: "Worker confirmed the job started", timestamp: now() - 250000, type: "start" },
    { label: "CompletionClaimed", detail: "Supervisor submitted completion proof", timestamp: now() - 172800, type: "claim" },
    { label: "Released", detail: "₹12,400 released to the worker", timestamp: now() - 170000, type: "release" }
  ]
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("wagely-demo-updated"));
}

export function getDemoJobs(): DemoJob[] { const jobs = read<DemoJob[]>(JOBS_KEY, INITIAL_JOBS); return Array.isArray(jobs) && jobs.length ? jobs : INITIAL_JOBS; }
export function saveDemoJob(job: DemoJob) { const jobs = getDemoJobs(); write(JOBS_KEY, [job, ...jobs.filter(j => j.id !== job.id)]); }
export function demoJob(id: string) { return getDemoJobs().find(j => j.id === id) || null; }
export function updateDemoJob(id: string, patch: Partial<DemoJob>) { const jobs = getDemoJobs(); const updated = jobs.map(j => j.id === id ? { ...j, ...patch } : j); write(JOBS_KEY, updated); return updated.find(j => j.id === id) || null; }
export function nextDemoJobId() { return String(getDemoJobs().reduce((m, j) => Math.max(m, Number(j.id) || 0), 1042) + 1); }
export function getDemoActivities(jobId?: string): Activity[] { const all = read<Record<string, Activity[]>>(ACTIVITY_KEY, INITIAL_ACTIVITY); return jobId ? all[jobId] || [] : Object.values(all).flat().sort((a,b) => b.timestamp-a.timestamp); }
export function addDemoActivity(jobId: string, activity: Activity) { const all = read<Record<string, Activity[]>>(ACTIVITY_KEY, INITIAL_ACTIVITY); all[jobId] = [...(all[jobId] || []), activity]; write(ACTIVITY_KEY, all); }
export function getJobMeta(id: string): JobMeta | null { return read<Record<string, JobMeta>>(META_KEY, {})[id] || null; }
export function saveJobMeta(meta: JobMeta) { const all = read<Record<string, JobMeta>>(META_KEY, {}); all[meta.id] = meta; write(META_KEY, all); }
export function resetDemoData() { write(JOBS_KEY, INITIAL_JOBS); write(ACTIVITY_KEY, INITIAL_ACTIVITY); write(META_KEY, {}); }
