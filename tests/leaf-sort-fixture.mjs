import {PLANTS} from '../src/model.js';
import {learningAction} from '../src/learning.js';

export function sortLeaves(s,u,rule){
 if(rule==='narrow')learningAction(s,u,'leaf-rule',rule);
 for(const plant of PLANTS)learningAction(s,u,'leaf-sort',`${rule}:${plant.id}:${plant[rule]?'yes':'no'}`);
}
