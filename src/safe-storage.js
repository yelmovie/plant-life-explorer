import {STORAGE_KEY, LEGACY_STORAGE_KEY, freshState, restoreState} from './model.js';
export const LAST_GOOD_KEY = STORAGE_KEY + '-last-good';
export const RECOVERY_KEY = STORAGE_KEY + '-unreadable-original';
export function validSave(raw) {
  try {
    const v=JSON.parse(raw);
    if (!v || ![1,2].includes(v.version) || !Array.isArray(v.completed) || v.completed.length!==10 || v.completed.some(x=>typeof x!=='boolean')) return false;
    for (const k of ['observation','design','experiment','fieldEvidence']) if (v[k]!==undefined && (!v[k] || typeof v[k]!=='object' || Array.isArray(v[k]))) return false;
    if(v.page!==undefined&&(!Number.isInteger(v.page)||v.page<0||v.page>9))return false;
    if(v.terrain!==undefined&&(!Array.isArray(v.terrain)||v.terrain.length!==24||v.terrain.some(t=>!['empty','water','grass','dry'].includes(t))))return false;
    for(const k of ['tests','seasonalRecords','linkedEvidence','gardenReasons','reportSubmitted'])if(v[k]!==undefined&&!Array.isArray(v[k]))return false;
    if(v.design&&(!['plain','lotus'].includes(v.design.surface)||!['open','flap'].includes(v.design.cover)))return false;
    return true;
  } catch { return false; }
}
// Web Locks serialize read/compare/write across tabs. No unprotected write fallback.
export function createSaveStore(storage, locks, onStatus=()=>{}) {
  let expected=null, original=null, status='ready', queue=Promise.resolve(), loaded=false;
  const setStatus=value=>{status=value;onStatus(value);return value==='ready';};
  function load() {
    try {
      expected=storage.getItem(STORAGE_KEY);
      original=expected??storage.getItem(LEGACY_STORAGE_KEY);
      loaded=true;
      if (original!==null && !validSave(original)) {setStatus('invalid');return freshState();}
      setStatus('ready');
      const state=original===null?freshState():restoreState(original);
      state.adminUnlocked=false;
      return state;
    } catch {setStatus('unavailable');return freshState();}
  }
  async function locked(operation) {
    if (!locks?.request) return setStatus('unsupported');
    return locks.request(STORAGE_KEY, operation);
  }
  function save(state) {
    const raw=JSON.stringify(state);
    const run=async()=>{
      if (!loaded || ['invalid','conflict','unavailable'].includes(status)) return false;
      try { return await locked(()=>{
        const current=storage.getItem(STORAGE_KEY);
        if(current!==expected)return setStatus('conflict');
        const previous=current??original;
        if(previous!==null && validSave(previous))storage.setItem(LAST_GOOD_KEY,previous);
        storage.setItem(STORAGE_KEY,raw);
        expected=raw;original=raw;
        return setStatus('ready');
      }); } catch {return setStatus('failed');}
    };
    queue=queue.then(run,run);return queue;
  }
  function changed(key) {
    if(key!==null && key!==STORAGE_KEY)return;
    try {if(storage.getItem(STORAGE_KEY)!==expected)setStatus('conflict');}catch{setStatus('unavailable');}
  }
  function backup() {try {const raw=storage.getItem(LAST_GOOD_KEY);return validSave(raw)?raw:null;}catch{return null;}}
  async function recover() {
    await queue;
    try {return await locked(()=>{
      if(storage.getItem(STORAGE_KEY)!==expected){setStatus('conflict');return null;}
      const raw=backup();if(!raw)return null;
      if(original!==null)storage.setItem(RECOVERY_KEY,original);
      storage.setItem(STORAGE_KEY,raw);expected=raw;original=raw;setStatus('ready');
      return restoreState(raw);
    });}catch{setStatus('failed');return null;}
  }
  return {load,save,changed,backup,recover,flush:()=>queue,get status(){return status;},get original(){return original;}};
}
