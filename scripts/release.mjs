#!/usr/bin/env node
/**
 * 发版工具（本仓无 npm 制品：发版 = 版本号单一真源 + CHANGELOG + 发布点 tag）
 *
 *   node scripts/release.mjs sync                 # package.json → src/config/version.ts
 *   node scripts/release.mjs check                # 漂移检查（CI 门禁；漂移 exit 1）
 *   node scripts/release.mjs bump <patch|minor|major>   # 升版本 + sync + CHANGELOG 骨架
 *   node scripts/release.mjs notes                # 打印当前版本在 CHANGELOG 里的小节
 *   node scripts/release.mjs tag [name]           # 在 origin/main 最新提交上打发布点 tag 并推送
 *
 * 发布点命名（SUPPLY_CHAIN §3：非 L0 仓用 `release-YYYY-MM`）：
 *   默认 `release-YYYY-MM`；若已存在则 `release-YYYY-MM.N`（发布点不可变，只增不改）。
 *
 * 纪律：main 受保护 → 版本号改动走「分支 + MR」；tag 由维护者在合并后的 main 上打（本脚本 tag 子命令）。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const PKG_FILE = resolve(ROOT, 'package.json');
const VERSION_FILE = resolve(ROOT, 'src/config/version.ts');
const CHANGELOG_FILE = resolve(ROOT, 'CHANGELOG.md');

const VERSION_FILE_HEAD = '/** 应用版本（由 scripts/release.mjs sync 从 package.json 生成 · 勿手改） */';
const readPkg = () => JSON.parse(readFileSync(PKG_FILE, 'utf8'));
const readVersionFile = () => (existsSync(VERSION_FILE) ? readFileSync(VERSION_FILE, 'utf8') : '');
const renderVersionFile = (v) => `${VERSION_FILE_HEAD}\nexport const APP_VERSION = '${v}';\n`;
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

function sync() {
  const want = renderVersionFile(readPkg().version);
  if (readVersionFile() !== want) {
    writeFileSync(VERSION_FILE, want);
    console.log(`[release] sync  src/config/version.ts → ${readPkg().version}`);
  } else {
    console.log(`[release] sync  已一致（${readPkg().version}）`);
  }
}

function check() {
  const v = readPkg().version;
  if (readVersionFile() !== renderVersionFile(v)) {
    console.error(
      `[release] ❌ src/config/version.ts 与 package.json（${v}）漂移 → 跑 \`pnpm version:sync\` 后提交`,
    );
    process.exit(1);
  }
  console.log(`[release] check ✓ ${v}`);
}

function bump(kind) {
  if (!['patch', 'minor', 'major'].includes(kind)) {
    console.error('[release] 用法: bump <patch|minor|major>');
    process.exit(2);
  }
  const pkg = readPkg();
  const [maj, min, pat] = pkg.version.split('.').map(Number);
  const next =
    kind === 'major' ? `${maj + 1}.0.0` : kind === 'minor' ? `${maj}.${min + 1}.0` : `${maj}.${min}.${pat + 1}`;
  pkg.version = next;
  writeFileSync(PKG_FILE, `${JSON.stringify(pkg, null, 2)}\n`);
  sync();

  const date = new Date().toISOString().slice(0, 10);
  const section = `## ${next}（${date}）\n\n- （待填：本次变更要点）\n`;
  const old = existsSync(CHANGELOG_FILE) ? readFileSync(CHANGELOG_FILE, 'utf8') : '# Changelog\n';
  if (old.includes(`## ${next}（`)) {
    console.log(`[release] bump  CHANGELOG 已有 ${next} 小节，未改`);
  } else {
    const head = old.startsWith('# ') ? old.slice(old.indexOf('\n') + 1).replace(/^\n*/, '') : old;
    writeFileSync(CHANGELOG_FILE, `# Changelog\n\n${section}\n${head}`);
    console.log(`[release] bump  CHANGELOG 插入 ${next} 小节（记得填内容）`);
  }
  console.log(`[release] ${pkg.version} 就绪 → 开分支 + MR 合并后跑 \`pnpm release:tag\``);
}

function notes() {
  const v = readPkg().version;
  const text = existsSync(CHANGELOG_FILE) ? readFileSync(CHANGELOG_FILE, 'utf8') : '';
  // 按行扫描：从 `## <version>（…）` 开始，到下一个 `## ` 或文件末尾
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.startsWith(`## ${v}（`) || l.startsWith(`## ${v}(`));
  if (start < 0) {
    process.stdout.write(`## ${v}\n`);
    return;
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith('## '));
  const body = (end < 0 ? rest : rest.slice(0, end)).join('\n').trim();
  process.stdout.write(`${lines[start]}\n${body ? `\n${body}\n` : ''}`);
}

function tag(name) {
  const now = new Date();
  const base = name ?? `release-${now.toISOString().slice(0, 7)}`;
  git('fetch', 'origin', 'main', '--tags');
  const existing = git('tag', '-l').split('\n').filter(Boolean);
  let tagName = base;
  for (let i = 1; existing.includes(tagName); i += 1) tagName = `${base}.${i}`;

  const sha = git('rev-parse', 'origin/main');
  const version = readPkg().version;
  const body = notes();
  const message = `发布点 ${tagName} · v${version}\n\n${body}`;
  execFileSync('git', ['tag', '-a', tagName, sha, '-m', message], { cwd: ROOT, stdio: 'inherit' });
  execFileSync('git', ['push', 'origin', tagName], { cwd: ROOT, stdio: 'inherit' });
  console.log(`[release] 已推送 ${tagName} → ${sha.slice(0, 8)}（v${version}）`);
}

const [cmd, arg] = process.argv.slice(2);
switch (cmd) {
  case 'sync': sync(); break;
  case 'check': check(); break;
  case 'bump': bump(arg); break;
  case 'notes': notes(); break;
  case 'tag': tag(arg); break;
  default:
    console.error('用法: node scripts/release.mjs <sync|check|bump <kind>|notes|tag [name]>');
    process.exit(2);
}
