# dsh-rich

给 [DeepSeek Harness（dsh）](https://github.com/deepseek-ai/deepseek-harness) 的 Web client 面板组合包（bundle）：在对话 composer 上方加一条 **AI 风格实时监控带**。刻意**不与官方 stats 条重复**——官方已有会话累计统计，这里只做四个增量：

- **剩余预算**——`contextPressure` 投影：剩余 token 数 + **按当前每轮平均输入预测还能跑几轮**；
- **本轮**——上一轮（或进行中轮）的**本轮视角**输出 token、步数、耗时（官方只有会话累计）；
- **流式速率**——输出流式期间的**实时 tok/s** + 已流式时长（采样增长速率，≈ 估算）；
- **后台任务**——运行中数量 + **首个任务的实时已运行计时**（秒级跳动）；
- **子代理**——运行中 / 总数 + 标签。

全部数据来自宿主**已有的会话投影**（`tokenUsage` / `contextPressure` / `sessionStats`）：本插件零宿主逻辑、零 RPC、零存储，浏览器半通过框架的 per-session 投影座读取，挂载在 `conversation.input.dock` slot（composer 上方的整行 list 位，与官方读数共存）。

## 安装

本地开发（从 tarball 安装；`add .` 的 link 形式解析不到宿主包）：

```sh
pnpm pack
dsh plugin --profile webtest add ./dsh-rich-0.1.0.tgz
```

发布后：

```sh
dsh plugin --profile webtest add github:dfkai/dsh-rich
```

装完 `dsh --profile webtest --dump-config` 应出现 `# == dsh-rich` 层；重启 profile 后打开页面即可看到监控带。

## 开发循环

```
改 src → pnpm build → pnpm sync -- <profile 目录> → 浏览器热更
```

宿主侧 HMR 轮询已安装 bundle 的 mtime，`sync` 把新构建的 `lib/client.js(+.map)` 拷进安装副本即可热刷（无需重启、无需重装 tarball）：

```sh
pnpm sync -- ~/.dsh/profiles/webtest
```

只有改 manifest（package.json / cordis.patch.yml）才需要重装 tarball + 重启 profile。

### 无头验证（可选）

```sh
python3 -m playwright install chromium          # 首次
python3 test/e2e.py                             # 面板挂载 + 控制台错误检查
python3 test/drive-turn.py '用一句话介绍你自己'   # 驱动真实对话，读面板数值
```

## 架构说明（只依赖公开接口）

| 面 | 内容 |
| --- | --- |
| 宿主半 `src/index.ts` | 空 `apply` 的受治理条目（与官方 client 插件同构），让宿主 Loader 管生命周期、插件注册表发现 `dsh.client` |
| 浏览器半 `src/client/*` | `ctx.slots.inject('conversation.input.dock', …)` 注册面板；组件接收框架标准道具（`useProjection`/`useSession`/`sessionId`） |
| 构建 `tsdown.config.ts` | 复刻官方 shared preset：CJS 闭包工厂（`window.__ModuleLoader__.load`）+ 平台白名单 externals（react 系/cordis/ui-slots 等）+ 其余全部内联 |
| 数据 | 宿主已注册的会话投影单元（`dsh-token-meter`、`dsh-session-stats`），随 `session/projection` push frame 到达浏览器 |

## License

[MIT](./LICENSE)
