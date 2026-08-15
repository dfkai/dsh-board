window.__ModuleLoader__.load({
	id: "dsh-rich",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
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
			if (n < 1e8) return `${Math.round(n / 1e4) / 100}万`;
			return `${Math.round(n / 1e7) / 100}亿`;
		}
		/** Compact cost display. */
		function formatCost(cost) {
			if (cost <= 0) return "¥0";
			if (cost < .01) return `¥${cost.toFixed(4)}`;
			return `¥${cost.toFixed(2)}`;
		}
		//#endregion
		//#region src/client/levels.ts
		const LEVELS = [
			{
				floor: 0,
				emoji: "🐣",
				zh: "词芽未醒",
				en: "Unawakened Sprout"
			},
			{
				floor: 1e4,
				emoji: "🥉",
				zh: "打字机学徒",
				en: "Typist Apprentice"
			},
			{
				floor: 1e5,
				emoji: "🥈",
				zh: "白银话痨",
				en: "Silver Chatterbox"
			},
			{
				floor: 1e6,
				emoji: "🥇",
				zh: "黄金炼丹师",
				en: "Gold Alchemist"
			},
			{
				floor: 1e7,
				emoji: "💎",
				zh: "钻石词匠",
				en: "Diamond Wordsmith"
			},
			{
				floor: 1e8,
				emoji: "🚀",
				zh: "星际词王",
				en: "Interstellar Wordlord"
			},
			{
				floor: 1e9,
				emoji: "👑",
				zh: "十亿词帝",
				en: "Billion-Token Emperor"
			},
			{
				floor: 1e10,
				emoji: "🐲",
				zh: "百亿言灵龙",
				en: "Hundred-Billion Wordwyrm"
			},
			{
				floor: 1e11,
				emoji: "🌌",
				zh: "千亿创世者",
				en: "Trillion Genesis"
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
		//#region src/client/SidebarUsage.tsx
		const COLLAPSE_KEY = "dsh-rich.collapsed";
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
		function SectionTitle({ emoji, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-rich-sec",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dsh-rich-sec-emoji",
					children: emoji
				}), children]
			});
		}
		function MiniEmpty({ text }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-rich-mini",
				children: text
			});
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
		/** Stacked per-turn input/output bars. */
		function TrendBars({ data }) {
			const max = Math.max(1, ...data.map((item) => item.input + item.output));
			const width = data.length * 10 - 4;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "dsh-rich-chart",
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
							className: "dsh-rich-bar-in",
							x,
							y: 36 - inH,
							width: 6,
							height: inH,
							rx: 2
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							className: "dsh-rich-bar-out",
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
				className: "dsh-rich-chart",
				viewBox: `0 0 ${w} ${h}`,
				width: "100%",
				height: h,
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("linearGradient", {
						id: "dsh-rich-area",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
							offset: "0%",
							className: "dsh-rich-area-top"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("stop", {
							offset: "100%",
							className: "dsh-rich-area-bottom"
						})]
					}) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: area,
						fill: "url(#dsh-rich-area)"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polyline", {
						points: points.join(" "),
						className: "dsh-rich-line",
						fill: "none"
					})
				]
			});
		}
		function ModelRows({ models, t }) {
			const max = Math.max(1, ...models.map((item) => item.output));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-rich-models",
				children: models.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-rich-model",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rich-model-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-rich-model-name",
							title: item.model,
							children: ["🤖 ", item.model]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-rich-model-value",
							children: t("model.value", {
								out: formatTokens(item.output),
								in: formatTokens(item.input)
							})
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rich-model-bar",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-rich-model-fill",
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
				className: "dsh-rich-heatmap",
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
						className: `dsh-rich-heat-l${level}`,
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
				className: "dsh-rich-sessions",
				children: sessions.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-rich-session",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rich-session-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-rich-session-title",
							title: item.title,
							children: item.title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-rich-session-value",
							children: formatTokens(item.tokens)
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rich-session-bar",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-rich-session-fill",
							style: { width: `${item.tokens / max * 100}%` }
						})
					})]
				}, item.id))
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
			(0, react.useEffect)(() => {
				if (current === void 0) return;
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
				open,
				collapsed,
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
				return {
					input,
					output,
					cost,
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
			const sessionCost = usage === void 0 ? 0 : estimateCost(usage);
			const totalIn = usage === void 0 ? 0 : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
			const totalTokens = totalIn + (usage?.outputTokens ?? 0);
			const cacheHitPercent = totalIn === 0 ? null : Math.round((usage?.cacheReadTokens ?? 0) / totalIn * 100);
			const hero = useCountUp(lifetime.total);
			const rank = rankFor(lifetime.total);
			const rankName = t(`rank.${LEVELS.indexOf(rank.level)}`);
			const rankProgress = rank.next === null ? 1 : (lifetime.total - rank.level.floor) / (rank.next.floor - rank.level.floor);
			const rankSub = rank.next === null ? t("rank.max") : t("rank.next", {
				name: t(`rank.${LEVELS.indexOf(rank.next)}`),
				count: formatTokens(rank.next.floor - lifetime.total)
			});
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
				className: "dsh-rich-panel",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rich-panel-title",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["⚡ ", t("panel.title")] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-rich-title-right",
							children: [running ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsh-rich-live",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
									state: "ongoing",
									className: "dsh-rich-dot"
								}), t("live")]
							}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-rich-close",
								"aria-label": t("panel.collapse.aria"),
								onClick: () => {
									if (wide) setCollapsed(true);
									else setOpen(false);
								},
								children: "✕"
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, {
						emoji: "🏆",
						children: t("rank.title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rich-rank",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-rich-rank-emoji",
							children: rank.level.emoji
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-rich-rank-body",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-rich-rank-name",
									children: rankName
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-rich-rank-bar",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dsh-rich-rank-fill",
										style: { width: `${Math.min(100, rankProgress * 100)}%` }
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-rich-rank-next",
									children: rankSub
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rich-hero",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-rich-hero-value",
							children: formatTokens(hero)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-rich-hero-label",
							children: t("global.tokens")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rich-hero-sub",
						children: [
							t("hero.sessions", { n: ids.length }),
							" · ",
							t("global.cost"),
							" ",
							formatCost(lifetime.cost)
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, {
						emoji: "💰",
						children: t("sec.session")
					}),
					usage === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MiniEmpty, { text: t("spark.empty") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rich-rows",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
								label: t("tokens.cost"),
								value: formatCost(sessionCost)
							}),
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, {
						emoji: "🧮",
						children: t("sec.model")
					}),
					models.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MiniEmpty, { text: t("spark.empty") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelRows, {
						models,
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, {
						emoji: "📈",
						children: t("sec.trend")
					}),
					fold.perTurn.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MiniEmpty, { text: t("spark.empty") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrendBars, { data: fold.perTurn.slice(-24) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rich-legend",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dsh-rich-legend-in" }), t("legend.in")] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dsh-rich-legend-out" }), t("legend.out")] })]
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, {
						emoji: "📉",
						children: t("sec.cumulative")
					}),
					fold.cumulative.length < 2 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MiniEmpty, { text: t("spark.empty") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CumulativeArea, { values: fold.cumulative.slice(-60) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, {
						emoji: "📅",
						children: t("sec.heat")
					}),
					lifetime.daily.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MiniEmpty, { text: t("spark.empty") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Heatmap, { daily: lifetime.daily }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rich-heat-note",
						children: t("heat.note")
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTitle, {
						emoji: "🌌",
						children: t("sec.global")
					}),
					lifetime.sessions.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MiniEmpty, { text: t("spark.empty") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionRows, { sessions: lifetime.sessions }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rich-note",
						children: t("note.pricing")
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: "dsh-rich-foot",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "dsh-rich-trigger",
					"aria-expanded": wide ? !collapsed : open,
					title: t("panel.title"),
					onClick: toggle,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-rich-trigger-emoji",
							children: "⚡"
						}),
						wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-rich-trigger-label",
							children: t("trigger.wide", { cost: formatCost(sessionCost) })
						}) : null,
						running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
							state: "ongoing",
							className: "dsh-rich-dot"
						}) : null,
						wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-rich-chevron",
							children: collapsed ? "▸" : "▾"
						}) : null
					]
				}), wide ? collapsed ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-rich-inline",
					children: panel
				}) : open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-rich-float",
					children: panel
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
.dsh-rich-trigger-emoji {
  font-size: 13px;
}
.dsh-rich-chevron {
  font-size: 10px;
  opacity: 0.8;
}
.dsh-rich-dot {
  line-height: 0;
  display: inline-flex;
}
.dsh-rich-panel {
  width: 250px;
  max-height: min(520px, 68vh);
  overflow-y: auto;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(127, 127, 255, 0.25));
  background: var(--dsw-alias-bg-layer-1, rgba(24, 26, 38, 0.96));
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  color: var(--dsw-alias-label-primary, #ecebf5);
  font-size: 12px;
  line-height: 1.45;
  animation: dsh-rich-pop 160ms ease;
}
.dsh-rich-inline .dsh-rich-panel {
  width: auto;
  margin-top: 6px;
  box-shadow: none;
}
.dsh-rich-float .dsh-rich-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 60;
}
@keyframes dsh-rich-pop {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
.dsh-rich-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9b96b8);
  letter-spacing: 0.03em;
  margin-bottom: 8px;
}
.dsh-rich-title-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.dsh-rich-close {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9b96b8);
  font-size: 11px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 6px;
  cursor: pointer;
}
.dsh-rich-close:hover {
  color: var(--dsw-alias-label-primary, #f4f2ff);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.05)) 60%, transparent);
}
.dsh-rich-heatmap {
  display: block;
  margin-top: 4px;
}
.dsh-rich-heat-l0 {
  fill: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.08)) 80%, transparent);
}
.dsh-rich-heat-l1 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #7c5cff) 22%, transparent);
}
.dsh-rich-heat-l2 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #7c5cff) 40%, transparent);
}
.dsh-rich-heat-l3 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #7c5cff) 58%, transparent);
}
.dsh-rich-heat-l4 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #7c5cff) 76%, transparent);
}
.dsh-rich-heat-l5 {
  fill: var(--dsw-alias-brand-primary, #7c5cff);
}
.dsh-rich-heat-note {
  margin-top: 3px;
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
}
.dsh-rich-live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-state-success-primary, #4ade80);
  font-size: 10px;
  letter-spacing: 0.06em;
}
.dsh-rich-sec {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 10px 0 5px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9b96b8);
  letter-spacing: 0.02em;
}
.dsh-rich-sec-emoji {
  font-size: 12px;
}
.dsh-rich-rank {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.04)) 60%, transparent);
}
.dsh-rich-rank-emoji {
  font-size: 20px;
  line-height: 1;
}
.dsh-rich-rank-body {
  flex: 1;
  min-width: 0;
}
.dsh-rich-rank-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #f6f4ff);
}
.dsh-rich-rank-bar {
  margin-top: 4px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.10)) 85%, transparent);
  overflow: hidden;
}
.dsh-rich-rank-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dsw-alias-brand-primary, #7c5cff), #00c2ff);
  transition: width 400ms ease;
}
.dsh-rich-rank-next {
  margin-top: 3px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
}
.dsh-rich-hero {
  margin-top: 10px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.dsh-rich-hero-value {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, var(--dsw-alias-brand-primary, #7c5cff), #00c2ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-variant-numeric: tabular-nums;
}
.dsh-rich-hero-label {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9b96b8);
}
.dsh-rich-hero-sub {
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
}
.dsh-rich-rows {
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
.dsh-rich-models {
  display: grid;
  gap: 5px;
}
.dsh-rich-model-head,
.dsh-rich-session-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
}
.dsh-rich-model-name,
.dsh-rich-session-title {
  color: var(--dsw-alias-label-primary, #ecebf5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-rich-model-value,
.dsh-rich-session-value {
  color: var(--dsw-alias-label-secondary, #9b96b8);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-rich-model-bar,
.dsh-rich-session-bar {
  margin-top: 3px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.10)) 85%, transparent);
  overflow: hidden;
}
.dsh-rich-model-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dsw-alias-brand-primary, #7c5cff), #00c2ff);
  transition: width 300ms ease;
}
.dsh-rich-session-fill {
  height: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #7c5cff) 60%, transparent);
  transition: width 300ms ease;
}
.dsh-rich-chart {
  display: block;
  margin-top: 4px;
}
.dsh-rich-bar-in {
  fill: color-mix(in srgb, var(--dsw-alias-label-secondary, #9b96b8) 35%, transparent);
}
.dsh-rich-bar-out {
  fill: var(--dsw-alias-brand-primary, #7c5cff);
}
.dsh-rich-line {
  stroke: var(--dsw-alias-brand-primary, #7c5cff);
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.dsh-rich-area-top {
  stop-color: var(--dsw-alias-brand-primary, #7c5cff);
  stop-opacity: 0.35;
}
.dsh-rich-area-bottom {
  stop-color: var(--dsw-alias-brand-primary, #7c5cff);
  stop-opacity: 0;
}
.dsh-rich-legend {
  display: flex;
  gap: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
}
.dsh-rich-legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 3px;
  border-radius: 2px;
  vertical-align: -1px;
}
.dsh-rich-legend-in {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9b96b8) 35%, transparent);
}
.dsh-rich-legend-out {
  background: var(--dsw-alias-brand-primary, #7c5cff);
}
.dsh-rich-sessions {
  display: grid;
  gap: 5px;
}
.dsh-rich-mini {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
  margin-top: 4px;
}
.dsh-rich-note {
  margin-top: 10px;
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
			"trigger.wide": "用量 {cost}",
			"live": "LIVE",
			"rank.title": "段位",
			"rank.next": "距 {name} 还差 {count} token",
			"rank.max": "已达最高段位",
			"hero.sessions": "跨 {n} 个会话",
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
			"note.pricing": "按 deepseek-chat 公开价估算，可在 pricing.ts 调整",
			"rank.0": "🐣 词芽未醒",
			"rank.1": "🥉 打字机学徒",
			"rank.2": "🥈 白银话痨",
			"rank.3": "🥇 黄金炼丹师",
			"rank.4": "💎 钻石词匠",
			"rank.5": "🚀 星际词王",
			"rank.6": "👑 十亿词帝",
			"rank.7": "🐲 百亿言灵龙",
			"rank.8": "🌌 千亿创世者",
			"panel.collapse.aria": "收起面板",
			"sec.heat": "每日热力",
			"heat.note": "按会话最近活跃日归集"
		};
		const en = {
			"panel.title": "Usage",
			"trigger.wide": "Usage {cost}",
			"live": "LIVE",
			"rank.title": "Rank",
			"rank.next": "{count} tokens to {name}",
			"rank.max": "Max rank reached",
			"hero.sessions": "across {n} sessions",
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
			"note.pricing": "Estimated from public deepseek-chat prices; edit pricing.ts",
			"rank.0": "🐣 Unawakened Sprout",
			"rank.1": "🥉 Typist Apprentice",
			"rank.2": "🥈 Silver Chatterbox",
			"rank.3": "🥇 Gold Alchemist",
			"rank.4": "💎 Diamond Wordsmith",
			"rank.5": "🚀 Interstellar Wordlord",
			"rank.6": "👑 Billion-Token Emperor",
			"rank.7": "🐲 Hundred-Billion Wordwyrm",
			"rank.8": "🌌 Trillion Genesis",
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