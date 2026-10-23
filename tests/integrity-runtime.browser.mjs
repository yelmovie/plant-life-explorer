import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=new URL('../docs/reviews/integrity-20261024/',import.meta.url),url=process.env.JOURNEY_URL||'http://127.0.0.1:4328',key='green-garden-mvp-v2';
const completed=JSON.parse(await readFile(new URL('completed-test-record.json',output),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});
const report={started:new Date().toISOString(),storage:[],webgl:[],errors:[]};
async function settled(page){return page.evaluate(key=>navigator.locks.request(key,()=>localStorage.getItem(key)),key);}
async function fixture(raw,extra){const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.addInitScript(({raw,key,extra})=>{if(!sessionStorage.getItem('fixture')){localStorage.setItem(key,raw);if(extra)localStorage.setItem(key+'-last-good',extra);sessionStorage.setItem('fixture','1');}},{raw,key,extra});await page.goto(url);return {context,page};}
try{
 for(const raw of ['{broken','null','{"version":2,"completed":[]}',JSON.stringify({...completed,version:99})]){
  const {context,page}=await fixture(raw);await page.locator('#save-status').waitFor();
  await page.locator('[data-action="begin"]').click();await page.locator('[data-story-action="exit"]').click();
  assert.equal(await settled(page),raw);await page.reload();assert.equal(await settled(page),raw);await page.locator('#save-status').waitFor();
  report.storage.push({case:raw.slice(0,50),originalPreservedAfterActionsAndReload:true});await context.close();
 }
 {
  const {context,page}=await fixture('{broken',JSON.stringify(completed));await page.locator('[data-action="save-help"]').click();await page.locator('[data-action="save-recover"]').click();
  await page.locator('#save-status').waitFor({state:'detached'});assert.equal(JSON.parse(await settled(page)).completed.filter(Boolean).length,10);assert.equal(await page.evaluate(k=>localStorage.getItem(k+'-unreadable-original'),key),'{broken');
  report.storage.push({case:'explicit last-good recovery',completedPreserved:true,unreadableOriginalArchived:true});await context.close();
 }
 {
  const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage();
  const raw=JSON.stringify({...completed,screen:'activity',page:0});
  await page.addInitScript(({raw,key})=>{localStorage.setItem(key,raw);window.testQuota=true;const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key&&window.testQuota)throw new DOMException('test quota','QuotaExceededError');return original.call(this,k,v);};},{raw,key});
  await page.goto(url);await page.locator('#save-status').waitFor();assert.equal(await settled(page),raw);
  await page.locator('[data-action="feature-answer"][data-id="cherry"]').click();assert.equal(await page.locator('#save-status').count(),1);assert.equal(await settled(page),raw);
  await page.evaluate(()=>window.testQuota=false);await page.locator('[data-action="save-help"]').click();await page.locator('[data-action="save-retry"]').click();await page.locator('#save-status').waitFor({state:'detached'});
  assert.notEqual(await settled(page),raw);report.storage.push({case:'quota failure on activity',persistentBanner:true,originalPreserved:true,retryClearsBanner:true});await context.close();
 }
 {
  const {context,page:a}=await fixture(JSON.stringify({...completed,screen:'home'}));const b=await context.newPage();await b.goto(url);await settled(b);
  await a.locator('[data-action="settings"]').click();await a.locator('[data-action="reset-prompt"]').click();
  await b.locator('[data-action="begin"]').click();const newest=await settled(b);
  await a.locator('#save-status').waitFor();await a.locator('[data-action="reset"]').click();assert.equal(await settled(a),newest);
  assert.match(await a.locator('#dialog').innerText(),/기록 보관과 복구/);
  report.storage.push({case:'second tab updates while reset confirmation is open',latestProgressPreserved:true,staleResetBlocked:true});await context.close();
 }
}catch(error){report.failure=error.stack;process.exitCode=1;}
await browser.close();
// This is a separate WebGL-capable session; disabled WebGL is not a model failure.
const glBrowser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [kind,activity] of [['leaf',0],['lab',4],['garden',6],['bag',8]]){
 const context=await glBrowser.newContext({viewport:{width:1180,height:820}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.addInitScript(({s,key,activity})=>localStorage.setItem(key,JSON.stringify({...s,screen:'activity',page:activity})),{s:completed,key,activity});
 try{
  await page.goto(url);const support=await page.evaluate(()=>{const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2');if(!gl)return null;const ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);});
  if(!support){report.webgl.push({kind,supported:false,verified:false});continue;}
  const host=page.locator(`[data-spatial="${kind}"]`);await page.locator(`[data-spatial="${kind}"].spatial-ready canvas`).waitFor({state:'attached'});
  if(kind==='bag')await host.locator('[data-view="flat"]').click();
  await page.waitForTimeout(1800);assert.notEqual(await host.getAttribute('data-spatial-unavailable'),'true');
  const box=await host.locator('canvas').boundingBox();assert.ok(box.width>100&&box.height>80);
  await host.locator('[data-view="rotate"]').click();await host.locator('[data-view="zoom"]').click();
  await page.screenshot({path:fileURLToPath(new URL('webgl-'+kind+'.png',output)),fullPage:true});
  await host.locator('[data-view="flat"]').click();assert.match(await host.getAttribute('class'),/spatial-flat/);
  report.webgl.push({kind,supported:true,renderer:support,canvas:box,rotateAndZoom:true,pictureToggle:true});
 }catch(error){report.webgl.push({kind,error:error.message});process.exitCode=1;}
 await context.close();
}
await glBrowser.close();report.finished=new Date().toISOString();await writeFile(new URL('runtime.json',output),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
