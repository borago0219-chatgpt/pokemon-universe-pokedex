# 視覺化未推送成果復原紀錄 — 2026-11-24

## 保存範圍與證據
這份紀錄透過已授權 GitHub 連接保存；未使用使用者本機電腦。
原雲端工作目錄：/workspace/scratch/dfe67fa153ef/pokeverse
原雲端分支：work/visual-001-20261124
原雲端提交縮寫：e3e0a91（完整 SHA 未取得）。終端曾確認建立提交，推送因缺少 Git HTTPS 認證失敗；隨後原雲端環境不可用。
本次 GitHub 查詢 e3e0a91 回覆 422 / No commit found for SHA。這只證明遠端無此提交，不能證明原雲端磁碟已刪除。
main 目前為 fbff6764e42446bfea3478e6fc65a0a391793266。
原預覽分支 work/bulbasaur-001-private-preview-20261124 仍在，HEAD 26bd6d0ec0178fc53611648f017876396b6175e2。
本檔所列 app.js、style.css 由上述預覽分支原始檔及本對話成功套用的 patch 重建，並非從原提交讀回；尚未逐位元核對原提交。

## 尚未進入遠端網站程式的修改
- app.js：以 national_id 通用配對指南；按編號排序；屬性卡片色彩、待審指南筆數；身高、體重、特性、種族值長條圖、進化文字；中文草稿/待審標示；非本機網域不載入指南與預覽標語。
- style.css：基本資料面板、數值條、屬性卡片裝飾、鍵盤焦點、窄螢幕排列及減少動畫支援。
- automation/visualization-handoff-2026-11-24.md：原交接檔尚未推送，本紀錄保留其可核實內容。
- 原分支合併 main 所帶入的指南與候選圖已存在遠端 main，不屬於遺失成果。

## 驗證與缺口
前次雲端 node --check 通過；Node VM 模擬曾載入 17 張卡片、11 筆 #001 指南，並測試非本機網域不載入指南。這些是原雲端程式測試，不是瀏覽器驗收，也不能直接當成本次重建程式通過。
雲端瀏覽器曾實際開啟正式網址並到達 Cloudflare Access 登入頁；127.0.0.1:8765 預覽回報 ERR_CONNECTION_REFUSED。
本次沒有可用的原雲端執行器或新雲端，故未重跑測試、未驗證手機/桌面畫面，也未部署。
候選圖片仍為 rights_review=required、website_use=not_approved；不得展示。
注意：hostname 判斷只控制前端顯示，不是伺服器存取保護；靜態 guides.json 仍存在，不能將這份程式當作已完成私人部署保護。
雷達圖、互動式進化路線、正式圖片索引、完整公開內容審核仍未完成。

## 雲端與排程查核
原 Work 雲端環境在本對話顯示 unavailable。list_cloud_environments 兩次回覆 Codex app tool request failed（-32000），不能據此推論帳號沒有雲端環境。
目前提供的 create_thread 僅有 local/worktree；handoff_thread 明確不支援 cloud handoff，且無法移動目前呼叫中的對話。沒有可呼叫的原 Work 環境 reconnect/provision 功能。
排程每天 Asia/Taipei 21:30，仍啟用；環境設定 environment_selection=inherited、environments=null。這不是已綁定雲端的證明。
最新可見執行紀錄為 failed（2026-11-24 21:36 左右）；工具只回報「你的已排程工作發生問題」，沒有根因。先前手動 run_now 回傳 inline_run，只把工作交回此對話，未證實建立雲端執行器。
目前 automations.update 沒有環境選擇欄位；本次未改排程或其他任務。
以上只描述本對話可用功能，不能推論所有產品介面都不支援雲端。

## 接續方法
優先恢復原環境後，在上述專案以 git show e3e0a91、git log --all、git reflog 確認原提交，避免重置或刪除原工作目錄。
若無法恢復而有新雲端：從最新 main 建立安全分支，核對最新 daily_focus 仍為 #001，再以以下重建來源及既存預覽分支 index.html 為復原起點，重跑安全與資料配對測試。不得改寫 data/pokemon.json、guides.json、生圖紀錄或既有審核。
確認受保護的私人預覽可用後，實際做搜尋、篩選、詳情、版本切換與手機/桌面驗收；通過內容/權利與部署保護門檻後才能依授權部署。
本紀錄為復原材料，並非網站已實作或部署成功。

## 重建 app.js
```javascript
const typeNames={normal:'一般',fire:'火',water:'水',electric:'電',grass:'草',ice:'冰',fighting:'格鬥',poison:'毒',ground:'地面',flying:'飛行',psychic:'超能力',bug:'蟲',rock:'岩石',ghost:'幽靈',dragon:'龍',dark:'惡',steel:'鋼',fairy:'妖精'};
const colors={normal:'#9da8a2',fire:'#fd9b56',water:'#62b9ff',electric:'#ffdb69',grass:'#8bda95',ice:'#8de6e7',fighting:'#e99179',poison:'#b58de9',ground:'#d4b578',flying:'#9bb8f8',psychic:'#ed8cab',bug:'#a4cf6b',rock:'#b9b19a',ghost:'#a4a0e9',dragon:'#8f9aff',dark:'#8c94a3',steel:'#a1c1cb',fairy:'#f4aad9'};
let records=[],guideRecords=[];
const $=s=>document.querySelector(s);
// Drafts are displayed only by a local Work preview, never by a deployed copy.
const privatePreview=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
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
```

## 重建 style.css
```css
:root{font-family:Inter,"Noto Sans TC",system-ui,sans-serif;color:#eef2ff;background:#0b1021;font-synthesis:none}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0}a{color:inherit;text-decoration:none}button,input,select{font:inherit}
.top{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 max(5vw,20px);border-bottom:1px solid #28314b;background:#0c1228d9;position:sticky;top:0;z-index:5;backdrop-filter:blur(12px)}
.brand{font-size:24px;font-weight:850;letter-spacing:-.8px;color:#a8e9ff}.brand span{color:#fff}.brand small{font-size:11px;color:#8292b5;margin-left:12px;letter-spacing:2px}.top nav{display:flex;gap:24px;color:#aab6cf;font-size:13px}
.hero{min-height:560px;padding:110px 7vw 70px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 85% 20%,#273c67 0%,transparent 45%),linear-gradient(115deg,#0d1430,#131d3a 60%,#152e40)}
.glow{position:absolute;right:10%;top:15%;width:300px;height:300px;border:35px solid #67d9db1b;border-radius:50%;box-shadow:0 0 0 55px #70b2ff0b,0 0 0 110px #5c9fff06}
.eyebrow{color:#6be0dc;font-size:12px;letter-spacing:3px;font-weight:800}.hero h1{font-size:clamp(38px,5.5vw,72px);max-width:840px;letter-spacing:-2.7px;line-height:1.2;position:relative}.hero h1 em{font-style:normal;color:#7fe2e4}.hero p{max-width:640px;color:#b3c1d9;line-height:1.85;font-size:16px}
.actions{display:flex;gap:12px;margin:32px 0 42px}.primary,.secondary{border-radius:12px;padding:14px 25px;font-weight:800;font-size:14px}.primary{background:#72e8e0;color:#0d1c35}.secondary{border:1px solid #56617b}.stats{display:flex;gap:55px}.stats div{display:flex;flex-direction:column;gap:6px}.stats strong{font-size:24px}.stats small{color:#8190b1;font-size:12px}
.section{padding:75px 7vw 100px;max-width:1600px;margin:auto}.sectionhead{display:flex;justify-content:space-between;align-items:end;gap:15px}.section h2,.about h2{font-size:37px;margin:10px 0 8px;letter-spacing:-1px}.sectionhead p{color:#95a5c1}.last{color:#788ba8;font-size:12px}
.controls{display:flex;gap:12px;margin:28px 0}.search{background:#161f38;border:1px solid #34415e;border-radius:12px;padding:0 18px;display:flex;align-items:center;flex:1;color:#91adce}.search input{color:white;background:transparent;border:0;outline:0;padding:16px 9px;width:100%}.controls select{background:#161f38;color:#c3d2ed;border:1px solid #34415e;border-radius:12px;padding:0 18px;min-width:145px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:18px}.poke{background:linear-gradient(145deg,#1c2845,#141e35);border:1px solid #31405f;border-radius:19px;padding:18px;cursor:pointer;text-align:left;color:#fff;transition:.2s}.poke:hover{transform:translateY(-4px);border-color:#71dcd4;box-shadow:0 12px 32px #0005}
.art{height:157px;border-radius:14px;background:radial-gradient(circle at 50% 40%,var(--shade),#111d37 65%);display:flex;justify-content:center;align-items:center;margin-bottom:15px;overflow:hidden}.mark{width:98px;height:98px;border:9px solid #ffffff20;display:grid;place-items:center;border-radius:50%;font-size:46px;color:#ffffff9a;transform:rotate(-18deg)}
.num{color:#8598b8;font-size:12px;letter-spacing:1px}.poke h3{font-size:20px;margin:9px 0 5px}.en{font-size:12px;color:#8c9dbc}.tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.tag{font-size:11px;padding:6px 10px;border-radius:999px;background:#31425b;color:#bfe5ed}
.empty{padding:60px;text-align:center;color:#8796ae}.about{padding:65px 7vw 100px;background:#101a32}.features{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:30px}.features article{border:1px solid #34415c;border-radius:16px;padding:25px;background:#19233b}.features b{font-size:12px;color:#7de4d8}.features h3{font-size:20px}.features p{line-height:1.8;color:#9eabc4}
footer{padding:28px 7vw;font-size:12px;color:#7f8da8;line-height:2}footer a,.small a{color:#79d6d4}
dialog{background:#141f3b;color:#fff;border:1px solid #51607e;border-radius:22px;width:min(650px,92vw);max-height:85vh;padding:35px;box-shadow:0 20px 80px #000b}dialog::backdrop{background:#020711c9}.close{float:right;border:0;background:#34425c;color:white;font-size:26px;border-radius:50%;width:35px;height:35px;cursor:pointer}
#detailbody h2 small{color:#8f9cb5;font-size:16px}.detailnote{padding:14px;background:#24314a;border-radius:11px;color:#b2c1da;line-height:1.7}.detailgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.detailgrid div{padding:15px;border:1px solid #394660;border-radius:12px}.detailgrid p{color:#b2bfd5;font-size:13px;line-height:1.7}.small{font-size:12px;color:#8a9ab8}
@media(max-width:680px){.hero{padding:75px 6vw}.stats{gap:24px}.section{padding:50px 5vw}.sectionhead{align-items:start;flex-direction:column}.controls{flex-wrap:wrap}.search{flex-basis:100%}.controls select{height:44px;flex:1;min-width:0}.features{grid-template-columns:1fr}.top nav{gap:12px}.brand small{display:none}.detailgrid{grid-template-columns:1fr}}
.preview-banner{padding:12px 7vw;background:#263b39;color:#d0f4e9;font-size:13px;border-bottom:1px solid #3b766a}
#detail{width:min(1000px,94vw)}
.guide-tabs{display:flex;gap:8px;overflow-x:auto;padding:12px 0 18px}
.guide-tab{flex:none;border:1px solid #425371;border-radius:999px;background:#1c2a46;color:#d4e8ef;padding:9px 13px;cursor:pointer}
.guide-tab[aria-selected="true"]{background:#72e8e0;color:#122239;border-color:#72e8e0}
.guide-card{border:1px solid #3a4b6c;border-radius:14px;padding:18px;margin:12px 0;background:#182643}
.guide-card h3{margin:0 0 12px}
.guide-card h3 small{font-size:12px;color:#9db3c8;margin-left:8px}
.guide-fields{display:grid;grid-template-columns:minmax(110px,25%) 1fr;gap:9px 14px;font-size:13px;line-height:1.6}
.guide-fields dt{font-weight:700;color:#a4c6cf}.guide-fields dd{margin:0;overflow-wrap:anywhere}
.guide-fields .guide-fields{display:block;margin:0}.guide-fields .guide-fields dt{margin-top:8px}
.guide-list{margin:0;padding-left:20px}.guide-list li{margin:4px 0}
.matrix-scroll{overflow-x:auto}.version-matrix{width:100%;border-collapse:collapse;font-size:12px}
.version-matrix th,.version-matrix td{border-bottom:1px solid #394967;padding:9px;vertical-align:top;text-align:left}
.version-matrix th{color:#8be4da;position:sticky;top:0;background:#182643}
.guide-card a{color:#8be4da}.guide-card details{font-size:13px}
@media(max-width:680px){.guide-fields{grid-template-columns:1fr}.guide-fields dt{margin-top:8px}}
.poke{position:relative;overflow:hidden}
.poke:before{content:"";position:absolute;inset:0 0 auto;height:3px;background:var(--accent,#72e8e0)}
.poke:focus-visible,.guide-tab:focus-visible,.close:focus-visible{outline:3px solid #9af7e9;outline-offset:3px}
.profile-panel{border:1px solid #416354;border-radius:16px;background:linear-gradient(145deg,#1b3b3b,#17263e);padding:20px;margin:18px 0}
.profile-panel h3{margin:20px 0 10px}.profile-panel h3 small{font-size:13px;color:#a8c9c1}
.profile-facts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.profile-facts div{padding:12px;border:1px solid #45635d;border-radius:10px;min-width:0}
.profile-facts small{display:block;color:#a0c6ba;margin-bottom:6px}.profile-facts strong{overflow-wrap:anywhere}
.stat-row{display:grid;grid-template-columns:55px 1fr 35px;gap:12px;align-items:center;margin:7px 0;font-size:13px}
.stat-row meter{width:100%;height:16px;accent-color:#74e2ad}.stat-row b{text-align:right}
.evolution{background:#213a39;border-radius:10px;padding:14px;line-height:1.7}
.status{background:#74522c;color:#ffe1a8;padding:4px 8px;border-radius:999px}
.draft-count{display:inline-block;color:#ffdd9f;font-size:11px;margin-top:12px}
@media(max-width:680px){.profile-facts{grid-template-columns:repeat(2,1fr)}#detail{padding:22px}.stat-row{gap:7px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}

```
