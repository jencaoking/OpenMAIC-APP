<p align="center">
  <img src="assets/banner.png" alt="OpenMAIC Banner" width="680"/>
</p>

<p align="center">
  一键生成沉浸式多智能体互动课堂。
</p>

<p align="center">
  <a href="https://jcst.ict.ac.cn/en/article/doi/10.1007/s11390-025-6000-0"><img src="https://img.shields.io/badge/Paper-JCST'26-blue?style=flat-square" alt="Paper"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License: MIT"/></a>
  <a href="https://open.maic.chat/"><img src="https://img.shields.io/badge/Demo-Live-brightgreen?style=flat-square" alt="Live Demo"/></a>
  <a href="https://github.com/THU-MAIC/OpenMAIC/stargazers"><img src="https://img.shields.io/github/stars/THU-MAIC/OpenMAIC?style=flat-square" alt="Stars"/></a>
  <br/>
  <a href="https://discord.gg/p8Pf2r3SaG"><img src="https://img.shields.io/badge/Discord-Join_Community-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"/></a>
  &nbsp;
  <a href="community/feishu.md"><img src="https://img.shields.io/badge/Feishu-飞书交流群-00D6B9?style=for-the-badge&logo=bytedance&logoColor=white" alt="飞书群"/></a>
  <br/>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Expo-57-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/Electron-43-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron"/>
  <img src="https://img.shields.io/badge/LangGraph-1.1-purple?style=flat-square" alt="LangGraph"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README-zh.md">简体中文</a>
  <br/>
  <a href="https://open.maic.chat/">在线体验</a> · <a href="#-快速开始">快速开始</a> · <a href="#lemonade-local-ai">Lemonade</a> · <a href="#-功能特性">功能特性</a> · <a href="#-跨平台架构">跨平台架构</a> · <a href="#-使用场景">使用场景</a> · <a href="#-openclaw-集成">OpenClaw</a>
</p>


## 🗞️ 动态

- **2026-06-28** — [v0.3.0 发布！](https://github.com/THU-MAIC/OpenMAIC/releases/tag/v0.3.0) 项目式学习（PBL）v2 与课堂界面；"Edit with AI"专业模式编辑智能体；`@openmaic/*` SDK 系列（DSL/渲染器/导入器）发布至 npm；可选的分阶段模型路由；新增 GLM-5.2 / Kimi K2.7 Code / Qwen3.7 Plus·Max 等模型；职业学习任务引擎；新增韩语（ko-KR）；并将开源协议由 AGPL-3.0 调整为 MIT。查看[更新日志](CHANGELOG.md)。
- **2026-06-02** — [v0.2.2 发布！](https://github.com/THU-MAIC/OpenMAIC/releases/tag/v0.2.2) MAIC Editor（v0）专业模式，可轻量编辑生成的幻灯片；生成前可编辑大纲；交互课堂离线导出；新增 Brave/百度/博查/MiniMax 搜索与 Azure STT；新增 Claude Opus 4.8 / MiniMax M3 / Gemini 3.5 Flash 等模型；新增繁体中文（zh-TW）与巴西葡萄牙语（pt-BR）。查看[更新日志](CHANGELOG.md)。
- **2026-04-26** — [v0.2.1 发布！](https://github.com/THU-MAIC/OpenMAIC/releases/tag/v0.2.1) 接入 [VoxCPM2](https://github.com/OpenBMB/VoxCPM) TTS，支持音色克隆与自动生成音色；新增按模型思考配置；新增课程完成页与作答状态持久化；新增 DeepSeek-V4 / GPT-5.5 / GPT-Image-2 / 小米 MiMo / Hy3 等最新发布的模型。查看[更新日志](CHANGELOG.md)。
- **2026-04-20** — **v0.2.0 发布！** 深度交互模式 — 3D 可视化、模拟实验、游戏、思维导图、在线编程，动手学习新体验。详见[功能特性](#-功能特性)。

---

## 📖 项目简介

**OpenMAIC**（Open Multi-Agent Interactive Classroom）是一个开源的 AI 互动课堂平台，能够将任何主题或文档转化为丰富的互动学习体验。基于多智能体协作引擎，它可以自动生成演示幻灯片、测验、交互式模拟实验和项目制学习活动——由 AI 教师和 AI 同学进行语音讲解、白板绘图，并与你展开实时讨论。

### 跨平台支持

OpenMAIC 采用 **pnpm workspace Monorepo** 架构，支持三大平台：

| 平台 | 技术栈 | 位置 | 特点 |
|------|--------|------|------|
| **Web** | Next.js 16 (App Router) | 根目录 `app/` | 完整功能、实时协作 |
| **Mobile** | Expo SDK 57 (React Native) | `apps/expo/` | 离线支持、本地存储 |
| **Desktop** | Electron 43 | `electron/` | 桌面级体验、系统集成 |

### 核心亮点

- **一键生成课堂** — 描述一个主题或附上学习材料，AI 几分钟内构建完整课堂
- **多智能体课堂** — AI 老师和智能体同学实时授课、讨论、互动
- **丰富的场景类型** — 幻灯片、测验、HTML 交互式模拟、项目制学习（PBL）
- **白板 & 语音** — 智能体实时绘制图表、书写公式、语音讲解
- **灵活导出** — 下载可编辑的 `.pptx` 幻灯片或交互式 `.html` 网页
- **跨端同步** — 课堂数据在 Web、Mobile、Desktop 之间无缝同步
- **[OpenClaw 集成](#-openclaw-集成)** — 通过 AI 助手在飞书、Slack、Telegram 等 20+ 聊天应用中直接生成课堂

---

## 🏗️ 跨平台架构

### Monorepo 结构

```
OpenMAIC/
├── app/                         # Next.js Web 端（App Router）
│   ├── api/                     # 服务端 API 路由（约 18 个端点）
│   ├── classroom/[id]/          # 课堂回放页面
│   └── page.tsx                 # 首页（生成输入）
│
├── apps/
│   └── expo/                    # Expo Mobile 端（React Native）
│       ├── src/
│       │   ├── app/             # 应用入口与导航
│       │   ├── core/            # 核心引擎适配（store, renderer）
│       │   ├── db/              # SQLite 本地数据库
│       │   └── types/           # 类型定义
│       ├── app.json             # Expo 配置
│       └── eas.json             # EAS Build 配置
│
├── electron/                    # Electron 桌面端
│   ├── main.js                  # 主进程
│   └── preload.js               # 预加载脚本
│
├── packages/
│   ├── @openmaic/
│   │   ├── core-engine/         # 🌟 核心 DSL 引擎（跨端共享）
│   │   ├── dsl/                 # DSL 定义和验证
│   │   ├── renderer/            # 幻灯片渲染器组件（Web 端）
│   │   ├── storage/             # 存储层运行时（Web/Node）
│   │   ├── storage-types/       # 🌟 纯类型契约（跨端共享，零运行时）
│   │   └── importer/            # PPTX 导入导出
│   ├── mathml2omml/             # MathML → Office Math 转换
│   ├── pptxgenjs/               # 定制化 PowerPoint 生成
│   └── docs/                    # 文档网站
│
├── lib/                         # 核心业务逻辑（Web 端）
├── components/                  # React UI 组件（Web 端）
├── configs/                     # 共享常量
└── tests/                       # 单元测试
```

### 跨端类型安全

| 包 | 用途 | 跨端支持 |
|----|------|----------|
| `@openmaic/storage-types` | 纯 TypeScript 接口/类型定义 | ✅ Web + Mobile + Desktop |
| `@openmaic/core-engine` | 核心 DSL 渲染、状态管理 | ✅ Web + Mobile + Desktop |
| `@openmaic/dsl` | DSL schema 和验证逻辑 | ✅ Web + Mobile + Desktop |
| `@openmaic/storage` | 存储层运行时（含 Node/Browser 依赖） | ❌ 仅 Web/Node |
| `@openmaic/renderer` | 幻灯片渲染器（含 React DOM 依赖） | ❌ 仅 Web |

> **架构规则**：Expo/Mobile 端**绝对禁止**直接引用 `@openmaic/storage`（含 Node/Browser 依赖），只能使用 `@openmaic/storage-types`（纯 TS 接口/类型，零运行时依赖）。

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20.9.0
- **pnpm** >= 10

### 1. 克隆 & 安装

```bash
git clone https://github.com/THU-MAIC/OpenMAIC.git
cd OpenMAIC
pnpm install
```

### 2. 配置

```bash
cp .env.example .env.local
```

至少填写一个 LLM 服务商的 API Key：

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

支持的服务商：**OpenAI**、**Azure OpenAI**、**Anthropic**、**Google Gemini**、**DeepSeek**、**通义千问 Qwen**、**Kimi**、**MiniMax**、**Grok (xAI)**、**OpenRouter**、**豆包**、**腾讯混元**、**小米 MiMo**、**智谱 GLM**、**Ollama**（本地）、**Lemonade**（本地 LLM）以及任何兼容 OpenAI API 的服务。

也可以通过 `server-providers.yml` 配置服务商：

```yaml
providers:
  openai:
    apiKey: sk-...
  azure:
    apiKey: ...
    baseUrl: https://YOUR-RESOURCE.openai.azure.com/openai
    models:
      - YOUR-DEPLOYMENT-NAME
  anthropic:
    apiKey: sk-ant-...
```

<a id="lemonade-local-ai"></a>

### 可选：Lemonade（本地 AI 服务商）

OpenMAIC 支持将 Lemonade 作为本地 OpenAI 兼容服务商使用，可用于 LLM、图像生成、TTS 和 ASR，不需要 API Key。

```env
LEMONADE_BASE_URL=http://localhost:13305/v1
TTS_LEMONADE_BASE_URL=http://localhost:13305/v1
ASR_LEMONADE_BASE_URL=http://localhost:13305/v1
IMAGE_LEMONADE_BASE_URL=http://localhost:13305/v1
```

### MiniMax 快速示例

```env
MINIMAX_API_KEY=...
MINIMAX_BASE_URL=https://api.minimaxi.com/anthropic/v1
DEFAULT_MODEL=minimax:MiniMax-M2.7-highspeed

TTS_MINIMAX_API_KEY=...
TTS_MINIMAX_BASE_URL=https://api.minimaxi.com

IMAGE_MINIMAX_API_KEY=...
IMAGE_MINIMAX_BASE_URL=https://api.minimaxi.com

IMAGE_OPENAI_API_KEY=...
IMAGE_OPENAI_BASE_URL=https://api.openai.com/v1

VIDEO_MINIMAX_API_KEY=...
VIDEO_MINIMAX_BASE_URL=https://api.minimaxi.com
```

### 小米 MiMo Token Plan 快速示例

```env
MIMO_API_KEY=tp-...
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
DEFAULT_MODEL=xiaomi:mimo-v2.5-pro
```

### 智谱 GLM 快速示例

```env
GLM_API_KEY=...
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
DEFAULT_MODEL=glm:glm-5.1
```

### 3. 启动各平台

#### Web 端

```bash
pnpm dev
```

打开 **http://localhost:3000** 开始学习！

#### Mobile 端（Expo）

```bash
cd apps/expo
pnpm start
```

使用 Expo Go 扫描二维码，或运行：
- iOS: `pnpm ios`
- Android: `pnpm android`

#### Desktop 端（Electron）

```bash
pnpm prepare:electron
pnpm electron
```

### 4. 生产环境构建

#### Web 端

```bash
pnpm build && pnpm start
```

#### Mobile 端（EAS Build）

```bash
cd apps/expo
pnpm eas:build:prod
```

#### Desktop 端（Windows）

```bash
pnpm dist:win
```

### 可选：ACCESS_CODE（共享部署）

为部署添加站点级密码保护：

```env
ACCESS_CODE=your-secret-code
```

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTHU-MAIC%2FOpenMAIC&envDescription=Configure%20at%20least%20one%20LLM%20provider%20API%20key%20(e.g.%20OPENAI_API_KEY%2C%20ANTHROPIC_API_KEY).%20All%20providers%20are%20optional.&envLink=https%3A%2F%2Fgithub.com%2FTHU-MAIC%2FOpenMAIC%2Fblob%2Fmain%2F.env.example&project-name=openmaic&framework=nextjs)

### Docker 部署

```bash
cp .env.example .env.local
docker compose up --build
```

### 可选：MinerU（增强文档解析）

[MinerU](https://github.com/opendatalab/MinerU) 提供更强的表格、公式和 OCR 解析能力。在 `.env.local` 中设置 `PDF_MINERU_BASE_URL`（如需认证则同时设置 `PDF_MINERU_API_KEY`）。

### 可选：VoxCPM2（自托管 TTS，支持音色克隆）

[VoxCPM2](https://github.com/OpenBMB/VoxCPM) 是 OpenBMB 开源的 TTS 模型，支持声音克隆。

```env
TTS_VOXCPM_BASE_URL=http://localhost:8000/v1
```

---

## ✨ 功能特性

### 深度交互模式

**被动听讲？❌ 动手探索！✅**

| 交互类型 | 描述 |
|----------|------|
| **🌐 3D 可视化** | 三维可视化呈现，让抽象结构更直观 |
| **⚙️ 模拟实验** | 流程模拟和实验环境，观察动态变化和结果 |
| **🎮 游戏** | 知识小游戏，通过交互挑战加深理解和记忆 |
| **🧭 思维导图** | 结构化知识组织，帮助学习者建立整体概念框架 |
| **💻 在线编程** | 浏览器内编码和即时运行，边写边学边迭代 |

### 课堂组件

| 组件 | 描述 |
|------|------|
| **🎓 幻灯片（Slides）** | AI 老师配合聚光灯和激光笔动作进行语音讲解 |
| **🧪 测验（Quiz）** | 交互式测验（单选/多选/简答），支持 AI 实时判分和反馈 |
| **🔬 交互式模拟（Interactive）** | 基于 HTML 的交互实验，用于可视化、动手学习 |
| **🏗️ 项目制学习（PBL）** | 选择一个角色，与 AI 智能体协作完成结构化项目 |

### 多智能体互动

- **课堂讨论** — 智能体主动发起讨论话题，你可以随时加入或被点名互动
- **圆桌辩论** — 多个不同人设的智能体围绕话题展开讨论，配合白板讲解
- **自由问答** — 随时提问，AI 老师通过幻灯片、图表或白板进行解答
- **白板** — AI 智能体在共享白板上实时绘图

### <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/openclaw.png" height="22" align="top"/> OpenClaw 集成

OpenMAIC 集成了 [OpenClaw](https://github.com/openclaw/openclaw)——一个连接你日常使用的消息平台（飞书、Slack、Discord、Telegram、WhatsApp 等）的个人 AI 助手。通过这个集成，你可以**直接在聊天应用中生成和查看互动课堂**，无需碰命令行。

只需告诉你的 OpenClaw 助手你想学什么——剩下的它来搞定：
- **托管模式** — 在 [open.maic.chat](https://open.maic.chat/) 获取访问码，保存到配置文件，即可直接生成课堂——无需本地部署
- **本地部署模式** — clone、安装依赖、配置 API Key、启动服务——Skill 逐步引导你完成
- **跟踪进度** — 自动轮询异步生成任务，完成后把链接发给你

已上架 ClawHub — 一行命令安装：

```bash
clawhub install openmaic
```

### 导出

| 格式 | 说明 |
|------|------|
| **PowerPoint (.pptx)** | 可编辑的幻灯片，包含图片、图表和 LaTeX 公式 |
| **交互式 HTML** | 自包含的网页，包含交互式模拟实验 |
| **课堂 ZIP** | 完整课堂导出（课程结构 + 媒体文件），可备份或分享 |

**离线 / 内网课堂：** 导出课堂（`.maic.zip`）或资源包时，OpenMAIC 会把互动场景引用的外部资源（KaTeX、Three.js 含 `three/addons`、Tailwind CDN、Google Fonts、图片）以 `data:` URI 形式内联进导出的 HTML。导出的课程在导入到内网/离线实例后即可完全离线播放。

### 更多功能

- **语音合成（TTS）** — 多种语音服务商，支持自定义音色和音色克隆
- **语音识别** — 通过麦克风与 AI 老师对话
- **网络搜索** — 智能体在课堂中搜索网络获取最新信息
- **国际化** — 界面支持 8 种语言：简体中文、繁体中文、英文、日文、俄文、阿拉伯文、葡萄牙文（巴西）、韩文
- **暗色模式** — 深夜学习更护眼

---

## 💡 使用场景

- **零基础文科生，30 分钟学会 Python**
- **如何上手阿瓦隆桌游**
- **分析一下智谱和 MiniMax 的股价**
- **DeepSeek 最新论文解析**

---

## 🧪 测试

### 单元测试

```bash
pnpm test
```

### E2E 测试（Web）

```bash
pnpm test:e2e
```

### 类型检查

```bash
pnpm -w exec tsc --noEmit
cd apps/expo && pnpm typecheck
```

---

## 🤝 参与贡献

### 核心架构

- **生成流水线** (`lib/generation/`) — 两阶段：大纲生成 → 场景内容生成
- **多智能体编排** (`lib/orchestration/`) — 基于 LangGraph 的状态机，管理智能体轮次和讨论
- **回放引擎** (`lib/playback/`) — 驱动课堂回放和实时互动的状态机
- **核心引擎** (`packages/@openmaic/core-engine/`) — 跨端共享的 DSL 渲染和状态管理

### 贡献流程

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

### 代码规范

- **TypeScript**：严格模式 + `verbatimModuleSyntax: true`
- **提交规范**：Conventional Commits
- **代码格式化**：Prettier

---

## 💼 商业合作

本项目基于 MIT 协议开源，可免费商用。商业合作或共建请联系：**thu_maic@mail.tsinghua.edu.cn**

---

## 📝 引用

如果 OpenMAIC 对您的研究有帮助，请考虑引用：

```bibtex
@Article{JCST-2509-16000,
  title = {From MOOC to MAIC: Reimagine Online Teaching and Learning through LLM-driven Agents},
  journal = {Journal of Computer Science and Technology},
  volume = {},
  number = {},
  pages = {},
  year = {2026},
  issn = {1000-9000(Print) /1860-4749(Online)},
  doi = {10.1007/s11390-025-6000-0},
  url = {https://jcst.ict.ac.cn/en/article/doi/10.1007/s11390-025-6000-0},
  author = {Ji-Fan Yu and Daniel Zhang-Li and Zhe-Yuan Zhang and Yu-Cheng Wang and Hao-Xuan Li and Joy Jia Yin Lim and Zhan-Xin Hao and Shang-Qing Tu and Lu Zhang and Xu-Sheng Dai and Jian-Xiao Jiang and Shen Yang and Fei Qin and Ze-Kun Li and Xin Cong and Bin Xu and Lei Hou and Man-Li Li and Juan-Zi Li and Hui-Qin Liu and Yu Zhang and Zhi-Yuan Liu and Mao-Song Sun}
}
```

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=THU-MAIC/OpenMAIC&type=Date)](https://star-history.com/#THU-MAIC/OpenMAIC&Date)

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

### 第三方组件

- `packages/mathml2omml` —— [LGPL-3.0-or-later](packages/mathml2omml/LICENSE)
- `packages/pptxgenjs` —— [MIT](packages/pptxgenjs/package.json)（第三方）
- `packages/@openmaic/*` —— 各自保留其 LICENSE 文件中的协议