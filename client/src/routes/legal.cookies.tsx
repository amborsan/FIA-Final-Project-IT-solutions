import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
        <Table className={cn(" text-xs [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2")}>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <code>orbit_session</code>
              </TableCell>
              <TableCell>Keeps you signed in. HTTP-only, not readable by JavaScript.</TableCell>
              <TableCell>7 days</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>orbit_csrf</code>
              </TableCell>
              <TableCell>Protects forms against cross-site request forgery.</TableCell>
              <TableCell>Until you close the browser</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <h2>Local storage</h2>
      <div className="overflow-x-auto">
        <Table className={cn(" text-xs [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2")}>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <code>orbit_language</code>
              </TableCell>
              <TableCell>Remembers whether you prefer English or German.</TableCell>
              <TableCell>Until deleted</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>orbit_cart</code>
              </TableCell>
              <TableCell>Stores products in your shopping cart before checkout.</TableCell>
              <TableCell>Until deleted</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>orbit_cookie_consent</code>
              </TableCell>
              <TableCell>Remembers your cookie choice and its date.</TableCell>
              <TableCell>Until deleted</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>orbit_guest_chat</code>
              </TableCell>
              <TableCell>Keeps the token for a guest chat so you can read replies.</TableCell>
              <TableCell>Until deleted</TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
        <Button
          type="button"
          onClick={() => window.dispatchEvent(new Event("orbit:open-cookie-settings"))}
          className={cn(" bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm")}
        >
          Open cookie settings
        </Button>
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
        <Table className={cn(" text-xs [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2")}>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Zweck</TableHead>
              <TableHead>Dauer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <code>orbit_session</code>
              </TableCell>
              <TableCell>Hält Sie angemeldet. HTTP-only, für JavaScript nicht lesbar.</TableCell>
              <TableCell>7 Tage</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>orbit_csrf</code>
              </TableCell>
              <TableCell>Schützt Formulare vor Cross-Site-Request-Forgery.</TableCell>
              <TableCell>Bis zum Schließen des Browsers</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <h2>Lokaler Speicher</h2>
      <div className="overflow-x-auto">
        <Table className={cn(" text-xs [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2")}>
          <TableHeader>
            <TableRow>
              <TableHead>Schlüssel</TableHead>
              <TableHead>Zweck</TableHead>
              <TableHead>Dauer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <code>orbit_language</code>
              </TableCell>
              <TableCell>Merkt sich, ob Sie Deutsch oder Englisch bevorzugen.</TableCell>
              <TableCell>Bis zur Löschung</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>orbit_cart</code>
              </TableCell>
              <TableCell>Speichert Produkte im Warenkorb vor der Bestellung.</TableCell>
              <TableCell>Bis zur Löschung</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>orbit_cookie_consent</code>
              </TableCell>
              <TableCell>Speichert Ihre Cookie-Auswahl und das Datum.</TableCell>
              <TableCell>Bis zur Löschung</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>orbit_guest_chat</code>
              </TableCell>
              <TableCell>Speichert das Token für einen Gast-Chat, damit Sie Antworten lesen können.</TableCell>
              <TableCell>Bis zur Löschung</TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
        <Button
          type="button"
          onClick={() => window.dispatchEvent(new Event("orbit:open-cookie-settings"))}
          className={cn(" bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm")}
        >
          Cookie-Einstellungen öffnen
        </Button>
      </p>

      <h2>Weitere Informationen</h2>
      <p>
        Ihre Rechte und Kontaktdaten finden Sie in der Datenschutzerklärung. Dieser Demo-Text ist
        eine Vorlage und keine Rechtsberatung.
      </p>
    </>
  );
}
