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
  assert.equal(await page.locator('[data-action="check-rule"]').count(),0);assert.equal(await page.locator('.sort-summary').count(),1);
  assert.notEqual(await page.locator('[data-action="complete"]').getAttribute('aria-disabled'),'true');
  assert.equal(await page.locator('[data-action="classification-proof"]').count(),0);
  await page.reload();assert.notEqual(await page.locator('[data-action="complete"]').getAttribute('aria-disabled'),'true');
  report.checks.push('Field-sorted save: chapter 1 record shows the field sort without a second sort; reload stays ready');await context.close();
 }
 {
  const state=freshState();state.screen='activity';state.page=2;state.completed[0]=state.completed[1]=true;state.fieldEvidence.seasons=completed.fieldEvidence.seasons;
  const {context,page}=await fixture(state);assert.equal((await read(page)).page,3);assert.equal(await page.locator('[data-action="season-explain"]').count(),0);
  assert.notEqual(await page.locator('[data-action="complete"]').getAttribute('aria-disabled'),'true');
  await page.reload();assert.equal((await read(page)).seasonExplained.length,2);
  report.checks.push('Reload after season field game: carries observations and explanations without repeated questions');await context.close();
 }
 {
  const {context,page}=await fixture({...completed,screen:'activity',page:7});
  await page.locator('.garden-cell[data-id="0"]').waitFor({state:'visible'});
  const before=await read(page);await action(page,'garden-cell','0');assert.deepEqual(await read(page),before);
  await action(page,'garden-cell','1');let state=await read(page);assert.deepEqual(state.gardenReasons,before.gardenReasons);assert.equal(state.gardenExtras.length,before.gardenExtras.length+1);
  assert.equal(await page.locator('[data-action="garden-answer"]').count(),0);assert.notEqual(await page.locator('[data-action="complete"]').getAttribute('aria-disabled'),'true');
  await action(page,'undo');state=await read(page);assert.deepEqual(state.gardenExtras,before.gardenExtras);assert.deepEqual(state.gardenReasons,before.gardenReasons);
  report.checks.push('Garden: same-cell tap is a no-op; optional extra planting and undo preserve reasons and readiness');await context.close();
 }
 {
  const state={...structuredClone(completed),screen:'activity',page:8};state.completed[8]=state.completed[9]=false;state.finished=false;state.fieldBridges[4]=false;
  state.fieldEvidence.bag={...freshState().fieldEvidence.bag,prediction:'cover',assembled:['surface','cover'],design:{surface:'lotus',cover:'flap'}};state.design=freshState().design;state.tests=[];state.inventionExplanations={};state.testExplanation=null;
  const {context,page}=await fixture(state);await page.locator('.today-panel [data-action="field-stage"][data-id="1"]').tap();
  const cloud=await page.locator('[data-bag-cloud]').boundingBox();await page.touchscreen.tap(cloud.x+cloud.width/2,cloud.y+cloud.height/2);await page.waitForFunction(()=>document.querySelector('[data-rain-count] b')?.textContent==='10');
  await page.locator('.today-panel [data-action="field-stage"][data-id="0"]').tap();await page.waitForTimeout(2300);
  assert.equal((await read(page)).fieldEvidence.bag.tests.length,0);
  report.checks.push('Leaving bag rain after all drops launch cancels callbacks and never adds a late trial');await context.close();
 }
 for(const [width,height] of [[1280,800],[1024,768],[1280,720],[768,1024]]){
  const {context,page}=await fixture({...completed,screen:'activity',page:5,reasons:{},habitatFeatures:{}});await page.setViewportSize({width,height});
  const options=page.locator('.habitat-options [data-action="habitat-answer"]');assert.equal(await options.count(),3);
  assert.equal(await page.locator('[data-action="habitat-feature"]').count(),0);
  for(const option of await options.all()){
   await option.scrollIntoViewIfNeeded();const box=await option.boundingBox();assert.ok(box.width>=44&&box.height>=44);
   assert.ok(await option.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return el===hit||el.contains(hit);}));
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:fileURLToPath(new URL(`habitat-choice-${width}x${height}.png`,output)),fullPage:true});
  await action(page,'habitat-answer','hyacinth');const state=await read(page);assert.equal(state.habitatFeatures.hyacinth,'hyacinth');assert.equal(state.reasons.hyacinth,'hyacinth');
  report.checks.push(`Combined habitat choice: ${width}x${height}, readable touch cards and one evidence choice`);await context.close();
 }
 assert.deepEqual(report.errors,[]);
}catch(error){report.failure=error.stack;process.exitCode=1;}
finally{await browser.close();await writeFile(new URL('pacing-runtime.json',output),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report));
