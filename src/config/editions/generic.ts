/** 默认版别（generic）· 端自身骨架：登录 + 启动页 · 类型来自共享契约（contract-types） */
import type { EditionConfig } from '@lieshoucloud/contract-types';

export const genericEdition: EditionConfig = {
  id: 'generic',
  brandName: '物联网云平台',
  slogan: '数字化平台 · 小程序',
  // 品牌主色：骨架默认平台蓝（导航栏色·白字场景需深色系）；客户 edition/extra 注入可覆盖
  primaryColor: '#02429b',
  tenantCode: 'default',
  login: { required: true, mode: 'password', hideTenantInput: true },
};
