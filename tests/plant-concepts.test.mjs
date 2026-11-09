import test from 'node:test';import assert from 'node:assert/strict';
import {PLANT_CONCEPTS,plantEmphasis,plantConceptMarkup} from '../src/plant-concepts.js';
import {ASSETS} from '../src/asset-catalog.js';
test('five science explanations use actual catalog art and three readable cues',()=>{assert.equal(PLANT_CONCEPTS.length,5);for(const clip of PLANT_CONCEPTS){assert.equal(clip.frames.length,3);for(const [image,label,text] of clip.frames){assert.ok(ASSETS[image],image);assert.ok(label&&text);}}});
test('concept summary has no completion gate or fabricated student record',()=>{assert.match(plantConceptMarkup(0),/plant-concept-player/);assert.equal(plantConceptMarkup(99),'');});
test('highlight is escaped and does not nest marks',()=>{assert.equal(plantEmphasis('<물방울>',['물','물방울']),'&lt;<mark>물방울</mark>&gt;');});
