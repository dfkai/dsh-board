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
`

/** Inject the stylesheet once (idempotent under re-evaluation). */
export function injectRichStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('style[data-plugin="dsh-rich"]') !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-rich'
  tag.textContent = CSS
  document.head.appendChild(tag)
}
