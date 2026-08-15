/**
 * Web stub for react-native-maps.
 * react-native-maps uses native-only modules that cannot compile for web.
 * This stub replaces all exports with no-op View wrappers so the Metro web
 * bundle succeeds; the pest-trap-map screen is never shown in the web preview.
 */
import React from "react";
import { View } from "react-native";

const MapView = ({ children, style }) =>
  React.createElement(View, { style }, children);

MapView.Animated = MapView;

export const Marker = ({ children }) =>
  React.createElement(View, null, children);

export const Callout = ({ children }) =>
  React.createElement(View, null, children);

export const Polygon = () => null;
export const Polyline = () => null;
export const Circle = () => null;
export const Overlay = () => null;
export const Heatmap = () => null;
export const PROVIDER_GOOGLE = "google";
export const PROVIDER_DEFAULT = null;

export default MapView;
