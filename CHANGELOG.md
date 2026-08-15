# Changelog

## v0.1.0 — 2026-08-15

首个版本：挂在 `conversation.input.dock` 的 AI 风格实时监控带，定位为**官方 stats 条的增量补充**（官方已有会话累计统计，本面板不复读）：

- **剩余预算**——`contextPressure` 投影：剩余 token + 按每轮平均输入预测剩余轮数，渐变进度条（≥90% 警示圆点）
- **本轮**——最近一轮的本轮视角：输出 token / 步数 / 耗时（`nodes` + `turnTimings` 快照折叠）
- **流式速率**——流式期间实时 ≈tok/s（1Hz 采样增长）+ 已流式时长
- **后台任务**——运行中数量 + 首个任务实时已运行计时（秒级）
- **子代理**——`subagentsByParent` 镜像：运行中 / 总数 + 标签
- 空会话折叠为一行占位；主题 token 自适应；中英双语
- 开发循环：`pnpm build` + `pnpm sync -- <profile>`（HMR 热刷）；headless 验证脚本（`test/e2e.py`、`test/drive-turn.py`）

架构承诺：**零宿主代码、零 RPC、零存储**——数据来自宿主会话投影与 runtime store/快照镜像（`session/projection`、`session/jobs` frame），只依赖公开 seam。
