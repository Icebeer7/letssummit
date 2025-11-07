import { Dimensions } from 'react-native';

import { colors as Colors } from './Colors';
import { ColorPalette, Shadows, Shapes, Theme, Typography } from './Theme.interface';
import { clamp, convertToExpectedRange } from '../utils/MathUtils';
import { spacingWithScaleFactor, typographyWithScaleFactor } from '../utils/ThemeUtils';
import { PoppinsFont } from '@utils/PoppinsFontUtils';

const DEFAULT_COLOR_PALLETE: ColorPalette = {
  backgroundLight: '#F6F7F9',
  background: '#EFF3F6',
  backgroundDark: '#CBE1FA',

  onBackground100: '#49536A',
  onBackground200: '#001429',
  onBackground300: '#191F2D',
  onBackground400: '#161616',
  onBackground500: '#111111',

  primary40: '#D8E6F8',
  primary50: '#92AFE1',
  primary100: '#6498DE',
  primary150: '#7096D8',
  primary200: '#2D68D1', // Opacity: 91%
  primary300: '#046AD8',
  primary350: '#2F80ED',
  primary400: '#1481FF', // Opacity: 25%
  primary450: '#1E5AC1',
  primary500: '#1C57BF',
  primary600: '#1D4488',
  primary700: '#18315F',

  onPrimary100: '#FFFFFF',
  onPrimary200: '#FCFCFC',
  onPrimary300: '#F6F7F9',
  onPrimary400: '#EEEFF1',
  onPrimary500: '#E7EBF0',
  onPrimary600: '#D2D8E4',

  secondaryLight: '#E9FBF1',
  secondary: '#30CB83',
  secondaryDark: '#0E3F27', // Opacity: 25%

  onSecondary: '#161616',
  onSecondaryLight: '#0E3F27',
  onSecondaryDark: '#FCFCFC',

  tertiaryLight: '#FEF4EE',
  tertiary: '#F09460',
  tertiaryDark: '#F07410',

  onTertiary: '#FCFCFC',
  onTertiaryLight: '#001429',
  onTertiaryDark: '#FCFCFC',

  surface: '#EDF5FF',
  surfaceVariant: '#EFF3F6',
  surfaceVariant2: '#FFE8AD',
  surfaceVariant3: '#D3D3C4',

  onSurfaceVariant: '#B4920B',
  onSurfaceVariant2: '#C79E00',

  onSurface0: '#FFFFFF',
  onSurface100: '#DCE1E9',
  onSurface200: '#DCE3EE', // Opacity: 60%
  onSurface250: '#CEDAF0',
  onSurface300: '#B2BCD2',
  onSurface400: '#9BA9C5',
  onSurface500: '#677790',
  onSurface600: '#6E7B97',
  onSurface700: '#64718B',
  onSurface800: '#49536A',
  onSurface850: '#333333',
  onSurface900: '#191F2D',
  onSurface1000: '#000000',

  surfaceContainerExtraLight: '#FCFCFC',
  surfaceContainerLight: '#EEEFF1',
  surfaceContainer: '#E8EBF0',
  surfaceContainerDark: '#49536A',
  surfaceContainerExtraDark: '#1D4488',

  onSurfaceContainerDark: '#DCE3EE',
  onSurfaceContainer: '#1C57BF',
  onSurfaceContainerLight: '#1D4488',

  outlineLight: '#DCE3EE',
  outline: '#9BA9C5',
  outlineDark: '#191F2D',
  outlineDarkVariant: '#A6A6A6',

  success: '#30CB83',
  successVariant: '#6BFFB8',
  successSurface: '#d4f3e4',
  successSurfaceVariant: '#45B983',
  onSuccessSurface: '#2B543A',
  onSuccessSurfaceVariant: '#0E3F27',

  error: '#E74C3C',
  errorVariant: '#FF5B51',
  errorSurface: '#FEE2E7',
  onErrorSurface: '#B0281A',
  onErrorSurfaceVariant: '#BA1A1A',

  info: '#54A0FF',
  infoVariant: '#A1CDFF',
  infoSurface: '#EAF4FB',
  onInfoSurface: '#0C3262',

  warning: '#F09460',
  warningVariant: '#E8B931',
  warningSurfaceLight: '#FEF4EE',
  warningSurfaceDark: '#FFE8CB',
  onWarningSurface: '#F09460',

  shadowLight: '#ddd',
  shadowDark: '#1B1B1B',
  shadowHighlight: '#0052B4',
};

export const DEFAULT_SHAPES: Shapes = {
  none: { borderRadius: 0 },
  extraSmall: { borderRadius: 4 },
  small: { borderRadius: 8 },
  medium: { borderRadius: 10 },
  large: { borderRadius: 16 },
  extraLarge: { borderRadius: 24 },
  full: { borderRadius: 1000 },
};

export const DEFAULT_SHADOWS: Shadows = {
  light: {
    shadowColor: Colors.black950,
    shadowOffset: { width: 0, height: 6.05 },
    shadowRadius: 26,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  card: {
    shadowColor: Colors.black950,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 22,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  small: {
    shadowColor: Colors.black400,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.15,
    elevation: 6,
  },
  medium: {
    shadowColor: Colors.black400,
    shadowOffset: { width: 0, height: 15 },
    shadowRadius: 15,
    shadowOpacity: 0.15,
    elevation: 8,
  },
  large: {
    shadowColor: Colors.black1000,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 12,
    shadowOpacity: 0.2,
    elevation: 16,
  },
  elevated: {
    shadowColor: Colors.black400,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 10,
  },
  center: {
    shadowColor: Colors.black1000,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.15,
    elevation: 5,
  },
};

const { width } = Dimensions.get('window');
const [minWidth, maxWidth] = [700, 1250];

const largeScreenScaleFactor = convertToExpectedRange(
  clamp(width, minWidth, maxWidth),
  minWidth,
  maxWidth,
  1,
  1,
);

export const DEFAULT_TYPOGRAPHY: Typography = typographyWithScaleFactor(
  {
    display: {
      extraSmall: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 20,
        includeFontPadding: false,
      },
      small: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 22,
        includeFontPadding: false,
      },
      medium: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 28,
        includeFontPadding: false,
      },
      large: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 36,
        includeFontPadding: false,
      },
      extraLarge: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 48,
        includeFontPadding: false,
      },
    },
    headline: {
      extraSmall: {
        fontFamily: PoppinsFont.Light,
        fontSize: 16,
        includeFontPadding: false,
      },
      small: {
        fontFamily: PoppinsFont.Medium,
        fontSize: 20,
        includeFontPadding: false,
      },
      medium: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 22,
        includeFontPadding: false,
      },
      large: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 24,
        includeFontPadding: false,
      },
      extraLarge: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 28,
        includeFontPadding: false,
      },
    },
    title: {
      extraSmall: {
        fontFamily: PoppinsFont.Medium,
        fontSize: 12,
        includeFontPadding: false,
      },
      small: {
        fontFamily: PoppinsFont.Medium,
        fontSize: 14,
        includeFontPadding: false,
      },
      medium: {
        fontFamily: PoppinsFont.Medium,
        fontSize: 16,
        includeFontPadding: false,
      },
      large: {
        fontFamily: PoppinsFont.Medium,
        fontSize: 18,
        includeFontPadding: false,
      },
      extraLarge: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 20,
        includeFontPadding: false,
      },
    },
    body: {
      extraSmall: {
        fontFamily: PoppinsFont.Regular,
        fontSize: 11,
        includeFontPadding: false,
      },
      small: {
        fontFamily: PoppinsFont.Regular,
        fontSize: 12,
        includeFontPadding: false,
      },
      medium: {
        fontFamily: PoppinsFont.Regular,
        fontSize: 14,
        includeFontPadding: false,
      },
      large: {
        fontFamily: PoppinsFont.Regular,
        fontSize: 16,
        includeFontPadding: false,
      },
      extraLarge: {
        fontFamily: PoppinsFont.Regular,
        fontSize: 21,
        includeFontPadding: false,
      },
    },
    label: {
      extraSmall: {
        fontFamily: PoppinsFont.Regular,
        fontSize: 8,
        includeFontPadding: false,
      },
      small: {
        fontFamily: PoppinsFont.Regular,
        fontSize: 10,
        includeFontPadding: false,
      },
      medium: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 14,
        includeFontPadding: false,
      },
      large: {
        fontFamily: PoppinsFont.SemiBold,
        fontSize: 16,
        includeFontPadding: false,
      },
      extraLarge: {
        fontFamily: PoppinsFont.Light,
        fontSize: 16,
        includeFontPadding: false,
      },
    },
  },
  largeScreenScaleFactor,
);

export const DEFAULT_THEME_ID = 'default-light';

export const DEFAULT_SPACING = spacingWithScaleFactor(
  {
    pageMarginStart: 22,
    pageMarginEnd: 22,
    pageMarginTop: 22,
    pageMarginBottom: 22,
  },
  largeScreenScaleFactor,
);

export const NIRVANA_THEME: Theme = {
  id: DEFAULT_THEME_ID,
  colors: DEFAULT_COLOR_PALLETE,
  shapes: DEFAULT_SHAPES,
  typography: DEFAULT_TYPOGRAPHY,
  shadows: DEFAULT_SHADOWS,
  spacing: DEFAULT_SPACING,
  scaleFactor: largeScreenScaleFactor,
};
