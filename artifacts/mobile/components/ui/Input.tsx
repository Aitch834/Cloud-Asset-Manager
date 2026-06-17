import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Feather.glyphMap;
  containerStyle?: ViewStyle;
  required?: boolean;
  /** Pass "today" (or a YYYY-MM-DD string) to prevent future dates being entered */
  maxDate?: "today" | string;
  /** Pass "today" (or a YYYY-MM-DD string) to prevent past dates being entered */
  minDate?: "today" | string;
}

export function Input({
  label,
  error,
  hint,
  icon,
  containerStyle,
  required,
  maxDate,
  minDate,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const dateError = maxDate && props.value
    ? (() => {
        const max = maxDate === "today" ? new Date().toISOString().slice(0, 10) : maxDate;
        const val = String(props.value);
        return /^\d{4}-\d{2}-\d{2}$/.test(val) && val > max ? "Date cannot be in the future" : undefined;
      })()
    : undefined;

  const dateMinError = minDate && props.value
    ? (() => {
        const min = minDate === "today" ? new Date().toISOString().slice(0, 10) : minDate;
        const val = String(props.value);
        return /^\d{4}-\d{2}-\d{2}$/.test(val) && val < min ? "Date cannot be in the past" : undefined;
      })()
    : undefined;

  const displayError = error || dateError || dateMinError;

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          !!displayError && styles.inputError,
        ]}
      >
        {!!icon && (
          <Feather
            name={icon}
            size={16}
            color={focused ? colors.primary : colors.textTertiary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, !!icon && styles.inputWithIcon]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {!!displayError && <Text style={styles.error}>{displayError}</Text>}
      {!displayError && !!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  required: {
    color: colors.error,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  icon: {
    marginLeft: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputWithIcon: {
    paddingLeft: spacing.sm,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
