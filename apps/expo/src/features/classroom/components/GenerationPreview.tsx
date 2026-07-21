import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useGenerationStore } from '../store/generationStore';
import { generateSceneOutlines, type SceneOutline } from '../api/generationApi';

interface GenerationPreviewProps {
  requirement: string;
  onComplete: (outlines: SceneOutline[], courseTitle: string) => void;
  onBack: () => void;
}

/**
 * 课堂生成预览界面。
 * 显示大纲流式生成进度和结果。
 */
export function GenerationPreview({ requirement, onComplete, onBack }: GenerationPreviewProps) {
  const { outlines, courseTitle, step, setStep, addOutline, setCourseTitle, setLanguageDirective } =
    useGenerationStore();

  const [localOutlines, setLocalOutlines] = useState<SceneOutline[]>([]);

  useEffect(() => {
    startGeneration();
  }, []);

  const startGeneration = async () => {
    setStep('outline');

    await generateSceneOutlines(
      { requirement },
      // onOutline
      (outline) => {
        setLocalOutlines((prev) => [...prev, outline]);
        addOutline(outline);
      },
      // onDone
      (result) => {
        setCourseTitle(result.courseTitle);
        setLanguageDirective(result.languageDirective);
        setStep('review');
      },
      // onError
      (error) => {
        console.error('Generation error:', error);
      },
    );
  };

  const handleConfirm = () => {
    onComplete(localOutlines, courseTitle);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {step === 'outline' ? '正在生成大纲...' : '大纲预览'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Course Title */}
      {courseTitle ? (
        <View style={styles.titleCard}>
          <Text style={styles.courseTitle}>{courseTitle}</Text>
        </View>
      ) : null}

      {/* Outline List */}
      <ScrollView style={styles.outlineList} contentContainerStyle={styles.outlineContent}>
        {localOutlines.map((outline, index) => (
          <View key={outline.id} style={styles.outlineItem}>
            <View style={styles.outlineHeader}>
              <View style={styles.outlineNum}>
                <Text style={styles.outlineNumText}>{index + 1}</Text>
              </View>
              <View style={styles.outlineType}>
                <Text style={styles.outlineTypeText}>{getTypeLabel(outline.type)}</Text>
              </View>
            </View>
            <Text style={styles.outlineTitle}>{outline.title}</Text>
            <Text style={styles.outlineDesc} numberOfLines={2}>
              {outline.description}
            </Text>
          </View>
        ))}

        {step === 'outline' && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#7c3aed" />
            <Text style={styles.loadingText}>正在生成更多大纲...</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {step === 'review' && (
        <View style={styles.actions}>
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>确认并生成 ({localOutlines.length} 个场景)</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'slide':
      return '幻灯片';
    case 'quiz':
      return '测验';
    case 'interactive':
      return '互动';
    case 'pbl':
      return 'PBL';
    default:
      return type;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#242424',
  },
  titleCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#242424',
    textAlign: 'center',
  },
  outlineList: {
    flex: 1,
  },
  outlineContent: {
    padding: 16,
    gap: 8,
  },
  outlineItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  outlineNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  outlineType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#f3e8ff',
  },
  outlineTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  outlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#242424',
    marginBottom: 4,
  },
  outlineDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  loadingText: {
    fontSize: 13,
    color: '#7c3aed',
  },
  actions: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  confirmBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
