/**
 * 小程序端设计令牌（Design Tokens）—— 对齐 mobile-ui.md（mobile App）与 UI.md 规范.
 * 单位：px（逻辑像素）。⚠️ 内联 style 不支持 rpx（Taro H5 端不转换），统一用 px，
 * 与 mobile（react-native-paper）同源：mobile tokens 原值即本表。
 * 铁律：页面/组件样式必须走 token，禁止硬编码魔法值（状态色/间距/字号/圆角）。
 */

/** 品牌主色（平台蓝 · 对齐 app.config 导航栏与 web/mobile 品牌色） */
export const brandColor = '#1677ff';

/** 页面/卡片/边框 */
export const bgColor = '#f5f6f7';
export const cardColor = '#ffffff';
export const borderColor = '#f0f0f0';

/** 文本层级（mobile-ui.md §2.1） */
export const textColor = {
  main: '#1f1f1f',
  secondary: '#8c8c8c',
  assist: '#bfbfbf',
  inverse: '#ffffff',
} as const;

/** 状态色（mobile-info-flow §6 · 全局唯一编码，禁止版别覆盖） */
export const statusColor = {
  error: '#f5222d', // 紧急 CRITICAL · 严重告警 / 温度≥70
  warning: '#faad14', // 警告 WARN · 温度 60~70
  success: '#52c41a', // 正常 · 在线
  offline: '#bfbfbf', // 离线灰
} as const;

/** 状态元信息（文案 + 颜色 + 浅底，供 StatusBadge/HealthBanner 使用） */
export const STATUS_META = {
  error: { text: '紧急', color: statusColor.error, bg: 'rgba(245, 34, 45, 0.08)' },
  warning: { text: '警告', color: statusColor.warning, bg: 'rgba(250, 173, 20, 0.08)' },
  success: { text: '正常', color: statusColor.success, bg: 'rgba(82, 196, 26, 0.08)' },
  offline: { text: '离线', color: statusColor.offline, bg: 'rgba(191, 191, 191, 0.08)' },
} as const;
export type StatusKey = keyof typeof STATUS_META;

/** 间距（4 基准 · mobile tokens 原值） */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

/** 字号（移动端标准 · px） */
export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 26,
} as const;

/** 圆角（mobile tokens 原值） */
export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
} as const;

/** 行高 / 加粗 */
export const lineHeight = 1.5715;
export const fontWeightStrong = '600';
