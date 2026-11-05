import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Plus, Send, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Conversation } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { RequireRole } from "../components/RequireRole";
import { PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <RequireRole roles={["CUSTOMER", "TECHNICIAN", "ADMIN"]}>
      <MessagesContent />
    </RequireRole>
  );
}

function MessagesContent() {
  const { user } = useAuth();
  const { t, formatDateTime, formatDate } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newChat, setNewChat] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === "ADMIN") void navigate({ to: "/admin/messages" });
  }, [user, navigate]);

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => api<{ conversations: Conversation[] }>("/chat/conversations"),
    refetchInterval: 15000,
  });
  const threadQuery = useQuery({
    queryKey: ["chat", "thread", selectedId],
    queryFn: () => api<{ conversation: Conversation }>(`/chat/conversations/${selectedId}`),
    enabled: !!selectedId,
    refetchInterval: selectedId ? 8000 : false,
  });

  const conversations = conversationsQuery.data?.conversations ?? [];
  const conversation = threadQuery.data?.conversation;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  async function send() {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    setError("");
    try {
      await api(`/chat/conversations/${selectedId}/messages`, {
        method: "POST",
        body: { body: reply },
      });
      setReply("");
      await queryClient.invalidateQueries({ queryKey: ["chat", "thread", selectedId] });
      await queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setSending(false);
    }
  }

  async function startChat(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const data = await api<{ conversation: Conversation }>("/chat/conversations", {
        method: "POST",
        body: {
          type: "SUPPORT",
          subject: newChat.subject,
          message: newChat.message,
        },
      });
      setSelectedId(data.conversation.id);
      setNewChat({ subject: "", message: "" });
      setShowNew(false);
      await queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("chat.conversations")}</h1>
          <p className="mt-1 text-sm text-base-content/65">{t("chat.subtitle")}</p>
        </div>
        <button onClick={() => setShowNew((value) => !value)} className="btn btn-primary btn-sm">
          {showNew ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {t("chat.newChat")}
        </button>
      </div>

      {error && <div className="alert alert-error mt-4 text-sm">{error}</div>}

      {showNew && (
        <form onSubmit={startChat} className="mt-4 rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="text-base font-bold">{t("chat.newChat")}</h2>
          <div className="mt-3 grid gap-3">
            <input
              required
              minLength={3}
              value={newChat.subject}
              onChange={(event) => setNewChat({ ...newChat, subject: event.target.value })}
              placeholder={t("chat.subjectPlaceholder")}
              className="input input-bordered input-sm w-full"
            />
            <textarea
              required
              rows={3}
              value={newChat.message}
              onChange={(event) => setNewChat({ ...newChat, message: event.target.value })}
              placeholder={t("chat.message")}
              className="textarea textarea-bordered w-full text-sm"
            />
            <button disabled={sending} className="btn btn-primary btn-sm w-fit">
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("chat.start")}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.35fr_0.65fr]">
        <div className="space-y-2">
          {conversationsQuery.isLoading && <PageLoader />}
          {conversations.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelectedId(entry.id)}
              className={`w-full rounded-box border p-3 text-left transition ${
                selectedId === entry.id
                  ? "border-primary bg-primary/5"
                  : "border-base-300 bg-base-100 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="badge badge-ghost badge-xs">
                  {entry.type === "SUPPORT" ? t("chat.support") : entry.type === "DIRECT" ? t("chat.direct") : t("chat.guest")}
                </span>
                <span className="text-[10px] text-base-content/70">{formatDate(entry.updatedAt)}</span>
              </div>
              <p className="mt-1 truncate text-sm font-semibold">{entry.subject}</p>
              <p className="mt-1 truncate text-[11px] text-base-content/65">
                {entry.messages[0]?.body || t("chat.noReply")}
              </p>
            </button>
          ))}
          {!conversationsQuery.isLoading && conversations.length === 0 && (
            <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center text-xs text-base-content/70">
              {t("chat.noConversations")}
            </div>
          )}
        </div>

        <div>
          {!selectedId && (
            <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-box border border-dashed border-base-300 bg-base-100 text-center">
              <MessageSquare className="h-10 w-10 text-base-content/20" />
              <p className="mt-2 text-sm text-base-content/70">{t("chat.conversations")}</p>
            </div>
          )}
          {selectedId && threadQuery.isLoading && <PageLoader />}
          {selectedId && conversation && (
            <div className="rounded-box border border-base-300 bg-base-100 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold">{conversation.subject}</h2>
                  <p className="text-[11px] text-base-content/70">
                    {conversation.customer?.fullName || conversation.guestName || t("chat.direct")}
                  </p>
                </div>
                <StatusBadge status={conversation.status} />
              </div>

              <div className="mt-4 max-h-[26rem] space-y-3 overflow-y-auto pr-1 chat-scroll">
                {conversation.messages.map((message) => {
                  const mine = message.senderId === user?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          mine
                            ? "rounded-br-sm bg-primary text-primary-content"
                            : "rounded-bl-sm bg-base-200"
                        }`}
                      >
                        <p className="text-[10px] font-semibold opacity-70">
                          {message.sender?.fullName || message.senderName || t("chat.team")}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words">{message.body}</p>
                        <p className="mt-1 text-[10px] opacity-55">
                          {formatDateTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {conversation.status === "OPEN" ? (
                <div className="mt-4 flex items-end gap-2 border-t border-base-200 pt-4">
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    rows={2}
                    placeholder={t("chat.replyPlaceholder")}
                    className="textarea textarea-bordered flex-1 resize-none text-sm"
                  />
                  <button
                    onClick={send}
                    disabled={sending || !reply.trim()}
                    className="btn btn-primary h-11 w-11 p-0"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-base-200 p-2 text-xs text-base-content/65">
                  {t("chat.closed")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
