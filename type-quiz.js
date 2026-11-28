(function(){
 'use strict';
 const root=document.querySelector('#type-quiz'),engine=globalThis.PokeVerseTypeQuiz;
 if(!root)return;
 const $=id=>root.querySelector('#'+id);
 if(!engine){$('quiz-availability').textContent='測驗程式暫時無法載入，請重新整理。';return;}
 const storageKey='pokeverse:typequiz:best:v1';
 let pool=[],source=null,round=null,roundSource=null,selected=new Set(),best=null;
 const typeButtons=new Map(),officialArtworks=new Map();
 let artworkEpoch=0;
 function readBest(){
  try{const v=JSON.parse(localStorage.getItem(storageKey)||'null');return Number.isInteger(v)&&v>=0&&v<=10?v:null;}catch{return null;}
 }
 function showBest(){ $('quiz-best').textContent=best===null?'尚無紀錄':best+' / 10'; }
 function saveBest(score){
  if(!Number.isInteger(score)||score<0||score>10)return;
  if(best===null||score>best){best=score;try{localStorage.setItem(storageKey,JSON.stringify(best));}catch{$('quiz-storage-note').textContent='最佳紀錄僅在這次瀏覽期間保留。';}}
  showBest();
 }
 function label(types){return types.map(t=>engine.TYPE_NAMES[t]).join('／');}
 function sourceLink(data){
  if(data?.provider!=='PokéAPI'||data.display_status!=='basic_metadata_verified'||!/^[0-9a-f]{40}$/.test(data.revision||'')||!/^\d{4}-\d{2}-\d{2}$/.test(data.checked_at||''))return null;
  return 'https://github.com/PokeAPI/pokeapi/tree/'+data.revision+'/data/v2/csv';
 }
 function showSource(data){
  const link=sourceLink(data);$('quiz-source-link').hidden=!link;
  if(link)$('quiz-source-link').href=link;
  $('quiz-source-date').textContent=data?'資料核對：'+data.checked_at:'題庫正在載入。';
 }
 function clearFeedback(){ $('quiz-feedback').classList.remove('quiz-feedback-correct');$('quiz-feedback').hidden=true;$('quiz-feedback').replaceChildren(); }
 function notice(text){
  const p=document.createElement('p');p.textContent=text;$('quiz-feedback').replaceChildren(p);$('quiz-feedback').hidden=false;
 }
 function renderChoices(result){
  for(const [type,button] of typeButtons){
   const chosen=selected.has(type),correct=Boolean(result?.expected.includes(type)),wrong=Boolean(result&&chosen&&!correct);
   button.setAttribute('aria-pressed',String(chosen));button.disabled=Boolean(result);
   button.classList.toggle('is-selected',chosen);button.classList.toggle('is-answer',correct);button.classList.toggle('is-wrong',wrong);
   button.querySelector('.quiz-choice-state').textContent=result?(correct?'正解':wrong?'誤選':''):chosen?'已選':'';
  }
  $('quiz-selection').textContent='已選 '+selected.size+' 種'+(selected.size?'：'+label([...selected]):'');
  $('quiz-submit').disabled=selected.size===0||Boolean(result);
 }
 function showQuestionArtwork(p){
  const image=$('quiz-artwork'),placeholder=$('quiz-art-placeholder'),credit=$('quiz-art-credit'),caption=$('quiz-art-caption');
  const epoch=++artworkEpoch;image.onload=null;image.onerror=null;image.hidden=true;image.removeAttribute('src');image.alt='';
  placeholder.hidden=false;caption.textContent='圖片準備中';credit.hidden=true;credit.replaceChildren();
  const entry=officialArtworks.get(p.id);if(!entry)return;
  image.onload=()=>{
   if(epoch!==artworkEpoch)return;
   if(!image.naturalWidth||!image.naturalHeight)return;
   image.hidden=false;placeholder.hidden=true;
   const text=document.createElement('span'),link=document.createElement('a');
   text.textContent='官方角色參考圖 · ©Pokémon · ';link.textContent='圖片來源';link.href=entry.source_url;link.target='_blank';link.rel='noopener noreferrer';
   credit.replaceChildren(text,link);credit.hidden=false;
  };
  image.onerror=()=>{if(epoch!==artworkEpoch)return;image.hidden=true;placeholder.hidden=false;caption.textContent='圖片暫時無法載入';credit.hidden=true;};
  image.alt=p.name_zh+'官方角色插畫';image.src=entry.src;
 }
 function acceptOfficialArtworks(entries){
  officialArtworks.clear();const counts=new Map(),items=Array.isArray(entries)?entries:[];
  for(const e of items)counts.set(e?.national_id,(counts.get(e?.national_id)||0)+1);
  for(const e of items){
   if(!Number.isInteger(e?.national_id)||e.national_id<2||counts.get(e.national_id)!==1||typeof e.src!=='string')continue;
   const match=e.src.match(/^\.\/assets\/reference\/([0-9]{3,4})-[a-z0-9-]+-official\.png$/);
   const source='https://github.com/PokeAPI/sprites/blob/master/sprites/pokemon/other/official-artwork/'+e.national_id+'.png';
   if(match&&Number(match[1])===e.national_id&&e.source_url===source)officialArtworks.set(e.national_id,{src:e.src,source_url:source});
  }
 }
 function displayQuestion(){
  const p=round.questions[round.cursor];selected=new Set();clearFeedback();
  $('quiz-step').textContent='第 '+(round.cursor+1)+' / '+round.questions.length+' 題';
  $('quiz-score').textContent='答對 '+round.score+' 題';
  $('quiz-progress').value=round.answers.length;
  $('quiz-number').textContent='NATIONAL DEX #'+String(p.id).padStart(4,'0');
  $('quiz-name').textContent=p.name_zh;$('quiz-english').textContent=p.name_en;showQuestionArtwork(p);
  $('quiz-submit').hidden=false;$('quiz-next').hidden=true;renderChoices(null);
  $('quiz-name').focus();
 }
 function start(){
  if(pool.length<10)return;
  try{round=engine.createRound(pool);}catch{notice('目前無法開始測驗，請重新整理後再試。');return;}
  roundSource=source;$('quiz-intro').hidden=true;$('quiz-results').hidden=true;$('quiz-play').hidden=false;
  showSource(roundSource);displayQuestion();
 }
 function submit(){
  if(!round)return;
  const result=engine.answerRound(round,[...selected]);if(!result.accepted)return;
  renderChoices(result);$('quiz-score').textContent='答對 '+round.score+' 題';$('quiz-progress').value=round.answers.length;
  const title=document.createElement('strong');title.textContent=result.correct?'答對了！':'這題再記一下';
  const explanation=document.createElement('p');
  explanation.textContent='完整屬性是「'+label(result.expected)+'」。'+(result.expected.length===2?'這是雙屬性寶可夢，兩種都要選對。':'這是單屬性寶可夢，選這一種即可。');
  const chosen=document.createElement('p');chosen.className='quiz-your-answer';chosen.textContent='你的答案：'+label(result.selected)+(result.correct?'':(result.missing.length?'；漏選：'+label(result.missing):'')+(result.extra.length?'；多選：'+label(result.extra):''));
  $('quiz-feedback').replaceChildren(title,explanation,chosen);$('quiz-feedback').hidden=false;
  $('quiz-feedback').classList.toggle('quiz-feedback-correct',result.correct);
  $('quiz-submit').hidden=true;$('quiz-next').hidden=false;
  $('quiz-next').textContent=round.cursor+1===round.questions.length?'查看成績':'下一題';$('quiz-next').focus();
 }
 function reviewItem(answer){
  const li=document.createElement('li'),heading=document.createElement('strong'),info=document.createElement('p'),button=document.createElement('button');
  heading.textContent='#'+String(answer.pokemon.id).padStart(4,'0')+' '+answer.pokemon.name_zh;
  info.textContent='你選：'+label(answer.selected)+'　正解：'+label(answer.expected);
  button.type='button';button.className='quiz-text-button';button.textContent='查看圖鑑';
  button.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('pokeverse:open-entry',{detail:{national_id:answer.pokemon.id}})));
  li.append(heading,info,button);return li;
 }
 function results(){
  $('quiz-play').hidden=true;$('quiz-results').hidden=false;saveBest(round.score);
  $('quiz-final-score').textContent=round.score+' / '+round.questions.length;
  $('quiz-result-title').textContent=round.score===10?'全數答對！':round.score>=7?'屬性辨識力不錯！':'找到下一次的練習方向了';
  const wrong=round.answers.filter(a=>!a.correct);
  $('quiz-wrong-count').textContent=wrong.length?'本局錯題 '+wrong.length+' 題':'本局沒有錯題';
  $('quiz-review').replaceChildren(...wrong.map(reviewItem));
  $('quiz-perfect').hidden=wrong.length!==0;showSource(roundSource);$('quiz-result-title').focus();
 }
 for(const [type,name] of Object.entries(engine.TYPE_NAMES)){
  const button=document.createElement('button'),nameSpan=document.createElement('span'),stateSpan=document.createElement('span');
  button.type='button';button.className='quiz-choice';button.dataset.type=type;button.setAttribute('aria-pressed','false');
  nameSpan.textContent=name;stateSpan.className='quiz-choice-state';stateSpan.setAttribute('aria-hidden','true');
  button.append(nameSpan,stateSpan);
  button.addEventListener('click',()=>{
   if(!round||round.complete||round.answers.length!==round.cursor)return;
   if(selected.has(type))selected.delete(type);
   else if(selected.size<2)selected.add(type);
   else{notice('最多選 2 種屬性；請先取消其中一項。');return;}
   clearFeedback();renderChoices(null);
  });
  typeButtons.set(type,button);$('quiz-options').append(button);
 }
 $('quiz-start').addEventListener('click',start);$('quiz-restart').addEventListener('click',start);$('quiz-play-again').addEventListener('click',start);
 $('quiz-submit').addEventListener('click',submit);
 $('quiz-next').addEventListener('click',()=>{if(engine.advanceRound(round)){if(round.complete)results();else displayQuestion();}});
 document.addEventListener('pokeverse:catalog-ready',event=>{
  const data=event.detail;
  if(!sourceLink(data?.source))return;
  pool=engine.buildPool(data.records,data.source.national_id_range);source=data.source;acceptOfficialArtworks(data.artworks);
  $('quiz-start').disabled=pool.length<10;
  $('quiz-availability').textContent=pool.length>=10?'題庫已就緒 · '+pool.length.toLocaleString('zh-TW')+' 隻寶可夢 · '+officialArtworks.size+' 張官方圖':'完整且已核對的資料不足 10 筆，暫時無法出題。';
  $('quiz-pool-size').textContent=pool.length.toLocaleString('zh-TW');
  if(!round)showSource(source);
 });
 document.addEventListener('pokeverse:catalog-unavailable',()=>{
  if(round)return;pool=[];$('quiz-start').disabled=true;$('quiz-availability').textContent='題庫資料暫時無法載入，請重新整理；圖鑑仍可依目前可用資料瀏覽。';
 });
 best=readBest();showBest();
})();
