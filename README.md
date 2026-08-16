# dsh-board

给 [DeepSeek Harness（dsh）](https://github.com/deepseek-ai/deepseek-harness) 的 **侧栏用量面板**：把 DeepSeek 后台的用量统计装进你的 Web UI 左下角。

- **💰 计费**——官方价目（2026-08-17 起按北京时间 **峰谷自动切价**：高峰 9–12、14–18，闲时半价）；本会话按主导模型计价，累计成本按各会话活跃时刻 + 默认模型估算（口径见 FAQ）；
- **🧠 1M 上下文**——占用 %、剩余预算、以及「谁在吃窗口」（系统/工具/消息构成堆叠条）；
- **📈 可视化**——每轮输入/输出走势、累计输出曲线、GitHub 风格每日热力图、分模型占比、全局会话榜；
- **🏆 「词勋」会员段位**——十级谐音梗 ladder（🌱 未醒词芽 → 🥉 词途学徒 → 💬 白银之舌 → 💰 一词千金 → 🧲 万词王 → 🎯 亿词逐梦者 → 👑 十亿词霸 → 📜 词林盟主 → 🧚 词高八斗 → ⚡ 万亿词神），会员卡式展示：上一位/当前/下一位、进度条、预计解锁天数、每级权益；
- **🔥 成瘾机制**——连续打卡天数 + 9 枚数据驱动的成就徽章；
- **🖼 横版徽章**——收起后侧栏脚部是一块菜单宽的横版瓷砖（段位渐变色）：段位称号 + ¥ 花费 + 总 token + 今日本周；点击后徽章升到面板顶部展开明细，再点收起。

全部数据来自宿主公开接口（会话投影 + `session.history` RPC），**零宿主代码、零外发请求**——本机统计，不上传任何东西；仅用 localStorage 记忆面板折叠状态。

## 安装

```sh
dsh plugin --profile <你的 profile> add github:dfkai/dsh-board@v0.1.0
```

> 免构建：`lib/` 预构建产物随仓库发布，不需要任何构建授权或工具链。
> 装完重启该 profile（或新起 `dsh --profile <name>`），在左侧栏底部即可看到横版徽章。

验证安装：

```sh
dsh --profile <你的 profile> --dump-config   # 应出现 # == dsh-board 层
```

> **harness 版本要求**：推理 token 按输出价计入用量需要 harness 的 token-meter 补丁（commit `00145f29a7`，2026-08-15）。旧 harness 上分模型/每轮图表仍会计入推理 token，但累计总量与成本会少算推理部分。

## 配置

| 配置 | 位置 | 说明 |
|---|---|---|
| 价格表 | [`src/client/pricing.ts`](src/client/pricing.ts) | 官方价目（2026-08-15 抓取，含 v4-pro/v4-flash 峰谷表与生效时刻）；未知模型按默认模型（v4-pro）计价；改价后重新构建 |
| 显示语言 | 跟随应用 locale | 中英双语内置 |
| 折叠状态 | 浏览器 localStorage | 自动记忆 |

本插件**没有需要用户填写的密钥或 webhook**，装上即用。

## 常见问题

**为什么总 token 是亿级？**
账单口径与 DeepSeek 后台一致：每轮对话都会对上下文前缀按「缓存命中」价计费（¥0.025/M）。1M 窗口的会话聊几十轮就会累计到亿级命中 token——它们单价极低，面板 hero 副行会显示「缓存命中 N%」帮你区分便宜账与真金白银。

**成本准吗？**
按官方价目估算：本会话按主导模型计价；累计成本按各会话最近活跃时刻的峰谷价与默认模型（v4-pro）计价；推理 token 已按输出价计入。不是计费凭证，具体金额以 DeepSeek 平台账单为准。

**数据从哪来？会不会外发？**
全部来自本机 dsh 的公开接口（`session.list` 投影与 `session.history`），插件不发任何网络请求到第三方。

## 开发

```sh
pnpm install
pnpm build                  # 构建 lib/
pnpm sync -- <profile 目录>  # 同步到已安装副本，HMR 自动热刷
```

- 改 `src/` → build → sync → 浏览器热更；只有改 manifest（package.json / cordis.patch.yml）才需要重装重启；
- 无头验证（可选）：

```sh
python3 -m playwright install chromium
python3 test/e2e.py                 # 徽章/面板挂载 + 控制台错误检查
python3 test/drive-turn.py '...'    # 驱动真实对话读面板数值
```

## 架构（只依赖公开 seam）

| 面 | 内容 |
|---|---|
| 宿主半 `src/index.ts` | 空 `apply` 的受治理条目（与官方 client 插件同构） |
| 浏览器半 `src/client/*` | `ctx.slots.inject('sidebar.footer.action', …)` 注册横版徽章；数据 = session-list store 的 `projectionValues` + `session.history` RPC 折叠 |
| 构建 `tsdown.config.ts` | 复刻官方 shared preset：CJS 闭包工厂（`window.__ModuleLoader__.load`）+ 平台白名单 externals |

## License

[MIT](./LICENSE)
