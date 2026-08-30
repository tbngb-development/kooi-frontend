# Frontend v1 Integration Plan

Great approach — update integration first, refactor architecture later. Here's the priority order and the files I need to see.

---

## Phase 1: Foundation (Must Update First)

These files affect **every API call** in the app. Update these first and everything else follows.

| #   | File                                    | Why                                                               |
| --- | --------------------------------------- | ----------------------------------------------------------------- |
| 1   | `lib/axios.ts`                          | Add `withCredentials`, remove Bearer interceptor, add 401 refresh |
| 2   | `store/authStore.ts`                    | New user shape (memberships, isPlatformAdmin)                     |
| 3   | `types/index.ts`                        | All shared types — response shapes, entities                      |
| 4   | `types/user.ts`                         | User/Membership types                                             |
| 5   | `types/api.ts`                          | ApiResponse, ApiError shapes                                      |
| 6   | `lib/api/auth.ts`                       | New paths + response handling                                     |
| 7   | `constants/api-routes/auth-endpoint.ts` | Route constants                                                   |
| 8   | `lib/axios-error-message.ts`            | New error shape parsing                                           |

## Phase 2: Auth UI

| #   | File                                    | Why                              |
| --- | --------------------------------------- | -------------------------------- |
| 9   | `hooks/useAuth.ts`                      | Login flow + tenant selection    |
| 10  | `components/auth/LoginForm.tsx`         | Handle `requiresTenantSelection` |
| 11  | `components/auth/RegisterForm.tsx`      | New response shape               |
| 12  | `app/(auth)/login/page.tsx`             | Tenant picker UI                 |
| 13  | `app/(auth)/register/page.tsx`          | Response handling                |
| 14  | `app/(admin-auth)/admin/login/page.tsx` | Admin login path                 |

## Phase 3: API Path Updates (Bulk)

| #   | File                    | Why                              |
| --- | ----------------------- | -------------------------------- |
| 15  | `lib/api/campaigns.ts`  | `/api/v1/campaigns`              |
| 16  | `lib/api/batches.ts`    | `/api/v1/campaigns/:id/batches`  |
| 17  | `lib/api/leads.ts`      | `/api/v1/leads`                  |
| 18  | `lib/api/calls.ts`      | `/api/v1/calls`                  |
| 19  | `lib/api/assistants.ts` | `/api/v1/assistants`             |
| 20  | `lib/api/dashboard.ts`  | `/api/v1/dashboard`              |
| 21  | `lib/api/users.ts`      | `/api/v1/users`                  |
| 22  | `lib/api/brochure.ts`   | `/api/v1/brochures` (pluralized) |
| 23  | `lib/api/tenants.ts`    | `/api/v1/admin/tenants`          |

## Phase 4: Hooks & Components

| #   | File                                        | Why                    |
| --- | ------------------------------------------- | ---------------------- |
| 24  | `hooks/useBatches.ts`                       | Response shape changes |
| 25  | `hooks/useCampaigns.ts`                     | Response shape changes |
| 26  | `components/campaigns/UploadLeadsModal.tsx` | Parse-leads response   |
| 27  | `components/campaigns/BatchActions.tsx`     | Batch lifecycle        |
| 28  | `components/layout/Sidebar.tsx`             | User info display      |
| 29  | `components/layout/Header.tsx`              | User info + logout     |

---

## Files I Need From You Now (Phase 1)

Please share these **8 files** so I can produce exact, copy-paste-ready updates:

```
1. src/lib/axios.ts
2. src/store/authStore.ts
3. src/types/index.ts
4. src/types/user.ts
5. src/types/api.ts
6. src/lib/api/auth.ts
7. src/constants/api-routes/auth-endpoint.ts
8. src/lib/axios-error-message.ts
```

Once I have these, I'll give you the complete updated versions with all v1 changes applied. Then we move to Phase 2 (auth UI), then Phase 3 (bulk path updates — which is mostly find-and-replace).
