# OpenMAIC

> AI-powered interactive classroom. Turn any topic into a multi-agent learning experience.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-Try_It-brightgreen?style=flat-square)](https://open.maic.chat/)

<p align="center">
  <img src="assets/banner.png" alt="OpenMAIC" width="680"/>
</p>

---

## What is OpenMAIC?

OpenMAIC is an open-source platform that generates immersive, multi-agent classrooms from a simple text prompt. Describe what you want to learn — an AI teacher and AI students will build a complete lesson with slides, quizzes, interactive simulations, and real-time discussion.

**One prompt → Full classroom.**

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 10

### Install & Run

```bash
git clone https://github.com/jencaoking/OpenMAIC-APP.git
cd OpenMAIC-APP
pnpm install
cp .env.example .env.local
pnpm dev
```

Open **http://localhost:3000** and start learning.

### Configure an LLM Provider

At least one API key is required. Edit `.env.local`:

```env
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or
GOOGLE_API_KEY=...
```

**Supported providers:** OpenAI, Azure OpenAI, Anthropic, Google Gemini, DeepSeek, Qwen, Kimi, MiniMax, Grok, OpenRouter, Doubao, Tencent Hunyuan, Xiaomi MiMo, GLM, Ollama (local), Lemonade (local), and any OpenAI-compatible API.

### Docker

```bash
cp .env.example .env.local
docker compose up --build
```

---

## Features

### Generate Classrooms

Type a topic or upload a document. Within minutes, OpenMAIC generates:

- **Slides** — AI-narrated presentations with spotlight and laser pointer effects
- **Quizzes** — Interactive questions (multiple choice, checkboxes, fill-in-the-blank) with AI grading
- **Interactive Simulations** — HTML-based experiments for hands-on learning
- **PBL Projects** — Project-based learning with role-playing and collaboration

### Multi-Agent Classroom

- **AI Teacher** narrates slides, draws on the whiteboard, and leads discussions
- **AI Students** ask questions, share perspectives, and debate topics
- **You** participate anytime — ask questions, join discussions, or just watch

### Voice & Speech

- **Text-to-Speech** — 10+ TTS providers with custom voice profiles
- **Speech-to-Text** — Talk to the AI teacher hands-free
- **Voice Cloning** — VoxCPM2 integration for custom voice synthesis

### Export

| Format | Description |
|--------|-------------|
| PowerPoint (.pptx) | Editable slides with images, charts, and LaTeX |
| Interactive HTML | Self-contained webpage with embedded simulations |
| Classroom ZIP | Complete package (structure + media) for backup or sharing |

### Cross-Platform

| Platform | Stack | Status |
|----------|-------|--------|
| **Web** | Next.js 16, React 19, Tailwind 4 | Full feature set |
| **Mobile** | Expo SDK 57, React Native 0.86 | Core features, offline sync |
| **Desktop** | Electron 43 | Wraps the web app |

---

## Architecture

```
OpenMAIC/
├── app/                     # Next.js Web (App Router)
│   ├── api/                 # Server API routes (~25 endpoints)
│   ├── classroom/[id]/      # Classroom player
│   └── page.tsx             # Home (generation input)
│
├── apps/expo/               # Expo Mobile (React Native)
├── electron/                # Electron Desktop wrapper
│
├── packages/
│   ├── @openmaic/dsl        # DSL types & validation
│   ├── @openmaic/core-engine # Cross-platform rendering engine
│   ├── @openmaic/renderer   # Slide renderer (Web)
│   ├── @openmaic/storage    # Persistence layer
│   └── @openmaic/importer   # PPTX parser
│
├── lib/                     # Core business logic
├── components/              # React UI components
└── tests/                   # Unit & E2E tests
```

### Key Libraries

| Category | Technologies |
|----------|-------------|
| **Web** | Next.js 16, React 19, Tailwind 4, Zustand, Motion |
| **AI/LLM** | Vercel AI SDK, LangChain, LangGraph, CopilotKit |
| **Mobile** | Expo SDK 57, React Native 0.86, Reanimated, SQLite |
| **Desktop** | Electron 43, electron-builder |
| **Database** | PostgreSQL 16, SQLite (mobile), IndexedDB (browser) |
| **Testing** | Vitest, Playwright, Jest |

---

## Development

### Web

```bash
pnpm dev          # http://localhost:3000
pnpm build        # Production build
pnpm test         # Unit tests
pnpm test:e2e     # E2E tests (Playwright)
```

### Mobile (Expo)

```bash
cd apps/expo
pnpm start        # Expo dev server
pnpm android      # Run on Android
pnpm ios          # Run on iOS
```

### Desktop (Electron)

```bash
pnpm prepare:electron
pnpm electron
```

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjencaoking%2FOpenMAIC-APP&envDescription=Configure%20at%20least%20one%20LLM%20provider%20API%20key&project-name=openmaic&framework=nextjs)

### Docker

```bash
docker compose up --build
```

Services: PostgreSQL (5432), Storage Server (3001), Web App (3000)

### Mobile (EAS Build)

```bash
cd apps/expo
eas build --profile production --platform android
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:

```env
# LLM (at least one required)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=

# TTS
TTS_OPENAI_API_KEY=

# Database (for multi-device sync)
POSTGRES_USER=openmaic
POSTGRES_PASSWORD=openmaic_password
POSTGRES_DB=openmaic

# Optional: Access control
ACCESS_CODE=your-secret-code
```

See [`.env.example`](.env.example) for the full list (30+ providers supported).

---

## Testing

```bash
pnpm test              # Unit tests (Vitest)
pnpm test:e2e          # E2E tests (Playwright)
pnpm -w exec tsc --noEmit  # Type checking
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/)
4. Push and open a Pull Request

### Code Standards

- TypeScript strict mode
- Prettier formatting
- ESLint with Next.js config

---

## License

MIT License — see [LICENSE](LICENSE) for details.

### Third-Party Packages

- `packages/mathml2omml` — [LGPL-3.0-or-later](packages/mathml2omml/LICENSE)
- `packages/pptxgenjs` — [MIT](packages/pptxgenjs/package.json)
- `packages/@openmaic/*` — See individual LICENSE files

### Acknowledgments

This project is a fork of [THU-MAIC/OpenMAIC](https://github.com/THU-MAIC/OpenMAIC). Original work by the MAIC team at Tsinghua University.
