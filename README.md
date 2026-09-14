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
- 共享层 `@lieshoucloud/{contract-api,contract-types,contract-config,core-web,i18n}` 经**内网 Nexus** `npm-group` 消费（作用域包，无需 submodule，不再是 workspace:*）

## 快速开始

```bash
# 需要能访问 https://nexus.ts.huntercat.cn/repository/npm-group/（内网 Caddy 自签 CA）
git clone ssh://git@gitlab.ts.huntercat.cn:2222/huntercat-digital/lieshou-app-mini-program.git
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

## 客户/行业装配

本仓只含**通用部分**;行业能力与客户定制由客户仓注入:

- `src/config/editions/extra.ts`:客户仓 `deploy:prepare` 生成的注入槽位(`EXTRA_PAGES` / `EXTRA_ENTRIES`)
- 客户 Edition 配置在客户仓(本仓仅 `generic` + `layer` 预设)
- `app.config.ts` 展开 `EXTRA_PAGES` 注册客户页面;workbench 渲染 `EXTRA_ENTRIES`
- 行业能力经 `edition.industries` 声明(industry 包为闭源商业模块)

## 共享层升级流程

共享层（`@lieshoucloud/*`）由独立仓维护，**经内网 Nexus 发版消费**（2026-09 起替代 `open/` submodule）：

1. 改共享仓（如 `lieshou-core-web`）→ 合并 → 打 `vX.Y.Z` tag → CI 发布到 Nexus `npm-hosted`
2. 本端升级：`pnpm up @lieshoucloud/core-web@^0.2.0`（或手改 `package.json` 后 `pnpm install`）
3. 本端提交 `package.json` + `pnpm-lock.yaml`

> 版本矩阵见 ai-kit `SUPPLY_CHAIN.md`；tag 只允许在验证后打，发布点只增不改。

## 关联仓库

- 共享层(开源):`https://gitlab.ts.huntercat.cn/huntercat-digital/lieshou-cloud-web`
- 后端底座(开源):`https://gitlab.ts.huntercat.cn/huntercat-digital/lieshou-cloud`
- 其他端(开源):`lieshou-cloud-admin-web` · `lieshou-cloud-desktop` · `lieshou-cloud-mobile`
- 商业主仓:`https://gitlab.ts.huntercat.cn/huntercat-digital/lieshou-cloud-pro`

## License

Apache-2.0,见 [LICENSE](LICENSE)。
