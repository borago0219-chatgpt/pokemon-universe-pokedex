const typeNames={normal:'一般',fire:'火',water:'水',electric:'電',grass:'草',ice:'冰',fighting:'格鬥',poison:'毒',ground:'地面',flying:'飛行',psychic:'超能力',bug:'蟲',rock:'岩石',ghost:'幽靈',dragon:'龍',dark:'惡',steel:'鋼',fairy:'妖精'};
const colors={normal:'#9da8a2',fire:'#fd9b56',water:'#62b9ff',electric:'#ffdb69',grass:'#8bda95',ice:'#8de6e7',fighting:'#e99179',poison:'#b58de9',ground:'#d4b578',flying:'#9bb8f8',psychic:'#ed8cab',bug:'#a4cf6b',rock:'#b9b19a',ghost:'#a4a0e9',dragon:'#8f9aff',dark:'#8c94a3',steel:'#a1c1cb',fairy:'#f4aad9'};
let records=[],guideRecords=[],displayEntries=[],displayFacts=[],reviewedGuides=[];
const artworks=new Map();
let favoriteIds=new Set(),favoritesOnly=false;
const favoritesStorageKey='pokeverse:favorites:v1';
function restoreFavorites(){
 try{
  const saved=JSON.parse(localStorage.getItem(favoritesStorageKey)||'[]');
  favoriteIds=new Set((Array.isArray(saved)?saved:[]).filter(id=>Number.isInteger(id)&&id>0&&id<=9999));
 }catch{favoriteIds=new Set();}
}
function persistFavorites(){
 try{localStorage.setItem(favoritesStorageKey,JSON.stringify([...favoriteIds]));return true;}catch{return false;}
}
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
function knownTypes(p){
 return Array.isArray(p?.types)?p.types.filter(t=>Object.hasOwn(typeNames,t)):[];
}
function renderTypeTags(types){
 const valid=Array.isArray(types)?types.filter(t=>Object.hasOwn(typeNames,t)):[];
 return valid.length?valid.map(t=>'<span class="tag type-tag" style="--type-color:'+colors[t]+'"><span class="type-dot" aria-hidden="true"></span>'+escapeHTML(typeNames[t])+'</span>').join(''):'<span class="tag">屬性待核對</span>';
}
function typeOptions(pokemon){
 return '<option value="">全部屬性（'+pokemon.length+'）</option>'+Object.keys(typeNames).map(t=>{
  const count=pokemon.filter(p=>knownTypes(p).includes(t)).length;
  return '<option value="'+t+'">'+typeNames[t]+'（'+count+'）</option>';
 }).join('');
}
function render(){
 const q=$('#q').value.trim().toLowerCase(),t=$('#type').value,order=$('#order').value;
 const idQuery=/^#?0*\d+$/.test(q)?Number(q.replace(/^#/,'')):null;
 const found=records.filter(p=>(!q||[p.id,p.name_zh,p.name_en].some(x=>String(x??'').toLowerCase().includes(q))||(idQuery!==null&&Number(p.id)===idQuery))&&(!t||knownTypes(p).includes(t))&&(!favoritesOnly||favoriteIds.has(Number(p.id)))).sort((a,b)=>order==='desc'?Number(b.id)-Number(a.id):Number(a.id)-Number(b.id));
 $('#grid').innerHTML=found.map(p=>`<article class="poke-card"><button class="poke" data-id="${p.id}" style="--accent:${colors[knownTypes(p)[0]]||'#6b9ca7'}"><div class="art" style="--shade:${colors[knownTypes(p)[0]]||'#6b9ca7'}33">${artworks.has(Number(p.id))?'<img class="poke-artwork" src="'+escapeHTML(artworks.get(Number(p.id)))+'" width="1024" height="1024" loading="lazy" decoding="async" alt="'+escapeHTML(p.name_zh||p.name_en)+'插畫">':'<span class="mark" aria-label="插畫尚未完成">✦</span>'}</div><span class="num">#${String(p.id).padStart(4,'0')}</span><h3>${escapeHTML(p.name_zh||p.name_en)}</h3><span class="en">${escapeHTML(p.name_en)}</span><div class="tags">${renderTypeTags(p.types)}</div></button><button class="favorite-button" type="button" data-favorite="${Number(p.id)}" aria-pressed="${favoriteIds.has(Number(p.id))}" aria-label="${favoriteIds.has(Number(p.id))?'取消收藏':'收藏'}${escapeHTML(p.name_zh||p.name_en)}" title="${favoriteIds.has(Number(p.id))?'取消收藏':'加入收藏'}">${favoriteIds.has(Number(p.id))?'★':'☆'}</button></article>`).join('');
 $('#empty').hidden=found.length>0;
 $('#result-count').textContent='顯示 '+found.length+' ／ '+records.length+' 隻寶可夢';
 $('#clear-search').hidden=$('#q').value.length===0;
 $('#reset-filters').disabled=!$('#q').value&&!t&&order==='asc'&&!favoritesOnly;
 $('#favorites-only').setAttribute('aria-pressed',String(favoritesOnly));
 $('#favorites-only').textContent='★ 只看收藏 · '+records.filter(p=>favoriteIds.has(Number(p.id))).length;
 $('#empty').textContent=t&&!records.some(p=>knownTypes(p).includes(t))?'目前尚未收錄「'+(typeNames[t]||'此')+'」屬性寶可夢，可重設篩選查看其他已收錄角色。':favoritesOnly&&!q&&!t?'尚未收藏符合條件的寶可夢，按卡片上的星號即可收藏。':'沒有符合條件的寶可夢，試著清除文字或重設篩選。';
 document.querySelectorAll('.favorite-button').forEach(b=>b.addEventListener('click',()=>{
  const id=Number(b.dataset.favorite);if(!Number.isInteger(id)||id<1)return;
  const added=!favoriteIds.has(id);
  if(added)favoriteIds.add(id);else favoriteIds.delete(id);
  const saved=persistFavorites();render();
  $('#saved-status').textContent=(added?'已加入收藏':'已取消收藏')+(saved?'':'（此瀏覽期間有效）');
  (document.querySelector('.favorite-button[data-favorite="'+id+'"]')||$('#favorites-only')).focus();
 }));
 document.querySelectorAll('.poke-artwork').forEach(img=>img.addEventListener('error',()=>{img.replaceWith(Object.assign(document.createElement('span'),{className:'mark',textContent:'✦'}));}));
 document.querySelectorAll('.poke').forEach(b=>b.addEventListener('click',()=>details(records.find(p=>p.id===Number(b.dataset.id)))));
}

const statNames={hp:'HP',attack:'攻擊',defense:'防禦',special_attack:'特攻',special_defense:'特防',speed:'速度'};
const gameNames={'red-green-blue-yellow':'紅／綠／藍／皮卡丘取得','firered-leafgreen':'火紅／葉綠','heartgold-soulsilver':'心金／魂銀','x-y':'X／Y','gold-silver-crystal':'金／銀／水晶','pokemon-go':'Pokémon GO','main-series':'主系列總覽','scarlet-violet':'朱／紫','red-blue-yellow':'紅／綠／藍／皮卡丘','lets-go':"Let's Go",bdsp:'晶燦鑽石／明亮珍珠','sword-shield':'劍／盾','legends-za':'傳說 Z-A'};
const guideFieldNames={coverage:'涵蓋範圍',verified_versions:'版本取得總覽',not_yet_verified:'尚未核實',version_count_listed:'列舉版本標籤數',generation:'世代',version_methods:'各版取得方法',version_note:'版本差異',availability:'可取得性',version_difference:'版本差異',evolution:'進化條件',evolution_timing:'進化時點',other_historical_channels:'其他歷史渠道',current_community_field_research:'當季社群田野調查清單',task:'調查任務',possible_encounter:'可能遭遇',period:'適用期間',region:'適用地區',dates:'日期',date:'日期',event:'活動',checked_at:'查核日期',long_term_updates:'後續更新',ability:'特性建議',item_nature_evs:'道具、性格與努力值',competitive_status:'適用玩法與競技限制',versions:'適用版本',base_game:'遊戲本篇',dlc:'追加內容',method:'取得方法',methods:'取得途徑',unlock:'解鎖條件',location_note:'地點補充',status_note:'版本注意',scope:'適用範圍',proposed_moves:'建議招式',rationale:'配招思路',caution:'限制與注意',verification_required:'仍須補充',fast_attacks:'一般招式',charged_attacks:'特殊招式',special_form_moves:'特殊形態招式',pve:'PvE',pvp:'PvP',limited_move_caution:'限定招式提醒',normal_wild_capture:'一般野外捕捉',time_capsule_unlock:'時光膠囊解鎖',availability_type:'取得類型',historical_event_note:'歷史活動提醒',legality_note:'合法性說明',mechanics_note:'世代機制',locations:'地點',level_range:'等級範圍',community_suggested:'社群參考',source_scope:'資料範圍',shadow:'暗影',purified:'淨化',condition:'條件',location:'地點',type:'類型',status:'狀態',note:'備註',current_availability:'目前取得',confirmed_historical:'歷史取得',forest_biome_guidance:'森林生態區通則',dynamax_history:'極巨歷史',confirmed_regional_current:'地區限定現況'};
const topicNames={capture:'捕捉與取得',moveset:'招式與配招',availability:'版本總覽',profile:'基本資料'};
function safeUrl(s){try{const u=new URL(s);return u.protocol==='https:'?u.href:null}catch{return null}}

Object.assign(guideFieldNames,{"version_groups":"各世代劇情配招","moves":"推薦招式","name":"招式","level":"習得等級","use":"使用方式","mode":"適用玩法","competitive_note":"對戰適用範圍","acquisition_preconditions_note":"取得前置提醒","abilities":"特性","regular":"一般特性","hidden":"隱藏特性","base_stats_from_generation_2":"第 2 代起的種族值","category":"分類","height_m":"身高（公尺）","weight_kg":"體重（公斤）","name_zh":"中文名","name_en":"英文名","name_ja":"日文名","national_id":"全國編號","generation_1_stat_note":"第 1 代種族值說明","form_note":"型態說明","other_confirmed_historical_method":"其他已確認歷史途徑","hp":"HP","attack":"攻擊","defense":"防禦","special_attack":"特攻","special_defense":"特防","speed":"速度","total":"合計","not_yet_verified":"尚未確認的延伸資訊","long_term_updates":"後續追蹤","availability":"取得類型"});
const versionNames={"Red":"紅","Green (Japan)":"綠（日版）","Blue (Japan)":"藍（日版）","Blue (International)":"藍（國際版）","Yellow":"皮卡丘","Gold":"金","Silver":"銀","Crystal":"水晶","Ruby":"紅寶石","Sapphire":"藍寶石","Emerald":"綠寶石","FireRed":"火紅","LeafGreen":"葉綠","Diamond":"鑽石","Pearl":"珍珠","Platinum":"白金","HeartGold":"心金","SoulSilver":"魂銀","Black":"黑","White":"白","Black 2":"黑2","White 2":"白2","X":"X","Y":"Y","Omega Ruby":"歐米加紅寶石","Alpha Sapphire":"阿爾法藍寶石","Sun":"太陽","Moon":"月亮","Ultra Sun":"究極之日","Ultra Moon":"究極之月","Let's Go, Pikachu!":"Let's Go 皮卡丘","Let's Go, Eevee!":"Let's Go 伊布","Sword":"劍","Shield":"盾","Brilliant Diamond":"晶燦鑽石","Shining Pearl":"明亮珍珠","Legends: Arceus":"傳說 阿爾宙斯","Scarlet":"朱","Violet":"紫","Legends: Z-A":"傳說 Z-A"};
const uiValueNames={"Overgrow":"茂盛","Chlorophyll":"葉綠素","story_single":"單機劇情","not_applicable":"不適用","ended":"已結束","historical":"歷史紀錄","unsupported":"本作不支援","wild":"野外遭遇","gift":"贈送","one_time_gift":"一次性贈送","starter_gift":"初始寶可夢贈送","dlc_gift":"追加內容贈送","dlc_wild":"追加內容野外遭遇","home_or_trade":"HOME 轉入或交換","historical_event":"已結束活動","historical_cross_generation_trade":"歷史跨世代交換","cross_game_trade":"跨作品交換","cross_game_trade_or_historical_bank_transfer":"跨作品交換；Bank 為歷史途徑","in_game_gift":"遊戲內贈送","transfer_or_historical_event":"轉入或歷史活動","trade_or_historical_event":"交換或歷史活動","trade_or_transfer":"交換或轉入","postgame_gift":"通關後贈送","postgame_wild":"通關後野外遭遇","postgame_pal_park_transfer":"通關後經帕爾公園移入","postgame_local_poke_transfer":"通關後本地寶可傳送","postgame_local_transfer_or_ended_japan_event":"通關後本地轉入；日本活動已結束","island_scan_wild":"島嶼掃描野外遭遇","wild_and_gift":"野外遭遇或贈送","gift_wild_and_dlc":"贈送、野外或追加內容途徑","dlc_gift_transfer_or_historical_event":"追加內容贈送、轉入或歷史活動","dlc_wild_or_transfer":"追加內容野外或相容轉入","Leech Seed":"寄生種子","Sleep Powder":"催眠粉","Razor Leaf":"飛葉快刀","Growth":"生長","Seed Bomb":"種子炸彈","Synthesis":"光合作用","Community Day Classic":"社群日經典回顧"};
const researchFields=new Set(['verification_required','field_verification']);
const extensionFields=new Set(['not_yet_verified','long_term_updates']);
function displayText(value){
 const text=String(value??'');
 return versionNames[text]||uiValueNames[text]||text.replaceAll('劇情向原創草稿','劇情向原創建議').replaceAll('以上是劇情向草稿','以上為劇情向配招建議');
}
function visibleField(key,value){
 if(researchFields.has(key))return false;
 if(key==='status')return ['ended','historical','not_applicable','unsupported'].includes(value);
 return true;
}
function valueHtml(v,depth=0){
 if(v==null)return '未確認';
 if(depth>6)return '<span class="small">此項內容尚未整理</span>';
 if(Array.isArray(v))return v.length?'<ul>'+v.slice(0,50).map(x=>'<li>'+valueHtml(x,depth+1)+'</li>').join('')+'</ul>':'<span class="small">未提供</span>';
 if(typeof v==='object'){
  const fields=Object.entries(v).filter(([k,x])=>visibleField(k,x));
  return '<dl>'+fields.slice(0,50).map(([k,x])=>'<dt>'+escapeHTML(guideFieldNames[k]||'補充資訊')+'</dt><dd>'+valueHtml(x,depth+1)+'</dd>').join('')+'</dl>';
 }
 return escapeHTML(typeof v==='boolean'?(v?'是':'否'):displayText(v));
}
function versionHeading(row){
 const versions=Array.isArray(row.versions)?row.versions:[];
 return versions.map(displayText).join('／')||'版本未列出';
}
function renderAvailability(rows){
 if(!Array.isArray(rows))return '';
 return '<div class="version-list">'+rows.filter(r=>r&&typeof r==='object').map(row=>'<section class="version-entry"><div class="version-heading"><span class="generation-label">第 '+escapeHTML(row.generation)+' 代</span><h5>'+escapeHTML(versionHeading(row))+'</h5></div><p>'+escapeHTML(row.method||'取得方式尚未確認')+'</p></section>').join('')+'</div>';
}
function renderMovesetGroups(rows){
 if(!Array.isArray(rows))return '';
 return '<div class="moveset-groups">'+rows.filter(r=>r&&typeof r==='object').map(row=>{
  const moves=Array.isArray(row.moves)?row.moves:[];
  const unsupported=row.mode==='not_applicable';
  const list=moves.length?'<ul class="move-list">'+moves.map(move=>'<li><span>'+escapeHTML(displayText(move.name))+'</span><span class="move-level">'+(move.level!=null?'Lv. '+escapeHTML(move.level):'習得方式未列出')+'</span></li>').join('')+'</ul>':'';
  const ability=!unsupported&&row.ability&&row.ability!=='not_applicable'?'<p class="small">特性：'+escapeHTML(displayText(row.ability))+'</p>':'';
  return '<section class="moveset-group"><div class="version-heading"><span class="generation-label">第 '+escapeHTML(row.generation)+' 代</span><h5>'+escapeHTML(versionHeading(row))+'</h5></div>'+(unsupported?'<p class="not-applicable">'+escapeHTML(row.use||'此版本不支援，配招不適用。')+'</p>':list+'<p>'+escapeHTML(row.use||'用途未列出')+'</p>'+ability+'<span class="mode-label">'+escapeHTML(displayText(row.mode||'適用玩法未列出'))+'</span>')+'</section>';
 }).join('')+'</div>';
}
function renderApprovedGuide(g){
 const decision=reviewedGuides.find(r=>r.key===g.key&&Number(r.national_id)===Number(g.national_id)&&r.decision==='passed');
 const sourceItems=(g.sources||[]).map(s=>{const url=safeUrl(s.url);return url?'<li><a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(s.title||new URL(url).hostname)+'</a></li>':''}).filter(Boolean);
 const c=g.content||{};
 const fields=Object.entries(c).filter(([k,v])=>!['display_name','verified_versions','version_groups'].includes(k)&&!extensionFields.has(k)&&visibleField(k,v)).map(([k,v])=>'<dt>'+escapeHTML(guideFieldNames[k]||'補充資訊')+'</dt><dd>'+valueHtml(v)+'</dd>').join('');
 const extras=Object.entries(c).filter(([k,v])=>extensionFields.has(k)&&v!=null&&(!Array.isArray(v)||v.length)).map(([k,v])=>'<h5>'+escapeHTML(guideFieldNames[k])+'</h5>'+valueHtml(v)).join('');
 const extensions=extras?'<details class="guide-extension"><summary>適用範圍與後續更新</summary>'+extras+'</details>':'';
 const sources=sourceItems.length?'<details class="guide-sources"><summary>資料來源（'+sourceItems.length+'）</summary><ul>'+sourceItems.join('')+'</ul></details>':'<p class="small">來源未列出</p>';
 return '<article class="guide-card approved-guide"><div class="section-title"><h4>'+escapeHTML(topicNames[g.topic]||'攻略資訊')+'</h4><span class="review-pill">內容審核：過</span></div><dl class="guide-data">'+fields+'</dl>'+renderAvailability(c.verified_versions)+renderMovesetGroups(c.version_groups)+extensions+'<p class="small guide-updated">資料查核：'+escapeHTML(g.checked_at||'未註明')+' · 審核：'+escapeHTML(decision?.reviewed_at||'未註明')+'</p>'+sources+'</article>';
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
 const verifiedProfile=approvedReview(g);
 const extraFacts=verifiedProfile?[['分類',c.category],['日文名',c.name_ja]].filter(([,v])=>typeof v==='string'&&v.trim()).map(([label,value])=>'<div><span>'+label+'</span><strong'+(label==='日文名'?' lang="ja"':'')+'>'+escapeHTML(value)+'</strong></div>').join(''):'';
 const statNote=verifiedProfile&&typeof c.generation_1_stat_note==='string'?'<p class="detailnote">'+escapeHTML(c.generation_1_stat_note)+'</p>':'';
 const formNote=verifiedProfile&&typeof c.form_note==='string'?'<p class="small">'+escapeHTML(c.form_note)+'</p>':'';
 const evo=(entry.evolution_ids||[]).map(id=>{const r=records.find(x=>Number(x.id)===Number(id));return r?'<button type="button" class="evo-stage" data-evo="'+Number(id)+'"><small>#'+String(id).padStart(4,'0')+'</small><strong>'+escapeHTML(r.name_zh||r.name_en)+'</strong></button>':''}).filter(Boolean).join('<span class="evo-arrow" aria-hidden="true">→</span>');
 const sources=(entry.source_urls||[]).map(s=>{const url=safeUrl(s);return url?'<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(new URL(url).hostname)+'</a>':''}).filter(Boolean).join(' · ');
 return '<section class="profile-section"><div class="section-title"><h3>基本資料</h3><span class="review-pill">基本資料審核：過</span></div><div class="profile-facts"><div><span>身高</span><strong>'+escapeHTML(c.height_m)+' m</strong></div><div><span>體重</span><strong>'+escapeHTML(c.weight_kg)+' kg</strong></div><div><span>一般特性</span><strong>'+escapeHTML((c.abilities.regular||[]).join('、'))+'</strong></div><div><span>隱藏特性</span><strong>'+escapeHTML((c.abilities.hidden||[]).join('、'))+'</strong></div>'+extraFacts+'</div><div class="section-title"><h3>種族值</h3><span class="small">現行六項制 · 合計 '+escapeHTML(stats.total)+'</span></div><div class="stats-panel"><div class="stat-bars">'+bars+'</div><svg class="stat-radar" viewBox="0 0 220 220" role="img" aria-label="種族值雷達圖：'+keys.map((k,i)=>statNames[k]+values[i]).join('，')+'"><polygon points="110,32 177.5,71 177.5,149 110,188 42.5,149 42.5,71" fill="none" stroke="#647694"/><polygon points="'+points+'" fill="#8bda9580" stroke="#89e6b1" stroke-width="2"/></svg></div>'+statNote+'<div class="section-title"><h3>進化路線</h3></div><div class="evolution-line">'+evo+'</div><p class="small">'+(approvedReview(g)?escapeHTML(c.evolution||'進化條件未列出'):'進化等級與版本例外待完整審核。')+' 欄位核對：'+escapeHTML(entry.verified_at)+'；來源：'+sources+'。</p>'+formNote+'</section>';
}

function getPath(value,path){return String(path).split('.').reduce((v,k)=>v==null?undefined:v[k],value)}
function renderFact(f){
 const guide=guideRecords.find(g=>g.key===f.guide_key&&Number(g.national_id)===Number(f.national_id)&&g.checked_at===f.guide_checked_at);
 if(!guide||JSON.stringify(getPath(guide.content,f.match_path))!==JSON.stringify(f.match_value))return '';
 const url=safeUrl(f.source_url);
 return '<article class="guide-card verified-fact"><h4>'+escapeHTML(f.label)+'</h4><p>'+escapeHTML(f.text)+'</p><p class="small">核對：'+escapeHTML(f.verified_at)+'；'+(url?'<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">查看來源</a>':'來源待補')+'</p></article>';
}
// Display-only localization: preserve the Actions-owned catalog and reviewed gameplay data.
function applyCatalogLabels(pokemon,labels){
 const byId=new Map(),duplicates=new Set();
 for(const label of Array.isArray(labels)?labels:[]){
  const id=Number(label?.national_id);
  if(!Number.isInteger(id)||id<1||label.verification!=='official_name_matched'||typeof label.name_zh!=='string'||!/[\u3400-\u9fff]/u.test(label.name_zh)||label.name_zh.length>20||typeof label.name_en!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(label.checked_at||''))continue;
  const source=safeUrl(label.source_url);
  if(source!=='https://tw.portal-pokemon.com/pokedex/'+String(id).padStart(4,'0')+'/')continue;
  if(byId.has(id))duplicates.add(id);
  byId.set(id,label);
 }
 return pokemon.map(p=>{
  const label=byId.get(Number(p.id)),name=String(p.name_zh||'');
  if(!label||duplicates.has(Number(p.id))||String(p.name_en||'').toLowerCase()!==label.name_en.toLowerCase()||/[\u3400-\u9fff]/u.test(name))return p;
  return {...p,name_zh:label.name_zh,catalog_name_source:label.source_url,catalog_name_checked_at:label.checked_at};
 });
}

function details(p){
 if(!p)return;
 const relevant=guideRecords.filter(g=>Number(g.national_id)===Number(p.id)&&g.topic!=='profile');
 const games=[...new Set(['pokemon-go','main-series',...relevant.map(g=>g.game)])];
 const tabs=games.map((game,i)=>'<button type="button" class="guide-tab" id="guide-tab-'+i+'" role="tab" aria-controls="guide-content" tabindex="'+(i===0?'0':'-1')+'" aria-selected="'+(i===0?'true':'false')+'" data-game="'+escapeHTML(game)+'">'+escapeHTML(gameNames[game]||game)+'</button>').join('');
 const options=games.map(game=>'<option value="'+escapeHTML(game)+'">'+escapeHTML(gameNames[game]||game)+'</option>').join('');
 const nameSource=safeUrl(p.catalog_name_source);
 const identitySource=nameSource?'<p class="small identity-source">中文名稱核對：'+escapeHTML(p.catalog_name_checked_at)+' · <a href="'+escapeHTML(nameSource)+'" target="_blank" rel="noopener noreferrer">台灣寶可夢官方圖鑑</a></p>':'';
 const image=artworks.has(Number(p.id))?'<img class="detail-artwork" src="'+escapeHTML(artworks.get(Number(p.id)))+'" width="1024" height="1024" decoding="async" alt="'+escapeHTML(p.name_zh||p.name_en)+'插畫">':'';
 $('#detailbody').innerHTML='<div class="eyebrow">NATIONAL DEX #'+String(p.id).padStart(4,'0')+'</div><h2 id="detail-title">'+escapeHTML(p.name_zh||p.name_en)+' <small>'+escapeHTML(p.name_en)+'</small></h2><div class="tags">'+renderTypeTags(p.types)+'</div>'+identitySource+image+renderProfile(p)+'<section class="guide-section"><div class="section-title"><h3>遊戲版本與攻略</h3><span class="review-pill pending">逐篇審核結果</span></div><div class="version-picker"><label for="game-select">快速切換版本</label><select id="game-select">'+options+'</select></div><div class="guide-tabs" role="tablist" aria-label="遊戲版本">'+tabs+'</div><div id="guide-content" role="tabpanel" tabindex="0"></div></section>';
 const show=game=>{
  document.querySelectorAll('.guide-tab').forEach(b=>{const selected=b.dataset.game===game;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;if(selected)$('#guide-content').setAttribute('aria-labelledby',b.id);});
  $('#game-select').value=game;
  const list=relevant.filter(g=>g.game===game),approved=list.filter(approvedReview);
  const failed=list.filter(g=>reviewedGuides.some(r=>r.key===g.key&&r.decision==='failed'&&Number(r.national_id)===Number(g.national_id)&&(r.suppress_previous_versions===true||r.fingerprint===guideFingerprint(g))));
  const unknown=list.length-approved.length-failed.length;
  const facts=displayFacts.filter(f=>Number(f.national_id)===Number(p.id)&&f.game===game).map(renderFact).filter(Boolean);
  const failedNotes=failed.map(g=>{const decision=reviewedGuides.find(r=>r.key===g.key&&r.decision==='failed');return '<li>'+escapeHTML(topicNames[g.topic]||g.topic)+'：'+escapeHTML(decision.reason||'內容未通過')+'</li>'}).join('');
  $('#guide-content').innerHTML=facts.join('')+approved.map(renderApprovedGuide).join('')+(failed.length?'<div class="guide-pending"><strong>未通過 '+failed.length+' 篇</strong><ul>'+failedNotes+'</ul></div>':'')+(unknown?'<p class="guide-pending">另有 '+unknown+' 篇尚未審核。</p>':'')+(!facts.length&&!approved.length&&!failed.length?'<p class="guide-pending">此版本尚無通過的取得方式或配招。</p>':'');
 };
 $('#game-select').addEventListener('change',e=>show(e.target.value));
 document.querySelectorAll('.guide-tab').forEach(b=>{
  b.addEventListener('click',()=>show(b.dataset.game));
  b.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();
   const tabs=[...document.querySelectorAll('.guide-tab')],i=tabs.indexOf(b);
   const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   show(tabs[next].dataset.game);tabs[next].focus();
  });
 });
 document.querySelectorAll('.evo-stage').forEach(b=>b.addEventListener('click',()=>details(records.find(r=>Number(r.id)===Number(b.dataset.evo)))));
 show(games[0]);
 if(!$('#detail').open)$('#detail').showModal();
 $('#detail').scrollTop=0;
}
async function init(){
 restoreFavorites();
 try{
  const response=await fetch('./data/pokemon.json',{cache:'no-store'});
  if(!response.ok)throw new Error('fetch failed');
  const data=await response.json();
  records=Array.isArray(data.pokemon)?data.pokemon:[];
  try{
   const [gr,dr]=await Promise.all([fetch('./data/guides.json',{cache:'no-store'}),fetch('./data/display-index.json',{cache:'no-store'})]);
   if(gr.ok&&dr.ok){const [guides,index]=await Promise.all([gr.json(),dr.json()]);guideRecords=Array.isArray(guides.guides)?guides.guides:[];displayEntries=Array.isArray(index.entries)?index.entries:[];displayFacts=Array.isArray(index.facts)?index.facts:[];reviewedGuides=Array.isArray(index.reviewed_guides)?index.reviewed_guides:[];guideRecords=mergeReviewedSnapshots(guideRecords,index.guide_snapshots);records=applyCatalogLabels(records,index.catalog_labels);await loadApprovedArtwork(index);}
  }catch{guideRecords=[];displayEntries=[];displayFacts=[];reviewedGuides=[];}
  $('#total').textContent=records.length;
  $('#updated').textContent='資料更新：'+(data.updated_at||'未註明');
  $('#type').innerHTML=typeOptions(records);
  render();
 }catch(error){
  $('#updated').textContent='資料載入失敗';
  $('#grid').textContent='無法載入圖鑑資料，請重新整理頁面。';
 }
}
$('#clear-search').addEventListener('click',()=>{$('#q').value='';render();$('#q').focus();});
$('#reset-filters').addEventListener('click',()=>{$('#q').value='';$('#type').value='';$('#order').value='asc';favoritesOnly=false;render();$('#q').focus();});
$('#favorites-only').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;render();});
$('#detail-top').addEventListener('click',()=>$('#detail').scrollTo({top:0,behavior:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
document.addEventListener('keydown',e=>{
 if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.isComposing&&!$('#detail').open&&!e.target?.closest?.('input,textarea,select,[contenteditable="true"]')){
  e.preventDefault();$('#q').focus();
 }
});
$('#q').addEventListener('input',render);
$('#type').addEventListener('change',render);
$('#order').addEventListener('change',render);
$('#close').addEventListener('click',()=>$('#detail').close());
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail'))$('#detail').close();});
init();