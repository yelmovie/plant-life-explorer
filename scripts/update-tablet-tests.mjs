import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8').replaceAll('\r\n','\n'),write=(p,s)=>writeFileSync(new URL(p,root),s);
let t=read('tests/model.test.mjs').replace('freshState,restoreState,','PLANTS,recordFeature,comparisonPair,freshState,restoreState,');
t=t.replace("for(const id of Object.keys(s.observation))s.observation[id]=['shape','edge'];","for(const p of PLANTS){recordFeature(s,p.id,'shape',p.id);recordFeature(s,p.id,'edge',p.edge?'yes':'no');}s.classificationEvidence.edge='cherry';");
t=t.replace("s.groups={cherry:'no',ginkgo:'no',grass:'yes'};assert", "s.groups={cherry:'no',ginkgo:'no',grass:'yes'};s.classificationEvidence.narrow='grass';assert");
t=t.replace("s.seasonalRecords=['cherry','sowthistle'].flatMap(p=>[0,1,3].map(n=>`${p}:${n}`));", "s.seasonalRecords=['cherry:3','cherry:0'];s.seasonPhotos={'cherry:3':{underground:false},'cherry:0':{underground:false}};s.seasonExplanation='cherry';");
t=t.replace("assert.equal(pageReady(s,6),true);", "s.gardenReviewed=true;assert.equal(pageReady(s,6),true);");
t=t.replace("s.tests.unshift(testDesign({surface:'plain',cover:'open'}));assert.equal(testValid(s),true);", "s.tests.unshift(testDesign({surface:'plain',cover:'open'}));assert.equal(testValid(s),false);s.tests.unshift(testDesign({surface:'plain',cover:'flap'}));s.testExplanation={key:'lotus:flap',before:'plain:flap',part:'surface'};assert.equal(testValid(s),true);");
t=t.replaceAll("s.tests=[testDesign({surface:'plain',cover:'open'}),testDesign(s.design)];", "s.tests=[testDesign({surface:'plain',cover:'flap'}),testDesign(s.design)];s.testExplanation={key:'lotus:flap',before:'plain:flap',part:'surface'};s.gardenReviewed=true;s.sharing.status='later';");
t=t.replace("s.terrain[6]='empty';assert.equal(canFinish(s),false);", "s.terrain[0]='empty';assert.equal(canFinish(s),false);");
t=t.replace('정원은 면적, 서식지, 서로 다른 위치, 근거를 모두 검사한다','정원은 확인, 환경, 서로 다른 위치, 근거를 모두 검사한다');
write('tests/model.test.mjs',t);
let r=read('tests/rewards.test.mjs');r=r.slice(0,r.indexOf("test('네 가지 가방"))+`test('가방 네 조합의 결과와 한 부품 비교 안내',()=>{
 const s=freshState();assert.match(inventionHint(s).title,/비/);
 for(const surface of ['plain','lotus'])for(const cover of ['open','flap']){
  s.design={surface,cover,linked:true};const result=testDesign(s.design);s.tests=[result];
  assert.equal(result.clean,surface==='lotus');assert.equal(result.dry,cover==='flap');assert.equal(testValid(s),false);assert.match(inventionHint(s).text,/하나만/);
 }
 s.tests.unshift(testDesign({surface:'plain',cover:'flap'}));s.testExplanation={key:'lotus:flap',before:'plain:flap',part:'surface'};assert.equal(testValid(s),true);
 s.design.cover='open';assert.equal(testValid(s),false);assert.match(inventionHint(s).title,/시험/);
});\n`;write('tests/rewards.test.mjs',r);
