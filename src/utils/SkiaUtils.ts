import { PercentageString } from '@components/skia/types';
import {
  DataModule,
  SkHostRect,
  Skia,
  SkParagraph,
  SkTextStyle,
  SkTypefaceFontProvider,
  TextAlign,
  TextDecoration,
} from '@shopify/react-native-skia';
import { Point } from '@utils/CommonTypes';
import { rangeIn } from '@utils/Range';
import { random } from 'lodash';
import { DimensionValue, TextStyle, TextStyleAndroid, TextStyleIOS, ViewStyle } from 'react-native';
import { SkParagraphStyle } from './../../node_modules/@shopify/react-native-skia/src/skia/types/Paragraph/ParagraphStyle';

export type SkiaParagraphStyle = {
  font?: DataModule;
  paragraphStyle: SkParagraphStyle;
};

export type ReactNativeTextStyle = Omit<
  TextStyle,
  keyof TextStyleIOS | keyof TextStyleAndroid | keyof ViewStyle | 'textTransform' | 'userSelect'
> & { backgroundColor?: ViewStyle['backgroundColor'] };

export function convertTextStyleToSkia(textStyle: ReactNativeTextStyle): SkiaParagraphStyle {
  'worklet';
  const fontSize = textStyle.fontSize ?? 14;

  const skiaTextStyle: SkTextStyle = {
    color: Skia.Color(textStyle.color?.toString() ?? '#111111'),
    fontSize: fontSize,
  };

  if (textStyle.fontFamily) {
    skiaTextStyle.fontFamilies = [textStyle.fontFamily];
  }

  if (textStyle.fontWeight) {
    const fontWeight =
      textStyle.fontWeight === 'normal'
        ? 400
        : textStyle.fontWeight === 'bold'
          ? 700
          : Number(textStyle.fontWeight ?? '400');
    skiaTextStyle.fontStyle = { weight: fontWeight };
  }

  if (textStyle.letterSpacing) {
    skiaTextStyle.letterSpacing = textStyle.letterSpacing;
  }

  if (textStyle.textDecorationLine) {
    skiaTextStyle.decoration = getSkiaTextDecoration(textStyle.textDecorationLine);
  }

  if (textStyle.textShadowRadius && textStyle.textShadowRadius > 0) {
    skiaTextStyle.shadows = [
      {
        color: Skia.Color(textStyle.textShadowColor?.toString() ?? '#111111'),
        blurRadius: textStyle.textShadowRadius ?? 4,
        offset: Skia.Point(
          textStyle.textShadowOffset?.width ?? 0,
          textStyle.textShadowOffset?.height ?? 0,
        ),
      },
    ];
  }

  if (textStyle.lineHeight && fontSize > 0) {
    skiaTextStyle.heightMultiplier = textStyle.lineHeight / fontSize;
  }

  if (textStyle.backgroundColor) {
    skiaTextStyle.backgroundColor = Skia.Color(textStyle.backgroundColor.toString());
  }

  return {
    font: isSupportedFontFamily(textStyle.fontFamily) ? getFont(textStyle.fontFamily) : undefined,
    paragraphStyle: {
      textAlign: getSkiaTextAlign(textStyle.textAlign) ?? TextAlign.Left,
      textStyle: skiaTextStyle,
    },
  };
}

export function createSkiaParagraph(
  text: string,
  customFontMgr: SkTypefaceFontProvider | null,
  paragraphStyle: SkParagraphStyle,
): SkParagraph | null {
  'worklet';
  if (!customFontMgr) {
    return null;
  }
  const textStyle = {
    ...paragraphStyle.textStyle,
    fontFamilies: ['FontName'],
  };
  const para = (
    customFontMgr
      ? Skia.ParagraphBuilder.Make(paragraphStyle, customFontMgr)
      : Skia.ParagraphBuilder.Make(paragraphStyle)
  )
    .pushStyle(textStyle)
    .addText(text)
    .pop()
    .build();
  return para;
}

function getSkiaTextAlign(textAlign: TextStyle['textAlign'] | undefined): TextAlign | undefined {
  if (!textAlign) return undefined;
  switch (textAlign) {
    case 'center':
      return TextAlign.Center;
    case 'left':
      return TextAlign.Left;
    case 'right':
      return TextAlign.Right;
    case 'justify':
      return TextAlign.Justify;
    case 'auto':
      return TextAlign.Left;
  }
}

function getSkiaTextDecoration(
  textDecoration: TextStyle['textDecorationLine'] | undefined,
): TextDecoration | undefined {
  'worklet';
  if (!textDecoration) return undefined;
  switch (textDecoration) {
    case 'underline':
      return TextDecoration.Underline;
    case 'line-through':
      return TextDecoration.LineThrough;
    case 'underline line-through':
      return TextDecoration.LineThrough;
  }
}

const supportedFontFamilies = [
  'Poppins-Thin',
  'Poppins-Light',
  'Poppins-Regular',
  'Poppins-Medium',
  'Poppins-SemiBold',
  'Poppins-Bold',
  'Poppins-ExtraBold',
] as const;

// Create the SupportedFontFamily type based on the array
export type SupportedFontFamily = (typeof supportedFontFamilies)[number];

// Type guard function

export function isSupportedFontFamily(value: string | undefined): value is SupportedFontFamily {
  if (!value) return false;
  return (supportedFontFamilies as readonly string[]).includes(value);
}
export function getFont(fontFamily: SupportedFontFamily): DataModule {
  switch (fontFamily) {
    case 'Poppins-Thin':
      return require('@assets/fonts/Poppins/Poppins-Thin.ttf');
    case 'Poppins-Light':
      return require('@assets/fonts/Poppins/Poppins-Light.ttf');
    case 'Poppins-Regular':
      return require('@assets/fonts/Poppins/Poppins-Regular.ttf');
    case 'Poppins-Medium':
      return require('@assets/fonts/Poppins/Poppins-Medium.ttf');
    case 'Poppins-SemiBold':
      return require('@assets/fonts/Poppins/Poppins-SemiBold.ttf');
    case 'Poppins-Bold':
      return require('@assets/fonts/Poppins/Poppins-Bold.ttf');
    case 'Poppins-ExtraBold':
      return require('@assets/fonts/Poppins/Poppins-ExtraBold.ttf');
  }
}
export function randomPositions(numberOfItems: number, boundsRect: SkHostRect): Array<Point> {
  return Array(numberOfItems)
    .fill(0)
    .map(() => ({
      x: random(boundsRect.x, boundsRect.width, false),
      y: random(boundsRect.y, boundsRect.height, false),
    }));
}

export type PureDimension = number | PercentageString;

export function dimenToPureDimen(value: DimensionValue | undefined): PureDimension | undefined {
  'worklet';
  if (!value) return undefined;
  const isValid =
    typeof value === 'number' ||
    (typeof value === 'string' &&
      value.endsWith('%') &&
      (() => {
        const intValue = parseInt(value.substring(0, value.length - 1));
        return !Number.isNaN(intValue) && rangeIn(intValue, { start: 0, end: 100 });
      })());
  return isValid ? (value as PureDimension) : undefined;
}
