window.__ModuleLoader__.load({
	id: "dsh-board",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/pricing.ts
		const MODEL_PRICES = {
			"deepseek-v4-pro": {
				cacheHitPerM: .025,
				cacheMissPerM: 3,
				outputPerM: 6
			},
			"deepseek-v4-flash": {
				cacheHitPerM: .02,
				cacheMissPerM: 1,
				outputPerM: 2
			},
			"deepseek-chat": {
				cacheHitPerM: .5,
				cacheMissPerM: 2,
				outputPerM: 8
			},
			"deepseek-reasoner": {
				cacheHitPerM: 1,
				cacheMissPerM: 4,
				outputPerM: 16
			}
		};
		/** Effective 2026-08-17: peak/off-peak scheme (off-peak is half of peak). */
		const PEAK_PRICES = {
			"deepseek-v4-pro": {
				cacheHitPerM: .3,
				cacheMissPerM: 9,
				outputPerM: 27
			},
			"deepseek-v4-flash": {
				cacheHitPerM: .1,
				cacheMissPerM: 3,
				outputPerM: 9
			}
		};
		const OFF_PEAK_PRICES = {
			"deepseek-v4-pro": {
				cacheHitPerM: .15,
				cacheMissPerM: 4.5,
				outputPerM: 13.5
			},
			"deepseek-v4-flash": {
				cacheHitPerM: .05,
				cacheMissPerM: 1.5,
				outputPerM: 4.5
			}
		};
		/** Effective moment of the peak/off-peak scheme: 2026-08-17 00:00 Beijing time. */
		const EFFECTIVE_AT_MS = Date.UTC(2026, 7, 16, 16);
		/** Peak windows in Beijing time: 09:00–12:00 and 14:00–18:00 (rest = off-peak). */
		function isPeakHour(nowMs = Date.now()) {
			const beijingHour = (new Date(nowMs).getUTCHours() + 8) % 24;
			return beijingHour >= 9 && beijingHour < 12 || beijingHour >= 14 && beijingHour < 18;
		}
		/** The price table for a model id at a given moment (peak/off-peak aware). */
		function priceFor(model, nowMs = Date.now()) {
			const modelId = model ?? "deepseek-v4-pro";
			if (nowMs >= EFFECTIVE_AT_MS) {
				const price = (isPeakHour(nowMs) ? PEAK_PRICES : OFF_PEAK_PRICES)[modelId];
				if (price !== void 0) return price;
			}
			return MODEL_PRICES[modelId] ?? MODEL_PRICES["deepseek-v4-pro"];
		}
		/** Estimate a session's cost from its durable tokenUsage projection. */
		function estimateCost(usage, price = priceFor(void 0)) {
			return (usage.uncachedInputTokens + usage.cacheWriteTokens) * price.cacheMissPerM / 1e6 + usage.cacheReadTokens * price.cacheHitPerM / 1e6 + usage.outputTokens * price.outputPerM / 1e6;
		}
		//#endregion
		//#region src/client/fold.ts
		/** Fold history events into per-turn, per-model, and cumulative series. */
		function foldHistory(entries) {
			const perTurn = /* @__PURE__ */ new Map();
			const perModel = /* @__PURE__ */ new Map();
			let currentModel = null;
			for (const entry of entries) {
				const event = entry.event;
				if (event?.type === "request/header") {
					const model = event.data?.header?.config?.model;
					if (typeof model === "string" && model !== "") currentModel = model;
					continue;
				}
				if (event?.type !== "assistant/chunk") continue;
				const chunk = event.data?.chunk;
				if (chunk?.type !== "usage") continue;
				const turn = event.data?.turn;
				if (turn === void 0) continue;
				const input = chunk.usage?.inputTokens ?? 0;
				const output = chunk.usage?.outputTokens ?? 0;
				const cacheRead = chunk.usage?.cacheReadTokens ?? 0;
				const row = perTurn.get(turn) ?? {
					turn,
					input: 0,
					output: 0,
					cacheRead: 0
				};
				row.input += input;
				row.output += output;
				row.cacheRead += cacheRead;
				perTurn.set(turn, row);
				if (currentModel !== null) {
					const model = perModel.get(currentModel) ?? {
						input: 0,
						output: 0,
						cacheRead: 0
					};
					model.input += input;
					model.output += output;
					model.cacheRead += cacheRead;
					perModel.set(currentModel, model);
				}
			}
			const turns = [...perTurn.values()].sort((left, right) => left.turn - right.turn);
			const cumulative = [];
			let running = 0;
			for (const row of turns) {
				running += row.output;
				cumulative.push(running);
			}
			return {
				perTurn: turns,
				perModel,
				cumulative
			};
		}
		/** Compact token count with 万/亿 for the big numbers, K/M below. */
		function formatTokens(n) {
			if (n < 1e3) return String(Math.round(n));
			if (n < 1e6) return `${Math.round(n / 100) / 10}K`;
			if (n < 1e8) return `${Math.round(n / 1e3) / 10}万`;
			return `${Math.round(n / 1e7) / 10}亿`;
		}
		/** Compact cost display. */
		function formatCost(cost) {
			if (cost <= 0) return "¥0";
			if (cost < .01) return `¥${cost.toFixed(4)}`;
			return `¥${cost.toFixed(2)}`;
		}
		/** Compact duration display. */
		function formatDuration(ms) {
			const s = ms / 1e3;
			if (s < 60) return `${Math.round(s * 10) / 10}s`;
			const whole = Math.round(s);
			return `${Math.floor(whole / 60)}m${whole % 60}s`;
		}
		//#endregion
		//#region src/client/levels.ts
		const LEVELS = [
			{
				floor: 0,
				emoji: "🌱",
				zh: "词芽未醒",
				en: "Unawakened Sprout",
				color: "#9b96b8"
			},
			{
				floor: 1e4,
				emoji: "🥉",
				zh: "词徒",
				en: "Word Apprentice",
				color: "#cd7f32"
			},
			{
				floor: 1e5,
				emoji: "💬",
				zh: "白银话痨",
				en: "Silver Chatterbox",
				color: "#8b95a1"
			},
			{
				floor: 1e6,
				emoji: "💰",
				zh: "百万词翁",
				en: "Token Millionaire",
				color: "#d4a017"
			},
			{
				floor: 1e7,
				emoji: "🧲",
				zh: "万词王",
				en: "Wordlord",
				color: "#7c3aed"
			},
			{
				floor: 1e8,
				emoji: "🎯",
				zh: "亿词小目标",
				en: "The Billion-Token Small Goal",
				color: "#ef4444"
			},
			{
				floor: 1e9,
				emoji: "👑",
				zh: "十亿词霸",
				en: "Billion-Token Wordmaster",
				color: "#f97316"
			},
			{
				floor: 1e10,
				emoji: "📜",
				zh: "百亿词圣",
				en: "Hundred-Billion Word Saint",
				color: "#0891b2"
			},
			{
				floor: 1e11,
				emoji: "🧚",
				zh: "千亿词仙",
				en: "Trillion Word Immortal",
				color: "#a855f7"
			},
			{
				floor: 0xe8d4a51000,
				emoji: "⚡",
				zh: "万亿词神",
				en: "Ten-Trillion Word God",
				color: "#ca8a04"
			}
		];
		/** The active level for a lifetime token total. */
		function rankFor(total) {
			let level = LEVELS[0];
			for (const candidate of LEVELS) if (total >= candidate.floor) level = candidate;
			const index = LEVELS.indexOf(level);
			const next = index + 1 < LEVELS.length ? LEVELS[index + 1] : null;
			return {
				level,
				next
			};
		}
		//#endregion
		//#region src/client/achievements.ts
		function computeStats(daily, sessionCount) {
			const daySet = new Set(daily.filter((item) => item.tokens > 0).map((item) => item.day));
			const now = /* @__PURE__ */ new Date();
			const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
			let streak = 0;
			let cursor = todayMid;
			if (!daySet.has(todayMid)) cursor -= 864e5;
			while (daySet.has(cursor)) {
				streak += 1;
				cursor -= 864e5;
			}
			const days = [...daySet].sort((left, right) => left - right);
			let best = 0;
			let run = 0;
			let prev = null;
			for (const day of days) {
				run = prev !== null && day - prev === 864e5 ? run + 1 : 1;
				if (run > best) best = run;
				prev = day;
			}
			let peakDay = 0;
			for (const item of daily) if (item.tokens > peakDay) peakDay = item.tokens;
			return {
				streak,
				best,
				peakDay,
				activeDays: days.length,
				sessions: sessionCount
			};
		}
		const ACHIEVEMENTS = [
			{
				id: "streak3",
				emoji: "🔥",
				test: (stats) => stats.best >= 3
			},
			{
				id: "streak7",
				emoji: "⚡",
				test: (stats) => stats.best >= 7
			},
			{
				id: "streak30",
				emoji: "🌙",
				test: (stats) => stats.best >= 30
			},
			{
				id: "day10",
				emoji: "🌱",
				test: (stats) => stats.activeDays >= 10
			},
			{
				id: "day50",
				emoji: "🌳",
				test: (stats) => stats.activeDays >= 50
			},
			{
				id: "peak100k",
				emoji: "💥",
				test: (stats) => stats.peakDay >= 1e5
			},
			{
				id: "peak1m",
				emoji: "🌋",
				test: (stats) => stats.peakDay >= 1e6
			},
			{
				id: "session10",
				emoji: "🗂",
				test: (stats) => stats.sessions >= 10
			},
			{
				id: "session50",
				emoji: "📚",
				test: (stats) => stats.sessions >= 50
			}
		];
		//#endregion
		//#region src/client/SidebarUsage.tsx
		const COLLAPSE_KEY = "dsh-board.collapsed";
		function readCollapsed() {
			try {
				return typeof localStorage !== "undefined" && localStorage.getItem(COLLAPSE_KEY) === "1";
			} catch {
				return false;
			}
		}
		/** Ease-out count-up toward `target` — the hero number "rolls". */
		function useCountUp(target, duration = 600) {
			const [value, setValue] = (0, react.useState)(target);
			const valueRef = (0, react.useRef)(target);
			(0, react.useEffect)(() => {
				const from = valueRef.current;
				if (from === target) return;
				const start = Date.now();
				let frame = 0;
				const tick = () => {
					const t = Math.min(1, (Date.now() - start) / duration);
					const eased = 1 - Math.pow(1 - t, 3);
					const next = from + (target - from) * eased;
					valueRef.current = next;
					setValue(next);
					if (t < 1) frame = requestAnimationFrame(tick);
				};
				frame = requestAnimationFrame(tick);
				return () => cancelAnimationFrame(frame);
			}, [target, duration]);
			return value;
		}
		function SectionTitle({ children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-board-sec",
				children
			});
		}
		/** The 1M-context window: occupancy, remaining budget, and what eats it. */
		function ContextBlock({ pressure, breakdown, subagentMs, t }) {
			if (pressure === void 0 && breakdown === void 0) return null;
			const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
			const window = pressure?.contextWindow;
			const percent = used !== void 0 && window !== void 0 ? Math.min(100, Math.round(used / window * 100)) : null;
			const remaining = used !== void 0 && window !== void 0 ? window - used : null;
			const parts = breakdown === void 0 ? null : [
				{
					key: "system",
					label: t("ctx.legend.system"),
					tokens: breakdown.systemTokens ?? 0
				},
				{
					key: "tools",
					label: t("ctx.legend.tools"),
					tokens: breakdown.toolsTokens ?? 0
				},
				{
					key: "messages",
					label: t("ctx.legend.messages"),
					tokens: breakdown.messageTokens ?? 0
				}
			];
			const totalParts = parts === null ? 0 : parts.reduce((sum, part) => sum + part.tokens, 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-board-context",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-context-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-context-title",
							children: t("sec.context")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-context-value",
							children: percent === null ? "—" : `${percent}%`
						})]
					}),
					percent === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-context-bar",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-board-context-fill",
							style: { width: `${percent}%` }
						})
					}),
					used !== void 0 && window !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-context-sub",
						children: [
							formatTokens(used),
							" / ",
							formatTokens(window),
							" · ",
							t("ctx.remaining", { count: formatTokens(remaining ?? 0) })
						]
					}) : null,
					parts !== null && totalParts > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-context-stack",
						children: parts.filter((part) => part.tokens > 0).map((part) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `dsh-board-context-part dsh-board-context-part-${part.key}`,
							style: { width: `${part.tokens / totalParts * 100}%` },
							title: `${part.label} ${formatTokens(part.tokens)}`
						}, part.key))
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-context-legend",
						children: parts.filter((part) => part.tokens > 0).map((part) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-board-context-legend-item",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: `dsh-board-context-dot dsh-board-context-dot-${part.key}` }),
								part.label,
								" ",
								formatTokens(part.tokens)
							]
						}, part.key))
					})] }) : null,
					subagentMs !== void 0 && subagentMs > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-context-sub",
						children: t("ctx.subagent", { duration: formatDuration(subagentMs) })
					}) : null
				]
			});
		}
		/** Stacked per-turn input/output bars. */
		function TrendBars({ data }) {
			const max = Math.max(1, ...data.map((item) => item.input + item.output));
			const width = data.length * 10 - 4;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "dsh-board-chart",
				viewBox: `0 0 ${width} 36`,
				width: "100%",
				height: 36,
				"aria-hidden": true,
				children: data.map((item, index) => {
					const inH = Math.max(0, Math.round(item.input / max * 34));
					const outH = Math.max(0, Math.round(item.output / max * 34));
					const x = index * 10;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							className: "dsh-board-bar-in",
							x,
							y: 36 - inH,
							width: 6,
							height: inH,
							rx: 2
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							className: "dsh-board-bar-out",
							x,
							y: 36 - inH - outH,
							width: 6,
							height: outH,
							rx: 2
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: `第 ${item.turn} 轮 · 入 ${item.input} · 出 ${item.output}` })
					] }, item.turn);
				})
			});
		}
		/** Cumulative output area chart. */
		function CumulativeArea({ values }) {
			const w = 236;
			const h = 36;
			const n = values.length;
			const max = Math.max(1, ...values);
			const step = n > 1 ? w / (n - 1) : 0;
			const points = values.map((v, i) => `${(i * step).toFixed(1)},${(33 - v / max * 28).toFixed(1)}`);
			const area = `M 0,${h} L ${points.join(" L ")} L ${(n - 1) * step},${h} Z`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: "dsh-board-chart",
				viewBox: `0 0 ${w} ${h}`,
				width: "100%",
				height: h,
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("linearGradient", {
						id: "dsh-board-area",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
							offset: "0%",
							className: "dsh-board-area-top"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
							offset: "100%",
							className: "dsh-board-area-bottom"
						})]
					}) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: area,
						fill: "url(#dsh-board-area)"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polyline", {
						points: points.join(" "),
						className: "dsh-board-line",
						fill: "none"
					})
				]
			});
		}
		function ModelRows({ models, t }) {
			const max = Math.max(1, ...models.map((item) => item.output));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-board-models",
				children: models.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-board-model",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-model-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-model-name",
							title: item.model,
							children: item.model
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-model-value",
							children: t("model.value", {
								out: formatTokens(item.output),
								in: formatTokens(item.input)
							})
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-model-bar",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-board-model-fill",
							style: { width: `${item.output / max * 100}%` }
						})
					})]
				}, item.model))
			});
		}
		/** GitHub-style daily token heatmap: 12 weeks × 7 days. */
		function Heatmap({ daily }) {
			const rows = 7;
			const cell = 8;
			const now = /* @__PURE__ */ new Date();
			const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - 71712e5;
			const byDay = new Map(daily.map((item) => [item.day, item.tokens]));
			const max = Math.max(1, ...daily.map((item) => item.tokens));
			const width = 118;
			const height = 68;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "dsh-board-heatmap",
				viewBox: `0 0 ${width} ${height}`,
				width,
				height,
				"aria-hidden": true,
				children: Array.from({ length: 84 }, (_, i) => {
					const day = start + i * 864e5;
					const tokens = byDay.get(day) ?? 0;
					const level = tokens === 0 ? 0 : Math.max(1, Math.min(5, Math.ceil(tokens / max * 5)));
					const x = Math.floor(i / rows) * 10;
					const y = i % rows * 10;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						className: `dsh-board-heat-l${level}`,
						x,
						y,
						width: cell,
						height: cell,
						rx: 2,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: `${new Date(day).toLocaleDateString()} · ${tokens} token` })
					}, day);
				})
			});
		}
		function SessionRows({ sessions }) {
			const max = Math.max(1, ...sessions.map((item) => item.tokens));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-board-sessions",
				children: sessions.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-board-session",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-session-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-session-title",
							title: item.title,
							children: item.title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-session-value",
							children: formatTokens(item.tokens)
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-session-bar",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-board-session-fill",
							style: { width: `${item.tokens / max * 100}%` }
						})
					})]
				}, item.id))
			});
		}
		/**
		* VIP-style membership card: previous tier (unlocked) → current tier
		* (glowing, tier-colored) → next tier (locked), a flowing progress bar with
		* percentage, an unlock ETA at the user's current pace, per-tier perks, a
		* level-up celebration flash, and the full ten-rung ladder.
		*/
		function MembershipCard({ total, daily, t }) {
			const rank = rankFor(total);
			const index = LEVELS.indexOf(rank.level);
			const prev = index > 0 ? LEVELS[index - 1] : null;
			const next = rank.next;
			const progress = next === null ? 1 : (total - rank.level.floor) / (next.floor - rank.level.floor);
			const avgPerDay = daily.reduce((sum, item) => sum + item.tokens, 0) / Math.max(1, daily.filter((item) => item.tokens > 0).length);
			const daysToNext = next === null ? null : Math.ceil((next.floor - total) / Math.max(1, avgPerDay));
			const LEVEL_KEY = "dsh-board.level";
			const lastIndexRef = (0, react.useRef)(-1);
			const [celebrating, setCelebrating] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				let last = lastIndexRef.current;
				if (last === -1) try {
					const stored = localStorage.getItem(LEVEL_KEY);
					if (stored !== null) last = Number(stored);
				} catch {}
				if (last !== -1 && index > last) {
					setCelebrating(true);
					const timer = setTimeout(() => setCelebrating(false), 2400);
					lastIndexRef.current = index;
					try {
						localStorage.setItem(LEVEL_KEY, String(index));
					} catch {}
					return () => clearTimeout(timer);
				}
				lastIndexRef.current = index;
				try {
					localStorage.setItem(LEVEL_KEY, String(index));
				} catch {}
			}, [index]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: celebrating ? "dsh-board-card dsh-board-levelup" : "dsh-board-card",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-card-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("rank.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-card-lv",
							children: t("rank.lv", { n: index + 1 })
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-card-body",
						children: [
							prev === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dsh-board-card-step dsh-board-card-prev-empty" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-board-card-step dsh-board-card-prev",
								title: t(`rank.${index - 1}`),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-board-card-step-emoji",
										children: prev.emoji
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-board-card-step-name",
										children: t(`rank.${index - 1}`)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dsh-board-card-step-status",
										children: ["✓ ", t("rank.unlocked")]
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-board-card-current",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-board-card-current-emoji",
										children: rank.level.emoji
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-board-card-current-name",
										children: t(`rank.${index}`)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-board-card-current-tag",
										children: t("rank.current")
									})
								]
							}),
							next === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsh-board-card-step dsh-board-card-max",
								children: "👑 MAX"
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-board-card-step dsh-board-card-next",
								title: t(`rank.${index + 1}`),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-board-card-step-emoji",
										children: next.emoji
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsh-board-card-step-name",
										children: t(`rank.${index + 1}`)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dsh-board-card-step-status",
										children: ["🔒 ", t("rank.locked")]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-card-bar",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-board-card-bar-fill",
							style: { width: `${Math.min(100, progress * 100)}%` }
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-card-next-line",
						children: next === null ? t("rank.max") : `${t("rank.next", {
							name: t(`rank.${index + 1}`),
							count: formatTokens(next.floor - total)
						})} · ${t("rank.percent", { percent: Math.round(progress * 100) })}`
					}),
					next !== null && daysToNext !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-card-eta",
						children: daysToNext < 1 ? t("rank.eta.today") : t("rank.eta", { days: daysToNext })
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-card-perks",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-board-card-perk",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-board-card-perk-label",
								children: ["✦ ", t("rank.perk.current")]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-board-card-perk-value",
								children: t(`perk.${index}`)
							})]
						}), next === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-board-card-perk dsh-board-card-perk-locked",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-board-card-perk-label",
								children: ["🔒 ", t("rank.perk.next")]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-board-card-perk-value",
								children: t(`perk.${index + 1}`)
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-board-card-ladder",
						children: LEVELS.map((level, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: [
								"dsh-board-card-rung",
								i < index ? "dsh-board-card-rung-done" : "",
								i === index ? "dsh-board-card-rung-now" : "",
								i > index ? "dsh-board-card-rung-locked" : ""
							].filter(Boolean).join(" "),
							title: `LV.${i + 1} ${level.zh}`,
							children: level.emoji
						}, level.floor))
					})
				]
			});
		}
		function Achievements({ stats, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-board-achievements",
				children: ACHIEVEMENTS.map((achievement) => {
					const got = achievement.test(stats);
					const nameKey = `ach.${achievement.id}`;
					const condKey = `ach.${achievement.id}.cond`;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: got ? "dsh-board-ach dsh-board-ach-got" : "dsh-board-ach",
						title: got ? t(nameKey) : `${t(nameKey)} · ${t(condKey)}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-ach-emoji",
							children: achievement.emoji
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-ach-name",
							children: t(nameKey)
						})]
					}, achievement.id);
				})
			});
		}
		/**
		* Sidebar foot entry: a live usage console next to Settings. Wide sidebar:
		* inline panel, expanded by default, collapsible (persisted). Rail: icon +
		* floating popup. Data: current-session projections from the session-list
		* store, per-turn/per-model series folded from the history RPC, and a
		* lifetime aggregate across every session row.
		*/
		function SidebarUsage({ wide, useSessions, api, t }) {
			const current = useSessions((s) => s.current);
			const ids = useSessions((s) => s.ids);
			const byId = useSessions((s) => s.byId);
			const summary = current === void 0 ? void 0 : byId[current];
			const usage = summary?.projectionValues?.tokenUsage;
			const projectionValues = summary?.projectionValues;
			const pressure = projectionValues?.contextPressure;
			const breakdown = projectionValues?.contextBreakdown;
			const subagentMs = (projectionValues?.subagentTiming)?.settledMs;
			(() => {
				const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
				const window = pressure?.contextWindow;
				if (used === void 0 || window === void 0 || window <= 0) return null;
				return Math.min(100, Math.round(used / window * 100));
			})();
			const steps = (summary?.projectionValues?.sessionStats)?.steps;
			const running = summary?.running ?? false;
			const [open, setOpen] = (0, react.useState)(false);
			const [collapsed, setCollapsed] = (0, react.useState)(readCollapsed);
			const [fold, setFold] = (0, react.useState)({
				perTurn: [],
				perModel: /* @__PURE__ */ new Map(),
				cumulative: []
			});
			const rootRef = (0, react.useRef)(null);
			const panelVisible = wide ? !collapsed : open;
			(0, react.useEffect)(() => {
				if (current === void 0 || !panelVisible) return;
				let cancelled = false;
				(async () => {
					try {
						const res = await api.sessions.history({
							sessionId: current,
							maxMessages: 120
						});
						if (cancelled || !res.result.ok || res.result.value === void 0) return;
						setFold(foldHistory(res.result.value.events));
					} catch {}
				})();
				return () => {
					cancelled = true;
				};
			}, [
				current,
				api,
				panelVisible,
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
			const lifetime = (0, react.useMemo)(() => {
				let input = 0;
				let output = 0;
				let cost = 0;
				let hit = 0;
				const sessions = [];
				const daily = /* @__PURE__ */ new Map();
				for (const id of ids) {
					const row = byId[id];
					const u = row?.projectionValues?.tokenUsage;
					if (u === void 0) continue;
					const i = u.uncachedInputTokens + u.cacheReadTokens + u.cacheWriteTokens;
					const o = u.outputTokens;
					input += i;
					output += o;
					hit += u.cacheReadTokens;
					cost += estimateCost(u);
					sessions.push({
						id,
						title: row.displayTitle ?? row.title ?? String(id).slice(0, 8),
						tokens: i + o
					});
					if (Number.isFinite(row.updatedAt) && row.updatedAt > 0) {
						const day = new Date(row.updatedAt).setHours(0, 0, 0, 0);
						daily.set(day, (daily.get(day) ?? 0) + i + o);
					}
				}
				sessions.sort((left, right) => right.tokens - left.tokens);
				const now = /* @__PURE__ */ new Date();
				const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
				const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7).getTime();
				let today = 0;
				let week = 0;
				for (const [day, tokens] of daily) {
					if (day === todayMid) today += tokens;
					if (day >= weekStart && day <= todayMid) week += tokens;
				}
				return {
					today,
					week,
					input,
					output,
					cost,
					hit,
					total: input + output,
					sessions: sessions.slice(0, 8),
					daily: [...daily.entries()].map(([day, tokens]) => ({
						day,
						tokens
					}))
				};
			}, [ids, byId]);
			const models = (0, react.useMemo)(() => [...fold.perModel.entries()].map(([model, m]) => ({
				model,
				input: m.input,
				output: m.output
			})).sort((left, right) => right.output - left.output).slice(0, 5), [fold]);
			/** The model with the most output this session — prices its billing. */
			const dominantModel = (0, react.useMemo)(() => {
				let best;
				let bestOutput = -1;
				for (const [model, m] of fold.perModel) if (m.output > bestOutput) {
					bestOutput = m.output;
					best = model;
				}
				return best;
			}, [fold]);
			const sessionCost = usage === void 0 ? 0 : estimateCost(usage, priceFor(dominantModel));
			const hero = useCountUp(lifetime.total);
			const rank = rankFor(lifetime.total);
			const rankName = t(`rank.${LEVELS.indexOf(rank.level)}`);
			const usageStats = (0, react.useMemo)(() => computeStats(lifetime.daily, ids.length), [lifetime.daily, ids.length]);
			const [flash, setFlash] = (0, react.useState)(false);
			const prevBadgeRef = (0, react.useRef)({
				cost: lifetime.cost,
				total: lifetime.total,
				today: lifetime.today,
				week: lifetime.week
			});
			(0, react.useEffect)(() => {
				const prev = prevBadgeRef.current;
				if (prev.cost !== lifetime.cost || prev.total !== lifetime.total || prev.today !== lifetime.today || prev.week !== lifetime.week) {
					setFlash(true);
					const timer = setTimeout(() => setFlash(false), 700);
					prevBadgeRef.current = {
						cost: lifetime.cost,
						total: lifetime.total,
						today: lifetime.today,
						week: lifetime.week
					};
					return () => clearTimeout(timer);
				}
				prevBadgeRef.current = {
					cost: lifetime.cost,
					total: lifetime.total,
					today: lifetime.today,
					week: lifetime.week
				};
			}, [
				lifetime.cost,
				lifetime.total,
				lifetime.today,
				lifetime.week
			]);
			const toggle = () => {
				if (wide) {
					const next = !collapsed;
					setCollapsed(next);
					try {
						localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
					} catch {}
				} else setOpen((value) => !value);
			};
			const panel = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-board-panel",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-panel-title",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("panel.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-board-title-right",
							children: [running ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-board-live",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
									state: "ongoing",
									className: "dsh-board-dot"
								}), t("live")]
							}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-board-close",
								"aria-label": t("panel.collapse.aria"),
								onClick: () => {
									if (wide) setCollapsed(true);
									else setOpen(false);
								},
								children: "✕"
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-hero",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-board-hero-value",
							children: formatTokens(hero)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-board-hero-label",
							children: t("global.tokens")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-hero-sub",
						children: [
							t("hero.streak", { n: usageStats.streak }),
							" · ",
							t("hero.sessions", { n: ids.length }),
							" · ",
							t("hero.cache", { percent: lifetime.input === 0 ? 0 : Math.round(lifetime.hit / lifetime.input * 100) }),
							" · ",
							t("global.cost"),
							" ",
							formatCost(lifetime.cost),
							" · ",
							t("hero.thisCost", { cost: formatCost(sessionCost) })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-usage",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-board-usage-item",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-usage-label",
									children: t("usage.total")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-usage-value",
									children: formatTokens(lifetime.total)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-board-usage-item",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-usage-label",
									children: t("usage.today")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-usage-value",
									children: formatTokens(lifetime.today)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-board-usage-item",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-usage-label",
									children: t("usage.week")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-usage-value",
									children: formatTokens(lifetime.week)
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ContextBlock, {
						pressure,
						breakdown,
						subagentMs,
						t
					}),
					fold.perTurn.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, { children: t("sec.trend") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrendBars, { data: fold.perTurn.slice(-24) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-board-legend",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dsh-board-legend-in" }), t("legend.in")] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dsh-board-legend-out" }), t("legend.out")] })]
						})
					] }),
					fold.cumulative.length < 2 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, { children: t("sec.cumulative") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CumulativeArea, { values: fold.cumulative.slice(-60) })] }),
					lifetime.daily.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, { children: t("sec.heat") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Heatmap, { daily: lifetime.daily }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-board-heat-note",
							children: t("heat.note")
						})
					] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MembershipCard, {
						total: lifetime.total,
						daily: lifetime.daily,
						t
					}),
					models.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, { children: t("sec.model") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelRows, {
						models,
						t
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, { children: t("sec.achievements") }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Achievements, {
						stats: usageStats,
						t
					}),
					lifetime.sessions.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, { children: t("sec.global") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionRows, { sessions: lifetime.sessions })] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-board-note",
						children: [
							t("note.pricing"),
							" · ",
							isPeakHour() ? t("window.peak") : t("window.offpeak")
						]
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: "dsh-board-foot",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: wide ? "dsh-board-trigger" : "dsh-board-trigger dsh-board-orb",
					"aria-expanded": wide ? !collapsed : open,
					title: rankName,
					onClick: toggle,
					children: wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: flash ? "dsh-board-badge dsh-board-flash" : "dsh-board-badge",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-tag",
									style: { background: rank.level.color },
									children: rankName
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-badge-tokens",
									children: formatTokens(lifetime.total)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dsh-board-badge-sub",
									children: [
										t("usage.today"),
										" ",
										formatTokens(lifetime.today),
										" · ",
										t("usage.week"),
										" ",
										formatTokens(lifetime.week)
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-board-badge-cost",
									children: formatCost(lifetime.cost)
								})
							]
						}),
						running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
							state: "ongoing",
							className: "dsh-board-live-dot"
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-board-chevron",
							children: collapsed ? "▸" : "▾"
						})
					] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-board-orb-emoji",
						children: rank.level.emoji
					})
				}), wide ? collapsed ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-board-inline",
					children: panel
				}) : open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-board-float",
					children: panel
				}) : null]
			});
		}
		//#endregion
		//#region src/client/style.ts
		/** Usage-panel styles, injected once per factory materialization.
		*  The loader removes plugin-owned style tags on unload.
		*
		*  Visual language: DeepSeek-style restraint — the shell's theme tokens
		*  (--dsw-alias-*) for surfaces and labels, the brand primary as the single
		*  accent, hairline borders, quiet typography, and minimal motion. No
		*  rainbow borders, no bouncing decorations. */
		const CSS = `
.dsh-board-foot {
  position: relative;
  width: 100%;
}

/* Trigger: a square stat tile spanning the sidebar menu width. */
.dsh-board-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  color: var(--dsw-alias-label-primary, #1a1a1a);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: box-shadow 150ms ease, border-color 150ms ease;
}
.dsh-board-trigger:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: color-mix(in srgb, var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.14)) 60%, transparent);
}
.dsh-board-trigger:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe);
  outline-offset: 2px;
}
.dsh-board-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
/* Rank title: a tier-colored pill tag with white text. */
.dsh-board-tag {
  padding: 2px 9px;
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.dsh-board-badge-tokens {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  line-height: 1.2;
}
.dsh-board-badge-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
}
.dsh-board-badge-cost {
  font-size: 13px;
  font-weight: 500;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-badge.dsh-board-flash {
  animation: dsh-board-badge-flash 700ms ease;
}
@keyframes dsh-board-badge-flash {
  0% { opacity: 0.4; }
  100% { opacity: 1; }
}
.dsh-board-chevron {
  position: absolute;
  top: 5px;
  right: 7px;
  font-size: 9px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-live-dot {
  position: absolute;
  top: 6px;
  left: 7px;
  line-height: 0;
}
/* Rail: a plain circular entry. */
.dsh-board-orb {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  background: var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
}
.dsh-board-orb-emoji {
  font-size: 16px;
  line-height: 1;
}

/* Panel: a clean raised surface. */
.dsh-board-panel {
  width: 240px;
  max-height: min(480px, 66vh);
  overflow-y: auto;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-size: 12px;
  line-height: 1.5;
  animation: dsh-board-pop 140ms ease;
}
.dsh-board-inline .dsh-board-panel {
  width: auto;
  margin-top: 6px;
  box-shadow: none;
  border: none;
  padding: 10px 0;
  max-height: min(60vh, 560px);
  overflow-y: auto;
}
.dsh-board-panel::-webkit-scrollbar {
  width: 6px;
}
.dsh-board-panel::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.15)) 70%, transparent);
  border-radius: 999px;
}
.dsh-board-panel::-webkit-scrollbar-track {
  background: transparent;
}
.dsh-board-float .dsh-board-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 60;
}
@keyframes dsh-board-pop {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
.dsh-board-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  margin-bottom: 12px;
}
.dsh-board-title-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.dsh-board-live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-state-success-primary, #16a34a);
  font-size: 10px;
  letter-spacing: 0.06em;
  font-weight: 600;
}
.dsh-board-close {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11px;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 6px;
  cursor: pointer;
}
.dsh-board-close:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe);
  outline-offset: 2px;
}
.dsh-board-close:hover {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04)) 70%, transparent);
}

/* Membership card: quiet tier block. */
.dsh-board-card {
  position: relative;
  overflow: hidden;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.03)) 60%, transparent);
}
.dsh-board-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  margin-bottom: 8px;
}
.dsh-board-card-lv {
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dsh-board-card-body {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}
.dsh-board-card-step {
  text-align: center;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  min-width: 0;
}
.dsh-board-card-prev-empty {
  min-height: 1px;
}
.dsh-board-card-step-emoji {
  display: block;
  font-size: 15px;
  line-height: 1.2;
}
.dsh-board-card-next .dsh-board-card-step-emoji {
  filter: grayscale(1);
  opacity: 0.45;
}
.dsh-board-card-step-name {
  display: block;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-board-card-step-status {
  display: block;
  font-size: 9.5px;
  opacity: 0.7;
}
.dsh-board-card-current {
  text-align: center;
  padding: 4px 10px;
}
.dsh-board-card-current-emoji {
  font-size: 24px;
  display: block;
}
.dsh-board-card-current-name {
  display: block;
  margin-top: 4px;
  font-weight: 600;
  font-size: 13px;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-card-current-tag {
  display: block;
  margin-top: 1px;
  font-size: 9px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-card-bar {
  margin-top: 10px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dsh-board-card-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  transition: width 400ms ease;
}
.dsh-board-card-next-line {
  margin-top: 6px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-card-eta {
  margin-top: 2px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-card-perks {
  margin-top: 8px;
  display: grid;
  gap: 3px;
}
.dsh-board-card-perk {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dsh-board-card-perk-locked {
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-card-perk-label {
  color: var(--dsw-alias-label-secondary, #6b7280);
  white-space: nowrap;
}
.dsh-board-card-perk-value {
  text-align: right;
}
.dsh-board-card-ladder {
  margin-top: 8px;
  display: flex;
  gap: 4px;
}
.dsh-board-card-rung {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.05)) 80%, transparent);
}
.dsh-board-card-rung-done {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 18%, transparent);
}
.dsh-board-card-rung-now {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-card-rung-locked {
  opacity: 0.4;
}
/* Level-up: a brief, quiet brand wash. */
.dsh-board-card.dsh-board-levelup::after {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  animation: dsh-board-celebrate 1.6s ease-out forwards;
  pointer-events: none;
}
@keyframes dsh-board-celebrate {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 0; }
}

/* Hero: a plain large number. */
/* Context window: occupancy, remaining budget, and composition stack. */
.dsh-board-context {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.03)) 60%, transparent);
}
.dsh-board-context-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.dsh-board-context-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-context-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
  font-variant-numeric: tabular-nums;
}
.dsh-board-context-bar {
  margin-top: 6px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dsh-board-context-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  transition: width 400ms ease;
}
.dsh-board-context-sub {
  margin-top: 4px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
}
.dsh-board-context-stack {
  margin-top: 8px;
  display: flex;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.06)) 80%, transparent);
}
.dsh-board-context-part {
  display: block;
  height: 100%;
}
.dsh-board-context-part-system {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 40%, transparent);
}
.dsh-board-context-part-tools {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-context-part-messages {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 45%, transparent);
}
.dsh-board-context-legend {
  margin-top: 5px;
  display: flex;
  gap: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
}
.dsh-board-context-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.dsh-board-context-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.dsh-board-context-dot-system {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 40%, transparent);
}
.dsh-board-context-dot-tools {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-context-dot-messages {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 45%, transparent);
}
.dsh-board-hero {
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.dsh-board-hero-value {
  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
}
.dsh-board-hero-label {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-usage {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.dsh-board-usage-item {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.03)) 60%, transparent);
  text-align: center;
}
.dsh-board-usage-label {
  display: block;
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-usage-value {
  display: block;
  margin-top: 2px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
}
.dsh-board-hero-sub {
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}

.dsh-board-sec {
  margin: 14px 0 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #6b7280);
  letter-spacing: 0.01em;
}
.dsh-board-rows {
  display: grid;
  gap: 4px;
}
.dsh-board-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
}
.dsh-board-row-label {
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-row-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.dsh-board-row-value {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
}
.dsh-board-row-value-emphasis {
  font-weight: 700;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-row-sub {
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-models {
  display: grid;
  gap: 5px;
}
.dsh-board-model-head,
.dsh-board-session-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
}
.dsh-board-model-name,
.dsh-board-session-title {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-board-model-value,
.dsh-board-session-value {
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-board-model-bar,
.dsh-board-session-bar {
  margin-top: 3px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dsh-board-model-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  transition: width 300ms ease;
}
.dsh-board-session-fill {
  height: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 65%, transparent);
  transition: width 300ms ease;
}
.dsh-board-chart {
  display: block;
  margin-top: 4px;
}
.dsh-board-bar-in {
  fill: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 35%, transparent);
}
.dsh-board-bar-out {
  fill: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-line {
  stroke: var(--dsw-alias-brand-primary, #4d6bfe);
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.dsh-board-area-top {
  stop-color: var(--dsw-alias-brand-primary, #4d6bfe);
  stop-opacity: 0.28;
}
.dsh-board-area-bottom {
  stop-color: var(--dsw-alias-brand-primary, #4d6bfe);
  stop-opacity: 0;
}
.dsh-board-legend {
  display: flex;
  gap: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 3px;
  border-radius: 2px;
  vertical-align: -1px;
}
.dsh-board-legend-in {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 35%, transparent);
}
.dsh-board-legend-out {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-sessions {
  display: grid;
  gap: 5px;
}
.dsh-board-heatmap {
  display: block;
  margin-top: 4px;
}
.dsh-board-heat-l0 {
  fill: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.06)) 80%, transparent);
}
.dsh-board-heat-l1 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 22%, transparent);
}
.dsh-board-heat-l2 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 40%, transparent);
}
.dsh-board-heat-l3 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 58%, transparent);
}
.dsh-board-heat-l4 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 76%, transparent);
}
.dsh-board-heat-l5 {
  fill: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-board-heat-note {
  margin-top: 3px;
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
/* Achievement collection: pill badges, earned = brand tinted. */
.dsh-board-achievements {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.dsh-board-ach {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-ach-got {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 35%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 6%, transparent);
}
.dsh-board-ach-emoji {
  font-size: 11px;
}
.dsh-board-ach:not(.dsh-board-ach-got) .dsh-board-ach-emoji {
  filter: grayscale(1);
  opacity: 0.5;
}
.dsh-board-mini {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  margin-top: 4px;
}
.dsh-board-note {
  margin-top: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
`;
		/** Inject the stylesheet once (idempotent under re-evaluation). */
		function injectRichStyles() {
			if (typeof document === "undefined") return;
			if (document.querySelector("style[data-plugin=\"dsh-board\"]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-board";
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/locales.ts
		/** `rich` namespace dictionaries (zh is the key-set source of truth). */
		/** Dictionary namespace owned by this plugin. */
		const NS = "board";
		const zh = {
			"panel.title": "用量统计",
			"live": "LIVE",
			"rank.title": "词勋等级",
			"rank.lv": "LV.{n}",
			"rank.current": "当前",
			"rank.unlocked": "已解锁",
			"rank.locked": "未解锁",
			"rank.next": "距 {name} 还差 {count} token",
			"rank.max": "已达最高段位",
			"rank.eta": "按当前速度预计 {days} 天后解锁",
			"rank.eta.today": "按当前速度今天有望解锁",
			"rank.perk.current": "当前权益",
			"rank.perk.next": "下阶解锁",
			"rank.percent": "{percent}%",
			"perk.0": "解锁「用量面板」",
			"perk.1": "解锁徽章动效",
			"perk.2": "解锁银色边框",
			"perk.3": "解锁金色数字",
			"perk.4": "解锁钻石流光",
			"perk.5": "解锁红色警戒",
			"perk.6": "解锁皇冠标识",
			"perk.7": "解锁天青光环",
			"perk.8": "解锁仙紫星尘",
			"perk.9": "解锁彩虹至尊框",
			"hero.sessions": "跨 {n} 个会话",
			"hero.streak": "🔥 连续打卡 {n} 天",
			"hero.thisCost": "本会话 {cost}",
			"hero.cache": "缓存命中 {percent}%",
			"usage.total": "总用量",
			"usage.today": "本日",
			"usage.week": "本周",
			"sec.context": "上下文占用",
			"ctx.remaining": "剩余 {count}",
			"ctx.legend.system": "系统",
			"ctx.legend.tools": "工具",
			"ctx.legend.messages": "消息",
			"ctx.subagent": "子代理累计 {duration}",
			"sec.achievements": "成就收集",
			"ach.streak3": "三日之约",
			"ach.streak3.cond": "连续打卡 3 天",
			"ach.streak7": "七日不辍",
			"ach.streak7.cond": "连续打卡 7 天",
			"ach.streak30": "月度传说",
			"ach.streak30.cond": "连续打卡 30 天",
			"ach.day10": "十日耕者",
			"ach.day10.cond": "累计活跃 10 天",
			"ach.day50": "五十日林",
			"ach.day50.cond": "累计活跃 50 天",
			"ach.peak100k": "单日十万",
			"ach.peak100k.cond": "单日消耗 10万 token",
			"ach.peak1m": "单日百万",
			"ach.peak1m.cond": "单日消耗 100万 token",
			"ach.session10": "十会话",
			"ach.session10.cond": "累计 10 个会话",
			"ach.session50": "五十会话",
			"ach.session50.cond": "累计 50 个会话",
			"sec.session": "本会话",
			"sec.model": "分模型",
			"sec.trend": "每轮走势",
			"sec.cumulative": "累计输出",
			"sec.global": "全局",
			"tokens.cost": "成本",
			"tokens.in": "输入",
			"tokens.out": "输出",
			"tokens.total": "合计",
			"tokens.cache": "缓存命中 {percent}%",
			"global.tokens": "总 token",
			"global.cost": "总成本",
			"legend.in": "入",
			"legend.out": "出",
			"model.value": "出 {out} · 入 {in}",
			"spark.empty": "暂无数据",
			"note.pricing": "按官方价目估算（北京时间 9–12、14–18 高峰自动切价，2026-08-17 起）",
			"window.peak": "⛰️ 高峰价",
			"window.offpeak": "🌙 闲时价",
			"rank.0": "🌱 词芽未醒",
			"rank.1": "🥉 词徒",
			"rank.2": "💬 白银话痨",
			"rank.3": "💰 百万词翁",
			"rank.4": "🧲 万词王",
			"rank.5": "🎯 亿词小目标",
			"rank.6": "👑 十亿词霸",
			"rank.7": "📜 百亿词圣",
			"rank.8": "🧚 千亿词仙",
			"rank.9": "⚡ 万亿词神",
			"panel.collapse.aria": "收起面板",
			"sec.heat": "每日热力",
			"heat.note": "按会话最近活跃日归集"
		};
		const en = {
			"panel.title": "Usage",
			"live": "LIVE",
			"rank.title": "Word Guild",
			"rank.lv": "LV.{n}",
			"rank.current": "current",
			"rank.unlocked": "unlocked",
			"rank.locked": "locked",
			"rank.next": "{count} tokens to {name}",
			"rank.max": "已达最高段位",
			"rank.max": "Max rank reached",
			"rank.eta": "At this pace, ~{days}d to unlock",
			"rank.eta.today": "At this pace, unlocking today",
			"rank.perk.current": "Current perk",
			"rank.perk.next": "Next unlock",
			"rank.percent": "{percent}%",
			"perk.0": "Unlocks the usage panel",
			"perk.1": "Unlocks badge animation",
			"perk.2": "Silver frame unlocked",
			"perk.3": "Golden numbers unlocked",
			"perk.4": "Diamond shimmer unlocked",
			"perk.5": "Red alert unlocked",
			"perk.6": "Crown unlocked",
			"perk.7": "Azure halo unlocked",
			"perk.8": "Violet stardust unlocked",
			"perk.9": "Rainbow supreme unlocked",
			"hero.sessions": "across {n} sessions",
			"hero.streak": "🔥 {n}-day streak",
			"hero.thisCost": "this session {cost}",
			"hero.cache": "cache hit {percent}%",
			"usage.total": "Total",
			"usage.today": "Today",
			"usage.week": "This week",
			"sec.context": "Context",
			"ctx.remaining": "{count} left",
			"ctx.legend.system": "system",
			"ctx.legend.tools": "tools",
			"ctx.legend.messages": "messages",
			"ctx.subagent": "subagents {duration}",
			"sec.achievements": "Achievements",
			"ach.streak3": "3-Day Pact",
			"ach.streak3.cond": "3-day streak",
			"ach.streak7": "Week Warrior",
			"ach.streak7.cond": "7-day streak",
			"ach.streak30": "Month Legend",
			"ach.streak30.cond": "30-day streak",
			"ach.day10": "Ten-Day Tiller",
			"ach.day10.cond": "10 active days",
			"ach.day50": "Fifty-Day Grove",
			"ach.day50.cond": "50 active days",
			"ach.peak100k": "Hundred-K Day",
			"ach.peak100k.cond": "100K tokens in one day",
			"ach.peak1m": "Million Day",
			"ach.peak1m.cond": "1M tokens in one day",
			"ach.session10": "Ten Sessions",
			"ach.session10.cond": "10 sessions",
			"ach.session50": "Fifty Sessions",
			"ach.session50.cond": "50 sessions",
			"sec.session": "This session",
			"sec.model": "By model",
			"sec.trend": "Per turn",
			"sec.cumulative": "Cumulative output",
			"sec.global": "All sessions",
			"tokens.cost": "Cost",
			"tokens.in": "Input",
			"tokens.out": "Output",
			"tokens.total": "Total",
			"tokens.cache": "cache hit {percent}%",
			"global.tokens": "total tokens",
			"global.cost": "total cost",
			"legend.in": "in",
			"legend.out": "out",
			"model.value": "out {out} · in {in}",
			"spark.empty": "No data yet",
			"note.pricing": "Estimated from official list prices (peak windows 9–12 & 14–18 Beijing, from 2026-08-17)",
			"window.peak": "⛰️ peak",
			"window.offpeak": "🌙 off-peak",
			"rank.0": "🐣 Unawakened Sprout",
			"rank.1": "🥉 Word Apprentice",
			"rank.2": "🥈 Silver Chatterbox",
			"rank.3": "🥇 Token Millionaire",
			"rank.4": "💎 Wordlord",
			"rank.5": "🚀 The Billion-Token Small Goal",
			"rank.6": "👑 Billion-Token Wordmaster",
			"rank.7": "🐲 Hundred-Billion Word Saint",
			"rank.8": "🌌 Trillion Word Immortal",
			"rank.9": "⚡ Ten-Trillion Word God",
			"panel.collapse.aria": "Collapse panel",
			"sec.heat": "Daily heat",
			"heat.note": "grouped by last activity day"
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
			}), "dsh-board: dictionaries");
			ctx.effect(() => ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "dsh-board-usage",
				order: 30,
				locale: NS,
				inject: () => ({ api: ctx.connection.api })
			}, SidebarUsage)), "dsh-board: sidebar usage entry");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map