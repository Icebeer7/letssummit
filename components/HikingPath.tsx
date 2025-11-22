import { useThemedStyleSheet } from '@theme/Theme.context';
import { Theme } from '@theme/Theme.interface';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function HikingPath() {
  const { styles } = useThemedStyleSheet(createStyles);

  // Path following the mountain terrain (within 300x400 bounds)
  // Snake-like path with 3 segments: curve up, curve down, curve up
  // Creates smooth S-shaped winding trail
  const pathData =
    'M 15 350 C 15 345, 70 300, 120 305 C 150 315, 200 340, 220 250 C 220 200, 250 185, 265 140';

  // Base camp positions (end of first two segments)
  const baseCamp1 = { x: 120, y: 305 }; // End of segment 1
  const baseCamp2 = { x: 220, y: 250 }; // End of segment 2

  return (
    <View style={styles.container}>
      <Svg width={300} height={400}>
        <Path d={pathData} fill="none" stroke="#fffbfbff" strokeWidth={4} strokeDasharray="10, 5" />
        {/* Base camp 1 */}
        <Circle
          cx={baseCamp1.x}
          cy={baseCamp1.y}
          r={6}
          fill="#fffbfbff"
          stroke="#fffbfbff"
          strokeWidth={2}
        />
        {/* Base camp 2 */}
        <Circle
          cx={baseCamp2.x}
          cy={baseCamp2.y}
          r={6}
          fill="#fffbfbff"
          stroke="#fffbfbff"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 300,
      height: 400,
    },
  });
};
