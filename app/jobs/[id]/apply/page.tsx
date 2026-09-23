"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../../components/providers";
import { Card, Eyebrow, Button } from "../../../../components/ui";
import { demoJob } from "../../../../lib/demo";

export default function ApplyPage(){const {id}=useParams();const router=useRouter();const {demo,address}=useApp();const job=demo?demoJob(String(id)):null;const [done,setDone]=useState(false);const [name,setName]=useState(demo?"Ravi Kumar":"");
  return <main className="page"><div className="container max-w-4xl"><Link href={`/jobs/${id}`} className="back-link">← Back to job</Link><div className="form-heading"><div><Eyebrow>JOB APPLICATION</Eyebrow><h1 className="page-title">Confirm your interest.</h1><p>This screen follows the application flow from the project wireframe. The current WageEscrow contract does not have an application function, so confirming here does not change the on-chain worker address.</p></div></div>
    <div className="application-grid"><Card><Eyebrow>YOUR DETAILS</Eyebrow><div className="form-grid"><div className="field"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div><div className="field"><label>Wallet</label><input value={address||"Connect wallet first"} readOnly/></div><div className="field"><label>Worker ID</label><input value={demo?"WG-1042":"—"} readOnly/></div></div></Card><Card><Eyebrow>JOB SUMMARY</Eyebrow><div className="application-summary"><h2>{job?.title||`Job #${id}`}</h2><p>{job?.company||"Contractor details are loaded from the job metadata."}</p><div><span>Wage</span><b>{job?.wageDisplay||"See job details"}</b></div><div><span>Duration</span><b>{job?.duration||"—"}</b></div><div><span>Location</span><b>{job?.location||"—"}</b></div></div><div className="form-footer"><Button disabled={!name.trim()} onClick={()=>setDone(true)}>Confirm application</Button></div></Card></div>
    {done&&<div className="success-panel mt-5"><div><Eyebrow>APPLICATION RECORDED</Eyebrow><h2>Interest confirmed.</h2><p>This frontend records the confirmation for the demo experience. The contract still requires the contractor to set the worker address when posting the on-chain job.</p></div><Button onClick={()=>router.push(`/jobs/${id}`)}>Return to job</Button></div>}
  </div></main>
}
