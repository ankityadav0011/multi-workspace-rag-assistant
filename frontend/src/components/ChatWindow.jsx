import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axiosClient";
import { useWorkspace } from "../context/WorkspaceContext";

export default function ChatWindow({ onToolCall }) {
  const { activeWorkspaceId } = useWorkspace();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!activeWorkspaceId) return;
    const { data } = await api.get(`/workspaces/${activeWorkspaceId}/chat`);
    setMessages(data.messages);
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!question.trim() || !activeWorkspaceId) return;

    const asked = question.trim();
    setQuestion("");
    setSending(true);

    // Optimistically show the user's message right away.
    setMessages((prev) => [...prev, { _id: `temp-${Date.now()}`, role: "user", content: asked, citations: [] }]);

    try {
      const { data } = await api.post(`/workspaces/${activeWorkspaceId}/chat`, { question: asked });
      setMessages((prev) => [
        ...prev.filter((m) => !String(m._id).startsWith("temp-")),
        data.userMessage,
        data.assistantMessage,
      ]);
      if (data.toolCallLogs?.length > 0 && onToolCall) {
        onToolCall();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter((m) => !String(m._id).startsWith("temp-")),
        { _id: `err-${Date.now()}`, role: "assistant", content: "Something went wrong answering that.", citations: [] },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="panel chat-panel">
      <h2>Chat</h2>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="empty-state">Ask a question about this workspace's documents, or ask me to save a task or post a Discord summary.</p>
        )}
        {messages.map((m) => (
          <div key={m._id} className={`chat-message chat-message-${m.role}`}>
            <div className="chat-bubble">
              <p>{m.content}</p>
              {m.citations?.length > 0 && (
                <div className="citations">
                  {m.citations.map((c, i) => (
                    <div key={i} className="citation">
                      [Source {i + 1}] {c.documentName} · chunk {c.chunkIndex}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question or give an instruction..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !question.trim()}>
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
