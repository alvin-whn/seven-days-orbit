# 七日轨道 · Seven Days Orbit

给连续工作七天的自己，留下一条漂亮轨迹。

A small orbital survival game for a long working week. Built with AI, made for a break.

## 项目状态 / Project status

游戏实现与验证在独立功能分支中进行，合并后提供公开试玩入口。

The playable implementation is developed and verified on a feature branch. The public play link will follow its merge.

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
