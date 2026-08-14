import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Square, Sparkles, AlertCircle } from 'lucide-react';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  inputRef,
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied.');
        } else if (event.error === 'no-speech') {
          // Ignorable
        } else {
          setSpeechError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setSpeechError(null);
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSendMessage(trimmed);
    setText('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="sticky bottom-0 z-30 border-t border-zinc-800/80 bg-[#121212]/95 backdrop-blur-md px-3 py-3 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Speech Error Banner if any */}
        {speechError && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-red-950/60 border border-red-800/50 px-3 py-1.5 text-xs text-red-300 animate-fadeIn">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Listening indicator */}
        {isListening && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-red-950/40 border border-red-500/30 px-3 py-1.5 text-xs text-red-300 animate-pulse">
            <span className="flex items-center gap-2 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              Listening... Speak your counter-argument clearly
            </span>
            <button
              onClick={toggleListening}
              className="text-[11px] underline hover:text-white cursor-pointer"
            >
              Stop mic
            </button>
          </div>
        )}

        {/* Textarea container */}
        <div className="relative flex items-end gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-2 sm:p-2.5 focus-within:border-red-500/70 focus-within:ring-1 focus-within:ring-red-500/30 transition-all shadow-xl shadow-black/40">
          {/* Text Area */}
          <textarea
            id="debate-input"
            ref={inputRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="State your stance or defend your argument..."
            className="max-h-[180px] min-h-[44px] w-full resize-none bg-transparent px-3 py-2.5 text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 pb-1">
            {/* Microphone Button */}
            <button
              id="mic-btn"
              type="button"
              onClick={toggleListening}
              disabled={isStreaming}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse ring-2 ring-red-400'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700/60'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Voice input (Speech to text)'}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                id="stop-debate-btn"
                type="button"
                onClick={onStopStreaming}
                className="flex h-9 px-3 items-center gap-1.5 rounded-xl bg-red-600/90 text-white hover:bg-red-600 font-medium text-xs transition-colors shadow-lg shadow-red-950/40 cursor-pointer"
                title="Stop generating"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                id="send-debate-btn"
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-950/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Submit argument (Enter)"
                aria-label="Submit argument"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hint footer */}
        <div className="mt-1.5 flex items-center justify-between px-2 text-[11px] text-zinc-500">
          <span>Press <kbd className="rounded border border-zinc-700 bg-zinc-800/80 px-1 py-0.5 font-mono text-[10px] text-zinc-400">Enter</kbd> to debate, <kbd className="rounded border border-zinc-700 bg-zinc-800/80 px-1 py-0.5 font-mono text-[10px] text-zinc-400">Shift+Enter</kbd> for new line</span>
          <span className="hidden sm:inline text-zinc-600 font-mono">gemini-2.5-flash</span>
        </div>
      </div>
    </div>
  );
};
