import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { Canvas, Circle, Group, Rect, Skia, SkPoint } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

export type BottomRightCornerMaskProps = {
  size: number;
  color: string | SharedValue<string>;
  mode: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  style?: StyleProp<ViewStyle>;
};

export default function CornerMaskSkia({ size, color, mode, style }: BottomRightCornerMaskProps) {
  let circlePoint: SkPoint;

  switch (mode) {
    case 'topLeft': {
      circlePoint = Skia.Point(size, size);
      break;
    }
    case 'topRight': {
      circlePoint = Skia.Point(0, size);
      break;
    }
    case 'bottomLeft': {
      circlePoint = Skia.Point(size, 0);
      break;
    }
    case 'bottomRight': {
      circlePoint = Skia.Point(0, 0);
      break;
    }
  }
  return (
    <Canvas style={[{ width: size, height: size }, style]}>
      <Rect x={0} y={0} width={size} height={size} color={color} />
      <Group blendMode="dstOut">
        <Circle cx={circlePoint.x} cy={circlePoint.y} r={size} color="black" />
      </Group>
    </Canvas>
  );
}
