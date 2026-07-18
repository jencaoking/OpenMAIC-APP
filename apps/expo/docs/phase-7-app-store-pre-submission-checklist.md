# Phase 7.5 App Store 上架预检清单

| 字段 | 值 |
| :--- | :--- |
| 文档版本 | v1.0 |
| 创建日期 | 2026-07-19 |
| 适用平台 | iOS App Store + Google Play Store |
| 适用版本 | v1.0.0 |

---

## 1. 屏幕适配预检

### 1.1 iOS 设备矩阵

| 设备 | 屏幕尺寸 | 状态 | 备注 |
| :--- | :--- | :--- | :--- |
| iPhone SE (3rd) | 4.7" / 750×1334 | ⏳ 待测 | 最小屏，验证无溢出 |
| iPhone 13/14 | 6.1" / 1170×2532 | ⏳ 待测 | 主流尺寸 |
| iPhone 14 Pro | 6.1" / 1179×2556 | ⏳ 待测 | 含灵动岛 |
| iPhone 14 Pro Max | 6.7" / 1290×2796 | ⏳ 待测 | 最大屏 |
| iPad (10th) | 10.9" / 1640×2360 | ⏳ 待测 | 横竖屏 |
| iPad Pro 12.9 | 12.9" / 2048×2732 | ⏳ 待测 | 大屏布局 |

**验证项**：
- [ ] 所有页面在 iPhone SE 上无截断、无横向滚动
- [ ] 所有页面在 iPhone 14 Pro Max 上居中显示，不留过多空白
- [ ] iPad 横屏布局正常（supportsTablet: true）
- [ ] 灵动岛区域不遮挡关键 UI（语音模式波形动画）

### 1.2 Android 设备矩阵

| 设备 | 屏幕尺寸 | DPI | 状态 |
| :--- | :--- | :--- | :--- |
| Pixel 4a | 5.8" / 1080×2340 | 440 | ⏳ 待测 |
| Pixel 7 | 6.3" / 1080×2400 | 416 | ⏳ 待测 |
| Samsung S23 | 6.1" / 1080×2340 | 425 | ⏳ 待测 |
| Samsung Tab S8 | 11" / 1600×2560 | 274 | ⏳ 待测 |

---

## 2. 主题与暗色模式

| 测试项 | 状态 | 备注 |
| :--- | :--- | :--- |
| 浅色模式默认显示 | ✅ | `userInterfaceStyle: "automatic"` |
| 深色模式自动切换 | ⏳ | 需验证所有页面 |
| 系统主题切换实时响应 | ⏳ | App 在前台时切换系统主题 |
| 文字对比度 ≥ 4.5:1 (WCAG AA) | ⏳ | 使用 Xcode Accessibility Inspector |
| 图标在深色模式下可见 | ⏳ | 检查所有自定义图标 |

---

## 3. 无障碍 (Accessibility)

### 3.1 VoiceOver (iOS)

| 测试项 | 状态 |
| :--- | :--- |
| 所有按钮有 `accessibilityLabel` | ⏳ |
| 所有图片有 `accessibilityLabel` 或 `accessible={false}` | ⏳ |
| 语音模式波形动画有 `accessibilityLabel="AI 正在聆听"` | ✅ |
| Quiz 选项有 `accessibilityRole="radio"` 或 `"checkbox"` | ✅ |
| Quiz 选项有 `accessibilityState={{ selected }}` | ✅ |
| 推送通知点击后焦点正确 | ⏳ |

### 3.2 TalkBack (Android)

| 测试项 | 状态 |
| :--- | :--- |
| 所有交互元素可触摸聚焦 | ⏳ |
| 最小触摸目标 48×48 dp | ⏳ |
| 滑动手势有 `accessibilityHint` | ⏳ |

### 3.3 动态字体大小

| 测试项 | 状态 |
| :--- | :--- |
| 系统字体放大 100% | ✅ 正常 |
| 系统字体放大 150% | ⏳ 待测 |
| 系统字体放大 200% | ⏳ 待测，关键页面无溢出 |
| 系统字体放大 250% (iOS 辅助功能) | ⏳ 待测，关键页面可滚动 |

---

## 4. 性能预检

| 指标 | 目标 | 当前 | 状态 |
| :--- | :--- | :--- | :--- |
| 冷启动时间 (iPhone SE) | < 2.0s | 待测 | ⏳ |
| 冷启动时间 (Pixel 7) | < 1.8s | 待测 | ⏳ |
| 长列表滚动 FPS | 60 fps | 待测 | ⏳ |
| 内存峰值 | < 200 MB | 待测 | ⏳ |
| JS Bundle 体积 | < 5 MB | ~3.2 MB | ✅ |
| IPA 体积 | < 25 MB | ~19 MB | ✅ |
| APK 体积 | < 25 MB | ~22 MB | ✅ |

---

## 5. 隐私与权限合规

### 5.1 iOS 权限声明

| 权限 | 用途说明 | 触发时机 | 状态 |
| :--- | :--- | :--- | :--- |
| NSMicrophoneUsageDescription | "OpenMAIC 需要使用麦克风进行实时语音对话与语音答题。" | 用户点击语音通话 | ✅ |
| NSCameraUsageDescription | "OpenMAIC 需要使用相机拍照识别题目、白板笔记或代码报错。" | 用户点击拍照 | ✅ |
| NSPhotoLibraryUsageDescription | "OpenMAIC 需要访问相册以选择图片进行多模态提问。" | 用户点击相册 | ✅ |
| NSPhotoLibraryAddUsageDescription | "OpenMAIC 需要将拍摄的图片保存到相册。" | 用户保存图片 | ✅ |
| NSSupportsLiveActivities | `true` | — | ✅ |
| UIBackgroundModes | `[audio, fetch, processing, remote-notification]` | — | ✅ |

**已移除的权限**（避免审核被拒）：
- ❌ `NSLocationAlwaysUsageDescription`（未使用后台定位）
- ❌ `NSContactsUsageDescription`（未使用通讯录）
- ❌ `NSCalendarsUsageDescription`（未使用日历）

### 5.2 iOS Privacy Manifest (PrivacyInfo.xcprivacy)

| 数据类型 | 声明 | 状态 |
| :--- | :--- | :--- |
| NSPrivacyTracking | `false` | ✅ |
| UserID | AppFunctionality | ✅ |
| OtherUserContent | AppFunctionality | ✅ |
| PhotosorVideos | AppFunctionality | ✅ |
| AudioData | AppFunctionality | ✅ |
| DeviceID | AppFunctionality | ✅ |
| ProductInteraction | AppFunctionality, Analytics | ✅ |
| CrashData | AppFunctionality | ✅ |
| PerformanceData | AppFunctionality, Analytics | ✅ |
| Required Reason API | UserDefaults/FileTimestamp/BootTime/DiskSpace | ✅ |

### 5.3 Android 权限声明

| 权限 | 用途 | 状态 |
| :--- | :--- | :--- |
| RECORD_AUDIO | 语音对话 | ✅ |
| CAMERA | 拍照识别 | ✅ |
| POST_NOTIFICATIONS | 推送通知 | ✅ |
| WAKE_LOCK | 后台同步 | ✅ |
| FOREGROUND_SERVICE | 后台语音 | ✅ |
| FOREGROUND_SERVICE_MICROPHONE | 后台录音 | ✅ |

**已移除的权限**：
- ❌ `READ_EXTERNAL_STORAGE`（Android 13+ 用 PhotoPicker 替代）
- ❌ `WRITE_EXTERNAL_STORAGE`（同上）
- ❌ `RECEIVE_BOOT_COMPLETED`（未使用开机自启）
- ❌ `ACCESS_FINE_LOCATION`（未使用定位）

### 5.4 Google Play Data Safety 表单

需在 Play Console 填写：

| 项 | 值 |
| :--- | :--- |
| 数据加密 | ✅ 是（SQLCipher 加密） |
| 数据分享 | ❌ 否（不与第三方共享） |
| 数据收集 - 用户 ID | ✅ 用于 App 功能 |
| 数据收集 - 消息内容 | ✅ 用于 App 功能 |
| 数据收集 - 照片 | ✅ 用于 App 功能 |
| 数据收集 - 音频 | ✅ 用于 App 功能 |
| 数据收集 - 设备 ID | ✅ 用于 App 功能 |
| 数据收集 - 使用数据 | ✅ 用于分析和 App 功能 |
| 数据收集 - 崩溃日志 | ✅ 用于 App 功能（Sentry） |
| 数据删除请求 | ✅ 支持（通过 SecureKeyStore.wipeAll()） |

---

## 6. App Icon & Splash Screen

| 资源 | 尺寸 | 状态 |
| :--- | :--- | :--- |
| iOS App Icon | 1024×1024 | ✅ |
| iOS Splash | 1242×2436 (iPhone X+) | ✅ |
| Android Adaptive Icon Foreground | 432×432 | ✅ |
| Android Adaptive Icon Background | 432×432 | ✅ |
| Android Monochrome Icon | 432×432 | ✅ |
| Web Favicon | 48×48 | ✅ |
| iPad Icon | 167×167 | ⏳ 待补 |

---

## 7. 测试自动化结果

### 7.1 单元测试 (Jest)

```
File                 | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
DeepLinkRouter.ts   |   100%  |   92%    |  100%   |  100%   |
SecureKeyStore.ts   |    95%  |   85%    |   90%   |   95%   |
VadDetector.ts      |    88%  |   75%    |   85%   |   88%   |
TtsQueue.ts         |    82%  |   70%    |   80%   |   82%   |
--------------------|---------|----------|---------|---------|
All files           |    88%  |   78%    |   85%   |   88%   |
```

✅ 覆盖率达标（>= 75% lines, >= 60% branches）

### 7.2 组件测试 (@testing-library/react-native)

| 组件 | 测试用例数 | 通过 | 失败 |
| :--- | :---: | :---: | :---: |
| MessageBubble | 8 | 8 | 0 |
| ImagePreviewBar | 5 | 5 | 0 |
| AttachmentPanel | 4 | 4 | 0 |
| WaveformAnimation | 3 | 3 | 0 |
| NetworkBanner | 2 | 2 | 0 |

### 7.3 E2E 测试 (Maestro)

| Flow | 通过 | 失败 | 跳过 |
| :--- | :---: | :---: | :---: |
| 启动 → 课程列表 | ⏳ | — | — |
| Session 聊天 | ⏳ | — | — |
| Quiz 答题 | ⏳ | — | — |
| 离线同步 | ⏳ | — | — |
| 语音模式 | ⏳ | — | — |
| 多模态图片 | ⏳ | — | — |

⏳ = 待真机执行

---

## 8. 外部链接与 Deep Link

| 测试项 | 状态 |
| :--- | :--- |
| 所有外部链接使用 `Linking.openURL` 在系统浏览器打开 | ⏳ |
| Deep Link `openmaic://session/<id>` 正确路由 | ✅ |
| Deep Link `openmaic://quiz/<id>` 正确路由 | ✅ |
| Deep Link `openmaic://dsl/<id>` 正确路由 | ✅ |
| Deep Link `openmaic://home` 正确路由 | ✅ |
| 推送点击后 Deep Link 跳转 | ✅ |
| Universal Links `applinks:openmaic.dev` | ⏳ |

---

## 9. 网络与离线

| 测试项 | 状态 |
| :--- | :--- |
| 弱网环境下 App 不崩溃 | ✅ |
| 飞行模式下可浏览本地缓存 | ✅ |
| 恢复网络后自动同步 | ✅ |
| 后台同步任务 15min 触发 | ✅ |
| WebSocket 后台 30s 自动断开 | ✅ |
| 前台恢复后 forceSync | ✅ |

---

## 10. 提交清单

### 10.1 iOS App Store Connect

| 项 | 状态 | 备注 |
| :--- | :--- | :--- |
| App 名称 | OpenMAIC | ✅ |
| Bundle ID | dev.openmaic.expo | ✅ |
| SKU | openmaic-expo-prod | ✅ |
| 主语言 | 简体中文 | ✅ |
| 类别 | Education | ✅ |
| 子类别 | Self-Study Aids | ⏳ |
| 内容分级 | 4+ (无不良内容) | ✅ |
| 截图 (6.7" iPhone) | 5 张 | ⏳ 待制作 |
| 截图 (5.5" iPhone) | 5 张 | ⏳ 待制作 |
| 截图 (12.9" iPad) | 5 张 | ⏳ 待制作 |
| App 预览视频 | 15-30s | ⏳ 待制作 |
| App 描述 | ≤4000 字符 | ⏳ 待撰写 |
| 关键词 | ≤100 字符 | ⏳ 待撰写 |
| 隐私政策 URL | https://openmaic.dev/privacy | ⏳ 待上线 |
| 用户协议 URL | https://openmaic.dev/terms | ⏳ 待上线 |
| App Review 信息 | 测试账号 | ⏳ 待准备 |

### 10.2 Google Play Console

| 项 | 状态 | 备注 |
| :--- | :--- | :--- |
| App 名称 | OpenMAIC | ✅ |
| Package | dev.openmaic.expo | ✅ |
| 默认语言 | 简体中文 | ✅ |
| 类别 | Education | ✅ |
| 内容评级 | IARC 问卷 | ⏳ 待填 |
| 数据安全表单 | 见 §5.4 | ⏳ 待填 |
| 目标受众 | 13+ | ✅ |
| 包含广告 | 否 | ✅ |
| 应用内购买 | 否 | ✅ |
| 截图 (手机) | 2-8 张 | ⏳ 待制作 |
| 高分辨率图标 | 512×512 | ⏳ 待制作 |
| 置顶大图 | 1024×500 | ⏳ 待制作 |

---

## 11. 最终提交信息

| 字段 | iOS | Android |
| :--- | :--- | :--- |
| Version | 1.0.0 | 1.0.0 |
| Build Number | 1 | 1 |
| EAS Profile | production | production |
| Build Type | IPA | AAB |
| 提交方式 | `eas submit --platform ios` | `eas submit --platform android` |
| 触发命令 | `git tag v1.0.0 && git push origin v1.0.0` | 同上 |

CI/CD 流水线会自动：
1. 运行类型检查 + 单元测试
2. EAS Build (production profile, iOS + Android)
3. EAS Submit (App Store + Google Play)
4. Slack 通知构建结果

---

## 12. 上线后监控

| 指标 | 工具 | 告警阈值 |
| :--- | :--- | :--- |
| Crash-free sessions | Sentry | ≥ 99.5% |
| Crash-free users | Sentry | ≥ 99.0% |
| 平均冷启动时间 | Sentry Performance | ≤ 2.5s |
| API P95 响应时间 | Sentry Performance | ≤ 800ms |
| ANR 率 (Android) | Play Vitals | ≤ 0.5% |
| App Store 评分 | App Store Connect | ≥ 4.0 |
| 用户留存 (次日) | 内部统计 | ≥ 40% |

**告警渠道**：Slack #openmaic-alerts
**回滚预案**：见 [Phase 7.4 OTA 操作手册](phase-7-ota-manual.md) §5

---

**报告完**
