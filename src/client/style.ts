/** Usage-panel styles, injected once per factory materialization.
 *  The loader removes plugin-owned style tags on unload. Colors ride the
 *  shell's theme tokens (--dsw-alias-*) with dark fallbacks. */

const CSS = `
.dsh-rich-foot {
  position: relative;
}
.dsh-rich-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background:
    linear-gradient(var(--dsw-alias-bg-layer-1, rgba(24, 26, 38, 0.92)), var(--dsw-alias-bg-layer-1, rgba(24, 26, 38, 0.92))) padding-box,
    linear-gradient(120deg, #7c5cff, #00c2ff, #ff5c7a, #ffd166, #7c5cff) border-box;
  background-size: 100% 100%, 300% 300%;
  color: var(--dsw-alias-label-secondary, #9b96b8);
  font-size: 12px;
  line-height: 1.3;
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  animation: dsh-rich-border-flow 6s linear infinite, dsh-rich-glow 2.6s ease-in-out infinite;
  transition: transform 150ms ease;
}
.dsh-rich-trigger:hover {
  transform: scale(1.05);
  color: var(--dsw-alias-label-primary, #f4f2ff);
}
@keyframes dsh-rich-border-flow {
  0% { background-position: 0 0, 0% 0; }
  100% { background-position: 0 0, 300% 0; }
}
@keyframes dsh-rich-glow {
  0%, 100% { box-shadow: 0 0 6px rgba(124, 92, 255, 0.25); }
  50% { box-shadow: 0 0 16px rgba(0, 194, 255, 0.45); }
}
.dsh-rich-trigger-rank {
  font-size: 14px;
  line-height: 1;
}
.dsh-rich-trigger-metrics {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.dsh-rich-trigger-tokens {
  font-weight: 700;
  background: linear-gradient(90deg, #7c5cff, #00c2ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.dsh-rich-trigger-cost {
  color: var(--dsw-alias-label-secondary, #9b96b8);
  font-size: 11px;
}
.dsh-rich-chevron {
  font-size: 10px;
  opacity: 0.8;
}
.dsh-rich-dot {
  line-height: 0;
  display: inline-flex;
}
/* Rail badge: a glowing pet-orb with a rotating conic ring. */
.dsh-rich-orb {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  background: var(--dsw-alias-bg-layer-1, rgba(24, 26, 38, 0.95));
  border: none;
}
.dsh-rich-orb::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #7c5cff, #00c2ff, #ff5c7a, #ffd166, #7c5cff);
  animation: dsh-rich-orb-rotate 3s linear infinite;
  z-index: -1;
}
@keyframes dsh-rich-orb-rotate {
  to { transform: rotate(360deg); }
}
.dsh-rich-orb-emoji {
  font-size: 15px;
  line-height: 1;
  animation: dsh-rich-orb-bounce 2.2s ease-in-out infinite;
}
@keyframes dsh-rich-orb-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
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
/* VIP membership card: prev → current → next tier + ladder strip. */
.dsh-rich-card {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--tier, #7c5cff) 55%, transparent);
  background:
    linear-gradient(140deg, color-mix(in srgb, var(--tier, #7c5cff) 12%, transparent), transparent 60%),
    color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.04)) 60%, transparent);
}
.dsh-rich-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9b96b8);
  letter-spacing: 0.03em;
  margin-bottom: 8px;
}
.dsh-rich-card-lv {
  font-weight: 700;
  color: var(--tier, #7c5cff);
}
.dsh-rich-card-body {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 6px;
}
.dsh-rich-card-step {
  text-align: center;
  padding: 6px 4px;
  border-radius: 8px;
  font-size: 10.5px;
  min-width: 0;
}
.dsh-rich-card-prev {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.05)) 60%, transparent);
  color: var(--dsw-alias-label-secondary, #9b96b8);
}
.dsh-rich-card-prev-empty {
  min-height: 1px;
}
.dsh-rich-card-next {
  border: 1px dashed color-mix(in srgb, var(--dsw-alias-border-l1, rgba(127, 127, 255, 0.25)) 70%, transparent);
  color: var(--dsw-alias-label-secondary, #9b96b8);
}
.dsh-rich-card-max {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--tier, #7c5cff);
}
.dsh-rich-card-step-emoji {
  display: block;
  font-size: 15px;
  line-height: 1.2;
}
.dsh-rich-card-next .dsh-rich-card-step-emoji {
  filter: grayscale(1);
  opacity: 0.5;
}
.dsh-rich-card-step-name {
  display: block;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-rich-card-step-status {
  display: block;
  font-size: 9.5px;
  opacity: 0.8;
}
.dsh-rich-card-current {
  text-align: center;
  padding: 8px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--tier, #7c5cff) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tier, #7c5cff) 60%, transparent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--tier, #7c5cff) 35%, transparent);
}
.dsh-rich-card-current-emoji {
  font-size: 22px;
  display: block;
  animation: dsh-rich-orb-bounce 2.2s ease-in-out infinite;
}
.dsh-rich-card-current-name {
  display: block;
  margin-top: 3px;
  font-weight: 700;
  font-size: 12.5px;
  color: var(--tier, #7c5cff);
}
.dsh-rich-card-current-tag {
  display: block;
  margin-top: 1px;
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--dsw-alias-label-secondary, #9b96b8);
}
.dsh-rich-card-bar {
  margin-top: 8px;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.10)) 85%, transparent);
  overflow: hidden;
}
.dsh-rich-card-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--tier, #7c5cff), color-mix(in srgb, var(--tier, #7c5cff) 55%, #ffffff), var(--tier, #7c5cff));
  background-size: 200% 100%;
  animation: dsh-rich-shimmer 2.4s linear infinite;
  transition: width 400ms ease;
}
@keyframes dsh-rich-shimmer {
  from { background-position: 0% 0; }
  to { background-position: 200% 0; }
}
.dsh-rich-card-next-line {
  margin-top: 5px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
}
.dsh-rich-card-ladder {
  margin-top: 8px;
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}
.dsh-rich-card-rung {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.06)) 70%, transparent);
}
.dsh-rich-card-rung-done {
  background: color-mix(in srgb, var(--tier, #7c5cff) 30%, transparent);
}
.dsh-rich-card-rung-now {
  background: color-mix(in srgb, var(--tier, #7c5cff) 25%, transparent);
  box-shadow: 0 0 0 1.5px var(--tier, #7c5cff);
  animation: dsh-rich-glow 2.6s ease-in-out infinite;
}
.dsh-rich-card-rung-locked {
  filter: grayscale(1);
  opacity: 0.45;
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
