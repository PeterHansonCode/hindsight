import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {captionTags,structuredTags,tagCoverage,tagTable,hashtagIndex,type TagPost} from '../src/hashtag-audit.ts';
import {scopeFiles} from '../src/hashtag-audit-report.ts';
import {hashtagAuditCommand} from '../src/hashtag-audit-command.ts';
import {ingestInstagram} from '../src/ingest.ts';
const p=(key:string,tags:string[],structured:string[]=tags):TagPost=>({key,url:'https://www.instagram.com/p/SYNTHETIC_'+key+'/',merged:[...new Set(tags)].sort(),structured,caption:[],firstCaption:[],channels:['saved'],captionPresent:false,unmatched:false,unknownIdentity:false,invalidStructured:[]});
test('Caption tags preserve repaired Unicode and explicitly handle case, punctuation, URLs and token boundaries',()=>{
 assert.deepEqual(captionTags('#CAFÉ, #cafe\u0301! #snake_case #東京 #tag-more #123 word#no https://example.invalid/#fragment www.example.invalid/#other <script>#INERT</script>'),['#café','#snake_case','#東京','#tag','#123','#inert']);
 assert.deepEqual(captionTags('#same #SAME #same.'),['#same']);assert.deepEqual(captionTags('No hashtags'),[]);
 const s=structuredTags([' Tag ','#TAG','odd.tag']);assert.deepEqual(s.tags,['#tag','#odd.tag']);assert.deepEqual(s.invalid,['odd.tag']);
});
test('Source coverage distinguishes vocabulary differences, post-tag differences and alternate-caption gains',()=>{
 const a={...p('a',['#x','#y'],['#x']),caption:['#x','#y'],firstCaption:['#x'],captionPresent:true};
 const b={...p('b',['#x','#z'],['#z']),caption:['#x'],firstCaption:[],captionPresent:true};
 const c={...p('c',['#q'],[]),caption:['#q'],firstCaption:[],captionPresent:true};const coverage=tagCoverage([a,b,c]);
 assert.equal(coverage.structuredPosts,2);assert.equal(coverage.mergedPosts,3);assert.equal(coverage.gainedPosts,1);assert.equal(coverage.alternateOnlyCoveragePosts,1);
 assert.deepEqual(coverage.structuredOnlyVocabulary,['#z']);assert.deepEqual(coverage.captionOnlyVocabulary,['#q','#y']);assert.equal(coverage.captionOnlyPostTagIncidences,3);
});
test('Hashtag counts deduplicate per post, clean counts exclude other frequent tags, and top coverage uses unions',()=>{
 const posts=[p('1',['#a','#a','#b']),p('2',['#a','#b']),p('3',['#a','#rare']),p('4',['#b']),p('5',['#rare2']),p('6',[])];const t=tagTable(posts);
 assert.deepEqual(t.frequentTags.map(t=>[t.tag,t.posts,t.cleanPosts]),[['#a',3,1],['#b',3,1]]);assert.equal(t.topCoverage[0].posts,4);assert.equal(t.noFrequentTagPosts,2);assert.equal(t.noTagPosts,1);assert.equal(t.pairs[0].posts,2);assert.deepEqual(t.pairs[0].postKeys,['1','2']);
});
test('Repeated pairs and triples include two-post tags without naming gates or clustering',()=>{
 const t=tagTable([p('1',['#a','#b','#c']),p('2',['#a','#b','#c']),p('3',['#a'])]);assert.equal(t.frequentTags.length,1);assert.equal(t.pairs.length,3);assert.equal(t.triples.length,1);assert.equal(t.triples[0].posts,2);assert.deepEqual(t.triples[0].sharesOfEachTag,[2/3,1,1]);
});
test('Tables retain every frequent hashtag and paginate rather than truncate; source text and URLs remain inert',()=>{
 const tags=Array.from({length:501},(_,i)=>'#synthetic'+i); // Do not form an enormous triple set: each tag has its own three posts.
 const posts=tags.flatMap((t,i)=>[p(i+'a',[t]),p(i+'b',[t]),p(i+'c',[t])]);const t=tagTable(posts);t.frequentTags[0].tag='<script>synthetic</script>';t.posts[0].url='javascript:alert(1)';
 const files=new Map(scopeFiles('test','Synthetic <title>',t));assert.ok(files.has('test-tags-2.html'));const first=files.get('test-tags-1.html')!;assert.ok(first.includes('&lt;script&gt;'));assert.ok(!first.includes('javascript:'));assert.ok(!/<script|<img|<link/i.test(first));assert.ok(first.includes("default-src 'none'"));
});
test('Whole snapshot deduplicates saved/liked canonical posts while preserving channel observation coverage',async()=>{
 const fixture=JSON.parse(await fs.readFile(new URL('./fixtures/instagram.synthetic.json',import.meta.url),'utf8'));
 const {instagramParser}=await import('../src/parsers/instagram.ts');const result=await instagramParser.parse({readJson:async name=>name in fixture.files?{status:'ok',value:fixture.files[name]}:{status:'missing',code:'missing_file'}});
 const {createInstagramSideTableBundle}=await import('../src/instagram-side-tables.ts');const bundle=createInstagramSideTableBundle('synthetic',result),i=hashtagIndex(result.events,bundle);
 assert.equal(i.observations.length,result.events.length);assert.ok(i.whole.length<=i.saved.length+i.liked.length);
 const original=result.events[0],extra=bundle.tables.find(t=>t.name==='instagram.post_extras')!.rows.find(r=>r.observationId===original.observationId)!;
 const copy={...original,observationId:'synthetic-duplicate',activity:{...original.activity,event_type:'liked' as const}};result.events.push(copy);bundle.tables.find(t=>t.name==='instagram.post_extras')!.rows.push({...extra,observationId:copy.observationId,captionValues:['#SyntheticNew']});
 const after=hashtagIndex(result.events,bundle);assert.equal(after.whole.length,i.whole.length);assert.equal(after.observations.length,i.observations.length+1);assert.ok(after.whole.some(p=>p.caption.includes('#syntheticnew')));
});
test('Hashtag command reads retained data, writes all scopes and refuses existing or protected output',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'hindsight-tags-'));t.after(async()=>{assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));assert.ok(path.basename(root).startsWith('hindsight-tags-'));await fs.rm(root,{recursive:true,force:true});});
 const fixture=JSON.parse(await fs.readFile(new URL('./fixtures/instagram.synthetic.json',import.meta.url),'utf8')),input=path.join(root,'input');for(const [name,value]of Object.entries(fixture.files)){const f=path.join(input,name);await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,JSON.stringify(value));}
 const snapshot=await ingestInstagram({input,output:path.join(root,'snapshots'),snapshotId:'synthetic',exportDate:'2026-08-30'}),manifest=await fs.readFile(path.join(snapshot.directory,'manifest.json'));
 const args=['--snapshot',snapshot.directory,'--output',path.join(root,'result'),'--largest','3','--source-root',input],io={stdout:()=>{},stderr:()=>{}};
 assert.equal(await hashtagAuditCommand(args,io),0);assert.equal(await hashtagAuditCommand(args,io),1);assert.equal(await hashtagAuditCommand(['--snapshot',snapshot.directory,'--output',path.join(input,'bad'),'--source-root',input],io),1);
 const retainedBundle=JSON.parse(await fs.readFile(path.join(snapshot.directory,'side-tables.json'),'utf8'));
 const collectionNames=retainedBundle.tables.find((t:any)=>t.name==='instagram.collections').rows.map((r:any)=>r.collection_name).filter((n:any)=>typeof n==='string');
 assert.ok(collectionNames.length>=2);
 assert.equal(await hashtagAuditCommand(['--snapshot',snapshot.directory,'--output',path.join(root,'named'),'--folder',collectionNames[0],'--folder',collectionNames[1],'--compare',collectionNames[1]],io),0);
 assert.ok((await fs.readdir(path.join(root,'named'))).includes('comparison.html'));
 assert.equal(await hashtagAuditCommand(['--snapshot',snapshot.directory,'--output',path.join(root,'absent'),'--folder','NO SUCH SYNTHETIC FOLDER'],io),2);
 assert.equal(await hashtagAuditCommand(['--snapshot',snapshot.directory,'--output',path.join(root,'bad-selection'),'--folder',collectionNames[0],'--largest','3'],io),2);
 const files=await fs.readdir(path.join(root,'result'));for(const name of ['index.html','whole.html','saved.html','liked.html','provenance.json'])assert.ok(files.includes(name));assert.deepEqual(await fs.readFile(path.join(snapshot.directory,'manifest.json')),manifest);
});
