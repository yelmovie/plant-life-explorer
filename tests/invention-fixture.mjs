import {testDesign} from '../src/model.js';
// Three actual designs isolate surface, then cover, with both explanations.
export function completeInvention(s){
 s.design={surface:'lotus',cover:'flap',linked:true,observed:true};
 s.tests=[{surface:'plain',cover:'open'},{surface:'lotus',cover:'open'},s.design].map(testDesign);
 s.inventionExplanations={surface:{before:'plain:open',key:'lotus:open',part:'surface'},cover:{before:'lotus:open',key:'lotus:flap',part:'cover'}};
 s.testExplanation={...s.inventionExplanations.cover};
 return s;
}
