# Changelog

## v0.1.0 — 2026-08-15

首个版本：挂在 `conversation.input.dock` 的 AI 风格实时监控带。

- **上下文占用**——`contextPressure` 投影：已用 / 窗口上限 + 渐变进度条，≥90% 红色高亮
- **Token 消耗**——`tokenUsage` 投影：输入 / 输出（会话级计费口径）
- **后台任务**——`jobsBySession` store 镜像：运行中数量 + 首个任务标签
- **子代理状态**——`subagentsByParent` store 镜像：运行中 / 总数 + 标签
- **轮次 / 步骤**、**首 token 延迟**——`sessionStats` 投影（LLM / 工具耗时副行）
- 空会话折叠为一行占位，首个数据出现后展开完整卡片
- 开发循环：`pnpm build` + `pnpm sync -- <profile>`（HMR 热刷）；headless 验证脚本（`test/e2e.py`、`test/drive-turn.py`）

架构承诺：**零宿主代码、零 RPC、零存储**——全部数据来自宿主已有会话投影与 runtime store 镜像（`session/projection`、`session/jobs` frame），只依赖公开 seam。
