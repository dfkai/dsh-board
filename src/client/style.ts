/** AI-styled strip styles, injected once per factory materialization.
 *  The loader removes plugin-owned style tags on unload. Colors ride the
 *  shell's theme tokens (--dsw-alias-*) with dark fallbacks, so the strip
 *  follows the active theme without extra wiring. One accent voice: the
 *  brand gradient lives only on the context flow bar; status semantics ride
 *  ui-primitives StateDot. */

const CSS = `
.dsh-rich-strip {
  box-sizing: border-box;
  margin: 8px 2px 4px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgba(127, 127, 255, 0.25)) 70%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1, rgba(24, 26, 38, 0.92)) 90%, var(--dsw-alias-brand-primary, #7c5cff) 6%);
  color: var(--dsw-alias-label-primary, #ecebf5);
  font-size: 12px;
  line-height: 1.4;
  animation: dsh-rich-enter 220ms ease;
}
@keyframes dsh-rich-enter {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: none; }
}
.dsh-rich-cells {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
  gap: 8px;
}
.dsh-rich-cell {
  position: relative;
  min-width: 0;
  padding: 8px 12px 9px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.04)) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgba(127, 127, 255, 0.18)) 55%, transparent);
  transition: border-color 160ms ease, transform 160ms ease;
}
.dsh-rich-cell:hover {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #7c5cff) 45%, transparent);
  transform: translateY(-1px);
}
.dsh-rich-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-label-secondary, #a09cb8);
  font-size: 11px;
  letter-spacing: 0.03em;
}
.dsh-rich-value {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #f6f4ff);
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
}
.dsh-rich-dot {
  line-height: 0;
  display: inline-flex;
}
.dsh-rich-sub {
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary, #8f8ba8);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-rich-bar {
  height: 3px;
  margin-top: 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.10)) 85%, transparent);
  overflow: hidden;
}
.dsh-rich-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dsw-alias-brand-primary, #7c5cff), #00c2ff, var(--dsw-alias-brand-primary, #7c5cff));
  background-size: 200% 100%;
  animation: dsh-rich-flow 2.4s linear infinite;
  transition: width 300ms ease;
}
@keyframes dsh-rich-flow {
  from { background-position: 0% 0; }
  to { background-position: 200% 0; }
}
.dsh-rich-empty {
  padding: 5px 12px;
}
.dsh-rich-empty-text {
  color: var(--dsw-alias-label-secondary, #8f8ba8);
  font-size: 11px;
  letter-spacing: 0.02em;
}
`

/** Inject the strip stylesheet once (idempotent under re-evaluation). */
export function injectRichStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('style[data-plugin="dsh-rich"]') !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-rich'
  tag.textContent = CSS
  document.head.appendChild(tag)
}
