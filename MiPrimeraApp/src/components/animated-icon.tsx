import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const DURATION = 600;

export function AnimatedSplashOverlay() {
  const opacity = useRef(new Animated.Value(1)).current;
  const visible = useRef(true);
  const forceUpdate = useRef<(() => void) | null>(null);

  useEffect(() => {
    SplashScreen.hideAsync().then(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: DURATION,
        useNativeDriver: true,
      }).start(() => {
        visible.current = false;
        forceUpdate.current?.();
      });
    });
  }, []);

  if (!visible.current) return null;

  return (
    <Animated.View style={[styles.splashOverlay, { opacity }]}>
      <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
    </Animated.View>
  );
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.background} />
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    backgroundColor: '#0274DF',
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
