import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import type { RuntimeSessionCreate, RuntimeSessionStatus } from '@openmaic/storage-types';
import { useSessionStore } from '../../core/store/sessionStore';

const statusOptions: { value: RuntimeSessionStatus; label: string }[] = [
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'archived', label: '已归档' },
];

interface CreateSessionScreenProps {
  onBack: () => void;
}

const CreateSessionScreen: React.FC<CreateSessionScreenProps> = ({ onBack }) => {
  const { createSession, state, resetCreateStatus } = useSessionStore();
  const { createStatus, createError } = state;

  const [formData, setFormData] = useState<RuntimeSessionCreate>({
    kind: '',
    stageId: '',
    learnerKey: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RuntimeSessionCreate, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  useEffect(() => {
    if (createStatus === 'success') {
      Alert.alert('成功', '会话创建成功！', [
        {
          text: '确定',
          onPress: () => {
            resetCreateStatus();
            onBack();
          },
        },
      ]);
    }

    if (createStatus === 'error' && createError) {
      Alert.alert('错误', createError);
      resetCreateStatus();
    }
  }, [createStatus, createError, resetCreateStatus, onBack]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof RuntimeSessionCreate, string>> = {};

    if (!formData.kind.trim()) {
      newErrors.kind = '类型不能为空';
    }

    if (!formData.stageId.trim()) {
      newErrors.stageId = '阶段ID不能为空';
    }

    if (!formData.learnerKey.trim()) {
      newErrors.learnerKey = '学习者标识不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitCount((prev) => prev + 1);

    try {
      await createSession(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, createSession, formData, isSubmitting]);

  const handleInputChange = useCallback(
    <K extends keyof RuntimeSessionCreate>(key: K, value: RuntimeSessionCreate[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [errors],
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← 返回</Text>
          </Pressable>
          <Text style={styles.headerTitle}>创建新会话</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>会话信息</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>类型 (kind)</Text>
            <TextInput
              style={[styles.input, errors.kind && styles.inputError]}
              placeholder="输入会话类型，如：chat, quiz, lecture"
              value={formData.kind}
              onChangeText={(text) => handleInputChange('kind', text)}
              placeholderTextColor="#9ca3af"
            />
            {errors.kind && <Text style={styles.errorText}>{errors.kind}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>阶段 ID (stageId)</Text>
            <TextInput
              style={[styles.input, errors.stageId && styles.inputError]}
              placeholder="输入阶段标识"
              value={formData.stageId}
              onChangeText={(text) => handleInputChange('stageId', text)}
              placeholderTextColor="#9ca3af"
            />
            {errors.stageId && <Text style={styles.errorText}>{errors.stageId}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>学习者标识 (learnerKey)</Text>
            <TextInput
              style={[styles.input, errors.learnerKey && styles.inputError]}
              placeholder="输入学习者唯一标识"
              value={formData.learnerKey}
              onChangeText={(text) => handleInputChange('learnerKey', text)}
              placeholderTextColor="#9ca3af"
            />
            {errors.learnerKey && <Text style={styles.errorText}>{errors.learnerKey}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>状态 (status)</Text>
            <View style={styles.statusContainer}>
              {statusOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.statusButton,
                    formData.status === option.value && styles.statusButtonActive,
                  ]}
                  onPress={() => handleInputChange('status', option.value)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      formData.status === option.value && styles.statusButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>创建会话</Text>
            )}
          </Pressable>

          {submitCount > 0 && !isSubmitting && (
            <Text style={styles.debugText}>提交次数: {submitCount}</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flex: 1,
    paddingBottom: 32,
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
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 80,
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  statusButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 24,
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  debugText: {
    marginTop: 16,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default CreateSessionScreen;
