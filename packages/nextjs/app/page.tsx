"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";

const TEAM_MEMBERS = [
  { name: "Jigme Namgyal", address: "0x5a8451076a21d8df2f6a1555a40bb935106412a9" },
  { name: "Udap Kharka", address: "0xcf97ab4e9bb80c70210a15f6fdfc4cad2b31cb66" },
  { name: "Jigme Nidup", address: "0x91b928c51b6bae4a642123e7ea30ab5aff38f7da" },
  { name: "Sonam Tharchen", address: "0xbc4b399519126f4aada844aadefe8ee60c8e4f3a" },
  { name: "Sonam Tenzin", address: "0x22abb5776a07de7591adb3cfd82d0177662e01a8", deployer: true },
];

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const truncated = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="font-mono text-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      title="Click to copy"
    >
      {copied ? "✓ copied" : truncated}
    </button>
  );
}

const Home: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-20">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-10 fade-in-up">
            <div className="space-y-4">
              <span className="bg-primary/10 text-primary/80 text-[10px] font-black tracking-[0.4em] uppercase px-4 py-2 rounded-md border border-primary/20 inline-block">
                Enterprise Multisig
              </span>
              <h1 className="text-8xl font-black tracking-tighter text-base-content leading-[0.9]">
                Security through <br />
                <span className="text-base-content/40">Consensus.</span>
              </h1>
              <p className="text-xl opacity-40 max-w-xl leading-relaxed font-bold uppercase tracking-wide">
                Secure way for teams to manage shared crypto assets.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/wallet"
                className="btn btn-primary px-10 py-6 h-auto text-sm tracking-[0.2em] font-black shadow-[0_0_40px_rgba(0,122,255,0.3)] bg-[#0066FF] border-none"
              >
                CONNECT WALLET
              </Link>
              <Link
                href="/debug"
                className="btn btn-outline border-white/20 px-10 py-6 h-auto text-sm tracking-[0.2em] font-black text-base-content hover:bg-base-content/5"
              >
                SECURITY ARCHITECTURE
              </Link>
            </div>
          </div>

          {/* Right Content - Mock Transaction Card */}
          <div className="relative fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="glass-card rounded-[32px] p-10 border border-base-content/10 shadow-2xl space-y-10 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-base-content/30 tracking-[0.3em] uppercase">
                    TX-0492-SECURE
                  </p>
                  <h2 className="text-3xl font-black text-base-content tracking-tight">Transfer 500.00 ETH</h2>
                </div>
                <div className="bg-success text-success-content text-[10px] font-black tracking-[0.2em] uppercase px-4 py-2 rounded-full">
                  PENDING (2/3)
                </div>
              </div>

              {/* Vertical Timeline */}
              <div className="space-y-8 relative pl-12">
                {/* Connector Line */}
                <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-base-content/5">
                  <div className="absolute top-0 left-0 w-full h-2/3 bg-success shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                </div>

                {/* Signer 1 */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4 relative">
                    <div className="absolute -left-12 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      <svg
                        className="w-4 h-4 text-success-content"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-widest text-base-content">0x71C...4e8B</span>
                      <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider">Udap Kharka</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-success tracking-[0.3em]">SIGNED</span>
                </div>

                {/* Signer 2 */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4 relative">
                    <div className="absolute -left-12 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      <svg
                        className="w-4 h-4 text-success-content"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-widest text-base-content">0x3A2...9F12</span>
                      <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider">Jigme Namgyal</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-success tracking-[0.3em]">SIGNED</span>
                </div>

                {/* Signer 3 - Local User */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4 relative">
                    <div className="absolute -left-12 w-8 h-8 rounded-full border-2 border-[#0066FF] bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#0066FF]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-widest text-base-content">0x9E1...BB04</span>
                      <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider">
                        Main Protocol Signer
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-primary tracking-[0.3em] animate-pulse">
                    AWAITING YOU
                  </span>
                </div>
              </div>

              <button className="btn btn-primary w-full py-6 h-auto text-sm tracking-[0.3em] font-black shadow-[0_0_40px_rgba(0,122,255,0.3)] bg-[#0066FF] border-none rounded-2xl">
                CONFIRM SIGNATURE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Content - Secondary sections */}
      <div className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-20 w-full">
        <section className="space-y-8 fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] font-space-grotesk">
            Protocol Thesis
          </h2>
          <p className="text-base-content/60 leading-loose text-sm font-bold tracking-wide">
            Fragmented treasury operations are the primary failure point for autonomous systems. BondChain consolidates
            governance into a single, high-fidelity execution layer.
          </p>
        </section>

        <section className="space-y-8 fade-in-up" style={{ animationDelay: "0.5s" }}>
          <h2 className="text-xs font-black text-secondary uppercase tracking-[0.4em] font-space-grotesk">
            Root Authorities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEAM_MEMBERS.map(member => (
              <div
                key={member.address}
                className="flex items-center justify-between bg-base-content/5 border border-base-content/5 hover:border-base-content/10 transition-all rounded-xl px-6 py-4 group"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-black text-[10px] tracking-widest uppercase text-base-content/60 group-hover:text-base-content transition-colors">
                    {member.name}
                  </span>
                  {member.deployer && (
                    <span className="text-[7px] font-black text-primary border border-primary/20 px-1.5 py-0.5 rounded-sm uppercase tracking-widest bg-primary/5 w-fit">
                      ROOT
                    </span>
                  )}
                </div>
                <CopyAddress address={member.address} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
