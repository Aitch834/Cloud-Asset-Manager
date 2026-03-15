const colors = {
  primary: "#2E7D32",
  primaryDark: "#1B5E20",
  primaryLight: "#4CAF50",
  primaryMuted: "#A5D6A7",

  accent: "#F59E0B",
  accentDark: "#D97706",
  accentLight: "#FCD34D",

  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",

  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textInverse: "#FFFFFF",

  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  divider: "#E5E7EB",

  success: "#16A34A",
  successBg: "#DCFCE7",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  error: "#DC2626",
  errorBg: "#FEE2E2",
  info: "#2563EB",
  infoBg: "#DBEAFE",

  compliant: "#16A34A",
  nonCompliant: "#DC2626",
  pending: "#F59E0B",
  overdue: "#DC2626",

  fieldGreen: "#22C55E",
  fieldBrown: "#92400E",
  fieldGold: "#CA8A04",

  tabBarActive: "#2E7D32",
  tabBarInactive: "#9CA3AF",

  skeleton: "#E5E7EB",
  skeletonHighlight: "#F3F4F6",

  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.08)",
};

export default {
  light: {
    ...colors,
    tint: colors.primary,
    tabIconDefault: colors.tabBarInactive,
    tabIconSelected: colors.tabBarActive,
  },
};

export { colors };
