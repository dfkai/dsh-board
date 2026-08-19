import { z } from "zod";
//#region src/host/model-projection.ts
/**
* Host-side session projection: the dominant model of each session.
*
* Sessions are priced per-model by the client; without this projection the
* client only knows the current session's model (from the history RPC) and
* had to price every OTHER session at the default model. The projection
* folds the session log's `request/header` events — pure, unit-tested,
* registered with the generic SessionProjectionRegistry the harness drives.
*
* Wire facts (verified against the live API): `request/header` carries
* `data.header.config.model` for the subsequent steps.
*/
/** Pure transition: keep the previous model until a header names a new one. */
function applyModelProjection(state, event) {
	if (event?.type !== "request/header") return state;
	const model = event.data?.header?.config?.model;
	if (typeof model === "string" && model !== "" && model !== state.model) return { model };
	return state;
}
const modelProjectionDefinition = {
	key: "dominantModel",
	schema: z.string(),
	init: () => ({ model: "" }),
	apply: applyModelProjection,
	view: (state) => state.model,
	stateVersion: 1
};
//#endregion
//#region src/pricing.ts
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
		const table = isPeakHour(nowMs) ? PEAK_PRICES : OFF_PEAK_PRICES;
		return table[modelId] ?? table["deepseek-v4-pro"];
	}
	return MODEL_PRICES[modelId] ?? MODEL_PRICES["deepseek-v4-pro"];
}
/** Number.isFinite guard for wire counts that may be missing or corrupt. */
function finite$2(n) {
	return typeof n === "number" && Number.isFinite(n) ? n : 0;
}
/** Estimate a session's cost from its durable tokenUsage projection. */
function estimateCost(usage, price = priceFor(void 0)) {
	return (finite$2(usage.uncachedInputTokens) + finite$2(usage.cacheWriteTokens)) * price.cacheMissPerM / 1e6 + finite$2(usage.cacheReadTokens) * price.cacheHitPerM / 1e6 + finite$2(usage.outputTokens) * price.outputPerM / 1e6;
}
//#endregion
//#region src/host/cost-projection.ts
/**
* Host-side session projection: the estimated cost of the session, priced
* per usage event at THAT event's own moment.
*
* The platform bills each request at its request time; a client that prices
* a whole session at its last-activity moment re-prices history whenever the
* peak/off-peak window flips. Every session event carries `time` (Unix ms),
* so this fold accumulates each usage sample at the rate table in force at
* its own timestamp — the same per-request口径 as the official bill.
*/
function finite$1(n) {
	return typeof n === "number" && Number.isFinite(n) ? n : 0;
}
/** Cost of one usage sample at one moment, for one model. */
function costOf(usage, model, timeMs) {
	if (usage === void 0) return 0;
	return estimateCost({
		uncachedInputTokens: finite$1(usage.inputTokens),
		cacheReadTokens: finite$1(usage.cacheReadTokens),
		cacheWriteTokens: finite$1(usage.cacheWriteTokens),
		outputTokens: finite$1(usage.outputTokens) + finite$1(usage.reasoningTokens)
	}, priceFor(model === "" ? void 0 : model, timeMs));
}
/** Pure transition over one committed event. */
function applyCostProjection(state, event) {
	if (event?.type === "request/header") {
		const model = event.data?.header?.config?.model;
		if (typeof model === "string" && model !== "" && model !== state.model) return {
			...state,
			model
		};
		return state;
	}
	const chunk = event?.type === "assistant/chunk" ? event.data?.chunk : void 0;
	const usage = event?.type === "assistant/chunk" ? chunk?.type === "usage" ? chunk.usage : void 0 : event?.type === "assistant/message" ? event.data?.usage : void 0;
	if (usage === void 0) return state;
	const turn = event.data?.turn;
	const step = event.data?.step;
	if (turn === void 0 || step === void 0) return state;
	const delta = costOf(usage, state.model, finite$1(event.time));
	if (state.last !== null && state.last.turn === turn && state.last.step === step) return {
		...state,
		cost: state.cost - state.last.delta + delta,
		last: {
			turn,
			step,
			delta
		}
	};
	return {
		...state,
		cost: state.cost + delta,
		last: {
			turn,
			step,
			delta
		}
	};
}
const sessionCostProjectionDefinition = {
	key: "sessionCost",
	schema: z.number(),
	init: () => ({
		cost: 0,
		model: "",
		last: null
	}),
	apply: applyCostProjection,
	view: (state) => state.cost,
	stateVersion: 1
};
//#endregion
//#region src/host/token-days-projection.ts
/**
* Host-side session projection: token usage per local calendar day.
*
* The client used to attribute a session's WHOLE lifetime total to the day
* of its last activity — so "today" swallowed the full history of any
* session touched today. Every event carries `time`, so this fold buckets
* each usage sample into the local-midnight key of its own day; the client
* then sums across sessions for 本日/本周 and the heatmap.
*/
function finite(n) {
	return typeof n === "number" && Number.isFinite(n) ? n : 0;
}
/** Total tokens (input + output incl. reasoning) of one usage sample. */
function tokenDeltaOf(usage) {
	if (usage === void 0) return 0;
	return finite(usage.inputTokens) + finite(usage.cacheReadTokens) + finite(usage.cacheWriteTokens) + finite(usage.outputTokens) + finite(usage.reasoningTokens);
}
/** Local-midnight key of a Unix-ms timestamp (same口径 as the client's today/week). */
function dayKeyOf(timeMs) {
	return String(new Date(timeMs).setHours(0, 0, 0, 0));
}
/** Pure transition over one committed event. */
function applyTokenDays(state, event) {
	const chunk = event?.type === "assistant/chunk" ? event.data?.chunk : void 0;
	const usage = event?.type === "assistant/chunk" ? chunk?.type === "usage" ? chunk.usage : void 0 : event?.type === "assistant/message" ? event.data?.usage : void 0;
	if (usage === void 0) return state;
	const turn = event.data?.turn;
	const step = event.data?.step;
	if (turn === void 0 || step === void 0) return state;
	const delta = tokenDeltaOf(usage);
	const day = dayKeyOf(finite(event.time));
	const days = { ...state.days };
	if (state.last !== null && state.last.turn === turn && state.last.step === step) days[state.last.day] = (days[state.last.day] ?? 0) - state.last.delta;
	days[day] = (days[day] ?? 0) + delta;
	return {
		days,
		last: {
			turn,
			step,
			day,
			delta
		}
	};
}
const tokenDaysProjectionDefinition = {
	key: "tokenDays",
	schema: z.record(z.string(), z.number()),
	init: () => ({
		days: {},
		last: null
	}),
	apply: applyTokenDays,
	view: (state) => state.days,
	stateVersion: 1
};
//#endregion
//#region src/index.ts
const name = "dsh-board";
function apply(ctx) {
	ctx.inject(["sessionProjections"], (projectionCtx) => {
		projectionCtx.sessionProjections.register(modelProjectionDefinition);
		projectionCtx.sessionProjections.register(sessionCostProjectionDefinition);
		projectionCtx.sessionProjections.register(tokenDaysProjectionDefinition);
	});
}
//#endregion
export { apply, name };
