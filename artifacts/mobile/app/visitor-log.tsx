import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { VisitorLogEntry } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { visitorLogHtml } from "@/lib/printTemplates";

const BIOSEC_TEXT =
  "I confirm that I have not visited any other livestock or agricultural premises within the last 48 hours, that I agree to comply with all biosecurity measures required on this farm (including cleaning and disinfection of footwear, wearing PPE where required, and following all instructions from farm staff), and that I will not enter restricted areas without authorisation or escort.";

const HEALTH_TEXT =
  "I confirm that I am in good health at the time of this visit and am not displaying symptoms of any infectious illness (including vomiting, diarrhoea, respiratory illness, or open skin infections). I have not been advised by a medical professional to avoid contact with livestock or to self-isolate.";

export default function VisitorLogScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);

  const [visitorName, setVisitorName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [areasVisited, setAreasVisited] = useState("");
  const [notes, setNotes] = useState("");

  const [biosecSig, setBiosecSig] = useState<string | null>(null);
  const [healthSig, setHealthSig] = useState<string | null>(null);

  const handleSave = async () => {
    if (!visitorName.trim()) {
      Alert.alert("Required", "Please enter the visitor's name.");
      return;
    }
    if (!biosecSig && !healthSig) {
      Alert.alert(
        "Declarations Required",
        "Please obtain at least one signed declaration before saving. Hand the device to the visitor to sign.",
        [
          { text: "Save Anyway", style: "destructive", onPress: () => doSave() },
          { text: "Go Back", style: "cancel" },
        ]
      );
      return;
    }
    await doSave();
  };

  const doSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry: VisitorLogEntry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      visitorName: visitorName.trim(),
      organisation: organisation.trim(),
      purpose: purpose.trim(),
      vehicleReg: vehicleReg.trim().toUpperCase(),
      timeIn: new Date().toISOString(),
      timeOut: "",
      areasVisited: areasVisited.trim(),
      biosecurityCompliant: !!biosecSig,
      biosecurityDeclarationSigned: !!biosecSig,
      healthDeclarationSigned: !!healthSig,
      biosecuritySignature: biosecSig,
      healthSignature: healthSig,
      signature: user?.name || "",
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.VISITOR_LOG, entry);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Visitor Logged", "Record saved and will sync automatically.", [
      { text: "Print Record", onPress: async () => { await print(visitorLogHtml(entry, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(visitorLogHtml(entry, currentFarm), "Visitor Log"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  const signedCount = (biosecSig ? 1 : 0) + (healthSig ? 1 : 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Visitor Log</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.timeCard}>
            <Feather name="clock" size={18} color={colors.primary} />
            <View>
              <Text style={styles.timeLabel}>Time In</Text>
              <Text style={styles.timeValue}>
                {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}{" "}
                · {new Date().toLocaleDateString("en-GB")}
              </Text>
            </View>
          </View>

          {/* Visitor Details */}
          <SectionHeading icon="user" color="#8B5CF6" title="Visitor Details" />
          <Input
            label="Visitor Name"
            placeholder="Full name"
            value={visitorName}
            onChangeText={setVisitorName}
            icon="user"
            required
          />
          <Input
            label="Organisation"
            placeholder="Company or organisation"
            value={organisation}
            onChangeText={setOrganisation}
          />
          <Input
            label="Purpose of Visit"
            placeholder="e.g. Grain delivery, Vet visit, Audit"
            value={purpose}
            onChangeText={setPurpose}
          />

          {/* Vehicle & Access */}
          <SectionHeading icon="truck" color={colors.textSecondary} title="Vehicle & Access" />
          <Input
            label="Vehicle Registration"
            placeholder="e.g. AB12 CDE"
            value={vehicleReg}
            onChangeText={setVehicleReg}
            autoCapitalize="characters"
          />
          <Input
            label="Areas Visited"
            placeholder="e.g. Yard, Cattle shed, Fields 1–3"
            value={areasVisited}
            onChangeText={setAreasVisited}
          />

          {/* Notes */}
          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          {/* Declarations */}
          <SectionHeading icon="shield" color={colors.success} title="Declarations" />

          <View style={styles.declarationHint}>
            <Feather name="info" size={13} color={colors.primary} />
            <Text style={styles.hintText}>
              Hand the device to the visitor. They read each declaration and sign directly on screen.
            </Text>
          </View>

          <DeclarationCard
            title="Biosecurity Declaration"
            icon="shield"
            iconColor="#16a34a"
            declarationText={BIOSEC_TEXT}
            signature={biosecSig}
            onCapture={setBiosecSig}
            onClear={() => setBiosecSig(null)}
          />

          <DeclarationCard
            title="Health Declaration"
            icon="heart"
            iconColor="#dc2626"
            declarationText={HEALTH_TEXT}
            signature={healthSig}
            onCapture={setHealthSig}
            onClear={() => setHealthSig(null)}
          />

          {signedCount > 0 && (
            <View style={styles.signedBanner}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={styles.signedBannerText}>
                {signedCount === 2
                  ? "Both declarations signed electronically"
                  : "1 of 2 declarations signed — consider obtaining both"}
              </Text>
            </View>
          )}

          <View style={{ height: spacing.lg }} />

          <Button
            title="Log Visitor"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ icon, color, title }: { icon: string; color: string; title: string }) {
  return (
    <View style={sharedStyles.sectionLabel}>
      <Feather name={icon as any} size={14} color={color} />
      <Text style={sharedStyles.sectionTitle}>{title}</Text>
    </View>
  );
}

interface DeclarationCardProps {
  title: string;
  icon: string;
  iconColor: string;
  declarationText: string;
  signature: string | null;
  onCapture: (sig: string) => void;
  onClear: () => void;
}

function DeclarationCard({
  title,
  icon,
  iconColor,
  declarationText,
  signature,
  onCapture,
  onClear,
}: DeclarationCardProps) {
  const signed = !!signature;

  return (
    <View style={[declarationStyles.card, signed && declarationStyles.cardSigned]}>
      <View style={declarationStyles.cardHeader}>
        <View style={declarationStyles.cardTitleRow}>
          <Feather name={icon as any} size={14} color={signed ? "#16a34a" : iconColor} />
          <Text style={[declarationStyles.cardTitle, signed && declarationStyles.cardTitleSigned]}>
            {title}
          </Text>
        </View>
        {signed && (
          <View style={declarationStyles.signedBadge}>
            <Feather name="check" size={11} color="#fff" />
            <Text style={declarationStyles.signedBadgeText}>Signed</Text>
          </View>
        )}
      </View>

      <Text style={declarationStyles.declarationText}>{declarationText}</Text>

      <View style={declarationStyles.sigSection}>
        <Text style={declarationStyles.sigLabel}>
          {signed ? "Signature captured" : "Sign below to confirm agreement"}
        </Text>
        <SignaturePad
          onCapture={onCapture}
          onClear={onClear}
          captured={signed}
          height={160}
        />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const sharedStyles = StyleSheet.create({
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

const declarationStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardSigned: {
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  cardTitleSigned: {
    color: "#15803d",
  },
  signedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#16a34a",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  signedBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: "#fff",
  },
  declarationText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
    backgroundColor: "#f8fafc",
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sigSection: {
    gap: spacing.sm,
  },
  sigLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primaryMuted + "22",
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  timeLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: 2,
  },
  declarationHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.primaryMuted + "18",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hintText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  signedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  signedBannerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: "#15803d",
  },
});
