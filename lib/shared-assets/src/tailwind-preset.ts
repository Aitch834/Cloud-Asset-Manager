import type { Config } from "tailwindcss";

const bdePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
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
          "off-white": "#FAFAF8",
          "light-grey": "#F0EDE8",
          grey: "#6B7280",
          "dark-grey": "#374151",
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
      },
      fontFamily: {
        heading: [
          "Inter",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        body: [
          "Inter",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      spacing: {
        "0.5": "0.125rem",
        "1": "0.25rem",
        "1.5": "0.375rem",
        "2": "0.5rem",
        "2.5": "0.625rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "8": "2rem",
        "10": "2.5rem",
        "12": "3rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
};

export default bdePreset;
