"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp, isLocal } from "./providers";
import { Button } from "./ui";
import Logo from "./Logo";
import { shortAddress } from "../lib/format";
import { switchToLocal } from "../lib/web3";

const tabs = [
  { href: "/jobs", label: "Find work" },
  { href: "/jobs/new", label: "Post a job" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
];

export default function Header() {
  const pathname = usePathname();
  const { demo, setDemo, address, chainId, connect, disconnect } = useApp();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [error, setError] = useState("");

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const doSwitch = async () => {
    try {
      await switchToLocal();
    } catch (e: any) {
      setError(e?.message || "Could not switch network.");
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Wagely home" onClick={() => setMobile(false)}>
          <Logo />
        </Link>

        <nav className="main-nav" aria-label="Main">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={isActive(tab.href) ? "active" : ""}
              aria-current={isActive(tab.href) ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className={`demo-toggle ${demo ? "active" : ""}`}
            onClick={() => setDemo(!demo)}
            aria-pressed={demo}
          >
            <span className="demo-dot" />
            {demo ? "Demo on" : "Demo off"}
          </button>

          {address && !isLocal(chainId) ? (
            <Button variant="secondary" onClick={doSwitch}>Switch to local</Button>
          ) : address ? (
            <div className="relative">
              <button className="wallet-pill" onClick={() => setMenu(!menu)} aria-expanded={menu}>
                <span className="wallet-avatar">{address.slice(2, 4).toUpperCase()}</span>
                {shortAddress(address)}
              </button>
              {menu && (
                <div className="wallet-menu">
                  <button onClick={() => { disconnect(); setMenu(false); }}>Disconnect</button>
                </div>
              )}
            </div>
          ) : (
            <Button onClick={() => connect().catch((e) => setError(e?.message || "Wallet connection failed."))}>
              Connect wallet
            </Button>
          )}

          <button
            className="mobile-menu-btn"
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobile && (
        <div className="mobile-nav">
          <div className="container">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={isActive(tab.href) ? "active" : ""}
                onClick={() => setMobile(false)}
              >
                {tab.label}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {error && <div className="container header-error">{error}</div>}
    </header>
  );
}
