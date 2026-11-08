import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Ticket } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { usePortalNav } from "../components/nav";
import { DashboardShell, Panel } from "../components/DashboardShell";
import { ErrorState, PageLoader, StatusBadge } from "../components/ui";

export const Route = createFileRoute("/portal/tickets/$id")({
  component: TicketDetailPage,
});

function TicketDetailPage() {
  const { id } = useParams({ from: "/portal/tickets/$id" });
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();
  const nav = usePortalNav();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
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
        body: { body: reply },
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
        <ErrorState message={t("common.error")} />
        <Link to="/portal/tickets" className="ds-btn ds-btn-outline ds-btn-sm mt-4">
          <ArrowLeft className="h-4 w-4" /> {t("tickets.back")}
        </Link>
      </DashboardShell>
    );
  }

  const messages = ticket.messages ?? [];

  return (
    <DashboardShell
      nav={nav}
      title={ticket.subject}
      subtitle={`${ticket.reference} · ${formatDateTime(ticket.createdAt)}`}
      actions={
        <Link to="/portal/tickets" className="ds-btn ds-btn-ghost ds-btn-sm">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Panel title={t("tickets.messages")}>
          <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-1 chat-scroll">
            {messages.map((message) => {
              const mine = message.authorId === user?.id;
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      mine
                        ? "rounded-br-sm bg-primary text-primary-content"
                        : "rounded-bl-sm bg-base-200 text-base-content"
                    }`}
                  >
                    <p className="text-[10px] font-semibold opacity-70">
                      {mine
                        ? t("chat.you")
                        : message.author?.fullName || message.authorName || t("tickets.staff")}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words">{message.body}</p>
                    <p className="mt-1 text-[10px] opacity-55">{formatDateTime(message.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {ticket.status !== "CLOSED" ? (
            <form onSubmit={sendReply} className="mt-4 border-t border-base-200 pt-4">
              {error && <p className="mb-2 text-xs text-error">{error}</p>}
              <div className="flex items-end gap-2">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  required
                  rows={2}
                  maxLength={4000}
                  placeholder={t("chat.replyPlaceholder")}
                  className="ds-textarea ds-textarea-bordered flex-1 resize-none text-sm"
                />
                <button disabled={sending || !reply.trim()} className="ds-btn ds-btn-primary h-12 w-12 p-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-4 rounded-lg bg-base-200 p-3 text-center text-xs text-base-content/65">
              {t("chat.closed")}
            </p>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title={t("tickets.details")}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-base-content/65">{t("tickets.status")}</span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-base-content/65">{t("tickets.priority")}</span>
                <span className="ds-badge ds-badge-outline ds-badge-sm">
                  {t(`priority.${ticket.priority}` as "priority.LOW")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-base-content/65">{t("tickets.category")}</span>
                <span>{ticket.category || "–"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-base-content/65">{t("tickets.assignedTo")}</span>
                <span>{ticket.technician?.fullName || "–"}</span>
              </div>
              {ticket.request && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-base-content/65">{t("common.reference")}</span>
                  <span className="font-mono text-xs">{ticket.request.reference}</span>
                </div>
              )}
            </div>
            <p className="mt-4 border-t border-base-200 pt-3 text-xs leading-relaxed text-base-content/70">
              {ticket.description}
            </p>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
