// 재도전 목표(2026-11-21, A17). 끝낸 장의 현장 임무를 리피 힌트 없이·한 번도 안 틀리고 다시 해 본다.
// 배우게 하는 것: 같은 관찰 기준을 도움 없이 처음부터 스스로 적용할 수 있는지 확인한다(숙달 확인).
// 예상은 틀려도 셈하지 않는다(예상은 고쳐 가는 것이 학습이다). 관찰·적용에서 틀린 곳과 리피 힌트만 센다.
export const CHALLENGE_GOAL='리피 힌트 없이, 한 번도 틀리지 않고 현장 임무 끝내기';
const blank=()=>({tries:0,cleared:false});
export const emptyChallenges=()=>Array.from({length:5},blank);
export function normalizeChallenges(v){
  return emptyChallenges().map((_,i)=>{const c=Array.isArray(v)?v[i]:null;if(!c||typeof c!=='object')return blank();
    const tries=Number.isFinite(c.tries)&&c.tries>0?Math.floor(c.tries):0;return {tries,cleared:c.cleared===true};});
}
export function challengeScore(record){
  const responses=Object.values(record?.responses||{});
  const wrong=responses.filter(r=>r&&r.phase!=='prediction'&&r.wrong>0).length,hints=record?.hints>0?record.hints:0;
  return {hints,wrong,clean:hints===0&&wrong===0};
}
export function recordChallenge(list,mission,clean){
  const next=normalizeChallenges(list),c=next[mission];
  next[mission]={tries:c.tries+1,cleared:c.cleared||clean===true};return next;
}
