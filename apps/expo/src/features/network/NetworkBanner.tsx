import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { syncManager, type SyncState } from '../../db/syncManager';

export const NetworkBanner: React.FC = () => {
  const [state, setState] = useState<SyncState>(syncManager.getState());

  useEffect(() => {
    const unsubscribe = syncManager.addListener(setState);
    return unsubscribe;
  }, []);

  const handleRetry = () => {
    syncManager.forceSync();
  };

  if (!state.error && state.isOnline && state.status === 'idle') {
    return null;
  }

  return (
    <View style={[styles.banner, getBannerStyle(state)]}>
      <View style={styles.bannerContent}>
        {state.status === 'syncing' && (
          <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
        )}
        <Text style={styles.bannerText}>{getBannerText(state)}</Text>
      </View>
      {state.error && (
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

function getBannerStyle(state: SyncState) {
  if (state.error) {
    return styles.bannerError;
  }
  if (!state.isOnline) {
    return styles.bannerOffline;
  }
  if (state.status === 'syncing') {
    return styles.bannerSyncing;
  }
  return {};
}

function getBannerText(state: SyncState): string {
  if (state.error) {
    return '同步失败，点击重试';
  }
  if (!state.isOnline) {
    return '当前处于离线模式，数据将在联网后自动同步';
  }
  if (state.status === 'syncing') {
    return '正在同步数据...';
  }
  return '';
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerOffline: {
    backgroundColor: '#f59e0b',
  },
  bannerSyncing: {
    backgroundColor: '#3b82f6',
  },
  bannerError: {
    backgroundColor: '#ef4444',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spinner: {
    marginRight: 8,
  },
  bannerText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
