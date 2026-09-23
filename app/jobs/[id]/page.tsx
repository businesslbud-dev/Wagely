"use client";
import { useEffect, useState } from "react";
import { formatEther, id as keccakId } from "ethers";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp, isLocal } from "../../../components/providers";
import { Button, Card, Eyebrow, StatusChip, Address, Timeline, Hash } from "../../../components/ui";
import { addDemoActivity, demoJob, getDemoActivities, getJobMeta, updateDemoJob } from "../../../lib/demo";
import { getContract } from "../../../lib/contract";
import { decodeRevert } from "../../../lib/web3";
import { dateTime, remainingSeconds, countdownText } from "../../../lib/format";

async function loadChainJob(provider:any,id:string){
  const c=getContract(provider),j=await c.getJob(id);
  const names=["JobPosted","EscrowFunded","JobStarted","CompletionClaimed","Released"];
  const activities:any[]=[];
  for(const name of names){const filter=(c.filters as any)[name](id);const logs=await c.queryFilter(filter,0,"latest");for(const log of logs){const p=c.interface.parseLog(log);if(!p)continue;const b=await provider.getBlock(log.blockNumber);let detail=`Job #${id}`;if(name==="EscrowFunded")detail=`${formatEther(p.args.amount)} ETH locked in escrow`;if(name==="Released")detail=`${formatEther(p.args.amount)} ETH released to the worker`;if(name==="JobPosted")detail="Contractor posted the job";if(name==="JobStarted")detail="Worker confirmed the job started";if(name==="CompletionClaimed")detail="Supervisor submitted completion proof";activities.push({label:name,detail,timestamp:Number(b?.timestamp||Date.now()/1000),txHash:log.transactionHash,type:name==="JobPosted"?"job":name==="EscrowFunded"?"fund":name==="JobStarted"?"start":name==="CompletionClaimed"?"claim":"release"});}}
  activities.sort((a,b)=>a.timestamp-b.timestamp);return {job:{id,contractor:j[0],worker:j[1],supervisor:j[2],wageAmount:j[3],completionTimeout:j[4],claimedAt:j[5],proofHash:j[6],state:Number(j[7])},activities};
}

export default function JobDetail(){
  const {id}=useParams();
  const jobId=String(id);
  const {demo,address,provider,chainId}=useApp();
  const [job,setJob]=useState<any>(null);
  const [meta,setMeta]=useState<any>(null);
  const [activities,setActivities]=useState<any[]>([]);
  const [left,setLeft]=useState(0);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState("");
  const [demoRole,setDemoRole]=useState<"Worker"|"Contractor">("Worker");

  const load=async()=>{
    try{
      setError("");
      if(demo){
        const j=demoJob(jobId);
        if(!j){setJob(null);setMeta(null);setActivities([]);setError("This job could not be found in Demo Mode.");return;}
        setJob(j);setMeta(j);setActivities(getDemoActivities(jobId));
        setLeft(j.state===3?remainingSeconds(j.claimedAt,j.completionTimeout):0);
        return;
      }
      setMeta(getJobMeta(jobId));
      if(!provider){setJob(null);setError("Connect MetaMask to view this on-chain job.");return;}
      if(!isLocal(chainId)){setJob(null);setError("Switch MetaMask to the local Hardhat network.");return;}
      const r=await loadChainJob(provider,jobId);
      setJob(r.job);setActivities(r.activities);
      setLeft(r.job.state===3?remainingSeconds(Number(r.job.claimedAt),Number(r.job.completionTimeout)):0);
    }catch(e:any){setJob(null);setError(decodeRevert(e));}
  };

  useEffect(()=>{
    load();
    const t=setInterval(load,4000);
    const ev=()=>load();
    window.addEventListener("wagely-demo-updated",ev);
    return()=>{clearInterval(t);window.removeEventListener("wagely-demo-updated",ev)};
  },[demo,jobId,provider,chainId]);

  useEffect(()=>{
    if(!demo)return;
    const sync=()=>{
      const saved=localStorage.getItem("wagely-dashboard-role");
      setDemoRole(saved==="Contractor"?"Contractor":"Worker");
    };
    sync();
    window.addEventListener("wagely-demo-role-updated",sync);
    return()=>window.removeEventListener("wagely-demo-role-updated",sync);
  },[demo]);

  useEffect(()=>{
    if(!job||Number(job.state)!==3)return;
    const t=setInterval(()=>setLeft(remainingSeconds(Number(job.claimedAt),Number(job.completionTimeout))),1000);
    return()=>clearInterval(t);
  },[job]);

  const call=async(name:string,args:any[]=[],opts:any={})=>{
    setError("");setBusy(name);
    try{
      if(demo){
        const j=demoJob(jobId);if(!j)throw new Error("Job not found.");
        const allowed:Record<string,"Worker"|"Contractor">={fundEscrow:"Contractor",confirmJobStart:"Worker",approveAndRelease:"Contractor",autoReleaseAfterTimeout:"Contractor"};
        if(allowed[name] && demoRole!==allowed[name])throw new Error(`Demo action unavailable to ${demoRole.toLowerCase()} accounts.`);
        if(name==="submitCompletionProof")throw new Error("Demo completion proof is supervisor-only and is represented as a lifecycle step in this presentation build.");
        const ts=Math.floor(Date.now()/1000);
        if(name==="fundEscrow"){if(j.state!==0)throw new Error("Job must be Created first.");updateDemoJob(jobId,{state:1});addDemoActivity(jobId,{label:"EscrowFunded",detail:`₹${Number(j.wageAmount).toLocaleString("en-IN")} locked in escrow`,timestamp:ts,type:"fund"});}
        else if(name==="confirmJobStart"){if(j.state!==1)throw new Error("Job must be Funded first.");updateDemoJob(jobId,{state:2});addDemoActivity(jobId,{label:"JobStarted",detail:"Worker confirmed the job started",timestamp:ts,type:"start"});}
        else if(name==="approveAndRelease"){if(j.state!==3)throw new Error("Completion proof must be submitted first.");updateDemoJob(jobId,{state:4});addDemoActivity(jobId,{label:"Released",detail:`₹${Number(j.wageAmount).toLocaleString("en-IN")} released to the worker`,timestamp:ts,type:"release"});}
        else if(name==="autoReleaseAfterTimeout"){if(j.state!==3||remainingSeconds(j.claimedAt,j.completionTimeout)>0)throw new Error("The completion timeout has not passed yet.");updateDemoJob(jobId,{state:4});addDemoActivity(jobId,{label:"Released",detail:"Payment released after the completion timeout",timestamp:ts,type:"release"});}
        await new Promise(r=>setTimeout(r,250));await load();return;
      }
      if(!provider||!isLocal(chainId))throw new Error("Connect MetaMask to the local Hardhat network.");
      const c=getContract(await provider.getSigner());
      const tx=await c[name](...args,opts);await tx.wait();await load();
    }catch(e:any){setError(decodeRevert(e));}finally{setBusy("")}
  };

  if(!job)return <main className="page"><div className="container"><EmptyLoading error={error}/></div></main>;
  const state=Number(job.state);
  const countdown=state===3?countdownText(left):"";
  const title=meta?.title||`Protected job #${jobId}`;
  const company=meta?.company||"Wagely contractor";
  const canWorker=demo?demoRole==="Worker":address?.toLowerCase()===String(job.worker).toLowerCase();
  const canContractor=demo?demoRole==="Contractor":address?.toLowerCase()===String(job.contractor).toLowerCase();
  const canSupervisor=demo?false:address?.toLowerCase()===String(job.supervisor).toLowerCase();
  return <main className="page job-detail-page"><div className="container"><Link href="/jobs" className="back-link">← Back to jobs</Link>
    <div className="job-detail-layout"><div><div className="job-detail-heading"><div><span className="job-category">{meta?.jobType||"CONSTRUCTION"}</span><h1>{title}</h1><p>{company} · {meta?.location||"Local site"}</p></div><StatusChip state={state}/></div>
      <Card className="job-summary-card"><div className="job-price"><span>{demo?`₹${Number(job.wageAmount).toLocaleString("en-IN")}`:`${job.wageAmount ? formatEther(job.wageAmount) : "0"} ETH`}</span><small>protected wage</small></div><div className="summary-stats"><span><b>{meta?.duration||"—"}</b><small>Duration</small></span><span><b>{meta?.workersRequired||1}</b><small>Workers</small></span><span><b>{meta?.location||"Local"}</b><small>Location</small></span></div><div className="protected-banner">✓ WageEscrow lifecycle · {state===4?"Payment released":"Payment status visible"}</div></Card>
      <section className="detail-section"><Eyebrow>ABOUT THIS JOB</Eyebrow><h2>{meta?.description||"This job is represented by the WageEscrow contract. The supplied Solidity contract stores the escrow participants, amount, timeout and completion proof."}</h2></section>
      {meta?.requirements?.length&&<section className="detail-section"><Eyebrow>REQUIREMENTS</Eyebrow><ul className="requirements">{meta.requirements.map((r:string)=><li key={r}>✓ {r}</li>)}</ul></section>}
      <section className="detail-section"><Eyebrow>JOB DETAILS</Eyebrow><div className="detail-table"><Row label="Job type" value={meta?.jobType||"Protected job"}/><Row label="Duration" value={meta?.duration||"Not stored on-chain"}/><Row label="Workers required" value={String(meta?.workersRequired||1)}/><Row label="Location" value={meta?.location||"Not stored on-chain"}/><Row label="Contractor" value={<Address value={job.contractor}/>}/><Row label="Worker" value={<Address value={job.worker}/>}/><Row label="Supervisor" value={<Address value={job.supervisor}/>}/><Row label="Completion timeout" value={`${job.completionTimeout?.toString?.()||0} seconds`}/></div></section>
      </div>
      <aside className="job-sidebar"><Card className="apply-card"><Eyebrow>JOB STATUS</Eyebrow><h2>{state===4?"Payment released":"Follow the job lifecycle"}</h2><p>Wagely keeps the contract state visible instead of hiding it behind a transaction hash.</p><div className="state-list">{["Created","Funded","Started","CompletionClaimed","Released"].map((s,i)=><div className={`${i<state?"done":""} ${i===state?"current":""}`} key={s}><span>{i<state?"✓":i+1}</span>{s}</div>)}</div>
        {state===3&&<div className="countdown"><span>Auto-release window</span><strong>{countdown}</strong><small>{left?"Time remaining before the timeout can be triggered.":"Timeout reached."}</small></div>}
        <div className="application-link-wrap"><Link className="btn btn-secondary" href={`/jobs/${jobId}/apply`}>Apply / show interest</Link><small>This is a frontend application flow; the supplied contract does not implement job applications.</small></div>
        <div className="demo-role-note"><span>Current demo role</span><b>{demo?demoRole:"Wallet role"}</b>{demo&&<small>Switch Worker / Contractor from the Dashboard.</small>}</div>
        <div className="action-stack">
          {state===0&&(canContractor?<Button loading={busy==="fundEscrow"} onClick={()=>call("fundEscrow",[jobId],{value:job.wageAmount})}>Fund escrow & continue</Button>:<div className="action-wait">Waiting for the <b>contractor</b> to fund the escrow.</div>)}
          {state===1&&(canWorker?<Button loading={busy==="confirmJobStart"} onClick={()=>call("confirmJobStart",[jobId])}>Confirm job start</Button>:<div className="action-wait">Waiting for the <b>worker</b> to confirm the job start.</div>)}
          {state===2&&(canSupervisor?<Button loading={busy==="submitCompletionProof"} onClick={()=>call("submitCompletionProof",[jobId,keccakId(`wagely:${jobId}:${Date.now()}`)])}>Submit completion proof</Button>:<div className="action-wait">Waiting for the <b>supervisor</b> to submit completion proof.</div>)}
          {state===3&&(canContractor?<Button loading={busy==="approveAndRelease"} onClick={()=>call("approveAndRelease",[jobId])}>Approve & release payment</Button>:<div className="action-wait">Completion has been claimed. The <b>contractor</b> must approve the payment release.</div>)}
          {state===3&&left===0&&canContractor&&<Button variant="secondary" loading={busy==="autoReleaseAfterTimeout"} onClick={()=>call("autoReleaseAfterTimeout",[jobId])}>Trigger timeout release</Button>}
          {state===0&&<span className="action-help">Only the contractor funds the escrow. The worker never releases the normal payment.</span>}
        </div>
        <div className="role-help"><b>Who acts next?</b><span>{state===1?"Worker":state===2?"Supervisor":state===3?"Contractor":"—"}</span></div>
      </Card>
      <Card><Eyebrow>CONTRACT RECORD</Eyebrow><div className="mini-record"><Row label="Job ID" value={`#${jobId}`}/><Row label="Claimed at" value={job.claimedAt?dateTime(Number(job.claimedAt)):"Not yet"}/><Row label="Proof hash" value={<Hash value={job.proofHash}/>}/></div></Card></aside></div>
    <section className="activity-section"><div><Eyebrow>ACTIVITY</Eyebrow><h2>Job timeline</h2></div><Card>{activities.length?<Timeline items={activities}/>:<p className="body-copy">No events found yet. Fund the job to begin the lifecycle.</p>}</Card></section>
    {error&&<div className="alert error fixed-alert">{error}</div>}
  </div></main>
}
function Row({label,value}:{label:string;value:React.ReactNode}){return <div className="detail-row"><span>{label}</span><b>{value}</b></div>}
function EmptyLoading({error}:{error:string}){return <Card><p className="body-copy">{error||"Loading job…"}</p></Card>}
