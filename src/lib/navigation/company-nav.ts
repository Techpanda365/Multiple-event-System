import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calculator,
  FolderKanban,
  ShoppingCart,
  CreditCard,
  Puzzle,
  Settings,
  Globe,
  UserCog,
  Shield,
  FileText,
  Download,
  Package,
  Warehouse,
  Repeat,
  Box,
  Handshake,
  ArrowLeftRight,
  FileSpreadsheet,
  DollarSign,
  PiggyBank,
  BookOpen,
  Scale,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Megaphone,
  PartyPopper,
  CheckSquare,
  Target,
  PhoneCall,
  Printer,
  Tag,
  Percent,
  PlusCircle,
  Bot,
  Sparkles,
  FilePlus,
  BarChart3,
  GraduationCap,
  ClipboardList,
  Search,
  Fingerprint,
  ShoppingBag,
  FormInput,
  Building2,
  Share2,
  MonitorPlay,
  BookMarked,
  Film,
  Waves,
  Building,
  Palette,
  Apple,
  Lock,
  Camera,
  Sun,
  Flame,
  Music,
  Paintbrush,
  SearchCheck,
  BedDouble,
  PrinterIcon,
  Laptop,
  RotateCcw,
  Wrench,
  Car,
  Tractor,
  Scale as LegalIcon,
  Plane,
  ShieldCheck,
  Truck,
  Newspaper,
  Home,
  HeartPulse,
  Droplets,
  ScanLine,
  Eye,
  FlaskConical,
  Pill,
  Gem,
  Sparkle,
  CalendarCheck,
  ParkingCircle,
  Coffee,
  PenTool,
  Ticket,
  WrenchIcon,
  Scissors,
  Utensils,
  Gift,
  Milk,
  Trash2,
  UsersRound,
  PackageOpen,
  Smartphone,
  CarFront,
  Hammer,
  FileCode,
  Image,
  Lightbulb,
  Shirt,
  Key,
  ChefHat,
  UserCheck,
  FileSignature,
  NewspaperIcon,
  Sheet,
  Sliders,
  Store,
  ShoppingBasket,
  MapPin,
  CalendarDays,
  Video,
  Bell,
  GitBranch,
  Table,
  Map,
  Rocket,
  Network,
  MapPinned,
  Phone,
  ListOrdered,
  Gamepad2,
  Clapperboard,
  Share,
  MessageCircle,
  Mail,
  Send,
  Inbox,
  Server,
  History,
  StickyNote,
  Shapes,
  ListTodo,
  Wallet,
  Monitor,
  BadgeCheck,
  ListChecks,
  Timer,
  Clock3,
  UserRound,
  Code,
  ImageIcon,
  Menu,
  Headphones,
  CreditCard as PlanIcon,
  BookOpenCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export interface NavSection {
  parent: NavItem;
  children: NavItem[];
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const MODULE_ORDER: string[] = [
  "Dashboard",
  "User Management",
  "Add-ons Manager",
  "Premium",
  "AI Agent",
  "Proposal",
  "Sales",
  "Activity Log",
  "sales-invoice", 
  "Purchase",
  "Product & Service",
  "Retainer",
  "Quotation",
  "Project",
  "Accounting",
  "Goal",
  "Budget Planner",
  "Double Entry",
  "HRM",
  "Performance",
  "Training",
  "Work Permit",
  "Recruitment",
  "Job Search",
  "Biometric Attendance",
  "Performance Indicator",
  "Procurement",
  "POS",
  "CRM",
  "Form Builder",
  "Assets",
  "Documents", // ✅ Yeh ek baar hai
  "Social Media Analytics",
  "Google Forms",
  "Google Slides",
  "WhatsApp Chat",
  "Instagram Chat",
  "Facebook Chat",
  "Facebook Post",
  "Instagram Post",
  "Zulip Chat",
  "YouTube",
  "Vcard",
  "LMS",
  "Ebook",
  "Movie & TV Studio",
  "Movie Show Booking",
  "Water Park",
  "Coworking Space",
  "Boutique & Studio",
  "Diet & Nutrition",
  "Security Guard",
  "Sports Club",
  "Garden Management",
  "Locker & Safe Deposit",
  "CCTV Security",
  "Events Management",
  "Solar Hub",
  "Franchise Management",
  "Yoga Classes",
  "Fire Safety",
  "DJ & Orchestra",
  "Art Showcase",
  "Audit Inspection",
  "Hotel & Room",
  "Print Press",
  "Freelancing Platform",
  "Rotas",
  "Commission",
  "CMMS",
  "Investment System",
  "Hair Care Studio",
  "Library Management",
  "School & Institutes",
  "Scholarship",
  "Dance Academy",
  "Music Institute",
  "Childcare",
  "Driving School",
  "Gym Management",
  "PetCare",
  "Bakery Store",
  "NGO Management",
  "Construction",
  "Tiffin Service",
  "Vehicle Wash",
  "Fleet",
  "Vehicle Trade",
  "Equipment Rental",
  "Vehicle Booking",
  "Car Dealership",
  "Agriculture",
  "Legal Case",
  "Tour & Travel",
  "Insurance",
  "Courier Management",
  "Freight",
  "Newspaper",
  "Property Management",
  "Elderly Care",
  "Hospital Management",
  "Blood Bank",
  "Radiology Management",
  "Optical & Eye Care",
  "Medical Lab",
  "Pharmacy",
  "Jewellery Store",
  "Beauty Spa",
  "Bookings",
  "Parking Management",
  "Facilities",
  "Beverage",
  "Tattoo Studio",
  "Support Ticket",
  "Garage Management",
  "Tailoring & Fashion",
  "Restaurant Menu",
  "Grant Management",
  "Dairy Cattle",
  "Waste Management",
  "Society Management",
  "Consignment",
  "Cleaning",
  "Mobile Service",
  "Vehicle Inspection",
  "Machine Repair",
  "Repair",
  "AI Document",
  "AI Images",
  "Consultancy",
  "Laundry Management",
  "Rental",
  "Catering",
  "Sales Agent",
  "SalesForce",
  "Contract",
  "Blog & Article",
  "Google Docs",
  "Custom Field",
  "Pipedrive",
  "WooCommerce",
  "Shopify",
  "Indiamart",
  "Sage",
  "Asana",
  "Warranty",
  "Inventory",
  "Requests",
  "Fix Equipment",
  "Hubspot",
  "Calendar",
  "Outlook Calendar",
  "Jitsi Meet",
  "Zoom Meetings",
  "Google Meetings",
  "Whereby Meetings",
  "Zoho Meeting",
  "Livestorm Meeting",
  "Meeting Hub",
  "Appointment",
  "Portfolio",
  "Resume Builder",
  "Reminder",
  "Custom Alert",
  "Workflow",
  "Spreadsheets",
  "Google Sheets",
  "Find Google Leads",
  "Innovation Center",
  "Business Process Mappings",
  "RoadMap Central",
  "Planning",
  "Internal Knowledge",
  "Call Hub",
  "Queue Management",
  "Game Zone",
  "Video Hub",
  "Photo Studio",
  "File Sharing",
  "Feedback",
  "Influencer Marketing",
  "Newsletter",
  "Click Send",
  "Bulk SMS",
  "MailBox",
  "Sendinblue",
  "Outlook Mail",
  "WHMCS",

  "OneNote",
  "Diagram",
  "Notes",
  "Team Workload",
  "Quiz Management",
  "Petty Cash",
  "Office Equipment",
  "Digital Certificate",
  "Microsoft To-Do",
  "Trello",
  "Jira",
  "To Do",
  "Time Tracker",
  "Timesheet",
  "Visitors",
  "Api Docs",
  "Media Library",
  "Side Menu Builder",
  "Messenger",
  "Help Desk",
  "Plan",
  "Settings",
  "Workdo Platform",
  "Documentation",
];

// export const MODULE_ORDER: string[] = [
//   "Dashboard",
//   "User Management",
//   "Add-ons Manager",
//   "Premium",
//   "AI Agent",
//   "Proposal",
//   "Sales",
//   "sales-invoice",
//   "Purchase",
//   "Product & Service",
//   "Retainer",
//   "Quotation",
//   "Project",
//   "Accounting",
//   "Goal",
//   "Budget Planner",
//   "Double Entry",
//   "HRM",
//   "Performance",
//   "Training",
//   "Work Permit",
//   "Recruitment",
//   "Job Search",
//   "Biometric Attendance",
//   "Performance Indicator",
//   "Procurement",
//   "POS",
//   "CRM",
//   "Form Builder",
//   "Assets",
//   "Documents",
//   "Social Media Analytics",
//   "Google Forms",
//   "Google Slides",
//   "WhatsApp Chat",
//   "Instagram Chat",
//   "Facebook Chat",
//   "Facebook Post",
//   "Instagram Post",
//   "Zulip Chat",
//   "YouTube",
//   "Vcard",
//   "LMS",
//   "Ebook",
//   "Movie & TV Studio",
//   "Movie Show Booking",
//   "Water Park",
//   "Coworking Space",
//   "Boutique & Studio",
//   "Diet & Nutrition",
//   "Security Guard",
//   "Sports Club",
//   "Garden Management",
//   "Locker & Safe Deposit",
//   "CCTV Security",
//   "Events Management",
//   "Solar Hub",
//   "Franchise Management",
//   "Yoga Classes",
//   "Fire Safety",
//   "DJ & Orchestra",
//   "Art Showcase",
//   "Audit Inspection",
//   "Hotel & Room",
//   "Print Press",
//   "Freelancing Platform",
//   "Rotas",
//   "Commission",
//   "CMMS",
//   "Investment System",
//   "Hair Care Studio",
//   "Library Management",
//   "School & Institutes",
//   "Scholarship",
//   "Dance Academy",
//   "Music Institute",
//   "Childcare",
//   "Driving School",
//   "Gym Management",
//   "PetCare",
//   "Bakery Store",
//   "NGO Management",
//   "Construction",
//   "Tiffin Service",
//   "Vehicle Wash",
//   "Fleet",
//   "Vehicle Trade",
//   "Equipment Rental",
//   "Vehicle Booking",
//   "Car Dealership",
//   "Agriculture",
//   "Legal Case",
//   "Tour & Travel",
//   "Insurance",
//   "Courier Management",
//   "Freight",
//   "Newspaper",
//   "Property Management",
//   "Elderly Care",
//   "Hospital Management",
//   "Blood Bank",
//   "Radiology Management",
//   "Optical & Eye Care",
//   "Medical Lab",
//   "Pharmacy",
//   "Jewellery Store",
//   "Beauty Spa",
//   "Bookings",
//   "Parking Management",
//   "Facilities",
//   "Beverage",
//   "Tattoo Studio",
//   "Support Ticket",
//   "Garage Management",
//   "Tailoring & Fashion",
//   "Restaurant Menu",
//   "Grant Management",
//   "Dairy Cattle",
//   "Waste Management",
//   "Society Management",
//   "Consignment",
//   "Cleaning",
//   "Mobile Service",
//   "Vehicle Inspection",
//   "Machine Repair",
//   "Repair",
//   "AI Document",
//   "AI Images",
//   "Consultancy",
//   "Laundry Management",
//   "Rental",
//   "Catering",
//   "Sales Agent",
//   "SalesForce",
//   "Contract",
//   "Blog & Article",
//   //
//   "Google Docs",
//   "Custom Field",
//   "Pipedrive",
//   "WooCommerce",
//   "Shopify",
//   "Indiamart",
//   "Sage",
//   "Asana",
//   "Warranty",
//   "Inventory",
//   "Requests",
//   "Fix Equipment",
//   "Hubspot",
//   "Calendar",
//   "Outlook Calendar",
//   "Jitsi Meet",
//   "Zoom Meetings",
//   "Google Meetings",
//   "Whereby Meetings",
//   "Zoho Meeting",
//   "Livestorm Meeting",
//   "Meeting Hub",
//   "Appointment",
//   "Portfolio",
//   "Resume Builder",
//   "Reminder",
//   "Custom Alert",
//   "Workflow",
//   "Spreadsheets",
//   "Google Sheets",
//   "Find Google Leads",
//   "Innovation Center",
//   "Business Process Mappings",
//   "RoadMap Central",
//   "Planning",
//   "Internal Knowledge",
//   "Call Hub",
//   "Queue Management",
//   "Game Zone",
//   "Video Hub",
//   "Photo Studio",
//   "File Sharing",
//   "Feedback",
//   "Influencer Marketing",
//   "Newsletter",
//   "Click Send",
//   "Bulk SMS",
//   "MailBox",
//   "Sendinblue",
//   "Outlook Mail",
//   "WHMCS",
//   "Activity Log",
//   "OneNote",
//   "Diagram",
//   "Notes",
//   "Team Workload",
//   "Quiz Management",
//   "Petty Cash",
//   "Office Equipment",
//   "Digital Certificate",
//   "Microsoft To-Do",
//   "Trello",
//   "Jira",
//   "To Do",
//   "Time Tracker",
//   "Timesheet",
//   "Visitors",
//   "Api Docs",
//   "Media Library",
//   "Side Menu Builder",
//   "Messenger",
//   "Helpdesk",
//   "Plan",
//   "Settings",
//   "Workdo Platform",
//   "Documentation",
// ];

const normalize = (title: string) => title.toLowerCase().trim();

const HREF_OVERRIDES: Record<string, string> = {
  dashboard: "/dashboard",
  "user management": "/dashboard/users",
  "add-ons manager": "/dashboard/addons",
  premium: "/dashboard/addons",
  "sales-invoice": "/dashboard/sales-invoice/invoices",
  // "sales-invoice": "/dashboard/sales/invoices",
  purchase: "/dashboard/purchase/invoices",
  "product & service": "/dashboard/products/items",
  retainer: "/dashboard/retainers/list",
  quotation: "/dashboard/quotations",
  project: "/dashboard/Project",
  "project/payments": "/dashboard/projects/payments",
  "projects/report": "/dashboard/projects/report",
  "projects/templates": "/dashboard/projects/templates",
  "projects/setup": "/dashboard/projects/setup",
  accounting: "/dashboard/accounting",
  "budget planner": "/dashboard/budget/periods",
  reminder: "/dashboard/reminder/create",
  "double entry": "/dashboard/accounting/ledger",
  hrm: "/dashboard/hrm",
  pos: "/dashboard/pos",
  crm: "/dashboard/crm",
  sales: "/dashboard/sales",
  settings: "/dashboard/settings",
  plan: "/dashboard/billing",
  "side menu builder": "/admin/side-menu-builder",
  "media library": "/admin/media-library",
  "workdo platform": "/admin/workdo-platform",
  "activity log": "/dashboard/activity-log",
  "help desk": "/dashboard/help-desk",
  timesheet: "/dashboard/timesheet",
  assets: "/dashboard/assets",
};

const MODULE_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  "user management": UserCog,
  "add-ons manager": Puzzle,
  premium: Sparkles,
  "ai agent": Bot,
  proposal: FilePlus,
  "sales-invoice": FileText,
  purchase: ShoppingCart,
  "product & service": Box,
  retainer: Handshake,
  quotation: FileSpreadsheet,
  project: FolderKanban,
  accounting: Calculator,
  goal: Target,
  "budget planner": PiggyBank,
  "double entry": BookOpen,
  hrm: Briefcase,
  performance: TrendingUp,
  training: GraduationCap,
  "work permit": ClipboardList,
  recruitment: UserCheck,
  "job search": Search,
  "biometric attendance": Fingerprint,
  "performance indicator": BarChart3,
  procurement: ShoppingBag,
  pos: ShoppingCart,
  crm: Target,
  "form builder": FormInput,
  assets: Building2,
  "social media analytics": Share2,
  sales: DollarSign,
  "google forms": FormInput,
  "google slides": FileText,
  "whatsapp chat": MessageCircle,
  "instagram chat": MessageCircle,
  "facebook chat": MessageCircle,
  "facebook post": Share2,
  "instagram post": Share2,
  "zulip chat": MessageSquare,
  youtube: MonitorPlay,
  vcard: CreditCard,
  lms: GraduationCap,
  ebook: BookMarked,
  "movie & tv studio": Film,
  "movie show booking": Ticket,
  "water park": Waves,
  "coworking space": Building,
  "boutique & studio": Palette,
  "diet & nutrition": Apple,
  "security guard": ShieldCheck,
  "sports club": Award,
  "garden management": Sun,
  "locker & safe deposit": Lock,
  "cctv security": Camera,
  "events management": PartyPopper,
  "solar hub": Sun,
  "franchise management": Building2,
  "yoga classes": HeartPulse,
  "fire safety": Flame,
  "dj & orchestra": Music,
  "art showcase": Paintbrush,
  "audit inspection": SearchCheck,
  "hotel & room": BedDouble,
  "print press": PrinterIcon,
  "freelancing platform": Laptop,
  rotas: RotateCcw,
  commission: Percent,
  cmms: Wrench,
  "investment system": TrendingUp,
  "hair care studio": Sparkle,
  "library management": BookOpen,
  "school & institutes": GraduationCap,
  scholarship: Award,
  "dance academy": Music,
  "music institute": Music,
  childcare: Users,
  "driving school": Car,
  "gym management": Award,
  petcare: HeartPulse,
  "bakery store": ChefHat,
  "ngo management": UsersRound,
  construction: Hammer,
  "tiffin service": Utensils,
  "vehicle wash": CarFront,
  fleet: Truck,
  "vehicle trade": Car,
  "equipment rental": PackageOpen,
  "vehicle booking": CalendarCheck,
  "car dealership": Car,
  agriculture: Tractor,
  "legal case": LegalIcon,
  "tour & travel": Plane,
  insurance: ShieldCheck,
  "courier management": Truck,
  freight: Truck,
  newspaper: Newspaper,
  "property management": Home,
  "elderly care": HeartPulse,
  "hospital management": HeartPulse,
  "blood bank": Droplets,
  "radiology management": ScanLine,
  "optical & eye care": Eye,
  "medical lab": FlaskConical,
  pharmacy: Pill,
  "jewellery store": Gem,
  "beauty spa": Sparkle,
  bookings: CalendarCheck,
  "parking management": ParkingCircle,
  facilities: Building,
  beverage: Coffee,
  "tattoo studio": PenTool,
  "support ticket": Ticket,
  "garage management": WrenchIcon,
  "tailoring & fashion": Scissors,
  "restaurant menu": Utensils,
  "grant management": Gift,
  "dairy cattle": Milk,
  "waste management": Trash2,
  "society management": UsersRound,
  consignment: PackageOpen,
  cleaning: Sparkle,
  "mobile service": Smartphone,
  "vehicle inspection": CarFront,
  "machine repair": Wrench,
  repair: Wrench,
  "ai document": FileCode,
  "ai images": Image,
  consultancy: Lightbulb,
  "laundry management": Shirt,
  rental: Key,
  catering: ChefHat,
  "sales agent": UserCheck,
  salesforce: Globe,
  contract: FileSignature,
  "blog & article": NewspaperIcon,
  documents: "/documents-list",
  "google docs": Sheet,
  "custom field": Sliders,
  pipedrive: Target,
  woocommerce: Store,
  shopify: ShoppingBasket,
  indiamart: MapPin,
  sage: Calculator,
  asana: CheckSquare,
  warranty: Shield,
  inventory: Package,
  requests: ClipboardList,
  "fix equipment": Wrench,
  hubspot: Target,
  calendar: Calendar,
  "outlook calendar": CalendarDays,
  "jitsi meet": Video,
  "zoom meetings": Video,
  "google meetings": Video,
  "whereby meetings": Video,
  "zoho meeting": Video,
  "livestorm meeting": Video,
  "meeting hub": Video,
  appointment: CalendarCheck,
  portfolio: Briefcase,
  "resume builder": FileText,
  reminder: Bell,
  "custom alert": AlertTriangle,
  workflow: GitBranch,
  spreadsheets: Table,
  "google sheets": Sheet,
  "find google leads": Search,
  "innovation center": Rocket,
  "business process mappings": Network,
  "roadmap central": MapPinned,
  planning: Calendar,
  "internal knowledge": BookOpen,
  "call hub": Phone,
  "queue management": ListOrdered,
  "game zone": Gamepad2,
  "video hub": Clapperboard,
  "photo studio": Camera,
  "file sharing": Share,
  feedback: MessageCircle,
  "influencer marketing": Share2,
  newsletter: Mail,
  "click send": Send,
  "bulk sms": MessageSquare,
  mailbox: Inbox,
  sendinblue: Send,
  "outlook mail": Mail,
  whmcs: Server,
  "activity log": History,
  onenote: StickyNote,
  diagram: Shapes,
  notes: StickyNote,
  "team workload": Users,
  "quiz management": ListChecks,
  "petty cash": Wallet,
  "office equipment": Monitor,
  "digital certificate": BadgeCheck,
  "microsoft to-do": ListTodo,
  trello: LayoutDashboard,
  jira: ListChecks,
  "to do": ListTodo,
  "time tracker": Timer,
  timesheet: Clock3,
  visitors: UserRound,
  "api docs": Code,
  "media library": ImageIcon,
  "side menu builder": Menu,
  messenger: MessageCircle,
  "help desk": Headphones,
  plan: PlanIcon,
  settings: Settings,
  "workdo platform": Globe,
  documentation: BookOpenCheck,
};

const MODULE_BADGES: Record<string, string> = {
  "ai agent": "New",
  premium: "Premium",
};

function getModuleIcon(title: string): LucideIcon {
  return MODULE_ICONS[normalize(title)] ?? Puzzle;
}

export function getModuleHref(title: string): string {
  const key = normalize(title);
  if (HREF_OVERRIDES[key]) return HREF_OVERRIDES[key];
  return `/dashboard/modules/${slugify(title)}`;
}

export function getModuleTitleFromSlug(slug: string): string | undefined {
  return MODULE_ORDER.find((t) => slugify(t) === slug);
}

// export function buildCompanyNav(): NavSection[] {
//   return MODULE_ORDER
//     .map((title) => {
//       const normalized = normalize(title);

//       // Skip entries that are children under other modules
//       if (normalized === "sales invoice") return null;

//       // User Management Dropdown
//       if (normalized === "user management") {
//         return {
//           parent: {
//             title: "User Management",
//             href: "/dashboard/users",
//             icon: UserCog,
//           },
//           children: [
//             {
//               title: "Users",
//               href: "/dashboard/users/list",
//               icon: Users,
//             },
//             {
//               title: "Roles",
//               href: "/dashboard/users/roles",
//               icon: Shield,
//             },
//           ],
//         };
//       }

//       if (normalized === "purchase") {
//         return {
//           parent: {
//             title: "Purchase",
//             href: "/dashboard/purchase",
//             icon: ShoppingCart,
//           },
//           children: [
//             {
//               title: "Purchase Invoice",
//               href: "/dashboard/purchase/invoices",
//               icon: FileText,
//             },
//             {
//               title: "Purchase Invoice Returns",
//               href: "/dashboard/purchase/returns",
//               icon: RotateCcw,
//             },
//             {
//               title: "Warehouse",
//               href: "/dashboard/purchase/warehouses",
//               icon: Warehouse,
//             },
//             {
//               title: "Transfers",
//               href: "/dashboard/purchase/transfers",
//               icon: ArrowLeftRight,
//             },
//           ],
//         };
//       }

//       if (normalized === "product & service") {
//         return {
//           parent: {
//             title: "Product & Service",
//             href: "/dashboard/products/items",
//             icon: Box,
//           },
//           children: [
//             {
//               title: "Items",
//               href: "/dashboard/products/items",
//               icon: Package,
//             },
//             {
//               title: "Stock",
//               href: "/dashboard/stock",
//               icon: Package,
//             },
//             {
//               title: "System Setup",
//               href: "/dashboard/products/setup",
//               icon: Settings,
//             },
//           ],
//         };
//       }

//       if (normalized === "retainer") {
//         return {
//           parent: {
//             title: "Retainer",
//             href: "/dashboard/retainers/list",
//             icon: Handshake,
//           },
//           children: [
//             {
//               title: "Retainer",
//               href: "/dashboard/retainers/list",
//               icon: FileText,
//             },
//             {
//               title: "Retainer Payments",
//               href: "/dashboard/retainers/payments",
//               icon: DollarSign,
//             },
//           ],
//         };
//       }

//       if (normalized === "sales") {
//         return {
//           parent: {
//             title: "Sales",
//             href: "/dashboard/sales",
//             icon: DollarSign,
//           },
//           children: [
//             {
//               title: "Sales Invoice",
//               href: "/dashboard/sales/invoices",
//               icon: FileText,
//             },
//             {
//               title: "Sales Invoice Returns",
//               href: "/dashboard/sales/returns",
//               icon: RotateCcw,
//             },
//           ],
//         };
//       }

//       if (normalized === "crm") {
//         return {
//           parent: {
//             title: "CRM",
//             href: "/dashboard/crm",
//             icon: Target,
//           },
//           children: [
//             {
//               title: "Leads",
//               href: "/dashboard/crm/leads",
//               icon: Target,
//             },
//             {
//               title: "Deals",
//               href: "/dashboard/crm/deals",
//               icon: DollarSign,
//             },
//             {
//               title: "System Setup",
//               href: "/dashboard/crm/setup",
//               icon: Settings,
//             },
//             {
//               title: "Reports",
//               href: "/dashboard/crm/reports",
//               icon: BarChart3,
//               children: [
//                 {
//                   title: "Lead Reports",
//                   href: "/dashboard/crm/reports/leads",
//                   icon: BarChart3,
//                 },
//                 {
//                   title: "Deal Reports",
//                   href: "/dashboard/crm/reports/deals",
//                   icon: BarChart3,
//                 },
//               ],
//             },
//           ],
//         };
//       }

//       return {
//         parent: {
//           title,
//           href: getModuleHref(title),
//           icon: getModuleIcon(title),
//           badge: MODULE_BADGES[normalized],
//         },
//         children: [],
//       };
//     })
//     .filter(Boolean) as NavSection[];
// }

// export function buildCompanyNav(): NavSection[] {
//   return MODULE_ORDER.map((title) => {
//     const normalized = normalize(title);

//     // Skip entries that are children under other modules
//     if (normalized === "sales invoice") return null;

//     // User Management Dropdown
//     if (normalized === "user management") {
//       return {
//         parent: {
//           title: "User Management",
//           href: "/dashboard/users",
//           icon: UserCog,
//         },
//         children: [
//           {
//             title: "Users",
//             href: "/dashboard/users/list",
//             icon: Users,
//           },
//           {
//             title: "Roles",
//             href: "/dashboard/users/roles",
//             icon: Shield,
//           },
//         ],
//       };
//     }

//     if (normalized === "purchase") {
//       return {
//         parent: {
//           title: "Purchase",
//           href: "/dashboard/purchase",
//           icon: ShoppingCart,
//         },
//         children: [
//           {
//             title: "Purchase Invoice",
//             href: "/dashboard/purchase/invoices",
//             icon: FileText,
//           },
//           {
//             title: "Purchase Invoice Returns",
//             href: "/dashboard/purchase/returns",
//             icon: RotateCcw,
//           },
//           {
//             title: "Warehouse",
//             href: "/dashboard/purchase/warehouses",
//             icon: Warehouse,
//           },
//           {
//             title: "Transfers",
//             href: "/dashboard/purchase/transfers",
//             icon: ArrowLeftRight,
//           },
//         ],
//       };
//     }

//     if (normalized === "product & service") {
//       return {
//         parent: {
//           title: "Product & Service",
//           href: "/dashboard/products/items",
//           icon: Box,
//         },
//         children: [
//           {
//             title: "Items",
//             href: "/dashboard/products/items",
//             icon: Package,
//           },
//           {
//             title: "Stock",
//             href: "/dashboard/stock",
//             icon: Package,
//           },
//           {
//             title: "System Setup",
//             href: "/dashboard/products/setup",
//             icon: Settings,
//           },
//         ],
//       };
//     }

//     if (normalized === "retainer") {
//       return {
//         parent: {
//           title: "Retainer",
//           href: "/dashboard/retainers/list",
//           icon: Handshake,
//         },
//         children: [
//           {
//             title: "Retainer",
//             href: "/dashboard/retainers/list",
//             icon: FileText,
//           },
//           {
//             title: "Retainer Payments",
//             href: "/dashboard/retainers/payments",
//             icon: DollarSign,
//           },
//         ],
//       };
//     }

//     if (normalized === "hrm") {
//       return {
//         parent: {
//           title: "HRM",
//           href: "/dashboard/hrm",
//           icon: Briefcase,
//         },
//         children: [
//           {
//             title: "Employees",
//             href: "/dashboard/hrm/employees",
//             icon: Users,
//           },

//           {
//             title: "Payslip",
//             href: "/dashboard/hrm/payslip",
//             icon: DollarSign,
//             children: [
//               {
//                 title: "Set Salary",
//                 href: "/dashboard/hrm/set-salary",
//                 icon: DollarSign,
//               },
//               {
//                 title: "Payroll",
//                 href: "/dashboard/hrm/payroll",
//                 icon: FileSpreadsheet,
//               },
//             ],
//           },

//           {
//             title: "Attendance",
//             href: "/dashboard/hrm/attendance",
//             icon: Clock,
//             children: [
//               {
//                 title: "Shifts",
//                 href: "/dashboard/hrm/shifts",
//                 icon: Calendar,
//               },
//               {
//                 title: "Attendances",
//                 href: "/dashboard/hrm/attendance",
//                 icon: Clock,
//               },
//             ],
//           },

//           {
//             title: "Leave Management",
//             href: "/dashboard/hrm/leave-management",
//             icon: CalendarCheck,
//             children: [
//               {
//                 title: "Leave Types",
//                 href: "/dashboard/hrm/leave/types",
//                 icon: Tag,
//               },
//               {
//                 title: "Leave Applications",
//                 href: "/dashboard/hrm/leave/applications",
//                 icon: FileText,
//               },
//               {
//                 title: "Leave Balance",
//                 href: "/dashboard/hrm/leave/balance",
//                 icon: Calculator,
//               },
//             ],
//           },

//           {
//             title: "Holidays",
//             href: "/dashboard/hrm/holidays",
//             icon: CalendarDays,
//           },
//           {
//             title: "Awards",
//             href: "/dashboard/hrm/awards",
//             icon: Award,
//           },
//           {
//             title: "Promotions",
//             href: "/dashboard/hrm/promotions",
//             icon: TrendingUp,
//           },
//           {
//             title: "Resignations",
//             href: "/dashboard/hrm/resignations",
//             icon: ArrowLeftRight,
//           },
//           {
//             title: "Terminations",
//             href: "/dashboard/hrm/terminations",
//             icon: AlertTriangle,
//           },
//           {
//             title: "Warnings",
//             href: "/dashboard/hrm/warnings",
//             icon: AlertTriangle,
//           },
//           {
//             title: "Complaints",
//             href: "/dashboard/hrm/complaints",
//             icon: MessageSquare,
//           },
//           {
//             title: "Transfers",
//             href: "/dashboard/hrm/transfers",
//             icon: ArrowLeftRight,
//           },
//           {
//             title: "Documents",
//             href: "/dashboard/hrm/documents",
//             icon: FileText,
//           },
//           {
//             title: "Acknowledgments",
//             href: "/dashboard/hrm/acknowledgments",
//             icon: CheckSquare,
//           },
//           {
//             title: "Announcements",
//             href: "/dashboard/hrm/announcements",
//             icon: Megaphone,
//           },
//           {
//             title: "Events",
//             href: "/dashboard/hrm/events",
//             icon: PartyPopper,
//           },
//           {
//             title: "Company Policies",
//             href: "/dashboard/hrm/company-policies",
//             icon: BookOpen,
//           },
//           {
//             title: "System Setup",
//             href: "/dashboard/hrm/setup",
//             icon: Settings,
//           },
//         ],
//       };
//     }

//     if (normalized === "work permit") {
//       return {
//         parent: {
//           title: "Work Permit",
//           href: "/dashboard/work-permit",
//           icon: ClipboardList,
//         },
//         children: [
//           {
//             title: "Permit Types",
//             href: "/dashboard/work-permit/permit-types",
//             icon: Tag,
//           },
//           {
//             title: "Contractors",
//             href: "/dashboard/work-permit/contractors",
//             icon: Users,
//           },
//           {
//             title: "Work Permits",
//             href: "/dashboard/work-permit/permits",
//             icon: FileText,
//           },
//           {
//             title: "Reports",
//             href: "/dashboard/work-permit/reports",
//             icon: BarChart3,
//           },
//         ],
//       };
//     }

//     if (normalized === "sales-invoice") {
//       return {
//         parent: {
//           title: "Sales Invoice",
//           href: "/dashboard/sales-invoice",
//           icon: DollarSign,
//         },
//         children: [
//           {
//             title: "Sales Invoice",
//             href: "/dashboard/sales-invoice/invoices",
//             icon: FileText,
//           },
//           {
//             title: "Sales Invoice Returns",
//             href: "/dashboard/sales-invoice/returns",
//             icon: RotateCcw,
//           },
//         ],
//       };
//     }

//     // ✅ POS - Updated with Reports dropdown
//     if (normalized === "pos") {
//       return {
//         parent: {
//           title: "POS",
//           href: "/dashboard/pos",
//           icon: ShoppingCart,
//         },
//         children: [
//           {
//             title: "Add POS",
//             href: "/dashboard/pos/add",
//             icon: PlusCircle,
//           },
//           {
//             title: "POS Orders",
//             href: "/dashboard/pos/orders",
//             icon: ShoppingCart,
//           },
//           {
//             title: "POS Returns",
//             href: "/dashboard/pos/returns",
//             icon: RotateCcw,
//           },
//           {
//             title: "Print Barcode",
//             href: "/dashboard/pos/barcode",
//             icon: Printer,
//           },
//           {
//             title: "Billing Counters",
//             href: "/dashboard/pos/counters",
//             icon: Calculator,
//           },
//           {
//             title: "Discounts",
//             href: "/dashboard/pos/discounts",
//             icon: Percent,
//           },
//           {
//             title: "Reports",
//             href: "/dashboard/pos/reports",
//             icon: BarChart3,
//             children: [
//               {
//                 title: "Sales Report",
//                 href: "/dashboard/pos/reports/sales",
//                 icon: TrendingUp,
//               },
//               {
//                 title: "Product Report",
//                 href: "/dashboard/pos/reports/products",
//                 icon: Package,
//               },
//               {
//                 title: "Customer Report",
//                 href: "/dashboard/pos/reports/customers",
//                 icon: Users,
//               },
//             ],
//           },
//         ],
//       };
//     }

//     if (normalized === "crm") {
//       return {
//         parent: {
//           title: "CRM",
//           href: "/dashboard/crm",
//           icon: Target,
//         },
//         children: [
//           {
//             title: "Leads",
//             href: "/dashboard/crm/leads",
//             icon: Target,
//           },
//           {
//             title: "Deals",
//             href: "/dashboard/crm/deals",
//             icon: DollarSign,
//           },
//           {
//             title: "System Setup",
//             href: "/dashboard/crm/setup",
//             icon: Settings,
//           },
//           {
//             title: "Reports",
//             href: "/dashboard/crm/reports",
//             icon: BarChart3,
//             children: [
//               {
//                 title: "Lead Reports",
//                 href: "/dashboard/crm/reports/leads",
//                 icon: BarChart3,
//               },
//               {
//                 title: "Deal Reports",
//                 href: "/dashboard/crm/reports/deals",
//                 icon: BarChart3,
//               },
//             ],
//           },
//         ],
//       };
//     }

//     return {
//       parent: {
//         title,
//         href: getModuleHref(title),
//         icon: getModuleIcon(title),
//         badge: MODULE_BADGES[normalized],
//       },
//       children: [],
//     };
//   }).filter(Boolean) as NavSection[];
// }

export function buildCompanyNav(): NavSection[] {
  return MODULE_ORDER.map((title) => {
    const normalized = normalize(title);

    // User Management Dropdown
    if (normalized === "user management") {
      return {
        parent: {
          title: "User Management",
          href: "/dashboard/users",
          icon: UserCog,
        },
        children: [
          { title: "Users", href: "/dashboard/users/list", icon: Users },
          { title: "Roles", href: "/dashboard/users/roles", icon: Shield },
        ],
      };
    }

    // ✅ ASSETS - With Sub-Modules
    if (normalized === "assets") {
      return {
        parent: {
          title: "Assets",
          href: "/dashboard/assets",
          icon: Package,
        },
        children: [
          {
            title: "Assets",
            href: "/dashboard/assets",
            icon: Package,
          },
          {
            title: "Assignments",
            href: "/dashboard/assets/assignments",
            icon: ClipboardList,
          },
          {
            title: "Locations",
            href: "/dashboard/assets/locations",
            icon: MapPin,
          },
          {
            title: "Maintenance",
            href: "/dashboard/assets/maintenance",
            icon: Wrench,
          },
          {
            title: "Depreciation",
            href: "/dashboard/assets/depreciation",
            icon: TrendingDown,
          },
          {
            title: "Category",
            href: "/dashboard/assets/category",
            icon: Tag,
          },
          {
            title: "Borrow & Rent",
            href: "/dashboard/assets/borrow-rent",
            icon: Handshake,
            children: [
              {
                title: "Borrow & Rent",
                href: "/dashboard/assets/borrow-rent",
                icon: Handshake,
              },
              {
                title: "Payment",
                href: "/dashboard/assets/borrow-rent/payment",
                icon: DollarSign,
              },
            ],
          },
          {
            title: "Report",
            href: "/dashboard/assets/report",
            icon: BarChart3,
          },
        ],
      };
    }

    // Purchase Dropdown
    if (normalized === "purchase") {
      return {
        parent: {
          title: "Purchase",
          href: "/dashboard/purchase",
          icon: ShoppingCart,
        },
        children: [
          {
            title: "Purchase Invoice",
            href: "/dashboard/purchase/invoices",
            icon: FileText,
          },
          {
            title: "Purchase Invoice Returns",
            href: "/dashboard/purchase/returns",
            icon: RotateCcw,
          },
          {
            title: "Vendors",
            href: "/dashboard/purchase/vendors",
            icon: Users,
          },
          {
            title: "Warehouse",
            href: "/dashboard/purchase/warehouses",
            icon: Warehouse,
          },
          {
            title: "Transfers",
            href: "/dashboard/purchase/transfers",
            icon: ArrowLeftRight,
          },
        ],
      };
    }

    // Product & Service Dropdown
    if (normalized === "product & service") {
      return {
        parent: {
          title: "Product & Service",
          href: "/dashboard/products/items",
          icon: Box,
        },
        children: [
          { title: "Items", href: "/dashboard/products/items", icon: Package },
          { title: "Stock", href: "/dashboard/stock", icon: Package },
          {
            title: "System Setup",
            href: "/dashboard/products/setup",
            icon: Settings,
          },
        ],
      };
    }

    // Retainer Dropdown
    if (normalized === "retainer") {
      return {
        parent: {
          title: "Retainer",
          href: "/dashboard/retainers/list",
          icon: Handshake,
        },
        children: [
          {
            title: "Retainer",
            href: "/dashboard/retainers/list",
            icon: FileText,
          },
          {
            title: "Retainer Payments",
            href: "/dashboard/retainers/payments",
            icon: DollarSign,
          },
        ],
      };
    }

    // ✅ SALES - CRM Modules (Accounts, Contacts, Opportunities, etc.)
    // ✅ SALES - CRM Modules with correct hrefs
    if (normalized === "sales") {
      return {
        parent: {
          title: "Sales",
          href: "/dashboard/sales",
          icon: DollarSign,
        },
        children: [
          // ✅ All hrefs point to /dashboard/sales/
          {
            title: "Accounts",
            href: "/dashboard/Sales/accounts",
            icon: Building2,
          },
          { title: "Contacts", href: "/dashboard/Sales/contacts", icon: Users },
          {
            title: "Opportunities",
            href: "/dashboard/Sales/opportunities",
            icon: TrendingUp,
          },
          { title: "Quotes", href: "/dashboard/Sales/quotes", icon: FileText },
          {
            title: "Sales Orders",
            href: "/dashboard/Sales/sales-orders",
            icon: ShoppingCart,
          },
          {
            title: "Cases",
            href: "/dashboard/Sales/cases",
            icon: AlertTriangle,
          },
          { title: "Calls", href: "/dashboard/Sales/calls", icon: PhoneCall },
          {
            title: "Meetings",
            href: "/dashboard/Sales/meetings",
            icon: Calendar,
          },
          {
            title: "Documents",
            href: "/dashboard/Sales/documents",
            icon: FileText,
          },
          { title: "Streams", href: "/dashboard/Sales/streams", icon: Share2 },
          {
            title: "Reports",
            href: "/dashboard/Sales/reports",
            icon: BarChart3,
            children: [
              {
                title: "Quote Reports",
                href: "/dashboard/Sales/reports/quotes",
                icon: FileText,
              },
              {
                title: "Sales Order Reports",
                href: "/dashboard/Sales/reports/sales-orders",
                icon: ShoppingCart,
              },
              {
                title: "Opportunity Reports",
                href: "/dashboard/Sales/reports/opportunities",
                icon: TrendingUp,
              },
            ],
          },
          {
            title: "System Setup",
            href: "/dashboard/S  ales/setup",
            icon: Settings,
          },
        ],
      };
    }

    if (normalized === "workflow") {
      return {
        parent: {
          title: "Workflow",
          href: "/dashboard/workflow",
          icon: GitBranch,
        },
        children: [],
        // {
        //   title: "Create Workflow",
        //   href: "/dashboard/workflow/create",
        //   icon: PlusCircle
        // },
      };
    }

    // ✅ PROJECT - With Sub-Modules
    if (normalized === "project") {
      return {
        parent: {
          title: "Project",
          href: "/dashboard/projects",
          icon: FolderKanban,
        },
        children: [
          {
            title: "Projects",
            href: "/dashboard/projects",
            icon: FolderKanban,
          },
          {
            title: "Project Payments",
            href: "/dashboard/projects/payments",
            icon: DollarSign,
          },
          {
            title: "Projects Report",
            href: "/dashboard/projects/report",
            icon: BarChart3,
          },
          {
            title: "Project Templates",
            href: "/dashboard/projects/templates",
            icon: FileText,
          },
          {
            title: "System Setup",
            href: "/dashboard/projects/setup",
            icon: Settings,
          },
        ],
      };
    }

    // ✅ SALES INVOICE - Alag se (Sales Invoice + Returns)
    // Yeh part sahi hai
    if (normalized === "sales-invoice" || normalized === "sales invoice") {
      return {
        parent: {
          title: "Sales Invoice",
          href: "/dashboard/sales-invoice/invoices",
          icon: FileText,
        },
        children: [
          {
            title: "Sales Invoice",
            href: "/dashboard/sales-invoice/invoices",
            icon: FileText,
          },
          {
            title: "Sales Invoice Returns",
            href: "/dashboard/sales-invoice/returns",
            icon: RotateCcw,
          },
        ],
      };
    }
    if (normalized === "accounting") {
      return {
        parent: {
          title: "Accounting",
          href: "/dashboard/accounting",
          icon: Calculator,
        },
        children: [
          // Customers & Vendors
          {
            title: "Customers",
            href: "/dashboard/accounting/customers",
            icon: Users,
          },
          {
            title: "Vendors",
            href: "/dashboard/accounting/vendors",
            icon: UsersRound,
          },

          // Banking Section
          {
            title: "Banking",
            href: "/dashboard/accounting/banking",
            icon: Building2,
            children: [
              {
                title: "Bank Accounts",
                href: "/dashboard/accounting/banking/accounts",
                icon: CreditCard,
              },
              {
                title: "Bank Transactions",
                href: "/dashboard/accounting/banking/transactions",
                icon: ArrowLeftRight,
              },
              {
                title: "Bank Transfers",
                href: "/dashboard/accounting/banking/transfers",
                icon: Repeat,
              },
              {
                title: "Plaid Transaction",
                href: "/dashboard/accounting/banking/plaid",
                icon: Scale,
              },
            ],
          },

          // Chart of Accounts
          {
            title: "Chart Of Accounts",
            href: "/dashboard/accounting/chart-of-accounts",
            icon: BookOpen,
          },

          // Payments
          {
            title: "Vendor Payments",
            href: "/dashboard/accounting/vendor-payments",
            icon: DollarSign,
          },
          {
            title: "Customer Payments",
            href: "/dashboard/accounting/customer-payments",
            icon: Handshake,
          },

          // Revenue & Expense
          {
            title: "Revenue",
            href: "/dashboard/accounting/revenue",
            icon: TrendingUp,
          },
          {
            title: "Expense",
            href: "/dashboard/accounting/expense",
            icon: TrendingDown,
          },

          // Debit & Credit Notes
          {
            title: "Debit Notes",
            href: "/dashboard/accounting/debit-notes",
            icon: FileText,
          },
          {
            title: "Credit Notes",
            href: "/dashboard/accounting/credit-notes",
            icon: FileSpreadsheet,
          },

          // Reports
          {
            title: "Reports",
            href: "/dashboard/accounting/reports",
            icon: BarChart3,
            // children: [
            //   {
            //     title: "Trial Balance",
            //     href: "/dashboard/accounting/reports/trial-balance",
            //     icon: Scale
            //   },
            //   {
            //     title: "Profit & Loss",
            //     href: "/dashboard/accounting/reports/profit-loss",
            //     icon: TrendingUp
            //   },
            //   {
            //     title: "Balance Sheet",
            //     href: "/dashboard/accounting/reports/balance-sheet",
            //     icon: LayoutDashboard
            //   },
            //   {
            //     title: "Cash Flow",
            //     href: "/dashboard/accounting/reports/cash-flow",
            //     icon: DollarSign
            //   },
            //   {
            //     title: "General Ledger",
            //     href: "/dashboard/accounting/reports/general-ledger",
            //     icon: BookOpen
            //   },
            //   {
            //     title: "Aged Receivables",
            //     href: "/dashboard/accounting/reports/aged-receivables",
            //     icon: Clock
            //   },
            //   {
            //     title: "Aged Payables",
            //     href: "/dashboard/accounting/reports/aged-payables",
            //     icon: Clock3
            //   },
            // ],
          },

          // System Setup
          {
            title: "System Setup",
            href: "/dashboard/accounting/setup",
            icon: Settings,
          },
        ],
      };
    }
    if (normalized === "double entry") {
      return {
        parent: {
          title: "Double Entry",
          href: "/dashboard/doubleentry",
          icon: BookOpen,
        },
        children: [
          {
            title: "Ledger Summary",
            href: "/dashboard/doubleentry/summary",
            icon: BookOpen,
          },
          {
            title: "Trial Balance",
            href: "/dashboard/doubleentry/trial-balance",
            icon: Scale,
          },
          {
            title: "Balance Sheets",
            href: "/dashboard/doubleentry/balance-sheets",
            icon: Building2,
          },
          {
            title: "Profit & Loss",
            href: "/dashboard/doubleentry/profit-loss",
            icon: TrendingUp,
          },
          {
            title: "Reports",
            href: "/dashboard/doubleentry/reports",
            icon: BarChart3,
          },
        ],
      };
    }

    // ✅ DOCUMENTS - Alag se module (Accounting ke under nahi)
    if (normalized === "documents") {
      return {
        parent: {
          title: "Documents",
          href: "/documents-list",
          icon: FileText,
        },
        children: [], // No sub-children
      };
    }

    // In buildCompanyNav() function
    if (normalized === "reminder") {
      return {
        parent: {
          title: "Reminder",
          href: "/dashboard/reminder/create", // Direct create page
          icon: Bell,
        },
        children: [], // No sub-children
      };
    }

    // In buildCompanyNav() function
    if (normalized === "timesheet") {
      return {
        parent: {
          title: "Timesheet",
          href: "/dashboard/timesheet",
          icon: Clock3,
        },
        children: [], // No sub-children
      };
    }

    // In your buildCompanyNav() function - Inventory section
    if (normalized === "inventory") {
      return {
        parent: {
          title: "Inventory",
          href: "/dashboard/inventory",
          icon: Package,
        },
        children: [
          {
            title: "Items",
            href: "/dashboard/inventory/Items",
            icon: Box,
          },
          {
            title: "Adjustments",
            href: "/dashboard/inventory/Adjustments",
            icon: ArrowLeftRight,
          },
          {
            title: "Reports",
            href: "/dashboard/inventory/Reports",
            icon: BarChart3,
            children: [
              {
                title: "Stock Valuation Report",
                href: "/dashboard/inventory/Reports/stock-valuation",
                icon: DollarSign,
              },
              {
                title: "COGS Report",
                href: "/dashboard/inventory/Reports/cogs",
                icon: TrendingUp,
              },
              {
                title: "Stock Movement Report",
                href: "/dashboard/inventory/Reports/stock-movement",
                icon: ArrowLeftRight,
              },
            ],
          },
        ],
      };
    }
    // HRM Dropdown
    if (normalized === "hrm") {
      return {
        parent: {
          title: "HRM",
          href: "/dashboard/hrm",
          icon: Briefcase,
        },
        children: [
          { title: "Employees", href: "/dashboard/hrm/employees", icon: Users },
          {
            title: "Payslip",
            href: "/dashboard/hrm/payslip",
            icon: DollarSign,
            children: [
              {
                title: "Set Salary",
                href: "/dashboard/hrm/set-salary",
                icon: DollarSign,
              },
              {
                title: "Payroll",
                href: "/dashboard/hrm/payroll",
                icon: FileSpreadsheet,
              },
            ],
          },
          {
            title: "Attendance",
            href: "/dashboard/hrm/attendance",
            icon: Clock,
            children: [
              {
                title: "Shifts",
                href: "/dashboard/hrm/shifts",
                icon: Calendar,
              },
              {
                title: "Attendances",
                href: "/dashboard/hrm/attendance",
                icon: Clock,
              },
            ],
          },
          {
            title: "Leave Management",
            href: "/dashboard/hrm/leave-management",
            icon: CalendarCheck,
            children: [
              {
                title: "Leave Types",
                href: "/dashboard/hrm/leave/types",
                icon: Tag,
              },
              {
                title: "Leave Applications",
                href: "/dashboard/hrm/leave/applications",
                icon: FileText,
              },
              {
                title: "Leave Balance",
                href: "/dashboard/hrm/leave/balance",
                icon: Calculator,
              },
            ],
          },
          {
            title: "Holidays",
            href: "/dashboard/hrm/holidays",
            icon: CalendarDays,
          },
          { title: "Awards", href: "/dashboard/hrm/awards", icon: Award },
          {
            title: "Promotions",
            href: "/dashboard/hrm/promotions",
            icon: TrendingUp,
          },
          {
            title: "Resignations",
            href: "/dashboard/hrm/resignations",
            icon: ArrowLeftRight,
          },
          {
            title: "Terminations",
            href: "/dashboard/hrm/terminations",
            icon: AlertTriangle,
          },
          {
            title: "Warnings",
            href: "/dashboard/hrm/warnings",
            icon: AlertTriangle,
          },
          {
            title: "Complaints",
            href: "/dashboard/hrm/complaints",
            icon: MessageSquare,
          },
          {
            title: "Transfers",
            href: "/dashboard/hrm/transfers",
            icon: ArrowLeftRight,
          },
          {
            title: "Documents",
            href: "/dashboard/hrm/documents",
            icon: FileText,
          },
          {
            title: "Acknowledgments",
            href: "/dashboard/hrm/acknowledgments",
            icon: CheckSquare,
          },
          {
            title: "Announcements",
            href: "/dashboard/hrm/announcements",
            icon: Megaphone,
          },
          { title: "Events", href: "/dashboard/hrm/events", icon: PartyPopper },
          {
            title: "Company Policies",
            href: "/dashboard/hrm/company-policies",
            icon: BookOpen,
          },
          {
            title: "System Setup",
            href: "/dashboard/hrm/setup",
            icon: Settings,
          },
        ],
      };
    }
    // In buildCompanyNav() function
    if (normalized === "activity log") {
      return {
        parent: {
          title: "Activity Log",
          href: "/dashboard/activity-log",
          icon: History,
        },
        children: [], // No sub-children
      };
    }

    // Work Permit Dropdown
    if (normalized === "work permit") {
      return {
        parent: {
          title: "Work Permit",
          href: "/dashboard/work-permit",
          icon: ClipboardList,
        },
        children: [
          {
            title: "Permit Types",
            href: "/dashboard/work-permit/permit-types",
            icon: Tag,
          },
          {
            title: "Contractors",
            href: "/dashboard/work-permit/contractors",
            icon: Users,
          },
          {
            title: "Work Permits",
            href: "/dashboard/work-permit/permits",
            icon: FileText,
          },
          {
            title: "Reports",
            href: "/dashboard/work-permit/reports",
            icon: BarChart3,
          },
        ],
      };
    }

    if (normalized === "media library") {
      return {
        parent: {
          title: "Media Library",
          href: "/dashboard/media-library",
          icon: ImageIcon,
        },
        children: [],
      };
    }

    // ✅ HELP DESK - Corrected
    if (normalized === "help desk")
      return {
        parent: {
          title: "HelpDesk",
          href: "/dashboard/help-desk",
          icon: Headphones,
          badge: "New",
        },
        children: [],
      };

    // POS Dropdown
    if (normalized === "pos") {
      return {
        parent: {
          title: "POS",
          href: "/dashboard/pos",
          icon: ShoppingCart,
        },
        children: [
          { title: "Add POS", href: "/dashboard/pos/add", icon: PlusCircle },
          {
            title: "POS Orders",
            href: "/dashboard/pos/orders",
            icon: ShoppingCart,
          },
          {
            title: "POS Returns",
            href: "/dashboard/pos/returns",
            icon: RotateCcw,
          },
          {
            title: "Print Barcode",
            href: "/dashboard/pos/barcode",
            icon: Printer,
          },
          {
            title: "Billing Counters",
            href: "/dashboard/pos/counters",
            icon: Calculator,
          },
          {
            title: "Discounts",
            href: "/dashboard/pos/discounts",
            icon: Percent,
          },
          {
            title: "Reports",
            href: "/dashboard/pos/reports",
            icon: BarChart3,
            children: [
              {
                title: "Sales Report",
                href: "/dashboard/pos/reports/sales",
                icon: TrendingUp,
              },
              {
                title: "Product Report",
                href: "/dashboard/pos/reports/products",
                icon: Package,
              },
              {
                title: "Customer Report",
                href: "/dashboard/pos/reports/customers",
                icon: Users,
              },
            ],
          },
        ],
      };
    }

    // CRM Dropdown
    if (normalized === "crm") {
      return {
        parent: {
          title: "CRM",
          href: "/dashboard/crm",
          icon: Target,
        },
        children: [
          {
            title: "Leads",
            href: "/dashboard/crm/leads",
            icon: Target,
          },
          {
            title: "Deals",
            href: "/dashboard/crm/deals",
            icon: DollarSign,
          },
          {
            title: "System Setup",
            href: "/dashboard/crm/setup",
            icon: Settings,
          },
          {
            title: "Reports",
            href: "/dashboard/crm/reports",
            icon: BarChart3,
            children: [
              {
                title: "Lead Reports",
                href: "/dashboard/crm/reports/leads",
                icon: BarChart3,
              },
              {
                title: "Deal Reports",
                href: "/dashboard/crm/reports/deals",
                icon: BarChart3,
              },
            ],
          },
        ],
      };
    }

    // Default - for all other items
    return {
      parent: {
        title,
        href: getModuleHref(title),
        icon: getModuleIcon(title),
        badge: MODULE_BADGES[normalized],
      },
      children: [],
    };
  }).filter(Boolean) as NavSection[];
}
