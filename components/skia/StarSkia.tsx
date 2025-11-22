import { BlurMask, Group, Path, PublicGroupProps, SkiaProps } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import {
  interpolate,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Point } from '@state/CommonTypes';
import { VisaCardsSpreadCoordinateSystem } from './VisaCardsSpreadSkia';

export default function StarSkia(props: SkiaProps<PublicGroupProps>) {
  return (
    // { inherentWidth: 14, inherentHeight: 14 }
    <Group {...props}>
      <Path
        path="M5.50065 7.90425L8.07565 9.45841L7.39232 6.52925L9.66732 4.55841L6.67148 4.30425L5.50065 1.54175L4.32982 4.30425L1.33398 4.55841L3.60898 6.52925L2.92565 9.45841L5.50065 7.90425Z"
        color={'#D2D8E4'}
      />
      <Path
        path="M5.00065 7.40425L7.57565 8.95841L6.89232 6.02925L9.16732 4.05841L6.17148 3.80425L5.00065 1.04175L3.82982 3.80425L0.833984 4.05841L3.10898 6.02925L2.42565 8.95841L5.00065 7.40425Z"
        color={'#E8EBF0'}>
        <BlurMask blur={20} />
      </Path>
    </Group>
  );
}

export type ExplodingStarsType = {
  stars: Array<Point>;
  startPoint: Point;
  animateOnEntry?: boolean;
};

export function ExplodingStarsSkia({
  stars: starPositions,
  startPoint,
  animateOnEntry = true,
}: ExplodingStarsType) {
  const starsProgress = useSharedValue(0);
  useEffect(() => {
    starsProgress.value = animateOnEntry ? withTiming(1, { duration: 1000 }) : 1;
  }, [animateOnEntry, starsProgress]);
  return (
    <>
      {starPositions.map((endPoint, index) => {
        return (
          <StarMovingRandomly
            key={index}
            progress={starsProgress}
            startPoint={startPoint}
            endPoint={endPoint}
          />
        );
      })}
    </>
  );
}

export function VisaCardsBackgroundExplodingStarSkia({
  width,
  height,
  animateOnEntry = true,
  ...otherProps
}: Omit<ExplodingStarsType, 'stars' | 'startPoint'> & { width: number; height: number }) {
  return (
    <VisaCardsSpreadCoordinateSystem targetWidth={width} targetHeight={height}>
      {rect => {
        const starsInitialPoint: Point = {
          x: (rect.width + rect.x) / 2 - 5,
          y: (rect.height + rect.y) / 2 - 5,
        };
        const starPositions: Array<Point> = [
          { x: 87, y: 649 },
          { x: 127, y: 626 },
          { x: 324, y: 382 },
          { x: 437, y: 329 },
          { x: 608, y: 197 },
          { x: 616, y: 413 },
          { x: 635, y: 230 },
          { x: 372, y: 295 },
          { x: 121, y: 67 },
          { x: 551, y: 739 },
          { x: 234, y: 89 },
          { x: 247, y: 750 },
          { x: 4, y: 92 },
          { x: 718, y: 296 },
          { x: 637, y: 384 },
          { x: 345, y: 164 },
          { x: 126, y: 207 },
          { x: 497, y: 166 },
        ];
        return (
          <ExplodingStarsSkia
            stars={starPositions}
            startPoint={starsInitialPoint}
            animateOnEntry={animateOnEntry}
            {...otherProps}
          />
        );
      }}
    </VisaCardsSpreadCoordinateSystem>
  );
}

function StarMovingRandomly({
  progress,
  startPoint,
  endPoint,
}: {
  progress: SharedValue<number>;
  startPoint: Point;
  endPoint: Point;
}) {
  const starTransform = useDerivedValue(() => [
    { translateX: interpolate(progress.value, [0, 1], [startPoint.x, endPoint.x]) },
    { translateY: interpolate(progress.value, [0, 1], [startPoint.y, endPoint.y]) },
    { scale: 2 },
    { rotate: interpolate(progress.value, [0, 1], [0, Math.PI]) },
  ]);

  return <StarSkia transform={starTransform} />;
}
