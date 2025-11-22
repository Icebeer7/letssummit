import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import Animated, {
  BaseAnimationBuilder,
  EntryAnimationsValues,
  EntryExitAnimationFunction,
  ReanimatedKeyframe,
  SharedValue,
  SlideInLeft,
  SlideInRight,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

export type EntryOrExitLayoutType =
  | typeof BaseAnimationBuilder
  | BaseAnimationBuilder
  | EntryExitAnimationFunction
  | ReanimatedKeyframe;

const slideInLeftAnimation = new SlideInLeft().build();
const slideInRightAnimation = new SlideInRight().build();

export const useEntrySlidingAnimation = (initialDirection: 'left' | 'right' | 'none') => {
  const entryDirection = useSharedValue(initialDirection);
  const enteringAnimation: EntryExitAnimationFunction = (values: EntryAnimationsValues) => {
    'worklet';

    return entryDirection.value === 'left'
      ? slideInLeftAnimation(values)
      : entryDirection.value === 'right'
        ? slideInRightAnimation(values)
        : {
            initialValues: { opacity: 0 },
            animations: { opacity: withTiming(1, { duration: 10 }) },
          };
  };
  return { entryDirection, enteringAnimation };
};

export function SharedValueToState<T>({
  sharedValue,
  children,
}: {
  sharedValue: SharedValue<T>;
  children: (state: T) => React.JSX.Element;
}) {
  const [state, setState] = useState<T>(sharedValue.value);

  useAnimatedReaction(
    () => sharedValue.value,
    value => {
      runOnJS(setState)(value);
    },
  );
  return children(state);
}

/**
 * Select a point where the animation should snap to given the value of the gesture and it's velocity.
 * @worklet
 */
export const snapPoint = (
  value: number,
  velocity: number,
  points: ReadonlyArray<number>,
): number => {
  'worklet';
  const point = value + 0.2 * velocity;
  const deltas = points.map(p => Math.abs(point - p));
  const minDelta = Math.min.apply(null, deltas);
  return points.filter(p => Math.abs(point - p) === minDelta)[0] ?? 0;
};

/**
 * Clamps a node with a lower and upper bound.
 * @example
    clamp(-1, 0, 100); // 0
    clamp(1, 0, 100); // 1
    clamp(101, 0, 100); // 100
 * @worklet
 */
export const clamp = (value: number, lowerBound: number, upperBound: number) => {
  'worklet';
  return Math.min(Math.max(lowerBound, value), upperBound);
};

export const ReAnimatedFlashList = Animated.createAnimatedComponent(FlashList);
export const ReAnimatedBottomSheetFlatList = Animated.createAnimatedComponent(BottomSheetFlatList);
