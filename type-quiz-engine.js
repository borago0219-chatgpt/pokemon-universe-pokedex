(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.PokeVerseTypeQuiz=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const TYPE_NAMES=Object.freeze({normal:'一般',fire:'火',water:'水',electric:'電',grass:'草',ice:'冰',fighting:'格鬥',poison:'毒',ground:'地面',flying:'飛行',psychic:'超能力',bug:'蟲',rock:'岩石',ghost:'幽靈',dragon:'龍',dark:'惡',steel:'鋼',fairy:'妖精'});
 const validType=t=>typeof t==='string'&&Object.hasOwn(TYPE_NAMES,t);
 function buildPool(records,range){
  if(!Array.isArray(records)||!Number.isInteger(range?.from)||!Number.isInteger(range?.to)||range.from<1||range.to<range.from||range.to>9999)return [];
  const counts=new Map();
  for(const p of records)if(Number.isInteger(p?.id))counts.set(p.id,(counts.get(p.id)||0)+1);
  return records.filter(p=>Number.isInteger(p?.id)&&p.id>=range.from&&p.id<=range.to&&counts.get(p.id)===1&&
   typeof p.name_zh==='string'&&/[\u3400-\u9fff]/u.test(p.name_zh)&&p.name_zh.length<=30&&
   typeof p.name_en==='string'&&p.name_en.trim()&&p.name_en.length<=60&&
   Array.isArray(p.types)&&p.types.length>=1&&p.types.length<=2&&new Set(p.types).size===p.types.length&&p.types.every(validType)
  ).map(p=>Object.freeze({id:p.id,name_zh:p.name_zh,name_en:p.name_en,types:Object.freeze([...p.types])}));
 }
 function createRound(pool,size=10,random=Math.random){
  if(!Number.isInteger(size)||size<1||size>10||!Array.isArray(pool)||pool.length<size||typeof random!=='function')throw new RangeError('Not enough verified questions');
  const eligible=buildPool(pool,{from:1,to:9999});
  if(eligible.length!==pool.length)throw new TypeError('Invalid question pool');
  const deck=eligible.slice();
  for(let i=0;i<size;i++){
   const roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw new RangeError('Invalid random value');
   const j=i+Math.floor(roll*(deck.length-i));[deck[i],deck[j]]=[deck[j],deck[i]];
  }
  return {questions:Object.freeze(deck.slice(0,size)),cursor:0,score:0,answers:[],complete:false};
 }
 function answerRound(round,selected){
  if(!round||round.complete||round.answers.length!==round.cursor)return {accepted:false,reason:'answered'};
  if(!Array.isArray(selected)||selected.length<1||selected.length>2||new Set(selected).size!==selected.length||!selected.every(validType))return {accepted:false,reason:'selection'};
  const pokemon=round.questions[round.cursor];
  const missing=pokemon.types.filter(t=>!selected.includes(t)),extra=selected.filter(t=>!pokemon.types.includes(t));
  const result=Object.freeze({accepted:true,correct:missing.length===0&&extra.length===0,pokemon,selected:Object.freeze([...selected]),expected:pokemon.types,missing:Object.freeze(missing),extra:Object.freeze(extra)});
  round.answers.push(result);if(result.correct)round.score++;
  return result;
 }
 function advanceRound(round){
  if(!round||round.complete||round.answers.length!==round.cursor+1)return false;
  if(round.cursor+1===round.questions.length)round.complete=true;
  else round.cursor++;
  return true;
 }
 return Object.freeze({TYPE_NAMES,buildPool,createRound,answerRound,advanceRound});
});
