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
  const state={...structuredClone(completed),screen:'activity',page:8};state.completed[8]=state.completed[9]=false;state.finished=false;state.fieldBridges[4]=false;
  state.fieldEvidence.bag={...freshState().fieldEvidence.bag,prediction:'cover',assembled:['surface','cover'],design:{surface:'lotus',cover:'flap'}};state.design=freshState().design;state.tests=[];state.inventionExplanations={};state.testExplanation=null;
  const {context,page}=await fixture(state);await page.locator('[data-action="field-stage"][data-id="1"]').tap();
  const cloud=await page.locator('[data-bag-cloud]').boundingBox();await page.touchscreen.tap(cloud.x+cloud.width/2,cloud.y+cloud.height/2);await page.waitForFunction(()=>document.querySelector('[data-rain-count] b')?.textContent==='10');
  await page.locator('[data-action="field-stage"][data-id="0"]').tap();await page.waitForTimeout(2300);
  assert.equal((await read(page)).fieldEvidence.bag.tests.length,0);
  report.checks.push('Leaving bag rain after all drops launch cancels callbacks and never adds a late trial');await context.close();
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
