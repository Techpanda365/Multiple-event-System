# Dash SaaS ERP — Comprehensive Project Report

**Date:** July 1, 2026  
**Project Name:** `dash-saas`  
**Type:** Multi-workspace, multi-module Open Source ERP / SaaS platform  

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Folder Structure](#2-folder-structure)
3. [Existing Modules](#3-existing-modules)
4. [Missing Modules](#4-missing-modules)
5. [Recommended Development Order](#5-recommended-development-order)
6. [Bugs and Bad Practices](#6-bugs-and-bad-practices)

---

## 1. Project Architecture

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Webpack mode) |
| Language | TypeScript 5 |
| UI | React 19, TailwindCSS 4, Lucide React |
| Database | MongoDB (via Prisma 6) |
| ORM | Prisma Client 6 |
| Auth | Custom JWT (jsonwebtoken 9) + bcryptjs |
| Form Handling | react-hook-form 7 + Zod 4 |
| Charts | Recharts 3 |
| PDF | jsPDF + jspdf-autotable |
| Date Handling | date-fns 4 |

### High-Level Architecture

The system follows a **monolithic Next.js App Router** architecture with two distinct user spaces:

- **Admin space** (`/admin/*`) — Super Admin only. Manages the SaaS platform itself: users, workspaces, subscriptions, CMS, helpdesk, analytics.
- **Dashboard space** (`/dashboard/*`) — Workspace users (ADMIN, MANAGER, STAFF). All business modules live here.

Both spaces share a single Next.js application, a single MongoDB database, and a single JWT-based authentication system.

### Authentication Flow

The project uses a **fully custom JWT implementation**, NOT the built-in NextAuth session system. NextAuth is installed but only `<SessionProvider>` is referenced for legacy reasons — the actual auth handlers are stubbed as 404.

```
User submits credentials
  └── POST /api/login  (company users — 30-day token, no refresh)
  └── POST /api/admin/login  (super admin — 15-min access + 7-day refresh token in DB)
        └── JWT signed with AUTH_SECRET stored as httpOnly cookie "session-token"
              └── src/middleware.ts reads + base64-decodes JWT (no cryptographic verify)
                    └── API routes call requireAuth() → verifyToken() for real verification
```

### Multi-Workspace Model

Each user can belong to multiple workspaces via `WorkspaceMember`. All business data (CRM, HRM, Projects, Invoices, etc.) is scoped to a `workspaceId`. The current session only surfaces the **first workspace joined** — workspace switching is not yet implemented in the UI.

### Module System

The navigation sidebar is driven by a `MODULE_ORDER` array in `src/lib/navigation/company-nav.ts` containing 200+ module names. Each module either maps to a known route via `HREF_OVERRIDES` or falls back to `/dashboard/modules/[slug]`. Modules without actual page implementations silently land on a generic placeholder.

---

## 2. Folder Structure

```
Event Management System/
├── .env                          # Environment variables
├── .gitignore
├── next.config.ts                # TypeScript errors suppressed (ignoreBuildErrors: true)
├── package.json
├── postcss.config.mjs
├── eslint.config.mjs
│
├── prisma/
│   ├── schema.prisma             # MongoDB schema — 35 models
│   └── seed.ts                   # Demo data seeder
│
├── public/
│   └── uploads/
│       └── avatars/              # User uploaded avatar images
│
├── scripts/                      # Utility scripts (elevate, check-users, dev launchers)
│
└── src/
    ├── app/                      # Next.js App Router
    │   ├── layout.tsx            # Root HTML shell (no providers)
    │   ├── page.tsx              # Redirects to /dashboard or /login
    │   ├── globals.css
    │   │
    │   ├── login/                # Login page
    │   ├── register/             # Registration page
    │   ├── forgot-password/      # Forgot password page
    │   ├── reset-password/       # Reset password page
    │   │
    │   ├── admin/                # Super Admin panel (20+ sections)
    │   │   ├── page.tsx          # Admin dashboard
    │   │   ├── users/
    │   │   ├── workspaces/
    │   │   ├── addons/
    │   │   ├── subscription/     # Plans, coupons, orders
    │   │   ├── helpdesk/
    │   │   ├── cms/              # 10 CMS pages
    │   │   ├── backup/
    │   │   ├── email-templates/
    │   │   ├── notification-templates/
    │   │   ├── google-analytics/ # GA reporting UI
    │   │   ├── generate/         # AI audience generation
    │   │   ├── drive-sales/
    │   │   ├── traffic-analysis/
    │   │   ├── user-engagement/
    │   │   ├── media-library/
    │   │   ├── side-menu-builder/
    │   │   ├── settings/
    │   │   ├── profile/
    │   │   ├── login-history/
    │   │   ├── file-share-verification/
    │   │   └── workdo-platform/
    │   │
    │   ├── dashboard/            # Workspace user panel
    │   │   ├── page.tsx          # Dashboard overview (Admin vs User views)
    │   │   ├── _components/      # Dashboard-specific components
    │   │   ├── accounting/       # 15+ sub-pages
    │   │   ├── assets/           # 7 sub-pages
    │   │   ├── budget/           # 4 sub-pages
    │   │   ├── crm/              # leads, deals, reports, setup
    │   │   ├── doubleentry/      # 5 sub-pages
    │   │   ├── hrm/              # 20+ sub-pages
    │   │   ├── inventory/        # Items, Adjustments, Reports
    │   │   ├── modules/          # Generic module placeholder
    │   │   ├── pos/              # 7+ sub-pages
    │   │   ├── products/
    │   │   ├── projects/
    │   │   ├── purchase/
    │   │   ├── Sales/            # CRM-style sales pipeline
    │   │   ├── sales-invoice/
    │   │   ├── quotations/
    │   │   ├── retainers/
    │   │   ├── help-desk/
    │   │   ├── work-permit/
    │   │   ├── workflow/
    │   │   ├── activity-log/
    │   │   ├── reminder/
    │   │   ├── timesheet/
    │   │   ├── users/
    │   │   ├── billing/
    │   │   ├── media-library/
    │   │   ├── settings/
    │   │   └── reports/
    │   │
    │   └── api/                  # API routes (~45 namespaces)
    │       ├── login/, register/, logout/
    │       ├── forgot-password/, reset-password/
    │       ├── auth/ (stubbed NextAuth + token refresh)
    │       ├── admin/ (users, workspaces, addons, cms, helpdesk, etc.)
    │       ├── crm/, hrm/, projects/, invoices/, expenses/
    │       ├── assets/, documents/, calendar/, reminders/
    │       ├── pos/, products/, inventory/
    │       ├── sales/, quotations/, retainers/
    │       ├── workflows/, upload/, media/
    │       └── accounting/, billing/, subscriptions/
    │
    ├── components/
    │   ├── providers.tsx         # NextAuth SessionProvider (legacy)
    │   ├── layout/
    │   │   ├── dashboard-layout.tsx
    │   │   ├── header.tsx
    │   │   └── sidebar.tsx
    │   ├── shared/               # EMPTY — placeholder only
    │   └── ui/                   # 9 shadcn-style components
    │       ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
    │       ├── dropdown-menu.tsx, input.tsx, label.tsx
    │       ├── select.tsx, textarea.tsx
    │
    ├── contexts/
    │   └── dashboard-session.tsx # DashboardSessionProvider + useDashboardSession()
    │
    ├── hooks/                    # EMPTY
    ├── store/                    # EMPTY
    │
    ├── lib/
    │   ├── auth.ts               # auth() helper — reads session cookie
    │   ├── db.ts                 # Singleton Prisma client
    │   ├── jwt.ts                # signToken, signRefreshToken, verifyToken
    │   ├── api-auth.ts           # requireAuth(), requireAdminSession() helpers
    │   ├── utils.ts              # cn(), formatCurrency(), formatDate(), slugify()
    │   ├── workspace.ts          # getUserWorkspace(userId)
    │   └── navigation/
    │       └── company-nav.ts    # 200+ module sidebar config
    │
    ├── middleware.ts             # Route protection
    │
    └── types/
        ├── index.ts              # AuthUser, DashboardStats, ApiResponse, etc.
        └── next-auth.d.ts        # NextAuth type augmentation (unused by actual auth)
```

---

## 3. Existing Modules

### Admin Panel Modules (SUPER_ADMIN only)

| Module | Status | Notes |
|---|---|---|
| Admin Dashboard | ✅ Implemented | Shows workspace count, user count, total revenue |
| User Management | ✅ Implemented | CRUD for all users |
| Workspace Management | ✅ Implemented | Create, view, manage workspaces |
| Add-ons Manager | ✅ Implemented | Manage addon catalog + subscriptions |
| Subscription Plans | ✅ Implemented | Plans, coupons, orders, bank transfers |
| Helpdesk | ✅ Implemented | Tickets, categories, today/all tickets |
| CMS | ✅ Implemented | Landing page, About, Contact, FAQ, Privacy Policy, T&C, Blogs, Marketplace, Custom Pages, Newsletter Subscribers |
| Email Templates | ✅ Implemented | View/edit transactional email templates |
| Notification Templates | ✅ Implemented | Push/notification template editor |
| Backup & Restore | ✅ Implemented | System backups, create backup |
| Google Analytics | ✅ Implemented | Realtime, Generate, Drive Sales, Traffic Analysis, User Engagement |
| Media Library | ✅ Implemented | Upload and browse media files |
| Side Menu Builder | ✅ Implemented | Customize company sidebar |
| Login History | ✅ Implemented | View login logs |
| File Share Verification | ✅ Implemented | Verify shared file access |
| Settings | ✅ Implemented | Global system settings |
| Profile | ✅ Implemented | Admin profile edit |
| WorkDo Platform | ✅ Implemented | Platform-level config |

### Dashboard (Workspace) Modules

| Module | Status | Notes |
|---|---|---|
| Dashboard Overview | ✅ Implemented | Revenue, projects, leads, employee stats |
| CRM — Leads & Deals | ✅ Implemented | Lead pipeline + deal tracking with DB |
| HRM | ✅ Implemented | Employees, departments, payroll, leave, attendance, awards, etc. |
| Projects | ✅ Implemented | Projects, tasks, members, payments, templates |
| Invoices | ✅ Implemented | Full invoice CRUD with status management |
| Expenses | ✅ Implemented | Expense tracking by category |
| Products | ✅ Implemented | Product/service catalog with SKU and stock |
| POS | ✅ Implemented | Orders, returns, discounts, barcode, billing counters |
| Accounting | ✅ Implemented | Customers, vendors, banking, chart of accounts, revenue, expense, debit/credit notes, reports |
| Double Entry | ✅ Implemented | Ledger summary, trial balance, balance sheet, P&L |
| Assets | ✅ Implemented | Asset register, assignments, locations, maintenance, depreciation, borrow/rent |
| Inventory | ✅ Implemented | Items, adjustments, stock valuation/COGS/movement reports |
| Budget Planner | ✅ Implemented | Periods, budgets, allocations, monitoring |
| Sales Pipeline | ✅ Implemented | Accounts, contacts, opportunities, quotes, sales orders, cases, calls, meetings |
| Sales Invoice | ✅ Implemented | Sales invoices + returns |
| Purchase | ✅ Implemented | Purchase invoices, returns, warehouses, transfers |
| Quotations | ✅ Implemented | Quotation CRUD |
| Retainers | ✅ Implemented | Retainer agreements + payments |
| Work Permit | ✅ Implemented | Permit types, contractors, permits, reports |
| Documents | ✅ Implemented | Document store with folders and tags |
| Calendar | ✅ Implemented | API + UI for calendar events |
| Reminders | ✅ Implemented | Reminder creation |
| Timesheet | ✅ Implemented | Timesheet creation |
| Workflow | ✅ Implemented | Workflow definitions (basic) |
| Activity Log | ✅ Implemented | Audit trail of workspace actions |
| Media Library | ✅ Implemented | Per-workspace file storage |
| User Management | ✅ Implemented | User list + roles (redirects admin to /admin/users) |
| Add-ons | ✅ Implemented | View/enable workspace-level addons |
| Billing | ✅ Implemented | Subscription billing UI |
| Settings | ✅ Implemented | Workspace settings |
| Help Desk | ✅ Implemented | Ticket submission |
| Reports | ✅ Implemented | Report overview page |

---

## 4. Missing Modules

### UI Components (empty/placeholder components/shared)

The `src/components/shared/` directory exists but is **completely empty**. Many pages likely duplicate UI patterns (tables, modals, form wrappers, confirmation dialogs, stat cards) that should live here.

Similarly `src/hooks/` and `src/store/` are empty — there are no shared React hooks or state management utilities despite the app growing to dozens of pages.

### Missing Features in Existing Modules

| Area | What's Missing |
|---|---|
| Authentication | No email verification flow. `emailVerified` field exists in schema but is never set. |
| Authentication | Refresh token rotation is not implemented for company users (30-day non-refreshable token). |
| Authentication | No rate limiting or lockout after failed login attempts. |
| Workspace | No workspace switching UI — `getUserWorkspace()` returns first joined workspace only. |
| Workspace | No workspace creation UI for company users (admin-only API exists). |
| HRM — Payroll | Schema has `salary` on `Employee` but no `Payslip`, `PayrollRun`, or `PayItem` models. |
| HRM — Attendance | No `Attendance` model in schema — the attendance pages have no database backing. |
| HRM — Shifts | No `Shift` model in schema. |
| HRM — Leave | No `Leave`, `LeaveType`, or `LeaveBalance` model in schema. |
| HRM — Work Permit | No `WorkPermit` or `Contractor` model in schema. |
| Projects | No `Comment` or file attachment model for project tasks. |
| Projects — Timesheet | `Timesheet` model is missing from schema (page exists, API exists, no model). |
| CRM | No `Contact`, `Account`, `Opportunity`, or `SalesOrder` model — the Sales sub-module pages exist but have no schema backing. |
| Accounting | No `BankAccount`, `BankTransaction`, `ChartOfAccount`, `JournalEntry`, or `TaxRate` model in schema. |
| Accounting — Double Entry | No `LedgerEntry` model. |
| POS | `PosOrder.items` is stored as `Json` blob rather than normalized `PosOrderItem` relations (model exists but is inconsistent with `items: Json`). |
| Invoices | No line-item model — `items` stored as `Json`. |
| Subscriptions | No webhook handling for payment gateway events. |
| Notifications | Notification templates exist in admin UI but there is no notification dispatch service or queue. |
| Email | `forgot-password` logs the reset URL to the console instead of sending an actual email — no email transport configured. |
| Search | Global search UI exists in the header but has no implementation. |
| Notifications Bell | Bell icon shows a hardcoded "3" count — no real notification model or API. |

### Entirely Missing Modules (listed in `MODULE_ORDER` but no implementation)

The sidebar lists 200+ modules. The ones with no corresponding page or API include (a representative sample):

- AI Agent, AI Document, AI Images
- Form Builder
- LMS (Learning Management System)
- Social Media integrations (WhatsApp, Instagram, Facebook, Zulip, YouTube)
- Third-party integrations (Pipedrive, Salesforce, HubSpot, WooCommerce, Shopify, Indiamart, Sage, Asana, Trello, Jira)
- Meeting integrations (Zoom, Google Meet, Jitsi, Zoho, Livestorm, Whereby)
- Specialty industry modules (Hotel & Room, Pharmacy, Hospital Management, School & Institutes, etc.)
- Petty Cash, Digital Certificate, Portfolio, Resume Builder
- Queue Management, Game Zone, Video Hub, Photo Studio

These modules resolve to `/dashboard/modules/[slug]` which shows a generic placeholder page.

---

## 5. Recommended Development Order

Work from the core outward — fix foundational issues first so everything built on top is stable.

### Phase 1 — Foundation & Security (do first)

1. **Fix the middleware JWT verification gap** — the middleware only base64-decodes tokens without cryptographic verification. A forged JWT will pass the middleware. Add `jose` or move to edge-compatible verification.
2. **Add missing Prisma models** — Attendance, Shift, Leave/LeaveType/LeaveBalance, WorkPermit, Contractor, Timesheet, BankAccount, ChartOfAccount, JournalEntry, Contact, Account (CRM), Opportunity, SalesOrder. Without these the corresponding pages are UI shells with no data.
3. **Configure a real email transport** — integrate Nodemailer or Resend so password reset actually sends an email instead of console-logging the URL.
4. **Normalize `Invoice.items` and `PosOrder.items`** — both use `Json` blobs. Migrate to the proper relational line-item tables that already exist in the schema.
5. **Add workspace switching** — `getUserWorkspace()` returns only the first workspace. Add a workspace context switcher to the header and store the active workspace in the session token or a cookie.

### Phase 2 — Complete Core Business Modules

6. **HRM backend** — Build API routes and DB models for Attendance, Shifts, Leave management, and Payroll runs. The UI already exists; it just has no data layer.
7. **Accounting backend** — Build BankAccount, BankTransaction, ChartOfAccount, JournalEntry, and TaxRate models and their API routes. The accounting UI is extensive but currently has no schema backing.
8. **CRM / Sales backend** — Add Contact, Account, Opportunity, and SalesOrder models. The Sales pipeline pages exist but currently cannot persist data.
9. **Project enhancements** — Add task comments, file attachments, and time-tracking entries linked to tasks.
10. **Timesheet module** — Add a Timesheet model with entries linked to users, projects, and tasks.

### Phase 3 — Fill the Components Library

11. **Build `src/components/shared/`** — Extract repeated patterns into shared components:
    - `DataTable` (with sorting, filtering, pagination)
    - `ConfirmDialog` (reusable delete/action confirmation)
    - `FormModal` (generic modal with form wrapper)
    - `StatCard` (metric display card)
    - `PageHeader` (title + actions breadcrumb)
    - `EmptyState`
12. **Build `src/hooks/`** — Extract common data-fetching patterns into hooks: `useWorkspace()`, `usePagination()`, `useDebounce()`.

### Phase 4 — Infrastructure

13. **Implement global search** — Wire the header search box to a cross-module search API.
14. **Implement notification system** — Add a Notification model, API, and real-time badge count in the header.
15. **Add email delivery** — Set up transactional email (welcome, invite, password reset, invoice sent, ticket opened).
16. **Add input validation** — Many API routes accept raw JSON without Zod validation. Add schema validation on every route.
17. **Add rate limiting** — Protect login, register, and forgot-password endpoints.

### Phase 5 — Premium/Add-on Modules

18. AI Agent, AI Document, AI Images — require LLM API integration.
19. Third-party integrations (Zoom, Google Meet, HubSpot, WooCommerce, Shopify) — each needs an OAuth flow and webhook handler.
20. Specialty industry modules (HRM sub-modules: Biometric Attendance, Performance Indicator, etc.).

---

## 6. Bugs and Bad Practices

### Critical Security Issues

**1. Middleware bypasses JWT verification**
```ts
// src/middleware.ts — current code
function decodeTokenPayload(token: string) {
  return JSON.parse(atob(parts[1]));  // Just base64-decodes — no signature check
}
```
An attacker can craft a token with `role: "SUPER_ADMIN"` and gain access to all admin routes. The middleware must call `verifyToken()` (or an edge-compatible equivalent) before trusting the payload.

**2. Password reset URL leaked in API response**
```ts
// src/app/api/forgot-password/route.ts
return NextResponse.json({
  success: true,
  resetUrl,  // ← This exposes the reset token in the HTTP response body
});
```
The reset URL (containing the one-time token) is returned to the client in the JSON response and also logged to `console.log`. Any attacker observing the network response or server logs can hijack password resets. The URL must only be sent via email, never in the API response.

**3. Registration hardcodes SUPER_ADMIN role**
```ts
// src/app/api/register/route.ts
role: "SUPER_ADMIN",  // Any self-registration becomes a super admin
```
Anyone who discovers the `/register` page can create a super admin account. This endpoint must either be removed, require an admin invite token, or assign a default non-privileged role.

**4. Weak seed password**
The seed file uses `password: "1234"` for all demo users. This is fine for local development but must be clearly documented and never used in production.

**5. `AUTH_SECRET` fallback is hardcoded**
```ts
// src/lib/jwt.ts and src/app/api/login/route.ts
const SECRET = process.env.AUTH_SECRET || "super-secret-key";
```
If `AUTH_SECRET` is not set, the app silently falls back to a publicly-known string. Remove the fallback and throw an error at startup instead.

---

### Architecture Issues

**6. Inconsistent token expiry between login routes**

`POST /api/login` (company users) issues a 30-day non-refreshable token:
```ts
const token = jwt.sign(tokenPayload, SECRET, { expiresIn: "30d" });
```
`POST /api/admin/login` (super admin) issues a 15-minute token with a 7-day refresh. The two flows are incompatible and the middleware cannot tell them apart, which means super admins using the company login route also get 30-day tokens.

**7. `TypeScript ignoreBuildErrors` is enabled**
```ts
// next.config.ts
typescript: { ignoreBuildErrors: true }
```
Type errors are silently swallowed during builds. This hides real bugs. Enable proper type checking.

**8. No `layout.tsx` in `/dashboard` — layout is applied manually**
Every dashboard page must manually wrap its content in `<DashboardLayout>`. If a developer forgets, the page renders without the sidebar/header. Next.js file-based layouts (`layout.tsx`) should be used instead so it's automatic.

**9. `providers.tsx` wraps with `SessionProvider` but the app does not use NextAuth sessions**
This adds a client-side provider that serves no purpose and adds bundle weight. Either migrate to real NextAuth sessions or remove the `SessionProvider`.

**10. `console.log` left in production code**
```ts
// src/components/layout/dashboard-layout.tsx
console.log("DashboardLayout - Rendering with children:", !!children);
```
Debug logs should never be in production components.

---

### Data Model Issues

**11. Key models are missing for implemented UI pages**

These pages exist in the app but the corresponding Prisma models do not:

| Page | Missing Model |
|---|---|
| `/dashboard/hrm/attendances` | `Attendance` |
| `/dashboard/hrm/shifts` | `Shift` |
| `/dashboard/hrm/leave/*` | `LeaveType`, `LeaveApplication`, `LeaveBalance` |
| `/dashboard/work-permit/*` | `WorkPermit`, `Contractor` |
| `/dashboard/timesheet/*` | `Timesheet`, `TimesheetEntry` |
| `/dashboard/Sales/*` | `Contact`, `Account`, `Opportunity`, `SalesOrder` |
| `/dashboard/accounting/banking/*` | `BankAccount`, `BankTransaction` |
| `/dashboard/accounting/chart-of-accounts` | `ChartOfAccount` |
| `/dashboard/doubleentry/*` | `JournalEntry`, `LedgerEntry` |

**12. `Invoice.items` and `PosOrder.items` stored as JSON blobs**
```prisma
model Invoice {
  items  Json  // Unstructured JSON — no query, filter, or join possible
}
```
`PosOrderItem` relational model exists in the schema but `PosOrder.items` still uses `Json`. This inconsistency means some code paths use the relational model and others use the blob.

**13. `AddonSubscription` missing `workspaceId` → `Workspace` relation in schema**
The model stores `workspaceId` as a plain string with no foreign key relation to `Workspace`, so cascade deletes and referential integrity are not enforced.

---

### Code Quality Issues

**14. Large commented-out code blocks in `company-nav.ts`**
The file contains thousands of lines of commented-out previous versions of `buildCompanyNav()`. This dead code should be removed. Use Git history for version tracking.

**15. Typo in a hardcoded href**
```ts
// src/lib/navigation/company-nav.ts
href: "/dashboard/S  ales/setup",  // Double space — will produce a broken URL
```

**16. `any` type used in production API route**
```ts
// src/app/api/admin/auth/login-as/route.ts
let adminPayload: any;
```
This defeats TypeScript's type safety.

**17. `src/components/shared/` is empty**
With dozens of pages, shared patterns like data tables, stat cards, and page headers are being duplicated per page instead of living in a shared library.

**18. No input validation on many API routes**
Several routes accept and use raw `request.json()` data without Zod or manual validation beyond checking for `undefined`. Malformed or oversized payloads are not rejected.

**19. `getUserWorkspace()` always returns the first workspace joined**
There is no mechanism for a user to operate in a specific workspace context within a session. Multi-workspace support is modeled in the database but not exposed in the UI or session.

**20. Search and notification bell are hardcoded UI dummies**
The header search (`Ctrl+K`) shows a decorative input with no functionality. The bell icon has a hardcoded badge of `3` with no backing data or real-time update mechanism.

---

## Summary

The project has a solid foundation: a well-structured Next.js App Router app, a clean Prisma schema (despite gaps), sensible module-based organization, and a large set of UI pages already built. The main challenges are:

1. **Security** — middleware verification bypass and the exposed reset URL are critical fixes needed before any production deployment.
2. **Schema completeness** — roughly 30% of the UI pages have no database models behind them.
3. **Consistency** — two authentication flows with different expiry behavior, mixed JSON vs relational storage, and no shared component library create maintenance overhead.
4. **Dead code** — thousands of lines of commented-out navigation code inflate file sizes and reduce readability.

Addressing Phase 1 of the development plan above will resolve the most critical issues and create a stable base for the remaining feature work.
