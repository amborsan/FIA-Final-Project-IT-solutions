import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "../components/LegalShell";
import { useI18n } from "../i18n/I18nContext";

export const Route = createFileRoute("/legal/withdrawal")({
  component: WithdrawalPage,
});

function WithdrawalPage() {
  const { language } = useI18n();
  return (
    <LegalShell
      titleKey="legal.withdrawalTitle"
      introKey="legal.withdrawalIntro"
    >
      {language === "de" ? <GermanWithdrawal /> : <EnglishWithdrawal />}
    </LegalShell>
  );
}

function EnglishWithdrawal() {
  return (
    <>
      <h2>Right of withdrawal</h2>
      <p>
        If you are a consumer (a natural person acting for purposes outside your
        trade, business, craft or profession), you have the right to withdraw
        from this contract within 14 days without giving any reason.
      </p>
      <p>
        For service contracts, the withdrawal period starts on the day the
        contract is concluded. For contracts for goods, it starts on the day you
        or a third party named by you (not the carrier) take possession of the
        goods. If an order contains several goods delivered separately, the
        period starts with the last item. If goods are delivered in several
        instalments, the period starts with the first instalment.
      </p>

      <h2>How to withdraw</h2>
      <p>
        To exercise your right, send us a clear statement (for example by email
        or post) before the period expires:
      </p>
      <p>
        IT Solutions.
        <br />
        Hauptstraße 12, 10115 Berlin, Germany
        <br />
        Email: <a href="mailto:hello@fia-it.de">hello@fia-it.de</a>
        <br />
        Phone: +49 30 5550 0100
      </p>
      <p>
        You may use the model withdrawal form below, but it is not mandatory.
        Sending the notification before the deadline is sufficient to comply
        with the period.
      </p>

      <h2>Consequences of withdrawal</h2>
      <p>
        If you withdraw, we will refund all payments received from you,
        including delivery costs (except additional costs caused by your choice
        of a delivery method other than the cheapest standard delivery we
        offer), without undue delay and at the latest within 14 days from the
        day we receive your withdrawal notice. We use the same payment method
        you used for the original transaction unless expressly agreed otherwise;
        you will not be charged fees for the refund.
      </p>
      <p>
        If you requested that the service begin during the withdrawal period,
        you must pay a proportionate amount for the service provided up to the
        time you withdraw, compared with the full scope of the contract.
      </p>
      <p>
        For goods, you must return or hand them over to us without undue delay
        and at the latest within 14 days from the day you notify us. We may
        withhold the refund until we have received the goods or you have proved
        that you returned them. You bear the direct cost of returning the goods.
        You are only liable for any diminished value of the goods resulting from
        handling them beyond what is necessary to establish their nature,
        characteristics and functioning.
      </p>

      <h2>Exceptions</h2>
      <p>
        The right of withdrawal does not apply, among other things, to contracts
        for goods made to the consumer's specification or clearly personalised,
        to sealed goods unsuitable for return for health or hygiene reasons if
        the seal was removed after delivery, and to digital content supplied on
        a tangible medium if the seal was removed. For digital content not
        supplied on a tangible medium, the right expires if we started delivery
        with your express consent and your confirmation that you lose the right.
      </p>

      <h2>Model withdrawal form</h2>
      <p>(Complete and return this form only if you want to withdraw.)</p>
      <p>
        To: IT Solutions., Hauptstraße 12, 10115 Berlin, Germany,{" "}
        <a href="mailto:hello@fia-it.de">hello@fia-it.de</a>
      </p>
      <p>
        I/We hereby withdraw from the contract concluded by me/us for the
        purchase of the following goods / the provision of the following
        service:
        <br />
        ______________________________________________
        <br />
        Ordered on / received on: ______________________
        <br />
        Name of consumer(s): ___________________________
        <br />
        Address of consumer(s): ________________________
        <br />
        Signature of consumer(s) (only for notification on paper):
        ________________
        <br />
        Date: ________________
      </p>

      <p>
        See also our <Link to="/legal/terms">terms and conditions</Link> and{" "}
        <Link to="/legal/privacy">privacy policy</Link>. This is a demo template
        and not legal advice.
      </p>
    </>
  );
}

function GermanWithdrawal() {
  return (
    <>
      <h2>Widerrufsrecht</h2>
      <p>
        Sie haben als Verbraucher (natürliche Person, die den Vertrag zu einem
        Zweck abschließt, der weder ihrer gewerblichen noch ihrer selbständigen
        beruflichen Tätigkeit zugerechnet werden kann) das Recht, binnen 14
        Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
      </p>
      <p>
        Bei Dienstleistungsverträgen beginnt die Widerrufsfrist am Tag des
        Vertragsschlusses. Bei Waren beginnt sie an dem Tag, an dem Sie oder ein
        von Ihnen benannter Dritter, der nicht der Beförderer ist, die Ware in
        Besitz nehmen. Bei einer Bestellung mehrerer Waren, die getrennt
        geliefert werden, beginnt die Frist mit dem letzten Gegenstand. Bei
        Lieferung in mehreren Teilsendungen beginnt sie mit der ersten
        Teilsendung.
      </p>

      <h2>So widerrufen Sie</h2>
      <p>
        Um Ihr Widerrufsrecht auszuüben, senden Sie uns vor Ablauf der Frist
        eine eindeutige Erklärung (zum Beispiel per E-Mail oder Post):
      </p>
      <p>
        IT Solutions.
        <br />
        Hauptstraße 12, 10115 Berlin, Deutschland
        <br />
        E-Mail: <a href="mailto:hello@fia-it.de">hello@fia-it.de</a>
        <br />
        Telefon: +49 30 5550 0100
      </p>
      <p>
        Sie können das untenstehende Muster-Widerrufsformular verwenden, dies
        ist aber nicht vorgeschrieben. Die rechtzeitige Absendung der
        Widerrufserklärung vor Ablauf der Frist genügt.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn Sie widerrufen, erstatten wir alle Zahlungen, die wir von Ihnen
        erhalten haben, einschließlich der Lieferkosten (mit Ausnahme
        zusätzlicher Kosten, die sich daraus ergeben, dass Sie eine andere Art
        der Lieferung als die von uns angebotene günstigste Standardlieferung
        gewählt haben), unverzüglich und spätestens binnen 14 Tagen ab dem Tag,
        an dem wir Ihre Widerrufserklärung erhalten haben. Wir verwenden
        dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
        eingesetzt haben, sofern nichts anderes vereinbart wurde; für die
        Rückzahlung werden keine Gebühren berechnet.
      </p>
      <p>
        Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist
        beginnt, müssen Sie einen angemessenen Betrag für die bis zum Widerruf
        erbrachte Leistung im Vergleich zum Gesamtumfang des Vertrags zahlen.
      </p>
      <p>
        Bei Waren müssen Sie die Waren unverzüglich und spätestens binnen 14
        Tagen ab dem Tag, an dem Sie uns über den Widerruf informieren,
        zurücksenden oder übergeben. Wir können die Rückzahlung verweigern, bis
        wir die Waren zurückerhalten haben oder Sie den Nachweis der Rücksendung
        erbracht haben. Die unmittelbaren Kosten der Rücksendung tragen Sie. Sie
        müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn
        dieser auf einen zur Prüfung der Beschaffenheit, Eigenschaften und
        Funktionsweise nicht notwendigen Umgang zurückzuführen ist.
      </p>

      <h2>Ausnahmen</h2>
      <p>
        Das Widerrufsrecht besteht unter anderem nicht bei Verträgen über Waren,
        die nach Kundenspezifikation angefertigt oder eindeutig auf persönliche
        Bedürfnisse zugeschnitten sind, bei versiegelten Waren, die aus Gründen
        des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet
        sind, wenn das Siegel nach der Lieferung entfernt wurde, sowie bei
        digitalen Inhalten auf einem körperlichen Datenträger, wenn das Siegel
        entfernt wurde. Bei digitalen Inhalten ohne körperlichen Datenträger
        erlischt das Widerrufsrecht, wenn wir mit der Ausführung mit Ihrer
        ausdrücklichen Zustimmung und Ihrer Bestätigung des Verlusts des
        Widerrufsrechts begonnen haben.
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p>
        (Nur ausfüllen und zurücksenden, wenn Sie den Vertrag widerrufen
        wollen.)
      </p>
      <p>
        An: IT Solutions., Hauptstraße 12, 10115 Berlin, Deutschland,{" "}
        <a href="mailto:hello@fia-it.de">hello@fia-it.de</a>
      </p>
      <p>
        Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag
        über den Kauf der folgenden Waren / die Erbringung der folgenden
        Dienstleistung:
        <br />
        ______________________________________________
        <br />
        Bestellt am / erhalten am: ______________________
        <br />
        Name des/der Verbraucher(s): ____________________
        <br />
        Anschrift des/der Verbraucher(s): _______________
        <br />
        Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):
        ________________
        <br />
        Datum: ________________
      </p>

      <p>
        Siehe auch unsere <Link to="/legal/terms">AGB</Link> und die{" "}
        <Link to="/legal/privacy">Datenschutzerklärung</Link>. Dies ist eine
        Demo-Vorlage und keine Rechtsberatung.
      </p>
    </>
  );
}
