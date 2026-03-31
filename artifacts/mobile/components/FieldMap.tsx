import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Polygon, Marker, UrlTile } from "react-native-maps";

import { colors } from "@/constants/colors";

import type { FieldBoundary } from "@/lib/types";

const NVZ_TILE_URL =
  "https://environment.data.gov.uk/arcgis/rest/services/EA/NVZ2017/MapServer/tile/{z}/{y}/{x}";

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
  showNvzLayer?: boolean;
}

export function FieldMap({ fields, recordedPoints, isRecording, initialRegion, showNvzLayer }: FieldMapProps) {
  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
      mapType="hybrid"
    >
      {showNvzLayer && (
        <UrlTile
          urlTemplate={NVZ_TILE_URL}
          opacity={0.5}
          zIndex={1}
          shouldReplaceMapContent={false}
          maximumZ={16}
        />
      )}

      {fields.map((field: FieldBoundary) =>
        field.coordinates.length >= 3 ? (
          <Polygon
            key={field.id}
            coordinates={field.coordinates}
            fillColor="rgba(46, 125, 50, 0.25)"
            strokeColor={colors.primary}
            strokeWidth={2}
            zIndex={2}
          />
        ) : null,
      )}
      {fields.map((field: FieldBoundary) =>
        field.coordinates.length > 0 ? (
          <Marker
            key={`label-${field.id}`}
            coordinate={field.coordinates[0]}
            title={field.fieldName}
            description={`${field.coordinates.length} points${field.areaHectares ? ` · ${field.areaHectares} ha` : ""}`}
            zIndex={3}
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
            zIndex={3}
          />
        ))}
      {isRecording && recordedPoints.length >= 3 && (
        <Polygon
          coordinates={recordedPoints}
          fillColor="rgba(239, 68, 68, 0.15)"
          strokeColor={colors.error}
          strokeWidth={2}
          zIndex={2}
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
