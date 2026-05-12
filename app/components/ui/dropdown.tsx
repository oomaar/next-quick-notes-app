"use client";

import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type DropdownOption<T extends string = string> = {
  value: T;
  label: string;
};

type DropdownProps<T extends string = string> = {
  options: DropdownOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
};

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  label,
  placeholder = "Select…",
  searchable = false,
  className = "",
}: DropdownProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label,
    [options, value],
  );

  const clampedActive =
    filtered.length === 0 ? -1 : Math.min(Math.max(activeIndex, 0), filtered.length - 1);

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [open]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  useEffect(() => {
    if (!open || clampedActive < 0) return;
    itemRefs.current[clampedActive]?.scrollIntoView({ block: "nearest" });
  }, [open, clampedActive]);

  const openDropdown = useCallback(() => {
    setQuery("");
    const selectedIdx = options.findIndex((o) => o.value === value);
    setActiveIndex(
      selectedIdx >= 0 ? selectedIdx : options.length > 0 ? 0 : -1,
    );
    setOpen(true);
  }, [options, value]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  const commit = useCallback(
    (idx: number) => {
      const opt = filtered[idx];
      if (!opt) return;
      onChange(opt.value);
      closeDropdown();
    },
    [filtered, onChange, closeDropdown],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) =>
        Math.min(filtered.length - 1, Math.max(-1, i) + 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, (i < 0 ? 0 : i) - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(clampedActive);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
    }
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setActiveIndex(0);
  };

  const listboxId = `${id}-listbox`;
  const activeId =
    clampedActive >= 0 ? `${id}-opt-${clampedActive}` : undefined;

  return (
    <div ref={rootRef} className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={`${id}-button`}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative" onKeyDown={onKeyDown}>
        <button
          id={`${id}-button`}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open ? activeId : undefined}
          onClick={() => (open ? closeDropdown() : openDropdown())}
          className="inline-flex w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-left text-sm text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        >
          <span className={selectedLabel ? "" : "text-muted"}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronUpDownIcon className="size-4 text-muted" />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-background shadow-lg">
            {searchable && (
              <div className="border-b border-border p-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  placeholder="Search…"
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="w-full rounded-sm bg-transparent px-2 py-1 text-sm text-foreground outline-none placeholder:text-muted"
                />
              </div>
            )}
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-60 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted">No results</li>
              ) : (
                filtered.map((opt, i) => {
                  const isSelected = opt.value === value;
                  const isActive = i === clampedActive;
                  return (
                    <li
                      key={opt.value}
                      id={`${id}-opt-${i}`}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => commit(i)}
                      className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm ${
                        isActive ? "bg-foreground/10" : ""
                      } ${isSelected ? "font-medium text-foreground" : "text-foreground"}`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <CheckIcon className="size-4" />}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
