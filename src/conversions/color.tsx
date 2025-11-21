import React from "react";
import { convertColorString } from "../utils/colorConverter";
import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";

const toRows = (conversion: ReturnType<typeof convertColorString>): OutputRow[] => {
  if (!conversion) return [];

  return [
    { label: "RGB", value: conversion.rgbString },
    { label: "RGBA", value: conversion.rgbaString },
    { label: "Hex", value: conversion.hex },
  ];
};

const renderHighlight = (rgba: string, hex: string) => (
  <div
    aria-hidden
    className="h-20 w-20 rounded-xl border border-slate-200 shadow-inner"
    style={{ backgroundColor: rgba }}
  >
    <span className="sr-only">{hex}</span>
  </div>
);

const detect = (raw: string): Detection | null => {
  const conversion = convertColorString(raw);
  if (!conversion) return null;

  return {
    score: 0.95,
    normalizedInput: conversion,
  };
};

const convert = (detection: Detection, raw: string): ConversionPayload | null => {
  const normalization = detection.normalizedInput as ReturnType<typeof convertColorString>;
  const conversion = normalization ?? convertColorString(raw);
  if (!conversion) return null;

  return {
    rows: toRows(conversion),
    highlight: renderHighlight(conversion.rgbaString, conversion.hex),
  };
};

const colorModule: ConversionModule = {
  id: "color",
  label: "Color",
  detect,
  convert,
};

export default colorModule;
