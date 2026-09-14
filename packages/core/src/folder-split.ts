import type { EventRecord } from './domain.ts';
import type { InstagramSideTableBundle } from './instagram-side-tables.ts';

export const splitRules = { sessionSeconds: 860.4, externalPosts: 5, topShare: 0.8, hhi: 0.65, sharedSessions: 2, sharedDates: 2, sessionJaccard: 0.2 };
const day = (t: number) => new Date(t + 10 * 3600000).toISOString().slice(0, 10);
const week = (t: number) => { const d = new Date(t); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - (d.getUTCDay() + 6) % 7)).toISOString().slice(0, 10); };
const share = (a: number, b: number) => b ? a / b : 0;
const unique = <T>(x: T[]) => [...new Set(x)];
export interface SplitPost { key: string; creator: string | null; time: number | null; url: string | null; tags: string[]; folders: string[]; session: number | null; status: string }
export function splitIndex(events: EventRecord[], bundle: InstagramSideTableBundle) {
  const rows = (name: string) => bundle.tables.find(t => t.name === 'instagram.' + name)!.rows;
  const extras = new Map(rows('post_extras').map(r => [String(r.observationId), r]));
  const byId = new Map(events.map(e => [e.observationId, e]));
  const sessions = new Map<string, number>(); let previous = -Infinity, session = 0;
  for (const e of events.filter(e => e.activity.event_type === 'saved').sort((a,b) => a.activity.timestamp.localeCompare(b.activity.timestamp) || a.observationId.localeCompare(b.observationId))) {
    const time = Date.parse(e.activity.timestamp); if (time - previous > splitRules.sessionSeconds * 1000) session++;
    sessions.set(e.observationId, session); previous = time;
  }
  const folders = rows('collections').map(r => ({ id: String(r.collectionId), name: String(r.collection_name ?? 'Unnamed folder'), posts: [] as SplitPost[], unknownPlacements: 0 }));
  const posts = new Map<string, SplitPost>();
  for (const r of rows('placements')) {
    const f = folders.find(f => f.id === r.collectionId)!;
    if (typeof r.postKey !== 'string') { f.unknownPlacements++; continue; }
    let p = posts.get(r.postKey);
    if (!p) {
      const e = r.joinStatus === 'matched' && typeof r.savedObservationId === 'string' ? byId.get(r.savedObservationId) : undefined;
      const extra = e ? extras.get(e.observationId) : undefined;
      p = { key: r.postKey, creator: e?.activity.creator_id ?? null, time: e ? Date.parse(e.activity.timestamp) : null, url: e?.activity.url ?? (typeof r.url === 'string' ? r.url : null), tags: unique((extra?.hashtags as string[] | undefined) ?? []), folders: [], session: e ? sessions.get(e.observationId) ?? null : null, status: e ? 'matched' : String(r.joinStatus) };
      posts.set(p.key, p);
    }
    if (!p.folders.includes(f.id)) { p.folders.push(f.id); f.posts.push(p); }
  }
  const creators = new Map<string, SplitPost[]>();
  for (const p of posts.values()) if (p.creator) { const list = creators.get(p.creator) ?? []; list.push(p); creators.set(p.creator, list); }
  const unfiled = new Map<string, number>();
  for (const e of events.filter(e => e.activity.event_type === 'saved' && e.activity.creator_id)) { const key = extras.get(e.observationId)?.postKey; if (typeof key !== 'string' || !posts.has(key)) unfiled.set(e.activity.creator_id!, (unfiled.get(e.activity.creator_id!) ?? 0) + 1); }
  return { folders, posts, creators, unfiled };
}
export type SplitIndex = ReturnType<typeof splitIndex>;
export function distribution(posts: SplitPost[], target: string) {
  const counts = new Map<string, { posts: number; weight: number }>(); let externalPosts = 0;
  for (const p of posts) { const others = p.folders.filter(f => f !== target); if (!others.length) continue; externalPosts++;
    for (const id of others) { const c = counts.get(id) ?? { posts: 0, weight: 0 }; c.posts++; c.weight += 1 / others.length; counts.set(id,c); }
  }
  const rows = [...counts].map(([folderId,c]) => ({ folderId, ...c, share: share(c.weight,externalPosts) })).sort((a,b) => b.share-a.share || a.folderId.localeCompare(b.folderId));
  const hhi = rows.reduce((n,r) => n+r.share*r.share,0), topShare = rows[0]?.share ?? 0;
  return { externalPosts, rows, hhi, topShare, winner: rows[0]?.folderId ?? null, strong: externalPosts >= splitRules.externalPosts && topShare >= splitRules.topShare && hhi >= splitRules.hhi };
}
export function labels(inside: SplitPost[], outside: SplitPost[]) {
  const tags = unique(inside.flatMap(p=>p.tags));
  const baselineSupported = outside.length >= 40 && new Set(outside.filter(p=>p.time!==null).map(p=>week(p.time!))).size >= 4;
  const ranked = tags.map(tag=>{const rows=inside.filter(p=>p.tags.includes(tag)), kOut=outside.filter(p=>p.tags.includes(tag)).length;return {tag,kIn:rows.length,kOut,nIn:inside.length,nOut:outside.length,weeks:new Set(rows.filter(p=>p.time!==null).map(p=>week(p.time!))).size,logRatio:Math.log2(((rows.length+0.5)/(inside.length+1))/((kOut+0.5)/(outside.length+1)))};}).filter(r=>baselineSupported&&r.kIn>=5&&r.weeks>=3&&r.logRatio>0).sort((a,b)=>b.logRatio-a.logRatio||a.tag.localeCompare(b.tag)).slice(0,3);
  const tagged=inside.filter(p=>p.tags.length).length;
  return { tagged, posts: inside.length, coverage:share(tagged,inside.length), weakCoverage:share(tagged,inside.length)<0.5, baselineSupported, ranked };
}
export function residueGroups(rows: {creator:string;posts:SplitPost[]}[]) {
  const ordered=rows.slice().sort((a,b)=>b.posts.length-a.posts.length||a.creator.localeCompare(b.creator));
  const sets=new Map(ordered.map(r=>[r.creator,new Set(r.posts.map(p=>p.session).filter((s):s is number=>s!==null))]));
  const edges: {a:string;b:string;sessions:number[];dates:number;jaccard:number}[]=[];
  for(let i=0;i<ordered.length;i++)for(let j=i+1;j<ordered.length;j++) {const a=ordered[i],b=ordered[j],sa=sets.get(a.creator)!,sb=sets.get(b.creator)!;const shared=[...sa].filter(s=>sb.has(s));const dates=new Set(a.posts.concat(b.posts).filter(p=>p.session!==null&&shared.includes(p.session)&&p.time!==null).map(p=>day(p.time!))).size;const jaccard=share(shared.length,new Set([...sa,...sb]).size);
    if(shared.length>=2&&dates>=2&&jaccard>=0.2)edges.push({a:a.creator,b:b.creator,sessions:shared,dates,jaccard});
  }
  const connected=(a:string,b:string)=>edges.some(e=>e.a===a&&e.b===b||e.b===a&&e.a===b);
  const groups: typeof rows[]=[];for(const row of ordered){const g=groups.find(g=>g.every(other=>connected(row.creator,other.creator)));if(g)g.push(row);else groups.push([row]);}
  return {groups,edges};
}
export function costs(additions:number,removals:number,decisions:number,newFolders:number) {
  const removalOnly=removals-additions;
  return { additions, removals, removalOnly, creatorDecisions:decisions, creatorSearches:decisions, newFolders, estimatedClicks:{low:additions*4+removalOnly*2+decisions*2+newFolders*3,high:additions*8+removalOnly*4+decisions*4+newFolders*6}, caveat:'Illustrative unmeasured click range; finding posts, scrolling, login and unavailable links add unknown work. One creator decision is not one post move.' };
}
export function proposeSplit(index:SplitIndex,targetId:string) {
  const target=index.folders.find(f=>f.id===targetId);if(!target)throw Error('Unknown folder ID.');
  const targetKeys=new Set(target.posts.map(p=>p.key));
  const creators=unique(target.posts.map(p=>p.creator).filter((c):c is string=>!!c)).map(creator=>{
    const posts=target.posts.filter(p=>p.creator===creator),all=index.creators.get(creator)!,full=distribution(all,targetId),independent=distribution(all.filter(p=>!targetKeys.has(p.key)),targetId);
    const destination=full.strong&&independent.strong&&full.winner===independent.winner?full.winner:null;
    return {creator,posts,full,independent,destination,status:destination?'strong filing evidence':full.externalPosts===0?'residue':'leave for review',unfiledSaves:index.unfiled.get(creator)??0,
      otherFolders:index.folders.filter(f=>f.id!==targetId).map(f=>({id:f.id,name:f.name,count:full.rows.find(r=>r.folderId===f.id)?.posts??0,weightedShare:full.rows.find(r=>r.folderId===f.id)?.share??0,directShared:posts.filter(p=>p.folders.includes(f.id)).length}))};
  }).sort((a,b)=>b.posts.length-a.posts.length||a.creator.localeCompare(b.creator));
  const grouped=new Map<string,typeof creators>();for(const c of creators.filter(c=>c.destination)){const g=grouped.get(c.destination!)??[];g.push(c);grouped.set(c.destination!,g);}
  const residue=residueGroups(creators.filter(c=>c.status==='residue'));
  const groups=[...grouped].map(([destination,rows])=>({type:'existing folder',destination,name:index.folders.find(f=>f.id===destination)!.name,rows})).concat(residue.groups.filter(g=>g.length>1).map(g=>({type:'session review',destination:'',name:g.map(c=>c.creator).join(' / '),rows:creators.filter(c=>g.some(r=>r.creator===c.creator))})));
  const proposals=groups.map(g=>{const posts=g.rows.flatMap(c=>c.posts),already=g.destination?posts.filter(p=>p.folders.includes(g.destination)).length:0;return {...g,posts:posts.length,postsPerDecision:posts.length/g.rows.length,labels:labels(posts,target.posts.filter(p=>!posts.includes(p))),cost:costs(posts.length-already,posts.length,g.rows.length,g.destination?0:1)};}).sort((a,b)=>b.postsPerDecision-a.postsPerDecision||b.posts-a.posts||a.name.localeCompare(b.name));
  const proposed=new Set(proposals.flatMap(g=>g.rows.flatMap(c=>c.posts.map(p=>p.key))));
  const stay=target.posts.filter(p=>!proposed.has(p.key)).map(p=>({...p,action:'Stay in target; no supported move proposed.'}));
  const total=(groups:typeof proposals)=>costs(groups.reduce((n,g)=>n+g.cost.additions,0),groups.reduce((n,g)=>n+g.cost.removals,0),groups.reduce((n,g)=>n+g.cost.creatorDecisions,0),groups.reduce((n,g)=>n+g.cost.newFolders,0));
  return {sensitivity:'personal',target:{id:target.id,name:target.name,posts:target.posts.length,unknownPlacements:target.unknownPlacements},rules:splitRules,creators,proposals,residueEdges:residue.edges,stay,totals:{strongOnly:total(proposals.filter(g=>g.type==='existing folder')),allOptional:total(proposals)},unavailableUrls:target.posts.filter(p=>!p.url).length};
}
export function auditFolders(index:SplitIndex) {
  const folders=index.folders.map(f=>{
    const matched=f.posts.filter(p=>p.creator),counts=new Map<string,number>();for(const p of matched)counts.set(p.creator!,(counts.get(p.creator!)??0)+1);
    const creatorHHI=matched.length?[...counts.values()].reduce((n,c)=>n+(c/matched.length)**2,0):null;
    const tags=new Map<string,number>();for(const p of f.posts)for(const tag of p.tags)tags.set(tag,(tags.get(tag)??0)+1);
    const tagIncidences=[...tags.values()].reduce((a,b)=>a+b,0),tagged=f.posts.filter(p=>p.tags.length).length;
    const entropy=tags.size>1?-[...tags.values()].reduce((n,k)=>n+(k/tagIncidences)*Math.log(k/tagIncidences),0)/Math.log(tags.size):null;
    const assessable=tagged>=20&&share(tagged,f.posts.length)>=0.3&&tags.size>=10&&share(matched.length,f.posts.length)>=0.9;
    const exclusive=[...counts].filter(([c])=>unique(index.creators.get(c)!.flatMap(p=>p.folders)).length===1).map(([creator,posts])=>({creator,posts,unfiledSaves:index.unfiled.get(creator)??0}));
    return {id:f.id,name:f.name,posts:f.posts.length,unknownPlacements:f.unknownPlacements,matchedPosts:matched.length,creatorHHI,taggedPosts:tagged,hashtagCoverage:share(tagged,f.posts.length),distinctTags:tags.size,hashtagEntropy:entropy,bin:assessable&&f.posts.length>=100&&creatorHHI!==null&&creatorHHI<=0.1&&entropy!==null&&entropy>=0.8,binAssessable:assessable,underFive:f.posts.length<5&&f.unknownPlacements===0,residuePosts:exclusive.reduce((n,c)=>n+c.posts,0),residueShare:share(exclusive.reduce((n,c)=>n+c.posts,0),matched.length),exclusiveCreators:exclusive};
  }).sort((a,b)=>b.posts-a.posts||a.id.localeCompare(b.id));
  const pairs=[];for(let i=0;i<index.folders.length;i++)for(let j=i+1;j<index.folders.length;j++){const a=index.folders[i],b=index.folders[j],shared=a.posts.filter(p=>p.folders.includes(b.id)).length;const jaccard=share(shared,a.posts.length+b.posts.length-shared),aShare=share(shared,a.posts.length),bShare=share(shared,b.posts.length);pairs.push({a:a.id,b:b.id,aName:a.name,bName:b.name,shared,jaccard,aShare,bShare,mergeReview:shared>=10&&jaccard>=0.5&&aShare>=0.5&&bShare>=0.5,containmentReview:shared>=5&&Math.max(aShare,bShare)>=0.8});}
  return {sensitivity:'personal',scope:'Only this retained snapshot, not all historical folder membership.',uniqueFiledPosts:index.posts.size,multiFolderPosts:[...index.posts.values()].filter(p=>p.folders.length>1).length,folders,pairs};
}
