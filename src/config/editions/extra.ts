/**
 * 客户版别槽位（客户仓 deploy:prepare 覆盖生成本文件 · 勿手改）.
 *
 * 上游缺省为空：独立仓 / 通用版不注入任何客户页面、客户域名、客户导航色。
 * 客户仓 prepare 会重写本文件（EXTRA_HOME / EXTRA_PAGES / CUSTOM_API_BASE / EXTRA_NAV_COLOR）。
 */
export const EXTRA_HOME: string | null = null;
export const EXTRA_PAGES: string[] = [];
export const CUSTOM_API_BASE: string | null = null;
