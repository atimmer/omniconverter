"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { convertColorString } from "../utils/colorConverter";

export default function Page() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const conversion = useMemo(() => convertColorString(input), [input]);

  const helperText = useMemo(() => {
    if (input.trim().length === 0) {
      return "Paste any hex, rgb(a), hsl(a), or named CSS color to get started.";
    }

    return conversion
      ? "Detected a valid color. See the conversions below."
      : "That doesn't look like a supported CSS color yet (hex, rgb(a), hsl(a), named).";
  }, [conversion, input]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="mx-auto flex w-full max-w-3xl grow flex-col gap-8 px-4 py-16">
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Converter Unlimited
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Convert colors in one paste
          </h1>
          <p className="text-base text-slate-600">
            Drop in your favorite{" "}
            <code className="rounded bg-slate-200 px-1 py-0.5 text-sm text-slate-800">
              hex
            </code>
            ,
            <code className="ml-1 rounded bg-slate-200 px-1 py-0.5 text-sm text-slate-800">
              rgb()
            </code>
            ,
            <code className="ml-1 rounded bg-slate-200 px-1 py-0.5 text-sm text-slate-800">
              hsl()
            </code>
            , or any named CSS color and get instant conversions.
          </p>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="color-input"
              className="text-sm font-medium text-slate-700"
            >
              Color input
            </label>
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Auto-detects format
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <textarea
              id="color-input"
              ref={textareaRef}
              autoFocus
              spellCheck={false}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="#c044ff, rgb(160, 40, 255), hsla(275, 70%, 55%, 0.6), rebeccapurple"
              className="h-40 w-full resize-y rounded-2xl border-0 bg-transparent p-6 text-base font-medium text-slate-900 outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-sm text-slate-500">{helperText}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Results
          </h2>
          {conversion ? (
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[auto,1fr]">
              <div
                aria-hidden
                className="h-20 w-20 rounded-xl border border-slate-200 shadow-inner"
                style={{ backgroundColor: conversion.rgbaString }}
              />
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    RGB
                  </dt>
                  <dd className="font-mono text-lg text-slate-900">
                    {conversion.rgbString}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    RGBA
                  </dt>
                  <dd className="font-mono text-lg text-slate-900">
                    {conversion.rgbaString}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Hex
                  </dt>
                  <dd className="font-mono text-lg text-slate-900">
                    {conversion.hex}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Paste any supported CSS color to see live conversions here.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
