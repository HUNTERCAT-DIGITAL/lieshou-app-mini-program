# 项目记忆

> 由 pi 的 project-memory 扩展自动创建,后续与人类维护者共同维护。
> 记录关键事实、决策与约定;避免流水账。

## 项目身份
- 名称: lieshou-app-mini-program（猎手云微信小程序 · 开源）
- 类型: 前端应用（微信小程序端，薄壳端）
- 仓库: https://gitlab.ts.huntercat.cn/huntercat-digital/lieshou-app-mini-program（main **受保护** → 一律分支 + MR）
- 技术栈: Taro 4 + React 18 + TypeScript strict + pnpm（**非 workspace**，单包）
- 运行环境: **只在 Tailscale 内网使用**（GitLab / Nexus 均为内网域名）→ 不加公网兼容包袱，`.npmrc` 直接全局指向内网 Nexus

## 架构速览
Taro 4 小程序薄壳端：业务逻辑在 `@lieshoucloud/core-web`（configureCore 端口注入，app.tsx），契约类型在 `@lieshoucloud/contract-types`（**内网 Nexus `npm-group` 消费**，2026-09 起不再走 `open/*` submodule）。客户定制走 Edition 体系 + `extra.ts` 注入槽位（EXTRA_HOME/PAGES/TABBAR/ENTRIES），零分叉。关键目录：`src/config/editions/`（版别体系）、`src/services/`（API 薄封装，统一出口）、`src/pages/`（6 页）、`src/stores/auth.ts`（core-web re-export）。

## 上游依赖（Nexus）

| 包 | 层 | 锁定版本 |
| --- | --- | --- |
| `@lieshoucloud/contract-api` | L0 契约（传输层） | `0.2.1` |
| `@lieshoucloud/contract-types` | L0 契约（类型） | `0.2.1` |
| `@lieshoucloud/i18n` | L0 契约（文案） | `0.2.0` |
| `@lieshoucloud/core-web` | L1 业务逻辑 | `0.1.1` |

- 制品在 `npm-hosted`；`.npmrc` 的 `registry` 指 `npm-group` → **上游全部走内网 Nexus**（@lieshoucloud 走 hosted，公共包走 proxy 代理 npmmirror）
  · 本仓只在 tailnet 内使用（已定），所以不做“公共包回退默认源”的双轨——不要把它“修”回 scope 级 registry
- **精确锁版本、不用 caret**：`0.x` 的 `^0.2.1` 锁 `<0.3.0`，而历史上出过 `^0.0.1` 死链（i18n 0.0.1 下架后依赖方装不上）
- 内网 Nexus 用 Caddy 自签 CA，node 不读系统信任库 → 装依赖前 `export NODE_EXTRA_CA_CERTS=<caddy-root.crt>`
- `contract-config` 上游 `private`、端内零 import → 不声明

## 关键约定
- 类型/META 一律 import 契约层，禁止端侧重定义；`STATUS_META`（customer 版）因 index.ts `export*` 同名冲突走深路径 `@lieshoucloud/contract-types/business/customer`
- 共享层 META 的 color 是 antd 语义色（非 CSS 色值），由 `MiniUI.tsx` 的 `ANTD_TAG_COLORS` 映射消费
- `services/*.ts` 为端侧统一出口（re-export 契约层），页面 import 路径不变
- Conventional Commits；ESLint 0 warning 门槛（`pnpm lint` 真实生效，react-hooks 规则启用）
- 上游升级纪律：共享仓打 `vX.Y.Z` tag（须等于其 `package.json` version + CHANGELOG 有对应小节）→ CI 发 Nexus `npm-hosted` → 端侧改精确版本 + `pnpm-lock.yaml`（无 gitlink bump）；`core-web` 发布门禁会校验其依赖已先发布
- 单包单分支 main，**main 受保护**：改动一律分支 + MR（历史记忆“直接推送”已作废）

## 当前阶段
客户注入体系铺开完成（EXTRA_TABBAR/EXTRA_HOME/EXTRA_PAGES/EXTRA_ENTRIES）；类型收敛至契约层**已闭环**（customer/inventory/approval/finance 全部收敛，仅 user.ts UserOption 为下拉专用裁剪 DTO 合理保留）；真实 ESLint 已启用。

## 待办
- [ ] 清理假数据（workbench「今日新增 3」硬编码）
- [ ] `resolveEditionFromHostname` stub 补 TODO 或实现（当前硬编码 generic）
- [x] 客户页面已回收到交付仓（2026-09-14）：删 `src/pages/dwjk/*` + `tsconfig.dwjk.json`，上游改「中性白名单 gitignore + editions/extra.ts 空槽位」，客户仓 prepare 照旧注入
- [ ] 存量：`forgot-password` 调 `resetPassword` 少传 `tenantCode`（TS2554，pin 时代就存在）
- [ ] 登录页微信一键登录/记住账号（后端支持情况待确认）
- [ ] 交付仓（dwjk / jiangcai / legalmind）的 mini-program submodule pin 尚未 bump 到本次 Nexus 切换后的 main

> ✅ 已验证：contract-api bump 9685220（normalizeApiPath 自动补 /api）后测试持续 43/43 全绿，断言未受影响。

## 关键决策
- 2026-09-14: 共享包改为**内网 Nexus 消费**（`@lieshoucloud/{contract-api 0.2.1,contract-types 0.2.1,core-web 0.1.1,i18n 0.2.0}` **精确版本**）；删 7 个 `open/*` submodule + `.gitmodules` + `pnpm-workspace.yaml`；`.npmrc` = scope 级 registry + `node-linker=hoisted`；`config/index.ts` 的 `compile.include` 指向 `node_modules/@lieshoucloud`（共享包发的是 TS 源码，仍需 babel 编译）
- 2026-08-28: 类型/META 收敛至契约层**闭环**（customer/inventory/approval/finance 去重复定义 + ApiError 统一 contract-api）；StatusBadge 加 ANTD_TAG_COLORS（antd 语义色 → 小程序色值）
- 2026-08-28: 真实 ESLint（flat config + react-hooks）替换占位脚本；api.test 改 mock @tarojs/taro（fetchGatewayHealth 走 Taro.request 非 fetch）
- 2026-08-27: EXTRA_TABBAR 客户底部导航注入（原生 tabBar）
