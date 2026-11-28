const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const index=JSON.parse(fs.readFileSync('data/display-index.json','utf8')),raw=JSON.parse(fs.readFileSync('data/pokemon.json','utf8')).pokemon;
const byId=new Map(index.catalog_cards.map(p=>[p.id,p]));for(const p of raw)byId.set(p.id,p);
const code=fs.readFileSync('app.js','utf8'),chunk=code.slice(code.indexOf('function approvedArtworkEntry('),code.indexOf('\nconst $='));
const ctx={records:[...byId.values()],artworks:new Map(),artworkInfo:new Map(),fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url.replace(/^\.\//,''),'utf8'))})};
vm.createContext(ctx);vm.runInContext(chunk,ctx);
(async()=>{
 await ctx.loadApprovedArtwork(index);
 assert.equal(ctx.artworks.size,11);assert.equal(ctx.artworkInfo.get(1).kind,'generated');
 for(let id=2;id<=11;id++){assert.match(ctx.artworks.get(id),new RegExp('/'+String(id).padStart(3,'0')+'-'));assert.equal(ctx.artworkInfo.get(id).kind,'official_reference');}
 const good=index.artworks.find(a=>a.national_id===2);
 for(const bad of [{...good,asset:'assets/reference/003-ivysaur-official.png'},{...good,asset:'https://evil.invalid/x.png'},{...good,source_url:'javascript:alert(1)'},{...good,display_decision:'pending'},{...good,project_approval:{quality:'pending'}}])assert.equal(ctx.approvedArtworkEntry(bad,index),null);
 assert.equal(ctx.approvedArtworkEntry(good,{...index,artwork_assessments:[]}),null);
 assert.equal(ctx.approvedArtworkEntry(good,{...index,artwork_assessments:{}}),null);
 const originalFetch=ctx.fetch;ctx.fetch=async()=>({ok:true,json:async()=>({national_id:3})});
 ctx.artworks.clear();ctx.artworkInfo.clear();await ctx.loadApprovedArtwork({...index,artworks:[good]});assert.equal(ctx.artworks.size,0);
 ctx.fetch=originalFetch;await ctx.loadApprovedArtwork({...index,artworks:[good,good]});assert.equal(ctx.artworks.size,0);
 console.log('PASS 10 official + legacy #001 artwork matching; approval/assessment/source/path/metadata and duplicate rejection');
})().catch(e=>{console.error(e);process.exitCode=1});
