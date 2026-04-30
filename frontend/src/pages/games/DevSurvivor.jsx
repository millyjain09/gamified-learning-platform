import { useState, useEffect, useRef, useCallback } from "react";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Share+Tech+Mono&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0e0b07}

    @keyframes flicker{0%,100%{opacity:1}92%{opacity:.96}94%{opacity:.82}96%{opacity:.97}}
    @keyframes nodeUnlock{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
    @keyframes wrongShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
    @keyframes hpDrain{0%,100%{filter:brightness(1)}50%{filter:brightness(1.8) saturate(2)}}
    @keyframes xpFloat{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-50px);opacity:0}}
    @keyframes correctFlash{0%,100%{background:#0e0b07}50%{background:#0a1a08}}
    @keyframes wrongFlash{0%,100%{background:#0e0b07}50%{background:#1a0805}}
    @keyframes breathe{0%,100%{box-shadow:0 0 8px #c8a45440}50%{box-shadow:0 0 22px #c8a454a0}}
    @keyframes comingSoon{0%,100%{opacity:.4}50%{opacity:.9}}
    @keyframes popIn{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
    @keyframes slideUp{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes campfire{0%,100%{text-shadow:0 0 8px #f97316,0 0 16px #ea580c}50%{text-shadow:0 0 18px #fbbf24,0 0 32px #f97316}}
    @keyframes hpShake{0%,100%{transform:translateX(0)}30%{transform:translateX(-4px)}70%{transform:translateX(4px)}}
    @keyframes scanH{from{top:0}to{top:100%}}

    .ds-root{font-family:'Share Tech Mono',monospace;background:#0e0b07;color:#d4b896;min-height:100vh;position:relative;overflow-x:hidden}
    .title-font{font-family:'Cinzel',serif}
    .scanH{position:fixed;top:0;left:0;width:100%;height:2px;background:linear-gradient(transparent,#c8a45418,transparent);animation:scanH 8s linear infinite;pointer-events:none;z-index:999}

    .map-node{cursor:pointer;transition:transform .18s}
    .map-node:hover .node-ring{filter:brightness(1.4)}
    .node-ring{transition:all .2s}

    .code-area{background:#0a0805;border:2px solid #3d2e1a;border-radius:4px;color:#c8b483;font-family:'Share Tech Mono',monospace;font-size:13px;outline:none;padding:12px;resize:none;width:100%;transition:border-color .2s;line-height:1.6}
    .code-area:focus{border-color:#c8a454;box-shadow:0 0 0 2px #c8a45418}
    .code-area.wrong{border-color:#ef4444!important;animation:wrongShake .35s ease-out}

    .btn-attack{background:linear-gradient(135deg,#7c2d12,#9a3412);border:2px solid #ea580c;border-radius:4px;color:#fed7aa;font-family:'Share Tech Mono',monospace;font-size:13px;font-weight:600;padding:11px 0;cursor:pointer;transition:all .15s;letter-spacing:.06em;text-transform:uppercase;width:100%}
    .btn-attack:hover{background:linear-gradient(135deg,#9a3412,#b45309);border-color:#f97316;box-shadow:0 0 16px #ea580c40}
    .btn-attack:active{transform:scale(.97)}
    .btn-attack:disabled{opacity:.35;cursor:not-allowed}
    .btn-ghost{background:transparent;border:1.5px solid #3d2e1a;border-radius:4px;color:#8b6f4e;font-family:'Share Tech Mono',monospace;font-size:12px;padding:8px 16px;cursor:pointer;transition:all .15s}
    .btn-ghost:hover{border-color:#6b4f30;color:#c8a454}

    .hp-fill{height:100%;border-radius:2px;transition:width .5s,background .4s}
  `}</style>
);

// keywords: what user MUST add (not present in starter)
// starterBlock: the starter code shown
// solution_keywords: strings that must appear in the user's ADDED code (not in starter)
// We validate by checking if keywords appear in the code AND the code differs from starter enough
const LEVELS = [
  { id:1,  zone:1, title:"First Signal",       boss:false,
    task:"A broken radio button. Replace <div> with a proper clickable <button> element.",
    starter:"// Fix: render a clickable button\nreturn (\n  <div>Click me</div>\n);",
    // user must write "button" and remove the div — check code contains button but not the original broken div
    validate: (code) => code.includes("<button") && !code.includes("<div>Click me</div>"),
    xp:20, coins:5, hp_loss:15,
    hint:"Replace <div>Click me</div> with <button>Click me</button>" },

  { id:2,  zone:1, title:"Lost Frequency",     boss:false,
    task:"Survivors need a text input. Add <input type='text' /> after the label.",
    starter:"// Add a text input below the label\nreturn (\n  <label>Message:</label>\n);",
    validate: (code) => code.includes("input") && code.includes("text"),
    xp:25, coins:5, hp_loss:15,
    hint:"Add <input type='text' /> after the </label> tag." },

  { id:3,  zone:1, title:"Secret Vault",       boss:false,
    task:"Password field needed. Add an <input type='password' /> inside the form.",
    starter:"// Add a password input\nreturn (\n  <form></form>\n);",
    validate: (code) => code.includes("password") && code.includes("input"),
    xp:25, coins:5, hp_loss:15,
    hint:"<input type='password' /> goes inside <form>...</form>" },

  { id:4,  zone:1, title:"The Checkpoint",     boss:false,
    task:"Track survivor count with React state. Declare useState and show the count.",
    starter:"// Add useState to track count\nfunction Counter() {\n  // state here\n  return <div>0</div>;\n}",
    validate: (code) => code.includes("useState") && code.includes("count") && !code.includes("// state here"),
    xp:30, coins:8, hp_loss:20,
    hint:"const [count, setCount] = useState(0); — then show {count} in the div" },

  { id:5,  zone:1, title:"ZONE BOSS: Glitch",  boss:true,
    task:"Button click does nothing! Wire up the onClick handler to call trigger().",
    starter:"function AlarmBtn() {\n  function trigger() {\n    alert('Alarm!');\n  }\n  return <button>Sound Alarm</button>;\n}",
    validate: (code) => code.includes("onClick") && code.includes("trigger"),
    xp:60, coins:20, hp_loss:25,
    hint:"Add onClick={trigger} as a prop on the <button> element." },

  { id:6,  zone:2, title:"Recon Loop",         boss:false,
    task:"Render each name in the array as a <li>. Use .map() with a key prop.",
    starter:"const names = ['Aria','Rex','Zane'];\nfunction NameList() {\n  return <ul></ul>;\n}",
    validate: (code) => code.includes(".map(") && code.includes("key"),
    xp:35, coins:8, hp_loss:20,
    hint:"names.map((n,i) => <li key={i}>{n}</li>) inside <ul>...</ul>" },

  { id:7,  zone:2, title:"Ghost Trap",         boss:false,
    task:"Show <p>DANGER</p> only when the 'danger' prop is true. Use conditional rendering.",
    starter:"function Alert({ danger }) {\n  return <div></div>;\n}",
    validate: (code) => code.includes("danger") && (code.includes("?") || code.includes("&&")) && code.includes("DANGER"),
    xp:35, coins:8, hp_loss:20,
    hint:"Inside the div: {danger ? <p>DANGER</p> : null}" },

  { id:8,  zone:2, title:"Echo Chamber",       boss:false,
    task:"Log 'Ready' to console when the component mounts. Use useEffect.",
    starter:"function Camp() {\n  return <div>Camp</div>;\n}",
    validate: (code) => code.includes("useEffect") && code.includes("Ready") && code.includes("[]"),
    xp:40, coins:10, hp_loss:20,
    hint:"useEffect(() => { console.log('Ready') }, [])  — empty array = runs once on mount" },

  { id:9,  zone:2, title:"Supply Form",        boss:false,
    task:"Stop page reload on form submit. Call e.preventDefault() inside the handler.",
    starter:"function SupplyForm() {\n  function handle(e) {\n    // stop page reload here\n  }\n  return <form onSubmit={handle}><button>Send</button></form>;\n}",
    validate: (code) => code.includes("preventDefault") && !code.includes("// stop page reload here"),
    xp:40, coins:10, hp_loss:20,
    hint:"Replace the comment with: e.preventDefault();" },

  { id:10, zone:2, title:"ZONE BOSS: Phantom",  boss:true,
    task:"Memoize the heavy calculation so it only reruns when 'data' changes. Wrap with useMemo.",
    starter:"function Stats({ data }) {\n  const result = data.reduce((a,b) => a + b, 0);\n  return <div>{result}</div>;\n}",
    validate: (code) => code.includes("useMemo") && code.includes("data"),
    xp:80, coins:25, hp_loss:30,
    hint:"const result = useMemo(() => data.reduce((a,b)=>a+b,0), [data])" },

  { id:11, zone:3, title:"Dead Signal",        boss:false,
    task:"Fetch survivor records from '/api/survivors' using async/await. Return the JSON.",
    starter:"async function getSurvivors() {\n  // fetch and return data\n}",
    validate: (code) => code.includes("fetch") && code.includes("/api/survivors") && code.includes("await") && !code.includes("// fetch and return data"),
    xp:50, coins:12, hp_loss:20,
    hint:"const res = await fetch('/api/survivors'); return res.json();" },

  { id:12, zone:3, title:"Corrupted Cache",    boss:false,
    task:"Wrap the fetch in try/catch. Log errors to console inside catch block.",
    starter:"async function loadData(url) {\n  const res = await fetch(url);\n  return res.json();\n}",
    validate: (code) => code.includes("try") && code.includes("catch"),
    xp:50, coins:12, hp_loss:20,
    hint:"try { const res = await fetch(url); return res.json(); } catch(e) { console.error(e) }" },

  { id:13, zone:3, title:"Encrypted Gate",     boss:false,
    task:"Send a JWT token in the Authorization header as 'Bearer <token>'.",
    starter:"async function secured(url, token) {\n  return fetch(url);\n}",
    validate: (code) => code.includes("Authorization") && code.includes("Bearer") && code.includes("headers"),
    xp:55, coins:14, hp_loss:22,
    hint:"fetch(url, { headers: { Authorization: `Bearer ${token}` } })" },

  { id:14, zone:3, title:"Retry Protocol",     boss:false,
    task:"Retry the fetch up to 3 times on failure. Use a loop with try/catch.",
    starter:"async function fetchWithRetry(url, retries = 3) {\n  // add retry logic\n}",
    validate: (code) => code.includes("catch") && code.includes("retries") && !code.includes("// add retry logic"),
    xp:60, coins:15, hp_loss:25,
    hint:"for(let i=0;i<retries;i++){ try{ return await fetch(url) }catch(e){ if(i===retries-1) throw e } }" },

  { id:15, zone:3, title:"ZONE BOSS: Wraith",  boss:true,
    task:"Implement a debounce function — delay firing fn until 300ms of silence.",
    starter:"function debounce(fn, delay) {\n  // return debounced function\n}",
    validate: (code) => code.includes("setTimeout") && code.includes("clearTimeout") && code.includes("return") && !code.includes("// return debounced function"),
    xp:100, coins:30, hp_loss:30,
    hint:"let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); }" },

  { id:16, zone:4, title:"Identity Crisis",    boss:false,
    task:"Validate email (must have @) AND password (8+ chars). Return true if valid.",
    starter:"function validate(email, password) {\n  // return true if valid\n}",
    validate: (code) => code.includes("@") && code.includes("length") && code.includes("return") && !code.includes("// return true if valid"),
    xp:65, coins:16, hp_loss:25,
    hint:"return email.includes('@') && password.length >= 8;" },

  { id:17, zone:4, title:"Shadow Protocol",    boss:false,
    task:"Decode a JWT payload manually: split by '.', base64-decode part [1], parse as JSON.",
    starter:"function decodeJWT(token) {\n  // split, decode, parse\n}",
    validate: (code) => code.includes("split") && code.includes("atob") && code.includes("JSON.parse"),
    xp:75, coins:18, hp_loss:28,
    hint:"const p = token.split('.')[1]; return JSON.parse(atob(p));" },

  { id:18, zone:4, title:"Resource Wars",      boss:false,
    task:"Rate limiter: allow max 5 calls per 60s per IP. Return false if over limit.",
    starter:"function rateLimiter(maxCalls, windowMs) {\n  const map = new Map();\n  return function(ip) {\n    // check limit\n  };\n}",
    validate: (code) => code.includes("Map") && code.includes("Date.now") && code.includes("return") && !code.includes("// check limit"),
    xp:80, coins:20, hp_loss:28,
    hint:"Store {count, start} per ip. Reset if Date.now()-start > windowMs. Return count<=maxCalls." },

  { id:19, zone:4, title:"Memory Vault",       boss:false,
    task:"Memoize any function — cache results keyed by JSON.stringify of arguments.",
    starter:"function memoize(fn) {\n  // cache results\n}",
    validate: (code) => code.includes("Map") && code.includes("JSON.stringify") && code.includes("return") && !code.includes("// cache results"),
    xp:85, coins:22, hp_loss:30,
    hint:"const cache=new Map(); return (...a)=>{ const k=JSON.stringify(a); if(!cache.has(k)) cache.set(k,fn(...a)); return cache.get(k); }" },

  { id:20, zone:4, title:"FINAL BOSS: The Core", boss:true,
    task:"Deep clone an object recursively — handle nested objects. No JSON tricks.",
    starter:"function deepClone(obj) {\n  // recursively clone\n}",
    validate: (code) => code.includes("typeof") && (code.includes("Object") || code.includes("{}")) && code.includes("return") && !code.includes("// recursively clone"),
    xp:150, coins:50, hp_loss:35,
    hint:"if(typeof obj!=='object'||!obj) return obj; const c={}; for(let k in obj) c[k]=deepClone(obj[k]); return c;" },
];

// MAP — spread across a tall viewBox so nothing gets cut off
// viewBox: 0 0 100 130
const MAP_NODES = [
  // Zone 1 — bottom-left area
  { id:1,  x:30, y:118 },
  { id:2,  x:15, y:104 },
  { id:3,  x:35, y:92  },
  { id:4,  x:15, y:80  },
  { id:5,  x:35, y:68  }, // boss z1
  // Zone 2 — mid area
  { id:6,  x:55, y:68  },
  { id:7,  x:70, y:80  },
  { id:8,  x:55, y:92  },
  { id:9,  x:70, y:104 },
  { id:10, x:85, y:92  }, // boss z2
  // Zone 3 — right column going up
  { id:11, x:85, y:78  },
  { id:12, x:85, y:62  },
  { id:13, x:85, y:46  },
  { id:14, x:85, y:30  },
  { id:15, x:70, y:18  }, // boss z3
  // Zone 4 — top-left
  { id:16, x:55, y:18  },
  { id:17, x:40, y:10  },
  { id:18, x:25, y:18  },
  { id:19, x:12, y:30  },
  { id:20, x:12, y:46  }, // final boss
];

const MAP_PATHS = [
  [1,2],[2,3],[3,4],[4,5],
  [5,6],[6,7],[7,8],[8,9],[9,10],
  [10,11],[11,12],[12,13],[13,14],[14,15],
  [15,16],[16,17],[17,18],[18,19],[19,20],
];

const ZONE_LABELS = [
  { zone:1, x:6,  y:76,  label:"ZONE I",   sub:"The Ruins"   },
  { zone:2, x:54, y:62,  label:"ZONE II",  sub:"The Outpost" },
  { zone:3, x:78, y:26,  label:"ZONE III", sub:"The Bunker"  },
  { zone:4, x:6,  y:26,  label:"ZONE IV",  sub:"The Citadel" },
];

function zoneColor(zone){ return zone===1?"#a16207":zone===2?"#166534":zone===3?"#1d4ed8":zone===4?"#7c2d12":"#581c87"; }
function zoneBg(zone){ return zone===1?"#1c1508":zone===2?"#071a0c":zone===3?"#060f1f":zone===4?"#1a0808":"#130820"; }
function zoneGlow(zone){ return zone===1?"#ca8a04":zone===2?"#22c55e":zone===3?"#3b82f6":zone===4?"#ef4444":"#a855f7"; }

function HPBar({ hp, shaking }) {
  const pct = Math.max(0, Math.min(100, hp));
  const col = pct > 60 ? "#22c55e" : pct > 30 ? "#f97316" : "#ef4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8,
      animation:shaking?"hpShake .35s ease-out":"none" }}>
      <span style={{ fontSize:10, color:"#6b4f30", letterSpacing:".1em" }}>HP</span>
      <div style={{ width:110, height:8, background:"#1a1208", borderRadius:2,
        border:"1px solid #3d2e1a", overflow:"hidden",
        animation:shaking?"hpDrain .35s ease-out":"none" }}>
        <div className="hp-fill" style={{ width:`${pct}%`, background:col, boxShadow:`0 0 6px ${col}60` }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:col, minWidth:28 }}>{hp}</span>
    </div>
  );
}

function LevelMap({ progress, onSelect, onBack }) {
  const nodeAt = (id) => MAP_NODES.find(n => n.id === id);

  return (
    <div style={{ minHeight:"100vh", background:"#0a0804", display:"flex", flexDirection:"column" }}>
      <G/>
      {/* header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 20px", borderBottom:"1px solid #2a1e0e", flexShrink:0 }}>
        <div>
          <div className="title-font" style={{ fontSize:18, color:"#c8a454", letterSpacing:"0.12em" }}>SURVIVAL MAP</div>
          <div style={{ fontSize:9, color:"#5c4a2e", letterSpacing:"0.15em", marginTop:2 }}>CHOOSE YOUR MISSION</div>
        </div>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize:11 }}>← CAMP</button>
      </div>

      {/* SVG map — fills remaining space, tall viewBox shows all 20 nodes */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"8px 12px" }}>
        <svg
          viewBox="0 0 100 130"
          style={{ width:"100%", flex:1, minHeight:500, maxHeight:"calc(100vh - 140px)" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* bg dots */}
          {Array.from({length:11},(_,x)=>Array.from({length:14},(_,y)=>(
            <circle key={`${x}-${y}`} cx={x*10+2} cy={y*10+4} r={.22} fill="#2a1e0e"/>
          )))}

          {/* zone labels */}
          {ZONE_LABELS.map(z => (
            <g key={z.zone}>
              <text x={z.x} y={z.y} fill={zoneGlow(z.zone)} fontSize={3} fontFamily="Cinzel,serif"
                fontWeight="700" opacity={.45}>{z.label}</text>
              <text x={z.x} y={z.y+3.5} fill={zoneGlow(z.zone)} fontSize={2} fontFamily="Share Tech Mono,monospace"
                opacity={.28}>{z.sub}</text>
            </g>
          ))}

          {/* paths */}
          {MAP_PATHS.map(([a,b]) => {
            const na = nodeAt(a), nb = nodeAt(b);
            const unlocked = a <= progress;
            const lvA = LEVELS[a-1];
            const col = unlocked ? zoneGlow(lvA.zone) : "#2a1e0e";
            return (
              <line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={col} strokeWidth={unlocked?.55:.38}
                strokeDasharray={unlocked?"2 1.4":"1.4 2"}
                strokeOpacity={unlocked?.7:.4}
              />
            );
          })}

          {/* nodes */}
          {MAP_NODES.map(n => {
            const lv = LEVELS[n.id-1];
            const unlocked = n.id <= progress;
            const current  = n.id === progress;
            const done     = n.id < progress;
            const col = zoneGlow(lv.zone);

            return (
              <g key={n.id} className="map-node"
                onClick={() => unlocked && onSelect(n.id)}
                style={{ transformOrigin:`${n.x}px ${n.y}px` }}>
                {lv.boss && unlocked && (
                  <circle cx={n.x} cy={n.y} r={4.8} fill="none" stroke={col}
                    strokeWidth={.35} strokeDasharray="1.4 1" opacity={.55}/>
                )}
                <circle cx={n.x} cy={n.y} r={lv.boss?4:3}
                  fill={done ? col+"22" : current ? col+"30" : "#1a1208"}
                  stroke={unlocked ? col : "#2a1e0e"} strokeWidth={current?.85:.5}
                  opacity={unlocked?1:.32}
                  className="node-ring"
                />
                <circle cx={n.x} cy={n.y} r={lv.boss?1.6:1.1}
                  fill={done?"#1a1208":unlocked?col:"#2a1e0e"} opacity={unlocked?1:.32}/>
                {done && (
                  <text x={n.x} y={n.y+.9} textAnchor="middle" fill={col}
                    fontSize={2.4} fontFamily="Share Tech Mono,monospace">✓</text>
                )}
                <text x={n.x} y={n.y-4.5} textAnchor="middle"
                  fill={unlocked?col:"#3d2e1a"} fontSize={1.9}
                  fontFamily="Cinzel,serif" fontWeight="700" opacity={unlocked?1:.4}>
                  {lv.boss ? "★" : n.id}
                </text>
                {current && (
                  <circle cx={n.x} cy={n.y} r={.75} fill={col}
                    style={{ animation:"pulse 1s ease-in-out infinite" }}/>
                )}
              </g>
            );
          })}

          {/* Zone V lock icon at top-center */}
          <g opacity={.5}>
            <circle cx={50} cy={5} r={3.5} fill="#13082a" stroke="#581c87" strokeWidth={.5}/>
            <text x={50} y={6.3} textAnchor="middle" fontSize={3.5} fontFamily="Share Tech Mono,monospace" fill="#a855f7">🔒</text>
          </g>
          <text x={50} y={11.5} textAnchor="middle" fill="#a855f7" fontSize={2.2}
            fontFamily="Cinzel,serif" fontWeight="700" opacity={.5}>ZONE V: THE VOID</text>
          <text x={50} y={14.5} textAnchor="middle" fill="#7c3aed" fontSize={1.7}
            fontFamily="Share Tech Mono,monospace" opacity={.4}>COMING SOON</text>
        </svg>
      </div>

      {/* legend */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center",
        padding:"8px 16px", borderTop:"1px solid #1a1208", flexShrink:0 }}>
        {[["#ca8a04","Zone I: Ruins"],["#22c55e","Zone II: Outpost"],
          ["#3b82f6","Zone III: Bunker"],["#ef4444","Zone IV: Citadel"]].map(([c,l])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:9, color:"#5c4a2e" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:c, opacity:.7 }}/>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function MainMenu({ progress, xp, coins, onContinue, onNewGame, onLevels, onExit }) {
  return (
    <div style={{ minHeight:"100vh", background:"#0a0804", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden" }}>
      <G/>
      <div style={{ position:"absolute", inset:0, opacity:.04,
        backgroundImage:"repeating-linear-gradient(0deg,#c8a454 0,#c8a454 1px,transparent 1px,transparent 28px),repeating-linear-gradient(90deg,#c8a454 0,#c8a454 1px,transparent 1px,transparent 28px)" }}/>

      <div style={{ textAlign:"center", marginBottom:32, zIndex:1 }}>
        <div className="title-font" style={{ fontSize:38, color:"#c8a454", letterSpacing:".08em",
          lineHeight:1, animation:"flicker 4s ease-in-out infinite", textShadow:"0 0 30px #c8a45440" }}>
          DEV
        </div>
        <div className="title-font" style={{ fontSize:38, color:"#ea580c", letterSpacing:".12em",
          lineHeight:1, textShadow:"0 0 30px #ea580c40" }}>
          SURVIVOR
        </div>
        <div style={{ fontSize:9, color:"#5c4a2e", letterSpacing:".3em", marginTop:8, textTransform:"uppercase" }}>
          Code. Survive. Evolve.
        </div>
      </div>

      <div style={{ display:"flex", gap:24, marginBottom:28, zIndex:1 }}>
        {[["⚡",xp,"XP"],["💰",coins,"Coins"],["📍",`${progress}/20`,"Progress"]].map(([ic,v,l])=>(
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:16 }}>{ic}</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#c8a454" }}>{v}</div>
            <div style={{ fontSize:8, color:"#5c4a2e", letterSpacing:".1em" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10, width:220, zIndex:1 }}>
        <button className="btn-attack" onClick={onContinue} style={{ fontSize:12, letterSpacing:".15em" }}>
          ▶ CONTINUE — LEVEL {progress}
        </button>
        <button className="btn-ghost" onClick={onLevels}>📜 Mission Map</button>
        <button className="btn-ghost" onClick={onNewGame} style={{ color:"#8b4a3e", borderColor:"#3d1a0e" }}>
          🆕 New Game (reset)
        </button>
        <button className="btn-ghost" onClick={onExit} style={{ color:"#5c4a2e" }}>
          ← Exit to Hub
        </button>
      </div>

      <div style={{ marginTop:32, fontSize:28, animation:"campfire 1.5s ease-in-out infinite", zIndex:1 }}>🔥</div>
    </div>
  );
}

function GameScreen({ level, progress, xp, coins, hp, onCorrect, onWrong, onMenu }) {
  const lv = LEVELS[level - 1];
  const [code, setCode]     = useState(lv.starter);
  const [wrong, setWrong]   = useState(false);
  const [hint, setHint]     = useState(false);
  const [done, setDone]     = useState(false);
  const [bgAnim, setBgAnim] = useState(null);
  const col = zoneGlow(lv.zone);

  useEffect(() => { setCode(lv.starter); setWrong(false); setHint(false); setDone(false); }, [level]);

  const submit = () => {
    if (done) return;
    const passed = lv.validate(code);
    if (passed) {
      setDone(true);
      setBgAnim("correctFlash"); setTimeout(()=>setBgAnim(null), 400);
      setTimeout(() => onCorrect(lv.xp, lv.coins), 600);
    } else {
      setWrong(true); setTimeout(()=>setWrong(false), 400);
      setBgAnim("wrongFlash"); setTimeout(()=>setBgAnim(null), 400);
      onWrong(lv.hp_loss);
    }
  };

  const pct = Math.round((level - 1) / 20 * 100);

  return (
    <div style={{ minHeight:"100vh", background: zoneBg(lv.zone),
      animation: bgAnim ? `${bgAnim} .4s ease-out` : "none",
      display:"flex", flexDirection:"column" }}>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 16px", background:"#07060430", borderBottom:`1px solid ${col}20`, flexShrink:0 }}>
        <HPBar hp={hp} shaking={wrong}/>
        <div style={{ textAlign:"center" }}>
          <div className="title-font" style={{ fontSize:11, color:col, letterSpacing:".15em" }}>
            {lv.boss ? "★ BOSS" : `LEVEL ${level}`}
          </div>
          <div style={{ fontSize:8, color:"#5c4a2e" }}>Zone {lv.zone} · {xp} XP · {coins} 💰</div>
        </div>
        <button className="btn-ghost" onClick={onMenu} style={{ fontSize:10 }}>≡ Menu</button>
      </div>

      <div style={{ height:3, background:"#1a1208", flexShrink:0 }}>
        <div style={{ height:"100%", background:col, width:`${pct}%`, transition:"width .5s", boxShadow:`0 0 6px ${col}60` }}/>
      </div>

      <div style={{ margin:"12px 14px 0", padding:"12px 14px",
        background:"#0e0b07", border:`1px solid ${col}30`,
        borderLeft:`3px solid ${col}`, borderRadius:4, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <span style={{ fontSize:8, color:col, letterSpacing:".15em", textTransform:"uppercase",
            background:col+"18", border:`0.5px solid ${col}50`, padding:"1px 7px", borderRadius:2 }}>
            Zone {lv.zone} · {lv.boss?"BOSS":"MISSION"}
          </span>
          <span className="title-font" style={{ fontSize:11, color:"#c8a454", letterSpacing:".08em" }}>
            {lv.title}
          </span>
          <button onClick={()=>setHint(h=>!h)}
            style={{ marginLeft:"auto", fontSize:9, color:"#6b4f30", background:"none",
              border:"0.5px solid #3d2e1a", borderRadius:2, padding:"1px 8px", cursor:"pointer", fontFamily:"inherit" }}>
            {hint?"Hide":"Hint?"}
          </button>
        </div>
        <div style={{ fontSize:12, color:"#c8b483", lineHeight:1.55 }}>{lv.task}</div>
        {hint && (
          <div style={{ marginTop:8, fontSize:10, color:"#a16207", background:"#1a1208",
            border:"1px solid #3d2e0a", borderRadius:3, padding:"6px 10px", animation:"slideUp .2s ease-out" }}>
            💡 {lv.hint}
          </div>
        )}
      </div>

      <div style={{ flex:1, margin:"10px 14px 0", display:"flex", flexDirection:"column", minHeight:0 }}>
        <div style={{ fontSize:8, color:"#5c4a2e", letterSpacing:".15em", textTransform:"uppercase", marginBottom:6 }}>
          // Write your solution
        </div>
        <textarea className={`code-area${wrong?" wrong":""}`}
          style={{ flex:1, minHeight:160 }}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => { if ((e.ctrlKey||e.metaKey) && e.key==="Enter") submit(); }}
          spellCheck={false}
        />
        {done && (
          <div style={{ marginTop:8, fontSize:11, color:"#22c55e", animation:"slideUp .25s ease-out", textAlign:"center" }}>
            ✓ Solution accepted — +{lv.xp} XP +{lv.coins} 💰
          </div>
        )}
      </div>

      <div style={{ padding:"10px 14px 14px", flexShrink:0 }}>
        <button className="btn-attack" onClick={submit} disabled={done}
          style={{ background: done ? "linear-gradient(135deg,#14532d,#166534)" : undefined,
            borderColor: done ? "#22c55e" : undefined }}>
          {done ? "✓ CORRECT — CONTINUE" : `⚡ ATTACK — LEVEL ${level}`}
        </button>
        <div style={{ textAlign:"center", marginTop:6, fontSize:9, color:"#3d2e1a" }}>
          Ctrl+Enter to submit · Wrong = −{lv.hp_loss} HP
        </div>
      </div>
    </div>
  );
}

export default function DevSurvivor() {
  const [screen,   setScreen]   = useState("menu");
  const [level,    setLevel]    = useState(1);
  const [progress, setProgress] = useState(1);
  const [hp,       setHp]       = useState(100);
  const [xp,       setXp]       = useState(0);
  const [coins,    setCoins]    = useState(0);
  const [floats,   setFloats]   = useState([]);
  const [hpShake,  setHpShake]  = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem("ds_progress");
      const x = localStorage.getItem("ds_xp");
      const c = localStorage.getItem("ds_coins");
      if (p) setProgress(Math.max(1, Number(p)));
      if (x) setXp(Number(x));
      if (c) setCoins(Number(c));
    } catch {}
  }, []);

  const save = (prog, x, c) => {
    try {
      localStorage.setItem("ds_progress", prog);
      localStorage.setItem("ds_xp", x);
      localStorage.setItem("ds_coins", c);
    } catch {}
  };

  const spawnFloat = (text, color) => {
    const id = Date.now();
    setFloats(f => [...f, { id, text, color }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1200);
  };

  const handleCorrect = useCallback((xpGain, coinsGain) => {
    const nx = xp + xpGain, nc = coins + coinsGain;
    setXp(nx); setCoins(nc);
    spawnFloat(`+${xpGain} XP  +${coinsGain} 💰`, "#22c55e");
    const next = level + 1;
    if (next > LEVELS.length) {
      setScreen("complete");
      save(progress, nx, nc);
      return;
    }
    const np = Math.max(progress, next);
    setProgress(np);
    save(np, nx, nc);
    setTimeout(() => setLevel(next), 700);
  }, [xp, coins, level, progress]);

  const handleWrong = useCallback((dmg) => {
    setHpShake(true); setTimeout(()=>setHpShake(false), 400);
    spawnFloat(`−${dmg} HP`, "#ef4444");
    setHp(h => {
      const nh = Math.max(0, h - dmg);
      if (nh <= 0) setTimeout(() => setGameOver(true), 200);
      return nh;
    });
  }, []);

  const startLevel = (id) => { setLevel(id); setScreen("game"); };
  const newGame = () => {
    setLevel(1); setProgress(1); setHp(100); setXp(0); setCoins(0);
    try { ["ds_progress","ds_xp","ds_coins"].forEach(k=>localStorage.setItem(k,"0")); } catch {}
    setScreen("menu");
  };

  const navigate = (path) => { window.location.href = path; };

  if (gameOver) return (
    <div style={{ minHeight:"100vh", background:"#0a0203", display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'Share Tech Mono',monospace" }}>
      <G/>
      <div style={{ textAlign:"center", animation:"popIn .6s cubic-bezier(.34,1.56,.64,1)" }}>
        <div style={{ fontSize:52, marginBottom:10 }}>💀</div>
        <div className="title-font" style={{ fontSize:28, color:"#ef4444", marginBottom:4 }}>ELIMINATED</div>
        <div style={{ fontSize:11, color:"#5c4a2e", marginBottom:24 }}>You ran out of HP. Progress is saved.</div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button className="btn-attack" onClick={()=>{setHp(100);setGameOver(false);setScreen("menu");}}
            style={{ width:130 }}>Respawn</button>
          <button className="btn-ghost" onClick={()=>navigate("/full-stack")}>← Hub</button>
        </div>
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{ minHeight:"100vh", background:"#080f04", display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'Share Tech Mono',monospace" }}>
      <G/>
      <div style={{ textAlign:"center", animation:"popIn .6s cubic-bezier(.34,1.56,.64,1)" }}>
        <div style={{ fontSize:52, marginBottom:10 }}>🏆</div>
        <div className="title-font" style={{ fontSize:26, color:"#22c55e", marginBottom:4 }}>ALL ZONES CLEARED</div>
        <div style={{ fontSize:11, color:"#3d5c2e", marginBottom:6 }}>Final XP: {xp} · Coins: {coins}</div>
        <div style={{ fontSize:10, color:"#a855f7", marginBottom:24, animation:"comingSoon 2s ease-in-out infinite" }}>
          🔒 Zone V: The Void — Coming Soon
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button className="btn-attack" onClick={()=>setScreen("menu")} style={{ width:130 }}>Camp</button>
          <button className="btn-ghost" onClick={()=>navigate("/full-stack")}>← Hub</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ds-root">
      <G/>
      <div className="scanH"/>
      {floats.map(f => (
        <div key={f.id} style={{ position:"fixed", top:"35%", left:"50%", transform:"translateX(-50%)",
          fontSize:14, fontWeight:700, color:f.color, pointerEvents:"none", zIndex:999,
          fontFamily:"Share Tech Mono,monospace", animation:"xpFloat 1.1s ease-out forwards", whiteSpace:"nowrap" }}>
          {f.text}
        </div>
      ))}

      {screen === "menu" && (
        <MainMenu progress={progress} xp={xp} coins={coins}
          onContinue={() => startLevel(progress)}
          onNewGame={newGame}
          onLevels={() => setScreen("levels")}
          onExit={() => navigate("/full-stack")}
        />
      )}
      {screen === "levels" && (
        <LevelMap progress={progress} onSelect={startLevel} onBack={() => setScreen("menu")} />
      )}
      {screen === "game" && (
        <GameScreen
          level={level} progress={progress} xp={xp} coins={coins} hp={hp}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          onMenu={() => setScreen("menu")}
        />
      )}
    </div>
  );
}