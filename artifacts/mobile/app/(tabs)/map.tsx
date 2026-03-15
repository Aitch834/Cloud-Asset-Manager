import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { generateId, getList, appendToList, STORAGE_KEYS } from "@/lib/storage";
import type { FieldBoundary } from "@/lib/types";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [fields, setFields] = useState<FieldBoundary[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPoints, setRecordedPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFields = useCallback(async () => {
    const allFields = await getList<FieldBoundary>(STORAGE_KEYS.FIELD_BOUNDARIES);
    setFields(allFields.filter((f) => f.farmId === currentFarm?.id));
    setLoading(false);
  }, [currentFarm?.id]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  useEffect(() => {
    if (permission?.granted) {
      (async () => {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(loc);
      })();
    }
  }, [permission?.granted]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordedPoints([]);
    if (location) {
      setRecordedPoints([
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
      ]);
    }
  };

  const addPoint = async () => {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setRecordedPoints((prev) => [
      ...prev,
      { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
    ]);
    setLocation(loc);
  };

  const finishRecording = () => {
    if (recordedPoints.length < 3) {
      Alert.alert("Not Enough Points", "You need at least 3 GPS points to define a field boundary.");
      return;
    }

    Alert.prompt
      ? Alert.prompt("Field Name", "Enter a name for this field:", async (name) => {
          if (name) {
            await saveField(name);
          }
        })
      : Alert.alert("Save Field", "Field boundary recorded with " + recordedPoints.length + " points.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: async () => {
              await saveField("Field " + (fields.length + 1));
            },
          },
        ]);
  };

  const saveField = async (name: string) => {
    const newField: FieldBoundary = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: name,
      coordinates: recordedPoints,
      areaHectares: "",
      soilType: "",
      currentCrop: "",
      notes: `${recordedPoints.length} boundary points recorded`,
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await appendToList(STORAGE_KEYS.FIELD_BOUNDARIES, newField);
    setFields((prev) => [newField, ...prev]);
    setIsRecording(false);
    setRecordedPoints([]);
  };

  if (!permission) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Field Mapping</Text>
        </View>
        <View style={styles.center}>
          <EmptyState
            icon="map-pin"
            title="Location Access Required"
            message="BDE Farm Trac needs your location to record GPS field boundaries and map your farm."
            actionTitle={
              permission.status === "denied" && !permission.canAskAgain
                ? "Open Settings"
                : "Enable Location"
            }
            onAction={
              permission.status === "denied" && !permission.canAskAgain
                ? async () => {
                    if (Platform.OS !== "web") {
                      try {
                        const { Linking } = await import("react-native");
                        Linking.openSettings();
                      } catch {}
                    }
                  }
                : requestPermission
            }
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Mapping</Text>
        <Text style={styles.subtitle}>{currentFarm?.name}</Text>
      </View>

      {isRecording ? (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingHeader}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording Boundary</Text>
          </View>

          <View style={styles.mapPlaceholder}>
            <Feather name="map" size={48} color={colors.primaryMuted} />
            <Text style={styles.mapPlaceholderText}>GPS Boundary Recording</Text>
            {location && (
              <Text style={styles.coordsText}>
                {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </Text>
            )}
          </View>

          <Text style={styles.pointsCount}>
            {recordedPoints.length} point{recordedPoints.length === 1 ? "" : "s"} recorded
          </Text>

          <View style={styles.recordingActions}>
            <Button
              title="Add Point"
              icon="plus"
              onPress={addPoint}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title={recordedPoints.length >= 3 ? "Finish" : "Cancel"}
              icon={recordedPoints.length >= 3 ? "check" : "x"}
              onPress={recordedPoints.length >= 3 ? finishRecording : () => {
                setIsRecording(false);
                setRecordedPoints([]);
              }}
              variant={recordedPoints.length >= 3 ? "primary" : "outline"}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.mapPlaceholder}>
            <Feather name="map" size={48} color={colors.primaryMuted} />
            {location ? (
              <>
                <Text style={styles.mapPlaceholderText}>GPS Position Active</Text>
                <Text style={styles.coordsText}>
                  {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.mapPlaceholderText}>Acquiring GPS...</Text>
                <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />
              </>
            )}
          </View>

          <View style={styles.actionBar}>
            <Button
              title="Record Field Boundary"
              icon="plus-circle"
              onPress={startRecording}
              fullWidth
              disabled={!location}
            />
          </View>

          {fields.length > 0 ? (
            <View style={styles.fieldsList}>
              <Text style={styles.fieldsListTitle}>
                Recorded Fields ({fields.length})
              </Text>
              {fields.map((field) => (
                <Pressable key={field.id} style={styles.fieldItem}>
                  <View style={styles.fieldIcon}>
                    <Feather name="hexagon" size={18} color={colors.fieldGreen} />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldName}>{field.fieldName}</Text>
                    <Text style={styles.fieldMeta}>
                      {field.coordinates.length} points {field.areaHectares ? `\u00B7 ${field.areaHectares} ha` : ""}
                    </Text>
                  </View>
                  {!field.synced && (
                    <View style={styles.unsyncedDot} />
                  )}
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="hexagon"
              title="No Fields Mapped"
              message="Walk your field boundaries with GPS to record them for compliance records."
            />
          )}
        </>
      )}

      <View style={{ height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  mapPlaceholder: {
    marginHorizontal: spacing.lg,
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  mapPlaceholderText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  coordsText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  actionBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  recordingContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  recordingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.error,
  },
  pointsCount: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  recordingActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  fieldsList: {
    paddingHorizontal: spacing.lg,
  },
  fieldsListTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  fieldItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.successBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  fieldContent: {
    flex: 1,
  },
  fieldName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  fieldMeta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unsyncedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
