"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { modules, resolveConversion } from "../conversions";
import type { OutputRow } from "../conversions/types";

type OmniConverterProps = {
  biasModuleId?: string;
  defaultValue?: string;
  intro?: React.ReactNode;
};

const CopyButton = ({ text }: { text: string }) => {
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
      onClick={handleCopy}
      className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:translate-y-px"
      aria-label="Copy value"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const ResultRows = ({ rows }: { rows: OutputRow[] }) => (
  <dl className="space-y-4">
    {rows.map((row) => (
      <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {row.label}
          </dt>
          <dd className="font-mono text-lg text-slate-900 whitespace-pre-wrap">
            {row.value}
          </dd>
          {row.hint ? (
            <p className="text-xs text-slate-500">{row.hint}</p>
          ) : null}
        </div>
        <CopyButton text={row.copy ?? row.value} />
      </div>
    ))}
  </dl>
);

export default function OmniConverter({ biasModuleId, defaultValue, intro }: OmniConverterProps) {
  const [input, setInput] = useState(defaultValue ?? "");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (defaultValue) setInput(defaultValue);
  }, [defaultValue]);

  const resolution = useMemo(
    () => resolveConversion(input, modules, { biasModuleId }),
    [input, biasModuleId],
  );

  const helperText = useMemo(() => {
    if (input.trim().length === 0) {
      return "Paste a supported value to get started.";
    }

    return resolution
      ? `Detected ${resolution.module.label}. See conversions below.`
      : "That input is not recognized yet.";
  }, [input, resolution]);

  return (
    <div className="space-y-8">
      {intro ? <div className="text-base text-slate-600">{intro}</div> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="omni-input"
            className="text-sm font-medium text-slate-700"
          >
            Input
          </label>
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Auto-detects format
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <textarea
            id="omni-input"
            ref={textareaRef}
            autoFocus
            spellCheck={false}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="#c044ff, 70 kg, eyJhbGciOi..."
            className="h-40 w-full resize-y rounded-2xl border-0 bg-transparent p-6 text-base font-medium text-slate-900 outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <p className="text-sm text-slate-500">{helperText}</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Results
          </h2>
          {resolution ? (
            <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
              {resolution.module.label}
            </span>
          ) : null}
        </div>
        {resolution ? (
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[auto,1fr]">
            {resolution.payload.highlight ? (
              <div className="flex items-start justify-center sm:justify-start">
                {resolution.payload.highlight}
              </div>
            ) : null}
            <ResultRows rows={resolution.payload.rows} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Paste any supported value to see conversions here.
          </div>
        )}
      </section>
    </div>
  );
}
