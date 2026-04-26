import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
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
import { useRFID } from "@/lib/context/RFIDContext";

const RFID_CHAR_INTERVAL_MS = 80;
const RFID_MIN_CHARS = 6;
const RFID_CONFIRM_DEBOUNCE_MS = 350;

interface RFIDTagInputProps extends Omit<TextInputProps, "onChangeText"> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onTagScanned?: (tag: string) => void;
  containerStyle?: ViewStyle;
  required?: boolean;
  placeholder?: string;
}

export function RFIDTagInput({
  label,
  value,
  onChangeText,
  onTagScanned,
  containerStyle,
  required,
  placeholder,
  ...rest
}: RFIDTagInputProps) {
  const { addScan, activateScanMode, deactivateScanMode } = useRFID();

  const [scanActive, setScanActive] = useState(false);
  const [flashMsg, setFlashMsg] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const lastChangeTimeRef = useRef<number>(0);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevValueRef = useRef<string>(value);
  const rapidStartLengthRef = useRef<number>(0);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (scanActive) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => loop?.stop();
  }, [scanActive, pulseAnim]);

  const showFlash = useCallback((msg: string) => {
    setFlashMsg(msg);
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 1800, useNativeDriver: true }).start(() =>
      setFlashMsg("")
    );
  }, [flashAnim]);

  const handleTagConfirmed = useCallback(
    (tag: string) => {
      const clean = tag.trim().toUpperCase();
      if (!clean) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addScan(clean);
      onTagScanned?.(clean);
      showFlash(`Scanned: ${clean}`);
      setScanActive(false);
      deactivateScanMode();
    },
    [addScan, onTagScanned, showFlash, deactivateScanMode]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText(text);
      const prev = prevValueRef.current;
      prevValueRef.current = text;

      if (!scanActive) return;

      const now = Date.now();
      const delta = now - lastChangeTimeRef.current;
      const added = text.length - prev.length;

      if (added <= 0) {
        lastChangeTimeRef.current = now;
        return;
      }

      if (delta < RFID_CHAR_INTERVAL_MS || added >= RFID_MIN_CHARS) {
        if (delta >= RFID_CHAR_INTERVAL_MS) {
          rapidStartLengthRef.current = prev.length;
        }
      }

      lastChangeTimeRef.current = now;

      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => {
        const totalAdded = text.length - rapidStartLengthRef.current;
        if (totalAdded >= RFID_MIN_CHARS && text.trim().length >= RFID_MIN_CHARS) {
          handleTagConfirmed(text);
        }
      }, RFID_CONFIRM_DEBOUNCE_MS);
    },
    [onChangeText, scanActive, handleTagConfirmed]
  );

  const toggleScanMode = useCallback(() => {
    if (scanActive) {
      setScanActive(false);
      deactivateScanMode();
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    } else {
      rapidStartLengthRef.current = value.length;
      prevValueRef.current = value;
      lastChangeTimeRef.current = Date.now();
      setScanActive(true);
      activateScanMode();
      inputRef.current?.focus();
      Haptics.selectionAsync();
    }
  }, [scanActive, value, activateScanMode, deactivateScanMode]);

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const scanBtnColor = scanActive ? colors.success : colors.textTertiary;
  const scanBtnBg = scanActive ? colors.successBg : colors.borderLight;

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={[styles.row, inputFocused && styles.rowFocused, scanActive && styles.rowScanning]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          placeholder={scanActive ? "Point reader and scan tag…" : (placeholder ?? "e.g. UK123456 78901")}
          placeholderTextColor={scanActive ? colors.success : colors.textTertiary}
          autoCapitalize="characters"
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          {...rest}
        />

        <Animated.View style={{ opacity: pulseAnim }}>
          <Pressable
            style={[styles.scanBtn, { backgroundColor: scanBtnBg }]}
            onPress={toggleScanMode}
            hitSlop={8}
          >
            <Feather
              name={scanActive ? "wifi" : "bluetooth"}
              size={18}
              color={scanBtnColor}
            />
          </Pressable>
        </Animated.View>
      </View>

      {!!flashMsg && (
        <Animated.View style={[styles.flashBadge, { opacity: flashAnim }]}>
          <Feather name="check-circle" size={12} color={colors.success} />
          <Text style={styles.flashText}>{flashMsg}</Text>
        </Animated.View>
      )}

      {scanActive && !flashMsg && (
        <View style={styles.scanHint}>
          <Feather name="radio" size={11} color={colors.success} />
          <Text style={styles.scanHintText}>
            Scan mode active — hold reader near ear tag
          </Text>
          <Pressable onPress={toggleScanMode} hitSlop={8}>
            <Text style={styles.scanHintCancel}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {Platform.OS === "web" && (
        <Text style={styles.webNote}>
          Bluetooth scanning requires the physical mobile app
        </Text>
      )}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 48,
  },
  rowFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  rowScanning: {
    borderColor: colors.success,
    backgroundColor: "#f0fdf4",
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  scanBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
  flashBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  flashText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.success,
  },
  scanHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  scanHintText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.success,
  },
  scanHintCancel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.error,
  },
  webNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
