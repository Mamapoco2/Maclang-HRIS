import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Minus,
  Search,
  Paperclip,
  Send,
  Copy,
  Check,
  Sparkles,
  FileText,
  Braces,
  Mail,
  Wrench,
  Database,
  Moon,
  SunMedium,
} from "lucide-react";
import { useChatbot } from "@/components/chatbot-context";

/* ------------------------------------------------------------------ */
/*  DESIGN TOKENS                                                      */
/* ------------------------------------------------------------------ */
const TOKENS = `
  :root {
    --surface: #ffffff;
    --surface-subtle: #f6f5f9;
    --surface-raised: #ffffff;
    --border: #e7e5f0;
    --border-strong: #d7d4e6;
    --text: #1a1a24;
    --text-muted: #6b6b7d;
    --text-faint: #9797a8;
    --primary-a: #4f46e5;
    --primary-b: #8b5cf6;
    --accent: #f5a524;
    --success: #14b8a6;
    --user-bubble: #4338ca;
    --shadow-color: 240 30% 30%;
  }
  .dark {
    --surface: #17171f;
    --surface-subtle: #1e1e29;
    --surface-raised: #22222e;
    --border: #2c2c3a;
    --border-strong: #38384a;
    --text: #f2f1f8;
    --text-muted: #a5a4b8;
    --text-faint: #6f6f80;
    --primary-a: #6366f1;
    --primary-b: #a78bfa;
    --accent: #fbbf24;
    --success: #2dd4bf;
    --user-bubble: #5b21b6;
    --shadow-color: 250 60% 4%;
  }
  .fcb-root {
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    color: var(--text);
  }
  .fcb-display {
    font-family: 'Sora', 'Inter', ui-sans-serif, sans-serif;
  }
  .fcb-mono {
    font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
  }
  @keyframes fcb-fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fcb-bounce-dot {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes fcb-skeleton {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes fcb-orb-drift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .fcb-orb-anim {
    background: linear-gradient(120deg, var(--primary-a), var(--accent), var(--primary-b));
    background-size: 200% 200%;
    animation: fcb-orb-drift 6s ease-in-out infinite;
  }
  .fcb-message-in {
    animation: fcb-fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .fcb-panel-spring {
    animation: fcb-fade-up 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .fcb-skeleton-shimmer {
    background: linear-gradient(90deg, var(--surface-subtle) 25%, var(--border) 37%, var(--surface-subtle) 63%);
    background-size: 400% 100%;
    animation: fcb-skeleton 1.4s ease infinite;
  }
  .fcb-scrollbar::-webkit-scrollbar { width: 6px; }
  .fcb-scrollbar::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 999px; }
  .fcb-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .fcb-focus:focus-visible {
    outline: 2px solid var(--primary-b);
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    .fcb-orb-anim, .fcb-message-in, .fcb-panel-spring, .fcb-skeleton-shimmer { animation: none !important; transition: none !important; }
  }
`;

/* ------------------------------------------------------------------ */
/*  DATA                                                                */
/* ------------------------------------------------------------------ */
const SUGGESTIONS = [
  { id: "sum", label: "Summarize this document", icon: FileText },
  { id: "hooks", label: "Explain React Hooks", icon: Braces },
  { id: "email", label: "Write an email", icon: Mail },
  { id: "fix", label: "Fix my code", icon: Wrench },
  { id: "sql", label: "Generate SQL query", icon: Database },
];

const CANNED_REPLIES = [
  "Here's a quick breakdown:\n\n**Key points**\n- Keep the scope tight\n- Ship the smallest useful version first\n- Iterate from real feedback\n\nWant me to expand on any of these?",
  "```js\nfunction sum(a, b) {\n  return a + b;\n}\n```\nThat's a minimal example — let me know the language or framework you're using and I'll tailor it.",
  "Good question. In short: it depends on the constraints you're working with, but a solid default is to start simple and add complexity only when the data asks for it.",
];

function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  MINI MARKDOWN RENDERER                                             */
/* ------------------------------------------------------------------ */
function MarkdownContent({ text }) {
  const blocks = useMemo(() => {
    const parts = text.split(/```([\s\S]*?)```/g);
    return parts.map((chunk, i) => ({ code: i % 2 === 1, chunk }));
  }, [text]);

  const renderInline = (line, key) => {
    const segments = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
    return (
      <span key={key}>
        {segments.map((seg, i) => {
          if (seg.startsWith("**") && seg.endsWith("**")) {
            return (
              <strong key={i} className="font-semibold">
                {seg.slice(2, -2)}
              </strong>
            );
          }
          if (seg.startsWith("`") && seg.endsWith("`")) {
            return (
              <code
                key={i}
                className="fcb-mono rounded px-1 py-0.5 text-[0.85em]"
                style={{
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                }}
              >
                {seg.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{seg}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="space-y-2 text-[0.925rem] leading-relaxed">
      {blocks.map((b, bi) =>
        b.code ? (
          <pre
            key={bi}
            className="fcb-mono fcb-scrollbar overflow-x-auto rounded-xl p-3 text-[0.82rem]"
            style={{
              background: "var(--surface-subtle)",
              border: "1px solid var(--border)",
            }}
          >
            <code>{b.chunk.replace(/^\w+\n/, "").trim()}</code>
          </pre>
        ) : (
          b.chunk
            .split("\n")
            .filter((l) => l.length > 0)
            .map((line, li) =>
              line.trim().startsWith("- ") ? (
                <div key={li} className="flex gap-2 pl-1">
                  <span style={{ color: "var(--primary-b)" }}>&bull;</span>
                  <span>{renderInline(line.trim().slice(2), li)}</span>
                </div>
              ) : (
                <p key={li}>{renderInline(line, li)}</p>
              ),
            )
        ),
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ORB AVATAR                                                         */
/* ------------------------------------------------------------------ */
function Orb({ size = 32 }) {
  return (
    <span
      className="fcb-orb-anim inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: "0 2px 8px hsl(var(--shadow-color) / 0.35)",
      }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  TYPING INDICATOR                                                   */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  return (
    <div
      className="fcb-message-in flex items-end gap-2"
      role="status"
      aria-label="AI is typing"
    >
      <Orb size={26} />
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-3.5 py-3"
        style={{
          background: "var(--surface-subtle)",
          border: "1px solid var(--border)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--text-faint)",
              animation: "fcb-bounce-dot 1.1s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SKELETON                                                           */
/* ------------------------------------------------------------------ */
function LoadingSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center gap-3 border-b px-4 py-3.5"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="fcb-skeleton-shimmer h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="fcb-skeleton-shimmer h-3 w-28 rounded" />
          <div className="fcb-skeleton-shimmer h-2.5 w-16 rounded" />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex gap-2 ${i === 2 ? "flex-row-reverse" : ""}`}
          >
            {i !== 2 && (
              <div className="fcb-skeleton-shimmer h-7 w-7 shrink-0 rounded-full" />
            )}
            <div className="fcb-skeleton-shimmer h-12 w-2/3 rounded-2xl" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 px-4 pb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="fcb-skeleton-shimmer h-7 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SUGGESTED PROMPTS                                                  */
/* ------------------------------------------------------------------ */
function SuggestedPrompts({ onPick, variant = "chips" }) {
  if (variant === "grid") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPick(label)}
            className="fcb-focus group flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-sm transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
              style={{ background: "var(--surface-subtle)" }}
            >
              <Icon size={15} style={{ color: "var(--primary-b)" }} />
            </span>
            <span style={{ color: "var(--text)" }}>{label}</span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div
      className="fcb-scrollbar flex gap-2 overflow-x-auto px-4 pb-3"
      role="list"
      aria-label="Suggested prompts"
    >
      {SUGGESTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="listitem"
          onClick={() => onPick(label)}
          className="fcb-focus flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:brightness-95"
          style={{
            background: "var(--surface-subtle)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <Icon size={12} />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EMPTY STATE                                                        */
/* ------------------------------------------------------------------ */
function EmptyState({ onPick }) {
  return (
    <div className="fcb-message-in flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center">
      <div
        className="fcb-orb-anim flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ boxShadow: "0 8px 24px hsl(var(--shadow-color) / 0.3)" }}
      >
        <Sparkles size={24} className="text-white" />
      </div>
      <div className="space-y-1.5">
        <h3 className="fcb-display text-base font-semibold">
          How can I help you today?
        </h3>
        <p
          className="max-w-[26rem] text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Ask questions, generate code, summarize documents, and more.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <SuggestedPrompts onPick={onPick} variant="grid" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT MESSAGE                                                       */
/* ------------------------------------------------------------------ */
function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(message.content).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  if (isUser) {
    return (
      <div className="fcb-message-in flex flex-col items-end gap-1">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-[0.925rem] leading-relaxed text-white"
          style={{ background: "var(--user-bubble)" }}
        >
          {message.content}
        </div>
        <span
          className="pr-1 text-[0.7rem]"
          style={{ color: "var(--text-faint)" }}
        >
          {message.timestamp}
        </span>
      </div>
    );
  }

  return (
    <div className="fcb-message-in group flex items-start gap-2.5">
      <div className="mt-0.5">
        <Orb size={26} />
      </div>
      <div className="flex max-w-[82%] flex-col items-start gap-1">
        <div
          className="rounded-2xl rounded-bl-sm px-4 py-2.5"
          style={{
            background: "var(--surface-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <MarkdownContent text={message.content} />
        </div>
        <div className="flex items-center gap-2 pl-1">
          <span
            className="text-[0.7rem]"
            style={{ color: "var(--text-faint)" }}
          >
            {message.timestamp}
          </span>
          <button
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy message"}
            className="fcb-focus rounded-md p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: "var(--text-faint)" }}
          >
            {copied ? (
              <Check size={12} style={{ color: "var(--success)" }} />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT MESSAGES LIST                                                 */
/* ------------------------------------------------------------------ */
function ChatMessages({ messages, typing, onPick }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  if (messages.length === 0) {
    return <EmptyState onPick={onPick} />;
  }

  return (
    <div
      className="fcb-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4"
      role="log"
      aria-live="polite"
      aria-label="Conversation"
    >
      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} />
      ))}
      {typing && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT HEADER                                                        */
/* ------------------------------------------------------------------ */
function ChatHeader({
  onClose,
  onSearch,
  searchOpen,
  searchValue,
  onSearchChange,
  dark,
  onToggleDark,
}) {
  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3.5"
      style={{
        background: "var(--surface-raised)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="relative">
          <Orb size={34} />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
            style={{
              background: "var(--success)",
              boxShadow: "0 0 0 2px var(--surface-raised)",
            }}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="fcb-display truncate text-sm font-semibold">Sage</p>
          <p
            className="flex items-center gap-1 text-[0.7rem]"
            style={{ color: "var(--text-muted)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--success)" }}
            />
            Online
          </p>
        </div>
      </div>

      {searchOpen ? (
        <div className="flex flex-1 items-center gap-1.5 px-2">
          <Search size={14} style={{ color: "var(--text-faint)" }} />
          <input
            autoFocus
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            aria-label="Search messages"
            className="fcb-focus w-full bg-transparent text-sm outline-none"
            style={{ color: "var(--text)" }}
          />
          <button
            onClick={onSearch}
            aria-label="Close search"
            className="fcb-focus rounded-md p-1"
            style={{ color: "var(--text-faint)" }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5">
          <button
            onClick={onSearch}
            aria-label="Search conversation"
            className="fcb-focus rounded-lg p-1.5 transition-colors hover:brightness-95"
            style={{ color: "var(--text-muted)" }}
          >
            <Search size={16} />
          </button>
          <button
            onClick={onToggleDark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="fcb-focus rounded-lg p-1.5 transition-colors hover:brightness-95"
            style={{ color: "var(--text-muted)" }}
          >
            {dark ? <SunMedium size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="fcb-focus rounded-lg p-1.5 transition-colors hover:brightness-95"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT INPUT                                                         */
/* ------------------------------------------------------------------ */
function ChatInput({ value, onChange, onSend, disabled }) {
  const taRef = useRef(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  return (
    <div
      className="sticky bottom-0 flex items-end gap-2 px-3 py-3"
      style={{
        background: "var(--surface-raised)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <button
        aria-label="Attach a file"
        disabled={disabled}
        className="fcb-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:brightness-95 disabled:opacity-40"
        style={{ color: "var(--text-muted)" }}
      >
        <Paperclip size={17} />
      </button>

      <textarea
        ref={taRef}
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Waiting for response..." : "Message Sage..."}
        aria-label="Message input"
        className="fcb-focus fcb-scrollbar max-h-[120px] flex-1 resize-none rounded-2xl px-3.5 py-2 text-sm leading-relaxed outline-none disabled:opacity-60"
        style={{
          background: "var(--surface-subtle)",
          border: "1px solid var(--border)",
          color: "var(--text)",
        }}
      />

      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="fcb-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-90 disabled:opacity-40"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-a), var(--primary-b))",
        }}
      >
        <Send size={15} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT MODAL ROOT                                                    */
/* ------------------------------------------------------------------ */
export default function ChatModal() {
  const { isOpen, closeChat } = useChatbot();

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dark, setDark] = useState(false);
  const replyIndex = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) closeChat();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeChat]);

  const sendMessage = useCallback(
    (text) => {
      const content = (text ?? input).trim();
      if (!content) return;
      const userMsg = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: timeNow(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setTyping(true);

      setTimeout(() => {
        const reply =
          CANNED_REPLIES[replyIndex.current % CANNED_REPLIES.length];
        replyIndex.current += 1;
        const aiMsg = {
          id: crypto.randomUUID(),
          role: "ai",
          content: reply,
          timestamp: timeNow(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setTyping(false);
      }, 1400);
    },
    [input],
  );

  const filteredMessages = useMemo(() => {
    if (!searchOpen || !searchValue.trim()) return messages;
    const q = searchValue.toLowerCase();
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, searchOpen, searchValue]);

  if (!isOpen) return null;

  return (
    <div className={dark ? "dark" : ""}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        ${TOKENS}
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={closeChat}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI chat window"
          onClick={(e) => e.stopPropagation()}
          className="fcb-root fcb-panel-spring flex h-[650px] w-full max-w-[420px] flex-col overflow-hidden rounded-[24px]"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 60px hsl(var(--shadow-color) / 0.35)",
          }}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <ChatHeader
                onClose={closeChat}
                onSearch={() => setSearchOpen((s) => !s)}
                searchOpen={searchOpen}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                dark={dark}
                onToggleDark={() => setDark((d) => !d)}
              />
              <ChatMessages
                messages={filteredMessages}
                typing={typing}
                onPick={(text) => setInput(text)}
              />
              {messages.length > 0 && !searchOpen && (
                <SuggestedPrompts
                  onPick={(text) => setInput(text)}
                  variant="chips"
                />
              )}
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={() => sendMessage()}
                disabled={typing}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
