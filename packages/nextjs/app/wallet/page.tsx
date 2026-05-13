"use client";

import { useState } from "react";
import { Balance } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { encodeFunctionData, formatEther, isAddress, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Logo } from "~~/components/Logo";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// Team lookup — maps lowercase address → name
const TEAM: Record<string, string> = {
  "0x5a8451076a21d8df2f6a1555a40bb935106412a9": "Jigme Namgyal",
  "0xcf97ab4e9bb80c70210a15f6fdfc4cad2b31cb66": "Udap Kharka",
  "0x91b928c51b6bae4a642123e7ea30ab5aff38f7da": "Jigme Nidup",
  "0xbc4b399519126f4aada844aadefe8ee60c8e4f3a": "Sonam Tharchen",
  "0x22abb5776a07de7591adb3cfd82d0177662e01a8": "Sonam Tenzin",
};

// ABI fragments used to encode self-calls (owner management)
const OWNER_ABI = [
  {
    name: "addOwner",
    type: "function" as const,
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable" as const,
  },
  {
    name: "removeOwner",
    type: "function" as const,
    inputs: [{ name: "owner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable" as const,
  },
  {
    name: "changeThreshold",
    type: "function" as const,
    inputs: [{ name: "newThreshold", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable" as const,
  },
] as const;

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function ConsensusProgress({ current, total }: { current: number; total: number }) {
  const percentage = Math.min((current / total) * 100, 100);
  const isComplete = current >= total;

  return (
    <div className="flex flex-col items-center gap-1 min-w-[100px]">
      <div className="w-full h-1.5 bg-base-content/5 rounded-full overflow-hidden border border-base-content/5 relative">
        <div
          className={`h-full transition-all duration-1000 ease-out rounded-full ${
            isComplete ? "bg-primary shadow-[0_0_10px_rgba(0,245,255,0.5)]" : "bg-accent"
          }`}
          style={{ width: `${percentage}%` }}
        />
        {!isComplete && (
          <div className="absolute top-0 bottom-0 w-1 bg-white/20 animate-shimmer" style={{ left: `${percentage}%` }} />
        )}
      </div>
      <span
        className={`text-[10px] font-black tracking-tighter ${isComplete ? "text-primary" : "text-accent opacity-70"}`}
      >
        {current} / {total} {isComplete ? "CONSENSUS" : "REQUIRED"}
      </span>
    </div>
  );
}

// ── Single Transaction Row ──────────────────────────────────────────────────
// Each row owns its own reads so SE-2 can auto-poll them independently.
function TxRow({
  txIndex,
  threshold,
  contractAddress,
}: {
  txIndex: number;
  threshold: number;
  contractAddress: string;
}) {
  const { address: connectedAddress } = useAccount();

  const { data: txData } = useScaffoldReadContract({
    contractName: "MultiSigWallet",
    functionName: "getTransaction",
    args: [BigInt(txIndex)],
  });

  // approved(txIndex, address) is the auto-generated public mapping getter
  const { data: hasApproved } = useScaffoldReadContract({
    contractName: "MultiSigWallet",
    functionName: "approved",
    args: [BigInt(txIndex), (connectedAddress ?? "0x0000000000000000000000000000000000000000") as `0x${string}`],
  });

  const { writeContractAsync, isPending } = useScaffoldWriteContract({ contractName: "MultiSigWallet" });

  if (!txData) {
    return (
      <tr>
        <td colSpan={6} className="py-4 px-4 text-center text-sm opacity-40 animate-pulse">
          Retrieving Data…
        </td>
      </tr>
    );
  }

  // getTransaction returns named values; viem may give object or tuple — handle both
  const raw = txData as unknown as {
    to: string;
    value: bigint;
    data: `0x${string}`;
    executed: boolean;
    numConfirmations: bigint;
  };
  const to = raw?.to ?? (txData as unknown as [string])[0];
  const value = (raw?.value ?? (txData as unknown as [unknown, bigint])[1]) as bigint;
  const txCalldata = (raw?.data ?? (txData as unknown as [unknown, unknown, string])[2]) as `0x${string}`;
  const executed = (raw?.executed ?? (txData as unknown as [unknown, unknown, unknown, boolean])[3]) as boolean;
  const numConfirmations = (raw?.numConfirmations ??
    (txData as unknown as [unknown, unknown, unknown, unknown, bigint])[4]) as bigint;

  const canApprove = !executed && !hasApproved && !!connectedAddress;
  const canRevoke = !executed && !!hasApproved && !!connectedAddress;
  const canExecute = !executed && Number(numConfirmations) >= threshold;
  const dataPreview = txCalldata && txCalldata !== "0x" ? `${txCalldata.slice(0, 10)}…` : "—";
  const toLabel = TEAM[to?.toLowerCase()] || truncate(to ?? "0x");

  return (
    <tr
      className={`border-b border-base-content/5 transition-all hover:bg-base-content/[0.02] ${executed ? "opacity-40" : ""}`}
    >
      <td className="py-8 px-6 font-mono text-[11px] text-primary/60 align-middle font-black tracking-widest">
        0x{txIndex.toString(16).padStart(2, "0")}
      </td>
      <td className="py-8 px-6 align-middle">
        <div className="flex flex-col gap-1">
          <span className="font-black text-sm tracking-[0.1em] uppercase text-base-content">{toLabel}</span>
          <span className="text-[10px] opacity-30 font-mono tracking-widest">{to}</span>
        </div>
      </td>
      <td className="py-8 px-6 align-middle">
        <span className="font-black text-secondary text-sm tracking-widest">
          {value !== undefined ? formatEther(value) : "—"} ETH
        </span>
      </td>
      <td className="py-8 px-6 font-mono text-[11px] text-center opacity-60 align-middle">
        <div className="bg-base-content/5 rounded-lg px-3 py-2 inline-block border border-base-content/10 font-black tracking-widest">
          {dataPreview}
        </div>
      </td>
      <td className="py-4 px-4 text-center align-middle">
        <div className="flex justify-center items-center h-full">
          {executed ? (
            <div className="flex flex-col items-center gap-1 opacity-50 w-[100px]">
              <div className="w-full h-1.5 bg-success rounded-full" />
              <span className="text-[10px] font-black text-success uppercase">Finalized</span>
            </div>
          ) : (
            <ConsensusProgress current={Number(numConfirmations)} total={threshold} />
          )}
        </div>
      </td>
      <td className="py-8 px-6 align-middle">
        <div className="flex gap-4 justify-end">
          {executed ? (
            <a
              href={`https://sepolia.etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-ghost text-[10px] opacity-30 hover:opacity-100 hover:text-primary transition-all font-black tracking-[0.3em] uppercase"
            >
              EXPLORER ↗
            </a>
          ) : (
            <div className="flex gap-3">
              {canApprove && (
                <button
                  className="btn btn-sm btn-primary px-6 h-10 text-[10px] font-black tracking-[0.2em] shadow-[0_0_20px_rgba(0,122,255,0.2)] rounded-xl"
                  disabled={isPending}
                  onClick={async () => {
                    try {
                      await writeContractAsync({ functionName: "approveTransaction", args: [BigInt(txIndex)] });
                      notification.success("Authorized");
                    } catch {
                      notification.error("Auth Failed");
                    }
                  }}
                >
                  AUTHORISE
                </button>
              )}
              {canRevoke && (
                <button
                  className="btn btn-sm btn-outline btn-error px-6 h-10 text-[10px] font-black tracking-[0.2em] rounded-xl"
                  disabled={isPending}
                  onClick={async () => {
                    try {
                      await writeContractAsync({ functionName: "revokeApproval", args: [BigInt(txIndex)] });
                      notification.success("Revoked");
                    } catch {
                      notification.error("Revoke Failed");
                    }
                  }}
                >
                  REVOKE
                </button>
              )}
              {canExecute && (
                <button
                  className="btn btn-sm btn-success px-6 h-10 text-[10px] font-black tracking-[0.2em] animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-xl"
                  disabled={isPending}
                  onClick={async () => {
                    try {
                      await writeContractAsync({ functionName: "executeTransaction", args: [BigInt(txIndex)] });
                      notification.success("Executed");
                    } catch {
                      notification.error("Exec Failed");
                    }
                  }}
                >
                  EXECUTE
                </button>
              )}
              {!canApprove && !canRevoke && !canExecute && !connectedAddress && (
                <span className="text-[10px] uppercase tracking-[0.4em] opacity-20 font-black">Lockdown</span>
              )}
              {!canApprove && !canRevoke && connectedAddress && !canExecute && (
                <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 animate-pulse font-black text-accent">
                  SYNCING_CONSENSUS…
                </span>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Owner Controls ──────────────────────────────────────────────────────────
// All three actions encode calldata and route through submitTransaction(address(this), 0, data).
// This means owner changes go through the SAME approval flow as any other transaction —
// the team must approve them before they take effect. That's the whole point.
function OwnerControls({
  contractAddress,
  owners,
  threshold,
}: {
  contractAddress: `0x${string}`;
  owners: string[];
  threshold: number;
}) {
  const [addAddr, setAddAddr] = useState("");
  const [removeAddr, setRemoveAddr] = useState("");
  const [newThresh, setNewThresh] = useState("");

  const { writeContractAsync, isPending } = useScaffoldWriteContract({ contractName: "MultiSigWallet" });

  const proposeOwnerAction = async (
    fnName: "addOwner" | "removeOwner" | "changeThreshold",
    args: readonly [`0x${string}`] | readonly [bigint],
  ) => {
    try {
      const calldata =
        fnName === "changeThreshold"
          ? encodeFunctionData({ abi: OWNER_ABI, functionName: fnName, args: args as readonly [bigint] })
          : encodeFunctionData({ abi: OWNER_ABI, functionName: fnName, args: args as readonly [`0x${string}`] });
      await writeContractAsync({
        functionName: "submitTransaction",
        args: [contractAddress, 0n, calldata],
      });
      notification.success(`Proposed ${fnName} — needs ${threshold} approval(s) to execute!`);
    } catch {
      notification.error("Failed to propose");
    }
  };

  return (
    <div className="glass-card rounded-[32px] hud-border space-y-10 p-12">
      <div className="space-y-2">
        <h2 className="text-xl font-black tracking-[0.4em] m-0 text-primary uppercase">Protocol Governance</h2>
        <p className="text-xs opacity-40 font-bold uppercase tracking-[0.2em] leading-relaxed">
          Administrative self-call operations requiring {threshold} verified protocol-level approvals.
        </p>
      </div>

      <div className="space-y-10">
        {/* Add Owner */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Authorize New Signer</label>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="0x…"
              className="input input-lg flex-1 glass-card border-base-content/10 focus:border-primary/50 font-mono text-sm h-14 rounded-xl px-6"
              value={addAddr}
              onChange={e => setAddAddr(e.target.value)}
            />
            <button
              className="btn btn-primary h-14 px-8 text-[11px] font-black tracking-[0.3em] rounded-xl"
              disabled={!isAddress(addAddr) || isPending}
              onClick={() => {
                proposeOwnerAction("addOwner", [addAddr as `0x${string}`]);
                setAddAddr("");
              }}
            >
              PROPOSE
            </button>
          </div>
        </div>

        {/* Remove Owner */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Deauthorize Signer</label>
          <div className="flex gap-4 items-center">
            <select
              className="select select-lg flex-1 glass-card border-base-content/10 focus:border-error/50 text-sm h-14 rounded-xl px-6"
              value={removeAddr}
              onChange={e => setRemoveAddr(e.target.value)}
            >
              <option value="" className="bg-base-200">
                SELECT_TARGET_SIGNER…
              </option>
              {owners.map(o => (
                <option key={o} value={o} className="bg-base-200">
                  {TEAM[o.toLowerCase()] || o}
                </option>
              ))}
            </select>
            <button
              className="btn btn-outline btn-error h-14 px-8 text-[11px] font-black tracking-[0.3em] rounded-xl"
              disabled={!removeAddr || isPending}
              onClick={() => {
                proposeOwnerAction("removeOwner", [removeAddr as `0x${string}`]);
                setRemoveAddr("");
              }}
            >
              PROPOSE
            </button>
          </div>
        </div>

        {/* Change Threshold */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">
            Update Consensus Threshold
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="number"
              min={1}
              max={owners.length}
              placeholder={`1 – ${owners.length}`}
              className="input input-lg flex-1 glass-card border-base-content/10 focus:border-accent/50 text-sm h-14 rounded-xl px-6"
              value={newThresh}
              onChange={e => setNewThresh(e.target.value)}
            />
            <button
              className="btn btn-outline btn-accent h-14 px-8 text-[11px] font-black tracking-[0.3em] rounded-xl"
              disabled={!newThresh || Number(newThresh) < 1 || Number(newThresh) > owners.length || isPending}
              onClick={() => {
                proposeOwnerAction("changeThreshold", [BigInt(newThresh)]);
                setNewThresh("");
              }}
            >
              PROPOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Wallet Page ────────────────────────────────────────────────────────
const WalletPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { data: contractInfo } = useDeployedContractInfo("MultiSigWallet");
  const contractAddress = contractInfo?.address;

  const { data: owners } = useScaffoldReadContract({
    contractName: "MultiSigWallet",
    functionName: "getOwners",
  });

  const { data: threshold } = useScaffoldReadContract({
    contractName: "MultiSigWallet",
    functionName: "threshold",
  });

  const { data: txCount } = useScaffoldReadContract({
    contractName: "MultiSigWallet",
    functionName: "getTransactionCount",
  });

  // New transaction form
  const [toAddr, setToAddr] = useState("");
  const [ethValue, setEthValue] = useState("");
  const [calldata, setCalldata] = useState("");

  const { writeContractAsync: submitTx, isPending: isSubmitting } = useScaffoldWriteContract({
    contractName: "MultiSigWallet",
  });

  const handleSubmitTx = async () => {
    if (!isAddress(toAddr)) {
      notification.error("Invalid recipient address");
      return;
    }
    try {
      await submitTx({
        functionName: "submitTransaction",
        args: [toAddr as `0x${string}`, parseEther(ethValue || "0"), (calldata || "0x") as `0x${string}`],
      });
      notification.success("Transaction proposed! Now approve it.");
      setToAddr("");
      setEthValue("");
      setCalldata("");
    } catch {
      notification.error("Submit failed");
    }
  };

  const ownersArray = (owners as string[]) ?? [];
  const thresholdNum = threshold ? Number(threshold) : 1;
  const txTotal = txCount ? Number(txCount) : 0;
  // Show newest first
  const txIndices = Array.from({ length: txTotal }, (_, i) => txTotal - 1 - i);

  return (
    <div className="max-w-7xl mx-auto px-8 pt-8 pb-24 space-y-16 relative">
      {/* Background Atmosphere */}
      <div className="absolute top-0 right-0 p-40 opacity-[0.03] pointer-events-none -z-10">
        <Logo className="w-[800px] h-[800px] rotate-12" />
      </div>

      {/* Main Hero Section - Proposal Action on Right */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="space-y-12 fade-in-up">
          <div className="space-y-6">
            <span className="bg-primary/10 text-primary/80 text-[10px] font-black tracking-[0.4em] uppercase px-4 py-2 rounded-md border border-primary/20 inline-block">
              Sovereign Command Center
            </span>
            <h1 className="text-8xl font-black tracking-tighter m-0 text-base-content leading-[0.9]">
              Vault <br />
              <span className="text-base-content/40">Terminal.</span>
            </h1>
            <p className="text-xl opacity-40 leading-relaxed font-bold uppercase tracking-wide max-w-xl">
              Consolidated governance for high-fidelity <br />
              autonomous treasury operations.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-base-content/5 bg-base-content/[0.02] flex items-center gap-10">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 font-black">Consensus Status</p>
              <div className="text-2xl font-black text-base-content tracking-tighter">
                {thresholdNum} of {ownersArray.length} SIGNERS ACTIVE
              </div>
            </div>
            <div className="h-12 w-[1px] bg-base-content/10" />
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 font-black">Network ID</p>
              <div className="text-sm font-mono tracking-widest font-black opacity-60">
                {truncate(contractAddress ?? "")}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Premium Status Card (Mirrors Homepage Mock Card) */}
        <div className="relative fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="glass-card rounded-[40px] p-12 border border-base-content/10 shadow-2xl space-y-12 relative overflow-hidden group">
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Vault_Reserve_Quantum</p>
              <div className="text-7xl font-black text-base-content tracking-tighter leading-none">
                <Balance address={contractAddress} />
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <p className="text-[10px] font-black text-base-content/30 uppercase tracking-[0.4em]">
                Signer_Consensus_Network
              </p>
              <div className="space-y-3">
                {ownersArray.slice(0, 3).map((owner: string) => (
                  <div
                    key={owner}
                    className="flex items-center justify-between p-4 rounded-2xl bg-base-content/[0.03] border border-base-content/5 hover:border-primary/20 transition-all group/row"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 rounded-full ${connectedAddress?.toLowerCase() === owner.toLowerCase() ? "bg-primary animate-pulse" : "bg-base-content/20"}`}
                      />
                      <span className="text-sm font-black tracking-widest">
                        {TEAM[owner.toLowerCase()] || truncate(owner)}
                      </span>
                    </div>
                    {connectedAddress?.toLowerCase() === owner.toLowerCase() && (
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">YOU</span>
                    )}
                  </div>
                ))}
                {ownersArray.length > 3 && (
                  <p className="text-center text-[9px] font-black opacity-20 tracking-[0.4em] pt-2">
                    +{ownersArray.length - 3} ADDITIONAL AUTHORITIES
                  </p>
                )}
              </div>
            </div>

            <button className="btn btn-primary w-full h-16 text-sm tracking-[0.4em] font-black shadow-[0_0_50px_rgba(0,122,255,0.3)] bg-[#0066FF] border-none rounded-2xl hover:scale-[1.01] transition-all">
              INITIALISE AUDIT
            </button>
          </div>
        </div>
      </section>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start pt-12">
        {/* Left Column - Action (Sticky) */}
        <div className="glass-card rounded-[40px] p-12 border border-base-content/10 shadow-xl space-y-12 sticky top-32 self-start transition-all hover:shadow-[0_0_60px_rgba(0,122,255,0.05)]">
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-primary leading-tight">
              Initialise <br />
              Proposal
            </h2>
            <p className="text-xs opacity-40 font-bold uppercase tracking-[0.2em] leading-relaxed">
              Constructing cryptographic execution payload.
            </p>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.5em] font-black text-primary/60">
                Target Identifier
              </label>
              <input
                type="text"
                placeholder="0x…"
                className="input input-lg w-full glass-card border-base-content/10 focus:border-primary/50 font-mono text-sm h-16 tracking-widest rounded-2xl px-6 bg-base-content/[0.02]"
                value={toAddr}
                onChange={e => setToAddr(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.5em] font-black text-secondary/60">
                Asset Quantum
              </label>
              <input
                type="number"
                step="0.000001"
                min="0"
                placeholder="0.000000"
                className="input input-lg w-full glass-card border-base-content/10 focus:border-secondary/50 font-mono text-sm h-16 tracking-widest rounded-2xl px-6 bg-base-content/[0.02]"
                value={ethValue}
                onChange={e => setEthValue(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.5em] font-black text-accent/60">
                Execution Payload
              </label>
              <textarea
                placeholder="0x…"
                className="textarea textarea-lg w-full glass-card border-base-content/10 focus:border-accent/50 font-mono text-sm p-6 tracking-widest rounded-2xl resize-none h-24 bg-base-content/[0.02]"
                value={calldata}
                onChange={e => setCalldata(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn btn-primary w-full h-16 text-[11px] tracking-[0.6em] font-black shadow-[0_0_50px_rgba(0,122,255,0.3)] bg-[#0066FF] border-none rounded-2xl hover:scale-[1.01] transition-all"
            disabled={!toAddr || isSubmitting || !contractAddress}
            onClick={handleSubmitTx}
          >
            {isSubmitting ? "TRANSMITTING..." : "AUTHORISE SEQUENCE"}
          </button>
        </div>

        {/* Right Column - Audit Trail */}
        <div className="glass-card rounded-[40px] p-12 border border-base-content/10 shadow-xl flex flex-col min-h-[700px] transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.02)]">
          <div className="space-y-4 mb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-base-content leading-tight">
                Protocol <br />
                Ledger
              </h2>
              <div
                className={`text-[9px] font-black border px-4 py-2 rounded-full uppercase tracking-[0.3em] ${txTotal === 0 ? "text-base-content/20 border-base-content/10" : "text-primary border-primary/20 bg-primary/5"}`}
              >
                {txTotal === 0 ? "SYSTEM_IDLE" : `${txTotal} ARCHIVE_ENTRIES`}
              </div>
            </div>
            <p className="text-xs opacity-40 font-bold uppercase tracking-[0.2em] leading-relaxed">
              Immutable audit log of all protocol-level authorizations and cryptographic executions.
            </p>
          </div>

          <div className="flex-1">
            {txTotal === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 opacity-10">
                <div className="w-24 h-24 border-t-2 border-primary rounded-full mb-10 animate-spin-slow" />
                <p className="text-[10px] font-black uppercase tracking-[0.6em]">ARCHIVE_NULL / AWAITING_CONSENSUS</p>
              </div>
            ) : (
              <div className="overflow-x-auto pr-2 custom-scrollbar">
                <table className="table w-full border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.5em] text-base-content/20 border-none">
                      <th className="px-4 py-6 font-black">ID</th>
                      <th className="px-6 py-6 font-black text-left">Target</th>
                      <th className="px-6 py-6 font-black text-left">Value</th>
                      <th className="px-6 py-6 text-center font-black">Status</th>
                      <th className="px-6 py-6 text-right font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txIndices.map(i => (
                      <TxRow key={i} txIndex={i} threshold={thresholdNum} contractAddress={contractAddress ?? ""} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Configuration (Full Width) */}
      {contractAddress && (
        <section className="space-y-12 pt-12">
          <div className="space-y-2">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.6em]">System Architecture</h2>
            <p className="text-2xl font-black text-base-content/40 tracking-tighter">Root Authority Controls</p>
          </div>
          <div className="glass-card rounded-[40px] border border-base-content/10 shadow-2xl overflow-hidden">
            <OwnerControls
              contractAddress={contractAddress as `0x${string}`}
              owners={ownersArray}
              threshold={thresholdNum}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default WalletPage;
