const phone = "+49 30 5550 0100";
const email = "hello@fia-it.de";

export const siteContact = {
  street: "Hauptstraße 12",
  city: "10115 Berlin",
  phone,
  phoneHref: `tel:${phone.replaceAll(" ", "")}`,
  email,
  emailHref: `mailto:${email}`,
};
