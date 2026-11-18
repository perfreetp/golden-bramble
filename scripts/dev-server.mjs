// 极简开发服务器：esbuild 上下文监听 + 静态文件
import { context } from 'esbuild';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, '..');
const PORT = 5173;

const ctx = await context({
  entryPoints: [join(projectRoot, 'src/main.ts')],
  bundle: true,
  sourcemap: true,
  outdir: join(projectRoot, 'dist'),
  entryNames: 'bundle',
  loader: { '.css': 'css' },
  logLevel: 'info',
});
await ctx.watch();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = normalize(join(projectRoot, urlPath));
    if (!filePath.startsWith(projectRoot)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    // SPA 回退
    try {
      const fallback = await readFile(join(projectRoot, 'index.html'));
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(fallback);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  }
}).listen(PORT, () => {
  console.log(`\n🤖 机器人舞蹈平台已启动: http://localhost:${PORT}\n`);
});
