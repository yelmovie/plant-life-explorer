// Real UI regression. Each independent profile has only PREVIOUS legacy missions
// completed; current/future completion and every field challenge start empty.
// Every mission is driven by three input families: the stage's own hand gesture
// (real page.mouse pointer strokes), plain taps on visible controls, and the
// keyboard fallback (focus a hidden .lens-fallback control, press Enter).
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=new URL(process.env.EXPEDITION_OUTPUT||'../docs/reviews/expedition-20261020/',import.meta.url);
await mkdir(output,{recursive:true});
// fileURLToPath decodes "%20": the project folder name contains a space.
const shot=name=>fileURLToPath(new URL(name,output));
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={started:new Date().toISOString(),url:process.env.EXPEDITION_URL||'http://127.0.0.1:4328',viewport:{width:1280,height:800},fixture:'Isolated version 1 profile; only previous missions completed; current and future false; field evidence empty',inputs:{handGestures:{},taps:0,keyboardPlacements:0},missions:[],pageErrors:[],failures:[]};
let page;
const KEY='green-garden-mvp-v2';
async function ready(i){return page.evaluate(async mission=>{const {fieldMissionReady}=await import('/src/field-missions-state.js');return fieldMissionReady(JSON.parse(localStorage.getItem('green-garden-mvp-v2')),mission);},i);}
async function evidence(){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)).fieldEvidence,KEY);}
// Saving is asynchronous and most gestures fire their action after an animation: wait on saved state.
async function until(check,label,timeout=20000){
 const end=Date.now()+timeout;
 for(;;){const e=await evidence();if(check(e))return e;if(Date.now()>end)throw new Error('timed out waiting for '+label);await page.waitForTimeout(40);}
}
const gesture=name=>{report.inputs.handGestures[name]=(report.inputs.handGestures[name]||0)+1;};
const mid=b=>[b.x+b.width/2,b.y+b.height/2];
// Pulsing handles never become "stable" for Playwright, so scroll without the stability wait.
// Instead, settle on two equal reads a short time apart (a pulse gives up after ~0.6 s).
async function box(selector){
 const l=page.locator(selector).first();await l.waitFor();await l.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'nearest'}));
 let b=await l.boundingBox();
 for(let i=0;i<10;i++){await page.waitForTimeout(60);const n=await l.boundingBox();if(n&&b&&['x','y','width','height'].every(k=>Math.abs(n[k]-b[k])<1))break;b=n;}
 assert.ok(b,selector+' has a box');return b;
}
// One continuous finger stroke through page points; `hold` runs before the finger lifts.
async function stroke(points,{steps=2,hold}={}){
 for(const [x,y] of points)assert.ok(x>=0&&x<=report.viewport.width&&y>=0&&y<=report.viewport.height,`stroke point ${Math.round(x)},${Math.round(y)} fits the viewport`);
 await page.mouse.move(...points[0]);await page.mouse.down();
 for(const [x,y] of points.slice(1))await page.mouse.move(x,y,{steps});
 if(hold)await hold();await page.mouse.up();
}
const ring=(cx,cy,r,from,to,step=12)=>{const pts=[];for(let a=from;a<=to;a+=step){const t=a*Math.PI/180;pts.push([cx+r*Math.sin(t),cy-r*Math.cos(t)]);}return pts;};
// A real click at the element's centre. Playwright's own click waits for two equal animation
// frames, which a busy classroom-like machine can starve for tens of seconds.
// Known quirk: while keyboard focus sits in an expanded .lens-fallback, a mouse press moves focus,
// the fallback collapses, the layout jumps and the click is lost. Switch input modes cleanly first.
async function tap(selector){await page.evaluate(()=>{if(document.activeElement?.closest('.lens-fallback'))document.activeElement.blur();});const [x,y]=mid(await box(selector));await page.mouse.click(x,y);report.inputs.taps++;}
async function tapAt(x,y){await page.mouse.click(x,y);report.inputs.taps++;}
const source=item=>page.locator(`[data-field-item="${item}"]`);
const target=id=>page.locator(`[data-field-drop="${id}"]`);
async function keyboardPlace(item,id){await source(item).focus();await page.keyboard.press('Enter');await target(id).focus();await page.keyboard.press('Enter');report.inputs.keyboardPlacements++;}
async function keyboardPress(selector){await page.locator(selector).first().focus();await page.keyboard.press('Enter');report.inputs.keyboardPlacements++;}
// The step list is gone; "다음 도전" (.objective-next) carries field-stage and disappears once that stage opens.
async function stage(n){const next=`[data-action="field-stage"][data-id="${n}"]`;await tap(next);await page.waitForFunction(sel=>!document.querySelector(sel),next);}
// Leafy's reply must turn into a specific, non-success explanation.
async function wrongFeedback(needle){
 await page.waitForFunction(n=>{const f=document.querySelector('.mission-feedback');return f&&!f.classList.contains('success')&&f.textContent.includes(n);},needle);
 const text=(await page.locator('.mission-feedback').innerText()).trim();assert.ok(text.length>16);return text;
}

// --- Stage gestures ---------------------------------------------------------------
// Drag the magnifier glass onto a clue spot and rest there until the clue lights up.
async function lensDrag(leaf,kind){
 await box('[data-lens-bench]');
 const [from,to]=await page.evaluate(async ([leaf,kind])=>{
  const {LENS_SPOTS}=await import('/src/field-hands-leaf.js');
  const img=document.querySelector(`[data-lens-leaf="${leaf}"] img`),r=img.getBoundingClientRect(),nw=img.naturalWidth,nh=img.naturalHeight,k=(getComputedStyle(img).objectFit==='cover'?Math.max:Math.min)(r.width/nw,r.height/nh),w=nw*k,h=nh*k;
  const [x,y]=LENS_SPOTS[leaf][kind][0],g=document.querySelector('[data-lens] .field-lens-glass').getBoundingClientRect();
  return [[g.left+g.width/2,g.top+g.height/2],[r.left+(r.width-w)/2+x*w,r.top+(r.height-h)/2+y*h]];
 },[leaf,kind]);
 await stroke([from,[from[0]+10,from[1]+10],to],{steps:8,hold:()=>page.locator(`[data-clue="${leaf}:${kind}"].found`).waitFor()});
 gesture('lensDrag');
 await until(e=>e.leaves.scans[leaf].includes(kind),`lens clue ${leaf}:${kind}`);
}
// Flick the top specimen card quickly toward a basket (yes = left/up, no = right/down).
async function flickCard(answer){
 const card=await box('[data-swipe-top]'),axis=await page.locator('[data-swipe-sort]').getAttribute('data-axis'),[x,y]=mid(card),d=answer==='yes'?-150:150;
 const id=await page.locator('[data-swipe-top]').getAttribute('data-swipe-card');
 await stroke([[x,y],axis==='y'?[x,y+d]:[x+d,y]],{steps:3});gesture('cardFlick');
 return id;
}
async function rubSoil(kind){
 const b=await box(`[data-dig="${kind}"] .dig-cover`),pts=[];
 for(const [i,fy] of [.15,.5,.85].entries())for(let fx=.05;fx<=.95;fx+=.1)pts.push([b.x+(i%2?1-fx:fx)*b.width,b.y+fy*b.height]);
 await stroke(pts,{steps:3});gesture('soilRub');
 await page.locator(`[data-link-handle="${kind}"]`).waitFor();
}
async function pullThread(kind,zone){
 const h=await box(`[data-link-handle="${kind}"]`),z=await box(`[data-link-target="${kind}"] .link-zone.${zone}`);
 await stroke([mid(h),[mid(h)[0]+12,mid(h)[1]],mid(z)],{steps:10});gesture('threadPull');
}
// Turn the time-dial hand one full clockwise lap from the top.
async function spinDial(){
 const f=await box('[data-dial-face]'),[cx,cy]=mid(f),r=Math.min(f.width,f.height)*.32;
 await stroke(ring(cx,cy,r,0,380,10),{steps:2});gesture('dialSpin');
}
async function pressHold(selector,doneCheck,name){
 const [x,y]=mid(await box(selector));
 await stroke([[x,y]],{hold:()=>page.waitForFunction(doneCheck)});gesture(name);
}
async function cloudTap(){await tap('.garden-cloud-btn');gesture('cloudTap');}
async function dragPlant(plant,zone){
 const a=mid(await box(`[data-field-item="plant:${plant}"]`)),b=mid(await box(`.field-garden-zone.zone-${zone}`)),pts=[];
 for(let i=0;i<=12;i++)pts.push([a[0]+(b[0]-a[0])*i/12,a[1]+(b[1]-a[1])*i/12]);
 await stroke(pts,{steps:2});gesture('plantDrag');
}
async function rain(){
 await tapAt(...mid(await box('[data-bag-cloud]')));gesture('cloudTap');
}

async function initialise(mission){
 const context=await browser.newContext({viewport:report.viewport,hasTouch:true});page=await context.newPage();page.setDefaultTimeout(30000);
 page.on('pageerror',error=>report.pageErrors.push({mission,message:error.message}));
 await page.goto(report.url);
 await page.evaluate(async i=>{const {normalizeFieldEvidence}=await import('/src/field-missions-state.js');const state={version:1,screen:'activity',page:i*2,completed:Array.from({length:10},(_,p)=>p<i*2),fieldEvidence:normalizeFieldEvidence(null),journeyRequired:Array.from({length:5},(_,m)=>m===i),soundEnabled:false};localStorage.setItem('green-garden-mvp-v2',JSON.stringify(state));},mission);
 await page.reload();await page.locator('.field-mission').waitFor();
 // A reload reconstructs transient UI mode. Explicitly open the field tab as a
 // learner can, so completion remains reviewable before moving to core research.
 await tap('[data-action="journey-mode"][data-id="field"]');
 await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))));
 assert.equal(await ready(mission),false);
 const locks=await page.evaluate(async i=>{const {openMission,restoreState}=await import('/src/model.js');const s=restoreState(localStorage.getItem('green-garden-mvp-v2'));return {current:openMission(s,i),future:i<4?openMission(s,i+1):false,completed:s.completed};},mission);
 assert.equal(locks.current,true);assert.equal(locks.future,false);assert.deepEqual(locks.completed,Array.from({length:10},(_,p)=>p<mission*2));
 return context;
}
async function finish(mission,result){
 // The DOM re-renders before the asynchronous save lands; wait for the saved state too.
 const end=Date.now()+20000;while(!await ready(mission)&&Date.now()<end)await page.waitForTimeout(40);
 assert.equal(await ready(mission),true,'every field step must be ready');
 const before=await evidence();await page.screenshot({path:shot(`field-${mission+1}-complete.png`),fullPage:true});
 await page.reload();await page.locator('.activity').waitFor();
 assert.equal(await ready(mission),true,'field evidence survives reload');assert.deepEqual(await evidence(),before);
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2')));
 assert.deepEqual(after.completed,Array.from({length:10},(_,p)=>p<mission*2),'field-only challenge cannot award original page completion');
 const broken=await page.locator('img').evaluateAll(images=>images.filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src));assert.deepEqual(broken,[]);
 result.ready=true;result.refreshPreserved=true;result.coreCompletionUnchanged=true;result.brokenImages=broken;report.missions.push(result);
}
try{
 for(let mission=0;mission<5;mission++){
  const result={mission:mission+1,stages:[2,3,3,3,2][mission],wrongFeedback:''};let context;
  try{context=await initialise(mission);
   if(mission===0){
    // 1: magnifier rests on clue spots by hand; the rest through the keyboard scan buttons.
    await lensDrag('maple','shape');await lensDrag('maple','edge');
    for(const leaf of ['pine','camellia'])for(const region of ['shape','edge'])await keyboardPress(`[data-field-drop="scan:${leaf}:${region}"]`);
    await until(e=>['maple','pine','camellia'].every(l=>e.leaves.scans[l].length===2),'all six clues');
    // 2: flick cards; the first flick goes to the wrong basket and must be explained.
    await stage(1);assert.equal(await flickCard('no'),'maple');
    result.wrongFeedback=await wrongFeedback('가장자리를 바구니');assert.equal(await ready(0),false);
    for(const leaf of ['maple','pine','camellia']){
     await page.locator(`[data-swipe-top][data-swipe-card="${leaf}"]`).waitFor();assert.equal(await flickCard(leaf==='pine'?'no':'yes'),leaf);
     await until(e=>e.leaves.edge[leaf]===(leaf==='pine'?'no':'yes'),'edge sort '+leaf);
    }
   }else if(mission===1){
    await tap('[data-action="field-season-predict"][data-id="tree:roots"]');await tap('[data-action="field-season-predict"][data-id="herb:roots"]');
    // 1: rub the soil away and pull the glowing thread to next spring's trunk.
    await rubSoil('tree');await pullThread('tree','lower');assert.equal((await until(e=>e.seasons.links.tree,'tree link')).seasons.links.tree,'trunk');
    await rubSoil('herb');await pullThread('herb','upper');await until(e=>e.seasons.links.herb==='leaf','herb wrong link');
    result.wrongFeedback=await wrongFeedback('뿌리는 땅속에서 살아 있어');
    await keyboardPress('[data-field-drop="link:herb:root"]');await until(e=>e.seasons.links.herb==='root','herb link');
    // 2: the rim already shows the seasons in order; spin the hand a full lap, tap the sprout spot.
    await stage(1);
    assert.equal(await page.locator('[data-time-dial]').evaluate(b=>[...b.querySelectorAll('[data-dial-card]')].sort((x,y)=>parseFloat(x.style.getPropertyValue('--a'))-parseFloat(y.style.getPropertyValue('--a'))).map(c=>c.dataset.dialCard).join(',')),'winter,bud,spring');
    await spinDial();await until(e=>e.seasons.tree.join()==='winter,bud,spring','tree order');
    await page.locator('.time-bench.pin-mode').waitFor();
    const bud=await box('[data-viewer] [data-layer="bud"] img');await tapAt(bud.x+bud.width/2,bud.y+bud.height*.3);
    await until(e=>e.seasons.clues.tree==='branches','tree regrow pin');
    // 3: the underground herb through the keyboard.
    await stage(2);await keyboardPress('.lens-fallback [data-action="field-season-turn"][data-id="herb"]');await until(e=>e.seasons.herb.join()==='winter,bud,spring','herb turned');
    await keyboardPress('.lens-fallback [data-action="field-season-clue"][data-id="herb:rootbud"]');
   }else if(mission===2){
    // 1: slide the switch down (air) or tap the label (solid).
    const knob=mid(await box('[data-heft="air"] .sw-knob'));await stroke([knob,[knob[0],knob[1]+40],[knob[0],knob[1]+80]],{steps:4});gesture('switchSlide');
    assert.equal((await until(e=>e.float.predictions.air,'air prediction')).float.predictions.air,'sink');
    await tap('[data-heft="solid"] [data-heft-pick="float"]');await until(e=>e.float.predictions.solid==='float','solid prediction');
    // 2: keyboard drops the solid model; the air model is tapped in and pushed under by hand.
    await stage(1);await keyboardPlace('model:solid','tank');await until(e=>e.float.tested.includes('solid'),'solid tested');
    await tap('[data-float-item="air"]');await page.waitForFunction(()=>{const m=document.querySelector('[data-float-tank] .rest-air');return m&&!m.classList.contains('settling');});
    await pressHold('[data-float-tank] .rest-air',()=>document.querySelector('[data-press-gauge]')?.classList.contains('full'),'pushUnder');
    await until(e=>e.float.tested.includes('air'),'air tested');
    // 3: the tank already recorded where each stopped; slice the petiole, then link the floater (one wrong first).
    assert.deepEqual((await evidence()).float.observed,{air:'float',solid:'sink'});
    await stage(2);await page.locator('.float-lab[data-phase="cut"]').waitFor();
    const p=await box('[data-petiole]'),cut=[];for(let i=0;i<=24;i++){const t=i/24;cut.push([p.x+(.21+.68*t)*p.width,p.y+(.875-.75*t)*p.height]);}
    await stroke(cut,{steps:2});gesture('petioleSlice');await page.locator('[data-petiole].open').waitFor();
    await page.locator('.float-lab[data-phase="reason"]').waitFor();await tap('[data-tank-model="solid"]');result.wrongFeedback=await wrongFeedback('겉 크기는 같아');
    await page.locator('.float-lab[data-phase="reason"]').waitFor();await tap('[data-tank-model="air"]');
    await until(e=>e.float.reason==='air','air-space reason');
   }else if(mission===3){
    // 1: one cloud tap rains on the bare beds and makes their ground.
    await cloudTap();await until(e=>e.garden.environments.pond==='water'&&e.garden.environments.meadow==='grass'&&e.garden.environments.ridge==='dry','environments');
    // 2: a drag onto the wrong bed is refused with a clue; drag the right one, keyboard for the other two.
    await stage(1);await dragPlant('hyacinth','ridge');result.wrongFeedback=await wrongFeedback('물이 고인 곳을 찾아 봐');assert.deepEqual((await evidence()).garden.plants,{});
    await dragPlant('hyacinth','pond');await until(e=>e.garden.plants.hyacinth==='pond','hyacinth planted');
    for(const [plant,z] of [['cherry','meadow'],['aloe','ridge']])await keyboardPlace('plant:'+plant,'plant:'+z);
    // 3: one cloud tap rains on the planted garden.
    await stage(2);assert.equal(await ready(3),false);await cloudTap();await until(e=>e.garden.testedKey,'garden rain');assert.equal(await ready(3),true);
   }else{
    await tap('[data-action="field-bag-predict"][data-id="surface"]');
    // 1: one cloud tap rains on the plain bag.
    await rain();await until(e=>e.bag.tests.length===1&&e.bag.tests[0].key==='plain:open','first rain test');assert.equal(await ready(4),false);
    // 2: one tap on a bag card rains on that bag; the same card again is refused; the last card by keyboard.
    await stage(1);await tap('[data-action="field-bag-try"][data-id="lotus:open"]');await until(e=>e.bag.tests.length===2,'lotus rain test');
    await tap('[data-action="field-bag-try"][data-id="lotus:open"]');result.wrongFeedback=await wrongFeedback('방금 비를 맞았어');assert.equal((await evidence()).bag.tests.length,2);
    await tap('[data-action="field-bag-try"][data-id="plain:flap"]');await until(e=>e.bag.tests.length===3,'flap rain test');
    await keyboardPress('[data-action="field-bag-try"][data-id="lotus:flap"]');const bag=(await until(e=>e.bag.tests.length===4,'both-parts rain test')).bag;
    assert.deepEqual(bag.tests.map(t=>t.notebookDry),[false,false,false,true]);assert.deepEqual(bag.tests.map(t=>t.rolls),[false,true,false,true]);
   }
   await finish(mission,result);console.log(`mission ${mission+1}: hand gesture, tap, keyboard, wrong feedback, ${result.stages} stages, reload passed`);
  }catch(error){report.failures.push({mission:mission+1,message:error.stack});await page?.screenshot({path:shot(`field-${mission+1}-failure.png`),fullPage:true}).catch(()=>{});console.error(`mission ${mission+1}: ${error.message}`);}
  finally{await context?.close();}
 }
}finally{
 report.finished=new Date().toISOString();report.passed=report.failures.length===0&&report.pageErrors.length===0&&report.missions.length===5;
 await writeFile(new URL('browser.json',output),JSON.stringify(report,null,2));await browser.close();
}
assert.ok(report.passed,JSON.stringify({failures:report.failures,pageErrors:report.pageErrors}));
