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
        accent: {
          red: "#DC2626",
          amber: "#F59E0B",
          blue: "#2563EB",
          teal: "#0D9488",
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
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
};

export default bdePreset;
