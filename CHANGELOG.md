# Changelog

## v0.1.0 — 2026-08-15

首个版本：**sidebar 脚部的用量面板**（对齐 DeepSeek 后台使用统计，官方 UI 没有的增量）：

- **计费**——`tokenUsage` 投影 × 可调价格表（`src/client/pricing.ts`，默认 deepseek-chat 公开价），hero 大数字 + 触发按钮实时 ¥ 金额
- **token 消耗**——输入（含缓存命中率）/ 输出 / 合计
- **每轮输出走势**——`session.history` RPC 折叠 `assistant/chunk` usage 事件 → 最近 24 轮迷你柱状图（SVG，零依赖）
- 挂载 `sidebar.footer.action`（Settings 旁，宽栏显示 `用量 ¥X.XX`，窄栏 `¥`），点击向上弹出
- 主题 token 自适应；中英双语；root 级 slot 数据路径（session-list store 的 `projectionValues` + history RPC）
- 开发循环：`pnpm build` + `pnpm sync -- <profile>`（HMR 热刷）；headless 验证脚本（`test/e2e.py`、`test/drive-turn.py`）

架构承诺：**零宿主代码、零存储**——宿主半是空 `apply` 的受治理条目；数据全走公开 seam（会话投影 + session-list store + `session.history` RPC）。
