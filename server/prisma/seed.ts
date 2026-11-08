import { prisma } from "../src/prisma.ts";
import { hashPassword } from "../src/auth/password.ts";
import {
  calculateTotals,
  createReference,
  daysFromNow,
} from "../src/utils/helpers.ts";

// ---------------------------------------------------------------------------
// Demo data for the graduation project.
// Safe to run again: fixed IDs/slugs are upserted and sample transactions are
// only created when the database does not contain any requests yet.
// Run with: npm run db:seed
// ---------------------------------------------------------------------------

const adminId = "10000000-0000-4000-8000-000000000001";
const techId = "10000000-0000-4000-8000-000000000002";
const tech2Id = "10000000-0000-4000-8000-000000000003";
const customerId = "10000000-0000-4000-8000-000000000004";
const businessId = "10000000-0000-4000-8000-000000000005";

const services = [
  {
    slug: "network-solutions",
    nameEn: "Network Solutions",
    nameDe: "Netzwerklösungen",
    descriptionEn:
      "LAN/Wi-Fi planning, routers, switches, VLANs and structured cabling for offices that need a stable, fast network.",
    descriptionDe:
      "LAN/WLAN-Planung, Router, Switches, VLANs und strukturierte Verkabelung für Büros mit einem stabilen, schnellen Netzwerk.",
    icon: "network",
    startingPrice: 149,
    sortOrder: 1,
  },
  {
    slug: "cctv-surveillance",
    nameEn: "CCTV & Surveillance",
    nameDe: "Videoüberwachung",
    descriptionEn:
      "IP cameras, NVR systems, installation and maintenance with a focus on privacy-compliant video surveillance in Germany.",
    descriptionDe:
      "IP-Kameras, NVR-Systeme, Installation und Wartung mit Fokus auf datenschutzkonforme Videoüberwachung in Deutschland.",
    icon: "camera",
    startingPrice: 299,
    sortOrder: 2,
  },
  {
    slug: "it-support",
    nameEn: "IT Support & Maintenance",
    nameDe: "IT-Support & Wartung",
    descriptionEn:
      "Troubleshooting for PCs, printers, software and remote support for small teams, with clear response times.",
    descriptionDe:
      "Fehlerbehebung bei PCs, Druckern, Software und Remote-Support für kleine Teams mit klaren Reaktionszeiten.",
    icon: "headset",
    startingPrice: 89,
    sortOrder: 3,
  },
  {
    slug: "web-development",
    nameEn: "Web & Software Development",
    nameDe: "Web- & Softwareentwicklung",
    descriptionEn:
      "Websites, business apps, CRM/ERP tools and custom software built around your actual daily processes.",
    descriptionDe:
      "Websites, Business-Apps, CRM/ERP-Tools und individuelle Software passend zu Ihren täglichen Abläufen.",
    icon: "code",
    startingPrice: 1200,
    sortOrder: 4,
  },
  {
    slug: "cybersecurity",
    nameEn: "Cybersecurity",
    nameDe: "Cybersicherheit",
    descriptionEn:
      "Firewalls, VPN, access protection, security assessments and practical hardening for small and medium businesses.",
    descriptionDe:
      "Firewalls, VPN, Zugriffsschutz, Sicherheitschecks und praktische Härtung für kleine und mittlere Unternehmen.",
    icon: "shield",
    startingPrice: 249,
    sortOrder: 5,
  },
  {
    slug: "server-cloud",
    nameEn: "Server & Cloud Solutions",
    nameDe: "Server- & Cloud-Lösungen",
    descriptionEn:
      "Server setup, NAS, backup, Microsoft 365 and cloud hosting with a recovery plan that actually gets tested.",
    descriptionDe:
      "Server-Einrichtung, NAS, Backup, Microsoft 365 und Cloud-Hosting mit einem Wiederherstellungsplan, der getestet wird.",
    icon: "server",
    startingPrice: 399,
    sortOrder: 6,
  },
  {
    slug: "access-control",
    nameEn: "Access Control & Smart Systems",
    nameDe: "Zutrittskontrolle & Smart Systems",
    descriptionEn:
      "RFID, biometrics, door control, intercom and time attendance systems for offices and workshops.",
    descriptionDe:
      "RFID, Biometrie, Türsteuerung, Sprechanlagen und Zeiterfassung für Büros und Werkstätten.",
    icon: "fingerprint",
    startingPrice: 349,
    sortOrder: 7,
  },
  {
    slug: "voip-communication",
    nameEn: "VoIP & Communication",
    nameDe: "VoIP & Kommunikation",
    descriptionEn:
      "IP phones, PBX systems and business communication that works on site and from home.",
    descriptionDe:
      "IP-Telefone, TK-Anlagen und Geschäftskommunikation, die im Büro und im Homeoffice funktioniert.",
    icon: "phone",
    startingPrice: 199,
    sortOrder: 8,
  },
  {
    slug: "it-infrastructure",
    nameEn: "IT Infrastructure & Cabling",
    nameDe: "IT-Infrastruktur & Verkabelung",
    descriptionEn:
      "Server rooms, rack cabinets, fiber optics, patch panels and tidy cabling that is easy to maintain.",
    descriptionDe:
      "Serverräume, Rack-Schränke, Glasfaser, Patchpanels und aufgeräumte Verkabelung, die wartbar bleibt.",
    icon: "cable",
    startingPrice: 499,
    sortOrder: 9,
  },
  {
    slug: "it-consulting",
    nameEn: "IT Consulting & Managed Services",
    nameDe: "IT-Beratung & Managed Services",
    descriptionEn:
      "Independent advice on IT planning, technology selection, maintenance contracts and system monitoring.",
    descriptionDe:
      "Unabhängige Beratung zu IT-Planung, Technologieauswahl, Wartungsverträgen und Systemüberwachung.",
    icon: "chart",
    startingPrice: 129,
    sortOrder: 10,
  },
];

const categories = [
  { slug: "network", nameEn: "Network equipment", nameDe: "Netzwerkgeräte" },
  { slug: "surveillance", nameEn: "Surveillance", nameDe: "Videoüberwachung" },
  {
    slug: "computers",
    nameEn: "Computers & laptops",
    nameDe: "Computer & Laptops",
  },
  { slug: "servers", nameEn: "Servers & storage", nameDe: "Server & Speicher" },
  { slug: "communication", nameEn: "Communication", nameDe: "Kommunikation" },
  { slug: "accessories", nameEn: "Accessories", nameDe: "Zubehör" },
];

const products = [
  {
    slug: "unifi-6-pro",
    sku: "NET-U6P",
    category: "network",
    nameEn: "Ubiquiti UniFi 6 Pro Access Point",
    nameDe: "Ubiquiti UniFi 6 Pro Access Point",
    price: 189,
    stock: 24,
    featured: true,
    descriptionEn:
      "Wi-Fi 6 access point for offices with many devices. PoE powered and centrally managed.",
    descriptionDe:
      "Wi-Fi-6-Access-Point für Büros mit vielen Geräten. PoE-versorgt und zentral verwaltbar.",
  },
  {
    slug: "omada-switch-8",
    sku: "NET-OM8",
    category: "network",
    nameEn: "TP-Link Omada 8-Port Switch",
    nameDe: "TP-Link Omada 8-Port Switch",
    price: 89.9,
    stock: 40,
    featured: false,
    descriptionEn:
      "Managed gigabit switch with VLAN support for small office networks.",
    descriptionDe:
      "Managed-Gigabit-Switch mit VLAN-Unterstützung für kleine Büronetzwerke.",
  },
  {
    slug: "fritzbox-7590-ax",
    sku: "NET-FB7590",
    category: "network",
    nameEn: "FRITZ!Box 7590 AX Router",
    nameDe: "FRITZ!Box 7590 AX Router",
    price: 219,
    stock: 15,
    featured: true,
    descriptionEn:
      "Fast Wi-Fi 6 router with telephone system and mesh support.",
    descriptionDe:
      "Schneller Wi-Fi-6-Router mit Telefonanlage und Mesh-Unterstützung.",
  },
  {
    slug: "hikvision-dome-4mp",
    sku: "CAM-HD4",
    category: "surveillance",
    nameEn: "Hikvision 4 MP Dome Camera",
    nameDe: "Hikvision 4-MP-Dome-Kamera",
    price: 129,
    stock: 30,
    featured: false,
    descriptionEn:
      "Indoor/outdoor IP camera with night vision. Installation and privacy signage available.",
    descriptionDe:
      "IP-Kamera für innen/außen mit Nachtsicht. Installation und Datenschutzbeschilderung möglich.",
  },
  {
    slug: "hikvision-nvr-8",
    sku: "CAM-NVR8",
    category: "surveillance",
    nameEn: "Hikvision 8-Channel NVR",
    nameDe: "Hikvision 8-Kanal-NVR",
    price: 249,
    stock: 12,
    featured: false,
    descriptionEn:
      "Network video recorder for up to eight cameras and 8 TB storage.",
    descriptionDe:
      "Netzwerkvideorekorder für bis zu acht Kameras und 8 TB Speicher.",
  },
  {
    slug: "synology-ds223",
    sku: "SRV-DS223",
    category: "servers",
    nameEn: "Synology DiskStation DS223",
    nameDe: "Synology DiskStation DS223",
    price: 329,
    stock: 9,
    featured: true,
    descriptionEn:
      "Two-bay NAS for file sharing, backups and private cloud storage.",
    descriptionDe:
      "Zwei-Bay-NAS für Dateifreigabe, Backups und private Cloud-Speicherung.",
  },
  {
    slug: "dell-optiplex-7010",
    sku: "PC-OP7010",
    category: "computers",
    nameEn: "Dell OptiPlex 7010 Desktop",
    nameDe: "Dell OptiPlex 7010 Desktop",
    price: 749,
    stock: 7,
    featured: false,
    descriptionEn:
      "Business desktop with 16 GB RAM and 512 GB SSD, ready for office work.",
    descriptionDe:
      "Business-Desktop mit 16 GB RAM und 512 GB SSD, bereit für Büroarbeit.",
  },
  {
    slug: "lenovo-thinkpad-e14",
    sku: "PC-TPE14",
    category: "computers",
    nameEn: "Lenovo ThinkPad E14 Laptop",
    nameDe: "Lenovo ThinkPad E14 Laptop",
    price: 899,
    stock: 11,
    featured: true,
    descriptionEn:
      "Reliable 14-inch business laptop with 16 GB RAM and 512 GB SSD.",
    descriptionDe:
      "Zuverlässiges 14-Zoll-Business-Notebook mit 16 GB RAM und 512 GB SSD.",
  },
  {
    slug: "hp-laserjet-pro",
    sku: "PRN-HPLJ",
    category: "accessories",
    nameEn: "HP LaserJet Pro Printer",
    nameDe: "HP LaserJet Pro Drucker",
    price: 229,
    stock: 18,
    featured: false,
    descriptionEn:
      "Compact monochrome laser printer for small offices and home offices.",
    descriptionDe:
      "Kompakter Schwarzweiß-Laserdrucker für kleine Büros und Homeoffice.",
  },
  {
    slug: "apc-ups-1500",
    sku: "SRV-UPS1500",
    category: "servers",
    nameEn: "APC UPS 1500 VA",
    nameDe: "APC USV 1500 VA",
    price: 279,
    stock: 10,
    featured: false,
    descriptionEn:
      "Uninterruptible power supply to protect servers and network cabinets.",
    descriptionDe:
      "Unterbrechungsfreie Stromversorgung zum Schutz von Servern und Netzwerkschränken.",
  },
  {
    slug: "gigaset-voip-phone",
    sku: "COM-GSVOIP",
    category: "communication",
    nameEn: "Gigaset VoIP Desk Phone",
    nameDe: "Gigaset VoIP-Telefon",
    price: 79.9,
    stock: 25,
    featured: false,
    descriptionEn:
      "Desk phone for VoIP systems with HD voice and headset support.",
    descriptionDe:
      "Tischtelefon für VoIP-Anlagen mit HD-Stimme und Headset-Unterstützung.",
  },
  {
    slug: "cisco-rv260",
    sku: "NET-RV260",
    category: "network",
    nameEn: "Cisco RV260 VPN Router",
    nameDe: "Cisco RV260 VPN-Router",
    price: 199,
    stock: 8,
    featured: false,
    descriptionEn:
      "VPN router for secure connections between office and home office.",
    descriptionDe:
      "VPN-Router für sichere Verbindungen zwischen Büro und Homeoffice.",
  },
  {
    slug: "cat6-patch-2m",
    sku: "ACC-CAT6-2",
    category: "accessories",
    nameEn: "Cat.6 Patch Cable 2 m",
    nameDe: "Cat.6 Patchkabel 2 m",
    price: 6.9,
    stock: 200,
    featured: false,
    descriptionEn: "Quality copper patch cable for gigabit connections.",
    descriptionDe: "Hochwertiges Kupfer-Patchkabel für Gigabit-Verbindungen.",
  },
  {
    slug: "patch-panel-24",
    sku: "ACC-PP24",
    category: "accessories",
    nameEn: "24-Port Patch Panel",
    nameDe: "24-Port Patchpanel",
    price: 49,
    stock: 35,
    featured: false,
    descriptionEn: "Rack-mounted patch panel for tidy structured cabling.",
    descriptionDe: "Rack-Patchpanel für aufgeräumte strukturierte Verkabelung.",
  },
];

async function seed() {
  console.log("Seeding Orbit IT Solutions demo data...");

  const passwordAdmin = await hashPassword("Admin12345!");
  const passwordTech = await hashPassword("Tech12345!");
  const passwordCustomer = await hashPassword("Customer12345!");

  await prisma.user.upsert({
    where: { id: adminId },
    update: {},
    create: {
      id: adminId,
      email: "admin@fia-it.de",
      passwordHash: passwordAdmin,
      fullName: "Aylin Demir",
      firstName: "Aylin",
      lastName: "Demir",
      role: "ADMIN",
      phone: "+49 30 5550 0100",
      companyName: "Orbit IT Solutions GmbH",
      address: "Hauptstraße 12, 10115 Berlin",
      preferredLanguage: "EN",
      acceptedTermsAt: new Date(),
      acceptedPrivacyAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { id: techId },
    update: {},
    create: {
      id: techId,
      email: "tech@fia-it.de",
      passwordHash: passwordTech,
      fullName: "Jonas Weber",
      firstName: "Jonas",
      lastName: "Weber",
      role: "TECHNICIAN",
      phone: "+49 30 5550 0101",
      address: "Hauptstraße 12, 10115 Berlin",
      preferredLanguage: "DE",
      acceptedTermsAt: new Date(),
      acceptedPrivacyAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { id: tech2Id },
    update: {},
    create: {
      id: tech2Id,
      email: "tech2@fia-it.de",
      passwordHash: passwordTech,
      fullName: "Marcel Koch",
      firstName: "Marcel",
      lastName: "Koch",
      role: "TECHNICIAN",
      phone: "+49 30 5550 0102",
      address: "Hauptstraße 12, 10115 Berlin",
      preferredLanguage: "DE",
      acceptedTermsAt: new Date(),
      acceptedPrivacyAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { id: customerId },
    update: {},
    create: {
      id: customerId,
      email: "customer@fia-it.de",
      passwordHash: passwordCustomer,
      fullName: "Sofia Reed",
      firstName: "Sofia",
      lastName: "Reed",
      role: "CUSTOMER",
      phone: "+49 30 5550 0201",
      address: "Lindenweg 8, 10115 Berlin",
      preferredLanguage: "EN",
      acceptedTermsAt: new Date(),
      acceptedPrivacyAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { id: businessId },
    update: {},
    create: {
      id: businessId,
      email: "business@fia-it.de",
      passwordHash: passwordCustomer,
      fullName: "Liam Fischer",
      firstName: "Liam",
      lastName: "Fischer",
      role: "CUSTOMER",
      phone: "+49 30 5550 0202",
      companyName: "Fischer Handwerk GmbH",
      address: "Werkstraße 4, 12043 Berlin",
      preferredLanguage: "DE",
      acceptedTermsAt: new Date(),
      acceptedPrivacyAt: new Date(),
    },
  });

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  const categoryIds: Record<string, string> = {};
  for (const category of categories) {
    const saved = await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryIds[category.slug] = saved.id;
  }

  const productIds: Record<string, string> = {};
  for (const product of products) {
    const { category, ...data } = product;
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...data, categoryId: categoryIds[category] },
      create: { ...data, categoryId: categoryIds[category] },
    });
    productIds[product.slug] = saved.id;
  }

  // Sample transactions are only created once.
  if ((await prisma.serviceRequest.count()) > 0) {
    console.log("Sample requests already exist, skipping transactions.");
    await prisma.$disconnect();
    return;
  }

  const networkService = await prisma.service.findUniqueOrThrow({
    where: { slug: "network-solutions" },
  });
  const serverService = await prisma.service.findUniqueOrThrow({
    where: { slug: "server-cloud" },
  });
  const cctvService = await prisma.service.findUniqueOrThrow({
    where: { slug: "cctv-surveillance" },
  });

  const request1 = await prisma.serviceRequest.create({
    data: {
      reference: "SR-2026-DEMO01",
      customerId,
      serviceId: networkService.id,
      assignedTechnicianId: techId,
      title: "New office network for 12 workstations",
      description:
        "We are moving into a new office and need a reliable Wi-Fi network, a small rack and cabling for 12 workstations.",
      siteAddress: "Lindenweg 8, 10115 Berlin",
      preferredDate: daysFromNow(10),
      budget: 4500,
      status: "SCHEDULED",
      contactName: "Sofia Reed",
      contactEmail: "customer@fia-it.de",
      contactPhone: "+49 30 5550 0201",
      consentAt: new Date(),
    },
  });

  const request2 = await prisma.serviceRequest.create({
    data: {
      reference: "SR-2026-DEMO02",
      customerId: businessId,
      serviceId: serverService.id,
      assignedTechnicianId: tech2Id,
      title: "Backup and NAS for workshop files",
      description:
        "Our workshop needs central file storage and a daily backup. About 1.5 TB of plans and photos, 8 employees.",
      siteAddress: "Werkstraße 4, 12043 Berlin",
      preferredDate: daysFromNow(4),
      budget: 2800,
      status: "IN_PROGRESS",
      contactName: "Liam Fischer",
      contactEmail: "business@fia-it.de",
      contactPhone: "+49 30 5550 0202",
      consentAt: new Date(),
    },
  });

  await prisma.serviceRequest.create({
    data: {
      reference: "SR-2026-DEMO03",
      customerId: businessId,
      serviceId: cctvService.id,
      title: "Camera system for the entrance area",
      description:
        "We would like two cameras at the entrance and a recorder. Please include a privacy notice sign for visitors.",
      siteAddress: "Werkstraße 4, 12043 Berlin",
      budget: 1600,
      status: "NEW",
      contactName: "Liam Fischer",
      contactEmail: "business@fia-it.de",
      consentAt: new Date(),
    },
  });

  const quoteItems1 = [
    { description: "UniFi 6 Pro access point", quantity: 3, unitPrice: 189 },
    { description: "Omada 8-port switch", quantity: 1, unitPrice: 89.9 },
    {
      description: "Installation, cabling and configuration",
      quantity: 8,
      unitPrice: 95,
    },
  ];
  const totals1 = calculateTotals(quoteItems1, 19);
  const quote1 = await prisma.quote.create({
    data: {
      reference: "Q-2026-DEMO01",
      requestId: request1.id,
      customerId,
      createdById: adminId,
      status: "SENT",
      validUntil: daysFromNow(14),
      sentAt: new Date(),
      notes: "Installation can start in the week after acceptance.",
      taxRate: 19,
      ...totals1,
      items: {
        create: quoteItems1.map((item) => ({
          ...item,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
  });

  const totals2 = calculateTotals([{ quantity: 1, unitPrice: 329 }], 19);
  const quote2 = await prisma.quote.create({
    data: {
      reference: "Q-2026-DEMO02",
      requestId: request2.id,
      customerId: businessId,
      createdById: adminId,
      status: "ACCEPTED",
      validUntil: daysFromNow(-2),
      acceptedAt: new Date(),
      taxRate: 19,
      ...totals2,
      items: {
        create: [
          {
            description: "Synology DS223 NAS with 2 x 4 TB disks",
            quantity: 1,
            unitPrice: 329,
            total: 329,
          },
        ],
      },
    },
  });

  const order1 = await prisma.order.create({
    data: {
      reference: "ORD-2026-DEMO01",
      customerId: businessId,
      quoteId: quote2.id,
      status: "PROCESSING",
      taxRate: 19,
      ...totals2,
      shippingAddress: "Werkstraße 4, 12043 Berlin",
      items: {
        create: [
          {
            productId: productIds["synology-ds223"],
            description: "Synology DS223 NAS with 2 x 4 TB disks",
            quantity: 1,
            unitPrice: 329,
            total: 329,
          },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "INV-2026-DEMO01",
      orderId: order1.id,
      customerId: businessId,
      amount: totals2.total,
      issuedAt: new Date(),
      dueAt: daysFromNow(14),
    },
  });

  const productOrderTotals = calculateTotals(
    [
      { quantity: 2, unitPrice: 6.9 },
      { quantity: 1, unitPrice: 49 },
    ],
    19,
  );
  const productOrder = await prisma.order.create({
    data: {
      reference: "ORD-2026-DEMO02",
      customerId,
      status: "CONFIRMED",
      taxRate: 19,
      ...productOrderTotals,
      shippingAddress: "Lindenweg 8, 10115 Berlin",
      items: {
        create: [
          {
            productId: productIds["cat6-patch-2m"],
            description: "Cat.6 Patch Cable 2 m",
            quantity: 2,
            unitPrice: 6.9,
            total: 13.8,
          },
          {
            productId: productIds["patch-panel-24"],
            description: "24-Port Patch Panel",
            quantity: 1,
            unitPrice: 49,
            total: 49,
          },
        ],
      },
    },
  });
  await prisma.invoice.create({
    data: {
      number: "INV-2026-DEMO02",
      orderId: productOrder.id,
      customerId,
      amount: productOrderTotals.total,
      issuedAt: new Date(),
      dueAt: daysFromNow(14),
    },
  });

  await prisma.appointment.createMany({
    data: [
      {
        customerId,
        technicianId: techId,
        requestId: request1.id,
        title: "Site visit: office network",
        startsAt: daysFromNow(2),
        endsAt: new Date(daysFromNow(2).getTime() + 2 * 60 * 60 * 1000),
        location: "Lindenweg 8, 10115 Berlin",
        status: "CONFIRMED",
        notes: "Please provide access to the server room.",
      },
      {
        customerId: businessId,
        technicianId: tech2Id,
        requestId: request2.id,
        title: "NAS installation",
        startsAt: daysFromNow(5),
        endsAt: new Date(daysFromNow(5).getTime() + 3 * 60 * 60 * 1000),
        location: "Werkstraße 4, 12043 Berlin",
        status: "SCHEDULED",
      },
    ],
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      reference: "TK-2026-DEMO01",
      customerId,
      requestId: request1.id,
      assignedTechnicianId: techId,
      subject: "Wi-Fi drops in the meeting room",
      description:
        "The Wi-Fi connection drops for a few seconds during video calls in the meeting room.",
      category: "Network",
      priority: "HIGH",
      status: "IN_PROGRESS",
      messages: {
        create: [
          {
            authorId: customerId,
            body: "The Wi-Fi drops for a few seconds during video calls. Can you check it?",
          },
          {
            authorId: techId,
            body: "Thanks for the details. I will check the channel settings and the access point placement.",
          },
        ],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      reference: "TK-2026-DEMO02",
      customerId: businessId,
      subject: "Invoice question for order ORD-2026-DEMO01",
      description:
        "Could you send the invoice again with our full company address? Thank you.",
      category: "Billing",
      priority: "LOW",
      status: "OPEN",
      messages: {
        create: [
          {
            authorId: businessId,
            body: "Could you send the invoice again with our full company address?",
          },
        ],
      },
    },
  });

  const report = await prisma.serviceReport.create({
    data: {
      requestId: request2.id,
      technicianId: tech2Id,
      title: "NAS installed and backup configured",
      workDone:
        "Installed the NAS, created the shared folders, configured daily backup to an external drive and tested a restore.",
      hours: 3.5,
      materials: "Synology DS223, 2 x 4 TB HDD, 1 x UPS",
      status: "APPROVED",
      submittedAt: new Date(),
      approvedAt: new Date(),
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      subject: "Question about the network quote",
      type: "SUPPORT",
      customerId,
      createdById: customerId,
      participants: { create: [{ userId: customerId }] },
      messages: {
        create: [
          {
            senderId: customerId,
            body: "Hi, is the installation date in the quote flexible?",
          },
          {
            senderId: adminId,
            body: "Hi Sofia, yes. We can move it by one week if that helps.",
          },
        ],
      },
    },
  });

  await prisma.conversation.create({
    data: {
      subject: "Internal: tooling for the new project",
      type: "DIRECT",
      createdById: adminId,
      participants: {
        create: [{ userId: adminId }, { userId: techId }],
      },
      messages: {
        create: [
          {
            senderId: adminId,
            body: "Please check the site plan before Friday.",
          },
          {
            senderId: techId,
            body: "Will do. I will add my notes to the request.",
          },
        ],
      },
    },
  });

  await prisma.contentPage.createMany({
    data: [
      {
        slug: "network-upgrade-signs",
        titleEn: "Five signs your office network needs an upgrade",
        titleDe: "Fünf Anzeichen, dass Ihr Büronetzwerk ein Upgrade braucht",
        excerptEn:
          "Slow Wi-Fi, dropped calls and mysterious outages are usually symptoms of an ageing network.",
        excerptDe:
          "Langsames WLAN, abgebrochene Anrufe und rätselhafte Ausfälle sind oft Symptome eines veralteten Netzwerks.",
        bodyEn:
          "<p>If your team spends more time reconnecting than working, the network deserves a closer look. Start with these five signs:</p><h2>1. Video calls freeze regularly</h2><p>Modern offices need stable Wi-Fi coverage, not just a fast router in one corner.</p><h2>2. Cables are everywhere</h2><p>Unlabelled cabling makes every change slower and more expensive.</p><h2>3. You cannot see who is on the network</h2><p>Guest devices, printers and cameras should be separated into VLANs.</p><h2>4. Backups share the same old switch</h2><p>Large backups can slow down everyday work.</p><h2>5. Small outages are becoming normal</h2><p>That is a warning sign. A short assessment often pays for itself.</p>",
        bodyDe:
          "<p>Wenn Ihr Team mehr Zeit mit dem Neuverbinden als mit der Arbeit verbringt, lohnt sich ein genauerer Blick. Diese fünf Anzeichen sind ein guter Anfang:</p><h2>1. Videokonferenzen frieren regelmäßig ein</h2><p>Moderne Büros brauchen eine stabile WLAN-Abdeckung, nicht nur einen schnellen Router in einer Ecke.</p><h2>2. Überall liegen Kabel</h2><p>Unbeschriftete Verkabelung macht jede Änderung langsamer und teurer.</p><h2>3. Sie wissen nicht, wer im Netzwerk ist</h2><p>Gastgeräte, Drucker und Kameras sollten in getrennten VLANs laufen.</p><h2>4. Backups nutzen denselben alten Switch</h2><p>Große Backups bremsen den Arbeitsalltag aus.</p><h2>5. Kleine Ausfälle werden normal</h2><p>Das ist ein Warnsignal. Eine kurze Bestandsaufnahme lohnt sich meistens.</p>",
        status: "PUBLISHED",
        authorId: adminId,
        publishedAt: new Date(),
      },
      {
        slug: "cybersecurity-checklist-small-business",
        titleEn: "A practical cybersecurity checklist for small businesses",
        titleDe:
          "Eine praktische Cybersecurity-Checkliste für kleine Unternehmen",
        excerptEn:
          "Six basic steps that protect most small teams without a big IT budget.",
        excerptDe:
          "Sechs grundlegende Schritte, die die meisten kleinen Teams ohne großes IT-Budget schützen.",
        bodyEn:
          "<p>Security does not have to start with an expensive platform. These basics cover most everyday risks.</p><ul><li>Use a password manager and unique passwords.</li><li>Turn on multi-factor authentication for email and Microsoft 365.</li><li>Keep operating systems and browsers updated.</li><li>Test your backup restore once per quarter.</li><li>Separate guest Wi-Fi from the office network.</li><li>Write down who can access what.</li></ul><p>Need help? We can review your setup in a short workshop.</p>",
        bodyDe:
          "<p>Sicherheit muss nicht mit einer teuren Plattform beginnen. Diese Grundlagen decken die meisten Alltagsrisiken ab.</p><ul><li>Passwortmanager und einzigartige Passwörter nutzen.</li><li>Zwei-Faktor-Authentifizierung für E-Mail und Microsoft 365 aktivieren.</li><li>Betriebssysteme und Browser aktuell halten.</li><li>Die Backup-Wiederherstellung einmal pro Quartal testen.</li><li>Gast-WLAN vom Büronetzwerk trennen.</li><li>Schriftlich festhalten, wer auf was zugreifen darf.</li></ul><p>Sie brauchen Unterstützung? Wir prüfen Ihre Einrichtung in einem kurzen Workshop.</p>",
        status: "PUBLISHED",
        authorId: adminId,
        publishedAt: new Date(),
      },
      {
        slug: "privacy-compliant-cctv",
        titleEn: "Privacy-compliant CCTV in Germany: the basics",
        titleDe:
          "Datenschutzkonforme Videoüberwachung in Deutschland: die Grundlagen",
        excerptEn:
          "Video surveillance is useful, but it needs a purpose, signage and a clear retention period.",
        excerptDe:
          "Videoüberwachung ist sinnvoll, braucht aber einen Zweck, Beschilderung und eine klare Speicherdauer.",
        bodyEn:
          "<p>Before installing cameras, define what you want to achieve. In Germany, video surveillance must be proportionate and transparent.</p><h2>What to prepare</h2><ul><li>A documented purpose and affected area.</li><li>Visible signs before the monitored area.</li><li>A retention period, usually a few days unless there is a reason for longer storage.</li><li>Access rules for recorded footage.</li><li>A data protection impact assessment for larger systems.</li></ul><p>This article is general information, not legal advice. Ask your data protection officer or a lawyer for your specific case.</p>",
        bodyDe:
          "<p>Bevor Kameras installiert werden, sollte klar sein, welches Ziel erreicht werden soll. In Deutschland muss Videoüberwachung verhältnismäßig und transparent sein.</p><h2>Was vorbereitet werden sollte</h2><ul><li>Dokumentierter Zweck und betroffener Bereich.</li><li>Sichtbare Hinweisschilder vor dem überwachten Bereich.</li><li>Eine Speicherdauer, meist wenige Tage, sofern kein Grund für längere Speicherung besteht.</li><li>Zugriffsregeln für Aufnahmen.</li><li>Eine Datenschutz-Folgenabschätzung bei größeren Anlagen.</li></ul><p>Dieser Artikel ist eine allgemeine Information und keine Rechtsberatung. Für den Einzelfall sollte die Datenschutzbeauftragte oder ein Anwalt gefragt werden.</p>",
        status: "PUBLISHED",
        authorId: adminId,
        publishedAt: new Date(),
      },
      {
        slug: "draft-microsoft-365-tips",
        titleEn: "Microsoft 365 tips for small teams (draft)",
        titleDe: "Microsoft-365-Tipps für kleine Teams (Entwurf)",
        bodyEn: "<p>Draft article for the CMS demonstration.</p>",
        bodyDe: "<p>Entwurfsartikel für die CMS-Demonstration.</p>",
        status: "DRAFT",
        authorId: adminId,
      },
    ],
  });

  await prisma.contactMessage.createMany({
    data: [
      {
        name: "Nina Brandt",
        email: "nina.brandt@example.com",
        phone: "+49 30 5550 0301",
        subject: "Cabling for a small studio",
        message:
          "We have a 60 m² studio and need clean network cabling for six desks. Could you send a rough estimate?",
        consentAt: new Date(),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: customerId,
        title: "Quote available",
        message: `${quote1.reference} is ready for review.`,
        link: `/portal/requests/${request1.id}`,
      },
      {
        userId: businessId,
        title: "Appointment confirmed",
        message: "NAS installation on site.",
        link: "/portal/appointments",
      },
      {
        userId: techId,
        title: "New task assigned",
        message: `${request1.reference}: New office network`,
        link: "/technician",
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        userId: adminId,
        action: "request.updated",
        description: "Assigned Jonas Weber to SR-2026-DEMO01",
        entityType: "ServiceRequest",
        entityId: request1.id,
      },
      {
        userId: customerId,
        action: "quote.viewed",
        description: "Viewed quote Q-2026-DEMO01",
        entityType: "Quote",
        entityId: quote1.id,
      },
      {
        userId: tech2Id,
        action: "report.submitted",
        description: "Submitted report for SR-2026-DEMO02",
        entityType: "ServiceReport",
        entityId: report.id,
      },
      {
        userId: adminId,
        action: "ticket.updated",
        description: `Replied to ${ticket1.reference}`,
        entityType: "Ticket",
        entityId: ticket1.id,
      },
      {
        userId: customerId,
        action: "chat.message",
        description: `Started chat "${conversation.subject}"`,
        entityType: "Conversation",
        entityId: conversation.id,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin:    admin@fia-it.de / Admin12345!");
  console.log("Tech:     tech@fia-it.de / Tech12345!");
  console.log("Customer: customer@fia-it.de / Customer12345!");
  console.log("Business: business@fia-it.de / Customer12345!");

  await prisma.$disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
