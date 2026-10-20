// Isolated browser profiles only. Run against a local development server.
// PLAYWRIGHT_MODULE_PATH and BROWSER_EXECUTABLE may point at existing installations.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true});
const page=await context.newPage(),errors=[],checks=[],layouts=[];
page.on('pageerror',e=>errors.push(e.message));
const output=new URL('../docs/reviews/stage-map-20261019/',import.meta.url);
await mkdir(output,{recursive:true});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('green-garden-mvp-v2')));
const close=()=>page.locator('#dialog [data-action="close"]').first().click();
const waitFrames=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const enter=async i=>{await page.locator(`.world-node[data-id="${i}"]`).click();await page.locator('#dialog [data-action="enter-mission"]').waitFor();await page.locator('#dialog [data-action="enter-mission"]').click();};
const enablePreview=async()=>{await page.getByRole('button',{name:'설정',exact:true}).click();await page.locator('details[data-key="teacher"]>summary').click();await page.locator('details[data-key="tools"]>summary').click();await page.locator('[data-action="admin-unlock"]').click();await close();};
try{
  await page.goto(process.env.STAGE_MAP_URL||'http://127.0.0.1:4318');
  await page.getByRole('button',{name:'탐험 지도',exact:true}).click();
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
  assert.equal(await page.locator('main h1').innerText(),'잎을 살펴봐요');
  checks.push('잠긴 건물 터치 → 선행 탐구 안내 → 길 이동 → 정상 입장, 팝업 동안 지도 키 차단');

  // Supply observed evidence in this test profile; completion still uses real UI buttons.
  await page.evaluate(async()=>{
    const {freshState,PLANTS,recordFeature}=await import('/src/model.js');
    const s=freshState();s.screen='activity';s.page=0;
    for(const p of PLANTS){recordFeature(s,p.id,'shape',p.id);recordFeature(s,p.id,'edge',p.edge?'yes':'no');}
    for(const rule of ['edge','narrow']){s.groupsByRule[rule]=Object.fromEntries(PLANTS.map(p=>[p.id,p[rule]?'yes':'no']));s.classificationEvidence[rule]='cherry';}
    s.groups={...s.groupsByRule.edge};localStorage.setItem('green-garden-mvp-v2',JSON.stringify(s));
  });
  await page.reload();
  await page.locator('[data-action="complete"]').click();
  assert.equal(await page.locator('main h1').innerText(),'잎을 나누어 봐요');
  await page.locator('[data-action="complete"]').click();
  await page.locator('#dialog [data-action="reward-map"]').click();
  assert.equal(await page.locator('.world-node.restored').count(),1);
  assert.equal(await page.locator('.world-node[aria-current="step"]').getAttribute('data-id'),'1');
  await page.reload();
  assert.equal(await page.locator('.world-node.restored').count(),1);
  assert.equal(await page.locator('.world-node[data-id="1"]').getAttribute('aria-disabled'),null);
  await enter(1);
  assert.equal(await page.locator('main h1').innerText(),'계절을 바꿔 봐요');
  await page.getByRole('button',{name:'탐험 지도',exact:true}).click();
  const student=await saved();
  checks.push('두 활동 완료 버튼 → 빛씨앗 1개 → 다음 단계 해금 → 새로고침 보존 → 다음 미션 입장');

  await enablePreview();
  assert.equal(await page.locator('.world-node[aria-disabled="true"]').count(),0);
  assert.ok(await page.locator('.world-label').evaluateAll(labels=>labels.every(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit&&el.contains(hit);})), '미리보기 안내가 이름표를 가리면 안 된다');
  await enter(4);
  await page.locator('[data-action="surface"][data-id="lotus"]').click();
  await page.locator('[data-action="cover"][data-id="flap"]').click();
  assert.deepEqual(await saved(),student);
  await page.getByRole('button',{name:'설정',exact:true}).click();
  await page.locator('[data-action="view-ending"]').click();
  assert.equal(await page.locator('body').getAttribute('data-screen'),'ending');
  await page.getByRole('button',{name:'탐험 지도',exact:true}).click();
  await page.getByRole('button',{name:'미리보기 종료',exact:true}).click();
  assert.deepEqual(await saved(),student);
  assert.equal(await page.locator('.world-node[aria-disabled="true"]').count(),3);
  await enablePreview();await enter(4);
  await page.locator('[data-action="cover"][data-id="flap"]').click();
  await page.reload();
  assert.deepEqual(await saved(),student);
  assert.equal(await page.locator('.map-preview-note').count(),0);
  checks.push('비밀번호 없는 전체 해금 → 마지막 미션 조작·엔딩 미리보기 → 종료·새로고침 후 학생 저장본 동일');

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

  // A fresh profile avoids previous camera position or progress affecting layout checks.
  await context.clearCookies();
  await page.evaluate(()=>localStorage.removeItem('green-garden-mvp-v2'));await page.reload();
  await page.getByRole('button',{name:'탐험 지도',exact:true}).click();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await Promise.all(document.querySelector('main').getAnimations().map(a=>a.finished.catch(()=>{})));});
  for(const [width,height] of [[1024,768],[1180,820],[1280,800],[768,1024],[820,1180]]){
    await page.setViewportSize({width,height});await waitFrames();
    const layout=await page.evaluate(()=>{
      const targets=[...document.querySelectorAll('.world-label,.map-direction,.map-next-card>.btn')];
      const controls=targets.map(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {name:el.textContent.trim(),width:r.width,height:r.height,visible:r.x>=0&&r.right<=innerWidth&&r.y>=64&&r.bottom<=innerHeight,uncovered:!!hit&&(el.contains(hit)||hit===el)};});
      return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,controls};
    });
    assert.equal(layout.overflow,false,JSON.stringify(layout));assert.ok(layout.controls.every(c=>c.visible&&c.uncovered&&c.width>=44&&c.height>=44),JSON.stringify(layout));layouts.push(layout);
    if(width===1280||width===768)await page.screenshot({path:fileURLToPath(new URL(`map-${width}.png`,output))});
  }
  checks.push('태블릿 대표 크기 5종: 가로 넘침 없음, 주요 대상 가림 없음, 터치 영역 최소 44px');
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
