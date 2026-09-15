/**
 * 冒烟测试：验证测试链路 + editions 装配 + 版本常量解析
 */
import { describe, expect, it } from 'vitest';

import { getBrandName, getBrandSlogan, getEdition } from '../editions';
import { APP_VERSION } from '../version';

describe('冒烟', () => {
  it('版本常量可解析（semver 形状；与 package.json 的一致性由 `pnpm version:check` 守）', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('getEdition 返回 generic 版别配置', () => {
    const e = getEdition();
    expect(e.id).toBe('generic');
    expect(e.brandName).toBe('猎手云');
    expect(e.login?.required).toBe(true);
  });

  it('品牌文案缺省回落 generic（客户仓未注入槽位时）', () => {
    expect(getBrandName()).toBe('猎手云');
    expect(getBrandSlogan()).toBe('数字化平台 · 小程序');
  });
});
