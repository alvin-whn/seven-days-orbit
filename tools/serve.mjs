import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../',import.meta.url));
const portIndex = process.argv.indexOf('--port');
const port = portIndex >= 0 ? Number(process.argv[portIndex+1]) : 4173;
const types = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml' };
const server = http.createServer(async (request,response) => {
  try {
    const url = new URL(request.url,'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const candidate = path.resolve(root,'.' + pathname);
    // 预览只读公开静态资源，不暴露 Git、测试或运行证据目录。
    // Preview serves only public static assets, excluding Git, tests, and runtime evidence.
    const relative = path.relative(root,candidate).replaceAll('\\','/');
    if (relative.startsWith('..') || path.isAbsolute(relative) || /(^|\/)\./.test(relative) || !['','index.html','style.css','favicon.svg','src/engine.mjs','src/game.mjs'].includes(relative)) {
      response.writeHead(404); response.end('Not found'); return;
    }
    const file = candidate === root.replace(/[\\/]$/,'') || (await stat(candidate)).isDirectory() ? path.join(candidate,'index.html') : candidate;
    const content = await readFile(file);
    response.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    response.end(content);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(port,'127.0.0.1', () => process.stdout.write(`Seven Days Orbit: http://127.0.0.1:${server.address().port}\n`));
