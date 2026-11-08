import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "../components/LegalShell";
import { useI18n } from "../i18n/I18nContext";

export const Route = createFileRoute("/legal/imprint")({
  component: ImprintPage,
});

function ImprintPage() {
  const { language } = useI18n();
  return (
    <LegalShell titleKey="legal.imprintTitle" introKey="legal.imprintIntro">
      {language === "de" ? <GermanImprint /> : <EnglishImprint />}
    </LegalShell>
  );
}

function EnglishImprint() {
  return (
    <>
      <h2>Provider</h2>
      <p>
        Orbit IT Solutions GmbH
        <br />
        Hauptstraße 12
        <br />
        10115 Berlin
        <br />
        Germany
      </p>

      <h2>Represented by</h2>
      <p>Managing Director: Aylin Demir</p>

      <h2>Contact</h2>
      <p>
        Phone: +49 30 5550 0100
        <br />
        Email: <a href="mailto:hello@fia-it.de">hello@fia-it.de</a>
        <br />
        Privacy: <a href="mailto:privacy@fia-it.de">privacy@fia-it.de</a>
      </p>

      <h2>Commercial register</h2>
      <p>
        Register court: Amtsgericht Berlin-Charlottenburg
        <br />
        Register number: HRB 000000 B (placeholder)
      </p>

      <h2>VAT identification number</h2>
      <p>DE000000000 (placeholder according to § 27a UStG)</p>

      <h2>Responsible for editorial content</h2>
      <p>Aylin Demir, address as above (§ 18(2) MStV)</p>

      <h2>Consumer dispute resolution</h2>
      <p>
        The European Commission provides a platform for online dispute
        resolution:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr/
        </a>
        . We are neither obliged nor generally willing to participate in dispute
        resolution proceedings before a consumer arbitration board. Please
        contact us first so we can solve the issue directly.
      </p>

      <h2>Liability for content</h2>
      <p>
        As a service provider we are responsible for our own content on these
        pages under general law. We are not obliged to monitor transmitted or
        stored third-party information or to investigate circumstances that
        indicate illegal activity. Obligations to remove or block the use of
        information under general law remain unaffected. Liability is only
        possible from the point in time at which we become aware of a concrete
        infringement.
      </p>

      <h2>Liability for links</h2>
      <p>
        Our website contains links to external websites. We have no influence
        over their content and accept no liability for it. The respective
        provider is responsible. Linked pages were checked for possible legal
        violations at the time of linking. If we become aware of an
        infringement, we will remove the link.
      </p>

      <h2>Copyright</h2>
      <p>
        Content and works created by the site operators are subject to German
        copyright law. Reproduction, editing, distribution and any kind of use
        outside the limits of copyright require written permission. Downloads
        and copies of this site are only permitted for private, non-commercial
        use.
      </p>

      <h2>Demo notice</h2>
      <p>
        This is a fictional graduation project. The company, register number,
        VAT ID, phone numbers and email addresses are placeholders and must be
        replaced with real data before going live.
      </p>
    </>
  );
}

function GermanImprint() {
  return (
    <>
      <h2>Anbieter</h2>
      <p>
        Orbit IT Solutions GmbH
        <br />
        Hauptstraße 12
        <br />
        10115 Berlin
        <br />
        Deutschland
      </p>

      <h2>Vertreten durch</h2>
      <p>Geschäftsführerin: Aylin Demir</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: +49 30 5550 0100
        <br />
        E-Mail: <a href="mailto:hello@fia-it.de">hello@fia-it.de</a>
        <br />
        Datenschutz: <a href="mailto:privacy@fia-it.de">privacy@fia-it.de</a>
      </p>

      <h2>Handelsregister</h2>
      <p>
        Registergericht: Amtsgericht Berlin-Charlottenburg
        <br />
        Registernummer: HRB 000000 B (Platzhalter)
      </p>

      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>DE000000000 (Platzhalter gemäß § 27a UStG)</p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>Aylin Demir, Anschrift wie oben (§ 18 Abs. 2 MStV)</p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr/
        </a>
        . Wir sind weder verpflichtet noch grundsätzlich bereit, an
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen. Bitte kontaktieren Sie uns zuerst, damit wir das Anliegen
        direkt lösen können.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß den allgemeinen Gesetzen für eigene
        Inhalte auf diesen Seiten verantwortlich. Wir sind nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder
        nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
        hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
        Informationen nach den allgemeinen Gesetzen bleiben davon unberührt.
        Eine Haftung ist erst ab dem Zeitpunkt der Kenntnis einer konkreten
        Rechtsverletzung möglich.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites. Auf deren Inhalte
        haben wir keinen Einfluss und übernehmen dafür keine Gewähr.
        Verantwortlich ist der jeweilige Anbieter. Die verlinkten Seiten wurden
        zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße geprüft. Bei
        Bekanntwerden einer Rechtsverletzung entfernen wir den Link.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke unterliegen
        dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung
        und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts
        bedürfen der schriftlichen Zustimmung. Downloads und Kopien dieser Seite
        sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
      </p>

      <h2>Demo-Hinweis</h2>
      <p>
        Dies ist ein fiktives Abschlussprojekt. Firma, Registernummer,
        USt-IdNr., Telefonnummern und E-Mail-Adressen sind Platzhalter und
        müssen vor dem Livegang durch echte Daten ersetzt werden.
      </p>
    </>
  );
}
