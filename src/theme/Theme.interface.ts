import { ColorValue, ShadowStyleIOS, TextStyle, ViewStyle } from 'react-native';

export interface Theme {
  id: string;
  colors: ColorPalette;
  typography: Typography;
  shapes: Shapes;
  spacing: Spacing;
  shadows: Shadows;
  scaleFactor: number;
}

export interface ColorPalette {
  backgroundLight: ColorValue;
  background: ColorValue;
  backgroundDark: ColorValue;

  onBackground100: ColorValue;
  onBackground200: ColorValue;
  onBackground300: ColorValue;
  onBackground400: ColorValue;
  onBackground500: ColorValue;

  primary40: ColorValue;
  primary50: ColorValue;
  primary100: ColorValue;
  primary150: ColorValue;
  primary200: ColorValue; // Opacity: 91%
  primary300: ColorValue;
  primary350: ColorValue;
  primary400: ColorValue; // Opacity: 25%
  primary450: ColorValue;
  primary500: ColorValue;
  primary600: ColorValue;
  primary700: ColorValue;

  onPrimary100: ColorValue;
  onPrimary200: ColorValue;
  onPrimary300: ColorValue;
  onPrimary400: ColorValue;
  onPrimary500: ColorValue;
  onPrimary600: ColorValue;

  secondaryLight: ColorValue;
  secondary: ColorValue;
  secondaryDark: ColorValue; // Opacity: 25%

  onSecondary: ColorValue;
  onSecondaryLight: ColorValue;
  onSecondaryDark: ColorValue;

  tertiaryLight: ColorValue;
  tertiary: ColorValue;
  tertiaryDark: ColorValue;

  onTertiary: ColorValue;
  onTertiaryLight: ColorValue;
  onTertiaryDark: ColorValue;

  surface: ColorValue;
  surfaceVariant: ColorValue;
  surfaceVariant2: ColorValue;
  surfaceVariant3: ColorValue;

  onSurfaceVariant: ColorValue;
  onSurfaceVariant2: ColorValue;

  onSurface0: ColorValue;
  onSurface100: ColorValue;
  onSurface200: ColorValue; // Opacity: 60%
  onSurface250: ColorValue;
  onSurface300: ColorValue;
  onSurface400: ColorValue;
  onSurface500: ColorValue;
  onSurface600: ColorValue;
  onSurface700: ColorValue;
  onSurface800: ColorValue;
  onSurface850: ColorValue;
  onSurface900: ColorValue;
  onSurface1000: ColorValue;

  surfaceContainerExtraLight: ColorValue;
  surfaceContainerLight: ColorValue;
  surfaceContainer: ColorValue;
  surfaceContainerDark: ColorValue;
  surfaceContainerExtraDark: ColorValue;

  onSurfaceContainerDark: ColorValue;
  onSurfaceContainer: ColorValue;
  onSurfaceContainerLight: ColorValue;

  outlineLight: ColorValue;
  outline: ColorValue;
  outlineDark: ColorValue;
  outlineDarkVariant: ColorValue;

  success: ColorValue;
  successVariant: ColorValue;
  successSurface: ColorValue;
  successSurfaceVariant: ColorValue;
  onSuccessSurface: ColorValue;
  onSuccessSurfaceVariant: ColorValue;

  error: ColorValue;
  errorVariant: ColorValue;
  errorSurface: ColorValue;
  onErrorSurface: ColorValue;
  onErrorSurfaceVariant: ColorValue;

  info: ColorValue;
  infoVariant: ColorValue;
  infoSurface: ColorValue;
  onInfoSurface: ColorValue;

  warning: ColorValue;
  warningVariant: ColorValue;
  warningSurfaceLight: ColorValue;
  warningSurfaceDark: ColorValue;
  onWarningSurface: ColorValue;

  shadowLight: ColorValue;
  shadowDark: ColorValue;
  shadowHighlight: ColorValue;
}

export interface Typography {
  display: TypographyItemVariants;
  headline: TypographyItemVariants;
  title: TypographyItemVariants;
  body: TypographyItemVariants;
  label: TypographyItemVariants;
}

export interface TypographyItemVariants {
  extraSmall?: TextStyleStrict;
  small: TextStyleStrict;
  medium: TextStyleStrict;
  large: TextStyleStrict;
  extraLarge?: TextStyleStrict;
}

export interface Shapes {
  none: Shape;
  extraSmall: Shape;
  small: Shape;
  medium: Shape;
  large: Shape;
  extraLarge: Shape;
  full: Shape;
}

export interface Spacing {
  pageMarginStart: number;
  pageMarginEnd: number;
  pageMarginTop: number;
  pageMarginBottom: number;
}

export interface Shadows {
  light: ShadowStyle;
  card: ShadowStyle;
  small: ShadowStyle;
  medium: ShadowStyle;
  large: ShadowStyle;
  elevated: ShadowStyle;
  center: ShadowStyle;
}

export type ShadowStyle = ShadowStyleIOS & Pick<ViewStyle, 'elevation'>;

export type TextStyleStrict = Pick<
  TextStyle,
  | 'color'
  | 'fontFamily'
  | 'fontSize'
  | 'fontStyle'
  | 'fontWeight'
  | 'letterSpacing'
  | 'lineHeight'
  | 'textDecorationLine'
  | 'textAlign'
  | 'textDecorationStyle'
  | 'textDecorationColor'
  | 'textShadowColor'
  | 'textShadowOffset'
  | 'textShadowRadius'
  | 'textTransform'
  | 'fontVariant'
  | 'writingDirection'
  | 'textAlignVertical'
  | 'verticalAlign'
  | 'includeFontPadding'
>;

export type Shape = Pick<
  ViewStyle,
  | 'borderBottomEndRadius'
  | 'borderBottomLeftRadius'
  | 'borderBottomRightRadius'
  | 'borderBottomStartRadius'
  | 'borderRadius'
  | 'borderTopEndRadius'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderTopStartRadius'
>;
