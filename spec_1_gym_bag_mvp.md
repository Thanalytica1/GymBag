# SPEC-1-GymBag MVP

## Background

GymBag is a **coach-only** **mobile app (iOS/Android)** for independent personal trainers and coaches to run their **day-to-day business and upkeep**. There are **no client logins** and **no training program authoring/assignment**. The product is an operational cockpit for a single coach.

**MVP focus**
- **Schedule & sessions:** Create/edit sessions, mark as completed/no-show, quick notes.
- **Client roster (CRM-lite):** Store contacts, status (active/prospect/inactive), last/next session, follow-up reminders.
- **Sales tracking (manual):** Log payments, optional session packs (e.g., 10-pack) with remaining balance auto-decrement on completion; no online checkout in MVP.
- **Business upkeep:** Tasks/reminders (renewals, check-ins, certifications), simple file-less notes.
- **Dashboard:** At-a-glance metrics (sessions this week, revenue this month, clients needing follow-up).
- **Growth workspace (new scope):** Social posting **schedule** (non-publishing), **reminders to post**, **engagement review** (manual metrics per post across platforms), and a **leads list** for potential clients.

**Out of scope for MVP**
- Client portal or logins.
- Program design/builders, exercise libraries, or workout plans.
- Payment processing integrations (Stripe, etc.).
- Calendar sync (Google/Apple). 
- Multi-coach teams/organizations.

**Scope notes (non-technical)**
- Mobile iOS & Android app for coaches only.
- No client logins; no program builder.
- **Monetization:** $5/month with a **5‑day free trial**.

## Requirements

**MoSCoW Prioritization**

**Must Have**
- **Auth (coach-only):** Email/password sign-up, sign-in, email verification, password reset.
- **Coach profile:** Name, business name, timezone, **default currency**, **week start (Sun default, Mon optional)**.
- **Client contacts (CRM-lite):** Create/edit archive; fields: name, phone, email, status (active/prospect/inactive), notes, last/next session.
- **Schedule & sessions:** CRUD sessions; associate a client; start/end time + duration; location (text); status (planned/completed/no-show/cancelled); free-text notes; quick "complete" action.
- **Packages & prices (catalog):** Define reusable items (e.g., "10-Pack 60min", price, included sessions, optional expiry in days). Mark items as **active/inactive**; attach notes.
- **Package assignments:** Assign package to a client; track remaining sessions; decrement on session completion; manual adjust; show days-to-expiry.
- **Payments (manual log only):** Log date, amount, currency, method (note only), related client and/or package; no payment processing.
- **Dashboard KPIs:** Cards for **Sessions this week**, **Revenue this month**, **Clients needing follow-up** (fixed 14/7-day heuristic), **Posts planned this week**, **Posted this week**, **Leads to contact today**.
- **Tasks & reminders:** Personal to-dos with due date and optional client link; simple list + completed toggle.
- **Search & filters:** Quick search by client name; filters for status/next-session/remaining-sessions.
- **Data & privacy:** Each coach’s data is private to their account; allow archiving clients and packages.
- **Native mobile apps:** iOS & Android; fast add flows.

**Should Have**
- Week and list views for sessions; quick presets for common durations (30/45/60/90).
- Package templates with default duration/price; duplicate package.
- CSV export for payments and sessions; simple totals by month.
- Alerts: package remaining ≤ N or expiring in ≤ Y days; clients with no upcoming session.
- Keyboard shortcuts for quick add; color labels for clients.

**Could Have**
- Optional **Calendar sync** (Google/Apple/Outlook): one‑way export of sessions; consider two‑way later.
- Basic charts (sessions/week, revenue/month).
- Cancellable sessions that auto-return a session to a package (if not completed).
- Notes pinning and client tags.

**Won’t Have (MVP)**
- Client logins/portal.
- Program design/builders/exercise libraries.
- Online payments or invoicing; tax/VAT handling.
- Teams/organizations or role hierarchies.
- Offline-first or advanced analytics.

---

### Growth Workspace (New Scope)

**Must Have**
- **Post calendar (non-publishing):** Create planned posts with fields: platform, title/idea, plannedAt (coach timezone), status (planned/posted/skipped), optional asset URL (for reference), notes.
- **Reminders to post:** Automatic task generated for each planned post (in-app reminders; email later).
- **Engagement review (manual):** After posting, record metrics per post: likes, comments, shares, saves, views/reach, link to live post.
- **Leads list (prospects CRM):** Fields: name, platform/source, handle/url, contact info, status (new/contacted/follow-up/won/lost), nextActionAt, notes, tags.

**Should Have**
- Calendar week/month views with filters by platform.
- CSV import/export for engagement and leads.
- Post templates (promo, testimonial, tip) with reusable checklists.

**Could Have**
- Auto-fetch engagement for a post URL via official platform APIs (requires OAuth/app review) — phase 2.
- UTM builder and link shortener integration.
- Email reminders and daily digest.

**Won’t Have (Growth MVP)**
- Auto-posting/cross-posting to platforms.
- Direct OAuth integrations (Instagram/TikTok/X/LinkedIn/YouTube) at launch.
- Push/mobile notifications.



## Milestones (Mobile MVP)

**M0 — App foundation & accounts**
- App scaffolded; sign‑in/sign‑up/reset; profile with locale (timezone, currency, week start).
- **Acceptance:** First‑run flow completes; dashboard renders with empty states on iOS & Android test devices.

**M1 — Clients & Packages**
- Clients list with add/edit/archive; Packages catalog with add/edit/activate/deactivate.
- **Acceptance:** Can assign a package to a client; package status toggles correctly.

**M2 — Assignments & Sessions**
- Create assignments; session add/edit; complete/revert updates remaining sessions and expiry flags.
- **Acceptance:** Completing a linked session reduces remaining; expired completions show a non‑blocking warning.

**M3 — Payments & KPIs**
- Payment log; monthly revenue card; dashboard shows sessions/revenue/clients‑needing‑follow‑up.
- **Acceptance:** KPI values match hand‑checked samples.

**G1 — Growth: Posts + Reminders**
- Post calendar/list; planning a post creates a reminder; marking as posted closes the reminder.
- **Acceptance:** One planned post → one reminder; posting flips status and reminder.

**G2 — Growth: Engagement + CSV**
- Manual engagement capture; CSV import with URL/time matching; “last engagement” shown on each post.
- **Acceptance:** Import of sample CSV updates/creates posts with ≥90% correct matches.

**G3 — Growth: Leads CRM**
- Leads list/detail; pipeline statuses (new → contacted → follow‑up → won/lost); “today” view by next action.
- **Acceptance:** Moving a lead updates counts; today view filters correctly.

**M4 — Monetization & release prep**
- Subscription paywall for **$5/month** with **5‑day trial**; restore purchases; basic subscription settings.
- App icon, splash, store listings; test builds available on iOS & Android.
- **Acceptance:** Subscribe/restore flows verified in test environments; builds installable for testers.

**C1 — Calendar Sync (Optional)**
- Add calendar connect in Settings; choose calendars to sync.
- One‑way: creating/updating/deleting a session reflects in the external calendar within a short window; read‑only in app.
- **Acceptance:** Creating, editing, or canceling a session updates the chosen external calendar event reliably.

## Gathering Results (Mobile)

**Success criteria**
- Coaches can run daily ops on‑the‑go without spreadsheets.
- Posting cadence and lead follow‑up improve measurably.
- $5/month plan with **5‑day trial** shows early willingness to pay.

**What we’ll measure**
- **Speed:** complete a linked session ≤ 15s; log a payment ≤ 20s; log engagement ≤ 20s; import 10 rows ≤ 30s.
- **Stability:** crash‑free sessions ≥ 99.5% during testing.
- **Growth adherence:** posted/planned ≥ 80% weekly; ≥ 90% of posted items have engagement logged within 48h.
- **Leads throughput:** ≥ 10% of new leads → won within 30 days (tune later).
- **Subscription health:**
  - **Day‑5 conversion** (trial → paid) if trial enabled; otherwise signup → paid conversion ≥ 25% from first‑week cohort.
  - **Month‑1 retention ≥ 85%**; refund rate < 3%.

**Artifacts**
- Acceptance checklist with pass/fail per milestone.
- KPI screenshots vs. hand counts.
- CSV import summary (created/matched/errors).
- Subscription test receipts & entitlement logs (test environments).

