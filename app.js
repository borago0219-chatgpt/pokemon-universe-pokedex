const typeNames={normal:'一般',fire:'火',water:'水',electric:'電',grass:'草',ice:'冰',fighting:'格鬥',poison:'毒',ground:'地面',flying:'飛行',psychic:'超能力',bug:'蟲',rock:'岩石',ghost:'幽靈',dragon:'龍',dark:'惡',steel:'鋼',fairy:'妖精'};
const colors={normal:'#9da8a2',fire:'#fd9b56',water:'#62b9ff',electric:'#ffdb69',grass:'#8bda95',ice:'#8de6e7',fighting:'#e99179',poison:'#b58de9',ground:'#d4b578',flying:'#9bb8f8',psychic:'#ed8cab',bug:'#a4cf6b',rock:'#b9b19a',ghost:'#a4a0e9',dragon:'#8f9aff',dark:'#8c94a3',steel:'#a1c1cb',fairy:'#f4aad9'};
let records=[],guideRecords=[],displayEntries=[],displayFacts=[],reviewedGuides=[];
const artworks=new Map();
async function loadApprovedArtwork(index){
 const entries=Array.isArray(index?.artworks)?index.artworks:[];
 await Promise.all(entries.map(async entry=>{
  const id=Number(entry.national_id),asset=entry.asset;
  if(!Number.isInteger(id)||id<1||!records.some(p=>Number(p.id)===id)||typeof asset!=='string'||!/^assets\/generated\/[0-9]{3,4}-[a-z0-9-]+\.(?:jpg|jpeg|png|webp)$/.test(asset)||!entry.blob_sha||!/^[0-9a-f]{40}$/.test(entry.blob_sha))return;
  try{
   const response=await fetch('./'+asset.replace(/\.(?:jpg|jpeg|png|webp)$/i,'.json'),{cache:'no-store'});
   if(!response.ok)return;
   const metadata=await response.json();
   if(Number(metadata.national_id)===id&&metadata.asset===asset&&metadata.blob_sha===entry.blob_sha&&metadata.project_approval?.quality==='approved'&&metadata.project_approval?.private_pokedex_use==='approved')artworks.set(id,'./'+asset);
  }catch{}
 }));
}
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const q=$('#q').value.trim().toLowerCase(),t=$('#type').value,order=$('#order').value;
 const idQuery=/^#?0*\d+$/.test(q)?Number(q.replace(/^#/,'')):null;
 const found=records.filter(p=>(!q||[p.id,p.name_zh,p.name_en].some(x=>String(x??'').toLowerCase().includes(q))||(idQuery!==null&&Number(p.id)===idQuery))&&(!t||p.types.includes(t))).sort((a,b)=>order==='desc'?Number(b.id)-Number(a.id):Number(a.id)-Number(b.id));
 $('#grid').innerHTML=found.map(p=>`<button class="poke" data-id="${p.id}"><div class="art" style="--shade:${colors[p.types[0]]||'#6b9ca7'}33">${artworks.has(Number(p.id))?'<img class="poke-artwork" src="'+escapeHTML(artworks.get(Number(p.id)))+'" width="1024" height="1024" loading="lazy" decoding="async" alt="'+escapeHTML(p.name_zh||p.name_en)+'插畫">':'<span class="mark" aria-label="插畫尚未完成">✦</span>'}</div><span class="num">#${String(p.id).padStart(4,'0')}</span><h3>${escapeHTML(p.name_zh||p.name_en)}</h3><span class="en">${escapeHTML(p.name_en)}</span><div class="tags">${p.types.map(x=>`<span class="tag">${escapeHTML(typeNames[x]||x)}</span>`).join('')}</div></button>`).join('');
 $('#empty').hidden=found.length>0;
 document.querySelectorAll('.poke-artwork').forEach(img=>img.addEventListener('error',()=>{img.replaceWith(Object.assign(document.createElement('span'),{className:'mark',textContent:'✦'}));}));
 document.querySelectorAll('.poke').forEach(b=>b.addEventListener('click',()=>details(records.find(p=>p.id===Number(b.dataset.id)))));
}

const statNames={hp:'HP',attack:'攻擊',defense:'防禦',special_attack:'特攻',special_defense:'特防',speed:'速度'};
const gameNames={'red-green-blue-yellow':'紅／綠／藍／皮卡丘取得','firered-leafgreen':'火紅／葉綠','heartgold-soulsilver':'心金／魂銀','x-y':'X／Y','gold-silver-crystal':'金／銀／水晶','pokemon-go':'Pokémon GO','main-series':'主系列總覽','scarlet-violet':'朱／紫','red-blue-yellow':'紅／綠／藍／皮卡丘','lets-go':"Let's Go",bdsp:'晶燦鑽石／明亮珍珠','sword-shield':'劍／盾','legends-za':'傳說 Z-A'};
const guideFieldNames={coverage:'涵蓋範圍',verified_versions:'版本取得總覽',not_yet_verified:'尚未核實',version_count_listed:'列舉版本標籤數',generation:'世代',version_methods:'各版取得方法',version_note:'版本差異',availability:'可取得性',version_difference:'版本差異',evolution:'進化條件',evolution_timing:'進化時點',other_historical_channels:'其他歷史渠道',current_community_field_research:'當季社群田野調查清單',task:'調查任務',possible_encounter:'可能遭遇',period:'適用期間',region:'適用地區',dates:'日期',date:'日期',event:'活動',checked_at:'查核日期',long_term_updates:'後續更新',ability:'特性建議',item_nature_evs:'道具、性格與努力值',competitive_status:'適用玩法與競技限制',versions:'適用版本',base_game:'遊戲本篇',dlc:'追加內容',method:'取得方法',methods:'取得途徑',unlock:'解鎖條件',location_note:'地點補充',status_note:'版本注意',scope:'適用範圍',proposed_moves:'建議招式',rationale:'配招思路',caution:'限制與注意',verification_required:'仍須補充',fast_attacks:'一般招式',charged_attacks:'特殊招式',special_form_moves:'特殊形態招式',pve:'PvE',pvp:'PvP',limited_move_caution:'限定招式提醒',normal_wild_capture:'一般野外捕捉',time_capsule_unlock:'時光膠囊解鎖',availability_type:'取得類型',historical_event_note:'歷史活動提醒',legality_note:'合法性說明',mechanics_note:'世代機制',locations:'地點',level_range:'等級範圍',community_suggested:'社群參考',source_scope:'資料範圍',shadow:'暗影',purified:'淨化',condition:'條件',location:'地點',type:'類型',status:'狀態',note:'備註',current_availability:'目前取得',confirmed_historical:'歷史取得',forest_biome_guidance:'森林生態區通則',dynamax_history:'極巨歷史',confirmed_regional_current:'地區限定現況'};
const topicNames={capture:'捕捉與取得',moveset:'招式與配招',availability:'版本總覽',profile:'基本資料'};
function safeUrl(s){try{const u=new URL(s);return u.protocol==='https:'?u.href:null}catch{return null}}
function valueHtml(v,depth=0){
 if(v==null)return '待確認';
 if(depth>4)return '詳情待整理';
 if(Array.isArray(v))return '<ul>'+v.slice(0,50).map(x=>'<li>'+valueHtml(x,depth+1)+'</li>').join('')+'</ul>';
 if(typeof v==='object')return '<dl>'+Object.entries(v).slice(0,50).map(([k,x])=>'<dt>'+escapeHTML(guideFieldNames[k]||k.replaceAll('_',' '))+'</dt><dd>'+valueHtml(x,depth+1)+'</dd>').join('')+'</dl>';
 return escapeHTML(v);
}
function renderApprovedGuide(g){
 const decision=reviewedGuides.find(r=>r.key===g.key&&r.decision==='passed');
 const sources=(g.sources||[]).map(s=>{const url=safeUrl(s.url);return url?'<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(s.title||url)+'</a>':''}).filter(Boolean).join(' · ');
 const fields=Object.entries(g.content||{}).filter(([k])=>k!=='display_name').map(([k,v])=>'<dt>'+escapeHTML(guideFieldNames[k]||k.replaceAll('_',' '))+'</dt><dd>'+valueHtml(v)+'</dd>').join('');
 return '<article class="guide-card approved-guide"><div class="section-title"><h4>'+escapeHTML(topicNames[g.topic]||g.topic)+'</h4><span class="review-pill">內容審核：過</span></div><dl class="guide-data">'+fields+'</dl><p class="small">資料查核：'+escapeHTML(g.checked_at||'未註明')+'；審核決定：'+escapeHTML(decision?.reviewed_at||'未註明')+'；來源：'+(sources||'未列出')+'</p></article>';
}
function guideFingerprint(g){let s=JSON.stringify({content:g.content,sources:g.sources,checked_at:g.checked_at,status:g.status}),h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0')+':'+s.length;}
function approvedReview(g){
 const decision=reviewedGuides.find(r=>r.key===g.key&&Number(r.national_id)===Number(g.national_id)&&r.decision==='passed');
 return decision&&decision.fingerprint===guideFingerprint(g);
}
function mergeReviewedSnapshots(raw,snapshots){
 const merged=new Map(raw.map(g=>[Number(g.national_id)+'|'+g.key,g]));
 for(const g of Array.isArray(snapshots)?snapshots:[]){
  const id=Number(g?.national_id);
  if(!Number.isInteger(id)||id<1||g.key!==id+':'+g.game+':'+g.topic||!approvedReview(g))continue;
  merged.set(id+'|'+g.key,g);
 }
 return [...merged.values()];
}
function renderProfile(p){
 const entry=displayEntries.find(e=>Number(e.national_id)===Number(p.id)&&e.display_status==='selected_fields_verified');
 const g=guideRecords.find(g=>g.key===entry?.guide_key&&Number(g.national_id)===Number(p.id)&&g.topic==='profile'&&g.checked_at===entry.guide_checked_at);
 if(!entry||!g||!Array.isArray(entry.fields)||!entry.fields.every(k=>Object.hasOwn(g.content||{},k))||JSON.stringify(entry.fields.map(k=>g.content[k]))!==JSON.stringify(entry.verified_values))return '<p class="detailnote">身高、體重、特性與種族值尚待核對。</p>';
 const c=g.content,stats=c.base_stats_from_generation_2||{},keys=Object.keys(statNames),values=keys.map(k=>Math.max(0,Math.min(255,Number(stats[k])||0)));
 const bars=keys.map((k,i)=>'<div class="stat-row"><span>'+statNames[k]+'</span><div class="stat-track"><span style="width:'+Math.min(100,values[i]/160*100).toFixed(1)+'%"></span></div><b>'+values[i]+'</b></div>').join('');
 const points=values.map((v,i)=>{const a=-Math.PI/2+i*Math.PI/3;return (110+v/160*78*Math.cos(a)).toFixed(1)+','+(110+v/160*78*Math.sin(a)).toFixed(1)}).join(' ');
 const evo=(entry.evolution_ids||[]).map(id=>{const r=records.find(x=>Number(x.id)===Number(id));return r?'<button type="button" class="evo-stage" data-evo="'+Number(id)+'"><small>#'+String(id).padStart(4,'0')+'</small><strong>'+escapeHTML(r.name_zh||r.name_en)+'</strong></button>':''}).filter(Boolean).join('<span class="evo-arrow" aria-hidden="true">→</span>');
 const sources=(entry.source_urls||[]).map(s=>{const url=safeUrl(s);return url?'<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(new URL(url).hostname)+'</a>':''}).filter(Boolean).join(' · ');
 return '<section class="profile-section"><div class="section-title"><h3>基本資料</h3><span class="review-pill">基本資料審核：過</span></div><div class="profile-facts"><div><span>身高</span><strong>'+escapeHTML(c.height_m)+' m</strong></div><div><span>體重</span><strong>'+escapeHTML(c.weight_kg)+' kg</strong></div><div><span>一般特性</span><strong>'+escapeHTML((c.abilities.regular||[]).join('、'))+'</strong></div><div><span>隱藏特性</span><strong>'+escapeHTML((c.abilities.hidden||[]).join('、'))+'</strong></div></div><div class="section-title"><h3>種族值</h3><span class="small">現行六項制 · 合計 '+escapeHTML(stats.total)+'</span></div><div class="stats-panel"><div class="stat-bars">'+bars+'</div><svg class="stat-radar" viewBox="0 0 220 220" role="img" aria-label="種族值雷達圖：'+keys.map((k,i)=>statNames[k]+values[i]).join('，')+'"><polygon points="110,32 177.5,71 177.5,149 110,188 42.5,149 42.5,71" fill="none" stroke="#647694"/><polygon points="'+points+'" fill="#8bda9580" stroke="#89e6b1" stroke-width="2"/></svg></div><div class="section-title"><h3>進化路線</h3></div><div class="evolution-line">'+evo+'</div><p class="small">'+(approvedReview(g)?escapeHTML(c.evolution||'進化條件未列出'):'進化等級與版本例外待完整審核。')+' 欄位核對：'+escapeHTML(entry.verified_at)+'；來源：'+sources+'。</p></section>';
}

function getPath(value,path){return String(path).split('.').reduce((v,k)=>v==null?undefined:v[k],value)}
function renderFact(f){
 const guide=guideRecords.find(g=>g.key===f.guide_key&&Number(g.national_id)===Number(f.national_id)&&g.checked_at===f.guide_checked_at);
 if(!guide||JSON.stringify(getPath(guide.content,f.match_path))!==JSON.stringify(f.match_value))return '';
 const url=safeUrl(f.source_url);
 return '<article class="guide-card verified-fact"><h4>'+escapeHTML(f.label)+'</h4><p>'+escapeHTML(f.text)+'</p><p class="small">核對：'+escapeHTML(f.verified_at)+'；'+(url?'<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">查看來源</a>':'來源待補')+'</p></article>';
}
function details(p){
 if(!p)return;
 const relevant=guideRecords.filter(g=>Number(g.national_id)===Number(p.id)&&g.topic!=='profile');
 const games=[...new Set(['pokemon-go','main-series',...relevant.map(g=>g.game)])];
 const tabs=games.map((game,i)=>'<button type="button" class="guide-tab" role="tab" aria-selected="'+(i===0?'true':'false')+'" data-game="'+escapeHTML(game)+'">'+escapeHTML(gameNames[game]||game)+'</button>').join('');
 const image=artworks.has(Number(p.id))?'<img class="detail-artwork" src="'+escapeHTML(artworks.get(Number(p.id)))+'" width="1024" height="1024" decoding="async" alt="'+escapeHTML(p.name_zh||p.name_en)+'插畫">':'';
 $('#detailbody').innerHTML='<div class="eyebrow">NATIONAL DEX #'+String(p.id).padStart(4,'0')+'</div><h2>'+escapeHTML(p.name_zh||p.name_en)+' <small>'+escapeHTML(p.name_en)+'</small></h2><div class="tags">'+(p.types||[]).map(t=>'<span class="tag">'+escapeHTML(typeNames[t]||t)+'</span>').join('')+'</div>'+image+renderProfile(p)+'<section class="guide-section"><div class="section-title"><h3>遊戲版本與攻略</h3><span class="review-pill pending">逐篇審核結果</span></div><div class="guide-tabs" role="tablist" aria-label="遊戲版本">'+tabs+'</div><div id="guide-content" role="tabpanel"></div></section>';
 const show=game=>{
  document.querySelectorAll('.guide-tab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.game===game)));
  const list=relevant.filter(g=>g.game===game),approved=list.filter(approvedReview);
  const failed=list.filter(g=>reviewedGuides.some(r=>r.key===g.key&&r.decision==='failed'&&Number(r.national_id)===Number(g.national_id)&&(r.suppress_previous_versions===true||r.fingerprint===guideFingerprint(g))));
  const unknown=list.length-approved.length-failed.length;
  const facts=displayFacts.filter(f=>Number(f.national_id)===Number(p.id)&&f.game===game).map(renderFact).filter(Boolean);
  const failedNotes=failed.map(g=>{const decision=reviewedGuides.find(r=>r.key===g.key&&r.decision==='failed');return '<li>'+escapeHTML(topicNames[g.topic]||g.topic)+'：'+escapeHTML(decision.reason||'內容未通過')+'</li>'}).join('');
  $('#guide-content').innerHTML=facts.join('')+approved.map(renderApprovedGuide).join('')+(failed.length?'<div class="guide-pending"><strong>未通過 '+failed.length+' 篇</strong><ul>'+failedNotes+'</ul></div>':'')+(unknown?'<p class="guide-pending">另有 '+unknown+' 篇尚未審核。</p>':'')+(!facts.length&&!approved.length&&!failed.length?'<p class="guide-pending">此版本尚無通過的取得方式或配招。</p>':'');
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
  try{
   const [gr,dr]=await Promise.all([fetch('./data/guides.json',{cache:'no-store'}),fetch('./data/display-index.json',{cache:'no-store'})]);
   if(gr.ok&&dr.ok){const [guides,index]=await Promise.all([gr.json(),dr.json()]);guideRecords=Array.isArray(guides.guides)?guides.guides:[];displayEntries=Array.isArray(index.entries)?index.entries:[];displayFacts=Array.isArray(index.facts)?index.facts:[];reviewedGuides=Array.isArray(index.reviewed_guides)?index.reviewed_guides:[];guideRecords=mergeReviewedSnapshots(guideRecords,index.guide_snapshots);await loadApprovedArtwork(index);}
  }catch{guideRecords=[];displayEntries=[];displayFacts=[];reviewedGuides=[];}
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
$('#order').addEventListener('change',render);
$('#close').addEventListener('click',()=>$('#detail').close());
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail'))$('#detail').close();});
init();