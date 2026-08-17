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
  aspect-ratio: 1 / 0.58;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  background:
    linear-gradient(150deg, color-mix(in srgb, var(--tier, #4d6bfe) 32%, transparent), transparent 62%),
    linear-gradient(220deg, color-mix(in srgb, #22d3ee 18%, transparent), transparent 55%),
    var(--dsw-alias-bg-layer-1, #ffffff);
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
  outline: 2px solid var(--dsw-alias-state-business-primary, #4d6bfe);
  outline-offset: 2px;
}
.dsh-board-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}
/* Header row: rank tag on the left, live rate chip on the right. */
.dsh-board-badge-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
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
  font-size: 14px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1a1a);
}
.dsh-board-badge-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
}
.dsh-board-badge-nums {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}
.dsh-board-badge-cost {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--dsw-alias-state-business-primary, #4d6bfe);
  line-height: 1.2;
}
.dsh-board-chevron {
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-live-dot {
  position: absolute;
  top: 6px;
  left: 7px;
  line-height: 0;
}
/* Live rate chip: which regime and the current output ¥/M. */
.dsh-board-window {
  flex: none;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-board-window-standard {
  color: var(--dsw-alias-label-secondary, #6b7280);
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.06));
}
.dsh-board-window-peak {
  color: var(--dsw-alias-state-warn-primary, #f59e0b);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f59e0b) 12%, transparent);
}
.dsh-board-window-offpeak {
  color: var(--dsw-alias-state-success-primary, #16a34a);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #16a34a) 12%, transparent);
}
/* Rail: a plain circular entry. */
.dsh-board-orb {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.06));
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
}
.dsh-board-orb-emoji {
  font-size: 16px;
  line-height: 1;
}

/* Panel: a clean raised surface. */
.dsh-board-panel {
  box-sizing: border-box;
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
}
.dsh-board-panel::-webkit-scrollbar {
  width: 6px;
}
.dsh-board-panel::-webkit-scrollbar-thumb {
  background: var(--dsw-alias-scrollbar-bg-l1, #d4d4d4);
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
/* Rail mode: first paint keeps the popover in-flow beside the orb, then the
   layout effect pins it to viewport coordinates (escapes the narrow column's
   overflow clip). */
.dsh-board-rail .dsh-board-panel {
  position: absolute;
  top: auto;
  left: calc(100% + 8px);
}
/* Wide sidebar, expanded: one unit anchored at the foot — the badge
   rides up to the top, the panel hangs beneath it with a capped height
   and internal scroll so the session list above stays reachable. */
.dsh-board-open {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 60;
}
.dsh-board-open .dsh-board-trigger {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
}
.dsh-board-open .dsh-board-panel {
  position: static;
  width: 100%;
  max-height: min(44vh, 300px);
  overflow-y: auto;
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.dsh-board-empty {
  padding: 28px 0 12px;
  text-align: center;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #6b7280);
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
  outline: 2px solid var(--dsw-alias-state-business-primary, #4d6bfe);
  outline-offset: 2px;
}
.dsh-board-close:hover {
  color: var(--dsw-alias-label-primary, #1a1a1a);
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));
}

/* Membership card: quiet tier block. */
.dsh-board-card {
  position: relative;
  overflow: hidden;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.04));
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
  font-size: 10px;
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
  color: var(--dsw-alias-state-business-primary, #4d6bfe);
}
.dsh-board-card-current-tag {
  display: block;
  margin-top: 1px;
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #6b7280);
}
.dsh-board-card-bar {
  margin-top: 10px;
  height: 4px;
  border-radius: 999px;
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.08));
  overflow: hidden;
}
.dsh-board-card-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
}
.dsh-board-card-next-line {
  margin-top: 6px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
}
.dsh-board-card-eta {
  margin-top: 2px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-variant-numeric: tabular-nums;
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
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.05));
}
.dsh-board-card-rung-done {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 18%, transparent);
}
.dsh-board-card-rung-now {
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
}
.dsh-board-card-rung-locked {
  opacity: 0.4;
}

/* Hero: a plain large number. */
/* Context window: occupancy, remaining budget, and composition stack. */
.dsh-board-context {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.04));
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
  color: var(--dsw-alias-state-business-primary, #4d6bfe);
  font-variant-numeric: tabular-nums;
}
.dsh-board-context-bar {
  margin-top: 6px;
  height: 4px;
  border-radius: 999px;
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.08));
  overflow: hidden;
}
.dsh-board-context-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
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
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.06));
}
.dsh-board-context-part {
  display: block;
  height: 100%;
}
.dsh-board-context-part-system {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 40%, transparent);
}
.dsh-board-context-part-tools {
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
}
.dsh-board-context-part-messages {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 45%, transparent);
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
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
}
.dsh-board-context-dot-messages {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 45%, transparent);
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
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.04));
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
.dsh-board-hint {
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f59e0b) 35%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f59e0b) 8%, transparent);
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 10.5px;
  line-height: 1.5;
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
  color: var(--dsw-alias-state-business-primary, #4d6bfe);
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
  background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.08));
  overflow: hidden;
}
.dsh-board-model-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
}
.dsh-board-session-fill {
  height: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 65%, transparent);
}
.dsh-board-chart {
  display: block;
  margin-top: 4px;
}
.dsh-board-bar-in {
  fill: color-mix(in srgb, var(--dsw-alias-label-secondary, #9ca3af) 35%, transparent);
}
.dsh-board-bar-out {
  fill: var(--dsw-alias-state-business-primary, #4d6bfe);
}
.dsh-board-line {
  stroke: var(--dsw-alias-state-business-primary, #4d6bfe);
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.dsh-board-area-top {
  stop-color: var(--dsw-alias-state-business-primary, #4d6bfe);
  stop-opacity: 0.28;
}
.dsh-board-area-bottom {
  stop-color: var(--dsw-alias-state-business-primary, #4d6bfe);
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
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
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
  fill: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.08));
}
.dsh-board-heat-l1 {
  fill: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 22%, transparent);
}
.dsh-board-heat-l2 {
  fill: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 40%, transparent);
}
.dsh-board-heat-l3 {
  fill: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 58%, transparent);
}
.dsh-board-heat-l4 {
  fill: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 76%, transparent);
}
.dsh-board-heat-l5 {
  fill: var(--dsw-alias-state-business-primary, #4d6bfe);
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
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 35%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 6%, transparent);
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
`

/** Inject the stylesheet once (idempotent under re-evaluation). */
export function injectRichStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('style[data-plugin="dsh-board"]') !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-board'
  tag.textContent = CSS
  document.head.appendChild(tag)
}
