import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Send,
  X,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { Conversation, Message } from "../lib/types";

const GUEST_KEY = "orbit_guest_chat";

type GuestSession = { id: string; token: string; subject: string };

function readGuest(): GuestSession | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as GuestSession) : null;
  } catch {
    return null;
  }
}

export function ChatWidget() {
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [guest, setGuest] = useState<GuestSession | null>(readGuest);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCustomer = user?.role === "CUSTOMER";

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => api<{ conversations: Conversation[] }>("/chat/conversations"),
    enabled: open && !!user,
    refetchInterval: open ? 8000 : false,
  });

  const activeId = selectedId;

  const threadQuery = useQuery({
    queryKey: ["chat", "thread", activeId],
    queryFn: () =>
      api<{ conversation: Conversation }>(`/chat/conversations/${activeId}`),
    enabled: open && !!user && !!activeId,
    refetchInterval: open ? 6000 : false,
  });

  const guestQuery = useQuery({
    queryKey: ["chat", "guest", guest?.id],
    queryFn: () =>
      api<{ conversation: { messages: Message[]; subject: string; status: string } }>(
        `/chat/guest/${guest!.id}?token=${encodeURIComponent(guest!.token)}`,
      ),
    enabled: open && !user && !!guest,
    refetchInterval: open ? 6000 : false,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threadQuery.data, guestQuery.data, open]);

  // For a customer, open their latest support conversation automatically.
  useEffect(() => {
    if (user && isCustomer && !selectedId && conversationsQuery.data) {
      const support = conversationsQuery.data.conversations.find(
        (conversation) => conversation.type === "SUPPORT",
      );
      if (support) setSelectedId(support.id);
    }
  }, [user, isCustomer, selectedId, conversationsQuery.data]);

  async function sendAuthenticated() {
    if (!draft.trim() || !activeId) return;
    setSending(true);
    setError("");
    try {
      await api(`/chat/conversations/${activeId}/messages`, {
        method: "POST",
        body: { body: draft },
      });
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["chat", "thread", activeId] });
      await queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    } catch (caught) {
      setError(errorMessage(caught, t("chat.error")));
    } finally {
      setSending(false);
    }
  }

  async function sendGuest() {
    if (!draft.trim() || !guest) return;
    setSending(true);
    setError("");
    try {
      await api(`/chat/guest/${guest.id}/messages`, {
        method: "POST",
        body: { token: guest.token, body: draft },
      });
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["chat", "guest", guest.id] });
    } catch (caught) {
      setError(errorMessage(caught, t("chat.error")));
    } finally {
      setSending(false);
    }
  }

  function closeGuest() {
    localStorage.removeItem(GUEST_KEY);
    setGuest(null);
    queryClient.removeQueries({ queryKey: ["chat", "guest"] });
  }

  const threadMessages: Message[] = user
    ? threadQuery.data?.conversation.messages ?? []
    : guestQuery.data?.conversation.messages ?? [];

  const threadStatus = user
    ? threadQuery.data?.conversation.status
    : guestQuery.data?.conversation.status;

  function messageClass(message: Message) {
    const mine = user ? message.senderId === user.id : !message.senderId;
    return mine
      ? "ml-auto rounded-2xl rounded-br-sm bg-primary text-primary-content"
      : "mr-auto rounded-2xl rounded-bl-sm bg-base-200 text-base-content";
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-3 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-2xl sm:right-5">
          <div className="flex items-center gap-2 bg-primary px-4 py-3 text-primary-content">
            {selectedId && user ? (
              <Button
                onClick={() => setSelectedId(null)}
                className={cn(" border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs text-primary-content")}
                aria-label={t("common.back")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <MessagesSquare className="h-5 w-5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{t("chat.title")}</p>
              <p className="flex items-center gap-1.5 truncate text-[11px] text-primary-content/75">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                {t("chat.online")}
              </p>
            </div>
            <Button
              onClick={() => setOpen(false)}
              className={cn(" border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs text-primary-content")}
              aria-label={t("chat.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 chat-scroll">
            {/* Guest without a conversation: start form */}
            {!user && !guest && (
              <GuestStart
                onStarted={(session) => {
                  setGuest(session);
                  localStorage.setItem(GUEST_KEY, JSON.stringify(session));
                }}
              />
            )}

            {/* Logged-in customer without any support thread */}
            {user && isCustomer && !selectedId && !conversationsQuery.isLoading && (
              <CustomerStart
                onStarted={(conversationId) => {
                  setSelectedId(conversationId);
                  void queryClient.invalidateQueries({
                    queryKey: ["chat", "conversations"],
                  });
                }}
              />
            )}

            {/* Staff: list conversations in the widget */}
            {user && !isCustomer && !selectedId && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-base-content/65">
                    {t("chat.conversations")}
                  </p>
                  <Link to="/messages" className={cn("underline cursor-pointer text-primary text-xs")}>
                    {t("chat.allChats")}
                  </Link>
                </div>
                {(conversationsQuery.data?.conversations ?? []).slice(0, 8).map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className="w-full rounded-lg border border-base-300 p-2.5 text-left transition hover:bg-base-200"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold">{conversation.subject}</p>
                      <Badge className={cn(" bg-base-200 text-base-content h-4 text-xs")}>{conversation.type}</Badge>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-base-content/65">
                      {conversation.messages[0]?.body || t("chat.noReply")}
                    </p>
                  </button>
                ))}
                {conversationsQuery.data?.conversations.length === 0 && (
                  <p className="py-8 text-center text-xs text-base-content/65">
                    {t("chat.noConversations")}
                  </p>
                )}
              </div>
            )}

            {/* Thread */}
            {(selectedId || guest) && (
              <div className="space-y-3">
                {guest && (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-base-200 px-2.5 py-2 text-[11px] text-base-content/70">
                    <span>{t("chat.guestNote")}</span>
                    <button onClick={closeGuest} className={cn("underline cursor-pointer text-primary shrink-0")}>
                      {t("chat.newChat")}
                    </button>
                  </div>
                )}
                {threadMessages.map((message) => (
                  <div key={message.id} className={`max-w-[85%] px-3 py-2 text-sm ${messageClass(message)}`}>
                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {message.sender?.fullName || message.senderName || t("chat.team")} ·{" "}
                      {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                ))}
                {(threadQuery.isLoading || guestQuery.isLoading) && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
                {threadStatus === "CLOSED" && (
                  <p className="rounded-lg bg-base-200 p-2 text-center text-xs text-base-content/70">
                    {t("chat.closed")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Reply box */}
          {((user && selectedId) || (!user && guest)) && threadStatus !== "CLOSED" && (
            <div className="border-t border-base-300 p-2.5">
              {error && <p className="mb-1.5 text-xs text-error">{error}</p>}
              <div className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void (user ? sendAuthenticated() : sendGuest());
                    }
                  }}
                  rows={2}
                  maxLength={4000}
                  placeholder={t("chat.placeholder")}
                  className={cn(" min-h-12 flex-1 resize-none text-sm")}
                />
                <Button
                  onClick={() => void (user ? sendAuthenticated() : sendGuest())}
                  disabled={sending || !draft.trim()}
                  className={cn(" bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm h-11 w-11 p-0")}
                  aria-label={t("chat.send")}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-content shadow-xl transition hover:scale-105"
        aria-label={open ? t("chat.close") : t("chat.title")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}

function GuestStart({ onStarted }: { onStarted: (session: GuestSession) => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    acceptPrivacy: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ conversationId: string; token: string }>("/chat/guest", {
        method: "POST",
        body: form,
      });
      onStarted({
        id: data.conversationId,
        token: data.token,
        subject: form.subject,
      });
    } catch (caught) {
      setError(errorMessage(caught, t("chat.error")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <p className="text-sm font-bold">{t("chat.guestTitle")}</p>
        <p className="text-xs text-base-content/70">{t("chat.guestText")}</p>
      </div>
      <Input
        required
        minLength={2}
        className={cn(" h-8 text-xs w-full")}
        placeholder={t("chat.name")}
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
      />
      <Input
        required
        type="email"
        className={cn(" h-8 text-xs w-full")}
        placeholder={t("chat.email")}
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
      />
      <Input
        required
        minLength={3}
        className={cn(" h-8 text-xs w-full")}
        placeholder={t("chat.subject")}
        value={form.subject}
        onChange={(event) => setForm({ ...form, subject: event.target.value })}
      />
      <Textarea
        required
        minLength={1}
        rows={3}
        className={cn(" w-full text-sm")}
        placeholder={t("chat.message")}
        value={form.message}
        onChange={(event) => setForm({ ...form, message: event.target.value })}
      />
      <label className="flex items-start gap-2 text-[11px] leading-snug text-base-content/70">
        <input
          type="checkbox"
          required
          className={cn("appearance-auto accent-primary size-6 shrink-0 rounded-field border border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary size-4 mt-0.5")}
          checked={form.acceptPrivacy}
          onChange={(event) => setForm({ ...form, acceptPrivacy: event.target.checked })}
        />
        <span>
          {t("chat.consent")}{" "}
          <Link to="/legal/privacy" className={cn("underline cursor-pointer text-primary")}>
            {t("footer.privacy")}
          </Link>
        </span>
      </label>
      {error && <p className="text-xs text-error">{error}</p>}
      <Button disabled={loading} className={cn(" bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm w-full")}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("chat.start")}
      </Button>
    </form>
  );
}

function CustomerStart({ onStarted }: { onStarted: (id: string) => void }) {
  const { t } = useI18n();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ conversation: Conversation }>("/chat/conversations", {
        method: "POST",
        body: { type: "SUPPORT", subject, message },
      });
      onStarted(data.conversation.id);
    } catch (caught) {
      setError(errorMessage(caught, t("chat.error")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <p className="text-sm font-bold">{t("chat.guestTitle")}</p>
        <p className="text-xs text-base-content/70">{t("chat.subtitle")}</p>
      </div>
      <Input
        required
        minLength={3}
        className={cn(" h-8 text-xs w-full")}
        placeholder={t("chat.subjectPlaceholder")}
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
      />
      <Textarea
        required
        rows={4}
        className={cn(" w-full text-sm")}
        placeholder={t("chat.message")}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <Button disabled={loading} className={cn(" bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm w-full")}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("chat.start")}
      </Button>
    </form>
  );
}
