export const brand = {
  name: "BDE Farm Trac",
  domain: "bdefarmtrac.co.uk",
  tagline: "Red Tractor Compliance Made Simple",
} as const;

export const colors = {
  primary: {
    forest: "#2D6A2E",
    sage: "#5A8F5A",
    light: "#7CB87C",
    pale: "#E8F5E8",
  },
  earth: {
    brown: "#8B5E3C",
    tan: "#C49A6C",
    cream: "#F5F0E8",
    sand: "#E8DCC8",
  },
  neutral: {
    white: "#FFFFFF",
    offWhite: "#FAFAF8",
    lightGrey: "#F0EDE8",
    grey: "#6B7280",
    darkGrey: "#374151",
    charcoal: "#1F2937",
    black: "#111827",
  },
  accent: {
    red: "#DC2626",
    amber: "#F59E0B",
    blue: "#2563EB",
    teal: "#0D9488",
  },
  status: {
    success: "#16A34A",
    warning: "#EAB308",
    error: "#DC2626",
    info: "#2563EB",
  },
} as const;

export const typography = {
  fontFamily: {
    heading: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    body: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const;

export const spacing = {
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;
