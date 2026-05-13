import React from "react";
import Link from "next/link";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Site footer
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  return (
    <div className="min-h-0 py-8 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-6 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-3 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="btn glass-card btn-sm font-black gap-2 cursor-auto border-white/5 hud-border px-4">
                  <CurrencyDollarIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-primary text-[10px] tracking-widest">{nativeCurrencyPrice.toFixed(2)} USD</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <div className="pointer-events-auto">
                  <Faucet />
                </div>
                <Link
                  href="/blockexplorer"
                  passHref
                  className="btn glass-card btn-sm font-black gap-2 border-white/5 hud-border px-4"
                >
                  <MagnifyingGlassIcon className="h-3.5 w-3.5 text-secondary" />
                  <span className="text-secondary text-[10px] tracking-widest uppercase">Network Explorer</span>
                </Link>
              </>
            )}
          </div>
          <div className="glass-card p-1 rounded-full pointer-events-auto border border-white/5 shadow-2xl">
            <SwitchTheme />
          </div>
        </div>
      </div>
    </div>
  );
};
