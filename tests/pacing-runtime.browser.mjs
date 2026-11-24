// Isolated regression profiles based on the completed visible-control journey.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {freshState,STORAGE_KEY} from '../src/model.js';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH);
const output=new URL(process.env.JOURNEY_OUTPUT,import.meta.url);
const completed=JSON.parse(await readFile(new URL('completed-test-record.json',output),'utf8'));
const url=process.env.JOURNEY_URL,browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});
const report={checks:[],errors:[]};
async function fixture(state){
 const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true}),page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.setDefaultTimeout(15000);
 await page.addInitScript(({state,key})=>{if(!sessionStorage.getItem('fixture')){localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('fixture','1');}},{state,key:STORAGE_KEY});
 await page.goto(url);await page.locator('main').waitFor();return {context,page};
}
const read=page=>page.evaluate(key=>navigator.locks.request(key,()=>JSON.parse(localStorage.getItem(key))),STORAGE_KEY);
const action=(page,name,id)=>page.locator(`[data-action="${name}"]${id===undefined?'':`[data-id="${id}"]`}`).first().tap();
try{
 {
  const state=freshState();state.screen='activity';state.page=1;state.completed[0]=true;state.fieldEvidence.leaves=completed.fieldEvidence.leaves;state.groups={cherry:'yes',ginkgo:'no',grass:'no'};
  const {context,page}=await fixture(state);
  assert.equal(await page.locator('[data-leaf-rule="edge"].is-sorted').count(),1);
  assert.equal(await page.locator('[data-action="complete"]').count(),0);
  await action(page,'leaf-rule','narrow');
  await action(page,'leaf-pick','grass');
  await action(page,'leaf-drop','narrow:yes');
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).groupsByRule.narrow.grass==='yes',STORAGE_KEY);
  await page.reload();
  assert.equal(await page.locator('[data-leaf-rule="narrow"]').count(),1);
  assert.equal(await page.locator('[data-action="leaf-pick"]').count(),2);
  for(const leaf of ['cherry','ginkgo']){
   await action(page,'leaf-pick',leaf);await action(page,'leaf-drop','narrow:no');
  }
  await action(page,'leaf-partner','cherry');
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).leafPartner==='cherry',STORAGE_KEY);
  await page.reload();assert.match(await page.locator('.leaf-sort-result').innerText(),/강아지풀.*벚나무/);
  assert.notEqual(await page.locator('[data-action="complete"]').getAttribute('aria-disabled'),'true');
  report.checks.push('Grouping records and the active criterion survive reload, with one criterion visible at a time');await context.close();
 }
 {
  const state=freshState();state.screen='activity';state.page=2;state.completed[0]=state.completed[1]=true;state.fieldEvidence.seasons=completed.fieldEvidence.seasons;
  const {context,page}=await fixture(state);assert.equal((await read(page)).page,3);assert.equal(await page.locator('[data-action="season-explain"]').count(),0);
  const review=page.locator('.season-review-board');
  const showing=async plant=>{
   assert.equal(await review.getAttribute('data-review-plant'),plant);
   assert.equal(await review.locator('.season-atlas').count(),2);
  };
  await showing('cherry');
  assert.equal(await page.locator('[data-action="complete"]').count(),0);
  await action(page,'season-review-answer','leaf');assert.match(await page.locator('.guide-bubble').innerText(),/잎이 떨어진 뒤/);
  await action(page,'season-review-answer','bud');
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.seasonReviewCherry===true,STORAGE_KEY);
  assert.match(await review.locator('.field-review-result').innerText(),/겨울눈/);
  await action(page,'season-review-plant','sowthistle');await showing('sowthistle');
  await page.reload();await showing('sowthistle');
  await action(page,'season-review-plant','cherry');await showing('cherry');
  await action(page,'season-review-plant','sowthistle');await showing('sowthistle');
  await action(page,'season-review-answer','root');
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.seasonCompareAnswer==='parts',STORAGE_KEY);
  assert.notEqual(await page.locator('[data-action="complete"]').getAttribute('aria-disabled'),'true');
  await page.reload();assert.match(await review.locator('.field-review-result').innerText(),/뿌리/);
  report.checks.push('Season review shows one plant at a time, saves the first finding across reload, and unlocks restoration after both answers');await context.close();
 }
 {
  const {context,page}=await fixture({...completed,screen:'activity',page:7,gardenFromField:false,gardenReview:null,garden:{...completed.garden,hyacinth:0},gardenReasons:['hyacinth','cherry','aloe']});
  await page.locator('.garden-cell[data-id="0"]').waitFor({state:'visible'});
  const before=await read(page);await action(page,'garden-cell','0');assert.deepEqual(await read(page),before);
  await action(page,'garden-cell','1');await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.gardenExtras.some(plant=>plant.cell===1),STORAGE_KEY);let state=await read(page);assert.deepEqual(state.gardenReasons,before.gardenReasons);assert.equal(state.gardenExtras.length,before.gardenExtras.length+1);
  assert.equal(await page.locator('[data-action="garden-answer"]').count(),0);assert.notEqual(await page.locator('[data-action="complete"]').getAttribute('aria-disabled'),'true');
  await action(page,'undo');await page.waitForFunction(([key,count])=>JSON.parse(localStorage.getItem(key))?.gardenExtras.length===count,[STORAGE_KEY,before.gardenExtras.length]);state=await read(page);assert.deepEqual(state.gardenExtras,before.gardenExtras);assert.deepEqual(state.gardenReasons,before.gardenReasons);
  report.checks.push('Garden: same-cell tap is a no-op; optional extra planting and undo preserve reasons and readiness');await context.close();
 }
 {
  const state={...structuredClone(completed),screen:'activity',page:8,finished:false,bagReviewAnswer:'',testPrediction:''};
  state.completed[8]=state.completed[9]=false;
  state.journeyRequired[4]=true;state.fieldBridges[4]=false;
  state.fieldEvidence.bag=freshState().fieldEvidence.bag;
  const {context,page}=await fixture(state);
  const trials=async()=> (await read(page)).fieldEvidence.bag.tests;
  const waitForTrials=count=>page.waitForFunction(([key,count])=>JSON.parse(localStorage.getItem(key))?.fieldEvidence.bag.tests.length===count,[STORAGE_KEY,count]);

  await action(page,'field-bag-predict','cover');
  const cloud=page.locator('[data-bag-cloud]');
  await cloud.waitFor();
  // The cloud drifts continuously, so tap its current centre.
  const {x,y,width,height}=await cloud.boundingBox();
  await page.touchscreen.tap(x+width/2,y+height/2);
  await waitForTrials(1);
  assert.deepEqual((await trials()).map(t=>t.key),['plain:open']);
  await action(page,'field-stage','1');
  await action(page,'field-bag-try','lotus:open');
  await page.waitForFunction(()=>document.querySelector('[data-bag-stage].raining [data-rain-count] b')?.textContent==='10');
  await action(page,'back');
  await page.locator('main.stage-map').waitFor();
  // The fall, runoff and result pause after the last drop launches take up to 2,280 ms.
  await page.waitForTimeout(2600);
  assert.deepEqual((await trials()).map(t=>t.key),['plain:open']);
  report.checks.push('Leaving the comparison bench after the last drop launches cancels the unfinished trial');

  await action(page,'map-overview');
  await page.locator('.world-node[data-id="4"] .world-label').tap();
  await action(page,'enter-mission');
  for(const [index,key] of ['lotus:open','plain:flap','lotus:flap'].entries()){
   await action(page,'field-bag-try',key);
   await waitForTrials(index+2);
  }
  const results=await trials();
  assert.deepEqual(results.map(t=>t.key),['plain:open','lotus:open','plain:flap','lotus:flap']);
  assert.deepEqual(results.map(t=>t.notebookDry),[false,false,false,true]);
  assert.deepEqual(results.map(t=>t.rolls),[false,true,false,true]);
  await page.locator('.learning-footer [data-action="journey-mode"][data-id="explore"]').tap();
  await page.locator('.bag-review-board').waitFor();
  assert.equal(await page.locator('.field-review-trial').count(),4);
  await action(page,'bag-review-answer','surface');
  const complete=page.locator('.learning-footer [data-action="complete"]');
  assert.equal(await complete.getAttribute('aria-disabled'),'true');
  await action(page,'bag-review-answer','both');
  await page.screenshot({path:fileURLToPath(new URL('bag-results.png',output)),animations:'disabled'});
  await complete.tap();
  await page.locator('#dialog[open] [data-action="reward-map"]').waitFor();
  assert.match(await page.locator('#dialog[open]').innerText(),/탐험 가방이 완성됐어/);
  const restored=await read(page);
  assert.deepEqual(restored.completed.slice(8),[true,true]);
  assert.deepEqual(restored.fieldEvidence.bag.tests,results);
  await page.screenshot({path:fileURLToPath(new URL('bag-restored.png',output)),animations:'disabled'});
  await action(page,'reward-map');
  await page.reload();
  assert.deepEqual((await read(page)).fieldEvidence.bag.tests,results);
  report.checks.push('Returning to the bench allows four distinct rain tests, a corrected explanation and a saved restoration reward');
  await context.close();
 }
 for(const [width,height] of [[1280,800],[1024,768],[1280,720],[768,1024]]){
  const {context,page}=await fixture({...completed,screen:'activity',page:5,completed:completed.completed.map((value,i)=>i===5?false:value),habitatCompareAnswer:'',reasons:{},habitatFeatures:{}});await page.setViewportSize({width,height});
  const options=page.locator('[data-action="habitat-compare-answer"]');assert.equal(await options.count(),3);
  assert.equal(await page.locator('[data-action="habitat-feature"]').count(),0);
  for(const option of await options.all()){
   await option.scrollIntoViewIfNeeded();const box=await option.boundingBox();assert.ok(box.width>=44&&box.height>=44);
   assert.ok(await option.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return el===hit||el.contains(hit);}));
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:fileURLToPath(new URL(`habitat-choice-${width}x${height}.png`,output)),fullPage:true});
  await action(page,'habitat-compare-answer','aloe');await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.habitatCompareAnswer==='aloe',STORAGE_KEY);const state=await read(page);assert.equal(state.habitatCompareAnswer,'aloe');
  report.checks.push(`Combined habitat choice: ${width}x${height}, readable touch cards and one evidence choice`);await context.close();
 }
 assert.deepEqual(report.errors,[]);
}catch(error){report.failure=error.stack;process.exitCode=1;}
finally{await browser.close();await writeFile(new URL('pacing-runtime.json',output),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report));
