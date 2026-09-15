/**
 * 全局小程序配置（端自身骨架）.
 * pages 数组顺序 = 启动时默认首页；客户启动页（EXTRA_HOME）优先。
 */
import * as extra from './config/editions/extra';
import { getBrandName, getEdition } from './config/editions';

const DEFAULT_ENTRY = 'pages/login/login';
const edition = getEdition();

// EXTRA_NAV_COLOR：客户导航栏品牌色槽位（客户仓 prepare 生成 · 深色系配白字）。
// 上游骨架的 extra.ts 可能未导出该字段（其它客户/独立仓库）——命名空间读取 + 类型断言，
// 避免裸 named import 在槽位缺失时 typecheck/构建报错；缺省回落 edition.primaryColor → 默认蓝。
const EXTRA_NAV_COLOR = (extra as typeof extra & { EXTRA_NAV_COLOR?: string }).EXTRA_NAV_COLOR;
const EXTRA_HOME = extra.EXTRA_HOME;
const EXTRA_PAGES = extra.EXTRA_PAGES;
const home = EXTRA_HOME ?? DEFAULT_ENTRY;

// 去重：启动页可能与 EXTRA_PAGES 重复
const allPages = [
  home,
  'pages/home/home',
  // 客户启动页存在时，登录页保持可路由（首页入口跳转）
  ...(home === DEFAULT_ENTRY ? [] : [DEFAULT_ENTRY]),
  'pages/forgot-password/index',
  ...(EXTRA_PAGES ?? []),
];
const pages = [...new Set(allPages)];

export default {
  pages,
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: EXTRA_NAV_COLOR ?? edition.primaryColor ?? '#1677ff',
    navigationBarTitleText: getBrandName(),
    navigationBarTextStyle: 'white',
    backgroundColor: '#f7f7f7',
  },
} as const;
