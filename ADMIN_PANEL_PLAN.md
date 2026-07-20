# OpenMAIC 后台管理系统 — 开发计划

> 版本: v1.0  
> 更新日期: 2026-07-20  
> 状态: 规划中

---

## 一、项目概述

### 1.1 背景

OpenMAIC 是一个 AI 驱动的教育平台，目前缺少后台管理系统。所有配置通过环境变量和 YAML 文件手动管理，无法可视化监控和操作。需要构建一个独立的后台管理应用，供 2-5 人管理团队使用。

### 1.2 目标

- 提供可视化管理界面，替代手动编辑配置文件
- 实时监控系统状态、用量统计、错误告警
- 管理用户、课堂内容、AI 提供商
- 实现配额管理和用量统计

### 1.3 非目标

- 不做多租户（单租户）
- 不做支付对接（仅配额管理）
- 不做国际化（仅中文）
- 不做移动端适配（桌面端为主）

---

## 二、技术方案

### 2.1 技术栈

| 层面 | 选型 | 理由 |
|------|------|------|
| **框架** | Next.js 16 (App Router) | 与主项目一致，可共享类型定义 |
| **UI** | shadcn/ui + Tailwind CSS 4 | 主项目已用，风格一致 |
| **图表** | ECharts | 主项目已引入 |
| **数据库** | PostgreSQL (复用现有) | 已有 Storage Server 连接 |
| **ORM** | Drizzle ORM | 轻量、类型安全、PostgreSQL 原生支持 |
| **鉴权** | 自建 (bcrypt + JWT) | 简单可控，无需外部依赖 |
| **状态管理** | Zustand | 主项目已用 |
| **实时通信** | Server-Sent Events (SSE) | 日志流、告警推送 |

### 2.2 项目结构

```
apps/admin/                          # 独立的 Next.js 应用
├── app/
│   ├── layout.tsx                   # 根布局 (鉴权守卫)
│   ├── login/page.tsx               # 登录页
│   ├── (dashboard)/                 # 认证后的布局组
│   │   ├── layout.tsx               # 侧边栏 + 顶栏
│   │   ├── page.tsx                 # 仪表盘首页
│   │   ├── users/                   # 用户管理
│   │   ├── providers/               # 提供商管理
│   │   ├── content/                 # 内容管理
│   │   ├── analytics/               # 用量分析
│   │   ├── billing/                 # 配额管理
│   │   ├── settings/                # 系统配置
│   │   ├── security/                # 安全管理
│   │   ├── operations/              # 运维监控
│   │   └── support/                 # 反馈支持
│   └── api/
│       ├── auth/                    # 鉴权接口
│       ├── admin/                   # 管理接口
│       └── stream/                  # SSE 实时推送
├── lib/
│   ├── auth/                        # 鉴权逻辑
│   ├── db/                          # 数据库连接和 Schema
│   ├── services/                    # 业务逻辑层
│   └── utils/                       # 工具函数
├── components/                      # 共享组件
├── hooks/                           # 自定义 Hooks
└── types/                           # 类型定义
```

### 2.3 与主项目的关系

```
┌─────────────────┐     ┌─────────────────┐
│   主应用         │     │   后台管理        │
│   (OpenMAIC)    │     │   (Admin)        │
│   :3000         │     │   :3001          │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────┴──────┐
              │  PostgreSQL  │
              │  :5432       │
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │  Storage     │
              │  Server      │
              │  :3002       │
              └─────────────┘
```

- 共享 PostgreSQL 数据库
- 通过 API 通信，不共享运行时
- 共享类型定义 (`@openmaic/dsl`, `@openmaic/storage-types`)

---

## 三、功能模块详细设计

### 3.1 鉴权模块

#### 登录流程

```
用户输入用户名+密码
  → POST /api/auth/login
  → bcrypt 验证密码
  → 生成 JWT (access_token + refresh_token)
  → 设置 httpOnly Cookie
  → 跳转到仪表盘
```

#### 管理员管理

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名，唯一 |
| password_hash | VARCHAR(255) | bcrypt 哈希 |
| role | ENUM | super_admin / admin / operator |
| display_name | VARCHAR(100) | 显示名称 |
| email | VARCHAR(255) | 邮箱 |
| avatar | TEXT | 头像 URL |
| last_login_at | TIMESTAMP | 最后登录时间 |
| is_active | BOOLEAN | 是否启用 |
| created_at | TIMESTAMP | 创建时间 |

#### 权限矩阵

| 功能 | super_admin | admin | operator |
|------|:-----------:|:-----:|:--------:|
| 管理管理员 | ✅ | ❌ | ❌ |
| 系统配置 | ✅ | ✅ | ❌ |
| 提供商管理 | ✅ | ✅ | ✅ |
| 用户管理 | ✅ | ✅ | ✅ |
| 内容管理 | ✅ | ✅ | ✅ |
| 用量查看 | ✅ | ✅ | ✅ |
| 配额管理 | ✅ | ✅ | ❌ |
| 运维操作 | ✅ | ❌ | ❌ |
| 安全设置 | ✅ | ❌ | ❌ |

---

### 3.2 仪表盘

#### 核心指标卡片

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  在线用户    │ │  今日 API    │ │  今日 Token  │ │  活跃课堂    │
│     12      │ │   1,234     │ │   45.6K     │ │     8       │
│  ↑ 15%      │ │  ↑ 23%      │ │  ↓ 5%       │ │  ↑ 2        │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

#### 图表区域

| 图表 | 类型 | 时间范围 |
|------|------|----------|
| API 调用趋势 | 折线图 | 7/30 日 |
| Token 消耗分布 | 饼图 | 按提供商 |
| 错误率趋势 | 折线图 | 24 小时 |
| 提供商响应时间 | 柱状图 | 实时 |
| 用户活跃度 | 热力图 | 按小时/星期 |

#### 实时状态

- 各服务健康状态 (Next.js / Storage Server / PostgreSQL)
- 提供商可用性指示灯
- 最近 5 条错误日志

---

### 3.3 用户管理

#### 用户列表

```
┌──────────────────────────────────────────────────────────────────┐
│  搜索: [____________]  角色: [全部 ▼]  状态: [全部 ▼]  [导出]  │
├──────────────────────────────────────────────────────────────────┤
│  ☐  用户名    角色    课堂数   最后活跃     状态    操作        │
│  ☐  张三     教师     12     2 小时前     ✅ 活跃  [编辑][禁用]│
│  ☐  李四     学生      3     1 天前       ✅ 活跃  [编辑][禁用]│
│  ☐  王五     学生      0     7 天前       ⚠️ 不活跃 [编辑][禁用]│
├──────────────────────────────────────────────────────────────────┤
│  共 156 用户  第 1/16 页  [< 1 2 3 ... 16 >]                    │
└──────────────────────────────────────────────────────────────────┘
```

#### 用户详情页

- 基本信息 (用户名、角色、邮箱、创建时间)
- 使用统计 (API 调用次数、Token 消耗、课堂数量)
- 课堂列表 (该用户创建的所有课堂)
- 登录历史 (IP、时间、设备)
- 操作日志 (该用户的所有操作记录)

---

### 3.4 AI 提供商管理

#### 提供商列表

```
┌──────────────────────────────────────────────────────────────────┐
│  [+ 添加提供商]                                                  │
├──────────────────────────────────────────────────────────────────┤
│  类型    名称         状态    今日调用   延迟    操作            │
│  LLM    OpenAI       ✅ 正常   456     1.2s   [编辑][测试][删除]│
│  LLM    Anthropic    ✅ 正常   234     0.8s   [编辑][测试][删除]│
│  LLM    DeepSeek     ⚠️ 限流    89     2.1s   [编辑][测试][删除]│
│  TTS    Azure TTS    ✅ 正常    56     0.5s   [编辑][测试][删除]│
│  ASR    OpenAI ASR   ❌ 错误     0       -    [编辑][测试][删除]│
│  图片   DALL-E       ✅ 正常    23     3.2s   [编辑][测试][删除]│
└──────────────────────────────────────────────────────────────────┘
```

#### 提供商编辑页

- 基础信息 (名称、类型、Base URL)
- API Key (加密显示，可更新)
- 模型列表 (自动获取 + 手动添加)
- 能力配置 (视觉、工具调用、思考模式)
- 高级设置 (超时、重试、并发限制)
- 连通性测试 (一键测试，显示结果)

#### 模型路由配置

```
┌──────────────────────────────────────────────────────────────────┐
│  模型路由规则                                                    │
├──────────────────────────────────────────────────────────────────┤
│  场景                默认模型              优先级    状态          │
│  scene-content       openai:gpt-5.4       1       ✅            │
│  scene-content:quiz  deepseek:v4-pro      1       ✅            │
│  chat-adapter        anthropic:sonnet-4   1       ✅            │
│  pbl-chat            openai:gpt-5.4       1       ✅            │
│  [添加规则]                                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

### 3.5 内容管理

#### 课堂列表

```
┌──────────────────────────────────────────────────────────────────┐
│  搜索: [____________]  作者: [全部 ▼]  状态: [全部 ▼]  [批量操作]│
├──────────────────────────────────────────────────────────────────┤
│  ☐  名称           作者    场景数   大小     最后修改   操作     │
│  ☐  高数第一章     张三     12    2.3MB   2 小时前   [预览][编辑][删除]│
│  ☐  英语阅读       李四      8    1.1MB   1 天前     [预览][编辑][删除]│
│  ☐  物理实验       王五     15    4.5MB   3 天前     [预览][编辑][删除]│
├──────────────────────────────────────────────────────────────────┤
│  共 89 课堂  第 1/9 页                                           │
└──────────────────────────────────────────────────────────────────┘
```

#### 素材库

- 图片库 (AI 生成 + 用户上传)
- 音频库 (TTS 生成 + 用户上传)
- 视频库 (AI 生成)
- 文档库 (PDF、PPTX)
- 标签分类、搜索、批量操作

---

### 3.6 用量与分析

#### 用量概览

```
┌──────────────────────────────────────────────────────────────────┐
│  时间范围: [今日] [本周] [本月] [自定义]                          │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │  总调用次数     │  │  总 Token      │  │  估算费用       │     │
│  │   12,345      │  │   1.2M        │  │   ¥456.78     │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
│                                                                  │
│  Token 消耗趋势 (折线图)          Token 分布 (饼图)              │
│  ─────────────────────           ┌─────────────┐                │
│  ╱╲  ╱╲  ╱╲                     │ OpenAI 45%  │                │
│ ╱  ╲╱  ╲╱  ╲                    │ Anthropic 30%│                │
│                                  │ DeepSeek 25% │                │
│                                  └─────────────┘                │
├──────────────────────────────────────────────────────────────────┤
│  按用户排名                        按阶段排名                     │
│  1. 张三  45K tokens              1. scene-content  500K         │
│  2. 李四  32K tokens              2. chat-adapter   300K         │
│  3. 王五  28K tokens              3. pbl-chat       200K         │
└──────────────────────────────────────────────────────────────────┘
```

#### 明细查询

- 按时间、用户、提供商、阶段筛选
- 导出 CSV/Excel
- 原始日志查看

---

### 3.7 配额管理

#### 套餐配置

| 套餐 | 月 Token 上限 | 月 API 次数 | 并发数 | 课堂数 |
|------|-------------|------------|--------|--------|
| 免费版 | 100K | 1,000 | 2 | 5 |
| 基础版 | 1M | 10,000 | 5 | 50 |
| 专业版 | 10M | 100,000 | 20 | 无限 |
| 企业版 | 无限 | 无限 | 无限 | 无限 |

#### 用户配额

- 分配套餐给用户
- 自定义配额覆盖
- 超限策略 (警告 / 降级 / 禁用)

---

### 3.8 系统配置

#### 配置项分组

| 分组 | 配置项 |
|------|--------|
| **基础** | 站点名称、Logo、描述、默认语言 |
| **AI** | DEFAULT_MODEL、模型路由、思考模式开关 |
| **生成** | 并发数、超时、重试、缓存 |
| **存储** | 后端切换、对象存储配置 |
| **安全** | CORS、CSP、速率限制、SSRF 白名单 |
| **通知** | 邮件/飞书配置 |

---

### 3.9 安全管理

#### 审计日志

```
┌──────────────────────────────────────────────────────────────────┐
│  时间                操作者    操作         对象        IP        │
│  2026-07-20 14:30   admin    更新提供商    OpenAI     1.2.3.4  │
│  2026-07-20 14:25   admin    创建用户      李四       1.2.3.4  │
│  2026-07-20 14:20   admin    登录          -          1.2.3.4  │
└──────────────────────────────────────────────────────────────────┘
```

#### IP 管理

- IP 白名单/黑名单
- 异常登录检测
- 地理位置限制

---

### 3.10 运维监控

#### 服务健康

```
┌──────────────────────────────────────────────────────────────────┐
│  服务              状态     响应时间   最后检查   操作            │
│  Next.js (主应用)  ✅ 正常    45ms    30 秒前   [重启]          │
│  Storage Server    ✅ 正常    23ms    30 秒前   [重启]          │
│  PostgreSQL        ✅ 正常    5ms     30 秒前   [重启]          │
│  Redis (缓存)      ❌ 未配置    -       -       [配置]          │
└──────────────────────────────────────────────────────────────────┘
```

#### 实时日志

- 按级别筛选 (DEBUG/INFO/WARN/ERROR)
- 按模块筛选 (API/AI/Storage/Auth)
- 关键词搜索
- 实时流 (SSE)
- 日志导出

#### 告警管理

| 告警类型 | 触发条件 | 通知渠道 |
|----------|----------|----------|
| 服务宕机 | 健康检查失败 | 飞书 + 邮件 |
| 错误率升高 | 5 分钟内 > 5% | 飞书 |
| Token 超限 | 用户达到配额 90% | 邮件 |
| 提供商异常 | 连续 3 次调用失败 | 飞书 |
| 磁盘空间 | 剩余 < 10% | 飞书 + 邮件 |

---

## 四、数据库设计

### 4.1 管理员表 (admin_users)

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'operator',
  display_name VARCHAR(100),
  email VARCHAR(255),
  avatar TEXT,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 审计日志表 (audit_logs)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 告警规则表 (alert_rules)

```sql
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  condition JSONB NOT NULL,
  channels JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.4 告警记录表 (alert_events)

```sql
CREATE TABLE alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES alert_rules(id),
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.5 配额表 (quotas)

```sql
CREATE TABLE quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  plan_name VARCHAR(50) NOT NULL,
  monthly_token_limit BIGINT,
  monthly_api_limit INTEGER,
  max_concurrent INTEGER,
  max_classrooms INTEGER,
  custom_overrides JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 五、API 设计

### 5.1 鉴权接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |
| POST | `/api/auth/refresh` | 刷新 Token |
| GET | `/api/auth/me` | 当前管理员信息 |

### 5.2 管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/admin/users` | 用户列表/创建 |
| GET/PUT/DELETE | `/api/admin/users/[id]` | 用户详情/更新/删除 |
| GET/POST | `/api/admin/providers` | 提供商列表/创建 |
| GET/PUT/DELETE | `/api/admin/providers/[id]` | 提供商详情/更新/删除 |
| POST | `/api/admin/providers/[id]/test` | 测试提供商 |
| GET/POST | `/api/admin/classrooms` | 课堂列表/创建 |
| GET/DELETE | `/api/admin/classrooms/[id]` | 课堂详情/删除 |
| GET | `/api/admin/analytics/overview` | 用量概览 |
| GET | `/api/admin/analytics/detail` | 用量明细 |
| GET/PUT | `/api/admin/settings` | 系统配置 |
| GET | `/api/admin/logs` | 操作日志 |
| GET/POST | `/api/admin/alerts` | 告警列表/创建 |

### 5.3 实时接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stream/logs` | 实时日志流 (SSE) |
| GET | `/api/stream/alerts` | 实时告警流 (SSE) |
| GET | `/api/stream/health` | 健康状态流 (SSE) |

---

## 六、实施路线图

### Phase 1: 基础框架 (第 1 周)

| 任务 | 优先级 | 工时 |
|------|--------|------|
| 项目初始化 (Next.js + shadcn + Drizzle) | P0 | 2h |
| 数据库 Schema + 迁移 | P0 | 3h |
| 鉴权系统 (登录/登出/JWT) | P0 | 4h |
| 布局组件 (侧边栏/顶栏/面包屑) | P0 | 4h |
| 管理员管理 (CRUD) | P1 | 3h |

### Phase 2: 核心模块 (第 2 周)

| 任务 | 优先级 | 工时 |
|------|--------|------|
| 仪表盘 (指标卡片 + 图表) | P0 | 6h |
| 提供商管理 (列表/编辑/测试) | P0 | 6h |
| 模型路由配置 | P0 | 4h |
| 用户管理 (列表/详情/编辑) | P0 | 4h |

### Phase 3: 内容与分析 (第 3 周)

| 任务 | 优先级 | 工时 |
|------|--------|------|
| 课堂管理 (列表/预览/删除) | P0 | 4h |
| 素材库 | P1 | 4h |
| 用量统计 (图表 + 明细) | P0 | 6h |
| 配额管理 | P1 | 4h |

### Phase 4: 运维与安全 (第 4 周)

| 任务 | 优先级 | 工时 |
|------|--------|------|
| 系统配置 | P0 | 4h |
| 审计日志 | P0 | 3h |
| 服务健康监控 | P0 | 3h |
| 实时日志 (SSE) | P1 | 4h |
| 告警管理 (规则 + 飞书/邮件通知) | P1 | 5h |

### Phase 5: 完善与优化 (第 5 周)

| 任务 | 优先级 | 工时 |
|------|--------|------|
| IP 管理 | P2 | 3h |
| 反馈管理 | P2 | 3h |
| 数据导出 (CSV/Excel) | P2 | 2h |
| 性能优化 | P1 | 4h |
| 测试与修复 | P0 | 6h |

---

## 七、开发规范

### 7.1 代码规范

- TypeScript 严格模式
- 组件使用 Composition API (`<script setup>`)
- API 路由使用 Edge Runtime（如可能）
- 数据库操作使用 Drizzle ORM，禁止原生 SQL 拼接

### 7.2 安全规范

- 密码使用 bcrypt (cost=12) 哈希
- JWT 密钥从环境变量读取，不硬编码
- 所有管理接口验证 JWT + 角色权限
- 敏感操作记录审计日志
- API Key 加密存储

### 7.3 命名规范

- 文件名: kebab-case
- 组件名: PascalCase
- 数据库表名: snake_case
- API 路径: kebab-case
- CSS 类名: Tailwind 原子类

---

## 八、环境变量

```bash
# 后台专用
ADMIN_JWT_SECRET=your-secret-key
ADMIN_PORT=3001

# 数据库 (复用)
POSTGRES_USER=openmaic
POSTGRES_PASSWORD=openmaic_password
POSTGRES_DB=openmaic
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# 邮件通知
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com

# 飞书通知
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# 主应用 API (用于调用)
MAIN_APP_URL=http://localhost:3000
STORAGE_SERVER_URL=http://localhost:3002
```

---

## 九、风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 与主项目数据库耦合 | Schema 变更影响双方 | 使用独立 Schema (admin_*)，通过视图隔离 |
| 实时日志性能 | 大量日志导致 SSE 压力 | 采样 + 缓冲 + 分级推送 |
| 提供商 Key 安全 | 泄露风险 | 加密存储 + 访问审计 + 最小权限 |
| 小团队维护成本 | 功能膨胀 | 严格按优先级实施，P2 功能可延后 |

---

## 十、交付标准

- [ ] 所有 P0 功能可用
- [ ] 鉴权系统安全可靠
- [ ] 仪表盘数据准确
- [ ] 提供商测试功能正常
- [ ] 用量统计与实际一致
- [ ] 告警通知可达
- [ ] 无严重 Bug
- [ ] 基本文档完成
