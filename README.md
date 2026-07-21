# OpenMAIC

> AI 驱动的互动课堂。一句话生成沉浸式多智能体学习体验。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-在线体验-brightgreen?style=flat-square)](https://open.maic.chat/)

<p align="center">
  <img src="assets/banner.png" alt="OpenMAIC" width="680"/>
</p>

---

## 什么是 OpenMAIC？

OpenMAIC 是一个开源的 AI 互动课堂平台。输入一个主题或上传一份文档，AI 教师和 AI 同学会自动构建完整的课堂——包含幻灯片、测验、交互式模拟实验和实时讨论。

**一句话 → 完整课堂。**

---

## 快速开始

### 环境要求

- Node.js ≥ 20
- pnpm ≥ 10

### 安装运行

```bash
git clone https://github.com/jencaoking/OpenMAIC-APP.git
cd OpenMAIC-APP
pnpm install
cp .env.example .env.local
pnpm dev
```

打开 **http://localhost:3000** 开始学习。

### 配置 AI 服务商

至少需要一个 API Key。编辑 `.env.local`：

```env
OPENAI_API_KEY=sk-...
# 或
ANTHROPIC_API_KEY=sk-ant-...
# 或
GOOGLE_API_KEY=...
```

**支持的服务商：** OpenAI、Azure OpenAI、Anthropic、Google Gemini、DeepSeek、通义千问、Kimi、MiniMax、Grok、OpenRouter、豆包、腾讯混元、小米 MiMo、智谱 GLM、Ollama（本地）、Lemonade（本地）以及任何兼容 OpenAI API 的服务。

### Docker 部署

```bash
cp .env.example .env.local
docker compose up --build
```

---

## 功能特性

### 一键生成课堂

输入一个主题或上传文档，几分钟内自动生成：

- **幻灯片** — AI 语音讲解，配合聚光灯和激光笔效果
- **测验** — 交互式题目（单选/多选/填空），支持 AI 实时判分
- **交互式模拟** — 基于 HTML 的动手实验
- **PBL 项目** — 角色扮演与协作式项目学习

### 多智能体课堂

- **AI 教师** 讲解幻灯片、绘制白板、引导讨论
- **AI 同学** 提问、分享观点、展开辩论
- **你** 随时参与——提问、加入讨论，或静静旁听

### 语音对话

- **语音合成** — 10+ 个 TTS 服务商，支持自定义音色
- **语音识别** — 免提对话，与 AI 教师实时交流
- **音色克隆** — VoxCPM2 集成，生成个性化声音

### 导出功能

| 格式 | 说明 |
|------|------|
| PowerPoint (.pptx) | 可编辑幻灯片，含图片、图表和 LaTeX |
| 交互式 HTML | 自包含网页，含嵌入式模拟实验 |
| 课堂 ZIP | 完整包（结构+媒体），可备份或分享 |

### 跨平台支持

| 平台 | 技术栈 | 状态 |
|------|--------|------|
| **Web** | Next.js 16, React 19, Tailwind 4 | 完整功能 |
| **移动端** | Expo SDK 57, React Native 0.86 | 核心功能，离线同步 |
| **桌面端** | Electron 43 | Web 应用封装 |

---

## 项目架构

```
OpenMAIC/
├── app/                     # Next.js Web 端 (App Router)
│   ├── api/                 # 服务端 API (~25 个接口)
│   ├── classroom/[id]/      # 课堂播放器
│   └── page.tsx             # 首页（生成输入）
│
├── apps/expo/               # Expo 移动端 (React Native)
├── electron/                # Electron 桌面端封装
│
├── packages/
│   ├── @openmaic/dsl        # DSL 类型与验证
│   ├── @openmaic/core-engine # 跨端渲染引擎
│   ├── @openmaic/renderer   # 幻灯片渲染器 (Web)
│   ├── @openmaic/storage    # 持久化层
│   └── @openmaic/importer   # PPTX 解析器
│
├── lib/                     # 核心业务逻辑
├── components/              # React UI 组件
└── tests/                   # 单元测试与 E2E 测试
```

### 技术栈

| 类别 | 技术 |
|------|------|
| **Web** | Next.js 16, React 19, Tailwind 4, Zustand, Motion |
| **AI/LLM** | Vercel AI SDK, LangChain, LangGraph, CopilotKit |
| **移动端** | Expo SDK 57, React Native 0.86, Reanimated, SQLite |
| **桌面端** | Electron 43, electron-builder |
| **数据库** | PostgreSQL 16, SQLite (移动端), IndexedDB (浏览器) |
| **测试** | Vitest, Playwright, Jest |

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

- TypeScript 严格模式
- Prettier 格式化
- ESLint + Next.js 配置

---

## 许可证

MIT 协议 — 详见 [LICENSE](LICENSE)。

### 第三方组件

- `packages/mathml2omml` — [LGPL-3.0-or-later](packages/mathml2omml/LICENSE)
- `packages/pptxgenjs` — [MIT](packages/pptxgenjs/package.json)
- `packages/@openmaic/*` — 各自 LICENSE 文件

### 致谢

本项目 fork 自 [THU-MAIC/OpenMAIC](https://github.com/THU-MAIC/OpenMAIC)，原项目由清华大学 MAIC 团队开发。
