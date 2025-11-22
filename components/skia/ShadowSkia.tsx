import React, { forwardRef, useMemo } from 'react';
import {
  Animated as NativeAnimated,
  I18nManager,
  LayoutChangeEvent,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { Canvas, Path, Shadow, Skia } from '@shopify/react-native-skia';
import Animated, {
  BaseAnimationBuilder,
  LayoutAnimationFunction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { EntryOrExitLayoutType } from '../../utils/AnimationUtils';
import useAnimatedNumericToSharedValueConverter from '../../hooks/UseAnimatableNumericToSharedValueConverter.hook';
import { parsePercentageWorklet } from '../../utils/GeneralUtils';
import { PercentageString } from '../twopane/TwoPaneProps.types';
import { testInfoForContainer } from '../../utils/TestAccessibilityUtils';

export type ShadowSkiaProps = ViewProps & {
  children?: React.ReactNode;
};

const isRTL = I18nManager.isRTL;

const ShadowSkia = forwardRef<View, ShadowSkiaProps>(
  ({ style, children, onLayout, ...viewProps }, ref) => {
    const shadowSize = useSharedValue({ width: 0, height: 0 });

    const finalStyle = StyleSheet.flatten(style) ?? {};
    const { borderRadius = 0 } = finalStyle;

    const borderTopLeftRadius = useAnimatedNumericOrStringToSharedValueConverter(
      (isRTL ? finalStyle.borderTopRightRadius : finalStyle.borderTopLeftRadius) ?? borderRadius,
    );
    const borderTopRightRadius = useAnimatedNumericOrStringToSharedValueConverter(
      (isRTL ? finalStyle.borderTopLeftRadius : finalStyle.borderTopRightRadius) ?? borderRadius,
    );
    const borderBottomLeftRadius = useAnimatedNumericOrStringToSharedValueConverter(
      (isRTL ? finalStyle.borderBottomRightRadius : finalStyle.borderBottomLeftRadius) ??
        borderRadius,
    );
    const borderBottomRightRadius = useAnimatedNumericOrStringToSharedValueConverter(
      (isRTL ? finalStyle.borderBottomLeftRadius : finalStyle.borderBottomRightRadius) ??
        borderRadius,
    );

    const {
      shadowOffset,
      shadowColor = 'transparent',
      shadowOpacity = 0,
      shadowRadius,
      elevation = 0,
      ...styleWithoutShadow
    } = finalStyle;

    const blur = shadowRadius ?? elevation;
    const dx = (shadowOffset?.width ?? 0) * (isRTL ? -1 : 1);
    const dy = shadowOffset?.height ?? 0;

    const { top, left, bottom, right } = calculateShadowOffset({ blur, dx, dy });

    const shadowPath = useDerivedValue(() => {
      const shadowWidth = shadowSize.value.width;
      const shadowHeight = shadowSize.value.height;
      const width = shadowWidth / 2;
      const height = shadowHeight / 2;
      const diagonal = Math.sqrt(shadowWidth * shadowWidth + shadowHeight * shadowHeight);
      const arcTopLeft = Math.min(borderTopLeftRadius(diagonal), height);
      const arcTopRight = Math.min(borderTopRightRadius(diagonal), width);
      const arcBottomLeft = Math.min(borderBottomLeftRadius(diagonal), width);
      const arcBottomRight = Math.min(borderBottomRightRadius(diagonal), height);

      const path = Skia.Path.Make();
      path.moveTo(arcTopLeft + left, top);
      path.arcToTangent(
        shadowWidth + left,
        top,
        shadowWidth + left,
        top + arcTopRight,
        arcTopRight,
      );
      path.arcToTangent(
        shadowWidth + left,
        shadowHeight + top,
        shadowWidth + left - arcBottomRight,
        shadowHeight + top,
        arcBottomRight,
      );
      path.arcToTangent(
        left,
        top + shadowHeight,
        left,
        top + shadowHeight - arcBottomLeft,
        arcBottomLeft,
      );
      path.arcToTangent(left, top, left + arcTopLeft, top, arcTopLeft);
      path.close();

      return path;
    });

    const shadowLayoutStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        height: shadowSize.value.height + top + bottom,
        width: shadowSize.value.width + left + right,
        top: -top,
        start: isRTL ? -right : -left,
      };
    });

    const handleOnLayout = (event: LayoutChangeEvent) => {
      shadowSize.value = event.nativeEvent.layout;
      onLayout?.(event);
    };

    const parentLayoutAnimationProps = (viewProps ?? {}) as {
      entering?: EntryOrExitLayoutType;
      exiting?: EntryOrExitLayoutType;
      layout?: typeof BaseAnimationBuilder | BaseAnimationBuilder | LayoutAnimationFunction;
    };

    const borderStyle = useMemo(() => extractBorderStyle(finalStyle), [style]);

    return (
      <View
        {...viewProps}
        ref={ref}
        onLayout={handleOnLayout}
        style={styleWithoutShadow}
        {...testInfoForContainer('shadow-view')}>
        {/* Shadow */}
        <Animated.View style={shadowLayoutStyle} pointerEvents={'none'} accessible={false}>
          <Canvas style={{ flex: 1 }}>
            <Path
              path={shadowPath}
              color={shadowColor.toString()}
              opacity={shadowOpacity as number}>
              <Shadow dx={dx} dy={dy} blur={blur} color={shadowColor.toString()} shadowOnly />
            </Path>
          </Canvas>
        </Animated.View>

        {/* Background */}
        <Animated.View
          pointerEvents={'none'}
          layout={parentLayoutAnimationProps.layout}
          entering={parentLayoutAnimationProps.entering}
          exiting={parentLayoutAnimationProps.exiting}
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: finalStyle.backgroundColor,
            ...borderStyle,
          }}
          {...testInfoForContainer('shadow-content-container')}
        />

        {/* Content */}
        {children}
      </View>
    );
  },
);
export default ShadowSkia;

function useAnimatedNumericOrStringToSharedValueConverter(
  value: number | string | NativeAnimated.AnimatedNode,
) {
  const animatedNodeValue = useAnimatedNumericToSharedValueConverter(
    typeof value !== 'number' && typeof value !== 'string' ? value : 0,
  );
  return (parentSize: number) => {
    'worklet';

    if (typeof value === 'number') {
      return value;
    } else if (typeof value === 'string') {
      if (value.endsWith('%')) {
        const percentage = parsePercentageWorklet(value as PercentageString);
        return (parentSize * percentage) / 100;
      } else {
        return 0;
      }
    } else {
      return animatedNodeValue.value;
    }
  };
}

function extractBorderStyle(style: ViewStyle): Partial<ViewStyle> {
  const regExp = /border/;
  const borderStyle: Record<string, unknown> = {};
  for (const k in style) {
    const key = k as keyof ViewStyle;
    if (Object.hasOwn(style, key) && regExp.test(key)) {
      borderStyle[key] = style[key];
    }
  }
  return borderStyle;
}

const calculateShadowOffset = (dimensions: { blur: number; dx: number; dy: number }) => {
  const { blur, dx, dy } = dimensions;

  const blurRadius = blur * 3;

  const top = blurRadius + (dy < 0 ? -dy : 0);
  const left = blurRadius + (dx < 0 ? -dx : 0);
  const bottom = blurRadius + (dy > 0 ? dy : 0);
  const right = blurRadius + (dx > 0 ? dx : 0);

  return { top, left, bottom, right };
};
