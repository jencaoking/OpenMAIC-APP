import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SessionProvider } from '../core/store/sessionStore';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <View style={styles.container}>{children}</View>
    </SessionProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default RootLayout;