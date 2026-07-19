import * as SQLite from 'expo-sqlite';

const DB_NAME = 'openmaic.db';

let db: SQLite.SQLiteDatabase | null = null;

const CREATE_TABLES = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    _version INTEGER NOT NULL DEFAULT 0,
    _status TEXT NOT NULL DEFAULT 'synced'
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    stage_id TEXT NOT NULL,
    learner_key TEXT NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    last_message_at TEXT,
    updated_at TEXT NOT NULL,
    _version INTEGER NOT NULL DEFAULT 0,
    _status TEXT NOT NULL DEFAULT 'synced'
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    _version INTEGER NOT NULL DEFAULT 0,
    _status TEXT NOT NULL DEFAULT 'synced'
  );
  CREATE TABLE IF NOT EXISTS message_attachments (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    local_uri TEXT NOT NULL,
    asset_ref TEXT,
    mime_type TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    byte_size INTEGER NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    _version INTEGER NOT NULL DEFAULT 0,
    _status TEXT NOT NULL DEFAULT 'synced'
  );
  CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER,
    submitted_at TEXT NOT NULL,
    _version INTEGER NOT NULL DEFAULT 0,
    _status TEXT NOT NULL DEFAULT 'synced'
  );
  CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_stage_learner ON sessions(stage_id, learner_key);
  CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON message_attachments(message_id);
  CREATE INDEX IF NOT EXISTS idx_attachments_status ON message_attachments(_status);
`;

export interface CourseRecord {
  id: string;
  title: string;
  description: string;
  updated_at: string;
  _version: number;
  _status: string;
}

export interface SessionRecord {
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
}

export interface MessageRecord {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
  _version: number;
  _status: string;
}

export interface QuizResultRecord {
  id: string;
  quiz_id: string;
  answers: string;
  score: number | null;
  submitted_at: string;
  _version: number;
  _status: string;
}

/**
 * 多模态消息附件记录（Phase 6.2）。
 * 通过 message_id 与 messages 表关联。
 */
export interface MessageAttachmentRecord {
  id: string;
  message_id: string;
  kind: string;
  local_uri: string;
  asset_ref: string | null;
  mime_type: string;
  width: number;
  height: number;
  byte_size: number;
  source: string;
  created_at: string;
  _version: number;
  _status: string;
}

export async function initDatabase(): Promise<void> {
  if (db) return;

  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(CREATE_TABLES);
}

export async function executeSql<T>(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<T[]> {
  if (!db) throw new Error('Database not initialized');

  return await db.getAllAsync(sql, ...params);
}

export async function executeSqlWithResult(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<{ rows: unknown[]; insertId: number | null; rowsAffected: number }> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.runAsync(sql, ...params);
  return {
    rows: [],
    insertId: result.lastInsertRowId,
    rowsAffected: result.changes,
  };
}

export async function insertCourse(
  course: Omit<CourseRecord, '_version' | '_status'>,
): Promise<void> {
  await executeSqlWithResult(
    'INSERT OR REPLACE INTO courses (id, title, description, updated_at, _version, _status) VALUES (?, ?, ?, ?, 0, "new")',
    [course.id, course.title, course.description, course.updated_at],
  );
}

export async function insertSession(
  session: Omit<SessionRecord, '_version' | '_status'>,
): Promise<void> {
  await executeSqlWithResult(
    'INSERT OR REPLACE INTO sessions (id, course_id, stage_id, learner_key, kind, status, last_message_at, updated_at, _version, _status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, "new")',
    [
      session.id,
      session.course_id,
      session.stage_id,
      session.learner_key,
      session.kind,
      session.status,
      session.last_message_at,
      session.updated_at,
    ],
  );
}

export async function insertMessage(
  message: Omit<MessageRecord, '_version' | '_status'>,
): Promise<void> {
  await executeSqlWithResult(
    'INSERT INTO messages (id, session_id, role, content, created_at, _version, _status) VALUES (?, ?, ?, ?, ?, 0, "new")',
    [message.id, message.session_id, message.role, message.content, message.created_at],
  );
}

export async function insertQuizResult(
  result: Omit<QuizResultRecord, '_version' | '_status'>,
): Promise<void> {
  await executeSqlWithResult(
    'INSERT INTO quiz_results (id, quiz_id, answers, score, submitted_at, _version, _status) VALUES (?, ?, ?, ?, ?, 0, "new")',
    [result.id, result.quiz_id, result.answers, result.score, result.submitted_at],
  );
}

/**
 * 插入一条多模态消息附件记录（Phase 6.2）。
 * 与 messages 表通过 message_id 关联，一消息可携带多附件。
 */
export async function insertMessageAttachment(
  attachment: Omit<MessageAttachmentRecord, '_version' | '_status'>,
): Promise<void> {
  await executeSqlWithResult(
    'INSERT OR REPLACE INTO message_attachments (id, message_id, kind, local_uri, asset_ref, mime_type, width, height, byte_size, source, created_at, _version, _status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, "new")',
    [
      attachment.id,
      attachment.message_id,
      attachment.kind,
      attachment.local_uri,
      attachment.asset_ref,
      attachment.mime_type,
      attachment.width,
      attachment.height,
      attachment.byte_size,
      attachment.source,
      attachment.created_at,
    ],
  );
}

/**
 * 查询指定消息下的所有附件。
 */
export async function getMessageAttachments(messageId: string): Promise<MessageAttachmentRecord[]> {
  return await executeSql<MessageAttachmentRecord>(
    'SELECT * FROM message_attachments WHERE message_id = ? ORDER BY created_at ASC',
    [messageId],
  );
}

/**
 * 批量查询多消息的附件，避免 N+1 问题。
 */
export async function getMessageAttachmentsBatch(
  messageIds: string[],
): Promise<Map<string, MessageAttachmentRecord[]>> {
  const result = new Map<string, MessageAttachmentRecord[]>();
  if (messageIds.length === 0) return result;
  const placeholders = messageIds.map(() => '?').join(',');
  const records = await executeSql<MessageAttachmentRecord>(
    `SELECT * FROM message_attachments WHERE message_id IN (${placeholders}) ORDER BY created_at ASC`,
    messageIds,
  );
  for (const record of records) {
    const list = result.get(record.message_id) ?? [];
    list.push(record);
    result.set(record.message_id, list);
  }
  return result;
}

export async function getCourses(): Promise<CourseRecord[]> {
  return await executeSql<CourseRecord>('SELECT * FROM courses');
}

export async function getSessions(stageId?: string, learnerKey?: string): Promise<SessionRecord[]> {
  let sql = 'SELECT * FROM sessions';
  const params: (string | number | null)[] = [];

  if (stageId && learnerKey) {
    sql += ' WHERE stage_id = ? AND learner_key = ?';
    params.push(stageId, learnerKey);
  }

  return await executeSql<SessionRecord>(sql, params);
}

export async function getMessages(sessionId: string): Promise<MessageRecord[]> {
  return await executeSql<MessageRecord>(
    'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC',
    [sessionId],
  );
}

export async function getQuizResults(): Promise<QuizResultRecord[]> {
  return await executeSql<QuizResultRecord>('SELECT * FROM quiz_results');
}

export async function getRecordsWithStatus(status: string): Promise<{
  courses: CourseRecord[];
  sessions: SessionRecord[];
  messages: MessageRecord[];
  message_attachments: MessageAttachmentRecord[];
  quiz_results: QuizResultRecord[];
}> {
  const [courses, sessions, messages, message_attachments, quiz_results] = await Promise.all([
    executeSql<CourseRecord>('SELECT * FROM courses WHERE _status = ?', [status]),
    executeSql<SessionRecord>('SELECT * FROM sessions WHERE _status = ?', [status]),
    executeSql<MessageRecord>('SELECT * FROM messages WHERE _status = ?', [status]),
    executeSql<MessageAttachmentRecord>('SELECT * FROM message_attachments WHERE _status = ?', [
      status,
    ]),
    executeSql<QuizResultRecord>('SELECT * FROM quiz_results WHERE _status = ?', [status]),
  ]);

  return { courses, sessions, messages, message_attachments, quiz_results };
}

export async function updateRecordStatus(
  table: string,
  id: string,
  status: string,
  version: number,
): Promise<void> {
  await executeSqlWithResult(`UPDATE ${table} SET _status = ?, _version = ? WHERE id = ?`, [
    status,
    version,
    id,
  ]);
}

export async function getMaxVersion(): Promise<number> {
  const [courses, sessions, messages] = await Promise.all([
    executeSql<{ max: number }>('SELECT MAX(_version) as max FROM courses'),
    executeSql<{ max: number }>('SELECT MAX(_version) as max FROM sessions'),
    executeSql<{ max: number }>('SELECT MAX(_version) as max FROM messages'),
  ]);

  const courseMax = courses[0]?.max || 0;
  const sessionMax = sessions[0]?.max || 0;
  const messageMax = messages[0]?.max || 0;

  return Math.max(courseMax, sessionMax, messageMax);
}

export async function upsertCourse(course: CourseRecord): Promise<void> {
  const existing = await executeSql<CourseRecord>('SELECT * FROM courses WHERE id = ?', [
    course.id,
  ]);
  if (existing.length > 0) {
    const existingVersion = existing[0]._version;
    if (course._version > existingVersion) {
      await executeSqlWithResult(
        'UPDATE courses SET title = ?, description = ?, updated_at = ?, _version = ?, _status = ? WHERE id = ?',
        [
          course.title,
          course.description,
          course.updated_at,
          course._version,
          course._status,
          course.id,
        ],
      );
    }
  } else {
    await executeSqlWithResult(
      'INSERT INTO courses (id, title, description, updated_at, _version, _status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        course.id,
        course.title,
        course.description,
        course.updated_at,
        course._version,
        course._status,
      ],
    );
  }
}

export async function upsertSession(session: SessionRecord): Promise<void> {
  const existing = await executeSql<SessionRecord>('SELECT * FROM sessions WHERE id = ?', [
    session.id,
  ]);
  if (existing.length > 0) {
    const existingVersion = existing[0]._version;
    if (session._version > existingVersion) {
      await executeSqlWithResult(
        'UPDATE sessions SET course_id = ?, stage_id = ?, learner_key = ?, kind = ?, status = ?, last_message_at = ?, updated_at = ?, _version = ?, _status = ? WHERE id = ?',
        [
          session.course_id,
          session.stage_id,
          session.learner_key,
          session.kind,
          session.status,
          session.last_message_at,
          session.updated_at,
          session._version,
          session._status,
          session.id,
        ],
      );
    }
  } else {
    await executeSqlWithResult(
      'INSERT INTO sessions (id, course_id, stage_id, learner_key, kind, status, last_message_at, updated_at, _version, _status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        session.id,
        session.course_id,
        session.stage_id,
        session.learner_key,
        session.kind,
        session.status,
        session.last_message_at,
        session.updated_at,
        session._version,
        session._status,
      ],
    );
  }
}

export async function upsertMessage(message: MessageRecord): Promise<void> {
  const existing = await executeSql<MessageRecord>('SELECT * FROM messages WHERE id = ?', [
    message.id,
  ]);
  if (existing.length === 0) {
    await executeSqlWithResult(
      'INSERT INTO messages (id, session_id, role, content, created_at, _version, _status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        message.id,
        message.session_id,
        message.role,
        message.content,
        message.created_at,
        message._version,
        message._status,
      ],
    );
  }
}

export function getDb(): SQLite.SQLiteDatabase | null {
  return db;
}
