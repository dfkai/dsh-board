# Roadmap

> dsh-board 的公开路线图。安装与使用见 [README.md](README.md)；贡献与安全审查见各渠道说明。

## v0.1.0 — 已发布（2026-08-16）

- 分发三通道：npm（`dsh plugin add dsh-board@0.1.0`，首选）· GitHub 直装 · Release tarball
- 官方价目 + 2026-08-17 起北京时间峰谷自动切价；推理 token 按输出价计入
- 1M 上下文块、每轮走势、累计输出、12 周日热力图、分模型、全局会话榜
- 「词勋」十级段位、成就徽章、连续打卡；中英双语、明暗主题、零装饰动画
- 零宿主代码、零外发；CI 构建门禁；GitHub Release + 中英 README + 演示 GIF

## 进行中

- [ ] **Honeys 目录收录**：dsh.so 安全检测 → 补链 `/recheck`（issue [#4](https://github.com/dshoneys/awesome-dshoneys/issues/4)，源码静态初审已过，无硬阻断）
- [ ] **上游 token-meter 补丁**：推理 token 折入 outputTokens，见官方社区 [discussions/2338](https://github.com/deepseek-ai/deepseek-harness/discussions/2338)（官方 PR/Issues 通道关闭，走 Discussions）

## 计划（v0.2 候选，按优先级）

1. **累计成本按真实模型计价**：当前累计按默认模型（v4-pro）估算。计划在宿主半注册 per-session 主导模型/成本投影，消除这一口径限制
2. **类型安全**：harness client 包已发布到 npm（`@deepseek-ai/dsh-client-runtime@0.0.1-rc.1` 等）——引入 devDependencies，用真实类型替换手写的 `ApiLike`/事件形状，并补 `tsc --noEmit` 到 CI
3. **单元测试**：vitest 覆盖纯函数——`pricing.ts`（峰谷切换/生效时刻/未知模型回落）、`fold.ts`（格式化边界/推理折叠）、`levels.ts`（阶梯边界）
4. **上游跟进**：token-meter 补丁被官方合入后，放宽 README 的 harness 版本要求
5. 小项：英文复数细节（`heat.day`）、轨道浮层视觉微调、空态文案打磨

## 已决策（记录在案）

- **包名**：当前使用未 scope 的 `dsh-board`，已在 npm 占名，抢注风险消除；维持不变
- **产品定位**：实时侧栏仪表盘，不做定时报告类功能（与 usage-report 类插件差异化）
- **视觉**：零装饰动画；徽章渐变保留现有配色（设计选择，不再改动）

## 不计划

- 定时日报/周报/邮件报告（与产品定位冲突）
- 云端账单同步、跨设备漫游（违背"本地统计、零外发"承诺）
- 宿主侧写入任何数据（保持零宿主代码承诺）
