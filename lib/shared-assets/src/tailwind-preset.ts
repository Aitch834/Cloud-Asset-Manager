import type { Config } from "tailwindcss";
import { colors, typography, spacing, borderRadius, shadows } from "./tokens.js";

const bdePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: colors.primary,
        earth: colors.earth,
        neutral: {
          white: colors.neutral.white,
          "off-white": colors.neutral.offWhite,
          "light-grey": colors.neutral.lightGrey,
          grey: colors.neutral.grey,
          "dark-grey": colors.neutral.darkGrey,
          charcoal: colors.neutral.charcoal,
          black: colors.neutral.black,
        },
        accent: colors.accent,
        status: colors.status,
      },
      fontFamily: {
        heading: typography.fontFamily.heading.split(", ").map((f) => f.replace(/'/g, "")),
        body: typography.fontFamily.body.split(", ").map((f) => f.replace(/'/g, "")),
        mono: typography.fontFamily.mono.split(", ").map((f) => f.replace(/'/g, "")),
      },
      borderRadius: {
        xl: borderRadius.xl,
        "2xl": borderRadius["2xl"],
      },
      spacing: {
        "0.5": spacing["0.5"],
        "1": spacing[1],
        "1.5": spacing["1.5"],
        "2": spacing[2],
        "2.5": spacing["2.5"],
        "3": spacing[3],
        "4": spacing[4],
        "5": spacing[5],
        "6": spacing[6],
        "8": spacing[8],
        "10": spacing[10],
        "12": spacing[12],
        "16": spacing[16],
        "20": spacing[20],
        "24": spacing[24],
      },
      boxShadow: {
        sm: shadows.sm,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
      },
    },
  },
};

export default bdePreset;
