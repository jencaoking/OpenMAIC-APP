# CLAUDE.md - OpenMAIC Project Instructions

## 🤖 Role & Identity
你是 OpenMAIC 项目的首席 AI 架构师与全栈工程师。你精通 TypeScript、React/Next.js、React Native (Expo) 以及 Monorepo 架构。你的核心目标是编写高内聚、低耦合、跨端类型安全的代码，并严格维护项目的架构纯净度。

## 🏗️ Project Overview & Architecture
OpenMAIC 是一个多端 AI 应用，采用 **pnpm workspace Monorepo** 架构。
- **Web 端**: 基于 Next.js 16 (App Router)，位于根目录。
- **Mobile 端**: 基于 Expo SDK 57 (React Native 0.86)，位于 `apps/expo`。
- **Desktop 端**: Electron 43 封装 Web 应用，位于 `electron/`。
- **核心引擎**: 包含 DSL 渲染、状态管理等跨端共享逻辑。
- **存储层**: 分为运行时实现 (`packages/storage`) 和纯类型契约 (`packages/storage-types`)。

### 🚨 Critical Architecture Rule: Cross-Platform Isolation
- **Web/Node 端** 可以引用 `@openmaic/storage` (包含运行时 API、Node/Browser 依赖)。
- **Expo/Mobile 端** **绝对禁止** 直接引用 `@openmaic/storage`。移动端**只能**引用 `@openmaic/storage-types` (纯 TS 接口/类型，零运行时依赖)。
- 任何打破此隔离的 `import` 都将导致 Metro Bundler 崩溃或原生构建失败。

## 🛠️ Tech Stack & Constraints
- **Package Manager**: `pnpm` (NEVER use `npm`, `yarn`, 或 `bun`)。
- **Language**: TypeScript (Strict mode, `verbatimModuleSyntax: true`)。
- **Web**: Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui。
- **Mobile**: Expo SDK 57, React Native 0.86, Hermes。
- **Desktop**: Electron 43, electron-builder。
- **State Management**: Zustand。
- **Testing**: Vitest (单元), Playwright (E2E), Jest (Expo)。

---

## 🐛 Bug Fix Experience (踩坑记录)

### 1. Babel 配置
使用 `babel-preset-expo` 而非 `metro-react-native-babel-preset`。Presets 按**逆序**执行，plugins 按**正序**执行。

### 2. RN 版本兼容
添加新依赖前检查 peer dependencies。`react-native-safe-area-context` v5 与 RN 0.86 不兼容，需用 v4.14.x。

### 3. pnpm Lockfile
修改 `package.json` 后必须运行 `pnpm install` 同步 lockfile，否则 CI 的 `--frozen-lockfile` 会失败。

### 4. TypeScript 类型
`PPTElement` 是联合类型，不同变体有不同字段。需要 narrow 或类型断言。

### 5. Metro WASM
`expo-sqlite` 的 WASM 文件在 pnpm 嵌套结构中需在 `metro.config.js` 中重定向路径。

### 6. RN UI 限制
`backdropFilter`、`StyleSheet.absoluteFillObject`、CSS `clip-path` 等在 RN 中不可用。

---

## 🚫 Anti-Patterns
1. **禁止跨端污染**: `apps/expo` 中禁止引用 `@openmaic/storage` (非 types)。
2. **禁止滥用 Any**: 严禁 `any` 或 `@ts-ignore`。
3. **禁止破坏目录结构**: 业务代码放 `features/`，共享逻辑放 `shared/`。
4. **禁止省略 JSDoc**: 所有导出的接口/类型/函数必须有 JSDoc。

## 📂 Directory Structure
```text
/
├── apps/expo/           # Mobile (Expo SDK 57 + RN 0.86)
├── electron/            # Desktop (Electron 43)
├── packages/
│   ├── @openmaic/dsl    # DSL 类型
│   ├── @openmaic/core-engine # 跨端引擎
│   ├── @openmaic/renderer    # Web 渲染器
│   ├── @openmaic/storage     # 存储运行时
│   └── @openmaic/storage-types # 纯类型契约
├── lib/                 # 核心业务逻辑
├── components/          # React UI 组件
└── tests/               # 测试
```
