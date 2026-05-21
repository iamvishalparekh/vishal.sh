/* cinematic-fx.js — wow on every scroll, click, and hover */
(function(){
  const T = window.THREE;

  /* ════════════ 1. STARFIELD BACKGROUND ════════════ */
  const starCanvas = document.getElementById('stars');
  if(starCanvas){
    const ctx = starCanvas.getContext('2d');
    let stars = [];
    function resizeStars(){
      starCanvas.width = innerWidth * devicePixelRatio;
      starCanvas.height = innerHeight * devicePixelRatio;
      starCanvas.style.width = innerWidth + 'px';
      starCanvas.style.height = innerHeight + 'px';
      ctx.scale(devicePixelRatio, devicePixelRatio);
      stars = Array.from({length: 180}, () => ({
        x: Math.random()*innerWidth,
        y: Math.random()*innerHeight,
        z: Math.random()*3 + 0.3,
        r: Math.random()*1.6 + 0.4,
        a: Math.random()*0.7 + 0.2,
        v: Math.random()*0.3 + 0.1,
      }));
    }
    resizeStars();
    addEventListener('resize', resizeStars);
    let scrollOff = 0;
    addEventListener('scroll', () => { scrollOff = scrollY * 0.05; });
    function tickStars(){
      ctx.clearRect(0,0,innerWidth,innerHeight);
      for(const s of stars){
        const y = (s.y - scrollOff*s.z) % innerHeight;
        const yy = y < 0 ? y + innerHeight : y;
        ctx.beginPath();
        ctx.arc(s.x, yy, s.r/s.z, 0, Math.PI*2);
        ctx.fillStyle = `rgba(200,220,255,${s.a/s.z})`;
        ctx.fill();
      }
      requestAnimationFrame(tickStars);
    }
    tickStars();
  }

  /* ════════════ 2. HERO 3D — ICOSAHEDRON + ORBITING TECH ════════════ */
  const heroHost = document.getElementById('hero-3d');
  if(heroHost && T){
    const W = () => heroHost.clientWidth;
    const H = () => heroHost.clientHeight;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, W()/H(), 0.1, 100);
    camera.position.z = 6;
    const renderer = new T.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);
    heroHost.appendChild(renderer.domElement);

    scene.add(new T.AmbientLight(0x6080ff, 0.4));
    const pl1 = new T.PointLight(0x22d3ee, 1.8, 30); pl1.position.set(5,4,5); scene.add(pl1);
    const pl2 = new T.PointLight(0xa78bfa, 1.2, 30); pl2.position.set(-5,-2,4); scene.add(pl2);
    const pl3 = new T.PointLight(0xfbbf24, 0.6, 30); pl3.position.set(0,-4,3); scene.add(pl3);

    // central icosahedron — wireframe + ghost filled
    const ico = new T.IcosahedronGeometry(1.6, 1);
    const wire = new T.Mesh(
      new T.IcosahedronGeometry(1.6, 1),
      new T.MeshBasicMaterial({ color:0x22d3ee, wireframe:true, transparent:true, opacity:0.6 })
    );
    const solid = new T.Mesh(
      ico,
      new T.MeshStandardMaterial({
        color:0x0a1124, transparent:true, opacity:0.5,
        emissive:0x1f3a5f, emissiveIntensity:0.6,
        metalness:0.4, roughness:0.3,
      })
    );
    const core = new T.Group();
    core.add(solid); core.add(wire);
    scene.add(core);

    // inner pulsing sphere
    const pulse = new T.Mesh(
      new T.SphereGeometry(0.7, 32, 32),
      new T.MeshBasicMaterial({ color:0xa78bfa, transparent:true, opacity:0.35 })
    );
    core.add(pulse);

    // orbiting tech moons
    const techs = ['java','kafka','redis','postgres','spring','k8s','aws','python'];
    const moons = [];
    techs.forEach((name, i) => {
      const angle = (i/techs.length) * Math.PI*2;
      const r = 3.2 + (i%2)*0.4;
      const moon = new T.Mesh(
        new T.SphereGeometry(0.12, 16, 16),
        new T.MeshStandardMaterial({
          color:0x22d3ee, emissive:0x22d3ee, emissiveIntensity:1.2
        })
      );
      moon.userData = { angle, r, speed:0.003 + (i%3)*0.001, tilt:(i%2)*0.3, name };
      scene.add(moon);
      moons.push(moon);
    });

    // particle ring (data streams)
    const partCount = 400;
    const partGeo = new T.BufferGeometry();
    const partPos = new Float32Array(partCount*3);
    const partOrig = [];
    for(let i=0;i<partCount;i++){
      const r = 2.0 + Math.random()*2.4;
      const a = Math.random()*Math.PI*2;
      const y = (Math.random()-0.5)*2;
      partOrig.push({r, a, y, s:0.002+Math.random()*0.008});
      partPos[i*3] = Math.cos(a)*r;
      partPos[i*3+1] = y;
      partPos[i*3+2] = Math.sin(a)*r;
    }
    partGeo.setAttribute('position', new T.BufferAttribute(partPos, 3));
    const particles = new T.Points(partGeo, new T.PointsMaterial({
      color:0xa78bfa, size:0.04, transparent:true, opacity:0.7,
      blending:T.AdditiveBlending,
    }));
    scene.add(particles);

    // drag rotate
    let dragging=false, lastX=0, lastY=0, yaw=0, pitch=0;
    let targetYaw=0, targetPitch=0;
    function onDown(e){ dragging=true; const t=e.touches?e.touches[0]:e; lastX=t.clientX; lastY=t.clientY; }
    function onMove(e){
      if(!dragging) return;
      const t=e.touches?e.touches[0]:e;
      targetYaw   += (t.clientX-lastX)*0.008;
      targetPitch += (t.clientY-lastY)*0.005;
      lastX=t.clientX; lastY=t.clientY;
    }
    function onUp(){ dragging=false; }
    renderer.domElement.addEventListener('mousedown', onDown);
    renderer.domElement.addEventListener('touchstart', onDown);
    addEventListener('mousemove', onMove);
    addEventListener('touchmove', onMove);
    addEventListener('mouseup', onUp);
    addEventListener('touchend', onUp);

    // mouse parallax (subtle when not dragging)
    let mx=0, my=0;
    addEventListener('mousemove', e => {
      mx = (e.clientX/innerWidth - 0.5);
      my = (e.clientY/innerHeight - 0.5);
    });

    // pulse on click anywhere
    let pulseT = 0;
    addEventListener('click', () => { pulseT = 1.0; });

    function onResize(){
      camera.aspect = W()/H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    }
    addEventListener('resize', onResize);

    let t = 0;
    function tick(){
      t += 0.016;
      // auto spin if no drag
      if(!dragging) targetYaw += 0.003;
      yaw   += (targetYaw - yaw)*0.08;
      pitch += (targetPitch - pitch)*0.08;
      core.rotation.y = yaw + mx*0.2;
      core.rotation.x = pitch + my*0.2;

      // pulse
      pulseT *= 0.95;
      const pscale = 1 + pulseT*0.3;
      pulse.scale.setScalar(1 + Math.sin(t*2)*0.04 + pulseT*0.5);
      pulse.material.opacity = 0.25 + Math.sin(t*1.5)*0.1 + pulseT*0.3;
      core.scale.setScalar(pscale);

      // moons orbit
      moons.forEach(m => {
        m.userData.angle += m.userData.speed;
        const a = m.userData.angle;
        m.position.x = Math.cos(a) * m.userData.r;
        m.position.z = Math.sin(a) * m.userData.r;
        m.position.y = Math.sin(a*1.3 + m.userData.tilt*3) * 0.7;
      });

      // particles drift
      const pp = partGeo.attributes.position.array;
      for(let i=0;i<partCount;i++){
        const o = partOrig[i];
        o.a += o.s;
        pp[i*3]   = Math.cos(o.a)*o.r;
        pp[i*3+1] = o.y + Math.sin(t + o.a*0.5)*0.3;
        pp[i*3+2] = Math.sin(o.a)*o.r;
      }
      partGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t*0.02;

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ════════════ 3. CLICK BURST PARTICLES (everywhere) ════════════ */
  const burstCanvas = document.getElementById('burst');
  if(burstCanvas){
    const ctx = burstCanvas.getContext('2d');
    function resizeBurst(){
      burstCanvas.width = innerWidth * devicePixelRatio;
      burstCanvas.height = innerHeight * devicePixelRatio;
      burstCanvas.style.width = innerWidth + 'px';
      burstCanvas.style.height = innerHeight + 'px';
    }
    resizeBurst();
    addEventListener('resize', resizeBurst);
    const parts = [];
    const COLORS = ['#22d3ee','#a78bfa','#fbbf24','#4ade80','#f472b6'];
    function burst(x, y, color){
      const c = color || COLORS[Math.floor(Math.random()*COLORS.length)];
      const px = x * devicePixelRatio;
      const py = y * devicePixelRatio;
      const n = 16 + Math.floor(Math.random()*8);
      for(let i=0;i<n;i++){
        const a = Math.random()*Math.PI*2;
        const s = (Math.random()*4 + 2) * devicePixelRatio;
        parts.push({
          x:px, y:py,
          vx: Math.cos(a)*s,
          vy: Math.sin(a)*s,
          r: (Math.random()*3 + 1.5) * devicePixelRatio,
          life: 1,
          color: c,
        });
      }
    }
    window.__vsBurst = burst;
    addEventListener('pointerdown', e => burst(e.clientX, e.clientY));
    function tickBurst(){
      ctx.clearRect(0,0,burstCanvas.width,burstCanvas.height);
      for(let i=parts.length-1;i>=0;i--){
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.15 * devicePixelRatio;
        p.vx *= 0.96; p.vy *= 0.96;
        p.life -= 0.025;
        if(p.life <= 0){ parts.splice(i,1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tickBurst);
    }
    tickBurst();
  }

  /* ════════════ 4. CURSOR TRAIL ════════════ */
  const trailCanvas = document.getElementById('trail');
  if(trailCanvas){
    const ctx = trailCanvas.getContext('2d');
    function resizeTrail(){
      trailCanvas.width = innerWidth * devicePixelRatio;
      trailCanvas.height = innerHeight * devicePixelRatio;
      trailCanvas.style.width = innerWidth + 'px';
      trailCanvas.style.height = innerHeight + 'px';
    }
    resizeTrail();
    addEventListener('resize', resizeTrail);
    const dots = [];
    addEventListener('pointermove', e => {
      dots.push({
        x: e.clientX*devicePixelRatio,
        y: e.clientY*devicePixelRatio,
        life: 1,
      });
      if(dots.length > 60) dots.shift();
    });
    function tickTrail(){
      ctx.clearRect(0,0,trailCanvas.width,trailCanvas.height);
      for(let i=dots.length-1;i>=0;i--){
        const d = dots[i];
        d.life -= 0.04;
        if(d.life<=0){ dots.splice(i,1); continue; }
        ctx.globalAlpha = d.life*0.7;
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(d.x, d.y, 4*d.life*devicePixelRatio, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tickTrail);
    }
    tickTrail();
  }

  /* ════════════ 5. SCROLL REVEAL ════════════ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ════════════ 6. COUNT-UP NUMBERS ════════════ */
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = (el.dataset.count.split('.')[1]||'').length;
        const dur = 1400;
        const start = performance.now();
        function step(now){
          const t = Math.min(1, (now-start)/dur);
          const eased = 1 - Math.pow(1-t, 3);
          el.textContent = (target*eased).toFixed(decimals) + suffix;
          if(t<1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countIo.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => countIo.observe(el));

  /* ════════════ 7. TIMELINE DOT PULSE ON SCROLL ════════════ */
  const tlIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) e.target.classList.add('lit');
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.tl-item').forEach(el => tlIo.observe(el));

  /* ════════════ 8. PROJECT 3D TILT ON HOVER ════════════ */
  document.querySelectorAll('.tilt').forEach(card => {
    let rx=0, ry=0;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - 0.5;
      const py = (e.clientY - r.top)/r.height - 0.5;
      ry = px * 12;
      rx = -py * 12;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
      const sh = card.querySelector('.shine');
      if(sh){
        sh.style.background = `radial-gradient(400px circle at ${(px+0.5)*100}% ${(py+0.5)*100}%, rgba(34,211,238,.15), transparent 50%)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      const sh = card.querySelector('.shine');
      if(sh) sh.style.background = '';
    });
  });

  /* ════════════ 9. SCROLL PROGRESS BAR ════════════ */
  const prog = document.getElementById('scroll-prog');
  if(prog){
    addEventListener('scroll', () => {
      const max = document.body.scrollHeight - innerHeight;
      const p = Math.min(1, Math.max(0, scrollY / max));
      prog.style.transform = `scaleX(${p})`;
    });
  }

  /* ════════════ 10. KONAMI + SECRETS TRACKER ════════════ */
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kI = 0;
  function unlock(name){
    const set = new Set(JSON.parse(localStorage.getItem('vs_secrets')||'[]'));
    if(set.has(name)) return false;
    set.add(name);
    localStorage.setItem('vs_secrets', JSON.stringify([...set]));
    document.dispatchEvent(new CustomEvent('vs:unlock', { detail: name }));
    confetti();
    return true;
  }
  window.__vsUnlock = unlock;
  window.__mfEgg = unlock; // shared name with games

  document.addEventListener('keydown', e => {
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) &&
       !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
    // skip when drive mode owns the arrow keys
    if(document.body.classList.contains('drive-mode')) return;
    const k = e.key.length===1 ? e.key.toLowerCase() : e.key;
    if(k===seq[kI]){ kI++; if(kI===seq.length){ kI=0; unlock('konami'); flashBanner('★ Konami unlocked'); }}
    else kI=0;
  });
  // visible konami buttons in secrets panel — clickable too
  document.querySelectorAll('[data-konami-step]').forEach((b, i) => {
    b.addEventListener('click', () => {
      const k = b.dataset.konamiStep;
      if(k===seq[kI]){ kI++;
        b.classList.add('hit');
        setTimeout(()=>b.classList.remove('hit'),400);
        if(kI===seq.length){ kI=0; unlock('konami'); flashBanner('★ Konami unlocked'); }
      } else { kI=0; }
    });
  });

  // detect devtools → unlock secret
  let dt=false;
  setInterval(()=>{
    const o = outerWidth - innerWidth > 160 || outerHeight - innerHeight > 160;
    if(o && !dt){ dt=true; unlock('devtools');
      console.log('%c👀 nice. you opened the console. try window.sayhi()',
        'color:#22d3ee;font-family:monospace');
    }
  }, 1500);

  /* ════════════ 11. CONFETTI ════════════ */
  function confetti(){
    const colors = ['#22d3ee','#a78bfa','#fbbf24','#4ade80','#f472b6','#ffffff'];
    for(let i=0;i<80;i++){
      const c = document.createElement('div');
      c.className = 'confetti-bit';
      c.style.left = (innerWidth/2 + (Math.random()-0.5)*60) + 'px';
      c.style.top = (innerHeight/2) + 'px';
      c.style.background = colors[Math.floor(Math.random()*colors.length)];
      const dx = (Math.random()-0.5) * innerWidth * 0.9;
      const dy = (Math.random()-0.8) * innerHeight;
      const rot = Math.random()*720 - 360;
      c.style.setProperty('--dx', dx + 'px');
      c.style.setProperty('--dy', dy + 'px');
      c.style.setProperty('--rot', rot + 'deg');
      document.body.appendChild(c);
      setTimeout(()=>c.remove(), 2200);
    }
  }
  window.__vsConfetti = confetti;

  /* ════════════ 12. FLASH BANNER ════════════ */
  function flashBanner(text){
    const b = document.getElementById('flash-banner');
    if(!b) return;
    b.textContent = text;
    b.classList.add('on');
    setTimeout(()=>b.classList.remove('on'), 2400);
  }
  window.__vsFlash = flashBanner;

  /* ════════════ 13. NAVIGATION ACTIVE STATE ════════════ */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = [...document.querySelectorAll('section[id]')];
  addEventListener('scroll', () => {
    const y = scrollY + 120;
    let active = sections[0]?.id;
    for(const s of sections) if(s.offsetTop <= y) active = s.id;
    navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#'+active));
  });

  /* ════════════ 14. CONSOLE PAYLOAD ════════════ */
  console.log('%c\n  ╭──────────────────────────────────╮\n' +
    '  │   vishal parekh · sainsbury\'s    │\n' +
    '  │   senior software engineer       │\n' +
    '  │   glasgow · backends · jvm        │\n' +
    '  ╰──────────────────────────────────╯\n',
    'color:#22d3ee;font-family:monospace;font-size:12px');
  console.log('%c→ try: %cwindow.sayhi()   window.coffee()   window.score()',
    'color:#6b7385;font-family:monospace',
    'color:#a78bfa;font-family:monospace');
  window.sayhi = () => {
    console.log('%c👋 say hi: hello@vishal.sh',
      'color:#4ade80;font-family:monospace');
    flashBanner('👋 message logged');
    return 'message logged';
  };
  window.coffee = () => { flashBanner('☕ coffee ordered'); return '☕'; };
  window.score  = () => +localStorage.getItem('mf_2048')||0;
})();
