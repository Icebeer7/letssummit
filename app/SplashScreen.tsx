import AnimatedBackground from '@components/compounds/AnimatedBackground';
import { View } from 'react-native';

export default function SplashScreenComponent() {
  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground />
    </View>
  );
}
