# dsh-board

给 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness) 的 **侧栏用量与成本面板**：把 DeepSeek 后台风格的用量统计装进 Web GUI 左下角。

<img src="assets/demo.gif" alt="dsh-board demo" width="100%">

[![version](https://img.shields.io/badge/version-v0.1.0-blue)](https://github.com/dfkai/dsh-board/releases)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## 特性

- **💰 计费估算**：官方价目 + 2026-08-17 起北京时间峰谷自动切价（高峰 09:00–12:00、14:00–18:00，闲时半价）；推理 token 按输出价计入；口径详见下文
- **🧠 1M 上下文**：占用 %、剩余预算、系统/工具/消息构成堆叠条、子代理耗时
- **📈 可视化**：每轮输入/输出走势、累计输出曲线、12 周日热力图、分模型统计、全局会话榜
- **🏆 「词勋」段位**：十级谐音梗阶梯（🌱 未醒词芽 → 🧲 万词王 → ⚡ 万亿词神），会员卡式展示：进度条、解锁 ETA、每级权益
- **🔥 成就**：连续打卡天数 + 9 枚数据驱动徽章
- **🎨 视觉**：Geist 克制风、明暗主题适配、中英双语、零装饰动画
- **🖼 横版徽章**：收起为菜单宽瓷砖（段位标签 + ¥ 花费 + 总 token + 今日本周）；点击后徽章升到面板顶部展开，再点收起

## 安装

```sh
dsh plugin --profile <profile> add github:dfkai/dsh-board@v0.1.0
```

装完重启该 profile（或新起 `dsh --profile <profile>`），左侧栏底部即可看到徽章。验证：

```sh
dsh --profile <profile> --dump-config   # 应出现 # == dsh-board 层
```

> **harness 版本要求**：推理 token 按输出价计入用量需要 harness 的 token-meter 修复（commit `00145f29a7`，2026-08-15；已提交官方社区见 [discussions/2338](https://github.com/deepseek-ai/deepseek-harness/discussions/2338)）。旧 harness 上分模型/每轮图表仍会计入推理 token，但累计总量与成本会少算推理部分。

## 计费口径

面板显示的是**估算值，不是计费凭证**，以 DeepSeek 平台账单为准。

**标准价**（¥ / 1M tokens，2026-08-15 抓取自[官方价目](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)）：

| 模型 | 缓存命中 | 缓存未命中 | 输出 |
|---|---|---|---|
| deepseek-v4-pro | 0.025 | 3 | 6 |
| deepseek-v4-flash | 0.02 | 1 | 2 |
| deepseek-chat（旧） | 0.5 | 2 | 8 |
| deepseek-reasoner（旧） | 1 | 4 | 16 |

**峰谷价**（2026-08-17 00:00 北京时间生效，高峰 09:00–12:00、14:00–18:00，闲时为高峰一半）：

| 模型 | 时段 | 缓存命中 | 缓存未命中 | 输出 |
|---|---|---|---|---|
| deepseek-v4-pro | 高峰 | 0.30 | 9.0 | 27 |
| | 闲时 | 0.15 | 4.5 | 13.5 |
| deepseek-v4-flash | 高峰 | 0.10 | 3.0 | 9 |
| | 闲时 | 0.05 | 1.5 | 4.5 |

口径说明：

- **推理 token 按输出价计入**（DeepSeek 官方计费口径），`reasoningTokens` 已并入输出
- **本会话成本**按主导模型计价；**累计成本**按各会话最近活跃时刻对应的峰谷价与默认模型（v4-pro）估算
- 未知模型回落当前时刻价表中默认模型的费率

## 数据与隐私

全部数据来自本机 DSH 的公开接口（`session.list` 投影 + `session.history` RPC）。插件**不发起任何第三方网络请求**，唯一持久化是浏览器 localStorage 里的面板折叠状态。

## FAQ

**为什么总 token 是亿级？**

账单口径与 DeepSeek 后台一致：每轮对话都会对上下文前缀按「缓存命中」价计费。1M 窗口的会话聊几十轮就会累计到亿级命中 token——它们单价极低（¥0.025/M），面板副行显示「缓存命中 N%」帮你区分便宜账与真实消耗。

**成本准吗？**

按官方价目估算（峰谷自动切换、推理 token 已计入），不是计费凭证。累计成本按默认模型与各会话活跃时刻估算，具体金额以 DeepSeek 平台账单为准。

**数据会外发吗？**

不会。全部统计在本机完成，无任何网络外发请求。

## 开发

```sh
pnpm install
pnpm build                  # 构建 lib/
pnpm sync -- <profile 目录>  # 同步到已安装副本，HMR 自动热刷
```

- 改 `src/` → build → sync → 浏览器热更；只有改 manifest（package.json / cordis.patch.yml）才需要重装重启
- 无头验证（可选）：

```sh
python3 -m playwright install chromium
python3 test/e2e.py                 # 徽章/面板挂载 + 控制台错误检查
python3 test/drive-turn.py '...'    # 驱动真实对话读面板数值
```

## 架构

只依赖 DSH 公开 seam：

| 面 | 内容 |
|---|---|
| 宿主半 `src/index.ts` | 空 `apply` 的受治理条目（与官方 client 插件同构） |
| 浏览器半 `src/client/*` | `ctx.slots.inject('sidebar.footer.action', …)` 注册横版徽章；数据 = session-list store 的 `projectionValues` + `session.history` RPC 折叠 |
| 构建 `tsdown.config.ts` | CJS 闭包工厂（`window.__ModuleLoader__.load`）+ 平台白名单 externals |

## License

[MIT](./LICENSE)
