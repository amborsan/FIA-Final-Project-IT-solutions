import { SubmitButton, useFormFeedback } from "../components/FormFeedback";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useI18n } from "../i18n/I18nContext";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

export default function ContactPage() {
  const { t, pick } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    acceptPrivacy: false,
  });
  const notify = useFormFeedback();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setSuccess(false);
    setLoading(true);
    setError("");
    try {
      await api("/contact", { method: "POST", body: form });
      setSuccess(true);
      notify("success", t("contact.success"));
      setForm({ name: "", email: "", phone: "", subject: "", message: "", acceptPrivacy: false });
    } catch (caught) {
      const message = errorMessage(caught, t("contact.error"));
      setError(message);
      notify("error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">{t("contact.eyebrow")}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("contact.title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65">{t("contact.text")}</p>
        </div>
      </section>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="rounded-box border border-base-300 bg-base-100 p-6">
          <h2 className="text-lg font-bold">{t("contact.formTitle")}</h2>

          {success && (
            <div role="status" className="ds-alert ds-alert-success mt-4 text-sm">
              <CheckCircle2 className="h-5 w-5" /> {t("contact.success")}
            </div>
          )}

          <form aria-busy={loading} onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.name")} <span className="text-error">*</span>
              </span>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.email")} <span className="text-error">*</span>
              </span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.phone")} ({t("common.optional")})
              </span>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.subject")} <span className="text-error">*</span>
              </span>
              <input
                required
                minLength={3}
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                className="ds-input ds-input-bordered w-full"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold">
                {t("common.message")} <span className="text-error">*</span>
              </span>
              <textarea
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                className="ds-textarea ds-textarea-bordered w-full"
              />
            </label>

            <label className="flex items-start gap-2.5 rounded-lg bg-base-200 p-3 text-xs leading-relaxed text-base-content/65 sm:col-span-2">
              <input
                type="checkbox"
                required
                checked={form.acceptPrivacy}
                onChange={(event) => setForm({ ...form, acceptPrivacy: event.target.checked })}
                className="ds-checkbox ds-checkbox-sm mt-0.5"
              />
              <span>
                {t("contact.privacyNote")}{" "}
                <Link to="/legal/privacy" className="ds-link ds-link-primary">
                  {t("footer.privacy")}
                </Link>
              </span>
            </label>

            {error && <div role="alert" className="ds-alert ds-alert-error py-2 text-sm sm:col-span-2">{error}</div>}

            <div className="sm:col-span-2">
              <SubmitButton state={loading ? "loading" : error ? "error" : success ? "success" : "idle"}>{t("common.send")}</SubmitButton>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-box border border-base-300 bg-base-100 p-6">
            <h2 className="text-base font-bold">Orbit IT Solutions GmbH</h2>
            <div className="mt-4 space-y-4 text-sm">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Hauptstraße 12<br />10115 Berlin, Germany</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+493055500100" className="hover:text-primary">+49 30 5550 0100</a>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:hello@orbit-it.de" className="hover:text-primary">hello@orbit-it.de</a>
              </p>
              <p className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong className="block text-xs">{t("contact.hours")}</strong>
                  {t("contact.hoursValue")}
                </span>
              </p>
            </div>
            <div className="mt-5 rounded-lg bg-base-200 p-3 text-[11px] leading-relaxed text-base-content/65">
              {pick(
                "Demo company details. For the real Impressum, replace these with the registered company data.",
                "Demo-Firmendaten. Für das echte Impressum durch die registrierten Unternehmensdaten ersetzen.",
              )}
            </div>
          </div>

          <div className="rounded-box border border-base-300 bg-secondary/5 p-6">
            <MessageCircle className="h-6 w-6 text-secondary" />
            <h3 className="mt-2 text-base font-bold">{t("contact.chatTitle")}</h3>
            <p className="mt-1 text-sm text-base-content/70">{t("contact.chatText")}</p>
            <p className="mt-3 text-xs text-base-content/70">{t("chat.online")}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
