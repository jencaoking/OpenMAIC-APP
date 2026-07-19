/**
 * Phases of a quiz attempt.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type QuizAttemptPhase = 'draft' | 'submitted' | 'reviewed';

/**
 * Minimal payload skeleton for quizAttempt records.
 * Answers are keyed by question id; grading detail is app-owned.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface QuizAttemptSkeleton {
  phase: QuizAttemptPhase;
  answers: Record<string, unknown>;
}
