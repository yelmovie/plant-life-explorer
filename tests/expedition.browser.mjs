// Real UI regression. Each independent profile has only PREVIOUS legacy missions
// completed; current/future completion and every field challenge start empty.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=new URL('../docs/reviews/expedition-20261020/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={started:new Date().toISOString(),url:process.env.EXPEDITION_URL||'http://127.0.0.1:4328',viewport:{width:1280,height:800},fixture:'Isolated version 1 profile; only previous missions completed; current and future false; field evidence empty',inputs:{pointerDrags:0,taps:0,keyboardPlacements:0},missions:[],pageErrors:[],failures:[]};
let page;
async function ready(i){return page.evaluate(async mission=>{const {fieldMissionReady}=await import('/src/field-missions-state.js');return fieldMissionReady(JSON.parse(localStorage.getItem('green-garden-mvp-v2')),mission);},i);}
async function evidence(){return page.evaluate(()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2')).fieldEvidence);}
const source=item=>page.locator(`[data-field-item="${item}"]`);
const target=id=>page.locator(`[data-field-drop="${id}"]`);
async function tapPlace(item,id){await source(item).tap();await target(id).tap();report.inputs.taps+=2;}
async function keyboardPlace(item,id){await source(item).focus();await page.keyboard.press('Enter');await target(id).focus();await page.keyboard.press('Enter');report.inputs.keyboardPlacements++;}
async function dragPlace(item,id){
 await source(item).scrollIntoViewIfNeeded();await target(id).scrollIntoViewIfNeeded();
 const from=await source(item).boundingBox(),to=await target(id).boundingBox();assert.ok(from&&to,'drag endpoints exist');
 const x=from.x+from.width/2,y=from.y+from.height/2,tx=to.x+to.width/2,ty=to.y+to.height/2;
 assert.ok(y>0&&y<800&&ty>0&&ty<800,'drag endpoints fit the viewport');
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+12,y+10,{steps:3});await page.mouse.move(tx,ty,{steps:16});await page.mouse.up();report.inputs.pointerDrags++;
}
async function stage(n){await page.locator(`.field-mission .mission-step[data-id="${n}"]`).tap();report.inputs.taps++;}
async function action(name){await page.locator(`.field-mission [data-action="${name}"]`).tap();report.inputs.taps++;}
async function wrongFeedback(){const text=await page.locator('.mission-feedback').innerText();assert.ok(text.trim().length>16);assert.equal(await page.locator('.mission-feedback.success').count(),0);return text.trim();}
async function initialise(mission){
 const context=await browser.newContext({viewport:report.viewport,hasTouch:true});page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',error=>report.pageErrors.push({mission,message:error.message}));
 await page.goto(report.url);
 await page.evaluate(async i=>{const {normalizeFieldEvidence}=await import('/src/field-missions-state.js');const state={version:1,screen:'activity',page:i*2,completed:Array.from({length:10},(_,p)=>p<i*2),fieldEvidence:normalizeFieldEvidence(null),journeyRequired:Array.from({length:5},(_,m)=>m===i),soundEnabled:false};localStorage.setItem('green-garden-mvp-v2',JSON.stringify(state));},mission);
 await page.reload();await page.locator('.field-mission').waitFor();
 // A reload reconstructs transient UI mode. Explicitly open the field tab as a
 // learner can, so completion remains reviewable before moving to core research.
 await page.locator('[data-action="journey-mode"][data-id="field"]').tap();report.inputs.taps++;
 await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))));
 assert.equal(await ready(mission),false);
 const locks=await page.evaluate(async i=>{const {openMission,restoreState}=await import('/src/model.js');const s=restoreState(localStorage.getItem('green-garden-mvp-v2'));return {current:openMission(s,i),future:i<4?openMission(s,i+1):false,completed:s.completed};},mission);
 assert.equal(locks.current,true);assert.equal(locks.future,false);assert.deepEqual(locks.completed,Array.from({length:10},(_,p)=>p<mission*2));
 return context;
}
async function finish(mission,result){
 assert.equal(await ready(mission),true,'all three field steps must be ready');
 assert.equal(await page.locator('.field-mission .mission-step.done').count(),3);
 const before=await evidence();await page.screenshot({path:new URL(`field-${mission+1}-complete.png`,output).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});
 await page.reload();await page.locator('.activity').waitFor();
 assert.equal(await ready(mission),true,'field evidence survives reload');assert.deepEqual(await evidence(),before);
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2')));
 assert.deepEqual(after.completed,Array.from({length:10},(_,p)=>p<mission*2),'field-only challenge cannot award original page completion');
 const broken=await page.locator('img').evaluateAll(images=>images.filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src));assert.deepEqual(broken,[]);
 result.ready=true;result.refreshPreserved=true;result.coreCompletionUnchanged=true;result.brokenImages=broken;report.missions.push(result);
}
try{
 for(let mission=0;mission<5;mission++){
  const context=await initialise(mission),result={mission:mission+1,stages:3,wrongFeedback:''};
  try{
   if(mission===0){
    await dragPlace('lens','scan:maple:shape');
    assert.ok((await evidence()).leaves.scans.maple.includes('shape'),'real pointer drag records hotspot');
    for(const leaf of ['maple','pine','camellia'])for(const region of ['shape','edge'])if(!(leaf==='maple'&&region==='shape'))await tapPlace('lens',`scan:${leaf}:${region}`);
    await stage(1);await tapPlace('leaf:pine','sort:edge:yes');result.wrongFeedback=await wrongFeedback();assert.equal(await ready(0),false);
    for(const leaf of ['maple','pine','camellia'])await tapPlace('leaf:'+leaf,`sort:edge:${leaf==='pine'?'no':'yes'}`);
    await stage(2);for(const leaf of ['maple','pine','camellia'])await keyboardPlace('leaf:'+leaf,`sort:narrow:${leaf==='pine'?'yes':'no'}`);
   }else if(mission===1){
    await dragPlace('season:tree','link:tree:trunk');assert.equal((await evidence()).seasons.links.tree,'trunk');
    await tapPlace('season:herb','link:herb:leaf');result.wrongFeedback=await wrongFeedback();await keyboardPlace('season:herb','link:herb:root');
    await stage(1);for(const [i,phase] of ['winter','bud','spring'].entries())await tapPlace(`frame:tree:${phase}`,`order:tree:${i}`);
    await stage(2);for(const [i,phase] of ['winter','bud','spring'].entries())await keyboardPlace(`frame:herb:${phase}`,`order:herb:${i}`);
   }else if(mission===2){
    await dragPlace('model:air','predict:sink');assert.equal((await evidence()).float.predictions.air,'sink');await tapPlace('model:solid','predict:float');
    await stage(1);await tapPlace('model:air','tank');await keyboardPlace('model:solid','tank');
    await stage(2);await tapPlace('model:solid','observe:float');result.wrongFeedback=await wrongFeedback();
    await keyboardPlace('model:air','observe:float');await tapPlace('model:solid','observe:sink');await keyboardPlace('reason:air-space','reason:air');
   }else if(mission===3){
    await dragPlace('environment:water','environment:ridge');result.wrongFeedback=await wrongFeedback();
    for(const [env,z] of [['water','pond'],['grass','meadow'],['dry','ridge']])await tapPlace('environment:'+env,'environment:'+z);
    await stage(1);for(const [plant,z] of [['hyacinth','pond'],['cherry','meadow'],['aloe','ridge']])await keyboardPlace('plant:'+plant,'plant:'+z);
    await stage(2);assert.equal(await ready(3),false);await action('field-garden-rain');assert.equal(await ready(3),true);
    await tapPlace('plant:aloe','plant:meadow');assert.equal(await ready(3),false);await action('field-garden-rain');await wrongFeedback();
    await tapPlace('plant:cherry','plant:meadow');await keyboardPlace('plant:aloe','plant:ridge');assert.equal(await ready(3),false);await action('field-garden-rain');result.retestAfterEdit=true;
   }else{
    await dragPlace('part:surface:plain','part:surface');assert.ok((await evidence()).bag.assembled.includes('surface'));
    await keyboardPlace('part:cover:flap','part:cover');await tapPlace('part:pocket:flap','part:pocket');
    await stage(1);await action('field-bag-test');await tapPlace('part:surface:lotus','part:surface');await action('field-bag-test');
    await stage(2);await tapPlace('compare:cover','compare');result.wrongFeedback=await wrongFeedback();assert.equal(await ready(4),false);
    await keyboardPlace('compare:surface','compare');await action('field-bag-deliver');
   }
   await finish(mission,result);console.log(`mission ${mission+1}: pointer, tap, keyboard, wrong feedback, 3 stages, reload passed`);
  }catch(error){report.failures.push({mission:mission+1,message:error.stack});await page.screenshot({path:new URL(`field-${mission+1}-failure.png`,output).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true}).catch(()=>{});console.error(`mission ${mission+1}: ${error.message}`);}
  finally{await context.close();}
 }
}finally{
 report.finished=new Date().toISOString();report.passed=report.failures.length===0&&report.pageErrors.length===0&&report.missions.length===5;
 await writeFile(new URL('browser.json',output),JSON.stringify(report,null,2));await browser.close();
}
assert.ok(report.passed,JSON.stringify({failures:report.failures,pageErrors:report.pageErrors}));
