---
name: implement-page
description: Build or rebuild a page, form, or module component in titipdong-fe following the module layout, the generated API client, DESIGN.md, and docs/FLOWS.md. Use whenever adding or changing a route, page, form, list, detail view, or a component exported to another module.
---

# Implement a page

The flow comes from `docs/FLOWS.md` and the backend feature docs; the look comes from `DESIGN.md`; the contract comes
from `src/api/generated/`. If the `understand-flow` summary for this page has not been written in this conversation,
do that first.

## 1. Ground yourself

1. Read the module's existing files in `src/features/<module>/` and one finished page from another module. Copy
   their shape (named `Component` export, hooks in `hooks/`, schemas in `schemas.ts`).
2. Read `DESIGN.md` for the patterns this page uses (layout, list, form, states, dialogs, copy). If `DESIGN.md`
   does not exist yet, use the "Design and UI" section of `AGENTS.md` and the `/styleguide` page, and say so.
3. Before using any hook, type, component, or helper, confirm it exists:
   - generated: `grep -rn "export function useX\|export const useX" src/api/generated/endpoints/`
   - shared: `ls src/components src/components/ui src/lib`, then read the file.
   - another module: only what its `index.ts` exports.
     Never assume a helper exists because another module has a similar one.

## 2. Build

- **Files**: pages in `src/features/<module>/pages/<Name>Page.tsx` with `export function Component()`, registered in
  `src/app/router.tsx` with `lazy: () => import(...)` under the right guard. Module components in `components/`,
  query/mutation wrappers in `hooks/`. Only touch your module's folder; changes to `src/components/`, `src/app/`,
  `src/lib/`, `src/stores/`, `src/index.css`, or `src/api/client.ts` need the user's go-ahead first.
- **Cross-module**: import only from `@/features/<module>`. A component used on another module's page is exported
  from its own module's `index.ts`. Inside a module, use relative imports.
- **Data**: generated hooks only. Never hand-write fetch calls or request/response types (the one exception is the
  `PUT` to a blob `uploadUrl`). Server data stays in TanStack Query; never copy it into Zustand or `useState`.
- **Forms**: React Hook Form with the generated Zod schema from `@/api/generated/zod/...` as the resolver
  (`zodResolver`). Extend it only for UI-only fields. Map 422 `errors[]` to field errors.
- **Mutations**: invalidate the queries listed in `docs/FLOWS.md` §8 on success. On 409, invalidate the affected
  order or trip and explain that the state changed. Disable the submit button while pending.
- **States**: every data view handles loading (skeleton matching the final layout), empty (invite an action), error
  (say what to do), and not found (404). Use the shared state components once they exist.
- **Role and status**: show actions from the status table in `docs/FLOWS.md` §4, comparing the user's ID with
  `order.buyer.id` / `order.jastiper.id`. Guards are UX only: never hide a check the backend does not make.
- **Money**: integers from the API, rendered with `formatRupiah()` and `tabular-nums`. Never compute totals, fees,
  or balances.
- **Dates**: `formatDate()`; deadlines and countdowns from the API fields (`paymentDeadline`, `requestDeadline`).
- **Uploads**: the shared upload helper (`docs/FLOWS.md` §8, `AGENTS.md` File uploads), with the right `purpose`.
- **Destructive or final actions** (cancel, reject, confirm receipt, decide dispute, suspend): a confirmation dialog
  that names the consequence, never `window.confirm`.
- **Copy**: casual Indonesian with "kamu"; buttons name the action ("Bayar sekarang", "Tolak titipan"). Backend
  `detail` strings are English: map status codes to Indonesian with `errorMessage()`.
- **Accessibility**: real `<button>`/`<a>`, labels on every input, visible focus, AA contrast, no horizontal scroll
  at 360 px.

## 3. Check the result

- Run the `design-review` skill on the changed pages.
- Start the backend (`make db-up`, `make seed` in `../titipdong-be`) and `pnpm dev`, then walk the journey with the
  demo accounts (`buyer@`, `jastiper@`, `admin@titipdong.test`, password `demo12345`), including one error path
  (for example a 409 from acting on a stale order).
- If the page changed a flow, update `docs/FLOWS.md`.

## 4. Finish

Use the `finish-and-commit` skill.
