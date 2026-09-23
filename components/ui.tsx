import Link from "next/link";
import { formatEther } from "ethers";
import { STATES } from "../lib/types";
import { shortAddress, shortHash, dateTime } from "../lib/format";

/** Small label above a heading. Pages pass SHOUTING CAPS; we soften it to
 *  sentence case in one place rather than editing every caller. */
export function Eyebrow({children}:{children:React.ReactNode}){
  const text = typeof children === "string" && children === children.toUpperCase()
    ? children.charAt(0) + children.slice(1).toLowerCase()
    : children;
  return <div className="eyebrow">{text}</div>
}
export function StatusChip({state}:{state:number}){const name=STATES[state]||"Unknown";const cls=name==="Released"?"status success":name==="CompletionClaimed"?"status orange":name==="Funded"?"status blue":name==="Started"?"status violet":"status";return <span className={cls}>{name}</span>}
export function Button({children,disabled,loading,onClick,type="button",variant="primary",title}:{children:React.ReactNode;disabled?:boolean;loading?:boolean;onClick?:()=>void;type?:"button"|"submit";variant?:"primary"|"secondary"|"danger"|"dark"|"light"|"ghost";title?:string}){return <button type={type} disabled={disabled||loading} onClick={onClick} title={title} className={`btn btn-${variant} ${disabled||loading?"btn-disabled":""}`}>{loading?"Processing…":children}</button>}
export function Card({children,className=""}:{children:React.ReactNode;className?:string}){return <div className={`card ${className}`}>{children}</div>}
export function Address({value}:{value:string}){return <span className="mono">{shortAddress(value)}</span>}
export function Hash({value}:{value:string}){return <span className="mono">{shortHash(value)}</span>}
export function SectionTitle({eyebrow,title,children}:{eyebrow:string;title:string;children?:React.ReactNode}){return <div className="section-title-wrap"><Eyebrow>{eyebrow}</Eyebrow><h2 className="section-title">{title}</h2>{children&&<p className="body-copy mt-3 max-w-2xl">{children}</p>}</div>}
export function EmptyState({title,text,action}:{title:string;text:string;action?:React.ReactNode}){return <div className="empty"><div className="empty-icon"><span>W</span><i/></div><h3>{title}</h3><p>{text}</p>{action&&<div className="empty-action">{action}</div>}</div>}
export function Timeline({items}:{items:{label:string;detail:string;timestamp:number;txHash?:string}[]}){return <div className="timeline">{items.map((item,i)=><div className="timeline-item" key={`${item.label}-${i}`}><div className="timeline-dot"/><div className="flex-1"><div className="timeline-head"><strong>{item.label}</strong><time>{dateTime(item.timestamp)}</time></div><p>{item.detail}</p>{item.txHash&&<span className="mono text-xs">{shortHash(item.txHash,10)}</span>}</div></div>)}</div>}

function displayWage(job:any){
  const raw=job?.wageAmount;
  if(typeof raw === "bigint") return `${formatEther(raw)} ETH`;
  if(raw && typeof raw === "object" && typeof raw.toString === "function"){
    const text=raw.toString();
    return job?.wageDisplay || `${formatEther(BigInt(text))} ETH`;
  }
  return job?.wageDisplay || raw || "—";
}

export function JobCard({job,meta}:{job:any;meta?:any}){
  const title=meta?.title||job.title||`Protected Job #${job.id}`;
  const wage=displayWage(job);
  const state=Number(job.state);
  const funded=state>=1;
  return <Link href={`/jobs/${job.id}`} className="job-card">
    <div className="job-card-top"><div><span className="job-category">{meta?.jobType||job.jobType||"CONSTRUCTION"}</span><h3>{title}</h3><p>{meta?.company||job.company||"Wagely contractor"}</p></div><StatusChip state={state}/></div>
    <p className="job-summary">{meta?.description||job.description||"Wage lifecycle recorded through the WageEscrow contract."}</p>
    <div className="job-meta"><span><b>{wage}</b><small>Wage</small></span><span><b>{meta?.duration||job.duration||"—"}</b><small>Duration</small></span><span><b>{meta?.location||job.location||"Local site"}</b><small>Location</small></span></div>
    <div className="job-card-bottom"><span className={funded?"protected":"protected pending-protected"}>{funded?"✓ Wage escrow active":"○ Escrow pending"}</span><span className="view-link">View job <b>→</b></span></div>
  </Link>
}
