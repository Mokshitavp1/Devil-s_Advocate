import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Bot, User, Copy, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isLatestModelMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatestModelMessage = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`message-${message.id}`}
      className={`flex w-full gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-950/50 mt-1">
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Message Card Container */}
      <div
        className={`group relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 transition-all ${
          isUser
            ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 rounded-tr-sm shadow-sm'
            : 'bg-[#1a1818] text-zinc-100 border border-red-950/80 rounded-tl-sm shadow-md ring-1 ring-red-500/10'
        }`}
      >
        {/* Top bar with sender and copy action */}
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold tracking-wider uppercase ${
                isUser ? 'text-zinc-400' : 'text-red-400 flex items-center gap-1'
              }`}
            >
              {!isUser && <Sparkles className="h-3 w-3 text-red-400 inline" />}
              {isUser ? 'Your Stance' : 'Sparring Counter-Argument'}
            </span>
            <span className="text-[10px] text-zinc-500">{formattedTime}</span>
          </div>

          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800/80 cursor-pointer"
            title="Copy message"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Content Body with Markdown styling */}
        <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-zinc-200 break-words space-y-2">
          {message.content ? (
            <div className="markdown-body">
              <Markdown>{message.content}</Markdown>
            </div>
          ) : (
            message.isStreaming && (
              <div className="flex items-center gap-2 text-zinc-400 py-1">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono text-red-400/90">Demolishing your assumption...</span>
              </div>
            )
          )}

          {/* Streaming Cursor Indicator */}
          {message.isStreaming && message.content && (
            <span className="inline-block w-2 h-4 ml-1 bg-red-500 animate-pulse align-middle" />
          )}
        </div>

        {/* Adversarial Badge for model messages */}
        {!isUser && !message.isStreaming && (
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1 text-red-400/80">
              <AlertTriangle className="h-3 w-3" />
              Adversarial critique: Defend your position
            </span>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-zinc-700 text-zinc-200 shadow-sm mt-1">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};
