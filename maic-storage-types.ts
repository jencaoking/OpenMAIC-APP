/**
 * OpenMAIC Storage Types — Pure Type Contract
 * ===========================================
 *
 * Zero-runtime-dependency type definitions for cross-platform collaboration
 * between Web and Expo/RN mobile applications.
 *
 * This file contains ONLY interface, type, and const enum declarations — NO
 * imports, classes, functions, or runtime code.
 *
 * Source: @openmaic/storage + @openmaic/dsl runtime contract
 */

// ---------------------------------------------------------------------------
// 1. 基础原语 (Primitive Types)
// ---------------------------------------------------------------------------

/**
 * ISO 8601 timestamp format. Must match: YYYY-MM-DDTHH:mm:ss[.fff][Z|±hh:mm]
 *
 * @constraint 必须包含时区标识(Z或±hh:mm)，不允许无时区的时间戳
 * @example "2024-01-15T10:30:00.000Z"
 * @example "2024-01-15T10:30:00+08:00"
 */
export type IsoTimestamp = string;

/**
 * DSL 版本号格式，遵循语义化版本规范。
 *
 * @constraint 必须匹配正则 /^\d+\.\d+\.\d+$/，即 x.y.z 格式
 * @example "0.1.0"
 */
export type DslVersionString = string;

/**
 * 运行时记录的负载类型。可以是任何非 undefined 的值。
 *
 * @constraint undefined 不允许作为 payload 值，但 null 是合法的
 */
export type RuntimePayload = NonNullable<unknown> | null;

/**
 * 场景类型标识。
 */
export type SceneType = 'slide' | 'quiz' | 'interactive' | 'pbl';

/**
 * 核心运行时会话类型。
 */
export type CoreRuntimeKind = 'chat' | 'quizAttempt' | 'playback';

/**
 * KV 存储作用域。
 */
export type KVScope = 'device' | 'account';

// ---------------------------------------------------------------------------
// 2. 认证与权限 (Auth & Permissions)
// ---------------------------------------------------------------------------

/**
 * 学习者身份标识。服务端从认证会话中派生，客户端不可伪造。
 *
 * @field learnerKey - 学习者的不透明分区键，由服务端验证
 * @constraint 必须是非空字符串，不能是 "." 或 ".."
 */
export interface LearnerIdentity {
  learnerKey: string;
}

/**
 * 认证上下文，包含当前用户的身份信息。
 *
 * @field learnerKey - 当前认证用户的学习者键，可选表示未认证状态
 */
export interface AuthContext {
  learnerKey?: string;
}

/**
 * 权限范围类型。
 */
export type PermissionScope = 'learner' | 'merge' | 'admin';

/**
 * 运行时 HTTP 服务端认证主体。
 */
export interface RuntimeHttpPrincipal {
  learnerKey?: string;
}

// ---------------------------------------------------------------------------
// 3. Session 生命周期 (Session Lifecycle)
// ---------------------------------------------------------------------------

/**
 * 运行时会话状态。
 *
 * @constraint 只能是 'active'、'completed' 或 'archived' 之一
 */
export type RuntimeSessionStatus = 'active' | 'completed' | 'archived';

/**
 * 运行时版本标记接口。
 *
 * @field runtimeDslVersion - 运行时契约版本号，可选表示可能未标记
 */
export interface RuntimeVersioned {
  runtimeDslVersion?: DslVersionString;
}

/**
 * 运行时会话接口。学习者在学习过程中的身份和生命周期单元。
 *
 * @field id - 会话唯一标识
 * @field runtimeDslVersion - 运行时契约版本号（必填，会话创建时由服务端分配）
 * @field kind - 会话类型，如 'chat'、'quizAttempt'、'playback'
 * @field stageId - 所属课程/阶段 ID
 * @field learnerKey - 学习者分区键
 * @field status - 会话状态：active/completed/archived
 * @field createdAt - 创建时间（ISO 8601）
 * @field updatedAt - 更新时间（ISO 8601）
 * @constraint runtimeDslVersion 由服务端分配，客户端不可传
 * @constraint id/stageId/learnerKey 不能是 "." 或 ".."
 */
export interface RuntimeSession extends RuntimeVersioned {
  readonly id: string;
  readonly runtimeDslVersion: DslVersionString;
  readonly kind: string;
  readonly stageId: string;
  readonly learnerKey: string;
  status: RuntimeSessionStatus;
  readonly createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

/**
 * 创建会话时的参数类型。从 RuntimeSession 中排除服务端分配的 runtimeDslVersion。
 *
 * @field id - 会话唯一标识（客户端生成）
 * @field kind - 会话类型
 * @field stageId - 所属课程/阶段 ID
 * @field learnerKey - 学习者分区键
 * @field status - 初始状态
 * @field createdAt - 创建时间
 * @field updatedAt - 更新时间
 * @constraint runtimeDslVersion 由服务端在创建时自动添加
 */
export type RuntimeSessionInit = Omit<RuntimeSession, 'runtimeDslVersion'>;

/**
 * 创建会话的参数别名，用于 HTTP POST 请求体。
 */
export type SessionCreateParams = RuntimeSessionInit;

/**
 * 更新会话状态的参数类型。
 *
 * @field status - 新的会话状态
 * @field updatedAt - 更新时间戳（客户端提供）
 */
export interface SessionUpdateParams {
  status: RuntimeSessionStatus;
  updatedAt: IsoTimestamp;
}

// ---------------------------------------------------------------------------
// 4. Record 读写 (Record CRUD)
// ---------------------------------------------------------------------------

/**
 * 运行时记录接口。会话内的一条有序事实记录。
 *
 * @field id - 记录唯一标识
 * @field sessionId - 所属会话 ID
 * @field seq - 会话内单调递增的序号（服务端分配）
 * @field sceneId - 可选：锚定到的场景 ID
 * @field actionIndex - 可选：锚定到场景中的动作索引
 * @field subAnchor - 可选：应用自定义的子锚点（如题目 ID）
 * @field createdAt - 创建时间（ISO 8601）
 * @field payload - 应用自定义负载数据
 * @constraint seq 由服务端分配，客户端不可传
 */
export interface RuntimeRecord<TPayload extends RuntimePayload = RuntimePayload> {
  readonly id: string;
  readonly sessionId: string;
  readonly seq: number;
  sceneId?: string;
  actionIndex?: number;
  subAnchor?: string;
  readonly createdAt: IsoTimestamp;
  payload: TPayload;
}

/**
 * 创建记录时的参数类型。从 RuntimeRecord 中排除服务端分配的 seq。
 *
 * @field id - 记录唯一标识（客户端生成）
 * @field sessionId - 所属会话 ID
 * @field sceneId - 可选：锚定场景 ID
 * @field actionIndex - 可选：动作索引
 * @field subAnchor - 可选：子锚点
 * @field createdAt - 创建时间
 * @field payload - 负载数据
 * @constraint seq 由服务端在追加时自动分配
 */
export type RuntimeRecordInit<TPayload extends RuntimePayload = RuntimePayload> = Omit<
  RuntimeRecord<TPayload>,
  'seq'
>;

/**
 * 追加记录的参数别名，用于 HTTP POST 请求体。
 */
export type RecordAppendParams<TPayload extends RuntimePayload = RuntimePayload> =
  RuntimeRecordInit<TPayload>;

/**
 * 记录过滤条件。
 *
 * @field sceneId - 按场景 ID 过滤，只返回锚定到该场景的记录
 */
export interface RecordFilter {
  sceneId?: string;
}

/**
 * 聊天消息角色。
 */
export type ChatRuntimeRole = 'user' | 'assistant' | 'system';

/**
 * 聊天记录负载骨架。
 *
 * @field role - 发言角色
 * @field content - 消息内容
 */
export interface ChatMessageSkeleton {
  role: ChatRuntimeRole;
  content: string;
}

/**
 * 测验尝试阶段。
 */
export type QuizAttemptPhase = 'draft' | 'submitted' | 'reviewed';

/**
 * 测验尝试记录负载骨架。
 *
 * @field phase - 当前阶段
 * @field answers - 题目 ID 到答案的映射
 */
export interface QuizAttemptSkeleton {
  phase: QuizAttemptPhase;
  answers: Record<string, unknown>;
}

/**
 * 负载验证结果。
 */
export interface ValidationResult {
  valid: boolean;
  errors?: { path: string; message: string }[];
}

/**
 * 负载验证器类型。
 */
export type RuntimePayloadValidator = (
  payload: unknown,
) => { valid: true } | { valid: false; errors: { path: string; message: string }[] };

// ---------------------------------------------------------------------------
// 5. 查询与分页 (Query & Pagination)
// ---------------------------------------------------------------------------

/**
 * 列出记录的选项。
 *
 * @field sceneId - 可选：按场景 ID 过滤记录
 */
export interface ListRecordsOptions {
  sceneId?: string;
}

/**
 * 列出会话的选项。
 */
export interface ListSessionsOptions {
  stageId: string;
  learnerKey: string;
}

/**
 * 排序方向。当前契约尚未实现排序功能，此类型为前瞻性定义。
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 分页游标。当前契约尚未实现分页功能，此类型为前瞻性定义。
 */
export type PaginationCursor = string | undefined;

/**
 * 分页结果包装器。当前契约尚未实现分页功能，此类型为前瞻性定义。
 */
export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: PaginationCursor;
  hasNext: boolean;
}

// ---------------------------------------------------------------------------
// 6. 错误处理 (Error Handling)
// ---------------------------------------------------------------------------

/**
 * 存储服务错误码类型。
 *
 * @constraint 服务端返回的错误码必须是以下值之一
 */
export type StorageErrorCode =
  | 'VALIDATION_FAILED'
  | 'SESSION_NOT_FOUND'
  | 'ROUTE_NOT_FOUND'
  | 'FUTURE_VERSION'
  | 'SESSION_ALREADY_EXISTS'
  | 'INTERNAL_ERROR'
  | 'FORBIDDEN_LEARNER'
  | 'FORBIDDEN_ADMIN'
  | 'UNAUTHENTICATED';

/**
 * 验证错误详情。
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * 存储 API 错误响应。
 *
 * @field code - 机器可读的错误码
 * @field message - 人类可读的错误信息
 * @field details - 可选的详细错误信息
 */
export interface StorageApiError {
  code: StorageErrorCode;
  message: string;
  details?: ValidationError[];
}

/**
 * HTTP 错误响应体。
 */
export interface ErrorResponseBody {
  error: StorageApiError;
}

/**
 * 学习者合并请求参数。
 *
 * @field fromLearnerKey - 源学习者键
 * @field toLearnerKey - 目标学习者键
 * @constraint 两个键都必须是非空字符串，不能是 "." 或 ".."
 */
export interface MergeLearnerParams {
  fromLearnerKey: string;
  toLearnerKey: string;
}

/**
 * 学习者合并响应。
 *
 * @field moved - 成功迁移的会话数量
 */
export interface MergeLearnerResponse {
  moved: number;
}

// ---------------------------------------------------------------------------
// 7. DSL 版本与阶段 (DSL & Stage)
// ---------------------------------------------------------------------------

/**
 * DSL 版本标记接口。
 *
 * @field dslVersion - 文档契约版本号，可选表示遗留数据
 */
export interface DslVersioned {
  dslVersion?: DslVersionString;
}

/**
 * 当前运行时 DSL 版本。服务端在创建会话时使用此版本号。
 */
export type RUNTIME_DSL_VERSION = '0.1.0';

/**
 * 当前文档 DSL 版本。服务端在保存文档时使用此版本号。
 */
export type DSL_VERSION = '0.1.0';

/**
 * 阶段/课程 ID 类型别名。
 */
export type StageId = string;

/**
 * 场景 ID 类型别名。
 */
export type SceneId = string;

/**
 * 交互类型。
 */
export type InteractionType = 'autonomous' | 'playback' | 'edit';

/**
 * RuntimeStore 持久化契约接口。
 *
 * 定义运行时会话和记录的持久化操作，所有实现必须满足此契约。
 */
export interface RuntimeStore {
  /**
   * 创建新会话。服务端自动添加 runtimeDslVersion 并验证完整信封。
   *
   * @param init - 会话初始化参数
   * @returns 创建后的完整会话对象
   * @throws 如果会话 ID 已存在则抛出错误
   */
  createSession(init: RuntimeSessionInit): Promise<RuntimeSession>;

  /**
   * 获取单个会话。
   *
   * @param sessionId - 会话 ID
   * @returns 会话对象或 undefined（不存在时）
   */
  getSession(sessionId: string): Promise<RuntimeSession | undefined>;

  /**
   * 列出指定学习者在指定阶段的所有会话。
   *
   * @param stageId - 阶段 ID
   * @param learnerKey - 学习者键
   * @returns 会话数组，按创建时间排序
   */
  listSessions(stageId: string, learnerKey: string): Promise<RuntimeSession[]>;

  /**
   * 更新会话状态。
   *
   * @param sessionId - 会话 ID
   * @param status - 新状态
   * @param updatedAt - 更新时间戳
   * @throws 如果会话不存在或为未来版本则抛出错误
   */
  setSessionStatus(
    sessionId: string,
    status: RuntimeSessionStatus,
    updatedAt: string,
  ): Promise<void>;

  /**
   * 删除会话及其所有记录。幂等操作。
   *
   * @param sessionId - 会话 ID
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * 向活跃会话追加记录。服务端分配 seq 并验证完整信封。
   *
   * @param init - 记录初始化参数
   * @returns 追加后的完整记录对象
   * @throws 如果会话不存在、非活跃状态或为未来版本则抛出错误
   */
  appendRecord<TPayload extends RuntimePayload>(
    init: RuntimeRecordInit<TPayload>,
  ): Promise<RuntimeRecord<TPayload>>;

  /**
   * 列出会话的所有记录。
   *
   * @param sessionId - 会话 ID
   * @param opts - 可选过滤选项
   * @returns 记录数组，按 seq 排序
   */
  listRecords(sessionId: string, opts?: ListRecordsOptions): Promise<RuntimeRecord[]>;

  /**
   * 将一个学习者的所有会话迁移到另一个学习者。
   *
   * @param fromLearnerKey - 源学习者键
   * @param toLearnerKey - 目标学习者键
   * @returns 迁移的会话数量
   */
  mergeLearner(fromLearnerKey: string, toLearnerKey: string): Promise<number>;

  /**
   * 删除指定阶段上指定学习者的所有运行时数据。
   *
   * @param stageId - 阶段 ID
   * @param learnerKey - 学习者键
   */
  deleteLearnerRuntime(stageId: string, learnerKey: string): Promise<void>;

  /**
   * 删除指定阶段的所有运行时数据。
   *
   * @param stageId - 阶段 ID
   */
  deleteStageRuntime(stageId: string): Promise<void>;

  /**
   * 删除所有运行时数据。
   */
  deleteAllRuntime(): Promise<void>;
}

/**
 * HTTP RuntimeStore 选项。
 */
export interface HttpRuntimeStoreOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  headers?: (context: { method: string; path: string }) => HeadersInit | Promise<HeadersInit>;
}

/**
 * HTTP 请求头上下文。
 */
export interface HttpRuntimeHeadersContext {
  method: string;
  path: string;
}

/**
 * HTTP 请求头钩子。
 */
export type HttpRuntimeHeadersHook = (context: HttpRuntimeHeadersContext) => HeadersInit | Promise<HeadersInit>;