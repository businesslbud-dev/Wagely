"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp, isLocal } from "../../../components/providers";
import { Card, Eyebrow, EmptyState, StatusChip } from "../../../components/ui";
import { DEMO_ADDRESSES, getDemoJobs, getJobMeta } from "../../../lib/demo";
import { getContract } from "../../../lib/contract";
import { shortAddress, dateTime } from "../../../lib/format";
import { STATES } from "../../../lib/types";

async function loadOnChainJobs(provider: any) {
  const contract = getContract(provider);
  const logs = await contract.queryFilter(contract.filters.JobPosted(), 0, "latest");
  const rows = await Promise.all(logs.map(async (log: any) => {
    const parsed = contract.interface.parseLog(log);
    if (!parsed) return null;
    const id = parsed.args.jobId.toString();
    const j = await contract.getJob(id);
    return {
      id,
      contractor: j[0],
      worker: j[1],
      supervisor: j[2],
      wageAmount: j[3],
      completionTimeout: Number(j[4]),
      claimedAt: Number(j[5]),
      proofHash: j[6],
      state: Number(j[7]),
      txHash: log.transactionHash,
    };
  }));
  return rows.filter(Boolean).reverse();
}

export default function WorkPassport() {
  const params = useParams<{ address: string }>();
  const { demo, address, provider, chainId } = useApp();
  const requested = String(params.address || "");
  const wallet = demo ? DEMO_ADDRESSES.worker : requested || address || "";
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        if (demo) {
          setJobs(getDemoJobs().filter(j => j.worker.toLowerCase() === wallet.toLowerCase()));
          return;
        }
        if (!provider || !isLocal(chainId)) {
          setJobs([]);
          return;
        }
        const rows = await loadOnChainJobs(provider);
        setJobs(rows.filter((j: any) => j.worker.toLowerCase() === wallet.toLowerCase()));
      } catch (e: any) {
        setError(e?.shortMessage || e?.message || "Could not load the work record.");
      }
    };
    if (wallet) load();
  }, [demo, provider, chainId, wallet]);

  const completed = jobs.filter(j => Number(j.state) === 4);
  const active = jobs.filter(j => [1, 2, 3].includes(Number(j.state)));
  const totalRecorded = jobs.reduce((sum, j) => sum + Number(j.wageAmount || 0), 0);
  const paid = completed.reduce((sum, j) => sum + Number(j.wageAmount || 0), 0);
  const displayName = demo ? "Ravi Kumar" : "Wagely Worker";

  const subtitle = useMemo(() => {
    if (!wallet) return "Connect a wallet to view a worker record.";
    return `Public work record linked to ${shortAddress(wallet, 8)}`;
  }, [wallet]);

  if (!wallet) {
    return <main className="page"><div className="container"><EmptyState title="Connect a wallet" text="Your Work Passport is linked to a wallet address. Connect MetaMask or turn Demo on." action={<Link className="btn btn-primary" href="/profile">Go to profile</Link>} /></div></main>;
  }

  return (
    <main className="page passport-page">
      <div className="container">
        <Link href="/profile" className="back-link">← Back to profile</Link>

        <section className="passport-hero">
          <div>
            <div className="passport-badge">WAGELY WORK PASSPORT</div>
            <h1>{displayName}</h1>
            <p>{subtitle}</p>
            <div className="passport-wallet">{wallet}</div>
          </div>
          <div className="passport-mark">W</div>
        </section>

        {error && <div className="alert error">{error}</div>}
        {!demo && !isLocal(chainId) && <div className="local-note">Switch MetaMask to the local Hardhat network to load the on-chain work record.</div>}

        <section className="passport-stats">
          <div className="passport-stat"><span>Jobs recorded</span><strong>{jobs.length}</strong><small>Linked to this wallet</small></div>
          <div className="passport-stat"><span>Completed</span><strong>{completed.length}</strong><small>Payment released</small></div>
          <div className="passport-stat"><span>Active</span><strong>{active.length}</strong><small>Funded or in progress</small></div>
          <div className="passport-stat"><span>Recorded wages</span><strong>₹{totalRecorded.toLocaleString("en-IN")}</strong><small>Across listed jobs</small></div>
        </section>

        <div className="passport-grid">
          <Card>
            <Eyebrow>WORK HISTORY</Eyebrow>
            <h2 className="passport-section-title">Jobs linked to this wallet</h2>
            {jobs.length === 0 ? (
              <EmptyState title="No work recorded yet" text="Jobs completed or currently assigned to this wallet will appear here." />
            ) : (
              <div className="passport-history">
                {jobs.map((job: any) => {
                  const meta = demo ? job : getJobMeta(job.id);
                  const wage = Number(job.wageAmount || 0).toLocaleString("en-IN");
                  return (
                    <Link href={`/jobs/${job.id}`} className="passport-job" key={job.id}>
                      <div className="passport-job-main">
                        <span>{meta?.jobType || "WAGELY JOB"}</span>
                        <h3>{meta?.title || `Protected Job #${job.id}`}</h3>
                        <p>{meta?.company || "Wagely contractor"} · {meta?.location || "Local site"}</p>
                      </div>
                      <div className="passport-job-side">
                        <StatusChip state={Number(job.state)} />
                        <strong>₹{wage}</strong>
                        <small>{meta?.duration || "Recorded job"}</small>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="passport-side">
            <Card>
              <Eyebrow>PAYMENT RECORD</Eyebrow>
              <div className="passport-money">₹{paid.toLocaleString("en-IN")}</div>
              <p className="passport-muted">Released wages from completed Wagely jobs in this record.</p>
              <div className="passport-line"><span>Completed jobs</span><b>{completed.length}</b></div>
              <div className="passport-line"><span>Active jobs</span><b>{active.length}</b></div>
            </Card>

            <Card>
              <Eyebrow>HOW IT WORKS</Eyebrow>
              <div className="passport-steps">
                <div><b>01</b><span>Job is posted for your wallet</span></div>
                <div><b>02</b><span>Contractor funds the wage escrow</span></div>
                <div><b>03</b><span>Work starts and completion is recorded</span></div>
                <div><b>04</b><span>Payment is released to the worker</span></div>
              </div>
            </Card>
          </div>
        </div>

        <div className="passport-footnote">
          <strong>What this passport represents</strong>
          <span>This page is a readable work-history view built from Wagely job records. The current contract does not store a separate passport profile, ratings, attendance or identity documents.</span>
        </div>
      </div>
    </main>
  );
}
