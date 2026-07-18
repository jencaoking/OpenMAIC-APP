import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SessionProvider } from '../core/store/sessionStore';
import { syncManager } from '../db/syncManager';
import { NetworkBanner } from '../features/network/NetworkBanner';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        await syncManager.init();
        setIsDbReady(true);
      } catch (error) {
        setDbError(error instanceof Error ? error : new Error('Failed to initialize database'));
      }
    };

    initApp();
  }, []);

  if (!isDbReady) {
    if (dbError) {
      return (
        <View style={styles.errorContainer}>
          <Text>Database initialization failed:</Text>
          <Text>{dbError.message}</Text>
        </View>
      );
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SessionProvider>
      <NetworkBanner />
      <View style={styles.container}>{children}</View>
    </SessionProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
});

export default RootLayout;
