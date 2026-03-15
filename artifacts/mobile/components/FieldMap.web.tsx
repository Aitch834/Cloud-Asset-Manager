import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { fonts, fontSize } from "@/constants/typography";
import { spacing } from "@/constants/spacing";

import type { FieldBoundary } from "@/lib/types";

interface FieldMapProps {
  fields: FieldBoundary[];
  recordedPoints: { latitude: number; longitude: number }[];
  isRecording: boolean;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export function FieldMap({ fields, recordedPoints, isRecording, initialRegion }: FieldMapProps) {
  return (
    <View style={styles.webMap}>
      <Text style={styles.webMapTitle}>GPS Map View</Text>
      <Text style={styles.webMapCoords}>
        {initialRegion.latitude.toFixed(5)}, {initialRegion.longitude.toFixed(5)}
      </Text>
      {fields.length > 0 && (
        <Text style={styles.webMapInfo}>
          {fields.length} field{fields.length !== 1 ? "s" : ""} mapped
        </Text>
      )}
      {isRecording && (
        <Text style={styles.webMapRecording}>
          Recording: {recordedPoints.length} point{recordedPoints.length !== 1 ? "s" : ""}
        </Text>
      )}
      <Text style={styles.webMapNote}>
        Native map available on iOS/Android
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webMap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a2e1a",
    gap: spacing.sm,
  },
  webMapTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: "#fff",
  },
  webMapCoords: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  webMapInfo: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: "#ccc",
  },
  webMapRecording: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.error,
  },
  webMapNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#888",
    marginTop: spacing.md,
  },
});
