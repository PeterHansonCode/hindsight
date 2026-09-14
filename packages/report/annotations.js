(function(root){
'use strict';
const contexts=new Set(['before-viewing-evidence','after-viewing-evidence','unknown']);
const clone=x=>JSON.parse(JSON.stringify(x));
function text(v,max){return typeof v==='string'&&v.length<=max;}
function iso(v){return typeof v==='string'&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;}
function day(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;}
function bound(v){if(!v||!day(v.earliest)||!day(v.latest)||v.earliest>v.latest||!['day','month','year','approximate'].includes(v.precision))throw Error('Use valid calendar-date bounds, earliest before latest.');return {earliest:v.earliest,latest:v.latest,precision:v.precision};}
function entry(v,history=true){
if(!v||!text(v.id,128)||!v.id||!['point','period'].includes(v.kind)||!text(v.label,200)||!v.label.trim()||!text(v.notes,10000)||!text(v.timezone,100)||!iso(v.createdAt)||!iso(v.updatedAt)||v.updatedAt<v.createdAt||v.authorship!=='user'||!Array.isArray(v.snapshotRefs)||v.snapshotRefs.length>100||!v.snapshotRefs.every(x=>text(x,128)))throw Error('The annotation fields are not valid.');
try{new Intl.DateTimeFormat('en',{timeZone:v.timezone});}catch{throw Error('The annotation timezone is not recognised.');}
const start=bound(v.start),end=v.end===null?null:bound(v.end);if(v.kind==='point'&&end!==null||end&&end.latest<start.earliest)throw Error('The period ends before it can start.');
const recordedContext=v.recordedContext===undefined?'unknown':v.recordedContext;if(!contexts.has(recordedContext))throw Error('The recording context is not recognised.');
const out={id:v.id,kind:v.kind,label:v.label,start,end,timezone:v.timezone,notes:v.notes,snapshotRefs:[...v.snapshotRefs],createdAt:v.createdAt,updatedAt:v.updatedAt,authorship:'user',recordedContext,revision:v.revision===undefined?1:v.revision};
if(!Number.isSafeInteger(out.revision)||out.revision<1)throw Error('Invalid annotation revision.');
if(v.lastEditedContext!==undefined){if(!contexts.has(v.lastEditedContext))throw Error('Invalid editing context.');out.lastEditedContext=v.lastEditedContext;}
if(history){if(v.history!==undefined&&(!Array.isArray(v.history)||v.history.length>50))throw Error('Annotation revision history is too large.');out.history=(v.history??[]).map(h=>entry(h,false));if(out.history.some(h=>h.id!==out.id||h.createdAt!==out.createdAt||h.recordedContext!==out.recordedContext||h.revision>=out.revision||h.updatedAt>out.updatedAt))throw Error('Annotation history does not match its record.');if(new Set(out.history.map(h=>h.revision)).size!==out.history.length)throw Error('Repeated annotation revision.');}
return out;
}
function validate(value){if(!value||value.format!=='hindsight.annotations'||value.schemaVersion!==1||value.sensitivity!=='personal'||!Number.isSafeInteger(value.revision)||value.revision<0||!Array.isArray(value.events)||value.events.length>2000)throw Error('Choose a version 1 HINDSIGHT personal annotation bundle.');const events=value.events.map(e=>entry(e));if(new Set(events.map(e=>e.id)).size!==events.length)throw Error('Duplicate annotation identities in the import.');return {format:value.format,schemaVersion:1,sensitivity:'personal',revision:value.revision,events};}
function upsert(bundle,draft,{now,id,snapshotId}){const data=validate(bundle),old=data.events.find(e=>e.id===id);if(old&&old.history.length>=50)throw Error('This memory has reached the 50-revision limit; export it before starting a new record.');const next=entry({...draft,id,timezone:draft.timezone||'Australia/Brisbane',createdAt:old?.createdAt??now,updatedAt:now,snapshotRefs:old?.snapshotRefs??[snapshotId],authorship:'user',recordedContext:old?.recordedContext??'after-viewing-evidence',lastEditedContext:old?'after-viewing-evidence':undefined,revision:old?old.revision+1:1,history:old?[...old.history,entry(old,false)]:[]});return validate({...data,revision:data.revision+1,events:old?data.events.map(e=>e.id===id?next:e):[...data.events,next]});}
function merge(current,incoming){const a=validate(current),b=validate(incoming),map=new Map(a.events.map(e=>[e.id,e]));let added=0;for(const e of b.events){const existing=map.get(e.id);if(existing&&JSON.stringify(existing)!==JSON.stringify(e))throw Error('A memory with this identity differs from the current copy. Import cancelled; neither version was overwritten.');if(!existing){map.set(e.id,e);added++;}}return validate({...a,revision:added?Math.max(a.revision,b.revision)+1:a.revision,events:[...map.values()]});}
function context(v){return v==='after-viewing-evidence'?'Recorded after viewing evidence':v==='before-viewing-evidence'?'Recorded before viewing this report':'Recording context not recorded';}
root.HindsightAnnotations={validate,upsert,merge,context};
})(globalThis);
