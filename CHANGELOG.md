# Changelog

## 1.0.0 — 2026-10-07

- 七段 84 秒轨道生存游戏；键盘/触屏转向、逐日难度、护盾与本地成绩。
- Seven-stage, 84-second survival game with keyboard/touch steering, increasing difficulty, shields, and local scores.
- 修复航程终点后扣盾与碰撞/绘制尺度不一致，使用短子步保持碰撞可靠。
- Fix post-deadline damage and inconsistent collision/render scales using short simulation substeps.
- 显式暂停/恢复与切换标签自动暂停；同源资源缓存支持首次加载后的离线刷新。
- Explicit pause/resume, automatic pause on tab changes, and same-origin caching for offline reload after initial load.
- 纯 Node 自动测试、固定版本的 CI Actions、GitHub Pages 与允许清单静态发行包。
- Dependency-free Node tests, pinned CI Actions, GitHub Pages, and allowlisted static release assets.
