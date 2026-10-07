
const $=s=>document.querySelector(s);
const P={cam:'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',copy:'M9 9h11v11H9zM5 15H4V4h11v1',down:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',x:'M18 6L6 18M6 6l12 12',plus:'M12 5v14M5 12h14',user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',uplus:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',dots:'M12 5v.01M12 12v.01M12 19v.01',call:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
video:'M23 7l-7 5 7 5zM1 5h15v14H1z',clip:'M21.4 11l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5',
mic:'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4',
send:'M22 2L11 13M22 2l-7 20-4-9-9-4z',back:'M19 12H5M12 19l-7-7 7-7',stop:'M6 6h12v12H6z',trash:'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',chat:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'};
const ico=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n]}"/></svg>`;
document.querySelectorAll('[data-i]').forEach(b=>b.innerHTML=ico(b.dataset.i));
const okAv=v=>typeof v==='string'&&v.startsWith('data:image/')&&v.length<30000?v:'';
function setAv(el,name,av){el.textContent='';if(av){const i=new Image();i.src=av;el.appendChild(i)}else el.textContent=(name||'?')[0].toUpperCase()}

// Free public TURN relay (limited). For heavy use, replace with your own account from metered.ca
const CFG={iceServers:[
  {urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},
  {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}
]};

let last=null,peer,conn,call,inc,stream,me='',friend='',rec,chunks=[],recT,recAt,ct,t0,muted=false;
const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const show=id=>document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id===id));
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2500)};

try{$('#name').value=localStorage.getItem('idc')||''}catch(e){}

/* ---------- keyboard-safe sizing ---------- */
let maxH=innerHeight;
function fit(){
  const v=window.visualViewport,h=v?v.height:innerHeight;
  maxH=Math.max(maxH,innerHeight,h);
  const R=document.documentElement.style;
  R.setProperty('--h',h+'px');R.setProperty('--t',(v?v.offsetTop:0)+'px');
  document.body.classList.toggle('kb',h<maxH-150);
  const m=$('#msgs');m.scrollTop=m.scrollHeight;
}
if(window.visualViewport){visualViewport.addEventListener('resize',fit);visualViewport.addEventListener('scroll',fit)}
addEventListener('resize',fit);addEventListener('orientationchange',()=>{maxH=0;setTimeout(fit,300)});
$('#msg').addEventListener('focus',()=>setTimeout(()=>{window.scrollTo(0,0);fit()},300));
fit();

/* ---------- username / peer ---------- */
function start(a){
  $('#go').disabled=true;ACC=a;
  if(peer)peer.destroy();
  me='';
  const p=peer=new Peer(a.id,{config:CFG});
  const fail=m=>{clearTimeout(t);$('#go').disabled=false;if(peer===p){p.destroy();peer=null}toast(m)};
  const t=setTimeout(()=>fail('Server is slow. Try again.'),15000);
  p.on('open',id=>{
    clearTimeout(t);me=id;
    
    openDB(id);Object.keys(H).forEach(k=>delete H[k]);
    db('c','readonly',x=>x.getAll()).then(a=>{(a||[]).forEach(h=>H[h.id]=h);list();wrender()});show('app');myAv();hostHub();
  });
  p.on('error',e=>{
    if(!me)return fail(e.type==='unavailable-id'?'This account is already open on another device or tab.':'Could not connect. Try again.');
    if(String(e.message).includes(HUB))return;toast(e.type==='peer-unavailable'?'That user is offline':'Connection error');
  });
  p.on('disconnected',()=>{if(!p.destroyed)p.reconnect()});
  p.on('connection',bind);
  p.on('call',c=>{
    if(call||inc){c.close();return}
    inc=c;$('#who').textContent=disp(H[c.peer]||{id:c.peer});
    $('#intype').textContent=c.metadata&&c.metadata.video?'Video call':'Audio call';
    $('#inc').classList.add('on');
    c.on('close',()=>{if(inc===c){inc=null;$('#inc').classList.remove('on')}});
  });
}
$('#go').onclick=create;$('#name').onkeydown=e=>{if(e.key==='Enter')create()};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&peer&&peer.disconnected&&!peer.destroyed)peer.reconnect()});


/* ---------- local storage (IndexedDB, on this device) ---------- */
let DB=Promise.resolve(null);
function openDB(n){DB=new Promise(r=>{try{const q=indexedDB.open('rc_'+n,1);q.onupgradeneeded=()=>{q.result.createObjectStore('c',{keyPath:'id'});q.result.createObjectStore('m',{autoIncrement:true})};q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)}catch(e){r(null)}})}
const db=async(st,mode,fn)=>{const d=await DB;if(!d)return;return new Promise(res=>{try{const o=fn(d.transaction(st,mode).objectStore(st));o.onsuccess=()=>res(o.result);o.onerror=()=>res()}catch(e){res()}})};
const save=h=>db('c','readwrite',x=>x.put(h));

/* ---------- chats + encrypted connections ---------- */
const H={},S={};let cur=null,pend=null;   // H: saved chats, S: live connections {c,kp,aes}
const hist=id=>H[id]||(H[id]={id,msgs:[],ts:Date.now(),un:0});
async function seal(aes,meta,data){
  const m=new TextEncoder().encode(JSON.stringify(meta)),d=new Uint8Array(data||0);
  const b=new Uint8Array(4+m.length+d.length);
  new DataView(b.buffer).setUint32(0,m.length);b.set(m,4);b.set(d,4+m.length);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  return{kind:'enc',iv,c:await crypto.subtle.encrypt({name:'AES-GCM',iv},aes,b)};
}
async function unseal(aes,d){
  const b=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(d.iv)},aes,d.c));
  const n=new DataView(b.buffer).getUint32(0);
  return{meta:JSON.parse(new TextDecoder().decode(b.subarray(4,4+n))),data:b.slice(4+n).buffer};
}
function connect(t){
  t=(t||'').trim().replace(/^rc1:/,'').toLowerCase();if(!/^[a-z2-7]{51}$/.test(t))return toast('Invalid ID');
  if(!t||t===me||!peer)return;
  $('#to').value='';
  if(S[t]&&S[t].aes)return openChat(t);
  pend=t;link(t);
}
function link(id){if(!peer||(S[id]&&S[id].c.open))return;bind(peer.connect(id,{reliable:true}))}
const goC=()=>{connect($('#to').value);closeM('#nc')};$('#connect').onclick=goC;$('#to').onkeydown=e=>{if(e.key==='Enter')goC()};
function drop(id){const s=S[id];if(s){delete S[id];s.c.close()}if(pend===id)pend=null;list();stat()}
function bind(c){
  const id=c.peer,old=S[id];
  if(old&&old.c.open){c.close();return}
  if(!(window.crypto&&crypto.subtle)){dlg('Not supported','Encryption needs a secure (https) page. Please open the site over https.','OK');c.close();return}
  // fresh random key pair for this connection only; keys live only as long as the connection
  const s=S[id]={c,aes:null,kp:crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveKey'])};
  if(old)old.c.close();
  const hello=async()=>{const k=await s.kp,pub=await crypto.subtle.exportKey('jwk',k.publicKey),sig=await sign(pub.x+'.'+pub.y+'|'+id);if(S[id]===s)c.send({kind:'key',pub,sp:ACC.pub,sig})};
  c.open?hello():c.on('open',hello);
  setTimeout(()=>{if(S[id]===s&&!s.aes){if(c.open)toast('Secure connection failed');drop(id)}},10000);
  c.on('data',d=>onData(id,s,d));
  c.on('close',()=>{if(S[id]===s){delete S[id];if(call&&call.peer===id)endCall();list();stat()}});
  c.on('error',()=>toast('Connection failed'));
}
async function onData(id,s,d){
  if(!d)return;
  try{
    if(d.kind==='key'&&!s.aes){
      if(!(await vsig(d.sp,d.sig,(d.pub&&d.pub.x+'.'+d.pub.y)+'|'+me,id))){toast('Identity check failed');return drop(id)}
      const pk=await crypto.subtle.importKey('jwk',d.pub,{name:'ECDH',namedCurve:'P-256'},false,[]);
      s.aes=await crypto.subtle.deriveKey({name:'ECDH',public:pk},(await s.kp).privateKey,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
      save(hist(id));list();stat();sendProf(s);
      if(pend===id){pend=null;openChat(id)}else toast(disp(hist(id))+' is online');
    }else if(d.kind==='enc'&&s.aes){
      const {meta,data}=await unseal(s.aes,d);
      if(meta.kind==='prof'){const h=hist(id);h.av=okAv(meta.av);h.nm=cleanName(meta.n,id);h.vf=await vcert(id,meta.c);save(h);list();if(cur===id)hdr()}else if(meta.kind==='text')addMsg(id,false,'text',String(meta.text));
      else if(meta.kind==='file'){const k=(meta.type||'').split('/')[0];if(['image','video','audio'].includes(k)&&data.byteLength)addMsg(id,false,k,new Blob([data],{type:meta.type}))}
    }
  }catch(e){toast('Could not decrypt a message')}
}

/* ---------- messages (saved per chat) ---------- */
async function addMsg(id,mine,k,x,u){
  const h=hist(id),m={mine,k,ts:Date.now()};if(u)m.u=u;
  if(k==='text')m.x=x;else m.b=await db('m','readwrite',o=>o.add(x));
  h.msgs.push(m);h.ts=m.ts;if(!mine&&cur!==id)h.un++;
  save(h);list();if(h.g&&!$('#pw').hidden)wrender();if(cur===id)draw(m,x);
}
let lastTs=0;
async function draw(m,blob){
  const box=$('#msgs'),e=box.querySelector('.empty');if(e)e.remove();
  const r=document.createElement('div');r.className='row'+(m.mine?' mine':'');if(m.u&&!m.mine){const w=document.createElement('time');w.textContent=m.u;w.style.fontWeight=700;r.appendChild(w)}
  if(m.k==='text'){const b=document.createElement('div');b.className='b';b.textContent=m.x;r.appendChild(b)}
  else{
    const bl=blob||await db('m','readonly',o=>o.get(m.b));if(!bl)return;
    const el=document.createElement(m.k==='image'?'img':m.k),u=URL.createObjectURL(bl);el.src=u;
    if(m.k==='image'){el.onclick=()=>window.open(u,'_blank');el.onload=()=>box.scrollTop=box.scrollHeight}else{el.controls=true;el.preload='metadata'}
    r.appendChild(el);
  }
  if(m.ts-lastTs>3e5){const z=document.createElement('div'),d=new Date(m.ts);z.className='tm';z.textContent=d.toLocaleString([],new Date().toDateString()===d.toDateString()?{hour:'2-digit',minute:'2-digit'}:{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});box.appendChild(z)}lastTs=m.ts;
  const t=document.createElement('time');t.textContent=new Date(m.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});t.hidden=true;r.appendChild(t);r.onclick=()=>{t.hidden=!t.hidden};
  box.appendChild(r);box.scrollTop=box.scrollHeight;
}
function list(){
  const L=$('#list');L.innerHTML='';
  const qq=$('#q').value.trim().toLowerCase();Object.values(H).filter(h=>!h.g&&(h.nm||h.id).toLowerCase().includes(qq)).sort((a,b)=>b.ts-a.ts).forEach(h=>{
    const l=h.msgs[h.msgs.length-1],d=document.createElement('button');d.className='it'+(h.id===cur?' act':'');
    d.innerHTML='<i class="av"></i><span class="tx"><b></b><small></small></span><em></em>';
    setAv(d.querySelector('.av'),h.nm||h.id,h.av);
    d.querySelector('b').textContent=disp(h);
    d.querySelector('small').textContent=l?(l.mine?'You: ':'')+(l.k==='text'?l.x:'['+l.k+']'):'No messages yet';
    const e=d.querySelector('em');
    if(h.un){e.textContent=h.un;e.className='un'}else if(S[h.id]&&S[h.id].aes)e.className='on';
    d.onclick=()=>openChat(h.id);L.appendChild(d);
  });
  if(!L.children.length)L.innerHTML='<div class="empty2">'+(qq?'No results':'No chats yet')+'</div>';
}
function stat(){const s=S[cur];$('#stt').textContent=cur?(isG()?(hubc&&hubc.open?'':'reconnecting…'):s&&s.aes?short(cur)+' · online':short(cur)+' · offline'):''}
async function openChat(id){
  cur=id;const h=hist(id);h.un=0;save(h);
  $('#peer').textContent=h.g?h.n:disp(h);hdr();lastTs=0;$('#msgs').innerHTML='';
  $('#chat').classList.add('has');$('#app').classList.add('ch');
  list();stat();setAct();
  if(!h.msgs.length)$('#msgs').innerHTML='<div class="empty">'+(h.g?'👥':'🔒')+'</div>';
  for(const m of h.msgs){if(cur!==id)return;await draw(m)}
  if(!h.g)link(id);   // reconnect if this friend is offline in our session
}
$('#back').onclick=()=>{cur=null;$('#app').classList.remove('ch');$('#chat').classList.remove('has');list();stat()};
$('#del').onclick=async()=>{
  const id=cur;if(!id||!(await dlg(own()?'Delete group':isG()?'Leave group':'Delete chat',own()?'Delete this group for everyone?':isG()?'Leave this group?':'Delete this chat?',own()?'Delete':isG()?'Leave':'Delete','Cancel')))return;
  if(isG())hubSend({k:own()?'dg':'lg',id});
  (H[id]?H[id].msgs:[]).forEach(m=>{if(m.b)db('m','readwrite',o=>o.delete(m.b))});
  delete H[id];db('c','readwrite',o=>o.delete(id));drop(id);$('#back').click();
};
async function sendFile(f){
  const id=cur,s=S[id];
  if(!s||!s.c.open||!s.aes)return toast('Offline');
  const k=(f.type||'').split('/')[0];
  if(!['image','video','audio'].includes(k))return toast('Unsupported file');
  if(f.size>50e6)return toast('Max file size is 50 MB');
  toast('Sending…');
  s.c.send(await seal(s.aes,{kind:'file',name:f.name,type:f.type},await f.arrayBuffer()));
  addMsg(id,true,k,f);
}
$('#clip').onclick=()=>$('#file').click();
$('#file').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)sendFile(f)};

/* ---------- composer: send / voice ---------- */
const setAct=()=>{$('#act').innerHTML=ico(rec&&rec.state==='recording'?'stop':$('#msg').value.trim()||isG()?'send':'mic')};
$('#msg').oninput=setAct;
$('#form').onsubmit=e=>{
  e.preventDefault();
  if(rec&&rec.state==='recording')return rec.stop();
  const t=$('#msg').value.trim();
  if(isG()){if(!t)return;if(!hubc||!hubc.open)return toast('World is reconnecting. Try again.');hubSend({k:'gm',id:cur,t});addMsg(cur,true,'text',t);$('#msg').value='';setAct();return}
  if(t){
    const c=S[cur];if(!c||!c.c.open||!c.aes)return toast('Offline. Both people must be online to chat.');
    seal(c.aes,{kind:'text',text:t}).then(m=>c.c.send(m));addMsg(cur,true,'text',t);$('#msg').value='';setAct();
  }else record();
};
async function record(){
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:true});
    const r=rec=new MediaRecorder(s);chunks=[];
    r.ondataavailable=e=>chunks.push(e.data);
    r.onstop=()=>{
      s.getTracks().forEach(t=>t.stop());clearInterval(recT);
      $('#msg').disabled=false;$('#msg').placeholder='Message';$('#act').classList.remove('rec');
      const type=r.mimeType||'audio/webm';
      sendFile(new File(chunks,'voice',{type}));setAct();
    };
    r.start();recAt=Date.now();
    $('#msg').disabled=true;$('#act').classList.add('rec');setAct();
    recT=setInterval(()=>{$('#msg').placeholder='Recording '+fmt(Date.now()-recAt);if(Date.now()-recAt>120000)r.stop()},250);
  }catch(e){dlg('Microphone blocked',why(e),'OK')}
}

/* ---------- theme / settings / help ---------- */
function theme(t){
  if(!['light','dark','black','system'].includes(t))t='system';
  const H=document.documentElement;t==='system'?H.removeAttribute('data-theme'):H.dataset.theme=t;
  document.querySelectorAll('.th[data-t]').forEach(b=>b.classList.toggle('sel',b.dataset.t===t));
  try{localStorage.setItem('idt',t)}catch(e){}
}
document.querySelectorAll('.th[data-t]').forEach(b=>b.onclick=()=>theme(b.dataset.t));
let st='system',seen=null;try{st=localStorage.getItem('idt')||'system';seen=localStorage.getItem('idh')}catch(e){}
theme(st);
const openM=id=>$(id).classList.add('on'),closeM=id=>$(id).classList.remove('on');
$('#set1').onclick=$('#mset').onclick=()=>{$('#menu').hidden=true;openM('#set')};
$('#ctb').onclick=()=>window.open('https://shofiqul5.github.io','_blank','noopener');
$('#so').onclick=async()=>{if(!(await dlg('Remove account','This deletes your account key from this device. Without a backup you cannot get it back.','Remove','Cancel')))return;try{localStorage.removeItem('rc_acct')}catch(e){}location.reload()};
$('#sx').onclick=()=>closeM('#set');
$('#sh').onclick=()=>{closeM('#set');openM('#how')};
$('#hx').onclick=()=>{closeM('#how');try{if($('#hn').checked)localStorage.setItem('idh','1')}catch(e){}};
['#set','#how','#nc','#pr','#ng','#bk','#rs'].forEach(id=>$(id).addEventListener('click',e=>{if(e.target===$(id))closeM(id)}));
if(!seen)openM('#how');

/* ---------- permissions ---------- */
const dlg=(t,d,ok,no)=>new Promise(res=>{
  $('#pt').textContent=t;$('#pd').textContent=d;$('#pok').textContent=ok;$('#pno').textContent=no||'';$('#pno').hidden=!no;
  const f=v=>()=>{closeM('#perm');res(v)};
  $('#pok').onclick=f(true);$('#pno').onclick=f(false);openM('#perm');
});
const why=e=>e&&e.name==='NotFoundError'?'No microphone or camera was found on this device.':e&&e.name==='NotReadableError'?'Another app is using your microphone or camera. Close it and try again.':'Permission is blocked. Tap the lock or site-settings icon next to the address bar, set Camera and Microphone to Allow, then reload and try again.';
async function getMedia(video){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    await dlg('Not supported','Calls need a secure (https) page in a browser like Chrome or Safari. In-app browsers often block the camera and microphone.','OK');return null;
  }
  try{return await media_(video)}catch(e){
    if(video&&['NotFoundError','NotReadableError','OverconstrainedError'].includes(e.name)){
      try{const s=await media_(false);toast('Camera unavailable. Continuing with audio only.');return s}catch(e2){e=e2}
    }
    await dlg('Cannot start call',why(e),'OK');return null;
  }
}

/* ---------- calls ---------- */
let busy=false;
async function media_(video){
  return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:video?{facingMode:'user'}:false});
}
async function startCall(video){
  const id=cur;if(!id||call||busy)return;
  if(!S[id]||!S[id].c.open)return toast('Offline');
  busy=true;const s=await getMedia(video);busy=false;
  if(!s)return;
  if(!S[id]||!S[id].c.open){s.getTracks().forEach(t=>t.stop());return}
  stream=s;video=!!s.getVideoTracks().length;
  attach(peer.call(id,stream,{metadata:{video}}),video);
}
function attach(c,video){
  call=c;muted=false;
  $('#cwho').textContent=disp(H[c.peer]||{id:c.peer});$('#cst').textContent='Calling…';
  $('#lv').srcObject=video?stream:null;
  $('#call').classList.toggle('video',video);$('#cam').hidden=!video;
  $('#mute').classList.remove('off');$('#cam').classList.remove('off');
  $('#call').classList.add('on');
  c.on('stream',r=>{
    $('#rv').srcObject=r;$('#rv').play().catch(()=>{});t0=Date.now();$('#cst').textContent='0:00';
    clearInterval(ct);ct=setInterval(()=>$('#cst').textContent=fmt(Date.now()-t0),1000);
  });
  c.on('close',endCall);c.on('error',()=>{toast('Call failed');endCall()});
}
function endCall(){
  clearInterval(ct);
  const c=call;call=null;if(c)c.close();
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
  $('#rv').srcObject=null;$('#lv').srcObject=null;$('#call').classList.remove('on');
}
$('#ac').onclick=()=>startCall(false);
$('#vc').onclick=()=>startCall(true);
$('#end').onclick=endCall;
$('#yes').onclick=async()=>{
  const c=inc;inc=null;$('#inc').classList.remove('on');if(!c)return;
  const v=!!(c.metadata&&c.metadata.video);
  const s=await getMedia(v);if(!s){c.close();return}stream=s;
  c.answer(stream);attach(c,v);
};
$('#no').onclick=()=>{if(inc)inc.close();inc=null;$('#inc').classList.remove('on')};
const toggle=(kind,btn)=>{
  const t=stream&&(kind==='audio'?stream.getAudioTracks():stream.getVideoTracks())[0];
  if(!t)return;t.enabled=!t.enabled;btn.classList.toggle('off',!t.enabled);
};
$('#mute').onclick=()=>toggle('audio',$('#mute'));
$('#cam').onclick=()=>toggle('video',$('#cam'));
/* ---------- menu, tabs, profile ---------- */
const isG=()=>cur&&H[cur]&&H[cur].g,own=()=>isG()&&H[cur].o===me;
function purge(id){(H[id]?H[id].msgs:[]).forEach(m=>{if(m.b)db('m','readwrite',o=>o.delete(m.b))});delete H[id];db('c','readwrite',o=>o.delete(id));if(cur===id)$('#back').click();else list();if(!$('#pw').hidden)wrender();toast('Group deleted')}
let PR='';try{PR=okAv(localStorage.getItem('rc_av'))}catch(e){}
function myAv(){const n=ACC?ACC.name:'?';setAv($('#mav'),n,PR);setAv($('#pav'),n,PR);$('#pnm').textContent=n+(ACC&&ACC.cert?' ✔':'');$('#pshort').textContent=short(me);if(me&&window.qrcode){const q=qrcode(0,'M');q.addData('rc1:'+me);q.make();$('#qr').src=q.createDataURL(5,2);$('#qr').hidden=false}}
function hdr(){const h=H[cur];if(!h)return;setAv($('#hav'),h.g?h.n:h.nm||cur,h.av);['#ac','#vc','#clip'].forEach(x=>$(x).hidden=!!h.g)}
function sendProf(s){if(s&&s.aes&&s.c.open)seal(s.aes,{kind:'prof',av:PR,n:ACC.name,c:ACC.cert||null}).then(m=>s.c.send(m))}
$('#dots').onclick=e=>{e.stopPropagation();$('#menu').hidden=!$('#menu').hidden};
document.addEventListener('click',()=>$('#menu').hidden=true);
$('#mnew').onclick=()=>openM('#nc');
$('#mpro').onclick=()=>{myAv();openM('#pr')};$('#mav').onclick=$('#mpro').onclick;
const pic=f=>new Promise(res=>{const i=new Image(),u=URL.createObjectURL(f);i.onload=()=>{const c=document.createElement('canvas'),n=128,m=Math.min(i.width,i.height);c.width=c.height=n;c.getContext('2d').drawImage(i,(i.width-m)/2,(i.height-m)/2,m,m,0,0,n,n);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.72))};i.onerror=()=>res('');i.src=u});
const setPR=v=>{PR=v;try{localStorage.setItem('rc_av',v)}catch(e){}myAv();Object.values(S).forEach(sendProf);hubSend({k:'hi',av:PR,n:ACC.name,cert:ACC.cert||null,g:myG()})};
$('#pch').onclick=()=>$('#pf').click();
$('#pf').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(f)setPR(await pic(f))};
$('#prm').onclick=()=>setPR('');
document.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>closeM(b.dataset.x));
document.querySelectorAll('.tb').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tb').forEach(x=>x.classList.toggle('sel',x===b));const w=b.dataset.tab==='w';$('#pc').hidden=w;$('#pw').hidden=!w;if(w){wrender();wsearch()}});
$('#q').oninput=list;

/* ---------- world chat: one online user acts as the hub ---------- */
const HUB='rcworld_hub_v1';let hp=null,hubc=null,HU={},HG={},WR={users:[],groups:[]};
const myG=()=>Object.values(H).filter(h=>h.g).map(h=>({id:h.id,n:h.n,av:h.av||'',o:h.o||''}));
const hubSend=o=>{if(hubc&&hubc.open)hubc.send(o)};
function hostHub(){
  if(!peer||peer.destroyed)return;
  if(hp)return joinHub();
  const p=new Peer(HUB,{config:CFG});
  p.on('open',()=>{hp=p;p.on('connection',hubConn);joinHub()});
  p.on('disconnected',()=>{if(!p.destroyed)p.reconnect()});
  p.on('error',()=>{if(hp===p)return;p.destroy();joinHub()});
}
function joinHub(){
  if(!peer||peer.destroyed||(hubc&&hubc.open))return;
  const c=hubc=peer.connect(HUB,{reliable:true});
  c.on('open',()=>stat());
  c.on('data',hubData);
  const re=()=>{if(hubc===c){hubc=null;stat();if(!$('#pw').hidden)wrender();setTimeout(hostHub,500+Math.random()*2500)}};
  c.on('close',re);c.on('error',re);
  setTimeout(()=>{if(hubc===c&&!c.open){c.close();re()}},6000);
}
function hubData(d){
  if(!d)return;
  if(d.k==='ch')sign('hub|'+d.n+'|'+me).then(sig=>{hubSend({k:'hi',av:PR,n:ACC.name,cert:ACC.cert||null,g:myG(),sp:ACC.pub,sig});wsearch()});
  else if(d.k==='r'){const w={users:d.users||[],groups:d.groups||[],mu:d.mu,mg:d.mg};Promise.all(w.users.map(async u=>{u.v=await vcert(u.u,u.cert)})).then(()=>{WR=w;if(!$('#pw').hidden)wrender()})}
  else if(d.k==='gd'&&H[d.id]&&H[d.id].g)purge(d.id);
  else if(d.k==='gm'&&H[d.id]&&H[d.id].g)vcert(d.u,d.c).then(v=>addMsg(d.id,false,'text',String(d.t),String(d.n||'User')+(v?' ✔':'')));
}
// hub side (runs only in the browser that owns the hub id)
function hubConn(c){
  const u=c.peer,gj=g=>{if(!g||!/^g_\w{4,16}$/.test(g.id))return;const x=HG[g.id]||(HG[g.id]={n:String(g.n||'Group').slice(0,30),av:okAv(g.av),m:new Set(),o:''});if(!x.o&&g.o===u)x.o=u;x.m.add(u)};
  let ok=false;const nc=crypto.randomUUID(),chl=()=>c.send({k:'ch',n:nc});c.open?chl():c.on('open',chl);
  c.on('data',async d=>{
    if(!d||typeof d!=='object')return;
    if(d.k==='hi'){if(!ok){if(!(await vsig(d.sp,d.sig,'hub|'+nc+'|'+u,u)))return c.close();ok=true}HU[u]={c,av:okAv(d.av),n:cleanName(d.n,u),cert:Array.isArray(d.cert)&&d.cert.length===64?d.cert:null};(d.g||[]).slice(0,50).forEach(gj)}
    else if(!ok)return;
    else if(d.k==='q'){
      const q=String(d.q||'').toLowerCase().slice(0,30),L=q?30:10,UU=Object.keys(HU).filter(x=>x!==u&&(HU[x].n+x).toLowerCase().includes(q)),GG=Object.entries(HG).filter(([i,g])=>g.n.toLowerCase().includes(q));
      c.send({k:'r',
        users:UU.slice(0,L).map(x=>({u:x,n:HU[x].n,av:HU[x].av,cert:HU[x].cert})),mu:UU.length>L,mg:GG.length>L,
        groups:GG.slice(0,L).map(([i,g])=>({id:i,n:g.n,av:g.av,o:g.o,c:g.m.size}))});
    }
    else if(d.k==='cg')gj({id:d.id,n:d.n,av:d.av,o:u});
    else if(d.k==='jg'){const g=HG[d.id];if(g)g.m.add(u)}
    else if(d.k==='dg'){const g=HG[d.id];if(g&&g.o===u){g.m.forEach(x=>{if(x!==u&&HU[x]&&HU[x].c.open)HU[x].c.send({k:'gd',id:d.id})});delete HG[d.id]}}
    else if(d.k==='lg'){const g=HG[d.id];if(g){g.m.delete(u);if(!g.m.size)delete HG[d.id]}}
    else if(d.k==='gm'){const g=HG[d.id];if(g&&g.m.has(u)){const o={k:'gm',id:d.id,u,n:HU[u].n,c:HU[u].cert,t:String(d.t).slice(0,2000)};g.m.forEach(x=>{if(x!==u&&HU[x]&&HU[x].c.open)HU[x].c.send(o)})}}
  });
  c.on('close',()=>{if(HU[u]&&HU[u].c===c){delete HU[u];for(const i in HG){HG[i].m.delete(u);if(!HG[i].m.size)delete HG[i]}}});
}
let wt;const wsearch=()=>hubSend({k:'q',q:$('#wq').value.trim()});
$('#wq').oninput=()=>{clearTimeout(wt);wrender();wt=setTimeout(wsearch,250)};
function wrender(){
  const L=$('#wl'),q=$('#wq').value.trim().toLowerCase();L.innerHTML='';
  if(!hubc||!hubc.open){L.innerHTML='<div class="empty2">Connecting…</div>';return}
  const sec=t=>{const d=document.createElement('div');d.className='sec s2';d.textContent=t;L.appendChild(d)};
  const row=(n,av,sub,fn)=>{const d=document.createElement('button');d.className='it';d.innerHTML='<i class="av"></i><span class="tx"><b></b><small></small></span>';setAv(d.querySelector('.av'),n,av);d.querySelector('b').textContent=n;d.querySelector('small').textContent=sub;d.onclick=fn;L.appendChild(d)};
  const mine=Object.values(H).filter(h=>h.g&&h.n.toLowerCase().includes(q));
  if(mine.length){sec('Joined');mine.forEach(h=>row(h.n,h.av,h.un?h.un+' new':'',()=>openChat(h.id)))}
  const gs=WR.groups.filter(g=>!H[g.id]);
  if(gs.length){sec('Groups');gs.forEach(g=>row(g.n,okAv(g.av),g.c+' online',()=>{H[g.id]={id:g.id,g:1,n:g.n,av:okAv(g.av),o:g.o||'',msgs:[],ts:Date.now(),un:0};save(H[g.id]);hubSend({k:'jg',id:g.id});openChat(g.id)}))}
  if(WR.users.length){sec('People');WR.users.forEach(u=>row(u.n+(u.v?' ✔':''),okAv(u.av),short(u.u),()=>{toast('Connecting…');connect(u.u)}))}
  if(!q&&(WR.mu||WR.mg)){const d=document.createElement('div');d.className='empty2';d.textContent='Search to find more';L.appendChild(d)}
  if(!L.children.length)L.innerHTML='<div class="empty2">No results</div>';
}
$('#gnew').onclick=()=>{GP='';$('#gn').value='';setAv($('#gav'),'+','');openM('#ng')};
let GP='';
$('#gav').onclick=()=>$('#gf').click();
$('#gf').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(f){GP=await pic(f);setAv($('#gav'),'+',GP)}};
$('#gok').onclick=()=>{const n=$('#gn').value.trim();if(!n)return toast('Enter a group name');const id='g_'+Math.random().toString(36).slice(2,10).padEnd(6,'x');H[id]={id,g:1,n,av:GP,o:me,msgs:[],ts:Date.now(),un:0};save(H[id]);hubSend({k:'cg',id,n,av:GP});closeM('#ng');openChat(id)};
/* ---------- account: key pair, backup, QR ---------- */
const MASTER={"kty": "EC", "crv": "P-256", "x": "P7qLBd-ZdiK7hcGh8R_LdPFys1bjb4Kg5kHdTQsvGY4", "y": "puCUrLUiZcEWU_zFmBmXYRZ9FN-0NBncFa7uDyapO0U"},MENC={"s": "NAB6g34u/IVPl9NJApNOjw==", "i": "ch3crBWfe4w6PhPI", "c": "vmE3hqRgeVOkzwv2jPz3req9fQHG7hTI8+sa0lueeApkNDJvbIyHWYAGzv7H+aumnXARqSk3dIuaf51lSgZovG8b5TWL30SZfEXWIU3jeX6LmThRJKtgjjRcN3h/ECFhvSsYPkJky30sVcnauf0nEWNU2wB4w/R6iYhrjpbPvi2utNTWeVntnddqsrRmlMWUAuVpzybgXf9TV621BUk/HW6TQyzTXj/ZINiW14vEw6TJ/TsWHu5lNSjbvCQ64NiY2Q5bnITg27zsCE31TzBtxFEgWTyxKb0xNZP6uF5L"},VOK=new Set();
let ACC=null;try{ACC=JSON.parse(localStorage.getItem('rc_acct'))}catch(e){}
const B32='abcdefghijklmnopqrstuvwxyz234567',enc=new TextEncoder();
const short=i=>(i||'').slice(0,4).toUpperCase()+'-'+(i||'').slice(4,8).toUpperCase();
const cleanName=(n,id)=>{n=String(n||'').trim().slice(0,24);return n||'User '+short(id)};
const disp=h=>((h&&h.nm)||'User '+short(h&&h.id))+(h&&(h.vf||VOK.has(h.id))?' ✔':'');
async function aid(p){const d=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(p.x+'.'+p.y)));let o='',v=0,n=0;for(const b of d){v=(v<<8)|b;n+=8;while(n>=5){o+=B32[(v>>>(n-5))&31];n-=5}}return o}
let SK;async function sign(t){SK=SK||await crypto.subtle.importKey('jwk',ACC.priv,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);return[...new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},SK,enc.encode(t)))]}
async function vsig(sp,sig,t,id){try{if(!sp||typeof sp.x!=='string'||typeof sp.y!=='string'||!sig||await aid(sp)!==id)return false;const k=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',x:sp.x,y:sp.y},{name:'ECDSA',namedCurve:'P-256'},false,['verify']);return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},k,new Uint8Array(sig),enc.encode(t))}catch(e){return false}}
let MK;async function vcert(id,sig){try{if(VOK.has(id))return true;if(!Array.isArray(sig)||sig.length!==64)return false;MK=MK||await crypto.subtle.importKey('jwk',MASTER,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);const ok=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},MK,new Uint8Array(sig),enc.encode('verified|'+id));if(ok)VOK.add(id);return ok}catch(e){return false}}
async function claim(t,id){try{const k=await pk(t,ub(MENC.s)),pv=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(MENC.i)},k,ub(MENC.c)))),key=await crypto.subtle.importKey('jwk',pv,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);return[...new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,enc.encode('verified|'+id)))]}catch(e){return null}}
async function create(){
  let n=$('#name').value.trim(),cert=null;
  if(n.length<2)return toast('Name must be 2–24 characters');
  $('#go').disabled=true;
  const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  const pub=await crypto.subtle.exportKey('jwk',kp.publicKey),priv=await crypto.subtle.exportKey('jwk',kp.privateKey),p={kty:pub.kty,crv:pub.crv,x:pub.x,y:pub.y},id=await aid(p);
  if(n.length>24){cert=await claim(n,id);if(!cert){$('#go').disabled=false;return toast('Name must be 2–24 characters')}n='Shofiqul'}
  const a={name:n,id,pub:p,priv,cert};
  try{localStorage.setItem('rc_acct',JSON.stringify(a))}catch(e){}
  start(a);
}
const b64=a=>btoa([...new Uint8Array(a)].map(x=>String.fromCharCode(x)).join('')),ub=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
async function pk(pw,salt){const m=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
$('#pbk').onclick=()=>{$('#bkp').value='';openM('#bk')};
$('#bkd').onclick=async()=>{
  const pw=$('#bkp').value;if(pw.length<8)return toast('Use at least 8 characters');
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const body=enc.encode(JSON.stringify({a:ACC,av:PR,chats:Object.values(H).map(h=>({...h,msgs:h.msgs.filter(m=>m.k==='text')}))}));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},await pk(pw,salt),body);
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({rc:1,s:b64(salt),i:b64(iv),c:b64(ct)})],{type:'application/json'}));a.download='random-communicate-'+short(me)+'.rcbak';a.click();
  closeM('#bk');toast('Backup saved');
};
$('#rsb').onclick=()=>openM('#rs');
$('#rsok').onclick=async()=>{
  const f=$('#rsf').files[0],pw=$('#rsp').value;if(!f||!pw)return toast('Choose the file and enter the password');
  try{
    const j=JSON.parse(await f.text()),o=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(j.i)},await pk(pw,ub(j.s)),ub(j.c))));
    if(!o.a||await aid(o.a.pub)!==o.a.id)throw 0;
    openDB(o.a.id);for(const h of o.chats||[])await save(h);
    PR=okAv(o.av);try{localStorage.setItem('rc_acct',JSON.stringify(o.a));localStorage.setItem('rc_av',PR)}catch(e){}
    closeM('#rs');start(o.a);
  }catch(e){toast('Wrong password, or the file was changed')}
};
$('#pcp').onclick=()=>navigator.clipboard.writeText(me).then(()=>toast('ID copied'),()=>{});
let scS=null;
const stopSc=()=>{if(scS){scS.getTracks().forEach(t=>t.stop());scS=null}closeM('#sc');closeM('#nc')};
$('#scx').onclick=stopSc;
$('#scb').onclick=async()=>{
  if(!window.jsQR||!navigator.mediaDevices)return toast('Scanner not available here');
  try{scS=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})}catch(e){return dlg('Camera blocked',why(e),'OK')}
  const v=$('#scv');v.srcObject=scS;openM('#sc');await v.play().catch(()=>{});
  const c=document.createElement('canvas'),x=c.getContext('2d',{willReadFrequently:true});
  const tick=()=>{if(!scS)return;if(v.videoWidth){c.width=v.videoWidth;c.height=v.videoHeight;x.drawImage(v,0,0);const r=jsQR(x.getImageData(0,0,c.width,c.height).data,c.width,c.height);if(r&&r.data.startsWith('rc1:')){stopSc();connect(r.data);return}}requestAnimationFrame(tick)};
  tick();
};
let dip=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#inst').hidden=false});
addEventListener('appinstalled',()=>{$('#inst').hidden=true});
$('#inst').onclick=async()=>{if(!dip)return;dip.prompt();await dip.userChoice;dip=null;$('#inst').hidden=true;closeM('#set')};
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
if(ACC&&ACC.id)start(ACC);   // saved username: sign in automatically