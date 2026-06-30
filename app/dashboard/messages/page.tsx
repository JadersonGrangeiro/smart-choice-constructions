"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

interface Thread {
  id: string;
  last_message_at: string;
  homeowner?: { id: string; full_name: string | null; email: string };
  contractor?: { id: string; company_name: string; email: string };
  messages?: Message[];
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [role, setRole] = useState<"homeowner" | "contractor">("homeowner");
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/threads");
      const json = await res.json();
      if (json.error) return;
      setThreads(json.threads ?? []);
      setRole(json.role ?? "homeowner");
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  const loadMessages = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      const json = await res.json();
      if (json.messages) {
        setMessages(json.messages);
        // Infer current user from sender context
        const outgoing = json.messages.find((m: Message) => !m.is_read === false);
        if (outgoing) setCurrentUserId(outgoing.sender_id);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected);
    const interval = setInterval(() => loadMessages(selected), 5000);
    return () => clearInterval(interval);
  }, [selected, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!draft.trim() || !selected || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${selected}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      const json = await res.json();
      if (json.message) {
        setMessages(prev => [...prev, json.message]);
        setCurrentUserId(json.message.sender_id);
        setDraft("");
        await loadThreads();
      }
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const getThreadName = (t: Thread) =>
    role === "contractor"
      ? (t.homeowner?.full_name ?? t.homeowner?.email ?? "Homeowner")
      : (t.contractor?.company_name ?? t.contractor?.email ?? "Contractor");

  const getLastMessage = (t: Thread) => {
    const msgs = t.messages ?? [];
    return msgs[msgs.length - 1]?.body ?? "No messages yet";
  };

  const getUnread = (t: Thread) => (t.messages ?? []).filter(m => !m.is_read && m.sender_id !== currentUserId).length;

  const selectedThread = threads.find(t => t.id === selected);

  if (loading) return (
    <div style={{ paddingTop: "76px", display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 76px)", flexDirection: "column", gap: "1rem", color: "var(--gray-400)" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Loading messages...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ paddingTop: "76px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "var(--navy)", color: "white", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        {selected && (
          <button onClick={() => setSelected(null)} className="msg-back-btn"
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "0.25rem 0.5rem", fontSize: "1.25rem", lineHeight: 1, flexShrink: 0, display: "none" }}>
            ←
          </button>
        )}
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, marginBottom: "0.125rem" }}>Messages</h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.65 }}>
            {threads.length} conversation{threads.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .msg-back-btn { display: block !important; }
          .msg-thread-panel { display: ${selected ? "none" : "block"} !important; }
          .msg-chat-panel  { display: ${selected ? "flex"  : "none"} !important; }
        }
      `}</style>

      <div className="msg-layout">
        {/* Thread list */}
        <div className="msg-thread-panel" style={{ borderRight: "1px solid var(--gray-150)", overflowY: "auto", background: "white" }}>
          {threads.length === 0 ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--gray-400)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💬</div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.65 }}>
                {role === "contractor"
                  ? "Homeowners who request a quote will appear here."
                  : "Start a conversation by requesting a quote from a contractor."}
              </p>
            </div>
          ) : threads.map(t => {
            const unread = getUnread(t);
            const isSelected = selected === t.id;
            return (
              <button key={t.id} onClick={() => setSelected(t.id)} style={{
                display: "block", width: "100%", padding: "1rem 1.25rem", textAlign: "left",
                background: isSelected ? "rgba(22,46,94,0.06)" : "transparent",
                borderBottom: "1px solid var(--gray-100)",
                borderLeft: isSelected ? "3px solid var(--navy)" : "3px solid transparent",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "42px", height: "42px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0, fontSize: "1rem" }}>
                    {getThreadName(t).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{getThreadName(t)}</span>
                      {unread > 0 && (
                        <span style={{ background: "var(--red)", color: "white", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 800, padding: "0.1rem 0.5rem", flexShrink: 0 }}>{unread}</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {getLastMessage(t)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-300)", marginTop: "0.25rem" }}>
                      {new Date(t.last_message_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat panel */}
        {!selected ? (
          <div className="msg-chat-panel" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", color: "var(--gray-400)", background: "var(--gray-50)" }}>
            <div style={{ fontSize: "3rem" }}>💬</div>
            <p style={{ fontWeight: 600, color: "var(--gray-500)" }}>Select a conversation</p>
          </div>
        ) : (
          <div className="msg-chat-panel" style={{ display: "flex", flexDirection: "column", background: "var(--gray-50)" }}>
            {/* Chat header */}
            <div style={{ background: "white", padding: "1rem 1.5rem", borderBottom: "1px solid var(--gray-150)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>
                {selectedThread ? getThreadName(selectedThread).charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--navy)" }}>{selectedThread ? getThreadName(selectedThread) : ""}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                  {role === "contractor" ? selectedThread?.homeowner?.email : selectedThread?.contractor?.email}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--gray-400)", padding: "2rem", fontSize: "0.9rem" }}>
                  No messages yet — send the first one below.
                </div>
              )}
              {messages.map(m => {
                const isMine = m.sender_id === currentUserId;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "68%", padding: "0.875rem 1.125rem", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: isMine ? "var(--navy)" : "white",
                      color: isMine ? "white" : "var(--gray-800)",
                      boxShadow: isMine ? "none" : "var(--shadow-sm)",
                      border: isMine ? "none" : "1px solid var(--gray-150)",
                    }}>
                      <p style={{ margin: 0, lineHeight: 1.65, fontSize: "0.9375rem", wordBreak: "break-word" }}>{m.body}</p>
                      <div style={{ fontSize: "0.7rem", marginTop: "0.375rem", opacity: 0.6, textAlign: isMine ? "right" : "left" }}>
                        {new Date(m.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {isMine && <span style={{ marginLeft: "0.375rem" }}>{m.is_read ? "✓✓" : "✓"}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ background: "white", padding: "1rem 1.5rem", borderTop: "1px solid var(--gray-150)", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                rows={1}
                style={{
                  flex: 1, resize: "none", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius)",
                  padding: "0.75rem 1rem", fontFamily: "inherit", fontSize: "0.9375rem",
                  outline: "none", lineHeight: 1.5, minHeight: "44px", maxHeight: "120px",
                  overflowY: "auto",
                }}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                }}
              />
              <button onClick={sendMessage} disabled={!draft.trim() || sending}
                style={{
                  padding: "0.75rem 1.5rem", background: draft.trim() ? "var(--navy)" : "var(--gray-200)",
                  color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700,
                  cursor: draft.trim() && !sending ? "pointer" : "not-allowed", fontFamily: "inherit",
                  fontSize: "0.875rem", transition: "all 0.15s", flexShrink: 0,
                }}>
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
