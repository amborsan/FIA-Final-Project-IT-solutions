import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "../components/LegalShell";
import { useI18n } from "../i18n/I18nContext";

export const Route = createFileRoute("/legal/cookies")({
  component: CookiesPage,
});

function CookiesPage() {
  const { language } = useI18n();
  return (
    <LegalShell titleKey="legal.cookiesTitle" introKey="legal.cookiesIntro">
      {language === "de" ? <GermanCookies /> : <EnglishCookies />}
    </LegalShell>
  );
}

function EnglishCookies() {
  return (
    <>
      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored in your browser. Local storage is a similar technology
        that keeps data in your browser without sending it with every request. We use both only for
        the purposes described below.
      </p>

      <h2>Essential cookies</h2>
      <p>
        These are required for the website to function and cannot be switched off. They are set on
        the basis of § 25(2) TDDDG (technically necessary) and Art. 6(1)(f) GDPR (secure operation).
      </p>
      <div className="overflow-x-auto">
        <table className="ds-table ds-table-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>orbit_session</code>
              </td>
              <td>Keeps you signed in. HTTP-only, not readable by JavaScript.</td>
              <td>7 days</td>
            </tr>
            <tr>
              <td>
                <code>orbit_csrf</code>
              </td>
              <td>Protects forms against cross-site request forgery.</td>
              <td>Until you close the browser</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Local storage</h2>
      <div className="overflow-x-auto">
        <table className="ds-table ds-table-sm">
          <thead>
            <tr>
              <th>Key</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>orbit_language</code>
              </td>
              <td>Remembers whether you prefer English or German.</td>
              <td>Until deleted</td>
            </tr>
            <tr>
              <td>
                <code>orbit_cart</code>
              </td>
              <td>Stores products in your shopping cart before checkout.</td>
              <td>Until deleted</td>
            </tr>
            <tr>
              <td>
                <code>orbit_cookie_consent</code>
              </td>
              <td>Remembers your cookie choice and its date.</td>
              <td>Until deleted</td>
            </tr>
            <tr>
              <td>
                <code>orbit_guest_chat</code>
              </td>
              <td>Keeps the token for a guest chat so you can read replies.</td>
              <td>Until deleted</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>No analytics or advertising</h2>
      <p>
        This demo does not use Google Analytics, advertising pixels, social media plugins or
        third-party tracking. No data is shared with advertising networks.
      </p>

      <h2>How to change your choice</h2>
      <p>
        You can reopen the privacy banner at any time using the "Cookie settings" link in the footer
        or the button below. You can also delete cookies and local storage in your browser settings.
        Blocking essential cookies may prevent login and checkout from working.
      </p>
      <p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("orbit:open-cookie-settings"))}
          className="ds-btn ds-btn-primary ds-btn-sm"
        >
          Open cookie settings
        </button>
      </p>

      <h2>More information</h2>
      <p>
        See our privacy policy for your rights and contact details. This demo text is a template and
        not legal advice.
      </p>
    </>
  );
}

function GermanCookies() {
  return (
    <>
      <h2>Was sind Cookies?</h2>
      <p>
        Cookies sind kleine Textdateien, die in Ihrem Browser gespeichert werden. Der lokale
        Speicher ist eine ähnliche Technologie, die Daten im Browser hält, ohne sie bei jeder
        Anfrage mitzusenden. Wir nutzen beides nur für die unten beschriebenen Zwecke.
      </p>

      <h2>Notwendige Cookies</h2>
      <p>
        Diese sind für die Funktion der Website erforderlich und können nicht deaktiviert werden.
        Sie werden auf Grundlage von § 25 Abs. 2 TDDDG (technisch notwendig) und Art. 6 Abs. 1 lit. f
        DSGVO (sicherer Betrieb) gesetzt.
      </p>
      <div className="overflow-x-auto">
        <table className="ds-table ds-table-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Zweck</th>
              <th>Dauer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>orbit_session</code>
              </td>
              <td>Hält Sie angemeldet. HTTP-only, für JavaScript nicht lesbar.</td>
              <td>7 Tage</td>
            </tr>
            <tr>
              <td>
                <code>orbit_csrf</code>
              </td>
              <td>Schützt Formulare vor Cross-Site-Request-Forgery.</td>
              <td>Bis zum Schließen des Browsers</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Lokaler Speicher</h2>
      <div className="overflow-x-auto">
        <table className="ds-table ds-table-sm">
          <thead>
            <tr>
              <th>Schlüssel</th>
              <th>Zweck</th>
              <th>Dauer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>orbit_language</code>
              </td>
              <td>Merkt sich, ob Sie Deutsch oder Englisch bevorzugen.</td>
              <td>Bis zur Löschung</td>
            </tr>
            <tr>
              <td>
                <code>orbit_cart</code>
              </td>
              <td>Speichert Produkte im Warenkorb vor der Bestellung.</td>
              <td>Bis zur Löschung</td>
            </tr>
            <tr>
              <td>
                <code>orbit_cookie_consent</code>
              </td>
              <td>Speichert Ihre Cookie-Auswahl und das Datum.</td>
              <td>Bis zur Löschung</td>
            </tr>
            <tr>
              <td>
                <code>orbit_guest_chat</code>
              </td>
              <td>Speichert das Token für einen Gast-Chat, damit Sie Antworten lesen können.</td>
              <td>Bis zur Löschung</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Keine Analyse- oder Werbe-Cookies</h2>
      <p>
        Diese Demo verwendet kein Google Analytics, keine Werbe-Pixel, keine Social-Media-Plugins
        und kein Tracking durch Dritte. Es werden keine Daten an Werbenetzwerke weitergegeben.
      </p>

      <h2>So ändern Sie Ihre Auswahl</h2>
      <p>
        Sie können das Datenschutzbanner jederzeit über den Link „Cookie-Einstellungen" im Footer
        oder über die Schaltfläche unten erneut öffnen. Außerdem können Sie Cookies und lokalen
        Speicher in Ihren Browsereinstellungen löschen. Das Blockieren notwendiger Cookies kann
        Anmeldung und Bestellung verhindern.
      </p>
      <p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("orbit:open-cookie-settings"))}
          className="ds-btn ds-btn-primary ds-btn-sm"
        >
          Cookie-Einstellungen öffnen
        </button>
      </p>

      <h2>Weitere Informationen</h2>
      <p>
        Ihre Rechte und Kontaktdaten finden Sie in der Datenschutzerklärung. Dieser Demo-Text ist
        eine Vorlage und keine Rechtsberatung.
      </p>
    </>
  );
}
