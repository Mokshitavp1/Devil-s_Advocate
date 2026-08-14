import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { StarterTopics } from './components/StarterTopics';
import { InputBar } from './components/InputBar';
import { Message } from './types';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'argue_with_me_messages_v1';

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save to sessionStorage', e);
    }
  }, [messages]);

  // Auto-scroll to bottom on message updates
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Focus input field on mount or when debate finishes
  useEffect(() => {
    if (!isStreaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStreaming]);

  // Reset / New Debate
  const handleReset = () => {
    if (isStreaming) {
      handleStopStreaming();
    }
    setMessages([]);
    setErrorMessage(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorable
    }
  };

  // Stop active stream
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  // Send message to debate endpoint
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isStreaming) return;

    setErrorMessage(null);

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      role: 'user',
      content: userText.trim(),
      timestamp: Date.now(),
    };

    const aiMessageId = `model-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const aiPlaceholder: Message = {
      id: aiMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, aiPlaceholder]);
    setIsStreaming(true);

    // Create abort controller for streaming request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Prepare history payload for server
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorDetail = 'Failed to generate response.';
        try {
          const errData = await response.json();
          if (errData.error) errorDetail = errData.error;
        } catch {
          errorDetail = `Server responded with status ${response.status} ${response.statusText}`;
        }
        throw new Error(errorDetail);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on this response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? { ...msg, content: accumulatedText, isStreaming: true }
                    : msg
                )
              );
            }
          } catch (jsonErr: any) {
            if (jsonErr.message && !jsonErr.message.includes('JSON')) {
              throw jsonErr;
            }
          }
        }
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: accumulatedText, isStreaming: false }
            : msg
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Debate request error:', err);
        const errorText = err.message || 'An unexpected error occurred during the debate.';
        setErrorMessage(errorText);

        // Remove empty placeholder or mark non-streaming
        setMessages((prev) =>
          prev
            .map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: msg.content || '*(Critique interrupted due to connection error.)*',
                    isStreaming: false,
                  }
                : msg
            )
            .filter((msg) => msg.content.length > 0)
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Calculate round count based on user turns
  const roundCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="flex h-screen flex-col bg-[#121212] text-zinc-100 antialiased font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* Top Navigation Bar */}
      <Header
        roundCount={roundCount}
        onReset={handleReset}
        hasMessages={messages.length > 0}
        isStreaming={isStreaming}
      />

      {/* Main Debate Transcript Area */}
      <main
        id="debate-transcript-container"
        ref={transcriptContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
      >
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Error Banner if any */}
          {errorMessage && (
            <div
              id="error-banner"
              className="flex items-start justify-between gap-3 rounded-xl border border-red-500/40 bg-red-950/80 p-4 text-sm text-red-200 shadow-lg animate-fadeIn"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-300">Debate Stream Interrupted</div>
                  <div className="text-xs text-red-400/90 mt-0.5 leading-relaxed">
                    {errorMessage}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                title="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* If no messages yet, show starter topics */}
          {messages.length === 0 ? (
            <StarterTopics onSelectTopic={handleSendMessage} />
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLatestModelMessage={
                    message.role === 'model' && index === messages.length - 1
                  }
                />
              ))}
            </div>
          )}

          {/* Anchor for auto-scrolling */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </main>

      {/* Sticky Bottom Input Bar */}
      <InputBar
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
        onStopStreaming={handleStopStreaming}
        inputRef={inputRef}
      />
    </div>
  );
}
