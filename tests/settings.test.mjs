import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {APP_VERSION,CREDIT_LINE,TEXT,STANDARDS,STANDARDS_DISCLAIMER,standardsSection,appInfoSection,studentSection,teacherSection,noticeSection} from '../src/settings-content.js';
import {ASSETS,THUMBS,assetImage} from '../src/asset-catalog.js';
const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8');

test('앱 정보 버전은 package.json과 같고 서명 형식을 지킨다',()=>{
 assert.equal(APP_VERSION,JSON.parse(read('package.json')).version);
 assert.equal(CREDIT_LINE,`초록정원 연구기지 v${APP_VERSION} · 기획·제작: 옐샘 & 아이스크림미디어`);
 assert.ok(appInfoSection().includes(CREDIT_LINE));
});
test('성취기준은 원문 그대로이고 비어 있으면 접힘 자체가 없다',()=>{
 assert.deepEqual(STANDARDS,[
  ['4과03-01','여러 가지 식물을 관찰하여 특징에 따라 식물을 분류할 수 있다.'],
  ['4과03-02','다양한 환경에 서식하는 식물을 조사하여 식물의 생김새와 생활 방식이 환경과 관련되어 있음을 설명할 수 있다.'],
  ['4과03-03','식물의 특징을 이용하여 일상생활에서 활용할 수 있는 생활용품을 설계하여 협력적으로 소통할 수 있다.'],
 ]);
 assert.equal(standardsSection([]),'');
 const html=standardsSection();
 assert.ok(html.includes(STANDARDS_DISCLAIMER));
 for(const [code,text] of STANDARDS)assert.ok(html.includes(`[${code}]</strong> ${text}`));
 assert.ok(teacherSection('').includes('data-key="standards"'));
});
test('교사용 도구는 확인 코드 없이 버튼 하나로 전체를 한 번에 연다',()=>{
 const app=read('src/app.js');
 assert.ok(!/teacher-code|teacher-open|TEACHER_CODE|admin-page/.test(app));
 assert.match(app,/case 'admin-unlock':state\.adminUnlocked=!state\.adminUnlocked;/);
 assert.match(TEXT.unlock,/한 번에/);
});
test('설정 문구: 저장 정책·저작권 단락이 있고 학년·링크·메일이 없다',()=>{
 const all=[appInfoSection(),studentSection(),teacherSection(''),noticeSection(),...Object.values(TEXT)].join('\n');
 assert.ok(all.includes('활동 기록은 서버로 보내지 않고 이 브라우저에만 저장돼요.'));
 for(const line of ['ⓒ 2026 옐샘 & 아이스크림미디어. All rights reserved.','앱 화면 캡처·자체 제작 일러스트·자체 제작 음원은 무단 복제·재배포·전용·상업적 이용을 금지해요.','Three.js(MIT)·글꼴(Jua, Pretendard — SIL OFL 1.1)과 참고 자료의 저작권은 각 원저작자와 소장 기관에 있으며, 각 자료의 이용 조건을 따라요.','캐릭터·배경·장식은 프로젝트 자체 AI 생성 이미지예요.'])assert.ok(all.includes(line),line);
 assert.doesNotMatch(all,/<a\s|https?:|mailto:|@[a-z0-9-]+\.[a-z]/i);
 assert.doesNotMatch(all+read('src/app.js'),/\d학년/);
 assert.doesNotMatch(all,/<details[^>]*\sopen/);
});
test('aria-disabled 클릭은 data-action보다 먼저 막고 이유를 토스트로 띄운다',()=>{
 const app=read('src/app.js'),handler=app.slice(app.indexOf("document.addEventListener('click'"));
 const guard=handler.indexOf('[aria-disabled="true"]'),dispatch=handler.indexOf("closest('[data-action]')");
 assert.ok(guard>0&&guard<dispatch);
 assert.match(handler,/if\(locked\.dataset\.reason\)toast\(locked\.dataset\.reason\);return;/);
 assert.match(handler,/if\(!b\|\|b\.disabled\)return;/);
});
test('썸네일은 작은 칸에서만 쓰고 미사용 그림은 카탈로그에 없다',()=>{
 for(const key of THUMBS){assert.ok(ASSETS[key]);assert.match(assetImage(key,'',false,true),new RegExp(`${key}_thumb\\.webp`));}
 assert.doesNotMatch(assetImage('reward_garden'),/_thumb/);
 assert.match(assetImage('reward_garden','',true),/loading="eager"/);
 for(const key of ['map_island','research_bag_flap','aloe_leaf_whole'])assert.equal(ASSETS[key],undefined);
});
test('서비스워커는 버전 상수와 오래된 캐시 정리를 갖고 앱은 file:에서 등록하지 않는다',()=>{
 const sw=read('sw.js');
 assert.match(sw,/const CACHE_VERSION='[^']+';/);
 assert.match(sw,/skipWaiting\(\)/);assert.match(sw,/clients\.claim\(\)/);
 const manifest=JSON.parse(read('manifest.webmanifest'));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.orientation,'landscape');
 assert.deepEqual(manifest.icons.map(i=>i.sizes),['192x192','512x512']);
 assert.match(read('src/app.js'),/'serviceWorker' in navigator&&location\.protocol!=='file:'/);
});
