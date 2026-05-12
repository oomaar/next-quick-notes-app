"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type TextareaHTMLAttributes,
} from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { label, error, id, className = "", onChange, value, defaultValue, ...props },
    ref,
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

    useEffect(() => {
      resize();
    }, [resize, value, defaultValue]);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={innerRef}
          id={inputId}
          aria-invalid={error ? true : undefined}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            resize();
            onChange?.(e);
          }}
          className={`w-full min-h-24 resize-none overflow-hidden rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10 aria-invalid:border-red-500 ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
