/** Usage-panel styles, injected once per factory materialization.
 *  The loader removes plugin-owned style tags on unload.
 *
 *  Visual language: DeepSeek-style restraint — the shell's theme tokens
 *  (--dsw-alias-*) for surfaces and labels, the brand primary as the single
 *  accent, hairline borders, quiet typography, and minimal motion. No
 *  rainbow borders, no bouncing decorations. */

const CSS = `
.dshboard-foot {
  position: relative;
}

/* Trigger: a quiet, app-native entry row. */
.dshboard-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
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
.dshboard-trigger:hover {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04)) 70%, transparent);
}
.dshboard-trigger-rank {
  font-size: 13px;
  line-height: 1;
}
.dshboard-badge {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
}
.dshboard-badge-main {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dshboard-trigger-name {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-weight: 700;
  font-size: 14px;
}
.dshboard-trigger-tokens {
  font-weight: 700;
  font-size: 15px;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dshboard-trigger-cost {
  color: var(--dsw-alias-brand-primary, #4d6bfe);
  font-weight: 700;
  font-size: 15px;
}
.dshboard-trigger-context {
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-weight: 600;
  font-size: 13px;
}
.dshboard-trigger-sep {
  color: var(--dsw-alias-label-secondary, #9ca3af);
  font-weight: 400;
}
/* Blue flash when the badge numbers actually change. */
.dshboard-trigger-metrics {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
}
.dshboard-trigger-metrics.dshboard-flash {
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-chevron {
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-dot {
  line-height: 0;
  display: inline-flex;
}
/* Rail: a plain circular entry. */
.dshboard-orb {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  background: var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
}
.dshboard-orb-emoji {
  font-size: 16px;
  line-height: 1;
}

/* Panel: a clean raised surface. */
.dshboard-panel {
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
  animation: dshboard-pop 140ms ease;
}
.dshboard-inline .dshboard-panel {
  width: auto;
  margin-top: 6px;
  box-shadow: none;
  border: none;
  padding: 10px 0;
  max-height: min(60vh, 560px);
  overflow-y: auto;
}
.dshboard-panel::-webkit-scrollbar {
  width: 6px;
}
.dshboard-panel::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.15)) 70%, transparent);
  border-radius: 999px;
}
.dshboard-panel::-webkit-scrollbar-track {
  background: transparent;
}
.dshboard-float .dshboard-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 60;
}
@keyframes dshboard-pop {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
.dshboard-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  margin-bottom: 10px;
}
.dshboard-title-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.dshboard-live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-state-success-primary, #16a34a);
  font-size: 10px;
  letter-spacing: 0.06em;
  font-weight: 600;
}
.dshboard-close {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11px;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 6px;
  cursor: pointer;
}
.dshboard-close:hover {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04)) 70%, transparent);
}

/* Membership card: quiet tier block. */
.dshboard-card {
  position: relative;
  overflow: hidden;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.03)) 60%, transparent);
}
.dshboard-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  margin-bottom: 8px;
}
.dshboard-card-lv {
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dshboard-card-body {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}
.dshboard-card-step {
  text-align: center;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  min-width: 0;
}
.dshboard-card-prev-empty {
  min-height: 1px;
}
.dshboard-card-step-emoji {
  display: block;
  font-size: 15px;
  line-height: 1.2;
}
.dshboard-card-next .dshboard-card-step-emoji {
  filter: grayscale(1);
  opacity: 0.45;
}
.dshboard-card-step-name {
  display: block;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dshboard-card-step-status {
  display: block;
  font-size: 9.5px;
  opacity: 0.7;
}
.dshboard-card-current {
  text-align: center;
  padding: 4px 10px;
}
.dshboard-card-current-emoji {
  font-size: 24px;
  display: block;
}
.dshboard-card-current-name {
  display: block;
  margin-top: 4px;
  font-weight: 600;
  font-size: 13px;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-card-current-tag {
  display: block;
  margin-top: 1px;
  font-size: 9px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-card-bar {
  margin-top: 10px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dshboard-card-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  transition: width 400ms ease;
}
.dshboard-card-next-line {
  margin-top: 6px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-card-eta {
  margin-top: 2px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-card-perks {
  margin-top: 8px;
  display: grid;
  gap: 3px;
}
.dshboard-card-perk {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dshboard-card-perk-locked {
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-card-perk-label {
  color: var(--dsw-alias-label-secondary, #6b7280);
  white-space: nowrap;
}
.dshboard-card-perk-value {
  text-align: right;
}
.dshboard-card-ladder {
  margin-top: 8px;
  display: flex;
  gap: 4px;
}
.dshboard-card-rung {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.05)) 80%, transparent);
}
.dshboard-card-rung-done {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 18%, transparent);
}
.dshboard-card-rung-now {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-card-rung-locked {
  opacity: 0.4;
}
/* Level-up: a brief, quiet brand wash. */
.dshboard-card.dshboard-levelup::after {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  animation: dshboard-celebrate 1.6s ease-out forwards;
  pointer-events: none;
}
@keyframes dshboard-celebrate {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 0; }
}

/* Hero: a plain large number. */
/* Context window: occupancy, remaining budget, and composition stack. */
.dshboard-context {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.03)) 60%, transparent);
}
.dshboard-context-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.dshboard-context-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-context-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
  font-variant-numeric: tabular-nums;
}
.dshboard-context-bar {
  margin-top: 6px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dshboard-context-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  transition: width 400ms ease;
}
.dshboard-context-sub {
  margin-top: 4px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
}
.dshboard-context-stack {
  margin-top: 8px;
  display: flex;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.06)) 80%, transparent);
}
.dshboard-context-part {
  display: block;
  height: 100%;
}
.dshboard-context-part-system {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 40%, transparent);
}
.dshboard-context-part-tools {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-context-part-messages {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 45%, transparent);
}
.dshboard-context-legend {
  margin-top: 5px;
  display: flex;
  gap: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
}
.dshboard-context-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.dshboard-context-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.dshboard-context-dot-system {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 40%, transparent);
}
.dshboard-context-dot-tools {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-context-dot-messages {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 45%, transparent);
}
.dshboard-hero {
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.dshboard-hero-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
}
.dshboard-hero-label {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-hero-sub {
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}

.dshboard-sec {
  margin: 12px 0 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #6b7280);
  letter-spacing: 0.02em;
}
.dshboard-rows {
  display: grid;
  gap: 4px;
}
.dshboard-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
}
.dshboard-row-label {
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-row-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.dshboard-row-value {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
}
.dshboard-row-value-emphasis {
  font-weight: 700;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-row-sub {
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-models {
  display: grid;
  gap: 5px;
}
.dshboard-model-head,
.dshboard-session-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
}
.dshboard-model-name,
.dshboard-session-title {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dshboard-model-value,
.dshboard-session-value {
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dshboard-model-bar,
.dshboard-session-bar {
  margin-top: 3px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dshboard-model-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-brand-primary, #4d6bfe);
  transition: width 300ms ease;
}
.dshboard-session-fill {
  height: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 65%, transparent);
  transition: width 300ms ease;
}
.dshboard-chart {
  display: block;
  margin-top: 4px;
}
.dshboard-bar-in {
  fill: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 35%, transparent);
}
.dshboard-bar-out {
  fill: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-line {
  stroke: var(--dsw-alias-brand-primary, #4d6bfe);
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.dshboard-area-top {
  stop-color: var(--dsw-alias-brand-primary, #4d6bfe);
  stop-opacity: 0.28;
}
.dshboard-area-bottom {
  stop-color: var(--dsw-alias-brand-primary, #4d6bfe);
  stop-opacity: 0;
}
.dshboard-legend {
  display: flex;
  gap: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 3px;
  border-radius: 2px;
  vertical-align: -1px;
}
.dshboard-legend-in {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 35%, transparent);
}
.dshboard-legend-out {
  background: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-sessions {
  display: grid;
  gap: 5px;
}
.dshboard-heatmap {
  display: block;
  margin-top: 4px;
}
.dshboard-heat-l0 {
  fill: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.06)) 80%, transparent);
}
.dshboard-heat-l1 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 22%, transparent);
}
.dshboard-heat-l2 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 40%, transparent);
}
.dshboard-heat-l3 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 58%, transparent);
}
.dshboard-heat-l4 {
  fill: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 76%, transparent);
}
.dshboard-heat-l5 {
  fill: var(--dsw-alias-brand-primary, #4d6bfe);
}
.dshboard-heat-note {
  margin-top: 3px;
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
/* Achievement collection: pill badges, earned = brand tinted. */
.dshboard-achievements {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.dshboard-ach {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dshboard-ach-got {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 35%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 6%, transparent);
}
.dshboard-ach-emoji {
  font-size: 11px;
}
.dshboard-ach:not(.dshboard-ach-got) .dshboard-ach-emoji {
  filter: grayscale(1);
  opacity: 0.5;
}
.dshboard-mini {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  margin-top: 4px;
}
.dshboard-note {
  margin-top: 10px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
`

/** Inject the stylesheet once (idempotent under re-evaluation). */
export function injectRichStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('style[data-plugin="dshboard"]') !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dshboard'
  tag.textContent = CSS
  document.head.appendChild(tag)
}
