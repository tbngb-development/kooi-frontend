# AGENT.md — AI Lead Qualification System

# Full System Reference for AI Agents

> Last updated: August 2026
> Stack: Next.js 16 + Express.js + PostgreSQL + Prisma + Bolna Voice AI

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Repository Structure](#2-repository-structure)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Data Flow](#7-data-flow)
8. [API Reference](#8-api-reference)
9. [Key Business Rules](#9-key-business-rules)
10. [Enums Reference](#10-enums-reference)
11. [Environment Variables](#11-environment-variables)
12. [Known Patterns](#12-known-patterns)

---

## 1. System Overview

An AI-powered real estate lead qualification platform. Tenants upload leads via CSV,
assign a Bolna AI voice agent, and launch outbound call campaigns. After each call,
Bolna extracts structured data (disposition, lead temperature, budget, timeline etc.)
and sends it back via webhook. The system stores this as `CallAnalysis` and surfaces
it on the frontend for business review.

### Core Flow

```
CSV Upload → Campaign Start (or Schedule) → Bolna Outbound Call → Webhook → CallAnalysis Saved → Dashboard
```

### Multi-tenancy

Every DB record has `tenantId`. All queries are scoped to `req.user.tenantId`.
No cross-tenant data leakage is possible through the API layer.

---

## 2. Repository Structure

### Backend — `express-backend/`

```
express-backend/
├── prisma/
│   ├── schema.prisma              # Single source of truth for all models + enums
│   └── migrations/                # Auto-generated migration history
├── src/
│   ├── config/
│   │   ├── database.ts            # Prisma client singleton
│   │   ├── bolna.ts               # Bolna API client
│   │   └── queue.ts               # Unused in MVP — reserved for V1
│   ├── generated/
│   │   └── prisma/                # Auto-generated Prisma client — DO NOT EDIT
│   ├── jobs/
│   │   ├── call.job.ts            # Empty — reserved for V1 queue
│   │   └── campaign.job.ts        # Empty — reserved for V1 queue
│   ├── middleware/
│   │   ├── auth.ts                # JWT verification, attaches req.user
│   │   ├── errorHandler.ts        # Global error handler
│   │   ├── tenant.ts              # Tenant resolution middleware
│   │   └── upload.ts              # Multer config for CSV/PDF uploads
│   ├── modules/
│   │   ├── assistants/
│   │   │   ├── assistant.controller.ts
│   │   │   ├── assistant.routes.ts
│   │   │   └── assistant.service.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.ts  # register, login, profile handlers
│   │   │   ├── auth.routes.ts      # POST /register, POST /login, GET /profile
│   │   │   └── auth.service.ts     # register(), login(), getProfile()
│   │   ├── brochure/
│   │   │   ├── brochure.controller.ts
│   │   │   ├── brochure.routes.ts
│   │   │   ├── brochure.service.ts
│   │   │   └── brochure.types.ts
│   │   ├── calls/
│   │   │   ├── call.controller.ts  # list, get, getTranscript, getStats
│   │   │   ├── call.routes.ts      # GET /stats MUST be before GET /:id
│   │   │   └── call.service.ts     # list(), get(), getTranscript(), getStats()
│   │   ├── campaigns/
│   │   │   ├── campaign.controller.ts   # + parseLeads, cancelSchedule handlers
│   │   │   ├── campaign.routes.ts       # + /parse-leads, /cancel-schedule
│   │   │   └── campaign.service.ts      # uploadLeads(), parseLeads(), start(scheduledAt?), processLeads(), makeCall(scheduledAt?), cancelSchedule()
│   │   ├── dashboard/
│   │   │   └── dashboard.routes.ts # overview, activity, campaigns endpoints
│   │   ├── leads/
│   │   │   ├── lead.controller.ts  # list, get, getStats
│   │   │   ├── lead.routes.ts      # GET /stats MUST be before GET /:id
│   │   │   └── lead.service.ts     # list() supports leadTemperature filter
│   │   ├── tenants/
│   │   │   ├── tenant.controller.ts
│   │   │   ├── tenant.routes.ts
│   │   │   └── tenant.service.ts
│   │   ├── users/
│   │   │   └── user.routes.ts
│   │   └── webhooks/
│   │       ├── webhook.handler.ts  # All Bolna webhook logic + SCHEDULED transitions
│   │       └── webhook.routes.ts
│   ├── types/
│   │   ├── bolna.types.ts          # Bolna API + extraction types (+ scheduled_at on BolnaCallPayload)
│   │   └── index.ts                # Shared Express types
│   ├── utils/
│   │   ├── leadParser.ts           # CSV/XLS/XLSX parser
│   │   ├── paramHelper.ts          # Safe req.params extraction
│   │   ├── pdfExtractor.ts         # PDF text extraction
│   │   ├── promptVariableExtractor.ts # Extracts {variables} from agent prompt
│   │   ├── propertyExtractor.ts    # AI property data extraction from PDF
│   │   └── response.ts             # Standard response helpers
│   └── index.ts                    # Express app entry point
```

### Frontend — `frontend/`

```
frontend/src/
├── app/
│   ├── (admin)/                   # SUPER_ADMIN area
│   │   ├── admin/dashboard/       # Platform admin dashboard
│   │   ├── admin/tenants/         # Tenant management
│   │   └── layout.tsx
│   ├── (admin-auth)/              # Admin login page
│   │   └── admin/login/
│   ├── (auth)/                    # Tenant user auth
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/               # Main tenant app
│       ├── assistants/            # List, detail, create assistant
│       ├── calls/                 # All calls list + [id] detail page
│       ├── campaigns/             # List + [id] detail + [id]/calls + [id]/leads
│       ├── dashboard/             # Main dashboard page
│       ├── leads/                 # All leads list + [id] detail page
│       └── users/                 # Team management
├── components/
│   ├── assistants/                # AssistantCard, AssistantForm, AssistantModal
│   ├── auth/                      # LoginForm, RegisterForm
│   ├── brochure/                  # BrochureUploader, BrochureReviewForm
│   ├── calls/
│   │   ├── CallStatusBadge.tsx
│   │   ├── CallStatsCards.tsx     # Stats cards for calls pages
│   │   ├── CallsTable.tsx         # Table with Disposition + Temperature columns
│   │   └── TranscriptViewer.tsx
│   ├── campaigns/
│   │   ├── CSVUploader.tsx        # DEPRECATED — replaced by UploadLeadsModal
│   │   ├── UploadLeadsModal.tsx   # 2-step upload: File Select → Parse Preview → Confirm
│   │   ├── CampaignActions.tsx    # Run Now / Schedule / Pause / Cancel Schedule
│   │   ├── CampaignDetailsForm.tsx
│   │   ├── CampaignDetailsStep.tsx
│   │   ├── CampaignStats.tsx
│   │   ├── CampaignStatusBadge.tsx  # Includes SCHEDULED variant
│   │   └── CampaignVariablesStep.tsx # Required fields + char limits validation
│   ├── dashboard/
│   │   ├── ActivityFeed.tsx       # Shows qualified leads feed
│   │   ├── CampaignPerformance.tsx
│   │   └── StatsCard.tsx
│   ├── layout/
│   │   ├── AdminSidebar.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── leads/
│   │   ├── LeadStatusBadge.tsx
│   │   ├── LeadStatsCards.tsx     # Stats cards for leads pages
│   │   └── LeadsTable.tsx         # Table with DNC column
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ConfirmModal.tsx
│       ├── EmptyState.tsx
│       ├── FilterBar.tsx          # FilterSelect, SortSelect, FilterBar components
│       ├── FloatingInput.tsx
│       ├── GoBackButton.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── NumberInput.tsx
│       ├── Pagination.tsx
│       ├── Select.tsx
│       ├── Spinner.tsx
│       └── TextArea.tsx
├── constants/
│   ├── api-routes/auth-endpoint.ts
│   └── routes/admin.routes.ts
├── hooks/
│   ├── useAssistants.ts
│   ├── useAuth.ts
│   ├── useBrochure.ts
│   ├── useCalls.ts                # useCalls, useCall, useCallTranscript, useCallStats
│   ├── useCampaigns.ts            # + useParseCSV, useCancelScheduleCampaign
│   ├── useDebounce.ts
│   ├── useDashboard.ts            # useDashboardOverview, useDashboardActivity, useDashboardCampaigns
│   ├── useLeads.ts                # useLeads (supports leadTemperature), useLead, useLeadStats
│   ├── usePagination.ts
│   ├── useTenants.ts
│   └── useUsers.ts
├── lib/
│   ├── api/
│   │   ├── assistants.ts
│   │   ├── auth.ts
│   │   ├── brochure.ts
│   │   ├── calls.ts               # getAll, getById, getTranscript, getStats
│   │   ├── campaigns.ts           # + parseCSV, cancelSchedule, start(scheduledAt?)
│   │   ├── dashboard.ts           # getOverview, getActivity, getCampaigns
│   │   ├── leads.ts               # getAll (supports leadTemperature), getById, getStats
│   │   ├── tenants.ts
│   │   └── users.ts
│   ├── utils/
│   │   ├── cn.ts                  # clsx utility
│   │   ├── formatDate.ts
│   │   └── formatDuration.ts
│   ├── axios-error-message.ts
│   ├── axios.ts                   # Axios instance with base URL + auth interceptor
│   └── campaign-draft.ts
├── store/
│   └── authStore.ts               # Zustand auth store — user, token, tenant
├── styles/
│   └── globals.css
└── types/
    ├── api.ts
    ├── index.ts                   # ALL shared types — single source of truth
    └── user.ts
```

---

## 3. Technology Stack

### Backend

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Runtime     | Node.js + TypeScript          |
| Framework   | Express.js                    |
| ORM         | Prisma v6.19.3                |
| Database    | PostgreSQL                    |
| Auth        | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer                        |
| Voice AI    | Bolna API                     |
| PDF Parsing | Custom pdfExtractor utility   |

### Frontend

| Layer       | Technology                                        |
| ----------- | ------------------------------------------------- |
| Framework   | Next.js 16 (App Router)                           |
| Language    | TypeScript                                        |
| State       | Zustand (auth) + TanStack Query v5 (server state) |
| Forms       | React Hook Form + Zod                             |
| HTTP        | Axios                                             |
| Styling     | Tailwind CSS v4                                   |
| Charts      | Recharts                                          |
| Toast       | Sonner                                            |
| Icons       | Lucide React                                      |
| Date Picker | react-datepicker                                  |

---

## 4. Database Schema

### Models Overview

```
Tenant
  ├── Users[]
  ├── Campaigns[]
  │     ├── Leads[]
  │     │     └── Calls[]
  │     │           └── CallAnalysis (one-to-one)
  │     └── Calls[]
  ├── Assistants[]
  ├── Brochures[]
  └── CallAnalyses[]
```

### Model: Tenant

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  apiKey    String   @unique @default(uuid())
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Model: User

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  role      Role     @default(USER)  // SUPER_ADMIN | ADMIN | USER
  tenantId  String   // required — SUPER_ADMIN support deferred to V1
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Model: Campaign

```prisma
model Campaign {
  id           String         @id @default(uuid())
  name         String
  description  String?
  status       CampaignStatus @default(DRAFT)
  tenantId     String
  assistantId  String
  brochureId   String?
  variables    Json?
  totalLeads   Int            @default(0)
  calledLeads  Int            @default(0)
  successLeads Int            @default(0)
  failedLeads  Int            @default(0)
  scheduledAt  DateTime?      // When the campaign is scheduled to run (Bolna-queued)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  startedAt    DateTime?
  completedAt  DateTime?
}
```

### Model: Lead

```prisma
model Lead {
  id         String     @id @default(uuid())
  name       String
  phone      String
  email      String?
  company    String?
  status     LeadStatus @default(PENDING)
  doNotCall  Boolean    @default(false)   // set true when extraction returns do_not_call=YES
  tenantId   String
  campaignId String
  metadata   Json?       // raw CSV row stored here

  @@unique([phone, campaignId])  // prevents duplicate leads per campaign
}
```

### Model: Call

```prisma
model Call {
  id                 String     @id @default(uuid())
  bolnaCallId        String?    @unique   // Bolna execution_id
  tenantId           String
  campaignId         String
  leadId             String
  status             CallStatus @default(PENDING)
  duration           Int?       // seconds
  recording          String?    // URL
  transcript         String?    // plain text
  transcriptMessages Json?      // [{role, message, time}]
  summary            String?    // from call_summary extraction field (NOT Bolna raw summary)
  startedAt          DateTime?
  endedAt            DateTime?
}
```

> ⚠️ `outcome` field was REMOVED. Outcome lives in `CallAnalysis.disposition` only.

### Model: CallAnalysis

```prisma
model CallAnalysis {
  id       String @id @default(uuid())
  callId   String @unique    // one-to-one with Call
  tenantId String

  // Call Outcome
  disposition             Disposition?
  leadTemperature         LeadTemperature?

  // Lead Qualification
  preferredConfiguration  String?     // free text
  budgetRange             String?     // free text
  purchaseTimeline        PurchaseTimeline?
  purchasePurpose         PurchasePurpose?
  locationMatch           LocationMatch?
  customerLocationPref    String?     // free text

  // Next Action
  preferredNextAction     PreferredNextAction?
  preferredContactChannel ContactChannel?
  followupSchedule        String?     // free text e.g. "tomorrow noon"

  // Compliance
  doNotCall               ExtractionFlag?
  languageSupportRequired ExtractionFlag?
}
```

### Model: Brochure

Stores AI-extracted property data from PDF upload. Linked optionally to campaigns.
Key fields: `projectName`, `city`, `area`, `configurations[]`, `startingPrice`,
`amenities[]`, `isConfirmed` (must be true before campaign can use it).

### Model: Assistant

```prisma
model Assistant {
  id      String @id @default(uuid())
  bolnaId String @unique   // Bolna agent ID
  name    String
  config  Json             // full Bolna agent config stored here
}
```

---

## 5. Backend Architecture

### Route Registration (index.ts)

```
/api/auth          → auth.routes.ts
/api/campaigns     → campaign.routes.ts
/api/leads         → lead.routes.ts
/api/calls         → call.routes.ts
/api/assistants    → assistant.routes.ts
/api/brochures     → brochure.routes.ts
/api/dashboard     → dashboard.routes.ts
/api/tenants       → tenant.routes.ts
/webhooks/bolna    → webhook.routes.ts
```

### Auth Middleware (`src/middleware/auth.ts`)

- Reads `Authorization: Bearer <token>` header
- Verifies JWT
- Attaches `req.user` with `{ id, tenantId, role }`
- All protected routes use `router.use(authenticate)`

### Important Route Order Rule

```typescript
// ALWAYS register /stats before /:id
// Otherwise Express matches "stats" as an :id param
router.get("/stats", getStats);
router.get("/", list);
router.get("/:id", get);
```

This applies to both `call.routes.ts` and `lead.routes.ts`.

### Campaign Processing (`campaign.service.ts`)

**Immediate (Run Now) — no `scheduledAt`:**

```
start()
  → find PENDING leads where doNotCall = false
  → update campaign status = RUNNING
  → processLeads() — async, non-blocking
      → batched concurrent dispatch (batchSize = 50)
      → each batch: Promise.all(batch.map(makeCall))
      → 1 second delay between batches
      → Bolna handles concurrency on their end
```

**Scheduled (Schedule Later) — with `scheduledAt` ISO 8601 string:**

```
start(scheduledAt)
  → validate scheduledAt is a future date
  → update campaign status = SCHEDULED, scheduledAt = date
  → processLeads() dispatches immediately with scheduled_at per makeCall
  → makeCall() sends scheduled_at in Bolna payload
  → Bolna queues each call and fires it at the designated time
  → NO auto-complete after dispatch (webhook handles completion)
```

**Cancel Schedule:**

```
cancelSchedule()
  → validate campaign.status === SCHEDULED
  → reset all Lead.status CALLING → PENDING
  → delete all Call records with status CALLING
  → set campaign.status = DRAFT, scheduledAt = null
  → ⚠️ Bolna calls already queued may still fire (Bolna has no cancel API)
```

> ⚠️ No BullMQ/Redis queue. Bolna IS the queue. Both immediate and scheduled
> dispatch use the same batched concurrent pattern. Bolna's native `scheduled_at`
> parameter handles time-based queueing on their side.

### Webhook Handler (`webhook.handler.ts`)

Handles all Bolna call lifecycle events:

```
queued/initiated  → Call.status = CALLING
                  → if campaign.status === SCHEDULED, transition to RUNNING (+ startedAt)
ringing           → log only
in-progress       → Call.status = CALLING
call-disconnected → log only (completed fires seconds later with full data)
completed         → handleCallCompleted()   + checkScheduledCampaignCompletion()
no-answer         → Call.status = NO_ANSWER + Lead.status = NO_ANSWER + completion check
busy              → Call.status = BUSY + Lead.status = NO_ANSWER + completion check
failed/error      → Call.status = FAILED + Lead.status = FAILED + completion check
```

#### handleCallCompleted() flow:

```
1. Find Call by bolnaCallId
2. Normalize transcript messages
3. parseExtractionData(payload.extracted_data)
   → sanitizeEnum() validates ALL enum fields against allowed sets
   → unknown values become null (never crash Prisma)
   → returns null if all fields are null (no CallAnalysis created)
4. Update Call: status, summary (from call_summary extraction), transcript, duration, recording
5. Update Lead: status = CALLED
6. If parsed: saveCallAnalysis() → create CallAnalysis record
7. If doNotCall === YES: Lead.doNotCall = true
8. Increment campaign.calledLeads
9. If leadTemperature ∈ {HOT, WARM}: increment campaign.successLeads
10. checkScheduledCampaignCompletion() — mark COMPLETED if scheduled + no active leads
```

#### checkScheduledCampaignCompletion() flow:

```
Called after every terminal webhook (completed / no-answer / busy / failed).
Only affects campaigns with scheduledAt set and current status RUNNING.

1. Load campaign
2. If !scheduledAt OR status !== RUNNING → skip
3. Count leads with status ∈ {PENDING, CALLING}
4. If count === 0 → set campaign.status = COMPLETED, completedAt = now
```

#### Enum Sanitization (critical)

```typescript
// All enum fields from Bolna AI are sanitized before Prisma insert
// Bolna can return unexpected values like "NOT_MENTIONED" for locationMatch
// sanitizeEnum() maps unknowns to null — CallAnalysis still saves with other valid fields
function sanitizeEnum<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
): T | null;
```

### Call.summary Source

```
Call.summary ← extracted_data.Summary.call_summary.subjective
```

Bolna's raw `payload.summary` string is DISCARDED. Only extraction data is used.

---

## 6. Frontend Architecture

### Auth Flow

- `authStore.ts` (Zustand) — stores `user`, `token`, `tenant`
- `lib/axios.ts` — Axios instance attaches `Bearer token` from store on every request
- Protected routes check store on layout level
- `(auth)/` layout — for unauthenticated tenant users
- `(admin-auth)/` layout — for SUPER_ADMIN login

### Data Fetching Pattern

```
Page → useHook() → lib/api/*.ts → Axios → Backend API
```

All server state managed by TanStack Query v5.
All mutations show toast via Sonner on success/error.

### Query Key Conventions

```typescript
CAMPAIGNS_KEY = ['campaigns']
CALLS_KEY     = ['calls']
LEADS_KEY     = ['leads']
DASHBOARD_KEY = ['dashboard']

// Scoped queries
[...CAMPAIGNS_KEY, id]           // single campaign
[...CALLS_KEY, params]           // filtered call list
[...CALLS_KEY, 'stats', params]  // call stats
[...LEADS_KEY, 'stats', params]  // lead stats
```

### Types (`src/types/index.ts`)

Single source of truth for ALL frontend types.
Never import from generated Prisma types on frontend.

Key interfaces:

```typescript
CallAnalysis; // mirrors DB model — all 13 extraction fields
Call; // includes callAnalysis?: CallAnalysis | null
Lead; // includes doNotCall: boolean
UploadResult; // total, valid, imported, duplicates, invalid, duplicateNumbers[]
ParseLeadsResult; // total, valid, invalid, inFileDuplicates, dbDuplicates, readyToImport (+ number arrays)
CallStats; // total, completed, failed, noAnswer, busy, avgDuration, dispositionBreakdown, temperatureBreakdown
LeadStats; // total, pending, calling, called, failed, noAnswer, doNotCall, qualified, qualificationRate
DashboardActivity; // recentCalls[], qualifiedLeads[], recentCampaigns[]
DashboardOverview; // qualificationRate and successRate are STRING ("45.2%") not number
Campaign; // includes scheduledAt?: string
CampaignStatus; // DRAFT | SCHEDULED | RUNNING | PAUSED | COMPLETED | FAILED
LeadQueryParams; // includes leadTemperature?: string (comma-separated)
CallQueryParams; // includes leadTemperature?: string (comma-separated)
```

> ⚠️ `DashboardOverview.leads.qualificationRate` and `calls.successRate` are strings.
> Always use `parseFloat()` before numeric comparisons.

### FilterBar Component (`src/components/ui/FilterBar.tsx`)

Three exported components:

```typescript
<FilterBar hasActiveFilters onReset>   // wrapper with reset button
<FilterSelect label value onChange options />  // single filter dropdown
<SortSelect sortBy sortOrder onSortByChange onSortOrderChange options /> // sort controls
```

Used on: `campaigns/[id]/calls`, `campaigns/[id]/leads`

---

## 7. Data Flow

### Campaign Creation

```
1. User fills CampaignDetailsStep (name, description, assistantId)
2. Assistant selected → fetch assistant variables from Bolna prompt
3. CampaignVariablesStep:
   - LEAD_AUTO_FIELDS filtered out (customer_name, customer_phone, phone, lead_source)
   - REQUIRED_VARIABLES validated: agent_name, project_short_description
   - project_short_description char limit: 100
   - Optional: brochure PDF upload → auto-fills matching variable fields
4. POST /api/campaigns with variables as JSON
```

### Lead Upload (Two-Phase)

```
Phase 1 — Preview (POST /api/campaigns/:id/parse-leads)
1. UploadLeadsModal → user picks file
2. Backend parses file, checks:
   - Missing phone (invalid)
   - Duplicates within the uploaded file itself
   - Duplicates against existing DB leads for this campaign
3. Backend returns ParseLeadsResult (no DB writes)
4. Frontend shows stats grid + duplicate breakdown

Phase 2 — Confirm (POST /api/campaigns/:id/upload)
5. User clicks "Import N Leads"
6. Backend re-parses + inserts only new (unique) leads
7. Backend enforces same dedup logic (race-condition safety)
8. Frontend closes modal + shows result toast
```

### Campaign Scheduling (Bolna Native Queue)

```
1. User clicks "Schedule" button → selects date/time via react-datepicker
2. Frontend sends POST /api/campaigns/:id/start { scheduledAt: "2024-06-05T16:35:00.000+05:30" }
3. Backend validates future date, sets Campaign.status = SCHEDULED, saves scheduledAt
4. processLeads() dispatches all calls IMMEDIATELY with scheduled_at in Bolna payload
5. Bolna queues calls internally, fires each at the scheduled time
6. First webhook (queued/initiated) transitions campaign SCHEDULED → RUNNING (+ startedAt)
7. Subsequent completion webhooks trigger checkScheduledCampaignCompletion()
   → When no active leads remain (PENDING or CALLING), campaign → COMPLETED
```

### Campaign Cancel Schedule

```
1. User clicks "Cancel Schedule" on a SCHEDULED campaign
2. POST /api/campaigns/:id/cancel-schedule
3. Backend:
   - Resets all Lead.status CALLING → PENDING
   - Deletes all Call records with status CALLING
   - Sets Campaign.status = DRAFT, scheduledAt = null
4. ⚠️ Warning returned: Bolna calls already queued may still fire (no Bolna cancel API)
```

### Call Lifecycle

```
makeCall(scheduledAt?)
  → Lead.status = CALLING
  → Call created (status=CALLING)
  → POST https://api.bolna.ai/call { ..., scheduled_at?: "ISO-8601" }
  → bolnaCallId stored on Call record

Webhook: queued/initiated → Call.status = CALLING (+ SCHEDULED → RUNNING transition)
Webhook: ringing         → no change
Webhook: in-progress     → Call.status = CALLING
Webhook: call-disconnected → no change (wait for completed)
Webhook: completed       → full processing (see above) + scheduled completion check
Webhook: no-answer       → COMPLETED with NO_ANSWER status + scheduled completion check
Webhook: busy            → BUSY + scheduled completion check
Webhook: failed          → FAILED + scheduled completion check
```

### Bolna Extraction → CallAnalysis

```
payload.extracted_data structure:
{
  "Call Outcome": {
    disposition:     { objective: "QUALIFIED_CONSULTANT_FOLLOWUP", ... }
    lead_temperature: { objective: "WARM", ... }
  }
  "Lead Qualification": {
    preferred_configuration: { subjective: "2 BHK", ... }
    budget_range:            { subjective: "under 80 lakhs", ... }
    purchase_timeline:       { objective: "NOT_SHARED", ... }
    purchase_purpose:        { objective: "NOT_SHARED", ... }
    location_match:          { objective: "MISMATCH", ... }
    customer_location_pref:  { subjective: "Banerjapur", ... }
  }
  "Next Action and Contact Preference": {
    preferred_next_action:    { objective: "CONSULTANT_CALL", ... }
    preferred_contact_channel:{ objective: "NOT_ASKED", ... }
  }
  "Follow-Up Schedule": {
    followup_schedule: { subjective: "tomorrow noon", ... }
  }
  "Compliance": {
    do_not_call:              { objective: "NO", ... }
    language_support_required:{ objective: "NO", ... }
  }
  "Summary": {
    call_summary: { subjective: "Customer is actively looking...", ... }
  }
}

Parsing rules:
- Enum fields  → read .objective → sanitizeEnum() → null if invalid
- Free text    → read .subjective → store as-is
- call_summary → read .subjective → stored in Call.summary
```

---

## 8. API Reference

### Auth

```
POST /api/auth/register    { tenantName, email, password, name }
POST /api/auth/login       { email, password }
GET  /api/auth/profile     (authenticated)
```

### Campaigns

```
GET    /api/campaigns
POST   /api/campaigns                   { name, description, assistantId, brochureId?, variables? }
GET    /api/campaigns/:id
PATCH  /api/campaigns/:id
POST   /api/campaigns/:id/parse-leads   (multipart — dry-run, returns stats WITHOUT saving)
POST   /api/campaigns/:id/upload        (multipart — CSV/XLS/XLSX file, persists leads)
POST   /api/campaigns/:id/start         { scheduledAt?: string }   // ISO 8601 with timezone
POST   /api/campaigns/:id/pause
POST   /api/campaigns/:id/cancel-schedule                          // Resets SCHEDULED → DRAFT
GET    /api/campaigns/:id/stats
```

### Calls

```
GET  /api/calls/stats          ?campaignId=&leadId=
GET  /api/calls                ?campaignId=&leadId=&status=&disposition=&leadTemperature=&dateFrom=&dateTo=&sortBy=&sortOrder=&page=&limit=
GET  /api/calls/:id
GET  /api/calls/:id/transcript
```

### Leads

```
GET  /api/leads/stats          ?campaignId=
GET  /api/leads                ?campaignId=&status=&doNotCall=&leadTemperature=&dateFrom=&dateTo=&sortBy=&sortOrder=&page=&limit=
GET  /api/leads/:id
```

### Dashboard

```
GET  /api/dashboard/overview
GET  /api/dashboard/activity
GET  /api/dashboard/campaigns
```

### Assistants

```
GET   /api/assistants
POST  /api/assistants
GET   /api/assistants/:id
PATCH /api/assistants/:id
```

### Brochures

```
POST /api/brochures/extract    (multipart — PDF)
POST /api/brochures/save
GET  /api/brochures
GET  /api/brochures/:id
POST /api/brochures/:id/confirm
```

### Webhooks

```
POST /webhooks/bolna    (no auth — Bolna posts here on call events)
```

---

## 9. Key Business Rules

### Lead Deduplication

- `@@unique([phone, campaignId])` in schema
- Backend checks existing phones before insert
- `createMany({ skipDuplicates: true })` as race condition safety net
- Frontend shows duplicate report after upload (via `parse-leads` dry-run)

### Do Not Call

- If `extracted_data.Compliance.do_not_call.objective === "YES"`:
  - `Lead.doNotCall = true`
  - Campaign start skips leads where `doNotCall = true`
- Displayed as red "DNC" badge in LeadsTable
- Displayed as "Do Not Call" badge on lead detail page

### Campaign Upload Rules

- Allowed statuses for upload: DRAFT, RUNNING, PAUSED, COMPLETED
- Blocked status: FAILED only
- Upload to COMPLETED campaign = add more leads for future re-run
- (Note: SCHEDULED upload is currently allowed at backend but discouraged — future
  enhancement will block it to prevent race with Bolna-queued calls)

### Campaign Scheduling (Bolna Queue-Based)

- Users can schedule campaigns using "Schedule for Later" with an ISO 8601 timestamp (`scheduledAt`).
- This initiates a non-blocking `processLeads()` dispatch instantly but passes `scheduled_at` to the Bolna API payload.
- Bolna queues calls and fires them at the designated time.
- During scheduled dispatch, Campaign status is `SCHEDULED`.
- The first Bolna webhook trigger (`queued` / `initiated`) transitions the campaign status to `RUNNING`.
- Canceling a scheduled campaign (`POST /cancel-schedule`) resets all leads with `CALLING` status back to `PENDING`, deletes `CALLING` call records, and resets campaign status to `DRAFT`.
- Cancel does NOT recall already-queued Bolna calls (Bolna has no cancel API).
- No cron / no scheduler service on our side — Bolna is the queue.

### Brochure Confirmation

- Brochure must have `isConfirmed = true` before it can be linked to a campaign
- Campaign creation validates this on backend

### Call Summary Source

- `Call.summary` = `extracted_data.Summary.call_summary.subjective`
- Bolna's own `payload.summary` string is ignored entirely

### Qualification Definition

Qualifying dispositions (used across dashboard + stats):

```
QUALIFIED_CONSULTANT_FOLLOWUP
SITE_VISIT_INTEREST
INTERESTED_SEND_DETAILS
INTERESTED_GENERAL
```

Disqualifying dispositions:

```
NOT_INTERESTED
DO_NOT_CALL
WRONG_NUMBER
ALREADY_PURCHASED
BROKER
CALL_ENDED_ABUSIVE
```

### Qualified Leads Filtering

- Frontend Quick Action cards link to `/campaigns/:id/calls?leadTemperature=HOT,WARM`
- Backend supports `leadTemperature` filter on both `GET /api/leads` and `GET /api/calls`
- Comma-separated: e.g. `?leadTemperature=HOT,WARM`
- For leads: filters via `calls.some.callAnalysis.leadTemperature { in: [...] }`
- For calls: filters via `callAnalysis.leadTemperature { in: [...] }` directly
- Frontend displays an amber filter chip on filtered pages with a clear (X) button

### Campaign Counter Behaviour

- `calledLeads` — incremented on every completed call (webhook)
- `failedLeads` — incremented on FAILED calls (webhook)
- `successLeads` — **auto-incremented when `leadTemperature ∈ {HOT, WARM}`** (webhook)
- `totalLeads` — incremented on successful CSV import

---

## 10. Enums Reference

### Disposition (CallAnalysis)

```
INTERESTED_SEND_DETAILS        Customer agreed to receive details
QUALIFIED_CONSULTANT_FOLLOWUP  Customer agreed to consultant callback
SITE_VISIT_INTEREST            Customer wants site visit
INTERESTED_GENERAL             Interested, no specific next step
FOLLOWUP_REQUESTED             Customer asked to be called back later
NOT_INTERESTED                 Customer declined
DO_NOT_CALL                    Customer asked not to be contacted
WRONG_NUMBER                   Reached wrong person
ALREADY_PURCHASED              Customer already bought property
BROKER                         Customer is a broker/channel partner
LANGUAGE_CALLBACK_REQUIRED     Needs callback in another language
CALL_ENDED_BY_CUSTOMER         Customer hung up abruptly
CALL_ENDED_ABUSIVE             Abusive call
NO_RESPONSE                    No response from customer
CALL_DROPPED                   Call disconnected unexpectedly
```

### LeadTemperature

```
HOT            Site visit, booking, buying within 3 months
WARM           Interested, agreed to callback, shared requirements
NURTURE        Open but not ready, timeline beyond 1 year
COLD           Not interested, DNC, already purchased
NOT_APPLICABLE Wrong number, broker, dropped, no conversation
```

### LeadStatus

```
PENDING        Not yet called
CALLING        Call in progress
CALLED         Call completed (status after completed webhook)
QUALIFIED      Legacy — not auto-set anymore
NOT_QUALIFIED  Legacy — not auto-set anymore
NO_ANSWER      No answer or busy
FAILED         Call or system failure
```

### CallStatus

```
PENDING    Not yet initiated
CALLING    In progress
COMPLETED  Finished successfully
FAILED     Error
NO_ANSWER  Lead did not answer
BUSY       Line was busy
```

### LocationMatch

```
MATCH          Customer's preferred location matches project
MISMATCH       Location mismatch
NOT_ASKED      Location not discussed
NOT_MENTIONED  AI returned this — valid enum value
```

### PurchaseTimeline

```
WITHIN_3_MONTHS / WITHIN_6_MONTHS / WITHIN_1_YEAR / AFTER_1_YEAR / FLEXIBLE / NOT_SHARED
```

### PurchasePurpose

```
OWN_USE / INVESTMENT / BOTH / NOT_SHARED
```

### PreferredNextAction

```
SEND_DETAILS / CONSULTANT_CALL / SITE_VISIT / FOLLOWUP_CALL / NONE
```

### ContactChannel

```
WHATSAPP / EMAIL / NOT_ASKED
```

### ExtractionFlag

```
YES / NO
```

### CampaignStatus

```
DRAFT / SCHEDULED / RUNNING / PAUSED / COMPLETED / FAILED
```

---

## 11. Environment Variables

### Backend (`express-backend/.env`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/voice-agent-mvp
JWT_SECRET=your-secret-key-min-32-chars
BOLNA_API_KEY=your-bolna-api-key
BOLNA_API_URL=https://api.bolna.ai
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 12. Known Patterns

### Adding a new backend endpoint

1. Add method to `*.service.ts`
2. Add handler to `*.controller.ts`
3. Register route in `*.routes.ts`
   - If route is `/stats` or similar fixed path, register BEFORE `/:id`
4. Add type to `src/types/bolna.types.ts` or backend types if needed

### Adding a new frontend API call

1. Add function to `src/lib/api/*.ts`
2. Add hook to `src/hooks/use*.ts`
3. Add type to `src/types/index.ts`
4. Use hook in page/component

### Adding a new extraction field from Bolna

1. Add to `BolnaExtractedData` interface in `bolna.types.ts`
2. Add to `ParsedCallAnalysis` interface in `bolna.types.ts`
3. Add field to `CallAnalysis` model in `schema.prisma`
4. If enum: add enum to schema + add to sanitizer constants in `webhook.handler.ts`
5. Add parsing logic in `parseExtractionData()` in `webhook.handler.ts`
6. Add to `CallAnalysis` interface in frontend `types/index.ts`
7. Run `prisma migrate dev` + `prisma generate`
8. Display in `calls/[id]/page.tsx` CallAnalysisSection

### Prisma schema change checklist

```
1. Edit prisma/schema.prisma
2. npx prisma migrate dev --name description_of_change
3. npx prisma generate (stop server first on Windows — EPERM issue)
4. Restart dev server
```

> ⚠️ On Windows: stop Express server before running `prisma generate`
> The DLL file is locked by Node.js and cannot be overwritten while running.

### V1 Migration Notes

The following are intentionally deferred to V1:

- SUPER_ADMIN with nullable tenantId
- Email verification flow
- Webhook signature verification (security)
- Domain error classes (AppError, NotFoundError etc.)
- Repository pattern (separate DB layer from business logic)
- Zod validation on all backend routes
- Structured logging (Winston/Pino)
- Rate limiting on API routes
- BullMQ — not needed (Bolna handles concurrency, including scheduling)
- LeadBatch model — per-upload batch tracking with independent stats
- Block lead upload on RUNNING and SCHEDULED campaigns (currently only FAILED is blocked)
- Retry failed leads per batch
- Batch-level pause/resume

---

This file covers every layer of the system. Any AI agent reading this can:

- Navigate to the exact file for any feature
- Understand data flow end to end (immediate + scheduled campaigns, two-phase lead upload)
- Know which enums exist and their valid values
- Follow the correct patterns for extending the system
- Avoid known pitfalls (route order, Windows EPERM, string rates, Bolna cancel limitations)
