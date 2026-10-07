const $ = s => document.querySelector(s);
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const NONE = new Uint8Array(0);
let vault = [];
let key = null;
let salt = null;
let wk = null;
let det = null;
const E = new Map();
const h = (t, p = {}, ...k) => {
  const e = Object.assign(document.createElement(t), p);
  e.append(...k);
  return e;
};

function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('on'), 2800);
}

const b32d = s => {
  let b = 0;
  let v = 0;
  let o = [];
  for (const c of s.toUpperCase().replace(/[^A-Z2-7]/g, '')) {
    v = (v << 5 | B32.indexOf(c)) & 0xfffff;
    b += 5;
    if (b >= 8) {
      o.push(v >>> (b - 8) & 255);
      b -= 8;
    }
  }
  return new Uint8Array(o);
};

const b32e = u => {
  let b = 0;
  let v = 0;
  let o = '';
  for (const x of u) {
    v = (v << 8 | x) & 0xfffff;
    b += 8;
    while (b >= 5) {
      o += B32[v >>> (b - 5) & 31];
      b -= 5;
    }
  }
  if (b) {
    o += B32[v << (5 - b) & 31];
  }
  return o;
};

const b64 = u => btoa(String.fromCharCode(...u));
const ub64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const normAlgo = a => {
  a = String(a || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return ['SHA256', 'SHA512'].includes(a) ? a : 'SHA1';
};

// ─── TOTP ────────────────────────────────────────────────────────
async function totp(a, t) {
  const m = new Uint8Array(8);
  new DataView(m.buffer).setUint32(4, Math.floor(t / 1000 / a.period));
  const k = await crypto.subtle.importKey(
    'raw',
    b32d(a.secret),
    { name: 'HMAC', hash: 'SHA-' + a.algo.slice(3) },
    false,
    ['sign']
  );
  const s = new Uint8Array(await crypto.subtle.sign('HMAC', k, m));
  const o = s[s.length - 1] & 15;
  const bin = (s[o] & 127) << 24 | s[o + 1] << 16 | s[o + 2] << 8 | s[o + 3];
  return String(bin % 10 ** a.digits).padStart(a.digits, '0');
}

// ─── Optional encryption: AES-256-GCM, key from PBKDF2-SHA256 ────
const SL = 16;
const IL = 12;
const enc = new TextEncoder();
const dc = new TextDecoder('utf-8', { fatal: true });
async function dk(p, s, it = 300000) {
  const m = await crypto.subtle.importKey(
    'raw',
    enc.encode(p.normalize('NFC')),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: s, iterations: it, hash: 'SHA-256' },
    m,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function save() {
  let v;
  if (key) {
    const iv = crypto.getRandomValues(new Uint8Array(IL));
    const plain = enc.encode(JSON.stringify(vault));
    const d = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
    v = { s: b64(salt), i: b64(iv), d: b64(d) };
  }
  else {
    v = { p: vault };
  }
  localStorage.v = JSON.stringify(v);
}

async function dec(o, p) {
  const s = ub64(o.s);
  const k = await dk(p, s);
  const t = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub64(o.i) }, k, ub64(o.d));
  return { k, s, t: dc.decode(t) };
}

async function setKey(p) {
  salt = crypto.getRandomValues(new Uint8Array(SL));
  key = await dk(p, salt);
  wk = await dk(p, salt, 200000);
}

async function encText(t) {
  const iv = crypto.getRandomValues(new Uint8Array(IL));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wk, enc.encode(t)));
  const o = new Uint8Array(1 + SL + IL + ct.length);
  o[0] = 1;
  o.set(salt, 1);
  o.set(iv, 1 + SL);
  o.set(ct, 1 + SL + IL);
  return b64(o);
}

async function unlock() {
  if (!key) {
    return true;
  }
  const p = await ask('Encryption key');
  if (p === null) {
    return false;
  }
  try {
    await dec(JSON.parse(localStorage.v), p);
    return true;
  }
  catch {
    toast('Wrong key');
    return false;
  }
}

async function pickKey() {
  for (;;) {
    const p = await ask('Encryption key');
    if (!p) {
      return null;
    }
    const q = await ask('Repeat the key');
    if (q === null) {
      return null;
    }
    if (q === p) {
      return p;
    }
    toast('Keys do not match');
  }
}

function ask(msg, type = 'password') {
  return new Promise(r => {
    const d = $('#ask');
    const i = $('#aski');
    $('#askm').textContent = msg;
    i.type = type;
    i.value = '';
    $('#asko').onclick = () => d.close('ok');
    $('#askc').onclick = () => d.close('no');
    d.onclose = () => r(d.returnValue == 'ok' ? i.value : null);
    d.showModal();
  });
}

// ─── Parsing ─────────────────────────────────────────────────────
function pb(u) {
  let i = 0;
  let o = [];
  const rv = () => {
    let r = 0;
    let s = 0;
    let x;
    do {
      x = u[i++];
      r += (x & 127) * 2 ** s;
      s += 7;
    } while (x & 128);
    return r;
  };
  while (i < u.length) {
    const t = rv();
    const f = t >> 3;
    const w = t & 7;
    if (w == 0) {
      o.push([f, rv()]);
    }
    else if (w == 2) {
      const l = rv();
      o.push([f, u.subarray(i, i + l)]);
      i += l;
    }
    else if (w == 1) {
      i += 8;
    }
    else if (w == 5) {
      i += 4;
    }
    else {
      break;
    }
  }
  return o;
}

function fromUri(u, add) {
  const m = u.match(/^otpauth:\/\/(\w+)\/([^?]*)\?(.*)$/i);
  if (!m || m[1].toLowerCase() != 'totp') {
    return;
  }
  const q = new URLSearchParams(m[3]);
  let l = decodeURIComponent(m[2]);
  let is = q.get('issuer') || '';
  if (l.includes(':')) {
    const x = l.indexOf(':');
    if (!is) {
      is = l.slice(0, x).trim();
    }
    l = l.slice(x + 1).trim();
  }
  add({
    secret: q.get('secret'),
    name: l,
    issuer: is,
    digits: q.get('digits'),
    period: q.get('period'),
    algo: q.get('algorithm')
  });
}

function fromMig(u, add) {
  const td = new TextDecoder();
  const raw = decodeURIComponent((u.split('data=')[1] || '').split('&')[0])
    .replace(/ /g, '+')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  for (const [, m] of pb(ub64(raw)).filter(x => x[0] == 1)) {
    const p = pb(m);
    const g = n => (p.find(x => x[0] == n) || [])[1];
    if (g(6) == 1) {
      continue;
    }
    let name = td.decode(g(2) || NONE);
    let is = td.decode(g(3) || NONE);
    if (!is && name.includes(':')) {
      const x = name.indexOf(':');
      is = name.slice(0, x);
      name = name.slice(x + 1);
    }
    add({
      secret: b32e(g(1) || NONE),
      name,
      issuer: is,
      digits: g(5) == 2 ? 8 : 6,
      algo: { 2: 'SHA256', 3: 'SHA512' }[g(4)]
    });
  }
}

async function ingest(t) {
  t = t.trim();
  let n = 0;
  const add = a => {
    const s = String(a.secret || '').replace(/[\s=-]/g, '').toUpperCase();
    if (!/^[A-Z2-7]+$/.test(s)) {
      return;
    }
    a = {
      id: crypto.randomUUID(),
      name: a.name || '',
      issuer: a.issuer || '',
      secret: s,
      digits: +a.digits || 6,
      period: +a.period || 30,
      algo: normAlgo(a.algo)
    };
    if (!vault.some(x => x.secret == a.secret && x.name == a.name && x.issuer == a.issuer)) {
      vault.push(a);
      n++;
    }
  };
  let j = null;
  try {
    j = JSON.parse(t);
  }
  catch {
  }
  if (j && j.s && j.i && j.d) {
    const p = await ask('Backup key');
    if (p === null) {
      return 0;
    }
    try {
      j = JSON.parse((await dec(j, p)).t);
    }
    catch {
      toast('Wrong key');
      return 0;
    }
  }
  try {
    (t.match(/otpauth-migration:\/\/[^\s"'\\]+/g) || []).forEach(u => fromMig(u, add));
    (t.match(/otpauth:\/\/[^\s"'\\]+/g) || []).forEach(u => fromUri(u, add));
    const w = o => {
      if (!o || typeof o != 'object') {
        return;
      }
      if (typeof o.secret == 'string' || typeof (o.info || {}).secret == 'string') {
        const i = { ...o, ...o.info, ...o.otp };
        if (String(i.type || '').toLowerCase() == 'hotp') {
          return;
        }
        add({
          secret: i.secret,
          name: i.account || i.label || o.name,
          issuer: i.issuer,
          digits: i.digits,
          period: i.period,
          algo: i.algo || i.algorithm
        });
      }
      else {
        Object.values(o).forEach(w);
      }
    };
    if (j) {
      w(j);
    }
  }
  catch (e) {
    toast('Could not read data: ' + e.message);
  }
  if (n) {
    await save();
    render();
  }
  toast(n ? n + ' account(s) added' : 'No new accounts found');
  return n;
}

// ─── QR ──────────────────────────────────────────────────────────
async function readQR(s) {
  if ('BarcodeDetector' in window) {
    det = det || new BarcodeDetector({ formats: ['qr_code'] });
    return (await det.detect(s)).map(x => x.rawValue);
  }
  if (window.jsQR) {
    const w = s.videoWidth || s.width;
    const H = s.videoHeight || s.height;
    const c = h('canvas', { width: w, height: H });
    const x = c.getContext('2d');
    x.drawImage(s, 0, 0);
    const r = jsQR(x.getImageData(0, 0, w, H).data, w, H);
    return r ? [r.data] : [];
  }
  throw Error('noqr');
}

async function scan() {
  const d = $('#cam');
  const v = $('#vid');
  let st;
  try {
    st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  }
  catch {
    return toast('Could not start the camera (needs HTTPS and permission)');
  }
  v.srcObject = st;
  await v.play();
  let on = true;
  const seen = new Set();
  d.onclose = () => {
    on = false;
    st.getTracks().forEach(t => t.stop());
  };
  d.showModal();
  while (on) {
    try {
      for (const c of await readQR(v))
        if (!seen.has(c)) {
          seen.add(c);
          await ingest(c);
        }
    }
    catch (e) {
      if (e.message == 'noqr') {
        d.close();
        return toast('QR scanning is not supported here. Use Chrome or add jsQR.js');
      }
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

// ─── UI ──────────────────────────────────────────────────────────
const R = 2 * Math.PI * 14;
const SV = 'http://www.w3.org/2000/svg';
const DOTS = '<svg viewBox="0 0 24 24">'
  + '<circle cx="12" cy="5" r="2"/>'
  + '<circle cx="12" cy="12" r="2"/>'
  + '<circle cx="12" cy="19" r="2"/>'
  + '</svg>';

function render() {
  const l = $('#list');
  l.textContent = '';
  E.clear();
  const q = $('#q').value.trim().toLowerCase();
  const L = vault.filter(a => {
    const hay = (a.issuer + ' ' + a.name + ' ' + a.secret).toLowerCase();
    return !q || hay.includes(q);
  });
  $('#srw').hidden = !vault.length;
  $('#qx').hidden = !q;
  if (!L.length) {
    l.append(h('p', { className: 'empty' }, vault.length ? 'No match' : 'No accounts'));
    return;
  }
  const box = h('div', { className: 'grid' });
  l.append(box);
  for (const a of L) {
    const code = h('div', { className: 'code' }, '······');
    const mk = c => {
      const e = document.createElementNS(SV, 'circle');
      e.setAttribute('class', c);
      e.setAttribute('cx', 17);
      e.setAttribute('cy', 17);
      e.setAttribute('r', 14);
      return e;
    };
    const v = mk('v');
    const ring = document.createElementNS(SV, 'svg');
    const e = { code, v, st: -1, c: '' };
    v.style.strokeDasharray = R;
    ring.setAttribute('class', 'ring');
    ring.setAttribute('viewBox', '0 0 34 34');
    ring.append(mk('t'), v);
    E.set(a.id, e);
    const nm = a.issuer || a.name || '?';
    const title = a.issuer || a.name || '(unnamed)';
    const subtitle = a.issuer ? a.name : '';
    const editBtn = h('button', {
      className: 'more',
      'aria-label': 'Edit',
      title: 'Edit',
      innerHTML: DOTS,
      onclick: ev => {
        ev.stopPropagation();
        edit(a);
      }
    });
    const head = h('div', { className: 'hd' },
      h('div', { className: 'av' }, nm[0].toUpperCase()),
      h('div', { className: 'meta' }, h('b', {}, title), h('small', {}, subtitle)),
      editBtn
    );
    const codeRow = h('div', { className: 'cr' }, code, ring);
    box.append(h('div', { className: 'card', onclick: () => copy(e.c) }, head, codeRow));
  }
  tick();
}

async function tick() {
  const t = Date.now();
  for (const a of vault) {
    const e = E.get(a.id);
    if (!e) {
      continue;
    }
    const st = Math.floor(t / 1000 / a.period);
    if (e.st !== st) {
      e.st = st;
      try {
        e.c = await totp(a, t);
      }
      catch {
        e.c = '';
      }
      const k = Math.ceil(e.c.length / 2);
      e.code.textContent = e.c ? e.c.slice(0, k) + ' ' + e.c.slice(k) : 'Invalid';
    }
    const f = 1 - (t / 1000 % a.period) / a.period;
    e.v.style.strokeDashoffset = R * (1 - f);
    e.v.classList.toggle('lo', f * a.period < 5);
    e.code.classList.toggle('lo', f * a.period < 5);
  }
}

async function copy(c, m) {
  if (!c) {
    return;
  }
  try {
    await navigator.clipboard.writeText(c);
  }
  catch {
    const x = h('textarea', { value: c });
    document.body.append(x);
    x.select();
    document.execCommand('copy');
    x.remove();
  }
  toast(m || 'Code copied');
}

let cur = null;
async function edit(a) {
  cur = a;
  const n = !a;
  a = a || {
    issuer: '', name: '', secret: '', digits: 6, period: 30, algo: 'SHA1'
  };
  $('#fi').value = a.issuer;
  $('#fn').value = a.name;
  $('#fd').value = a.digits;
  $('#fp').value = a.period;
  $('#fa').value = a.algo;
  $('#fdel').hidden = n;
  $('#fx').hidden = n;
  $('#fv').checked = false;
  eyeSync();
  const f = $('#fs');
  const enc_ = !!key && !n;
  f.readOnly = !n;
  f.placeholder = '';
  f.type = enc_ ? 'text' : 'password';
  f.value = enc_ ? '…' : a.secret;
  $('#ed').showModal();
  if (enc_) {
    f.value = await encText(a.secret);
  }
}

const fvChange = async (e) => {
  const f = $('#fs');
  const on = e.target.checked;
  if (!key || !cur || !f.readOnly) {
    f.type = on ? 'text' : 'password';
    return;
  }
  if (on) {
    if (!await unlock()) {
      e.target.checked = false;
      return;
    }
    f.value = cur.secret;
  }
  else {
    f.value = await encText(cur.secret);
  }
};

$('#fv').onchange = async (e) => {
  try {
    await fvChange(e);
  }
  finally {
    eyeSync();
  }
};

const EYE = '<svg viewBox="0 0 24 24">'
  + '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/>'
  + '<circle cx="12" cy="12" r="3"/>'
  + '</svg>';
const EYEX = '<svg viewBox="0 0 24 24">'
  + '<path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.5A17 17 0 0 0 2 12s3.6 7 10 7a9.700 9.700 0 0 0 4.200-.9"/>'
  + '<path d="M9.900 9.900a3 3 0 0 0 4.200 4.200"/>'
  + '<path d="M3 3l18 18"/>'
  + '</svg>';
function eyeSync() {
  const on = $('#fv').checked;
  const b = $('#feye');
  b.innerHTML = on ? EYEX : EYE;
  b.classList.toggle('on', on);
  const t = on ? 'Hide key' : 'Show key';
  b.title = t;
  b.setAttribute('aria-label', t);
}

$('#feye').onclick = () => {
  const c = $('#fv');
  c.checked = !c.checked;
  c.dispatchEvent(new Event('change'));
};

eyeSync();
$('#fcp').onclick = () => copy($('#fs').value, 'Key copied');
$('#fchg').onclick = async () => {
  const f = $('#fs');
  if (!await unlock()) {
    return;
  }
  f.readOnly = false;
  f.value = cur.secret;
  f.type = 'text';
  $('#fv').checked = true;
  eyeSync();
  f.focus();
  f.select();
};

$('#fsave').onclick = async () => {
  const o = {
    issuer: $('#fi').value.trim(),
    name: $('#fn').value.trim(),
    digits: +$('#fd').value,
    period: Math.min(300, Math.max(5, +$('#fp').value || 30)),
    algo: $('#fa').value
  };
  if (!cur || !$('#fs').readOnly) {
    const s = $('#fs').value.replace(/[\s=-]/g, '').toUpperCase();
    if (!/^[A-Z2-7]+$/.test(s)) {
      return toast('Invalid key');
    }
    o.secret = s;
  }
  if (cur) {
    Object.assign(cur, o);
  }
  else {
    vault.push({ id: crypto.randomUUID(), ...o });
  }
  await save();
  render();
  $('#ed').close();
  $('#add').close();
};

$('#fdel').onclick = async () => {
  if (!confirm('Delete this account?')) {
    return;
  }
  vault = vault.filter(x => x !== cur);
  await save();
  render();
  $('#ed').close();
};

$('#badd').onclick = () => $('#add').showModal();
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => {
  if (e.target === d) {
    d.close();
  }
}));

$('#bman').onclick = () => edit(null);
$('#bcam').onclick = () => {
  $('#add').close();
  scan();
};

$('#ccam').onclick = () => $('#cam').close();
$('#bimg').onclick = () => $('#fimg').click();
$('#bfile').onclick = () => $('#ffile').click();
$('#bpaste').onclick = async () => {
  $('#add').close();
  const t = await ask('Paste link or exported text', 'text');
  if (t) {
    ingest(t);
  }
};

$('#fimg').onchange = async (e) => {
  let n = 0;
  for (const f of e.target.files) {
    try {
      const b = await createImageBitmap(f);
      const r = await readQR(b);
      for (const c of r) {
        n += await ingest(c);
      }
      if (!r.length) {
        toast('No QR code found in "' + f.name + '"');
      }
    }
    catch (x) {
      toast(x.message == 'noqr' ? 'QR scanning is not supported here' : 'Could not read the image');
    }
  }
  e.target.value = '';
  if (n) {
    $('#add').close();
  }
};

$('#ffile').onchange = async (e) => {
  let n = 0;
  for (const f of e.target.files) {
    n += await ingest(await f.text());
  }
  e.target.value = '';
  if (n) {
    $('#add').close();
  }
};

function theme(t) {
  if (t) {
    document.documentElement.dataset.theme = t;
  }
  else {
    delete document.documentElement.dataset.theme;
  }
  document.querySelectorAll('#seg button').forEach(b => b.classList.toggle('on', b.dataset.t == (t || '')));
}

$('#seg').onclick = e => {
  const b = e.target.closest('button');
  if (!b) {
    return;
  }
  localStorage.th = b.dataset.t;
  theme(b.dataset.t);
};

$('#shelp').onclick = () => {
  $('#set').close();
  $('#help').showModal();
};

theme(localStorage.th || '');
$('#q').oninput = render;
$('#q').onfocus = () => $('#tb').classList.add('sx');
$('#q').onblur = () => $('#tb').classList.remove('sx');
$('#qx').onmousedown = e => e.preventDefault();
document.querySelectorAll('.x').forEach(b => b.onclick = () => b.closest('dialog').close());
$('#qx').onclick = () => {
  $('#q').value = '';
  render();
  $('#q').focus();
};

$('#bset').onclick = () => {
  $('#senc').checked = !!key;
  $('#spass').hidden = !key;
  $('#set').showModal();
};

$('#senc').onchange = async (e) => {
  if (e.target.checked) {
    $('#set').close();
    const p = await pickKey();
    if (p === null) {
      return;
    }
    await setKey(p);
    await save();
    toast('Encryption on');
  }
  else {
    if (!confirm('Turn off encryption?')) {
      e.target.checked = true;
      return;
    }
    key = null;
    salt = null;
    wk = null;
    await save();
    $('#set').close();
    toast('Encryption off');
  }
};

$('#spass').onclick = async () => {
  $('#set').close();
  const p = await pickKey();
  if (p === null) {
    return;
  }
  await setKey(p);
  await save();
  toast('Key changed');
};

$('#sbak').onclick = async () => {
  $('#set').close();
  await save();
  const blob = new Blob([localStorage.v], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'authenticator-backup.json' });
  document.body.append(a);
  a.click();
  a.remove();
  toast('Backup saved');
};

// ─── Start ───────────────────────────────────────────────────────
(async () => {
  if (!crypto.subtle) {
    toast('Codes need HTTPS or localhost');
  }
  const raw = localStorage.v;
  if (raw) {
    let o = {};
    try {
      o = JSON.parse(raw);
    }
    catch {
      localStorage.v_old = raw;
    }
    if (o.p) {
      vault = o.p;
    }
    else if (o.s) {
      let r;
      let pw;
      while (!r) {
        const p = await ask('Encryption key');
        if (p === null) {
          continue;
        }
        try {
          r = await dec(o, p);
          pw = p;
        }
        catch {
          toast('Wrong key');
        }
      }
      key = r.k;
      salt = r.s;
      wk = await dk(pw, salt, 200000);
      vault = JSON.parse(r.t);
    }
  }
  render();
  setInterval(tick, 500);
})();

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {
  }));
}
