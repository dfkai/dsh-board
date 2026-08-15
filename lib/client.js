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
		/** Rough mixed-text heuristic (CJK ≈ 1 token/char, latin ≈ 4 chars/token). */
		const TOKENS_PER_CHAR = .55;
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
		/** Total text characters of the in-flight partial assistant message. */
		function partialTextLength(partial) {
			if (partial === null) return 0;
			let total = 0;
			for (const block of partial.blocks) if ("text" in block) total += String(block.text).length;
			return total;
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
		* The monitor strip: a bottom panel above the composer. Deliberately shows
		* only what the shipped stats line does NOT: context budget projection,
		* per-turn (not whole-log) figures, a live streaming rate, and live task
		* timers. Whole-session stats stay with the built-in strip.
		*/
		const RichStrip = (0, react.memo)(function RichStrip({ useProjection, useSessions, useSession, sessionId, t }) {
			const usage = useProjection("tokenUsage");
			const pressure = useProjection("contextPressure");
			const stats = useProjection("sessionStats");
			const jobs = useSessions((s) => s.jobsBySession[sessionId]) ?? NO_JOBS;
			const subs = useSessions((s) => s.subagentsByParent[sessionId]) ?? NO_SUBS;
			const nodes = useSession((s) => s.nodes);
			const turnTimings = useSession((s) => s.turnTimings);
			const partialLen = useSession((s) => partialTextLength(s.partial));
			const running = useSession((s) => s.running);
			const inputTokens = usage === void 0 ? 0 : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
			const occupancy = (() => {
				const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
				if (used === void 0 || pressure?.contextWindow === void 0) return null;
				return {
					percent: Math.min(100, Math.round(used / pressure.contextWindow * 100)),
					used,
					window: pressure.contextWindow
				};
			})();
			const latestTurn = (0, react.useMemo)(() => {
				let turn = -1;
				for (const node of nodes) if (node.kind === "assistant" && node.turn > turn) turn = node.turn;
				if (turn < 0) return null;
				let steps = 0;
				let outTokens = 0;
				for (const node of nodes) {
					if (node.kind !== "assistant" || node.turn !== turn) continue;
					steps += 1;
					const usageOf = node.usage;
					if (typeof usageOf?.outputTokens === "number" && Number.isFinite(usageOf.outputTokens)) outTokens += usageOf.outputTokens;
				}
				const timing = turnTimings.get(turn);
				const durationMs = timing !== void 0 && timing.endTime !== void 0 ? Math.max(0, timing.endTime - timing.startTime) : null;
				return {
					turn,
					steps,
					outTokens,
					durationMs
				};
			}, [nodes, turnTimings]);
			const lenRef = (0, react.useRef)(partialLen);
			lenRef.current = partialLen;
			const sampleRef = (0, react.useRef)({
				at: 0,
				chars: 0,
				startedAt: null
			});
			const [rate, setRate] = (0, react.useState)(0);
			const [elapsedSec, setElapsedSec] = (0, react.useState)(0);
			const streaming = running || partialLen > 0;
			(0, react.useEffect)(() => {
				if (!streaming) {
					setRate(0);
					setElapsedSec(0);
					return;
				}
				if (sampleRef.current.startedAt === null) {
					sampleRef.current.startedAt = Date.now();
					sampleRef.current.chars = lenRef.current;
					sampleRef.current.at = Date.now();
				}
				const timer = setInterval(() => {
					const now = Date.now();
					const dt = (now - sampleRef.current.at) / 1e3;
					const dChars = Math.max(0, lenRef.current - sampleRef.current.chars);
					if (dt >= .5) {
						setRate(dChars / dt * TOKENS_PER_CHAR);
						sampleRef.current.chars = lenRef.current;
						sampleRef.current.at = now;
					}
					setElapsedSec((now - (sampleRef.current.startedAt ?? now)) / 1e3);
				}, 1e3);
				return () => {
					clearInterval(timer);
					sampleRef.current.startedAt = null;
				};
			}, [streaming]);
			const liveJobs = jobs.filter((job) => job.status === "running" || job.status === "stopping");
			const firstLiveJob = liveJobs[0];
			const [now, setNow] = (0, react.useState)(() => Date.now());
			(0, react.useEffect)(() => {
				if (liveJobs.length === 0) return;
				const timer = setInterval(() => setNow(Date.now()), 1e3);
				return () => clearInterval(timer);
			}, [liveJobs.length]);
			const children = subs.entries.filter((entry) => entry.kind === "child");
			const runningSubs = children.filter((entry) => entry.activity === "running");
			if (!(occupancy !== null || stats !== void 0 && stats.turns > 0 || jobs.length > 0 || children.length > 0 || streaming || nodes.length > 0)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-rich-strip dsh-rich-empty",
				"data-dsh-rich-session": sessionId,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dsh-rich-empty-text",
					children: t("empty")
				})
			});
			const remaining = occupancy === null ? null : occupancy.window - occupancy.used;
			const avgInputPerTurn = stats !== void 0 && stats.turns > 0 ? inputTokens / stats.turns : null;
			const projectedTurns = remaining !== null && avgInputPerTurn !== null && avgInputPerTurn > 0 ? Math.floor(remaining / avgInputPerTurn) : null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-rich-strip",
				"data-dsh-rich-session": sessionId,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-rich-cells",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.budget"),
							value: occupancy === null ? "—" : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [occupancy.percent >= 90 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
								state: "warning",
								className: "dsh-rich-dot"
							}) : null, formatTokens(remaining ?? 0)] }),
							sub: occupancy === null ? void 0 : projectedTurns !== null ? t("budget.sub", {
								percent: occupancy.percent,
								turns: projectedTurns
							}) : t("budget.subNoTurns", { percent: occupancy.percent }),
							bar: occupancy === null ? void 0 : { percent: occupancy.percent }
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.turn"),
							value: latestTurn === null ? "—" : `${formatTokens(latestTurn.outTokens)} tok`,
							sub: latestTurn === null ? void 0 : latestTurn.durationMs !== null ? t("turn.sub", {
								steps: latestTurn.steps,
								duration: formatDuration(latestTurn.durationMs)
							}) : t("turn.subLive", { steps: latestTurn.steps })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.rate"),
							value: streaming ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
								state: "ongoing",
								className: "dsh-rich-dot"
							}), rate > 0 ? `≈${Math.round(rate)} tok/s` : "…"] }) : t("rate.idle"),
							sub: streaming ? t("rate.elapsed", { elapsed: formatDuration(elapsedSec * 1e3) }) : void 0
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
							label: t("label.jobs"),
							value: liveJobs.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
								state: "ongoing",
								className: "dsh-rich-dot"
							}), t("value.jobs.running", { n: liveJobs.length })] }) : jobs.length > 0 ? t("value.jobs.count", { n: jobs.length }) : t("value.none"),
							sub: firstLiveJob === void 0 ? void 0 : `${truncate(firstLiveJob.label, 24)} · ${formatDuration(Math.max(0, now - firstLiveJob.startedAt))}`
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
							sub: runningSubs[0]?.label === void 0 ? void 0 : truncate(runningSubs[0].label, 24)
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
			"label.budget": "剩余预算",
			"label.turn": "本轮",
			"label.rate": "流式速率",
			"label.jobs": "后台任务",
			"label.subagents": "子代理",
			"budget.sub": "{percent}% 已用 · 约 {turns} 轮",
			"budget.subNoTurns": "{percent}% 已用",
			"turn.sub": "{steps} 步 · {duration}",
			"turn.subLive": "{steps} 步 · 进行中",
			"rate.idle": "空闲",
			"rate.elapsed": "已流式 {elapsed}",
			"value.none": "无",
			"value.jobs.running": "{n} 运行中",
			"value.jobs.count": "{n} 条",
			"value.subs.running": "{running} / {total} 运行中",
			"value.subs.idle": "{total} 个空闲",
			"empty": "dsh-rich · 发一句话后，这里会显示本轮 token、流式速率与任务状态"
		};
		const en = {
			"label.budget": "Budget left",
			"label.turn": "This turn",
			"label.rate": "Stream rate",
			"label.jobs": "Jobs",
			"label.subagents": "Subagents",
			"budget.sub": "{percent}% used · ~{turns} turns",
			"budget.subNoTurns": "{percent}% used",
			"turn.sub": "{steps} steps · {duration}",
			"turn.subLive": "{steps} steps · streaming",
			"rate.idle": "idle",
			"rate.elapsed": "streamed {elapsed}",
			"value.none": "none",
			"value.jobs.running": "{n} running",
			"value.jobs.count": "{n} total",
			"value.subs.running": "{running} / {total} running",
			"value.subs.idle": "{total} idle",
			"empty": "dsh-rich · send a message and this spot shows per-turn tokens, stream rate, and task state"
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