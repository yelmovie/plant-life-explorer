import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,missionDone,restoreState} from '../src/model.js';

test('an old save with removed Pyoreu progress keeps its completed inquiry and next map',()=>{
 const save=freshState();
 save.screen='map';save.page=1;save.completed[0]=save.completed[1]=true;
 const expected=restoreState(JSON.stringify(save));
 const restored=restoreState(JSON.stringify({...save,mapVillains:[3,2,1,0,0]}));
 assert.deepEqual(restored,expected);
 assert.equal(restored.screen,'map');
 assert.equal(missionDone(restored,0),true);
 assert.equal(missionDone(restored,1),false);
 assert.equal(Object.hasOwn(restored,'mapVillains'),false);
});
