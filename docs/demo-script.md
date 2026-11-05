# 10-minute live demo script

> Goal: show one complete business flow and the three dashboards without typing
> long forms. Have three browser profiles or log in/out quickly.

## Before the demo

```bash
cd server && npm run dev
cd client && npm run dev
```

- Open `http://localhost:5173` in a clean profile.
- Log in as customer in profile A, technician in B, admin in C.
- Make sure the seed data exists (`npm run db:seed`).
- Have `customer@orbit-it.de / Customer12345!` ready.

If you prefer the production build:

```bash
cd client && npm run build
cd server && npm start
# open http://localhost:3000
```

---

## Minute 0–1: Public website

1. Open the home page.
2. Switch **EN → DE** in the header, point out that the whole site changes.
3. Scroll to services and open **Netzwerklösungen** (or Network Solutions).
4. Point out: starting price, scope, quote CTA, related services.
5. Open the **Shop**, filter by category, open a product.
6. Do not add to cart yet.

**Say:** “This is not a static brochure. Every service is a database record, and
the quote form is linked to it.”

---

## Minute 1–3: Visitor asks for a quote

1. Open **Request a quote**.
2. Use a short prefilled example (you can paste from a note):

   - Name: `Demo Visitor`
   - Email: `demo.visitor@example.com`
   - Title: `WLAN for 8 desks`
   - Description: `We need stable Wi-Fi and cabling for eight desks in one office.`
   - Service: Network
3. Tick privacy, submit.
4. Show the reference number.

**Say:** “No account needed. The admin gets an in-app notification and the lead
appears in the admin area.”

---

## Minute 3–5: Admin turns the lead into a quote

1. Switch to the **admin** profile.
2. Open **Requests** and select the new request (reference is newest).
3. Point out the warning: it is a lead, not linked to a customer.
4. Link it to the **customer** account, assign **Jonas Weber**, save.
5. In **Create quote**, add two items:

   - `UniFi 6 Pro access point`, qty 3, unit price 189
   - `Installation and configuration`, qty 4, unit price 95
6. Keep VAT 19 %, set validity +14 days, create the quote.
7. Send the quote.

**Say:** “The total is calculated on the server, and sending it notifies the
customer.”

---

## Minute 5–7: Customer accepts the quote

1. Switch to the **customer** profile. Reload.
2. Open **Requests** → the request.
3. Show the quote line items, VAT and total.
4. Accept the quote.
5. Open **Orders & invoices** and show:
   - order reference,
   - invoice number, issue/due date, amount,
   - status “Issued”.

**Say:** “Accepting the quote created the order and invoice in one transaction.
Stock for linked products was reduced.”

---

## Minute 7–8: Technician and support

1. Switch to the **technician** profile.
2. Show assigned requests, change a status to **In progress**.
3. Open **Tickets** → reply and add an internal note.
4. Open **Reports** → show the report form with file upload.

**Say:** “Customers never see internal notes; the API filters them.”

---

## Minute 8–9: Chat and CMS

1. Open the chat bubble as a visitor (incognito) and send a short guest message.
2. Switch to admin → **Chats** → reply.
3. Show **Website content** → edit a page and point out the rich editor and
   EN/DE fields.

**Say:** “Guest chat is token-protected; direct staff chat is participants-only.”

---

## Minute 9–10: Privacy and wrap-up

1. Customer portal → **Profile & privacy**.
2. Point out **Download my data** and **Delete my account**.
3. Open the footer → **Privacy** and **Impressum**.
4. Close with the architecture diagram and one next step.

**Say:** “The legal texts are templates and need a lawyer’s review. The technical
implementation — consent timestamps, export, deletion, essential-only cookies —
is in place.”

---

## Fallback plan

If something fails:

- Use the seeded demo request `SR-2026-DEMO01`, which already has a sent quote.
- Use `customer@orbit-it.de` and accept it live.
- If the database is empty, run `npm run db:seed` and reload.
- If the dev server fails, use the already built app at `http://localhost:3000`
  (`cd server && npm start`).
- Keep screenshots of the dashboards in the slides as a last resort.

## Do not do during the demo

- Do not delete demo accounts or run migrations.
- Do not open the admin activity log and scroll for too long.
- Do not type a long description live; paste it.
- Do not claim the legal templates are legally reviewed.
