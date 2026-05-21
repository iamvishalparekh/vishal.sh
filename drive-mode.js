/* drive-mode.js — drivable car with collectible tech logos */
(function(){
  // build overlay markup
  const overlay = document.createElement('div');
  overlay.id = 'drive-overlay';
  overlay.innerHTML = `
    <div id="drive-vignette"></div>
    <div id="drive-hud">
      <div class="hud-title"><span class="emoji">🚗</span> DRIVE MODE</div>
      <div class="hud-stats">
        <span class="hud-stat">RUN <b id="drive-score">0</b></span>
        <span class="hud-stat">BEST <b id="drive-best">0</b></span>
      </div>
      <div class="hud-keys">WASD / arrows · ESC to exit</div>
    </div>
    <div id="drive-items"></div>
    <svg id="car-svg" viewBox="0 0 40 60" width="44" height="66">
      <defs>
        <linearGradient id="carBody" x1="0" x2="1">
          <stop offset="0%" stop-color="#22d3ee"/>
          <stop offset="100%" stop-color="#a78bfa"/>
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="28" height="40" rx="6" fill="url(#carBody)" stroke="#04060c" stroke-width="2"/>
      <rect x="2" y="14" width="6" height="10" rx="1.5" fill="#04060c"/>
      <rect x="32" y="14" width="6" height="10" rx="1.5" fill="#04060c"/>
      <rect x="2" y="36" width="6" height="10" rx="1.5" fill="#04060c"/>
      <rect x="32" y="36" width="6" height="10" rx="1.5" fill="#04060c"/>
      <rect x="9" y="14" width="22" height="9" fill="#04060c" opacity="0.85" rx="2"/>
      <rect x="9" y="37" width="22" height="9" fill="#04060c" opacity="0.85" rx="2"/>
      <circle cx="11" cy="11" r="1.8" fill="#fbbf24"/>
      <circle cx="29" cy="11" r="1.8" fill="#fbbf24"/>
      <circle cx="11" cy="49" r="1.6" fill="#f87171"/>
      <circle cx="29" cy="49" r="1.6" fill="#f87171"/>
    </svg>
    <div id="drive-pad">
      <div class="pad-row"><button class="pad" data-dir="w">▲</button></div>
      <div class="pad-row">
        <button class="pad" data-dir="a">◀</button>
        <button class="pad" data-dir="s">▼</button>
        <button class="pad" data-dir="d">▶</button>
      </div>
    </div>
    <button id="drive-exit">✕ EXIT</button>
  `;
  document.body.appendChild(overlay);

  // floating start button (always visible)
  const startBtn = document.createElement('button');
  startBtn.id = 'drive-start';
  startBtn.innerHTML = `<span class="emoji">🚗</span> Drive`;
  document.body.appendChild(startBtn);

  const carEl = document.getElementById('car-svg');
  const scoreEl = document.getElementById('drive-score');
  const bestEl = document.getElementById('drive-best');
  const itemsEl = document.getElementById('drive-items');

  const ITEMS = [
    {key:'JAVA',  c:'#f89820', full:'Java'},
    {key:'KFKA',  c:'#231f3a', full:'Kafka'},
    {key:'RDS',   c:'#dc382c', full:'Redis'},
    {key:'PG',    c:'#336791', full:'Postgres'},
    {key:'K8s',   c:'#326ce5', full:'Kubernetes'},
    {key:'AWS',   c:'#ff9900', full:'AWS'},
    {key:'SPR',   c:'#6db33f', full:'Spring'},
    {key:'DKR',   c:'#2496ed', full:'Docker'},
    {key:'DDB',   c:'#4053d6', full:'DynamoDB'},
    {key:'NR',    c:'#70c8a3', full:'New Relic'},
  ];

  let driveMode = false;
  let car = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI/2 };
  let items = [];
  let score = 0;
  let best = +localStorage.getItem('drive_best') || 0;
  const keys = {};
  let savedScroll = 0;
  bestEl.textContent = best;

  // pick a viewport-safe random position
  function randomPos(){
    return {
      x: 80 + Math.random()*(innerWidth - 160),
      y: 120 + Math.random()*(innerHeight - 240),
    };
  }

  function spawnItems(){
    itemsEl.innerHTML = '';
    items = ITEMS.map(t => {
      const p = randomPos();
      const el = document.createElement('div');
      el.className = 'drive-item';
      el.style.background = t.c;
      el.style.color = '#fff';
      el.style.boxShadow = `0 0 24px ${t.c}, 0 0 60px ${t.c}66`;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.innerHTML = `<span class="dk">${t.key}</span><span class="df">${t.full}</span>`;
      itemsEl.appendChild(el);
      return { ...t, x:p.x, y:p.y, el };
    });
  }

  function respawn(item){
    const p = randomPos();
    item.x = p.x; item.y = p.y;
    item.el.style.left = p.x + 'px';
    item.el.style.top = p.y + 'px';
    item.el.classList.remove('grabbed');
    item.el.style.opacity = 1;
  }

  function enterDrive(){
    if(driveMode) return;
    driveMode = true;
    savedScroll = scrollY;
    document.body.classList.add('drive-mode');
    car.x = innerWidth/2; car.y = innerHeight/2;
    car.vx = car.vy = 0; car.angle = -Math.PI/2;
    score = 0; scoreEl.textContent = 0;
    spawnItems();
    if(window.__vsFlash) window.__vsFlash('🚗 use WASD or arrows · collect the logos');
    if(window.__vsUnlock) window.__vsUnlock('drive');
  }
  function exitDrive(){
    if(!driveMode) return;
    driveMode = false;
    document.body.classList.remove('drive-mode');
    window.scrollTo(0, savedScroll);
  }
  startBtn.addEventListener('click', enterDrive);
  document.getElementById('drive-exit').addEventListener('click', exitDrive);
  // any [data-drive] element activates it
  document.addEventListener('click', e => {
    if(e.target.closest('[data-drive]')) enterDrive();
  });

  // keyboard
  addEventListener('keydown', e => {
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if(e.key === '/' && !driveMode){ e.preventDefault(); enterDrive(); return; }
    if(e.key === 'Escape' && driveMode){ e.preventDefault(); exitDrive(); return; }
    if(driveMode){
      const k = e.key.toLowerCase();
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){
        e.preventDefault();
        keys[k] = true;
      }
    }
  });
  addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
  });
  addEventListener('blur', () => { for(const k in keys) keys[k] = false; });

  // touch d-pad
  document.querySelectorAll('#drive-pad .pad').forEach(b => {
    const dir = b.dataset.dir;
    const press = () => keys[dir] = true;
    const release = () => keys[dir] = false;
    b.addEventListener('touchstart', e => { e.preventDefault(); press(); });
    b.addEventListener('touchend',   e => { e.preventDefault(); release(); });
    b.addEventListener('mousedown',  press);
    b.addEventListener('mouseup',    release);
    b.addEventListener('mouseleave', release);
  });

  // physics loop
  function tick(){
    if(driveMode){
      const ACCEL = 0.35, TURN = 0.055, MAX_V = 9, FRIC = 0.93;
      const fwd = keys.w || keys.arrowup;
      const back = keys.s || keys.arrowdown;
      const left = keys.a || keys.arrowleft;
      const right = keys.d || keys.arrowright;
      if(fwd){
        car.vx += Math.cos(car.angle) * ACCEL;
        car.vy += Math.sin(car.angle) * ACCEL;
      }
      if(back){
        car.vx -= Math.cos(car.angle) * ACCEL * 0.6;
        car.vy -= Math.sin(car.angle) * ACCEL * 0.6;
      }
      // turning is more effective when moving
      const speed = Math.hypot(car.vx, car.vy);
      const turnMod = Math.min(1, speed/3);
      if(left)  car.angle -= TURN * (0.4 + turnMod*0.6);
      if(right) car.angle += TURN * (0.4 + turnMod*0.6);
      car.vx *= FRIC; car.vy *= FRIC;
      const sp = Math.hypot(car.vx, car.vy);
      if(sp > MAX_V){ car.vx *= MAX_V/sp; car.vy *= MAX_V/sp; }
      car.x += car.vx; car.y += car.vy;
      // wrap
      if(car.x < -30) car.x = innerWidth+30;
      if(car.x > innerWidth+30) car.x = -30;
      if(car.y < -30) car.y = innerHeight+30;
      if(car.y > innerHeight+30) car.y = -30;
      // render
      carEl.style.transform =
        `translate(${car.x-22}px, ${car.y-33}px) rotate(${car.angle + Math.PI/2}rad)`;
      // collisions
      items.forEach(it => {
        if(it.el.classList.contains('grabbed')) return;
        const d = Math.hypot(car.x - (it.x+25), car.y - (it.y+25));
        if(d < 36){
          it.el.classList.add('grabbed');
          score++;
          scoreEl.textContent = score;
          if(score > best){ best = score; localStorage.setItem('drive_best', best); bestEl.textContent = best; }
          // burst at item
          if(window.__vsBurst) window.__vsBurst(it.x+25, it.y+25, it.c);
          setTimeout(()=>respawn(it), 1200);
        }
      });
    }
    requestAnimationFrame(tick);
  }
  tick();

  // resize: respawn items if too far off
  addEventListener('resize', () => {
    if(driveMode) items.forEach(it => {
      if(it.x > innerWidth || it.y > innerHeight) respawn(it);
    });
  });

  // expose
  window.__drive = { enter: enterDrive, exit: exitDrive };
})();
