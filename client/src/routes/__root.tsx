import { Link, Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { FormFeedbackProvider } from "../components/FormFeedback";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChatWidget } from "../components/ChatWidget";
import { CookieConsent } from "../components/CookieConsent";
import { useI18n } from "../i18n/I18nContext";

function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-black text-primary/20">404</p>
        <h1 className="mt-2 text-2xl font-bold">{t("notFound.title")}</h1>
        <p className="mt-2 max-w-md text-base-content/70">{t("notFound.text")}</p>
        <Link to="/" className="ds-btn ds-btn-primary mt-6">
          {t("notFound.back")}
        </Link>
      </div>
    </div>
  );
}

function RootLayout() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPrintPage = pathname.startsWith("/print/");

  return (
    <div className="flex min-h-screen flex-col">
      {!isPrintPage && <a className="skip-link" href="#main-content">{t("nav.skip")}</a>}
      {!isPrintPage && <Header />}
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
        <FormFeedbackProvider><Outlet /></FormFeedbackProvider>
      </main>
      {!isPrintPage && <Footer />}
      {!isPrintPage && <ChatWidget />}
      {!isPrintPage && <CookieConsent />}
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools />
        </>
      )}
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
