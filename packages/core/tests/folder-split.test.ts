import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { distribution, labels, residueGroups, costs, proposeSplit, auditFolders, splitIndex, type SplitPost, type SplitIndex } from '../src/folder-split.ts';
import { proposalHtml } from '../src/folder-split-report.ts';
import { folderSplitCommand } from '../src/folder-split-command.ts';
import { ingestInstagram } from '../src/ingest.ts';
const epoch=Date.parse('2026-01-01T00:00:00Z');
const post=(key:string,creator='synthetic',folders=['target'],session:number|null=1,time:number|null=epoch):SplitPost=>({key,creator,folders,session,time,url:'https://www.instagram.com/p/SYNTHETIC_'+key+'/',tags:[],status:'matched'});
function index(posts:SplitPost[]):SplitIndex{const creators=new Map<string,SplitPost[]>();for(const p of posts)if(p.creator){const rows=creators.get(p.creator)??[];rows.push(p);creators.set(p.creator,rows);}return {posts:new Map(posts.map(p=>[p.key,p])),creators,unfiled:new Map(),folders:['target','other','third'].map(id=>({id,name:'SYNTHETIC '+id,posts:posts.filter(p=>p.folders.includes(id)),unknownPlacements:0}))};}
test('Folder split fractional evidence gives one total vote per post, not one per placement',()=>{const d=distribution([post('a','x',['target','other','third']),post('b','x',['other'])],'target');assert.equal(d.externalPosts,2);assert.equal(d.rows[0].share,0.75);assert.equal(d.rows[1].share,0.25);assert.equal(d.hhi,0.625);});
test('Folder split strong mapping requires independent posts and leaves mixed and self-corroborating evidence in place',()=>{
 const target=[post('a'),post('b')],external=Array.from({length:5},(_,i)=>post('x'+i,'synthetic',['other']));
 const p=proposeSplit(index([...target,...external]),'target');assert.equal(p.totals.strongOnly.removals,2);assert.equal(p.proposals[0].destination,'other');assert.equal(p.stay.length,0);
 const shared=Array.from({length:8},(_,i)=>post('s'+i,'synthetic',['target','other']));assert.equal(proposeSplit(index(shared),'target').proposals.length,0);
 const mixed=proposeSplit(index([...target,...external,...Array.from({length:5},(_,i)=>post('z'+i,'synthetic',['third']))]),'target');assert.equal(mixed.stay.length,2);
});
test('Folder split counts already-filed posts as removal-only and conserves all target actions including unresolved posts',()=>{
 const unknown={...post('unknown'),creator:null,status:'unmatched_placement',url:null};const p=proposeSplit(index([post('a','synthetic',['target','other']),post('b'),unknown,...Array.from({length:5},(_,i)=>post('x'+i,'synthetic',['other']))]),'target');
 assert.equal(p.totals.strongOnly.additions,1);assert.equal(p.totals.strongOnly.removalOnly,1);assert.equal(p.totals.allOptional.removals+p.stay.length,p.target.posts);assert.equal(p.stay[0].status,'unmatched_placement');
 assert.deepEqual(costs(1,2,1,0).estimatedClicks,{low:8,high:16});
});
test('Residue needs repeated co-sessions on distinct dates and cannot chain A-B-C into one group',()=>{
 const row=(creator:string,sessions:number[])=>({creator,posts:sessions.map(s=>post(creator+s,creator,['target'],s,epoch+s*86400000))});
 assert.equal(residueGroups([row('a',[1]),row('b',[1])]).groups.length,2);
 const r=residueGroups([row('a',[1,2]),row('b',[1,2,3,4]),row('c',[3,4])]);assert.equal(r.edges.length,2);assert.ok(r.groups.every(g=>g.length<=2));
 const sameDate=[row('a',[1,2]),row('b',[1,2])];sameDate.forEach(r=>r.posts.forEach(p=>p.time=epoch));assert.equal(residueGroups(sameDate).edges.length,0);
});
test('Hashtag names use the specified supported log ratio and disclose weak coverage',()=>{
 const inside=Array.from({length:25},(_,i)=>({...post('i'+i,'x',['target'],i,epoch+i*7*86400000),tags:i<5?['#synthetic']:[]}));
 const outside=Array.from({length:40},(_,i)=>post('o'+i,'x',['target'],i,epoch+i*86400000));const l=labels(inside,outside);assert.equal(l.coverage,0.2);assert.equal(l.weakCoverage,true);assert.equal(l.ranked[0].logRatio,Math.log2((5.5/26)/(0.5/41)));assert.equal(labels(inside,outside.slice(0,3)).ranked.length,0);
});
test('Audit separates merge overlap, smaller-folder containment, bins and under-five folders',()=>{
 const p=Array.from({length:12},(_,i)=>post('p'+i,'c'+i,['target','other']));p.push(post('one','only',['third']));const a=auditFolders(index(p));assert.equal(a.multiFolderPosts,12);assert.equal(a.pairs.filter(p=>p.mergeReview).length,1);assert.equal(a.folders.find(f=>f.id==='third')!.residueShare,1);assert.equal(a.folders.find(f=>f.id==='third')!.underFive,true);assert.ok(a.folders.every(f=>!f.bin));
});
test('Proposal HTML escapes names and refuses hostile post URLs without scripts or network assets',()=>{const p=proposeSplit(index([post('a')]),'target');p.target.name='<script>attack</script>';p.stay[0].url='javascript:alert(1)';const html=proposalHtml(p);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('javascript:'));assert.ok(!/<script|<link|<img/i.test(html));assert.ok(html.includes("default-src 'none'"));});
test('Folder command uses a retained snapshot, writes one audit, deduplicates placements, and protects source and existing output',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'hindsight-split-'));t.after(async()=>{assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));assert.ok(path.basename(root).startsWith('hindsight-split-'));await fs.rm(root,{recursive:true,force:true});});
 const fixture=JSON.parse(await fs.readFile(new URL('./fixtures/instagram.synthetic.json',import.meta.url),'utf8')),input=path.join(root,'input');for(const [name,data] of Object.entries(fixture.files)){const f=path.join(input,name);await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,JSON.stringify(data));}
 const snapshot=await ingestInstagram({input,output:path.join(root,'snapshots'),snapshotId:'synthetic',exportDate:'2026-08-30'});const before=await fs.readFile(path.join(snapshot.directory,'manifest.json'));
 const args=['--snapshot',snapshot.directory,'--output',path.join(root,'output'),'--largest','3','--source-root',input];const io={stdout:()=>{},stderr:()=>{}};assert.equal(await folderSplitCommand(args,io),0);assert.equal(await folderSplitCommand(args,io),1);assert.equal((await fs.readdir(path.join(root,'output'))).filter(n=>n==='audit-personal.html').length,1);
 assert.equal(await folderSplitCommand(['--snapshot',snapshot.directory,'--output',path.join(root,'bad'),'--folder','missing'],io),1);
 assert.equal(await folderSplitCommand(['--snapshot',snapshot.directory,'--output',path.join(input,'bad'),'--largest','1','--source-root',input],io),1);
 assert.deepEqual(await fs.readFile(path.join(snapshot.directory,'manifest.json')),before);
 const events=(await fs.readFile(path.join(snapshot.directory,'observations.jsonl'),'utf8')).trim().split('\n').map(line=>JSON.parse(line)),bundle=JSON.parse(await fs.readFile(path.join(snapshot.directory,'side-tables.json'),'utf8'));const beforeIndex=splitIndex(events,bundle);const table=bundle.tables.find((t:any)=>t.name==='instagram.placements');table.rows.push(structuredClone(table.rows[0]));assert.equal(splitIndex(events,bundle).posts.size,beforeIndex.posts.size);
});

 test('Bin audit requires diversity and coverage as well as size; large single-creator folders do not qualify',()=>{
 const diverse=Array.from({length:100},(_,i)=>({...post('d'+i,'c'+i),tags:['#synthetic'+i]}));const a=auditFolders(index(diverse)).folders.find(f=>f.id==='target')!;assert.equal(a.bin,true);assert.ok(Math.abs(a.creatorHHI!-0.01)<1e-12);
 const concentrated=diverse.map(p=>({...p,creator:'one'}));assert.equal(auditFolders(index(concentrated)).folders.find(f=>f.id==='target')!.bin,false);
 const missing=diverse.map(p=>({...p,tags:[]}));assert.equal(auditFolders(index(missing)).folders.find(f=>f.id==='target')!.binAssessable,false);
});
