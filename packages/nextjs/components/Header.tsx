"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { BugAntIcon } from "@heroicons/react/24/outline";
import { Logo } from "~~/components/Logo";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive
                  ? "text-base-content border-b-2 border-primary"
                  : "text-base-content/40 border-b-2 border-transparent"
              } hover:text-base-content py-2 px-0 text-[11px] font-black uppercase tracking-[0.2em] rounded-none gap-0 transition-all font-space-grotesk`}
            >
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-transparent min-h-0 flex-shrink-0 justify-between z-20 px-8 py-6">
      <div className="navbar-start w-auto gap-12">
        <Link href="/" passHref className="flex items-center gap-3 shrink-0">
          <Logo className="w-8 h-8" />
          <span className="font-black tracking-tighter text-xl uppercase text-base-content">BondChain</span>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-8 items-center">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end w-auto gap-4">
        <div className="flex items-center gap-6 mr-4 opacity-40 text-base-content">
          <div className="relative">
            <div className="w-2 h-2 bg-primary rounded-full absolute -top-1 -right-1" />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && (
          <div className="flex items-center">
            <FaucetButton />
          </div>
        )}
      </div>
    </div>
  );
};
