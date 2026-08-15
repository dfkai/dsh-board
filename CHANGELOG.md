# Changelog

## v0.1.0 — 2026-08-15

首个版本：**sidebar 脚部的「⚡ 用量」统计台**（默认展开、可折叠，宽栏内联 / 窄栏浮层）：

- **🏆 中二段位**：9 级 ladder（🐣 词芽未醒 → 🌌 千亿创世者），跨会话累计 token 定级 + 升级进度条
- **亿级 hero**：渐变大字滚动计数（万/亿），「跨 N 个会话 · 总成本 ¥X」
- **💰 本会话**：成本 / 输入（含缓存命中率）/ 输出 / 合计（tokenUsage 投影 × pricing.ts）
- **🧮 分模型**：history 折叠 `request/header` + `assistant/chunk` usage → 每模型输入/输出 + 占比条
- **📈 每轮走势**（入/出堆叠柱）+ **📉 累计输出曲线**（SVG 渐变面积，零依赖）
- **📅 每日热力图**：GitHub 风格 12 周 × 7 天，按会话最近活跃日归集
- **🌌 全局会话榜**：全部会话 token 排名条形图
- **实时感**：LIVE 徽章 + StateDot 呼吸点 + 数字随流式跳动
- **默认展开、可折叠**：顶部 ✕ 收起按钮 + 限高（不遮对话）+ 折叠状态持久化；窄栏 ⚡ 浮层自下而上
- 开发循环：`pnpm build` + `pnpm sync -- <profile>`（HMR 热刷）；headless 验证脚本（`test/e2e.py`、`test/drive-turn.py`）

架构承诺：**零宿主代码、零存储**——宿主半是空 `apply` 的受治理条目；数据全走公开 seam（session-list store 投影 + `session.history` RPC）。
