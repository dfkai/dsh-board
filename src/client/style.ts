/** Usage-panel styles, injected once per factory materialization.
 *  The loader removes plugin-owned style tags on unload.
 *
 *  Visual language: DeepSeek-style restraint — the shell's theme tokens
 *  (--dsw-alias-*) for surfaces and labels, the brand primary as the single
 *  accent, hairline borders, quiet typography, and minimal motion. No
 *  rainbow borders, no bouncing decorations. */

const CSS = `
.dsh-rich-foot {
  position: relative;
}

/* Trigger: a quiet, app-native entry row. */
.dsh-rich-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  background: transparent;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: background 150ms ease;
}
.dsh-rich-trigger:hover {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04)) 70%, transparent);
}
.dsh-rich-trigger-rank {
  font-size: 13px;
  line-height: 1;
}
.dsh-rich-trigger-name {
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-weight: 600;
  font-size: 13px;
}
.dsh-rich-trigger-tokens {
  font-weight: 700;
  font-size: 15px;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dsh-rich-trigger-cost {
  color: var(--dsw-alias-brand-primary, #4d6bfe);
  font-weight: 700;
  font-size: 15px;
}
/* 5s presentation refresh pulse + blue flash when the cost changes. */
.dsh-rich-trigger-metrics {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  animation: dsh-rich-tick 600ms ease;
}
@keyframes dsh-rich-tick {
  0% { opacity: 0.45; transform: translateY(1px); }
  100% { opacity: 1; transform: none; }
}
.dsh-rich-trigger-metrics.dsh-rich-flash {
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-rich-chevron {
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-rich-dot {
  line-height: 0;
  display: inline-flex;
}
/* Rail: a plain circular entry. */
.dsh-rich-orb {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  background: var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
}
.dsh-rich-orb-emoji {
  font-size: 16px;
  line-height: 1;
}

/* Panel: a clean raised surface. */
.dsh-rich-panel {
  width: 240px;
  max-height: min(480px, 66vh);
  overflow-y: auto;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-size: 12px;
  line-height: 1.5;
  animation: dsh-rich-pop 140ms ease;
}
.dsh-rich-inline .dsh-rich-panel {
  width: auto;
  margin-top: 6px;
  box-shadow: none;
  border: none;
  padding: 10px 0;
  max-height: min(60vh, 560px);
  overflow-y: auto;
}
.dsh-rich-panel::-webkit-scrollbar {
  width: 6px;
}
.dsh-rich-panel::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.15)) 70%, transparent);
  border-radius: 999px;
}
.dsh-rich-panel::-webkit-scrollbar-track {
  background: transparent;
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
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  margin-bottom: 10px;
}
.dsh-rich-title-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.dsh-rich-live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-state-success-primary, #16a34a);
  font-size: 10px;
  letter-spacing: 0.06em;
  font-weight: 600;
}
.dsh-rich-close {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11px;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 6px;
  cursor: pointer;
}
.dsh-rich-close:hover {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04)) 70%, transparent);
}

/* Membership card: quiet tier block. */
.dsh-rich-card {
  position: relative;
  overflow: hidden;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.03)) 60%, transparent);
}
.dsh-rich-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  margin-bottom: 8px;
}
.dsh-rich-card-lv {
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dsh-rich-card-body {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}
.dsh-rich-card-step {
  text-align: center;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  min-width: 0;
}
.dsh-rich-card-prev-empty {
  min-height: 1px;
}
.dsh-rich-card-step-emoji {
  display: block;
  font-size: 15px;
  line-height: 1.2;
}
.dsh-rich-card-next .dsh-rich-card-step-emoji {
  filter: grayscale(1);
  opacity: 0.45;
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
  opacity: 0.7;
}
.dsh-rich-card-current {
  text-align: center;
  padding: 4px 10px;
}
.dsh-rich-card-current-emoji {
  font-size: 24px;
  display: block;
}
.dsh-rich-card-current-name {
  display: block;
  margin-top: 4px;
  font-weight: 600;
  font-size: 13px;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-rich-card-current-tag {
  display: block;
  margin-top: 1px;
  font-size: 9px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-rich-card-bar {
  margin-top: 10px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dsh-rich-card-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  transition: width 400ms ease;
}
.dsh-rich-card-next-line {
  margin-top: 6px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-rich-card-eta {
  margin-top: 2px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-rich-card-perks {
  margin-top: 8px;
  display: grid;
  gap: 3px;
}
.dsh-rich-card-perk {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dsh-rich-card-perk-locked {
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-rich-card-perk-label {
  color: var(--dsw-alias-label-secondary, #6b7280);
  white-space: nowrap;
}
.dsh-rich-card-perk-value {
  text-align: right;
}
.dsh-rich-card-ladder {
  margin-top: 8px;
  display: flex;
  gap: 4px;
}
.dsh-rich-card-rung {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.05)) 80%, transparent);
}
.dsh-rich-card-rung-done {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 18%, transparent);
}
.dsh-rich-card-rung-now {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-rich-card-rung-locked {
  opacity: 0.4;
}
/* Level-up: a brief, quiet brand wash. */
.dsh-rich-card.dsh-rich-levelup::after {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  animation: dsh-rich-celebrate 1.6s ease-out forwards;
  pointer-events: none;
}
@keyframes dsh-rich-celebrate {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 0; }
}

/* Hero: a plain large number. */
.dsh-rich-hero {
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.dsh-rich-hero-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
}
.dsh-rich-hero-label {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-rich-hero-sub {
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}

.dsh-rich-sec {
  margin: 12px 0 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #6b7280);
  letter-spacing: 0.02em;
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
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-rich-row-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.dsh-rich-row-value {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
}
.dsh-rich-row-value-emphasis {
  font-weight: 700;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-rich-row-sub {
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
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
  color: var(--dsw-alias-label-primary, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-rich-model-value,
.dsh-rich-session-value {
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-rich-model-bar,
.dsh-rich-session-bar {
  margin-top: 3px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dsh-rich-model-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  transition: width 300ms ease;
}
.dsh-rich-session-fill {
  height: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 65%, transparent);
  transition: width 300ms ease;
}
.dsh-rich-chart {
  display: block;
  margin-top: 4px;
}
.dsh-rich-bar-in {
  fill: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 35%, transparent);
}
.dsh-rich-bar-out {
  fill: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-rich-line {
  stroke: var(--dsw-alias-brand-primary, #4d6bfe);
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.dsh-rich-area-top {
  stop-color: var(--dsw-alias-brand-primary, #4d6bfe);
  stop-opacity: 0.28;
}
.dsh-rich-area-bottom {
  stop-color: var(--dsw-alias-brand-primary, #4d6bfe);
  stop-opacity: 0;
}
.dsh-rich-legend {
  display: flex;
  gap: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
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
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 35%, transparent);
}
.dsh-rich-legend-out {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-rich-sessions {
  display: grid;
  gap: 5px;
}
.dsh-rich-heatmap {
  display: block;
  margin-top: 4px;
}
.dsh-rich-heat-l0 {
  fill: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.06)) 80%, transparent);
}
.dsh-rich-heat-l1 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 22%, transparent);
}
.dsh-rich-heat-l2 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 40%, transparent);
}
.dsh-rich-heat-l3 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 58%, transparent);
}
.dsh-rich-heat-l4 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 76%, transparent);
}
.dsh-rich-heat-l5 {
  fill: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dsh-rich-heat-note {
  margin-top: 3px;
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
/* Achievement collection: pill badges, earned = brand tinted. */
.dsh-rich-achievements {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.dsh-rich-ach {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-rich-ach-got {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 35%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 6%, transparent);
}
.dsh-rich-ach-emoji {
  font-size: 11px;
}
.dsh-rich-ach:not(.dsh-rich-ach-got) .dsh-rich-ach-emoji {
  filter: grayscale(1);
  opacity: 0.5;
}
.dsh-rich-mini {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  margin-top: 4px;
}
.dsh-rich-note {
  margin-top: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
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
