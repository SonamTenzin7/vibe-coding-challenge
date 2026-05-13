import { DebugContracts } from "./_components/DebugContracts";
import type { NextPage } from "next";
import { Logo } from "~~/components/Logo";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Debug Contracts",
  description: "Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way",
});

const Debug: NextPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 pt-8 pb-20 space-y-16 relative min-h-screen">
      {/* Background Atmosphere */}
      <div className="absolute top-0 right-0 p-40 opacity-[0.02] pointer-events-none -z-10">
        <Logo className="w-[800px] h-[800px] rotate-12" />
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-24">
        <div className="space-y-10 lg:pt-16 max-w-2xl fade-in-up">
          <div className="space-y-6">
            <span className="bg-secondary/10 text-secondary text-[10px] font-black tracking-[0.4em] uppercase px-4 py-2 rounded-md border border-secondary/20 inline-block">
              Internal Systems Audit
            </span>
            <h1 className="text-8xl font-black tracking-tighter m-0 text-base-content leading-[0.9]">
              Root <span className="text-base-content/40">Terminal.</span>
            </h1>
            <p className="text-xl opacity-40 leading-relaxed font-bold uppercase tracking-wide">
              Low-level cryptographic interface for protocol <br />
              validation and contract interaction.
            </p>
          </div>
        </div>
      </div>

      <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
        <DebugContracts />
      </div>
    </div>
  );
};

export default Debug;
