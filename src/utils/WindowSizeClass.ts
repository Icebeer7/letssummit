export enum WindowWidthSizeClass {
  COMPACT = 0,
  MEDIUM = 1,
  EXPANDED = 2,
}
export namespace WindowWidthSizeClass {
  export function toString(this: WindowWidthSizeClass): string {
    switch (this) {
      case WindowWidthSizeClass.COMPACT:
        return 'COMPACT';
      case WindowWidthSizeClass.MEDIUM:
        return 'MEDIUM';
      case WindowWidthSizeClass.EXPANDED:
        return 'EXPANDED';
    }
  }
}

export enum WindowHeightSizeClass {
  COMPACT = 0,
  MEDIUM = 1,
  EXPANDED = 2,
}
export namespace WindowHeightSizeClass {
  export function toString(this: WindowHeightSizeClass): string {
    switch (this) {
      case WindowHeightSizeClass.COMPACT:
        return 'COMPACT';
      case WindowHeightSizeClass.MEDIUM:
        return 'MEDIUM';
      case WindowHeightSizeClass.EXPANDED:
        return 'EXPANDED';
    }
  }
}

export interface WindowSizeClass {
  widthSizeClass: WindowWidthSizeClass;
  heightSizeClass: WindowHeightSizeClass;
  width: number;
  height: number;
}

export function calculateWindowSizeClass(width: number, height: number): WindowSizeClass {
  return {
    widthSizeClass: calculateWindowWidthSizeClass(width),
    heightSizeClass: calculateWindowHeightSizeClass(height),
    width: width,
    height: height,
  };
}

export function calculateWindowWidthSizeClass(dp: number): WindowWidthSizeClass {
  if (dp < 600) {
    return WindowWidthSizeClass.COMPACT;
  } else if (dp < 1040) {
    return WindowWidthSizeClass.MEDIUM;
  } else {
    return WindowWidthSizeClass.EXPANDED;
  }
}

export function calculateWindowHeightSizeClass(dp: number): WindowHeightSizeClass {
  if (dp < 480) {
    return WindowHeightSizeClass.COMPACT;
  } else if (dp < 900) {
    return WindowHeightSizeClass.MEDIUM;
  } else {
    return WindowHeightSizeClass.EXPANDED;
  }
}

export enum NavigationStrategy {
  MenuBarAndBottomNavBar = 0,
  NavigationRail = 1,
  OpenDrawer = 2,
}
export namespace NavigationStrategy {
  export function desc(navigationStrategy: NavigationStrategy): string {
    switch (navigationStrategy) {
      case NavigationStrategy.MenuBarAndBottomNavBar:
        return 'MenuBarAndBottomNavBar';
      case NavigationStrategy.NavigationRail:
        return 'NavigationRail';
      case NavigationStrategy.OpenDrawer:
        return 'OpenDrawer';
    }
  }
}

export function calculateNavigationStrategy(windowSizeClass: WindowSizeClass): NavigationStrategy {
  switch (windowSizeClass.widthSizeClass) {
    case WindowWidthSizeClass.COMPACT:
      return NavigationStrategy.MenuBarAndBottomNavBar;
    case WindowWidthSizeClass.MEDIUM:
      return NavigationStrategy.NavigationRail;
    case WindowWidthSizeClass.EXPANDED:
      return NavigationStrategy.OpenDrawer;
  }
}

export function calculateLeftNavigationComponentWidth(
  navigationStrategy: NavigationStrategy,
): number {
  switch (navigationStrategy) {
    case NavigationStrategy.MenuBarAndBottomNavBar:
      return 0;
    case NavigationStrategy.NavigationRail:
      return 96;
    case NavigationStrategy.OpenDrawer:
      return 228;
  }
}

export function calculateLeftNavigationComponentWidthUsing(
  windowSizeClass: WindowSizeClass,
): number {
  const navigationStrategy = calculateNavigationStrategy(windowSizeClass);
  return calculateLeftNavigationComponentWidth(navigationStrategy);
}

export function isCompactWidth(windowSizeClass: WindowSizeClass): boolean {
  return windowSizeClass.widthSizeClass === WindowWidthSizeClass.COMPACT;
}

export function isMediumWidth(windowSizeClass: WindowSizeClass): boolean {
  return windowSizeClass.widthSizeClass === WindowWidthSizeClass.MEDIUM;
}

export function isExpandedWidth(windowSizeClass: WindowSizeClass): boolean {
  return windowSizeClass.widthSizeClass === WindowWidthSizeClass.EXPANDED;
}

export function isCompactHeight(windowSizeClass: WindowSizeClass): boolean {
  return windowSizeClass.heightSizeClass === WindowHeightSizeClass.COMPACT;
}

export function isMediumHeight(windowSizeClass: WindowSizeClass): boolean {
  return windowSizeClass.heightSizeClass === WindowHeightSizeClass.MEDIUM;
}

export function isExpandedHeight(windowSizeClass: WindowSizeClass): boolean {
  return windowSizeClass.heightSizeClass === WindowHeightSizeClass.EXPANDED;
}
