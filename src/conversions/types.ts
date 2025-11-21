import type { ReactNode } from "react";

export type Detection = {
  score: number;
  normalizedInput?: unknown;
  reasoning?: string;
};

export type OutputRow = {
  label: string;
  value: string;
  copy?: string;
  hint?: string;
};

export type ConversionPayload = {
  rows: OutputRow[];
  highlight?: ReactNode;
};

export type ConversionModule = {
  id: string;
  label: string;
  detect: (raw: string) => Detection | null;
  convert: (detected: Detection, raw: string) => ConversionPayload | null;
};

export type ConversionResolution = {
  module: ConversionModule;
  detection: Detection;
  payload: ConversionPayload;
};

export type ResolverOptions = {
  biasModuleId?: string;
};
