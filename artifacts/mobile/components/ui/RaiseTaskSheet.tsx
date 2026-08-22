import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { getApiBase, getAuthToken } from "@/lib/uploadPhoto";

interface Props {
  visible: boolean;
  farmId: string | number;
  defaultTitle: string;
  defaultDescription: string;
  defaultDueDate?: string;
  module: string;
  onRaised: () => void;
  onSkip: () => void;
}

export function RaiseTaskSheet({ visible, farmId, defaultTitle, defaultDescription, defaultDueDate, module, onRaised, onSkip }: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [submitting, setSubmitting] = useState(false);

  async function handleRaise() {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a task title.");
      return;
    }
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const apiBase = getApiBase();
      const token = await getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/farms/${farmId}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          description: defaultDescription,
          dueDate: defaultDueDate || null,
          module,
          status: "pending",
        }),
      });

      if (res.ok) {
        onRaised();
      } else {
        Alert.alert("Error", "Could not raise task — it will appear in your sync queue. Please try again from the dashboard.");
        onSkip();
      }
    } catch {
      Alert.alert("Offline", "Task could not be created right now. Please raise it from the dashboard when back online.");
      onSkip();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onSkip} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.iconRow}>
            <View style={styles.iconBg}>
              <Feather name="clipboard" size={20} color={colors.primary} />
            </View>
            <Text style={styles.heading}>Raise a Task?</Text>
          </View>

          <Text style={styles.hint}>
            Create a follow-up task on the dashboard task board so nothing gets missed.
          </Text>

          <Text style={styles.label}>Task title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title…"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="sentences"
            returnKeyType="done"
          />

          <Text style={styles.descLabel}>Description (pre-filled from record)</Text>
          <View style={styles.descBox}>
            <Text style={styles.descText} numberOfLines={3}>{defaultDescription}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.skipBtn} onPress={onSkip} disabled={submitting}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            <Pressable style={[styles.raiseBtn, submitting && styles.raiseBtnDisabled]} onPress={handleRaise} disabled={submitting}>
              {submitting
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                  <Feather name="plus" size={15} color="#fff" />
                  <Text style={styles.raiseText}>Raise Task</Text>
                </>
              }
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: radius.xl ?? 20,
    borderTopRightRadius: radius.xl ?? 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 16,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.background ?? "#fafafa",
    marginBottom: spacing.sm,
  },
  descLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  descBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.surface ?? "#f8fafc",
    marginBottom: spacing.lg,
  },
  descText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  skipBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  raiseBtn: {
    flex: 2,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  raiseBtnDisabled: {
    opacity: 0.6,
  },
  raiseText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: "#fff",
  },
});
