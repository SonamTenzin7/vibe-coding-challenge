import React from "react";

export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--logo-primary)" />
          <stop offset="100%" stopColor="var(--logo-secondary)" />
        </linearGradient>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Hexagon Ring */}
      <path
        d="M50 5 L90 27.5 V72.5 L50 95 L10 72.5 V27.5 L50 5Z"
        stroke="url(#logo-grad)"
        strokeWidth="2"
        className="opacity-20"
      />

      {/* Interlocking Bond Links */}
      <path
        d="M35 40 C35 30, 65 30, 65 40 V60 C65 70, 35 70, 35 60 Z"
        stroke="url(#logo-grad)"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#logo-glow)"
        className="animate-float"
        style={{ animationDuration: "4s" }}
      />

      <path
        d="M45 30 C45 20, 75 20, 75 30 V50 C75 60, 45 60, 45 50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-20 text-base-content"
      />

      {/* Central Consensus Core */}
      <circle cx="50" cy="50" r="6" fill="url(#logo-grad)" filter="url(#logo-glow)">
        <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};
