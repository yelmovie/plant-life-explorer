import {recordResponse} from './learning-records.js';
const plantNames={cherry:'벚나무',ginkgo:'은행나무',grass:'강아지풀',hyacinth:'부레옥잠',aloe:'알로에',sowthistle:'씀바귀',maple:'단풍나무',pine:'소나무',camellia:'동백나무'};
const labels={yes:'톱니 있음',no:'톱니 없음',roots:'뿌리가 남음',none:'아무것도 없음',bubbles:'공기 방울이 나옴',air:'공기',soil:'흙',water:'물가',grass:'풀밭',dry:'건조 구역',growth:'살아 있던 부분에서 다시 자람',gone:'모두 사라짐',roll:'겉면의 물방울이 굴러감',close:'입구도 저절로 막힘',surface:'겉면',cover:'입구 덮개',float:'뜸',sink:'가라앉음',trunk:'줄기와 뿌리',root:'뿌리',leaf:'새로 나온 잎',branches:'같은 가지에서 새눈이 돋음',rootbud:'땅속 뿌리에서 새싹이 돋음',color:'꽃 색깔만 같음',pond:'물이 고이는 자리',meadow:'물이 배어드는 자리',ridge:'물이 빠지는 자리'};
const named=id=>plantNames[id]||labels[id]||id;
const add=(s,m,key,id,ok,label,phase)=>recordResponse(s,m,key,named(id),ok,label,phase);
function revise(s,m,keys,value){
  const key=keys.find(k=>s.learningRecords?.[m]?.responses[k]);
  if(key){const r=s.learningRecords[m].responses[key];recordResponse(s,m,key,value,true,r.label,r.phase);}
}
export function coreResponse(s,u,a,id) {
  const m=Math.floor(s.page/2),plant=u.plant||'cherry',selected=u.selected;
  const spec=(key,ok,label,phase='observation',value=id)=>()=>add(s,m,'core:'+key,value,ok,label,phase);
  switch(a){
    case 'feature-answer': if(u.recheck===`${plant}:${u.region||'shape'}`)return; return spec(`leaf:${plant}:${u.region||'shape'}`,id===(u.region==='edge'?(plant==='cherry'?'yes':'no'):plant),`${named(plant)} · ${u.region==='edge'?'가장자리':'모양'}`);
    case 'assign-group':if(!['edge','narrow'].includes(s.rule)||!['cherry','ginkgo','grass'].includes(selected)||!['yes','no'].includes(id))return;return spec(`classify:${s.rule}:${selected}`,id===((s.rule==='edge'?selected==='cherry':selected==='grass')?'yes':'no'),`${named(selected)} · ${s.rule==='edge'?'톱니 분류':'모양 분류'}`,'application',s.rule==='edge'?(id==='yes'?'톱니 있음':'톱니 없음'):(id==='yes'?'길쭉함':'다른 모양'));
    case 'check-rule': if(Object.keys(s.groups).length<3)return; return spec('classify:'+s.rule,['cherry','ginkgo','grass'].every(p=>s.groups[p]===((s.rule==='edge'?p==='cherry':p==='grass')?'yes':'no')),'잎 분류 · '+(s.rule==='edge'?'톱니':'모양'),'application',Object.entries(s.groups).map(([p,g])=>`${named(p)}: ${s.rule==='edge'?(g==='yes'?'톱니 있음':'톱니 없음'):(g==='yes'?'길쭉함':'다른 모양')}`).join(' / '));
    case 'classification-proof':if(!u.ruleCheck?.valid)return;return spec('proof:'+s.rule,id.split(':')[1]===(s.rule==='edge'?'edge':'shape'),'분류 근거','application',`${named(id.split(':')[0])} · ${id.endsWith(':edge')?'가장자리':'모양'}`);
    case 'season-predict':if(s.undergroundSeen.includes(s.seasonPlant)||s.seasonPrediction[s.seasonPlant])return;return spec('season:'+s.seasonPlant,id==='roots',`${named(s.seasonPlant)} 겨울 땅속`,'prediction');
    case 'season-explain':{if(![0,3].every(n=>s.seasonalRecords.includes(`${s.seasonPlant}:${n}`)))return;const record=spec('season-reason:'+s.seasonPlant,id==='growth',`${named(s.seasonPlant)} 겨울과 봄 연결`),plant=s.seasonPlant;return ()=>{record();if(id==='growth')revise(s,m,['field:season-predict:'+(plant==='cherry'?'tree':'herb'),'core:season:'+plant],named('roots'));};}
    case 'experiment-predict':if(s.experiment.prediction||s.experiment.step>=4)return;return spec('experiment-predict',id==='bubbles','물속 잎자루 예상','prediction');
    case 'experiment-answer':{if(s.experiment.step<4)return;const record=spec('experiment-answer',id==='air','누른 잎자루에서 나온 방울');return ()=>{record();if(id==='air')revise(s,m,['core:experiment-predict'],named('bubbles'));};}
    case 'habitat':if(!plantNames[selected]||s.habitats[selected]===id)return;return spec('habitat:'+selected,id===({hyacinth:'water',aloe:'dry',cherry:'grass'})[selected],`${named(selected)}의 환경`,'application');
    case 'habitat-feature':return spec('feature:'+selected,id===selected,`${named(selected)}의 특징`,'application');
    case 'habitat-answer':if(!['hyacinth','aloe','cherry'].includes(selected)||!['hyacinth','aloe','cherry'].includes(id)||s.habitats[selected]!==({hyacinth:'water',aloe:'dry',cherry:'grass'})[selected])return;return spec('reason:'+selected,id===selected,`${named(selected)}의 특징과 생활 연결`,'application');
    case 'garden-answer':if(!Number.isInteger(s.garden[selected]))return;return spec('garden:'+selected,id===selected&&s.terrain[s.garden[selected]]===({hyacinth:'water',aloe:'dry',cherry:'grass'})[selected],`${named(selected)}을 심은 까닭`,'application');
    case 'design-answer':if(!s.design.observed&&!s.design.linked)return;return spec('design-answer',id==='roll','연잎의 특징을 쓰는 방법');
    case 'test-predict':if(s.testPrediction)return;return spec('bag-prediction',id==='cover','비 오는 가방 예상','prediction',id==='surface'?'겉면만 바꾸면 됨':'입구로 오는 비도 막아야 함');
    case 'test-explain':{const last=s.tests.at(-1),before=s.tests.slice(0,-1).reverse().find(t=>Number(t.surface!==s.design.surface)+Number(t.cover!==s.design.cover)===1);if(!last||!before||last.key!==`${s.design.surface}:${s.design.cover}`)return;const part=before.surface!==s.design.surface?'surface':'cover',record=spec('test:'+last.key,id===part,'비교한 가방의 바뀐 부품');return ()=>{record();if(id==='cover'&&part==='cover')revise(s,m,['field:bag-prediction','core:bag-prediction'],'입구로 오는 비도 막아야 함');};}
  }
}
export function fieldResponse(s,a,id) {
  const [x,y,z]=id.split(':'),e=s.fieldEvidence,m=Math.floor(s.page/2);
  const spec=(key,ok,label,phase='observation',value=y)=>(observedCorrect)=>add(s,m,'field:'+key,value,ok??observedCorrect,label,phase);
  switch(a){
    case 'field-sort':if(!['edge','narrow'].includes(x)||!['maple','pine','camellia'].includes(y)||!['yes','no'].includes(z)||!['shape','edge'].every(k=>e.leaves.scans.maple?.includes(k)))return;return spec(`sort:${x}:${y}`,z===((x==='edge'?y!=='pine':y==='pine')?'yes':'no'),`${named(y)} · ${x==='edge'?'톱니 분류':'모양 분류'}`,'application',x==='edge'?(z==='yes'?'톱니 있음':'톱니 없음'):(z==='yes'?'길쭉함':'다른 모양'));
    case 'field-season-predict':if(e.seasons.predictions[x])return;return spec('season-predict:'+x,y==='roots',`${x==='tree'?'벚나무':'씀바귀'} 겨울 예상`,'prediction');
    case 'field-season-link':{const ok=y===(x==='tree'?'trunk':'root'),record=spec('season-link:'+x,ok,`${x==='tree'?'벚나무':'씀바귀'} 살아 있던 부분`);return ()=>{record();if(ok)revise(s,m,['field:season-predict:'+x],named('roots'));};}
    case 'field-season-clue':return spec('season-clue:'+x,y===(x==='tree'?'branches':'rootbud'),`${x==='tree'?'벚나무':'씀바귀'} 그림에서 고른 근거`);
    case 'field-order':return spec('season-order:'+x+':'+z,y===['winter','bud','spring'][Number(z)],`${x==='tree'?'나무':'풀'} 사진 ${Number(z)+1}번째 자리`,'observation',({winter:'잎이 없는 모습',bud:'새눈·새싹 모습',spring:'잎과 꽃이 자란 모습'})[y]);
    case 'field-predict':if(e.float.tested.includes(x)||e.float.predictions[x])return;return spec('float-predict:'+x,y===(x==='air'?'float':'sink'),`${x==='air'?'공기 방':'꽉 찬'} 모형 예상`,'prediction');
    // Dropping a model in the tank is the observation; it also revises a first prediction that missed.
    case 'field-test-model':{if(!e.float.predictions[x]||e.float.tested.includes(x))return;const seen=x==='air'?'float':'sink',record=spec('float-observed:'+x,true,`${x==='air'?'공기 방':'꽉 찬'} 모형 관찰`,'observation',seen);return ()=>{record();if(e.float.predictions[x]!==seen)revise(s,m,['field:float-predict:'+x],named(seen));};}
    case 'field-model-reason':if(e.float.tested.length<2)return;return spec('float-reason',x==='air','뜨는 결과와 공기 공간 연결','observation',x==='air'?'공기 방 모형':'꽉 찬 모형');
    case 'field-place-environment':return spec('environment:'+y,x===({pond:'water',meadow:'grass',ridge:'dry'})[y],`${named(y)}의 환경`,'application',x);
    case 'field-place-plant':return spec('plant:'+x,y===({hyacinth:'pond',cherry:'meadow',aloe:'ridge'})[x],`${named(x)}을 심을 자리`,'application');
    case 'field-bag-predict':if(e.bag.prediction)return;return spec('bag-prediction',x==='cover','비 오는 가방 예상','prediction',x==='surface'?'겉면만 바꾸면 됨':'입구로 오는 비도 막아야 함');
    // Finding that the cover keeps the notebook dry revises a first 'surface only' prediction.
    case 'field-bag-answer':{if(!['surface','cover'].includes(x))return;const record=spec('bag-answer',null,'공책을 지킨 부품','observation',x==='cover'?'덮개':'연잎 겉면');return ok=>{record(ok);if(ok)revise(s,m,['field:bag-prediction','core:bag-prediction'],'입구로 오는 비도 막아야 함');};}
  }
}
