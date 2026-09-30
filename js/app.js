/* ============================================================
   致 鸥黑米 · 生日快乐 —— 演出脚本
   五幕：信封 → 壹缘起 → 贰心之所向 → 叁回响 → 肆许愿 → 伍予你
   风格：白粉樱花 · 明亮
   ============================================================ */
'use strict';

/* ---------- 可调参数 ---------- */
const CFG = {
  candles: 5,                     // 蜡烛数量
  slideMs: 5200,                  // 每张插画停留时长(ms)
  petals: 20000,                  // 樱花密度：数值越小花瓣越多
  tracks: [
    { src: 'assets/audio/bgm1.mp3', name: '生日快乐歌（纯音乐）' },
    { src: 'assets/audio/bgm2.mp3', name: 'Blessing feat. 初音ミク' }
  ],
  gallery: Array.from({ length: 12 }, (_, i) => `assets/img/g${String(i + 1).padStart(2, '0')}.jpg`),
  thumbs:  Array.from({ length: 12 }, (_, i) => `assets/img/t${String(i + 1).padStart(2, '0')}.jpg`),

  /* 愿望回传（默认：一键「发邮件给我」直达 QQ 邮箱，无需任何第三方服务）
     · 想让它全自动发送：填下面的 provider + key
       - formsubmit（免注册，但今日实测服务端 500，暂不可用）
       - web3forms：provider:'web3forms' + key:'access_key'（web3forms.com 输邮箱即给 key）
       - formspree：provider:'formspree' + key:'表单ID'
       - 自己的接口：endpoint:'https://...'（收到 {wish:"..."} 的 POST）
     · 无论填不填，都会同时生成「愿望链接」和「愿望文字」，TA 复制发你也行 */
  wish: {
    provider: '',                  // '' | 'formsubmit' | 'web3forms' | 'formspree'
    email: '2103886050@qq.com',    // 「发邮件给我」的收件邮箱
    key: '',
    endpoint: ''
  }
};
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ============================================================
   1. 樱花 · 光（白底上的粉樱）
   ============================================================ */
const Petals = (() => {
  const cv = $('#petals'), ctx = cv.getContext('2d');
  const COLORS = ['#f9a8c6', '#f7bcd4', '#fdd3e2', '#f49ab9', '#ffe6ef'];
  let W = 0, H = 0, DPR = 1, petals = [], motes = [], raf = null, boost = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function makePetal(fromTop) {
    const r = rnd(5, 13) * (window.innerWidth < 700 ? .85 : 1);
    return {
      x: rnd(-40, W + 40),
      y: fromTop ? rnd(-H * .5, -20) : rnd(-40, H),
      r, vy: rnd(.35, 1.25), vx: rnd(-.35, .7),
      a: rnd(.5, .95), rot: rnd(0, Math.PI * 2), vrot: rnd(-.012, .012),
      ph: rnd(0, Math.PI * 2), sw: rnd(.5, 1.6),
      c: COLORS[(Math.random() * COLORS.length) | 0]
    };
  }
  function makeMote() {
    return { x: rnd(0, W), y: rnd(0, H), r: rnd(2, 6), vy: rnd(-.14, -.03), a: rnd(.06, .2), ph: rnd(0, 6.28) };
  }
  function count() {
    const base = Math.round((W * H) / CFG.petals);
    return Math.max(14, Math.min(REDUCED ? 26 : 96, base));
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    const n = count(), mn = Math.max(10, Math.round(n / 8));
    while (petals.length < n) petals.push(makePetal(false));
    petals.length = n;
    while (motes.length < mn) motes.push(makeMote());
    motes.length = mn;
  }
  function burst(px, py, n = 34) {
    if (REDUCED) return;
    for (let i = 0; i < n; i++) {
      const ang = rnd(0, Math.PI * 2), sp = rnd(1.4, 5.6);
      const p = makePetal(false);
      p.x = px; p.y = py; p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp - .4;
      p.decay = 1;
      petals.push(p);
    }
    if (petals.length > 220) petals.splice(0, petals.length - 220);
  }
  function step() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const w = W, h = H, t = performance.now() / 1000;
    // 空气中的柔光
    for (const m of motes) {
      m.y += m.vy; m.x += Math.sin(t * .3 + m.ph) * .18;
      if (m.y < -20) { m.y = h + 20; m.x = rnd(0, w); }
      const o = m.a * (0.55 + 0.45 * Math.sin(t * .8 + m.ph));
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 9);
      g.addColorStop(0, `rgba(255,206,228,${o})`);
      g.addColorStop(1, 'rgba(255,206,228,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 9, 0, 6.2832); ctx.fill();
    }
    // 花瓣
    boost += (0 - boost) * .02;
    const speed = 1 + boost;
    for (const p of petals) {
      p.ph += .012;
      p.y += p.vy * speed;
      p.x += (p.vx + Math.sin(p.ph) * p.sw * .42) * speed;
      p.rot += p.vrot * speed;
      if (p.decay) { p.vx *= .985; p.vy = p.vy * .985 + .012; p.decay *= .995; }
      if (p.y > h + 40 || p.x < -90 || p.x > w + 90) {
        Object.assign(p, makePetal(true), { decay: 0 });
      }
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.cos(p.ph) * .34 + .8, 1);
      ctx.shadowColor = 'rgba(226,118,159,.35)';
      ctx.shadowBlur = 7;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r * .95, -p.r * .92, p.r * .85, p.r * .5, 0, p.r);
      ctx.bezierCurveTo(-p.r * .85, p.r * .5, -p.r * .95, -p.r * .92, 0, -p.r);
      ctx.fillStyle = p.c;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = p.a * .6;
      ctx.beginPath();
      ctx.ellipse(-p.r * .22, -p.r * .12, p.r * .26, p.r * .52, .35, 0, 6.2832);
      ctx.fillStyle = '#fffdfd';
      ctx.fill();
      ctx.restore();
    }
    raf = requestAnimationFrame(step);
  }
  function start() { if (!raf) raf = requestAnimationFrame(step); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  resize(); start();
  return { burst, boost: v => { boost = Math.max(boost, v); } };
})();

/* ============================================================
   2. 音效（WebAudio 合成，无需额外素材）
   ============================================================ */
const Sfx = (() => {
  let ac = null;
  const ctx = () => (ac ||= new (window.AudioContext || window.webkitAudioContext)());
  function tone(freq, dur = .25, type = 'sine', vol = .06, delay = 0) {
    try {
      const c = ctx(), t0 = c.currentTime + delay;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + .02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(c.destination);
      o.start(t0); o.stop(t0 + dur + .03);
      return o;
    } catch (e) { return null; }
  }
  return {
    ignite() { tone(880, .25, 'triangle', .05); tone(1320, .35, 'sine', .035, .06); },
    seal() { tone(520, .5, 'sine', .05); tone(780, .6, 'sine', .04, .05); },
    send() { tone(660, .7, 'sine', .05); tone(990, .8, 'sine', .04, .1); tone(1320, .9, 'sine', .03, .2); },
    tick() { tone(1500, .08, 'sine', .012); },
    resume() { try { ctx().resume(); } catch (e) {} }
  };
})();

/* ============================================================
   3. 背景音乐
   ============================================================ */
const Music = (() => {
  const audio = new Audio();
  audio.loop = true; audio.preload = 'auto'; audio.volume = 0;
  const btn = $('#musicBtn'), swap = $('#musicSwap'), nameEl = $('#musicName');
  let idx = 0, muted = false, ramp = null;

  function label() { nameEl.textContent = CFG.tracks[idx].name; }
  function fade(to, ms = 1600) {
    clearInterval(ramp);
    const from = audio.volume, steps = Math.max(1, ms / 60);
    let i = 0;
    ramp = setInterval(() => {
      i++;
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
      if (i >= steps) clearInterval(ramp);
    }, 60);
  }
  function play() {
    if (muted) return;
    const p = audio.play();
    if (p && p.catch) p.catch(() => document.body.classList.remove('playing'));
    fade(.6);
    document.body.classList.add('playing');
    btn.setAttribute('aria-pressed', 'true');
    Sfx.resume();
  }
  function pause() {
    clearInterval(ramp);
    audio.pause();
    document.body.classList.remove('playing');
    btn.setAttribute('aria-pressed', 'false');
  }
  function load(i, andPlay) {
    idx = (i + CFG.tracks.length) % CFG.tracks.length;
    const wasPlaying = !audio.paused;
    audio.src = CFG.tracks[idx].src;
    label();
    if (andPlay || wasPlaying) { audio.volume = 0; play(); }
  }
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (audio.paused) { muted = false; play(); }
    else { muted = true; pause(); }
  });
  swap.addEventListener('click', e => {
    e.stopPropagation();
    const go = !muted;
    muted = false;
    audio.volume = 0;
    load(idx + 1, go);
    Toast.show('切换曲目 · ' + CFG.tracks[idx].name);
  });
  label();
  audio.src = CFG.tracks[0].src;
  // 浏览器要求先有一次交互才允许播放；这里做一次兜底尝试
  const kick = () => { if (!muted && audio.paused) play(); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
    addEventListener(ev, kick, { passive: true }));
  play();
  return { play, pause, next: () => load(idx + 1, !muted), get playing() { return !audio.paused; } };
})();

/* ============================================================
   4. 文案切字（保持原文，只做逐字入场）
   ============================================================ */
function splitText() {
  $$('[data-split]').forEach(el => {
    const raw = el.textContent;
    el.textContent = '';
    [...raw].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c === ' ' ? '\u00a0' : c;
      s.style.setProperty('--d', (Math.min(i, 26) * .045).toFixed(3) + 's');
      el.appendChild(s);
    });
  });
  $$('[data-line]').forEach((el, i) => el.style.setProperty('--d', (.15 + i * .55).toFixed(2) + 's'));
}

/* ============================================================
   5. 提示条
   ============================================================ */
const Toast = (() => {
  const el = $('#toast'); let t = null;
  return {
    show(msg, ms = 2800) {
      el.textContent = msg; el.classList.add('on');
      clearTimeout(t); t = setTimeout(() => el.classList.remove('on'), ms);
    }
  };
})();

/* ============================================================
   6. 场景管理
   ============================================================ */
const Stage = (() => {
  const scenes = $$('.scene');
  const LABELS = ['信封', '壹', '贰', '叁', '许', '予'];
  const rail = $('#railDots');
  const prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn');
  const hooks = {};
  let cur = 0, visited = new Set([0]);

  scenes.forEach((sc, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = LABELS[i] || i;
    b.setAttribute('aria-label', '前往第 ' + (i + 1) + ' 幕：' + (LABELS[i] || i));
    b.addEventListener('click', () => go(i));
    rail.appendChild(b);
  });
  const dots = $$('.rail-dots button');

  function go(i, force) {
    i = Math.max(0, Math.min(scenes.length - 1, i));
    if (i === cur && !force) return;
    const prev = scenes[cur];
    prev.classList.remove('is-active');
    hooks[cur] && hooks[cur].leave && hooks[cur].leave(prev);
    cur = i;
    const next = scenes[cur];
    next.classList.add('is-active');
    visited.add(cur);
    dots.forEach((d, k) => {
      d.classList.toggle('on', k === cur);
      d.classList.toggle('visited', visited.has(k) && k !== cur);
    });
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === scenes.length - 1;
    hooks[cur] && hooks[cur].enter && hooks[cur].enter(next);
    Fit.scrolls();
    document.dispatchEvent(new CustomEvent('scene:change', { detail: { index: cur } }));
  }
  prevBtn.addEventListener('click', () => go(cur - 1));
  nextBtn.addEventListener('click', () => go(cur + 1));
  addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (Lightbox.open) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(scenes.length - 1);
  });
  // 鼠标静止后淡出控制件
  let idleT = null;
  function wake() {
    document.body.classList.remove('idle');
    clearTimeout(idleT);
    idleT = setTimeout(() => document.body.classList.add('idle'), 4200);
  }
  ['mousemove', 'pointerdown', 'touchstart', 'wheel'].forEach(ev => addEventListener(ev, wake, { passive: true }));
  wake();
  dots[0].classList.add('on');
  prevBtn.disabled = true;
  return { go, get cur() { return cur; }, hook: (i, o) => (hooks[i] = o), get scenes() { return scenes; } };
})();

/* ============================================================
   7. 长截图自动滚动 / 视差
   ============================================================ */
const Fit = (() => {
  function scrolls() {
    $$('.device-scroll').forEach(box => {
      const img = box.querySelector('img');
      if (!img || !img.naturalHeight) return;
      const frameH = box.parentElement.clientHeight;
      const w = box.clientWidth;
      const h = w * (img.naturalHeight / img.naturalWidth);
      const shift = Math.min(0, Math.round(frameH - h));
      box.style.setProperty('--shift', shift + 'px');
      box.style.setProperty('--dur', Math.max(22, Math.min(52, Math.abs(shift) / 26)).toFixed(1) + 's');
    });
  }
  $$('.device-scroll img').forEach(img => {
    if (img.complete) scrolls(); else img.addEventListener('load', scrolls);
  });
  addEventListener('resize', scrolls);
  addEventListener('load', scrolls);
  // 鼠标视差（白底上含蓄一点）
  addEventListener('mousemove', e => {
    if (REDUCED) return;
    const nx = (e.clientX / innerWidth - .5), ny = (e.clientY / innerHeight - .5);
    $$('.scene.is-active .device').forEach(d => {
      const k = parseFloat(d.dataset.parallax || '.5');
      const base = window.innerWidth < 920 ? -4 : -7;
      d.style.transform = `rotateY(${base + nx * 5 * k}deg) rotateX(${2 - ny * 4 * k}deg) translate3d(${nx * -6 * k}px,${ny * -5 * k}px,0)`;
    });
  });
  return { scrolls };
})();

/* ============================================================
   8. 看大图
   ============================================================ */
const Lightbox = (() => {
  const box = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap');
  const CAPS = { 'p1.jpg': '我们的第一段对话', 'p2.jpg': '还是这段对话' };
  let list = [], i = 0, open = false;

  function render() {
    const it = list[i];
    const src = typeof it === 'string' ? it : it.src;
    img.src = src;
    const name = src.split('/').pop();
    cap.textContent = (typeof it === 'object' && it.cap) || CAPS[name] || ('第 ' + (i + 1) + ' / ' + list.length + ' 张');
  }
  function show(l, k) {
    list = l; i = k || 0; open = true;
    render();
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('on'));
  }
  function hide() {
    if (!open) return;
    open = false;
    box.classList.remove('on');
    setTimeout(() => { box.hidden = true; }, 300);
  }
  function step(d) { i = (i + d + list.length) % list.length; render(); }
  box.addEventListener('click', e => { if (e.target !== img) hide(); });
  img.addEventListener('click', e => { e.stopPropagation(); step(1); });
  $('#lbClose').addEventListener('click', e => { e.stopPropagation(); hide(); });
  $('#lbPrev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
  $('#lbNext').addEventListener('click', e => { e.stopPropagation(); step(1); });
  addEventListener('keydown', e => {
    if (!open) return;
    if (e.key === 'Escape') hide();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
  return { show, hide, get open() { return open; } };
})();

/* ============================================================
   9. 彩带（最后一幕的庆祝）
   ============================================================ */
const Confetti = (() => {
  const box = $('#confetti');
  const COLORS = ['#f7a8c8', '#ffd6e6', '#ffc978', '#fff0b8', '#f49ab9', '#ffffff'];
  function burst(n = 120) {
    if (REDUCED) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.style.left = (Math.random() * 100) + 'vw';
      s.style.background = COLORS[(Math.random() * COLORS.length) | 0];
      s.style.setProperty('--x', (Math.random() * 180 - 90).toFixed(0) + 'px');
      s.style.setProperty('--r', (Math.random() * 900 - 450).toFixed(0) + 'deg');
      s.style.animationDuration = (3 + Math.random() * 2.6).toFixed(2) + 's';
      s.style.animationDelay = (Math.random() * .8).toFixed(2) + 's';
      s.style.width = (5 + Math.random() * 6).toFixed(1) + 'px';
      s.style.height = (9 + Math.random() * 11).toFixed(1) + 'px';
      if (Math.random() < .38) s.style.borderRadius = '50%';
      box.appendChild(s);
      setTimeout(() => s.remove(), 6400);
    }
  }
  return { burst };
})();

/* ============================================================
   10. ① 开屏 · 信封
   ============================================================ */
const Envelope = (function envelope() {
  const env = $('#envelope'), hint = $('#openHint'), burstBox = $('#envBurst');
  const scene = $('#scene-open');
  let opened = false;

  function sparks() {
    const r = env.getBoundingClientRect();
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('i');
      const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 190;
      s.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--by', Math.sin(ang) * dist + 'px');
      s.style.animationDelay = (Math.random() * .12).toFixed(2) + 's';
      burstBox.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
    Petals.burst(r.left + r.width / 2, r.top + r.height * .58, 42);
    Petals.boost(1.6);
  }

  function open() {
    if (opened) return;
    opened = true;
    Sfx.resume(); Music.play(); Sfx.seal();
    sparks();
    env.classList.add('is-open');
    hint.style.opacity = '0';
    setTimeout(() => { env.classList.add('is-lift'); scene.classList.add('is-lifted'); }, 520);
    setTimeout(() => scene.classList.add('is-go'), 1450);
    setTimeout(() => Stage.go(1), 2050);
    setTimeout(() => {
      scene.classList.remove('is-go');
      env.classList.add('is-done');
      hint.textContent = '音乐已响起 · 右上角 ♪ 可以控制';
      hint.style.opacity = '';
    }, 3300);
  }
  env.addEventListener('click', open);
  addEventListener('keydown', e => {
    if (Stage.cur === 0 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); }
  });
  return {
    reset() {
      opened = false;
      scene.classList.remove('is-go', 'is-lifted');
      env.classList.remove('is-open', 'is-lift', 'is-done');
      hint.textContent = '轻触信封，开启这份心意';
      hint.style.opacity = '';
    }
  };
})();

/* ============================================================
   11. ③ 贰 · 心之所向（十二张插画演出）
   ============================================================ */
const Gallery = (() => {
  const stage = $('#galStage'), blur = $('#galBlur'), film = $('#galFilm');
  const nowEl = $('#galNow'), totalEl = $('#galTotal'), bar = $('#galBar');
  const slides = [], blurs = [], btns = [];
  let idx = 0, timer = null, t0 = 0, raf = null, active = false;

  totalEl.textContent = String(CFG.gallery.length).padStart(2, '0');

  CFG.gallery.forEach((src, i) => {
    const sl = document.createElement('div');
    sl.className = 'gal-slide';
    const im = document.createElement('img');
    im.src = src; im.alt = '他喜欢的图片 ' + (i + 1); im.loading = i < 3 ? 'eager' : 'lazy';
    im.addEventListener('click', e => { e.stopPropagation(); Lightbox.show(CFG.gallery, i); });
    sl.appendChild(im); stage.appendChild(sl); slides.push(sl);

    const bl = document.createElement('img');
    bl.src = src; bl.alt = ''; bl.loading = i < 3 ? 'eager' : 'lazy';
    blur.appendChild(bl); blurs.push(bl);

    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
    const t = document.createElement('img');
    t.src = CFG.thumbs[i]; t.alt = '';
    b.appendChild(t);
    b.addEventListener('click', () => { show(i); restart(); });
    film.appendChild(b); btns.push(b);
  });

  function show(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const on = k === idx;
      s.classList.toggle('on', on);
      if (on) {
        s.classList.remove('kb-a', 'kb-b');
        void s.offsetWidth;
        s.classList.add(idx % 2 ? 'kb-b' : 'kb-a');
      }
    });
    blurs.forEach((b, k) => b.classList.toggle('on', k === idx));
    btns.forEach((b, k) => b.classList.toggle('on', k === idx));
    nowEl.textContent = String(idx + 1).padStart(2, '0');
    btns[idx].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }
  function restart() {
    clearTimeout(timer); t0 = performance.now();
    if (active) timer = setTimeout(() => { Sfx.tick(); show(idx + 1); restart(); }, CFG.slideMs);
  }
  function loopBar() {
    if (!active) return;
    const p = Math.min(1, (performance.now() - t0) / CFG.slideMs);
    bar.style.width = (p * 100).toFixed(2) + '%';
    raf = requestAnimationFrame(loopBar);
  }
  $('#galZoom').addEventListener('click', () => Lightbox.show(CFG.gallery, idx));

  return {
    enter() {
      active = true;
      if (!slides[idx].classList.contains('on')) show(idx);
      bar.style.width = '0%';
      restart(); loopBar();
    },
    leave() {
      active = false; clearTimeout(timer);
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    },
    swipe(dir) { show(idx + dir); restart(); }
  };
})();
Stage.hook(2, Gallery);

/* ============================================================
   12. ⑤ 肆 · 许愿（蛋糕 · 蜡烛 · 小信封 · 纸飞机）
   ============================================================ */
const Wish = (() => {
  const row = $('#candleRow'), cake = $('#cake'), sparks = $('#cakeSparks');
  const halo = $('#candleHalo'), hint = $('#wishHint'), tip = $('#wcTip');
  const card = $('#wishCard'), input = $('#wishInput'), send = $('#wishSend'), skip = $('#wishSkip');
  const wrap = $('#planeWrap'), plane = $('#plane'), note = $('#planeNote');
  const trail = $('#trailPath'), trailSvg = $('#planeTrail'), flash = $('#flash');
  const echo = $('#wishEcho'), echoText = $('#wishEchoText');
  let lit = 0, candles = [], sent = false, flying = false, currentWish = '';

  trailSvg.removeAttribute('viewBox');

  /* ---- 愿望编码进链接：无需后端，TA 把链接发给你就能看到 ---- */
  function enc(s) {
    try {
      let bin = '';
      new TextEncoder().encode(s).forEach(b => bin += String.fromCharCode(b));
      return btoa(bin).replace(/=+$/, '');
    } catch (e) { return ''; }
  }
  function dec(s) {
    try {
      const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
      return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
    } catch (e) { return ''; }
  }
  function wishLink(text) {
    return location.origin + location.pathname + '#wish=' + enc(text);
  }

  /* ---- 把愿望送到你的邮箱 ---- */
  async function report(text) {
    const c = CFG.wish || {};
    let url = c.endpoint || '';
    if (!url && c.provider === 'formsubmit' && c.email) url = 'https://formsubmit.co/ajax/' + c.email;
    if (!url && c.provider === 'web3forms') url = 'https://api.web3forms.com/submit';
    if (!url && c.provider === 'formspree' && c.key) url = 'https://formspree.io/f/' + c.key;
    if (!url || !text) return 'local';

    const subject = '生日网站 · 鸥黑米许下的愿望';
    let body;
    if (/formsubmit/.test(url)) {
      // formsubmit：字段名照原样发过去，邮件里就是一张表
      body = { 愿望: text, message: text, wish: text, _subject: subject, _template: 'table', _captcha: 'false' };
    } else if (/web3forms/.test(url) || c.provider === 'web3forms') {
      body = { access_key: c.key, subject, from_name: '生日网站', 愿望: text, wish: text };
    } else {
      body = { wish: text, 愿望: text, _subject: subject };
    }
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      });
      return r.ok ? 'sent' : 'fail';
    } catch (e) { return 'fail'; }
  }

  function store(v) {
    try {
      localStorage.setItem('wish:last', v);
      const all = JSON.parse(localStorage.getItem('wish:all') || '[]');
      all.push({ t: v, at: new Date().toISOString() });
      localStorage.setItem('wish:all', JSON.stringify(all.slice(-20)));
    } catch (e) {}
  }
  function showEcho(v) {
    echo.hidden = false;
    echoText.textContent = v ? '「' + v + '」' : '（悄悄许下的愿望，已经风知道了）';
    echo.dataset.wish = v || '';
    const m = $('#wishMail');
    if (m) m.href = mailtoHref(v);
  }

  function build() {
    row.textContent = ''; candles = []; lit = 0;
    cake.classList.remove('lit-all');
    for (let i = 0; i < CFG.candles; i++) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'candle';
      b.setAttribute('aria-label', '点亮第 ' + (i + 1) + ' 根蜡烛');
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="flame"></span><span class="wick"></span>';
      b.addEventListener('click', () => light(b));
      row.appendChild(b); candles.push(b);
    }
    halo.style.setProperty('--lit', 0);
    hint.textContent = '点击蜡烛，把它点亮';
    hint.classList.remove('dim');
    card.classList.remove('show');
    tip.textContent = '愿望会随着纸飞机飞出窗外，也许会飘到我这里';
  }
  function sparkAt(el, n = 14) {
    const r = el.getBoundingClientRect(), box = sparks.getBoundingClientRect();
    const cx = r.left - box.left + r.width / 2, cy = r.top - box.top;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.style.left = cx + 'px'; s.style.top = cy + 'px';
      const ang = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.5;
      const dist = 22 + Math.random() * 64;
      s.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--by', Math.sin(ang) * dist + 'px');
      s.style.animationDelay = (Math.random() * .1).toFixed(2) + 's';
      sparks.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }
  }
  function light(el) {
    if (el.classList.contains('lit') || flying) return;
    el.classList.add('lit');
    el.setAttribute('aria-pressed', 'true');
    lit++;
    halo.style.setProperty('--lit', lit);
    sparkAt(el);
    Sfx.ignite();
    if (lit === candles.length) {
      setTimeout(() => {
        cake.classList.add('lit-all');
        hint.textContent = '许个愿吧';
        hint.classList.add('dim');
        card.classList.add('show');
        setTimeout(() => input.focus({ preventScroll: true }), 500);
      }, 620);
    }
  }
  /* --- 纸飞机航线 --- */
  function fly(text, startRect, dur = 2900) {
    if (flying) return; flying = true;
    const W = innerWidth, H = innerHeight;
    const start = startRect || card.getBoundingClientRect();
    const p0 = { x: start.left + start.width / 2, y: start.top + 24 };
    const p1 = { x: W * .28, y: H * .18 };
    const p2 = { x: W * .78, y: H * .30 };
    const p3 = { x: W + 120, y: -110 };
    const bez = t => {
      const u = 1 - t;
      return {
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
      };
    };
    note.textContent = text || '（悄悄许下的愿望）';
    wrap.classList.add('on');
    trail.setAttribute('d', '');
    plane.style.transform = 'translate3d(-999px,-999px,0)';
    const pts = [];
    const t0 = performance.now();
    (function tick(now) {
      const raw = Math.min(1, (now - t0) / dur);
      const t = 1 - Math.pow(1 - raw, 2.2);
      const a = bez(Math.max(0, t - .012)), b = bez(t);
      pts.push(`${b.x.toFixed(1)},${b.y.toFixed(1)}`);
      if (pts.length > 2) trail.setAttribute('d', 'M' + pts.join(' L'));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 29;
      const sc = 1 - t * .25;
      plane.style.transform = `translate3d(${(b.x - 33).toFixed(1)}px,${(b.y - 33).toFixed(1)}px,0) rotate(${ang.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
      if (raw < 1) requestAnimationFrame(tick);
      else {
        flash.classList.add('on');
        Confetti.burst(90);
        setTimeout(() => Stage.go(5, true), 620);
        setTimeout(() => {
          flash.classList.remove('on');
          wrap.classList.remove('on');
          plane.style.transform = 'translate3d(-999px,-999px,0)';
          trail.setAttribute('d', '');
          flying = false;
        }, 1700);
      }
    })(performance.now());
  }
  function finish(text) {
    if (sent) return;
    sent = true;
    const v = (text || '').trim();
    currentWish = v;
    const rect = card.getBoundingClientRect();
    card.classList.remove('show');
    Sfx.send();
    Petals.boost(2);
    setTimeout(() => fly(v, rect), 420);
    store(v);
    showEcho(v);
    try { history.replaceState(null, '', v ? '#wish=' + enc(v) : location.pathname); } catch (e) {}
    report(v).then(r => {
      if (r === 'sent') Toast.show('愿望已经寄到我这里了 · 谢谢你');
      else if (r === 'fail') Toast.show('网络不太顺，点「发邮件给我」也能送到');
      else if ((CFG.wish && CFG.wish.email)) Toast.show('愿望已记下 · 点「发邮件给我」就能送到我手里', 4200);
    });
  }
  send.addEventListener('click', () => finish(input.value));
  skip.addEventListener('click', () => finish(''));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finish(input.value); } });

  /* 复制愿望 / 发邮件 / 复制愿望链接 */
  $('#wishCopy').addEventListener('click', async () => {
    const v = echo.dataset.wish || currentWish;
    const txt = v ? '鸥黑米的愿望：' + v : '鸥黑米许了一个不能说出口的愿望';
    try { await navigator.clipboard.writeText(txt); Toast.show('愿望内容已复制'); }
    catch (e) { Toast.show('复制失败，可以长按选中文字'); }
  });
  /* 一键把愿望发到指定邮箱（无需任何第三方服务） */
  function mailtoHref(v) {
    const to = (CFG.wish && CFG.wish.email) || '';
    const subj = '生日网站 · 鸥黑米写下的愿望';
    const body = v
      ? 'TA 写下的愿望：' + v + '\n\n（这封来自生日网站的纸飞机）'
      : 'TA 没有写下文字，只是悄悄许了一个愿望。\n\n（这封来自生日网站的纸飞机）';
    return 'mailto:' + to + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
  }
  $('#wishMail').addEventListener('click', () => {
    $('#wishMail').href = mailtoHref(echo.dataset.wish || currentWish);
  });
  $('#wishMail').href = mailtoHref('');

  /* 打开带 #wish= 的链接：看到 TA 的愿望 */
  (function fromHash() {
    const m = /[#&]wish=([^&]+)/.exec(location.hash);
    if (!m) return;
    const v = dec(decodeURIComponent(m[1]));
    if (!v) return;
    currentWish = v; sent = true;
    showEcho(v);
    setTimeout(() => Toast.show('收到一个愿望：' + v, 6000), 1400);
  })();

  return {
    enter() {
      if (sent) { hint.textContent = '愿望已经寄出啦'; hint.classList.add('dim'); }
      else if (lit === 0) build();
    },
    reset() { sent = false; build(); }
  };
})();
Stage.hook(4, Wish);

/* ============================================================
   13. ⑥ 伍 · 予你（背景插画 + 祝福）
   ============================================================ */
const Final = (() => {
  const bg1 = $('#finalBg'), bg2 = $('#finalBg2'), frames = $('#floatFrames');
  const FRAMES = [0, 1, 2, 5, 7, 10];
  const POS = [
    { l: '1.5%', t: '13%', w: 'clamp(78px,9.6vw,142px)', r: '-7deg', d: '0s' },
    { l: '89.5%', t: '8%', w: 'clamp(70px,8.6vw,124px)', r: '7deg', d: '-3s' },
    { l: '2.5%', t: '63%', w: 'clamp(68px,8.2vw,118px)', r: '5deg', d: '-6s' },
    { l: '90%', t: '60%', w: 'clamp(76px,9.4vw,134px)', r: '-5deg', d: '-9s' },
    { l: '4.5%', t: '37%', w: 'clamp(60px,7vw,100px)', r: '9deg', d: '-12s' },
    { l: '91.5%', t: '34%', w: 'clamp(56px,6.6vw,94px)', r: '-9deg', d: '-15s' }
  ];
  /* 背景：十二张图铺成一块缓慢流动的柔和马赛克 */
  const ALL = CFG.gallery.map((_, i) => i);
  [[bg1, ALL], [bg2, [...ALL].reverse()]].forEach(([box, order]) => {
    order.forEach(i => {
      const im = document.createElement('img');
      im.src = CFG.gallery[i]; im.alt = ''; im.loading = 'lazy';
      box.appendChild(im);
    });
  });
  FRAMES.forEach((fi, i) => {
    const p = POS[i % POS.length];
    const d = document.createElement('div');
    d.className = 'ff';
    d.style.cssText = `left:${p.l};top:${p.t};width:${p.w};aspect-ratio:${i % 3 === 0 ? '3/4' : '1/1'};--r:${p.r};animation-delay:${p.d}`;
    const im = document.createElement('img');
    im.src = CFG.gallery[fi]; im.alt = ''; im.loading = 'lazy';
    d.appendChild(im);
    d.addEventListener('click', () => Lightbox.show(CFG.gallery, fi));
    frames.appendChild(d);
  });
  return {};
})();

/* ============================================================
   14. 收尾动作
   ============================================================ */
$('#replay').addEventListener('click', () => { Envelope.reset(); Stage.go(0); Toast.show('回到最初 · 那封信'); });
$('#replayWish').addEventListener('click', () => {
  $('#wishEcho').hidden = true;
  Wish.reset();
  Stage.go(4, true);
});

/* 聊天截图：点一下看大图 */
[['#device1', 'assets/img/p1.jpg', '我们的第一段对话'],
 ['#device2', 'assets/img/p2.jpg', '还是这段对话']].forEach(([sel, src, cap]) => {
  const el = $(sel);
  if (!el) return;
  const openLB = e => { e.stopPropagation(); Lightbox.show([{ src, cap }], 0); };
  el.addEventListener('click', openLB);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(e); }
  });
});

/* 进入最后一幕 → 彩带 + 樱花加浓 */
document.addEventListener('scene:change', e => {
  const i = e.detail.index;
  if (i === 5) { Petals.boost(1.4); setTimeout(() => Confetti.burst(150), 260); }
});

/* 点空白处 → 飘几片花瓣 */
addEventListener('click', e => {
  if (REDUCED || Lightbox.open) return;
  if (e.target.closest('button, a, input, .device, .gal-film, .ff, .lightbox')) return;
  Petals.burst(e.clientX, e.clientY, 7);
}, { passive: true });

/* ============================================================
   15. 滚轮切幕（鼠标滑轮下滑 = 下一幕，上滑 = 上一幕）
   ============================================================ */
(function wheelNav() {
  let lock = 0, acc = 0;
  addEventListener('wheel', e => {
    if (Lightbox.open) return;
    if (e.target.closest('.gal-film, .wc-input, .wish-card, .lightbox')) return;
    // 窄屏（手机）场景本身可滚动时交给原生滚动，不抢
    const sc = document.querySelector('.scene.is-active');
    if (window.matchMedia('(max-width:920px)').matches && sc && sc.scrollHeight > sc.clientHeight + 6) return;
    e.preventDefault();
    if (Date.now() < lock) { acc = 0; return; }
    acc += e.deltaY;
    if (Math.abs(acc) < 30) return;
    const dir = acc > 0 ? 1 : -1;
    acc = 0;
    lock = Date.now() + 800;
    Stage.go(Stage.cur + dir);
  }, { passive: false });
})();

/* ============================================================
   16. 触屏滑动切幕
   ============================================================ */
(function swipe() {
  let x0 = 0, y0 = 0, t0 = 0;
  addEventListener('touchstart', e => {
    const t = e.changedTouches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now();
  }, { passive: true });
  addEventListener('touchend', e => {
    if (Lightbox.open) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - x0, dy = t.clientY - y0;
    if (Date.now() - t0 > 700) return;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (e.target.closest('input, textarea, button, .gal-film, .wish-card, .device')) return;
    const dir = dx < 0 ? 1 : -1;
    if (Stage.cur === 2) { Gallery.swipe(dir); return; }
    Stage.go(Stage.cur + dir);
  }, { passive: true });
})();

/* ============================================================
   17. 开场加载
   ============================================================ */
(function loader() {
  const el = $('#loader'), bar = $('#ldBar'), pct = $('#ldPct');
  if (!el) return;
  const list = [...CFG.gallery, ...CFG.thumbs, 'assets/img/p1.jpg', 'assets/img/p2.jpg'];
  const total = list.length;
  let done = 0, hidden = false;
  const t0 = performance.now();

  function hide() {
    if (hidden) return;
    hidden = true;
    el.classList.add('gone');
    setTimeout(() => el.remove(), 900);
  }
  function tick() {
    done++;
    const p = Math.min(100, Math.round(done / total * 100));
    bar.style.width = p + '%';
    pct.textContent = p + '%';
    if (done >= total) setTimeout(hide, Math.max(0, 900 - (performance.now() - t0)));
  }
  list.forEach(src => {
    const im = new Image();
    im.onload = tick; im.onerror = tick;
    im.src = src;
  });
  setTimeout(hide, 7000);           // 兜底：网络再慢也不挡着
})();

/* ============================================================
   18. 启动
   ============================================================ */
splitText();
Fit.scrolls();
window.addEventListener('load', () => { Fit.scrolls(); });
setTimeout(Fit.scrolls, 600);
setTimeout(Fit.scrolls, 1800);
