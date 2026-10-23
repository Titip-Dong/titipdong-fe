---
name: design-review
description: Review titipdong-fe UI against DESIGN.md so pages stay consistent and do not look AI-generated - tokens, layout, components, states, copy, responsiveness, accessibility. Use after building or changing any page or component, before committing UI work, and when the user asks whether a screen is consistent.
---

# Design review

`DESIGN.md` is the source of truth. This skill checks a change against it; it never invents new rules. If a page
needs something `DESIGN.md` does not cover, propose the addition to the user and add it to `DESIGN.md` first.

If `DESIGN.md` does not exist yet, review against the "Design and UI" section of `AGENTS.md` and `/styleguide`, and
say that the review is provisional.

## 1. Collect

- The changed files: `git diff --name-only` (plus untracked files) under `src/`.
- The sections of `DESIGN.md` for the patterns those files use.

## 2. Check

Report each finding as `file:line`, the rule in `DESIGN.md` it breaks, and the fix.

**Tokens**

- No hardcoded colors (`#hex`, `rgb(`, Tailwind palette colors such as `bg-red-500`, `text-gray-600`):
  `git diff -U0 -- src | grep -nE "#[0-9a-fA-F]{3,8}\b|rgb\(|\b(bg|text|border|ring|fill|stroke)-(red|gray|slate|zinc|neutral|stone|blue|green|yellow|amber|orange|emerald|sky|indigo|violet|purple|pink|rose)-[0-9]"`
- Radii, spacing, type sizes, and shadows only from the scales in `DESIGN.md`; no arbitrary values (`p-[13px]`,
  `text-[17px]`) unless `DESIGN.md` allows them.
- Status colors only through `OrderStatusBadge` (orders) or the status components `DESIGN.md` names.

**Composition (the "AI UI" smells)**

- No grids of identical cards for data that is not products. Lists of orders, transactions, users, or payouts are
  rows or tables.
- No decorative gradients, glows, glassmorphism, emoji as icons, or icon-in-a-colored-circle feature rows unless
  `DESIGN.md` allows them.
- No generic hero with a centered headline + two buttons on inner pages; inner pages start with the task.
- No ALL-CAPS labels, no `→` in button text, no "Submit" / "Click here" / "Learn more".
- One primary action per view; secondary actions look secondary.
- Products lead with photos (`ProductImage`, `ProductTile`), with a real fallback when there is no photo.
- Money is right-aligned in tables, `tabular-nums`, formatted with `formatRupiah()`.

**States**

- Loading skeletons match the final layout; empty states invite an action; errors say how to fix the problem.
- Destructive or final actions use the confirmation dialog, never `window.confirm`.

**Copy**

- Casual Indonesian with "kamu", active voice, button labels that name the action. No English UI strings (except
  domain terms), no raw backend `detail` text.

**Responsive and accessible**

- No horizontal scroll at 360 px; touch targets at least 44 px on mobile.
- Every input has a label; icon-only buttons have `aria-label`; focus is visible; contrast meets AA (text on Rambu
  is always dark).

## 3. Look at it

Run `pnpm dev` and view the changed pages at phone width (360 px) and desktop width, with real data from the local
backend and with an empty account. Keep it cheap: one reduced-scale screenshot per width, zoom into a region only
when a detail needs it. Compare with the matching `/styleguide` sections. Say plainly when this step
could not be done.

## 4. Report

List findings grouped by severity (breaks `DESIGN.md` / inconsistent / polish), then fix the first two groups unless
the user only asked for a review.
