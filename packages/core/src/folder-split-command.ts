import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readExplorationSnapshot } from './exploration-command.ts';
import { verifySnapshot, inside } from './snapshots.ts';
import { splitIndex, auditFolders, proposeSplit } from './folder-split.ts';
import { auditHtml, proposalHtml, splitPage } from './folder-split-report.ts';
export async function folderSplitCommand(args:string[], io:{stdout?:(s:string)=>void;stderr?:(s:string)=>void}={}) {
 const out=io.stdout??console.log,err=io.stderr??console.error,flags=new Map<string,string>();
 for(let i=0;i<args.length;i+=2){if(!['--snapshot','--output','--folder','--largest','--source-root'].includes(args[i])||!args[i+1]||args[i+1].startsWith('--')||flags.has(args[i])){err('Use --snapshot <retained snapshot> --output <fresh directory> and either --folder <ID> or --largest <count>.');return 2;}flags.set(args[i],args[i+1]);}
 if(!flags.has('--snapshot')||!flags.has('--output')||flags.has('--folder')===flags.has('--largest')||flags.has('--largest')&&!/^[1-9]\d?$/.test(flags.get('--largest')!)){err('Supply a snapshot, fresh output directory, and one folder ID or a largest-folder count from 1 to 99.');return 2;}
 try{
  const source=await fs.realpath(flags.get('--snapshot')!),destination=path.resolve(flags.get('--output')!);
  const parent=await fs.realpath(path.dirname(destination)),resolved=path.join(parent,path.basename(destination));
  const repo=await fs.realpath(fileURLToPath(new URL('../../..',import.meta.url)));
  const protectedPaths=[source,repo];if(flags.has('--source-root'))protectedPaths.push(await fs.realpath(flags.get('--source-root')!));
  if(protectedPaths.some(p=>inside(p,resolved)))throw Error('Protected output.');
  const retained=await readExplorationSnapshot(source),index=splitIndex(retained.events,retained.bundle),audit=auditFolders(index);
  const targets=flags.has('--folder')?[flags.get('--folder')!]:audit.folders.slice(0,Number(flags.get('--largest'))).map(f=>f.id);
  const proposals=targets.map(id=>proposeSplit(index,id));
  const files:Record<string,string>={'audit-personal.json':JSON.stringify(audit,null,2),'audit-personal.html':auditHtml(audit)};
  proposals.forEach((p,i)=>{files[`proposal-${i+1}-personal.json`]=JSON.stringify(p,null,2);files[`proposal-${i+1}-personal.html`]=proposalHtml(p);});
  files['index.html']=splitPage('Folder split review',`<p>Nothing has moved. Start with the <a href="audit-personal.html">all-folder audit</a>, then review each independent proposal. Do not add their click totals without checking shared posts and conflicting destinations.</p><ul>${proposals.map((p,i)=>`<li><a href="proposal-${i+1}-personal.html">Proposal ${i+1}: ${p.target.posts} posts</a> — ${p.totals.strongOnly.removals} strong suggestions; ${p.totals.allOptional.removals-p.totals.strongOnly.removals} optional session-group posts; ${p.stay.length} stay in place.</li>`).join('')}</ul><p>Each proposal includes creator evidence, clickable post checklists, hashtag coverage and explicit click assumptions. JSON companions preserve the full calculations.</p>`);
  const after=await verifySnapshot(source);if(JSON.stringify(after)!==JSON.stringify(retained.manifest))throw Error('Snapshot changed.');
  files['provenance.json']=JSON.stringify({snapshotId:retained.manifest.snapshotId,artifacts:retained.manifest.artifacts,targets,counts:proposals.map(p=>({posts:p.target.posts,strong:p.totals.strongOnly.removals,optional:p.totals.allOptional.removals,stay:p.stay.length})),sourcesUnchanged:true},null,2);
  await fs.mkdir(resolved);for(const [name,text]of Object.entries(files))await fs.writeFile(path.join(resolved,name),text+'\n',{flag:'wx',mode:0o600});
  out(JSON.stringify({folders:audit.folders.length,multiFolderPosts:audit.multiFolderPosts,binCandidates:audit.folders.filter(f=>f.bin).length,mergePairs:audit.pairs.filter(p=>p.mergeReview).length,smallFolders:audit.folders.filter(f=>f.underFive).length,proposals:proposals.map(p=>({posts:p.target.posts,strong:p.totals.strongOnly,allOptional:p.totals.allOptional,stay:p.stay.length})),output:resolved},null,2));return 0;
 }catch{err('Proposal could not finish. Check the folder ID and snapshot integrity, and choose a fresh output directory with an existing writable parent outside the repository and inputs. No source assignments changed; an incomplete output may remain.');return 1;}
}
