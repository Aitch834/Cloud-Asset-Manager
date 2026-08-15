/**
 * Web stub for expo-camera — native module not available on web.
 */
import React from "react";
import { View } from "react-native";

export const CameraView = ({ children, style }) =>
  React.createElement(View, { style }, children);

export const useCameraPermissions = () => [{ status: "denied" }, async () => ({ status: "denied" })];
export const Camera = CameraView;
export const CameraType = { back: "back", front: "front" };
export const FlashMode = { off: "off", on: "on", auto: "auto", torch: "torch" };
