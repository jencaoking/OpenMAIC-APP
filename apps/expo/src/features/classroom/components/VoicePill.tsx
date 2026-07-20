import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAgentRegistry } from '../store/agentRegistry';
import { getEnabledProviders, resolveAgentVoice } from '../api/voiceResolver';
import type { AgentVoiceOverride } from '../types/voice';

interface VoicePillProps {
  agentId: string;
  agentIndex: number;
  isTeacher?: boolean;
}

/**
 * 声音选择 Pill。
 * 显示当前选择的声音，点击可切换。
 */
export function VoicePill({ agentId, agentIndex, isTeacher = false }: VoicePillProps) {
  const { agents, selectedAgentIds } = useAgentRegistry();
  const agent = agents[agentId];
  const [showOptions, setShowOptions] = useState(false);

  if (!agent) return null;

  const enabledProviders = getEnabledProviders();
  const resolved = resolveAgentVoice(agent, agentIndex, enabledProviders);

  const voiceName = resolved
    ? enabledProviders
        .find((p) => p.id === resolved.providerId)
        ?.voices.find((v) => v.voiceId === resolved.voiceId)?.voiceName || resolved.voiceId
    : '未配置';

  return (
    <View style={styles.container}>
      <Pressable style={styles.pill} onPress={() => setShowOptions(!showOptions)}>
        <Text style={styles.icon}>🔊</Text>
        <Text style={styles.voiceName} numberOfLines={1}>
          {voiceName}
        </Text>
      </Pressable>

      {/* 声音选项列表 */}
      {showOptions && (
        <View style={styles.options}>
          {enabledProviders.map((provider) => (
            <View key={provider.id}>
              <View style={styles.providerHeader}>
                <Text style={styles.providerName}>{provider.name}</Text>
              </View>
              {provider.voices.slice(0, 5).map((voice) => {
                const isActive = resolved?.voiceId === voice.voiceId;
                return (
                  <Pressable
                    key={voice.voiceId}
                    style={[styles.optionItem, isActive && styles.optionActive]}
                    onPress={() => {
                      // TODO: 保存声音选择
                      setShowOptions(false);
                    }}
                  >
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {voice.voiceName}
                    </Text>
                    {voice.voiceLanguage && (
                      <Text style={styles.optionLang}>{voice.voiceLanguage}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

          {enabledProviders.length === 0 && (
            <View style={styles.emptyOptions}>
              <Text style={styles.emptyText}>未配置 TTS 提供商</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  icon: {
    fontSize: 10,
  },
  voiceName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#7c3aed',
    maxWidth: 80,
  },
  options: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: 220,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 4,
    maxHeight: 300,
    overflow: 'hidden',
  },
  providerHeader: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  providerName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionActive: {
    backgroundColor: '#f5f3ff',
  },
  optionText: {
    fontSize: 11,
    color: '#374151',
  },
  optionTextActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  optionLang: {
    fontSize: 9,
    color: '#9ca3af',
  },
  emptyOptions: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
