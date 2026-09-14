import test from 'node:test';
import assert from 'node:assert/strict';
import {enrichTags,noiseReasons,selectFolders,compareFolders} from '../src/hashtag-taxonomy.ts';
import {tagTable,type TagPost} from '../src/hashtag-audit.ts';
import {taxonomyFiles,comparisonHtml} from '../src/hashtag-taxonomy-report.ts';
const p=(key:string,tags:string[]):TagPost=>({key,url:null,merged:tags,structured:tags,caption:[],firstCaption:[],channels:['saved'],captionPresent:false,unmatched:false,unknownIdentity:false,invalidStructured:[]});
test('Distinctiveness uses the exact smoothed whole-snapshot ratio and retains raw ordering',()=>{
 const inside=Array.from({length:10},(_,i)=>p('i'+i,[...(i<8?['#common']:[]),...(i<3?['#rare']:[])]));const whole=inside.concat(Array.from({length:990},(_,i)=>p('o'+i,['#common'])));const t=enrichTags(tagTable(inside),'Synthetic folder',whole,whole);
 assert.equal(t.raw[0].tag,'#common');assert.equal(t.distinctive[0].tag,'#rare');assert.equal(t.distinctive[0].logRatio,Math.log2((3.5/11)/(3.5/1001)));assert.equal(t.distinctive[0].snapshotPosts,3);assert.equal(t.candidates[0].tag,'#rare');assert.equal(t.candidates[0].candidate,true);
});
test('Noise flags are disclosed mechanical matches, preserve all tags and count only-flagged posts separately',()=>{
 assert.ok(noiseReasons('#explorepage','Other',0,100).includes('engagement-list match'));assert.ok(noiseReasons('#looksmax','Looksmaxxing',0,100).includes('folder-name spelling match'));assert.ok(noiseReasons('#biomechanic','biomechanics',0,100).length);assert.equal(noiseReasons('#unrelated','biomechanics',9,100).length,0);assert.ok(noiseReasons('#unrelated','biomechanics',10,100).includes('on at least 10% of all saves'));
 const rows=[p('a',['#fyp','#health']),p('b',['#health','#rare']),p('c',[])],t=enrichTags(tagTable(rows),'natural living + health',rows,Array.from({length:100},(_,i)=>p('s'+i,[])));
 assert.deepEqual(t.onlyFlaggedPostKeys,['a']);assert.equal(t.noTags,1);assert.equal(t.effectivelyUntagged,2);assert.equal(t.allTags.length,3);assert.equal(t.flagged.length,2);
});
test('Name/system candidates are frequency candidates rather than a curated name dictionary',()=>{
 const inside=Array.from({length:3},(_,i)=>p('i'+i,['#syntheticnovelstring','#fyp']));const global=inside.concat(Array.from({length:997},(_,i)=>p('o'+i,[])));const t=enrichTags(tagTable(inside),'folder',global,global);
 assert.deepEqual(t.candidates.map(t=>t.tag),['#syntheticnovelstring']);assert.ok(t.flaggedCandidates.some(t=>t.tag==='#fyp'));assert.equal(t.allTags.length,2);
});
test('Folder name selection handles case and whitespace, duplicate requests, absent and ambiguous names',()=>{
 assert.equal(selectFolders([{id:'emoji',name:'Synthetic 🏃‍♂️'}],['synthetic'])[0].id,'emoji');assert.throws(()=>selectFolders([{id:'one',name:'A + B'},{id:'two',name:'A - B'}],['AB']),/ambiguous/);
 const folders=[{id:'a',name:'Synthetic A'},{id:'b',name:'Synthetic B'}];assert.deepEqual(selectFolders(folders,[' synthetic a ','SYNTHETIC A']).map(f=>f.id),['a']);assert.throws(()=>selectFolders(folders,['absent']),/not found/);assert.throws(()=>selectFolders([...folders,{id:'c',name:'SYNTHETIC A'}],['Synthetic A']),/ambiguous/);
});
test('Cross-folder divergence distinguishes identical from disjoint and excludes shared posts without leakage',()=>{
 const folder=(id:string,posts:TagPost[])=>({id,name:'Synthetic '+id,posts});const shared=p('shared',['#one']);const a=folder('A',[shared,p('a',['#two'])]),b=folder('B',[shared,p('b',['#two'])]);const comparison=compareFolders(a,b,[]);assert.equal(comparison.sharedPosts.length,1);assert.equal(comparison.withSharedPosts.all.jsdBits,0);assert.equal(comparison.withoutSharedPosts.aPosts,1);assert.equal(comparison.withoutSharedPosts.all.jsdBits,0);
 const disjoint=compareFolders(folder('C',[p('c',['#three'])]),folder('D',[p('d',['#four'])]),[]);assert.equal(disjoint.withSharedPosts.all.jsdBits,1);assert.equal(disjoint.withSharedPosts.all.sharedMass,0);
 const empty=compareFolders(folder('E',[]),a,[]);assert.equal(empty.withSharedPosts.all.assessable,false);assert.equal(empty.withSharedPosts.all.jsdBits,null);assert.equal(empty.withSharedPosts.all.taggedB,2);
});
test('Taxonomy HTML preserves post links, scores and flagged rows while escaping source text',()=>{
 const rows=[p('a',['#synthetic']),p('b',['#synthetic']),p('c',['#synthetic'])],d=tagTable(rows),t=enrichTags(d,'<script>synthetic</script>',rows,[]);const files=new Map(taxonomyFiles('test','<script>synthetic</script>',t,d));assert.ok(files.has('test-raw-1.html'));assert.ok(files.has('test-distinctiveness-1.html'));assert.ok(files.has('test-flagged-1.html'));for(const [,html]of files)if(html.startsWith('<!doctype'))assert.ok(!/<script|<img|<link/i.test(html));const c=compareFolders({id:'a',name:'<script>A</script>',posts:rows},{id:'b',name:'B',posts:rows},[]);assert.ok(comparisonHtml(c).includes('&lt;script&gt;'));
});
