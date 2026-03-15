import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Polygon, Marker } from "react-native-maps";

import { colors } from "@/constants/colors";

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
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
      mapType="hybrid"
    >
      {fields.map((field: FieldBoundary) =>
        field.coordinates.length >= 3 ? (
          <Polygon
            key={field.id}
            coordinates={field.coordinates}
            fillColor="rgba(46, 125, 50, 0.25)"
            strokeColor={colors.primary}
            strokeWidth={2}
          />
        ) : null,
      )}
      {fields.map((field: FieldBoundary) =>
        field.coordinates.length > 0 ? (
          <Marker
            key={`label-${field.id}`}
            coordinate={field.coordinates[0]}
            title={field.fieldName}
            description={`${field.coordinates.length} points${field.areaHectares ? ` \u00B7 ${field.areaHectares} ha` : ""}`}
          />
        ) : null,
      )}
      {isRecording &&
        recordedPoints.map((point: { latitude: number; longitude: number }, i: number) => (
          <Marker
            key={`rec-${i}`}
            coordinate={point}
            pinColor={colors.error}
            title={`Point ${i + 1}`}
          />
        ))}
      {isRecording && recordedPoints.length >= 3 && (
        <Polygon
          coordinates={recordedPoints}
          fillColor="rgba(239, 68, 68, 0.15)"
          strokeColor={colors.error}
          strokeWidth={2}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
