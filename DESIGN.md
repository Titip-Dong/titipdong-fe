# TITIP DONG design system

How TITIP DONG looks, moves, and talks. Every page follows this file; `/styleguide` is its living version. A pattern
that is not here is added here first, after the team agrees, and only then used in a page.

Last updated: 2026-10-17.

## 1. Direction

**Fun but simple.** Shopping with a jastiper should feel light and friendly, and paying should feel safe.

- **Products are the star.** Photos lead; the interface stays quiet around them.
- **Bold, not loud.** Few colors used confidently: solid Merah, bold headings, plenty of Kertas.
- **Flat.** No 3D, no depth effects, no gradients. Shapes are solid fills with clear edges.
- **Fun comes from moments, not decoration.** Titi, short celebrations, and warm copy carry the personality.
  Static screens stay calm.
- **Trust is always visible.** Wherever money is involved, the screen says where the money is and what happens next.

References: Depop (product photos first, a red brand used sparingly), Monzo (friendly copy around money), Tokopedia
(soft, familiar mascot style), Duolingo (celebration moments). We take one idea from each, not their look.

## 2. Never do this

These make a screen look generated or generic. `design-review` checks for them.

- Gradients, glows, glass or blur effects, neon, or decorative blobs.
- 3D effects: pressable buttons with a bottom edge, long or hard shadows, bevels, inner shadows.
- Untouched shadcn defaults: tinted buttons (pale background with colored text), thin dialog titles, gray dialog
  footers. Every primitive in `src/components/ui/` follows this file, not the library's look.
- A mascot or illustration hanging half outside its container.
- Grids of identical cards for data that is not products (orders, payouts, users, stats). Use rows or tables.
- Feature rows of an icon in a colored circle with a title and two lines of text.
- Centered hero with a headline and two buttons on any page other than the landing page.
- Emoji as icons, stock illustrations, or more than one mascot appearance per screen.
- ALL-CAPS labels, `→` in button text, "Submit", "Klik di sini", "Pelajari lebih lanjut".
- More than one primary button in the same view.
- Pill-shaped buttons; large radii on cards (`rounded-3xl`) outside the landing hero.
- Hardcoded colors (`#hex`, `rgb()`, Tailwind palette colors such as `bg-red-500`) in components.
- `window.confirm`, `alert`, or raw backend `detail` text in the UI.
- Animation that loops forever on a working screen, or that delays the user.

## 3. Color

Tokens live in `src/index.css`. Use the semantic utility (`bg-primary`), never the raw value.

| Name       | Value     | Token / utility                        | Use                                                                           |
| ---------- | --------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| Merah      | `#DD010F` | `primary`, `ring`                      | Brand, the one primary action per view, links, trust signals                  |
| Tinta      | `#161616` | `foreground`                           | Text, icons, Titi's face                                                      |
| Kertas     | `#FFFFFF` | `background`, `card`, `popover`        | Clean white: page, cards, receipts, inputs, dialogs. Never cream or warm gray |
| Garis      | `#E6E6E6` | `border`                               | Borders and dividers; they separate white surfaces                            |
| Rambu      | `#F5C400` | `highlight` (+ `highlight-soft`)       | Attention only: waiting states, deadlines. Always with dark text              |
| Cap        | `#8F1420` | `destructive`                          | Errors, disputes, destructive actions. Never for brand actions                |
| Merah muda | `#FDECED` | `secondary` (+ `secondary-foreground`) | Soft brand surfaces: escrow notes, selected chips, receipt footer             |
| Abu        | `#F4F4F4` | `muted` (+ `muted-foreground #5C5C5C`) | Neutral quiet surfaces, secondary text, final statuses                        |

Rules:

- **Merah is precious.** One primary button per view, plus small trust signals. Full-red surfaces with white text
  appear only on the landing hero.
- **Rambu never carries text color** and never fills a large area; it marks something waiting for the user.
- **Status colors come only from `OrderStatusBadge`** (orders) and the status components in §8.
- Contrast: body text on Kertas and white on Merah meet WCAG AA. Muted text is for secondary information
  only, never for something the user must read to act.
- Charts (admin) use `chart-1` … `chart-5` in that order.
- Light mode only for now. The `.dark` tokens stay in `src/index.css` but no page is designed or tested for them.

## 4. Typography

Plus Jakarta Sans for everything. `h1`–`h3` get the extra-bold heading style automatically (`font-heading`,
`tracking-tight`, `text-balance`).

| Role            | Classes                               | Where                                     |
| --------------- | ------------------------------------- | ----------------------------------------- |
| Display         | `text-4xl sm:text-5xl font-extrabold` | Landing hero only                         |
| Page title (h1) | `text-3xl sm:text-4xl`                | One per page                              |
| Section (h2)    | `text-xl sm:text-2xl`                 | Sections inside a page                    |
| Subsection (h3) | `text-lg`                             | Card and panel titles                     |
| Body            | `text-base`                           | Default text                              |
| Small           | `text-sm`                             | Meta lines, helper text, table cells      |
| Caption         | `text-xs`                             | Timestamps, fine print; never for actions |

- Weights: headings extra-bold (automatic), labels and product names `font-medium`, buttons `font-semibold`, money
  totals `font-semibold`.
- Money always `tabular-nums` and `formatRupiah()` ("Rp 150.000"); right-aligned in tables and price breakdowns.
- Dates with `formatDate()` ("26 Sep 2026") or `formatDateTime()`. Relative time ("2 jam lagi") only for deadlines.
- Line length: body text at most `max-w-prose`.

## 5. Shape, space, and layout

### Radius

`--radius` is `0.375rem` (6 px). Use the scale, never arbitrary values.

| Utility        | Size   | Use                                                       |
| -------------- | ------ | --------------------------------------------------------- |
| `rounded-md`   | ~5 px  | Buttons, chips, small tags                                |
| `rounded-lg`   | 6 px   | Inputs, selects, product photos in lists                  |
| `rounded-xl`   | ~8 px  | Cards, panels, receipts, dialogs, product photos in tiles |
| `rounded-2xl`  | ~11 px | Landing hero only                                         |
| `rounded-full` | pill   | `OrderStatusBadge`, avatars, notification count           |

### Borders and elevation

Flat. Surfaces are white and separated by `border` (Garis), or by an Abu surface. No shadows on cards or buttons. The only
shadow is the default one on floating layers (dropdowns, popovers, dialogs, toasts), so they read above the page.

### Spacing

Tailwind's 4 px scale. Common steps:

- Page gutter `px-4` (phone), `sm:px-6`; page top/bottom `py-6 sm:py-10`.
- Between page sections `space-y-8 sm:space-y-10`; inside a section `space-y-4`; inside a card `p-4 sm:p-5`.
- Form fields `gap-4`; label to input `gap-1.5`.

### Page widths

| Width   | Class       | Pages                                                   |
| ------- | ----------- | ------------------------------------------------------- |
| Narrow  | `max-w-xl`  | Login, register, profile, forms, pay page               |
| Default | `max-w-5xl` | Lists, trip detail, order detail, wallet, notifications |
| Wide    | `max-w-6xl` | Landing, admin                                          |

### Breakpoints (mobile-first, Tailwind defaults)

Design at **360 px** and **1280 px**; everything must work in between without horizontal scroll.

| Breakpoint | Width     | Changes                                                                                             |
| ---------- | --------- | --------------------------------------------------------------------------------------------------- |
| base       | 360–639   | One column; bottom navigation for Pembeli and Jastiper; the main action sits in a sticky bottom bar |
| `sm`       | ≥ 640 px  | Product grids go from 2 to 3 columns                                                                |
| `md`       | ≥ 768 px  | Top navbar replaces bottom navigation; long lists become tables                                     |
| `lg`       | ≥ 1024 px | Two-column layouts (receipt left, timeline and actions right); admin sidebar                        |
| `xl`       | ≥ 1280 px | Content stops growing at its page width                                                             |

Touch targets are at least 44 × 44 px below `md`.

### App shell

Built in `src/components/layout/` (`MainLayout`, `Navbar`, `BottomNav`, items in `navigation.ts`).

- **Visitor**: top bar with logo, "Cari trip", "Masuk", "Daftar".
- **Pembeli / Jastiper, phone**: slim top bar (logo, notification bell, account menu with "Keluar") and a bottom
  navigation with at most 4 items. Pembeli: Beranda, Cari trip, Titipan, Profil. Jastiper: Trip saya, Titipan
  masuk, Saldo, Profil.
- **Pembeli / Jastiper, `md` and up**: the same items in the top navbar (Profil lives in the account menu).
- **Admin**: notification bell and account menu in the top bar; the admin area has a sidebar from `lg` and a sheet
  menu below it; functional and dense, no Titi.
- After login, users land on their role home (`roleHome` in `src/lib/roles.ts`) unless they came from a guarded page.

## 6. Icons and imagery

- Icons: `lucide-react`, outline style, default stroke. `size-4` inline with text, `size-5` in buttons and
  navigation. Icon-only buttons always have `aria-label`.
- **Product photos** (`ProductImage`, `ProductTile`): square (`aspect-square`), `object-cover`, on `muted` while
  loading. Without a photo: a tinted surface with a shopping bag icon (the existing fallback). Never stretch or
  letterbox.
- Trip lists show item thumbnails when the API provides them (open question in `docs/PLAN.md` §6).
- No stock photos and no illustrations other than Titi.

## 7. Titi (mascot)

A shopping bag with a face: `<Titi pose="..." />` from `src/components/Titi.tsx` (`inverted` for red surfaces,
`decorative` to hide it from screen readers).

**Look** (flat, no outline, no highlight, no shadow):

| Part                 | Color                            |
| -------------------- | -------------------------------- |
| Body                 | Merah                            |
| Arms, feet, top fold | Merah mixed with 22% black       |
| Strap                | Rambu, with two Kertas rivets    |
| Eyes, mouth          | Tinta; eyes have a white sparkle |
| Cheeks               | Merah mixed with 55% white       |
| Inverted variant     | Kertas body, for red surfaces    |

The shape must read as a paper shopping bag: flat top edge with a fold, one strap with rivets, taller than wide,
rounded bottom corners. Colors are derived from tokens with `color-mix`, never hardcoded.

**Poses**

| Pose       | Use                                                      | Prop and motion                    |
| ---------- | -------------------------------------------------------- | ---------------------------------- |
| `menyapa`  | Landing, onboarding, first login                         | Waves                              |
| `senang`   | Payment done, item received, funds released, payout paid | Arms up, jumps                     |
| `bingung`  | Empty states, empty search results, 404                  | Question mark, floats              |
| `menunggu` | Waiting for approval or payment                          | Ticking clock, taps a foot         |
| `khawatir` | Errors, disputes                                         | Sweat drop, worried brows, shivers |
| `tidur`    | Closed or completed trips                                | Closed eyes, rising "z", breathes  |

**Rules**

- At most one Titi per screen. Never in forms, tables, the admin area, or next to a primary action it would
  compete with.
- Titi always sits fully inside its container; never half outside an edge.
- Titi only moves on screens where it is the focus (empty, success, 404). In dialogs, toasts, and inline use it is
  `still`.
- Sizes: `size-24` on phones, up to `size-36` from `lg` (empty states, success screens); `size-12` inline in a
  notification or toast.
- Titi is decorative: the message next to it must make sense without it (`aria-hidden` when the text says it all,
  otherwise a short `aria-label`).

## 8. Components

Shared components live in `src/components/`; base primitives are shadcn in `src/components/ui/`. Use these before
building anything new.

| Component                              | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                               | Solid blocks like the logo, bold labels, never a tinted background. `default`: solid Merah, the one primary action. `secondary`: white with a 2 px Tinta border, fills Tinta on hover. `outline`: white with a Garis border, the quiet choice ("Kembali", "Batal"). `ghost`: text only. `destructive`: solid Cap with white text (cancel, reject, dispute). `link`. Sizes `default` (h-10), `lg` (h-12, action bar, dialogs, hero), `sm` (dense rows). Flat; the 1 px press nudge is the only press effect. Labels name the action |
| `Input`, `Textarea`, `Select`, `Field` | Label above, helper or error below. Errors in `text-destructive` with `aria-invalid`. Required fields are the default; mark optional ones "(opsional)"                                                                                                                                                                                                                                                                                                                                                                             |
| `OrderStatusBadge`                     | The only way to show an order status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `Receipt`                              | Nota titipan: item and price breakdown above `ReceiptPerforation`, payment state and actions below. Used for order detail and the pay page                                                                                                                                                                                                                                                                                                                                                                                         |
| `ProductImage`, `ProductTile`          | Every product, everywhere                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `Badge`                                | Small solid tags (`rounded-md`, semibold): `default` Merah, `secondary` Tinta, `outline` Tinta border, `destructive` Cap. Never for order status (use `OrderStatusBadge`)                                                                                                                                                                                                                                                                                                                                                          |
| `Avatar`                               | Merah circle with bold white initials                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `Card`                                 | Grouping on a page (`rounded-xl border bg-card`, extra-bold title), not for list items of non-product data                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Table`                                | Admin lists and wallet history from `md`; bold header row on a 2 px Tinta rule; becomes stacked rows below `md`                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Tabs`                                 | Underlined like the navbar (active tab bold with a Merah line), scrolls sideways on phones. For switching views of the same thing (order list by status), not navigation between pages                                                                                                                                                                                                                                                                                                                                             |
| `Dialog`                               | Confirmation of destructive or final actions; forms that are short (≤ 3 fields). Extra-bold title, no gray footer, overlay Tinta at 40% without blur                                                                                                                                                                                                                                                                                                                                                                               |
| `Sheet`                                | Mobile menus and filters; extra-bold title, same overlay as dialogs                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Skeleton`                             | Loading; shaped like the content it replaces                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Sonner` (toast)                       | Tinta with white semibold text; Cap for errors. Light theme only, no per-type colors. Short feedback after an action ("Titipan disetujui."); never for errors the user must fix in a form                                                                                                                                                                                                                                                                                                                                          |

TITIP DONG building blocks (all shown in `/styleguide`):

| Component                                                   | Rules                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EmptyState`, `ErrorState`, `PageState`                     | Empty (Titi `bingung`), error (Titi `khawatir`, "Coba lagi"), and not-found blocks; adapt to their container's width                                                                                                                                                                                       |
| `ListSkeleton`                                              | Loading state for row lists                                                                                                                                                                                                                                                                                |
| `LoadMore` + `useCursorList` (`src/lib/pagination.ts`)      | Every cursor list: "Muat lagi" under the rows, hidden when there is no next page                                                                                                                                                                                                                           |
| `ConfirmDialog`                                             | Every destructive or final action: a still Titi inside the dialog above the title (`khawatir` when destructive), extra-bold question, one-sentence consequence, large buttons (stacked on phones, action first). Focus starts on "Kembali". Pass `mutateAsync` so it stays open while pending and on error |
| `ImageUploadField` (+ `uploadImage` in `src/lib/upload.ts`) | Every photo input: validates type and size, uploads right away, reports the upload ID                                                                                                                                                                                                                      |
| `ActionBar`                                                 | The page's main action; sticks above the bottom navigation on phones, inline from `md`                                                                                                                                                                                                                     |
| `Deadline`                                                  | Payment and request deadlines; Rambu in the last 24 hours                                                                                                                                                                                                                                                  |
| `EscrowNote`                                                | Next to every amount the user pays or receives                                                                                                                                                                                                                                                             |
| `NotificationBell` (F07)                                    | Polls the unread count every 30 s while the tab is visible                                                                                                                                                                                                                                                 |

## 9. Patterns

- **List → detail.** Lists are rows with the product photo (or the trip's first item) on the left, the key facts in
  the middle, status or amount on the right. A row is one link.
- **Order detail.** `Receipt` first; below the tear line exactly the actions for the current status and role
  (`docs/FLOWS.md` §4); the timeline after it. Two columns from `lg`.
- **Money and trust.** Next to every amount the user pays or receives, a one-line escrow note in `secondary`
  surface with a shield icon: where the money is and when it moves.
- **Deadlines.** Payment deadline and request deadline show date and relative time; under 24 hours the note turns
  Rambu.
- **Forms.** One column; the primary button at the end (sticky on phones for long forms); a pending button shows a
  spinner and stays disabled.
- **Destructive or final actions.** A dialog that states the consequence in one sentence, a Cap (destructive)
  button that repeats the action ("Batalkan titipan"), and "Kembali" as the safe choice.
- **Empty states.** Titi `bingung`, one line on what is missing, one button that fixes it.
- **Errors.** What went wrong in plain words and what to do; 409 refetches and explains the new state; 404 offers a
  way back.
- **Uploads.** A square drop area with the shopping bag fallback, the photo preview after upload, progress while
  sending, "Ganti foto" and "Hapus" afterwards.

## 10. Motion

Motion gives feedback and celebrates; it never decorates a static screen.

- **CSS first.** Hover, focus, opening dialogs and sheets, skeletons: CSS transitions and `tw-animate-css`,
  150–200 ms, ease-out.
- **Motion library for moments.** Add `motion` (import from `motion/react`, with `LazyMotion`) only when the first
  celebration is built.
- **Celebrations** (short, once, never blocking):

  | Moment                         | Animation                                         |
  | ------------------------------ | ------------------------------------------------- |
  | Payment done                   | "LUNAS" stamp lands on the receipt; Titi `senang` |
  | Item received / funds released | Titi `senang` jumps; amount counts up once        |
  | Order approved                 | The price appears on the receipt                  |
  | New notification               | The bell swings once; the badge pops              |
  | Order status changes           | The new timeline step slides in                   |

- Titi's idle animations (wave, float) run only on screens where Titi is the focus (empty, success, 404).
- `prefers-reduced-motion`: `src/index.css` already shortens every animation; Motion components also check
  `useReducedMotion()` and show the end state.

## 11. Copy

- Casual Indonesian with "kamu", active voice, short sentences. Friendly, never cute at the cost of clarity.
- Buttons name the action: "Titip barang ini", "Bayar sekarang", "Barang sudah diterima", "Tolak titipan".
- Errors: what happened + how to fix it ("Fotonya lebih dari 5 MB. Pilih foto yang lebih kecil, ya.").
- Empty states invite the next step ("Belum ada titipan. Cari trip yang cocok, yuk.").
- Money copy is precise: say who holds the money and when it moves.
- Glossary (use exactly these words):

  | Term          | Meaning                             |
  | ------------- | ----------------------------------- |
  | titipan       | An order                            |
  | nota titipan  | The order receipt                   |
  | trip          | A jastiper's trip                   |
  | fee jastip    | The jastiper's service fee          |
  | biaya layanan | The 5% platform fee                 |
  | dana ditahan  | Money in escrow                     |
  | saldo         | The jastiper's wallet balance       |
  | pencairan     | Payout                              |
  | sengketa      | Dispute (button: "Ajukan sengketa") |

## 12. Accessibility

- Visible focus on everything interactive (`focus-visible:ring-3 ring-ring/50`, already in the primitives).
- Real `<button>` and `<a>` elements; every input has a `<Label>`; icon-only buttons have `aria-label`.
- Status is never color alone: badges carry text, errors carry an icon or text.
- No horizontal scroll at 360 px; text can zoom to 200% without breaking layout.
- AA contrast for text; text on Rambu is always Tinta.

## 13. Changing this file

Propose the change to the team with a `/styleguide` example, update this file and the styleguide in the same
commit, then use it in pages.
