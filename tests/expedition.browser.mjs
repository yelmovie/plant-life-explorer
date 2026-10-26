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
const output=new URL('../docs/reviews/expedition-20261020/',import.meta.url);
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
async function stage(n){await tap(`.today-panel .mission-step[data-action="field-stage"][data-id="${n}"]`);await page.locator(`.today-panel .mission-step.active[data-id="${n}"]`).waitFor();}
async function action(name){await tap(`.field-mission [data-action="${name}"]`);}
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
async function drawFlow(fromZone,toZone){
 const a=mid(await box(`.field-garden-zone.zone-${fromZone}`)),b=mid(await box(`.field-garden-zone.zone-${toZone}`)),pts=[];
 for(let i=0;i<=12;i++)pts.push([a[0]+(b[0]-a[0])*i/12,a[1]+(b[1]-a[1])*i/12]);
 await stroke(pts,{steps:2});gesture('waterFlow');
}
async function sowAndPour(plant,zone){
 await tap(`[data-garden-seed="${plant}"]`);await tapAt(...mid(await box(`.field-garden-zone.zone-${zone}`)));
 const [cx,cy]=mid(await box('[data-garden-can]:not([hidden])'));
 await stroke(ring(cx,cy,34,90,160,10),{hold:()=>page.waitForFunction(([p,z])=>document.querySelector('.garden-sprout.grown')||document.querySelector(`[data-zone="${z}"][data-plant="${p}"]`),[plant,zone])});gesture('canTilt');
}
async function swirlSky(){
 const s=await box('[data-garden-sky]'),[cx,cy]=mid(s),r=Math.min(s.width,s.height)*.32;
 await stroke(ring(cx,cy,r,0,900,15),{steps:2});gesture('cloudSwirl');
}
async function sewSeam(){
 const f=await box('[data-bag-stitch]'),m=13,[l,t,r,b]=[f.x+m,f.y+m,f.x+f.width-m,f.y+f.height-m],pts=[];
 const edge=(x0,y0,x1,y1)=>{const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/14);for(let i=0;i<n;i++)pts.push([x0+(x1-x0)*i/n,y0+(y1-y0)*i/n]);};
 edge(l,t,r,t);edge(r,t,r,b);edge(r,b,l,b);edge(l,b,l,t);pts.push([l,t+14]);
 await stroke(pts,{steps:1});gesture('seamStitch');
}
async function rainAndShake(){
 const c=mid(await box('[data-bag-cloud]'));for(let i=0;i<10;i++)await tapAt(...c);
 await page.locator('[data-bag-stage].shake-ready').waitFor();
 const [x,y]=mid(await box('[data-bag-stage] [data-bag-canvas]')),pts=[[x,y]];for(let i=0;i<8;i++)pts.push([x+(i%2?-60:60),y]);
 await stroke(pts,{steps:4});gesture('bagShake');
}
async function circleSpot(side,part){
 const b=await box(`[data-diff="${side}"]`),spot={surface:[.2,.6],cover:[.5,.22],pocket:[.56,.68]}[part];
 await stroke(ring(b.x+spot[0]*b.width,b.y+spot[1]*b.height,Math.min(30,b.height*.14),0,370,20),{steps:2});gesture('diffCircle');
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
 await page.waitForFunction(()=>document.querySelectorAll('.today-panel .mission-step.done').length===3);
 // The DOM re-renders before the asynchronous save lands; wait for the saved state too.
 const end=Date.now()+20000;while(!await ready(mission)&&Date.now()<end)await page.waitForTimeout(40);
 assert.equal(await ready(mission),true,'all three field steps must be ready');
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
  const result={mission:mission+1,stages:3,wrongFeedback:''};let context;
  try{context=await initialise(mission);
   if(mission===0){
    // 1: magnifier rests on clue spots by hand; the rest through the keyboard scan buttons.
    await lensDrag('maple','shape');await lensDrag('maple','edge');
    for(const leaf of ['pine','camellia'])for(const region of ['shape','edge'])await keyboardPress(`[data-field-drop="scan:${leaf}:${region}"]`);
    await until(e=>['maple','pine','camellia'].every(l=>e.leaves.scans[l].length===2),'all six clues');
    // 2: flick cards; the first flick goes to the wrong basket and must be explained.
    await stage(1);assert.equal(await flickCard('no'),'maple');
    result.wrongFeedback=await wrongFeedback('지금 기준은');assert.equal(await ready(0),false);
    for(const leaf of ['maple','pine','camellia']){
     await page.locator(`[data-swipe-top][data-swipe-card="${leaf}"]`).waitFor();assert.equal(await flickCard(leaf==='pine'?'no':'yes'),leaf);
     await until(e=>e.leaves.edge[leaf]===(leaf==='pine'?'no':'yes'),'edge sort '+leaf);
    }
    // 3: the vertical re-sort through the keyboard.
    await stage(2);for(const leaf of ['maple','pine','camellia'])await keyboardPlace('leaf:'+leaf,`sort:narrow:${leaf==='pine'?'yes':'no'}`);
   }else if(mission===1){
    await tap('[data-action="field-season-predict"][data-id="tree:roots"]');await tap('[data-action="field-season-predict"][data-id="herb:roots"]');
    // 1: rub the soil away and pull the glowing thread to next spring's trunk.
    await rubSoil('tree');await pullThread('tree','lower');assert.equal((await until(e=>e.seasons.links.tree,'tree link')).seasons.links.tree,'trunk');
    await rubSoil('herb');await pullThread('herb','upper');await until(e=>e.seasons.links.herb==='leaf','herb wrong link');
    result.wrongFeedback=await wrongFeedback('땅속에 살아 있던 뿌리');
    await keyboardPress('[data-field-drop="link:herb:root"]');await until(e=>e.seasons.links.herb==='root','herb link');
    // 2: tap-swap rim cards into order, spin the hand a full lap, tap the sprout spot.
    await stage(1);
    await tap('[data-dial-card="spring"]');await tap('[data-dial-card="winter"]');
    await tap('[data-dial-card="spring"]');await tap('[data-dial-card="bud"]');
    assert.equal(await page.locator('[data-time-dial]').evaluate(b=>[...b.querySelectorAll('[data-dial-card]')].sort((x,y)=>parseFloat(x.style.getPropertyValue('--a'))-parseFloat(y.style.getPropertyValue('--a'))).map(c=>c.dataset.dialCard).join(',')),'winter,bud,spring');
    await spinDial();await until(e=>e.seasons.tree.join()==='winter,bud,spring','tree order');
    await page.locator('.time-bench.pin-mode').waitFor();
    const bud=await box('[data-viewer] [data-layer="bud"] img');await tapAt(bud.x+bud.width/2,bud.y+bud.height*.3);
    await until(e=>e.seasons.clues.tree==='branches','tree regrow pin');
    // 3: the underground herb through the keyboard.
    await stage(2);for(const [i,phase] of ['winter','bud','spring'].entries())await keyboardPlace(`frame:herb:${phase}`,`order:herb:${i}`);
    await keyboardPress('.lens-fallback [data-action="field-season-clue"][data-id="herb:rootbud"]');
   }else if(mission===2){
    // 1: press-hold to heft, then slide the switch down (air) or tap the label (solid).
    await pressHold('[data-heft="air"] [data-heft-lift]',()=>parseFloat(document.querySelector('[data-heft="air"]').style.getPropertyValue('--lift'))>=.95,'heftHold');
    const knob=mid(await box('[data-heft="air"] .sw-knob'));await stroke([knob,[knob[0],knob[1]+40],[knob[0],knob[1]+80]],{steps:4});gesture('switchSlide');
    assert.equal((await until(e=>e.float.predictions.air,'air prediction')).float.predictions.air,'sink');
    await pressHold('[data-heft="solid"] [data-heft-lift]',()=>parseFloat(document.querySelector('[data-heft="solid"]').style.getPropertyValue('--lift'))>=.95,'heftHold');
    await tap('[data-heft="solid"] [data-heft-pick="float"]');await until(e=>e.float.predictions.solid==='float','solid prediction');
    // 2: keyboard drops the solid model; the air model is tapped in and pushed under by hand.
    await stage(1);await keyboardPlace('model:solid','tank');await until(e=>e.float.tested.includes('solid'),'solid tested');
    await tap('[data-float-item="air"]');await page.waitForFunction(()=>{const m=document.querySelector('[data-float-tank] .rest-air');return m&&!m.classList.contains('settling');});
    await pressHold('[data-float-tank] .rest-air',()=>document.querySelector('[data-press-gauge]')?.classList.contains('full'),'pushUnder');
    await until(e=>e.float.tested.includes('air'),'air tested');
    // 3: record by tapping model then band (one wrong), slice the petiole, pop air rooms, link the floater.
    await stage(2);await tap('[data-tank-model="solid"]');await tap('[data-float-band="float"]');result.wrongFeedback=await wrongFeedback('수면과 수조 바닥 중');
    await tap('[data-tank-model="air"]');await tap('[data-float-band="float"]');await keyboardPlace('model:solid','observe:sink');
    await until(e=>e.float.observed.air==='float'&&e.float.observed.solid==='sink','observations');
    await page.locator('.float-lab[data-phase="cut"]').waitFor();
    const p=await box('[data-petiole]'),cut=[];for(let i=0;i<=24;i++){const t=i/24;cut.push([p.x+(.21+.68*t)*p.width,p.y+(.875-.75*t)*p.height]);}
    await stroke(cut,{steps:2});gesture('petioleSlice');await page.locator('[data-petiole].open').waitFor();
    for(const i of [0,2,4])await tapAt(...mid(await box(`[data-air-room="${i}"]`)));
    await page.locator('.float-lab[data-phase="reason"]').waitFor();await tap('[data-tank-model="air"]');
    await until(e=>e.float.reason==='air','air-space reason');
   }else if(mission===3){
    // 1: a stream from the ridge ending on the meadow makes the wrong ground; meadow to pond is right.
    await drawFlow('ridge','meadow');result.wrongFeedback=await wrongFeedback('빗물 단서를 봐');
    await drawFlow('meadow','pond');await until(e=>e.garden.environments.pond==='water'&&e.garden.environments.meadow==='grass'&&e.garden.environments.ridge==='dry','environments');
    // 2: sow and tilt the can by hand once, keyboard for the other two.
    await stage(1);await sowAndPour('hyacinth','pond');await until(e=>e.garden.plants.hyacinth==='pond','hyacinth planted');
    for(const [plant,z] of [['cherry','meadow'],['aloe','ridge']])await keyboardPlace('plant:'+plant,'plant:'+z);
    // 3: swirl the sky into rain; an edit invalidates the test until it rains again.
    await stage(2);assert.equal(await ready(3),false);await swirlSky();await until(e=>e.garden.testedKey,'first rain');assert.equal(await ready(3),true);
    await keyboardPlace('plant:aloe','plant:meadow');await until(e=>e.garden.plants.aloe==='meadow','aloe moved');assert.equal(await ready(3),false);await keyboardPress('.lens-fallback [data-action="field-garden-rain"]');await wrongFeedback('아직 맞지 않는 자리가');
    await keyboardPlace('plant:cherry','plant:meadow');await keyboardPlace('plant:aloe','plant:ridge');await until(e=>e.garden.plants.cherry==='meadow'&&e.garden.plants.aloe==='ridge','garden fixed');assert.equal(await ready(3),false);
    await swirlSky();await until(e=>e.garden.testedKey,'rain after edit');result.retestAfterEdit=true;
   }else{
    await tap('[data-action="field-bag-predict"][data-id="surface"]');
    // 1: tap-dial each place (plain, flap, flap), then trace the seam to sew it.
    for(const [part,n] of [['surface',1],['cover',2],['pocket',2]])for(let i=0;i<n;i++)await tap(`[data-bag-dial="${part}"]`);
    await page.locator('[data-bag-stitch][data-ready="true"]').waitFor();await sewSeam();
    const sewn=await until(e=>e.bag.assembled.length===3,'bag assembled');assert.deepEqual(sewn.bag.design,{surface:'plain',cover:'flap',pocket:'flap'});
    // 2: ten cloud taps and a shake; change one part by tap, re-test through the keyboard.
    await stage(1);await rainAndShake();await until(e=>e.bag.tests.length===1,'first rain test');
    await tap('[data-bag-dial="surface"]');await until(e=>e.bag.design.surface==='lotus','lotus surface');
    await keyboardPress('.lens-fallback [data-action="field-bag-test"]');await until(e=>e.bag.tests.length===2,'second rain test');
    // 3: circle the wrong part first, then name the changed part by keyboard and deliver.
    await stage(2);await circleSpot('after','cover');result.wrongFeedback=await wrongFeedback('두 덮개는 같아');assert.equal(await ready(4),false);
    await keyboardPlace('compare:surface','compare');await until(e=>e.bag.compared.part==='surface','comparison');await action('field-bag-deliver');
    await until(e=>e.bag.delivered,'bag delivered');
   }
   await finish(mission,result);console.log(`mission ${mission+1}: hand gesture, tap, keyboard, wrong feedback, 3 stages, reload passed`);
  }catch(error){report.failures.push({mission:mission+1,message:error.stack});await page?.screenshot({path:shot(`field-${mission+1}-failure.png`),fullPage:true}).catch(()=>{});console.error(`mission ${mission+1}: ${error.message}`);}
  finally{await context?.close();}
 }
}finally{
 report.finished=new Date().toISOString();report.passed=report.failures.length===0&&report.pageErrors.length===0&&report.missions.length===5;
 await writeFile(new URL('browser.json',output),JSON.stringify(report,null,2));await browser.close();
}
assert.ok(report.passed,JSON.stringify({failures:report.failures,pageErrors:report.pageErrors}));
