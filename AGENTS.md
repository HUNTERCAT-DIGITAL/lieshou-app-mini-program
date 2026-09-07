# 项目记忆

> 由 pi 的 project-memory 扩展自动创建,后续与人类维护者共同维护。
> 记录关键事实、决策与约定;避免流水账。

## 项目身份
- 名称: lieshou-mini-program（猎手云微信小程序 · 开源）
- 类型: 前端应用（微信小程序端，薄壳端）
- 仓库: https://gitlab.ts.huntercat.cn/huntercat-digital/lieshou-mini-program（main）
- 技术栈: Taro 4 + React 18 + TypeScript strict + pnpm workspace

## 架构速览
Taro 4 小程序薄壳端：业务逻辑在 `@lieshoucloud/core-web`（configureCore 端口注入，app.tsx），契约类型在 `@lieshoucloud/contract-types`（经 `open/*` submodule 挂载）。客户定制走 Edition 体系 + `extra.ts` 注入槽位（EXTRA_HOME/PAGES/TABBAR/ENTRIES），零分叉。关键目录：`src/config/editions/`（版别体系）、`src/services/`（API 薄封装，统一出口）、`src/pages/`（6 页）、`src/stores/auth.ts`（core-web re-export）。

## 关键约定
- 类型/META 一律 import 契约层，禁止端侧重定义；`STATUS_META`（customer 版）因 index.ts `export*` 同名冲突走深路径 `@lieshoucloud/contract-types/business/customer`
- 共享层 META 的 color 是 antd 语义色（非 CSS 色值），由 `MiniUI.tsx` 的 `ANTD_TAG_COLORS` 映射消费
- `services/*.ts` 为端侧统一出口（re-export 契约层），页面 import 路径不变
- Conventional Commits；ESLint 0 warning 门槛（`pnpm lint` 真实生效，react-hooks 规则启用）
- submodule bump 纪律：共享仓提交后立即 bump `open/*` pin
- 单分支 main，直接推送（parallel 会话存在，push 前先 fetch）

## 当前阶段
客户注入体系铺开完成（EXTRA_TABBAR/EXTRA_HOME/EXTRA_PAGES/EXTRA_ENTRIES）；类型收敛至契约层**已闭环**（customer/inventory/approval/finance 全部收敛，仅 user.ts UserOption 为下拉专用裁剪 DTO 合理保留）；真实 ESLint 已启用。

## 待办
- [ ] 清理假数据（workbench「今日新增 3」硬编码）
- [ ] `resolveEditionFromHostname` stub 补 TODO 或实现（当前硬编码 generic）
- [ ] `open/ui` submodule 零引用：用起来或摘除（动 submodule 需先确认）
- [ ] 登录页微信一键登录/记住账号（后端支持情况待确认）

> ✅ 已验证：contract-api bump 9685220（normalizeApiPath 自动补 /api）后测试持续 43/43 全绿，断言未受影响。

## 关键决策
- 2026-08-28: 类型/META 收敛至契约层**闭环**（customer/inventory/approval/finance 去重复定义 + ApiError 统一 contract-api）；StatusBadge 加 ANTD_TAG_COLORS（antd 语义色 → 小程序色值）
- 2026-08-28: 真实 ESLint（flat config + react-hooks）替换占位脚本；api.test 改 mock @tarojs/taro（fetchGatewayHealth 走 Taro.request 非 fetch）
- 2026-08-27: EXTRA_TABBAR 客户底部导航注入（原生 tabBar）
