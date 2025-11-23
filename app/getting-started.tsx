import JournimeLogo from '@assets/svgs/shinobi.svg';
import ImageEnhanced from '@components/atoms/ImageEnhanced';
import { useThemedStyleSheet } from '@theme/Theme.context';
import { Theme } from '@theme/Theme.interface';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { styles } = useThemedStyleSheet(createStyles);
  const logoY = useSharedValue(-15);
  const textOpacity = useSharedValue(0.5);
  const bgScale = useSharedValue(1.5);

  useEffect(() => {
    // Background scale animation - starts at 1.5 and animates to 1.0
    bgScale.value = withTiming(1.0, {
      duration: 1500,
      easing: Easing.out(Easing.quad),
    });

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

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleGetStarted}>
      <Animated.View style={[styles.backgroundContainer, bgAnimatedStyle]}>
        <Image
          source={require('../assets/images/splash_screen.png')}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
          }}
        />
      </Animated.View>
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
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Your day turned into manga episodes</Text>
            <LinearGradient
              colors={['#66dbeaff', '#764ba2', 'rgba(231, 49, 251, 1)ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientUnderline}
            />
          </View>
        </View>

        <Animated.Text style={[styles.buttonText, textAnimatedStyle]}>
          Tap to continue
        </Animated.Text>
      </SafeAreaView>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    backgroundContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
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
    subtitleContainer: {
      alignItems: 'center',
      position: 'relative',
      top: 40,
    },
    subtitle: {
      ...theme.typography.title.large,
      color: 'rgba(255, 255, 255, 0.95)',
      textAlign: 'center',
      lineHeight: 24,
      fontWeight: '500',
      opacity: 0.8,
      shadowColor: '#000000',
      shadowRadius: 12,
      shadowOffset: { width: 8, height: 8 },
      marginBottom: 4,
    },
    gradientUnderline: {
      height: 1,
      position: 'absolute',
      bottom: 0,
      opacity: 0.5,
      width: '85%',
      borderRadius: 3,
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
};
