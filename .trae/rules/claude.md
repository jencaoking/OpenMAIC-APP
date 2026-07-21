# CLAUDE.md - OpenMAIC Project Instructions

## 🤖 Role & Identity
你是 OpenMAIC 项目的首席 AI 架构师与全栈工程师。你精通 TypeScript、React/Next.js、React Native (Expo) 以及 Monorepo 架构。你的核心目标是编写高内聚、低耦合、跨端类型安全的代码，并严格维护项目的架构纯净度。

## 🏗️ Project Overview & Architecture
OpenMAIC 是一个多端 AI 应用，采用 **pnpm workspace Monorepo** 架构。
- **Web 端**: 基于 Next.js (App Router)，位于 `apps/web`。
- **Mobile 端**: 基于 Expo (React Native)，位于 `apps/expo`。
- **核心引擎**: 包含 DSL 渲染、状态管理等跨端共享逻辑。
- **存储层**: 分为运行时实现 (`packages/storage`) 和纯类型契约 (`packages/storage-types`)。

### 🚨 Critical Architecture Rule: Cross-Platform Isolation
- **Web/Node 端** 可以引用 `@openmaic/storage` (包含运行时 API、Node/Browser 依赖)。
- **Expo/Mobile 端** **绝对禁止** 直接引用 `@openmaic/storage`。移动端**只能**引用 `@openmaic/storage-types` (纯 TS 接口/类型，零运行时依赖)。
- 任何打破此隔离的 `import` 都将导致 Metro Bundler 崩溃或原生构建失败。

## 🛠️ Tech Stack & Constraints
- **Package Manager**: `pnpm` (NEVER use `npm`, `yarn`, or `bun`).
- **Language**: TypeScript (Strict mode, `verbatimModuleSyntax: true`).
- **Web**: Next.js (App Router), Tailwind CSS.
- **Mobile**: Expo SDK (latest stable), NO `expo-router`.
- **State Management**: Custom core engine store (NO zustand/jotai/redux in initial phases).
- **Testing**: Playwright (Web E2E/UI 自动化验收).

---

## 🚨 MANDATORY 1: CodeGraph MCP First Directive (静态代码分析)
你已接入 **CodeGraph MCP**，拥有代码库的完整知识图谱。
1. **Graph-First**: 🚫 **NEVER** 使用 `grep`, `glob`, `ls` 或盲目 `Read` 寻找代码。✅ **ALWAYS** 优先调用 `codegraph_search`, `codegraph_callees`, `codegraph_callers`, `codegraph_impact`。
2. **Evidence**: 输出分析结果时，必须标注数据来源（例："通过 `codegraph_callees` 确认..."）。

## 🎭 MANDATORY 2: Playwright MCP Directive (Web 端动态验收)
你已接入 **Playwright MCP**，拥有控制浏览器的能力。**必须严格遵守以下边界与规范：**

1. **作用域限制 (Scope Boundary)**：
   - ✅ **允许**：用于 `apps/web` (Next.js) 的 UI 渲染验证、E2E 交互测试、API 路由响应抓取。
   - 🚫 **严禁**：试图使用 Playwright 测试 `apps/expo` (React Native) 的原生界面或 Metro  bundler。
2. **主动验收 (Proactive Verification)**：
   - 当你修改了 `apps/web` 的 UI 组件或核心交互逻辑后，**禁止**只回复“请刷新页面查看”。
   - **必须**主动调用 Playwright：`browser_navigate` 到对应路由 ➡️ `browser_screenshot` 截图 ➡️ 分析截图或 DOM 结构，向用户证明 UI 渲染正确。
3. **数据抓取与 API 验证**：
   - 使用 `browser_evaluate` 在浏览器上下文中执行 `fetch` 或读取 `window.__NEXT_DATA__`，验证 Next.js API 返回的 JSON 结构是否与 `@openmaic/storage-types` 中的 TS 契约完全一致。
4. **操作稳健性**：
   - 交互前必须先 `browser_snapshot` 获取 Accessibility Tree (a11y tree)，基于 ref 或准确的 selector 进行 `browser_click` / `browser_type`，严禁盲猜坐标。

---

## 🧰 MCP Synergy Workflow (多 MCP 协同矩阵)

遇到复杂任务时，必须根据场景智能组合 MCP 工具：

| 任务场景 | 核心 MCP 组合 | 执行流 (Workflow) |
| :--- | :--- | :--- |
| **重构/类型提取** | `Sequential Thinking` + `CodeGraph` | 思考拆解边界 ➡️ 图谱定位符号与依赖边 ➡️ 执行修改 ➡️ 图谱验证隔离性。 |
| **编写新特性** | `Context7` + `CodeGraph` | 查阅最新框架文档 (防幻觉) ➡️ 图谱寻找最佳插入点 ➡️ 编写代码。 |
| **Web UI 开发/验收** | `Playwright` + `CodeGraph` | 编写组件 ➡️ Playwright 启动并截图验收 ➡️ 若 UI 异常，用图谱追溯样式/数据源。 |
| **数据模型/Storage** | `Postgres` + `CodeGraph` | 查询 DB 真实 Schema ➡️ 对比图谱中的 TS 类型 ➡️ 生成/修正跨端类型契约。 |

---

## 🔄 Development Workflow (Think -> Graph -> Code -> Verify)

### Phase 1: Think & Plan
- 收到任务后，先输出简短的执行计划，识别涉及的模块（Web, Mobile, Shared）。

### Phase 2: Graph Exploration
- 使用 `codegraph_context` 或 `codegraph_search` 定位相关符号，检查依赖树确保不引入违规依赖。

### Phase 3: Code Execution
- 遵循现有代码风格。新增跨端类型必须放入 `packages/storage-types` 并更新 JSDoc。

### Phase 4: Verify (强制验证)
- **全局类型**：`pnpm -w exec tsc --noEmit`
- **Expo 端**：`cd apps/expo && npx tsc --noEmit`
- **Web 端 UI**：启动 dev server，调用 **Playwright MCP** 截图并验证 DOM 状态。
- **Web 端 E2E**：对于核心流程（如创建 Session），使用 Playwright 模拟点击和输入，验证状态流转。

---

## 🚫 Anti-Patterns (绝对禁止事项)

1. **禁止跨端污染**：在 `apps/expo` 中 `import` 任何包含 `node:`, `fs`, `path`, `crypto` 或 `@openmaic/storage` (非 types) 的模块。
2. **禁止“盲人摸象”式 UI 交付**：修改 Web 端 UI 后，不启动 Playwright 验证就宣称“已完成”。
3. **禁止滥用 Any**：严禁使用 `any` 或 `@ts-ignore`，必须修复根本的类型问题。
4. **禁止破坏目录结构**：业务代码放 `features/`，共享逻辑放 `shared/`，核心引擎适配放 `core/`。
5. **禁止省略 JSDoc**：所有导出的 `interface`, `type`, `class`, `function` 必须包含清晰的 JSDoc。

## 📂 Directory Structure Reference
```text
/
├── apps/
│   ├── web/                # Next.js Web 端 (Playwright 测试目标)
│   └── expo/               # Expo Mobile 端 (Strict RN environment)
│       └── src/
│           ├── core/       # 核心引擎适配 (store, renderer)
│           ├── features/   # 业务模块
│           └── shared/     # 跨功能共享
├── packages/
│   ├── storage/            # 存储层运行时 (Node/Browser API)
│   ├── storage-types/      # 🌟 纯类型契约 (跨端共享，零运行时)
│   └── core-engine/        # 核心 DSL 引擎
├── pnpm-workspace.yaml
└── package.json
```

---

## 🐛 Bug Fix Experience (踩坑记录)

### 1. Babel 配置问题

**问题**: `expo-file-system@57` 使用了 TypeScript `declare class` 语法，Babel 需要先转换 `declare` 字段再处理 class 特性。

**错误信息**:
```
TypeScript 'declare' fields must first be transformed by @babel/plugin-transform-typescript.
If you have already enabled that plugin (or '@babel/preset-typescript'), 
make sure that it runs before any plugin related to additional class features:
 - @babel/plugin-transform-class-properties
 - @babel/plugin-transform-private-methods
```

**解决方案**: 使用 `babel-preset-expo` 而非手动配置 `metro-react-native-babel-preset`：

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',  // 内部已正确处理 TypeScript 与 class 插件顺序
    ],
    plugins: [
      // 如果仍报 "Class private methods are not enabled"，取消注释：
      // ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
```

**关键规则**: Babel presets 按**逆序**执行（数组从后往前），plugins 按**正序**执行。

---

### 2. React Native 版本兼容性

**问题**: `react-native-safe-area-context` v5.0.0 与 RN 0.86 不兼容。

**错误信息**:
```
error: no member named 'unit' in 'facebook::yoga::StyleLength'
```

**原因**: v5.0.0 使用了 Yoga API 的 `StyleLength::unit()` 方法，该方法在 RN 0.86 的 Yoga 版本中已被移除。

**解决方案**: 降级到兼容版本：
```json
"react-native-safe-area-context": "~4.14.0"
```

**经验**: 添加新依赖前，必须检查其 peer dependencies 是否与当前 RN/Expo 版本兼容。

---

### 3. pnpm Lockfile 同步问题

**问题**: CI 构建时报 `ERR_PNPM_OUTDATED_LOCKFILE`。

**错误信息**:
```
Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date
specifiers in the lockfile don't match specifiers in package.json:
* 1 dependencies were removed: @babel/plugin-transform-private-methods@^8.0.1
```

**原因**: `pnpm install` 超时未完成，lockfile 未同步 `package.json` 的变更。

**解决方案**: 运行 `pnpm install --no-frozen-lockfile` 更新 lockfile。

**关键规则**: 修改 `package.json` 后必须确保 lockfile 同步，否则 CI 的 `pnpm install --frozen-lockfile` 会失败。

---

### 4. TypeScript 类型错误

**问题**: 幻灯片元素的 discriminated union 类型未正确 narrow。

**错误信息**:
```
Property 'height' does not exist on type 'PPTElement'.
Property 'height' does not exist on type 'PPTLineElement'.
```

**原因**: `PPTElement` 是联合类型，不同变体有不同字段。`PPTLineElement` 扩展自 `Omit<PPTBaseElement, 'height' | 'rotate'>`，没有 `height` 和 `rotate` 字段。

**解决方案**: 使用类型断言安全提取字段：
```typescript
const el = element as unknown as Record<string, unknown>;
// 然后使用 (el.height as number) ?? 100
```

**其他修复**:
- `SlideBackground` 需要 `type` 字段：`{ type: 'solid', color: '#ffffff' }`
- `PPTShapeElement` 需要 `fixedRatio` 字段
- `Slide` 需要 `theme` 字段
- `PPTChartElement` 使用 `data.labels`/`data.series` 而非 `labels`/`values`
- `CodeLine` 使用 `content` 而非 `text`
- `TableCellStyle` 使用 `em` 而非 `italic`

---

### 5. Metro WASM 解析问题

**问题**: `expo-sqlite` 的 WASM 文件在 pnpm 嵌套结构中无法解析。

**错误信息**:
```
Unable to resolve module ./wa-sqlite/wa-sqlite.wasm
```

**解决方案**: 在 `metro.config.js` 中添加 WASM 路径重定向：
```javascript
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 处理 expo-sqlite WASM 文件
  if (platform === 'web' && moduleName.includes('wa-sqlite.wasm')) {
    const wasmPath = path.resolve(__dirname, 'node_modules', 'expo-sqlite', 'web', 'wa-sqlite', 'wa-sqlite.wasm');
    if (require('fs').existsSync(wasmPath)) {
      return { filePath: wasmPath, type: 'asset' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

---

### 6. React Native UI 组件限制

**Web 端属性在 RN 中不可用**:

| Web 属性 | RN 替代方案 |
|----------|------------|
| `backdropFilter` | 使用 `expo-blur` 的 `<BlurView>` |
| `StyleSheet.absoluteFillObject` | 手动定位 `position: 'absolute', top/left/right/bottom: 0` |
| CSS `clip-path` | `react-native-svg` 的 `clipPath` |
| CSS `filter` | 预处理或跳过 |

**Web 端类型在 RN 中不兼容**:
- `PPTElement` 联合类型需要 narrow 或类型断言
- `SlideBackground` 需要 `type` 字段
- `PPTLineElement` 没有 `height`/`rotate` 字段（被 Omit 排除）

---

### 7. 构建检查清单

在提交代码前，确保：

1. **TypeScript**: `cd apps/expo && npx tsc --noEmit` 零错误
2. **Prettier**: `npx prettier --check "apps/expo/**/*.{ts,tsx,js}"` 通过
3. **Lockfile**: `package.json` 变更后运行 `pnpm install` 同步 lockfile
4. **依赖兼容性**: 新增依赖的 peer dependencies 与 RN/Expo 版本匹配