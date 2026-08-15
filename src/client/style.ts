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
