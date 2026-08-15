window.__ModuleLoader__.load({
	id: "dsh-rich",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/pricing.ts
		/**
		* Price table — ¥ per 1M tokens. Defaults mirror DeepSeek's public
		* deepseek-chat list prices; adjust to your plan here. Estimates only —
		* this plugin is not a billing source.
		*/
		const PRICING = {
			inputPerM: 2,
			cacheHitPerM: .5,
			cacheWritePerM: 2,
			outputPerM: 8
		};
		/** Estimate the session cost from the durable tokenUsage projection. */
		function estimateCost(usage) {
			return (usage.uncachedInputTokens + usage.cacheWriteTokens) * PRICING.inputPerM / 1e6 + usage.cacheReadTokens * PRICING.cacheHitPerM / 1e6 + usage.outputTokens * PRICING.outputPerM / 1e6;
		}
		//#endregion
		//#region src/client/SidebarUsage.tsx
		/** Fold assistant/chunk usage events into per-turn output tokens. */
		function foldTurnOutput(entries) {
			const perTurn = /* @__PURE__ */ new Map();
			for (const entry of entries) {
				const event = entry.event;
				if (event?.type !== "assistant/chunk") continue;
				const chunk = event.data?.chunk;
				if (chunk?.type !== "usage") continue;
				const turn = event.data?.turn;
				const out = chunk.usage?.outputTokens;
				if (turn === void 0 || typeof out !== "number") continue;
				perTurn.set(turn, (perTurn.get(turn) ?? 0) + out);
			}
			return [...perTurn.entries()].sort((left, right) => left[0] - right[0]).map(([turn, tokens]) => ({
				turn,
				tokens
			}));
		}
		function formatTokens(n) {
			if (n < 1e3) return String(n);
			if (n < 1e6) return `${Math.round(n / 100) / 10}K`;
			return `${Math.round(n / 1e5) / 10}M`;
		}
		function Row({ label, value, sub }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-rich-row",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dsh-rich-row-label",
					children: label
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "dsh-rich-row-end",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-rich-row-value",
						children: value
					}), sub === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-rich-row-sub",
						children: sub
					})]
				})]
			});
		}
		function Sparkline({ data }) {
			const last = data.slice(-24);
			if (last.length === 0) return null;
			const max = Math.max(1, ...last.map((item) => item.tokens));
			const width = last.length * 8 - 2;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "dsh-rich-spark",
				viewBox: `0 0 ${width} 28`,
				width,
				height: 28,
				"aria-hidden": true,
				children: last.map((item, index) => {
					const height = Math.max(2, Math.round(item.tokens / max * 26));
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: index * 8,
						y: 28 - height,
						width: 6,
						height,
						rx: 2,
						className: index === last.length - 1 ? "dsh-rich-spark-last" : "dsh-rich-spark-bar",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: `第 ${item.turn} 轮 · ${item.tokens} tok` })
					}, item.turn);
				})
			});
		}
		/**
		* Sidebar foot entry: a live cost trigger next to Settings. Clicking opens
		* the usage panel — estimated cost, token breakdown, and a per-turn output
		* sparkline — anchored above the sidebar foot. Root scope: reads the current
		* session's projections from the session-list store and folds recent turns
		* from the history RPC.
		*/
		function SidebarUsage({ wide, useSessions, api, t }) {
			const current = useSessions((s) => s.current);
			const summary = useSessions((s) => s.current === void 0 ? void 0 : s.byId[s.current]);
			const usage = summary?.projectionValues?.tokenUsage;
			const steps = (summary?.projectionValues?.sessionStats)?.steps;
			const [open, setOpen] = (0, react.useState)(false);
			const [series, setSeries] = (0, react.useState)([]);
			const rootRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (current === void 0) return;
				let cancelled = false;
				(async () => {
					try {
						const res = await api.sessions.history({
							sessionId: current,
							maxMessages: 60
						});
						if (cancelled || !res.result.ok || res.result.value === void 0) return;
						setSeries(foldTurnOutput(res.result.value.events));
					} catch {}
				})();
				return () => {
					cancelled = true;
				};
			}, [
				current,
				api,
				open,
				steps
			]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onDown = (event) => {
					if (event.target instanceof Node && rootRef.current !== null && !rootRef.current.contains(event.target)) setOpen(false);
				};
				document.addEventListener("pointerdown", onDown);
				return () => document.removeEventListener("pointerdown", onDown);
			}, [open]);
			const cost = usage === void 0 ? 0 : estimateCost(usage);
			const costText = cost <= 0 ? "¥0" : cost < .01 ? `¥${cost.toFixed(4)}` : `¥${cost.toFixed(2)}`;
			const totalIn = usage === void 0 ? 0 : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
			const totalTokens = totalIn + (usage?.outputTokens ?? 0);
			const cacheHitPercent = totalIn === 0 ? null : Math.round((usage?.cacheReadTokens ?? 0) / totalIn * 100);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: "dsh-rich-foot",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dsh-rich-trigger",
					"aria-expanded": open,
					title: t("panel.title"),
					onClick: () => setOpen((value) => !value),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-rich-trigger-label",
						children: wide ? t("trigger.wide", { cost: costText }) : "¥"
					})
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-rich-panel",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-rich-panel-title",
							children: [
								t("panel.title"),
								" · ",
								t("panel.session")
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-rich-hero",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-rich-hero-value",
								children: costText
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-rich-hero-note",
								children: t("panel.estimate")
							})]
						}),
						usage === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-rich-rows",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("tokens.in"),
									value: formatTokens(totalIn),
									sub: cacheHitPercent === null ? void 0 : t("tokens.cache", { percent: cacheHitPercent })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("tokens.out"),
									value: formatTokens(usage.outputTokens)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("tokens.total"),
									value: formatTokens(totalTokens)
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-rich-spark-title",
							children: t("spark.title")
						}),
						series.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-rich-spark-empty",
							children: t("spark.empty")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Sparkline, { data: series }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-rich-note",
							children: t("note.pricing")
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#region src/client/style.ts
		/** Usage-panel styles, injected once per factory materialization.
		*  The loader removes plugin-owned style tags on unload. Colors ride the
		*  shell's theme tokens (--dsw-alias-*) with dark fallbacks. */
		const CSS = `
.dsh-rich-foot {
  position: relative;
}
.dsh-rich-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9b96b8);
  font-size: 12px;
  line-height: 1.3;
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
}
.dsh-rich-trigger:hover {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.05)) 60%, transparent);
  color: var(--dsw-alias-label-primary, #f4f2ff);
}
.dsh-rich-trigger[aria-expanded='true'] {
  color: var(--dsw-alias-label-primary, #f4f2ff);
  border-color: var(--dsw-alias-border-l1, rgba(127, 127, 255, 0.25));
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.05)) 60%, transparent);
}
.dsh-rich-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 232px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(127, 127, 255, 0.25));
  background: var(--dsw-alias-bg-layer-1, rgba(24, 26, 38, 0.96));
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  z-index: 60;
  animation: dsh-rich-pop 160ms ease;
  color: var(--dsw-alias-label-primary, #ecebf5);
}
@keyframes dsh-rich-pop {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
.dsh-rich-panel-title {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9b96b8);
  letter-spacing: 0.03em;
}
.dsh-rich-hero {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.dsh-rich-hero-value {
  font-size: 24px;
  font-weight: 650;
  color: var(--dsw-alias-label-primary, #f6f4ff);
  font-variant-numeric: tabular-nums;
}
.dsh-rich-hero-note {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9b96b8);
}
.dsh-rich-rows {
  margin-top: 8px;
  display: grid;
  gap: 4px;
}
.dsh-rich-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
}
.dsh-rich-row-label {
  color: var(--dsw-alias-label-secondary, #9b96b8);
}
.dsh-rich-row-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.dsh-rich-row-value {
  color: var(--dsw-alias-label-primary, #f4f2ff);
  font-variant-numeric: tabular-nums;
}
.dsh-rich-row-sub {
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
}
.dsh-rich-spark-title {
  margin-top: 10px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9b96b8);
}
.dsh-rich-spark {
  margin-top: 5px;
  display: block;
}
.dsh-rich-spark-bar {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #7c5cff) 55%, transparent);
}
.dsh-rich-spark-last {
  fill: var(--dsw-alias-brand-primary, #7c5cff);
}
.dsh-rich-spark-empty {
  margin-top: 5px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
}
.dsh-rich-note {
  margin-top: 8px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
}
`;
		/** Inject the stylesheet once (idempotent under re-evaluation). */
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
			"panel.title": "用量统计",
			"panel.session": "本会话",
			"panel.estimate": "估算",
			"trigger.wide": "用量 {cost}",
			"tokens.in": "输入",
			"tokens.out": "输出",
			"tokens.total": "合计",
			"tokens.cache": "缓存命中 {percent}%",
			"spark.title": "每轮输出走势",
			"spark.empty": "暂无数据",
			"note.pricing": "按 deepseek-chat 公开价估算，可在 pricing.ts 调整"
		};
		const en = {
			"panel.title": "Usage",
			"panel.session": "this session",
			"panel.estimate": "est.",
			"trigger.wide": "Usage {cost}",
			"tokens.in": "Input",
			"tokens.out": "Output",
			"tokens.total": "Total",
			"tokens.cache": "cache hit {percent}%",
			"spark.title": "Output per turn",
			"spark.empty": "No data yet",
			"note.pricing": "Estimated from public deepseek-chat prices; edit pricing.ts"
		};
		//#endregion
		//#region src/client/index.ts
		/** Services required before the entry can register. */
		const inject = [
			"slots",
			"locale",
			"connection"
		];
		/** Register the usage trigger beside Settings at the sidebar foot. */
		function apply(ctx) {
			injectRichStyles();
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-rich: dictionaries");
			ctx.effect(() => ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "dsh-rich-usage",
				order: 30,
				locale: NS,
				inject: () => ({ api: ctx.connection.api })
			}, SidebarUsage)), "dsh-rich: sidebar usage entry");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map