import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateRecipes} from '../app/scene-engine.mjs';
const recipes=JSON.parse(fs.readFileSync('data/recipes.json')),profiles=JSON.parse(fs.readFileSync('data/recipe-profiles.json'));
assert.equal(Object.keys(profiles).length,recipes.length);
for(const r of recipes){const p=profiles[r.id];assert.ok(p.intent&&p.referenceObservation&&p.evidenceLimits&&p.previewIntent);assert.ok(p.preferredLighting.length);for(const x of p.relatedRecipes)assert.ok(recipes.some(r=>r.id===x.id));}
const d=recipes.find(r=>r.id==='dote-classic-chrome');assert.equal(d.images.length,7);assert.ok(profiles[d.id].subjects.includes('still-life'));
const scene={subjects:['still-life','interior'],objects:[],light:'daylight',palette:[{name:'orange',share:.25},{name:'neutral',share:.6}],contrast:.6,saturation:.2,highlight:0,shadow:.1,harmony:'a restrained palette'};
const a=evaluateRecipes(recipes,profiles,scene).find(r=>r.recipeId===d.id);const baseline=structuredClone(profiles);baseline[d.id].preferredLighting=[];const b=evaluateRecipes(recipes,baseline,scene).find(r=>r.recipeId===d.id);assert.ok(Math.abs(a.score-b.score-.65)<1e-8);assert.ok(a.reasons.some(x=>x.includes('knowledge map')));
const map=fs.readFileSync('public/recipe-mind-map.html','utf8');for(const r of recipes)assert.ok(map.includes('id="'+r.id+'"'));
console.log('PASS: all 19 knowledge records, links, seven Dote refs and ranking integration.');
