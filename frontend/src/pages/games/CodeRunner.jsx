import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}

    @keyframes laneGlow{0%,100%{box-shadow:inset 0 0 0 0 transparent}50%{box-shadow:inset 0 0 20px #6366f115}}
    @keyframes playerBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-4px)}}
    @keyframes aiBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(4px)}}
    @keyframes laneMove{0%,100%{transform:translateX(-50%)}20%{transform:translateX(-60%)}80%{transform:translateX(-40%)}}
    @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-6px)}60%{transform:translateX(6px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}
    @keyframes hpDrain{0%{filter:brightness(1)}50%{filter:brightness(2) saturate(3)}100%{filter:brightness(1)}}
    @keyframes comboText{0%{transform:scale(.5) translateY(8px);opacity:0}50%{transform:scale(1.2) translateY(-2px);opacity:1}100%{transform:scale(1) translateY(0);opacity:1}}
    @keyframes floatKill{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-44px);opacity:0}}
    @keyframes scanline{0%{top:-3px}100%{top:100%}}
    @keyframes taskSlide{from{transform:translateY(-12px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes editorGlow{0%,100%{box-shadow:0 0 0 1px #1e2d4a}50%{box-shadow:0 0 0 2px #6366f1,0 0 18px #6366f120}}
    @keyframes wrongFlash{0%,100%{background:#08101e}40%{background:#1f0505}}
    @keyframes successFlash{0%,100%{background:#08101e}40%{background:#021508}}
    @keyframes levelUp{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}
    @keyframes trailFade{from{opacity:.6;transform:scaleX(1)}to{opacity:0;transform:scaleX(.3)}}
    @keyframes dashMove{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-40}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes hpShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
    @keyframes bossWarning{0%,100%{opacity:1}50%{opacity:.2}}
    @keyframes winPop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}

    .cr-root{font-family:'JetBrains Mono',monospace;background:#06080e;color:#e2e8f0;height:100vh;display:flex;flex-direction:column;overflow:hidden;position:relative}
    .scanline{position:fixed;top:-3px;left:0;width:100%;height:3px;background:linear-gradient(transparent,rgba(99,102,241,.07),transparent);animation:scanline 5s linear infinite;pointer-events:none;z-index:200}
    .lane-div{flex:1;border-right:1px solid #0d1a2e;position:relative;display:flex;flex-direction:column;align-items:center;overflow:hidden}
    .lane-div:last-child{border-right:none}
    .lane-line{position:absolute;left:50%;top:0;width:1px;height:100%;background:linear-gradient(#0d1a2e 0%,#1e2d4a40 50%,#0d1a2e 100%)}
    .submit-btn{background:#0f1830;border:1.5px solid #4f46e5;border-radius:10px;color:#818cf8;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;padding:11px 0;cursor:pointer;transition:all .15s;letter-spacing:.04em}
    .submit-btn:hover{background:#111a40;border-color:#6366f1;box-shadow:0 0 18px #6366f130}
    .submit-btn:active{transform:scale(.96)}
    .submit-btn:disabled{opacity:.3;cursor:not-allowed}
    .lane-btn{background:#0a1020;border:1px solid #1e2d4a;border-radius:8px;color:#4b5563;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;padding:7px 12px;cursor:pointer;transition:all .15s}
    .lane-btn:hover{border-color:#374151;color:#9ca3af}
    .lane-btn:active{transform:scale(.94)}
  `}</style>
);

/* ═══════════════════════════════════════════════
   TASKS — categorised fullstack
═══════════════════════════════════════════════ */
const TASKS = {
  easy: [
    { id:"e1", tag:"BUG",      problem:"Fix the event handler — wrong attribute name",         starter:`<button onclick={handleClick}>Submit</button>`,                                                    validate:c=>c.includes("onClick"),          hint:"React uses camelCase event names" },
    { id:"e2", tag:"BUG",      problem:"Fix the equality check — assignment instead of compare", starter:`if(user = null) { redirect(); }`,                                                               validate:c=>c.includes("==="),              hint:"Use triple equals" },
    { id:"e3", tag:"API",      problem:"Complete the fetch call to /api/users",                 starter:`async function getUsers() {\n  // fetch from /api/users\n}`,                                      validate:c=>c.includes("fetch")&&c.includes("/api/users"), hint:"Use fetch() with await" },
    { id:"e4", tag:"STYLE",    problem:"Add the missing CSS class to show the modal",           starter:`<div class="">Modal content</div>`,                                                               validate:c=>c.includes("modal")||c.includes("className"), hint:"Add className='modal'" },
    { id:"e5", tag:"LOGIC",    problem:"Return only active users from the array",               starter:`function getActive(users) {\n  // filter where user.active === true\n}`,                          validate:c=>c.includes("filter")&&c.includes("active"),   hint:"Use .filter()" },
  ],
  medium: [
    { id:"m1", tag:"AUTH",     problem:"Attach JWT token to the Authorization header",          starter:`async function secureGet(url, token) {\n  return fetch(url);\n}`,                                validate:c=>c.includes("Authorization")&&c.includes("Bearer"), hint:"Add headers: { Authorization: `Bearer ${token}` }" },
    { id:"m2", tag:"FORM",     problem:"Validate: email must include @ and password >= 8 chars", starter:`function validate(email, password) {\n  // return true if valid\n}`,                            validate:c=>c.includes("@")&&(c.includes("length")||c.includes("8")), hint:"Check .includes('@') and .length >= 8" },
    { id:"m3", tag:"API",      problem:"Handle fetch errors — catch and log them",              starter:`async function getData(url) {\n  const res = await fetch(url);\n  return res.json();\n}`,         validate:c=>c.includes("catch")||c.includes("try"),         hint:"Wrap in try/catch" },
    { id:"m4", tag:"LOGIC",    problem:"Debounce: return fn that fires after delay ms",         starter:`function debounce(fn, delay) {\n  // implement\n}`,                                               validate:c=>c.includes("setTimeout")&&c.includes("clearTimeout"), hint:"Use clearTimeout + setTimeout" },
    { id:"m5", tag:"STATE",    problem:"Fix useState — initial value should be empty array",    starter:`const [items, setItems] = useState(null);`,                                                       validate:c=>c.includes("useState([])"),     hint:"useState([]) not useState(null)" },
  ],
  hard: [
    { id:"h1", tag:"SECURITY", problem:"Decode JWT payload without a library",                  starter:`function decodeJWT(token) {\n  // split by '.', decode base64 payload\n}`,                       validate:c=>c.includes("split")&&(c.includes("atob")||c.includes("Buffer"))&&c.includes("JSON.parse"), hint:"atob(payload.replace(/-/g,'+').replace(/_/g,'/'))" },
    { id:"h2", tag:"BACKEND",  problem:"Rate limiter — max 5 calls per IP in 60s window",      starter:`function rateLimiter(maxCalls, windowMs) {\n  // use Map\n  return function(ip) {};\n}`,          validate:c=>c.includes("Map")&&(c.includes("Date.now")||c.includes("timestamp"))&&c.includes("return"), hint:"Store { count, start } per IP in a Map" },
    { id:"h3", tag:"PERF",     problem:"Memoize: cache results of expensive function",          starter:`function memoize(fn) {\n  // return memoized version\n}`,                                         validate:c=>c.includes("Map")||c.includes("cache")||c.includes("{}"),  hint:"Cache results by args using a Map or plain object" },
    { id:"h4", tag:"API",      problem:"Retry fetch with exponential backoff (3 attempts)",     starter:`async function fetchWithRetry(url, retries=3) {\n  // retry on failure\n}`,                       validate:c=>(c.includes("Math.pow")||c.includes("**")||c.includes("2*"))&&c.includes("setTimeout"), hint:"Wait 2^i * 1000ms between retries" },
    { id:"h5", tag:"LOGIC",    problem:"Deep clone an object without JSON.parse tricks",        starter:`function deepClone(obj) {\n  // recursively clone\n}`,                                            validate:c=>c.includes("typeof")&&c.includes("Object")&&c.includes("return"), hint:"Check typeof === 'object', recurse for nested" },
  ],
};

const TAG_COLOR = {
  BUG:"#f87171", API:"#38bdf8", AUTH:"#fbbf24", FORM:"#f472b6",
  LOGIC:"#34d399", STATE:"#818cf8", SECURITY:"#f87171", BACKEND:"#fb923c",
  PERF:"#60a5fa", STYLE:"#a78bfa",
};

const COMBO_THRESHOLD = 3;
const LEVELS = ["easy","easy","medium","medium","hard","hard"];

/* ═══════════════════════════════════════════════
   HP BAR
═══════════════════════════════════════════════ */
function HPBar({ hp, label, flipped, shaking }) {
  const pct = Math.max(0, Math.min(100, hp));
  const col = pct > 60 ? "#22c55e" : pct > 30 ? "#f97316" : "#ef4444";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:flipped?"flex-end":"flex-start",
      animation:shaking?"hpShake .35s ease-out":"none" }}>
      <span style={{ fontSize:9, color:"#374151", letterSpacing:"0.12em", textTransform:"uppercase" }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexDirection:flipped?"row-reverse":"row" }}>
        <div style={{ width:90, height:6, background:"#0d1624", borderRadius:3, overflow:"hidden", border:"0.5px solid #1e2d4a",
          animation:shaking?"hpDrain .35s ease-out":"none" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:3, transition:"width .5s, background .4s",
            boxShadow:`0 0 6px ${col}60` }}/>
        </div>
        <span style={{ fontSize:11, fontWeight:700, color:col, fontFamily:"JetBrains Mono", minWidth:28 }}>{hp}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RACE TRACK — horizontal progress race
   playerProg & aiProg: 0–100 (finish line = 100)
═══════════════════════════════════════════════ */
function RaceTrack({ playerProg, aiProg, level, combo, shaking, playerAvatar, aiAvatar }) {
  const lvlName = ["easy","easy","medium","medium","hard","hard"][Math.min(level-1,5)];
  const trackColor = lvlName==="hard" ? "#ef4444" : lvlName==="medium" ? "#f97316" : "#6366f1";

  // clamp to [0,97] so emoji stays on track
  const pPct = Math.min(97, Math.max(0, playerProg));
  const aPct = Math.min(97, Math.max(0, aiProg));

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden",
      animation:shaking?"shake .4s ease-out":"none", padding:"0 0 4px" }}>

      {/* header row */}
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:10,
        padding:"6px 12px", borderBottom:`1px solid ${trackColor}20`, flexShrink:0 }}>
        <div style={{ width:5, height:5, borderRadius:"50%", background:trackColor, animation:"pulse 1.2s infinite" }}/>
        <span style={{ fontSize:9, color:trackColor, letterSpacing:"0.15em", textTransform:"uppercase" }}>
          Level {level} · {lvlName}
        </span>
        {combo >= 2 && (
          <span style={{ fontSize:9, color:"#fbbf24", background:"#2d1a00", border:"0.5px solid #78350f",
            padding:"1px 7px", borderRadius:20, fontWeight:700, animation:"comboText .3s ease-out" }}>
            🔥 x{combo}
          </span>
        )}
        <span style={{ fontSize:9, color:"#1e2d4a", marginLeft:"auto" }}>→ FINISH</span>
      </div>

      {/* race area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
        gap:0, padding:"0 14px", position:"relative" }}>

        {/* background grid lines */}
        {[20,40,60,80].map(x => (
          <div key={x} style={{ position:"absolute", left:`${x}%`, top:0, bottom:0,
            width:1, background:"#0d1624", pointerEvents:"none" }}/>
        ))}

        {/* START label */}
        <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          fontSize:8, color:"#1e2d4a", letterSpacing:"0.1em", textTransform:"uppercase", zIndex:2 }}>
          START
        </div>

        {/* FINISH line */}
        <div style={{ position:"absolute", right:14, top:0, bottom:0, width:2,
          background:`linear-gradient(${trackColor}80, ${trackColor}20, ${trackColor}80)`,
          zIndex:2 }}>
          <div style={{ position:"absolute", top:"50%", right:4, transform:"translateY(-50%)",
            fontSize:8, color:trackColor, letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
            FINISH
          </div>
        </div>

        {/* ── PLAYER LANE ── */}
        <div style={{ flex:1, display:"flex", alignItems:"center", position:"relative",
          borderBottom:"1px solid #0d1828", minHeight:0 }}>
          {/* track strip */}
          <div style={{ position:"absolute", left:0, right:0, height:28,
            background:"#060d1a", border:"1px solid #0d1828", borderRadius:6,
            overflow:"hidden" }}>
            {/* progress fill */}
            <div style={{ position:"absolute", left:0, top:0, bottom:0,
              width:`${pPct}%`, background:`linear-gradient(90deg, ${trackColor}18, ${trackColor}30)`,
              transition:"width .4s cubic-bezier(.34,1.2,.64,1)",
              borderRight:`2px solid ${trackColor}60` }}/>
            {/* dashed center line */}
            {[0,1,2,3,4,5,6,7,8,9].map(i=>(
              <div key={i} style={{ position:"absolute", left:`${i*11+2}%`, top:"50%",
                transform:"translateY(-50%)", width:"6%", height:1, background:"#1e2d4a" }}/>
            ))}
          </div>
          {/* player emoji on track */}
          <div style={{
            position:"absolute", left:`${pPct}%`, top:"50%",
            transform:"translate(-50%, -50%)",
            fontSize:22, zIndex:3,
            transition:"left .4s cubic-bezier(.34,1.2,.64,1)",
            animation:"playerBob .9s ease-in-out infinite",
            filter:"drop-shadow(0 0 8px #818cf8)",
          }}>🏃</div>
          {/* label */}
          <div style={{ position:"absolute", left:0, top:-16, fontSize:8, color:"#818cf8",
            fontWeight:700, letterSpacing:"0.1em" }}>YOU</div>
          {/* progress % */}
          <div style={{ position:"absolute", right:18, top:-16, fontSize:8,
            color: pPct >= aPct ? "#22c55e" : "#4b5563", fontWeight:700 }}>
            {Math.round(pPct)}%
          </div>
        </div>

        {/* gap */}
        <div style={{ height:16, flexShrink:0 }}/>

        {/* ── AI LANE ── */}
        <div style={{ flex:1, display:"flex", alignItems:"center", position:"relative",
          minHeight:0 }}>
          {/* track strip */}
          <div style={{ position:"absolute", left:0, right:0, height:28,
            background:"#06080e", border:"1px solid #1a0a0a", borderRadius:6,
            overflow:"hidden" }}>
            {/* progress fill */}
            <div style={{ position:"absolute", left:0, top:0, bottom:0,
              width:`${aPct}%`, background:"linear-gradient(90deg, #ef444418, #ef444428)",
              transition:"width .4s cubic-bezier(.34,1.2,.64,1)",
              borderRight:"2px solid #ef444450" }}/>
            {[0,1,2,3,4,5,6,7,8,9].map(i=>(
              <div key={i} style={{ position:"absolute", left:`${i*11+2}%`, top:"50%",
                transform:"translateY(-50%)", width:"6%", height:1, background:"#1e0a0a" }}/>
            ))}
          </div>
          {/* ai emoji */}
          <div style={{
            position:"absolute", left:`${aPct}%`, top:"50%",
            transform:"translate(-50%, -50%)",
            fontSize:22, zIndex:3,
            transition:"left .4s cubic-bezier(.34,1.2,.64,1)",
            animation:"aiBob 1.1s ease-in-out infinite",
            filter:"drop-shadow(0 0 8px #ef444480)",
          }}>🤖</div>
          {/* label */}
          <div style={{ position:"absolute", left:0, top:-16, fontSize:8, color:"#ef4444",
            fontWeight:700, letterSpacing:"0.1em" }}>BOT</div>
          {/* progress % */}
          <div style={{ position:"absolute", right:18, top:-16, fontSize:8,
            color: aPct > pPct ? "#ef4444" : "#4b5563", fontWeight:700 }}>
            {Math.round(aPct)}%
          </div>
        </div>

      </div>

      {/* bottom gap indicator */}
      <div style={{ padding:"6px 14px", borderTop:"1px solid #0d1624", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        {pPct > aPct ? (
          <span style={{ fontSize:9, color:"#22c55e" }}>▲ You're ahead by {Math.round(pPct - aPct)}%</span>
        ) : pPct < aPct ? (
          <span style={{ fontSize:9, color:"#ef4444" }}>▼ Bot is ahead by {Math.round(aPct - pPct)}%</span>
        ) : (
          <span style={{ fontSize:9, color:"#374151" }}>— Tied</span>
        )}
        <span style={{ fontSize:9, color:"#1e2d4a" }}>· Correct = +10% · Wrong = +5% bot</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TASK CARD
═══════════════════════════════════════════════ */
function TaskCard({ task, code, setCode, onSubmit, submitting, wrongAnim, correctAnim, showHint, onHint }) {
  if (!task) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
      <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid #1e2d4a",
        borderTop:"2px solid #6366f1", animation:"spin 1s linear infinite" }}/>
      <span style={{ fontSize:11, color:"#374151" }}>awaiting task…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const tagCol = TAG_COLOR[task.tag] || "#6366f1";

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:0, animation:"taskSlide .3s ease-out",
      background: correctAnim?"#021508":wrongAnim?"#1a0303":"transparent", transition:"background .3s" }}>

      {/* problem header */}
      <div style={{ padding:"10px 14px", borderBottom:"1px solid #0d1624", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <span style={{ fontSize:9, color:tagCol, background:tagCol+"18",
            border:`0.5px solid ${tagCol}50`, padding:"2px 8px", borderRadius:20, fontWeight:600 }}>
            {task.tag}
          </span>
          <span style={{ fontSize:9, color:"#374151" }}>Fix the code below</span>
          <button onClick={onHint} style={{ marginLeft:"auto", fontSize:9, color:"#374151",
            background:"none", border:"0.5px solid #1e2d4a", borderRadius:5, padding:"2px 8px", cursor:"pointer",
            fontFamily:"inherit", transition:"color .15s" }}
            onMouseEnter={e=>e.target.style.color="#9ca3af"}
            onMouseLeave={e=>e.target.style.color="#374151"}>
            {showHint?"Hide":"Hint?"}
          </button>
        </div>
        <div style={{ fontSize:13, fontWeight:600, color:"#c7d2fe", lineHeight:1.4 }}>
          {task.problem}
        </div>
        {showHint && (
          <div style={{ marginTop:8, fontSize:10, color:"#92400e", background:"#0d0900",
            border:"1px solid #78350f30", borderRadius:7, padding:"6px 10px" }}>
            💡 {task.hint}
          </div>
        )}
      </div>

      {/* editor */}
      <div style={{ flex:1, minHeight:0,
        animation: correctAnim?"editorGlow .5s ease-out":wrongAnim?"shake .35s ease-out":"none",
        boxShadow: correctAnim?"0 0 0 2px #22c55e40":"none", transition:"box-shadow .3s" }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={v => setCode(v||"")}
          theme="vs-dark"
          options={{
            fontSize:13, minimap:{enabled:false}, scrollBeyondLastLine:false,
            lineNumbers:"on", wordWrap:"on", tabSize:2, automaticLayout:true,
            padding:{top:10}, fontFamily:"'JetBrains Mono',monospace", fontLigatures:true,
          }}
        />
      </div>

      {/* submit */}
      <div style={{ padding:"10px 14px", borderTop:"1px solid #0d1624", flexShrink:0 }}>
        <button className="submit-btn" onClick={onSubmit} disabled={submitting} style={{ width:"100%" }}>
          {submitting ? "Checking…" : "⚡ Submit"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN GAME
═══════════════════════════════════════════════ */
/* ── Progress per correct answer ── */
const PROGRESS_CORRECT = 12;   // player advances
const PROGRESS_WRONG_BOT = 7;  // bot advances on player mistake
const FINISH = 100;

export default function CodeRunner() {
  const navigate = useNavigate();

  const [playerProg, setPlayerProg] = useState(0);
  const [aiProg,     setAiProg]     = useState(0);
  const [combo,      setCombo]      = useState(0);
  const [level,      setLevel]      = useState(1);
  const [task,       setTask]       = useState(null);
  const [code,       setCode]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showHint,   setShowHint]   = useState(false);
  const [xpFloats,   setXpFloats]   = useState([]);

  // anim flags
  const [trackShake,  setTrackShake]  = useState(false);
  const [correctAnim, setCorrectAnim] = useState(false);
  const [wrongAnim,   setWrongAnim]   = useState(false);
  const [bgAnim,      setBgAnim]      = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const taskIntervalRef = useRef(null);
  const aiIntervalRef   = useRef(null);
  const comboRef        = useRef(0);
  const levelRef        = useRef(1);
  const playerProgRef   = useRef(0);
  const aiProgRef       = useRef(0);

  useEffect(() => { comboRef.current    = combo;      }, [combo]);
  useEffect(() => { levelRef.current    = level;      }, [level]);
  useEffect(() => { playerProgRef.current = playerProg; }, [playerProg]);
  useEffect(() => { aiProgRef.current   = aiProg;     }, [aiProg]);

  const getTask = useCallback(() => {
    const lvl = LEVELS[Math.min(levelRef.current - 1, LEVELS.length - 1)];
    const pool = TASKS[lvl];
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const spawnTask = useCallback(() => {
    const t = getTask();
    setTask(t);
    setCode(t.starter);
    setShowHint(false);
  }, [getTask]);

  // initial task spawn
  useEffect(() => {
    spawnTask();
    return () => clearInterval(taskIntervalRef.current);
  }, [spawnTask]);

  // AI auto-advances slowly (simulating it solving tasks in background)
  useEffect(() => {
    aiIntervalRef.current = setInterval(() => {
      const lvl = levelRef.current;
      // AI speed scales with level: slow on easy, faster on hard
      const aiStep = lvl <= 2 ? 3 : lvl <= 4 ? 5 : 8;
      setAiProg(p => Math.min(FINISH, p + aiStep));
    }, 4000); // every 4 seconds
    return () => clearInterval(aiIntervalRef.current);
  }, []);

  const flash = (setter, ms=400) => { setter(true); setTimeout(()=>setter(false), ms); };

  const spawnFloat = (text, color) => {
    const id = Date.now();
    setXpFloats(f => [...f, { id, text, color }]);
    setTimeout(() => setXpFloats(f => f.filter(x => x.id !== id)), 1000);
  };

  const handleSubmit = useCallback(() => {
    if (!task || submitting) return;
    setSubmitting(true);
    const passed = task.validate(code);
    setSubmitting(false);

    if (passed) {
      const newCombo = comboRef.current + 1;
      setCombo(newCombo);
      setPlayerProg(p => Math.min(FINISH, p + PROGRESS_CORRECT));
      spawnFloat(`+${PROGRESS_CORRECT}%`, "#22c55e");
      flash(setCorrectAnim, 450);
      setBgAnim("successFlash"); setTimeout(()=>setBgAnim(null), 400);

      if (newCombo > 0 && newCombo % COMBO_THRESHOLD === 0) {
        setLevel(l => {
          const nl = Math.min(l + 1, 6);
          if (nl > l) { setShowLevelUp(true); setTimeout(()=>setShowLevelUp(false), 1800); }
          return nl;
        });
      }

      setTimeout(() => spawnTask(), 700);
    } else {
      setCombo(0);
      // wrong answer gives bot a boost
      setAiProg(p => Math.min(FINISH, p + PROGRESS_WRONG_BOT));
      spawnFloat(`Bot +${PROGRESS_WRONG_BOT}%`, "#ef4444");
      flash(setWrongAnim, 450);
      flash(setTrackShake, 380);
      setBgAnim("wrongFlash"); setTimeout(()=>setBgAnim(null), 400);
    }
  }, [task, submitting, code, spawnTask]);

  useEffect(() => {
    const h = e => { if ((e.ctrlKey||e.metaKey) && e.key==="Enter") handleSubmit(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleSubmit]);

  /* ── WIN / LOSE — first to 100% ── */
  const playerWon = playerProg >= FINISH;
  const botWon    = aiProg >= FINISH && playerProg < FINISH;

  if (playerWon || botWon) {
    const won = playerWon;
    return (
      <div style={{ height:"100vh", background: won?"#020c05":"#0a0203", display:"flex",
        alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace" }}>
        <GS/>
        <div style={{ textAlign:"center", animation:"winPop .6s cubic-bezier(.34,1.56,.64,1)" }}>
          <div style={{ fontSize:58, marginBottom:10 }}>{won?"🏆":"💀"}</div>
          <div style={{ fontFamily:"Syne,sans-serif", fontSize:32, fontWeight:800,
            color: won?"#22c55e":"#ef4444", letterSpacing:"-1px", marginBottom:4 }}>
            {won ? "YOU WIN" : "BOT WINS"}
          </div>
          <div style={{ fontSize:11, color:"#374151", marginBottom:8 }}>
            {won ? "Finish line crossed. Clean code wins the race." : "Bot crossed the finish line first. Code faster!"}
          </div>
          <div style={{ display:"flex", gap:20, justifyContent:"center", marginBottom:24 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:700, color:"#818cf8" }}>{Math.round(playerProg)}%</div>
              <div style={{ fontSize:9, color:"#374151" }}>🏃 Your progress</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:700, color:"#ef4444" }}>{Math.round(aiProg)}%</div>
              <div style={{ fontSize:9, color:"#374151" }}>🤖 Bot progress</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={()=>window.location.reload()}
              style={{ padding:"9px 22px", borderRadius:9,
                background: won?"#0c2010":"#1a0303",
                border:`1.5px solid ${won?"#22c55e":"#ef4444"}`,
                color: won?"#22c55e":"#ef4444",
                fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Race Again
            </button>
            <button onClick={()=>navigate("/full-stack")}
              style={{ padding:"9px 22px", borderRadius:9, background:"transparent",
                border:"1px solid #1e2d4a", color:"#4b5563", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cr-root" style={{ animation:bgAnim?`${bgAnim} .4s ease-out`:"none" }}>
      <GS/>
      <div className="scanline"/>

      {/* Progress floats */}
      {xpFloats.map(f => (
        <div key={f.id} style={{ position:"fixed", top:"42%", left:"50%", transform:"translateX(-50%)",
          fontSize:13, fontWeight:700, color:f.color, pointerEvents:"none", zIndex:999,
          fontFamily:"JetBrains Mono", animation:"floatKill .9s ease-out forwards", whiteSpace:"nowrap" }}>
          {f.text}
        </div>
      ))}

      {/* Level up overlay */}
      {showLevelUp && (
        <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:300, pointerEvents:"none" }}>
          <div style={{ textAlign:"center", animation:"levelUp .5s cubic-bezier(.34,1.56,.64,1)" }}>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:28, fontWeight:800, color:"#fbbf24",
              textShadow:"0 0 30px #fbbf2480" }}>LEVEL UP</div>
            <div style={{ fontSize:12, color:"#f97316", marginTop:4 }}>
              {LEVELS[Math.min(level-1,5)].toUpperCase()} MODE
            </div>
          </div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"7px 20px", background:"#07101e", borderBottom:"1px solid #0d1624", flexShrink:0 }}>

        {/* player progress pill */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:10, color:"#818cf8", fontWeight:700 }}>🏃 You</span>
          <div style={{ width:100, height:5, background:"#0d1624", borderRadius:3, overflow:"hidden",
            border:"0.5px solid #1e2d4a" }}>
            <div style={{ width:`${playerProg}%`, height:"100%", background:"#6366f1", borderRadius:3,
              transition:"width .4s", boxShadow:"0 0 6px #6366f160" }}/>
          </div>
          <span style={{ fontSize:10, fontWeight:700, color:"#818cf8" }}>{Math.round(playerProg)}%</span>
        </div>

        {/* center title + level dots */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <span style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:800, letterSpacing:"-0.5px" }}>
            <span style={{ color:"#6366f1" }}>Code</span>Runner
          </span>
          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
            {[1,2,3,4,5,6].map(i=>(
              <div key={i} style={{ width:i===level?16:6, height:6, borderRadius:3,
                background:i<level?"#6366f1":i===level?"#818cf8":"#1e2d4a", transition:"all .3s" }}/>
            ))}
          </div>
          <span style={{ fontSize:8, color:"#374151" }}>Ctrl+Enter to submit · First to 100% wins</span>
        </div>

        {/* bot progress pill */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#ef4444" }}>{Math.round(aiProg)}%</span>
          <div style={{ width:100, height:5, background:"#0d1624", borderRadius:3, overflow:"hidden",
            border:"0.5px solid #1e2d4a" }}>
            <div style={{ width:`${aiProg}%`, height:"100%", background:"#ef4444", borderRadius:3,
              transition:"width .4s", boxShadow:"0 0 6px #ef444460" }}/>
          </div>
          <span style={{ fontSize:10, color:"#ef4444", fontWeight:700 }}>🤖 Bot</span>
          <button onClick={()=>navigate("/full-stack")}
            style={{ fontSize:9, color:"#374151", background:"none", border:"1px solid #1e2d4a",
              borderRadius:5, padding:"3px 9px", cursor:"pointer", fontFamily:"inherit", marginLeft:6 }}>
            ← Exit
          </button>
        </div>
      </div>

      {/* ── MAIN SPLIT ── */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:0 }}>

        {/* LEFT — RACE TRACK */}
        <div style={{ borderRight:"1px solid #0d1624", display:"flex", flexDirection:"column", background:"#060810" }}>
          <RaceTrack
            playerProg={playerProg} aiProg={aiProg}
            level={level} combo={combo} shaking={trackShake}
          />
        </div>

        {/* RIGHT — CODING */}
        <div style={{ display:"flex", flexDirection:"column", minHeight:0, background:"#07090f" }}>
          <TaskCard
            task={task} code={code} setCode={setCode}
            onSubmit={handleSubmit} submitting={submitting}
            wrongAnim={wrongAnim} correctAnim={correctAnim}
            showHint={showHint} onHint={()=>setShowHint(h=>!h)}
          />
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"5px 20px", background:"#05080e", borderTop:"1px solid #0d1624", flexShrink:0 }}>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <span style={{ fontSize:10, color:"#374151" }}>
            Combo: <span style={{ color:combo>=3?"#fbbf24":"#4b5563", fontWeight:700 }}>{combo}</span>
          </span>
          <span style={{ fontSize:10, color:"#374151" }}>
            Level: <span style={{ color:"#818cf8", fontWeight:700 }}>{level}/6</span>
          </span>
          <span style={{ fontSize:10, color:"#374151" }}>
            Mode: <span style={{ color:level<=2?"#22c55e":level<=4?"#f97316":"#ef4444", fontWeight:600 }}>
              {LEVELS[Math.min(level-1,5)].toUpperCase()}
            </span>
          </span>
        </div>
        <span style={{ fontSize:9, color:"#1e2d4a" }}>
          Correct → +{PROGRESS_CORRECT}% you · Wrong → +{PROGRESS_WRONG_BOT}% bot · {COMBO_THRESHOLD} streak = Level Up
        </span>
      </div>
    </div>
  );
}