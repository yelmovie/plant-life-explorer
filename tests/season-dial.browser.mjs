import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const url=process.env.EXPEDITION_URL||'http://127.0.0.1:4328';
const key='green-garden-mvp-v2';
const order=['winter','bud','spring'];

try{
 const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
 const page=await context.newPage();
 page.setDefaultTimeout(8000);
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const touch=await context.newCDPSession(page);
 await page.goto(url);
 await page.evaluate(async key=>{
  const {freshState}=await import('/src/model.js');
  const state=freshState();
  Object.assign(state,{screen:'activity',page:2});
  state.completed[0]=state.completed[1]=true;
  state.journeyRequired[1]=true;
  Object.assign(state.fieldEvidence.seasons,{predictions:{tree:'roots',herb:'roots'},links:{tree:'trunk',herb:'root'}});
  localStorage.setItem(key,JSON.stringify(state));
 },key);
 await page.reload();
 const dial=page.locator('[data-time-dial]');
 const face=dial.locator('[data-dial-face]');
 const observe=dial.locator('[data-regrow-observe]');
 const next=page.locator('.learning-footer [data-action="journey-mode"][data-id="explore"]');
 const seasons=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).fieldEvidence.seasons,key);
 const closeUp=async asset=>{
  await observe.tap();
  await page.locator(`#dialog[open] [data-asset="${asset}"]`).waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#dialog[open]').waitFor({state:'hidden'});
 };
 const turn=async (input,angles,end)=>{
  await face.waitFor();
  const {x,y,width,height}=await face.boundingBox();
  const radius=Math.min(width,height)*.32;
  const points=angles.map(deg=>({x:x+width/2+radius*Math.sin(deg*Math.PI/180),y:y+height/2-radius*Math.cos(deg*Math.PI/180)}));
  if(input==='touch'){
   for(const [i,point] of points.entries())await touch.send('Input.dispatchTouchEvent',{type:i===0?'touchStart':'touchMove',touchPoints:[point]});
   await touch.send('Input.dispatchTouchEvent',{type:end,touchPoints:[]});
  }else{
   await page.mouse.move(points[0].x,points[0].y);
   await page.mouse.down();
   for(const point of points.slice(1))await page.mouse.move(point.x,point.y);
   await page.mouse.up();
  }
 };
 const arc=(length,step)=>Array.from({length:Math.floor(length/step)+1},(_,i)=>i*step);

 assert.equal(await dial.getAttribute('data-time-dial'),'tree');
 await turn('touch',arc(120,12),'touchCancel');
 assert.deepEqual((await seasons()).tree,['','','']);
 assert.equal(await observe.count(),0);
 await turn('touch',arc(120,12).reverse(),'touchEnd');
 await turn('touch',arc(372,12),'touchCancel');
 await observe.waitFor();
 await closeUp('season_cherry_winter_bud');
 await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).fieldEvidence.seasons.clues.tree==='branches',key);
 assert.deepEqual((await seasons()).tree,order);
 assert.equal(await next.getAttribute('aria-disabled'),'true');

 await page.locator('.objective-next[data-id="2"]').tap();
 assert.equal(await dial.getAttribute('data-time-dial'),'herb');
 await turn('mouse',arc(330,15));
 assert.equal(await observe.count(),0);
 await turn('mouse',[330,340,355]);
 await observe.waitFor();
 await closeUp('season_sowthistle_crown_bud');
 await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).fieldEvidence.seasons.clues.herb==='rootbud',key);
 assert.deepEqual((await seasons()).herb,order);
 assert.equal(await next.getAttribute('aria-disabled'),null);
 await next.tap();
 await page.locator('.field-record-view').waitFor();
 await page.reload();
 await page.locator('.field-record-view').waitFor();
 assert.deepEqual((await seasons()).clues,{tree:'branches',herb:'rootbud'});
 await page.locator('[data-action="season-review-answer"][data-id="parts"]').tap();
 await page.locator('.learning-footer [data-action="complete"]').tap();
 await page.locator('#dialog[open] [data-action="reward-map"]').tap();
 await page.locator('[data-action="map-overview"]').tap();
 await page.locator('.world-node[data-id="2"] .world-label').tap();
 await page.locator('#dialog[open] [data-action="enter-mission"]').tap();
 await page.locator('.field-mission.mission-2').waitFor();
 assert.deepEqual(errors,[]);
 console.log('Season dial: cancelled touch, partial turn, near-full mouse turn, both close-ups, saved research record and next mission passed.');
}finally{
 await browser.close();
}
