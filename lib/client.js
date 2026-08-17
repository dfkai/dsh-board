window.__ModuleLoader__.load({id:`dsh-board`,factory:e=>{var t={exports:{}},n=t.exports;Object.defineProperty(n,Symbol.toStringTag,{value:`Module`});let r=e("react"),i=e("@deepseek-ai/dsh-client-ui-primitives"),a=e("react/jsx-runtime"),o={"deepseek-v4-pro":{cacheHitPerM:.025,cacheMissPerM:3,outputPerM:6},"deepseek-v4-flash":{cacheHitPerM:.02,cacheMissPerM:1,outputPerM:2},"deepseek-chat":{cacheHitPerM:.5,cacheMissPerM:2,outputPerM:8},"deepseek-reasoner":{cacheHitPerM:1,cacheMissPerM:4,outputPerM:16}},s={"deepseek-v4-pro":{cacheHitPerM:.3,cacheMissPerM:9,outputPerM:27},"deepseek-v4-flash":{cacheHitPerM:.1,cacheMissPerM:3,outputPerM:9}},c={"deepseek-v4-pro":{cacheHitPerM:.15,cacheMissPerM:4.5,outputPerM:13.5},"deepseek-v4-flash":{cacheHitPerM:.05,cacheMissPerM:1.5,outputPerM:4.5}},l=Date.UTC(2026,7,16,16);function u(e=Date.now()){let t=(new Date(e).getUTCHours()+8)%24;return t>=9&&t<12||t>=14&&t<18}function d(e,t=Date.now()){let n=e??`deepseek-v4-pro`;if(t>=l){let e=u(t)?s:c;return e[n]??e[`deepseek-v4-pro`]}return o[n]??o[`deepseek-v4-pro`]}function f(e,t=Date.now()){return t<l?{window:`standard`,price:d(e,t)}:{window:u(t)?`peak`:`offpeak`,price:d(e,t)}}function p(e){return typeof e==`number`&&Number.isFinite(e)?e:0}function m(e,t=d(void 0)){return(p(e.uncachedInputTokens)+p(e.cacheWriteTokens))*t.cacheMissPerM/1e6+p(e.cacheReadTokens)*t.cacheHitPerM/1e6+p(e.outputTokens)*t.outputPerM/1e6}function h(e){return typeof e==`number`&&Number.isFinite(e)?e:0}function ee(e){let t=new Map,n=new Map,r=null;for(let i of e){let e=i.event;if(e?.type===`request/header`){let t=e.data?.header?.config?.model;typeof t==`string`&&t!==``&&(r=t);continue}if(e?.type!==`assistant/chunk`)continue;let a=e.data?.chunk;if(a?.type!==`usage`)continue;let o=e.data?.turn;if(o===void 0)continue;let s=h(a.usage?.inputTokens)+h(a.usage?.cacheWriteTokens),c=h(a.usage?.outputTokens)+h(a.usage?.reasoningTokens),l=h(a.usage?.cacheReadTokens),u=t.get(o)??{turn:o,input:0,output:0,cacheRead:0};if(u.input+=s,u.output+=c,u.cacheRead+=l,t.set(o,u),r!==null){let e=n.get(r)??{input:0,output:0,cacheRead:0};e.input+=s,e.output+=c,e.cacheRead+=l,n.set(r,e)}}let i=[...t.values()].sort((e,t)=>e.turn-t.turn),a=[],o=0;for(let e of i)o+=e.output,a.push(o);return{perTurn:i,perModel:n,cumulative:a}}function g(e,t=`zh`){if((!Number.isFinite(e)||e<0)&&(e=0),e<1e3)return String(Math.round(e));if(t!==`zh`)return e<1e6?`${Math.round(e/100)/10}K`:e<1e9?`${Math.round(e/1e5)/10}M`:`${Math.round(e/1e8)/10}B`;if(e<1e6){let t=Math.round(e/100)/10;return t>=1e3?`${t/10}万`:`${t}K`}if(e<1e8){let t=Math.round(e/1e3)/10;return t>=1e4?`${Math.round(t/1e3)/10}亿`:`${t}万`}return`${Math.round(e/1e7)/10}亿`}function _(e){return!Number.isFinite(e)||e<=0?`¥0`:e<1e-4?`¥<0.0001`:e<.01?`¥${e.toFixed(4)}`:`¥${e.toFixed(2)}`}function v(e){let t=e/1e3;if(t<60)return`${Math.round(t*10)/10}s`;let n=Math.round(t);return`${Math.floor(n/60)}m${n%60}s`}let y=[{floor:0,emoji:`🌱`,zh:`未醒词芽`,en:`the Unawakened Sprout`,color:`#6b6792`},{floor:1e4,emoji:`🥉`,zh:`词途学徒`,en:`Apprentice of the Word-Path`,color:`#a6601d`},{floor:1e5,emoji:`💬`,zh:`白银之舌`,en:`the Silver Tongue`,color:`#5f6b78`},{floor:1e6,emoji:`💰`,zh:`一词千金`,en:`One Word, A Thousand Gold`,color:`#a87d08`},{floor:1e7,emoji:`🧲`,zh:`万词王`,en:`Wordlord`,color:`#7c3aed`},{floor:1e8,emoji:`🎯`,zh:`亿词逐梦者`,en:`the Billion-Dream Chaser`,color:`#c02828`},{floor:1e9,emoji:`👑`,zh:`十亿词霸`,en:`Billion-Token Wordmaster`,color:`#9a3412`},{floor:1e10,emoji:`📜`,zh:`词林盟主`,en:`the Wordwood Overlord`,color:`#155e75`},{floor:1e11,emoji:`🧚`,zh:`词高八斗`,en:`the Eight-Bushel Wordsmith`,color:`#9333ea`},{floor:0xe8d4a51000,emoji:`⚡`,zh:`万亿词神`,en:`Ten-Trillion Word God`,color:`#854d0e`}];function b(e){let t=y[0];for(let n of y)e>=n.floor&&(t=n);let n=y.indexOf(t),r=n+1<y.length?y[n+1]:null;return{level:t,next:r}}function te(e,t){let n=new Set(e.filter(e=>e.tokens>0).map(e=>e.day)),r=new Date,i=new Date(r.getFullYear(),r.getMonth(),r.getDate()).getTime(),a=0,o=i;for(n.has(i)||(o-=864e5);n.has(o);)a+=1,o-=864e5;let s=[...n].sort((e,t)=>e-t),c=0,l=0,u=null;for(let e of s)l=u!==null&&e-u===864e5?l+1:1,l>c&&(c=l),u=e;let d=0;for(let t of e)t.tokens>d&&(d=t.tokens);return{streak:a,best:c,peakDay:d,activeDays:s.length,sessions:t}}let x=[{id:`streak3`,emoji:`🔥`,test:e=>e.best>=3},{id:`streak7`,emoji:`⚡`,test:e=>e.best>=7},{id:`streak30`,emoji:`🌙`,test:e=>e.best>=30},{id:`day10`,emoji:`🌱`,test:e=>e.activeDays>=10},{id:`day50`,emoji:`🌳`,test:e=>e.activeDays>=50},{id:`peak100k`,emoji:`💥`,test:e=>e.peakDay>=1e5},{id:`peak1m`,emoji:`🌋`,test:e=>e.peakDay>=1e6},{id:`session10`,emoji:`🗂`,test:e=>e.sessions>=10},{id:`session50`,emoji:`📚`,test:e=>e.sessions>=50}],S=`dsh-board.collapsed`,C={perTurn:[],perModel:new Map,cumulative:[]};function w(e){return typeof e==`number`&&Number.isFinite(e)?e:0}function ne(){try{return typeof localStorage<`u`&&localStorage.getItem(S)===`1`}catch{return!1}}function T({children:e}){return(0,a.jsx)(`div`,{className:`dsh-board-sec`,children:e})}function E({pressure:e,breakdown:t,subagentMs:n,t:r,lang:i}){if(e===void 0&&t===void 0)return null;let o=e?.projectedTokens??e?.pressureTokens,s=e?.contextWindow,c=o!==void 0&&s!==void 0?Math.min(100,Math.round(o/s*100)):null,l=o!==void 0&&s!==void 0?s-o:null,u=t===void 0?null:[{key:`system`,label:r(`ctx.legend.system`),tokens:t.systemTokens??0},{key:`tools`,label:r(`ctx.legend.tools`),tokens:t.toolsTokens??0},{key:`messages`,label:r(`ctx.legend.messages`),tokens:t.messageTokens??0}],d=u===null?0:u.reduce((e,t)=>e+t.tokens,0);return(0,a.jsxs)(`div`,{className:`dsh-board-context`,children:[(0,a.jsxs)(`div`,{className:`dsh-board-context-head`,children:[(0,a.jsx)(`span`,{className:`dsh-board-context-title`,children:r(`sec.context`)}),(0,a.jsx)(`span`,{className:`dsh-board-context-value`,children:c===null?`—`:`${c}%`})]}),c===null?null:(0,a.jsx)(`div`,{className:`dsh-board-context-bar`,children:(0,a.jsx)(`div`,{className:`dsh-board-context-fill`,style:{width:`${c}%`}})}),o!==void 0&&s!==void 0?(0,a.jsxs)(`div`,{className:`dsh-board-context-sub`,children:[g(o,i),` / `,g(s,i),` · `,r(`ctx.remaining`,{count:g(l??0,i)})]}):null,u!==null&&d>0?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(`div`,{className:`dsh-board-context-stack`,children:u.filter(e=>e.tokens>0).map(e=>(0,a.jsx)(`span`,{className:`dsh-board-context-part dsh-board-context-part-${e.key}`,style:{width:`${e.tokens/d*100}%`},title:`${e.label} ${g(e.tokens,i)}`},e.key))}),(0,a.jsx)(`div`,{className:`dsh-board-context-legend`,children:u.filter(e=>e.tokens>0).map(e=>(0,a.jsxs)(`span`,{className:`dsh-board-context-legend-item`,children:[(0,a.jsx)(`i`,{className:`dsh-board-context-dot dsh-board-context-dot-${e.key}`}),e.label,` `,g(e.tokens,i)]},e.key))})]}):null,n!==void 0&&n>0?(0,a.jsx)(`div`,{className:`dsh-board-context-sub`,children:r(`ctx.subagent`,{duration:v(n)})}):null]})}function D({data:e,t}){let n=Math.max(1,...e.map(e=>e.input+e.output)),r=e.length*10-4;return(0,a.jsx)(`svg`,{className:`dsh-board-chart`,viewBox:`0 0 ${r} 36`,width:`100%`,height:36,"aria-hidden":!0,children:e.map((e,r)=>{let i=Math.max(0,Math.round(e.input/n*34)),o=Math.max(0,Math.round(e.output/n*34)),s=r*10;return(0,a.jsxs)(`g`,{children:[(0,a.jsx)(`rect`,{className:`dsh-board-bar-in`,x:s,y:36-i,width:6,height:i,rx:2}),(0,a.jsx)(`rect`,{className:`dsh-board-bar-out`,x:s,y:36-i-o,width:6,height:o,rx:2}),(0,a.jsx)(`title`,{children:t(`trend.tooltip`,{turn:e.turn,in:e.input,out:e.output})})]},e.turn)})})}function O({values:e}){let t=e.length,n=Math.max(1,...e),r=t>1?236/(t-1):0,i=e.map((e,t)=>`${(t*r).toFixed(1)},${(33-e/n*28).toFixed(1)}`),o=`M 0,36 L ${i.join(` L `)} L ${(t-1)*r},36 Z`;return(0,a.jsxs)(`svg`,{className:`dsh-board-chart`,viewBox:`0 0 236 36`,width:`100%`,height:36,"aria-hidden":!0,children:[(0,a.jsx)(`defs`,{children:(0,a.jsxs)(`linearGradient`,{id:`dsh-board-area`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,a.jsx)(`stop`,{offset:`0%`,className:`dsh-board-area-top`}),(0,a.jsx)(`stop`,{offset:`100%`,className:`dsh-board-area-bottom`})]})}),(0,a.jsx)(`path`,{d:o,fill:`url(#dsh-board-area)`}),(0,a.jsx)(`polyline`,{points:i.join(` `),className:`dsh-board-line`,fill:`none`})]})}function k({models:e,t,lang:n}){let r=Math.max(1,...e.map(e=>e.output));return(0,a.jsx)(`div`,{className:`dsh-board-models`,children:e.map(e=>(0,a.jsxs)(`div`,{className:`dsh-board-model`,children:[(0,a.jsxs)(`div`,{className:`dsh-board-model-head`,children:[(0,a.jsx)(`span`,{className:`dsh-board-model-name`,title:e.model,children:e.model}),(0,a.jsx)(`span`,{className:`dsh-board-model-value`,children:t(`model.value`,{out:g(e.output,n),in:g(e.input,n)})})]}),(0,a.jsx)(`div`,{className:`dsh-board-model-bar`,children:(0,a.jsx)(`div`,{className:`dsh-board-model-fill`,style:{width:`${e.output/r*100}%`}})})]},e.model))})}function A({daily:e,t}){let n=new Date,r=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime()-71712e5,i=new Map(e.map(e=>[e.day,e.tokens])),o=Math.max(1,...e.map(e=>e.tokens));return(0,a.jsx)(`svg`,{className:`dsh-board-heatmap`,viewBox:`0 0 118 68`,width:118,height:68,"aria-hidden":!0,children:Array.from({length:84},(e,n)=>{let s=r+n*864e5,c=i.get(s)??0,l=c===0?0:Math.max(1,Math.min(5,Math.ceil(c/o*5))),u=Math.floor(n/7)*10,d=n%7*10;return(0,a.jsx)(`rect`,{className:`dsh-board-heat-l${l}`,x:u,y:d,width:8,height:8,rx:2,children:(0,a.jsx)(`title`,{children:t(`heat.day`,{date:new Date(s).toLocaleDateString(),tokens:c})})},s)})})}function j({sessions:e,lang:t}){let n=Math.max(1,...e.map(e=>e.tokens));return(0,a.jsx)(`div`,{className:`dsh-board-sessions`,children:e.map(e=>(0,a.jsxs)(`div`,{className:`dsh-board-session`,children:[(0,a.jsxs)(`div`,{className:`dsh-board-session-head`,children:[(0,a.jsx)(`span`,{className:`dsh-board-session-title`,title:e.title,children:e.title}),(0,a.jsx)(`span`,{className:`dsh-board-session-value`,children:g(e.tokens,t)})]}),(0,a.jsx)(`div`,{className:`dsh-board-session-bar`,children:(0,a.jsx)(`div`,{className:`dsh-board-session-fill`,style:{width:`${e.tokens/n*100}%`}})})]},e.id))})}function M({total:e,daily:t,t:n,lang:r}){let i=b(e),o=y.indexOf(i.level),s=o>0?y[o-1]:null,c=i.next,l=c===null?1:(e-i.level.floor)/(c.floor-i.level.floor),u=t.reduce((e,t)=>e+t.tokens,0)/Math.max(1,t.filter(e=>e.tokens>0).length),d=c===null?null:Math.ceil((c.floor-e)/Math.max(1,u));return(0,a.jsxs)(`div`,{className:`dsh-board-card`,children:[(0,a.jsxs)(`div`,{className:`dsh-board-card-head`,children:[(0,a.jsx)(`span`,{children:n(`rank.title`)}),(0,a.jsx)(`span`,{className:`dsh-board-card-lv`,children:n(`rank.lv`,{n:o+1})})]}),(0,a.jsxs)(`div`,{className:`dsh-board-card-body`,children:[s===null?(0,a.jsx)(`div`,{className:`dsh-board-card-step dsh-board-card-prev-empty`}):(0,a.jsxs)(`div`,{className:`dsh-board-card-step dsh-board-card-prev`,title:n(`rank.${o-1}`),children:[(0,a.jsx)(`span`,{className:`dsh-board-card-step-emoji`,children:s.emoji}),(0,a.jsx)(`span`,{className:`dsh-board-card-step-name`,children:r===`en`?s.en:s.zh}),(0,a.jsxs)(`span`,{className:`dsh-board-card-step-status`,children:[`✓ `,n(`rank.unlocked`)]})]}),(0,a.jsxs)(`div`,{className:`dsh-board-card-current`,children:[(0,a.jsx)(`span`,{className:`dsh-board-card-current-emoji`,children:i.level.emoji}),(0,a.jsx)(`span`,{className:`dsh-board-card-current-name`,children:r===`en`?i.level.en:i.level.zh}),(0,a.jsx)(`span`,{className:`dsh-board-card-current-tag`,children:n(`rank.current`)})]}),c===null?(0,a.jsx)(`div`,{className:`dsh-board-card-step dsh-board-card-max`,children:`👑 MAX`}):(0,a.jsxs)(`div`,{className:`dsh-board-card-step dsh-board-card-next`,title:n(`rank.${o+1}`),children:[(0,a.jsx)(`span`,{className:`dsh-board-card-step-emoji`,children:c.emoji}),(0,a.jsx)(`span`,{className:`dsh-board-card-step-name`,children:r===`en`?c.en:c.zh}),(0,a.jsxs)(`span`,{className:`dsh-board-card-step-status`,children:[`🔒 `,n(`rank.locked`)]})]})]}),(0,a.jsx)(`div`,{className:`dsh-board-card-bar`,children:(0,a.jsx)(`div`,{className:`dsh-board-card-bar-fill`,style:{width:`${Math.min(100,l*100)}%`}})}),(0,a.jsx)(`div`,{className:`dsh-board-card-next-line`,children:c===null?n(`rank.max`):`${n(`rank.next`,{name:r===`en`?c.en:c.zh,count:g(c.floor-e,r)})} · ${n(`rank.percent`,{percent:Math.round(l*100)})}`}),c!==null&&d!==null?(0,a.jsx)(`div`,{className:`dsh-board-card-eta`,children:d<1?n(`rank.eta.today`):n(`rank.eta`,{days:d})}):null,(0,a.jsxs)(`div`,{className:`dsh-board-card-perks`,children:[(0,a.jsxs)(`div`,{className:`dsh-board-card-perk`,children:[(0,a.jsxs)(`span`,{className:`dsh-board-card-perk-label`,children:[`✦ `,n(`rank.perk.current`)]}),(0,a.jsx)(`span`,{className:`dsh-board-card-perk-value`,children:n(`perk.${o}`)})]}),c===null?null:(0,a.jsxs)(`div`,{className:`dsh-board-card-perk dsh-board-card-perk-locked`,children:[(0,a.jsxs)(`span`,{className:`dsh-board-card-perk-label`,children:[`🔒 `,n(`rank.perk.next`)]}),(0,a.jsx)(`span`,{className:`dsh-board-card-perk-value`,children:n(`perk.${o+1}`)})]})]}),(0,a.jsx)(`div`,{className:`dsh-board-card-ladder`,children:y.map((e,t)=>(0,a.jsx)(`span`,{className:[`dsh-board-card-rung`,t<o?`dsh-board-card-rung-done`:``,t===o?`dsh-board-card-rung-now`:``,t>o?`dsh-board-card-rung-locked`:``].filter(Boolean).join(` `),title:n(`rank.${t}`),children:e.emoji},e.floor))})]})}function N({stats:e,t}){return(0,a.jsx)(`div`,{className:`dsh-board-achievements`,children:x.map(n=>{let r=n.test(e),i=`ach.${n.id}`,o=`ach.${n.id}.cond`;return(0,a.jsxs)(`span`,{className:r?`dsh-board-ach dsh-board-ach-got`:`dsh-board-ach`,title:r?t(i):`${t(i)} · ${t(o)}`,children:[(0,a.jsx)(`span`,{className:`dsh-board-ach-emoji`,children:n.emoji}),(0,a.jsx)(`span`,{className:`dsh-board-ach-name`,children:t(i)})]},n.id)})})}let re=(0,r.memo)(M),ie=(0,r.memo)(E),ae=(0,r.memo)(A),oe=(0,r.memo)(O),se=(0,r.memo)(D),ce=(0,r.memo)(k),le=(0,r.memo)(j),ue=(0,r.memo)(N),P=(0,r.memo)(function({wide:e,useSessions:t,api:n,t:o,locale:s}){let c=t(e=>e.current),l=t(e=>e.ids,(e,t)=>e.length===t.length&&e.every((e,n)=>e===t[n])),u=t(e=>{let t=``;for(let n of e.ids){let r=e.byId[n],i=r?.projectionValues?.tokenUsage,a=r?.projectionValues?.contextPressure,o=r?.projectionValues?.contextBreakdown,s=r?.projectionValues?.subagentTiming?.settledMs??0;t+=`${n}|${r?.updatedAt??0}|${i?.uncachedInputTokens??0},${i?.cacheReadTokens??0},${i?.cacheWriteTokens??0},${i?.outputTokens??0}|${a?.projectedTokens??0},${a?.pressureTokens??0}|${o?.systemTokens??0},${o?.toolsTokens??0},${o?.messageTokens??0}|${s}|${+!!r?.running};`}return{digest:t,byId:e.byId}},(e,t)=>e.digest===t.digest).byId,p=c===void 0?void 0:u[c],h=p?.projectionValues?.tokenUsage,v=p?.projectionValues,x=v?.contextPressure,E=v?.contextBreakdown,D=v?.subagentTiming?.settledMs;(()=>{let e=x?.projectedTokens??x?.pressureTokens,t=x?.contextWindow;return e===void 0||t===void 0||t<=0?null:Math.min(100,Math.round(e/t*100))})();let O=p?.running??!1,k=(0,r.useSyncExternalStore)(e=>s.subscribe(e),()=>s.getSnapshot()).active===`en`?`en`:`zh`,[A,j]=(0,r.useState)(!1),[M,N]=(0,r.useState)(ne),[P,F]=(0,r.useState)(()=>C),I=(0,r.useRef)(null),L=(0,r.useRef)(null),R=(0,r.useRef)(null),[z,B]=(0,r.useState)(null),[V,de]=(0,r.useState)(null),H=!e||e&&V!==null&&V<200,U=H?A:!M;(0,r.useLayoutEffect)(()=>{if(!H||!A){B(null);return}let e=()=>{let e=L.current,t=R.current;if(e===null||t===null)return;let n=e.getBoundingClientRect(),r=t.offsetWidth,i=t.offsetHeight,a=Math.min(n.right+8,window.innerWidth-r-8),o=Math.max(8,Math.min(n.bottom-i,window.innerHeight-i-8));B({left:a,top:o})};return e(),window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[H,A]),(0,r.useEffect)(()=>{let e=I.current;if(e===null||typeof ResizeObserver>`u`)return;let t=new ResizeObserver(e=>{let t=e[0]?.contentRect.width;t!==void 0&&de(t)});return t.observe(e),()=>t.disconnect()},[]),(0,r.useEffect)(()=>{F(C)},[c]),(0,r.useEffect)(()=>{if(c===void 0||!U)return;let e=!1;return(async()=>{try{let t=await n.sessions.history({sessionId:c,maxMessages:120});if(e||!t.result.ok||t.result.value===void 0)return;F(ee(t.result.value.events))}catch{}})(),()=>{e=!0}},[c,n,U]);let W=H?A:!M;(0,r.useEffect)(()=>{if(!W)return;let e=e=>{e.target instanceof Node&&I.current!==null&&!I.current.contains(e.target)&&(H?j(!1):N(!0))};return document.addEventListener(`pointerdown`,e),()=>document.removeEventListener(`pointerdown`,e)},[W,H]);let G=(0,r.useMemo)(()=>{let e=0,t=0,n=0,r=0,i=[],a=new Map;for(let o of l){let s=u[o],c=s?.projectionValues?.tokenUsage;if(c===void 0)continue;let l=w(c.uncachedInputTokens)+w(c.cacheReadTokens)+w(c.cacheWriteTokens),f=w(c.outputTokens);e+=l,t+=f,r+=w(c.cacheReadTokens);let p=typeof s.projectionValues?.dominantModel==`string`&&s.projectionValues.dominantModel!==``?s.projectionValues.dominantModel:void 0;if(n+=m(c,d(p,Number.isFinite(s.updatedAt)&&s.updatedAt>0?s.updatedAt:void 0)),i.push({id:o,title:s.displayTitle??s.title??String(o).slice(0,8),tokens:l+f}),Number.isFinite(s.updatedAt)&&s.updatedAt>0){let e=new Date(s.updatedAt).setHours(0,0,0,0);a.set(e,(a.get(e)??0)+l+f)}}i.sort((e,t)=>t.tokens-e.tokens);let o=new Date,s=new Date(o.getFullYear(),o.getMonth(),o.getDate()).getTime(),c=new Date(o.getFullYear(),o.getMonth(),o.getDate()-(o.getDay()+6)%7).getTime(),f=0,p=0;for(let[e,t]of a)e===s&&(f+=t),e>=c&&e<=s&&(p+=t);return{today:f,week:p,input:e,output:t,cost:n,hit:r,total:e+t,sessions:i.slice(0,8),daily:[...a.entries()].map(([e,t])=>({day:e,tokens:t}))}},[l,u]),K=(0,r.useMemo)(()=>[...P.perModel.entries()].map(([e,t])=>({model:e,input:t.input,output:t.output})).sort((e,t)=>t.output-e.output).slice(0,5),[P]),q=(0,r.useMemo)(()=>{let e,t=-1;for(let[n,r]of P.perModel)r.output>t&&(t=r.output,e=n);return e},[P]),fe=h===void 0?0:m(h,d(q)),pe=(0,r.useMemo)(()=>P.perTurn.slice(-24),[P]),me=(0,r.useMemo)(()=>P.cumulative.slice(-60),[P]),he=G.total,J=b(G.total),Y=o(`rank.${y.indexOf(J.level)}`),X=(0,r.useMemo)(()=>te(G.daily,l.length),[G.daily,l.length]),ge=()=>{if(H)j(e=>!e);else{let e=!M;N(e);try{localStorage.setItem(S,e?`1`:`0`)}catch{}}},Z=f(q),Q=G.input===0?0:G.hit/G.input,_e=Z.price.cacheHitPerM>0?Math.round(Z.price.cacheMissPerM/Z.price.cacheHitPerM):0,ve=l.length===0&&h===void 0?(0,a.jsxs)(`div`,{className:`dsh-board-panel`,children:[(0,a.jsxs)(`div`,{className:`dsh-board-panel-title`,children:[(0,a.jsx)(`span`,{children:o(`panel.title`)}),(0,a.jsx)(`span`,{className:`dsh-board-title-right`,children:(0,a.jsx)(`button`,{type:`button`,className:`dsh-board-close`,"aria-label":o(`panel.collapse.aria`),onClick:()=>{H?j(!1):N(!0)},children:`✕`})})]}),(0,a.jsx)(`div`,{className:`dsh-board-empty`,children:o(`spark.empty`)})]}):(0,a.jsxs)(`div`,{className:`dsh-board-panel`,children:[(0,a.jsxs)(`div`,{className:`dsh-board-panel-title`,children:[(0,a.jsx)(`span`,{children:o(`panel.title`)}),(0,a.jsxs)(`span`,{className:`dsh-board-title-right`,children:[O?(0,a.jsxs)(`span`,{className:`dsh-board-live`,children:[(0,a.jsx)(i.StateDot,{state:`ongoing`,className:`dsh-board-dot`}),o(`live`)]}):null,(0,a.jsx)(`button`,{type:`button`,className:`dsh-board-close`,"aria-label":o(`panel.collapse.aria`),onClick:()=>{H?j(!1):N(!0)},children:`✕`})]})]}),(0,a.jsxs)(`div`,{className:`dsh-board-hero`,children:[(0,a.jsx)(`div`,{className:`dsh-board-hero-value`,children:g(he,k)}),(0,a.jsx)(`div`,{className:`dsh-board-hero-label`,children:o(`global.tokens`)})]}),(0,a.jsxs)(`div`,{className:`dsh-board-hero-sub`,children:[o(`hero.streak`,{n:X.streak}),` · `,o(`hero.sessions`,{n:l.length}),` · `,o(`hero.cache`,{percent:G.input===0?0:Math.round(G.hit/G.input*100)}),` · `,o(`global.cost`),` `,_(G.cost),` · `,o(`hero.thisCost`,{cost:_(fe)})]}),Q>0&&Q<.5?(0,a.jsx)(`div`,{className:`dsh-board-hint`,children:o(`hint.cacheLow`,{percent:Math.round(Q*100),ratio:`${_e}×`})}):null,(0,a.jsxs)(`div`,{className:`dsh-board-usage`,children:[(0,a.jsxs)(`div`,{className:`dsh-board-usage-item`,children:[(0,a.jsx)(`span`,{className:`dsh-board-usage-label`,children:o(`usage.total`)}),(0,a.jsx)(`span`,{className:`dsh-board-usage-value`,children:g(G.total,k)})]}),(0,a.jsxs)(`div`,{className:`dsh-board-usage-item`,children:[(0,a.jsx)(`span`,{className:`dsh-board-usage-label`,children:o(`usage.today`)}),(0,a.jsx)(`span`,{className:`dsh-board-usage-value`,children:g(G.today,k)})]}),(0,a.jsxs)(`div`,{className:`dsh-board-usage-item`,children:[(0,a.jsx)(`span`,{className:`dsh-board-usage-label`,children:o(`usage.week`)}),(0,a.jsx)(`span`,{className:`dsh-board-usage-value`,children:g(G.week,k)})]})]}),(0,a.jsx)(ie,{pressure:x,breakdown:E,subagentMs:D,t:o,lang:k}),P.perTurn.length===0?null:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(T,{children:o(`sec.trend`)}),(0,a.jsx)(se,{data:pe,t:o}),(0,a.jsxs)(`div`,{className:`dsh-board-legend`,children:[(0,a.jsxs)(`span`,{children:[(0,a.jsx)(`i`,{className:`dsh-board-legend-in`}),o(`legend.in`)]}),(0,a.jsxs)(`span`,{children:[(0,a.jsx)(`i`,{className:`dsh-board-legend-out`}),o(`legend.out`)]})]})]}),P.cumulative.length<2?null:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(T,{children:o(`sec.cumulative`)}),(0,a.jsx)(oe,{values:me})]}),G.daily.length===0?null:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(T,{children:o(`sec.heat`)}),(0,a.jsx)(ae,{daily:G.daily,t:o}),(0,a.jsx)(`div`,{className:`dsh-board-heat-note`,children:o(`heat.note`)})]}),(0,a.jsx)(re,{total:G.total,daily:G.daily,t:o,lang:k}),K.length===0?null:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(T,{children:o(`sec.model`)}),(0,a.jsx)(ce,{models:K,t:o,lang:k})]}),(0,a.jsx)(T,{children:o(`sec.achievements`)}),(0,a.jsx)(ue,{stats:X,t:o}),G.sessions.length===0?null:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(T,{children:o(`sec.global`)}),(0,a.jsx)(le,{sessions:G.sessions,lang:k})]}),(0,a.jsxs)(`div`,{className:`dsh-board-note`,children:[o(`note.pricing`),` · `,o(`chip.${Z.window}`),` · `,o(`chip.rate`,{price:Z.price.outputPerM})]})]}),ye=H?(0,a.jsx)(`span`,{className:`dsh-board-orb-emoji`,children:J.level.emoji}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(`span`,{className:`dsh-board-window dsh-board-window-${Z.window}`,children:[o(`chip.${Z.window}`),` · `,o(`chip.rate`,{price:Z.price.outputPerM})]}),(0,a.jsxs)(`span`,{className:`dsh-board-badge`,children:[(0,a.jsx)(`span`,{className:`dsh-board-tag`,style:{background:J.level.color},children:Y}),(0,a.jsxs)(`span`,{className:`dsh-board-badge-nums`,children:[(0,a.jsx)(`span`,{className:`dsh-board-badge-cost`,children:_(G.cost)}),(0,a.jsxs)(`span`,{className:`dsh-board-badge-tokens`,children:[g(G.total,k),` `,o(`global.tokens`)]})]}),(0,a.jsxs)(`span`,{className:`dsh-board-badge-sub`,children:[o(`usage.today`),` `,g(G.today,k),` · `,o(`usage.week`),` `,g(G.week,k)]}),(0,a.jsx)(`span`,{className:`dsh-board-chevron`,children:M?`▸`:`▾`})]}),O?(0,a.jsx)(i.StateDot,{state:`ongoing`,className:`dsh-board-live-dot`}):null]}),$=(0,a.jsx)(`button`,{ref:L,type:`button`,className:H?`dsh-board-trigger dsh-board-orb`:`dsh-board-trigger`,style:{"--tier":J.level.color},"aria-expanded":H?A:!M,"aria-label":H?`${Y} · ${o(`panel.title`)}`:void 0,title:Y,onClick:ge,children:ye});return(0,a.jsx)(`div`,{ref:I,className:e?`dsh-board-foot dsh-board-wide`:`dsh-board-foot`,children:H?(0,a.jsxs)(a.Fragment,{children:[$,A?(0,a.jsx)(`div`,{ref:R,className:`dsh-board-float dsh-board-rail`,style:z===null?void 0:{position:`fixed`,left:z.left,top:z.top,zIndex:60},children:ve}):null]}):M?$:(0,a.jsxs)(`div`,{className:`dsh-board-float dsh-board-open`,children:[$,ve]})})});function F(){if(typeof document>`u`||document.querySelector(`style[data-plugin="dsh-board"]`)!==null)return;let e=document.createElement(`style`);e.dataset.plugin=`dsh-board`,e.textContent=`
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
  position: absolute;
  top: 6px;
  right: 8px;
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
`,document.head.appendChild(e)}let I=`board`,L={"panel.title":`用量统计`,live:`LIVE`,"rank.title":`词勋等级`,"rank.lv":`LV.{n}`,"rank.current":`当前`,"rank.unlocked":`已解锁`,"rank.locked":`未解锁`,"rank.next":`距 {name} 还差 {count} token`,"rank.max":`已达最高段位`,"rank.eta":`按当前速度预计 {days} 天后解锁`,"rank.eta.today":`按当前速度今天有望解锁`,"rank.perk.current":`当前权益`,"rank.perk.next":`下阶解锁`,"rank.percent":`{percent}%`,"perk.0":`解锁「用量面板」`,"perk.1":`解锁徽章动效`,"perk.2":`解锁银色边框`,"perk.3":`解锁金色数字`,"perk.4":`解锁钻石流光`,"perk.5":`解锁红色警戒`,"perk.6":`解锁皇冠标识`,"perk.7":`解锁天青光环`,"perk.8":`解锁仙紫星尘`,"perk.9":`解锁彩虹至尊框`,"hero.sessions":`跨 {n} 个会话`,"hero.streak":`🔥 连续打卡 {n} 天`,"hero.thisCost":`本会话 {cost}`,"hero.cache":`缓存命中 {percent}%`,"usage.total":`总用量`,"usage.today":`本日`,"usage.week":`本周`,"sec.context":`上下文占用`,"ctx.remaining":`剩余 {count}`,"ctx.legend.system":`系统`,"ctx.legend.tools":`工具`,"ctx.legend.messages":`消息`,"ctx.subagent":`子代理累计 {duration}`,"sec.achievements":`成就收集`,"ach.streak3":`三日之约`,"ach.streak3.cond":`连续打卡 3 天`,"ach.streak7":`七日不辍`,"ach.streak7.cond":`连续打卡 7 天`,"ach.streak30":`月度传说`,"ach.streak30.cond":`连续打卡 30 天`,"ach.day10":`十日耕者`,"ach.day10.cond":`累计活跃 10 天`,"ach.day50":`五十日林`,"ach.day50.cond":`累计活跃 50 天`,"ach.peak100k":`单日十万`,"ach.peak100k.cond":`单日消耗 10万 token`,"ach.peak1m":`单日百万`,"ach.peak1m.cond":`单日消耗 100万 token`,"ach.session10":`十会话`,"ach.session10.cond":`累计 10 个会话`,"ach.session50":`五十会话`,"ach.session50.cond":`累计 50 个会话`,"sec.session":`本会话`,"sec.model":`分模型`,"sec.trend":`每轮走势`,"sec.cumulative":`累计输出`,"sec.global":`全局`,"tokens.cost":`成本`,"tokens.in":`输入`,"tokens.out":`输出`,"tokens.total":`合计`,"tokens.cache":`缓存命中 {percent}%`,"global.tokens":`总 token`,"global.cost":`总成本`,"legend.in":`入`,"legend.out":`出`,"model.value":`出 {out} · 入 {in}`,"trend.tooltip":`第 {turn} 轮 · 入 {in} · 出 {out}`,"heat.day":`{date} · {tokens} token`,"spark.empty":`暂无数据`,"note.pricing":`按官方价目估算（含思考 token；累计按各会话主导模型计价，可能与平台账单有出入）`,"window.peak":`⛰️ 高峰价`,"window.offpeak":`🌙 闲时价`,"chip.standard":`现行一口价`,"chip.peak":`⛰️ 高峰`,"chip.offpeak":`🌙 闲时`,"chip.rate":`出 ¥{price}/M`,"hint.cacheLow":`缓存命中率仅 {percent}%——一次未命中约等于 {ratio} 次命中的价钱，反复读取大文件会显著多花。`,"rank.0":`🌱 未醒词芽`,"rank.1":`🥉 词途学徒`,"rank.2":`💬 白银之舌`,"rank.3":`💰 一词千金`,"rank.4":`🧲 万词王`,"rank.5":`🎯 亿词逐梦者`,"rank.6":`👑 十亿词霸`,"rank.7":`📜 词林盟主`,"rank.8":`🧚 词高八斗`,"rank.9":`⚡ 万亿词神`,"panel.collapse.aria":`收起面板`,"sec.heat":`每日热力`,"heat.note":`按会话最近活跃日归集`},R={"panel.title":`Usage`,live:`LIVE`,"rank.title":`Word Guild`,"rank.lv":`LV.{n}`,"rank.current":`current`,"rank.unlocked":`unlocked`,"rank.locked":`locked`,"rank.next":`{count} tokens to {name}`,"rank.max":`Max rank reached`,"rank.eta":`At this pace, ~{days}d to unlock`,"rank.eta.today":`At this pace, unlocking today`,"rank.perk.current":`Current perk`,"rank.perk.next":`Next unlock`,"rank.percent":`{percent}%`,"perk.0":`Unlocks the usage panel`,"perk.1":`Unlocks badge animation`,"perk.2":`Silver frame unlocked`,"perk.3":`Golden numbers unlocked`,"perk.4":`Diamond shimmer unlocked`,"perk.5":`Red alert unlocked`,"perk.6":`Crown unlocked`,"perk.7":`Azure halo unlocked`,"perk.8":`Violet stardust unlocked`,"perk.9":`Rainbow supreme unlocked`,"hero.sessions":`across {n} sessions`,"hero.streak":`🔥 {n}-day streak`,"hero.thisCost":`this session {cost}`,"hero.cache":`cache hit {percent}%`,"usage.total":`Total`,"usage.today":`Today`,"usage.week":`This week`,"sec.context":`Context`,"ctx.remaining":`{count} left`,"ctx.legend.system":`system`,"ctx.legend.tools":`tools`,"ctx.legend.messages":`messages`,"ctx.subagent":`subagents {duration}`,"sec.achievements":`Achievements`,"ach.streak3":`3-Day Pact`,"ach.streak3.cond":`3-day streak`,"ach.streak7":`Week Warrior`,"ach.streak7.cond":`7-day streak`,"ach.streak30":`Month Legend`,"ach.streak30.cond":`30-day streak`,"ach.day10":`Ten-Day Tiller`,"ach.day10.cond":`10 active days`,"ach.day50":`Fifty-Day Grove`,"ach.day50.cond":`50 active days`,"ach.peak100k":`Hundred-K Day`,"ach.peak100k.cond":`100K tokens in one day`,"ach.peak1m":`Million Day`,"ach.peak1m.cond":`1M tokens in one day`,"ach.session10":`Ten Sessions`,"ach.session10.cond":`10 sessions`,"ach.session50":`Fifty Sessions`,"ach.session50.cond":`50 sessions`,"sec.session":`This session`,"sec.model":`By model`,"sec.trend":`Per turn`,"sec.cumulative":`Cumulative output`,"sec.global":`All sessions`,"tokens.cost":`Cost`,"tokens.in":`Input`,"tokens.out":`Output`,"tokens.total":`Total`,"tokens.cache":`cache hit {percent}%`,"global.tokens":`total tokens`,"global.cost":`total cost`,"legend.in":`in`,"legend.out":`out`,"model.value":`out {out} · in {in}`,"trend.tooltip":`turn {turn} · in {in} · out {out}`,"heat.day":`{date} · {tokens} tokens`,"spark.empty":`No data yet`,"note.pricing":`Official list prices; reasoning included; lifetime priced per session's dominant model — may differ from platform billing`,"window.peak":`⛰️ peak`,"window.offpeak":`🌙 off-peak`,"chip.standard":`flat rate`,"chip.peak":`⛰️ peak`,"chip.offpeak":`🌙 off-peak`,"chip.rate":`out ¥{price}/M`,"hint.cacheLow":`Cache hit rate is only {percent}% — one miss costs ~{ratio} hits; re-reading large files adds up.`,"rank.0":`🌱 the Unawakened Sprout`,"rank.1":`🥉 Apprentice of the Word-Path`,"rank.2":`💬 the Silver Tongue`,"rank.3":`💰 One Word, A Thousand Gold`,"rank.4":`🧲 Wordlord`,"rank.5":`🎯 the Billion-Dream Chaser`,"rank.6":`👑 Billion-Token Wordmaster`,"rank.7":`📜 the Wordwood Overlord`,"rank.8":`🧚 the Eight-Bushel Wordsmith`,"rank.9":`⚡ Ten-Trillion Word God`,"panel.collapse.aria":`Collapse panel`,"sec.heat":`Daily heat`,"heat.note":`grouped by last activity day`},z=[`slots`,`locale`,`connection`];function B(e){F(),e.effect(()=>e.locale.register(I,{zh:L,en:R}),`dsh-board: dictionaries`),e.slots.inject(`sidebar.footer.action`,()=>e.slots.register({name:`sidebar.footer.action`,id:`dsh-board-usage`,order:30,locale:I,inject:()=>({api:e.connection.api,locale:e.locale})},P))}return n.apply=B,n.inject=z,t.exports}});