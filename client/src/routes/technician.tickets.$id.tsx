import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Lock, Send } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Ticket } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { useTechnicianNav } from "../components/nav";
import { Panel } from "../components/DashboardShell";
import { TechnicianDashboardShell as DashboardShell } from "../components/TechnicianDashboardShell";
import { ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/technician/tickets/$id")({
  component: TechnicianTicketDetail,
});

const statuses = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];

function TechnicianTicketDetail() {
  const { id } = useParams({ from: "/technician/tickets/$id" });
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();
  const nav = useTechnicianNav();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => api<{ ticket: Ticket }>(`/tickets/${id}`),
    refetchInterval: 15000,
  });

  const ticket = data?.ticket;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages?.length]);

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    try {
      await api(`/tickets/${id}/messages`, {
        method: "POST",
        body: { body: reply, isInternal: internal },
      });
      setReply("");
      await queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(status: string) {
    try {
      await api(`/tickets/${id}/status`, { method: "PATCH", body: { status } });
      await queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  if (isLoading) {
    return (
      <DashboardShell nav={nav} title={t("tickets.details")}>
        <PageLoader />
      </DashboardShell>
    );
  }
  if (isError || !ticket) {
    return (
      <DashboardShell nav={nav} title={t("tickets.details")}>
        <ErrorState />
        <Link
          to="/technician/tickets"
          className={cn(
            buttonVariants(),
            " border-current bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm mt-4",
          )}
        >
          <ArrowLeft className="h-4 w-4" /> {t("tickets.back")}
        </Link>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      nav={nav}
      title={ticket.subject}
      subtitle={`${ticket.reference} · ${ticket.customer?.fullName}`}
      actions={
        <Link
          to="/technician/tickets"
          className={cn(
            buttonVariants(),
            " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-8 px-3 text-sm",
          )}
        >
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title={t("tickets.messages")}>
          <div className="max-h-[30rem] space-y-4 overflow-y-auto pr-1 chat-scroll">
            {(ticket.messages ?? []).map((message) => {
              const mine = message.authorId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      message.isInternal
                        ? "border border-warning/40 bg-warning/10 text-base-content"
                        : mine
                          ? "rounded-br-sm bg-primary text-primary-content"
                          : "rounded-bl-sm bg-base-200 text-base-content"
                    }`}
                  >
                    <p className="flex items-center gap-1 text-xs font-semibold opacity-70">
                      {message.isInternal && <Lock className="h-3 w-3" />}
                      {message.author?.fullName ||
                        message.authorName ||
                        t("tickets.staff")}
                      {message.isInternal && ` · ${t("tickets.internal")}`}
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

          <form
            onSubmit={sendReply}
            className="mt-4 border-t border-hairline pt-4"
          >
            {error && <p className="mb-2 text-xs text-error">{error}</p>}
            <Textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              required
              rows={3}
              maxLength={4000}
              placeholder={t("chat.replyPlaceholder")}
              className={cn(" w-full text-sm")}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                <input
                  type="checkbox"
                  className={cn(
                    "appearance-auto accent-primary size-6 shrink-0 rounded-field border border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary size-4",
                  )}
                  checked={internal}
                  onChange={(event) => setInternal(event.target.checked)}
                />
                {t("tickets.internalNote")}
              </label>
              <Button
                disabled={sending || !reply.trim()}
                className={cn(
                  " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
                )}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {t("tickets.sendReply")}
              </Button>
            </div>
          </form>
        </Panel>

        <Panel title={t("tickets.details")}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-muted">
                {t("tickets.status")}
              </span>
              <StatusBadge status={ticket.status} />
            </div>
            <NativeSelect
              value={ticket.status}
              onChange={(event) => void updateStatus(event.target.value)}
              className={cn(" h-8 text-xs w-full")}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}` as "status.OPEN")}
                </option>
              ))}
            </NativeSelect>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-muted">
                {t("tickets.priority")}
              </span>
              <Badge
                className={cn(" border-current bg-transparent h-5 text-xs")}
              >
                {t(`priority.${ticket.priority}` as "priority.LOW")}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-muted">
                {t("tickets.customer")}
              </span>
              <span>{ticket.customer?.fullName}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-muted">
                {t("common.reference")}
              </span>
              <span className="tabular-nums text-xs">{ticket.reference}</span>
            </div>
          </div>
          <p className="mt-4 border-t border-hairline pt-3 text-xs leading-relaxed text-ink-muted">
            {ticket.description}
          </p>
        </Panel>
      </div>
    </DashboardShell>
  );
}
