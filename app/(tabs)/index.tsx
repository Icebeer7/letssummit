import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import Hiker from '@assets/svgs/hiker.svg';
import MountainImg from '@assets/svgs/mountain.svg';
import Shuriken from '@assets/svgs/shuriken.svg';
import ImageEnhanced from '@components/atoms/ImageEnhanced';
import HikingPath from '@components/HikingPath';
import { Text } from '@components/Themed';

const AnimatedImageEnhanced = Animated.createAnimatedComponent(ImageEnhanced);

// Cubic bezier curve calculation (4 points)
// B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
const cubicBezier = (
  t: number,
  P0: { x: number; y: number },
  P1: { x: number; y: number },
  P2: { x: number; y: number },
  P3: { x: number; y: number },
) => {
  const x =
    Math.pow(1 - t, 3) * P0.x +
    3 * Math.pow(1 - t, 2) * t * P1.x +
    3 * (1 - t) * Math.pow(t, 2) * P2.x +
    Math.pow(t, 3) * P3.x;

  const y =
    Math.pow(1 - t, 3) * P0.y +
    3 * Math.pow(1 - t, 2) * t * P1.y +
    3 * (1 - t) * Math.pow(t, 2) * P2.y +
    Math.pow(t, 3) * P3.y;

  return { x, y };
};

// Get point along the hiking path (3 segments)
// Path: 'M 15 365 C 15 365, 70 300, 120 305 C 150 315, 200 340, 220 250 C 220 200, 250 185, 265 140'
const getPointOnCurve = (t: number) => {
  // Segment 1: M 15 365 C 15 365, 70 300, 120 305
  const segment1 = {
    P0: { x: 15, y: 345 },
    P1: { x: 15, y: 345 },
    P2: { x: 70, y: 300 },
    P3: { x: 120, y: 305 },
  };

  // Segment 2: C 150 315, 200 340, 220 250
  const segment2 = {
    P0: { x: 120, y: 305 },
    P1: { x: 150, y: 315 },
    P2: { x: 200, y: 340 },
    P3: { x: 220, y: 250 },
  };

  // Segment 3: C 220 200, 250 185, 265 140
  const segment3 = {
    P0: { x: 220, y: 250 },
    P1: { x: 220, y: 200 },
    P2: { x: 250, y: 185 },
    P3: { x: 265, y: 140 },
  };

  // Divide t across the 3 segments (0-0.33, 0.33-0.66, 0.66-1)
  if (t <= 0.333) {
    const localT = t / 0.333;
    return cubicBezier(localT, segment1.P0, segment1.P1, segment1.P2, segment1.P3);
  } else if (t <= 0.666) {
    const localT = (t - 0.333) / 0.333;
    return cubicBezier(localT, segment2.P0, segment2.P1, segment2.P2, segment2.P3);
  } else {
    const localT = (t - 0.666) / 0.334;
    return cubicBezier(localT, segment3.P0, segment3.P1, segment3.P2, segment3.P3);
  }
};

export default function TabOneScreen() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const hikerX = useRef(new Animated.Value(0)).current;
  const hikerY = useRef(new Animated.Value(345)).current;
  const hikerRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value }) => {
      const point = getPointOnCurve(value);
      hikerX.setValue(point.x - 15); // Offset by half the hiker width (30/2)
      hikerY.setValue(point.y - 20); // Offset Y to position hiker slightly above the path

      const rotation = value * 720;
      hikerRotation.setValue(rotation);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Text style={styles.title}>Mount Fuji</Text>
        <AnimatedImageEnhanced
          source={Shuriken}
          style={[
            styles.hikerContainer,
            {
              transform: [
                {
                  rotate: hikerRotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
      <View style={styles.mountainContainer}>
        <ImageEnhanced
          source={MountainImg}
          style={{ width: 300, height: 400, position: 'absolute' }}
        />
        <HikingPath />
        <AnimatedImageEnhanced
          source={Hiker}
          style={[
            styles.hikerContainer,
            {
              left: hikerX,
              top: hikerY,
              transform: [
                {
                  rotate: hikerRotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  mountainContainer: {
    position: 'relative',
    width: 300,
    height: 400,
    backgroundColor: 'transparent',
  },
  hikerContainer: {
    // position: 'absolute',
    width: 30,
    height: 30,
  },
});
