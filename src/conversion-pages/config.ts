import type { ReactNode } from "react";

export type ConversionPageConfig = {
  slug: string;
  title: string;
  description: string;
  biasModuleId?: string;
  exampleInput?: string;
  intro?: ReactNode;
};

export const CONVERSION_PAGES: ConversionPageConfig[] = [
  {
    slug: "rgb-to-hsl",
    title: "RGB to HSL Converter",
    description: "Convert RGB colors to HSL instantly with a live color preview.",
    biasModuleId: "color",
    exampleInput: "rgb(255, 0, 128)",
    intro: "Paste any RGB value to see its HSL and other representations with a swatch preview.",
  },
  {
    slug: "rgba-to-hsla",
    title: "RGBA to HSLA Converter",
    description: "Translate RGBA colors to HSLA and hex with transparency preserved.",
    biasModuleId: "color",
    exampleInput: "rgba(26, 115, 232, 0.6)",
    intro: "Keep alpha intact while moving between RGBA and HSLA/hex outputs.",
  },
  {
    slug: "kg-to-lb",
    title: "Kilograms to Pounds Converter",
    description: "Switch between metric and imperial weight units instantly.",
    biasModuleId: "mass",
    exampleInput: "70 kg",
    intro: "Quickly convert gym logs or package weights between kg and lb.",
  },
  {
    slug: "jwt-decode",
    title: "Decode JWT Tokens",
    description: "Inspect JWT headers and payloads without verifying signatures.",
    biasModuleId: "jwt",
    exampleInput: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
    intro: "Paste a JWT to view its decoded header and payload. No secrets or verification needed.",
  },
];
