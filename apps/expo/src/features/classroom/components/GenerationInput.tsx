import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useGenerationStore } from '../store/generationStore';

interface GenerationInputProps {
  onGenerate: (requirement: string) => void;
  isGenerating?: boolean;
}

/**
 * 课堂生成输入界面。
 * 用户输入课程需求，点击生成按钮开始创建课堂。
 */
export function GenerationInput({ onGenerate, isGenerating = false }: GenerationInputProps) {
  const { requirement, setRequirement } = useGenerationStore();
  const [isFocused, setIsFocused] = useState(false);

  const handleGenerate = () => {
    if (requirement.trim() && !isGenerating) {
      onGenerate(requirement.trim());
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.logo}>OpenMAIC</Text>
      <Text style={styles.slogan}>描述你想生成的课堂内容</Text>

      {/* Input Card */}
      <View style={[styles.card, isFocused && styles.cardFocused]}>
        <TextInput
          style={styles.textarea}
          placeholder="例如：高中物理 — 量子力学基础，包含波粒二象性和不确定性原理..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
          value={requirement}
          onChangeText={setRequirement}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!isGenerating}
        />

        <View style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <Pressable style={styles.toolBtn} disabled={isGenerating}>
              <Text style={styles.toolIcon}>📎</Text>
            </Pressable>
            <Pressable style={styles.toolBtn} disabled={isGenerating}>
              <Text style={styles.toolIcon}>🎤</Text>
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.generateBtn,
              (!requirement.trim() || isGenerating) && styles.generateBtnDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!requirement.trim() || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.generateBtnText}>生成课堂 ↑</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#722ed1',
    marginBottom: 4,
  },
  slogan: {
    fontSize: 13,
    color: '#737373',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  cardFocused: {
    borderColor: '#c084fc',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  textarea: {
    minHeight: 100,
    fontSize: 14,
    lineHeight: 22,
    color: '#242424',
    padding: 0,
    textAlignVertical: 'top',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  toolbarLeft: {
    flexDirection: 'row',
    gap: 4,
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIcon: {
    fontSize: 16,
  },
  generateBtn: {
    paddingHorizontal: 20,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  generateBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  },
  generateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
