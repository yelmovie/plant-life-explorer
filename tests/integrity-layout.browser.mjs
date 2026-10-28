// Layout fixtures come from the separately completed, fresh UI journey.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=new URL(process.env.JOURNEY_OUTPUT||'../docs/reviews/integrity-20261024/',import.meta.url);await mkdir(output,{recursive:true});
const completed=JSON.parse(await readFile(new URL('completed-test-record.json',output),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});
const report={started:new Date().toISOString(),fixture:'Actual fresh UI completion replayed in separate browser profiles; no real user data',layouts:[],errors:[],failures:[]};
const sizes=(process.env.LAYOUT_SIZES||'1180x820,1024x768,780x833,768x1024').split(',').map(s=>s.split('x').map(Number));
const scenarios=[['leaves',0],['classification',1],['season-records',3],['habitats',5],['garden-records',7],['seasons',2],['lab',4],['garden',6],['design',8],['tests',9],['field-bag',8],['notebook',null],['ending',null]];
// Field missions in progress, so every hand tool (not just finished screens) is laid out.
// Each entry: [selector, minimum px on both sides, must be reachable by touch].
const hands=[
 [['[data-lens]',44,true],['[data-lens-leaf]',100,true],['.clue-drawer',44,false]],
 [['[data-swipe-top]',44,true],['[data-swipe-bin]',44,true]],
 [['[data-swipe-top]',44,true],['[data-swipe-bin]',44,true]],
 [['.dig-cover',44,true],['[data-link-target]',100,true]],
 [['[data-time-dial] [data-dial-face]',100,true],['[data-dial-card]',44,false],['[data-viewer]',100,false]],
 [['[data-time-dial] [data-dial-face]',100,true],['[data-dial-card]',44,false],['[data-viewer]',100,false]],
 [['.float-heft:not([data-done]) [data-heft-switch] .sw-track',44,true],['.float-heft:not([data-done]) [data-heft-pick]',44,true]],
 [['[data-float-item]',44,true],['[data-float-tank]',100,true],['[data-press-gauge]',20,false]],
 [['[data-tank-model]',44,true],['[data-petiole]',100,true]],
 [['.garden-cloud-btn',44,true],['.field-garden-zone',44,false]],
 [['.garden-card',44,true],['.field-garden-zone',44,true]],
 [['.garden-cloud-btn',44,true],['.field-garden-zone',44,false]],
 [['[data-bag-dial]',44,true],['[data-bag-frame]',100,true],['.bag-canvas > .bag-art',100,false]],
 [['[data-bag-cloud]',44,true],['.bag-canvas > .bag-art',100,true]],
 [['[data-diff]',100,true]],
];
for(let m=0;m<5;m++)for(let stage=0;stage<3;stage++)scenarios.push([`field-${m+1}-${stage+1}`,m*2,{stage,hands:hands[m*3+stage]}]);
const inProgress={...completed.fieldEvidence,
 leaves:{scans:{maple:['shape','edge'],pine:[],camellia:[]},edge:{},narrow:{}},
 seasons:{predictions:{tree:'none',herb:'none'},clues:{},links:{},tree:['','',''],herb:['','','']},
 float:{predictions:{air:'sink'},tested:['air'],observed:{},reason:''},
 garden:{environments:{},plants:{},testedKey:''},
 bag:{...completed.fieldEvidence.bag,compared:{},delivered:''}};
// Wait for finite CSS animations/transitions (screen entry, card pop) without waiting on endless ones (mascot float).
const settle=page=>page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getComputedTiming().endTime!==Infinity).map(a=>a.finished.catch(()=>{}))));
// Scroll in the page itself: Playwright's scrollIntoViewIfNeeded waits for "stable", which looping decorations can starve.
const reach=el=>{el.scrollIntoView({block:'center',inline:'nearest'});const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return {ok:x>=0&&x<innerWidth&&y>=0&&y<innerHeight&&!!hit&&(el===hit||el.contains(hit)),hit:hit?hit.tagName+'.'+String(hit.className?.baseVal??hit.className).slice(0,40):null};};
for(const [width,height] of sizes){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true});
 for(const [name,activity,field] of scenarios.filter(([name])=>!process.env.LAYOUT_SCENARIOS||process.env.LAYOUT_SCENARIOS.split(',').includes(name))){
  const page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',e=>report.errors.push(e.message));
  const state={...structuredClone(completed),...(field?{fieldEvidence:structuredClone(inProgress)}:{}),screen:activity!==null?'activity':name==='ending'?'ending':'report',page:activity??9};
  await page.addInitScript(s=>localStorage.setItem('green-garden-mvp-v2',JSON.stringify(s)),state);
  try{
   await page.goto(process.env.JOURNEY_URL||'http://127.0.0.1:4328');await page.locator('main').waitFor();await page.evaluate(()=>document.fonts.ready);
   if(name==='field-bag'){await page.locator('[data-action="journey-mode"][data-id="field"]').first().tap();await page.locator('.today-panel .mission-journey [data-action="field-stage"][data-id="1"]').tap();}
   if(name==='tests')await page.locator('.result-parts summary').tap();
   if(name==='notebook')await page.locator('[data-action="note-open"][data-id="4"]').tap();
   if(field){const step=`.today-panel .mission-journey [data-action="field-stage"][data-id="${field.stage}"]`;await page.locator('[data-action="journey-mode"][data-id="field"]').first().tap();await page.locator(step).tap();
    await page.locator(step+'[aria-current="step"]').waitFor();for(const [selector] of field.hands)await page.locator(selector).first().waitFor();}
   await settle(page);
   const result=await page.evaluate(()=>{
    const visible=el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
    const rectangle=el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,y:r.y};};
    const root=document.querySelector('dialog[open]')||document.querySelector('main');
    const small=[...root.querySelectorAll('button')].filter(visible).map(el=>({action:el.dataset.action,label:el.textContent.trim().slice(0,35),...rectangle(el)})).filter(r=>r.width<43.5||r.height<43.5);
    const bags=[...root.querySelectorAll('.compact-bag > .bag-art,.bag-canvas > .bag-art')].filter(visible).map(rectangle);
    const cards=[...root.querySelectorAll('.part-card')].filter(visible).map(rectangle);
    return {documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,small,bags,cards};
   });
   assert.ok(result.documentWidth<=width+1,'no horizontal page overflow');assert.deepEqual(result.small,[],'visible touch targets at least 44px');
   for(const bag of result.bags)assert.ok(bag.width>=100&&bag.height>=100,'main bag must have a visible nonzero size');
   for(const card of result.cards)assert.ok(card.width>=105,'material cards retain readable word width');
   if(field)for(const [selector,min,touch] of field.hands){
    const found=await page.locator(selector).evaluateAll((els,[min,touch,src])=>{const reach=eval(src);return els.filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect(),out={w:Math.round(r.width),h:Math.round(r.height),left:Math.round(r.left),right:Math.round(r.right),inside:r.left>=-1&&r.right<=innerWidth+1,big:r.width>=min&&r.height>=min};return touch?{...out,...reach(el)}:out;});},[min,touch,reach.toString()]);
    assert.ok(found.length>0,`hand tool visible: ${selector}`);
    for(const f of found){assert.ok(f.inside,`hand tool inside the screen width: ${selector} ${JSON.stringify(f)}`);assert.ok(f.big,`hand tool at least ${min}px: ${selector} ${JSON.stringify(f)}`);if(touch)assert.ok(f.ok,`hand tool not covered: ${selector} ${JSON.stringify(f)}`);}
   }
   const controls=name==='notebook'?page.locator('#dialog .dialog-actions button'):page.locator('.learning-footer button, .test-control-row button, .part-card');
   for(const control of await controls.all()){
    if(!await control.isVisible())continue;
    const reachable=await control.evaluate((el,src)=>eval(src)(el),reach.toString());
    assert.equal(reachable.ok,true,'primary/material control reachable by scrolling: '+await control.innerText()+' (covered by '+reachable.hit+')');
   }
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:fileURLToPath(new URL(`layout-${width}x${height}-${name}.png`,output)),fullPage:true,timeout:30000});
   report.layouts.push({size:[width,height],name,...result,passed:true});
  }catch(error){report.failures.push({size:[width,height],name,error:error.message.split('\n')[0]});await page.screenshot({path:fileURLToPath(new URL(`layout-failure-${width}x${height}-${name}.png`,output)),fullPage:true,timeout:30000}).catch(()=>{});}
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
await browser.close();report.finished=new Date().toISOString();await writeFile(new URL(process.env.LAYOUT_REPORT||'layout.json',output),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.layouts.length,failures:report.failures,errors:report.errors}));if(report.failures.length||report.errors.length)process.exitCode=1;
