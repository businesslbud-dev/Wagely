"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp, isLocal } from "../../components/providers";
import { EmptyState, Eyebrow, JobCard } from "../../components/ui";
import { DEMO_ADDRESSES, getDemoJobs, getJobMeta } from "../../lib/demo";
import { getContract } from "../../lib/contract";

async function loadOnChainJobs(provider:any){
  const c=getContract(provider);
  const logs=await c.queryFilter(c.filters.JobPosted(),0,"latest");
  const rows=await Promise.all(logs.map(async(log:any)=>{const p=c.interface.parseLog(log);if(!p)return null;const id=p.args.jobId.toString();const j=await c.getJob(id);return {id,contractor:j[0],worker:j[1],supervisor:j[2],wageAmount:j[3],completionTimeout:j[4],claimedAt:j[5],proofHash:j[6],state:Number(j[7]),txHash:log.transactionHash};}));
  return rows.filter(Boolean).reverse();
}

export default function Jobs(){
  const {demo,setDemo,provider,chainId}=useApp();
  const [jobs,setJobs]=useState<any[]>([]),[query,setQuery]=useState(""),[type,setType]=useState("All"),[error,setError]=useState("");
  useEffect(()=>{const load=async()=>{try{setError("");if(demo){setJobs(getDemoJobs());return;}if(!provider||!isLocal(chainId)){setJobs([]);return;}setJobs(await loadOnChainJobs(provider));}catch(e:any){setError(e?.shortMessage||e?.message||"Could not load jobs.");}};load();const timer=setInterval(load,4000);const ev=()=>load();window.addEventListener("wagely-demo-updated",ev);return()=>{clearInterval(timer);window.removeEventListener("wagely-demo-updated",ev)}},[demo,provider,chainId]);
  const enriched=useMemo(()=>jobs.map(j=>({...j,meta:demo?j:getJobMeta(j.id)})),[jobs,demo]);
  const types=["All",...Array.from(new Set(enriched.map(j=>j.meta?.jobType||j.jobType).filter(Boolean)))];
  const filtered=enriched.filter(j=>{const m=j.meta||{};const text=[m.title,j.title,m.company,j.company,m.description,j.description,m.location,j.location].join(" ").toLowerCase();return text.includes(query.toLowerCase())&&(type==="All"||(m.jobType||j.jobType)===type)});
  return <main className="page jobs-page"><div className="container">
    <div className="jobs-hero"><div><Eyebrow>FIND WORK</Eyebrow><h1 className="page-title">Find work that pays fairly.</h1><p>Browse clear job details, compare wages and see exactly where each job sits in the payment lifecycle.</p></div><Link className="btn btn-primary" href="/jobs/new">Post a job <span>→</span></Link></div>
    <div className="search-bar"><div className="search-input"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search jobs, companies or locations"/></div><select value={type} onChange={e=>setType(e.target.value)}>{types.map(t=><option key={t}>{t}</option>)}</select></div>
    {error&&<div className="alert error mb-5">{error}</div>}
    {!demo&&!provider&&<div className="local-note"><b>Local Hardhat mode</b><span>Connect MetaMask to load jobs from the deployed WageEscrow contract. Turn Demo on in the header if you want to preview the full interface without a wallet.</span></div>}
    <div className="results-head"><div><Eyebrow>AVAILABLE JOBS</Eyebrow><h2>{filtered.length} job{filtered.length===1?"":"s"}</h2></div><span className="results-note">Wage protection is shown when escrow is funded</span></div>
    {filtered.length?<div className="jobs-list">{filtered.map(j=><JobCard key={j.id} job={j} meta={j.meta}/>)}</div>:<EmptyState title="No jobs match your search" text={demo?"Try a different keyword or job type.":"Connect MetaMask to your local Hardhat network, or switch Demo on to preview the marketplace."} action={!demo&&!provider?<button className="btn btn-secondary" onClick={()=>setDemo(true)}>Use Demo Mode</button>:undefined}/>}
  </div></main>
}
