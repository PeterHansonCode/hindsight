import type { EventRecord } from './domain.ts';
import type { InstagramSideTableBundle } from './instagram-side-tables.ts';
export const hashtagRules = {
 encoding:'Read already-repaired retained Unicode text. Do not apply Latin-1/UTF-8 repair again.',
 tokens:'ASCII # followed by Unicode letters/numbers/underscore, then letters/marks/numbers/underscore. Punctuation, hyphens and emoji end the token. Numeric tokens are retained as textual hashtag candidates. URL spans and attached word/URL fragments are excluded.',
 normalisation:'NFC, Unicode lowercase, NFC again; no accent removal, stemming, synonyms, translation or topic naming. Structured names are retained as literal field values after trimming and removing one leading #, even when outside the caption token grammar; those values are disclosed separately. Caption punctuation rules do not silently discard structured evidence.',
 captions:'Union all nonempty retained captionValues, including alternate export values. Report first-caption and alternate-only contributions separately. No claim that one variant is current.',
 counting:'One vote per canonical post per tag. Unknown post identity uses observation/placement ID, disclosed. Saved and liked observations of the same canonical post merge for the whole-snapshot table; channel coverage is separately reported.',
 lists:'Frequent means >=3 posts, as requested. Repeated pairs/triples means >=2 posts; includes tags on only two posts. Count co-presence, not adjacency. No top-N truncation of eligible rows, naming gates, clustering or generic-tag classification.',
 coverage:'Always use the source union, even if the gain is zero; report exact gain, never claim it is meaningful by a hidden cutoff.',
};
const normal=(s:string)=>s.normalize('NFC').toLowerCase().normalize('NFC');
export function captionTags(text:string):string[]{
 const plain=text.replace(/(?:https?:\/\/|www\.)\S+/giu,' ');
 return [...new Set([...plain.matchAll(/(?<![\p{L}\p{M}\p{N}_/#?=&])#([\p{L}\p{N}_][\p{L}\p{M}\p{N}_]*)/gu)].map(m=>'#'+normal(m[1])))];
}
export function structuredTags(values:string[]){const tags=new Set<string>(),invalid:string[]=[];for(const raw of values){const value=normal(raw.trim().replace(/^#/,''));if(/^[\p{L}\p{N}_][\p{L}\p{M}\p{N}_]*$/u.test(value))tags.add('#'+value);else {invalid.push(raw);if(value)tags.add('#'+value);}}return {tags:[...tags],invalid};}
export interface TagPost {key:string;url:string|null;structured:string[];caption:string[];firstCaption:string[];merged:string[];channels:string[];captionPresent:boolean;unmatched:boolean;unknownIdentity:boolean;invalidStructured:string[]}
const union=(...values:string[][])=>[...new Set(values.flat())].sort();
function makePost(key:string,url:string|null,structured:string[],captions:(string|null)[],channels:string[],unmatched=false,unknownIdentity=false):TagPost{
 const parsed=structuredTags(structured),firstCaption=captionTags(captions[0]??''),caption=union(...captions.filter((c):c is string=>typeof c==='string').map(captionTags));
 return {key,url,structured:parsed.tags,caption,firstCaption,merged:union(parsed.tags,caption),channels,captionPresent:captions.some(c=>!!c),unmatched,unknownIdentity,invalidStructured:parsed.invalid};
}
function mergePost(a:TagPost,b:TagPost):TagPost{return {...a,url:a.url??b.url,structured:union(a.structured,b.structured),caption:union(a.caption,b.caption),firstCaption:union(a.firstCaption,b.firstCaption),merged:union(a.merged,b.merged),channels:union(a.channels,b.channels),captionPresent:a.captionPresent||b.captionPresent,invalidStructured:union(a.invalidStructured,b.invalidStructured)};}
export function hashtagIndex(events:EventRecord[],bundle:InstagramSideTableBundle){
 const rows=(name:string)=>bundle.tables.find(t=>t.name==='instagram.'+name)!.rows;
 const extras=new Map(rows('post_extras').map(r=>[String(r.observationId),r]));
 const observations=events.map(e=>{const r=extras.get(e.observationId)!;return makePost(typeof r.postKey==='string'?r.postKey:'observation:'+e.observationId,e.activity.url,r.hashtags as string[],r.captionValues as (string|null)[],[e.activity.event_type],false,typeof r.postKey!=='string');});
 const byId=new Map(events.map((e,i)=>[e.observationId,observations[i]]));
 const distinct=(posts:TagPost[])=>{const m=new Map<string,TagPost>();for(const p of posts)m.set(p.key,m.has(p.key)?mergePost(m.get(p.key)!,p):p);return [...m.values()];};
 const folders=rows('collections').map(f=>{const placements=rows('placements').filter(p=>p.collectionId===f.collectionId);const posts=placements.map(p=>{
  if(p.joinStatus==='matched'&&typeof p.savedObservationId==='string')return byId.get(p.savedObservationId)!;
  return makePost(typeof p.postKey==='string'?p.postKey:'placement:'+String(p.placementId),typeof p.url==='string'?p.url:null,p.hashtags as string[],p.captionValues as (string|null)[],['placement only'],true,typeof p.postKey!=='string');
 });return {id:String(f.collectionId),name:String(f.collection_name??'Unnamed folder'),posts:distinct(posts),placements:placements.length};}).sort((a,b)=>b.posts.length-a.posts.length||a.id.localeCompare(b.id));
 return {observations,whole:distinct(observations),saved:distinct(observations.filter(p=>p.channels.includes('saved'))),liked:distinct(observations.filter(p=>p.channels.includes('liked'))),folders};
}
export function tagCoverage(posts:TagPost[]){const structured=new Set(posts.flatMap(p=>p.structured)),caption=new Set(posts.flatMap(p=>p.caption));return {
 posts:posts.length,captionPresent:posts.filter(p=>p.captionPresent).length,structuredPosts:posts.filter(p=>p.structured.length).length,captionPosts:posts.filter(p=>p.caption.length).length,mergedPosts:posts.filter(p=>p.merged.length).length,
 gainedPosts:posts.filter(p=>!p.structured.length&&p.caption.length).length,firstCaptionMergedPosts:posts.filter(p=>union(p.structured,p.firstCaption).length).length,
 alternateOnlyCoveragePosts:posts.filter(p=>!union(p.structured,p.firstCaption).length&&p.caption.length).length,
 structuredOnlyVocabulary:[...structured].filter(t=>!caption.has(t)).sort(),captionOnlyVocabulary:[...caption].filter(t=>!structured.has(t)).sort(),sharedVocabulary:[...structured].filter(t=>caption.has(t)).sort(),
 structuredOnlyPostTagIncidences:posts.reduce((n,p)=>n+p.structured.filter(t=>!p.caption.includes(t)).length,0),captionOnlyPostTagIncidences:posts.reduce((n,p)=>n+p.caption.filter(t=>!p.structured.includes(t)).length,0),
 alternateOnlyPostTagIncidences:posts.reduce((n,p)=>n+p.caption.filter(t=>!p.firstCaption.includes(t)).length,0),invalidStructuredValues:posts.flatMap(p=>p.invalidStructured),unmatchedPosts:posts.filter(p=>p.unmatched).length,unknownIdentityPosts:posts.filter(p=>p.unknownIdentity).length};}
export function countTags(posts:TagPost[]){const counts=new Map<string,number>();for(const p of posts)for(const t of p.merged)counts.set(t,(counts.get(t)??0)+1);return counts;}
export function tagTable(posts:TagPost[],globalCounts:Map<string,number>=countTags(posts),folderCounts:{id:string;name:string;counts:Map<string,number>}[]=[]){
 const counts=countTags(posts),frequent=new Set([...counts].filter(([,n])=>n>=3).map(([t])=>t));
 const postings=new Map<string,TagPost[]>();for(const p of posts)for(const t of p.merged){const list=postings.get(t)??[];list.push(p);postings.set(t,list);}
 const partners=new Map<string,Map<string,number>>();for(const p of posts)for(const a of p.merged){const row=partners.get(a)??new Map();for(const b of p.merged)if(a!==b)row.set(b,(row.get(b)??0)+1);partners.set(a,row);}
 const tags=[...counts].map(([tag,n])=>({tag,posts:n,cleanPosts:postings.get(tag)!.filter(p=>p.merged.filter(t=>frequent.has(t)).length===1&&frequent.has(tag)).length,coTagPartners:partners.get(tag)?.size??0,repeatedCoTagPartners:[...(partners.get(tag)?.values()??[])].filter(n=>n>=2).length,wholeSnapshotPosts:globalCounts.get(tag)??0,folders:folderCounts.filter(f=>f.counts.has(tag)).map(f=>({id:f.id,name:f.name,posts:f.counts.get(tag)!})),postKeys:postings.get(tag)!.map(p=>p.key)})).sort((a,b)=>b.posts-a.posts||a.tag.localeCompare(b.tag));
 const sorted=tags.filter(t=>t.posts>=3),topCoverage=[10,25,50].map(top=>{const selected=new Set(sorted.slice(0,top).map(t=>t.tag));return {top,tagsAvailable:selected.size,posts:posts.filter(p=>p.merged.some(t=>selected.has(t))).length};});
 const pairCounts=new Map<string,number>(),tripleCounts=new Map<string,number>();
 // Tags appearing once cannot participate in a repeated combination. This exact pruning drops no eligible rows.
 for(const p of posts){const ts=p.merged.filter(t=>counts.get(t)!>=2).sort();for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const key=JSON.stringify([ts[i],ts[j]]);pairCounts.set(key,(pairCounts.get(key)??0)+1);for(let k=j+1;k<ts.length;k++){const triple=JSON.stringify([ts[i],ts[j],ts[k]]);tripleCounts.set(triple,(tripleCounts.get(triple)??0)+1);}}}
 const combinations=(map:Map<string,number>)=>[...map].filter(([,n])=>n>=2).map(([key,n])=>{const tags=JSON.parse(key) as string[];return {tags,posts:n,sharesOfEachTag:tags.map(t=>n/counts.get(t)!),postKeys:postings.get(tags.slice().sort((a,b)=>counts.get(a)!-counts.get(b)!)[0])!.filter(p=>tags.every(t=>p.merged.includes(t))).map(p=>p.key)};}).sort((a,b)=>b.posts-a.posts||JSON.stringify(a.tags).localeCompare(JSON.stringify(b.tags)));
 return {coverage:tagCoverage(posts),allTags:tags,frequentTags:sorted,topCoverage,noFrequentTagPosts:posts.filter(p=>!p.merged.some(t=>frequent.has(t))).length,noTagPosts:posts.filter(p=>!p.merged.length).length,pairs:combinations(pairCounts),triples:combinations(tripleCounts),posts};
}
