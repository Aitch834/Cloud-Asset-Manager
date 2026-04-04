import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts, fontSize } from "@/constants/typography";
import { spacing, radius } from "@/constants/spacing";

type Point = { x: number; y: number };

interface SignaturePadProps {
  onCapture: (svgDataUrl: string) => void;
  onClear: () => void;
  captured: boolean;
  height?: number;
}

function pointsToPath(pts: Point[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x},${pts[i].y} ${midX},${midY}`;
  }
  d += ` L ${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
  return d;
}

export function SignaturePad({ onCapture, onClear, captured, height = 160 }: SignaturePadProps) {
  const strokesRef = useRef<Point[][]>([]);
  const [renderTick, setRenderTick] = useState(0);
  const dimensionsRef = useRef({ width: 320, height });
  const onCaptureRef = useRef(onCapture);
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);

  function exportSvg(): string {
    const { width: w, height: h } = dimensionsRef.current;
    const paths = strokesRef.current
      .map(pts => pointsToPath(pts))
      .filter(Boolean)
      .map(d => `<path d="${d}" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`)
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="white"/>${paths}</svg>`;
    try {
      const b64 = btoa(unescape(encodeURIComponent(svg)));
      return `data:image/svg+xml;base64,${b64}`;
    } catch {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
  }

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      strokesRef.current = [...strokesRef.current, [{ x: locationX, y: locationY }]];
      setRenderTick(t => t + 1);
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      if (strokesRef.current.length === 0) return;
      strokesRef.current[strokesRef.current.length - 1].push({ x: locationX, y: locationY });
      setRenderTick(t => t + 1);
    },
    onPanResponderRelease: () => {
      if (strokesRef.current.length > 0) {
        onCaptureRef.current(exportSvg());
      }
    },
  }), []);

  function handleClear() {
    strokesRef.current = [];
    setRenderTick(t => t + 1);
    onClear();
  }

  function onLayout(e: LayoutChangeEvent) {
    const { width, height: h } = e.nativeEvent.layout;
    dimensionsRef.current = { width, height: h };
  }

  const hasStrokes = strokesRef.current.length > 0;

  return (
    <View>
      <View style={[styles.padContainer, { height }]}>
        <View
          style={StyleSheet.absoluteFill}
          onLayout={onLayout}
          {...panResponder.panHandlers}
        >
          <Svg
            width="100%"
            height="100%"
            key={renderTick}
            style={StyleSheet.absoluteFill}
          >
            <Rect width="100%" height="100%" fill="white" />
            {strokesRef.current.map((pts, i) => {
              const d = pointsToPath(pts);
              return d ? (
                <Path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null;
            })}
          </Svg>
          {!hasStrokes && (
            <View style={styles.placeholder} pointerEvents="none">
              <Feather name="edit-3" size={20} color="#d1d5db" />
              <Text style={styles.placeholderText}>Sign here</Text>
            </View>
          )}
        </View>
        <View style={styles.baseline} pointerEvents="none" />
      </View>
      {hasStrokes && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Feather name="x" size={12} color={colors.error} />
          <Text style={styles.clearText}>Clear signature</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  padContainer: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#fff",
    position: "relative",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  placeholderText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#9ca3af",
  },
  baseline: {
    position: "absolute",
    bottom: 28,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.error,
  },
});
