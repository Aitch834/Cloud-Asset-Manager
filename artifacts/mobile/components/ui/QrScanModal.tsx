import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { parseBdeCode, detectBdeType, lookupBdeEntity, type BdeEntityType } from "@/lib/bdeQr";
import { useFarm } from "@/lib/context/FarmContext";

export interface BdeScanResult {
  type: BdeEntityType;
  code: string;
  data: Record<string, unknown>;
}

const ENTITY_LABELS: Record<BdeEntityType, string> = {
  equipment: "Equipment Asset",
  field:     "Field",
  animal:    "Animal",
  storage:   "Storage Location",
  tank:      "Bulk Tank",
};

interface QrScanModalProps {
  visible: boolean;
  onClose(): void;
  onResolved(result: BdeScanResult): void;
  entityType?: BdeEntityType;
  title?: string;
}

export function QrScanModal({
  visible,
  onClose,
  onResolved,
  entityType,
  title = "Scan QR Code",
}: QrScanModalProps) {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const lastScan = useRef<string>("");

  function reset() {
    lastScan.current = "";
    setError(null);
    setLoading(false);
    setScanning(true);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleBarcode({ data }: { data: string }) {
    if (!scanning || !currentFarm || data === lastScan.current) return;
    lastScan.current = data;
    setScanning(false);
    setLoading(true);
    setError(null);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const type = detectBdeType(data);
    if (!type) {
      setError("Unrecognised code. Make sure you're scanning a BDE Farm Trac QR label.");
      setLoading(false);
      return;
    }

    if (entityType && type !== entityType) {
      setError(
        `This is a ${ENTITY_LABELS[type]} code. Please scan a ${ENTITY_LABELS[entityType]} QR label.`,
      );
      setLoading(false);
      return;
    }

    const code = parseBdeCode(data);
    try {
      const entity = await lookupBdeEntity(code, type, Number(currentFarm.id));
      if (entity) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onResolved({ type, code, data: entity });
        handleClose();
      } else {
        setError("No record found for this code. Make sure you scanned a label generated in BDE Farm Trac.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const hintLine = entityType
    ? `${ENTITY_LABELS[entityType]} labels only`
    : "Fields · Animals · Equipment · Storage";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
            <Feather name="x" size={22} color="#fff" />
          </Pressable>
        </View>

        {!permission ? (
          <View style={styles.centre}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : !permission.granted ? (
          <View style={styles.centre}>
            <Feather name="camera-off" size={48} color="rgba(255,255,255,0.45)" />
            <Text style={styles.permTitle}>Camera Access Required</Text>
            <Text style={styles.permSub}>
              BDE Farm Trac needs camera access to scan QR labels.
            </Text>
            <Pressable style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permBtnText}>Grant Camera Access</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {scanning && !loading && !error && (
              <CameraView
                style={styles.camera}
                onBarcodeScanned={handleBarcode}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              >
                <View style={styles.overlay}>
                  <View style={styles.finder} />
                  <Text style={styles.hint}>Point at a BDE Farm Trac QR label</Text>
                  <Text style={styles.sub}>{hintLine}</Text>
                </View>
              </CameraView>
            )}

            {loading && (
              <View style={styles.centre}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Looking up record…</Text>
              </View>
            )}

            {error && !loading && (
              <View style={styles.centre}>
                <Feather name="alert-circle" size={48} color="#fca5a5" />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={reset}>
                  <Feather name="refresh-cw" size={15} color="#fff" />
                  <Text style={styles.retryText}>Try Again</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: "#fff",
  },
  closeBtn: {
    padding: spacing.sm,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  finder: {
    width: 230,
    height: 230,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#4ade80",
    backgroundColor: "transparent",
  },
  hint: {
    color: "#fff",
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    marginTop: spacing.lg,
    opacity: 0.9,
  },
  sub: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  permTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: "#fff",
    textAlign: "center",
  },
  permSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
  },
  permBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  permBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: "#fff",
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.65)",
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: "#fca5a5",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: "#fff",
  },
});
