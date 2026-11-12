import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Plus, Send, Users, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Conversation, User } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { Panel } from "../components/DashboardShell";
import { AdminDashboardShell as DashboardShell } from "../components/AdminDashboardShell";
import {
  ArchiveTabs,
  FilterSelect,
  ListToolbar,
  Pagination,
  SearchField,
} from "../components/ListControls";
import { EmptyState, PageLoader, StatusBadge } from "../components/ui";
import {
  filterByArchive,
  matchesSearch,
  paginate,
  useListControls,
} from "../lib/list";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesPage,
});

const conversationStatuses = ["OPEN", "CLOSED"];

function AdminMessagesPage() {
  const { user } = useAuth();
  const { t, formatDateTime, formatDate } = useI18n();
  const nav = useAdminNav();
  const queryClient = useQueryClient();
  const controls = useListControls(8);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newChat, setNewChat] = useState({
    subject: "",
    message: "",
    participantIds: [] as string[],
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () =>
      api<{ conversations: Conversation[] }>("/chat/conversations"),
    refetchInterval: 15000,
  });
  const threadQuery = useQuery({
    queryKey: ["chat", "thread", selectedId],
    queryFn: () =>
      api<{ conversation: Conversation }>(`/chat/conversations/${selectedId}`),
    enabled: !!selectedId,
    refetchInterval: selectedId ? 8000 : false,
  });
  const staffQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<{ users: User[] }>("/admin/users"),
    enabled: showNew,
  });

  const conversations = conversationsQuery.data?.conversations ?? [];
  const conversation = threadQuery.data?.conversation;

  const filteredConversations = filterByArchive(
    conversations.filter(
      (entry) =>
        (!controls.status || entry.status === controls.status) &&
        matchesSearch(
          controls.search,
          entry.subject,
          entry.customer?.fullName,
          entry.customer?.email,
          entry.guestName,
          entry.guestEmail,
          entry.messages[0]?.body,
        ),
    ),
    controls.archive,
    (entry) => entry.status === "CLOSED",
  );

  const pageData = paginate(
    filteredConversations,
    controls.page,
    controls.pageSize,
  );

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
      await queryClient.invalidateQueries({
        queryKey: ["chat", "thread", selectedId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setSending(false);
    }
  }

  async function closeConversation() {
    if (!selectedId) return;
    try {
      await api(`/chat/conversations/${selectedId}/close`, { method: "PATCH" });
      await queryClient.invalidateQueries({
        queryKey: ["chat", "thread", selectedId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  async function startChat(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const data = await api<{ conversation: Conversation }>(
        "/chat/conversations",
        {
          method: "POST",
          body: {
            type: "DIRECT",
            subject: newChat.subject,
            message: newChat.message,
            participantIds: newChat.participantIds,
          },
        },
      );
      setSelectedId(data.conversation.id);
      setNewChat({ subject: "", message: "", participantIds: [] });
      setShowNew(false);
      await queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setSending(false);
    }
  }

  function toggleParticipant(id: string) {
    setNewChat((current) => ({
      ...current,
      participantIds: current.participantIds.includes(id)
        ? current.participantIds.filter((entry) => entry !== id)
        : [...current.participantIds, id],
    }));
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("admin.messages")}
      subtitle={t("chat.subtitle")}
      actions={
        <Button
          onClick={() => setShowNew((value) => !value)}
          className={cn(
            " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
          )}
        >
          {showNew ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {t("chat.newChat")}
        </Button>
      }
    >
      {error && (
        <Alert
          className={cn(
            "flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-error text-error-content border-error mb-4 text-sm",
          )}
        >
          {error}
        </Alert>
      )}

      {showNew && (
        <form
          onSubmit={startChat}
          className="mb-5 rounded-box border border-base-300 bg-base-100 p-6"
        >
          <h2 className="flex items-center gap-2 text-base font-medium">
            <Users className="h-4 w-4" /> {t("chat.newChat")}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.subject")}
              </span>
              <Input
                required
                minLength={3}
                value={newChat.subject}
                onChange={(event) =>
                  setNewChat({ ...newChat, subject: event.target.value })
                }
                className={cn(" h-8 text-xs w-full")}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("chat.conversations")}
              </span>
              <div className="flex flex-wrap gap-2 rounded-lg border border-base-300 p-2">
                {(staffQuery.data?.users ?? [])
                  .filter((entry) => entry.id !== user?.id)
                  .map((entry) => (
                    <label
                      key={entry.id}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <input
                        type="checkbox"
                        className={cn(
                          "appearance-auto accent-primary size-6 shrink-0 rounded-field border border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary size-4",
                        )}
                        checked={newChat.participantIds.includes(entry.id)}
                        onChange={() => toggleParticipant(entry.id)}
                      />
                      {entry.fullName}
                    </label>
                  ))}
              </div>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.message")}
              </span>
              <Textarea
                required
                rows={3}
                value={newChat.message}
                onChange={(event) =>
                  setNewChat({ ...newChat, message: event.target.value })
                }
                className={cn(" w-full text-sm")}
              />
            </label>
          </div>
          <Button
            disabled={sending}
            className={cn(
              " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm mt-3",
            )}
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("chat.start")}
          </Button>
        </form>
      )}

      <ListToolbar>
        <SearchField
          value={controls.search}
          onChange={controls.setSearch}
          placeholder={t("list.searchMessages")}
        />
        <FilterSelect
          value={controls.status}
          onChange={controls.setStatus}
          options={conversationStatuses.map((value) => ({
            value,
            label: t(`status.${value}` as "status.OPEN"),
          }))}
          allLabel={t("common.all")}
          ariaLabel={t("common.status")}
        />
        <ArchiveTabs value={controls.archive} onChange={controls.setArchive} />
      </ListToolbar>

      <div className="mt-5 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div>
          <div className="space-y-2">
            {conversationsQuery.isLoading && <PageLoader />}
            {!conversationsQuery.isLoading && pageData.total === 0 && (
              <EmptyState title={t("chat.noConversations")} />
            )}
            {pageData.items.map((entry) => (
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
                  <Badge
                    className={cn(" bg-base-200 text-base-content h-4 text-xs")}
                  >
                    {entry.type === "SUPPORT"
                      ? t("chat.support")
                      : entry.type === "DIRECT"
                        ? t("chat.direct")
                        : t("chat.guest")}
                  </Badge>
                  <span className="text-xs text-ink-muted">
                    {formatDate(entry.updatedAt)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold">
                  {entry.subject}
                </p>
                <p className="text-xs text-ink-muted">
                  {entry.customer?.fullName ||
                    entry.guestName ||
                    t("chat.direct")}
                </p>
                <p className="mt-1 truncate text-xs text-ink-muted">
                  {entry.messages[0]?.body || t("chat.noReply")}
                </p>
              </button>
            ))}
          </div>

          <Pagination
            page={pageData.page}
            totalPages={pageData.totalPages}
            from={pageData.from}
            to={pageData.to}
            total={pageData.total}
            pageSize={controls.pageSize}
            onPageChange={controls.setPage}
            onPageSizeChange={controls.setPageSize}
          />
        </div>

        <div>
          {!selectedId && (
            <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center text-sm text-ink-muted">
              {t("chat.conversations")}
            </div>
          )}
          {selectedId && threadQuery.isLoading && <PageLoader />}
          {selectedId && conversation && (
            <Panel
              title={conversation.subject}
              action={
                <div className="flex items-center gap-2">
                  <StatusBadge status={conversation.status} />
                  {conversation.status === "OPEN" && (
                    <Button
                      onClick={closeConversation}
                      className={cn(
                        " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                      )}
                    >
                      {t("chat.markClosed")}
                    </Button>
                  )}
                </div>
              }
            >
              <p className="text-xs text-ink-muted">
                {conversation.customer?.fullName ||
                  conversation.guestName ||
                  t("chat.direct")}{" "}
                ·{" "}
                {conversation.guestEmail || conversation.customer?.email || ""}
              </p>
              <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1 chat-scroll">
                {conversation.messages.map((message) => {
                  const mine = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          mine
                            ? "rounded-br-sm bg-primary text-primary-content"
                            : "rounded-bl-sm bg-base-200"
                        }`}
                      >
                        <p className="text-xs font-semibold opacity-70">
                          {message.sender?.fullName ||
                            message.senderName ||
                            t("chat.team")}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words">
                          {message.body}
                        </p>
                        <p className="mt-1 text-xs opacity-55">
                          {formatDateTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {conversation.status === "OPEN" ? (
                <div className="mt-4 border-t border-hairline pt-4">
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      rows={2}
                      placeholder={t("chat.replyPlaceholder")}
                      className={cn(" flex-1 resize-none text-sm")}
                    />
                    <Button
                      onClick={send}
                      disabled={sending || !reply.trim()}
                      className={cn(
                        " bg-primary text-primary-content border-primary hover:bg-primary-hover h-11 w-11 p-0",
                      )}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-base-200 p-2 text-xs text-ink-muted">
                  <Lock className="h-3.5 w-3.5" /> {t("chat.closed")}
                </p>
              )}
            </Panel>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
