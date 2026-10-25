// Layout fixtures come from the separately completed, fresh UI journey.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=new URL('../docs/reviews/integrity-20261024/',import.meta.url);await mkdir(output,{recursive:true});
const completed=JSON.parse(await readFile(new URL('completed-test-record.json',output),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});
const report={started:new Date().toISOString(),fixture:'Actual fresh UI completion replayed in separate browser profiles; no real user data',layouts:[],errors:[],failures:[]};
const sizes=[[1180,820],[1024,768],[780,833],[768,1024]];
const scenarios=[['leaves',0],['seasons',2],['lab',4],['garden',6],['design',8],['tests',9],['field-bag',8],['notebook',null],['ending',null]];
for(const [width,height] of sizes){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true});
 for(const [name,activity] of scenarios){
  const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.errors.push(e.message));
  const state={...structuredClone(completed),screen:activity!==null?'activity':name==='ending'?'ending':'report',page:activity??9};
  await page.addInitScript(s=>localStorage.setItem('green-garden-mvp-v2',JSON.stringify(s)),state);
  try{
   await page.goto(process.env.JOURNEY_URL||'http://127.0.0.1:4328');await page.locator('main').waitFor();await page.evaluate(()=>document.fonts.ready);
   if(name==='field-bag'){await page.locator('[data-action="journey-mode"][data-id="field"]').first().tap();await page.locator('.today-panel .mission-journey [data-action="field-stage"][data-id="1"]').tap();}
   if(name==='tests')await page.locator('.result-parts summary').tap();
   if(name==='notebook')await page.locator('[data-action="note-open"][data-id="4"]').tap();
   await page.waitForTimeout(200);
   const result=await page.evaluate(()=>{
    const visible=el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
    const rectangle=el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,y:r.y};};
    const root=document.querySelector('dialog[open]')||document.querySelector('main');
    const small=[...root.querySelectorAll('button')].filter(visible).map(el=>({action:el.dataset.action,label:el.textContent.trim().slice(0,35),...rectangle(el)})).filter(r=>r.width<43.5||r.height<43.5);
    const bags=[...root.querySelectorAll('.compact-bag > .bag-art,.field-bag-assembly > .bag-art')].filter(visible).map(rectangle);
    const cards=[...root.querySelectorAll('.part-card')].filter(visible).map(rectangle);
    return {documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,small,bags,cards};
   });
   assert.ok(result.documentWidth<=width+1,'no horizontal page overflow');assert.deepEqual(result.small,[],'visible touch targets at least 44px');
   for(const bag of result.bags)assert.ok(bag.width>=100&&bag.height>=100,'main bag must have a visible nonzero size');
   for(const card of result.cards)assert.ok(card.width>=105,'material cards retain readable word width');
   const controls=name==='notebook'?page.locator('#dialog .dialog-actions button'):page.locator('.learning-footer button, .test-control-row button, .part-card');
   for(const control of await controls.all()){
    if(!await control.isVisible())continue;await control.scrollIntoViewIfNeeded();
    const reachable=await control.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return x>=0&&x<innerWidth&&y>=0&&y<innerHeight&&!!hit&&(el===hit||el.contains(hit));});
    assert.equal(reachable,true,'primary/material control reachable by scrolling: '+await control.innerText());
   }
   await page.screenshot({path:fileURLToPath(new URL(`layout-${width}x${height}-${name}.png`,output)),fullPage:true});
   report.layouts.push({size:[width,height],name,...result,passed:true});
  }catch(error){report.failures.push({size:[width,height],name,error:error.message});await page.screenshot({path:fileURLToPath(new URL(`layout-failure-${width}x${height}-${name}.png`,output)),fullPage:true});}
  await page.close();
 }
 await context.close();console.log(`layouts ${width}x${height}: checked`);
}
// Rotate the same page and use large text, without discarding its student record.
const context=await browser.newContext({viewport:{width:1180,height:580},hasTouch:true}),page=await context.newPage();
await page.addInitScript(s=>localStorage.setItem('green-garden-mvp-v2',JSON.stringify({...s,screen:'activity',page:9,largeText:true})),completed);
await page.goto(process.env.JOURNEY_URL||'http://127.0.0.1:4328');
for(const [width,height] of [[1180,580],[768,1024],[1024,768]]){
 try{await page.setViewportSize({width,height});const next=page.locator('[data-action="complete"]');await next.scrollIntoViewIfNeeded();await next.tap();await page.locator('#dialog[open]').waitFor();await page.locator('#dialog .dialog-top [data-action="close"]').tap();await page.screenshot({path:fileURLToPath(new URL(`large-text-${width}x${height}.png`,output)),fullPage:true});report.layouts.push({size:[width,height],name:'large-text-rotation',passed:true});}
 catch(error){report.failures.push({size:[width,height],name:'large-text-rotation',error:error.message});}
}
await browser.close();report.finished=new Date().toISOString();await writeFile(new URL('layout.json',output),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.layouts.length,failures:report.failures,errors:report.errors}));if(report.failures.length||report.errors.length)process.exitCode=1;
