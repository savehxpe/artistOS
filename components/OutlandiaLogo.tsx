'use client';

import React from 'react';

/**
 * @component OutlandiaLogo
 * @description The core brand identity component for Outlandia.
 * Features a geometric 'O' mark with a pulse animation and clean typography.
 */
export const OutlandiaLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Geometric 'O' Mark with Pulse */}
      <div 
        className="w-20 h-20 rounded-full border-4 border-white animate-pulse-slow active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Outlandia Logo"
      />
      
      <div className="text-center">
        {/* Manrope Bold Wordmark */}
        <h1 className="text-3xl font-manrope font-extrabold tracking-[0.2em] text-white uppercase antialiased">
          OUTLANDIA
        </h1>
      </div>
    </div>
  );
};
