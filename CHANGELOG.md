# Changelog

## v0.1.0 — 2026-08-15（持续更新）

首个版本：**sidebar 脚部的用量/成本面板**（默认展开、可折叠；宽栏徽章升顶展开 / 窄栏浮层）：

- **💰 计费**：官方价目（v4-pro / v4-flash / 旧模型），2026-08-17 起按北京时间峰谷自动切价（高峰 9–12、14–18，闲时半价）；本会话按主导模型计价
- **🏆 「词勋」十级段位**：谐音梗 ladder（未醒词芽 → … → 万亿词神），会员卡：上一位/当前/下一位、进度、解锁 ETA、每级权益
- **🧮 分模型 / 每轮走势 / 累计输出曲线 / 12 周日热力图 / 全局会话榜**
- **📊 1M 上下文块**：占用 %、剩余预算、系统/工具/消息构成
- **🔥 成就**：连续打卡 + 9 枚数据驱动徽章
- **🎨 视觉**：Geist 克制风、零装饰动画、横版渐变色徽章、明暗主题适配
- 开发循环：`pnpm build` + `pnpm sync -- <profile>`；headless 验证（`test/e2e.py`、`test/drive-turn.py`）

### 2026-08-17 审计批次

- **计价**：未知模型按当前时刻表默认模型计价；累计成本按各会话活跃时刻计价（不再随打开时段漂移）；cacheWrite 计入折叠输入；NaN 防御
- **主题**：品牌强调色改用 business-primary（DeepSeek 蓝）；次级表面改用 bg-skeleton（亮色不再白上白）；段位色加深保证白字对比度
- **i18n/a11y**：万/亿随语言切换（en 用 K/M/B）；趋势图/热力图/阶梯 tooltip 走 t()；窄栏按钮 aria-label；新用户空态
- **性能**：useSessions 摘要相等订阅（无关列表噪音不再整面板重渲染）；history 不再每步重拉；图表 memo 真正生效；bundle minify（66KB→45KB）、不再发 sourcemap
- **窄栏浮层**：视口定位弹出（修复被 56px 侧栏裁剪）
- **工程**：description/keywords/inject 清单修正；prepack 构建门禁；LICENSE 署名

架构承诺：**零宿主代码**——宿主半是空 `apply` 的受治理条目；数据全走公开 seam（session-list store 投影 + `session.history` RPC）；仅 localStorage 记忆折叠状态。
