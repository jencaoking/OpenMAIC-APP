import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import type { RuntimeSession } from '@openmaic/storage-types';
import { useSessionStore } from '../../core/store/sessionStore';

interface SessionListScreenProps {
  onAddSession: () => void;
  onShowDsl: () => void;
  onShowStressTest: () => void;
  onStartChat: (sessionId: string) => void;
  onStartQuiz: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusColor(status: RuntimeSession['status']): string {
  switch (status) {
    case 'active':
      return '#22c55e';
    case 'completed':
      return '#3b82f6';
    case 'archived':
      return '#9ca3af';
    default:
      return '#6b7280';
  }
}

function getStatusText(status: RuntimeSession['status']): string {
  switch (status) {
    case 'active':
      return '进行中';
    case 'completed':
      return '已完成';
    case 'archived':
      return '已归档';
    default:
      return status;
  }
}

interface SessionItemProps {
  session: RuntimeSession;
  onPress: () => void;
}

function SessionItem({ session, onPress }: SessionItemProps) {
  return (
    <Pressable style={styles.itemContainer} onPress={onPress}>
      <View style={styles.itemHeader}>
        <Text style={styles.idText}>{session.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
          <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
        </View>
      </View>
      <View style={styles.itemMeta}>
        <Text style={styles.metaText}>类型: {session.kind}</Text>
        <Text style={styles.metaText}>阶段: {session.stageId}</Text>
      </View>
      <Text style={styles.dateText}>创建时间: {formatDate(session.createdAt)}</Text>
      {session.updatedAt !== session.createdAt && (
        <Text style={styles.dateText}>更新时间: {formatDate(session.updatedAt)}</Text>
      )}
      <Text style={styles.chatButtonText}>点击进入聊天 →</Text>
    </Pressable>
  );
}

const SessionListScreen: React.FC<SessionListScreenProps> = ({
  onAddSession,
  onShowDsl,
  onShowStressTest,
  onStartChat,
  onStartQuiz,
}) => {
  const { state, fetchSessions } = useSessionStore();
  const { sessions, status, error } = state;

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRefresh = async () => {
    await fetchSessions();
  };

  const renderItem = ({ item }: { item: RuntimeSession }) => (
    <SessionItem session={item} onPress={() => onStartChat(item.id)} />
  );

  if (status === 'error') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={() => fetchSessions()}>
          点击重试
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>会话列表</Text>
        <View style={styles.headerButtons}>
          <Pressable style={styles.dslButton} onPress={onShowDsl}>
            <Text style={styles.dslButtonText}>DSL</Text>
          </Pressable>
          <Pressable style={styles.quizButton} onPress={onStartQuiz}>
            <Text style={styles.quizButtonText}>答题</Text>
          </Pressable>
          <Pressable style={styles.stressButton} onPress={onShowStressTest}>
            <Text style={styles.stressButtonText}>压力测试</Text>
          </Pressable>
          <Pressable style={styles.addButton} onPress={onAddSession}>
            <Text style={styles.addButtonText}>+ 新建</Text>
          </Pressable>
        </View>
      </View>
      {status === 'loading' && sessions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={status === 'loading'}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无会话</Text>
              <Pressable style={styles.emptyActionButton} onPress={onAddSession}>
                <Text style={styles.emptyActionButtonText}>创建第一个会话</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dslButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  dslButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  quizButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
  },
  quizButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  stressButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  stressButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d97706',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  itemContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyActionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  emptyActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginTop: 8,
    textAlign: 'right',
  },
});

export default SessionListScreen;
