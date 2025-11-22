import React, { createContext, useContext, useMemo, useReducer } from 'react';

import DeepPartial, { convertDeepPartialToFullObject } from '@utils/DeepPartial.type';
import { isSharedValue } from 'react-native-reanimated';
import { Log } from '../utils/Log';
import { NIRVANA_THEME } from './Nirvana.theme';
import { Theme } from './Theme.interface';

export type PartialTheme = DeepPartial<Theme>;

export interface ThemeValue {
  theme: Theme;
  dispatch: React.Dispatch<ThemeAction>;
}
export interface ThemeProviderProps {
  theme: ThemeValue;
  children?: React.ReactNode;
}

function canDeepConvert(obj: unknown) {
  return !!(obj && typeof obj === 'object' && !isSharedValue(obj));
}

/**
 * Creates an immutable theme based on the provided partial theme and parent theme.
 *
 * @param {PartialTheme} theme - The partial theme to be applied.
 * @param {Theme} parentTheme - The parent theme to inherit from.
 * @return {ThemeValue} The immutable theme object containing the converted partial theme and a dispatch function.
 */
export function immutableTheme(theme: PartialTheme, parentTheme: Theme): ThemeValue {
  return {
    theme: convertDeepPartialToFullObject(theme, parentTheme, false, canDeepConvert),
    dispatch: () => {
      Log.e('Unable to change the theme. Theme defined is immutable');
    },
  };
}

/**
 * Custom hook for building and managing theme.
 *
 * @param {PartialTheme | ((parentTheme: Theme) => PartialTheme)} initialTheme - The initial theme or a function to generate the initial theme based on the parent theme.
 * @return {{ theme: Theme, dispatch: React.Dispatch<ThemeAction> }} The built theme and a dispatch function for managing theme changes.
 */
export function useThemeBuilder(
  initialTheme: PartialTheme | ((parentTheme: Theme) => PartialTheme),
) {
  const { theme: parentTheme } = useTheme(); // For cascading effect
  const initialThemeFinal =
    typeof initialTheme === 'function' ? initialTheme(parentTheme) : initialTheme;

  const [theme, dispatch] = useReducer(
    themeReducer,
    convertDeepPartialToFullObject(initialThemeFinal, parentTheme, false, canDeepConvert),
  );

  return { theme, dispatch };
}

/**
 * The ThemeProvider serves as a context provider for consistent theming across the application.
 * It allows child components to access and manipulate the theme through the useTheme and useThemedStylesheet hooks.
 * The structure of the Theme required should be specified in Theme.interface.tsx
 *
 * @param {ThemeProviderProps} props - the props for the theme provider
 * @param {ThemeValue} props.theme - The current theme and dispatch function for updating the theme.
 * @param {React.ReactNode} [props.children] - The child components that will have access to the theme.
 * @return {JSX.Element} the theme provider component

 * @reference useTheme - Hook for accessing the current theme
 * @see useThemedStyleSheet - Hook for for accessing the current theme and 
 * @see Theme.interface.ts - Theme definition
 * generating a themed stylesheet based on the current theme
 */
export const ThemeProvider = (props: ThemeProviderProps) => {
  return (
    <ThemeProviderContext.Provider value={props.theme}>
      {props.children}
    </ThemeProviderContext.Provider>
  );
};

/**
 * Function to consume the theme with the provided children.
 *
 * @param {(props: ThemeValue) => React.ReactNode} props.children - function to get children components for the theme passed
 * @return {React.ReactNode} The children components with the applied theme
 */
export const ThemeConsumer = (props: { children: (props: ThemeValue) => React.ReactNode }) => {
  return <ThemeProviderContext.Consumer>{props.children}</ThemeProviderContext.Consumer>;
};

/**
 * Hook for accessing the current theme and a function to update the theme.
 *
 * @return {Object} An object containing the current theme and a function to update the theme
 */
export const useTheme = () => {
  const { theme, dispatch } = useContext(ThemeProviderContext);
  return {
    theme,
    setTheme: (newTheme: PartialTheme) => dispatch(ThemeActions.updateTheme(newTheme)),
  };
};

export interface ThemedStyleSheet<T> {
  styles: T;
  theme: Theme;
  setTheme: (theme: PartialTheme | Theme) => void;
}

/**
 * Custom hook for for accessing the current theme and
 * generates a themed stylesheet based on the provided createStyleSheet function and the current theme.
 *
 * @param {(theme: Theme) => T} createStyleSheet - a function that creates a stylesheet based on the theme
 * @return {ThemedStyleSheet<T>} the themed stylesheet object
 *
 * @see ThemedStyleSheet
 */
export function useThemedStyleSheet<T, Args extends unknown[] = []>(
  createStyleSheet: (theme: Theme, ...args: Args) => T,
  ...args: Args
): ThemedStyleSheet<T> {
  const themeValue = useTheme();

  const themedStylesheet = useMemo(
    () => ({
      styles: createStyleSheet(themeValue.theme, ...args),
      theme: themeValue.theme,
      setTheme: themeValue.setTheme,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [createStyleSheet, themeValue.theme, themeValue.setTheme, ...args],
  );

  return themedStylesheet;
}

const ThemeProviderContext = createContext<ThemeValue>({
  theme: NIRVANA_THEME,
  dispatch: () => {
    Log.e('Unable to change the theme. ThemeProvider not registered');
  },
});

function themeReducer(currentTheme: Theme, action: ThemeAction) {
  if (action.type === ThemeActionType.UPDATE_THEME) {
    if ('isFullTheme' in action.payload) {
      // Optimization
      const { isFullTheme, ...newTheme } = action.payload;
      if (isFullTheme) {
        return newTheme as Theme;
      }
    }
    const newTheme = convertDeepPartialToFullObject(
      action.payload,
      currentTheme,
      false,
      canDeepConvert,
    );
    return newTheme;
  }

  throw Error('Unknown action.');
}

interface ThemeAction {
  type: ThemeActionType;
  payload: PartialTheme;
}

enum ThemeActionType {
  UPDATE_THEME = 'UPDATE_THEME',
}

/**
 * Actions related to theme management.
 */
export const ThemeActions = {
  /**
   * Action to update the theme.
   *
   * @param {PartialTheme} newTheme - The new theme to be applied
   * @return {ThemeAction} The updated theme action
   */
  updateTheme: (newTheme: PartialTheme) => {
    return { type: ThemeActionType.UPDATE_THEME, payload: newTheme } as ThemeAction;
  },
};
