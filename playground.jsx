/* mainframe-games.jsx — react games and puzzles */
const { useState, useEffect, useRef, useCallback } = React;

/* ────────────────────────── SQL PLAYGROUND ────────────────────────── */
const FAKE_DB = {
  experience: [
    {area:'event-driven microservices', years:6, fluency:'expert',      tooling:'kafka,kafka streams'},
    {area:'banking payments',           years:4, fluency:'advanced',    tooling:'spring boot,oracle'},
    {area:'retail e-commerce',          years:3, fluency:'expert',      tooling:'java,postgres,redis'},
    {area:'distributed caching',        years:5, fluency:'expert',      tooling:'redis,caffeine'},
    {area:'observability',              years:4, fluency:'comfortable', tooling:'opensearch,new relic'},
    {area:'ci/cd & iac',                years:4, fluency:'comfortable', tooling:'github actions,terraform'},
  ],
  skills: [
    {name:'java',years:7,fluency:'expert'},
    {name:'spring boot',years:7,fluency:'expert'},
    {name:'kafka',years:5,fluency:'expert'},
    {name:'redis',years:5,fluency:'advanced'},
    {name:'postgres',years:6,fluency:'expert'},
    {name:'dynamodb',years:3,fluency:'advanced'},
    {name:'mongodb',years:3,fluency:'advanced'},
    {name:'python',years:4,fluency:'advanced'},
    {name:'kubernetes',years:4,fluency:'advanced'},
    {name:'aws',years:5,fluency:'advanced'},
  ],
};

function runSQL(query) {
  const q = query.trim().replace(/;$/, '').toLowerCase();
  if(!q) return {err:'empty query'};
  if(q.startsWith('show tables')) {
    return {cols:['table'], rows:Object.keys(FAKE_DB).map(t=>[t])};
  }
  if(q.startsWith('describe ') || q.startsWith('desc ')) {
    const t = q.split(/\s+/)[1];
    if(!FAKE_DB[t]) return {err:`no such table: ${t}`};
    const cols = Object.keys(FAKE_DB[t][0]);
    return {cols:['column','type'], rows: cols.map(c=>[c, typeof FAKE_DB[t][0][c]])};
  }
  const m = q.match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+))?$/i);
  if(!m) return {err:'i only do SELECT * FROM <table> [WHERE col = value] · SHOW TABLES · DESCRIBE <table>'};
  const [, sel, table, where] = m;
  if(!FAKE_DB[table]) return {err:`no such table: ${table}`};
  let rows = FAKE_DB[table];
  if(where) {
    const wm = where.match(/(\w+)\s*=\s*'?([^']+?)'?$/);
    if(!wm) return {err:'WHERE must be: col = value'};
    const [, col, val] = wm;
    rows = rows.filter(r => String(r[col]) === val);
  }
  let cols;
  if(sel.trim()==='*') cols = Object.keys(rows[0]||FAKE_DB[table][0]);
  else cols = sel.split(',').map(s=>s.trim());
  return {cols, rows: rows.map(r=>cols.map(c=>r[c]))};
}

function SQL() {
  const [q,setQ] = useState("SELECT name, fluency FROM skills WHERE years > 5");
  const [res,setRes] = useState(null);
  const exec = () => setRes(runSQL(q));
  const userExec = () => {
    const r = runSQL(q);
    setRes(r);
    if(!r.err && window.__mfEgg) window.__mfEgg('sql');
  };
  useEffect(()=>{ exec(); },[]);
  return (
    <div className="panel">
      <div className="panel-head"><span className="dot d-amber"/>sql playground · pg-15-compat</div>
      <div className="panel-body">
        <textarea
          value={q} onChange={e=>setQ(e.target.value)}
          onKeyDown={e=>{ if((e.ctrlKey||e.metaKey)&&e.key==='Enter') userExec(); }}
          className="sql-input" rows={3} spellCheck={false}
        />
        <div className="row">
          <button className="btn" onClick={userExec}>EXECUTE <span className="kbd">⌘↵</span></button>
          <span className="dim">try: <code>SHOW TABLES</code> · <code>SELECT name, years FROM skills WHERE years &gt; 5</code> · <code>DESCRIBE skills</code></span>
        </div>
        <div className="sql-result">
          {res?.err && <div className="err">ERROR: {res.err}</div>}
          {res?.cols && (
            <table>
              <thead><tr>{res.cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {res.rows.length===0 && <tr><td colSpan={res.cols.length} className="dim">— 0 rows —</td></tr>}
                {res.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{String(v)}</td>)}</tr>)}
              </tbody>
            </table>
          )}
          {res?.cols && <div className="dim small">{res.rows.length} row{res.rows.length===1?'':'s'} · {(Math.random()*5+1).toFixed(2)}ms</div>}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── API EXPLORER ────────────────────────── */
const API_ROUTES = [
  {method:'GET', path:'/api/skills',     desc:'all the tools, grouped'},
  {method:'GET', path:'/api/experience', desc:"areas i've worked in"},
  {method:'GET', path:'/api/uptime',     desc:'how long this site has been up'},
  {method:'GET', path:'/api/status',     desc:"where i am, what i'm shipping"},
  {method:'GET', path:'/api/coffee',     desc:"order a coffee. 418, probably"},
];
function API() {
  const [route,setRoute] = useState(API_ROUTES[1]);
  const [body,setBody] = useState('');
  const [latency,setLatency] = useState(0);
  const send = useCallback(()=>{
    setBody('…');
    setTimeout(()=>{
      const lat = (Math.random()*6+3);
      setLatency(lat.toFixed(1));
      const data = {
        '/api/skills': {languages:['java','python','sql','bash'],frameworks:['spring boot','spring cloud'],messaging:['kafka','kafka streams','rabbitmq'],databases:['postgres','dynamodb','mongodb'],cache:['redis','caffeine'],platform:['docker','kubernetes','terraform'],cloud:['aws','azure'],observability:['opensearch','new relic','datadog']},
        '/api/experience': [
          {area:'event-driven microservices', years:6, fluency:'expert'},
          {area:'banking payments',           years:4, fluency:'advanced'},
          {area:'retail e-commerce',          years:3, fluency:'expert'},
          {area:'distributed caching',        years:5, fluency:'expert'},
          {area:'observability',              years:4, fluency:'comfortable'},
        ],
        '/api/uptime': {seconds: Math.floor((Date.now()-new Date('2019-01-01').getTime())/1000), region:'eu-west-2', status:'green'},
        '/api/status': {location:'glasgow, uk', company:"sainsbury's", role:'senior software engineer', focus:'event-driven backends', mode:'shipping'},
        '/api/coffee': {status:418, body:"i'm a teapot", preferred:'flat white'},
      }[route.path];
      setBody(JSON.stringify(data, null, 2));
    }, 200);
  },[route]);
  useEffect(()=>{ send(); },[route]);
  return (
    <div className="panel">
      <div className="panel-head"><span className="dot d-green"/>api explorer · backed by your hopes and dreams</div>
      <div className="panel-body api-grid">
        <div className="api-routes">
          {API_ROUTES.map(r=>(
            <button key={r.path} className={"api-route "+(r.path===route.path?'on':'')} onClick={()=>setRoute(r)}>
              <span className="meth">{r.method}</span> <span className="pth">{r.path}</span>
              <span className="dsc">{r.desc}</span>
            </button>
          ))}
        </div>
        <div className="api-response">
          <div className="api-bar">
            <span className="status">200 OK</span>
            <span className="dim">· {latency}ms · content-type: application/json</span>
            <button className="btn small" onClick={send}>↻ refetch</button>
          </div>
          <pre>{body}</pre>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── 2048 ────────────────────────── */
function game2048(){
  const empty = () => Array.from({length:4},()=>Array(4).fill(0));
  const add = b => {
    const cells = []; for(let i=0;i<4;i++)for(let j=0;j<4;j++)if(!b[i][j])cells.push([i,j]);
    if(!cells.length) return b;
    const [r,c] = cells[Math.floor(Math.random()*cells.length)];
    b[r][c] = Math.random()<0.9?2:4; return b;
  };
  const rotate = b => b[0].map((_,i)=>b.map(r=>r[3-i]));
  const slide = row => {
    const r = row.filter(x=>x);
    for(let i=0;i<r.length-1;i++) if(r[i]===r[i+1]){ r[i]*=2; r[i+1]=0; }
    return r.filter(x=>x).concat(Array(4-r.filter(x=>x).length).fill(0));
  };
  const move = (b, dir) => {
    let g = b.map(r=>[...r]);
    for(let i=0;i<dir;i++) g = rotate(g);
    g = g.map(slide);
    for(let i=0;i<(4-dir)%4;i++) g = rotate(g);
    return g;
  };
  const eq = (a,b) => a.flat().join() === b.flat().join();
  return { empty, add, move, eq };
}
function Game2048(){
  const g = useRef(game2048()).current;
  const [board,setBoard] = useState(()=>g.add(g.add(g.empty())));
  const [score,setScore] = useState(0);
  const [best,setBest] = useState(()=>+localStorage.getItem('mf_2048')||0);
  const [board2,setBoard2] = useState(null); // dummy for leaderboard refresh
  const [leaders,setLeaders] = useState(()=>JSON.parse(localStorage.getItem('mf_2048_board')||'[]'));
  const handle = useCallback(dir=>{
    setBoard(prev=>{
      const next = g.move(prev,dir);
      if(g.eq(prev,next)) return prev;
      let s = 0; for(const r of next) for(const v of r) s+=v;
      setScore(s);
      if(s>best){ setBest(s); localStorage.setItem('mf_2048', s); }
      if(s>0 && window.__mfEgg) window.__mfEgg('2048');
      return g.add(next);
    });
  },[g,best]);
  const saveScore = () => {
    if(score<=0) return;
    const name = (localStorage.getItem('mf_guest_name') || prompt('your handle for the leaderboard?', 'player') || 'anon').slice(0,16);
    const next = [...leaders, {name, score, at:Date.now()}]
      .sort((a,b)=>b.score-a.score).slice(0,5);
    setLeaders(next); localStorage.setItem('mf_2048_board', JSON.stringify(next));
    localStorage.setItem('mf_guest_name', name);
    window.__vsFlash && window.__vsFlash(`✓ saved ${score} to leaderboard`);
  };
  useEffect(()=>{
    const k = e => {
      const map = {ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3,h:0,k:1,l:2,j:3,a:0,w:1,d:2,s:3};
      const dir = map[e.key];
      if(dir!==undefined){ e.preventDefault(); handle(dir); }
    };
    window.addEventListener('keydown',k); return ()=>window.removeEventListener('keydown',k);
  },[handle]);
  const colors = {0:'#0d1410',2:'#0e2018',4:'#10301f',8:'#124426',16:'#16542c',32:'#1c6532',64:'#266f37',128:'#357a3d',256:'#4a8546',512:'#669049',1024:'#869a4f',2048:'#a8a056'};
  return (
    <div className="panel">
      <div className="panel-head"><span className="dot d-amber"/>play · 2048 · arrows or hjkl</div>
      <div className="panel-body">
        <div className="row" style={{justifyContent:'space-between',marginBottom:12}}>
          <div className="dim">score <span className="c-amber" style={{fontWeight:700}}>{score}</span></div>
          <div className="dim">best <span className="c-amber" style={{fontWeight:700}}>{best}</span></div>
          <button className="btn small" onClick={()=>{ setBoard(g.add(g.add(g.empty()))); setScore(0); }}>NEW GAME</button>
        </div>
        <div className="g2048-wrap">
          <div className="grid2048">
            {board.flat().map((v,i)=>(
              <div key={i} className="cell2048" style={{background:colors[v]||'#a8a056',color:v>4?'#0a0e0a':'#4ade80'}}>{v||''}</div>
            ))}
          </div>
          <div className="leaderboard">
            <div className="lb-head">★ TOP SCORES</div>
            {leaders.length===0 && <div className="lb-empty">no scores yet. be the first.</div>}
            {leaders.map((l,i)=>(
              <div className="lb-row" key={i}>
                <span className="lb-rank">{i+1}</span>
                <span className="lb-name">{l.name}</span>
                <span className="lb-score">{l.score}</span>
              </div>
            ))}
            <button className="btn small" style={{marginTop:10,width:'100%'}} onClick={saveScore} disabled={!score}>SAVE MY SCORE</button>
          </div>
        </div>
        <div className="dim small" style={{marginTop:8}}>arrows or hjkl · reach 2048 to unlock the secret.</div>
      </div>
    </div>
  );
}

/* ────────────────────────── REGEX GOLF ────────────────────────── */
const REGEX_LEVELS = [
  {title:'match all the service names', match:['payments','orders','inventory'], skip:['paymental','order_v2','log']},
  {title:'must end with .java', match:['Main.java','User.java','Cache.java'], skip:['Main.kt','main.py','java']},
  {title:'kafka topic naming (lowercase, dots, no leading dot)', match:['user.created','order.placed','cart.updated'], skip:['.user.created','User.Created','UPPER.x']},
  {title:'valid http status codes (200-299)', match:['200','204','299','250'], skip:['100','300','404','2','2000']},
];
function RegexGolf(){
  const [lvl,setLvl] = useState(0);
  const [pat,setPat] = useState('');
  const [err,setErr] = useState('');
  const L = REGEX_LEVELS[lvl];
  let re=null;
  try{ if(pat) re = new RegExp(pat); } catch(e){ /* invalid */ }
  const test = (s)=>{ try{ return re ? re.test(s) : false; }catch{ return false; } };
  const okMatch = L.match.every(test);
  const okSkip  = L.skip.every(s=>!test(s));
  const win = okMatch && okSkip && pat;
  useEffect(()=>{ if(win && lvl===REGEX_LEVELS.length-1) window.__mfEgg && window.__mfEgg('regex'); },[win,lvl]);
  return (
    <div className="panel">
      <div className="panel-head"><span className="dot d-green"/>play · regex golf · level {lvl+1}/{REGEX_LEVELS.length}</div>
      <div className="panel-body">
        <div className="rg-title">▸ {L.title}</div>
        <input className="rg-input" value={pat} onChange={e=>setPat(e.target.value)} placeholder="/your_pattern_here/" />
        <div className="rg-grid">
          <div>
            <div className="dim small">must match</div>
            {L.match.map(s=>(
              <div key={s} className={"rg-row "+(test(s)?'ok':'no')}>{test(s)?'✓':'✗'} <code>{s}</code></div>
            ))}
          </div>
          <div>
            <div className="dim small">must NOT match</div>
            {L.skip.map(s=>(
              <div key={s} className={"rg-row "+(!test(s)?'ok':'no')}>{!test(s)?'✓':'✗'} <code>{s}</code></div>
            ))}
          </div>
        </div>
        {win && <div className="rg-win">solved.
          {lvl<REGEX_LEVELS.length-1
            ? <button className="btn small" onClick={()=>{setLvl(lvl+1); setPat('');}}>NEXT LEVEL →</button>
            : <span className="c-amber"> all 4 cleared. easter egg unlocked.</span>}
        </div>}
      </div>
    </div>
  );
}

/* ────────────────────────── BIG-O QUIZ ────────────────────────── */
const BIGO_Q = [
  {q:'time complexity of binary search on sorted array',          options:['O(1)','O(log n)','O(n)','O(n log n)'],a:1},
  {q:'time complexity of inserting at the head of a linked list', options:['O(1)','O(log n)','O(n)','O(n²)'],   a:0},
  {q:'space complexity of merge sort (typical)',                   options:['O(1)','O(log n)','O(n)','O(n²)'],   a:2},
  {q:'amortized lookup in a hash map (good hash)',                 options:['O(1)','O(log n)','O(n)','O(n²)'],   a:0},
  {q:'time to find min in a balanced BST',                         options:['O(1)','O(log n)','O(n)','O(n²)'],   a:1},
];
function BigO(){
  const [i,setI] = useState(0);
  const [score,setScore] = useState(0);
  const [picked,setPicked] = useState(null);
  const Q = BIGO_Q[i];
  const done = i>=BIGO_Q.length;
  useEffect(()=>{ if(done && score===BIGO_Q.length) window.__mfEgg && window.__mfEgg('bigo'); },[done,score]);
  if(done) return (
    <div className="panel">
      <div className="panel-head"><span className="dot d-amber"/>quiz · result</div>
      <div className="panel-body" style={{textAlign:'center',padding:'40px 24px'}}>
        <div style={{fontSize:48,fontWeight:700,marginBottom:8}} className={score===BIGO_Q.length?'c-amber':''}>{score}/{BIGO_Q.length}</div>
        <div className="dim">{score===BIGO_Q.length?'perfect. you may proceed to staff.':score>=3?'not bad. read CLRS again.':'we need to talk.'}</div>
        <button className="btn small" style={{marginTop:14}} onClick={()=>{setI(0);setScore(0);setPicked(null);}}>RETRY</button>
      </div>
    </div>
  );
  return (
    <div className="panel">
      <div className="panel-head"><span className="dot d-green"/>quiz · big-O · {i+1}/{BIGO_Q.length}</div>
      <div className="panel-body">
        <div className="quiz-q">▸ {Q.q}</div>
        <div className="quiz-opts">
          {Q.options.map((o,oi)=>{
            let cls = '';
            if(picked!==null){
              if(oi===Q.a) cls='ok';
              else if(oi===picked) cls='no';
            }
            return <button key={oi} className={"quiz-opt "+cls} disabled={picked!==null} onClick={()=>{
              setPicked(oi);
              if(oi===Q.a) setScore(s=>s+1);
              setTimeout(()=>{ setI(i+1); setPicked(null); }, 700);
            }}>{String.fromCharCode(65+oi)}. {o}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── GUESTBOOK (ghost cursors) ────────────────────────── */
const FAKE_NAMES = ['ada','linus','margaret','grace','dennis','barbara','tim','rasmus','rich','brian'];
const FAKE_MSGS = [
  'reading this from a plane',
  'okay this is sick',
  'the konami code on a personal site? in 2026?',
  'how is the terminal real',
  'sending this to my cto',
  'just typed `sudo rm -rf /` and survived',
  'why does this load in 14ms',
  'i fix bugs for a living and i can\'t find any',
];
function Guestbook(){
  const [msgs,setMsgs] = useState(()=>{
    const stored = JSON.parse(localStorage.getItem('mf_guest')||'[]');
    if(stored.length) return stored;
    return Array.from({length:6},(_,i)=>({
      name: FAKE_NAMES[i],
      msg: FAKE_MSGS[i],
      at: Date.now() - (i+1)*1000*60*Math.floor(Math.random()*60),
    }));
  });
  const [name,setName] = useState(localStorage.getItem('mf_guest_name')||'');
  const [msg,setMsg] = useState('');
  const submit = () => {
    if(!name.trim()||!msg.trim()) return;
    const entry = {name:name.trim().slice(0,24), msg:msg.trim().slice(0,140), at:Date.now()};
    const next = [entry, ...msgs].slice(0,30);
    setMsgs(next); localStorage.setItem('mf_guest',JSON.stringify(next));
    localStorage.setItem('mf_guest_name',name);
    setMsg('');
  };
  const ago = ms => {
    const s = Math.floor((Date.now()-ms)/1000);
    if(s<60) return s+'s ago';
    if(s<3600) return Math.floor(s/60)+'m ago';
    if(s<86400) return Math.floor(s/3600)+'h ago';
    return Math.floor(s/86400)+'d ago';
  };
  return (
    <div className="panel">
      <div className="panel-head"><span className="dot d-amber"/>guestbook · {msgs.length} visitors signed</div>
      <div className="panel-body">
        <div className="gb-form">
          <input placeholder="handle"  value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder="say something nice (or don't)" value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} />
          <button className="btn small" onClick={submit}>SIGN</button>
        </div>
        <div className="gb-list">
          {msgs.map((m,i)=>(
            <div className="gb-item" key={i}>
              <span className="c-green">{m.name}</span>
              <span className="dim small"> · {ago(m.at)}</span>
              <div className="gb-msg">{m.msg}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── EGG TRACKER ────────────────────────── */
function EggTracker(){
  const [eggs,setEggs] = useState(()=>JSON.parse(localStorage.getItem('mf_eggs')||'[]'));
  useEffect(()=>{
    const handler = () => setEggs(JSON.parse(localStorage.getItem('mf_eggs')||'[]'));
    window.addEventListener('mf:egg', handler);
    return () => window.removeEventListener('mf:egg', handler);
  },[]);
  const all = ['konami','motd','sql','matrix','2048','regex','bigo'];
  return (
    <div className="egg-track">
      <div className="dim small">easter eggs <span className="c-amber">{eggs.length}/{all.length}</span></div>
      <div className="egg-dots">
        {all.map(n=>(
          <span key={n} title={n} className={"egg-dot "+(eggs.includes(n)?'on':'')}>{eggs.includes(n)?'★':'·'}</span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SQL, API, Game2048, RegexGolf, BigO, Guestbook, EggTracker });
