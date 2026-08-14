import React from 'react';
import { Flame, RotateCcw, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  roundCount: number;
  onReset: () => void;
  hasMessages: boolean;
  isStreaming: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  roundCount,
  onReset,
  hasMessages,
  isStreaming,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#121212]/95 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-orange-600 text-white shadow-lg shadow-red-950/40">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Argue With Me
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-950/40 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                <ShieldAlert className="h-3 w-3" />
                Ruthless Mode
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Test your position against relentless counter-arguments.
            </p>
          </div>
        </div>

        {/* Action buttons & Round counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasMessages && (
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs font-medium text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span>Round {roundCount}</span>
            </div>
          )}

          {hasMessages && (
            <button
              id="new-debate-btn"
              onClick={onReset}
              disabled={isStreaming}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Start a new debate session"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Debate</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
