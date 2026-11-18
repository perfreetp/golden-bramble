// 端到端验证：自动拉起临时 headless Chrome，依次跑单元测试、主冒烟、交互冒烟，最后清理
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9271;
const PROFILE = 'C:/Users/Administrator/AppData/Local/Temp/chrome-e2e-verify';
const BASE = `http://localhost:${PORT}`;

rmSync(PROFILE, { recursive: true, force: true });
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  '--no-first-run', '--no-default-browser-check', 'about:blank',
], { stdio: 'ignore', detached: false });

const waitPort = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/json/version`);
      if (res.ok) return;
    } catch { /* 重试 */ }
    await sleep(250);
  }
  throw new Error('Chrome 调试端口未就绪');
};

const run = async (cmd, args) => {
  const mod = await import('node:child_process');
  return new Promise((resolve) => {
    const p = mod.spawn(cmd, args, { shell: process.platform === 'win32' });
    let out = '';
    p.stdout.on('data', (d) => { out += d; process.stdout.write(d); });
    p.stderr.on('data', (d) => { out += d; process.stderr.write(d); });
    p.on('close', (code) => resolve({ code, out }));
  });
};

const rmProfile = () => {
  try {
    rmSync(PROFILE, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch {
    /* Chrome 进程刚退出时文件锁可能未释放，忽略残留的临时配置 */
  }
};

let failed = false;
try {
  await waitPort();

  const unit = await run('npm', ['test', '--silent']);
  if (unit.code !== 0) failed = true;

  const main = await run('node', ['scripts/smoke.mjs', String(PORT)]);
  if (main.code !== 0) failed = true;

  const inter = await run('node', ['scripts/smoke-interaction.mjs', String(PORT)]);
  if (inter.code !== 0) failed = true;

  console.log(`\n${failed ? '❌ 端到端验证存在失败项' : '✅ 端到端验证全部通过（单元 11 项 + 主冒烟 + 交互 9 项）'}`);
} finally {
  chrome.kill();
  await sleep(500);
  rmProfile();
}
process.exit(failed ? 1 : 0);
