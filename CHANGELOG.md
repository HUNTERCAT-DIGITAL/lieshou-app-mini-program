# Changelog

> 本仓无 npm 制品：发版 = 版本号（`package.json` 单一真源）+ 本文件小节 + 发布点 tag（`release-YYYY-MM[.N]`）。
> 工具：`scripts/release.mjs`（`pnpm release:bump <kind>` / `pnpm release:tag`）。

## 0.1.0（2026-09-15）

### 变更
- **上游共享包改走内网 Nexus 版本依赖**（精确版本，无 caret）：`@lieshoucloud/{contract-api,contract-types,core-web,i18n}`；
  删 7 个 `open/*` submodule + `.gitmodules`；`.npmrc` registry 指 `npm-group`（本仓只在 tailnet 内使用）
- **中性化**：删客户页面目录与 `tsconfig.<client>.json`（客户内容改由客户仓 `deploy:prepare` 注入，本仓 gitignore 白名单兜底）；
  `editions/extra.ts` 归零为空槽位（`EXTRA_HOME` / `EXTRA_PAGES` / `CUSTOM_API_BASE` / `EXTRA_NAV_COLOR`）；
  H5 标题、品牌色、存储 key 去客户化
- **接入 GitLab CI**（此前只有在内网 GitLab 不触发的 GitHub Actions）：`install --frozen-lockfile` +
  `version:check` + `typecheck` + `lint` + `test` + `build:weapp` + `build:h5`
- **发版链**：`scripts/release.mjs`（版本号单一真源 → `src/config/version.ts`）+ `release-*` tag 触发的
  Release job（weapp 包 + H5 包 → GitLab Packages + Release 制品）
- **端内更新提示**：`src/utils/update.ts` 接 `getUpdateManager`，新版本就绪时提示重启（仅 weapp）
- 修复：`pnpm-workspace.yaml` 不能缺（端须自成 workspace 根，否则交付仓里 pnpm 认到交付仓根的 workspace）；
  `app.config` 引用的 `EXTRA_NAV_COLOR` 槽位缺省具名导出，消除 `import-is-undefined` 告警；
  `forgot-password` 调 `resetPassword` 补 `tenantCode` 首参
