import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "../components/LegalShell";
import { useI18n } from "../i18n/I18nContext";

export const Route = createFileRoute("/legal/terms")({
  component: TermsPage,
});

function TermsPage() {
  const { language } = useI18n();
  return (
    <LegalShell titleKey="legal.termsTitle" introKey="legal.termsIntro">
      {language === "de" ? <GermanTerms /> : <EnglishTerms />}
    </LegalShell>
  );
}

function EnglishTerms() {
  return (
    <>
      <h2>1. Scope</h2>
      <p>
        These Terms and Conditions apply to all contracts between IT Solutions.
        ("IT Solutions.", "we") and our customers ("you") for IT services, hardware and software. They apply
        to both consumers and businesses. Deviating terms of the customer only apply if we confirm
        them in writing.
      </p>

      <h2>2. Quotes and contract formation</h2>
      <p>
        A request submitted through the website is not a binding order. We review the request and
        may ask follow-up questions. A quote is valid for the period stated in the quote, usually
        14 days. The contract is formed when you accept the quote in the customer portal or confirm
        it in writing and we confirm the order. Product orders placed in the shop are confirmed by
        our order confirmation or by delivery.
      </p>

      <h2>3. Services and cooperation</h2>
      <p>
        We provide IT services with the care of a qualified professional. The specific scope results
        from the quote and the service description. You provide timely access to premises, systems,
        information and contact persons. Additional work caused by missing or incorrect information
        may be charged separately after prior notice.
      </p>

      <h2>4. Prices, VAT and payment</h2>
      <p>
        All prices are in euros and include statutory VAT unless stated otherwise. Quotes and orders
        list the applicable VAT rate. Invoices are due within 14 days of the invoice date without
        deduction unless otherwise agreed. For projects we may agree on partial payments or
        advance payments. If payment is late, statutory provisions apply.
      </p>

      <h2>5. Delivery and performance dates</h2>
      <p>
        Delivery and performance dates are non-binding unless expressly agreed as binding. We will
        inform you promptly about delays. Force majeure, supply shortages and other circumstances
        outside our control may extend deadlines.
      </p>

      <h2>6. Right of withdrawal for consumers</h2>
      <p>
        Consumers generally have a statutory right of withdrawal for distance contracts. Details,
        exceptions and the model withdrawal form are available in our{" "}
        <Link to="/legal/withdrawal">withdrawal information</Link>. The right may expire for
        digital content or services that were started with your express consent.
      </p>

      <h2>7. Warranty and liability</h2>
      <p>
        Statutory warranty rights apply. We are liable without limitation for intent, gross
        negligence, injury to life, body or health, and under the Product Liability Act. For slight
        negligence we are liable only for breach of essential contractual duties and limited to the
        foreseeable damage typical for the contract. We are not liable for data loss to the extent
        that you could have prevented it through reasonable backup measures. You should always keep
        your own backups.
      </p>

      <h2>8. Data protection</h2>
      <p>
        We process personal data as described in our{" "}
        <Link to="/legal/privacy">privacy policy</Link>. Where we process data on your behalf, we
        conclude a data processing agreement if required by law.
      </p>

      <h2>9. Software and third-party services</h2>
      <p>
        Software, cloud services and hardware from third parties are subject to the respective
        manufacturer's or provider's terms. We do not guarantee third-party services and are not
        responsible for their availability, changes or pricing.
      </p>

      <h2>10. Dispute resolution and governing law</h2>
      <p>
        We are neither obliged nor generally willing to participate in dispute resolution
        proceedings before a consumer arbitration board. The European online dispute resolution
        platform is{" "}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>
        . German law applies, excluding the UN Convention on Contracts for the International Sale of
        Goods. Mandatory consumer protection rules of your country of residence remain unaffected.
      </p>

      <h2>11. Changes and severability</h2>
      <p>
        We may update these terms for future contracts. If a provision is invalid, the remaining
        provisions remain effective. The invalid provision is replaced by the legally permissible
        rule that comes closest to its purpose.
      </p>

      <h2>12. Demo notice</h2>
      <p>
        This is a fictional graduation project. These terms are a template, not legal advice, and
        must be reviewed and adapted before real use.
      </p>
    </>
  );
}

function GermanTerms() {
  return (
    <>
      <h2>1. Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der IT Solutions. („IT Solutions.", „wir") und unseren Kundinnen und Kunden („Sie") über
        IT-Dienstleistungen, Hardware und Software. Sie gelten sowohl für Verbraucher als auch für
        Unternehmer. Abweichende Bedingungen des Kunden gelten nur, wenn wir sie schriftlich
        bestätigen.
      </p>

      <h2>2. Angebote und Vertragsschluss</h2>
      <p>
        Eine über die Website eingereichte Anfrage ist keine verbindliche Bestellung. Wir prüfen die
        Anfrage und können Rückfragen stellen. Ein Angebot ist für den darin genannten Zeitraum,
        in der Regel 14 Tage, gültig. Der Vertrag kommt zustande, wenn Sie das Angebot im
        Kundenportal annehmen oder schriftlich bestätigen und wir die Bestellung bestätigen.
        Produktbestellungen im Shop werden durch unsere Auftragsbestätigung oder die Lieferung
        verbindlich.
      </p>

      <h2>3. Leistungen und Mitwirkung</h2>
      <p>
        Wir erbringen IT-Leistungen mit der Sorgfalt eines fachkundigen Dienstleisters. Der konkrete
        Umfang ergibt sich aus dem Angebot und der Leistungsbeschreibung. Sie sorgen für rechtzeitigen
        Zugang zu Räumen, Systemen, Informationen und Ansprechpartnern. Mehraufwand durch fehlende
        oder falsche Angaben kann nach vorheriger Information gesondert berechnet werden.
      </p>

      <h2>4. Preise, MwSt. und Zahlung</h2>
      <p>
        Alle Preise verstehen sich in Euro inklusive gesetzlicher MwSt., sofern nicht anders
        angegeben. Angebote und Bestellungen nennen den anwendbaren MwSt.-Satz. Rechnungen sind,
        sofern nicht anders vereinbart, innerhalb von 14 Tagen nach Rechnungsdatum ohne Abzug
        fällig. Bei Projekten können Teilzahlungen oder Anzahlungen vereinbart werden. Bei
        Zahlungsverzug gelten die gesetzlichen Vorschriften.
      </p>

      <h2>5. Liefer- und Leistungstermine</h2>
      <p>
        Liefer- und Leistungstermine sind unverbindlich, sofern sie nicht ausdrücklich als
        verbindlich vereinbart wurden. Verzögerungen teilen wir unverzüglich mit. Höhere Gewalt,
        Lieferengpässe und andere von uns nicht beeinflussbare Umstände können Fristen verlängern.
      </p>

      <h2>6. Widerrufsrecht für Verbraucher</h2>
      <p>
        Verbrauchern steht bei Fernabsatzverträgen grundsätzlich ein gesetzliches Widerrufsrecht zu.
        Einzelheiten, Ausnahmen und das Muster-Widerrufsformular finden Sie in unserer{" "}
        <Link to="/legal/withdrawal">Widerrufsbelehrung</Link>. Das Widerrufsrecht kann bei
        digitalen Inhalten oder Dienstleistungen erlöschen, wenn mit der Ausführung mit Ihrer
        ausdrücklichen Zustimmung begonnen wurde.
      </p>

      <h2>7. Gewährleistung und Haftung</h2>
      <p>
        Es gelten die gesetzlichen Gewährleistungsrechte. Wir haften unbeschränkt für Vorsatz, grobe
        Fahrlässigkeit, Verletzung von Leben, Körper oder Gesundheit sowie nach dem
        Produkthaftungsgesetz. Bei leichter Fahrlässigkeit haften wir nur für die Verletzung
        wesentlicher Vertragspflichten und begrenzt auf den vorhersehbaren, vertragstypischen
        Schaden. Für Datenverluste haften wir nicht, soweit Sie diese durch zumutbare
        Sicherungsmaßnahmen hätten verhindern können. Bitte bewahren Sie stets eigene Backups auf.
      </p>

      <h2>8. Datenschutz</h2>
      <p>
        Wir verarbeiten personenbezogene Daten wie in unserer{" "}
        <Link to="/legal/privacy">Datenschutzerklärung</Link> beschrieben. Soweit wir Daten in Ihrem
        Auftrag verarbeiten, schließen wir bei gesetzlicher Erforderlichkeit einen
        Auftragsverarbeitungsvertrag.
      </p>

      <h2>9. Software und Drittanbieter</h2>
      <p>
        Software, Cloud-Dienste und Hardware Dritter unterliegen den Bedingungen des jeweiligen
        Herstellers oder Anbieters. Für Drittanbieterleistungen übernehmen wir keine Garantie und
        sind nicht für Verfügbarkeit, Änderungen oder Preise verantwortlich.
      </p>

      <h2>10. Streitbeilegung und anwendbares Recht</h2>
      <p>
        Wir sind weder verpflichtet noch grundsätzlich bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen. Die europäische Plattform zur
        Online-Streitbeilegung finden Sie unter{" "}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>
        . Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Zwingende
        Verbraucherschutzvorschriften Ihres Wohnsitzlandes bleiben unberührt.
      </p>

      <h2>11. Änderungen und Salvatorische Klausel</h2>
      <p>
        Wir können diese Bedingungen für künftige Verträge aktualisieren. Ist eine Bestimmung
        unwirksam, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Die unwirksame
        Bestimmung wird durch die gesetzlich zulässige Regelung ersetzt, die ihrem Zweck am
        nächsten kommt.
      </p>

      <h2>12. Demo-Hinweis</h2>
      <p>
        Dies ist ein fiktives Abschlussprojekt. Diese AGB sind eine Vorlage, keine Rechtsberatung,
        und müssen vor der echten Nutzung geprüft und angepasst werden.
      </p>
    </>
  );
}
