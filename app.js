const typeNames={normal:'一般',fire:'火',water:'水',electric:'電',grass:'草',ice:'冰',fighting:'格鬥',poison:'毒',ground:'地面',flying:'飛行',psychic:'超能力',bug:'蟲',rock:'岩石',ghost:'幽靈',dragon:'龍',dark:'惡',steel:'鋼',fairy:'妖精'};
const colors={normal:'#9da8a2',fire:'#fd9b56',water:'#62b9ff',electric:'#ffdb69',grass:'#8bda95',ice:'#8de6e7',fighting:'#e99179',poison:'#b58de9',ground:'#d4b578',flying:'#9bb8f8',psychic:'#ed8cab',bug:'#a4cf6b',rock:'#b9b19a',ghost:'#a4a0e9',dragon:'#8f9aff',dark:'#8c94a3',steel:'#a1c1cb',fairy:'#f4aad9'};
let records=[],guideRecords=[],displayEntries=[];
let bulbasaurArt=false;
async function loadApprovedArtwork(){
 try{
  const response=await fetch('./assets/generated/001-bulbasaur-stepping-01.json',{cache:'no-store'});
  if(!response.ok)return;
  const m=await response.json();
  bulbasaurArt=Number(m.national_id)===1 &&
    m.asset==='assets/generated/001-bulbasaur-stepping-01.jpg' &&
    m.blob_sha==='bd82571241715f5f9c1c29dff978cb60dab347bf' &&
    m.project_approval?.quality==='approved' &&
    m.project_approval?.private_pokedex_use==='approved';
 }catch{bulbasaurArt=false}
}
const artPath='./assets/generated/001-bulbasaur-stepping-01.jpg';
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const q=$('#q').value.trim().toLowerCase(),t=$('#type').value;
 const idQuery=/^#?0*\d+$/.test(q)?Number(q.replace(/^#/,'')):null;
 const found=records.filter(p=>(!q||[p.id,p.name_zh,p.name_en].some(x=>String(x??'').toLowerCase().includes(q))||(idQuery!==null&&Number(p.id)===idQuery))&&(!t||p.types.includes(t)));
 $('#grid').innerHTML=found.map(p=>`<button class="poke" data-id="${p.id}"><div class="art" style="--shade:${colors[p.types[0]]||'#6b9ca7'}33">${bulbasaurArt&&Number(p.id)===1?'<img class="poke-artwork" src="'+artPath+'" width="1024" height="1024" loading="lazy" decoding="async" alt="妙蛙種子原創插畫">':'<span class="mark" aria-label="插畫尚未完成">✦</span>'}</div><span class="num">#${String(p.id).padStart(4,'0')}</span><h3>${escapeHTML(p.name_zh||p.name_en)}</h3><span class="en">${escapeHTML(p.name_en)}</span><div class="tags">${p.types.map(x=>`<span class="tag">${escapeHTML(typeNames[x]||x)}</span>`).join('')}</div></button>`).join('');
 $('#empty').hidden=found.length>0;
 document.querySelectorAll('.poke-artwork').forEach(img=>img.addEventListener('error',()=>{img.replaceWith(Object.assign(document.createElement('span'),{className:'mark',textContent:'✦'}));}));
 document.querySelectorAll('.poke').forEach(b=>b.addEventListener('click',()=>details(records.find(p=>p.id===Number(b.dataset.id)))));
}

const statNames={hp:'HP',attack:'攻擊',defense:'防禦',special_attack:'特攻',special_defense:'特防',speed:'速度'};
const gameNames={'pokemon-go':'Pokémon GO','main-series':'主系列總覽','scarlet-violet':'朱／紫','red-blue-yellow':'紅／綠／藍／皮卡丘','lets-go':"Let's Go",bdsp:'晶燦鑽石／明亮珍珠','sword-shield':'劍／盾','legends-za':'傳說 Z-A'};
function safeUrl(s){try{const u=new URL(s);return u.protocol==='https:'?u.href:null}catch{return null}}
function valueHtml(v,depth=0){
 if(v==null)return '待確認';
 if(depth>4)return '詳情待整理';
 if(Array.isArray(v))return '<ul>'+v.slice(0,50).map(x=>'<li>'+valueHtml(x,depth+1)+'</li>').join('')+'</ul>';
 if(typeof v==='object')return '<dl>'+Object.entries(v).slice(0,50).map(([k,x])=>'<dt>'+escapeHTML(k.replaceAll('_',' '))+'</dt><dd>'+valueHtml(x,depth+1)+'</dd>').join('')+'</dl>';
 return escapeHTML(v);
}
function renderApprovedGuide(g){
 const sources=(g.sources||[]).map(s=>{const url=safeUrl(s.url);return url?'<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(s.title||url)+'</a>':''}).filter(Boolean).join(' · ');
 return '<article class="guide-card"><h4>'+escapeHTML(g.topic)+'</h4>'+valueHtml(g.content)+'<p class="small">查核日期：'+escapeHTML(g.checked_at||'未註明')+'；來源：'+sources+'</p></article>';
}
function renderProfile(p){
 const entry=displayEntries.find(e=>Number(e.national_id)===Number(p.id)&&e.display_status==='selected_fields_verified');
 const g=guideRecords.find(g=>g.key===entry?.guide_key&&Number(g.national_id)===Number(p.id)&&g.topic==='profile'&&g.checked_at===entry.guide_checked_at);
 if(!entry||!g||!Array.isArray(entry.fields)||!entry.fields.every(k=>Object.hasOwn(g.content||{},k)))return '<p class="detailnote">身高、體重、特性與種族值尚待核對。</p>';
 const c=g.content,stats=c.base_stats_from_generation_2||{},keys=Object.keys(statNames),values=keys.map(k=>Math.max(0,Math.min(255,Number(stats[k])||0)));
 const bars=keys.map((k,i)=>'<div class="stat-row"><span>'+statNames[k]+'</span><div class="stat-track"><span style="width:'+Math.min(100,values[i]/160*100).toFixed(1)+'%"></span></div><b>'+values[i]+'</b></div>').join('');
 const points=values.map((v,i)=>{const a=-Math.PI/2+i*Math.PI/3;return (110+v/160*78*Math.cos(a)).toFixed(1)+','+(110+v/160*78*Math.sin(a)).toFixed(1)}).join(' ');
 const evo=(entry.evolution_ids||[]).map(id=>{const r=records.find(x=>Number(x.id)===Number(id));return r?'<button type="button" class="evo-stage" data-evo="'+Number(id)+'"><small>#'+String(id).padStart(4,'0')+'</small><strong>'+escapeHTML(r.name_zh||r.name_en)+'</strong></button>':''}).filter(Boolean).join('<span class="evo-arrow" aria-hidden="true">→</span>');
 const sources=(entry.source_urls||[]).map(s=>{const url=safeUrl(s);return url?'<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(new URL(url).hostname)+'</a>':''}).filter(Boolean).join(' · ');
 return '<section class="profile-section"><div class="section-title"><h3>基本資料</h3><span class="review-pill">選定欄位已核對</span></div><div class="profile-facts"><div><span>身高</span><strong>'+escapeHTML(c.height_m)+' m</strong></div><div><span>體重</span><strong>'+escapeHTML(c.weight_kg)+' kg</strong></div><div><span>一般特性</span><strong>'+escapeHTML((c.abilities.regular||[]).join('、'))+'</strong></div><div><span>隱藏特性</span><strong>'+escapeHTML((c.abilities.hidden||[]).join('、'))+'</strong></div></div><div class="section-title"><h3>種族值</h3><span class="small">現行六項制 · 合計 '+escapeHTML(stats.total)+'</span></div><div class="stats-panel"><div class="stat-bars">'+bars+'</div><svg class="stat-radar" viewBox="0 0 220 220" role="img" aria-label="種族值雷達圖：'+keys.map((k,i)=>statNames[k]+values[i]).join('，')+'"><polygon points="110,32 177.5,71 177.5,149 110,188 42.5,149 42.5,71" fill="none" stroke="#647694"/><polygon points="'+points+'" fill="#8bda9580" stroke="#89e6b1" stroke-width="2"/></svg></div><div class="section-title"><h3>進化路線</h3></div><div class="evolution-line">'+evo+'</div><p class="small">進化等級與版本例外待完整審核。欄位核對：'+escapeHTML(entry.verified_at)+'；來源：'+sources+'。</p></section>';
}
function details(p){
 if(!p)return;
 const relevant=guideRecords.filter(g=>Number(g.national_id)===Number(p.id)&&g.topic!=='profile');
 const games=[...new Set(['pokemon-go','main-series',...relevant.map(g=>g.game)])];
 const tabs=games.map((game,i)=>'<button type="button" class="guide-tab" role="tab" aria-selected="'+(i===0?'true':'false')+'" data-game="'+escapeHTML(game)+'">'+escapeHTML(gameNames[game]||game)+'</button>').join('');
 const image=bulbasaurArt&&Number(p.id)===1?'<img class="detail-artwork" src="'+artPath+'" width="1024" height="1024" alt="妙蛙種子原創插畫">':'';
 $('#detailbody').innerHTML='<div class="eyebrow">NATIONAL DEX #'+String(p.id).padStart(4,'0')+'</div><h2>'+escapeHTML(p.name_zh||p.name_en)+' <small>'+escapeHTML(p.name_en)+'</small></h2><div class="tags">'+(p.types||[]).map(t=>'<span class="tag">'+escapeHTML(typeNames[t]||t)+'</span>').join('')+'</div>'+image+renderProfile(p)+'<section class="guide-section"><div class="section-title"><h3>遊戲版本與攻略</h3><span class="review-pill pending">逐項審核中</span></div><div class="guide-tabs" role="tablist" aria-label="遊戲版本">'+tabs+'</div><div id="guide-content" role="tabpanel"></div></section>';
 const show=game=>{
  document.querySelectorAll('.guide-tab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.game===game)));
  const list=relevant.filter(g=>g.game===game),approved=list.filter(g=>['approved','verified','reviewed'].includes(g.status));
  $('#guide-content').innerHTML=approved.map(renderApprovedGuide).join('')+'<p class="guide-pending">'+(list.length>approved.length?'已有 '+(list.length-approved.length)+' 筆研究草稿等待審核。':'')+(approved.length?'':'目前沒有可公開確認的取得方式或配招；未知與不適用仍待釐清。')+'</p>';
 };
 document.querySelectorAll('.guide-tab').forEach(b=>b.addEventListener('click',()=>show(b.dataset.game)));
 document.querySelectorAll('.evo-stage').forEach(b=>b.addEventListener('click',()=>details(records.find(r=>Number(r.id)===Number(b.dataset.evo)))));
 show(games[0]);
 if(!$('#detail').open)$('#detail').showModal();
}
async function init(){
 try{
  const response=await fetch('./data/pokemon.json',{cache:'no-store'});
  if(!response.ok)throw new Error('fetch failed');
  const data=await response.json();
  records=Array.isArray(data.pokemon)?data.pokemon:[];
  await loadApprovedArtwork();
  try{
   const [gr,dr]=await Promise.all([fetch('./data/guides.json',{cache:'no-store'}),fetch('./data/display-index.json',{cache:'no-store'})]);
   if(gr.ok&&dr.ok){const [guides,index]=await Promise.all([gr.json(),dr.json()]);guideRecords=Array.isArray(guides.guides)?guides.guides:[];displayEntries=Array.isArray(index.entries)?index.entries:[];}
  }catch{guideRecords=[];displayEntries=[];}
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