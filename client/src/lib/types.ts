// Shapes returned by the API. They match the Prisma models (dates become strings
// after JSON serialisation). Keeping them in one place makes the pages easier to read.

export type Role = "ADMIN" | "TECHNICIAN" | "CUSTOMER";
export type LanguageCode = "EN" | "DE";

export type User = {
  id: string;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  role: Role;
  phone?: string | null;
  companyName?: string | null;
  address?: string | null;
  preferredLanguage?: LanguageCode;
  acceptedTermsAt?: string | null;
  acceptedPrivacyAt?: string | null;
  createdAt?: string;
};

export type Service = {
  id: string;
  slug: string;
  nameEn: string;
  nameDe: string;
  descriptionEn: string;
  descriptionDe: string;
  icon: string;
  startingPrice: string | null;
  active: boolean;
  sortOrder: number;
};

export type ProductCategory = {
  id: string;
  slug: string;
  nameEn: string;
  nameDe: string;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  categoryId: string;
  nameEn: string;
  nameDe: string;
  descriptionEn: string;
  descriptionDe: string;
  price: string;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  featured: boolean;
  category?: ProductCategory;
};

export type QuoteItem = {
  id: string;
  productId?: string | null;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
};

export type Quote = {
  id: string;
  reference: string;
  requestId: string;
  customerId: string;
  status: string;
  validUntil: string;
  notes?: string | null;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  sentAt?: string | null;
  acceptedAt?: string | null;
  createdAt: string;
  items: QuoteItem[];
  order?: Order | null;
  customer?: User;
  request?: ServiceRequest | { id: string; reference: string; title: string; status: string };
};

export type ServiceRequest = {
  id: string;
  reference: string;
  customerId: string | null;
  serviceId: string | null;
  assignedTechnicianId: string | null;
  title: string;
  description: string;
  siteAddress?: string | null;
  preferredDate?: string | null;
  budget?: string | null;
  status: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
  service?: Service | null;
  customer?: User | null;
  technician?: User | null;
  quotes?: Quote[];
  appointments?: Appointment[];
  tickets?: Ticket[];
  reports?: ServiceReport[];
  _count?: { tickets: number; reports: number };
};

export type OrderItem = {
  id: string;
  productId?: string | null;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
};

export type Invoice = {
  id: string;
  number: string;
  orderId: string;
  customerId: string;
  status: string;
  amount: string;
  issuedAt: string;
  dueAt: string;
  paidAt?: string | null;
  order?: { reference: string; status: string };
};

export type Order = {
  id: string;
  reference: string;
  customerId: string;
  quoteId?: string | null;
  status: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  shippingAddress?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  invoice?: Invoice | null;
  quote?: Quote | null;
  customer?: User;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  authorId?: string | null;
  authorName?: string | null;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author?: User | null;
};

export type Ticket = {
  id: string;
  reference: string;
  customerId: string;
  requestId?: string | null;
  assignedTechnicianId?: string | null;
  subject: string;
  description: string;
  category?: string | null;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  technician?: User | null;
  request?: { id: string; reference: string; title: string } | null;
  messages?: TicketMessage[];
  _count?: { messages: number };
};

export type Appointment = {
  id: string;
  customerId: string;
  technicianId?: string | null;
  requestId?: string | null;
  title: string;
  notes?: string | null;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  status: string;
  customer?: User;
  technician?: User | null;
  request?: { id: string; reference: string; title: string } | null;
};

export type ServiceReport = {
  id: string;
  requestId?: string | null;
  ticketId?: string | null;
  technicianId: string;
  title: string;
  workDone: string;
  hours: string;
  materials?: string | null;
  fileUrl?: string | null;
  fileOriginalName?: string | null;
  status: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  technician?: User;
  request?: { id: string; reference: string; title: string } | null;
  ticket?: { id: string; reference: string; subject: string } | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId?: string | null;
  senderName?: string | null;
  body: string;
  createdAt: string;
  sender?: User | null;
};

export type Conversation = {
  id: string;
  subject: string;
  type: string;
  status: string;
  customerId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: User | null;
  participants?: { id: string; userId: string; user: User }[];
  messages: Message[];
};

export type ContentSummary = {
  id: string;
  slug: string;
  titleEn: string;
  titleDe: string;
  excerptEn?: string | null;
  excerptDe?: string | null;
  status: string;
  publishedAt?: string | null;
  updatedAt: string;
  author?: { fullName: string } | null;
};

export type ContentPage = ContentSummary & {
  bodyEn: string;
  bodyDe: string;
  excerptEn?: string | null;
  excerptDe?: string | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type Activity = {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  description: string;
  createdAt: string;
  user?: User | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export type AdminStats = {
  users: number;
  customers: number;
  technicians: number;
  openRequests: number;
  openTickets: number;
  orders: number;
  revenue: string | number;
  lowStock: number;
};

export type AdminDashboard = {
  stats: AdminStats;
  recentRequests: ServiceRequest[];
  recentTickets: Ticket[];
  recentActivity: Activity[];
};

export type ProfileResponse = {
  user: User & { acceptedTermsAt?: string; acceptedPrivacyAt?: string };
  counts: {
    requests: number;
    tickets: number;
    orders: number;
    unreadNotifications: number;
  };
};
