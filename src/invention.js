import {assetImage} from './asset-catalog.js';
import {bagArt} from './art.js';
import {designKey,testValid,comparisonPair,inventionEvidence,currentTrial} from './model.js';
const WAIT='aria-disabled="true" data-reason="비가 그친 뒤에 바꿀 수 있어."';
const button=(label,action,id='',selected=false,disabled=false)=>`<button class="btn ${selected?'selected':'soft'}" data-action="${action}" data-id="${id}" aria-pressed="${selected}" ${disabled?WAIT:''}>${label}</button>`;

export function inventionParts(s,disabled=false){
 return `<div class="picture-parts"><fieldset><legend>① 겉면에서 물방울 보내기</legend><div class="part-pair">${[['plain','보통 천','research_bag_body'],['lotus','연잎을 본뜬 겉면','bag_lotus_open']].map(([id,n,asset])=>`<button class="part-card ${s.design.surface===id?'selected':''}" data-action="surface" data-id="${id}" aria-pressed="${s.design.surface===id}" ${disabled?WAIT:''}>${assetImage(asset)}<strong>${n}</strong></button>`).join('')}</div></fieldset><fieldset><legend>② 입구로 들어오는 비 막기</legend><div class="part-pair">${[['open','열린 입구','research_bag_body'],['flap','덮개 있음','research_bag_closed']].map(([id,n,asset])=>`<button class="part-card ${s.design.cover===id?'selected':''}" data-action="cover" data-id="${id}" aria-pressed="${s.design.cover===id}" ${disabled?WAIT:''}>${assetImage(asset)}<strong>${n}</strong></button>`).join('')}</div></fieldset></div>`;
}

export function renderDesign(s,u={}){
 const seen=s.design.observed||s.design.linked;
 const observation=`<div class="surface-comparison ${u.lotusDrop?'drop-tested':''}"><div class="surface-sample cloth-sample">${assetImage('cloth_swatch')}<span>보통 천</span><i class="sample-drop"></i><span class="surface-outcome">${seen?'물기가 퍼져 남았어':'같은 물방울'}</span></div><div class="surface-sample leaf-sample">${assetImage('lotus_leaf_whole')}<span>연잎</span><i class="sample-drop"></i><span class="surface-outcome">${seen?'둥글게 맺혀 굴러갔어':'같은 물방울'}</span></div></div><div class="discovery-actions">${button('두 표면에 물방울 떨어뜨리기','lotus-drop')}${button(u.lotusMicro?'확대 접기':'표면의 비밀 확대','lotus-micro')}</div>${u.lotusMicro?`<div class="lotus-micro">${assetImage('lotus_surface_diagram')}<p>아주 작은 돌기와 왁스층 때문에 물이 잘 달라붙지 않아. 물방울이 둥글게 맺혀 굴러가.</p></div>`:''}${seen?`<div class="reason-cards"><p>이 특징을 가방에 쓰면?</p>${button('겉면의 물방울이 잘 굴러가요','design-answer','roll',s.design.linked)}${button('열린 입구도 저절로 막혀요','design-answer','close')}</div>`:'<p class="discovery-prompt">물방울을 떨어뜨리고 두 표면을 비교해 봐.</p>'}`;
 const prediction=`<div class="invention-brief"><span class="notebook-kicker">리피의 생활 속 문제</span><h2>비가 와도 수첩을 지키려면?</h2><p>겉면만 바꾸면 충분할까?<br>입구도 살펴봐야 할까?</p><div class="prediction">${s.testPrediction?`<p>${predictionLine(s)}</p>`:button('연잎 겉면만 바꾸면 돼','test-predict','surface',s.testPrediction==='surface')+button('입구로 오는 비도 막아야 해','test-predict','cover',s.testPrediction==='cover')}</div><p class="prediction-note">예상은 달라도 괜찮아. 같은 비로 시험해 확인하자.</p><details><summary>연잎의 비밀 다시 보기</summary>${observation}</details></div>`;
 return `<div class="learning-layout design-layout"><section class="learning-scene"><div class="invention-goal">자연에서 발견한 특징 → 가방의 부품 → 비로 확인</div><div class="compact-bag" data-spatial="bag">${bagArt(s.design)}</div>${inventionParts(s)}</section><aside class="learning-note lotus-note ${s.design.linked?'idea-linked':''}">${s.design.linked?prediction:`<h2>먼저, 자연을 관찰해요</h2>${observation}`}</aside></div>`;
}

export function predictionLine(s){
 if(!s.testPrediction)return '';
 return `${s.fieldEvidence?.bag?.prediction?'현장에서 남긴 첫 예상':'처음 예상'}: ${s.testPrediction==='cover'?'입구로 오는 비도 막아야 해.':'연잎 겉면만 바꾸면 돼.'} 시험으로 확인했어.`;
}

export function inventionHint(s){
 const last=currentTrial(s),pair=comparisonPair(s),proof=inventionEvidence(s);
 if(!last)return {title:'비로 시험하거나 기록을 다시 써 봐.',text:'이 설계의 이전 시험이 있으면 기록을 다시 쓸 수 있어. 처음 시험하는 설계라면 비를 뿌려 봐.'};
 if(last.key!==designKey(s.design))return {title:'바꾼 가방을 시험해 봐.',text:'부품은 하나만 바꾸고, 같은 비로 시험해 봐.'};
 if(!pair)return {title:'부품 하나만 바꾸어 볼까?',text:'겉면이나 입구 중 하나만 바꾸어야 그 부품의 역할을 알 수 있어.'};
 if(!proof.surface)return {title:'겉면이 하는 일을 찾아봐.',text:'입구는 그대로 두고 겉면만 바꾼 결과에서 물방울·먼지를 견줘 봐.'};
 if(!proof.cover)return {title:'이번에는 입구만 바꾸어 봐.',text:'겉면은 그대로 두고 입구를 열었을 때와 덮었을 때를 견줘 봐.'};
 if(!testValid(s))return {title:'두 발견으로 가방을 완성하자.',text:'겉면의 물방울도 보내고 입구의 비도 막을 설계를 골라 시험해 봐.'};
 return {title:'자연의 아이디어가 발명이 됐어!',text:'연잎을 본뜬 겉면과 입구 덮개를 함께 써서 생활 문제를 해결했어.'};
}
const resultText=t=>`<span class="result-chip ${t.clean?'good':''}">겉면 · ${t.clean?'물방울·먼지 떨어짐':'물기·먼지 남음'}</span><span class="result-chip ${t.dry?'good':''}">안쪽 · ${t.dry?'수첩 뽀송':'수첩 젖음'}</span>`;
const record=(t,label)=>`<article class="test-record"><strong>${label}</strong>${bagArt(t)}<span>${t.surface==='lotus'?'연잎 겉면':'보통 천'} · ${t.cover==='flap'?'덮개':'열린 입구'}</span><div>${resultText(t)}</div></article>`;

// After the field mission the bag is already built and tested; the record page only sums it up.
function testSummary(s,u){
 const name=t=>t.surface==='plain'&&t.cover==='open'?'처음 가방':[t.surface==='lotus'?'+ 연잎 겉면':'',t.cover==='flap'?'+ 덮개':''].filter(Boolean).join(' ');
 return `<div class="learning-layout test-layout invention-summary"><section class="learning-scene"><div class="summary-bag"><div class="compact-bag" data-spatial="bag">${bagArt(s.design)}</div><div class="notebook-result">${assetImage('notebook_dry')}<span>공책 뽀송!</span></div></div><div class="summary-records">${s.tests.slice(-3).map(t=>`<article class="summary-trial"><strong>${name(t)}</strong><span class="result-chip ${t.clean?'good':''}">물방울 ${t.clean?'굴러감':'남음'}</span><span class="result-chip ${t.dry?'good':''}">공책 ${t.dry?'뽀송':'젖음'}</span></article>`).join('')}</div></section><aside class="learning-note"><h2>발명 완성!</h2><div class="invention-proof summary-proof"><span class="done">✓ 연잎 겉면 · 물방울을 굴려 보내</span><span class="done">✓ 덮개 · 입구로 오는 비를 막아</span></div><p class="prediction-note">${predictionLine(s)}</p><div class="idea-application"><p>이 아이디어를 또 어디에 쓸까?</p>${button('비옷','idea-apply','coat',u.application==='coat')}${button('탐험 신발','idea-apply','shoes',u.application==='shoes')}<span>${u.application==='coat'?'겉은 물방울을 보내고, 후드로 틈을 가리면 어떨까?':u.application==='shoes'?'신발 겉면과 물이 들어오는 입구를 따로 살펴보자.':'골라 보면 리피가 아이디어를 말해 줘.'}</span></div></aside></div>`;
}
export function renderTests(s,u){
 if(testValid(s)&&s.fieldBridges?.[4]&&!u.testing&&!u.replaying)return testSummary(s,u);
 const last=currentTrial(s),pair=comparisonPair(s),hint=inventionHint(s),moving=u.testing||u.replaying,proof=inventionEvidence(s);
 const routes=moving||last?`<svg class="water-paths" viewBox="0 0 500 300" role="img" aria-label="${s.design.cover==='open'?'입구로 물이 들어가요':'덮개를 따라 물이 바깥으로 흘러요'}"><path class="water-route" d="${s.design.cover==='open'?'M250 10V125L245 175':'M250 10L250 70L345 140L370 210'}"/><path class="water-route surface-route" d="${s.design.surface==='lotus'?'M160 125Q115 210 85 260':'M170 125L175 180'}"/></svg><div class="notebook-result">${assetImage((last?last.dry:s.design.cover==='flap')?'notebook_dry':'notebook_wet')}<span>가방 안 수첩</span></div>`:'';
 const compare=pair&&!u.testing?`<div class="test-comparison">${record(pair.before,'바꾸기 전')}${record(pair.last,'바꾼 뒤')}</div><div class="reason-cards comparison-question"><p>${pair.part==='surface'?'입구는 같고, 겉면만 바뀌었어.':'겉면은 같고, 입구만 바뀌었어.'} 무엇이 달라졌어?</p>${button('겉면이 물방울·먼지를 보내요','test-explain','surface',s.testExplanation?.part==='surface')}${button('덮개가 입구로 오는 비를 막아요','test-explain','cover',s.testExplanation?.part==='cover')}</div>`:last&&!u.testing?`<div class="latest-result" role="status">${resultText(last)}</div>`:'';
 return `<div class="learning-layout test-layout"><section class="learning-scene"><div class="water-demo ${moving?'moving':''} ${u.paused?'paused':''}"><div class="compact-bag" data-spatial="bag">${bagArt(s.design,moving,last)}</div>${routes}</div><div class="test-control-row"><span class="test-conditions">같은 비 · 같은 먼지 · 같은 시간</span><div class="learning-tabs"><button class="btn primary" data-action="run-test" ${u.testing?'aria-disabled="true" data-reason="비가 내리는 중이야. 잠깐 기다려 줘."':''}>${u.testing?'비가 내리는 중…':'비 뿌리기'}</button>${!last&&s.tests.some(t=>t.key===designKey(s.design))?button('이 설계의 시험 기록 사용하기','use-tested-design'):''}${u.testing?button(u.paused?'계속 보기':'잠깐 멈추기','pause-test'):last?button(u.replaying?'움직임 멈추기':'물길 다시 보기','replay-test'):''}</div></div>${compare}</section><aside class="learning-note"><h2>한 부품씩 바꾸어 시험</h2>${testValid(s)?`<details class="result-parts"><summary>다른 설계로 다시 시험하기</summary>${inventionParts(s,u.testing)}</details>`:inventionParts(s,u.testing)}<div class="invention-proof"><span class="${proof.surface?'done':''}">${proof.surface?'✓':'○'} 겉면 역할 발견</span><span class="${proof.cover?'done':''}">${proof.cover?'✓':'○'} 덮개 역할 발견</span></div><div class="invention-feedback" role="status"><h3>${hint.title}</h3><p>${hint.text}</p></div>${testValid(s)?`<div class="idea-application"><p>이 아이디어를 또 어디에 쓸까?</p>${button('비옷','idea-apply','coat',u.application==='coat')}${button('탐험 신발','idea-apply','shoes',u.application==='shoes')}<span>${u.application==='coat'?'겉의 물방울을 보내고, 후드와 여밈으로 틈을 가리면 어떨까?':u.application==='shoes'?'신발 겉면과 물이 들어오는 입구를 따로 살펴보자.':'자연의 특징을 생활 속 다른 문제에도 써 보자.'}</span></div>`:''}<details class="test-history"><summary>내 예상과 시험 기록 ${s.tests.length}회</summary><p>${predictionLine(s)}</p>${s.tests.map((t,i)=>record(t,`${i+1}번째`)).join('')}</details></aside></div>`;
}
