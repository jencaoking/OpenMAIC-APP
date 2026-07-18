import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated as RNAnimated,
  type GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

export interface Question {
  id: string;
  type: 'radio' | 'checkbox' | 'text';
  question: string;
  options?: { id: string; text: string }[];
  correctAnswer: string | string[];
  explanation?: string;
}

interface QuizScreenProps {
  quizId: string;
}

const sampleQuestions: Question[] = [
  {
    id: '1',
    type: 'radio',
    question: '以下哪个是 JavaScript 的基本数据类型？',
    options: [
      { id: 'A', text: 'Array' },
      { id: 'B', text: 'Object' },
      { id: 'C', text: 'String' },
      { id: 'D', text: 'Function' },
    ],
    correctAnswer: 'C',
    explanation: 'String 是 JavaScript 的基本数据类型之一。Array、Object 和 Function 都是引用类型。',
  },
  {
    id: '2',
    type: 'checkbox',
    question: '以下哪些是 React Hooks？（多选）',
    options: [
      { id: 'A', text: 'useState' },
      { id: 'B', text: 'useEffect' },
      { id: 'C', text: 'componentDidMount' },
      { id: 'D', text: 'useContext' },
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: 'useState、useEffect 和 useContext 都是 React Hooks。componentDidMount 是类组件的生命周期方法。',
  },
  {
    id: '3',
    type: 'radio',
    question: 'CSS Flexbox 中，哪个属性用于设置主轴方向？',
    options: [
      { id: 'A', text: 'align-items' },
      { id: 'B', text: 'justify-content' },
      { id: 'C', text: 'flex-direction' },
      { id: 'D', text: 'flex-wrap' },
    ],
    correctAnswer: 'C',
    explanation: 'flex-direction 属性定义了 flex 容器的主轴方向，决定了 flex 子项的排列方向。',
  },
  {
    id: '4',
    type: 'text',
    question: 'HTML 中用于创建超链接的标签是？',
    correctAnswer: '<a>',
    explanation: '<a> 标签用于定义超链接，通过 href 属性指定链接目标。',
  },
];

export const QuizScreen: React.FC<QuizScreenProps> = ({ quizId }) => {
  const [questions] = useState<Question[]>(sampleQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState<Record<string, boolean>>({});

  const translateX = useRef(new RNAnimated.Value(0)).current;
  const scale = useRef(new RNAnimated.Value(1)).current;
  const opacity = useRef(new RNAnimated.Value(1)).current;

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    RNAnimated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    RNAnimated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    RNAnimated.spring(opacity, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  const handlePanResponderMove = (e: React.NativeSyntheticEvent, gestureState: RNAnimated.GestureState) => {
    translateX.setValue(gestureState.dx);
    opacity.setValue(1 - Math.abs(gestureState.dx) / 400);
  };

  const handlePanResponderRelease = (e: React.NativeSyntheticEvent, gestureState: RNAnimated.GestureState) => {
    if (gestureState.dx > 100 && currentIndex > 0) {
      RNAnimated.timing(translateX, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => prev - 1);
      });
      RNAnimated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (gestureState.dx < -100 && currentIndex < questions.length - 1) {
      RNAnimated.timing(translateX, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => prev + 1);
      });
      RNAnimated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      RNAnimated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      RNAnimated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const panResponder = RNAnimated.createPanResponder({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: handlePanResponderMove,
    onPanResponderRelease: handlePanResponderRelease,
  });

  const animatedStyle = {
    transform: [
      { translateX },
      { scale },
    ],
    opacity,
  };

  const handleOptionPress = async (optionId: string) => {
    if (submittedAnswers.has(currentQuestion.id)) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentQuestion.type === 'checkbox') {
      const currentAnswer = (answers[currentQuestion.id] as string[]) || [];
      const newAnswer = currentAnswer.includes(optionId)
        ? currentAnswer.filter((id) => id !== optionId)
        : [...currentAnswer, optionId];
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: newAnswer }));
    } else {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    }
  };

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || submittedAnswers.has(currentQuestion.id)) return;

    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userAnswer = answers[currentQuestion.id];
    let isCorrect = false;

    if (currentQuestion.type === 'checkbox') {
      const correctAnswers = Array.isArray(currentQuestion.correctAnswer)
        ? currentQuestion.correctAnswer
        : [currentQuestion.correctAnswer];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      isCorrect =
        correctAnswers.length === userAnswers.length &&
        correctAnswers.every((answer) => userAnswers.includes(answer));
    } else {
      isCorrect = userAnswer === currentQuestion.correctAnswer;
    }

    setShowResult((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
    setSubmittedAnswers((prev) => new Set([...prev, currentQuestion.id]));

    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      RNAnimated.sequence([
        RNAnimated.timing(scale, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const shakeAnimations = [];
      for (let i = 0; i < 3; i++) {
        shakeAnimations.push(
          RNAnimated.timing(translateX, { toValue: -10, duration: 50, useNativeDriver: true }),
          RNAnimated.timing(translateX, { toValue: 10, duration: 50, useNativeDriver: true }),
          RNAnimated.timing(translateX, { toValue: 0, duration: 50, useNativeDriver: true })
        );
      }
      RNAnimated.sequence(shakeAnimations).start();
    }

    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const getOptionStyle = (optionId: string) => {
    const baseStyle = [styles.option];
    const isSelected =
      currentQuestion.type === 'checkbox'
        ? (answers[currentQuestion.id] as string[])?.includes(optionId)
        : answers[currentQuestion.id] === optionId;

    if (isSelected) {
      baseStyle.push(styles.optionSelected);
    }

    if (submittedAnswers.has(currentQuestion.id)) {
      const isCorrect =
        currentQuestion.type === 'checkbox'
          ? (currentQuestion.correctAnswer as string[]).includes(optionId)
          : currentQuestion.correctAnswer === optionId;

      if (isCorrect) {
        baseStyle.push(styles.optionCorrect);
      } else if (isSelected) {
        baseStyle.push(styles.optionWrong);
      }
    }

    return baseStyle;
  };

  const answeredCount = submittedAnswers.size;
  const correctCount = Object.entries(showResult).filter(([, value]) => value).length;

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{answeredCount}</Text>
          <Text style={styles.statLabel}>已答</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, correctCount === answeredCount && styles.statValueCorrect]}>
            {correctCount}
          </Text>
          <Text style={styles.statLabel}>正确</Text>
        </View>
      </View>

      <RNAnimated.View style={[styles.cardContainer, animatedStyle]} {...panResponder.panHandlers}>
          <View style={styles.card}>
            <View style={styles.questionType}>
              <Text style={styles.questionTypeText}>
                {currentQuestion.type === 'radio' ? '单选题' : currentQuestion.type === 'checkbox' ? '多选题' : '填空题'}
              </Text>
            </View>

            <ScrollView style={styles.questionScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              {currentQuestion.type === 'text' ? (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={(answers[currentQuestion.id] as string) || ''}
                    onChangeText={handleTextChange}
                    placeholder="输入答案..."
                    placeholderTextColor="#9ca3af"
                    editable={!submittedAnswers.has(currentQuestion.id)}
                  />
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  {currentQuestion.options?.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={getOptionStyle(option.id)}
                      onPress={() => handleOptionPress(option.id)}
                      disabled={submittedAnswers.has(currentQuestion.id)}
                      accessibilityRole={currentQuestion.type === 'checkbox' ? 'checkbox' : 'radio'}
                      accessibilityState={{
                        selected:
                          currentQuestion.type === 'checkbox'
                            ? (answers[currentQuestion.id] as string[])?.includes(option.id)
                            : answers[currentQuestion.id] === option.id,
                      }}
                    >
                      <View style={[styles.optionIndicator, currentQuestion.type === 'checkbox' ? styles.optionIndicatorCheckbox : styles.optionIndicatorRadio]}>
                        {currentQuestion.type === 'checkbox' ? (
                          <Text style={styles.optionCheckmark}>
                            {(answers[currentQuestion.id] as string[])?.includes(option.id) ? '✓' : ''}
                          </Text>
                        ) : (
                          <Text style={styles.optionLetter}>{option.id}</Text>
                        )}
                      </View>
                      <Text style={styles.optionText}>{option.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {submittedAnswers.has(currentQuestion.id) && currentQuestion.explanation && (
                <View style={styles.explanationContainer}>
                  <Text style={styles.explanationTitle}>解析</Text>
                  <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </RNAnimated.View>

      <View style={styles.horizontalIndicator}>
        <Text style={styles.indicatorHint}>← 左滑上一题</Text>
        <Text style={styles.indicatorHint}>右滑下一题 →</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
          accessibilityLabel="上一题"
        >
          <Text style={styles.navButtonText}>上一题</Text>
        </TouchableOpacity>

        {submittedAnswers.has(currentQuestion.id) ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleNext}
            disabled={currentIndex === questions.length - 1}
            accessibilityLabel="下一题"
          >
            <Text style={styles.submitButtonText}>
              {currentIndex === questions.length - 1 ? '完成' : '下一题'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !answers[currentQuestion.id] && styles.submitButtonDisabled,
              isSubmitting && styles.submitButtonLoading,
            ]}
            onPress={handleSubmit}
            disabled={!answers[currentQuestion.id] || isSubmitting}
            accessibilityLabel="提交答案"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>提交答案</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statValueCorrect: {
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  questionType: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  questionTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  questionScroll: {
    flex: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    transitionProperty: 'backgroundColor, borderColor',
    transitionDuration: '200ms',
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionCorrect: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  optionWrong: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  optionIndicatorRadio: {
    borderRadius: 16,
  },
  optionIndicatorCheckbox: {
    borderRadius: 8,
  },
  optionCheckmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  textInputContainer: {
    marginTop: 8,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  horizontalIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  indicatorHint: {
    fontSize: 12,
    color: '#9ca3af',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonLoading: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
