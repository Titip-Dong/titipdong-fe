---
name: understand-flow
description: Study the business flow behind a titipdong-fe page or feature before building it - docs/FLOWS.md, the backend feature docs, and the generated contract - and write back a short flow summary with open questions. Use before implementing or redesigning any page, form, or user journey, and whenever the user asks how a flow works.
---

# Understand the flow first

No page is built before its flow is understood. The output of this skill is a short written summary the user can
check, not code.

## 1. Read, in this order

1. `docs/FLOWS.md`: the section for the module, the status table (§4) when orders are involved, and §8 (shared
   mechanics, invalidation table).
2. The backend feature doc: `../titipdong-be/docs/features/<module>.md`. Read "Business rules", "Endpoints", and
   the sequence diagrams for the operations this page calls. Cross-module journeys are in
   `../titipdong-be/docs/features/README.md`; scope decisions in `../titipdong-be/docs/PLAN.md` §2 and §7.
3. The contract: for every operation the page will call, open the generated hook and its types.
   - Hooks: `grep -n "export function use<Name>\|export const use<Name>" src/api/generated/endpoints/<tag>/<tag>.ts`
   - Types: `src/api/generated/model/<name>.ts`; Zod schemas: `src/api/generated/zod/<tag>/<tag>.zod.ts`.
   - Every `/admin/*` operation is under the `admin` tag, whichever module owns it.
4. The existing code for the module: `src/features/<module>/` (pages, components, hooks, `index.ts`) and the route in
   `src/app/router.tsx`.

If `../titipdong-be` is missing, say so and continue from `docs/FLOWS.md` and `openapi/openapi.json` only.

## 2. Check for drift

- A hook, field, enum value, or status in `docs/FLOWS.md` that is not in `src/api/generated/`: the generated client
  may be stale. Run the `api-sync` skill or tell the user.
- The backend doc and `docs/FLOWS.md` disagree on a rule: the backend doc wins. Note it and fix `docs/FLOWS.md` in
  the same change.
- The flow needs something the API does not offer (a field, a filter, an endpoint): stop and report it as a backend
  gap. Never work around it in the frontend (no client-side totals, no fetching every page to filter, no guessing).
- Out of scope, never build: Midtrans or any real gateway, email, KYC, courier tracking, multi-role users, partial
  refunds.

## 3. Write the summary (to the user, before coding)

Keep it short and concrete:

```
Flow: <journey name> (<module IDs>)
Who: <role(s)>        Route: <path>        Entry points: <where the user comes from>
Steps:
  1. <user action> → <hook> → <result / next screen>
States to show: loading, empty, error, and per status: <status → what is shown / which actions>
Errors: 404 <meaning here>, 409 <meaning here>, 422 <fields>
Invalidate after mutations: <query keys>
Uploads: <purpose> or none
Open questions: <anything ambiguous, or "none">
```

Ask the user to resolve open questions that change the screen. Then build with the `implement-page` skill.
