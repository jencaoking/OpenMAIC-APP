import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LandscapeContainerProps {
  children: React.ReactNode;
}

export function LandscapeContainer({ children }: LandscapeContainerProps) {
  useEffect(() => {
    // Lock to landscape on mount
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    ).catch(() => {});

    // Hide status bar in landscape
    StatusBar.setHidden(true, 'fade');

    return () => {
      // Restore portrait on unmount
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      ).catch(() => {});
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
});
