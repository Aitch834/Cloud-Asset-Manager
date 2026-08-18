import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

interface IdentifierBannerProps {
  /** True when the grower just saved identifiers from the More/Settings screen */
  justSaved: boolean;
  /** True when identifiers have been fetched and at least one of CPH/SBI is missing */
  missingIdentifiers: boolean;
  /** True when the grower has dismissed the warning for this screen */
  bannerDismissed: boolean;
  /** Called when the grower taps the success nudge to clear it */
  onClearJustSaved: () => void;
  /** Called when the grower taps the dismiss (×) button on the warning */
  onDismiss: () => void;
  /** Whether CPH is missing (used to build the warning message) */
  cphMissing: boolean;
  /** Whether SBI is missing (used to build the warning message) */
  sbiMissing: boolean;
  /**
   * Context noun inserted into the warning message, e.g. "movement submissions"
   * or "medicine records". Defaults to "submissions".
   */
  context?: string;
  /**
   * Optional override for the entire warning message body. When provided,
   * `cphMissing`, `sbiMissing`, and `context` are ignored.
   */
  warningMessage?: string;
  /**
   * When true, identifiers are still being fetched. Neither the warning nor
   * the success nudge will render while loading, preventing a flash of the
   * 'Saved' nudge before the refetch has confirmed identifiers are present.
   */
  loading?: boolean;
}

/**
 * Shared identifier banner used on any mobile screen that warns growers about
 * missing CPH / SBI numbers.
 *
 * Shows one of two states (never both at once):
 *   1. Success nudge  — after the grower saves identifiers, while `justSaved`
 *                       is true and `missingIdentifiers` is false.
 *   2. Warning banner — while `missingIdentifiers` is true and the grower has
 *                       not dismissed it for this screen.
 *
 * **Always pass `loading`** — set it to the loading state of whichever query
 * provides the identifier values (e.g. `identifiersLoading` from
 * `useIdentifiers`). Without it, the success nudge can flash briefly before
 * the refetch confirms identifiers are present.
 *
 * Usage:
 * ```tsx
 * <IdentifierBanner
 *   loading={identifiersLoading}
 *   justSaved={justSaved}
 *   missingIdentifiers={missingIdentifiers}
 *   bannerDismissed={bannerDismissed}
 *   onClearJustSaved={clearJustSaved}
 *   onDismiss={dismissBanner}
 *   cphMissing={!cphNumber}
 *   sbiMissing={!sbiNumber}
 *   context="movement submissions"
 * />
 * ```
 */
export function IdentifierBanner({
  justSaved,
  missingIdentifiers,
  bannerDismissed,
  onClearJustSaved,
  onDismiss,
  cphMissing,
  sbiMissing,
  context = "submissions",
  warningMessage,
  loading,
}: IdentifierBannerProps) {
  if (__DEV__ && loading === undefined) {
    console.warn(
      "[IdentifierBanner] The `loading` prop was not provided. " +
        "Pass `loading={identifiersLoading}` to prevent the 'Saved' nudge " +
        "from flashing before the identifier refetch completes.",
    );
  }

  if (loading) return null;

  if (justSaved && !missingIdentifiers) {
    return (
      <Pressable onPress={onClearJustSaved} style={[styles.banner, styles.bannerSaved]}>
        <Feather name="check-circle" size={15} color="#166534" />
        <Text style={[styles.bannerText, styles.bannerSavedText]}>
          Identifiers saved successfully. Tap to dismiss.
        </Text>
      </Pressable>
    );
  }

  if (missingIdentifiers && !bannerDismissed) {
    const message = warningMessage ?? (
      cphMissing && sbiMissing
        ? `CPH and SBI are missing from your farm profile — required for ${context}.`
        : cphMissing
        ? `CPH number is missing from your farm profile — required for ${context}.`
        : `SBI number is missing from your farm profile — required for ${context}.`
    );

    return (
      <Pressable onPress={() => router.push("/(tabs)/more")} style={styles.banner}>
        <Feather name="alert-triangle" size={15} color="#92400e" />
        <Text style={styles.bannerText}>
          {message}
          {" "}Tap to go to Settings.
        </Text>
        <Pressable
          onPress={(e) => { e.stopPropagation(); onDismiss(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Dismiss warning"
        >
          <Feather name="x" size={15} color="#92400e" />
        </Pressable>
      </Pressable>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  bannerSaved: {
    backgroundColor: colors.successBg,
    borderColor: "#86EFAC",
  },
  bannerSavedText: {
    color: "#166534",
  },
});
