/** AI-styled strip styles, injected once per factory materialization.
 *  The loader removes plugin-owned style tags on unload. Colors ride the
 *  shell's theme tokens (--dsw-alias-*) with dark fallbacks, so the strip
 *  follows the active theme without extra wiring. */

const CSS = `
.dsh-rich-strip {
  box-sizing: border-box;
  margin: 6px 0 2px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(124, 92, 255, 0.28));
  background:
    linear-gradient(135deg, rgba(124, 92, 255, 0.14) 0%, rgba(30, 144, 255, 0.10) 45%, rgba(0, 229, 255, 0.08) 100%),
    var(--dsw-alias-bg-layer-1, rgba(20, 22, 32, 0.72));
  backdrop-filter: blur(6px);
  color: var(--dsw-alias-label-primary, #e8e6f5);
  font-size: 12px;
  line-height: 1.35;
}
.dsh-rich-cells {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dsh-rich-cell {
  flex: 1 1 120px;
  min-width: 110px;
  padding: 6px 9px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.045)) 60%, transparent);
  border: 1px solid var(--accent, var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.10)));
  transition: border-color 180ms ease;
}
.dsh-rich-label {
  color: var(--dsw-alias-label-secondary, #9b96b8);
  font-size: 11px;
  letter-spacing: 0.02em;
}
.dsh-rich-value {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #f4f2ff);
  font-variant-numeric: tabular-nums;
}
.dsh-rich-sub {
  margin-top: 1px;
  color: var(--dsw-alias-label-secondary, #8b87a8);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-rich-bar {
  height: 4px;
  margin-top: 5px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.08)) 80%, transparent);
  overflow: hidden;
}
.dsh-rich-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--dsw-alias-brand-primary, #7c5cff), #00e5ff);
  transition: width 300ms ease;
}
.dsh-rich-empty {
  padding: 4px 12px;
}
.dsh-rich-empty-text {
  color: var(--dsw-alias-label-secondary, #8b87a8);
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
