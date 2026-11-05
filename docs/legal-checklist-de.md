# German/EU legal launch checklist

**This is a technical project checklist, not legal advice. A lawyer or
Datenschutzbeauftragte:r must review the final website before launch.**

The demo implements templates for the most common requirements. Replace every
placeholder before going live.

---

## 1. Provider identification — Impressum

Legal basis: **§ 5 DDG** (Digitale-Dienste-Gesetz, replaced § 5 TMG in 2024),
**§ 18 Abs. 2 MStV** for editorial content.

- [x] Page exists at `/legal/imprint`, linked from every footer.
- [ ] Real company name and legal form.
- [ ] Full postal address (no P.O. box).
- [ ] Managing director / authorised representative.
- [ ] Phone and email (email is enough for electronic contact, phone recommended).
- [ ] Commercial register court and number (if registered).
- [ ] VAT ID according to § 27a UStG (if available).
- [ ] Responsible person for content (§ 18(2) MStV).
- [ ] EU online dispute resolution link (kept for transparency).
- [ ] Statement about willingness to participate in consumer arbitration.
- [ ] Supervisory authority if the business is regulated (not applicable to normal IT services).

**Demo placeholders to replace:** `HRB 000000 B`, `DE000000000`,
`Hauptstraße 12`, `+49 30 5550 0100`, `hello@orbit-it.de`.

---

## 2. Privacy — DSGVO / GDPR

Legal basis: **Art. 12–22 GDPR**, **§ 25 TDDDG** for cookies.

- [x] Privacy policy page at `/legal/privacy`.
- [x] Identity and contact details of the controller.
- [x] Purposes and legal bases per processing activity.
- [x] Categories of recipients and processors.
- [x] Retention periods.
- [x] Data subject rights (access, rectification, erasure, restriction,
      portability, objection, withdrawal).
- [x] Right to complain to the Berlin supervisory authority.
- [x] Mention of TLS/security measures.
- [x] No automated decision-making.
- [x] Children's scope statement.
- [ ] Real hosting/email/payment providers named.
- [ ] Art. 28 data processing agreements signed.
- [ ] Record of processing activities (Art. 30) created.
- [ ] Data protection impact assessment if a high-risk processing applies
      (large CCTV systems can require one).
- [ ] Data protection officer appointed if legally required (§ 38 BDSG).
- [ ] International transfer mechanism documented (if non-EEA providers).
- [ ] Internal process for data subject requests within one month.
- [ ] Deletion concept for logs, chats and backups.
- [ ] Breach response process (72-hour notification, Art. 33).

### Implemented privacy features

- Data export: portal → Profile & privacy → **Download my data**.
- Account deletion with anonymisation.
- Consent timestamps for registration, quote requests, contact, guest chat and
  checkout.
- Passwords hashed, sessions server-side.
- Contact and chat rate limits.

---

## 3. Cookies and consent — TDDDG

Legal basis: **§ 25 Abs. 1 TDDDG** (consent for non-essential storage),
**§ 25 Abs. 2 TDDDG** (essential storage exempt).

- [x] Cookie banner with Accept / Essential only.
- [x] Cookie policy page.
- [x] No analytics or marketing cookies.
- [x] Re-open settings from footer and legal pages.
- [x] Consent choice and date stored locally.
- [ ] If analytics/marketing is added later: prior opt-in, granular categories,
      reject button as easy as accept, no pre-ticked boxes, documented consent.
- [ ] Google Fonts, YouTube embeds, maps and social plugins require consent or
      local hosting.

---

## 4. Terms and consumer protection — AGB / BGB

- [x] Terms page at `/legal/terms`.
- [x] Scope, contract formation, prices, payment, delivery, liability, law.
- [x] Reference to the withdrawal information.
- [x] Online dispute resolution statement.
- [ ] Real business processes and payment terms verified.
- [ ] B2B vs B2C clauses reviewed.
- [ ] Limitation of liability reviewed (German law has strict limits).
- [ ] Warranty and software licensing clauses reviewed.
- [ ] Price indication rules (PAngV) for consumers: total price incl. VAT and
      delivery costs shown before order.
- [ ] Button label "Zahlungspflichtig bestellen" for paid online orders
      (§ 312j Abs. 3 BGB) — the demo uses "Place order"/"Bestellung abschicken"
      and must be adapted for a real shop.
- [ ] Order confirmation and contract text storage implemented (email).

---

## 5. Right of withdrawal — Widerrufsrecht

- [x] Withdrawal page at `/legal/withdrawal`.
- [x] 14-day period explanation.
- [x] Model withdrawal form.
- [x] Exceptions for digital content, sealed goods and customised goods.
- [ ] Final text checked for the actual product/service mix.
- [ ] Withdrawal function online for distance contracts? (Not mandatory for all
      cases, but the model form and clear contact channel are required.)
- [ ] Return cost rules stated clearly.

---

## 6. Invoices, VAT and bookkeeping

- [x] Invoice records with sequential-looking number, issue date, due date,
      amount and 19 % VAT.
- [ ] Real invoice includes all § 14 UStG data: full name/address of supplier and
      customer, tax number/VAT ID, invoice date, sequential invoice number,
      description, quantity, net amount, VAT rate and amount, gross amount.
- [ ] Small business rule (§ 19 UStG) considered if applicable.
- [ ] Reverse charge rules for B2B services in other EU countries considered.
- [ ] Invoice retention for 10 years (§ 147 AO, § 257 HGB) and archiving rules.
- [ ] Payment provider and reconciliation process.
- [ ] Currency and rounding rules.

**Demo invoice is not a legally valid invoice.**

---

## 7. CCTV and IT services (specific to this business)

If the company installs cameras:

- [ ] Purpose and legal basis documented.
- [ ] Privacy notice sign before the monitored area.
- [ ] Data minimisation, retention period (often 48–72 hours unless justified).
- [ ] Access control for footage.
- [ ] Data protection impact assessment for larger systems.
- [ ] Works council involvement if employees are monitored.
- [ ] No monitoring of public areas beyond what is allowed.

For managed IT services:

- [ ] Remote access agreements and logging.
- [ ] Confidentiality and Art. 28 processing agreements for customer systems.
- [ ] Backup and incident responsibilities in contracts.

---

## 8. Accessibility

- [ ] WCAG 2.2 AA review (keyboard navigation, labels, contrast, zoom, focus).
- [ ] Accessibility statement (BFSG / EU Accessibility Act for consumer-facing
      e-commerce from June 2025).
- [ ] Checkout and forms usable with a screen reader.
- [ ] No information conveyed only by colour.

The demo uses semantic headings, labels, focusable controls and sufficient
contrast in most places, but has not been formally audited.

---

## 9. Other German/EU points

- [ ] Domain and email provider contracts.
- [ ] Trademark check for "Orbit IT Solutions".
- [ ] Copyright for images/fonts/icons (Lucide is ISC licensed).
- [ ] Photo credits if real photos are added.
- [ ] Youth protection (not relevant for B2B IT services).
- [ ] Network and information security (NIS2) obligations if the company grows.
- [ ] Whistleblower channel if required (HinSchG) for larger companies.
- [ ] Recycling/electronic waste rules if hardware is sold (WEEE, batteries).
- [ ] Packaging law (VerpackG) if physical goods are shipped.

---

## 10. Go-live checklist

- [ ] Replace demo people, prices, company data, register and VAT ID.
- [ ] Have privacy policy, AGB, withdrawal and cookie texts reviewed.
- [ ] Sign AVV/DPA contracts with host, email and payment providers.
- [ ] Set `NODE_ENV=production`, HTTPS, secure cookies, real `CLIENT_ORIGIN`.
- [ ] Remove or protect demo accounts and demo data.
- [ ] Test data export and deletion.
- [ ] Set up backups and monitor restores.
- [ ] Add an accessibility statement.
- [ ] Publish a contact/privacy email that is monitored.
- [ ] Set up an incident and breach process.
- [ ] Keep this checklist with the signed documents.
