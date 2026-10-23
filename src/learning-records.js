// Student choices are evidence. Completion counts and retries are not grades.
export const emptyLearningRecords = (known = true) => Array.from({length: 5}, () => ({known, hints: 0, responses: {}}));
const plain = v => v && typeof v === 'object' && !Array.isArray(v);
const count = v => Number.isInteger(v) && v >= 0 ? Math.min(v, 9999) : 0;
const text = v => typeof v === 'string' ? v.slice(0, 240) : '';
export function normalizeLearningRecords(value) {
  return emptyLearningRecords(false).map((record, i) => {
    const v = value?.[i];
    if (!plain(v)) return record;
    record.known = v.known === true;
    record.hints = count(v.hints);
    for (const [key, r] of Object.entries(plain(v.responses) ? v.responses : {}).slice(0, 160)) {
      if (!plain(r) || !text(r.first) || !text(r.last)) continue;
      record.responses[text(key)] = {label:text(r.label), first:text(r.first), last:text(r.last), attempts:Math.max(1,count(r.attempts)), wrong:count(r.wrong), changes:count(r.changes), firstCorrect:r.firstCorrect === true, correct:r.correct === true, phase:['prediction','observation','application'].includes(r.phase)?r.phase:'observation', firstHelp:count(r.firstHelp)};
    }
    return record;
  });
}
export function recordResponse(s, mission, key, value, correct, label, phase = 'observation') {
  s.learningRecords ??= emptyLearningRecords(false);
  const record = s.learningRecords[mission];
  if (!record) return;
  const old = record.responses[key];
  if (!old) record.responses[key] = {label, first:String(value), last:String(value), attempts:1, wrong:correct?0:1, changes:0, firstCorrect:!!correct, correct:!!correct, phase, firstHelp:record.hints};
  else { old.attempts++; old.wrong += correct?0:1; old.changes += Number(old.last !== String(value)); old.last = String(value); old.correct = !!correct; }
}
export function recordHint(s, mission) {
  s.learningRecords ??= emptyLearningRecords(false);
  if (s.learningRecords[mission]) s.learningRecords[mission].hints++;
}
export function learningStamp(s, mission) {
  const r = s.learningRecords?.[mission];
  if (!r?.known || !Object.keys(r.responses).length) return 'unknown';
  if (r.hints) return 'helped';
  return Object.values(r.responses).some(a=>a.wrong || a.changes) || s.misses?.[mission] ? 'fixed' : 'direct';
}
export function normalizeNotebook(value) {
  return Array.from({length:5}, (_,i)=>({read:value?.[i]?.read===true, answer:[0,1].includes(value?.[i]?.answer)?value[i].answer:null, firstAnswer:[0,1].includes(value?.[i]?.firstAnswer)?value[i].firstAnswer:null, attempts:count(value?.[i]?.attempts)}));
}
