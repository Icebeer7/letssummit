import { Platform, StatusBar } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { Spacing, Typography } from '../theme/Theme.interface';
import { replacingAllValuesForKey } from './GeneralUtils';
import { WindowSizeClass, WindowWidthSizeClass } from './WindowSizeClass';

export function typographyWithScaleFactor(typography: Typography, scaleFactor: number): Typography {
  return replacingAllValuesForKey(typography, 'fontSize', value =>
    typeof value === 'number' ? value * scaleFactor : value,
  );
}

export function spacingWithScaleFactor(spacing: Spacing, scaleFactor: number): Spacing {
  return replacingAllValuesForKey(spacing, /margin/, value =>
    typeof value === 'number' ? value * scaleFactor : value,
  );
}

export function getPrimaryShimmerGradientColors() {
  return ['#1067CC', '#2e8fff', '#1067CC'];
}

export function getSystemNavigationBarColorForAlerts() {
  return '#11111166';
  // return ColorUtils.rgba(81, 82, 84, 1).toString();
}

export const shouldSetNavBarColor = () => {
  return Platform.OS === 'android' && Platform.Version < 30;
};

export const setNavBarColor = (
  color: string,
  statusBarColor: string | undefined | null = color,
  style: 'light' | 'dark' = 'light',
) => {
  if (statusBarColor === undefined) {
    statusBarColor = color;
  }
  if (shouldSetNavBarColor()) {
    if (statusBarColor) {
      StatusBar.setBackgroundColor(statusBarColor);
    }
    SystemNavigationBar.setNavigationColor(color, style, 'navigation');
  }
};

export namespace ThemeUtils {
  export function pageMarginHorizontal(
    windowSizeClass: WindowSizeClass,
    threshold: number = 680,
  ): number {
    return windowSizeClass.widthSizeClass !== WindowWidthSizeClass.EXPANDED
      ? windowSizeClass.width > threshold
        ? Math.max(20, (windowSizeClass.width - threshold) / 2)
        : 0
      : 44;
  }
}
