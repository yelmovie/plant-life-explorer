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
const a=async(name,id,scope='')=>{await page.locator(scope+selector(name,id)).first().tap();};
const close=()=>a('close',undefined,'#dialog .dialog-top ');
const stage=n=>a('field-stage',String(n),'.today-panel .mission-journey ');
const place=async(item,target,keyboard=false)=>{
 const source=page.locator(`[data-field-item="${item}"]`),destination=page.locator(`[data-field-drop="${target}"]`);
 if(keyboard){await source.focus();await page.keyboard.press('Enter');await destination.focus();await page.keyboard.press('Enter');}
 else{await source.tap();await destination.tap();}
};
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
 for(const p of ['maple','pine','camellia'])for(const region of ['shape','edge'])await place('lens',`scan:${p}:${region}`,p==='pine');
 await stage(1);await place('leaf:maple','sort:edge:no');await hint();
 for(const p of ['maple','pine','camellia'])await place('leaf:'+p,'sort:edge:'+(p==='pine'?'no':'yes'));
 await stage(2);for(const p of ['maple','pine','camellia'])await place('leaf:'+p,'sort:narrow:'+(p==='pine'?'yes':'no'));
 await explore();
 await a('feature-answer','ginkgo');await a('region','shape');await a('feature-answer','cherry');await a('feature-answer','yes');
 const next=page.getByRole('button',{name:'은행나무 관찰하기',exact:true});await next.tap();
 await a('feature-answer','ginkgo');await a('feature-answer','no');await page.getByRole('button',{name:'강아지풀 관찰하기',exact:true}).tap();
 await a('feature-answer','grass');await a('feature-answer','no');
 await snap('leaves-recorded');await completePage();
 for(const rule of ['edge','narrow']){
  await a('rule',rule);
  for(const p of ['cherry','ginkgo','grass']){await a('select-plant',p);await a('assign-group',(rule==='edge'?p==='cherry':p==='grass')?'yes':'no');}
  await a('check-rule');await a('classification-proof',rule==='edge'?'cherry:edge':'grass:shape');
 }
 await completePage();await missionDone(0);

 await enter(1);await a('field-season-predict','tree:none');await a('field-season-predict','herb:none');
 await place('season:tree','link:tree:leaf');await hint();await place('season:tree','link:tree:trunk');await place('season:herb','link:herb:root');
 for(const [n,kind] of [[1,'tree'],[2,'herb']]){
  await stage(n);assert.doesNotMatch(await page.locator('.field-frame-tray').innerText(),/겨울 ·|초봄 ·|다음 봄 ·/);
  for(const [i,phase] of ['winter','bud','spring'].entries())await place(`frame:${kind}:${phase}`,`order:${kind}:${i}`);
  await a('field-season-clue',kind+':'+(kind==='tree'?'branches':'rootbud'));
 }
 await explore();assert.equal((await saved()).seasonPrediction.cherry,'none');
 for(const plant of ['cherry','sowthistle']){await a('season-plant',plant);await a('season','3');if(await page.getByRole('button',{name:/땅속 닫기/}).count()===0)await a('underground');await a('record-season');await a('season','0');await a('record-season');}
 await completePage();
 for(const plant of ['cherry','sowthistle']){await a('season-plant',plant);await a('season-evidence','3');await a('season-evidence','0');await a('season-explain','growth');}
 await completePage();await missionDone(1);

 await enter(2);await place('model:air','predict:sink');await place('model:solid','predict:float');await stage(1);
 for(const model of ['air','solid'])await place('model:'+model,'tank');await stage(2);
 await place('model:air','observe:sink');await hint();await place('model:air','observe:float');await place('model:solid','observe:sink');await place('reason:air-space','reason:air');
 await explore();await a('experiment-predict','none');await a('lab-next','cut');await a('lab-next','water');await a('press-petiole',undefined,'.center ');await a('experiment-answer','air');
 await completePage();
 for(const [p,habitat] of [['hyacinth','water'],['aloe','dry'],['cherry','grass']]){await a('select-plant',p);await a('habitat',habitat);await a('habitat-feature',p);await a('habitat-answer',p);}
 await completePage();await missionDone(2);

 await enter(3);await place('environment:dry','environment:pond');await hint();
 for(const [env,zone] of [['water','pond'],['grass','meadow'],['dry','ridge']])await place('environment:'+env,'environment:'+zone);
 await stage(1);await place('plant:hyacinth','plant:ridge');
 for(const [plant,zone] of [['hyacinth','pond'],['cherry','meadow'],['aloe','ridge']])await place('plant:'+plant,'plant:'+zone);
 await stage(2);await a('field-garden-rain');await explore();
 for(const [brush,cells] of [['water',[0,1,6]],['grass',[2,3,8]],['dry',[4,5,10]]]){await a('brush',brush);for(const cell of cells)await a('garden-cell',String(cell));}
 await a('garden-ready');for(const [plant,cell] of [['hyacinth',0],['cherry',2],['aloe',4]]){await a('select-plant',plant);await a('garden-cell',String(cell));}
 await snap('garden-designed');await completePage();
 for(const plant of ['hyacinth','cherry','aloe']){await a('select-plant',plant);await a('garden-answer',plant);}
 await completePage();await missionDone(3);

 await enter(4);await a('field-bag-predict','surface');
 for(const [part,value] of [['surface','lotus'],['cover','flap'],['pocket','open']])await place(`part:${part}:${value}`,'part:'+part);
 await stage(1);await a('field-bag-test');await snap('pocket-open-test');
 const openArt=await page.locator('.field-bag-assembly .bag-art').getAttribute('aria-label');
 await place('part:pocket:flap','part:pocket');await a('field-bag-test');await snap('pocket-closed-test');
 const closedArt=await page.locator('.field-bag-assembly .bag-art').getAttribute('aria-label');assert.notEqual(openArt,closedArt);
 const trials=(await saved()).fieldEvidence.bag.tests;assert.equal(trials[0].pocketDry,false);assert.equal(trials[1].pocketDry,true);assert.equal(trials[0].notebookDry,trials[1].notebookDry);
 await stage(2);await place('compare:surface','compare');await hint();await place('compare:pocket','compare');await a('field-bag-deliver');
 assert.match(await page.locator('.mission-feedback').innerText(),/주머니/);
 report.checks.push('Pocket-only comparison changes picture, accessible description and wet result; notebook result stays fixed');
 await explore();assert.equal((await saved()).testPrediction,'surface');
 await a('lotus-drop');await a('design-answer','roll');await completePage();
 // Reuse the inherited final design: just two new trials establish both roles.
 await a('cover','open');await a('run-test',undefined,'.test-control-row ');await page.waitForFunction(()=>!document.querySelector('.water-demo.moving'));await a('test-explain','cover');
 await a('surface','plain');await a('run-test',undefined,'.test-control-row ');await page.waitForFunction(()=>!document.querySelector('.water-demo.moving'));await a('test-explain','surface');
 await a('surface','lotus');await a('cover','flap');await a('use-tested-design');assert.equal((await saved()).tests.length,3);
 report.checks.push('Inherited bag trial plus two new single-part comparisons; final tested design reused without repeat rain');
 await snap('invention-compared');await completePage();await missionDone(4);
 await a('report');await a('note-open','4');await a('note-sticker');await a('note-check','4:0');await a('note-check','4:1');await close();
 await a('note-open','4');assert.equal(await page.locator('[data-action="note-sticker"]').getAttribute('aria-pressed'),'true');assert.match(await page.locator('.note-quiz-feedback').innerText(),/맞아/);await snap('notebook-records');await close();
 const before=await saved();await page.reload();assert.deepEqual(await saved(),before);await a('note-open','4');assert.equal(await page.locator('.note-read-sticker.stuck').count(),1);await close();
 await a('report-tab','share');await a('share-later');await a('start-final');await a('final-habitat','water');await a('final-habitat','dry');await a('power-core');await page.locator('[data-story-action="exit"]').tap();
 assert.equal((await saved()).finished,true);await snap('ending');
 await a('home');await a('begin');await a('report');await a('note-open','4');assert.equal(await page.locator('.note-read-sticker.stuck').count(),1);await close();
 report.checks.push('Fresh completion: 5 field missions, 10 core activities, new plant application, ending and research notebook; home/re-entry retains notebook');
 report.finalState=await saved();
 await writeFile(new URL('completed-test-record.json',output),JSON.stringify(report.finalState,null,2));
 assert.deepEqual(report.errors,[]);
}catch(error){report.failure=error.stack;process.exitCode=1;try{await snap('failure');report.failureState=await saved();report.failureText=(await page.locator('body').innerText()).slice(-5000);}catch{}}
finally{report.finished=new Date().toISOString();await writeFile(new URL('journey.json',output),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({missions:report.missions.length,checks:report.checks,errors:report.errors,failure:report.failure}));
