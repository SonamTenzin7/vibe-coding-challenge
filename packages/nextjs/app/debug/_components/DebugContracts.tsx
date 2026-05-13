"use client";

import { useEffect, useMemo } from "react";
import { ContractUI } from "./ContractUI";
import "@scaffold-ui/debug-contracts/styles.css";
import { useSessionStorage } from "usehooks-ts";
import { BarsArrowUpIcon } from "@heroicons/react/20/solid";
import { ContractName, GenericContract } from "~~/utils/scaffold-eth/contract";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";

const selectedContractStorageKey = "scaffoldEth2.selectedContract";

export function DebugContracts() {
  const contractsData = useAllContracts();
  const contractNames = useMemo(
    () =>
      Object.keys(contractsData).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
      }) as ContractName[],
    [contractsData],
  );

  const [selectedContract, setSelectedContract] = useSessionStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
    { initializeWithValue: false },
  );

  useEffect(() => {
    if (!contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0]);
    }
  }, [contractNames, selectedContract, setSelectedContract]);

  return (
    <div className="flex flex-col gap-y-12 py-12 justify-center items-center">
      {contractNames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 opacity-10 space-y-10">
          <div className="w-24 h-24 border-t-2 border-secondary rounded-full animate-spin-slow" />
          <p className="text-[11px] font-black uppercase tracking-[0.6em]">NULL_AUDIT_STATE / NO_MODULES_DETECTED</p>
        </div>
      ) : (
        <>
          {contractNames.length > 1 && (
            <div className="flex flex-row gap-4 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap justify-center">
              {contractNames.map(contractName => (
                <button
                  className={`btn h-auto py-3 px-8 border border-base-content/10 shadow-lg text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-xl ${
                    contractName === selectedContract
                      ? "bg-secondary text-secondary-content border-secondary shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                      : "glass-card hover:border-secondary/50"
                  }`}
                  key={contractName}
                  onClick={() => setSelectedContract(contractName)}
                >
                  {contractName}
                  {(contractsData[contractName] as GenericContract)?.external && (
                    <span className="tooltip tooltip-top tooltip-accent" data-tip="External contract">
                      <BarsArrowUpIcon className="h-4 w-4 cursor-pointer ml-2 opacity-50" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="w-full">
            {contractNames.map(
              contractName =>
                contractName === selectedContract && <ContractUI key={contractName} contractName={contractName} />,
            )}
          </div>
        </>
      )}
    </div>
  );
}
