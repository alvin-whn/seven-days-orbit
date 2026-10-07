# 七日轨道 · Seven Days Orbit

给连续工作七天的自己，留下一条漂亮轨迹。

A small orbital survival game for a long working week. Built with AI, made for a break.

## 项目状态 / Project status

公开试玩：[alvin-whn.github.io/seven-days-orbit](https://alvin-whn.github.io/seven-days-orbit/)

Play online: [alvin-whn.github.io/seven-days-orbit](https://alvin-whn.github.io/seven-days-orbit/)

## 玩法 / How to play

左右方向键或 A、D 转向；触屏按住左右按钮。绿色星火加 150 分，红色碎片消耗护盾。每段航程 12 秒，共七段；完成后按剩余护盾奖励分数。

Steer with the left/right arrows or A/D; hold the on-screen buttons on touch devices. Green sparks award 150 points, red debris costs a shield. Survive seven 12-second stages for a remaining-shield bonus.

空格、Esc、P 或暂停按钮可暂停/继续；切换标签自动暂停，回来后手动继续。首次成功加载并缓存后，可断网刷新继续游玩；首次访问仍需联网。

Space, Esc, P, or the pause button pauses/resumes. Switching tabs pauses automatically and requires manual resume. After a successful initial load and cache, the game can reload offline; the first visit requires connectivity.

成绩只存在本机浏览器。不需要账号，无分析统计、Cookie 或第三方资源请求。

Scores remain in this browser. No accounts, analytics, cookies, or third-party resource requests.

## 维护入口 / Maintenance map

| 文件 / File | 用途 / Purpose |
| --- | --- |
| `src/engine.mjs` | 纯模拟与碰撞、难度参数 / Pure simulation, collision, difficulty |
| `src/game.mjs` | Canvas 绘制、输入、成绩 / Canvas rendering, inputs, scores |
| `style.css` | 桌面与移动布局 / Desktop and mobile layout |
| `tests/` | 碰撞、截止时间与预览边界 / Collision, deadline, preview boundaries |
| `tools/build.mjs` | 发布文件允许清单 / Publish file allowlist |
| `sw.js` | 同源游戏资源离线缓存 / Same-origin game asset caching |
| `.github/workflows/ci.yml` | PR 验证与 main 上的 Pages 部署 / PR checks and Pages deployment from main |

参数调整以测试和真实试玩为依据；碰撞几何与绘制保持相同轨道比例，不能靠放宽测试断言掩盖故障。

Change parameters using tests and real play evidence. Keep collision and render geometry in the same orbit scale; never relax assertions to conceal defects.

## 验证、升级与回退 / Validation, upgrades, recovery

```sh
npm test
npm run build
```

上述命令已在本地 Node 26 与远端 CI Node 22 环境实际运行。PR 先通过 CI 再合并；main 的同一工作流部署 GitHub Pages。静态发行包仅含 6 个游戏资源文件，仓库源代码另由 GitHub 自动提供。

These commands were run locally on Node 26 and in remote CI on Node 22. Merge only after PR checks pass; the main workflow deploys GitHub Pages. The static release contains six game assets; GitHub also provides source archives.

升级游戏资源时同时更新 `sw.js` 的缓存版本与允许清单；Actions 按已核验的 SHA 固定，更新时先读上游变更再跑本项目测试。需要回退时新建分支 `git revert` 对应变更，走 PR 和 CI，禁止改写公开历史。

When upgrading assets, update the cache version and allowlist in `sw.js`. Actions are pinned to verified SHAs; review upstream changes and rerun tests before updating them. Recover through a new branch and `git revert`, followed by PR and CI; do not rewrite public history.

若旧页面未更新，正常刷新使网络优先缓存更新；仍异常时可只清除此站点的离线缓存。禁用存储只影响本地最佳成绩与离线能力，在线游戏仍可用。首次试玩无绘图时先查看浏览器控制台和资源状态；不通过 `file://` 打开 ES modules，请使用本地服务器。

Refresh normally to update network-first caches. If necessary, clear only this site's offline cache. Disabled storage affects best scores/offline support, not online gameplay. Inspect console/resource failures for a blank canvas; serve ES modules locally rather than opening them through `file://`.

## 贡献与署名 / Contributions and attribution

这是独立公开项目，由 alvin-whn 发起、OpenAI Codex 编码，使用 AI 子代理只读审阅并补充实际回归。第二个 PR 的 AI 作者使用不可投递的说明性邮箱，用户使用 GitHub noreply 共同署名；不虚构第二个人类 GitHub 账号。

This independent public project was initiated by alvin-whn and implemented by OpenAI Codex, with read-only AI-agent review and real regression fixes. The second PR uses an explicitly identified AI author with a non-deliverable email and the user's GitHub noreply coauthor trailer; no second human GitHub account is invented.

欢迎提交可复现问题或有实际价值的改进。项目保留完整测试、MIT 许可与公开开发历史；Profile Achievements 是开发副产品，不是项目质量指标。

Reproducible issues and useful improvements are welcome. Tests, MIT licensing, and public development history are retained; profile achievements are a development byproduct, not a quality metric.

## 本地开发 / Local development

Node.js 20 或更新版本；无第三方依赖，无需安装包。

Node.js 20 or newer; no third-party dependencies or package installation required.

```sh
npm run dev
npm test
```

预览默认仅监听本机 `http://127.0.0.1:4173`。端口被占用时可执行 `npm run dev -- --port 0` 自动选择空闲端口。

The preview binds to `http://127.0.0.1:4173` only. Use `npm run dev -- --port 0` to select an available port.

## 许可 / License

MIT。 / MIT.
