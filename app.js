const typeNames={normal:'一般',fire:'火',water:'水',electric:'電',grass:'草',ice:'冰',fighting:'格鬥',poison:'毒',ground:'地面',flying:'飛行',psychic:'超能力',bug:'蟲',rock:'岩石',ghost:'幽靈',dragon:'龍',dark:'惡',steel:'鋼',fairy:'妖精'};
const colors={normal:'#9da8a2',fire:'#fd9b56',water:'#62b9ff',electric:'#ffdb69',grass:'#8bda95',ice:'#8de6e7',fighting:'#e99179',poison:'#b58de9',ground:'#d4b578',flying:'#9bb8f8',psychic:'#ed8cab',bug:'#a4cf6b',rock:'#b9b19a',ghost:'#a4a0e9',dragon:'#8f9aff',dark:'#8c94a3',steel:'#a1c1cb',fairy:'#f4aad9'};
let records=[];
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const q=$('#q').value.trim().toLowerCase(),t=$('#type').value;
 const idQuery=/^#?0*\d+$/.test(q)?Number(q.replace(/^#/,'')):null;
 const found=records.filter(p=>(!q||[p.id,p.name_zh,p.name_en].some(x=>String(x??'').toLowerCase().includes(q))||(idQuery!==null&&Number(p.id)===idQuery))&&(!t||p.types.includes(t)));
 $('#grid').innerHTML=found.map(p=>`<button class="poke" data-id="${p.id}"><div class="art" style="--shade:${colors[p.types[0]]||'#6b9ca7'}33"><span class="mark" aria-label="插畫尚未完成">✦</span></div><span class="num">#${String(p.id).padStart(4,'0')}</span><h3>${escapeHTML(p.name_zh||p.name_en)}</h3><span class="en">${escapeHTML(p.name_en)}</span><div class="tags">${p.types.map(x=>`<span class="tag">${escapeHTML(typeNames[x]||x)}</span>`).join('')}</div></button>`).join('');
 $('#empty').hidden=found.length>0;
 document.querySelectorAll('.poke').forEach(b=>b.addEventListener('click',()=>details(records.find(p=>p.id===Number(b.dataset.id)))));
}
function details(p){
 if(!p)return;
 $('#detailbody').innerHTML=`<div class="eyebrow">NATIONAL DEX #${String(p.id).padStart(4,'0')}</div><h2>${escapeHTML(p.name_zh||p.name_en)} <small>${escapeHTML(p.name_en)}</small></h2><div class="tags">${p.types.map(t=>`<span class="tag">${escapeHTML(typeNames[t]||t)}</span>`).join('')}</div><p class="detailnote">這是初版。捕捉地點、可學招式、PvP / PvE 推薦配招及插圖尚待各遊戲版本查證，不會使用未核實的資料。</p><div class="detailgrid"><div><strong>Pokémon GO</strong><p>捕捉與取得：待查核<br>團體戰配招：待查核<br>PvP 配招：待查核</p></div><div><strong>主系列遊戲</strong><p>不同版本取得方式：待查核<br>版本相容性：待查核<br>對戰配招：待查核</p></div></div><p class="small">基本資料：<a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a>；更新日期：${escapeHTML(p.updated_at||'尚未標記')}</p>`;
 $('#detail').showModal();
}
async function init(){
 try{
  const response=await fetch('./data/pokemon.json',{cache:'no-store'});
  if(!response.ok)throw new Error('fetch failed');
  const data=await response.json();
  records=Array.isArray(data.pokemon)?data.pokemon:[];
  $('#total').textContent=records.length;
  $('#updated').textContent='資料更新：'+(data.updated_at||'未註明');
  const types=[...new Set(records.flatMap(p=>p.types||[]))].sort();
  $('#type').innerHTML='<option value="">全部屬性</option>'+types.map(t=>`<option value="${escapeHTML(t)}">${escapeHTML(typeNames[t]||t)}</option>`).join('');
  render();
 }catch(error){
  $('#updated').textContent='資料載入失敗';
  $('#grid').textContent='無法載入圖鑑資料，請重新整理頁面。';
 }
}
$('#q').addEventListener('input',render);
$('#type').addEventListener('change',render);
$('#close').addEventListener('click',()=>$('#detail').close());
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail'))$('#detail').close();});
init();