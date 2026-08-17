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
//#region src/index.ts
const name = "dsh-board";
function apply(ctx) {
	ctx.inject(["sessionProjections"], (projectionCtx) => {
		projectionCtx.sessionProjections.register(modelProjectionDefinition);
	});
}
//#endregion
export { apply, name };
