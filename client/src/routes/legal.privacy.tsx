import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "../components/LegalShell";
import { useI18n } from "../i18n/I18nContext";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  const { language } = useI18n();
  return (
    <LegalShell titleKey="legal.privacyTitle" introKey="legal.privacyIntro">
      {language === "de" ? <GermanPrivacy /> : <EnglishPrivacy />}
    </LegalShell>
  );
}

function EnglishPrivacy() {
  return (
    <>
      <h2>1. Data controller</h2>
      <p>
        IT Solutions., Hauptstraße 12, 10115 Berlin, Germany, is
        responsible for the processing described here. Managing director: Aylin
        Demir. Email: <a href="mailto:privacy@fia-it.de">privacy@fia-it.de</a>,
        phone: +49 30 5550 0100.
      </p>

      <h2>2. What we process and why</h2>
      <h3>Server logs</h3>
      <p>
        When you visit the website, our hosting provider processes the IP
        address, date and time, requested page, browser type and status code. We
        use this to operate the site securely and to investigate errors. Legal
        basis: Art. 6(1)(f) GDPR (legitimate interest in security). Logs are
        deleted after seven days unless a security incident requires longer
        storage.
      </p>
      <h3>Account data</h3>
      <p>
        If you create an account, we process your name, email address, password
        hash, phone number and optional company and address details. The
        password itself is never stored; we use Argon2 hashing. Legal basis:
        Art. 6(1)(b) GDPR (contract or pre-contractual measures).
      </p>
      <h3>Quote requests, contact forms and chat</h3>
      <p>
        We process the contact details and content you submit so we can answer
        your enquiry and prepare a quote. We store the time at which you
        accepted this privacy policy. Legal basis: Art. 6(1)(b) GDPR and, where
        a request is not yet contractual, Art. 6(1)(a) GDPR (consent).
      </p>
      <h3>Orders, invoices and projects</h3>
      <p>
        For orders and projects we process contact, delivery, invoice and
        payment data. Legal basis: Art. 6(1)(b) GDPR and Art. 6(1)(c) GDPR in
        connection with statutory retention duties (§ 147 AO, § 257 HGB).
        Invoices are generally retained for ten years.
      </p>
      <h3>Support tickets, service reports and uploaded files</h3>
      <p>
        Ticket content, internal notes, work reports and attachments are
        processed to provide support and document the service. Legal basis: Art.
        6(1)(b) GDPR.
      </p>
      <h3>Cookies and local storage</h3>
      <p>
        We set a session cookie for login and a CSRF cookie to protect forms.
        Both are technically necessary and do not require consent under § 25(2)
        TDDDG. Your language choice, cart and cookie preference are stored in
        your browser's local storage. We do not use analytics, advertising or
        social media tracking.
      </p>

      <h2>3. Recipients and processors</h2>
      <p>
        Data may be processed by hosting, email and IT support providers acting
        as processors under Art. 28 GDPR. We do not sell personal data. Where a
        provider processes data outside the EEA, we rely on an adequacy decision
        or the EU Standard Contractual Clauses.
      </p>

      <h2>4. Storage period</h2>
      <p>
        We keep data only as long as needed for the purpose or as required by
        law. Account data is deleted or anonymised when the account is closed.
        Invoices and related business records remain for the statutory retention
        period. Chat and ticket data are usually deleted three years after the
        last activity unless a contract or legal obligation requires longer
        storage.
      </p>

      <h2>5. Your rights</h2>
      <p>Under the GDPR you have the right to:</p>
      <ul>
        <li>access your personal data (Art. 15 GDPR),</li>
        <li>rectification of inaccurate data (Art. 16 GDPR),</li>
        <li>erasure (Art. 17 GDPR),</li>
        <li>restriction of processing (Art. 18 GDPR),</li>
        <li>data portability (Art. 20 GDPR),</li>
        <li>
          object to processing based on legitimate interests (Art. 21 GDPR),
        </li>
        <li>
          withdraw consent at any time with effect for the future (Art. 7(3)
          GDPR).
        </li>
      </ul>
      <p>
        In your customer portal you can download a copy of your data and delete
        your account. Alternatively, contact{" "}
        <a href="mailto:privacy@fia-it.de">privacy@fia-it.de</a>. You also have
        the right to complain to a supervisory authority. The authority
        responsible for us is the Berlin Commissioner for Data Protection and
        Freedom of Information, Alt-Moabit 59–61, 10555 Berlin,{" "}
        <a
          href="https://www.datenschutz-berlin.de"
          target="_blank"
          rel="noopener noreferrer"
        >
          datenschutz-berlin.de
        </a>
        .
      </p>

      <h2>6. Security</h2>
      <p>
        We protect data with TLS encryption, hashed passwords, HTTP-only session
        cookies, CSRF protection, role-based access control, rate limiting and
        regular backups. No system is completely secure, but we review these
        measures regularly.
      </p>

      <h2>7. Children and automated decisions</h2>
      <p>
        Our services are aimed at businesses and adults. We do not knowingly
        collect data from children under 16. We do not use automated
        decision-making or profiling that produces legal effects.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We update this policy when the processing or legal requirements change.
        The version published here applies. This demo text is a template and not
        legal advice; have it reviewed before production use.
      </p>

      <p>
        See also our <Link to="/legal/cookies">cookie policy</Link> and{" "}
        <Link to="/legal/terms">terms and conditions</Link>.
      </p>
    </>
  );
}

function GermanPrivacy() {
  return (
    <>
      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlich für die hier beschriebene Verarbeitung ist die IT Solutions., Hauptstraße 12, 10115 Berlin, Deutschland.
        Geschäftsführung: Aylin Demir. E-Mail:{" "}
        <a href="mailto:privacy@fia-it.de">privacy@fia-it.de</a>, Telefon: +49
        30 5550 0100.
      </p>

      <h2>2. Welche Daten wir verarbeiten und warum</h2>
      <h3>Server-Logfiles</h3>
      <p>
        Beim Besuch der Website verarbeitet unser Hosting-Anbieter IP-Adresse,
        Datum und Uhrzeit, aufgerufene Seite, Browsertyp und Statuscode. Dies
        dient dem sicheren Betrieb und der Fehleranalyse. Rechtsgrundlage: Art.
        6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Sicherheit). Logs
        werden nach sieben Tagen gelöscht, sofern ein Sicherheitsvorfall keine
        längere Speicherung erfordert.
      </p>
      <h3>Kontodaten</h3>
      <p>
        Bei der Kontoerstellung verarbeiten wir Name, E-Mail-Adresse,
        Passwort-Hash, Telefonnummer sowie optional Firma und Adresse. Das
        Passwort selbst wird nie gespeichert; wir verwenden Argon2.
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertrag oder
        vorvertragliche Maßnahmen).
      </p>
      <h3>Angebotsanfragen, Kontaktformular und Chat</h3>
      <p>
        Wir verarbeiten die von Ihnen übermittelten Kontaktdaten und Inhalte, um
        Ihre Anfrage zu beantworten und ein Angebot vorzubereiten. Der Zeitpunkt
        Ihrer Zustimmung zur Datenschutzerklärung wird gespeichert.
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO und, soweit noch kein
        Vertrag besteht, Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
      </p>
      <h3>Bestellungen, Rechnungen und Projekte</h3>
      <p>
        Für Bestellungen und Projekte verarbeiten wir Kontakt-, Liefer-,
        Rechnungs- und Zahlungsdaten. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
        DSGVO sowie Art. 6 Abs. 1 lit. c DSGVO in Verbindung mit gesetzlichen
        Aufbewahrungspflichten (§ 147 AO, § 257 HGB). Rechnungen werden in der
        Regel zehn Jahre aufbewahrt.
      </p>
      <h3>Support-Tickets, Serviceberichte und Uploads</h3>
      <p>
        Ticketinhalte, interne Notizen, Arbeitsberichte und Anhänge verarbeiten
        wir zur Supportleistung und Dokumentation. Rechtsgrundlage: Art. 6 Abs.
        1 lit. b DSGVO.
      </p>
      <h3>Cookies und lokale Speicherung</h3>
      <p>
        Wir setzen ein Sitzungscookie für die Anmeldung und ein CSRF-Cookie zum
        Schutz von Formularen. Beide sind technisch notwendig und gemäß § 25
        Abs. 2 TDDDG einwilligungsfrei. Sprache, Warenkorb und
        Cookie-Einstellung speichern wir im lokalen Speicher Ihres Browsers.
        Analyse-, Werbe- oder Social-Media-Tracking setzen wir nicht ein.
      </p>

      <h2>3. Empfänger und Auftragsverarbeiter</h2>
      <p>
        Daten können durch Hosting-, E-Mail- und IT-Support-Anbieter als
        Auftragsverarbeiter nach Art. 28 DSGVO verarbeitet werden. Wir verkaufen
        keine personenbezogenen Daten. Verarbeitet ein Anbieter Daten außerhalb
        des EWR, stützen wir uns auf einen Angemessenheitsbeschluss oder die
        EU-Standardvertragsklauseln.
      </p>

      <h2>4. Speicherdauer</h2>
      <p>
        Wir speichern Daten nur so lange, wie es für den Zweck erforderlich oder
        gesetzlich vorgeschrieben ist. Kontodaten werden bei Kontoschließung
        gelöscht oder anonymisiert. Rechnungen und zugehörige
        Geschäftsunterlagen bleiben für die gesetzliche Aufbewahrungsfrist
        erhalten. Chat- und Ticketdaten werden in der Regel drei Jahre nach der
        letzten Aktivität gelöscht, sofern keine vertragliche oder gesetzliche
        Pflicht eine längere Speicherung erfordert.
      </p>

      <h2>5. Ihre Rechte</h2>
      <p>Nach der DSGVO haben Sie das Recht auf:</p>
      <ul>
        <li>Auskunft über Ihre personenbezogenen Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li>Löschung (Art. 17 DSGVO),</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
        <li>
          Widerspruch gegen Verarbeitung auf Basis berechtigter Interessen (Art.
          21 DSGVO),
        </li>
        <li>
          Widerruf einer Einwilligung jederzeit mit Wirkung für die Zukunft
          (Art. 7 Abs. 3 DSGVO).
        </li>
      </ul>
      <p>
        Im Kundenportal können Sie eine Kopie Ihrer Daten herunterladen und Ihr
        Konto löschen. Alternativ erreichen Sie uns unter{" "}
        <a href="mailto:privacy@fia-it.de">privacy@fia-it.de</a>. Sie haben
        außerdem das Recht zur Beschwerde bei einer Aufsichtsbehörde. Zuständig
        ist die Berliner Beauftragte für Datenschutz und Informationsfreiheit,
        Alt-Moabit 59–61, 10555 Berlin,{" "}
        <a
          href="https://www.datenschutz-berlin.de"
          target="_blank"
          rel="noopener noreferrer"
        >
          datenschutz-berlin.de
        </a>
        .
      </p>

      <h2>6. Sicherheit</h2>
      <p>
        Wir schützen Daten mit TLS-Verschlüsselung, gehashten Passwörtern,
        HTTP-only- Sitzungscookies, CSRF-Schutz, rollenbasierter
        Zugriffskontrolle, Rate Limiting und regelmäßigen Backups. Kein System
        ist vollständig sicher; wir überprüfen diese Maßnahmen jedoch
        regelmäßig.
      </p>

      <h2>7. Kinder und automatisierte Entscheidungen</h2>
      <p>
        Unsere Leistungen richten sich an Unternehmen und Erwachsene. Wir
        erheben wissentlich keine Daten von Kindern unter 16 Jahren.
        Automatisierte Entscheidungen oder Profiling mit rechtlicher Wirkung
        setzen wir nicht ein.
      </p>

      <h2>8. Änderungen dieser Erklärung</h2>
      <p>
        Wir aktualisieren diese Erklärung, wenn sich die Verarbeitung oder die
        rechtlichen Anforderungen ändern. Es gilt die hier veröffentlichte
        Fassung. Dieser Demo-Text ist eine Vorlage und keine Rechtsberatung; vor
        dem Produktivbetrieb sollte er geprüft werden.
      </p>

      <p>
        Siehe auch unsere <Link to="/legal/cookies">Cookie-Richtlinie</Link> und
        die <Link to="/legal/terms">AGB</Link>.
      </p>
    </>
  );
}
