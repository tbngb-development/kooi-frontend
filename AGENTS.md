# Kooi — V1 Frontend Architecture

> AI-powered lead qualification platform with autonomous voice agents.
> Multi-tenant SaaS built on Next.js 16, React 19, and TypeScript 5.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [AI Agent System](#2-ai-agent-system)
3. [Architecture Principles](#3-architecture-principles)
4. [Directory Structure](#4-directory-structure)
5. [Module Anatomy](#5-module-anatomy)
6. [Multi-Tenant Authentication](#6-multi-tenant-authentication)
7. [Data Flow](#7-data-flow)
8. [State Management](#8-state-management)
9. [API Layer](#9-api-layer)
10. [Error Handling](#10-error-handling)
11. [Scalability Roadmap](#11-scalability-roadmap)

---

## 1. System Overview

Kooi automates outbound lead qualification through AI voice agents. Property developers and real estate teams upload lead lists, configure AI agents with property brochures, and launch calling campaigns. The system autonomously dials leads, conducts natural-language qualification conversations, and scores each lead based on purchase intent, budget, timeline, and property preferences.

### Core Entities

| Entity                | Purpose                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **Agent (Assistant)** | AI voice persona powered by Bolna. Configured with voice, language, and qualification scripts. |
| **Brochure**          | Property document (PDF) parsed by AI into structured qualification criteria.                   |
| **Campaign**          | A calling initiative linking an Agent + Brochure + Lead Batches.                               |
| **Batch**             | A sequenced subset of leads within a campaign, with retry and scheduling controls.             |
| **Lead**              | A prospect record with phone, metadata, and qualification status.                              |
| **Call**              | A single voice interaction with transcript, analysis, and disposition scoring.                 |
| **Tenant**            | An isolated workspace (organization) with its own agents, campaigns, and team.                 |
| **User**              | A team member within a tenant (Owner, Admin, or User role).                                    |

### Platform Roles

| Role               | Scope                                                                            |
| ------------------ | -------------------------------------------------------------------------------- |
| **Platform Admin** | Cross-tenant oversight. Manages tenants, assigns agents, monitors system health. |
| **Tenant Owner**   | Full workspace control. Manages team, billing, agents, and campaigns.            |
| **Tenant Admin**   | Campaign and lead management. Can invite users and configure batches.            |
| **Tenant User**    | Read-only access to campaigns, leads, and call recordings.                       |

---

## 2. AI Agent System

The agent system is the core product differentiator. It bridges the Bolna AI voice platform with Kooi's campaign orchestration layer.

### 2.1 Agent Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   REGISTER   │────▶│     SYNC     │────▶│   ASSIGN     │────▶│   ACTIVE     │
│  (Admin)     │     │  (Bolna API) │     │  (Tenant)    │     │  (Campaign)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
     │                      │                     │                    │
     ▼                      ▼                     ▼                    ▼
  Platform Admin        Pulls latest          Tenant selects       Agent dials
  creates agent         config from           agent when           leads via
  record in DB          Bolna dashboard       creating campaign    batch runner
```

### 2.2 Agent Architecture

```
src/
├── types/assistant.ts          # Agent, AssistantDetail, BolnaAgent, configs
├── constants/api-routes/
│   ├── assistant-endpoint.ts   # Tenant read-only routes
│   └── admin/assistant-endpoint.ts  # Platform admin CRUD + sync
├── lib/api/
│   ├── assistants.ts           # Tenant: getAll, getById
│   └── admin/admin-assistants.ts   # Admin: register, sync, update, delete, bolnaAgents
└── hooks/
    ├── useAssistants.ts        # Tenant queries
    └── admin/useAdminAssistants.ts  # Admin mutations + Bolna agent registry
```

### 2.3 Agent Data Model

```typescript
// types/assistant.ts

interface Assistant {
  id: string;
  bolnaId: string; // External Bolna agent identifier
  name: string; // Display name within tenant workspace
  tenantId: string; // Workspace ownership
  config: AssistantConfig; // Voice provider, voice ID, language settings
  createdAt: string;
}

interface AssistantDetail {
  assistant: Assistant;
  variables: string[]; // Dynamic prompt variables extracted from Bolna config
}

interface BolnaAgent {
  id: string;
  agent_name: string;
  agent_type: string;
  created_at: string;
}
```

### 2.4 Agent-Campaign Integration

When a tenant creates a campaign, they select an agent. The agent's `variables` array defines the dynamic placeholders in the voice script (e.g., `{{project_name}}`, `{{city}}`, `{{starting_price}}`). These variables are populated from the linked brochure's extracted property data.

```
Campaign Creation Flow:
  1. Tenant selects Agent → frontend fetches AssistantDetail.variables
  2. Tenant selects Brochure → frontend loads extracted property fields
  3. Tenant maps variables → UI matches agent variables to brochure fields
  4. Campaign launches → backend passes resolved variables to Bolna per-call
```

### 2.5 Agent Administration (Platform Admin)

Platform admins manage the global agent registry:

| Operation          | Endpoint                                    | Purpose                                     |
| ------------------ | ------------------------------------------- | ------------------------------------------- |
| List Bolna Agents  | `GET /api/v1/admin/assistants/bolna-agents` | Fetch available agents from Bolna dashboard |
| Register Agent     | `POST /api/v1/admin/assistants/register`    | Create Kooi record linked to Bolna agent    |
| Sync Agent         | `POST /api/v1/admin/assistants/:id/sync`    | Pull latest config from Bolna               |
| Update Agent       | `PATCH /api/v1/admin/assistants/:id`        | Rename or reconfigure                       |
| Delete Agent       | `DELETE /api/v1/admin/assistants/:id`       | Revoke tenant access                        |
| List Tenant Agents | `GET /api/v1/admin/assistants?tenantId=`    | View agents assigned to a tenant            |

### 2.6 Future Agent Scalability

- **Agent Versioning**: Track config changes over time. Rollback to previous voice scripts.
- **Agent Cloning**: Duplicate a successful agent configuration across tenants.
- **Multi-language Agents**: Single campaign routing to language-specific agents based on lead metadata.
- **Agent A/B Testing**: Split batch traffic between two agent variants to optimize qualification rates.
- **Custom Agent Builder**: In-app voice script editor with real-time Bolna preview.

---

## 3. Architecture Principles

### 3.1 Entity-First Modularity

Every backend module maps to a frontend entity. Types, API clients, hooks, and constants are co-located by domain — not by technical layer.

```
❌ Monolithic (avoid)
   types/index.ts → 500+ lines of all entities
   lib/api/everything.ts → mixed concerns

✅ Entity-First (current)
   types/campaign.ts → campaign-specific types only
   lib/api/campaigns.ts → campaign API only
   hooks/useCampaigns.ts → campaign hooks only
   constants/api-routes/campaign-endpoint.ts → campaign routes only
```

### 3.2 Clean Admin Separation

Platform admin operations are physically isolated from tenant operations:

```
src/lib/api/
├── auth.ts              # Tenant auth
├── assistants.ts        # Tenant read-only
├── tenants.ts           # Tenant workspace
└── admin/
    ├── admin-auth.ts    # Platform admin login/logout
    ├── admin-tenants.ts # Cross-tenant management
    └── admin-assistants.ts # Agent registry + sync
```

### 3.3 No Barrel Files

Direct imports from entity-specific files. No `types/index.ts` re-export barrel. This eliminates IDE performance degradation and makes dependency graphs explicit.

```typescript
// ✅ Correct
import type { Campaign } from "@/types/campaign";
import type { ApiResponse } from "@/types/api";

// ❌ Forbidden
import type { Campaign, ApiResponse } from "@/types";
```

### 3.4 Centralized Configuration

All magic strings live in `constants/`:

| Concern            | Location                                            |
| ------------------ | --------------------------------------------------- |
| API version prefix | `constants/config/api-prefix.ts`                    |
| Route paths        | `constants/routes/app.routes.ts`, `admin.routes.ts` |
| API endpoints      | `constants/api-routes/*-endpoint.ts`                |
| React Query keys   | `constants/config/query-keys.ts`                    |
| Auth settings      | `constants/config/auth.config.ts`                   |

Changing the API version from `/api/v1` to `/api/v2` requires editing **one file**.

---

## 4. Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Tenant auth route group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (admin-auth)/             # Platform admin auth
│   │   └── admin/login/page.tsx
│   ├── (admin)/                  # Platform admin dashboard
│   │   └── admin/
│   │       ├── dashboard/page.tsx
│   │       └── tenants/
│   ├── (dashboard)/              # Tenant workspace
│   │   ├── dashboard/page.tsx
│   │   ├── campaigns/
│   │   ├── leads/
│   │   ├── call-history/
│   │   ├── assistants/
│   │   ├── settings/
│   │   └── users/
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # QueryClient + global providers
│   ├── error.tsx                 # Global error boundary
│   └── page.tsx                  # Landing page
│
├── types/                        # Per-entity TypeScript definitions
│   ├── api.ts                    # ApiResponse, Pagination, ApiError
│   ├── auth.ts                   # LoginInput, TokenPayload, LoginResponse
│   ├── user.ts                   # User, TeamMember, CreateUserInput
│   ├── tenant.ts                 # TenantRole, Membership, Tenant, TenantStats
│   ├── assistant.ts              # Assistant, AssistantDetail, BolnaAgent
│   ├── campaign.ts               # Campaign, CampaignStats, CampaignPerformance
│   ├── batch.ts                  # LeadBatch, RetryConfig, BatchStatus
│   ├── lead.ts                   # Lead, LeadDetail, LeadStats
│   ├── call.ts                   # Call, CallAnalysis, Disposition, TranscriptMessage
│   ├── brochure.ts               # Brochure, PropertyDetails, BrochureExtractionResult
│   └── dashboard.ts              # DashboardOverview, DashboardActivity
│
├── constants/
│   ├── config/
│   │   ├── api-prefix.ts         # API_PREFIX, API_PREFIXES
│   │   ├── auth.config.ts        # Session cookies, storage keys, messages, redirects
│   │   └── query-keys.ts         # QUERY_KEYS (centralized React Query keys)
│   ├── api-routes/
│   │   ├── auth-endpoint.ts      # AUTH_ENDPOINTS
│   │   ├── tenant-endpoint.ts    # TENANT_ENDPOINTS
│   │   ├── user-endpoint.ts      # USER_ENDPOINTS
│   │   ├── assistant-endpoint.ts # ASSISTANT_ENDPOINTS
│   │   ├── campaign-endpoint.ts  # CAMPAIGN_ENDPOINTS
│   │   ├── batch-endpoint.ts     # BATCH_ENDPOINTS
│   │   ├── lead-endpoint.ts      # LEAD_ENDPOINTS
│   │   ├── call-endpoint.ts      # CALL_ENDPOINTS
│   │   ├── brochure-endpoint.ts  # BROCHURE_ENDPOINTS
│   │   ├── dashboard-endpoint.ts # DASHBOARD_ENDPOINTS
│   │   └── admin/
│   │       ├── auth-endpoint.ts      # ADMIN_AUTH_ENDPOINTS
│   │       ├── tenant-endpoint.ts    # ADMIN_TENANT_ENDPOINTS
│   │       └── assistant-endpoint.ts # ADMIN_ASSISTANT_ENDPOINTS
│   └── routes/
│       ├── app.routes.ts         # APP_ROUTES (tenant navigation)
│       └── admin.routes.ts       # ADMIN_ROUTES (admin navigation)
│
├── lib/
│   ├── axios.ts                  # Shared Axios instance + refresh interceptor
│   ├── axios-error-message.ts    # Error normalization + validation extraction
│   ├── session-cookies.ts        # Session indicator cookie helpers
│   ├── campaign-draft.ts         # Campaign wizard draft state
│   ├── utils/
│   │   ├── cn.ts                 # Tailwind class merging
│   │   ├── formatDate.ts
│   │   └── formatDuration.ts
│   └── api/
│       ├── auth.ts               # Tenant auth API
│       ├── assistants.ts         # Tenant assistant queries
│       ├── campaigns.ts          # Campaign CRUD + parse
│       ├── batches.ts            # Batch lifecycle (create, run, stop, resume)
│       ├── leads.ts              # Lead queries + stats
│       ├── calls.ts              # Call queries + transcript
│       ├── brochures.ts          # Brochure extract, save, CRUD
│       ├── dashboard.ts          # Dashboard aggregation
│       ├── tenants.ts            # Workspace settings
│       ├── users.ts              # Team member management
│       └── admin/
│           ├── admin-auth.ts     # Platform admin login/logout
│           ├── admin-tenants.ts  # Cross-tenant CRUD
│           └── admin-assistants.ts # Agent registry + Bolna sync
│
├── hooks/
│   ├── useAuth.ts                # Tenant login, register, select-tenant, logout
│   ├── useAssistants.ts          # Tenant assistant queries
│   ├── useCampaigns.ts           # Campaign CRUD + parse hooks
│   ├── useBatches.ts             # Batch lifecycle hooks
│   ├── useLeads.ts               # Lead list + detail + stats
│   ├── useCalls.ts               # Call list + detail + stats
│   ├── useBrochure.ts            # Brochure extract, save, CRUD
│   ├── useDashboard.ts           # Dashboard overview, activity, campaigns
│   ├── useTenants.ts             # Workspace settings hooks
│   ├── useUsers.ts               # Team member CRUD
│   ├── useInvites.ts             # Invite generation
│   ├── useDebounce.ts            # Input debounce utility
│   ├── usePagination.ts          # Pagination state helper
│   └── admin/
│       ├── useAdminAuth.ts       # Platform admin login/logout
│       ├── useAdminTenants.ts    # Cross-tenant management
│       └── useAdminAssistants.ts # Agent registry + Bolna sync
│
├── store/
│   └── authStore.ts              # Zustand auth state (persisted)
│
├── components/
│   ├── ui/                       # Reusable primitives (Button, Card, Modal, etc.)
│   ├── layout/                   # Sidebar, Header, AdminSidebar
│   ├── auth/                     # LoginForm, RegisterForm
│   ├── assistants/               # AssistantCard, AssistantForm, AssistantModal
│   ├── campaigns/                # CampaignDetailsForm, BatchList, UploadLeadsModal
│   ├── leads/                    # LeadsTable, LeadStatusBadge
│   ├── call-history/             # CallsTable, TranscriptViewer, CallStatusBadge
│   ├── brochure/                 # BrochureUploader, BrochureReviewForm
│   ├── dashboard/                # StatsCard, ActivityFeed, CampaignPerformance
│   └── settings/                 # ProfileTab, SecurityTab, TeamTab, WorkspaceTab
│
├── styles/
│   └── globals.css               # Tailwind + custom design tokens
│
└── proxy.ts                      # Next.js middleware (RBAC + route protection)
```

---

## 5. Module Anatomy

Every entity follows the same four-layer pattern:

### Layer 1: Types (`src/types/<entity>.ts`)

Pure TypeScript interfaces and type aliases. No runtime code. Mirrors backend DTOs.

### Layer 2: Constants (`src/constants/api-routes/<entity>-endpoint.ts`)

Endpoint URL builders using the centralized `API_PREFIXES`. Static routes use strings; parameterized routes use functions.

```typescript
// Static
BASE: `${API_PREFIXES.TENANT}/campaigns`,

// Parameterized
BY_ID: (id: string) => `${API_PREFIXES.TENANT}/campaigns/${id}`,
STATS: (id: string) => `${API_PREFIXES.TENANT}/campaigns/${id}/stats`,
```

### Layer 3: API Client (`src/lib/api/<entity>.ts`)

Async functions that call `apiClient` (shared Axios instance). Each function handles response unwrapping and error throwing. No React dependencies.

```typescript
export const campaignsApi = {
  getAll: async (): Promise<Campaign[]> => {
    const res = await apiClient.get<ApiResponse<Campaign[]>>(
      CAMPAIGN_ENDPOINTS.BASE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaigns");
    }
    return res.data.data;
  },
};
```

### Layer 4: Hooks (`src/hooks/use<Entity>.ts`)

React Query wrappers around API functions. Handle caching, invalidation, loading states, and toast notifications. Use centralized `QUERY_KEYS`.

```typescript
export function useCampaigns() {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGNS.all,
    queryFn: campaignsApi.getAll,
  });
}
```

---

## 6. Multi-Tenant Authentication

### 6.1 Auth Flow

```
┌─────────┐    POST /auth/login    ┌──────────┐
│  Login   │───────────────────────▶│  Backend  │
│  Form    │                        │  (JWT)    │
└────┬─────┘◀───────────────────────└─────┬─────┘
     │  LoginResponse                     │ HttpOnly cookies
     │  { requiresTenantSelection,        │ (access_token,
     │    user, memberships }             │  refresh_token)
     ▼                                    ▼
┌─────────────────┐              ┌─────────────────┐
│ Single Tenant?  │──Yes────────▶│  Set session     │
│                 │              │  cookies + store │
└────┬────────────┘              └────────┬────────┘
     │ No                                 │
     ▼                                    │
┌─────────────────┐                       │
│ Tenant Select   │──User picks──▶────────┘
│ UI              │  workspace
└─────────────────┘
```

### 6.2 Session Architecture

| Layer              | Mechanism                                                               | Purpose                                                   |
| ------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| **Backend**        | HttpOnly cookies (`access_token`, `refresh_token`)                      | Secure JWT transport. Not accessible to JavaScript.       |
| **Frontend Store** | Zustand + `localStorage` (`auth-storage`)                               | User identity, memberships, active tenant. Non-sensitive. |
| **Middleware**     | Non-sensitive cookies (`has-session`, `user-role`, `is-platform-admin`) | Route protection at the Edge. Read by `proxy.ts`.         |

### 6.3 Token Refresh

The Axios interceptor in `lib/axios.ts` handles 401 responses automatically:

1. Queues all concurrent requests
2. Calls `POST /api/v1/auth/refresh` (cookie-based, no body)
3. Retries all queued requests with new tokens
4. Redirects to login if refresh fails

---

## 7. Data Flow

### 7.1 Campaign Execution Pipeline

```
User uploads CSV
       │
       ▼
  POST /campaigns/:id/parse-leads
       │
       ▼
  ParseLeadsResult (valid, duplicates, non-Indian filtered)
       │
       ▼
  POST /campaigns/:id/batches  (file + retryConfig)
       │
       ▼
  Batch created (status: CREATED)
       │
       ▼
  POST /campaigns/:id/batches/:batchId/run  (or /schedule)
       │
       ▼
  Backend dispatches to Bolna dialer
       │
       ▼
  Webhooks update call + lead status in real-time
       │
       ▼
  CallAnalysis AI scores each conversation
       │
       ▼
  Dashboard reflects qualification rates, dispositions, temperatures
```

### 7.2 Call Analysis Data Model

Each completed call generates a `CallAnalysis` record with AI-extracted fields:

| Field                    | Type   | Example                                                    |
| ------------------------ | ------ | ---------------------------------------------------------- |
| `disposition`            | Enum   | `INTERESTED_SEND_DETAILS`, `NOT_INTERESTED`, `DO_NOT_CALL` |
| `leadTemperature`        | Enum   | `HOT`, `WARM`, `NURTURE`, `COLD`                           |
| `purchaseTimeline`       | Enum   | `WITHIN_3_MONTHS`, `WITHIN_1_YEAR`                         |
| `budgetRange`            | String | `"80L - 1.2Cr"`                                            |
| `preferredConfiguration` | String | `"3 BHK"`                                                  |
| `locationMatch`          | Enum   | `MATCH`, `MISMATCH`                                        |
| `preferredNextAction`    | Enum   | `SITE_VISIT`, `CONSULTANT_CALL`                            |

---

## 8. State Management

### 8.1 Zustand (Auth Only)

The only global store is `authStore.ts`. It persists user identity and tenant selection across page navigations.

```typescript
interface AuthState {
  user: User | null;
  memberships: Membership[];
  activeTenantId: string | null;
  isAuthenticated: boolean;
  setAuth: (user, memberships) => void;
  setActiveTenant: (tenantId) => void;
  clearAuth: () => void;
  updateUser: (partial) => void;
}
```

### 8.2 React Query (Server State)

All server data is managed by TanStack React Query. No duplication in global stores.

| Pattern            | Implementation                                           |
| ------------------ | -------------------------------------------------------- |
| **Queries**        | `useQuery` with `QUERY_KEYS.*` for caching               |
| **Mutations**      | `useMutation` with `queryClient.invalidateQueries()`     |
| **Polling**        | Conservative intervals (15-30s) to prevent rate limits   |
| **Manual Refresh** | `RefreshButton` component triggers `invalidateQueries()` |

### 8.3 When to Add a New Store

Create a new Zustand store only when:

- Multiple unrelated components need the same **client-only** state
- Prop drilling exceeds 3 levels
- The state is **not** server-derived (if it comes from an API, use React Query)

---

## 9. API Layer

### 9.1 Shared Axios Instance

`lib/axios.ts` provides a single configured client:

- Base URL from `NEXT_PUBLIC_API_URL`
- 120s timeout (accommodates brochure PDF extraction)
- `withCredentials: true` (HttpOnly cookie transport)
- Automatic 401 refresh with request queuing
- Normalized error responses

### 9.2 Response Envelope

All backend responses follow the V1 envelope:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
  details?: ApiValidationError[];
}
```

### 9.3 Paginated Responses

List endpoints return paginated data:

```typescript
interface PaginatedLeadsResponse<T> {
  success: boolean;
  data: {
    leads: T[];
    pagination: { total: number; page: number; limit: number; pages: number };
  };
}
```

---

## 10. Error Handling

### 10.1 API Errors

`lib/axios-error-message.ts` normalizes errors from multiple sources:

1. V1 structured errors (`response.data.error`)
2. Validation field errors (`response.data.details[0].message`)
3. Machine-readable codes (`response.data.code`)
4. Network failures
5. Unknown exceptions

### 10.2 Error Boundaries

Next.js App Router error boundaries catch render-time crashes:

- `src/app/error.tsx` — Global catch-all with retry + dashboard redirect
- `src/app/(admin)/error.tsx` — Admin-specific with system retry

### 10.3 User-Facing Errors

All mutations display toast notifications via `sonner`:

- Success toasts on create/update/delete
- Error toasts with normalized messages on failure

---

## 11. Scalability Roadmap

### 11.1 Near-Term (V1.x)

| Initiative                 | Impact                                                         |
| -------------------------- | -------------------------------------------------------------- |
| **WebSocket Integration**  | Replace dashboard polling with real-time call/lead status push |
| **Agent Versioning**       | Track config history, enable rollback                          |
| **Batch Scheduling UI**    | Visual calendar for scheduled batch runs                       |
| **Lead Scoring Dashboard** | Aggregate CallAnalysis data into actionable insights           |
| **Webhook Event Log**      | Tenant-visible log of all Bolna webhook deliveries             |

### 11.2 Mid-Term (V2)

| Initiative                      | Impact                                             |
| ------------------------------- | -------------------------------------------------- |
| **Agent Marketplace**           | Pre-built agent templates for different industries |
| **Multi-channel Outreach**      | WhatsApp + Email follow-up sequences post-call     |
| **CRM Integrations**            | Salesforce, HubSpot, Zoho lead sync                |
| **Custom Disposition Taxonomy** | Tenant-defined qualification categories            |
| **Role-Based Feature Flags**    | Granular UI permissions per role                   |

### 11.3 Long-Term (V3)

| Initiative                      | Impact                                               |
| ------------------------------- | ---------------------------------------------------- |
| **Agent A/B Testing Framework** | Split traffic between agent variants                 |
| **Predictive Lead Scoring**     | ML model trained on historical CallAnalysis data     |
| **White-Label Deployment**      | Tenant-customizable branding and domains             |
| **Regional Data Residency**     | Tenant data isolated by geographic region            |
| **Plugin Architecture**         | Extensible middleware for custom post-call workflows |

### 11.4 Architecture Readiness

The current modular structure supports all roadmap items without structural refactoring:

- **New entities** → Add `types/<entity>.ts`, `lib/api/<entity>.ts`, `hooks/use<Entity>.ts`, `constants/api-routes/<entity>-endpoint.ts`
- **New admin features** → Add to `lib/api/admin/` and `hooks/admin/`
- **New integrations** → Add to `lib/api/integrations/` (future folder)
- **API version bump** → Change `API_PREFIX` in one file
- **New auth providers** → Extend `types/auth.ts` and `lib/api/auth.ts`

---

## Quick Reference

| Command            | Purpose                             |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Start development server            |
| `npm run build`    | Production build with type checking |
| `npm run lint`     | ESLint validation                   |
| `npx tsc --noEmit` | TypeScript type check only          |

| Environment Variable  | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: `http://localhost:3000`) |

---

_Last updated: 2026-08-31_
_Architecture version: V1.0_
