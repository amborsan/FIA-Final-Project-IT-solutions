import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Package, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { api, errorMessage } from "../lib/api";
import type { Order } from "../lib/types";
import { EmptyState } from "../components/ui";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

export default function CartPage() {
  const { items, subtotal, count, setQuantity, remove, clear } = useCart();
  const { user } = useAuth();
  const { t, pick, formatMoney } = useI18n();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address ?? "");
  const [notes, setNotes] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<Order | null>(null);

  const vat = Math.round(subtotal * 0.19 * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;

  async function placeOrder(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ order: Order }>("/orders", {
        method: "POST",
        body: {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: address,
          notes,
          acceptTerms,
        },
      });
      setCompleted(data.order);
      clear();
    } catch (caught) {
      setError(errorMessage(caught, t("cart.error")));
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-lg rounded-box border border-base-300 bg-base-100 p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h1 className="mt-4 text-2xl font-bold">{t("cart.successTitle")}</h1>
          <p className="mt-2 text-sm text-base-content/70">{t("cart.successText")}</p>
          <p className="mt-4 rounded-lg bg-base-200 px-3 py-2 font-mono text-sm">
            {completed.reference}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/portal/orders" className="ds-btn ds-btn-primary">
              {t("cart.viewOrders")}
            </Link>
            <Link to="/products" className="ds-btn ds-btn-ghost">
              {t("cart.continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-14">
        <h1 className="text-3xl font-black">{t("cart.title")}</h1>
        <div className="mt-8">
          <EmptyState
            title={t("cart.empty")}
            text={t("cart.emptyText")}
            action={
              <Link to="/products" className="ds-btn ds-btn-primary">
                {t("cart.continueShopping")}
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-base-content/65 hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> {t("cart.continueShopping")}
      </Link>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black">{t("cart.title")}</h1>
          <p className="mt-1 text-sm text-base-content/65">{t("cart.items", { count })}</p>
        </div>
        <button onClick={clear} className="ds-btn ds-btn-ghost ds-btn-sm text-error">
          <Trash2 className="h-4 w-4" /> {t("cart.clear")}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-wrap items-center gap-4 rounded-box border border-base-300 bg-base-100 p-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-base-200 text-2xl">
                <Package className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to="/products/$slug"
                  params={{ slug: item.slug }}
                  className="line-clamp-1 text-sm font-bold hover:text-primary"
                >
                  {pick(item.nameEn, item.nameDe)}
                </Link>
                <p className="mt-1 text-xs text-base-content/65">{formatMoney(item.price)}</p>
              </div>
              <div className="ds-join">
                <button
                  className="ds-btn ds-btn-xs ds-join-item"
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                >
                  −
                </button>
                <span className="ds-btn ds-btn-xs ds-join-item pointer-events-none w-10">{item.quantity}</span>
                <button
                  className="ds-btn ds-btn-xs ds-join-item"
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <p className="w-20 text-right text-sm font-bold">
                {formatMoney(item.price * item.quantity)}
              </p>
              <button
                onClick={() => remove(item.productId)}
                className="ds-btn ds-btn-ghost ds-btn-xs text-error"
                aria-label={t("cart.remove")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-box border border-base-300 bg-base-100 p-5">
            <h2 className="text-base font-bold">{t("cart.summary")}</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/65">{t("common.subtotal")}</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/65">{t("common.tax")} (19 %)</span>
                <span>{formatMoney(vat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/65">{t("cart.shipping")}</span>
                <span className="text-success">{t("cart.shippingFree")}</span>
              </div>
              <div className="flex justify-between border-t border-base-200 pt-2 text-base font-bold">
                <span>{t("common.total")}</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </div>

          {user ? (
            <form aria-busy={loading} onSubmit={placeOrder} className="rounded-box border border-base-300 bg-base-100 p-5">
              <h2 className="text-base font-bold">{t("cart.checkoutTitle")}</h2>
              <p className="mt-1 text-xs text-base-content/65">{t("cart.checkoutText")}</p>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-semibold">{t("cart.shippingAddress")}</span>
                <textarea
                  required
                  minLength={10}
                  rows={3}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="ds-textarea ds-textarea-bordered w-full text-sm"
                />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold">
                  {t("common.notes")} ({t("common.optional")})
                </span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="ds-textarea ds-textarea-bordered w-full text-sm"
                  maxLength={1000}
                />
              </label>
              {error && <p className="mt-3 text-xs text-error">{error}</p>}
              <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-base-content/70">
                <input
                  type="checkbox"
                  className="ds-checkbox ds-checkbox-xs mt-0.5"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  required
                />
                <span>
                  {pick(
                    "I accept the Terms and Conditions and have read the Privacy Policy.",
                    "Ich akzeptiere die AGB und habe die Datenschutzerklärung gelesen.",
                  )}{" "}
                  <Link to="/legal/terms" className="ds-link ds-link-primary">
                    {t("footer.terms")}
                  </Link>{" "}
                  ·{" "}
                  <Link to="/legal/privacy" className="ds-link ds-link-primary">
                    {t("footer.privacy")}
                  </Link>
                </span>
              </label>
              <button disabled={loading || !acceptTerms} className="ds-btn ds-btn-primary mt-4 w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                {t("cart.placeOrder")}
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-base-content/70">
                {pick(
                  "The invoice is due within 14 days.",
                  "Die Rechnung ist innerhalb von 14 Tagen fällig.",
                )}
              </p>
            </form>
          ) : (
            <div className="rounded-box border border-base-300 bg-base-100 p-5">
              <h2 className="text-base font-bold">{t("cart.loginToOrder")}</h2>
              <p className="mt-1 text-xs text-base-content/65">{t("cart.loginText")}</p>
              <button
                onClick={() => void navigate({ to: "/login" })}
                className="ds-btn ds-btn-primary mt-4 w-full"
              >
                {t("nav.login")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
