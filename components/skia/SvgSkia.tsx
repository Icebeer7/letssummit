import { Canvas, fitbox, Group, ImageSVG, rect, Skia, SkSVG } from '@shopify/react-native-skia';
import { parsePercentageWorklet } from '@utils/GeneralUtils';
import { dimenToPureDimen, PureDimension } from '@utils/SkiaUtils';
import { SvgString } from '@utils/SvgUtils';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import Animated, { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { PercentageString } from './types';

export type SvgSkiaProps = {
  svg: SvgString | SkSVG;
  width: number | PercentageString;
  height: number | PercentageString;
  style?: StyleProp<ViewStyle>;
} & ViewProps;

export default function SvgSkia({ svg, width, height, style, ...viewProps }: SvgSkiaProps) {
  const SourceSvg = useMemo(
    () => (typeof svg === 'string' ? Skia.SVG.MakeFromString(svg) : svg),
    [svg],
  );

  if (!SourceSvg) return <View style={[{ width, height }, style]} {...viewProps} />;

  const finalStyle = StyleSheet.flatten(style);
  const maxWidth = dimenToPureDimen(finalStyle?.maxWidth);
  const maxHeight = dimenToPureDimen(finalStyle?.maxHeight);

  if (
    typeof width === 'number' &&
    typeof height === 'number' &&
    (!maxWidth || typeof maxWidth === 'number') &&
    (!maxHeight || typeof maxHeight === 'number')
  ) {
    return (
      <SvgSkiaFixedSize
        svg={SourceSvg}
        width={width}
        height={height}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        style={finalStyle}
        {...viewProps}
      />
    );
  } else {
    return (
      <SvgSkiaDynamicSize
        svg={SourceSvg}
        width={width as PercentageString}
        height={height as PercentageString}
        style={finalStyle}
        {...viewProps}
      />
    );
  }
}

function SvgSkiaFixedSize({
  svg,
  width,
  height,
  maxWidth,
  maxHeight,
  style,
  ...viewProps
}: Omit<SvgSkiaProps, 'svg'> & {
  svg: SkSVG;
  width: number;
  height: number;
  maxWidth?: number;
  maxHeight?: number;
}) {
  return (
    <Canvas style={[{ width: width, height: height }, style]} {...viewProps}>
      <Group
        transform={fitbox(
          'contain',
          rect(0, 0, svg.width() ?? width, svg.height() ?? height),
          rect(0, 0, Math.min(width, maxWidth ?? width), Math.min(height, maxHeight ?? height)),
        )}>
        <ImageSVG svg={svg} />
      </Group>
    </Canvas>
  );
}

function SvgSkiaDynamicSize({
  svg,
  width,
  height,
  style,
  ...viewProps
}: Omit<SvgSkiaProps, 'svg'> & { svg: SkSVG }) {
  const parentSize = useSharedValue({ width: 0, height: 0 });
  const finalStyle = StyleSheet.flatten(style);

  const transform = useDerivedValue(() => {
    const fixedWidth = pureDimenToFixedValue(width, parentSize.value.width);
    const fixedHeight = pureDimenToFixedValue(height, parentSize.value.height);

    const maxWidthPure = dimenToPureDimen(finalStyle?.maxWidth);
    const maxWidth = maxWidthPure
      ? pureDimenToFixedValue(maxWidthPure, parentSize.value.width)
      : parentSize.value.width;

    const maxHeightPure = dimenToPureDimen(finalStyle?.maxHeight);
    const maxHeight = maxHeightPure
      ? pureDimenToFixedValue(maxHeightPure, parentSize.value.height)
      : parentSize.value.height;

    const finalWidth = Math.min(fixedWidth, maxWidth);
    const finalHeight = Math.min(fixedHeight, maxHeight);

    const src = rect(0, 0, svg.width() ?? 0, svg.height() ?? 0);
    const dst = rect(0, 0, finalWidth, finalHeight);
    return fitbox('contain', src, dst);
  });

  return (
    <>
      <Animated.View
        style={{ position: 'absolute', zIndex: -100, width: '100%', height: '100%' }}
        pointerEvents={'none'}
        onLayout={({ nativeEvent: { layout } }) =>
          (parentSize.value = { width: layout.width, height: layout.height })
        }
      />
      <Canvas style={[{ width, height }, style]} {...viewProps}>
        <Group transform={transform}>
          <ImageSVG svg={svg} />
        </Group>
      </Canvas>
    </>
  );
}

function pureDimenToFixedValue(pureValue: PureDimension, parentValue: number): number {
  'worklet';

  return typeof pureValue === 'number'
    ? pureValue
    : (parentValue * parsePercentageWorklet(pureValue)) / 100;
}
