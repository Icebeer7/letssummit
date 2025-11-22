import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function AnimatedBackground() {
  const scale1 = useSharedValue(1);
  const opacity1 = useSharedValue(0.4);

  const scale2 = useSharedValue(1.1);
  const opacity2 = useSharedValue(0.3);

  useEffect(() => {
    scale1.value = withRepeat(withTiming(1.1, { duration: 8000 }), -1, true);
    opacity1.value = withRepeat(withTiming(0.6, { duration: 8000 }), -1, true);

    scale2.value = withRepeat(withTiming(1, { duration: 10000 }), -1, true);
    opacity2.value = withRepeat(withTiming(0.5, { duration: 10000 }), -1, true);
  }, [scale1, opacity1, scale2, opacity2]);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#1E1335' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(93,217,210,0.15)',
            borderRadius: 250,
          },
          style1,
        ]}
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 600,
            height: 600,
            backgroundColor: 'rgba(123,168,245,0.12)',
            borderRadius: 300,
            marginLeft: -300,
            marginTop: -300,
          },
          style2,
        ]}
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: '40%',
            left: 50,
            width: 600,
            height: 600,
            backgroundColor: 'rgba(167,139,250,0.1)',
            borderRadius: 300,
          },
        ]}
      />
    </View>
  );
}
