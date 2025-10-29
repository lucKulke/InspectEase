import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import QRCode, { QRCodeToDataURLOptions, QRCodeToBufferOptions } from "qrcode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/qr.ts

export type QROptions = {
  /** 128–1024 is a sensible range */
  size?: number;
  /** 0–8; default 2 looks good */
  margin?: number;
  /** L | M | Q | H */
  ecc?: "L" | "M" | "Q" | "H";
  /** Hex color (foreground) */
  colorDark?: string;
  /** Hex color (background) */
  colorLight?: string;
};

const toCommonOptions = (opts?: QROptions) => {
  const {
    size = 512,
    margin = 2,
    ecc = "M",
    colorDark = "#000000",
    colorLight = "#ffffff",
  } = opts ?? {};

  const base = {
    errorCorrectionLevel: ecc,
    margin,
    color: { dark: colorDark, light: colorLight },
  } as const;

  return {
    dataUrl: { ...base, width: size } satisfies QRCodeToDataURLOptions,
    buffer: { ...base, width: size } satisfies QRCodeToBufferOptions,
  };
};

/** Create a PNG data URL (works in server or client components). */
export async function qrDataUrl(text: string, opts?: QROptions) {
  const { dataUrl } = toCommonOptions(opts);
  return QRCode.toDataURL(text, dataUrl); // "data:image/png;base64,...."
}

/** Create a PNG Buffer (Node runtime only; great for file responses). */
export async function qrBuffer(text: string, opts?: QROptions) {
  const { buffer } = toCommonOptions(opts);
  return QRCode.toBuffer(text, buffer);
}
