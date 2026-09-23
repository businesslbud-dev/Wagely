"use client";

import Link from "next/link";
import { useApp } from "../../components/providers";
import { Button, Card, Eyebrow, StatusChip } from "../../components/ui";
import { DEMO_ADDRESSES, getDemoJobs } from "../../lib/demo";
import { shortAddress } from "../../lib/format";

export default function Profile() {
  const { demo, address, connect } = useApp();

  const wallet = demo ? DEMO_ADDRESSES.worker : address;
  const jobs = demo
    ? getDemoJobs().filter((j) => j.worker.toLowerCase() === DEMO_ADDRESSES.worker.toLowerCase())
    : [];

  const completed = jobs.filter((j) => j.state === 4);
  const active = jobs.filter((j) => j.state >= 1 && j.state <= 3);
  const cleared = completed.reduce((sum, j) => sum + (Number(j.wageAmount) || 0), 0);
  const name = demo ? "Ravi Kumar" : address ? "Wallet worker" : "Not connected";
  const initials = demo ? "RK" : address ? address.slice(2, 4).toUpperCase() : "—";

  return (
    <main className="page">
      <div className="container">
        <div className="profile-top">
          <div>
            <Eyebrow>PROFILE</Eyebrow>
            <h1 className="page-title">Your Wagely account.</h1>
            <p>Who you are, the wallet you work under, and the record that follows you.</p>
          </div>
          {!address && !demo && <Button onClick={() => connect().catch(() => {})}>Connect wallet</Button>}
        </div>

        <div className="profile-grid">
          {/* Identity */}
          <Card className="identity-card">
            <div className="identity-head">
              <span className="profile-avatar">{initials}</span>
              <div>
                <h2>{name}</h2>
                <p>{demo ? "Worker · Demo account" : address ? "Connected account" : "No wallet connected"}</p>
              </div>
            </div>

            <div className="identity-rows">
              <div><span>Role</span><b>Worker</b></div>
              <div><span>Based in</span><b>{demo ? "Chennai" : "—"}</b></div>
              <div><span>Member since</span><b>{demo ? "2024" : "—"}</b></div>
            </div>

            <div className="wallet-box">
              <span>Wallet address</span>
              <b>{wallet ? shortAddress(wallet, 8) : "Not connected"}</b>
            </div>
          </Card>

          {/* Work Passport */}
          <Card className="passport-card">
            <div className="passport-card-head">
              <div>
                <Eyebrow>WORK PASSPORT</Eyebrow>
                <h2>What your record says.</h2>
              </div>
              <span className="status success">Verified by escrow</span>
            </div>

            <p className="passport-card-lede">
              Every job that cleared through Wagely stays here. Show it to the next contractor
              instead of asking them to take your word for it.
            </p>

            <div className="passport-figures">
              <div>
                <b>{completed.length}</b>
                <small>Jobs completed</small>
              </div>
              <div>
                <b>₹{cleared.toLocaleString("en-IN")}</b>
                <small>Wages cleared</small>
              </div>
              <div>
                <b>{active.length}</b>
                <small>In progress</small>
              </div>
            </div>

            <div className="profile-links">
              <Link href={`/passport/${wallet || ""}`}>View full Work Passport</Link>
              <Link href="/jobs">Find more work</Link>
              <Link href="/dashboard">Open dashboard</Link>
            </div>
          </Card>
        </div>

        {/* Work history */}
        <section className="history-section">
          <div className="section-row-head">
            <div>
              <Eyebrow>WORK HISTORY</Eyebrow>
              <h2>Jobs on this wallet</h2>
            </div>
            <span className="result-count">{jobs.length} record{jobs.length === 1 ? "" : "s"}</span>
          </div>

          <Card>
            {jobs.length ? (
              <div className="history-list">
                {jobs.map((job) => (
                  <Link href={`/jobs/${job.id}`} className="history-row" key={job.id}>
                    <div className="history-main">
                      <b>{job.title}</b>
                      <small>{job.company} · {job.location} · {job.duration}</small>
                    </div>
                    <span className="history-wage">{job.wageDisplay}</span>
                    <StatusChip state={Number(job.state)} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="body-copy">
                No jobs on this wallet yet. Browse open work to get your first record started.
              </p>
            )}
          </Card>
        </section>

        <div className="profile-note">
          <b>What is actually on-chain</b>
          <p>
            The WageEscrow contract stores the job participants, the wage, the timeout and the
            completion proof. Names, ratings, attendance and identity documents are not stored
            on-chain, so this page does not present them as if they were.
          </p>
        </div>
      </div>
    </main>
  );
}
