# Next.js + Tailwind v4 App Reference

Captured from building [Quick Notes](https://github.com/oomaar/next-quick-notes-app). Use as a starter checklist for a new project — copy the snippets, adjust the tokens.

---

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** (`forwardRef` still works, but watch the `react-hooks/set-state-in-effect` rule — see §10)
- **Tailwind CSS v4** (CSS-first, no `tailwind.config.js`)
- **TypeScript** strict
- **framer-motion** — modal/animation enter+exit
- **react-hook-form** — forms with `useFieldArray` for dynamic lists
- **@heroicons/react** — icon set (`/24/outline` for nav, `/24/solid` if you need fills)

---

## 1. Project setup

### `postcss.config.mjs`

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### `app/globals.css`

The CSS variable scheme is the whole theme. Add `@custom-variant dark` so `dark:` utilities trigger off a class, not `prefers-color-scheme`. Register the CSS vars with `@theme inline` so Tailwind utilities like `bg-surface` work everywhere.

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #ffffff;
  --foreground: #171717;
  --surface: #fafafa;
  --border: #e5e5e5;
  --muted: #737373;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  --surface: #171717;
  --border: #262626;
  --muted: #a3a3a3;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

### `app/icon.svg`

Drop a square SVG (≥ 64×64 internal viewBox) at `app/icon.svg`. Next.js auto-wires `<link rel="icon" type="image/svg+xml">` in `<head>`. Delete `app/favicon.ico` so you have a single source of truth.

---

## 2. Theme tokens

### Color palette

| Token         | Light     | Dark      | Use                              |
| ------------- | --------- | --------- | -------------------------------- |
| `background`  | `#ffffff` | `#0a0a0a` | page background                  |
| `foreground`  | `#171717` | `#ededed` | primary text, primary button bg  |
| `surface`     | `#fafafa` | `#171717` | cards, navbar, sidebar, inputs   |
| `border`      | `#e5e5e5` | `#262626` | dividers, input borders          |
| `muted`       | `#737373` | `#a3a3a3` | secondary text, placeholder      |

### Accent colors (Tailwind built-ins)

- **Success / restore** — `emerald-500` → `emerald-600`
- **Warning / archive** — `amber-500` → `amber-600`
- **Danger / delete**  — `red-500` → `red-600`
- **Progress fill**     — `emerald-500`

Stick to one shade-step on hover (`-500` → `-600`). Don't introduce more palette colors than needed.

### `<meta name="theme-color">`

Match mobile browser chrome to the app:

```ts
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0a0a0a" },
  ],
};
```

### Theme provider — light / dark / system

Three-state. Persist to `localStorage`. When in "system" mode, subscribe to OS changes so the UI follows.

```tsx
// app/providers/theme-provider.tsx
"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "theme";

function applyTheme(theme: Theme): "light" | "dark" {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
}

const ThemeContext = createContext<{
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored));
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(applyTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
    setResolvedTheme(applyTheme(next));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
```

### FOUC prevention

Inject a blocking script in `<head>` before hydration that applies the `.dark` class before first paint:

```ts
// app/providers/theme-init-script.ts
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || ((!stored || stored === 'system') && systemDark);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (_) {}
})();
`;
```

In `app/layout.tsx`:
```tsx
<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeInitScript }} suppressHydrationWarning />
  </head>
  <body>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>
```

---

## 3. Spacing scale

Default to Tailwind's 4px scale. Be consistent — same value in the same role.

### Page

| Use                    | Class                         |
| ---------------------- | ----------------------------- |
| Page padding           | `p-8`                         |
| Max content width      | `max-w-5xl mx-auto`           |
| Page header margin     | `mb-6`                        |
| Page heading           | `text-2xl font-semibold tracking-tight` |

### Cards & lists

| Use                    | Class                         |
| ---------------------- | ----------------------------- |
| Card padding           | `p-4`                         |
| Card radius            | `rounded-xl`                  |
| Card shadow (idle)     | `shadow-sm`                   |
| Card shadow (hover)    | `shadow-md transition`        |
| Grid gap               | `gap-4`                       |
| Grid breakpoints       | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |

### Forms

| Use                    | Class                         |
| ---------------------- | ----------------------------- |
| Form vertical gap      | `flex flex-col gap-4`         |
| Field (label/input/err)| `flex flex-col gap-1.5`       |
| Field label            | `text-sm font-medium text-foreground` |
| Field error            | `text-xs text-red-500`        |

### Modal

| Use                    | Class                         |
| ---------------------- | ----------------------------- |
| Container max-width    | `max-w-lg`                    |
| Container radius       | `rounded-xl`                  |
| Header / footer        | `px-5 py-3`                   |
| Body                   | `px-5 py-4`                   |
| Footer button row gap  | `gap-2`                       |
| Backdrop               | `bg-black/50`                 |

### Sidebar

| Use                    | Class                         |
| ---------------------- | ----------------------------- |
| Width                  | `w-16`                        |
| Icon button            | `size-10 rounded-lg`          |
| Icon glyph             | `size-5`                      |
| Vertical gap           | `gap-3`                       |
| Hover tooltip offset   | `ml-2` + `-translate-x-1 → translate-x-0` |

### Navbar

| Use                    | Class                         |
| ---------------------- | ----------------------------- |
| Height                 | `h-14`                        |
| Horizontal padding     | `px-4`                        |
| Bottom edge            | `border-b border-border shadow-sm` |

### Radii cheat sheet

| Shape          | Class           |
| -------------- | --------------- |
| Cards, modals  | `rounded-xl`    |
| Inputs, buttons| `rounded-md`    |
| Pills, toggles | `rounded-full`  |
| Small badges   | `rounded-full`  |

---

## 4. Layout shell — fixed chrome, scrollable main

```tsx
// app/layout.tsx
<body className="h-dvh overflow-hidden font-sans">
  <ThemeProvider>
    <div className="flex h-full flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  </ThemeProvider>
</body>
```

Key:
- `h-dvh overflow-hidden` on body locks the page chrome
- `min-h-0 flex-1` on the row is necessary — without `min-h-0`, the child `overflow-auto` won't take effect inside a flex parent
- Only `<main>` scrolls. Navbar and sidebar stay put

---

## 5. Sidebar with icon-only links + hover labels

```tsx
"use client";
import { HomeIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/archive", label: "Archive", Icon: ArchiveBoxIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r border-border bg-surface py-4">
      <nav className="flex flex-col items-center gap-3">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex size-10 items-center justify-center rounded-lg transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-foreground/10 hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-sm font-medium text-foreground opacity-0 shadow-md transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

Pattern: each link is a `group`. The label is `absolute` to the right of the icon, faded in on `group-hover` with a small `translate-x` slide. The label styling matches the sidebar's `bg-surface + border + shadow` so it reads as a built-in tooltip.

---

## 6. Reusable components

### Button — five variants, three sizes

```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "outlined" | "danger" | "warning" | "success";
export type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:  "bg-foreground text-background border border-transparent hover:bg-foreground/90 focus-visible:ring-foreground/40",
  outlined: "bg-transparent text-foreground border border-border hover:bg-foreground/5 focus-visible:ring-foreground/30",
  danger:   "bg-red-500 text-white border border-transparent hover:bg-red-600 focus-visible:ring-red-500/40",
  warning:  "bg-amber-500 text-white border border-transparent hover:bg-amber-600 focus-visible:ring-amber-500/40",
  success:  "bg-emerald-500 text-white border border-transparent hover:bg-emerald-600 focus-visible:ring-emerald-500/40",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...rest} />;
});
```

Conventions:
- Default `type="button"` — prevents accidental form submits when used inside `<form>`
- `focus-visible:ring-2 ring-offset-2` for keyboard accessibility
- Tinted focus ring per variant (`ring-red-500/40` etc) so the focus state matches the action

### Input — label + error slot

```tsx
import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, id, className = "", ...props }, ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-foreground">{label}</label>}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10 aria-invalid:border-red-500 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
```

- Use the canonical `aria-invalid:` variant, not `aria-[invalid=true]:` — Tailwind v4 has it built-in
- `forwardRef` lets it plug into react-hook-form's `register` directly

### TextArea — auto-growing, no resize handle

```tsx
"use client";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(function TextArea(
  { label, error, id, className = "", onChange, value, defaultValue, ...props }, ref,
) {
  const inputId = id ?? props.name;
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => { resize(); }, [resize, value, defaultValue]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-foreground">{label}</label>}
      <textarea
        ref={innerRef}
        id={inputId}
        aria-invalid={error ? true : undefined}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => { resize(); onChange?.(e); }}
        className={`w-full min-h-24 resize-none overflow-hidden rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10 aria-invalid:border-red-500 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
```

Trick: own the ref internally for `scrollHeight` measurement; expose it via `useImperativeHandle` so react-hook-form's `register` still works.

### Dropdown — search, keyboard nav, outside-click close

The full component is non-trivial (~200 lines). Key design points:

- Generic over `T extends string` so option values are typed
- Optional `searchable` — renders a filter input that auto-focuses on open
- Selected option highlighted with a check icon
- Keyboard: Arrow keys, Home/End, Enter selects, Esc closes
- Active option scrolled into view via `scrollIntoView({ block: "nearest" })`
- Closes on outside click via `pointerdown` listener on `document`
- ARIA: `combobox` button + `listbox` + `aria-activedescendant` + `aria-selected`
- **Important:** clamp `activeIndex` at render time (`Math.min(activeIndex, filtered.length - 1)`) so the filtered list shrinking doesn't require a state-sync effect — this satisfies React 19's `react-hooks/set-state-in-effect` rule

See `app/components/ui/dropdown.tsx` in the repo for the full impl.

### Modal — framer-motion enter/exit

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div className="absolute inset-0 bg-black/50" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-background shadow-xl"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            {title && (
              <div className="border-b border-border px-5 py-3">
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
              </div>
            )}
            <div className="px-5 py-4">{children}</div>
            {footer && (
              <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Features:
- `AnimatePresence` so the exit animation plays
- Backdrop fades; dialog springs in from `scale: 0.96, y: 8`
- Esc closes via keydown listener
- Body scroll-locks while open

### Card design pattern

Cards in this app use a consistent shape:

```tsx
<article className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md">
  <header className="flex items-start justify-between gap-2">
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    {/* optional badge */}
    <span className="shrink-0 rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted">
      3/5
    </span>
  </header>
  <p className="mt-2 line-clamp-3 text-sm text-muted">{description}</p>
  {/* optional progress bar */}
  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
  </div>
  {/* action footer */}
  <div className="mt-4 flex flex-wrap justify-end gap-2">
    {/* <Button size="sm" variant="outlined"> ... */}
  </div>
</article>
```

Action buttons live in the footer, right-aligned, all `size="sm"`. Use `flex-wrap` so they wrap on narrow cards.

---

## 7. Forms with react-hook-form

### Dynamic lists — `useFieldArray`

If your data already has an `id` field (e.g. `TaskDTO { id, description, isDone }`), pass `keyName: "fieldId"` so RHF's internal key doesn't shadow yours:

```tsx
const { fields, append, remove } = useFieldArray<FormValues, "tasks", "fieldId">({
  control,
  name: "tasks",
  keyName: "fieldId",
});

{fields.map((field, i) => (
  <li key={field.fieldId}>
    <input type="hidden" {...register(`tasks.${i}.id`)} />
    {/* ... */}
  </li>
))}
```

For new items added client-side, generate ids with `crypto.randomUUID()`.

### Modal-footer "Save" button (button outside the form, still submits)

If your Modal puts `children` and `footer` in separate slots, the footer's Save button is *outside* the `<form>`. Use the HTML5 `form` attribute to wire it back, so Enter-in-input still submits:

```tsx
const formId = useId();

<Modal
  footer={<Button type="submit" form={formId}>Save</Button>}
>
  <form id={formId} onSubmit={handleSubmit(onSave)}>
    {/* fields */}
  </form>
</Modal>
```

This avoids `handleSubmit` being called from two places.

---

## 8. State patterns

### Server-rendered initial data + client interactivity

For in-memory or fast server-side data, prefer this split:

```tsx
// page.tsx — server component
export const dynamic = "force-dynamic";

export default function Page() {
  const items = store.list();
  return <Screen initialItems={items} />;
}
```

```tsx
// screen.tsx — client component
"use client";
export function Screen({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  // mutations update local state
}
```

Benefits:
- No client-side fetch on mount → faster first paint
- No loading spinner
- Sidesteps React 19's `react-hooks/set-state-in-effect` rule entirely

### Optimistic mutations with rollback

```ts
const handleDelete = async () => {
  const snapshot = items;
  setItems((prev) => prev.filter((x) => x.id !== id));   // optimistic
  try {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    setItems(snapshot);                                  // rollback
    setError(err instanceof Error ? err.message : "Failed");
  }
};
```

Apply to delete, archive, restore, toggle — anything that's expected to succeed.

---

## 9. Files & folder layout

```
app/
  layout.tsx              <- root shell (navbar + sidebar + main)
  page.tsx                <- home (server component)
  globals.css             <- @import "tailwindcss" + theme vars
  icon.svg                <- favicon
  archive/page.tsx        <- e.g. second route
  api/
    notes/route.ts        <- list + create
    notes/[id]/route.ts   <- get + update + delete (typed RouteContext)
  components/
    ui/                   <- primitives: button, input, text-area, modal, dropdown
    layout/               <- navbar, sidebar
    notes/                <- domain-specific (cards, modals, screens)
    theme-toggle.tsx
  providers/
    theme-provider.tsx
    theme-init-script.ts
lib/
  types/
    Foo.ts                <- one type per file (NoteDTO.ts, TaskDTO.ts, ...)
  notes-store.ts          <- in-memory store hung off globalThis for HMR
```

Conventions:
- **One type per file** — easy to find, easy to grep, no accidental coupling
- **Domain components** (`components/notes/`) compose **UI primitives** (`components/ui/`) — never the reverse
- **API routes** use Next.js 16's typed helper: `RouteContext<"/api/foo/[id]">`

---

## 10. Gotchas

### React 19 — `react-hooks/set-state-in-effect`

The rule fires on any `setState` call reachable from an effect body. It's strict.

**Avoid by:**
- Server-render initial data instead of fetching in `useEffect`
- Derive at render time (e.g. clamp an index with `Math.min(...)` instead of syncing it via effect)
- Move resets into event handlers (e.g. an `openDropdown()` function that sets state, rather than an effect on `[open]`)
- Effects are still fine for *pure* side effects: outside-click listeners, `scrollIntoView`, focus management

### Next.js 16 — `RouteContext` helper

For typed dynamic route params:

```ts
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  const { id } = await ctx.params;  // params is a Promise in Next 16
  // ...
}
```

`RouteContext` is a global type generated during `next dev` / `next build`.

### Next.js 16 — `dynamic = "force-dynamic"` for in-memory data

If your page server-component reads from a process-local store, mark it dynamic so it re-reads each request rather than being prerendered.

### Turbopack incremental build corruption

**Symptom:** `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'` or `ENOENT: ... build-manifest.json` errors after rapid file saves.

**Fix:**
```
kill $(lsof -nP -iTCP:3000 -sTCP:LISTEN -t)
rm -rf .next
npm run dev
```

### Favicon caching

Browsers cache `/favicon.ico` aggressively, sometimes ignoring 404s. After changing the icon:
1. Hard refresh — Cmd+Shift+R (macOS) / Ctrl+Shift+R (Win/Linux)
2. If that fails, DevTools → Application → Clear site data
3. Incognito window for fast sanity check

### Tailwind v4 — canonical class forms

The IDE plugin (suggestCanonicalClasses) flags:
- `aria-[invalid=true]:foo` → use `aria-invalid:foo`
- `translate-x-[-4px]` → use `-translate-x-1`
- `data-[state=open]:foo` → still arbitrary — fine

### react-hook-form `useFieldArray` + `id` collision

Default `keyName: "id"` shadows your data's `id`. Always pass `keyName: "fieldId"` (or similar) when your data has its own `id`.

### Per-file commits (one-time chore)

If asked for "one commit per file", commit in dependency order so each commit at least references valid types: types → store → routes → UI primitives → domain components → page → root layout → CSS → deps → deletions.

---

## 11. Starter checklist for a new app

- [ ] `npx create-next-app@latest --tailwind --typescript --app`
- [ ] Replace `globals.css` with the theme vars + `@custom-variant dark`
- [ ] Add `app/providers/theme-provider.tsx` + `theme-init-script.ts`
- [ ] Wire root `layout.tsx` with `h-dvh overflow-hidden` + ThemeProvider + init script in `<head>`
- [ ] Add `app/components/ui/` primitives: button, input, text-area, modal, dropdown
- [ ] Add `app/components/layout/` navbar + sidebar
- [ ] Add `app/icon.svg`, delete `app/favicon.ico`
- [ ] Set up `metadata` + `viewport` exports in root layout
- [ ] `npm install framer-motion react-hook-form @heroicons/react`
- [ ] Add `.gitignore` entry for `.claude/` if using Claude Code harness

— That's the lot.
