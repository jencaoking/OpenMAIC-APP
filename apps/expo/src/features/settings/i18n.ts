/**
 * @file i18n.ts
 * @description 设置模块 i18n 占位实现。
 *
 * 移动端尚未接入完整的 i18next 方案（Web 端使用 `react-i18next` + JSON locale），
 * 此处提供轻量级 hook 与静态中文翻译字典，供设置面板组件直接使用。
 *
 * 设计原则：
 * - 零运行时依赖（不引入 i18next / react-i18next）
 * - 与 Web 端 `lib/i18n/locales/zh-CN.json` 中 `settings.*` 字段保持语义一致
 * - `t(key)` 接受点分字符串，未命中时原样返回 key（便于排查遗漏）
 *
 * 严格隔离规则：
 * - 不引用 `@openmaic/storage` 运行时
 * - 不引用 Web 端 `lib/hooks/use-i18n` 或 `lib/i18n/*`
 */

/**
 * 中文字典：键 → 翻译。
 *
 * 键名约定沿用 Web 端 i18next 的点分格式（如 `settings.usage.title`），
 * 以便未来无缝迁移到完整的 i18n 方案。
 */
const ZH_DICT: Record<string, string> = {
  // ===== 通用 =====
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.save': '保存',
  'common.delete': '删除',
  'common.retry': '重试',
  'common.loading': '加载中…',

  // ===== 设置面板顶部 =====
  'settings.title': '设置',
  'settings.close': '关闭',
  'settings.save': '保存',
  'settings.providers': '语言模型',
  'settings.systemSettings': '系统设置',
  'settings.imageSettings': '图像生成',
  'settings.videoSettings': '视频生成',
  'settings.ttsSettings': '语音合成',
  'settings.asrSettings': '语音识别',
  'settings.documentParsingSettings': '文档解析',
  'settings.webSearchSettings': '网络搜索',

  // ===== Token Plan =====
  'settings.tokenPlan.nav': 'Token Plan',
  'settings.tokenPlan.title': 'Token Plan 一键配置',
  'settings.tokenPlan.desc':
    '选择你的 Token Plan 服务商并填入密钥，将自动配置所有已适配的模态(语言模型/图像/视频/语音/网络搜索)。',

  // ===== 提供商通用字段 =====
  'settings.apiSecret': 'API 密钥',
  'settings.apiHost': 'Base URL',
  'settings.testConnection': '测试连接',
  'settings.testConnectionDesc': '测试当前API配置是否可用',
  'settings.models': '模型',
  'settings.addNewModel': '新建模型',
  'settings.fetchModels': '拉取模型',
  'settings.reset': '重置',
  'settings.resetToDefault': '重置为默认配置',
  'settings.confirmReset': '确认重置',
  'settings.cancelEdit': '取消',
  'settings.deleteProvider': '删除提供方',
  'settings.deleteProviderConfirm': '确定要删除此提供方吗？',
  'settings.connectionSuccess': '连接成功',
  'settings.connectionFailed': '连接失败',
  'settings.requiresApiKey': '需要 API 密钥',
  'settings.serverConfigured': '服务端',
  'settings.serverConfiguredNotice':
    '此提供方由服务端托管，无法在此修改。如需使用自己的凭据，请新增一个提供方。',
  'settings.addProviderButton': '添加',
  'settings.noModelsAvailable': '没有可用于测试的模型',
  'settings.modelIdRequired': '请输入模型 ID',
  'settings.cannotDeleteBuiltIn': '无法删除内置提供方',
  'settings.resetSuccess': '已成功重置为默认配置',
  'settings.resetConfirmDescription':
    '此操作将清除所有自定义模型，恢复到内置的默认模型列表。API 密钥和 Base URL 将被保留。',
  'settings.requestUrl': '请求地址',
  'settings.azureDeploymentHint':
    '请在上方填写 Azure OpenAI Endpoint，并将每个 Azure Deployment 名称添加为模型。',
  'settings.fetchModelsResult': '已拉取 {total} 个模型，新增 {added} 个',
  'settings.fetchModelsNoEndpoint': '该服务商未提供模型列表接口，请手动「新建模型」',
  'settings.fetchModelsAuthError': 'API 密钥无效或已过期',
  'settings.fetchModelsFailed': '拉取模型失败',
  'settings.editModel': '编辑模型',
  'settings.deleteModel': '删除',
  'settings.saveSuccess': '配置已保存',
  'settings.saveFailed': '保存失败，请重试',

  // ===== 危险区域 / 清空缓存 =====
  'settings.dangerZone': '危险区域',
  'settings.clearCache': '清空本地缓存',
  'settings.clearCacheDescription':
    '删除所有本地存储的数据，包括课堂记录、对话历史、音频缓存和应用配置。此操作不可撤销。',
  'settings.clearCacheConfirmTitle': '确定要清空所有缓存吗？',
  'settings.clearCacheConfirmDescription': '此操作将永久删除以下所有数据，且无法恢复：',
  'settings.clearCacheConfirmItems': '课堂和场景数据、对话历史记录、音频和图片缓存、应用设置和偏好',
  'settings.clearCacheConfirmInput': '请输入「确认删除」以继续',
  'settings.clearCacheConfirmPhrase': '确认删除',
  'settings.clearCacheButton': '永久删除所有数据',
  'settings.clearCacheSuccess': '缓存已清空，应用即将重启',
  'settings.clearCacheFailed': '清空缓存失败，请重试',

  // ===== 用量统计 =====
  'settings.usage.title': '用量统计',
  'settings.usage.refresh': '刷新',
  'settings.usage.disclaimer': '用量为系统统计,仅统计经服务端的调用。',
  'settings.usage.totalRequests': '总请求数',
  'settings.usage.totalTokens': '语言模型 Token',
  'settings.usage.dailyTrend': '每日请求趋势',
  'settings.usage.tokens': 'Token',
  'settings.usage.byModel': '按模型',
  'settings.usage.model': '模型',
  'settings.usage.type': '类型',
  'settings.usage.reqs': '请求',
  'settings.usage.usage': '用量',
  'settings.usage.empty': '暂无用量数据',
  'settings.usage.kindLlm': '语言模型',
  'settings.usage.kindImage': '图像',
  'settings.usage.kindVideo': '视频',
  'settings.usage.kindTts': '语音合成',
  'settings.usage.kindAsr': '语音识别',
  'settings.usage.unitToken': 'Token',
  'settings.usage.unitImage': '张',
  'settings.usage.unitSecond': '秒',
  'settings.usage.unitCharacter': '字符',

  // ===== LLM 提供商名称 =====
  'settings.providerNames.openai': 'OpenAI',
  'settings.providerNames.azure': 'Azure OpenAI',
  'settings.providerNames.anthropic': 'Claude',
  'settings.providerNames.google': 'Gemini',
  'settings.providerNames.deepseek': 'DeepSeek',
  'settings.providerNames.qwen': '通义千问',
  'settings.providerNames.kimi': 'Kimi',
  'settings.providerNames.minimax': 'MiniMax',
  'settings.providerNames.glm': 'GLM',
  'settings.providerNames.siliconflow': '硅基流动',
  'settings.providerNames.doubao': '豆包',
  'settings.providerNames.openrouter': 'OpenRouter',
  'settings.providerNames.grok': 'Grok',
  'settings.providerNames.tencent-hunyuan': '腾讯混元',
  'settings.providerNames.xiaomi': '小米 MiMo',
  'settings.providerNames.lemonade': 'Lemonade（本地）',
  'settings.providerNames.ollama': 'Ollama（本地模型）',
  'settings.providerNames.tavily': 'Tavily',
  'settings.providerNames.bocha': '博查',
  'settings.providerNames.brave': 'Brave Search',
  'settings.providerNames.baidu': '百度',
  'settings.providerNames.searxng': 'SearXNG',

  // ===== TTS 提供商名称 =====
  'settings.providerOpenAITTS': 'OpenAI TTS',
  'settings.providerAzureTTS': 'Azure TTS',
  'settings.providerGLMTTS': 'GLM TTS',
  'settings.providerQwenTTS': 'Qwen TTS (阿里云百炼)',
  'settings.providerVoxCPMTTS': 'VoxCPM2',
  'settings.providerDoubaoTTS': '豆包 TTS 2.0（火山引擎）',
  'settings.providerElevenLabsTTS': 'ElevenLabs TTS',
  'settings.providerMiniMaxTTS': 'MiniMax TTS',
  'settings.providerLemonadeTTS': 'Lemonade TTS',
  'settings.providerBrowserNativeTTS': '浏览器原生 (Web Speech API)',

  // ===== ASR 提供商名称 =====
  'settings.providerOpenAIWhisper': 'OpenAI Whisper',
  'settings.providerBrowserNativeASR': '浏览器原生 ASR (Web Speech API)',
  'settings.providerQwenASR': 'Qwen ASR (阿里云百炼)',
  'settings.providerAzureASR': 'Azure STT',
  'settings.providerLemonadeASR': 'Lemonade ASR',

  // ===== PDF 提供商名称 =====
  'settings.providerMineru': 'MinerU',
  'settings.providerAlidocmind': 'AliDocMind',
  'settings.providerUnpdf': 'unpdf（内置）',

  // ===== 图片生成提供商名称 =====
  'settings.providerSeedream': 'Seedream',
  'settings.providerOpenAIImage': 'OpenAI Image',
  'settings.providerQwenImage': 'Qwen Image',
  'settings.providerNanoBanana': 'Nano Banana (Gemini)',
  'settings.providerMiniMaxImage': 'MiniMax Image',
  'settings.providerGrokImage': 'Grok Image',
  'settings.providerComfyUIImage': 'ComfyUI Image',

  // ===== 视频生成提供商名称 =====
  'settings.providerSeedance': 'Seedance',
  'settings.providerKling': 'Kling',
  'settings.providerVeo': 'Veo',
  'settings.providerSora': 'Sora',
  'settings.providerMiniMaxVideo': 'MiniMax Video',
  'settings.providerGrokVideo': 'Grok Video',
  'settings.providerHappyHorse': 'Happy Horse',

  // ===== Web 搜索提供商名称 =====
  'settings.providerTavily': 'Tavily',
  'settings.providerBrave': 'Brave Search',
  'settings.providerBocha': '博查',
  'settings.providerBaidu': '百度',
  'settings.providerDoubaoSearch': '豆包',
  'settings.providerMiniMaxSearch': 'MiniMax',
  'settings.providerSearXNG': 'SearXNG',
};

/**
 * 翻译函数类型：接受点分 key 与可选插值参数，返回本地化字符串。
 *
 * 插值语法沿用 i18next 风格：`{name}` 占位符由 `params.name` 替换。
 * 未命中字典时返回 key 本身，便于排查遗漏的翻译。
 *
 * @param key - 点分键名，例如 `settings.usage.title`
 * @param params - 可选插值参数
 * @returns 翻译后的字符串
 */
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * 应用插值参数到模板字符串。
 *
 * 将模板中的 `{name}` 占位符替换为 `params.name` 的字符串形式。
 *
 * @param template - 含 `{name}` 占位符的模板字符串
 * @param params - 插值参数
 * @returns 替换后的字符串
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * 设置模块 i18n Hook（占位实现）。
 *
 * 返回 `{ t }`，其中 `t` 为翻译函数。当前实现固定返回中文翻译，
 * 后续接入完整 i18n 方案时只需替换内部实现即可。
 *
 * 使用示例：
 * ```tsx
 * const { t } = useSettingsI18n();
 * <Text>{t('settings.usage.title')}</Text>
 * <Text>{t('settings.fetchModelsResult', { total: 12, added: 3 })}</Text>
 * ```
 *
 * @returns 包含 `t` 翻译函数的对象
 */
export function useSettingsI18n(): { t: TranslateFn } {
  const t: TranslateFn = (key, params) => {
    const template = ZH_DICT[key] ?? key;
    return interpolate(template, params);
  };
  return { t };
}
