import React from 'react';
import { Shape } from '../../theme/Theme.interface';
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Canvas, Group, Mask, Rect, RoundedRect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { PercentageString } from '@components/twopane/TwoPaneProps.types';
import { parsePercentageWorklet } from '@utils/GeneralUtils';
import CornerMaskSkia from './CornerMaskSkia';

type Layout = {
  x: number | PercentageString;
  y: number | PercentageString;
  width: number | PercentageString;
  height: number | PercentageString;
};

export type MaskViewSkiaProps = {
  layout: Layout;
  shape: Shape;
  maskColor: string;
  style?: StyleProp<ViewStyle>;
};

export default function MaskViewSkia({
  layout,
  shape,
  maskColor,
  style,
}: MaskViewSkiaProps): React.ReactNode {
  if (layout.x === 0 && layout.y === 0 && layout.width === '100%' && layout.height === '100%') {
    const borderRadius = Math.max((shape.borderRadius as number) ?? 0, 0);

    return (
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }, style]}>
        <CornerMaskSkia
          mode="topLeft"
          size={borderRadius}
          color={maskColor}
          style={{ position: 'absolute', left: 0, top: 0 }}
        />
        <CornerMaskSkia
          mode="topRight"
          size={borderRadius}
          color={maskColor}
          style={{ position: 'absolute', right: 0, top: 0 }}
        />
        <CornerMaskSkia
          mode="bottomLeft"
          size={borderRadius}
          color={maskColor}
          style={{ position: 'absolute', left: 0, bottom: 0 }}
        />
        <CornerMaskSkia
          mode="bottomRight"
          size={borderRadius}
          color={maskColor}
          style={{ position: 'absolute', right: 0, bottom: 0 }}
        />
      </View>
    );
  }

  return <MaskViewSkiaInternal layout={layout} shape={shape} maskColor={maskColor} style={style} />;
}

function MaskViewSkiaInternal({ layout, shape, maskColor, style }: MaskViewSkiaProps) {
  const borderRadius = Math.max((shape.borderRadius as number) ?? 0, 0);

  const windowSize = Dimensions.get('window');
  const size = useSharedValue<{ width: number; height: number }>({
    width: Math.max(4, windowSize.width),
    height: Math.max(4, windowSize.height),
  });

  const canvasWidth = useDerivedValue(() => size.value.width);
  const canvasHeight = useDerivedValue(() => size.value.height);

  const x = useDerivedValue(() => getValue(layout.x, size.value.width));
  const y = useDerivedValue(() => getValue(layout.y, size.value.height));
  const maskWidth = useDerivedValue(() => getValue(layout.width, size.value.width));
  const maskHeight = useDerivedValue(() => getValue(layout.height, size.value.height));

  return (
    <Canvas
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { width: '100%', height: '100%', minHeight: 4, minWidth: 4 },
        style,
      ]}
      onSize={size}>
      <Mask
        mode="luminance"
        mask={
          <Group>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} color="white" />
            <RoundedRect
              r={borderRadius}
              x={x}
              y={y}
              width={maskWidth}
              height={maskHeight}
              color="black"
            />
          </Group>
        }>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} color={maskColor} />
      </Mask>
    </Canvas>
  );
}

function getValue(value: number | PercentageString, parentSize: number): number {
  'worklet';
  if (typeof value === 'number') {
    return value;
  }

  const percentageFraction = parsePercentageWorklet(value) / 100;
  return parentSize * percentageFraction;
}
