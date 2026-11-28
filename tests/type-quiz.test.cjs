const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const quiz=require('../type-quiz-engine.js');
const index=JSON.parse(fs.readFileSync('data/display-index.json','utf8'));
const raw=JSON.parse(fs.readFileSync('data/pokemon.json','utf8')).pokemon;
const records=new Map(index.catalog_cards.map(p=>[p.id,p]));
for(const p of raw)records.set(p.id,p);
for(const l of index.catalog_labels){const p=records.get(l.national_id);if(p&&p.name_en===l.name_en)records.set(p.id,{...p,name_zh:l.name_zh});}
const catalog=[...records.values()].sort((a,b)=>a.id-b.id),range=index.catalog_card_source.national_id_range;
const pool=quiz.buildPool(catalog,range);
test('the verified catalog supplies 1025 immutable, complete name/type questions',()=>{
 assert.equal(pool.length,1025);assert.equal(Object.keys(quiz.TYPE_NAMES).length,18);
 assert.deepEqual(pool[0].types,['grass','poison']);assert.equal(pool[1024].name_zh,'桃歹郎');
 assert(Object.isFrozen(pool[0])&&Object.isFrozen(pool[0].types));
 assert.equal(catalog[0].catalog_basic,undefined);
});
test('unknown, duplicate and out-of-scope entries cannot become questions',()=>{
 const p=pool[0],dirty=[p,p,{...p,id:2,types:['invented']},{...p,id:3,name_zh:''},{...p,id:4,types:['fire','fire']},{...p,id:1026},{...p,id:5,types:['fire','water','grass']}];
 assert.deepEqual(quiz.buildPool(dirty,range),[]);assert.deepEqual(quiz.buildPool(catalog,null),[]);
});
test('a round contains ten different IDs and never mutates the question pool',()=>{
 const before=JSON.stringify(pool),round=quiz.createRound(pool,10,()=>0);
 assert.equal(new Set(round.questions.map(p=>p.id)).size,10);assert.deepEqual(round.questions.map(p=>p.id),[1,2,3,4,5,6,7,8,9,10]);
 assert.equal(JSON.stringify(pool),before);assert(Object.isFrozen(round.questions));
});
test('dual types are order-independent but partial and extra selections get no point',()=>{
 const full=quiz.createRound(pool,10,()=>0),answer=quiz.answerRound(full,['poison','grass']);
 assert(answer.accepted&&answer.correct);assert.equal(full.score,1);
 const partial=quiz.createRound(pool,10,()=>0),miss=quiz.answerRound(partial,['grass']);
 assert(!miss.correct);assert.deepEqual(miss.missing,['poison']);assert.equal(partial.score,0);
 const extra=quiz.createRound([pool.find(p=>p.id===4)],1,()=>0),wrong=quiz.answerRound(extra,['fire','flying']);
 assert(!wrong.correct);assert.deepEqual(wrong.extra,['flying']);assert.equal(extra.score,0);
});
test('empty/invalid answers and repeated submissions never change scores',()=>{
 const round=quiz.createRound(pool,10,()=>0);
 assert.equal(quiz.advanceRound(round),false);
 for(const value of [[],['grass','grass'],['invalid'],['grass','poison','fire'],null])assert.equal(quiz.answerRound(round,value).accepted,false);
 assert.equal(round.answers.length,0);quiz.answerRound(round,['grass','poison']);
 assert.equal(quiz.answerRound(round,['grass','poison']).accepted,false);assert.equal(round.score,1);
});
test('exactly ten answers complete the session and a new round resets it',()=>{
 const round=quiz.createRound(pool,10,()=>0);
 for(let i=0;i<10;i++){
  assert.equal(round.cursor,i);assert(quiz.answerRound(round,[...round.questions[i].types].reverse()).correct);
  assert.equal(quiz.advanceRound(round),true);
 }
 assert(round.complete);assert.equal(round.score,10);assert.equal(round.answers.length,10);
 assert.equal(quiz.advanceRound(round),false);assert.equal(quiz.answerRound(round,['grass']).accepted,false);
 assert.equal(quiz.createRound(pool).score,0);
});
test('insufficient data and invalid random functions fail safely',()=>{
 for(const roll of [NaN,-1,1,Infinity])assert.throws(()=>quiz.createRound(pool,10,()=>roll));
 assert.throws(()=>quiz.createRound(pool.slice(0,9)));
 assert.throws(()=>quiz.createRound(pool,11));assert.throws(()=>quiz.createRound([pool[0],pool[0]],2));
});
test('100 deterministic seeds produce ten unique questions in every round',()=>{
 for(let seed=1;seed<=100;seed++){let state=seed;const rng=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};const round=quiz.createRound(pool,10,rng);assert.equal(new Set(round.questions.map(q=>q.id)).size,10);}
});
module.exports={catalog,index};
