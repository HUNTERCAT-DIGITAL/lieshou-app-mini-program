/**
 * 版别解析（端自身骨架 · 类型来自共享契约 contract-types）：
 * 构建期 `TARO_APP_EDITION` 注入 → generic 兜底。客户页面级注入走 ./extra.ts。
 */
import type { EditionConfig } from '@lieshoucloud/contract-types';

import { genericEdition } from './generic';
import * as extra from './extra';

export function resolveEditionId(): string {
  // 构建期注入：process.env.TARO_APP_EDITION 由 defineConstants 替换（浏览器运行时无 process）
  const env = process.env.TARO_APP_EDITION || undefined;
  if (env?.trim()) return env.trim();
  return 'generic';
}

export function getEdition(): EditionConfig {
  const id = resolveEditionId();
  return id === 'generic' ? genericEdition : { ...genericEdition, id };
}

// 客户品牌文案槽位（./extra.ts 由客户仓 prepare 覆盖）：命名空间读取 + 可选类型，
// 槽位缺失时（独立仓 / 老客户仓注入物）不因裸 named import 而 typecheck/构建失败。
const slots = extra as typeof extra & {
  EXTRA_BRAND_NAME?: string | null;
  EXTRA_BRAND_SLOGAN?: string | null;
};

/** 品牌名：客户槽位 → 版别 → generic（导航栏标题、登录页/首页品牌区统一用它） */
export function getBrandName(): string {
  return slots.EXTRA_BRAND_NAME?.trim() || getEdition().brandName;
}

/** 品牌副标语：客户槽位 → 版别（可为空串，调用方自行决定是否渲染） */
export function getBrandSlogan(): string {
  return (slots.EXTRA_BRAND_SLOGAN ?? getEdition().slogan ?? '').trim();
}
