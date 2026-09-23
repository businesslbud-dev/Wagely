"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { CHAIN_ID } from "../lib/contract";
import { connectWallet, currentWallet } from "../lib/web3";

type AppContextType = { demo: boolean; setDemo: (v:boolean)=>void; address:string; chainId:number|null; provider:BrowserProvider|null; connect:()=>Promise<void>; disconnect:()=>void; };
const AppContext = createContext<AppContextType|null>(null);

export function AppProvider({children}:{children:React.ReactNode}){
  const [demo,setDemoState]=useState(true),[address,setAddress]=useState(""),[chainId,setChainId]=useState<number|null>(null),[provider,setProvider]=useState<BrowserProvider|null>(null);
  useEffect(()=>{
    setDemoState(localStorage.getItem("wagely-demo-v2") !== "false");
    currentWallet().then(w=>{if(w){setAddress(w.address);setChainId(w.chainId);setProvider(w.provider);}}).catch(()=>{});
    if(window.ethereum){
      const onAccounts=(a:string[])=>a?.length?setAddress(a[0]):disconnect();
      const onChain=(hex:string)=>setChainId(Number(hex));
      window.ethereum.on?.("accountsChanged",onAccounts); window.ethereum.on?.("chainChanged",onChain);
      return()=>{window.ethereum.removeListener?.("accountsChanged",onAccounts);window.ethereum.removeListener?.("chainChanged",onChain);};
    }
  },[]);
  const setDemo=(v:boolean)=>{setDemoState(v);localStorage.setItem("wagely-demo-v2",String(v));window.dispatchEvent(new CustomEvent("wagely-demo-updated"));};
  const connect=async()=>{const w=await connectWallet();setAddress(w.address);setChainId(w.chainId);setProvider(w.provider);};
  const disconnect=()=>{setAddress("");setChainId(null);setProvider(null);};
  return <AppContext.Provider value={{demo,setDemo,address,chainId,provider,connect,disconnect}}>{children}</AppContext.Provider>;
}
export function useApp(){const c=useContext(AppContext);if(!c)throw new Error("useApp must be used inside AppProvider");return c;}
export function isLocal(chainId:number|null){return chainId===CHAIN_ID;}
