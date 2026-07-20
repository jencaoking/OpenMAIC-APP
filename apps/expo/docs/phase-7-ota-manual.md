# Phase 7.4 EAS Update (OTA) 操作手册

| 字段 | 值 |
| :--- | :--- |
| 文档版本 | v1.0 |
| 创建日期 | 2026-07-19 |
| 适用范围 | OpenMAIC Expo Mobile App |
| 关键约束 | OTA 仅更新 JS 层与资源；原生模块变更必须重新构建 |

---

## 1. EAS Update 工作原理

EAS Update 是 Expo 提供的 OTA (Over-The-Air) 热更新服务，允许在不重新提交应用商店审核的情况下，推送 JS 层的 Bug 修复与 UI 更新。

**架构**：
```
App 启动 → expo-updates SDK 检查更新 → 拉取新 JS Bundle → 应用更新
                                         ↓
                                    （如有原生变更，跳过 OTA，提示用户更新 App）
```

**安全保证**：
- JS Bundle 通过 EAS 服务器签名，App 验证签名后才应用更新
- 更新基于 `runtimeVersion` 隔离，确保原生 ABI 兼容
- 回滚机制：可一键回滚到上一个稳定 update

---

## 2. 适用场景与边界

### ✅ 适合 OTA 更新的变更

| 类型 | 例子 |
| :--- | :--- |
| JS Bug 修复 | 修复 Session 页面崩溃 |
| UI 调整 | 调整按钮颜色、字体大小 |
| 性能优化 | 优化 FlatList 渲染 |
| 业务逻辑修改 | 修改同步策略、Quiz 评分规则 |
| 资源更新 | 替换图片、文案 |
| 配置变更 | 切换 API endpoint |

### ❌ 不适合 OTA 更新的变更（必须重新构建）

| 类型 | 例子 |
| :--- | :--- |
| 新增原生模块 | 新增 `expo-location` 插件 |
| 修改原生代码 | 修改 LiveActivityBridge 原生侧 |
| 升级 Expo SDK | 57 → 58 |
| 修改 `app.json` 的 plugins | 新增/移除 Expo Plugin |
| 升级 React Native 版本 | 0.86 → 0.87 |
| 修改权限声明 | 新增麦克风/相机权限 |
| 修改 `runtimeVersion` 策略 | 从 `sdkVersion` 改为 `appVersion` |

---

## 3. 紧急修复流程（Hotfix via OTA）

### 3.1 标准 Hotfix 流程

```bash
# Step 1: 创建 hotfix 分支
git checkout -b hotfix/fix-session-crash main

# Step 2: 修复 Bug
# ... 编辑代码 ...
git add -A
git commit -m "fix(chat-flow): 修复 Session 页面在空消息列表时的崩溃"

# Step 3: 推送 OTA 更新到 production 分支
cd apps/expo
pnpm run eas:update -- "Hotfix: 修复 Session 崩溃 (commit $(git rev-parse --short HEAD))"

# Step 4: 验证更新已推送
eas update:list --branch production --limit 5

# Step 5: 合并 hotfix 到 main
git checkout main
git merge --no-ff hotfix/fix-session-crash
git push origin main

# Step 6: 删除 hotfix 分支
git branch -d hotfix/fix-session-crash
```

### 3.2 用户感知流程

1. App 在 24h 内自然启动时（`checkAutomatically: "ON_LOAD"`）
2. expo-updates SDK 后台检查 EAS 服务器
3. 拉取新 JS Bundle（约 3-5 MB，2-4 秒）
4. 下次启动 App 自动应用更新
5. 用户无感知（无任何弹窗或提示）

**关键时序**：
- 首次启动：检查但不应用（避免延迟首屏渲染）
- 二次启动：应用上次检查到的更新
- 紧急情况：可通过 `checkAutomatically: "ON_ERROR"` 强制检查

---

## 4. 多渠道更新（Branch 策略）

OpenMAIC 维护 3 个 EAS Update Branch：

| Branch | 用途 | 触发方式 |
| :--- | :--- | :--- |
| `development` | 开发测试 | 手动 `eas update --branch development` |
| `preview` | 内测分发 | 手动 `eas update --branch preview` |
| `production` | 生产用户 | GitHub Actions 自动推送（main 分支）或手动 hotfix |

**对应 app.json 配置**：
```json
"updates": {
  "url": "https://u.expo.dev/openmaic-expo",
  "enabled": true,
  "checkAutomatically": "ON_LOAD",
  "fallbackToCacheTimeout": 0
}
```

每个 Branch 上的 App 通过构建时注入的 `channel` 字段路由：
- development profile → channel=development
- preview profile → channel=preview
- production profile → channel=production

---

## 5. 紧急回滚（5 分钟内完成）

### 5.1 场景：新 OTA 推送后 Crash 率飙升

```bash
# Step 1: 列出最近的 updates
cd apps/expo
eas update:list --branch production --limit 5

# 输出示例：
# Update ID    Message                    Created At
# abc123        Hotfix: Session crash      2026-07-19 10:30
# def456        Auto OTA from main         2026-07-19 08:00  ← 回滚到这个
# ghi789        feat: Phase 7 changes      2026-07-18 20:00

# Step 2: 回滚到上一个稳定 update
eas update:rollback --branch production --update-id def456

# Step 3: 验证回滚
eas update:list --branch production --limit 3

# Step 4: 通知团队
# 在 Slack #openmaic-release 频道发布回滚公告
```

### 5.2 用户感知

- 下次启动 App 时，SDK 检测到回滚 update
- 应用上一个稳定的 JS Bundle
- Crash 率立即下降
- **无需重新提交应用商店审核**

### 5.3 通过 GitHub Actions 一键回滚

在 GitHub 仓库的 Actions 页面：

1. 选择 `Build & Submit` workflow
2. 点击 `Run workflow`
3. 选择 `action: rollback`
4. 点击 `Run workflow`

CI 会自动执行 `eas update:rollback` 并通知 Slack。

---

## 6. CI/CD 自动化（GitHub Actions）

### 6.1 自动 OTA 推送

每当 `main` 分支收到推送时，自动推送 OTA 到 production branch：

```yaml
# .github/workflows/build-and-submit.yml
on:
  push:
    branches: [main]

jobs:
  ota-update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Push OTA
        working-directory: apps/expo
        run: eas update --branch production --platform android,ios --message "Auto OTA from ${{ github.sha }}"
```

### 6.2 必需的 GitHub Secrets

| Secret 名称 | 用途 |
| :--- | :--- |
| `EXPO_TOKEN` | EAS 登录 token |
| `SENTRY_AUTH_TOKEN` | Sentry Source Map 上传 |
| `SENTRY_ORG` | Sentry 组织 |
| `SENTRY_PROJECT` | Sentry 项目 |
| `APP_STORE_CONNECT_API_KEY` | App Store 提审 |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google Play 提审 |
| `SLACK_WEBHOOK_URL` | 通知 |

---

## 7. 验证清单

每次推送 OTA 后，验证以下项目：

- [ ] `eas update:list` 显示新 update
- [ ] 5 分钟后，Sentry 上 crash 率未飙升
- [ ] 在 TestFlight / Firebase App Distribution 上验证功能
- [ ] 用户反馈无异常（Slack 客服群监控）
- [ ] 准备好回滚方案（记录上一个稳定 update ID）

---

## 8. 常见问题

### Q1: OTA 推送后，部分用户没收到更新

**原因**：
- App 处于后台，未触发 `ON_LOAD` 检查
- 用户在 24h 内未启动 App
- 网络不稳定，下载失败

**解决**：
- 等待 24h，让用户自然启动 App
- 通过 Push Notification 引导用户打开 App（推送 payload 中带 `force_update: true` 字段，App 收到后强制检查 OTA）

### Q2: OTA 推送后，App 启动白屏

**原因**：
- 新 JS Bundle 有运行时错误
- runtimeVersion 不匹配（罕见，仅在升级 Expo SDK 时发生）

**解决**：
- 立即回滚到上一个稳定 update
- 在 Sentry 上定位错误
- 修复后重新推送

### Q3: 如何强制所有用户立即更新？

**OTA 不支持强制更新**。如果需要强制更新：
- 推送一条带 Deep Link 的 Push Notification
- App 收到 Push 后，在前台主动调用 `Updates.reloadAsync()`

### Q4: 可以推送原生代码变更吗？

**不可以**。OTA 只能更新 JS 层。涉及原生变更必须：
1. 重新 `eas build --profile production`
2. `eas submit` 提交应用商店审核
3. 等待审核（iOS 通常 24-48h，Android 1-6h）
