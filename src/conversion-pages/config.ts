export type ConversionPageConfig = {
  slug: string;
  title: string;
  description: string;
  biasModuleId?: string;
  exampleInput?: string;
  alwaysPossibleModuleId?: string;
};

export const CONVERSION_PAGES: ConversionPageConfig[] = [
  {
    slug: "rgb-to-hsl",
    title: "RGB to HSL Converter",
    description: "Convert RGB colors to HSL instantly with a live color preview.",
    biasModuleId: "color",
  },
  {
    slug: "rgb-to-hex",
    title: "RGB to Hex Converter",
    description: "Convert RGB colors to Hex instantly with a live color preview.",
    biasModuleId: "color",
  },
  {
    slug: "hex-to-rgb",
    title: "Hex to RGB Converter",
    description: "Translate Hex colors to RGB with an immediate swatch preview.",
    biasModuleId: "color",
  },
  {
    slug: "rgba-to-hsla",
    title: "RGBA to HSLA Converter",
    description: "Translate RGBA colors to HSLA and hex with transparency preserved.",
    biasModuleId: "color",
  },
  {
    slug: "rgba-to-hex",
    title: "RGBA to Hex Converter",
    description: "Convert RGBA values to Hex (with alpha) quickly.",
    biasModuleId: "color",
  },
  {
    slug: "hex-to-rgba",
    title: "Hex to RGBA Converter",
    description: "Expand hex codes into RGBA with alpha preserved when present.",
    biasModuleId: "color",
  },
  {
    slug: "hsl-to-rgb",
    title: "HSL to RGB Converter",
    description: "Convert HSL or HSLA to RGB instantly with preview.",
    biasModuleId: "color",
  },
  {
    slug: "hsl-to-hex",
    title: "HSL to Hex Converter",
    description: "Transform HSL colors into Hex codes in one paste.",
    biasModuleId: "color",
  },
  {
    slug: "hex-to-hsl",
    title: "Hex to HSL Converter",
    description: "Convert Hex colors to HSL with immediate feedback.",
    biasModuleId: "color",
  },
  {
    slug: "hsla-to-rgba",
    title: "HSLA to RGBA Converter",
    description: "Swap HSLA colors to RGBA while preserving alpha.",
    biasModuleId: "color",
  },
  {
    slug: "kg-to-lb",
    title: "Kilograms to Pounds Converter",
    description: "Switch between metric and imperial weight units instantly.",
    biasModuleId: "mass",
  },
  {
    slug: "lb-to-kg",
    title: "Pounds to Kilograms Converter",
    description: "Convert pounds back to kilograms in one paste.",
    biasModuleId: "mass",
  },
  {
    slug: "kmh-to-ms",
    title: "km/h to m/s Converter",
    description: "Convert kilometers per hour to meters per second instantly.",
    biasModuleId: "speed",
  },
  {
    slug: "ms-to-kmh",
    title: "m/s to km/h Converter",
    description: "Switch meters per second into kilometers per hour in one paste.",
    biasModuleId: "speed",
  },
  {
    slug: "mph-to-kmh",
    title: "mph to km/h Converter",
    description: "Convert miles per hour to kilometers per hour with one paste.",
    biasModuleId: "speed",
  },
  {
    slug: "kmh-to-mph",
    title: "km/h to mph Converter",
    description: "Switch kilometers per hour to miles per hour instantly.",
    biasModuleId: "speed",
  },
  {
    slug: "mph-to-ms",
    title: "mph to m/s Converter",
    description: "Turn miles per hour into meters per second instantly.",
    biasModuleId: "speed",
  },
  {
    slug: "kw-to-hp",
    title: "kW to HP Converter",
    description: "Convert kilowatts to horsepower for engines, EVs, and motors.",
    biasModuleId: "power",
    exampleInput: "75 kW",
  },
  {
    slug: "hp-to-kw",
    title: "HP to kW Converter",
    description: "Translate mechanical horsepower to kilowatts instantly.",
    biasModuleId: "power",
    exampleInput: "100 hp",
  },
  {
    slug: "w-to-kw",
    title: "Watts to kW Converter",
    description: "Turn watts into kilowatts and megawatts in one paste.",
    biasModuleId: "power",
    exampleInput: "15000 W",
  },
  {
    slug: "kw-to-w",
    title: "kW to Watts Converter",
    description: "Expand kilowatts back to watts alongside horsepower output.",
    biasModuleId: "power",
    exampleInput: "1.5 kW",
  },
  {
    slug: "jwt-decode",
    title: "Decode JWT Tokens",
    description: "Inspect JWT headers and payloads without verifying signatures.",
    biasModuleId: "jwt",
  },
  {
    slug: "base64-encode",
    title: "Base64 Encoder",
    description: "Encode any text into base64 and base64url instantly.",
    alwaysPossibleModuleId: "base64-encode",
    exampleInput: "Encode me to base64",
  },
  {
    slug: "base64-decode",
    title: "Base64 Decoder",
    description: "Decode base64 or base64url strings into readable text and JSON.",
    biasModuleId: "base64",
    exampleInput: "U29ycnksIHRoaXMgaXMgYmFzZTYu",
  },
  {
    slug: "kb-to-mb",
    title: "KB to MB Converter",
    description: "Convert kilobytes to megabytes with 1024-base binary units.",
    biasModuleId: "data-size",
    exampleInput: "2048 KB",
  },
  {
    slug: "mb-to-gb",
    title: "MB to GB Converter",
    description: "Translate megabytes to gigabytes using binary (1024) math.",
    biasModuleId: "data-size",
    exampleInput: "1024 MB",
  },
  {
    slug: "gb-to-tb",
    title: "GB to TB Converter",
    description: "Convert gigabytes to terabytes without losing precision.",
    biasModuleId: "data-size",
    exampleInput: "4096 GB",
  },
  {
    slug: "bytes-to-mb",
    title: "Bytes to MB Converter",
    description: "Turn raw bytes into megabytes using binary (1024) conversion.",
    biasModuleId: "data-size",
    exampleInput: "1048576 bytes",
  },
  {
    slug: "l-to-gal",
    title: "Liters to Gallons Converter",
    description: "Convert liters to US gallons instantly (plus cups, fl oz, and more).",
    biasModuleId: "volume",
    exampleInput: "2 L",
  },
  {
    slug: "gal-to-l",
    title: "Gallons to Liters Converter",
    description: "Convert US gallons to liters instantly with one paste.",
    biasModuleId: "volume",
    exampleInput: "1 gal",
  },
];
