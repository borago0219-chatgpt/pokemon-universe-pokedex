const typeNames={normal:'一般',fire:'火',water:'水',electric:'電',grass:'草',ice:'冰',fighting:'格鬥',poison:'毒',ground:'地面',flying:'飛行',psychic:'超能力',bug:'蟲',rock:'岩石',ghost:'幽靈',dragon:'龍',dark:'惡',steel:'鋼',fairy:'妖精'};
const colors={normal:'#9da8a2',fire:'#fd9b56',water:'#62b9ff',electric:'#ffdb69',grass:'#8bda95',ice:'#8de6e7',fighting:'#e99179',poison:'#b58de9',ground:'#d4b578',flying:'#9bb8f8',psychic:'#ed8cab',bug:'#a4cf6b',rock:'#b9b19a',ghost:'#a4a0e9',dragon:'#8f9aff',dark:'#8c94a3',steel:'#a1c1cb',fairy:'#f4aad9'};
let records=[],guideRecords=[];
const $=s=>document.querySelector(s);
// Draft display is disabled by default; hostname alone is not access control.
// Enable only after server-side access controls are verified for the test environment.
const privatePreview=false;
const guidesFor=id=>guideRecords.filter(g=>Number(g.national_id)===Number(id));
if(!privatePreview)document.querySelector('.preview-banner')?.remove();
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const q=$('#q').value.trim().toLowerCase(),t=$('#type').value;
 const found=records.filter(p=>(!q||[p.id,p.name_zh,p.name_en].some(x=>String(x??'').toLowerCase().includes(q)))&&(!t||(p.types||[]).includes(t))).sort((a,b)=>Number(a.id)-Number(b.id));
 $('#grid').innerHTML=found.map(p=>`<button class="poke" data-id="${Number(p.id)}" style="--accent:${colors[(p.types||[])[0]]||'#6b9ca7'}"><div class="art" style="--shade:${colors[(p.types||[])[0]]||'#6b9ca7'}33"><span class="mark" aria-label="插畫尚未核准展示">✦</span></div><span class="num">#${String(p.id).padStart(4,'0')}</span><h3>${escapeHTML(p.name_zh||p.name_en)}</h3><span class="en">${escapeHTML(p.name_en)}</span><div class="tags">${(p.types||[]).map(x=>`<span class="tag">${escapeHTML(typeNames[x]||x)}</span>`).join('')}</div>${privatePreview&&guidesFor(p.id).length?`<span class="draft-count">${guidesFor(p.id).length} 筆待審指南</span>`:''}</button>`).join('');
 $('#empty').hidden=found.length>0;
 document.querySelectorAll('.poke').forEach(b=>b.addEventListener('click',()=>details(records.find(p=>p.id===Number(b.dataset.id)))));
}

const guideLabels={main:'基本資料','main-series':'各版本總覽','scarlet-violet':'朱／紫', 'pokemon-go':'Pokémon GO','red-blue-yellow':'紅／綠／藍／皮卡丘','lets-go':"Let's Go",bdsp:'晶燦鑽石／明亮珍珠','sword-shield':'劍／盾','legends-za':'傳說 Z-A'};
const topicLabels={profile:'基本資料',availability:'可取得性',capture:'捕捉／取得',moveset:'配招'};
const fieldLabels={coverage:'涵蓋範圍',method:'取得方法',methods:'取得方法',base_game:'本篇',dlc:'追加內容',unlock:'解鎖條件',location_note:'地點說明',level_range:'等級範圍',proposed_moves:'草稿配招',rationale:'配招思路',scope:'適用範圍',verification_required:'仍待核查',current_availability:'目前可取得性',confirmed_historical:'歷史紀錄',confirmed_regional_current:'現行地區限定',fast_attacks:'一般招式',charged_attacks:'特殊招式',evolution:'進化'};
function label(key){return fieldLabels[key]||key.replaceAll('_',' ');}
function safeLink(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}catch{return null;}}
function renderValue(value){
 if(value===null||value===undefined)return '待確認';
 if(Array.isArray(value))return '<ul class="guide-list">'+value.map(item=>'<li>'+renderValue(item)+'</li>').join('')+'</ul>';
 if(typeof value==='object')return '<dl class="guide-fields">'+Object.entries(value).map(([k,v])=>'<dt>'+escapeHTML(label(k))+'</dt><dd>'+renderValue(v)+'</dd>').join('')+'</dl>';
 return escapeHTML(value);
}
function renderGuide(guide){
 const c=guide.content||{};
 let body='';
 if(guide.topic==='availability'&&Array.isArray(c.verified_versions)){
  body='<div class="matrix-scroll"><table class="version-matrix"><thead><tr><th>世代</th><th>版本</th><th>取得方式</th><th>狀態</th></tr></thead><tbody>'+
   c.verified_versions.map(row=>'<tr><td>'+escapeHTML(row.generation)+'</td><td>'+escapeHTML((row.versions||[]).join('／'))+'</td><td>'+escapeHTML(row.method||'待確認')+'</td><td>'+escapeHTML(row.status||'待確認')+'</td></tr>').join('')+
   '</tbody></table></div>';
 }
 body+='<dl class="guide-fields">'+Object.entries(c).filter(([k])=>!['display_name','verified_versions'].includes(k)).map(([k,v])=>'<dt>'+escapeHTML(label(k))+'</dt><dd>'+renderValue(v)+'</dd>').join('')+'</dl>';
 const sources=(guide.sources||[]).map(s=>{const href=safeLink(s.url);return href?'<li><a href="'+escapeHTML(href)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(s.title||href)+'</a></li>':'';}).join('');
 return '<article class="guide-card"><h3>'+escapeHTML(topicLabels[guide.topic]||guide.topic)+' <small class="status">'+escapeHTML(guide.status==='needs_review'?'待審核':'草稿')+'</small></h3>'+body+
  '<p class="small">最後查核：'+escapeHTML(guide.checked_at||'未註明')+'；僅供私人草稿預覽，尚未核准公開使用。</p>'+
  '<details><summary>查核來源</summary><ul>'+sources+'</ul></details></article>';
}
function profilePanel(profile){
 const c=profile?.content||{};
 if(!profile)return '<p class="detailnote">身高、體重、特性、種族值與進化資料待建立。</p>';
 const stats=c.base_stats_from_generation_2||{};
 const statNames={hp:'HP',attack:'攻擊',defense:'防禦',special_attack:'特攻',special_defense:'特防',speed:'速度'};
 const bars=Object.entries(statNames).map(([key,name])=>'<div class="stat-row"><span>'+name+'</span><meter min="0" max="255" value="'+Math.max(0,Math.min(255,Number(stats[key])||0))+'"></meter><b>'+escapeHTML(stats[key]??'—')+'</b></div>').join('');
 const ability=(c.abilities?.regular||[]).join('、')||'待查核';
 const hidden=(c.abilities?.hidden||[]).join('、')||'待查核';
 return '<section class="profile-panel" aria-label="基本資料草稿"><div class="profile-facts"><div><small>身高</small><strong>'+escapeHTML(c.height_m??'—')+' m</strong></div><div><small>體重</small><strong>'+escapeHTML(c.weight_kg??'—')+' kg</strong></div><div><small>特性</small><strong>'+escapeHTML(ability)+'</strong></div><div><small>隱藏特性</small><strong>'+escapeHTML(hidden)+'</strong></div></div><h3>種族值 <small>總和 '+escapeHTML(stats.total??'—')+'</small></h3>'+bars+'<p class="small">'+escapeHTML(c.generation_1_stat_note||'')+'</p><h3>進化路線</h3><p class="evolution">'+escapeHTML(c.evolution||'待查核')+'</p></section>';
}
function details(p){
 if(!p)return;
 const relevant=privatePreview?guidesFor(p.id):[];
 const games=[...new Set(relevant.map(g=>g.game))];
 const tabs=games.map((game,i)=>'<button class="guide-tab" type="button" data-game="'+escapeHTML(game)+'" aria-selected="'+(i===0?'true':'false')+'">'+escapeHTML(guideLabels[game]||game)+'</button>').join('');
 const guideBody=relevant.length?'<div class="guide-tabs" role="tablist" aria-label="遊戲版本">'+tabs+'</div><div id="guide-content"></div>':
  '<p class="detailnote">目前沒有此編號的指南草稿。</p>';
 $('#detailbody').innerHTML='<div class="eyebrow">NATIONAL DEX #'+String(p.id).padStart(4,'0')+'</div><h2>'+escapeHTML(p.name_zh||p.name_en)+' <small>'+escapeHTML(p.name_en)+'</small></h2>'+
  '<div class="tags">'+p.types.map(t=>'<span class="tag">'+escapeHTML(typeNames[t]||t)+'</span>').join('')+'</div>'+
  '<p class="detailnote">'+(privatePreview?'Work 本機私人預覽：以下含尚待審核的研究草稿，不代表已確認事實。':'攻略指南尚未核准公開展示。')+' 候選圖片權利待審，暫以占位符表示。</p>'+(privatePreview?profilePanel(relevant.find(g=>g.topic==='profile')):'')+guideBody;
 if(games.length){
  const show=game=>{
   document.querySelectorAll('.guide-tab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.game===game)));
   $('#guide-content').innerHTML=relevant.filter(g=>g.game===game).map(renderGuide).join('');
  };
  document.querySelectorAll('.guide-tab').forEach(b=>b.addEventListener('click',()=>show(b.dataset.game)));
  show(games[0]);
 }
 $('#detail').showModal();
}
async function init(){
 try{
  const response=await fetch('./data/pokemon.json',{cache:'no-store'});
  if(!response.ok)throw new Error('fetch failed');
  const data=await response.json();
  records=Array.isArray(data.pokemon)?data.pokemon:[];
  if(privatePreview){try{const guideResponse=await fetch('./data/guides.json',{cache:'no-store'});if(guideResponse.ok){const guideData=await guideResponse.json();guideRecords=Array.isArray(guideData.guides)?guideData.guides:[];}}catch{guideRecords=[];}}
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