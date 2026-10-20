(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const BAR=1950;                       // thời lượng đọc gốc (ms) của 1 "bar" kịch bản
const BPM=76.5, BEAT=60000/BPM, OFF=450;   // Từng Ngày Yêu Em: nhịp & độ lệch pha (ms)
function snap(ms){ const U=BEAT*2; let d=Math.max(1,Math.round(ms/U))*U;
  if(!bgm.paused){ const t=bgm.currentTime*1000-OFF; d=Math.max(U*.75,Math.round((t+d)/U)*U-t); }
  return d; }
const YRS=new Date().getFullYear()-1930;
const qp=new URLSearchParams(location.search);
const TO=(qp.get('to')||'').trim().slice(0,40), FROM=(qp.get('from')||'').trim().slice(0,40);
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ================= KỊCH BẢN ================= */
const S=[
 {say:TO?'này <em>'+esc(TO)+'</em> ơi!':'này cậu ơi!', bars:1.1, mood:'wave', mode:'hero', bg:0, fx:{meteor:1}},
 {say:'tớ là <em>Nụ</em> — nàng tiên nhỏ của vườn hoa', bars:1.7, mood:'talk'},
 {say:'hôm nay tớ được giao một nhiệm vụ đặc biệt lắm đó…', bars:1.7, mood:'shy'},
 {say:'vì sắp đến ngày…', bars:1, mood:'talk'},
 {scene:'date', mode:'side', say:'<em>20/10</em> rồi!', bars:1.7, mood:'happy', bg:2, fx:{petals:.7,meteor:1}},

 {scene:'history', say:'ngày 20/10/1930, Hội Phụ nữ phản đế Việt Nam ra đời', bars:2, mood:'talk', reveal:['h1','h2']},
 {say:'đã <em>'+YRS+'</em> năm trôi qua, và 20/10 thành ngày cả nước dành để tri ân phụ nữ', bars:2.3, mood:'talk', reveal:['h3','h4'], on(){countTo($('#yrs'),YRS,2200)}},

 {scene:'heroes', say:'trong câu chuyện đất nước, có biết bao người phụ nữ phi thường…', bars:2, mood:'talk', bg:0, fx:{meteor:1.6}, reveal:['n1','l1','n2','l2','e12']},
 {say:'từ Hai Bà Trưng, Bà Triệu thuở dựng nước, đến những người con gái kiên cường của thế kỷ XX', bars:2.4, mood:'talk', reveal:['n3','l3','e23','n4','l4','e24','n5','l5','e35','e45']},
 {say:'và còn những người không có tên trong sách: bà, mẹ, chị, cô giáo… và cả <em>cậu</em> nữa', bars:2.4, mood:'happy', reveal:['n6','l6','e46','e56'], fx:{meteor:2.2,petals:.3}},

 {scene:'unseen', say:'có những điều rất nhỏ mà phụ nữ vẫn lặng lẽ làm mỗi ngày…', bars:2, mood:'talk', bg:2, fx:{petals:.2}},
 {say:'', bars:1.15, reveal:['c1']},
 {say:'', bars:1.15, reveal:['c2']},
 {say:'', bars:1.15, reveal:['c3']},
 {say:'', bars:1.4, reveal:['c4']},
 {say:'mà hiếm khi có ai nói lời cảm ơn', bars:1.8, mood:'shy'},
 {scene:'none', mode:'hero', say:'nên hôm nay, đến lượt <em>cậu</em> được quan tâm', bars:2, mood:'happy', fx:{petals:1.1}},

 {say:'tớ xin gửi cậu bốn lời chúc nhé', bars:1.5, mood:'wave', bg:2},
 {scene:'health', mode:'side', say:'chúc cậu thật nhiều <em>sức khỏe</em> — để còn đi hết những nơi cậu muốn đến', bars:2.4, mood:'talk', bg:1, fx:{meteor:.6}},
 {scene:'peace', say:'chúc cậu <em>bình yên</em> — dù ngoài kia có ồn ào thế nào', bars:2.2, mood:'talk', bg:1},
 {scene:'free', say:'chúc cậu đủ <em>tự do</em> để làm điều mình thích, và đủ dũng cảm để theo đuổi nó', bars:2.5, mood:'talk', bg:0, fx:{lantern:1,meteor:.8}},
 {scene:'love', say:'chúc cậu luôn được <em>yêu thương</em> — đúng cách, đúng người, và cả bởi chính cậu', bars:2.5, mood:'happy', bg:2, fx:{hearts:1,petals:.3}},

 {scene:'none', mode:'hero', say:'cậu không cần phải hoàn hảo đâu', bars:1.6, mood:'talk', fx:{petals:.8}},
 {say:'cậu đẹp ở cách cậu cố gắng, cách cậu cười, và cách cậu thương người khác', bars:2.4, mood:'shy'},

 {scene:'gift', mode:'side', say:'tớ tặng cậu bó hoa này nè', bars:1.8, mood:'happy', bg:3, fx:{petals:1,meadow:1.1}},
 {say:'một loài hoa không bao giờ héo — vì mỗi cánh là một lời yêu thương', bars:2.4, mood:'talk'},

 {scene:'question', mode:'hero', say:'tôi hỏi chi một câu nhá<br>hôm nay cậu đã <em>khen bản thân</em> chưa?', bars:2, mood:'wink', bg:2, fx:{petals:.3,meteor:1}, wait:true, reveal:['q1']},
 {scene:'final', mode:'side', say:'', mood:'happy', bg:3, fx:{fire:1,petals:.9,meadow:1.5}, wait:true, final:true}
];

/* ================= TRẠNG THÁI ================= */
const nu=$('#nu'), bgls=$$('.bgl'), line=$('#line'), bubble=$('#bubble'), hint=$('#hint'), prog=$('#prog');
let idx=-1, timer=null, started=false, curScene=null, waiting=false, lock=0, talkT=null;
let fxS={petals:0,hearts:0,lantern:0,fire:0,meteor:1,meadow:.6};

function mood(m){ nu.className=(m||''); }
function talk(on){ clearTimeout(talkT); nu.classList.toggle('talk',on); if(on) talkT=setTimeout(()=>nu.classList.remove('talk'),1500); }

function say(html){
  bubble.classList.toggle('empty',!html);
  line.innerHTML=html||'';
  let k=0;
  (function walk(n){
    [...n.childNodes].forEach(c=>{
      if(c.nodeType===3){
        const f=document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(p=>{
          if(!p) return;
          if(!p.trim()){ f.append(p); return; }
          const s=document.createElement('span'); s.className='w'; s.textContent=p; s.style.animationDelay=(k++*65)+'ms'; f.append(s);
        });
        c.replaceWith(f);
      } else if(c.nodeType===1 && c.tagName!=='BR') walk(c);
    });
  })(line);
}

function showScene(name){
  if(name===undefined) return;
  const next = name==='none' ? null : $('#sc-'+name);
  if(next===curScene) return;
  if(curScene){ curScene.classList.remove('on'); }
  const old=curScene; curScene=next;
  if(old) setTimeout(()=>{ if(old!==curScene) $$('.rv.on,.node.on,.edge.on,.lbl.on',old).forEach(e=>e.classList.remove('on')); },800);
  if(next) setTimeout(()=>{ if(curScene===next) next.classList.add('on'); }, old?420:60);
}

function countTo(el,to,ms){
  const t0=performance.now();
  (function f(t){ const k=Math.min(1,(t-t0)/ms); el.textContent=Math.round(to*(1-Math.pow(1-k,3))); if(k<1) requestAnimationFrame(f); })(t0);
}

function go(n){
  clearTimeout(timer);
  if(n>=S.length) return;
  idx=n; const st=S[n]; document.body.classList.toggle('bloom',!!st.final);
  if(st.mode){ document.body.classList.toggle('m-side',st.mode==='side'); document.body.classList.toggle('m-hero',st.mode==='hero'); }
  if(st.bg!==undefined) bgls.forEach((e,k)=>e.classList.toggle('on',k===st.bg));
  if(st.fx){ fxS=Object.assign({petals:0,hearts:0,lantern:0,fire:0,meteor:1,meadow:.6},st.fx); parts.forEach(p=>{ if((p.t==='lantern'&&!fxS.lantern)||(p.t==='heart'&&!fxS.hearts)) p.kill=true; }); }
  showScene(st.scene);
  if(st.mood!==undefined){ const talking=nu.classList.contains('talk'); mood(st.mood); if(talking) nu.classList.add('talk'); }
  say(st.say);
  talk(!!st.say);
  if(st.reveal) st.reveal.forEach((id,j)=>setTimeout(()=>{const e=document.getElementById(id); if(e) e.classList.add('on');}, (st.scene?650:0)+j*260));
  if(st.on) st.on();
  prog.style.width=((n+1)/S.length*100)+'%';
  hint.classList.toggle('on', n>=1 && n<=4);
  waiting=!!st.wait;
  if(!st.wait && !qp.has('hold')) timer=setTimeout(()=>go(n+1),snap((st.bars||1.5)*BAR));
  if(st.final) setupFinal();
}

function next(){ const now=Date.now(); if(now-lock<380) return; lock=now; if(!waiting && idx<S.length-1) go(idx+1); }

/* ================= TƯƠNG TÁC ================= */
document.addEventListener('click',e=>{
  if(!started) return;
  if(e.target.closest('.ui,button,input,a,.final')) return;
  next();
});
document.addEventListener('keydown',e=>{ if(started&&(e.key===' '||e.key==='ArrowRight')&&e.target.tagName!=='INPUT'){e.preventDefault();next();} });

$('#q1').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b||!waiting) return;
  waiting=false; $('#q1').classList.remove('on');
  mood('happy'); talk(true);
  if(b.dataset.a==='yes'){
    say('hay đấy nhug bấm vô chưa để xem lời chúc của tôi nhá');
  } else {
    say('vậy nhân dịp 20/10 chúc Chi luôn luôn vui vè hạnh phúc mang trên mih là những nụ cười thay vì sự u buồn nhá');
  }
  clearTimeout(timer); timer=setTimeout(()=>go(idx+1), snap(4.4*BAR));
});

function setupFinal(){
  const to=TO||'';
  $('#f-to').textContent = to ? 'gửi '+to+(FROM?' · từ '+FROM:'') : 'gửi người phụ nữ tuyệt vời'+(FROM?' · từ '+FROM:'');
  if(location.protocol.startsWith('http')) $('#b-link').hidden=false;
}
$('#b-link').addEventListener('click',()=>{
  const v=TO;
  const u=new URL(location.href); u.search=''; if(v) u.searchParams.set('to',v);
  (navigator.clipboard?navigator.clipboard.writeText(u.toString()):Promise.reject()).then(()=>{$('#b-link').textContent='đã chép ✓';setTimeout(()=>$('#b-link').textContent='chép link',1800);}).catch(()=>prompt('Sao chép liên kết:',u.toString()));
});
$('#b-replay').addEventListener('click',()=>{
  $$('.rv.on,.node.on,.edge.on,.lbl.on').forEach(e=>e.classList.remove('on'));
  if(curScene){curScene.classList.remove('on'); curScene=null;}
  setTimeout(()=>go(0),300);
});

/* ================= ÂM THANH ================= */
const bgm=$('#bgm'); let actx=null, an=null, fd=null, avg=0, dpeak=.02;
function setupAudio(){
  if(location.protocol==='file:') return; // mở bằng file:// thì WebAudio làm mất tiếng, dùng phát thẳng
  try{
    const AC=window.AudioContext||window.webkitAudioContext; actx=new AC();
    const src=actx.createMediaElementSource(bgm); an=actx.createAnalyser(); an.fftSize=256; an.smoothingTimeConstant=.55;
    src.connect(an); an.connect(actx.destination); fd=new Uint8Array(an.frequencyBinCount);
    if(actx.state==='suspended') actx.resume();
  }catch(err){ an=null; }
}
$('#mute').addEventListener('click',()=>{ bgm.muted=!bgm.muted; $('#mute').classList.toggle('muted',bgm.muted); });

$('#start').addEventListener('click',()=>{
  if(started) return; started=true;
  $('#start').classList.add('gone');
  setupAudio(); bgm.volume=.9; const pr=bgm.play(); if(pr&&pr.catch) pr.catch(()=>{});
  setTimeout(()=>go(0),500);
});

/* ================= HIỆU ỨNG NỀN (canvas) ================= */
const cv=$('#fx'), ctx=cv.getContext('2d');
let W=0,H=0,DPR=1, stars=[], parts=[], pulse=0, lastP=-1, acc={p:0,h:0,l:0,f:0,m:0};

function spr(w,h,fn){ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); return c; }
function petalSpr(c1,c2){ return spr(40,56,(g,w,h)=>{ const gr=g.createLinearGradient(0,h,0,0); gr.addColorStop(0,c1); gr.addColorStop(1,c2);
  g.fillStyle=gr; g.beginPath(); g.moveTo(w/2,h*.96); g.bezierCurveTo(-w*.25,h*.62,w*.08,h*.02,w/2,0); g.bezierCurveTo(w*.92,h*.02,w*1.25,h*.62,w/2,h*.96); g.fill(); }); }
const SP={ petal:[petalSpr('#ff7ab8','#ffe3f0'),petalSpr('#ffb347','#fff0c4'),petalSpr('#9b6bff','#eadfff')],
  heart:spr(48,44,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#ffc2dd'); gr.addColorStop(1,'#ff5f9a'); g.fillStyle=gr;
    g.beginPath(); g.moveTo(w/2,h*.95); g.bezierCurveTo(-w*.2,h*.55,w*.12,-h*.1,w/2,h*.28); g.bezierCurveTo(w*.88,-h*.1,w*1.2,h*.55,w/2,h*.95); g.fill(); }),
  lantern:spr(64,84,(g,w,h)=>{ const r=g.createRadialGradient(w/2,h*.5,2,w/2,h*.5,w/2); r.addColorStop(0,'rgba(255,200,120,.7)'); r.addColorStop(1,'rgba(255,160,90,0)'); g.fillStyle=r; g.fillRect(0,0,w,h);
    const gr=g.createLinearGradient(0,h*.25,0,h*.75); gr.addColorStop(0,'#fff0b8'); gr.addColorStop(1,'#ff9a58'); g.fillStyle=gr;
    g.beginPath(); g.moveTo(w*.34,h*.24); g.quadraticCurveTo(w*.14,h*.5,w*.3,h*.74); g.lineTo(w*.7,h*.74); g.quadraticCurveTo(w*.86,h*.5,w*.66,h*.24); g.closePath(); g.fill();
    g.fillStyle='#ffd9a0'; g.fillRect(w*.32,h*.2,w*.36,h*.05); g.fillStyle='#e07a3c'; g.fillRect(w*.32,h*.74,w*.36,h*.04);
    g.strokeStyle='rgba(180,70,20,.35)'; g.lineWidth=1; g.beginPath(); g.moveTo(w*.5,h*.25); g.lineTo(w*.5,h*.74); g.stroke(); }) };

function resize(){
  DPR=Math.min(devicePixelRatio||1,1.5); W=innerWidth; H=innerHeight;
  cv.width=W*DPR; cv.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
  const n=Math.min(230,Math.round(W*H/6500)); stars=[];
  for(let i=0;i<n;i++) stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.4,t:Math.random()*6.28,s:.6+Math.random()*1.6,h:Math.random()<.2?330:Math.random()<.4?210:45});
}
addEventListener('resize',resize); resize();
let mdw=.6; const BL=[];
function blades(){ BL.length=0; const n=Math.round(W/5);
  for(let i=0;i<n;i++) BL.push({x:i/n*W+Math.random()*4, h:(.04+Math.random()*.08)*H*(.55+.9*Math.pow(Math.sin(i/n*9+1),2)), ph:Math.random()*6.28, w:1+Math.random()*1.2, hue:[160,175,190,95,55,320][(Math.random()*6)|0]}); }
blades(); addEventListener('resize',blades);

function spawn(type){
  const R=Math.random;
  if(type==='petal') parts.push({t:'petal',x:R()*W,y:-30,vx:-10+R()*30,vy:40+R()*55,r:R()*6.28,vr:(R()-.5)*3,s:.35+R()*.45,ph:R()*6.28,sp:SP.petal[(R()*3)|0],a:1});
  else if(type==='heart') parts.push({t:'heart',x:R()*W,y:H+20,vx:(R()-.5)*30,vy:-(50+R()*60),r:0,vr:0,s:.25+R()*.45,ph:R()*6.28,sp:SP.heart,a:.9});
  else if(type==='lantern') parts.push({t:'lantern',x:R()*W,y:H+50,vx:(R()-.5)*14,vy:-(24+R()*28),r:0,vr:0,s:.5+R()*.7,ph:R()*6.28,sp:SP.lantern,a:.95});
  else if(type==='meteor'){ const x=W*(.3+R()*.7), y=R()*H*.35; parts.push({t:'meteor',x,y,vx:-(380+R()*220),vy:150+R()*100,life:1}); }
  else if(type==='fire'){ const cx=W*(.15+R()*.7), cy=H*(.12+R()*.4), hue=[330,45,280,200][(R()*4)|0], n=34;
    for(let i=0;i<n;i++){ const a=i/n*6.283+R()*.2, v=90+R()*120; parts.push({t:'spark',x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,hue}); } }
}

let lastT=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-lastT)/1000); lastT=now;
  /* nhịp bass → pulse */
  let target=0;
  if(an&&fd&&!bgm.paused){ an.getByteFrequencyData(fd); const lvl=(fd[0]+fd[1]+fd[2]+fd[3])/(4*255); avg+=(lvl-avg)*Math.min(1,dt*3.2); const d=lvl-avg; dpeak=Math.max(dpeak*Math.pow(.6,dt),d,.02); target=Math.min(1,Math.max(0,d/dpeak)); target*=target; }
  else if(started){ { const bp=BEAT/1000; target=Math.max(0,1-(((now/1000)%bp)/bp)*3); } }
  if(!bgm.paused){ const ph=(((bgm.currentTime*1000-OFF)%BEAT)+BEAT)%BEAT/BEAT; target=Math.max(target,Math.pow(Math.max(0,1-ph*2.4),2)*.65); }
  pulse=Math.max(pulse*Math.pow(.02,dt),target); if(pulse>1) pulse=1;
  if(Math.abs(pulse-lastP)>.03){ lastP=pulse; document.documentElement.style.setProperty('--p',pulse.toFixed(2)); }

  ctx.clearRect(0,0,W,H);
  /* sao */
  for(const s of stars){ s.t+=dt*s.s; const a=.35+.45*Math.abs(Math.sin(s.t))+pulse*.25; ctx.globalAlpha=Math.min(1,a); ctx.fillStyle='hsl('+s.h+',90%,88%)'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*(1+pulse*.35),0,6.283); ctx.fill(); }
  ctx.globalAlpha=1;
  /* đồng cỏ neon */
  mdw+=(fxS.meadow-mdw)*Math.min(1,dt*1.6);
  ctx.globalCompositeOperation='lighter'; ctx.lineCap='round'; const tm=now/1000;
  for(const b of BL){ const sw=Math.sin(tm*1.2+b.ph+b.x*.004)*(5+b.h*.12)+Math.sin(tm*.5+b.x*.01)*4, h=b.h*mdw;
    ctx.strokeStyle='hsla('+b.hue+',95%,60%,'+(.5+pulse*.35)+')'; ctx.lineWidth=b.w;
    ctx.beginPath(); ctx.moveTo(b.x,H); ctx.quadraticCurveTo(b.x+sw*.3,H-h*.6,b.x+sw,H-h); ctx.stroke(); }
  ctx.globalCompositeOperation='source-over';
  /* sinh hạt */
  acc.p+=dt*fxS.petals*7; while(acc.p>=1){acc.p--; spawn('petal');}
  acc.h+=dt*fxS.hearts*4; while(acc.h>=1){acc.h--; spawn('heart');}
  acc.l+=dt*fxS.lantern*1.5; while(acc.l>=1){acc.l--; spawn('lantern');}
  acc.f+=dt*fxS.fire*1.1; while(acc.f>=1){acc.f--; spawn('fire');}
  acc.m+=dt*fxS.meteor*.22; while(acc.m>=1){acc.m--; spawn('meteor');}
  if(parts.length>420) parts.splice(0,parts.length-420);
  /* vẽ hạt */
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];
    if(p.t==='meteor'){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt*1.1; if(p.life<=0){parts.splice(i,1);continue;}
      const g=ctx.createLinearGradient(p.x,p.y,p.x-p.vx*.16,p.y-p.vy*.16); g.addColorStop(0,'rgba(255,255,255,'+p.life+')'); g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.strokeStyle=g; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*.16,p.y-p.vy*.16); ctx.stroke(); continue; }
    if(p.t==='spark'){ p.vy+=90*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.985; p.life-=dt*.75; if(p.life<=0){parts.splice(i,1);continue;}
      ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.max(0,p.life); ctx.fillStyle='hsl('+p.hue+',100%,70%)'; ctx.beginPath(); ctx.arc(p.x,p.y,2.2,0,6.283); ctx.fill(); ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; continue; }
    if(p.kill){ p.a-=dt*.9; if(p.a<=0){parts.splice(i,1);continue;} }
    p.ph+=dt*2; p.x+=(p.vx+Math.sin(p.ph)*22)*dt; p.y+=p.vy*dt; p.r+=p.vr*dt;
    if(p.y>H+60||p.y<-90){parts.splice(i,1);continue;}
    const sc=p.s*(1+(p.t==='heart'?pulse*.12:0)), w=p.sp.width*sc, h=p.sp.height*sc;
    ctx.save(); ctx.globalAlpha=p.a; ctx.translate(p.x,p.y); ctx.rotate(p.r);
    if(p.t==='petal') ctx.scale(Math.abs(Math.cos(p.ph))*.7+.3,1);
    ctx.drawImage(p.sp,-w/2,-h/2,w,h); ctx.restore();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

if(qp.has('debug')) window.__go=go;
document.addEventListener('visibilitychange',()=>{ if(started&&!document.hidden&&bgm.paused&&!bgm.muted) bgm.play().catch(()=>{}); });
})();
