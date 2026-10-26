// Independent headless profiles. Core evidence fixtures are QA data, not student completion.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'],executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage();page.setDefaultTimeout(8000);
const output=new URL('../docs/reviews/expedition-20261020/',import.meta.url);await mkdir(output,{recursive:true});
const report={checks:[],errors:[],fixture:'Core evidence only is prepared in an isolated profile; complete/reward/map/tools use real UI.'};
page.on('pageerror',e=>report.errors.push(e.message));
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2')));
const screenshot=async name=>page.screenshot({path:fileURLToPath(new URL(name+'.png',output)),timeout:20000});
const close=()=>page.locator('#dialog [data-action="close"]').first().click();
try{
 await page.goto(process.env.EXPEDITION_URL||'http://127.0.0.1:4328');
 await page.waitForFunction(()=>document.querySelector('.hero-art')?.naturalWidth>0);
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(600);
 report.load=await page.evaluate(()=>({navigation:performance.getEntriesByType('navigation').map(n=>({load:n.loadEventEnd,dom:n.domContentLoadedEventEnd})),paint:performance.getEntriesByType('paint').map(n=>({name:n.name,time:n.startTime})),resources:performance.getEntriesByType('resource').map(n=>({url:n.name,transfer:n.transferSize,duration:n.duration}))}));
 await screenshot('home');
 await page.locator('[data-action="begin"]').click();await page.locator('[data-action="intro-start"]').click();
 await page.locator('[data-action="map-overview"]').click();await page.waitForTimeout(500);
 await page.locator('.world-node[data-id="2"] .world-label').click({force:true});assert.match(await page.locator('#dialog').innerText(),/먼저 표본 온실/);
 const frozen=await page.locator('.map-walker').getAttribute('style');await page.keyboard.press('ArrowRight');
 assert.equal(await page.locator('.map-walker').getAttribute('style'),frozen);await close();
 await screenshot('map');report.checks.push('Home story, actual path map, locked destination explanation, modal movement blocking');
 await page.locator('.map-next-card [data-action="map-select"]').click();await page.locator('#dialog [data-action="enter-mission"]').click();
 assert.equal(await page.locator('.field-mission').count(),1);
 await page.locator('.learning-footer .primary').click({force:true});assert.equal(await page.locator('.field-mission').count(),1);
 report.checks.push('Empty field cannot advance with the main button');
 await page.evaluate(async()=>{
  const {freshState,PLANTS,recordFeature}=await import('/src/model.js');const {fieldMissionAction}=await import('/src/field-missions.js');const s=freshState(),u={};s.screen='activity';s.page=0;s.journeyRequired[0]=true;
  for(const id of ['maple','pine','camellia'])for(const part of ['shape','edge'])fieldMissionAction(s,u,'field-place',`lens|scan:${id}:${part}`);
  for(const rule of ['edge','narrow'])for(const id of ['maple','pine','camellia'])fieldMissionAction(s,u,'field-place',`leaf:${id}|sort:${rule}:${(rule==='edge'?id!=='pine':id==='pine')?'yes':'no'}`);
  for(const p of PLANTS){recordFeature(s,p.id,'shape',p.id);recordFeature(s,p.id,'edge',p.edge?'yes':'no');}
  for(const rule of ['edge','narrow']){s.groupsByRule[rule]=Object.fromEntries(PLANTS.map(p=>[p.id,p[rule]?'yes':'no']));s.classificationEvidence[rule]='cherry';}s.groups={...s.groupsByRule.edge};localStorage.setItem('green-garden-mvp-v2',JSON.stringify(s));
 });
 await page.reload();await page.locator('[data-action="complete"]').click();assert.equal((await saved()).page,1);
 await page.locator('[data-action="complete"]').click();assert.match(await page.locator('#dialog').innerText(),/관찰 렌즈 획득/);
 await page.locator('.reward-building').evaluate(img=>img.decode());
 await screenshot('reward');assert.deepEqual((await saved()).completed,[true,true,false,false,false,false,false,false,false,false]);
 await page.locator('[data-action="reward-map"]').click();assert.equal(await page.locator('.world-node.restored').count(),1);
 // The tool pack lives on the mission screen (the map keeps only navigation).
 await page.locator('.map-next-card [data-action="map-select"]').click();await page.locator('#dialog [data-action="enter-mission"]').click();
 await page.locator('[data-action="tool-pack"]').click();assert.equal(await page.locator('.expedition-tool.earned').count(),1);
 await page.locator('[data-action="expedition-use"][data-id="0"]').click();assert.match(await page.locator('#dialog').innerText(),/땅속/);await close();
 await page.locator('[data-action="map"]').first().click();
 await page.reload();assert.equal(await page.locator('.world-node.restored').count(),1);report.checks.push('Two core completion buttons award exactly one seed/tool; restored place, next unlock, usable tool clue and reload persist');
 const student=await saved();
 await page.getByRole('button',{name:'설정',exact:true}).click();await page.locator('details[data-key="teacher"]>summary').click();await page.locator('details[data-key="tools"]>summary').click();await page.locator('[data-action="admin-unlock"]').click();await close();
 await page.locator('[data-action="map-overview"]').click();await page.waitForTimeout(500);
 await page.locator('.world-node[data-id="4"] .world-label').click();await page.locator('#dialog [data-action="enter-mission"]').click();
 await page.locator('[data-action="field-bag-predict"]').first().click();
 assert.deepEqual(await saved(),student);await page.reload();assert.deepEqual(await saved(),student);assert.equal(await page.locator('.map-preview-note').count(),0);
 report.checks.push('Teacher preview manipulation and reload do not alter the saved student record');
 await page.evaluate(async()=>{const{freshState}=await import('/src/model.js');const{fieldMissionAction}=await import('/src/field-missions.js');const s=freshState(),u={};s.version=1;s.completed=[true,true,true,true,false,false,false,false,false,false];s.screen='activity';s.page=4;
  // Finish the float field mission through its own actions so the record stage opens.
  for(const step of ['model:air|predict:float','model:solid|predict:sink','model:air|tank','model:solid|tank','model:air|observe:float','model:solid|observe:sink','reason:air-space|reason:air'])fieldMissionAction(s,u,'field-place',step);
  localStorage.setItem('green-garden-mvp-v2',JSON.stringify(s));});
 await page.reload();await page.locator('[data-action="journey-mode"][data-id="explore"]').first().click();await page.locator('[data-spatial="lab"] canvas').waitFor();await screenshot('lab-whole');
 await page.locator('[data-action="experiment-predict"][data-id="none"]').click();await page.locator('[data-action="lab-next"][data-id="cut"]').click();await page.locator('[data-spatial="lab"] canvas').waitFor();await screenshot('lab-cut');
 await page.locator('[data-action="lab-next"][data-id="water"]').click();await page.locator('.center [data-action="press-petiole"]').click();assert.equal((await saved()).experiment.step,4);
 await page.locator('[data-action="experiment-answer"][data-id="air"]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2')).experimentAnswer==='air',null,{timeout:4000}).catch(()=>{});assert.equal((await saved()).experimentAnswer,'air');report.checks.push('Volumetric petiole: incorrect prediction is accepted; cut, submerge, press and interpret air bubbles');
 assert.deepEqual(report.errors,[]);
}catch(error){report.failure=error.stack;process.exitCode=1;}
finally{await writeFile(new URL('core-browser.json',output),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({checks:report.checks,errors:report.errors,failure:report.failure,load:report.load&&{requests:report.load.resources.length,bytes:report.load.resources.reduce((n,r)=>n+r.transfer,0),paint:report.load.paint,navigation:report.load.navigation}}));
