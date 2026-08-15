window.__ModuleLoader__.load({
	id: "dsh-rich",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
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
		function Cell({ label, value, sub, accent, bar }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-rich-cell",
				style: accent === void 0 ? void 0 : { "--accent": accent },
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
		const RichStrip = (0, react.memo)(function RichStrip({ useProjection, useSessions, sessionId }) {
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-rich-strip",
				"data-dsh-rich-session": sessionId,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-rich-cells",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: "上下文占用",
							value: occupancy === null ? "—" : `${occupancy.percent}%`,
							sub: occupancy === null ? void 0 : `${formatTokens(occupancy.used)} / ${formatTokens(occupancy.window)}`,
							accent: occupancy !== null && occupancy.percent >= 90 ? "#ff5c7a" : "#7c5cff",
							bar: occupancy === null ? void 0 : { percent: occupancy.percent }
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: "Token 消耗",
							value: showTokens ? `↑${formatTokens(inputTokens)} · ↓${formatTokens(outputTokens)}` : "—",
							sub: stats !== void 0 && stats.decodeMs > 0 ? `解码 ${formatDuration(stats.decodeMs)}` : void 0
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: "后台任务",
							value: liveJobs.length > 0 ? `${liveJobs.length} 运行中` : jobs.length > 0 ? `${jobs.length} 条` : "无",
							sub: firstLiveJob === void 0 ? void 0 : truncate(firstLiveJob.label, 36),
							accent: liveJobs.length > 0 ? "#00e5ff" : void 0
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: "子代理",
							value: children.length === 0 ? "无" : `${runningSubs.length} / ${children.length} 运行中`,
							sub: runningSubs[0]?.label === void 0 ? void 0 : truncate(runningSubs[0].label, 36),
							accent: runningSubs.length > 0 ? "#7c5cff" : void 0
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: "轮次 / 步骤",
							value: stats === void 0 || stats.steps === 0 ? "—" : `${stats.turns} / ${stats.steps}`,
							sub: stats !== void 0 && stats.llmMs > 0 ? `LLM ${formatDuration(stats.llmMs)}` : void 0
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: "首 token 延迟",
							value: stats !== void 0 && stats.ttftSteps > 0 ? formatDuration(stats.ttftMs / stats.ttftSteps) : "—",
							sub: stats !== void 0 && stats.toolMs > 0 ? `工具 ${formatDuration(stats.toolMs)}` : void 0
						})
					]
				})
			});
		});
		//#endregion
		//#region src/client/style.ts
		/** AI-styled strip styles, injected once per factory materialization.
		*  The loader removes plugin-owned style tags on unload. */
		const CSS = `
.dsh-rich-strip {
  box-sizing: border-box;
  margin: 6px 0 2px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(124, 92, 255, 0.28);
  background:
    linear-gradient(135deg, rgba(124, 92, 255, 0.14) 0%, rgba(30, 144, 255, 0.10) 45%, rgba(0, 229, 255, 0.08) 100%),
    rgba(20, 22, 32, 0.72);
  backdrop-filter: blur(6px);
  color: #e8e6f5;
  font-size: 12px;
  line-height: 1.35;
}
.dsh-rich-cells {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dsh-rich-cell {
  flex: 1 1 120px;
  min-width: 110px;
  padding: 6px 9px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid var(--accent, rgba(255, 255, 255, 0.10));
  transition: border-color 180ms ease;
}
.dsh-rich-label {
  color: #9b96b8;
  font-size: 11px;
  letter-spacing: 0.02em;
}
.dsh-rich-value {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 600;
  color: #f4f2ff;
  font-variant-numeric: tabular-nums;
}
.dsh-rich-sub {
  margin-top: 1px;
  color: #8b87a8;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-rich-bar {
  height: 4px;
  margin-top: 5px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.dsh-rich-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #7c5cff, #00e5ff);
  transition: width 300ms ease;
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
		//#region src/client/index.ts
		/** Services required before the strip can register. */
		const inject = ["slots"];
		/** Register the strip on the conversation input dock (above the composer). */
		function apply(ctx) {
			injectRichStyles();
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "dsh-rich-strip",
				order: 100
			}, RichStrip)), "dsh-rich: dock registration");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map