import {
  checkNetwork,
  addNetworkListener,
  startNetworkMonitoring,
  getNetworkStatus,
} from './netInfo';
import {
  initDatabase,
  getCourses as dbGetCourses,
  getSessions as dbGetSessions,
  getMessages as dbGetMessages,
  getQuizResults as dbGetQuizResults,
  insertCourse,
  insertSession,
  insertMessage,
  insertQuizResult,
  getRecordsWithStatus,
  updateRecordStatus,
  getMaxVersion,
  upsertCourse,
  upsertSession,
  upsertMessage,
} from './index';

export interface SyncState {
  isOnline: boolean;
  status: 'idle' | 'syncing' | 'error';
  lastSyncTime: number | null;
  error: string | null;
}

interface SyncChanges {
  courses: {
    id: string;
    title: string;
    description: string;
    updated_at: string;
    _version: number;
    _status: string;
  }[];
  sessions: {
    id: string;
    course_id: string | null;
    stage_id: string;
    learner_key: string;
    kind: string;
    status: string;
    last_message_at: string | null;
    updated_at: string;
    _version: number;
    _status: string;
  }[];
  messages: {
    id: string;
    session_id: string;
    role: string;
    content: string;
    created_at: string;
    _version: number;
    _status: string;
  }[];
  quiz_results: {
    id: string;
    quiz_id: string;
    answers: string;
    score: number | null;
    submitted_at: string;
    _version: number;
    _status: string;
  }[];
}

interface SyncAck {
  success: boolean;
  new_version: number;
}

class SyncManager {
  private state: SyncState = {
    isOnline: true,
    status: 'idle',
    lastSyncTime: null,
    error: null,
  };

  private listeners: Set<(state: SyncState) => void> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private retryDelay = 1000;

  async init(): Promise<void> {
    await initDatabase();
    this.state.isOnline = await checkNetwork();
    await startNetworkMonitoring();
    this.setupNetworkListener();
    this.startPeriodicSync();
  }

  private setupNetworkListener(): void {
    addNetworkListener((isOnline) => {
      this.state.isOnline = isOnline;

      if (isOnline && this.state.status === 'idle') {
        this.forceSync();
      }

      this.notifyListeners();
    });
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && this.state.status === 'idle') {
        this.forceSync();
      }
    }, 60000);
  }

  addListener(listener: (state: SyncState) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (state: SyncState) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  getState(): SyncState {
    return { ...this.state };
  }

  async forceSync(): Promise<void> {
    if (this.state.status === 'syncing') return;

    this.state.status = 'syncing';
    this.state.error = null;
    this.notifyListeners();

    try {
      await this.pullChanges();
      await this.pushChanges();

      this.state.lastSyncTime = Date.now();
      this.state.status = 'idle';
      this.retryDelay = 1000;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Sync failed';
      this.state.status = 'error';

      this.retryDelay = Math.min(this.retryDelay * 2, 30000);
      setTimeout(() => this.forceSync(), this.retryDelay);
    } finally {
      this.notifyListeners();
    }
  }

  private async pullChanges(): Promise<void> {
    const sinceVersion = await getMaxVersion();

    try {
      const response = await fetch(`http://localhost:3000/api/sync/pull?since_version=${sinceVersion}`);
      const changes: SyncChanges = await response.json();

      for (const course of changes.courses) {
        await upsertCourse(course);
      }

      for (const session of changes.sessions) {
        await upsertSession(session);
      }

      for (const message of changes.messages) {
        await upsertMessage(message);
      }
    } catch (error) {
      console.warn('Pull failed, will retry:', error);
    }
  }

  private async pushChanges(): Promise<void> {
    const records = await getRecordsWithStatus('new');

    if (
      records.courses.length === 0 &&
      records.sessions.length === 0 &&
      records.messages.length === 0 &&
      records.quiz_results.length === 0
    ) {
      return;
    }

    const payload = {
      courses: records.courses,
      sessions: records.sessions,
      messages: records.messages,
      quiz_results: records.quiz_results,
    };

    try {
      const response = await fetch('http://localhost:3000/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const ack: SyncAck = await response.json();

      if (ack.success) {
        for (const course of records.courses) {
          await updateRecordStatus('courses', course.id, 'synced', ack.new_version);
        }
        for (const session of records.sessions) {
          await updateRecordStatus('sessions', session.id, 'synced', ack.new_version);
        }
        for (const message of records.messages) {
          await updateRecordStatus('messages', message.id, 'synced', ack.new_version);
        }
        for (const result of records.quiz_results) {
          await updateRecordStatus('quiz_results', result.id, 'synced', ack.new_version);
        }
      }
    } catch (error) {
      throw new Error(`Push failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCourses(): Promise<{ id: string; title: string; description: string; updated_at: string }[]> {
    return await dbGetCourses();
  }

  async getSessions(stageId?: string, learnerKey?: string): Promise<{ id: string; course_id: string | null; stage_id: string; learner_key: string; kind: string; status: string; last_message_at: string | null; updated_at: string }[]> {
    return await dbGetSessions(stageId, learnerKey);
  }

  async getMessages(sessionId: string): Promise<{ id: string; session_id: string; role: string; content: string; created_at: string }[]> {
    return await dbGetMessages(sessionId);
  }

  async insertCourse(course: { id: string; title: string; description: string; updated_at: string }): Promise<void> {
    await insertCourse(course);

    if (this.state.isOnline) {
      this.forceSync();
    }
  }

  async insertSession(session: { id: string; course_id: string | null; stage_id: string; learner_key: string; kind: string; status: string; last_message_at: string | null; updated_at: string }): Promise<void> {
    await insertSession(session);

    if (this.state.isOnline) {
      this.forceSync();
    }
  }

  async insertMessage(message: { id: string; session_id: string; role: string; content: string; created_at: string }): Promise<void> {
    await insertMessage(message);

    if (this.state.isOnline) {
      this.forceSync();
    }
  }

  async insertQuizResult(result: { id: string; quiz_id: string; answers: string; score: number | null; submitted_at: string }): Promise<void> {
    await insertQuizResult(result);

    if (this.state.isOnline) {
      this.forceSync();
    }
  }

  async close(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncManager = new SyncManager();
