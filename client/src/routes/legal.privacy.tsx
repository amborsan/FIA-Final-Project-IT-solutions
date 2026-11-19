import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "../components/LegalShell";
import { useI18n } from "../i18n/I18nContext";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
});

const privacyEmail = "privacy@fia-it.de";
const cookieLaw = "https://www.gesetze-im-internet.de/ttdsg/__25.html";
const retentionLaw = "https://www.gesetze-im-internet.de/ao_1977/__147.html";
const complaintPage = "https://www.datenschutz-berlin.de/buergerinnen-und-buerger/rechte/beschwerderecht/";

function PrivacyPage() {
  const { language, pick } = useI18n();
  return (
    <LegalShell
      titleKey="legal.privacyTitle"
      introKey="legal.privacyIntro"
      lastUpdated={pick("19 November 2026", "19. November 2026")}
    >
      {language === "de" ? <GermanPrivacy /> : <EnglishPrivacy />}
    </LegalShell>
  );
}

function EnglishPrivacy() {
  return (
    <>
      <h2>1. Controller and scope</h2>
      <p>
        This notice is for the IT Solutions. graduation demo. The{" "}
        <Link to="/legal/imprint">legal notice</Link> contains the sample operator details.
        The demo contact is <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>.
        Please use fictitious information and sample files when testing the site.
        A live deployment must identify its actual controller and, where applicable,
        provide the data protection officer’s contact details.
      </p>
      <p>
        This notice follows the information requirements in{" "}
        <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679">Art. 13 GDPR</a>.
      </p>

      <h2>2. What we process and why</h2>
      <h3>Website access and security</h3>
      <p>
        The server receives technical request data such as your IP address. It uses
        request data to deliver the site, limit abuse and diagnose errors. Sessions
        can also record your IP address and browser user agent. Our legitimate interest
        is the secure and reliable operation of the site (Art. 6(1)(f) GDPR).
      </p>
      <h3>Accounts, orders and service delivery</h3>
      <p>
        We use your name, email address, password hash and any optional profile
        information to provide your account. Delivery and invoicing use the contact
        and address details you supply at checkout. Support tickets and service
        reports can contain messages, work notes and files. Processing requested
        services and preparing or carrying out a contract relies on Art. 6(1)(b) GDPR.
        We process records required by tax and accounting law under Art. 6(1)(c) GDPR.
        The demo records invoice status without taking online payment.
      </p>
      <h3>Enquiries and chat</h3>
      <p>
        We use the contact details and messages you submit to respond to your enquiry,
        provide support or prepare a quote. If you ask us to take steps towards a
        contract, Art. 6(1)(b) GDPR applies. For general enquiries, our legitimate
        interest in responding is the basis under Art. 6(1)(f) GDPR. Where a form
        asks for acknowledgement of this notice, the app can record the acknowledgement.
      </p>
      <p>
        Required fields are marked in the relevant forms. Without the necessary
        information we may be unable to create an account, respond to a request or
        process an order. The demo does not make decisions within the meaning of
        Art. 22 GDPR solely by automated means.
      </p>

      <h2>3. Cookies and browser storage</h2>
      <p>
        A session cookie keeps you signed in. A CSRF cookie protects forms and
        other actions that change data. Browser storage remembers preferences,
        the local cart, the cookie acknowledgement and access to a guest chat.
        <a href={cookieLaw}> § 25 TDDDG</a> governs access to your device.
        Its exception applies where storage or access is strictly necessary for
        a service you have explicitly requested. See the{" "}
        <Link to="/legal/cookies">cookie policy</Link> for the storage entries and
        how to clear them. This demo uses no analytics or advertising trackers.
      </p>

      <h2>4. Recipients and storage periods</h2>
      <p>
        Access is limited to authorised project staff according to their roles.
        Before public deployment, the operator must identify the actual hosting
        and other recipients and disclose any transfers outside the EEA and
        their safeguards.
      </p>
      <p>
        Login sessions expire after seven days. Other records are kept according
        to the purpose of processing, legal duties and any need to establish or
        defend a claim. For example, accounting vouchers generally have an
        eight-year retention period under <a href={retentionLaw}>§ 147 AO</a>.
        Account deletion anonymises the profile and ends its sessions. Order and
        invoice records can remain where retention applies. Retention and deletion
        schedules for a production installation must be confirmed by its operator.
      </p>

      <h2>5. Your rights</h2>
      <p>
        Subject to the applicable conditions, you can ask for access, correction,
        erasure, restriction and portability (Arts. 15–18 and 20 GDPR). You can
        object to processing based on legitimate interests on grounds relating to
        your particular situation (Art. 21 GDPR). Where processing relies on
        consent, you can withdraw it at any time with effect for the future
        (Art. 7(3) GDPR).
      </p>
      <p>
        Use the account controls to correct profile details, export account data
        or request deletion where available. For other requests, contact the
        controller. You can also complain to a supervisory authority (Art. 77 GDPR).
        The Berlin authority explains the{" "}
        <a href={complaintPage}>right to lodge a complaint</a>.
      </p>
    </>
  );
}

function GermanPrivacy() {
  return (
    <>
      <h2>1. Verantwortlicher und Geltungsbereich</h2>
      <p>
        Diese Erklärung gilt für die Demo des Abschlussprojekts IT Solutions.
        Die beispielhaften Anbieterangaben stehen im{" "}
        <Link to="/legal/imprint">Impressum</Link>. Die Demo-Kontaktadresse lautet{" "}
        <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. Verwenden Sie beim
        Testen bitte fiktive Angaben und Beispieldateien. Für den öffentlichen
        Betrieb muss der tatsächliche Verantwortliche benannt werden. Soweit
        erforderlich, sind auch die Kontaktdaten des Datenschutzbeauftragten anzugeben.
      </p>
      <p>
        Diese Erklärung orientiert sich an den Informationspflichten nach{" "}
        <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679">Art. 13 DSGVO</a>.
      </p>

      <h2>2. Welche Daten wir wofür verarbeiten</h2>
      <h3>Websitezugriff und Sicherheit</h3>
      <p>
        Der Server erhält technische Anfragedaten wie Ihre IP-Adresse. Er
        verwendet sie, um die Website auszuliefern, Missbrauch zu begrenzen und
        Fehler zu untersuchen. Zu Anmeldesitzungen können IP-Adresse und
        Browserkennung gespeichert werden. Unser berechtigtes Interesse ist der
        sichere und zuverlässige Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <h3>Konten, Bestellungen und Leistungen</h3>
      <p>
        Wir verwenden Name, E-Mail-Adresse, Passwort-Hash und freiwillige
        Profilangaben zur Bereitstellung des Kontos. Für Lieferung und
        Rechnungsstellung verwenden wir die bei der Bestellung angegebenen Kontakt-
        und Adressdaten. Support-Tickets und Serviceberichte können Nachrichten,
        Arbeitsnotizen und Dateien enthalten. Für angeforderte Leistungen sowie
        Vertragsanbahnung und -erfüllung gilt Art. 6 Abs. 1 lit. b DSGVO.
        Steuer- und buchführungsrechtlich erforderliche Daten verarbeiten wir nach
        Art. 6 Abs. 1 lit. c DSGVO. Die Demo erfasst den Rechnungsstatus und nimmt
        keine Online-Zahlungen entgegen.
      </p>
      <h3>Anfragen und Chat</h3>
      <p>
        Die übermittelten Kontaktdaten und Nachrichten verwenden wir, um Anfragen
        zu beantworten, Support zu leisten oder Angebote vorzubereiten. Bei
        vorvertraglichen Maßnahmen auf Ihre Anfrage gilt Art. 6 Abs. 1 lit. b
        DSGVO. Bei allgemeinen Anfragen stützen wir uns auf unser berechtigtes
        Interesse an deren Beantwortung nach Art. 6 Abs. 1 lit. f DSGVO. Wo ein
        Formular die Kenntnisnahme dieser Erklärung abfragt, kann die Anwendung
        diese Bestätigung speichern.
      </p>
      <p>
        Pflichtangaben sind in den Formularen gekennzeichnet. Ohne die
        erforderlichen Daten können wir möglicherweise kein Konto anlegen, keine
        Anfrage beantworten oder keine Bestellung bearbeiten. Es finden keine
        ausschließlich automatisierten Entscheidungen im Sinne von Art. 22 DSGVO statt.
      </p>

      <h2>3. Cookies und Browserspeicher</h2>
      <p>
        Ein Sitzungscookie hält die Anmeldung aufrecht. Ein CSRF-Cookie schützt
        Formulare und andere Aktionen, die Daten ändern. Der Browserspeicher merkt
        sich Einstellungen, den lokalen Warenkorb, die Cookie-Bestätigung und
        den Zugang zu einem Gastchat. Für Speicherungen und Zugriffe auf Ihrem
        Gerät gilt <a href={cookieLaw}>§ 25 TDDDG</a>. Die Ausnahme greift, wenn
        der Vorgang für einen ausdrücklich gewünschten Dienst unbedingt erforderlich
        ist. Die <Link to="/legal/cookies">Cookie-Richtlinie</Link> erläutert
        die Einträge und wie Sie sie löschen können. In der Demo gibt es keine
        Analyse- oder Werbetracker.
      </p>

      <h2>4. Empfänger und Speicherdauer</h2>
      <p>
        Zugriff erhalten berechtigte Projektmitarbeitende entsprechend ihrer
        Rolle. Vor dem öffentlichen Betrieb muss der Betreiber das tatsächliche
        Hosting und weitere Empfänger benennen sowie über etwaige Übermittlungen
        außerhalb des EWR und die eingesetzten Garantien informieren.
      </p>
      <p>
        Anmeldesitzungen laufen nach sieben Tagen ab. Die Speicherdauer weiterer
        Daten richtet sich nach dem Verarbeitungszweck, gesetzlichen Pflichten
        und der erforderlichen Geltendmachung oder Abwehr von Ansprüchen.
        Buchungsbelege sind beispielsweise nach <a href={retentionLaw}>§ 147 AO</a>{" "}
        grundsätzlich acht Jahre aufzubewahren. Bei der Kontolöschung werden
        Profildaten anonymisiert und Sitzungen beendet. Bestell- und Rechnungsdaten
        können bei bestehender Aufbewahrungspflicht erhalten bleiben. Die Speicher-
        und Löschfristen für den Produktivbetrieb sind vom Betreiber festzulegen.
      </p>

      <h2>5. Ihre Rechte</h2>
      <p>
        Unter den gesetzlichen Voraussetzungen haben Sie Rechte auf Auskunft,
        Berichtigung, Löschung, Einschränkung und Datenübertragbarkeit (Art. 15–18
        und 20 DSGVO). Einer Verarbeitung auf Grundlage berechtigter Interessen
        können Sie aus Gründen widersprechen, die sich aus Ihrer besonderen
        Situation ergeben (Art. 21 DSGVO). Soweit eine Verarbeitung auf
        Einwilligung beruht, können Sie diese jederzeit mit Wirkung für die Zukunft
        widerrufen (Art. 7 Abs. 3 DSGVO).
      </p>
      <p>
        In den Kontoeinstellungen können Sie Profilangaben berichtigen und Ihre
        Daten exportieren oder, soweit verfügbar, die Löschung beantragen. Für
        weitere Anliegen wenden Sie sich an den Verantwortlichen. Sie können
        sich auch bei einer Aufsichtsbehörde beschweren (Art. 77 DSGVO). Die
        Berliner Aufsichtsbehörde erläutert das{" "}
        <a href={complaintPage}>Beschwerderecht</a>.
      </p>
    </>
  );
}
