/** AI-styled strip styles, injected once per factory materialization.
 *  The loader removes plugin-owned style tags on unload. */

const CSS = `
.dsh-rich-strip {
  box-sizing: border-box;
  margin: 6px 0 2px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(124, 92, 255, 0.28);
  background:
    linear-gradient(135deg, rgba(124, 92, 255, 0.14) 0%, rgba(30, 144, 255, 0.10) 45%, rgba(0, 229, 255, 0.08) 100%),
    rgba(20, 22, 32, 0.72);
  backdrop-filter: blur(6px);
  color: #e8e6f5;
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
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid var(--accent, rgba(255, 255, 255, 0.10));
  transition: border-color 180ms ease;
}
.dsh-rich-label {
  color: #9b96b8;
  font-size: 11px;
  letter-spacing: 0.02em;
}
.dsh-rich-value {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 600;
  color: #f4f2ff;
  font-variant-numeric: tabular-nums;
}
.dsh-rich-sub {
  margin-top: 1px;
  color: #8b87a8;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-rich-empty {
  padding: 4px 12px;
}
.dsh-rich-empty-text {
  color: #8b87a8;
  font-size: 11px;
  letter-spacing: 0.02em;
}
.dsh-rich-bar {
  height: 4px;
  margin-top: 5px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.dsh-rich-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #7c5cff, #00e5ff);
  transition: width 300ms ease;
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
