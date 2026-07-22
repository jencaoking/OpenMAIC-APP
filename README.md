<div align="center">

# OpenMAIC

**AI 驱动的互动课堂 — 一句话生成沉浸式多智能体学习体验。**

[![Version](https://img.shields.io/badge/version-0.3.0-blue)](https://github.com/jencaoking/OpenMAIC-APP)
[![License](https://img.shields.io/badge/license-CASAL%20v1.0-purple)](LICENCE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-green)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10-orange)](https://pnpm.io)
[![Platforms](https://img.shields.io/badge/platforms-Web%20%7C%20Mobile%20%7C%20Desktop-important)](https://github.com/jencaoking/OpenMAIC-APP)
[![i18n](https://img.shields.io/badge/i18n-6%20languages-blue)](https://github.com/jencaoking/OpenMAIC-APP)

一句话 → 完整课堂。

</div>

---

## 目录

- [什么是 OpenMAIC？](#什么是-openmaic)
- [快速开始](#快速开始)
  - [环境要求](#环境要求)
  - [安装与运行](#安装与运行)
  - [配置 AI 服务商](#配置-ai-服务商)
  - [Docker 部署](#docker-部署)
- [功能特性](#功能特性)
- [项目架构](#项目架构)
- [开发指南](#开发指南)
- [部署](#部署)
- [环境变量](#环境变量)
- [测试](#测试)
- [参与贡献](#参与贡献)
- [许可证](#许可证)
- [致谢](#致谢)

---

## 什么是 OpenMAIC？

OpenMAIC 是一个开源的 AI 互动课堂平台。输入一个主题或上传一份文档，AI 教师和 AI 同学会自动构建完整的课堂 —— 包含幻灯片、测验、交互式模拟实验和实时讨论。

> 一句话 → 完整课堂。

无论是教师备课、学生自学，还是团队培训，OpenMAIC 都能把任何知识点快速转化为可交互、可对话、可导出的学习体验，并支持 Web、移动端、桌面端多端同步。

---

## 快速开始

### 环境要求

| 依赖 | 版本要求 |
|------|----------|
| Node.js | ≥ 20 |
| pnpm | ≥ 10 |

### 安装与运行

```bash
git clone https://github.com/jencaoking/OpenMAIC-APP.git
cd OpenMAIC-APP
pnpm install
cp .env.example .env.local
pnpm dev
```

启动后打开 **http://localhost:3000** 即可开始学习。

### 配置 AI 服务商

至少需要配置一个 LLM 提供商的 API Key，编辑 `.env.local`：

```env
OPENAI_API_KEY=sk-...
# 或
ANTHROPIC_API_KEY=sk-ant-...
# 或
GOOGLE_API_KEY=...
```

支持的服务商：OpenAI、Azure OpenAI、Anthropic、Google Gemini、DeepSeek、通义千问、Kimi、MiniMax、Grok、OpenRouter、豆包、腾讯混元、小米 MiMo、智谱 GLM、Ollama（本地）、Lemonade（本地）以及任何兼容 OpenAI API 的服务。

### Docker 部署

```bash
cp .env.example .env.local
docker compose up --build
```

---

## 功能特性

### 一键生成课堂

输入一个主题或上传文档，几分钟内自动生成：

| 能力 | 说明 |
|------|------|
| **幻灯片** | AI 语音讲解，配合聚光灯和激光笔效果 |
| **测验** | 交互式题目（单选 / 多选 / 填空），支持 AI 实时判分 |
| **交互式模拟** | 基于 HTML 的动手实验 |
| **PBL 项目** | 角色扮演与协作式项目学习 |

### 多智能体课堂

| 角色 | 职责 |
|------|------|
| **AI 教师** | 讲解幻灯片、绘制白板、引导讨论 |
| **AI 同学** | 提问、分享观点、展开辩论 |
| **你** | 随时参与 —— 提问、加入讨论，或静静旁听 |

### 语音对话

- **语音合成** — 10+ 个 TTS 服务商，支持自定义音色
- **语音识别** — 免提对话，与 AI 教师实时交流
- **音色克隆** — VoxCPM2 集成，生成个性化声音

### 导出功能

| 格式 | 说明 |
|------|------|
| PowerPoint (.pptx) | 可编辑幻灯片，含图片、图表和 LaTeX |
| 交互式 HTML | 自包含网页，含嵌入式模拟实验 |
| 课堂 ZIP | 完整包（结构 + 媒体），可备份或分享 |

### 跨平台支持

| 平台 | 技术栈 | 状态 |
|------|--------|------|
| **Web** | Next.js 16, React 19, Tailwind 4 | 完整功能 |
| **移动端** | Expo SDK 57, React Native 0.86 | 课堂生成 / 播放、Agent、语音、离线同步 |
| **桌面端** | Electron 43 | Web 应用封装 |
| **文档站** | Next.js + Fumadocs | 6 语言文档 |

---

## 项目架构

```
OpenMAIC/
├── app/                              # Next.js Web 端 (App Router)
│   ├── api/                          # 服务端 API (~25 个接口)
│   ├── classroom/[id]/               # 课堂播放器
│   └── page.tsx                      # 首页（生成输入）
│
├── apps/
│   └── expo/                         # Expo 移动端 (React Native)
│       └── src/
│           ├── app/                  # 应用入口与路由
│           ├── core/                 # 核心模块
│           │   ├── api/              # HTTP 客户端
│           │   ├── media/            # 图片压缩、多模态消息
│           │   ├── monitoring/       # Sentry 监控
│           │   ├── navigation/       # 深链接路由
│           │   ├── notifications/    # 推送通知、后台同步、小组件
│           │   ├── perf/             # 启动优化、懒加载
│           │   ├── security/         # 密钥存储、DB 加密
│           │   ├── store/            # 会话状态管理
│           │   └── voice/            # 语音引擎 (STT/TTS/VAD)
│           ├── db/                   # SQLite 数据库 + 同步
│           ├── features/
│           │   ├── classroom/        # ★ 课堂播放器 (完整移植)
│           │   │   ├── api/          # 生成 API、Agent API、声音解析
│           │   │   ├── components/   # 16 个 UI 组件
│           │   │   ├── hooks/        # 播放/生成编排
│           │   │   ├── layout/       # 横屏三栏布局
│           │   │   ├── store/        # Zustand 状态 (6 个 store)
│           │   │   └── types/        # Agent/Voice 类型定义
│           │   ├── slides/           # RN 幻灯片渲染器
│           │   │   ├── elements/     # 8 种元素渲染器
│           │   │   └── hooks/        # 缩放计算
│           │   ├── chat-flow/        # 聊天 + 语音模式
│           │   ├── quiz/             # 答题系统
│           │   ├── dsl/              # DSL 渲染
│           │   └── sessions/         # 会话管理
│           ├── shared/               # 共享组件/hooks (待填充)
│           └── types/                # 全局类型定义
│
├── electron/                         # Electron 桌面端封装 (185 行)
│
├── packages/
│   ├── @openmaic/dsl                 # DSL 类型与验证 (零依赖)
│   ├── @openmaic/core-engine         # 跨端渲染引擎
│   ├── @openmaic/renderer            # 幻灯片渲染器 (Web)
│   ├── @openmaic/storage             # 持久化层
│   ├── @openmaic/storage-types       # 存储类型契约
│   ├── @openmaic/importer            # PPTX 解析器
│   ├── maic-storage-server           # 存储服务 (Node.js)
│   ├── mathml2omml/                  # MathML 转换
│   ├── pptxgenjs/                    # PPTX 生成
│   └── docs/                         # 文档站
│
├── lib/                              # 核心业务逻辑 (Web)
├── components/                       # React UI 组件 (Web)
├── configs/                          # 共享常量
└── tests/                            # 单元测试与 E2E 测试
```

### 技术栈

| 类别 | 技术 |
|------|------|
| **Web** | Next.js 16, React 19, Tailwind 4, Zustand, Motion, shadcn/ui |
| **AI/LLM** | Vercel AI SDK, LangChain, LangGraph, CopilotKit, 14+ 提供商 |
| **移动端** | Expo SDK 57, React Native 0.86, Reanimated, SQLite, expo-av |
| **桌面端** | Electron 43, electron-builder |
| **数据库** | PostgreSQL 16, SQLite (移动端), IndexedDB (浏览器) |
| **测试** | Vitest, Playwright, Jest |
| **CI/CD** | GitHub Actions, EAS Build, semantic-release |

---

## 开发指南

### Web 端

```bash
pnpm dev          # http://localhost:3000
pnpm build        # 生产构建
pnpm test         # 单元测试
pnpm test:e2e     # E2E 测试 (Playwright)
```

### 移动端 (Expo)

```bash
cd apps/expo
pnpm start        # Expo 开发服务器
pnpm android      # Android 运行
pnpm ios          # iOS 运行
```

### 桌面端 (Electron)

```bash
pnpm prepare:electron
pnpm electron
```

---

## 部署

### Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjencaoking%2FOpenMAIC-APP&envDescription=Configure%20at%20least%20one%20LLM%20provider%20API%20key&project-name=openmaic&framework=nextjs)

### Docker

```bash
docker compose up --build
```

服务：PostgreSQL (5432)、Storage Server (3001)、Web App (3000)

### 移动端 (EAS Build)

```bash
cd apps/expo
eas build --profile production --platform android
```

---

## 环境变量

复制 `.env.example` 到 `.env.local`。关键变量：

```env
# AI 服务商（至少配置一个）
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=

# 语音合成
TTS_OPENAI_API_KEY=

# 数据库（多设备同步）
POSTGRES_USER=openmaic
POSTGRES_PASSWORD=openmaic_password
POSTGRES_DB=openmaic

# 可选：访问控制
ACCESS_CODE=your-secret-code
```

完整变量列表见 [`.env.example`](.env.example)（支持 30+ 个服务商）。

---

## 测试

```bash
pnpm test              # 单元测试 (Vitest)
pnpm test:e2e          # E2E 测试 (Playwright)
pnpm -w exec tsc --noEmit  # 类型检查
```

---

## 参与贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/my-feature`)
3. 使用 [Conventional Commits](https://www.conventionalcommits.org/) 提交
4. 推送并创建 Pull Request

### 代码规范

- TypeScript 严格模式（`verbatimModuleSyntax: true`）
- Prettier 格式化
- ESLint + Next.js 配置

---

## 许可证

本项目采用 **Custom Advanced Source-Available License v1.0（CASAL v1.0，版本 4.0，2026-07-21 发布，Copyright (C) 2026 Jinpeng Cao (jencao)）** —— 一种 **源码可见（source-available）、非 OSI 认证** 的商业许可证。完整条款见 [LICENCE](LICENCE)。

该许可证允许你查看、修改和重新分发源代码，但同时施加了若干限制与义务，主要包括：

- **强 Copyleft**：以分发、发布或 SaaS / 网络服务形式提供本软件（含修改版本）时，必须按本许可证（或实质等同的许可证）向所有用户公开完整源代码。
- **非竞争条款**：不得利用本软件或其衍生作品开发、推广或分发与版权持有人核心产品构成竞争的产品或服务。
- **AI / 机器学习训练限制**：不得使用本软件（含源代码、文档、注释、日志及相关数据）训练、微调、验证或开发任何 AI / ML / LLM 系统。
- **道德使用限制**：禁止用于非法监控、侵犯人权、军事或核相关等用途。
- **衍生作品命名**：修改并分发 / 托管衍生版本时，必须明确标注为修改版并采用可区分的名称。

如需在闭源、专有、竞争或 AI 训练等场景下使用本软件，须向版权持有人（jencao）获取单独的商业授权。

### 第三方组件

- `packages/mathml2omml` — [LGPL-3.0-or-later](packages/mathml2omml/LICENSE)
- `packages/pptxgenjs` — [MIT](packages/pptxgenjs/package.json)
- `packages/@openmaic/*` — 各自 LICENSE 文件

---

## 致谢

本项目 fork 自 [THU-MAIC/OpenMAIC](https://github.com/THU-MAIC/OpenMAIC)，原项目由清华大学 MAIC 团队开发。
