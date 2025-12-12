"use client";

import { useState } from "react";
import { cn } from "../lib/utils";

type CopyButtonProps = {
  text: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

export default function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={cn(
        "inline-flex items-center rounded-md border border-slate-200 font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-px",
        size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
        className,
      )}
      aria-label={label}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
