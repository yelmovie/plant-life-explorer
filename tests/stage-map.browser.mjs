// Isolated browser profiles only. Run against a local development server.
// PLAYWRIGHT_MODULE_PATH and BROWSER_EXECUTABLE may point at existing installations.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true});
const page=await context.newPage(),errors=[],checks=[],layouts=[];
page.on('pageerror',e=>errors.push(e.message));
const output=new URL('../docs/reviews/stage-map-20261019/',import.meta.url);
await mkdir(output,{recursive:true});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2')));
const close=()=>page.locator('#dialog [data-action="close"]').first().click();
const waitFrames=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
// Tap the place's name tag: in teacher preview the note can overlap the top-right building art.
const enter=async i=>{await page.locator(`.world-node[data-id="${i}"] .world-label`).click();await page.locator('#dialog [data-action="enter-mission"]').waitFor();await page.locator('#dialog [data-action="enter-mission"]').click();};
// The map is reached from Settings on every screen (home has no direct map button any more).
const openMap=async()=>{await page.getByRole('button',{name:'설정',exact:true}).click();await page.locator('[data-action="settings-map"]').evaluate(b=>b.click());await page.locator('.stage-map').waitFor();};
// Mission 5 opens on its field mission: leave a first guess if asked, then tap a numbered bag place by hand.
const touchBag=async()=>{const guess=page.locator('[data-action="field-bag-predict"]').first();if(await guess.count())await guess.click();const dial=page.locator('[data-bag-dial]').first();await dial.waitFor();const before=await dial.getAttribute('data-value');await dial.tap();await page.waitForFunction(b=>document.querySelector('[data-bag-dial]').dataset.value!==b,before);};
const enablePreview=async()=>{await page.getByRole('button',{name:'설정',exact:true}).click();await page.locator('details[data-key="teacher"]>summary').click();await page.locator('details[data-key="tools"]>summary').click();await page.locator('[data-action="admin-unlock"]').click();await close();};
try{
  await page.goto(process.env.STAGE_MAP_URL||'http://127.0.0.1:4318');
  await openMap();
  await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
  await page.locator('.world-node[data-id="4"]').tap({force:true});
  assert.match(await page.locator('#dialog').innerText(),/먼저 표본 온실/);
  const pausedPosition=await page.locator('.map-walker').getAttribute('style');
  await page.keyboard.press('ArrowRight');await waitFrames();
  assert.equal(await page.locator('.map-walker').getAttribute('style'),pausedPosition);
  await page.locator('#dialog [data-action="map-locked-next"]').click();
  await page.locator('#dialog [data-action="enter-mission"]').waitFor();
  assert.equal(await page.locator('#dialog h2').innerText(),'표본 온실');
  await page.locator('#dialog [data-action="enter-mission"]').click();
  // Entering a mission now opens its field mission first.
  assert.equal(await page.locator('main h1').innerText(),'리피의 뒤섞인 잎 서랍');
  assert.equal(await page.locator('[data-action="journey-mode"][data-id="field"]').getAttribute('aria-pressed'),'true');
  checks.push('잠긴 건물 터치 → 선행 탐구 안내 → 길 이동 → 현장 임무로 정상 입장, 팝업 동안 지도 키 차단');

  // Supply observed evidence (field mission + activity records) in this test profile; completion still uses real UI buttons.
  await page.evaluate(async()=>{
    const {freshState,PLANTS,recordFeature}=await import('/src/model.js');
    const {applyFieldAction,FIELD_LEAVES}=await import('/src/field-missions-state.js');
    const s=freshState();s.screen='activity';s.page=0;s.journeyRequired[0]=true;
    for(const p of FIELD_LEAVES){for(const k of ['shape','edge'])applyFieldAction(s,{},'field-scan',`${p.id}:${k}`);for(const r of ['edge','narrow'])applyFieldAction(s,{},'field-sort',`${r}:${p.id}:${p[r]?'yes':'no'}`);}
    for(const p of PLANTS){recordFeature(s,p.id,'shape',p.id);recordFeature(s,p.id,'edge',p.edge?'yes':'no');}
    for(const rule of ['edge','narrow']){s.groupsByRule[rule]=Object.fromEntries(PLANTS.map(p=>[p.id,p[rule]?'yes':'no']));s.classificationEvidence[rule]='cherry';}
    s.groups={...s.groupsByRule.edge};localStorage.setItem('green-garden-mvp-v2',JSON.stringify(s));
  });
  await page.reload();
  assert.equal(await page.locator('main h1').innerText(),'잎을 살펴봐요');
  await page.locator('[data-action="complete"]').click();
  assert.equal(await page.locator('main h1').innerText(),'잎을 나누어 봐요');
  await page.locator('[data-action="complete"]').click();
  await page.locator('#dialog [data-action="reward-map"]').click();
  await page.locator('.stage-map .world-node.restored').waitFor();
  assert.equal(await page.locator('.world-node.restored').count(),1);
  assert.equal(await page.locator('.world-node[aria-current="step"]').getAttribute('data-id'),'1');
  await page.reload();
  assert.equal(await page.locator('.world-node.restored').count(),1);
  assert.equal(await page.locator('.world-node[data-id="1"]').getAttribute('aria-disabled'),null);
  await enter(1);
  assert.equal(await page.locator('main h1').innerText(),'사라진 봄을 찾아서');
  await openMap();
  const student=await saved();
  checks.push('현장 임무 완료 기록 → 두 활동 완료 버튼 → 빛씨앗 1개 → 다음 단계 해금 → 새로고침 보존 → 다음 미션(현장 임무) 입장');

  await enablePreview();
  assert.equal(await page.locator('.world-node[aria-disabled="true"]').count(),0);
  assert.ok(await page.locator('.world-label').evaluateAll(labels=>labels.every(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit&&el.contains(hit);})), '미리보기 안내가 이름표를 가리면 안 된다');
  await enter(4);
  await touchBag();
  assert.deepEqual(await saved(),student);
  await page.getByRole('button',{name:'설정',exact:true}).click();
  // Teacher preview no longer opens the ending for an unfinished student; it stays locked.
  assert.equal(await page.locator('[data-action="view-ending"]').getAttribute('aria-disabled'),'true');
  await close();
  await openMap();
  await page.getByRole('button',{name:'미리보기 종료',exact:true}).click();
  assert.deepEqual(await saved(),student);
  assert.equal(await page.locator('.world-node[aria-disabled="true"]').count(),3);
  await enablePreview();await enter(4);
  await touchBag();
  await page.reload();
  assert.deepEqual(await saved(),student);
  assert.equal(await page.locator('.map-preview-note').count(),0);
  checks.push('비밀번호 없는 전체 해금 → 마지막 미션(현장 임무) 손 조작·미완료 엔딩 잠김 → 종료·새로고침 후 학생 저장본 동일');

  const actor=page.locator('.map-walker');
  const before=await actor.getAttribute('style');
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(before=>document.querySelector('.map-walker').getAttribute('style')!==before,before);
  await page.keyboard.up('ArrowRight');
  await page.getByRole('button',{name:'설정',exact:true}).click();
  const frozen=await actor.getAttribute('style');await page.keyboard.press('d');await waitFrames();
  assert.equal(await actor.getAttribute('style'),frozen);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#dialog').evaluate(d=>d.open),false);
  const direction=page.getByRole('button',{name:'오른쪽으로 이동',exact:true});
  await direction.hover();await page.mouse.down();await direction.dispatchEvent('pointercancel');await page.mouse.up();
  const released=await actor.getAttribute('style');await waitFrames();assert.equal(await actor.getAttribute('style'),released);
  assert.equal(await page.locator('.map-direction.pressed').count(),0);
  checks.push('방향키 이동·설정 입력 차단·Escape·방향판 pointercancel 후 이동 정지');

  // A finished student: ending → back to the map shows every place restored and keeps the finish.
  await page.evaluate(async()=>{
    const {freshState,testDesign}=await import('/src/model.js');
    const s=freshState();s.completed.fill(true);s.finalChecks={classification:true,habitat:true,garden:true,invention:true};s.finished=true;s.screen='ending';
    s.terrain=['water','grass','dry','water','grass','dry','water','grass','dry',...Array(15).fill('empty')];s.garden={hyacinth:0,cherry:1,aloe:2};s.gardenReasons=['hyacinth','cherry','aloe'];s.gardenReviewed=true;s.sharing.status='later';
    s.design={surface:'lotus',cover:'flap',linked:true,observed:true};s.tests=[{surface:'plain',cover:'open'},{surface:'lotus',cover:'open'},s.design].map(testDesign);
    s.inventionExplanations={surface:{before:'plain:open',key:'lotus:open',part:'surface'},cover:{before:'lotus:open',key:'lotus:flap',part:'cover'}};s.testExplanation={...s.inventionExplanations.cover};
    localStorage.setItem('green-garden-mvp-v2',JSON.stringify(s));
  });
  await page.reload();
  assert.equal(await page.locator('body').getAttribute('data-screen'),'ending');
  await page.locator('.ending [data-action="map"]').click();
  await page.locator('.stage-map').waitFor();
  assert.equal(await page.locator('.world-node.restored').count(),5);
  assert.equal(await page.locator('.world-node.locked').count(),0);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2')).screen==='map');
  assert.equal((await saved()).finished,true);
  checks.push('완료 기록 → 엔딩 → 정원으로 돌아가기 → 다섯 장소 모두 복구된 지도, 완료 기록 유지');

  // Deleting the record from Settings returns the map to its first state.
  await page.getByRole('button',{name:'설정',exact:true}).click();
  await page.locator('#dialog [data-action="reset-prompt"]').click();
  await page.locator('#dialog [data-action="reset"]').click();
  await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('green-garden-mvp-v2'));return s.screen==='home'&&!s.finished&&s.completed.every(c=>!c);});
  await openMap();
  assert.equal(await page.locator('.world-node.restored').count(),0);
  assert.deepEqual(await page.locator('.world-node.available').evaluateAll(n=>n.map(x=>x.dataset.id)),['0']);
  assert.equal(await page.locator('.world-node.locked[aria-disabled="true"]').count(),4);
  checks.push('설정에서 기록 삭제 → 지도 초기 상태(복구 0, 첫 장소만 열림·나머지 자물쇠)');

  // A fresh profile avoids previous camera position or progress affecting layout checks.
  await context.clearCookies();
  await page.evaluate(()=>localStorage.removeItem('green-garden-mvp-v2'));await page.reload();
  await openMap();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await Promise.all(document.querySelector('main').getAnimations().map(a=>a.finished.catch(()=>{})));});
  for(const [width,height] of [[1024,768],[1180,820],[1280,800],[768,1024],[820,1180]]){
    await page.setViewportSize({width,height});await waitFrames();
    // The map camera follows Leafy, so far place tags can sit past the edge. Every on-screen target must be uncovered and whole controls at least 44px;
    // and the overview button must bring all five places on screen.
    const measure=()=>page.evaluate(()=>{
      const targets=[...document.querySelectorAll('.world-label,.map-direction,.map-next-card>.btn')];
      const controls=targets.map(el=>{const r=el.getBoundingClientRect(),x=Math.max(r.x,0),y=Math.max(r.y,64),w=Math.min(r.right,innerWidth)-x,h=Math.min(r.bottom,innerHeight)-y,hit=w>0&&h>0&&document.elementFromPoint(x+w/2,y+h/2);return {name:el.textContent.trim(),label:el.classList.contains('world-label'),width:Math.round(w),height:Math.round(h),whole:w===r.width&&h===r.height,offscreen:w<=0||h<=0,uncovered:!!hit&&(el.contains(hit)||hit===el)};});
      return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,controls};
    });
    const layout=await measure();
    assert.equal(layout.overflow,false,JSON.stringify(layout));
    assert.ok(layout.controls.every(c=>c.label?c.offscreen||(c.uncovered&&(!c.whole||c.width>=44&&c.height>=44)):c.whole&&c.uncovered&&c.width>=44&&c.height>=44),JSON.stringify(layout));
    await page.locator('[data-action="map-overview"]').click();await waitFrames();
    const overview=await measure();
    assert.ok(overview.controls.filter(c=>c.label).every(c=>c.whole&&c.uncovered&&c.height>=44),JSON.stringify(overview));
    await page.locator('[data-action="map-overview"]').click();await waitFrames();
    layouts.push({...layout,overview:overview.controls.filter(c=>c.label)});
    if(width===1280||width===768)await page.screenshot({path:fileURLToPath(new URL(`map-${width}.png`,output))});
  }
  checks.push('태블릿 대표 크기 5종: 가로 넘침 없음, 화면 안 대상 가림 없음·터치 영역 최소 44px, 한눈에 보기에서 다섯 장소 모두 화면 안');
  const beforeFailure=await saved();
  await page.route('**/assets/generated/map_trail_v2.webp',route=>route.abort());await page.reload();
  await page.locator('.map-load-error').waitFor();assert.deepEqual(await saved(),beforeFailure);
  await page.unroute('**/assets/generated/map_trail_v2.webp');
  await page.locator('[data-action="map-retry"]').click();
  await page.locator('.island-ground').evaluate(i=>i.decode());assert.deepEqual(await saved(),beforeFailure);
  assert.equal(await page.locator('.map-load-error').count(),0);
  checks.push('지도 이미지 로딩 실패 → 다시 불러오기 → 학습 기록 보존');
  assert.deepEqual(errors,[]);
  await writeFile(new URL('results.json',output),JSON.stringify({date:'2026-10-19',checks,layouts,errors,inputs:'Chromium 자동화: 마우스·키보드·터치 에뮬레이션·합성 pointercancel. 실제 기기 터치는 미검증.'},null,2));
  console.log(JSON.stringify({checks,viewports:layouts.length,errors}));
}finally{await browser.close();}
