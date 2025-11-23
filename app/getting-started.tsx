import JournimeLogo from '@assets/svgs/shinobi.svg';
import ImageEnhanced from '@components/atoms/ImageEnhanced';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GettingStartedScreen() {
  const logoY = useSharedValue(-15);
  const textOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Logo floating animation
    logoY.value = withRepeat(withTiming(15, { duration: 2000, easing: Easing.linear }), -1, true);

    // Text blinking animation
    textOpacity.value = withRepeat(
      withTiming(0.2, { duration: 1500, easing: Easing.ease }),
      -1,
      true,
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoY.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleGetStarted}>
      <Image
        source={require('../assets/images/splash_screen.png')}
        style={{
          width: '100%',
          height: '100%',
          zIndex: -1,
          position: 'absolute',
          resizeMode: 'cover',
        }}
      />
      <View style={styles.blurOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Animated.View style={logoAnimatedStyle}>
            <ImageEnhanced
              source={JournimeLogo}
              style={{ width: 140, height: 140 }}
              svgProps={{ stroke: 'white' }}
            />
          </Animated.View>
          <Text style={styles.subtitle}>Your day turned into manga episodes</Text>
        </View>

        <Animated.Text style={[styles.buttonText, textAnimatedStyle]}>
          Tap to continue
        </Animated.Text>
      </SafeAreaView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    position: 'relative',
    top: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    bottom: 60,
    position: 'absolute',
  },
});
