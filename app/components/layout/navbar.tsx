import { ThemeToggle } from "../theme-toggle";

export function Navbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 shadow-sm">
      <h1 className="text-base font-semibold tracking-tight text-foreground">
        Quick Notes
      </h1>
      <ThemeToggle />
    </header>
  );
}
