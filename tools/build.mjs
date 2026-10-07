import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../',import.meta.url));
const output = path.join(root,'dist');
const allowed = ['index.html','style.css','favicon.svg','sw.js','src/game.mjs','src/engine.mjs'];
// 发布包采用显式允许清单；不复制测试、Git 元数据或运行日志。
// Publish an explicit allowlist without copying tests, Git metadata, or runtime logs.
await mkdir(path.join(output,'src'),{ recursive:true });
for (const relative of allowed) await copyFile(path.join(root,relative),path.join(output,relative));
async function list(directory,prefix='') {
  const entries = await readdir(directory,{ withFileTypes:true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? list(path.join(directory,entry.name),prefix + entry.name + '/') : [prefix + entry.name]))).flat();
}
const files = await list(output);
if (files.length !== allowed.length || files.some(file => !allowed.includes(file))) throw new Error('Unexpected file in publish directory; inspect dist before retrying.');
process.stdout.write(`Static build: ${files.length} allowlisted files in dist/\n`);
