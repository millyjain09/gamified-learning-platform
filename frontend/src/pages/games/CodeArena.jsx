import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

/* ═══════════════════════════════════════════════
GLOBAL ANIMATION STYLES
═══════════════════════════════════════════════ */
const GlobalStyles = () => (
<style>{`
    @keyframes screenShake {
        0%,100%{transform:translate(0,0)}
        10%{transform:translate(-4px,2px)}
      20%{transform:translate(4px,-2px)}
      30%{transform:translate(-4px,0)}
      40%{transform:translate(4px,2px)}
      50%{transform:translate(-3px,-2px)}
      60%{transform:translate(3px,1px)}
      70%{transform:translate(-2px,-1px)}
      80%{transform:translate(2px,1px)}
      90%{transform:translate(-1px,0)}
    }
    @keyframes editorShake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-5px)}
      40%{transform:translateX(5px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }
    @keyframes hpFlashRed {
      0%,100%{filter:brightness(1)}
        50%{filter:brightness(2.2) saturate(2)}
    }
    @keyframes explosionRing {
        0%{transform:scale(0.5);opacity:1}
        100%{transform:scale(3);opacity:0}
    }
    @keyframes comboPop {
        0%{transform:scale(0.7) translateX(-50%);opacity:0}
        40%{transform:scale(1.3) translateX(-38%);opacity:1}
        70%{transform:scale(1.1) translateX(-45%);opacity:1}
        100%{transform:scale(1) translateX(-50%);opacity:0}
    }
    @keyframes buttonBounce {
        0%{transform:scale(1)}
        30%{transform:scale(0.88)}
        70%{transform:scale(1.07)}
        100%{transform:scale(1)}
    }
    @keyframes correctGlow {
        0%,100%{box-shadow:none}
        40%{box-shadow:0 0 0 3px #22c55e80, 0 0 40px #22c55e50}
    }
    @keyframes timerPulse {
        0%,100%{transform:scale(1)}
        50%{transform:scale(1.1)}
    }
    @keyframes timerCritical {
        0%,100%{transform:scale(1);opacity:1}
        50%{transform:scale(1.2);opacity:0.7}
    }
    @keyframes slideInFromRight {
        0%{transform:translateX(30px);opacity:0}
        100%{transform:translateX(0);opacity:1}
    }
    @keyframes slideInFromLeft {
        0%{transform:translateX(-30px);opacity:0}
        100%{transform:translateX(0);opacity:1}
    }
    @keyframes fadeSlideIn {
        0%{transform:translateY(10px);opacity:0}
        100%{transform:translateY(0);opacity:1}
    }
    @keyframes winTextPop {
        0%{transform:scale(0.3);opacity:0}
        65%{transform:scale(1.25);opacity:1}
        100%{transform:scale(1);opacity:1}
    }
    @keyframes confettiFall {
        0%{top:-5%;opacity:1;transform:rotate(0deg) scale(1)}
        100%{top:108%;opacity:0;transform:rotate(720deg) scale(0.4)}
    }
    @keyframes hitMarker {
        0%{transform:scale(0.4) rotate(0deg);opacity:1}
        50%{transform:scale(1.4) rotate(45deg);opacity:1}
        100%{transform:scale(2) rotate(45deg);opacity:0}
    }
    @keyframes toastIn {
        from{opacity:0;transform:translateY(-10px) scale(0.92)}
        to{opacity:1;transform:translateY(0) scale(1)}
    }
    @keyframes hpBarShake {
        0%,100%{transform:translateX(0)}
        25%{transform:translateX(-4px)}
        75%{transform:translateX(4px)}
    }
    @keyframes dotGlow {
        0%,100%{opacity:1;transform:scale(1)}
        50%{opacity:0.4;transform:scale(0.8)}
    }
    `}</style>
);

/* ═══════════════════════════════════════════════
CONFETTI
═══════════════════════════════════════════════ */
const CONFETTI_COLORS = ["#f87171","#4ade80","#60a5fa","#fbbf24","#c084fc","#34d399","#f472b6","#fb923c"];
const Confetti = () => {
const pieces = Array.from({ length: 90 }, (_, i) => ({
    left: Math.random() * 100, size: 7 + Math.random() * 9,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.9, dur: 1.2 + Math.random() * 1.5,
    isCircle: Math.random() > 0.5, rotate: Math.random() * 360,
}));
return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:300 }}>
        {pieces.map((p,i) => (
        <div key={i} style={{
            position:"absolute", left:`${p.left}%`, top:"-5%",
            width:p.size, height:p.size, background:p.color,
            borderRadius:p.isCircle?"50%":"2px",
            transform:`rotate(${p.rotate}deg)`,
            animation:`confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
        }} />
    ))}
    </div>
);
};

/* ═══════════════════════════════════════════════
HIT MARKER (FPS style ✖ flash)
═══════════════════════════════════════════════ */
const HitMarker = ({ visible }) =>
visible ? (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:250, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:52, color:"#f87171", fontWeight:900, lineHeight:1, animation:"hitMarker 0.4s ease-out forwards" }}>✖</div>
    </div>
) : null;

/* ═══════════════════════════════════════════════
EXPLOSION RING
═══════════════════════════════════════════════ */
const ExplosionRing = ({ visible, color="#22c55e" }) =>
    visible ? (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:240, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:70, height:70, borderRadius:"50%", border:`3px solid ${color}`, animation:"explosionRing 0.45s ease-out forwards" }} />
    </div>
) : null;

/* ═══════════════════════════════════════════════
COMBO POP
═══════════════════════════════════════════════ */
const ComboPop = ({ combo, visible }) =>
    visible ? (
    <div style={{ position:"fixed", top:"28%", left:"50%", pointerEvents:"none", zIndex:260 }}>
        <div style={{ fontSize:30, fontWeight:900, color:"#fbbf24", whiteSpace:"nowrap", textShadow:"0 0 20px #fbbf2480", animation:"comboPop 0.55s ease-out forwards" }}>
        COMBO x{combo}!
    </div>
    </div>
) : null;

/* ═══════════════════════════════════════════════
    DATA
═══════════════════════════════════════════════ */
const AVATARS = [
    { id:"dev",    emoji:"🧑‍💻", name:"Dev",    bg:"#1e1b4b", accent:"#818cf8" },
    { id:"ninja",  emoji:"🥷",  name:"Ninja",  bg:"#1a2e1a", accent:"#4ade80" },
    { id:"hacker", emoji:"💀",  name:"Hacker", bg:"#111827", accent:"#6ee7b7" },
    { id:"alien",  emoji:"👾",  name:"Alien",  bg:"#1a2336", accent:"#38bdf8" },
    { id:"wizard", emoji:"🧙",  name:"Wizard", bg:"#2a1a30", accent:"#c084fc" },
    { id:"robot",  emoji:"🤖",  name:"Robot",  bg:"#2d1b1b", accent:"#f87171" },
];

const DIFFICULTIES = {
    easy:   { label:"Junior Dev", time:6*60,  color:"#4ade80", bg:"#052e16", border:"#166534", aiMult:2.0, aiSolveChance:0.4,  hint:"HTML, CSS, simple JS" },
    medium: { label:"Mid Dev",    time:10*60, color:"#fb923c", bg:"#451a03", border:"#92400e", aiMult:1.1, aiSolveChance:0.62, hint:"fetch, JWT, validation" },
    hard:   { label:"Senior Dev", time:14*60, color:"#f87171", bg:"#450a0a", border:"#991b1b", aiMult:0.6, aiSolveChance:0.82, hint:"Middleware, DB, security" },
};

const QUESTIONS = {
easy: [
    { id:"e1", title:"Fetch Users from API",  tag:"FETCH",     difficulty:"easy",
        description:"Write a function `getUsers()` that fetches data from `/api/users` and returns the JSON response.\n\nUse the `fetch` API and `async/await`.",
        examples:[{ label:"Expected call", code:"await getUsers()\n// returns the JSON from /api/users" }],
      starter:"async function getUsers() {\n  // fetch from /api/users\n}",
        validate:c=>c.includes("fetch")&&c.includes("/api/users")&&(c.includes("await")||c.includes(".then")),
        hints:["Use fetch('/api/users')","Use await response.json()"], aiTime:10000 },
    { id:"e2", title:"Email Validator",        tag:"VALIDATE",  difficulty:"easy",
        description:"Write a function `isValidEmail(email)` that returns `true` if the email is valid.\n\nRules:\n- Must contain @\n- Must have a domain (e.g. .com)\n- No spaces allowed",
      examples:[{ label:"Valid", code:'isValidEmail("user@example.com") // true' },{ label:"Invalid", code:'isValidEmail("userexample.com") // false' }],
      starter:"function isValidEmail(email) {\n  // validate the email\n}",
        validate:c=>c.includes("@")&&(c.includes("includes")||c.includes("test")||c.includes("match")||c.includes("regex")||c.includes("RegExp")),
        hints:["Check for @ using .includes('@')","Use regex: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/"], aiTime:9000 },
    { id:"e3", title:"Format API Response",    tag:"TRANSFORM", difficulty:"easy",
        description:"Write a function `formatUsers(users)` that takes an array of user objects and returns a new array with only `id` and `fullName` fields.\n\nCombine `firstName` and `lastName` into `fullName`.",
        examples:[{ label:"Input", code:'[{ id: 1, firstName: "John", lastName: "Doe", age: 25 }]' },{ label:"Output", code:'[{ id: 1, fullName: "John Doe" }]' }],
      starter:"function formatUsers(users) {\n  // return array with id and fullName only\n}",
        validate:c=>c.includes("map")&&c.includes("fullName")&&(c.includes("firstName")||c.includes("lastName")),
        hints:["Use .map() to transform each user","fullName: user.firstName + ' ' + user.lastName"], aiTime:11000 },
],
medium: [
    { id:"m1", title:"Auth Header Middleware", tag:"AUTH",  difficulty:"medium",
        description:"Write a function `withAuth(url, token)` that makes a GET request with a JWT token in the `Authorization` header.\n\nFormat: `Bearer <token>`",
        examples:[{ label:"Usage", code:"await withAuth('/api/profile', 'eyJhbGci...')" },{ label:"Header sent", code:'Authorization: "Bearer eyJhbGci..."' }],
      starter:"async function withAuth(url, token) {\n  // add Authorization header\n}",
        validate:c=>c.includes("Authorization")&&c.includes("Bearer")&&c.includes("fetch")&&c.includes("headers"),
        hints:["Add headers: { Authorization: `Bearer ${token}` }","Pass headers in fetch options"], aiTime:16000 },
    { id:"m2", title:"Form Submit Handler",    tag:"FORM",  difficulty:"medium",
        description:"Write a function `handleSubmit(formData)` that:\n1. Validates email and password fields are not empty\n2. Checks password is at least 8 characters\n3. POSTs to `/api/login` with JSON body\n4. Returns the response JSON",
        examples:[{ label:"Input", code:'{ email: "a@b.com", password: "secret123" }' },{ label:"POST body", code:'JSON.stringify({ email, password })' }],
      starter:"async function handleSubmit(formData) {\n  const { email, password } = formData;\n  // validate, then POST\n}",
        validate:c=>c.includes("email")&&c.includes("password")&&c.includes("fetch")&&c.includes("POST")&&(c.includes("length")||c.includes("8")),
        hints:["Check password.length >= 8","Use fetch with method: 'POST' and JSON.stringify body"], aiTime:20000 },
    { id:"m3", title:"Debounce Search",        tag:"PERF",  difficulty:"medium",
        description:"Write a function `debounce(fn, delay)` that returns a debounced version of `fn`.\n\nThe debounced function should only call `fn` after `delay` ms have passed since the last call.",
      examples:[{ label:"Usage", code:"const search = debounce(fetchResults, 300)\nsearch('react') // waits 300ms" }],
      starter:"function debounce(fn, delay) {\n  // return debounced version\n}",
        validate:c=>c.includes("setTimeout")&&c.includes("clearTimeout")&&c.includes("return"),
        hints:["Store timer: let timer","clearTimeout(timer) on each call","timer = setTimeout(() => fn(...args), delay)"], aiTime:22000 },
],
hard: [
    { id:"h1", title:"Rate Limiter",           tag:"BACKEND",    difficulty:"hard",
        description:"Write a `rateLimiter(maxCalls, windowMs)` function that returns a middleware-style function.\n\nThe returned function should:\n- Track calls per IP (use a Map)\n- Return `true` if request is allowed\n- Return `false` if limit exceeded within time window",
      examples:[{ label:"Usage", code:"const limiter = rateLimiter(5, 60000)\nlimiter('192.168.1.1') // true\n// after 5 calls:\nlimiter('192.168.1.1') // false" }],
      starter:"function rateLimiter(maxCalls, windowMs) {\n  // use a Map to track IPs\n  return function(ip) {\n    // check rate limit\n  };\n}",
        validate:c=>c.includes("Map")&&c.includes("maxCalls")&&c.includes("return")&&(c.includes("Date.now")||c.includes("timestamp")),
        hints:["Use new Map() to store { count, startTime } per IP","Compare Date.now() - startTime > windowMs to reset"], aiTime:40000 },
    { id:"h2", title:"JWT Decode (No Library)", tag:"SECURITY",   difficulty:"hard",
        description:"Write a function `decodeJWT(token)` that manually decodes a JWT token payload WITHOUT using any library.\n\nJWT format: `header.payload.signature`\nPayload is Base64URL encoded JSON.",
        examples:[{ label:"Input", code:'"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.xxx"' },{ label:"Output", code:'{ userId: 1 }' }],
        starter:"function decodeJWT(token) {\n  // split, decode base64, parse JSON\n}",
        validate:c=>c.includes("split")&&(c.includes("atob")||c.includes("base64")||c.includes("Buffer"))&&c.includes("JSON.parse"),
        hints:["Split by '.' → get index [1] (payload)","Replace base64url chars: - → + and _ → /","atob() to decode, then JSON.parse()"], aiTime:45000 },
    { id:"h3", title:"Retry with Backoff",      tag:"RESILIENCE", difficulty:"hard",
      description:"Write `fetchWithRetry(url, options, retries)` that:\n- Tries the fetch request\n- On failure, retries up to `retries` times\n- Uses exponential backoff: waits `2^attempt * 1000`ms between retries\n- Throws after all retries fail",
        examples:[{ label:"Usage", code:"await fetchWithRetry('/api/data', {}, 3)\n// retries: 1s → 2s → 4s" }],
      starter:"async function fetchWithRetry(url, options, retries) {\n  // try, catch, retry with backoff\n}",
      validate:c=>c.includes("fetch")&&(c.includes("retry")||c.includes("retries")||c.includes("attempt"))&&(c.includes("Math.pow")||c.includes("**")||c.includes("2 *"))&&c.includes("setTimeout"),
      hints:["Use a for loop or recursion for retries","await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))","Throw error after last retry fails"], aiTime:48000 },
    ],
};

const TAG = {
  FETCH:      { color:"#38bdf8", bg:"#0c1a2e", border:"#0e4a6b" },
  VALIDATE:   { color:"#a78bfa", bg:"#1e1b4b", border:"#4c1d95" },
  TRANSFORM:  { color:"#34d399", bg:"#022c22", border:"#065f46" },
  AUTH:       { color:"#fbbf24", bg:"#2d1a00", border:"#78350f" },
  FORM:       { color:"#f472b6", bg:"#2d0a1a", border:"#831843" },
  PERF:       { color:"#60a5fa", bg:"#0d1f3c", border:"#1e3a5f" },
  BACKEND:    { color:"#fb923c", bg:"#2d0f00", border:"#7c2d12" },
  SECURITY:   { color:"#f87171", bg:"#2d0a0a", border:"#7f1d1d" },
  RESILIENCE: { color:"#c084fc", bg:"#1a0a2e", border:"#581c87" },
};

/* ═══════════════════════════════════════════════
   HP BAR
═══════════════════════════════════════════════ */
const HPBar = ({ hp, label, flipped, shake }) => {
  const pct = Math.max(0, Math.min(100, hp));
  const col = pct > 60 ? "#4ade80" : pct > 30 ? "#fb923c" : "#f87171";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:flipped?"flex-end":"flex-start", animation:shake?"hpBarShake 0.35s ease-out":"none" }}>
      <span style={{ fontSize:10, color:"#4b5563", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexDirection:flipped?"row-reverse":"row" }}>
        <div style={{ width:80, height:5, background:"#1f2937", borderRadius:3, overflow:"hidden", border:"0.5px solid #374151", animation:shake?"hpFlashRed 0.35s ease-out":"none" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:3, transition:"width 0.5s, background 0.4s" }} />
        </div>
        <span style={{ fontSize:11, fontWeight:500, color:col, fontFamily:"monospace", transition:"color 0.4s" }}>{hp}</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TIMER
═══════════════════════════════════════════════ */
const Timer = ({ seconds, total }) => {
  const m = Math.floor(seconds/60), s = seconds%60;
  const crit = seconds <= 10, warn = seconds <= 30;
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{
        fontFamily:"monospace", fontSize:20, fontWeight:700, letterSpacing:"0.05em",
        color:crit?"#f87171":warn?"#fb923c":"#e2e8f0", display:"inline-block",
        animation:crit?"timerCritical 0.6s ease-in-out infinite":warn?"timerPulse 1s ease-in-out infinite":"none",
      }}>
        {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
      </div>
      <div style={{ width:60, height:2, background:"#1f2937", borderRadius:2, margin:"4px auto 0" }}>
        <div style={{ width:`${(seconds/total)*100}%`, height:"100%", background:crit?"#f87171":warn?"#fb923c":"#4ade80", borderRadius:2, transition:"width 1s, background 0.5s" }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
const Toast = ({ toasts }) => (
  <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:200, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none", alignItems:"center" }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        padding:"8px 18px", borderRadius:10, fontSize:12, fontWeight:500, whiteSpace:"nowrap",
        background:t.type==="success"?"#052e16":t.type==="danger"?"#450a0a":"#111827",
        border:`0.5px solid ${t.type==="success"?"#166534":t.type==="danger"?"#991b1b":"#374151"}`,
        color:t.type==="success"?"#4ade80":t.type==="danger"?"#f87171":"#e2e8f0",
        animation:"toastIn 0.25s ease-out",
      }}>{t.msg}</div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════
   SCREEN 1 — AVATAR
═══════════════════════════════════════════════ */
const AvatarScreen = ({ onNext }) => {
  const [sel, setSel] = useState(AVATARS[0]);
  const [name, setName] = useState("");
  const [entered, setEntered] = useState(false);
  useEffect(() => { setTimeout(() => setEntered(true), 30); }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#060a10", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400, background:"#0d1117", border:"0.5px solid #1e2536", borderRadius:16, padding:28, opacity:entered?1:0, transform:entered?"translateY(0)":"translateY(16px)", transition:"opacity 0.4s, transform 0.4s" }}>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ fontSize:32, marginBottom:6 }}>⚔️</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#e2e8f0", margin:0 }}>Fullstack<span style={{ color:"#7c3aed" }}>Battle</span></h1>
          <p style={{ fontSize:11, color:"#4b5563", margin:"4px 0 0" }}>1v1 real-world coding tasks</p>
        </div>

        {/* Avatar preview with spring transition */}
        <div style={{ width:72, height:72, borderRadius:"50%", background:sel.bg, border:`3px solid ${sel.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 18px", boxShadow:`0 0 20px ${sel.accent}40`, transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
          {sel.emoji}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:18 }}>
          {AVATARS.map(av => (
            <div key={av.id} onClick={() => setSel(av)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:av.bg, border:`2px solid ${sel.id===av.id?av.accent:"transparent"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform:sel.id===av.id?"scale(1.18)":"scale(1)", boxShadow:sel.id===av.id?`0 0 14px ${av.accent}50`:"none" }}>
                {av.emoji}
              </div>
              <span style={{ fontSize:9, color:sel.id===av.id?sel.accent:"#4b5563", transition:"color 0.2s" }}>{av.name}</span>
            </div>
          ))}
        </div>

        <label style={{ fontSize:11, color:"#6b7280", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Username</label>
        <input type="text" placeholder="Enter username..." value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&name.trim()&&onNext({avatar:sel,username:name.trim()})}
          style={{ width:"100%", background:"#111827", border:"0.5px solid #374151", borderRadius:8, padding:"9px 12px", fontSize:13, color:"#e2e8f0", outline:"none", fontFamily:"inherit", marginBottom:16, transition:"border-color 0.2s, box-shadow 0.2s" }}
          onFocus={e=>{e.target.style.borderColor="#7c3aed";e.target.style.boxShadow="0 0 0 3px #7c3aed25";}}
          onBlur={e=>{e.target.style.borderColor="#374151";e.target.style.boxShadow="none";}}
        />
        <button onClick={()=>name.trim()&&onNext({avatar:sel,username:name.trim()})} disabled={!name.trim()}
          onMouseDown={e=>{if(name.trim())e.currentTarget.style.animation="buttonBounce 0.3s ease-out";}}
          onAnimationEnd={e=>{e.currentTarget.style.animation="none";}}
          style={{ width:"100%", padding:"10px 0", borderRadius:10, background:name.trim()?"#7c3aed":"#1f2937", color:name.trim()?"#fff":"#4b5563", border:"none", fontSize:13, fontWeight:500, cursor:name.trim()?"pointer":"not-allowed", transition:"background 0.2s, box-shadow 0.2s" }}
          onMouseEnter={e=>{if(name.trim())e.currentTarget.style.boxShadow="0 0 18px #7c3aed55";}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}
        >Continue →</button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN 2 — LEVEL SELECT
═══════════════════════════════════════════════ */
const LevelScreen = ({ player, onStart, onBack }) => {
  const [sel, setSel] = useState("medium");
  const [entered, setEntered] = useState(false);
  const cfg = DIFFICULTIES[sel];
  useEffect(() => { setTimeout(() => setEntered(true), 30); }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#060a10", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:460, background:"#0d1117", border:"0.5px solid #1e2536", borderRadius:16, padding:28, opacity:entered?1:0, transform:entered?"translateX(0)":"translateX(-24px)", transition:"opacity 0.35s, transform 0.35s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22, padding:"10px 14px", background:"#111827", borderRadius:10, border:"0.5px solid #1f2937" }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:player.avatar.bg, border:`2px solid ${player.avatar.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:`0 0 10px ${player.avatar.accent}30` }}>{player.avatar.emoji}</div>
          <div>
            <div style={{ fontSize:14, fontWeight:500, color:"#e2e8f0" }}>{player.username}</div>
            <div style={{ fontSize:11, color:"#4b5563" }}>vs AlgoBot 🤖</div>
          </div>
          <button onClick={onBack} style={{ marginLeft:"auto", fontSize:11, color:"#4b5563", background:"none", border:"0.5px solid #374151", borderRadius:6, padding:"4px 10px", cursor:"pointer", transition:"color 0.2s, border-color 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.color="#9ca3af";e.currentTarget.style.borderColor="#6b7280";}} onMouseLeave={e=>{e.currentTarget.style.color="#4b5563";e.currentTarget.style.borderColor="#374151";}}>← Back</button>
        </div>

        <h2 style={{ fontSize:14, fontWeight:500, color:"#e2e8f0", marginBottom:12 }}>Choose difficulty</h2>
        <div style={{ display:"flex", gap:10, marginBottom:18 }}>
          {Object.entries(DIFFICULTIES).map(([key,d]) => (
            <div key={key} onClick={()=>setSel(key)} style={{ flex:1, padding:"12px 8px", borderRadius:10, cursor:"pointer", textAlign:"center", background:sel===key?d.bg:"#111827", border:`${sel===key?"1.5":"0.5"}px solid ${sel===key?d.border:"#1f2937"}`, transition:"all 0.2s", transform:sel===key?"translateY(-3px)":"translateY(0)", boxShadow:sel===key?`0 6px 20px ${d.color}25`:"none" }}>
              <div style={{ fontSize:12, fontWeight:500, color:d.color }}>{d.label}</div>
              <div style={{ fontSize:9, color:d.color, opacity:0.7, marginTop:3 }}>{d.hint}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#111827", border:`0.5px solid ${cfg.border}`, borderRadius:10, padding:"14px 16px", marginBottom:18, transition:"border-color 0.3s" }}>
          <div style={{ display:"flex", gap:16 }}>
            {[{label:"Tasks",val:"3"},{label:"Timer",val:sel==="easy"?"6 min":sel==="medium"?"10 min":"14 min"},{label:"AI speed",val:sel==="easy"?"Slow":sel==="medium"?"Normal":"Fast"}].map((item,i)=>(
              <div key={i} style={{ textAlign:"center", flex:1 }}>
                <div style={{ fontSize:18, fontWeight:700, color:cfg.color, transition:"color 0.3s" }}>{item.val}</div>
                <div style={{ fontSize:9, color:"#4b5563", marginTop:2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, color:"#4b5563", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>Tasks in this round</div>
          {QUESTIONS[sel].map((q,i) => {
            const tc = TAG[q.tag]||TAG.FETCH;
            return (
              <div key={q.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#111827", border:"0.5px solid #1f2937", borderRadius:8, marginBottom:6, transition:"all 0.2s", cursor:"default" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 18px #00000055";e.currentTarget.style.borderColor="#374151";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="#1f2937";}}>
                <span style={{ width:20, height:20, borderRadius:"50%", background:"#1f2937", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#6b7280", fontWeight:500 }}>{i+1}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", flex:1 }}>{q.title}</span>
                <span style={{ fontSize:9, color:tc.color, background:tc.bg, border:`0.5px solid ${tc.border}`, padding:"2px 8px", borderRadius:20 }}>{q.tag}</span>
              </div>
            );
          })}
        </div>

        <button onClick={()=>onStart(sel)}
          onMouseDown={e=>{e.currentTarget.style.animation="buttonBounce 0.3s ease-out";}}
          onAnimationEnd={e=>{e.currentTarget.style.animation="none";}}
          style={{ width:"100%", padding:"11px 0", borderRadius:10, background:"#7c3aed", color:"#fff", border:"none", fontSize:13, fontWeight:500, cursor:"pointer", transition:"box-shadow 0.2s" }}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 22px #7c3aed55";}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}
        >Start Battle →</button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN 3 — BATTLE
═══════════════════════════════════════════════ */
const BattleScreen = ({ player, difficulty, onEnd }) => {
  const cfg = DIFFICULTIES[difficulty];
  const questions = QUESTIONS[difficulty];

  const [qIdx,       setQIdx]       = useState(0);
  const [code,       setCode]       = useState(questions[0].starter);
  const [output,     setOutput]     = useState(null);
  const [showHint,   setShowHint]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [playerHP,   setPlayerHP]   = useState(100);
  const [aiHP,       setAiHP]       = useState(100);
  const [mySolved,   setMySolved]   = useState([false,false,false]);
  const [aiSolved,   setAiSolved]   = useState([false,false,false]);
  const [myScore,    setMyScore]    = useState(0);
  const [aiScore,    setAiScore]    = useState(0);
  const [combo,      setCombo]      = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(cfg.time);
  const [toasts,     setToasts]     = useState([]);
  const [aiStatus,   setAiStatus]   = useState("idle");
  const [qAnim,      setQAnim]      = useState("slideInFromRight 0.35s ease-out");

  /* anim flags */
  const [screenShake,   setScreenShake]   = useState(false);
  const [aiFlash,       setAiFlash]       = useState(false);
  const [correctGlow,   setCorrectGlow]   = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [exColor,       setExColor]       = useState("#22c55e");
  const [showHit,       setShowHit]       = useState(false);
  const [showCombo,     setShowCombo]     = useState(false);
  const [shakePlayer,   setShakePlayer]   = useState(false);
  const [shakeAi,       setShakeAi]       = useState(false);
  const [editorShake,   setEditorShake]   = useState(false);
  const [editorFocus,   setEditorFocus]   = useState(false);

  const timerRef   = useRef(null);
  const aiTimers   = useRef([]);
  const myRef      = useRef(0);
  const aiRef      = useRef(0);
  const qRef       = useRef(0);
  const endedRef   = useRef(false);
  const comboRef   = useRef(0);
  const editorIdle = useRef(null);

  useEffect(()=>{ myRef.current=myScore; },[myScore]);
  useEffect(()=>{ aiRef.current=aiScore; },[aiScore]);
  useEffect(()=>{ qRef.current=qIdx;    },[qIdx]);
  useEffect(()=>{ comboRef.current=combo; },[combo]);

  const addToast = useCallback((msg,type="info")=>{
    const id=Date.now()+Math.random();
    setToasts(t=>[...t.slice(-4),{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  },[]);

  const flash = (setter,ms=400)=>{ setter(true); setTimeout(()=>setter(false),ms); };

  const triggerCorrect = useCallback(()=>{
    flash(setCorrectGlow,450);
    setShowExplosion(true); setExColor("#22c55e");
    setTimeout(()=>setShowExplosion(false),500);
  },[]);

  const triggerWrong = useCallback(()=>{
    flash(setEditorShake,380);
    flash(setShowHit,450);
  },[]);

  const triggerAiAttack = useCallback(()=>{
    flash(setAiFlash,600);
    flash(setShakePlayer,380);
    flash(setScreenShake,480);
    setShowExplosion(true); setExColor("#818cf8");
    setTimeout(()=>setShowExplosion(false),500);
  },[]);

  const triggerComboAnim = useCallback((c)=>{
    setCombo(c); comboRef.current=c;
    flash(setShowCombo,600);
  },[]);

  const endBattle = useCallback(()=>{
    if(endedRef.current) return;
    endedRef.current=true;
    clearInterval(timerRef.current);
    aiTimers.current.forEach(clearTimeout);
    setTimeout(()=>onEnd({myScore:myRef.current,aiScore:aiRef.current,mySolved,aiSolved}),500);
  },[mySolved,aiSolved,onEnd]);

  useEffect(()=>{
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{ if(t<=1){clearInterval(timerRef.current);endBattle();return 0;} return t-1; });
    },1000);
    return()=>clearInterval(timerRef.current);
  },[endBattle]);

  useEffect(()=>{
    aiTimers.current.forEach(clearTimeout); aiTimers.current=[]; let cum=0;
    questions.forEach((q,qi)=>{
      const delay=q.aiTime*cfg.aiMult*(0.7+Math.random()*0.6);
      const willSolve=Math.random()<cfg.aiSolveChance;
      const t1=setTimeout(()=>setAiStatus("thinking"),cum+delay*0.1);
      const t2=setTimeout(()=>setAiStatus("coding"),  cum+delay*0.45);
      const t3=setTimeout(()=>setAiStatus("testing"), cum+delay*0.85);
      aiTimers.current.push(t1,t2,t3);
      if(willSolve){
        const t4=setTimeout(()=>{
          setAiStatus("passed");
          setAiSolved(prev=>{const n=[...prev];n[qi]=true;return n;});
          setAiScore(s=>{
            const ns=s+1; aiRef.current=ns;
            setPlayerHP(h=>Math.max(0,h-15));
            triggerAiAttack();
            addToast(`🤖 AlgoBot completed "${q.title}"`, "danger");
            if(qRef.current===qi && qi<questions.length-1){
              setTimeout(()=>{setQAnim("slideInFromRight 0.35s ease-out");setQIdx(qi+1);setCode(questions[qi+1].starter);setOutput(null);setShowHint(false);},1200);
            }
            if(qi===questions.length-1) setTimeout(()=>endBattle(),1200);
            return ns;
          });
          setTimeout(()=>setAiStatus(qi<questions.length-1?"thinking":"idle"),2000);
        },cum+delay);
        aiTimers.current.push(t4);
      } else {
        const t4=setTimeout(()=>{ setAiStatus("failed"); setTimeout(()=>setAiStatus("thinking"),2500); },cum+delay);
        aiTimers.current.push(t4);
      }
      cum+=delay+2200;
    });
    return()=>aiTimers.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const handleSubmit = useCallback(()=>{
    if(submitting||mySolved[qIdx]) return;
    setSubmitting(true);
    const q=questions[qIdx];
    const passed=q.validate(code);
    setSubmitting(false);
    if(passed){
      setOutput({type:"success",msg:"✅ Task complete! All checks passed."});
      setMySolved(prev=>{const n=[...prev];n[qIdx]=true;return n;});
      triggerCorrect();
      const nc=comboRef.current+1;
      if(nc>=2) triggerComboAnim(nc); else {setCombo(nc);comboRef.current=nc;}
      setMyScore(s=>{
        const ns=s+1; myRef.current=ns;
        setAiHP(h=>Math.max(0,h-15));
        flash(setShakeAi,380);
        addToast(`✅ You completed "${q.title}"!`,"success");
        if(qIdx<questions.length-1){
          setTimeout(()=>{setQAnim("slideInFromRight 0.35s ease-out");setQIdx(qIdx+1);setCode(questions[qIdx+1].starter);setOutput(null);setShowHint(false);},1000);
        } else { setTimeout(()=>endBattle(),800); }
        return ns;
      });
    } else {
      setOutput({type:"error",msg:"❌ Not quite. Check the hints and try again."});
      setCombo(0); comboRef.current=0;
      triggerWrong();
    }
  },[submitting,mySolved,qIdx,code,questions,addToast,endBattle,triggerCorrect,triggerWrong,triggerComboAnim]);

  useEffect(()=>{
    const h=e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")handleSubmit();};
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[handleSubmit]);

  const currentQ=questions[qIdx];
  const tc=TAG[currentQ.tag]||TAG.FETCH;

  const AI_STATUS={
    idle:    {label:"Idle",       color:"#4b5563"},
    thinking:{label:"Thinking…",  color:"#60a5fa"},
    coding:  {label:"Coding…",    color:"#fbbf24"},
    testing: {label:"Testing…",   color:"#c084fc"},
    passed:  {label:"Task done!", color:"#4ade80"},
    failed:  {label:"Task failed",color:"#f87171"},
  };
  const aiCfg=AI_STATUS[aiStatus]||AI_STATUS.idle;

  return (
    <div style={{
      height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden",
      background:aiFlash?"#0e0b20":"#060a10", transition:"background 0.35s",
      animation:screenShake?"screenShake 0.45s ease-out":"none",
    }}>
      <GlobalStyles />
      <Toast toasts={toasts} />
      <HitMarker visible={showHit} />
      <ExplosionRing visible={showExplosion} color={exColor} />
      <ComboPop combo={combo} visible={showCombo} />

      {/* TOP BAR */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px", background:"#0d1117", borderBottom:"0.5px solid #1e2536" }}>
        <HPBar hp={playerHP} label={`${player.avatar.emoji} ${player.username}`} shake={shakePlayer} />
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <Timer seconds={timeLeft} total={cfg.time} />
          <div style={{ display:"flex", gap:6 }}>
            {questions.map((_,i)=>(
              <div key={i} onClick={()=>{setQIdx(i);setOutput(null);setShowHint(false);setQAnim("fadeSlideIn 0.3s ease-out");}}
                style={{ width:22, height:22, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, transition:"all 0.25s",
                  background:mySolved[i]?"#052e16":aiSolved[i]?"#450a0a":i===qIdx?"#1e1b4b":"#111827",
                  border:`1.5px solid ${mySolved[i]?"#4ade80":aiSolved[i]?"#f87171":i===qIdx?"#7c3aed":"#374151"}`,
                  color:mySolved[i]?"#4ade80":aiSolved[i]?"#f87171":i===qIdx?"#a78bfa":"#4b5563",
                  transform:i===qIdx?"scale(1.2)":"scale(1)",
                  boxShadow:mySolved[i]?"0 0 8px #4ade8055":aiSolved[i]?"0 0 8px #f8717155":i===qIdx?"0 0 10px #7c3aed55":"none",
                }}>
                {mySolved[i]?"✓":aiSolved[i]?"✗":i+1}
              </div>
            ))}
          </div>
          <div style={{ fontSize:10, color:"#4b5563" }}>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>{myScore}</span>
            <span style={{ color:"#374151", margin:"0 3px" }}>—</span>
            <span style={{ color:"#f87171", fontWeight:600 }}>{aiScore}</span>
          </div>
          {combo>=2&&(
            <div style={{ fontSize:9, color:"#fbbf24", background:"#2d1a00", border:"0.5px solid #78350f", padding:"1px 8px", borderRadius:20, fontWeight:600 }}>
              🔥 x{combo} COMBO
            </div>
          )}
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
          <HPBar hp={aiHP} label="🤖 AlgoBot" flipped shake={shakeAi} />
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:aiCfg.color, background:"#111827", border:"0.5px solid #1f2937", padding:"2px 8px", borderRadius:20, transition:"color 0.3s" }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:aiCfg.color, display:"inline-block", transition:"background 0.3s", animation:aiStatus==="thinking"||aiStatus==="coding"?"dotGlow 1s ease-in-out infinite":"none" }} />
            {aiCfg.label}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"2fr 3fr", minHeight:0 }}>

        {/* LEFT — question */}
        <div style={{ borderRight:"0.5px solid #1e2536", overflow:"auto", padding:16, background:"#0a0d14", animation:qAnim }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:10, color:tc.color, background:tc.bg, border:`0.5px solid ${tc.border}`, padding:"2px 8px", borderRadius:20, fontWeight:500 }}>{currentQ.tag}</span>
            <span style={{ fontSize:10, color:"#4b5563" }}>Task {qIdx+1}/{questions.length}</span>
            {mySolved[qIdx]&&<span style={{ fontSize:10, color:"#4ade80", marginLeft:"auto" }}>✅ Done</span>}
          </div>
          <h3 style={{ fontSize:15, fontWeight:600, color:"#e2e8f0", marginBottom:8 }}>{currentQ.title}</h3>
          <p style={{ fontSize:12, color:"#9ca3af", lineHeight:1.7, marginBottom:14, whiteSpace:"pre-wrap" }}>{currentQ.description}</p>
          {currentQ.examples.map((ex,i)=>(
            <div key={i} style={{ background:"#111827", border:"0.5px solid #1f2937", borderRadius:8, padding:"10px 12px", marginBottom:8, transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 14px #00000060";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ fontSize:9, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>{ex.label}</div>
              <pre style={{ fontFamily:"monospace", fontSize:11, color:"#6ee7b7", margin:0, whiteSpace:"pre-wrap", lineHeight:1.6 }}>{ex.code}</pre>
            </div>
          ))}
          <div style={{ background:"#111827", border:"0.5px solid #1f2937", borderRadius:8, padding:"10px 12px", marginTop:12 }}>
            <div style={{ fontSize:9, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Requirements</div>
            {currentQ.hints.map((h,i)=>(
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", fontSize:11, color:"#6b7280", marginBottom:5, lineHeight:1.5 }}>
                <span style={{ color:tc.color, marginTop:1, flexShrink:0 }}>→</span>
                <span style={{ fontFamily:"monospace" }}>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — editor */}
        <div style={{ display:"flex", flexDirection:"column", minHeight:0, animation:editorShake?"editorShake 0.35s ease-out":"none" }}>
          {mySolved[qIdx]&&(
            <div style={{ padding:"6px 16px", background:"#052e16", borderBottom:"0.5px solid #166534", fontSize:11, color:"#4ade80", fontWeight:500 }}>
              ✅ Task completed — move to next task or keep practicing
            </div>
          )}
          {aiSolved[qIdx]&&!mySolved[qIdx]&&(
            <div style={{ padding:"6px 16px", background:"#1a0a00", borderBottom:"0.5px solid #78350f", fontSize:11, color:"#fb923c" }}>
              🤖 AlgoBot finished this — still try it for XP!
            </div>
          )}

          <div style={{
            flex:1, minHeight:0,
            animation:correctGlow?"correctGlow 0.45s ease-out":"none",
            boxShadow:editorFocus?"inset 0 0 0 1.5px #7c3aed, 0 0 14px #7c3aed25":"none",
            transition:"box-shadow 0.3s",
          }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={v=>{
                setCode(v||"");
                setEditorFocus(true);
                clearTimeout(editorIdle.current);
                editorIdle.current=setTimeout(()=>setEditorFocus(false),1500);
              }}
              theme="vs-dark"
              options={{ fontSize:13, minimap:{enabled:false}, scrollBeyondLastLine:false, lineNumbers:"on", wordWrap:"on", tabSize:2, automaticLayout:true, padding:{top:12}, fontFamily:"'JetBrains Mono','Fira Code',monospace", fontLigatures:true }}
            />
          </div>

          {output&&(
            <div style={{ padding:"10px 16px", borderTop:"0.5px solid #1e2536", background:"#0a0d14", fontSize:12, fontWeight:500, color:output.type==="success"?"#4ade80":"#f87171", animation:"fadeSlideIn 0.25s ease-out" }}>
              {output.msg}
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"#0d1117", borderTop:"0.5px solid #1e2536", gap:10 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#4b5563" }}>
                You <span style={{ color:"#a78bfa", fontWeight:600 }}>{myScore}</span>
                <span style={{ color:"#374151", margin:"0 4px" }}>—</span>
                Bot <span style={{ color:"#f87171", fontWeight:600 }}>{aiScore}</span>
              </span>
              <button onClick={()=>setShowHint(h=>!h)}
                style={{ fontSize:10, color:"#4b5563", background:"none", border:"0.5px solid #374151", borderRadius:6, padding:"3px 8px", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.color="#9ca3af";e.currentTarget.style.borderColor="#6b7280";}}
                onMouseLeave={e=>{e.currentTarget.style.color="#4b5563";e.currentTarget.style.borderColor="#374151";}}>
                {showHint?"Hide hint":"Hint?"}
              </button>
              {showHint&&(
                <span style={{ fontSize:10, color:"#fbbf24", background:"#2d1a00", border:"0.5px solid #78350f", borderRadius:6, padding:"3px 8px", animation:"fadeSlideIn 0.2s ease-out" }}>
                  💡 {currentQ.hints[0]}
                </span>
              )}
            </div>
            <button onClick={handleSubmit} disabled={submitting||mySolved[qIdx]}
              onMouseDown={e=>{if(!submitting&&!mySolved[qIdx])e.currentTarget.style.animation="buttonBounce 0.3s ease-out";}}
              onAnimationEnd={e=>{e.currentTarget.style.animation="none";}}
              style={{ padding:"7px 20px", borderRadius:8, fontSize:12, fontWeight:500, border:"none", cursor:"pointer", transition:"all 0.15s", background:mySolved[qIdx]?"#052e16":submitting?"#1f2937":"#7c3aed", color:mySolved[qIdx]?"#4ade80":submitting?"#4b5563":"#fff" }}
              onMouseEnter={e=>{if(!mySolved[qIdx]&&!submitting)e.currentTarget.style.boxShadow="0 0 18px #7c3aed65";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
              {mySolved[qIdx]?"✅ Done":submitting?"Checking…":"Submit →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN 4 — RESULTS
═══════════════════════════════════════════════ */
const ResultsScreen = ({ player, difficulty, result, onPlayAgain, onChangeDiff }) => {
  const won=result.myScore>result.aiScore, tied=result.myScore===result.aiScore;
  const [entered, setEntered] = useState(false);
  useEffect(()=>{ setTimeout(()=>setEntered(true),30); },[]);

  return (
    <div style={{ minHeight:"100vh", background:"#060a10", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      {won&&<Confetti />}
      <div style={{ width:"100%", maxWidth:400, textAlign:"center", opacity:entered?1:0, transform:entered?"translateY(0)":"translateY(14px)", transition:"opacity 0.4s, transform 0.4s" }}>
        <div style={{ fontSize:52, marginBottom:8, display:"inline-block", animation:entered?"winTextPop 0.55s cubic-bezier(0.34,1.56,0.64,1)":"none" }}>
          {tied?"🤝":won?"🏆":"😤"}
        </div>
        <h2 style={{ fontSize:22, fontWeight:700, color:won?"#4ade80":tied?"#fb923c":"#f87171", marginBottom:4, animation:entered?"winTextPop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both":"none" }}>
          {tied?"It's a Tie!":won?"You Win!":"Bot Wins!"}
        </h2>
        <p style={{ fontSize:12, color:"#4b5563", marginBottom:22 }}>{won?"Solid fullstack skills!":tied?"Equally matched!":"Keep practicing!"}</p>

        <div style={{ background:"#0d1117", border:"0.5px solid #1e2536", borderRadius:14, padding:20, marginBottom:12, animation:entered?"fadeSlideIn 0.4s ease-out 0.12s both":"none" }}>
          <div style={{ fontSize:10, color:"#4b5563", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>Score</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:player.avatar.bg, border:`2px solid ${player.avatar.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, margin:"0 auto 6px", boxShadow:won?`0 0 24px ${player.avatar.accent}60`:"none", transition:"box-shadow 0.5s" }}>{player.avatar.emoji}</div>
              <div style={{ fontSize:26, fontWeight:700, color:"#a78bfa" }}>{result.myScore}</div>
              <div style={{ fontSize:11, color:"#4b5563" }}>{player.username}</div>
            </div>
            <div style={{ fontSize:16, color:"#374151", fontWeight:700 }}>VS</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"#1e1b4b", border:"2px solid #f87171", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, margin:"0 auto 6px" }}>🤖</div>
              <div style={{ fontSize:26, fontWeight:700, color:"#f87171" }}>{result.aiScore}</div>
              <div style={{ fontSize:11, color:"#4b5563" }}>AlgoBot</div>
            </div>
          </div>
        </div>

        <div style={{ background:"#0d1117", border:"0.5px solid #1e2536", borderRadius:14, padding:16, marginBottom:18, animation:entered?"fadeSlideIn 0.4s ease-out 0.22s both":"none" }}>
          <div style={{ fontSize:10, color:"#4b5563", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Task breakdown</div>
          {QUESTIONS[difficulty].map((q,i)=>{
            const t=TAG[q.tag]||TAG.FETCH;
            return (
              <div key={q.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:i<2?"0.5px solid #1f2937":"none" }}>
                <span style={{ fontSize:10, color:t.color, background:t.bg, border:`0.5px solid ${t.border}`, padding:"1px 6px", borderRadius:20 }}>{q.tag}</span>
                <span style={{ fontSize:11, color:"#9ca3af", flex:1, textAlign:"left" }}>{q.title}</span>
                <span style={{ fontSize:11, color:result.mySolved[i]?"#4ade80":"#374151" }}>{result.mySolved[i]?"✓ You":"—"}</span>
                <span style={{ fontSize:11, color:result.aiSolved[i]?"#f87171":"#374151" }}>{result.aiSolved[i]?"✓ Bot":"—"}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display:"flex", gap:10, animation:entered?"fadeSlideIn 0.4s ease-out 0.32s both":"none" }}>
          <button onClick={onChangeDiff}
            style={{ flex:1, padding:"10px 0", borderRadius:10, background:"transparent", border:"0.5px solid #374151", color:"#6b7280", fontSize:12, cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#6b7280";e.currentTarget.style.color="#9ca3af";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#374151";e.currentTarget.style.color="#6b7280";}}>
            Change difficulty
          </button>
          <button onClick={onPlayAgain}
            onMouseDown={e=>{e.currentTarget.style.animation="buttonBounce 0.3s ease-out";}}
            onAnimationEnd={e=>{e.currentTarget.style.animation="none";}}
            style={{ flex:1, padding:"10px 0", borderRadius:10, background:"#7c3aed", color:"#fff", border:"none", fontSize:12, fontWeight:500, cursor:"pointer", transition:"box-shadow 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 20px #7c3aed60";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
            Play again →
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════ */
export default function FullstackBattle() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("avatar");
  const [player, setPlayer] = useState(null);
  const [diff,   setDiff]   = useState(null);
  const [result, setResult] = useState(null);

  let currentScreen = null;
  if(screen==="avatar")  currentScreen=<AvatarScreen onNext={p=>{setPlayer(p);setScreen("level");}}/>;
  if(screen==="level")   currentScreen=<LevelScreen player={player} onStart={d=>{setDiff(d);setScreen("battle");}} onBack={()=>setScreen("avatar")}/>;
  if(screen==="battle")  currentScreen=<BattleScreen key={`${diff}-${Date.now()}`} player={player} difficulty={diff} onEnd={r=>{setResult(r);setScreen("results");}}/>;
  if(screen==="results") currentScreen=<ResultsScreen player={player} difficulty={diff} result={result} onPlayAgain={()=>setScreen("battle")} onChangeDiff={()=>setScreen("level")}/>;

  return (
    <div>
      <GlobalStyles />
      <div style={{ position:"fixed", bottom:20, left:20, zIndex:999 }}>
        <button onClick={()=>navigate('/full-stack')}
          style={{ display:"flex", alignItems:"center", gap:6, background:"#0d1117", border:"1px solid #374151", color:"#4ade80", padding:"6px 10px", borderRadius:8, cursor:"pointer", fontSize:12, opacity:0.8, transition:"opacity 0.2s, box-shadow 0.2s" }}
          onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.boxShadow="0 0 10px #4ade8030";}}
          onMouseLeave={e=>{e.currentTarget.style.opacity="0.8";e.currentTarget.style.boxShadow="none";}}>
          ← Back
        </button>
      </div>
      {currentScreen}
    </div>
  );
}