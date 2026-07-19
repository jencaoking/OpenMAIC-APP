/**
 * @file VoiceModeScreen.tsx
 * @description 沉浸式全屏语音模式。
 *
 * UI 结构：
 *   - 顶部：当前状态文案 + AI 实时回复文本（流式）
 *   - 中部：WaveformAnimation（跟随 micLevel 与 state 变色变形）
 *   - 底部：实时转录文本 + 静音/扬声器切换 + 挂断按钮
 *
 * 状态绑定：通过 `useSyncExternalStore` 订阅 VoiceEngine 快照，
 * 保证 React 18 并发渲染安全。
 */
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { WaveformAnimation } from './components/WaveformAnimation';
import { VoiceEngine } from '../../core/voice';
import type { VoiceEngineSnapshot, VoiceEngineConfig } from '../../types';

export interface VoiceModeScreenProps {
  visible: boolean;
  onClose: () => void;
  /** 语音引擎配置，由父组件注入。 */
  voiceConfig: VoiceEngineConfig;
}

const STATE_LABELS: Record<VoiceEngineSnapshot['state'], string> = {
  idle: '准备中…',
  listening: '聆听中…',
  thinking: '思考中…',
  speaking: '回答中…',
  'barge-in': '已打断，重新聆听…',
  error: '出错了，请重试',
};

/**
 * 沉浸式语音模式 Modal。
 */
export const VoiceModeScreen: React.FC<VoiceModeScreenProps> = ({
  visible,
  onClose,
  voiceConfig,
}) => {
  const [engine, setEngine] = useState<VoiceEngine | null>(null);
  const [muted, setMuted] = useState(false);

  // 创建引擎实例（仅在 modal 打开时）
  useEffect(() => {
    if (!visible) return;
    const instance = new VoiceEngine(voiceConfig);
    setEngine(instance);
    void instance.start();

    return () => {
      void instance.dispose();
      setEngine(null);
    };
  }, [visible, voiceConfig]);

  if (!engine) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <VoiceModeContent
        engine={engine}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        onClose={onClose}
      />
    </Modal>
  );
};

/**
 * 内部内容组件，订阅 engine 快照。
 */
const VoiceModeContent: React.FC<{
  engine: VoiceEngine;
  muted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}> = ({ engine, muted, onToggleMute, onClose }) => {
  const snapshot = useSyncExternalStore(
    (cb) => engine.subscribe(cb),
    () => engine.getSnapshot(),
  );

  const handleClose = async () => {
    await engine.stop();
    onClose();
  };

  const handleToggleSpeaker = () => {
    void engine.switchRoute(muted ? 'earpiece' : 'speaker');
    onToggleMute();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stateLabel}>{STATE_LABELS[snapshot.state]}</Text>
        {snapshot.error && <Text style={styles.errorText}>{snapshot.error}</Text>}
      </View>

      <View style={styles.waveformWrap}>
        <WaveformAnimation level={snapshot.micLevel} state={snapshot.state} size={280} />
      </View>

      <View style={styles.transcriptWrap}>
        <ScrollView
          style={styles.transcriptScroll}
          contentContainerStyle={styles.transcriptContent}
        >
          {snapshot.interimTranscript ? (
            <Text style={styles.interimText}>{snapshot.interimTranscript}…</Text>
          ) : null}
          {snapshot.finalTranscript ? (
            <Text style={styles.userText}>我：{snapshot.finalTranscript}</Text>
          ) : null}
          {snapshot.aiReplyText ? (
            <Text style={styles.aiText}>AI：{snapshot.aiReplyText}</Text>
          ) : null}
        </ScrollView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, muted && styles.controlBtnActive]}
          onPress={handleToggleSpeaker}
          accessibilityLabel={muted ? '切换至听筒' : '切换至扬声器'}
        >
          <Text style={styles.controlIcon}>{muted ? '📞' : '🔊'}</Text>
          <Text style={styles.controlLabel}>{muted ? '听筒' : '扬声器'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={handleClose}
          accessibilityLabel="结束语音对话"
        >
          <Text style={styles.endCallIcon}>✕</Text>
          <Text style={styles.endCallLabel}>结束</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 16 : 32,
    paddingBottom: 8,
    alignItems: 'center',
  },
  stateLabel: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    color: '#fca5a5',
    marginTop: 4,
  },
  waveformWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcriptWrap: {
    maxHeight: 220,
    paddingHorizontal: 24,
  },
  transcriptScroll: {
    flex: 1,
  },
  transcriptContent: {
    paddingVertical: 12,
    gap: 8,
  },
  interimText: {
    fontSize: 15,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  userText: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  aiText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  controlBtn: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    minWidth: 80,
  },
  controlBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  controlIcon: {
    fontSize: 28,
  },
  controlLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  endCallBtn: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
  },
  endCallIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  endCallLabel: {
    fontSize: 11,
    color: '#fecaca',
    marginTop: 2,
  },
});
