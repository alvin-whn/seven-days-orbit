# 七日轨道 · Seven Days Orbit

给连续工作七天的自己，留下一条漂亮轨迹。

A small orbital survival game for a long working week. Built with AI, made for a break.

## 项目状态 / Project status

公开试玩：[alvin-whn.github.io/seven-days-orbit](https://alvin-whn.github.io/seven-days-orbit/)

Play online: [alvin-whn.github.io/seven-days-orbit](https://alvin-whn.github.io/seven-days-orbit/)

## 玩法 / How to play

左右方向键或 A、D 转向；触屏按住左右按钮。绿色星火加 150 分，红色碎片消耗护盾。每段航程 12 秒，共七段；完成后按剩余护盾奖励分数。

Steer with the left/right arrows or A/D; hold the on-screen buttons on touch devices. Green sparks award 150 points, red debris costs a shield. Survive seven 12-second stages for a remaining-shield bonus.

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
| `.github/workflows/ci.yml` | PR 验证与 main 上的 Pages 部署 / PR checks and Pages deployment from main |

参数调整以测试和真实试玩为依据；碰撞几何与绘制保持相同轨道比例，不能靠放宽测试断言掩盖故障。

Change parameters using tests and real play evidence. Keep collision and render geometry in the same orbit scale; never relax assertions to conceal defects.

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
