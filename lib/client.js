window.__ModuleLoader__.load({
	id: "dsh-rich",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/RichStrip.tsx
		const NO_JOBS = [];
		const NO_SUBS = { entries: [] };
		function formatTokens(n) {
			if (n < 1e3) return String(n);
			if (n < 1e6) return `${Math.round(n / 100) / 10}K`;
			return `${Math.round(n / 1e5) / 10}M`;
		}
		function formatDuration(ms) {
			const s = ms / 1e3;
			if (s < 60) return `${Math.round(s * 10) / 10}s`;
			const whole = Math.round(s);
			return `${Math.floor(whole / 60)}m${whole % 60}s`;
		}
		function truncate(text, max) {
			return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
		}
		function Cell({ label, value, sub, bar }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-rich-cell",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rich-label",
						children: label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rich-value",
						children: value
					}),
					sub === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rich-sub",
						children: sub
					}),
					bar === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rich-bar",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-rich-bar-fill",
							style: { width: `${bar.percent}%` }
						})
					})
				]
			});
		}
		/**
		* The monitor strip: a bottom panel above the composer, reading the durable
		* session projections (tokenUsage / contextPressure / sessionStats) through
		* the framework's per-session projection seat, plus the jobs and subagent
		* mirrors from the runtime's session-list store.
		*/
		const RichStrip = (0, react.memo)(function RichStrip({ useProjection, useSessions, sessionId, t }) {
			const usage = useProjection("tokenUsage");
			const pressure = useProjection("contextPressure");
			const stats = useProjection("sessionStats");
			const jobs = useSessions((s) => s.jobsBySession[sessionId]) ?? NO_JOBS;
			const subs = useSessions((s) => s.subagentsByParent[sessionId]) ?? NO_SUBS;
			const inputTokens = usage === void 0 ? 0 : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
			const outputTokens = usage?.outputTokens ?? 0;
			const showTokens = inputTokens > 0 || outputTokens > 0;
			const occupancy = (() => {
				const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
				if (used === void 0 || pressure?.contextWindow === void 0) return null;
				return {
					percent: Math.min(100, Math.round(used / pressure.contextWindow * 100)),
					used,
					window: pressure.contextWindow
				};
			})();
			const liveJobs = jobs.filter((job) => job.status === "running" || job.status === "stopping");
			const firstLiveJob = liveJobs[0];
			const children = subs.entries.filter((entry) => entry.kind === "child");
			const runningSubs = children.filter((entry) => entry.activity === "running");
			if (!(occupancy !== null || showTokens || stats !== void 0 && stats.steps > 0 || jobs.length > 0 || children.length > 0)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-rich-strip dsh-rich-empty",
				"data-dsh-rich-session": sessionId,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dsh-rich-empty-text",
					children: t("empty")
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-rich-strip",
				"data-dsh-rich-session": sessionId,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-rich-cells",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.context"),
							value: occupancy === null ? "—" : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [occupancy.percent >= 90 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
								state: "warning",
								className: "dsh-rich-dot"
							}) : null, `${occupancy.percent}%`] }),
							sub: occupancy === null ? void 0 : `${formatTokens(occupancy.used)} / ${formatTokens(occupancy.window)}`,
							bar: occupancy === null ? void 0 : { percent: occupancy.percent }
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.tokens"),
							value: showTokens ? `↑${formatTokens(inputTokens)} · ↓${formatTokens(outputTokens)}` : "—",
							sub: stats !== void 0 && stats.decodeMs > 0 ? t("sub.decode", { duration: formatDuration(stats.decodeMs) }) : void 0
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.jobs"),
							value: liveJobs.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
								state: "ongoing",
								className: "dsh-rich-dot"
							}), t("value.jobs.running", { n: liveJobs.length })] }) : jobs.length > 0 ? t("value.jobs.count", { n: jobs.length }) : t("value.none"),
							sub: firstLiveJob === void 0 ? void 0 : truncate(firstLiveJob.label, 36)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.subagents"),
							value: children.length === 0 ? t("value.none") : runningSubs.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
								state: "ongoing",
								className: "dsh-rich-dot"
							}), t("value.subs.running", {
								running: runningSubs.length,
								total: children.length
							})] }) : t("value.subs.idle", { total: children.length }),
							sub: runningSubs[0]?.label === void 0 ? void 0 : truncate(runningSubs[0].label, 36)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.turns"),
							value: stats === void 0 || stats.steps === 0 ? "—" : `${stats.turns} / ${stats.steps}`,
							sub: stats !== void 0 && stats.llmMs > 0 ? t("sub.llm", { duration: formatDuration(stats.llmMs) }) : void 0
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.ttft"),
							value: stats !== void 0 && stats.ttftSteps > 0 ? formatDuration(stats.ttftMs / stats.ttftSteps) : "—",
							sub: stats !== void 0 && stats.toolMs > 0 ? t("sub.tools", { duration: formatDuration(stats.toolMs) }) : void 0
						})
					]
				})
			});
		});
		//#endregion
		//#region src/client/style.ts
		/** AI-styled strip styles, injected once per factory materialization.
		*  The loader removes plugin-owned style tags on unload. Colors ride the
		*  shell's theme tokens (--dsw-alias-*) with dark fallbacks, so the strip
		*  follows the active theme without extra wiring. One accent voice: the
		*  brand gradient lives only on the context flow bar; status semantics ride
		*  ui-primitives StateDot. */
		const CSS = `
.dsh-rich-strip {
  box-sizing: border-box;
  margin: 8px 2px 4px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgba(127, 127, 255, 0.25)) 70%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1, rgba(24, 26, 38, 0.92)) 90%, var(--dsw-alias-brand-primary, #7c5cff) 6%);
  color: var(--dsw-alias-label-primary, #ecebf5);
  font-size: 12px;
  line-height: 1.4;
  animation: dsh-rich-enter 220ms ease;
}
@keyframes dsh-rich-enter {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: none; }
}
.dsh-rich-cells {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
  gap: 8px;
}
.dsh-rich-cell {
  position: relative;
  min-width: 0;
  padding: 8px 12px 9px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.04)) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgba(127, 127, 255, 0.18)) 55%, transparent);
  transition: border-color 160ms ease, transform 160ms ease;
}
.dsh-rich-cell:hover {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #7c5cff) 45%, transparent);
  transform: translateY(-1px);
}
.dsh-rich-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-label-secondary, #a09cb8);
  font-size: 11px;
  letter-spacing: 0.03em;
}
.dsh-rich-value {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #f6f4ff);
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
}
.dsh-rich-dot {
  line-height: 0;
  display: inline-flex;
}
.dsh-rich-sub {
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-rich-bar {
  height: 3px;
  margin-top: 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.10)) 85%, transparent);
  overflow: hidden;
}
.dsh-rich-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dsw-alias-brand-primary, #7c5cff), #00c2ff, var(--dsw-alias-brand-primary, #7c5cff));
  background-size: 200% 100%;
  animation: dsh-rich-flow 2.4s linear infinite;
  transition: width 300ms ease;
}
@keyframes dsh-rich-flow {
  from { background-position: 0% 0; }
  to { background-position: 200% 0; }
}
.dsh-rich-empty {
  padding: 5px 12px;
}
.dsh-rich-empty-text {
  color: var(--dsw-alias-label-secondary, #8f8ba8);
  font-size: 11px;
  letter-spacing: 0.02em;
}
`;
		/** Inject the strip stylesheet once (idempotent under re-evaluation). */
		function injectRichStyles() {
			if (typeof document === "undefined") return;
			if (document.querySelector("style[data-plugin=\"dsh-rich\"]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-rich";
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/locales.ts
		/** `rich` namespace dictionaries (zh is the key-set source of truth). */
		/** Dictionary namespace owned by this plugin. */
		const NS = "rich";
		const zh = {
			"label.context": "上下文占用",
			"label.tokens": "Token 消耗",
			"label.jobs": "后台任务",
			"label.subagents": "子代理",
			"label.turns": "轮次 / 步骤",
			"label.ttft": "首 token 延迟",
			"value.none": "无",
			"value.jobs.running": "{n} 运行中",
			"value.jobs.count": "{n} 条",
			"value.subs.running": "{running} / {total} 运行中",
			"value.subs.idle": "{total} 个空闲",
			"sub.decode": "解码 {duration}",
			"sub.llm": "LLM {duration}",
			"sub.tools": "工具 {duration}",
			"empty": "dsh-rich · 等待会话活动（token / 任务 / 子代理出现后展开）"
		};
		const en = {
			"label.context": "Context",
			"label.tokens": "Tokens",
			"label.jobs": "Jobs",
			"label.subagents": "Subagents",
			"label.turns": "Turns / Steps",
			"label.ttft": "TTFT",
			"value.none": "none",
			"value.jobs.running": "{n} running",
			"value.jobs.count": "{n} total",
			"value.subs.running": "{running} / {total} running",
			"value.subs.idle": "{total} idle",
			"sub.decode": "decode {duration}",
			"sub.llm": "LLM {duration}",
			"sub.tools": "tools {duration}",
			"empty": "dsh-rich · waiting for session activity (expands with tokens / jobs / subagents)"
		};
		//#endregion
		//#region src/client/index.ts
		/** Services required before the strip can register. */
		const inject = ["slots", "locale"];
		/** Register the strip on the conversation input dock (above the composer). */
		function apply(ctx) {
			injectRichStyles();
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-rich: dictionaries");
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "dsh-rich-strip",
				order: 100,
				locale: NS
			}, RichStrip)), "dsh-rich: dock registration");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map