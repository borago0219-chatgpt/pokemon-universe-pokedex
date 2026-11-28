const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),engine=require('../type-quiz-engine.js');
const index=JSON.parse(fs.readFileSync('data/display-index.json','utf8')),raw=JSON.parse(fs.readFileSync('data/pokemon.json','utf8')).pokemon,byId=new Map(index.catalog_cards.map(p=>[p.id,p]));
for(const p of raw)byId.set(p.id,p);
for(const label of index.catalog_labels){const p=byId.get(label.national_id);if(p?.name_en===label.name_en)byId.set(p.id,{...p,name_zh:label.name_zh});}
const records=[...byId.values()].sort((a,b)=>a.id-b.id);
class Element{
 constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.dataset={};this.listeners={};this.hidden=false;this.disabled=false;this._text='';this.classes=new Set();this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c)};}
 set className(v){this.classes=new Set(v.split(/\s+/).filter(Boolean));}get className(){return [...this.classes].join(' ');}
 set textContent(v){this._text=String(v);this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 append(...children){this.children.push(...children);}replaceChildren(...children){this._text='';this.children=[...children];}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];if(k==='src')this.src='';}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}click(){if(this.disabled)return;for(const fn of this.listeners.click||[])fn({target:this});}
 querySelector(selector){const name=selector.slice(1);for(const c of this.children){if(c.classes.has(name))return c;const n=c.querySelector(selector);if(n)return n;}return null;}
 focus(){this.focused=true;}
}
function mount({stored=null,brokenStorage=false}={}){
 const nodes=new Map();
 for(const m of fs.readFileSync('index.html','utf8').matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="(quiz-[^"]+)"([^>]*)>/g)){const e=new Element(m[1]);e.hidden=m[3].includes('hidden');e.disabled=m[3].includes('disabled');nodes.set(m[2],e);}
 const root={querySelector:s=>nodes.get(s.slice(1))},listeners={},events=[],store={value:stored};
 const document={querySelector:s=>s==='#type-quiz'?root:null,createElement:t=>new Element(t),addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn),dispatchEvent:event=>{events.push(event);for(const fn of listeners[event.type]||[])fn(event);}};
 const context={document,CustomEvent:class{constructor(type,opts={}){this.type=type;this.detail=opts.detail;}},PokeVerseTypeQuiz:{...engine,createRound:p=>engine.createRound(p,10,()=>0)},localStorage:{getItem(){if(brokenStorage)throw Error('disabled');return store.value;},setItem(k,v){if(brokenStorage)throw Error('disabled');store.value=v;}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('type-quiz.js','utf8'),context);
 const ready=()=>document.dispatchEvent({type:'pokeverse:catalog-ready',detail:{records,source:index.catalog_card_source,artworks:index.artworks.filter(a=>a.kind==='official_reference').map(a=>({national_id:a.national_id,src:'./'+a.asset,source_url:a.source_url}))}});
 const button=t=>nodes.get('quiz-options').children.find(b=>b.dataset.type===t);
 return{nodes,document,ready,button,store,events};
}
test('controller waits for verified data and restores a stored best score',()=>{
 const ui=mount({stored:'7'});assert(ui.nodes.get('quiz-start').disabled);assert.equal(ui.nodes.get('quiz-best').textContent,'7 / 10');
 ui.document.dispatchEvent({type:'pokeverse:catalog-ready',detail:{records,source:{...index.catalog_card_source,display_status:'draft'}}});assert(ui.nodes.get('quiz-start').disabled);
 ui.ready();assert(!ui.nodes.get('quiz-start').disabled);assert.match(ui.nodes.get('quiz-availability').textContent,/1,025/);
});
test('select limits, partial-answer feedback, score, review and replay work together',()=>{
 const ui=mount();ui.ready();ui.nodes.get('quiz-start').click();
 assert.equal(ui.nodes.get('quiz-name').textContent,'妙蛙種子');
 ui.button('grass').click();ui.button('poison').click();ui.button('fire').click();
 assert.equal(ui.button('fire').getAttribute('aria-pressed'),'false');assert.match(ui.nodes.get('quiz-feedback').textContent,/最多選 2/);
 ui.button('poison').click();ui.nodes.get('quiz-submit').click();
 assert.match(ui.nodes.get('quiz-feedback').textContent,/漏選：毒/);assert.equal(ui.button('poison').querySelector('.quiz-choice-state').textContent,'正解');
 ui.nodes.get('quiz-next').click();
 for(let i=1;i<10;i++){for(const t of records[i].types)ui.button(t).click();ui.nodes.get('quiz-submit').click();ui.nodes.get('quiz-next').click();}
 assert.equal(ui.nodes.get('quiz-final-score').textContent,'9 / 10');assert.equal(ui.nodes.get('quiz-review').children.length,1);assert.equal(ui.store.value,'9');
 ui.nodes.get('quiz-review').children[0].children[2].click();assert.equal(ui.events.at(-1).type,'pokeverse:open-entry');assert.equal(ui.events.at(-1).detail.national_id,1);
 ui.nodes.get('quiz-play-again').click();assert.equal(ui.nodes.get('quiz-step').textContent,'第 1 / 10 題');assert.equal(ui.nodes.get('quiz-score').textContent,'答對 0 題');assert.equal(ui.nodes.get('quiz-best').textContent,'9 / 10');
 assert.equal(ui.nodes.get('quiz-feedback').hidden,true);assert(!ui.nodes.get('quiz-feedback').classes.has('quiz-feedback-correct'));
});
test('storage failure and loading errors do not break gameplay',()=>{
 const ui=mount({stored:'garbage',brokenStorage:true});
 ui.document.dispatchEvent({type:'pokeverse:catalog-unavailable'});assert(ui.nodes.get('quiz-start').disabled);
 ui.ready();ui.nodes.get('quiz-start').click();
 for(let i=0;i<10;i++){for(const t of records[i].types)ui.button(t).click();ui.nodes.get('quiz-submit').click();ui.nodes.get('quiz-next').click();}
 assert.equal(ui.nodes.get('quiz-final-score').textContent,'10 / 10');assert.match(ui.nodes.get('quiz-storage-note').textContent,/這次瀏覽/);assert.equal(ui.nodes.get('quiz-perfect').hidden,false);
});

test('official quiz pictures load only for the current question, with attribution and fallback',()=>{
 const ui=mount();ui.ready();ui.nodes.get('quiz-start').click();
 const image=ui.nodes.get('quiz-artwork'),placeholder=ui.nodes.get('quiz-art-placeholder');
 assert(image.hidden);assert(!placeholder.hidden);
 for(const t of records[0].types)ui.button(t).click();ui.nodes.get('quiz-submit').click();ui.nodes.get('quiz-next').click();
 assert.match(image.src,/002-ivysaur-official.png$/);assert.equal(image.alt,'妙蛙草官方角色插畫');
 image.naturalWidth=475;image.naturalHeight=475;const oldLoad=image.onload;image.onload();
 assert(!image.hidden&&placeholder.hidden);assert(!ui.nodes.get('quiz-art-credit').hidden);
 assert.equal(ui.nodes.get('quiz-art-credit').children[1].href,'https://github.com/PokeAPI/sprites/blob/master/sprites/pokemon/other/official-artwork/2.png');
 for(const t of records[1].types)ui.button(t).click();ui.nodes.get('quiz-submit').click();ui.nodes.get('quiz-next').click();
 assert(image.hidden&&!placeholder.hidden);oldLoad();assert(image.hidden&&!placeholder.hidden,'Stale previous load must not replace the current placeholder');
 image.onerror();assert(image.hidden&&!placeholder.hidden);assert.match(ui.nodes.get('quiz-art-caption').textContent,/暫時無法載入/);
});
