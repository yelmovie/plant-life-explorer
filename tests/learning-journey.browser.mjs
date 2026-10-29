// Complete a fresh record through visible controls. No progress or answer injection.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=new URL(process.env.JOURNEY_OUTPUT||'../docs/reviews/integrity-20261024/',import.meta.url);await mkdir(output,{recursive:true});
const url=process.env.JOURNEY_URL||'http://127.0.0.1:4328';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});
const context=await browser.newContext({viewport:{width:1180,height:820},hasTouch:true});
const page=await context.newPage();page.setDefaultTimeout(30000);
const report={started:new Date().toISOString(),url,mode:'WebGL disabled; isolated fresh browser; touch emulation and keyboard',missions:[],checks:[],errors:[],snapshots:[],layout:[]};
page.on('pageerror',e=>report.errors.push(e.message));
const selector=(name,id)=>`[data-action="${name}"]${id!==undefined?`[data-id="${id}"]`:''}`;
// Old card/slot buttons now sit in a visually hidden .lens-fallback (keyboard path); press those with focus+Enter.
const press=async loc=>{if(await loc.evaluate(el=>!!el.closest('.lens-fallback'))){await loc.focus();await page.keyboard.press('Enter');}else await loc.tap();};
const a=async(name,id,scope='')=>{await press(page.locator(scope+selector(name,id)).first());};
const close=()=>a('close',undefined,'#dialog .dialog-top ');
const stage=n=>a('field-stage',String(n),'.today-panel .mission-journey ');
// Keyboard select-then-place. Some steps have no source card (magnifier, season string): the slot alone acts.
const place=async(item,target)=>{
 const source=page.locator(`[data-field-item="${item}"]`);
 if(await source.count()){await source.first().focus();await page.keyboard.press('Enter');}
 await page.locator(`[data-field-drop="${target}"]`).first().focus();await page.keyboard.press('Enter');
};
// Real pointer gestures (mouse pointer events drive the same handlers as a finger).
const center=async loc=>{await loc.evaluate(el=>el.scrollIntoView({block:"nearest"}));const b=await loc.boundingBox();return [b.x+b.width/2,b.y+b.height/2];};
async function stroke(points,beforeUp){await page.mouse.move(...points[0]);await page.mouse.down();for(const [x,y] of points.slice(1))await page.mouse.move(x,y,{steps:3});if(beforeUp)await beforeUp();await page.mouse.up();}
const line=([x0,y0],[x1,y1],n=12)=>Array.from({length:n+1},(_,i)=>[x0+(x1-x0)*i/n,y0+(y1-y0)*i/n]);
const ring=([cx,cy],r,turns=1,n=24)=>Array.from({length:n*turns+1},(_,i)=>[cx+r*Math.cos(i/n*2*Math.PI),cy+r*Math.sin(i/n*2*Math.PI)]);
const evidence=fn=>page.waitForFunction(fn);
// Drag the magnifier so its glass rests on a clue spot until the clue lights up.
async function lens(id,kind,[fx,fy]){
 const [from,to]=await page.evaluate(([id,fx,fy])=>{
  const img=document.querySelector(`[data-lens-leaf="${id}"] img`),r=img.getBoundingClientRect(),nw=img.naturalWidth,nh=img.naturalHeight,k=Math.min(r.width/nw,r.height/nh),w=nw*k,h=nh*k;
  const g=document.querySelector('[data-lens] .field-lens-glass').getBoundingClientRect();
  return [[g.left+g.width/2,g.top+g.height/2],[r.left+(r.width-w)/2+fx*w,r.top+(r.height-h)/2+fy*h]];},[id,fx,fy]);
 await stroke(line(from,to,20),()=>page.locator(`[data-clue="${id}:${kind}"].found`).waitFor());
 await evidence(`JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.leaves.scans.${id}.includes('${kind}')`);
}
const saved=()=>page.evaluate(()=>navigator.locks.request('green-garden-mvp-v2',()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2'))));
async function snap(name){await page.screenshot({path:fileURLToPath(new URL(name+'.png',output)),fullPage:true});report.snapshots.push(name);}
async function hint(){await a('journey-help');await close();}
async function enter(m){
 console.log(`enter mission ${m+1}`);
 if(await page.locator('#dialog[open]').count())await close();
 await a('map-overview');await page.locator(`.world-node[data-id="${m}"] .world-label`).tap();
 await a('enter-mission',undefined,'#dialog ');await page.locator('.field-mission').waitFor();
}
async function explore(){await a('journey-mode','explore','.learning-footer ');await page.locator('.field-mission').waitFor({state:'detached'});}
async function completePage(){const button=page.locator('.learning-footer [data-action="complete"]');assert.notEqual(await button.getAttribute('aria-disabled'),'true',await page.locator('.guide-bubble').innerText());await button.tap();}
async function missionDone(m){
 const state=await saved();assert.equal(state.completed[m*2],true);assert.equal(state.completed[m*2+1],true);
 assert.ok(state.stamps.helped.includes(m),'wrong → requested hint → correction must receive helped stamp');
 assert.ok(Object.values(state.learningRecords[m].responses).some(r=>r.wrong),'wrong response retained');
 for(const r of Object.values(state.learningRecords[m].responses).filter(r=>r.phase==='prediction'&&!r.firstCorrect)){
  assert.equal(r.correct,true,'observation-linked correction is retained');assert.notEqual(r.first,r.last,'first prediction remains distinct from corrected choice');
 }
 assert.match(await page.locator('#dialog').innerText(),/도움을 받아 찾았어/);
 report.missions.push({mission:m+1,completed:true,stamp:'helped',firstAndRevisionsRecorded:true});
 await snap(`mission-${m+1}-reward`);await a('reward-map',undefined,'#dialog ');
 const before=await saved();await page.reload();assert.deepEqual(await saved(),before);
 report.checks.push(`Mission ${m+1}: refresh retains progress and responses`);
}
try{
 await page.goto(url);assert.equal((await saved()).completed.some(Boolean),false);
 await a('sound');await a('begin');await page.locator('[data-story-action="exit"]').tap();
 await enter(0);
 // Hand: the magnifier rests on the maple's centre and edge; the rest use the keyboard slots.
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-lens-leaf] img')].every(i=>i.complete&&i.naturalWidth));
 await lens('maple','shape',[.5,.6]);await lens('maple','edge',[.33,.33]);
 // Hand: throw the top card (maple) into the wrong basket first.
 await stage(1);assert.equal(await page.locator('[data-swipe-top]').getAttribute('data-swipe-card'),'maple');
 await stroke(line(await center(page.locator('[data-swipe-top]')),await center(page.locator('[data-swipe-bin="no"]')),8));
 await evidence(`JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.leaves.edge.maple==='no'`);await hint();
 for(const p of ['maple','pine','camellia']){await page.locator('[data-swipe-top][data-swipe-card="'+p+'"]').waitFor();await page.locator('[data-swipe-bin="'+(p==='pine'?'no':'yes')+'"]').tap();await evidence(`JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.leaves.edge.${p}==='${p==='pine'?'no':'yes'}'`);}
 await stage(2);for(const p of ['maple','pine','camellia'])await place('leaf:'+p,'sort:narrow:'+(p==='pine'?'yes':'no'));
 await explore();assert.equal((await saved()).page,1);
 // The field already sorted by both rules: the record page shows that sort and asks for nothing new.
 assert.equal(await page.locator('[data-action="feature-answer"]').count(),0);
 assert.equal(await page.locator('[data-action="assign-group"]').count(),0);
 assert.equal(await page.locator('[data-action="classification-proof"]').count(),0);
 assert.deepEqual((await saved()).leafEvidence,{},'classification does not invent detailed shape observations');
 await snap('leaves-classified');
 await completePage();await missionDone(0);

 await enter(1);await a('field-season-predict','tree:none');await a('field-season-predict','herb:none');
 await place('season:tree','link:tree:leaf');await hint();await place('season:tree','link:tree:trunk');
 // Hand: rub the winter soil off the herb, then pull its glowing point to the root half of next spring.
 const cover=await page.locator('[data-dig="herb"] .dig-cover').boundingBox(),rub=[];
 for(let row=0;row<4;row++)for(const x of row%2?[.95,.05]:[.05,.95])rub.push([cover.x+x*cover.width,cover.y+(row+.5)/4*cover.height]);
 await stroke(rub.flatMap((p,i)=>i?line(rub[i-1],p,10).slice(1):[p]));
 await page.locator('[data-link-handle="herb"]').waitFor();
 await stroke(line(await center(page.locator('[data-link-handle="herb"]')),await center(page.locator('[data-link-target="herb"] .link-zone.lower')),10));
 await evidence(`JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.seasons.links.herb==='root'`);
 for(const [n,kind] of [[1,'tree'],[2,'herb']]){
  await stage(n);
  await a('field-season-turn',kind);
  await a('field-season-clue',kind+':'+(kind==='tree'?'branches':'rootbud'));
 }
 await explore();assert.equal((await saved()).seasonPrediction.cherry,'none');
 assert.equal((await saved()).page,3);assert.equal((await saved()).seasonalRecords.length,4);
 assert.deepEqual([...(await saved()).seasonExplained].sort(),['cherry','sowthistle']);assert.equal(await page.locator('[data-action="season-explain"]').count(),0);await snap('season-discovery');
 await completePage();await missionDone(1);

 await enter(2);
 // Hand: push the air model's switch down (sink).
 const knob=await center(page.locator('[data-heft="air"] .sw-knob'));await stroke(line(knob,[knob[0],knob[1]+80],8));
 await evidence(`JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.float.predictions.air==='sink'`);await place('model:solid','predict:float');await stage(1);
 for(const model of ['air','solid']){await page.locator('[data-float-item="'+model+'"]').tap();await evidence(`JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.float.tested.includes('${model}')`);}await stage(2);
 await hint();const pet=await page.locator('[data-petiole]').boundingBox();
 await stroke(line([pet.x+pet.width*.21,pet.y+pet.height*.875],[pet.x+pet.width*.89,pet.y+pet.height*.125],36));
 await page.locator('.float-lab[data-phase="reason"]').waitFor();await page.locator('[data-tank-model="air"]').tap();
 await evidence(`JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.float.reason==='air'`);
 // The field cut already showed the petiole's air, so the repeated lab page is skipped.
 await explore();assert.equal((await saved()).page,5);
 for(const [p,habitat] of [['hyacinth','water'],['aloe','dry'],['cherry','grass']]){await a('habitat-plant',p);await a('habitat',habitat);assert.equal(await page.locator('[data-action="habitat-feature"]').count(),0);await a('habitat-answer',p);}
 await snap('habitats-linked');await completePage();await missionDone(2);

 // One cloud tap rains on the bare beds and makes their ground.
 await enter(3);await a('field-garden-ground');
 await evidence(`(g=>g.pond==='water'&&g.meadow==='grass'&&g.ridge==='dry')(JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.garden.environments)`);
 // A wrong bed refuses the plant; Leafy's hint, then the right beds.
 await stage(1);await place('plant:hyacinth','plant:ridge');assert.deepEqual((await saved()).fieldEvidence.garden.plants,{});await hint();
 for(const [plant,zone] of [['hyacinth','pond'],['cherry','meadow'],['aloe','ridge']])await place('plant:'+plant,'plant:'+zone);
 await stage(2);await a('field-garden-rain');await explore();
 assert.equal((await saved()).page,7);assert.deepEqual((await saved()).garden,{hyacinth:0,cherry:2,aloe:4});
 await snap('garden-designed');
 // Reasons chosen for the same plants in mission 3 come along; nothing is asked twice.
 assert.deepEqual([...(await saved()).gardenReasons].sort(),['aloe','cherry','hyacinth']);
 // The carried-over garden is not 'ready' by itself: the student keeps it (or changes it) and picks one spot to introduce.
 assert.equal(await page.locator('.learning-footer [data-action="complete"]').getAttribute('aria-disabled'),'true');
 await a('garden-pick','cherry');assert.equal((await saved()).gardenPick,'cherry');
 await completePage();await missionDone(3);

 await enter(4);await a('field-bag-predict','surface');
 // Hand: one cloud tap rains on the bag; each upgrade card goes on before its own rain.
 const rain=async n=>{const [cx,cy]=await center(page.locator('[data-bag-cloud]'));await page.mouse.click(cx,cy);await evidence(`JSON.parse(localStorage['green-garden-mvp-v2']).fieldEvidence.bag.tests.length===${n}`);};
 await rain(1);await snap('bag-plain-test');
 await stage(1);await a('field-bag-upgrade','surface');
 // A second part cannot go on before the rain: one change per trial.
 await page.locator('[data-action="field-bag-upgrade"][data-id="cover"]').tap({force:true});assert.equal((await saved()).fieldEvidence.bag.design.cover,'open');
 await rain(2);await a('field-bag-upgrade','cover');await rain(3);
 const trials=(await saved()).fieldEvidence.bag.tests;assert.deepEqual(trials.map(t=>t.notebookDry),[false,false,true]);assert.deepEqual(trials.map(t=>t.rolls),[false,true,true]);
 await stage(2);await a('field-bag-answer','surface');await hint();await a('field-bag-answer','cover');
 report.checks.push('One upgrade per rain: plain → lotus surface → cover; only the cover keeps the notebook dry');
 // The field already built and tested the bag, so the record page opens ready with a summary.
 await explore();assert.equal((await saved()).page,9);assert.equal((await saved()).testPrediction,'surface');assert.equal(await page.locator('.invention-summary').count(),1);
 await snap('invention-compared');await completePage();await missionDone(4);
 await a('report');await a('note-open','4');await a('note-sticker');await a('note-check','4:0');await a('note-check','4:1');await close();
 await a('note-open','4');assert.equal(await page.locator('[data-action="note-sticker"]').getAttribute('aria-pressed'),'true');assert.match(await page.locator('.note-quiz-feedback').innerText(),/맞아/);await snap('notebook-records');await close();
 const before=await saved();await page.reload();assert.deepEqual(await saved(),before);await a('note-open','4');assert.equal(await page.locator('.note-read-sticker.stuck').count(),1);await close();
 await a('report-tab','share');await a('share-later');await a('start-final');await a('final-habitat','water');await a('final-habitat','dry');await a('power-core');await page.locator('[data-story-action="exit"]').tap();
 assert.equal((await saved()).finished,true);await snap('ending');
 await a('home');await a('begin');await a('report');await a('note-open','4');assert.equal(await page.locator('.note-read-sticker.stuck').count(),1);await close();
 report.checks.push('Fresh completion: 5 field missions, carried observations, new plant application, ending and research notebook; home/re-entry retains notebook');
 report.finalState=await saved();
 await writeFile(new URL('completed-test-record.json',output),JSON.stringify(report.finalState,null,2));
 assert.deepEqual(report.errors,[]);
}catch(error){report.failure=error.stack;process.exitCode=1;try{await snap('failure');report.failureState=await saved();report.failureText=(await page.locator('body').innerText()).slice(-5000);}catch{}}
finally{report.finished=new Date().toISOString();await writeFile(new URL('journey.json',output),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({missions:report.missions.length,checks:report.checks,errors:report.errors,failure:report.failure}));
