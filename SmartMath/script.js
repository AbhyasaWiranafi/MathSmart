const $=id=>document.getElementById(id);
let level='sd',R={s:10,g:10},gData={g:[],s:[]};
const rd=v=>Math.round(v*1e9)/1e9, mn=s=>String(s).replace(/-/g,'−');
function fmt(v){v=rd(v);if(Number.isInteger(v))return mn(v);for(let d=2;d<=100;d++){const n=v*d;if(Math.abs(n-Math.round(n))<1e-7)return mn(Math.round(n)+'/'+d)}return mn(String(Math.round(v*1e4)/1e4).replace('.',','))}
function dec(v){return mn(String(Math.round(v*1000)/1000).replace('.',','))}
function full(v){return fmt(v)+(fmt(v).includes('/')?' ≈ '+dec(v):'')}
function num(s){s=String(s).trim().replace(',','.');if(s.includes('/')){const[a,b]=s.split('/');return parseFloat(a)/parseFloat(b)}return parseFloat(s)}
const err=m=>`<div class="err">⚠️ ${m}</div>`;
const list=a=>'<ol class="steps">'+a.map(x=>`<li>${x}</li>`).join('')+'</ol>';

/* ---------- Contoh per jenjang ---------- */
const EX={c:{sd:['12 + 8 × 3','(20 - 5) ÷ 3','7 × 6 - 15'],smp:['(15 - 3) ÷ 4 + 2^3','3 × (4 + 5)^2','100 - 2^4 × 5']},
a:{sd:['x + 5 = 12','3x = 18','2x + 4 = 10'],smp:['3x - 4 = 2x + 9','2(x+3) = 5x - 6','(x-1)/2 = 4']},
s:{sd:[[1,1,10,1,-1,2],[1,1,7,1,-1,1]],smp:[[2,3,12,1,-1,1],[3,2,16,1,-2,-4]]},
g:{sd:['2x+1','x+3'],smp:['x^2-4','-2x+5']}};
function chips(id,arr,fn){$(id).innerHTML='';arr.forEach(v=>{const b=document.createElement('button');b.className='chip';b.textContent=Array.isArray(v)?`${v[0]}x+${v[1]}y=${v[2]} ; ${v[3]}x+${v[4]}y=${v[5]}`.replace(/\+-/g,'-'):v;b.onclick=()=>fn(v);$(id).appendChild(b)})}
function renderEx(){
chips('cex',EX.c[level],v=>{$('cin').value=v;calc()});
chips('aex',EX.a[level],v=>{$('ain').value=v;alg()});
chips('sex',EX.s[level],v=>{['a1','b1','c1','a2','b2','c2'].forEach((k,i)=>$(k).value=v[i]);sys()});
chips('gex',EX.g[level],v=>{$('g1').value=v;$('g2').value='';graph()});
document.querySelectorAll('#lv button').forEach(b=>b.classList.toggle('on',b.dataset.l===level))}
$('lv').onclick=e=>{if(e.target.dataset.l){level=e.target.dataset.l;renderEx()}};

/* ---------- Kalkulator ---------- */
['C','⌫','(',')','7','8','9','÷','4','5','6','×','1','2','3','−','0',',','^','+'].forEach(k=>{const b=document.createElement('button');b.textContent=k;if('÷×−+^'.includes(k)||k=='C'||k=='⌫')b.className='op';
b.onclick=()=>{const i=$('cin');if(k=='C')i.value='';else if(k=='⌫')i.value=i.value.slice(0,-1);else i.value+=k;i.focus()};$('keys').appendChild(b)});
const cl=v=>String(Math.round(v*1e10)/1e10);
const nz=s=>s.replace(/--/g,'+').replace(/\+-/g,'-');
function oneOp(t){let m=t.match(/(\d+\.?\d*)\^(-?\d+\.?\d*)/);if(m)return t.replace(m[0],cl(Math.pow(+m[1],+m[2])));
m=t.match(/(\d+\.?\d*)([*\/])(-?\d+\.?\d*)/);if(m){if(m[2]=='/'&&+m[3]==0)throw Error('Tidak bisa membagi dengan nol');return t.replace(m[0],cl(m[2]=='*'?m[1]*m[3]:m[1]/m[3]))}
m=t.match(/^(-?\d+\.?\d*)([+-])(\d+\.?\d*)/);if(m)return t.replace(m[0],cl(m[2]=='+'?+m[1]+ +m[3]:m[1]-m[3]));return null}
const showE=s=>s.replace(/\*/g,'×').replace(/\//g,'÷').replace(/(\d)\.(\d)/g,'$1,$2').replace(/-/g,'−');
function calc(){const raw=$('cin').value.trim();if(!raw)return;
let s=raw.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/,/g,'.').replace(/\s+/g,'');
if(!/^[\d+\-*\/^().]+$/.test(s)){$('cout').innerHTML=err('Gunakan hanya angka dan tanda + − × ÷ ^ ( )');return}
try{const out=[`Soal: <b>${showE(s)}</b>`];let n=0;
while(!/^-?\d+\.?\d*$/.test(s)&&n++<60){let m=s.match(/\(([^()]*)\)/),prev=s,why;
if(m){if(/^-?\d+\.?\d*$/.test(m[1])){s=nz(s.replace(m[0],m[1]));why='Buka kurung'}
else{const r=oneOp(m[1]);if(r===null)throw Error('Ekspresi di dalam kurung tidak valid');s=nz(s.replace(m[0],'('+r+')'));why='Kerjakan yang di dalam kurung dulu'}}
else{const r=oneOp(s);if(r===null)throw Error('Ekspresi tidak valid');s=nz(r);why=/\^/.test(prev)?'Pangkat didahulukan':/[*\/]/.test(prev)?'Kali / bagi didahulukan dari tambah / kurang':'Tambah / kurang dari kiri ke kanan'}
out.push(`${showE(s)}<small>${why}</small>`)}
if(!/^-?\d+\.?\d*$/.test(s))throw Error('Ekspresi tidak valid');
$('cout').innerHTML=list(out)+`<div class="ans">Hasil: ${showE(s)}</div>`}catch(e){$('cout').innerHTML=err(e.message)}}
$('cgo').onclick=calc;$('cin').onkeydown=e=>{if(e.key=='Enter')calc()};

/* ---------- Aljabar ---------- */
function parseLin(str,v){let i=0;const s=str.replace(/\s+/g,'').toLowerCase().replace(/,/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'),L=(a,b)=>({a,b});
function expr(){let r=term();while(s[i]=='+'||s[i]=='-'){const op=s[i++],t=term();r=op=='+'?L(r.a+t.a,r.b+t.b):L(r.a-t.a,r.b-t.b)}return r}
function term(){let r=fac();while(i<s.length&&(s[i]=='*'||s[i]=='/'||s[i]=='('||s[i]==v||/[\d.]/.test(s[i]))){let op='*';if(s[i]=='*'||s[i]=='/')op=s[i++];const t=fac();
if(op=='/'){if(t.a!==0)throw Error('Pembagi tidak boleh mengandung variabel');if(t.b===0)throw Error('Tidak bisa membagi dengan nol');r=L(r.a/t.b,r.b/t.b)}
else{if(r.a!==0&&t.a!==0)throw Error('Hanya persamaan linear (tanpa '+v+'²)');r=r.a!==0?L(r.a*t.b,r.b*t.b):L(t.a*r.b,t.b*r.b)}}return r}
function fac(){if(s[i]=='-'){i++;const t=fac();return L(-t.a,-t.b)}if(s[i]=='+'){i++;return fac()}
if(s[i]=='('){i++;const r=expr();if(s[i]!=')')throw Error('Tanda kurung belum lengkap');i++;return r}
if(s[i]==v){i++;return L(1,0)}const m=s.slice(i).match(/^\d*\.?\d+/);if(!m)throw Error('Ekspresi tidak dikenali dekat "'+s.slice(i,i+3)+'"');i+=m[0].length;return L(0,parseFloat(m[0]))}
const r=expr();if(i<s.length)throw Error('Ekspresi tidak dikenali dekat "'+s.slice(i,i+3)+'"');return r}
function lin(o,v){let p='';if(o.a!==0){const a=Math.abs(o.a);p=(o.a<0?'−':'')+(a==1?'':fmt(a))+v}
if(o.b!==0||p==='')p+=(p===''?fmt(o.b):(o.b<0?' − ':' + ')+fmt(Math.abs(o.b)));return p}
function alg(){const raw=$('ain').value.trim();if(!raw)return;
try{const parts=raw.split('=');if(parts.length!=2)throw Error('Tulis satu tanda "=" , contoh: 2x + 3 = 11');
const m=raw.match(/[a-z]/gi),v=m?m[0].toLowerCase():'x';
const L=parseLin(parts[0],v),Rr=parseLin(parts[1],v),st=[`Soal: <b>${raw}</b>`,`Sederhanakan tiap ruas: <b>${lin(L,v)} = ${lin(Rr,v)}</b><small>Kalikan kurung dan jumlahkan suku yang sejenis.</small>`];
const A=L.a-Rr.a,B=Rr.b-L.b;
st.push(`Pindahkan suku ${v} ke kiri, bilangan biasa ke kanan: <b>${lin({a:A,b:0},v)} = ${fmt(B)}</b><small>Memindah ruas = mengubah tanda (+ jadi −, − jadi +).</small>`);
if(rd(A)===0){$('aout').innerHTML=list(st)+(rd(B)===0?'<div class="ans">Semua bilangan adalah penyelesaian</div>':'<div class="ans" style="background:#b45309">Tidak ada penyelesaian</div>');return}
const x=B/A;st.push(`Bagi kedua ruas dengan ${fmt(A)}: <b>${v} = ${fmt(B)} ÷ ${fmt(A)} = ${fmt(x)}</b>`);
st.push(`Cek: ruas kiri = ${fmt(L.a*x+L.b)}, ruas kanan = ${fmt(Rr.a*x+Rr.b)} ✓ <small>Kedua ruas sama, jadi jawabannya benar.</small>`);
$('aout').innerHTML=list(st)+`<div class="ans">${v} = ${full(x)}</div>`}catch(e){$('aout').innerHTML=err(e.message)}}
$('ago').onclick=alg;$('ain').onkeydown=e=>{if(e.key=='Enter')alg()};

/* ---------- SPLDV ---------- */
function eqS(a,b,c){let p='';
if(a!==0)p+=(a<0?'−':'')+(Math.abs(a)==1?'':fmt(Math.abs(a)))+'x';
if(b!==0)p+=(p?(b<0?' − ':' + '):(b<0?'−':''))+(Math.abs(b)==1?'':fmt(Math.abs(b)))+'y';
return (p||'0')+' = '+fmt(c)}
function sys(){const[a1,b1,c1,a2,b2,c2]=['a1','b1','c1','a2','b2','c2'].map(k=>num($(k).value));
if([a1,b1,c1,a2,b2,c2].some(isNaN)){$('sout').innerHTML=err('Isi semua kotak dengan angka (boleh pecahan seperti 1/2).');return}
if((a1==0&&b1==0)||(a2==0&&b2==0)){$('sout').innerHTML=err('Tiap persamaan harus punya x atau y.');return}
gData.s=[{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}];const E1=eqS(a1,b1,c1),E2=eqS(a2,b2,c2),D=a1*b2-a2*b1;
let st=[`Persamaan (1): <b>${E1}</b><br>Persamaan (2): <b>${E2}</b>`],pt=null,out='';
if(rd(D)===0){const same=rd(a1*c2-a2*c1)===0&&rd(b1*c2-b2*c1)===0;
st.push(`Cek perbandingan koefisien: ${fmt(a1)}·${fmt(b2)} − ${fmt(a2)}·${fmt(b1)} = 0, jadi kedua garis sejajar atau berimpit.`);
out=same?'<div class="ans">Tak hingga banyak penyelesaian (garis berimpit)</div>':'<div class="ans" style="background:#b45309">Tidak ada penyelesaian (garis sejajar)</div>'}
else{const X=(c1*b2-c2*b1)/D,Y=(a1*c2-a2*c1)/D;pt=[X,Y];
st.push(`<b>Eliminasi y.</b> Kalikan (1) dengan ${fmt(b2)} dan (2) dengan ${fmt(b1)} agar koefisien y sama:<br>${eqS(a1*b2,b1*b2,c1*b2)}<br>${eqS(a2*b1,b1*b2,c2*b1)}`);
st.push(`Kurangkan kedua persamaan: <b>${fmt(a1*b2-a2*b1)}x = ${fmt(c1*b2-c2*b1)}</b> sehingga <b>x = ${full(X)}</b>`);
st.push(`<b>Eliminasi x.</b> Kalikan (1) dengan ${fmt(a2)} dan (2) dengan ${fmt(a1)}:<br>${eqS(a1*a2,a2*b1,a2*c1)}<br>${eqS(a1*a2,a1*b2,a1*c2)}`);
st.push(`Kurangkan: <b>${fmt(a1*b2-a2*b1)}y = ${fmt(a1*c2-a2*c1)}</b> sehingga <b>y = ${full(Y)}</b>`);
st.push(`Cek ke persamaan (1): ${fmt(a1)}(${fmt(X)}) + ${fmt(b1)}(${fmt(Y)}) = ${fmt(a1*X+b1*Y)} ✓<br>Cek ke persamaan (2): ${fmt(a2)}(${fmt(X)}) + ${fmt(b2)}(${fmt(Y)}) = ${fmt(a2*X+b2*Y)} ✓`);
out=`<div class="ans">x = ${full(X)} dan y = ${full(Y)}</div>`}
gData.pt=pt;const m=Math.max(10,Math.ceil(Math.max(Math.abs(pt?pt[0]:0),Math.abs(pt?pt[1]:0))*1.4));if(pt&&m>R.s)R.s=m;
$('sout').innerHTML=list(st)+out;drawAll()}
$('sgo').onclick=sys;

/* ---------- Grafik ---------- */
const OK=['x','sqrt','abs','sin','cos','tan','pi'];
function mkFn(str){let s=str.toLowerCase().replace(/^\s*y\s*=/,'').replace(/,/g,'.').replace(/\^/g,'**').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
if(!/^[0-9a-z+\-*\/().\s]+$/.test(s)||(s.match(/[a-z]+/g)||[]).some(w=>!OK.includes(w)))throw Error('Rumus tidak dikenali: '+str);
s=s.replace(/(\d|\))\s*(x|\(|sqrt|abs|sin|cos|tan|pi)/g,'$1*$2').replace(/x\s*(\d|\(|x|pi)/g,'x*$1');
const f=new Function('x','sqrt','abs','sin','cos','tan','pi','return '+s);return x=>f(x,Math.sqrt,Math.abs,Math.sin,Math.cos,Math.tan,Math.PI)}
function graph(){$('gerr').innerHTML='';const ins=[$('g1').value.trim(),$('g2').value.trim()].filter(Boolean);gData.g=[];
try{ins.forEach((t,i)=>{const f=mkFn(t);f(1);gData.g.push({f,t,col:i?'--c2':'--c1'})})}catch(e){$('gerr').innerHTML=err(e.message.startsWith('Rumus tidak dikenali')?e.message:'Rumus tidak valid. Contoh: 2x+1 atau x^2-4')}
let h='';gData.g.forEach(o=>{const xs=[-3,-2,-1,0,1,2,3];h+=`<table><tr><th>x</th>${xs.map(x=>`<th>${mn(x)}</th>`).join('')}</tr><tr><th>y</th>${xs.map(x=>`<td>${fmt(o.f(x))}</td>`).join('')}</tr></table><p class="muted">y = ${o.t}</p>`});$('gtb').innerHTML=h;drawAll()}
$('ggo').onclick=graph;$('g1').onkeydown=$('g2').onkeydown=e=>{if(e.key=='Enter')graph()};
document.addEventListener('click',e=>{const z=e.target.dataset.z;if(z){R[z]=Math.min(200,Math.max(2,R[z]*(e.target.dataset.d>0?1.6:1/1.6)));drawAll()}});

function draw(cv,items,r,pt){const dpr=window.devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;if(!W)return;cv.width=W*dpr;cv.height=H*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);
const css=getComputedStyle(document.documentElement),col=n=>css.getPropertyValue(n).trim(),yr=r*H/W,sx=x=>W/2+x*W/(2*r),sy=y=>H/2-y*H/(2*yr);
const step=[1,2,5,10,20,50,100].find(s=>r/s<=6)||100;c.font='11px system-ui';c.fillStyle=col('--mu');c.lineWidth=1;
for(let x=Math.ceil(-r/step)*step;x<=r;x+=step){c.strokeStyle=col('--gr');c.beginPath();c.moveTo(sx(x),0);c.lineTo(sx(x),H);c.stroke();if(x)c.fillText(x,sx(x)+2,sy(0)+12)}
for(let y=Math.ceil(-yr/step)*step;y<=yr;y+=step){c.strokeStyle=col('--gr');c.beginPath();c.moveTo(0,sy(y));c.lineTo(W,sy(y));c.stroke();if(y)c.fillText(y,sx(0)+3,sy(y)-2)}
c.strokeStyle=col('--mu');c.lineWidth=1.6;c.beginPath();c.moveTo(0,sy(0));c.lineTo(W,sy(0));c.moveTo(sx(0),0);c.lineTo(sx(0),H);c.stroke();
items.forEach((it,k)=>{c.strokeStyle=col(it.col);c.lineWidth=2.4;c.beginPath();
if(it.vx!==undefined){c.moveTo(sx(it.vx),0);c.lineTo(sx(it.vx),H)}
else{let on=false,py=0;for(let p=0;p<=W;p+=1){const x=(p-W/2)*2*r/W;let y;try{y=it.f(x)}catch(e){y=NaN}
if(!isFinite(y)||Math.abs(sy(y))>H*4){on=false;continue}const Y=sy(y);if(on&&Math.abs(Y-py)<H)c.lineTo(p,Y);else c.moveTo(p,Y);on=true;py=Y}}
c.stroke();c.fillStyle=col(it.col);c.font='bold 12px system-ui';c.fillText(it.t,10,18+k*16)});
if(pt){c.fillStyle=col('--ok');c.beginPath();c.arc(sx(pt[0]),sy(pt[1]),6,0,7);c.fill();c.fillStyle=col('--tx');c.font='bold 12px system-ui';c.fillText('('+fmt(pt[0])+', '+fmt(pt[1])+')',sx(pt[0])+9,sy(pt[1])-9)}}
function drawAll(){const h=location.hash.slice(1);
if(h=='grafik')draw($('gcv'),gData.g,R.g);
if(h=='spldv'){const it=gData.s.map((e,i)=>e.b!==0?{f:x=>(e.c-e.a*x)/e.b,t:'Persamaan '+(i+1),col:i?'--c2':'--c1'}:{vx:e.c/e.a,t:'Persamaan '+(i+1),col:i?'--c2':'--c1'});draw($('scv'),it,R.s,gData.pt)}}

/* ---------- Tombol Hapus ---------- */
$('cclr').onclick=()=>{$('cin').value='';$('cout').innerHTML='';$('cin').focus()};
$('aclr').onclick=()=>{$('ain').value='';$('aout').innerHTML='';$('ain').focus()};
$('sclr').onclick=()=>{['a1','b1','c1','a2','b2','c2'].forEach(k=>$(k).value='');$('sout').innerHTML='';gData.s=[];gData.pt=null;R.s=10;drawAll()};
$('gclr').onclick=()=>{$('g1').value='';$('g2').value='';$('gtb').innerHTML='';$('gerr').innerHTML='';gData.g=[];R.g=10;drawAll()};
const init={};
/* ---------- Navigasi ---------- */
function route(){const ids=['beranda','kalkulator','aljabar','spldv','grafik'];let h=location.hash.slice(1);if(!ids.includes(h))h='beranda';
ids.forEach(i=>$(i).classList.toggle('on',i==h));document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')=='#'+h));window.scrollTo(0,0);
if(h=='spldv'&&!init.s){init.s=1;sys()}if(h=='grafik'&&!init.g){init.g=1;graph()}drawAll()}
window.addEventListener('hashchange',route);window.addEventListener('resize',drawAll);
renderEx();route();
