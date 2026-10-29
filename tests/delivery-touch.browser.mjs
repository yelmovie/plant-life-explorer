// Pre-delivery check with touch only: no keyboard, no hidden (focus-only) controls, no injected progress.
// Then dialogs at four tablet sizes and the 3D fallbacks. Run against a QA port, never the students' origin.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=new URL(process.env.JOURNEY_OUTPUT||'../docs/reviews/delivery-20261028/',import.meta.url);await mkdir(output,{recursive:true});
const url=process.env.JOURNEY_URL||'http://127.0.0.1:4351',KEY='green-garden-mvp-v2';
const chrome={headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'};
const browser=await chromium.launch({...chrome,args:['--disable-webgl']});
const report={started:new Date().toISOString(),url,checks:[],dialogs:[],spatial:[],errors:[]};
const check=(ok,msg)=>{assert.ok(ok,msg);report.checks.push(msg);};
// Notices (toasts, and in activities the announcer behind Leafy's bubble) are counted per page load so a repeat would show up.
const watchToasts=ctx=>ctx.addInitScript(()=>{window.__toasts=[];new MutationObserver(()=>{for(const t of document.querySelectorAll('.toast,#announcer'))if(t.textContent&&t.dataset.seen!==t.textContent){t.dataset.seen=t.textContent;window.__toasts.push(t.textContent);}}).observe(document,{subtree:true,childList:true,characterData:true});});

const context=await browser.newContext({viewport:{width:1180,height:757},hasTouch:true});await watchToasts(context);
const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>report.errors.push(e.message));
const cdp=await context.newCDPSession(page);
const saved=()=>page.evaluate(k=>navigator.locks.request(k,()=>JSON.parse(localStorage.getItem(k))),KEY);
const until=fn=>page.waitForFunction(fn);
const field=path=>until(`(e=>${path})(JSON.parse(localStorage['${KEY}']).fieldEvidence)`);
// Every control is tapped. A control that only exists for keyboard focus fails the check.
async function tap(sel){const loc=page.locator(sel).first();await loc.waitFor();assert.equal(await loc.evaluate(el=>!!el.closest('.lens-fallback')),false,'focus-only control: '+sel);await loc.tap();}
const act=(name,id,scope='')=>tap(`${scope}[data-action="${name}"]${id!==undefined?`[data-id="${id}"]`:''}`);
const stage=n=>act('field-stage',String(n),'.today-panel .mission-journey ');
// The drifting rain cloud never settles for an actionability check, so it is tapped at its centre.
const tapCenter=async sel=>{const b=await page.locator(sel).boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);};
const keysOn=()=>act('field-keys');
const panel=(attr,v)=>tap(`.keys-panel [${attr}="${v}"]`);
async function touch(points,gap=16){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:points[0][0],y:points[0][1]}]});for(const [x,y] of points.slice(1)){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await page.waitForTimeout(gap);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
const line=([x0,y0],[x1,y1],n)=>Array.from({length:n+1},(_,i)=>[x0+(x1-x0)*i/n,y0+(y1-y0)*i/n]);
const snap=name=>page.screenshot({path:fileURLToPath(new URL(name+'.png',output))});
// Buttons stay inside the dialog and the screen; only the body scrolls, and it keeps room to read.
async function dialogFits(label){
 await page.locator('#dialog[open] .dialog-actions .btn').first().waitFor();await page.waitForTimeout(450);
 const m=await page.evaluate(()=>{const d=document.querySelector('#dialog'),r=d.getBoundingClientRect(),body=d.querySelector('.dialog-body'),p=d.querySelector('.dialog-body p');
  const btns=[...d.querySelectorAll('.dialog-actions .btn,.dialog-top [data-action="close"]')].map(b=>b.getBoundingClientRect());
  return {buttons:btns.every(b=>b.top>=Math.max(0,r.top)-1&&b.bottom<=Math.min(innerHeight,r.bottom)+1&&b.height>=44),dialogScrolls:d.scrollHeight>d.clientHeight+1,body:body?.clientHeight||0,bodyScrolls:body?body.scrollHeight>body.clientHeight+1:false,text:p?parseFloat(getComputedStyle(p).fontSize):0,size:`${innerWidth}x${innerHeight}`};});
 report.dialogs.push({label,...m});
 assert.ok(m.buttons,`${label} ${m.size}: action/close buttons visible without scrolling`);assert.ok(!m.dialogScrolls,`${label} ${m.size}: only the body scrolls`);
 assert.ok(m.body>=120,`${label} ${m.size}: body keeps reading room (${m.body}px)`);assert.ok(m.text>=16,`${label} ${m.size}: body text not shrunk (${m.text}px)`);
}
async function enter(m){
 if(await page.locator('#dialog[open]').count())await act('close',undefined,'#dialog .dialog-top ');
 await act('map-overview');await page.locator(`.world-node[data-id="${m}"] .world-label`).tap();
 await dialogFits(`letter ${m+1}`);await act('enter-mission',undefined,'#dialog ');await page.locator('.field-mission').waitFor();
}
const explore=async()=>{await act('journey-mode','explore','.learning-footer ');await page.locator('.field-mission').waitFor({state:'detached'});};
async function complete(m){const b=page.locator('.learning-footer [data-action="complete"]');assert.notEqual(await b.getAttribute('aria-disabled'),'true',await page.locator('.guide-bubble').innerText());await b.tap();
 await dialogFits(`reward ${m+1}`);await snap(`reward-${m+1}-1180x757`);await act('reward-map',undefined,'#dialog ');const before=await saved();await page.reload();assert.deepEqual(await saved(),before,'refresh keeps progress');}
async function leafSpot(id,[fx,fy]){return page.evaluate(([id,fx,fy])=>{const img=document.querySelector(`[data-lens-leaf="${id}"] img`),r=img.getBoundingClientRect(),k=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight),w=img.naturalWidth*k,h=img.naturalHeight*k;return [r.left+(r.width-w)/2+fx*w,r.top+(r.height-h)/2+fy*h];},[id,fx,fy]);}
const petiolePoint=async(fx,fy)=>{const b=await page.locator('[data-petiole]').boundingBox();return [b.x+b.width*fx,b.y+b.height*fy];};
const cutOpen=()=>page.locator('.float-lab[data-phase="reason"]').waitFor();

try{
 await page.goto(url);assert.equal((await saved()).completed.some(Boolean),false,'fresh isolated record');
 await act('sound');await act('begin');await page.locator('[data-story-action="exit"]').tap();

 // 1장: tap the leaf to carry the lens (no drag), one tooth rule, wrong answer → clue → retry, fast double tap.
 await enter(0);await until(()=>[...document.querySelectorAll('[data-lens-leaf] img')].every(i=>i.complete&&i.naturalWidth));
 for(const [kind,spot] of [['shape',[.5,.6]],['edge',[.33,.33]]]){await page.touchscreen.tap(...await leafSpot('maple',spot));await field(`e.leaves.scans.maple.includes('${kind}')`);}
 await page.touchscreen.tap(...await leafSpot('camellia',[.14,.4]));await page.locator('[data-clue="camellia:edge"].found').waitFor();{const g=await page.locator('[data-lens] .field-lens-glass').boundingBox();await page.screenshot({path:fileURLToPath(new URL('lens-camellia-edge.png',output)),clip:{x:g.x-20,y:g.y-20,width:g.width+40,height:g.height+40}});}
 check(/작은 톱니/.test(await page.locator('[data-clue="camellia:edge"]').innerText()),'1장: camellia small teeth seen through the lens are named as teeth');
 await stage(1);check(await page.locator('text=큰 톱니').count()===0,'1장: no "큰 톱니" wording on the sorting screen');
 await tap('[data-swipe-bin="no"]');await field(`e.leaves.edge.maple==='no'`);
 check(/톱니/.test(await page.locator('.guide-bubble').innerText()),'1장: wrong basket gives an edge clue and the card stays for a retry');
 await page.waitForTimeout(400);
 for(const p of ['maple','pine','camellia']){await page.locator(`[data-swipe-top][data-swipe-card="${p}"]`).waitFor();const bin=page.locator(`[data-swipe-bin="${p==='pine'?'no':'yes'}"]`);
  if(p==='pine'){await bin.tap();await bin.tap();}else await bin.tap();await field(`e.leaves.edge.${p}==='${p==='pine'?'no':'yes'}'`);}
 check((await saved()).fieldEvidence.leaves.edge.camellia==='yes','1장: a fast double tap throws one card only');
 await stage(2);for(const p of ['maple','pine','camellia']){await page.locator(`[data-swipe-top][data-swipe-card="${p}"]`).waitFor();await tap(`[data-swipe-bin="${p==='pine'?'yes':'no'}"]`);await field(`e.leaves.narrow.${p}`);}
 await explore();check(await page.locator('.sort-board').count()===0&&/단풍나무/.test(await page.locator('.sort-summary').innerText()),'1장: the record page shows the field sort instead of sorting new leaves again');
 await complete(0);

 // 2장: dial and string drag are done with the visible button panel.
 await enter(1);await act('field-season-predict','tree:roots');await act('field-season-predict','herb:roots');
 await keysOn();await panel('data-field-drop','link:tree:trunk');await panel('data-field-drop','link:herb:root');await field(`e.seasons.links.herb==='root'`);
 for(const [n,kind] of [[1,'tree'],[2,'herb']]){await stage(n);if(!await page.locator('.keys-panel').count())await keysOn();await panel('data-action','field-season-turn');await tap(`.keys-panel [data-action="field-season-clue"][data-id="${kind}:${kind==='tree'?'branches':'rootbud'}"]`);await field(`e.seasons.clues.${kind}`);}
 check(true,'2장: all field steps done with visible buttons (no drag, no keyboard)');
 await explore();await complete(1);

 // 3장: every required step by touch, three ways to open the stalk.
 await enter(2);await tap('[data-heft="air"] [data-heft-pick="float"]');await field(`e.float.predictions.air`);await tap('[data-heft="solid"] [data-heft-pick="sink"]');await field(`e.float.predictions.solid`);
 await stage(1);for(const m of ['air','solid']){await tap(`[data-float-item="${m}"]`);await field(`e.float.tested.includes('${m}')`);}
 await stage(2);await page.locator('[data-petiole]').waitFor();await snap('petiole-1180x757');
 await touch(line(await petiolePoint(.05,.1),await petiolePoint(.3,.05),8));await page.waitForTimeout(300);
 check(await page.locator('.float-lab[data-phase="cut"]').count()===1,'3장: a stroke away from the stalk does not cut');
 await page.touchscreen.tap(...await petiolePoint(.23,.86));await page.locator('[data-petiole] .cut-mark').waitFor();
 await page.touchscreen.tap(...await petiolePoint(.86,.16));await cutOpen();check(true,'3장: tap one end, then the other end opens the stalk');
 const reEnter=async()=>{await page.reload();await page.locator('.field-mission').waitFor();await stage(2);await page.locator('.float-lab[data-phase="cut"]').waitFor();};
 await reEnter();await touch(line(await petiolePoint(.21,.875),await petiolePoint(.89,.125),6));await cutOpen();check(true,'3장: a fast swipe with only 6 touch moves opens the stalk');
 await reEnter();await touch(line(await petiolePoint(.26,.9),await petiolePoint(.92,.2),10));await cutOpen();check(true,'3장: a swipe drawn a little off the centre line opens the stalk');
 await reEnter();await keysOn();await snap('button-mode-petiole');await panel('data-action','field-cut');await cutOpen();
 check(await page.locator('.keys-panel [data-field-item="reason:air-space"]').count()===1,'3장: button path opens the stalk first, then offers the model link');
 await act('field-keys');await page.locator('.float-lab[data-phase="reason"]').waitFor();
 await tap('[data-tank-model="air"]');await field(`e.float.reason==='air'`);
 await explore();for(const [p,h] of [['hyacinth','water'],['aloe','dry'],['cherry','grass']]){await act('habitat-plant',p);await act('habitat',h);await act('habitat-answer',p);}
 await complete(2);

 // 4장: card → bed taps, then the keep-or-change pick on the student's own garden.
 await enter(3);await act('field-garden-ground');await field(`e.garden.environments.ridge==='dry'`);
 await stage(1);await tap('[data-field-item="plant:hyacinth"]');await tap('[data-field-drop="plant:ridge"]');
 check(Object.keys((await saved()).fieldEvidence.garden.plants).length===0,'4장: a wrong bed refuses the plant without penalty');
 for(const [p,z] of [['hyacinth','pond'],['cherry','meadow'],['aloe','ridge']]){await tap(`[data-field-item="plant:${p}"]`);await tap(`[data-field-drop="plant:${z}"]`);}
 await stage(2);await act('field-garden-rain');await explore();
 const fitsCol=await page.evaluate(()=>{const c=document.querySelector('.garden-confirm').getBoundingClientRect(),f=document.querySelector('.garden-feedback').getBoundingClientRect();return c.bottom<=Math.min(f.bottom,innerHeight)+1&&c.top>=f.top-1;});check(fitsCol,'4장: the whole keep-or-change card is on screen without scrolling');
 check(await page.locator('.learning-footer [data-action="complete"]').getAttribute('aria-disabled')==='true','4장: the carried-over garden is not "ready" until the student picks');
 check(await page.locator('.garden-confirm [data-action="edit-terrain"]').count()===1,'4장: "땅 모양 바꾸기" sits in the confirm card');
 await snap('garden-confirm-1180x757');await act('garden-pick','aloe');await act('garden-pick','aloe');
 check((await saved()).gardenPick==='aloe','4장: pick recorded (double tap safe)');
 const gardenBefore=(await saved()).garden;await complete(3);

 // 5장: guess → rain on the plain bag → one upgrade per rain → which part kept the notebook dry.
 await enter(4);const first=await page.locator('.mission-objective').innerText();
 check(/먼저 예상/.test(first)&&!/구름/.test(first),'5장: first objective names only the prediction on screen');
 await act('field-bag-predict','surface');check(/구름/.test(await page.locator('.mission-objective').innerText()),'5장: after the guess the objective moves to the first rain');
 await tapCenter('[data-bag-cloud]');await field(`e.bag.tests.length===1`);
 await stage(1);check(/하나만/.test(await page.locator('.bag-hint').innerText()),'5장: upgrade step asks for one part at a time');
 await tap('[data-action="field-bag-upgrade"][data-id="surface"]');await field(`e.bag.design.surface==='lotus'`);
 await page.locator('[data-action="field-bag-upgrade"][data-id="cover"]').tap({force:true});await page.waitForTimeout(300);
 check((await saved()).fieldEvidence.bag.design.cover==='open','5장: the second part waits until the first change has been rained on');
 await tapCenter('[data-bag-cloud]');await field(`e.bag.tests.length===2`);
 await tap('[data-action="field-bag-upgrade"][data-id="cover"]');await field(`e.bag.design.cover==='flap'`);await tapCenter('[data-bag-cloud]');await field(`e.bag.tests.length===3`);
 await stage(2);await tap('[data-action="field-bag-answer"][data-id="surface"]');check(/연잎 겉면만/.test(await page.locator('.guide-bubble').innerText()),'5장: a wrong answer points back to the trial cards');
 await tap('[data-action="field-bag-answer"][data-id="cover"]');await field(`!!e.bag.delivered`);
 await explore();check(await page.locator('.invention-summary').count()===1,'5장: the record page sums up the field trials without a second experiment');
 await complete(4);

 // Final record → ending, then refresh keeps progress and the garden layout.
 await act('report');await act('start-final');await act('final-habitat','water');await act('final-habitat','dry');await act('power-core');await page.locator('[data-story-action="exit"]').tap();
 const end=await saved();check(end.finished===true,'Ending reached by touch only');
 await page.reload();const after=await saved();report.gardenAfter={before:gardenBefore,after:after.garden,pick:after.gardenPick,finished:after.finished,screen:after.screen};check(after.finished&&['hyacinth','cherry','aloe'].every(k=>after.garden[k]===gardenBefore[k])&&after.gardenPick==='aloe','Refresh keeps the ending, garden layout and pick');
 const toasts=await page.evaluate(()=>window.__toasts);report.toasts=toasts;
 await writeFile(new URL('completed-touch-record.json',output),JSON.stringify(after,null,2));

 // Dialogs at other tablet sizes, on an isolated copy of the finished record.
 const raw=JSON.stringify(after);
 for(const [w,h] of [[1180,757],[1024,768],[1280,800],[768,1024]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},hasTouch:true}),p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  await ctx.addInitScript(([k,v])=>{if(!sessionStorage.getItem('fx')){localStorage.setItem(k,v);sessionStorage.setItem('fx','1');}},[KEY,raw]);
  await p.goto(url);const pg=page;
  const tapP=s=>p.locator(s).first().tap();
  if(await p.locator('[data-action="home"]').count())await tapP('[data-action="home"]');await tapP('[data-action="begin"]');if(await p.locator('[data-story-action="exit"]').count())await tapP('[data-story-action="exit"]');
  for(const m of [0,1,3]){
   await tapP('[data-action="map-overview"]');await p.locator(`.world-node[data-id="${m}"] .world-label`).tap();
   await p.locator('#dialog[open] .dialog-actions .btn').first().waitFor();await p.waitForTimeout(450);
   const fit=()=>p.evaluate(()=>{const d=document.querySelector('#dialog'),r=d.getBoundingClientRect(),b=d.querySelector('.dialog-body');return [...d.querySelectorAll('.dialog-actions .btn,.dialog-top [data-action="close"]')].every(x=>{const q=x.getBoundingClientRect();return q.top>=Math.max(0,r.top)-1&&q.bottom<=Math.min(innerHeight,r.bottom)+1;})&&d.scrollHeight<=d.clientHeight+1&&(b?.clientHeight||0)>=120;});
   assert.ok(await fit(),`letter ${m+1} at ${w}x${h}`);
   await tapP('#dialog [data-action="reward-detail"]');await p.waitForTimeout(500);assert.ok(await fit(),`reward ${m+1} at ${w}x${h}`);
   await p.screenshot({path:fileURLToPath(new URL(`reward-${m+1}-${w}x${h}.png`,output))});
   await tapP('#dialog .dialog-top [data-action="close"]');assert.equal(await p.locator('#dialog[open]').count(),0,'close works');
  }
  report.dialogs.push({size:`${w}x${h}`,letters:'1,2,4',rewards:'1,2,4',close:true});await ctx.close();void pg;
 }
 check(true,'Letters and rewards keep buttons in view at 1180x757, 1024x768, 1280x800, 768x1024');

 // 3D: WebGL off, the 3D module not arriving, and model files not arriving all fall back to the same picture activity.
 const gl=await chromium.launch({...chrome});
 for(const [name,block] of [['module','**/src/spatial.js'],['models','**/assets/models/*.glb'],['webgl-off',null]]){
  const b=name==='webgl-off'?browser:gl,ctx=await b.newContext({viewport:{width:1180,height:757},hasTouch:true});await watchToasts(ctx);if(block)await ctx.route(block,r=>r.abort());
  await ctx.addInitScript(([k,v])=>{if(!sessionStorage.getItem('fx')){localStorage.setItem(k,v);sessionStorage.setItem('fx','1');}},[KEY,raw]);
  const p=await ctx.newPage(),warn=[];p.on('console',m=>{if(m.text().includes('입체 대체'))warn.push(m.text());});
  await p.goto(url);if(await p.locator('[data-action="home"]').count())await p.locator('[data-action="home"]').first().tap();await p.locator('[data-action="begin"]').tap();if(await p.locator('[data-story-action="exit"]').count())await p.locator('[data-story-action="exit"]').tap();
  await p.locator('[data-action="map-overview"]').tap();await p.locator('.world-node[data-id="3"] .world-label').tap();await p.locator('#dialog [data-action="enter-mission"]').tap();
  const host=p.locator('[data-spatial]').first();await host.waitFor();await p.waitForTimeout(3500);
  const res=await host.evaluate(h=>({reason:h.dataset.spatialReason||'',flat:h.classList.contains('spatial-flat'),ready:h.classList.contains('spatial-ready')}));
  await p.locator('.learning-footer [data-action]').last().tap();await p.waitForTimeout(800);
  const res2=await p.evaluate(()=>window.__toasts.filter(t=>t.includes('입체')));
  report.spatial.push({case:name,...res,warnings:warn.slice(0,3),notices:res2});
  assert.ok(res.ready||res.flat,`3D ${name}: shows 3D or the picture fallback`);assert.ok(res2.length<=1,`3D ${name}: at most one notice`);
  await ctx.close();
 }
 await gl.close();check(true,'3D failures fall back to pictures with one notice at most');
 assert.deepEqual(report.errors,[]);
}catch(error){report.failure=error.stack;process.exitCode=1;try{await snap('failure');report.failureText=(await page.locator('body').innerText()).slice(-3000);}catch{}}
finally{report.finished=new Date().toISOString();await writeFile(new URL('delivery-touch.json',output),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({checks:report.checks.length,spatial:report.spatial,failure:report.failure?.split('\n').slice(0,4).join(' | '),errors:report.errors}));
