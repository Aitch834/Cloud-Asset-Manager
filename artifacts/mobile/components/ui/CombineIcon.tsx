import React from "react";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

interface CombineIconProps {
  size?: number;
  color?: string;
}

export function CombineIcon({ size = 24, color = "#000" }: CombineIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Grain tank — tall box at the rear */}
      <Rect x="14" y="2.5" width="6.5" height="10.5" rx="1" stroke={color} strokeWidth="1.4" />

      {/* Cab — shorter, sits in front of grain tank */}
      <Rect x="8.5" y="6" width="6.5" height="7" rx="1" stroke={color} strokeWidth="1.4" />

      {/* Cab window */}
      <Rect x="9.5" y="7" width="4" height="3" rx="0.5" stroke={color} strokeWidth="0.9" />

      {/* Header / cutting platform — wide flat bar at front */}
      <Rect x="1" y="13" width="14" height="2" rx="0.5" stroke={color} strokeWidth="1.2" />

      {/* Cutter teeth — small triangles along header bottom */}
      <Path
        d="M2 15 L3 17 L4 15 L5 17 L6 15 L7 17 L8 15 L9 17 L10 15 L11 17 L12 15 L13 17 L14 15"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Chassis / underframe */}
      <Line x1="8.5" y1="13" x2="8.5" y2="16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <Line x1="8.5" y1="16" x2="20" y2="16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />

      {/* Large rear drive wheel */}
      <Circle cx="18" cy="19.5" r="3" stroke={color} strokeWidth="1.4" />
      <Circle cx="18" cy="19.5" r="0.8" fill={color} />

      {/* Small front castor wheel */}
      <Circle cx="6" cy="19" r="2" stroke={color} strokeWidth="1.4" />
      <Circle cx="6" cy="19" r="0.6" fill={color} />

      {/* Unloading auger pipe */}
      <Path
        d="M20.5 4 L23 1.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
