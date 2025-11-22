import {
  Canvas,
  FitBox,
  rect,
  useCanvasRef,
  SkColor,
  SkPoint,
  Rect,
  LinearGradient,
  point,
  Skia,
} from '@shopify/react-native-skia';
import React, { useMemo, useState } from 'react';
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type LinearGradientSkiaProps = {
  startFraction?: SkPoint;
  endFraction?: SkPoint;
  pos?: number[];
  colors: SkColor[];
  style?: StyleProp<ViewStyle>;
};

const windowDimens = Dimensions.get('window');

export default function LinearGradientSkia({
  colors,
  startFraction = point(0, 0),
  endFraction = point(0, 1),
  pos = [0.1, 1],
  style,
}: LinearGradientSkiaProps) {
  const flatStyle = useMemo(() => StyleSheet.flatten(style), [style]);
  const styleWidth = (flatStyle?.width as number) ?? windowDimens.width;
  const styleHeight = (flatStyle?.height as number) ?? windowDimens.height;

  const canvasRef = useCanvasRef();
  const [canvasSize, setCanvasSize] = useState({ width: styleWidth, height: styleHeight });

  const start = {
    x: startFraction.x * SOURCE_WIDTH,
    y: startFraction.y * SOURCE_HEIGHT,
  };
  const end = {
    x: endFraction.x * SOURCE_WIDTH,
    y: endFraction.y * SOURCE_HEIGHT,
  };

  const lengthDim = Math.max(canvasSize.width, canvasSize.height);

  return (
    <View
      style={{ display: 'contents' }}
      onLayout={({ nativeEvent }) => {
        if (
          !(typeof flatStyle?.width === 'number' && typeof flatStyle?.height === 'number') ||
          (styleWidth !== canvasSize.width && styleHeight !== canvasSize.height)
        ) {
          setCanvasSize({ width: nativeEvent.layout.width, height: nativeEvent.layout.height });
        }
      }}>
      <Canvas
        ref={canvasRef}
        style={[{ width: '100%', height: '100%', overflow: 'hidden' }, style]}>
        <FitBox
          src={{ x: 0, y: 0, width: SOURCE_WIDTH, height: SOURCE_HEIGHT }}
          dst={{ x: 0, y: 0, width: lengthDim, height: lengthDim }}>
          <Rect rect={rect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT)}>
            <LinearGradient
              start={start}
              end={end}
              colors={colors}
              positions={pos}
              mode={'clamp'}
            />
          </Rect>
        </FitBox>
      </Canvas>
    </View>
  );
}

const SOURCE_WIDTH = 124;
const SOURCE_HEIGHT = 124;

export type ColorHexString = string;
export function skiaColors(colors: ColorHexString[]) {
  return colors.map(color => Skia.Color(color));
}
