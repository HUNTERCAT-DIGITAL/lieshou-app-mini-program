# lieshou-cloud-mini-program · 猎手云微信小程序(开源)

> 猎手云(开源)的微信小程序端:Taro 4 + React 18,承载登录 / 工作台 / 客户 / 库存 / 财务 / 审批等通用业务。
> 行业能力与客户定制通过 **Edition 配置 + 客户仓注入**(`extra.ts` 槽位)装配,不在本仓内。

<p align="center">
  <img src="https://img.shields.io/badge/Taro-4-blue" alt="Taro 4"/>
  <img src="https://img.shields.io/badge/React-18-61dafb" alt="React 18"/>
  <img src="https://img.shields.io/badge/License-Apache--2.0-brightgreen" alt="Apache-2.0"/>
</p>

## 技术栈

- Taro 4（React 18 + TypeScript）+ pnpm
- 共享层 `@lieshoucloud/{contract-api,contract-types,core-web,i18n}` 经**内网 Nexus**（`npm-group`）版本依赖引入，**精确锁版本**（无 caret：`0.x` 的 `^0.2.1` 会把消费方锁在 `<0.3.0`，且历史上有 `^0.0.1` 死链事故）；不再用 `open/*` submodule

## 快速开始

```bash
# 需在 tailnet 内（能访 nexus.ts.huntercat.cn）
git clone ssh://git@gitlab.ts.huntercat.cn:2222/huntercat-digital/lieshou-app-mini-program.git
cd lieshou-app-mini-program

# 内网 Nexus 用 Caddy 自签 CA，而 node 不读系统信任库 —— 不设这个变量 pnpm install 会报
# UNABLE_TO_GET_ISSUER_CERT_LOCALLY（CI 里指向 runner 挂载的 caddy-root.crt）
export NODE_EXTRA_CA_CERTS=~/.nexus-ca/caddy-root.crt   # 用 caddy-root.crt 的副本也行

pnpm install
pnpm dev:weapp                            # 输出 dist/，微信开发者工具打开
pnpm dev:h5                               # H5 预览
```

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev:weapp` | 微信小程序开发(输出 dist/) |
| `pnpm dev:h5` | H5 预览 |
| `pnpm build:weapp` | 生产构建(输出 dist/) |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm test` | Vitest |

## 上游依赖（Nexus）

| 包 | 层 | 本端锁定版本 | 上游仓 |
| --- | --- | --- | --- |
| `@lieshoucloud/contract-api` | L0 契约（传输层） | `0.2.1` | lieshou-contract-api |
| `@lieshoucloud/contract-types` | L0 契约（类型） | `0.2.1` | lieshou-contract-types |
| `@lieshoucloud/i18n` | L0 契约（文案） | `0.2.0` | lieshou-i18n |
| `@lieshoucloud/core-web` | L1 业务逻辑 | `0.1.1` | lieshou-core-web |

- 制品在 `npm-hosted`，消费方经 `npm-group` 匿名解析（`.npmrc` 只给 `@lieshoucloud` scope 指向内网，公共包仍走默认源）
- 共享包**无构建步**：tarball 里是 TS 源码（`main`/`types` → `src/index.ts`），由端侧打包器消化——
  所以 `config/index.ts` 把它们加进了 `compile.include`（webpack 默认只编译 `sourceRoot`）

## 客户/行业装配

本仓只含**通用部分**;行业能力与客户定制由客户仓注入:

- `src/config/editions/extra.ts`:客户仓 `deploy:prepare` 生成的注入槽位(`EXTRA_PAGES` / `EXTRA_ENTRIES`)
- 客户 Edition 配置在客户仓(本仓仅 `generic` + `layer` 预设)
- `app.config.ts` 展开 `EXTRA_PAGES` 注册客户页面;workbench 渲染 `EXTRA_ENTRIES`
- 行业能力经 `edition.industries` 声明(industry 包为闭源商业模块)

## 共享层升级流程

共享层（`@lieshoucloud/*`）由独立仓维护，**经内网 Nexus 发版消费**（2026-09 起替代 `open/` submodule）：

1. 改共享仓（如 `lieshou-core-web`）→ 合并 → 打 `vX.Y.Z` tag（须等于 `package.json` version，且 CHANGELOG 有对应小节）→ CI 发布到 Nexus `npm-hosted`
2. 本端升级：改 `package.json` 里对应包的**精确版本号** → `pnpm install` 重生成 lockfile
3. 本端提交 `package.json` + `pnpm-lock.yaml`

> 前置依赖先发：`core-web` 的发布门禁会校验它依赖的 `contract-*` / `i18n` 已在 `npm-hosted` 上，缺则拒发。
> 版本矩阵与发布纪律见 `huntercat-ai-kit/SUPPLY_CHAIN.md`；tag 只允许在验证后打，发布点只增不改。

## 关联仓库

- 共享层(开源):`https://gitlab.ts.huntercat.cn/huntercat-digital/lieshou-cloud-web`
- 后端底座(开源):`https://gitlab.ts.huntercat.cn/huntercat-digital/lieshou-cloud`
- 其他端(开源):`lieshou-cloud-admin-web` · `lieshou-cloud-desktop` · `lieshou-cloud-mobile`
- 商业主仓:`https://gitlab.ts.huntercat.cn/huntercat-digital/lieshou-cloud-pro`

## License

Apache-2.0,见 [LICENSE](LICENSE)。
