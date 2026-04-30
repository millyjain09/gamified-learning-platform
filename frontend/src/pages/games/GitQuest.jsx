import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    .gq{font-family:'JetBrains Mono',monospace;background:#07090f;color:#e2e8f0;height:100vh;display:flex;flex-direction:column;overflow:hidden}
    @keyframes nodeSpawn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.3)}80%{transform:scale(.9)}100%{transform:scale(1);opacity:1}}
    @keyframes lineDraw{from{stroke-dashoffset:var(--L)}to{stroke-dashoffset:0}}
    @keyframes mergeFlash{0%,100%{opacity:1}40%{opacity:.1}70%{opacity:1}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
    @keyframes popIn{0%{transform:scale(.4) translateY(8px);opacity:0}65%{transform:scale(1.12) translateY(-2px)}100%{transform:scale(1);opacity:1}}
    @keyframes floatXP{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-52px);opacity:0}}
    @keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes scanline{0%{top:-4px}100%{top:100%}}
    @keyframes wrongBg{0%,100%{background:#07090f}50%{background:#180404}}
    @keyframes successBg{0%,100%{background:#07090f}50%{background:#020d06}}
    @keyframes levelIn{from{transform:translateX(28px);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes timerShake{0%,100%{transform:scale(1)}30%{transform:scale(1.18)}70%{transform:scale(.92)}}
    @keyframes timePenalty{0%{color:#f87171;font-size:16px}100%{color:inherit;font-size:13px}}
    @keyframes inputGlow{0%,100%{box-shadow:0 0 0 1.5px #6366f1}50%{box-shadow:0 0 0 2px #818cf8,0 0 10px #6366f130}}
    @keyframes wrongInput{0%,100%{box-shadow:0 0 0 1.5px #ef4444}50%{box-shadow:0 0 0 2.5px #ef4444,0 0 12px #ef444425}}
    @keyframes correctPop{0%{box-shadow:0 0 0 2px #22c55e,0 0 18px #22c55e40}100%{box-shadow:0 0 0 1px #22c55e20}}
    @keyframes nodeGlow{0%,100%{filter:drop-shadow(0 0 3px currentColor)}50%{filter:drop-shadow(0 0 9px currentColor)}}
    .fill-inp{background:#0a1020;border:1.5px solid #1e2d4a;border-radius:8px;color:#e2e8f0;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;outline:none;padding:8px 12px;caret-color:#818cf8;text-align:center}
    .fill-inp:focus{animation:inputGlow 1.5s ease-in-out infinite}
    .fill-inp.wrong{animation:wrongInput .45s ease-out,shake .35s ease-out;border-color:#ef4444!important;color:#ef4444}
    .fill-inp.correct{animation:correctPop .5s ease-out forwards;border-color:#22c55e!important;color:#22c55e}
    .run-btn{background:#0f1830;border:1.5px solid #3b5bdb;border-radius:8px;color:#818cf8;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;padding:9px 16px;cursor:pointer;transition:all .15s}
    .run-btn:hover{background:#111a40;border-color:#6366f1;box-shadow:0 0 14px #6366f128}
    .run-btn:active{transform:scale(.94)}
    .run-btn:disabled{opacity:.3;cursor:not-allowed}
    .scanline{position:fixed;top:-4px;left:0;width:100%;height:3px;background:linear-gradient(transparent,rgba(99,102,241,.06),transparent);animation:scanline 6s linear infinite;pointer-events:none;z-index:100}
  `}</style>
);

/* ── LEVELS ── */
const LEVELS = [
  { id:1,  title:"Initialize Repository",   goal:"Start tracking a folder with Git",           story:"You have an empty folder. Tell Git to start tracking it.",                              prefix:"git ",             blank:"init",          suffix:"",   placeholder:"???",            hint:"This is always the very first Git command in any project.", xpReward:50,  treeKey:"empty",        nextTree:"init",         timeSec:60 },
  { id:2,  title:"Stage All Files",          goal:"Add every file to the staging area",         story:"Changes made. Stage everything so Git knows what to save.",                             prefix:"git add ",         blank:".",             suffix:"",   placeholder:"?",              hint:"A single character that means 'everything in this directory'.", xpReward:60,  treeKey:"init",         nextTree:"staged",       timeSec:50 },
  { id:3,  title:"First Commit",             goal:"Save your first snapshot",                   story:"Files are staged. Lock them into history with a message.",                              prefix:'git commit -m "',  blank:"first commit",  suffix:'"',  placeholder:"your message",   hint:"-m flag takes a commit message inside quotes.", xpReward:80,  treeKey:"staged",       nextTree:"commit1",      timeSec:55 },
  { id:4,  title:"Second Commit",            goal:"Add another commit on main branch",          story:"More changes done. Save another checkpoint.",                                           prefix:'git commit -m "',  blank:"update styles", suffix:'"',  placeholder:"describe change", hint:"Same pattern as before — commit with a message.", xpReward:70,  treeKey:"commit1",      nextTree:"commit2",      timeSec:50 },
  { id:5,  title:"Create Feature Branch",    goal:"Create a new branch called 'feature'",      story:"Don't break main. Isolate new work in its own branch.",                                 prefix:"git branch ",      blank:"feature",       suffix:"",   placeholder:"branch-name",    hint:"You're creating a branch — give it the name 'feature'.", xpReward:100, treeKey:"commit2",      nextTree:"branch",       timeSec:60 },
  { id:6,  title:"Switch to Feature",        goal:"Move HEAD to the feature branch",            story:"Branch exists but you're still on main. Jump to it.",                                   prefix:"git checkout ",    blank:"feature",       suffix:"",   placeholder:"branch-name",    hint:"Use the exact name of the branch you just created.", xpReward:80,  treeKey:"branch",       nextTree:"checkout",     timeSec:55 },
  { id:7,  title:"Commit on Feature",        goal:"Add a commit on the feature branch",         story:"You're on feature now. Build something and save it here.",                              prefix:'git commit -m "',  blank:"add feature",   suffix:'"',  placeholder:"feature message", hint:"This commit goes on feature, NOT on main.", xpReward:90,  treeKey:"checkout",     nextTree:"featureCommit",timeSec:55 },
  { id:8,  title:"Go Back to Main",          goal:"Switch back to main before merging",         story:"Feature work is done. Switch back to main so you can merge into it.",                  prefix:"git checkout ",    blank:"main",          suffix:"",   placeholder:"branch-name",    hint:"You need to be ON the target branch to merge INTO it.", xpReward:70,  treeKey:"featureCommit",nextTree:"featureCommit",timeSec:45 },
  { id:9,  title:"Merge Feature → Main",     goal:"Bring feature branch changes into main",     story:"You're on main. Merge the feature branch to combine both histories.",                   prefix:"git merge ",       blank:"feature",       suffix:"",   placeholder:"branch-to-merge", hint:"Name the branch you want to pull IN to current branch.", xpReward:120, treeKey:"featureCommit",nextTree:"merged",       timeSec:70 },
];

const TOTAL_XP  = LEVELS.reduce((s,l) => s + l.xpReward, 0);
const TIME_PENALTY = 10;

/* ── TREE DATA — viewBox 900x260, spread wide ── */
const TREES = {
  empty:{ nodes:[], edges:[], labels:[] },
  init:{
    nodes:[{id:"A",x:160,y:130,color:"#6366f1",label:"HEAD",spawn:true}],
    edges:[],labels:[{x:40,y:130,text:"main",color:"#6366f1"}],
  },
  staged:{
    nodes:[{id:"A",x:160,y:130,color:"#6366f1"}],
    edges:[],labels:[{x:40,y:130,text:"main",color:"#6366f1"}],stageBadge:true,
  },
  commit1:{
    nodes:[{id:"A",x:160,y:130,color:"#6366f1"},{id:"B",x:400,y:130,color:"#6366f1",label:"HEAD",spawn:true}],
    edges:[{f:"A",t:"B",c:"#4338ca"}],labels:[{x:40,y:130,text:"main",color:"#6366f1"}],
  },
  commit2:{
    nodes:[{id:"A",x:120,y:130,color:"#6366f1"},{id:"B",x:360,y:130,color:"#6366f1"},{id:"C",x:600,y:130,color:"#6366f1",label:"HEAD",spawn:true}],
    edges:[{f:"A",t:"B",c:"#4338ca"},{f:"B",t:"C",c:"#4338ca"}],labels:[{x:30,y:130,text:"main",color:"#6366f1"}],
  },
  branch:{
    nodes:[{id:"A",x:100,y:95,color:"#6366f1"},{id:"B",x:290,y:95,color:"#6366f1"},{id:"C",x:480,y:95,color:"#6366f1",label:"HEAD"},{id:"D",x:620,y:185,color:"#a855f7",label:"feature",spawn:true}],
    edges:[{f:"A",t:"B",c:"#4338ca"},{f:"B",t:"C",c:"#4338ca"},{f:"C",t:"D",c:"#7c3aed",dash:true}],
    labels:[{x:28,y:95,text:"main",color:"#6366f1"},{x:28,y:185,text:"feature",color:"#a855f7"}],
  },
  checkout:{
    nodes:[{id:"A",x:100,y:95,color:"#6366f1"},{id:"B",x:290,y:95,color:"#6366f1"},{id:"C",x:480,y:95,color:"#6366f1"},{id:"D",x:620,y:185,color:"#a855f7",label:"HEAD ←",spawn:true}],
    edges:[{f:"A",t:"B",c:"#4338ca"},{f:"B",t:"C",c:"#4338ca"},{f:"C",t:"D",c:"#7c3aed",dash:true}],
    labels:[{x:28,y:95,text:"main",color:"#6366f1"},{x:28,y:185,text:"feature",color:"#a855f7"}],
  },
  featureCommit:{
    nodes:[{id:"A",x:80,y:90,color:"#6366f1"},{id:"B",x:240,y:90,color:"#6366f1"},{id:"C",x:400,y:90,color:"#6366f1"},{id:"D",x:520,y:185,color:"#a855f7"},{id:"E",x:720,y:185,color:"#a855f7",label:"HEAD",spawn:true}],
    edges:[{f:"A",t:"B",c:"#4338ca"},{f:"B",t:"C",c:"#4338ca"},{f:"C",t:"D",c:"#7c3aed",dash:true},{f:"D",t:"E",c:"#7c3aed"}],
    labels:[{x:22,y:90,text:"main",color:"#6366f1"},{x:22,y:185,text:"feature",color:"#a855f7"}],
  },
  merged:{
    nodes:[{id:"A",x:70,y:88,color:"#6366f1"},{id:"B",x:210,y:88,color:"#6366f1"},{id:"C",x:350,y:88,color:"#6366f1"},{id:"D",x:460,y:180,color:"#a855f7"},{id:"E",x:610,y:180,color:"#a855f7"},{id:"M",x:760,y:88,color:"#22c55e",label:"HEAD",spawn:true,merge:true}],
    edges:[{f:"A",t:"B",c:"#4338ca"},{f:"B",t:"C",c:"#4338ca"},{f:"C",t:"D",c:"#7c3aed",dash:true},{f:"D",t:"E",c:"#7c3aed"},{f:"C",t:"M",c:"#15803d"},{f:"E",t:"M",c:"#15803d"}],
    labels:[{x:18,y:88,text:"main",color:"#6366f1"},{x:18,y:180,text:"feature",color:"#a855f7"}],
    mergeFlash:true,
  },
};

/* ── SVG TREE ── */
function GitTree({ treeKey, doFlash, doShake }) {
  const cfg = TREES[treeKey] || TREES.empty;
  const [spawned, setSpawned] = useState({});
  const nm = {};
  cfg.nodes?.forEach(n => { nm[n.id]=n; });

  useEffect(() => {
    setSpawned({});
    const t = setTimeout(() => {
      const s={};
      cfg.nodes?.forEach(n=>{ if(n.spawn) s[n.id]=true; });
      setSpawned(s);
    }, 60);
    return () => clearTimeout(t);
  }, [treeKey]);

  const edgePath = (e) => {
    const s=nm[e.f], t=nm[e.t];
    if(!s||!t) return "";
    if(s.y===t.y) return `M${s.x},${s.y} L${t.x},${t.y}`;
    const mx=(s.x+t.x)/2;
    return `M${s.x},${s.y} C${mx},${s.y} ${mx},${t.y} ${t.x},${t.y}`;
  };
  const eLen = (e) => {
    const s=nm[e.f], t=nm[e.t];
    if(!s||!t) return 80;
    return Math.hypot(t.x-s.x, t.y-s.y)*1.25;
  };

  return (
    <svg viewBox="0 0 860 260" style={{ width:"100%", height:"100%",
      animation: doShake?"shake .35s ease-out":doFlash?"mergeFlash .65s ease-out":"none" }}>
      {Array.from({length:20},(_,x)=>Array.from({length:7},(_,y)=>(
        <circle key={`${x}-${y}`} cx={x*46+12} cy={y*40+12} r={1} fill="#0d1624"/>
      )))}
      {!cfg.nodes?.length&&(
        <text x={430} y={130} textAnchor="middle" fill="#1a2540" fontSize={14} fontFamily="JetBrains Mono">empty working directory</text>
      )}
      {cfg.stageBadge&&(
        <g>
          <rect x={100} y={98} width={200} height={66} rx={8} fill="#0b1320" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="6 4"/>
          <text x={200} y={126} textAnchor="middle" fill="#fbbf24" fontSize={13} fontFamily="JetBrains Mono">staging area</text>
          <text x={200} y={147} textAnchor="middle" fill="#fbbf2465" fontSize={11} fontFamily="JetBrains Mono">files ready to commit</text>
        </g>
      )}
      {cfg.labels?.map((l,i)=>(
        <text key={i} x={l.x} y={l.y} fill={l.color} fontSize={12} fontFamily="JetBrains Mono" fontWeight="700" opacity={.65}>{l.text}</text>
      ))}
      {cfg.edges?.map((e,i)=>{
        const len=eLen(e);
        return <path key={i} d={edgePath(e)} fill="none" stroke={e.c} strokeWidth={2.5}
          strokeDasharray={e.dash?"7 5":`${len} ${len}`}
          style={{"--L":len,animation:`lineDraw .45s ease-out ${i*.07}s forwards`,opacity:.85}}/>;
      })}
      {cfg.nodes?.map(n=>(
        <g key={n.id} style={{ transformOrigin:`${n.x}px ${n.y}px`,
          animation:spawned[n.id]?"nodeSpawn .4s cubic-bezier(.34,1.56,.64,1) forwards":"none" }}>
          {n.merge&&<circle cx={n.x} cy={n.y} r={24} fill="none" stroke="#22c55e" strokeWidth={1.5} style={{animation:"nodeGlow 1.5s ease-in-out infinite",color:"#22c55e"}}/>}
          <circle cx={n.x} cy={n.y} r={n.merge?15:12} fill={n.color+"28"} stroke={n.color} strokeWidth={2.5}/>
          <circle cx={n.x} cy={n.y} r={n.merge?6:4} fill={n.color}/>
          {n.label&&<text x={n.x} y={n.y-20} textAnchor="middle" fill={n.color} fontSize={11} fontFamily="JetBrains Mono" fontWeight="700">{n.label}</text>}
        </g>
      ))}
    </svg>
  );
}

/* ── TIMER RING ── */
function TimerRing({ sec, max, penalty }) {
  const r=22, circ=2*Math.PI*r;
  const pct=Math.max(0, sec/max);
  const col=sec<=10?"#ef4444":sec<=20?"#f97316":"#6366f1";
  return (
    <div style={{ position:"relative", width:56, height:56, flexShrink:0 }}>
      <svg width={56} height={56} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={28} cy={28} r={r} fill="none" stroke="#0f1e34" strokeWidth={3}/>
        <circle cx={28} cy={28} r={r} fill="none" stroke={col} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
          style={{ transition:"stroke-dashoffset .9s linear, stroke .3s" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        animation:penalty?"timerShake .4s ease-out":"none" }}>
        <span style={{ fontSize:13, fontWeight:700, color:col, fontFamily:"JetBrains Mono",
          animation:penalty?"timePenalty .4s ease-out":"none" }}>{sec}</span>
        <span style={{ fontSize:7, color:"#374151" }}>sec</span>
      </div>
    </div>
  );
}

/* ── FILL INPUT ── */
function FillInput({ level, onCorrect, onWrong }) {
  const [val, setVal]     = useState("");
  const [st, setSt]       = useState("idle");
  const ref               = useRef(null);

  useEffect(() => {
    setVal(""); setSt("idle");
    setTimeout(() => ref.current?.focus(), 80);
  }, [level.id]);

  const submit = () => {
    if (st !== "idle") return;
    const typed    = val.trim().toLowerCase();
    const expected = level.blank.toLowerCase();
    if (typed === expected) {
      setSt("correct");
      setTimeout(() => onCorrect(), 550);
    } else {
      setSt("wrong");
      onWrong();
      setTimeout(() => { setSt("idle"); setVal(""); ref.current?.focus(); }, 480);
    }
  };

  const w = Math.max(82, (level.placeholder?.length || 6) * 10 + 30);

  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", rowGap:8 }}>
      {level.prefix && (
        <span style={{ fontSize:14, fontWeight:600, color:"#2a3a5a", fontFamily:"JetBrains Mono", whiteSpace:"nowrap" }}>
          {level.prefix}
        </span>
      )}
      <input ref={ref} value={val}
        onChange={e=>{ if(st==="idle") setVal(e.target.value); }}
        onKeyDown={e=>{ if(e.key==="Enter") submit(); }}
        placeholder={level.placeholder}
        className={`fill-inp ${st}`}
        disabled={st==="correct"}
        style={{ width:w }}
        autoComplete="off" autoCorrect="off" spellCheck="false"
      />
      {level.suffix && (
        <span style={{ fontSize:14, fontWeight:600, color:"#2a3a5a", fontFamily:"JetBrains Mono", whiteSpace:"nowrap" }}>
          {level.suffix}
        </span>
      )}
      <button className="run-btn" onClick={submit}
        disabled={st!=="idle"||!val.trim()} style={{ marginLeft:8 }}>
        Run ↵
      </button>
      {st==="wrong"   && <span style={{ fontSize:11, color:"#ef4444", marginLeft:6, animation:"slideUp .2s ease-out" }}>✗ try again</span>}
      {st==="correct" && <span style={{ fontSize:11, color:"#22c55e", marginLeft:6, animation:"slideUp .2s ease-out" }}>✓ correct!</span>}
    </div>
  );
}

/* ── XP FLOATS ── */
function XPFloats({ floats }) {
  return <>
    {floats.map(f=>(
      <div key={f.id} style={{ position:"fixed", left:f.x, top:f.y, fontSize:13, fontWeight:700, color:"#fbbf24",
        pointerEvents:"none", zIndex:999, fontFamily:"JetBrains Mono", animation:"floatXP .9s ease-out forwards" }}>
        +{f.xp} XP
      </div>
    ))}
  </>;
}

/* ── MAIN ── */
export default function GitQuest() {
  const navigate = useNavigate();
  const [lvl,     setLvl]     = useState(0);
  const [xp,      setXp]      = useState(0);
  const [treeKey, setTreeKey] = useState("empty");
  const [logs,    setLogs]    = useState([{t:"sys",m:"GitQuest v2 — fill in the blanks. Wrong answers cost time."}]);
  const [timeSec, setTimeSec] = useState(LEVELS[0].timeSec);
  const [penalty, setPenalty] = useState(false);
  const [bgAnim,  setBgAnim]  = useState(null);
  const [treeFlash,setTFlash] = useState(false);
  const [treeShake,setTShake] = useState(false);
  const [floats,  setFloats]  = useState([]);
  const [done,    setDone]    = useState(false);
  const [inKey,   setInKey]   = useState(0);
  const [wrongs,  setWrongs]  = useState(0);
  const [lvlAnim, setLvlAnim] = useState(false);
  const logRef  = useRef(null);
  const timerRef= useRef(null);
  const areaRef = useRef(null);

  const level = LEVELS[lvl];

  useEffect(() => {
    if(logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // timer per level
  useEffect(() => {
    if(done) return;
    setTimeSec(level.timeSec);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeSec(t => { if(t<=1){ clearInterval(timerRef.current); return 0; } return t-1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [lvl, done]);

  const addLog = useCallback((type,msg) => {
    setLogs(l=>[...l.slice(-40),{t:type,m:msg}]);
  },[]);

  const spawnXP = useCallback((amt) => {
    if(!areaRef.current) return;
    const r = areaRef.current.getBoundingClientRect();
    const id = Date.now();
    setFloats(f=>[...f,{id,xp:amt,x:r.left+r.width/2-20,y:r.top-8}]);
    setTimeout(()=>setFloats(f=>f.filter(x=>x.id!==id)),1000);
  },[]);

  const onCorrect = useCallback(() => {
    clearInterval(timerRef.current);
    spawnXP(level.xpReward);
    setXp(x=>x+level.xpReward);
    setTreeKey(level.nextTree);
    addLog("success",`✓ ${level.prefix}${level.blank}${level.suffix}  (+${level.xpReward} XP)`);
    if(level.nextTree==="merged"){ setTFlash(true); setTimeout(()=>setTFlash(false),700); }
    setBgAnim("successBg"); setTimeout(()=>setBgAnim(null),500);
    setWrongs(0);
    setTimeout(()=>{
      if(lvl+1>=LEVELS.length){ setDone(true); return; }
      setLvlAnim(true);
      setTimeout(()=>{ setLvl(i=>i+1); setInKey(k=>k+1); setLvlAnim(false); },280);
      addLog("sys",`Level ${lvl+2} unlocked ↗`);
    }, 700);
  },[level,lvl,addLog,spawnXP]);

  const onWrong = useCallback(() => {
    setTimeSec(t=>Math.max(5,t-TIME_PENALTY));
    setPenalty(true); setTimeout(()=>setPenalty(false),500);
    setTShake(true);  setTimeout(()=>setTShake(false),380);
    setBgAnim("wrongBg"); setTimeout(()=>setBgAnim(null),400);
    setWrongs(w=>w+1);
    addLog("error",`✗ wrong — −${TIME_PENALTY}s penalty applied`);
  },[addLog]);

  /* ── WIN SCREEN ── */
  if(done) return (
    <div style={{ height:"100vh",background:"#030805",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace" }}>
      <G/>
      <div style={{ textAlign:"center", animation:"popIn .6s cubic-bezier(.34,1.56,.64,1)" }}>
        <div style={{ fontSize:58, marginBottom:10 }}>🏆</div>
        <div style={{ fontFamily:"Syne,sans-serif",fontSize:34,fontWeight:800,color:"#22c55e",letterSpacing:"-1px",marginBottom:6 }}>GIT MASTER</div>
        <div style={{ fontSize:11,color:"#4b5563",marginBottom:4 }}>Total XP earned</div>
        <div style={{ fontSize:28,fontWeight:700,color:"#fbbf24",marginBottom:6 }}>{xp} / {TOTAL_XP} XP</div>
        <div style={{ fontSize:11,color:"#374151",marginBottom:26 }}>
          {xp>=TOTAL_XP?"Perfect score! 🎯":`${Math.round(xp/TOTAL_XP*100)}% mastery`}
        </div>
        <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
          <button onClick={()=>{ setLvl(0);setXp(0);setTreeKey("empty");setLogs([{t:"sys",m:"Restarted."}]);setDone(false);setInKey(k=>k+1); }}
            style={{ padding:"9px 22px",borderRadius:9,background:"#0c2010",border:"1.5px solid #22c55e",color:"#22c55e",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
            Play Again
          </button>
          <button onClick={()=>navigate("/full-stack")}
            style={{ padding:"9px 22px",borderRadius:9,background:"transparent",border:"1px solid #1e2d4a",color:"#4b5563",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );

  const xpPct = Math.round((xp/TOTAL_XP)*100);

  return (
    <div className="gq" style={{ animation:bgAnim?`${bgAnim} .5s ease-out`:"none" }}>
      <G/>
      <div className="scanline"/>
      <XPFloats floats={floats}/>

      {/* TOP BAR */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px",background:"#08101e",borderBottom:"1px solid #0f1e34",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <span style={{ fontFamily:"Syne,sans-serif",fontSize:15,fontWeight:800,letterSpacing:"-0.5px" }}>
            <span style={{ color:"#6366f1" }}>Git</span>Quest
          </span>
          <div style={{ display:"flex",gap:5 }}>
            {LEVELS.map((_,i)=>(
              <div key={i} style={{ width:i===lvl?18:7,height:7,borderRadius:4,
                background:i<lvl?"#6366f1":i===lvl?"#818cf8":"#1e2d4a",transition:"all .3s" }}/>
            ))}
          </div>
          <span style={{ fontSize:9,color:"#374151" }}>{lvl+1}/{LEVELS.length}</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <span style={{ fontSize:11,color:"#fbbf24",fontWeight:700 }}>{xp} XP</span>
          <div style={{ width:80,height:3,background:"#0f1e34",borderRadius:2 }}>
            <div style={{ height:"100%",background:"#fbbf24",width:`${xpPct}%`,transition:"width .5s",borderRadius:2 }}/>
          </div>
          <button onClick={()=>navigate("/full-stack")}
            style={{ fontSize:9,color:"#374151",background:"none",border:"1px solid #1e2d4a",borderRadius:5,padding:"3px 9px",cursor:"pointer",fontFamily:"inherit" }}>
            ← Exit
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex:1,display:"grid",gridTemplateColumns:"1fr 310px",minHeight:0,overflow:"hidden" }}>

        {/* LEFT — fixed layout, no flex:1 on tree */}
        <div style={{ display:"flex",flexDirection:"column",padding:16,gap:10,overflow:"hidden" }}>

          {/* Tree — fixed height, not flex:1 */}
          <div style={{ height:220,flexShrink:0,background:"#060810",border:"1px solid #0d1828",borderRadius:14,overflow:"hidden",position:"relative" }}>
            <GitTree treeKey={treeKey} doFlash={treeFlash} doShake={treeShake}/>
            <div style={{ position:"absolute",top:8,left:12,fontSize:7,color:"#1a2540",letterSpacing:"0.14em",textTransform:"uppercase" }}>repository state</div>
            <div style={{ position:"absolute",bottom:8,right:12,display:"flex",gap:10 }}>
              {[["main","#6366f1"],["feature","#a855f7"]].map(([b,c])=>(
                <div key={b} style={{ display:"flex",alignItems:"center",gap:4,fontSize:7,color:c }}>
                  <div style={{ width:5,height:5,borderRadius:"50%",background:c }}/>
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* Command fill area */}
          <div ref={areaRef} style={{ flexShrink:0,background:"#07090f",border:`1.5px solid ${wrongs>0?"#2d1e00":"#1e2d4a"}`,borderRadius:14,padding:14,
            animation:lvlAnim?"none":"slideUp .3s ease-out",transition:"border-color .3s" }}>
            <div style={{ fontSize:8,color:"#374151",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8 }}>
              complete the command
            </div>
            <FillInput key={inKey} level={level} onCorrect={onCorrect} onWrong={onWrong}/>

            {wrongs===1 && (
              <div style={{ marginTop:8,fontSize:10,color:"#92400e",background:"#0d0900",border:"1px solid #78350f30",borderRadius:7,padding:"6px 10px",animation:"slideUp .25s ease-out" }}>
                💡 {level.hint}
              </div>
            )}
            {wrongs>=2 && (
              <div style={{ marginTop:6,fontSize:10,color:"#7c3aed",background:"#0a0820",border:"1px solid #4c1d9530",borderRadius:7,padding:"6px 10px",animation:"slideUp .2s ease-out" }}>
                📋 Format: <span style={{ color:"#818cf8" }}>{level.prefix}<span style={{ color:"#fbbf24",textDecoration:"underline" }}>____</span>{level.suffix}</span>
              </div>
            )}
          </div>

          {/* Console — flex:1 so it fills remaining space */}
          <div ref={logRef} style={{ flex:1,minHeight:0,background:"#040810",border:"1px solid #0c1422",borderRadius:10,padding:"7px 12px",overflow:"auto" }}>
            <div style={{ fontSize:7,color:"#141e30",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4 }}>console</div>
            {logs.map((l,i)=>(
              <div key={i} style={{ fontSize:10,lineHeight:1.5,
                color:l.t==="success"?"#22c55e":l.t==="error"?"#ef4444":"#2a3a55",
                fontFamily:"JetBrains Mono" }}>
                {l.m}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ borderLeft:"1px solid #0f1e34",padding:16,display:"flex",flexDirection:"column",gap:12,overflow:"auto" }}>

          {/* Timer + level header */}
          <div style={{ display:"flex",alignItems:"center",gap:14,background:"#07090f",border:"1px solid #0f1e34",borderRadius:12,padding:"12px 14px",
            animation:lvlAnim?"none":"levelIn .35s ease-out" }}>
            <TimerRing sec={timeSec} max={level.timeSec} penalty={penalty}/>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                {level.title}
              </div>
              <div style={{ fontSize:9,color:"#374151" }}>Level {lvl+1} · +{level.xpReward} XP</div>
              {penalty&&(
                <div style={{ fontSize:9,color:"#ef4444",marginTop:3,animation:"slideUp .2s ease-out" }}>
                  −{TIME_PENALTY}s penalty!
                </div>
              )}
            </div>
          </div>

          {/* Objective */}
          <div style={{ background:"#07090f",border:"1px solid #0c1a30",borderRadius:12,padding:"12px 14px" }}>
            <div style={{ fontSize:8,color:"#1e3a5f",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6 }}>Objective</div>
            <div style={{ fontSize:11,color:"#93c5fd",fontWeight:600,lineHeight:1.5,marginBottom:8 }}>{level.goal}</div>
            <div style={{ fontSize:10,color:"#374151",lineHeight:1.65 }}>{level.story}</div>
          </div>

          {/* Wrong count feedback */}
          {wrongs===0&&(
            <div style={{ background:"#07090f",border:"1px solid #0f1e34",borderRadius:10,padding:"10px 14px" }}>
              <div style={{ fontSize:8,color:"#1e2a3a",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>Hint</div>
              <div style={{ fontSize:10,color:"#1a2a40" }}>Make a wrong attempt to reveal hint →</div>
            </div>
          )}

          {/* Git cheatsheet */}
          <div style={{ background:"#05080f",border:"1px solid #0c1422",borderRadius:10,padding:"12px 14px" }}>
            <div style={{ fontSize:8,color:"#1a2540",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8 }}>Git Reference</div>
            {[["init","start a new repo"],["add .","stage all files"],["commit -m","save a snapshot"],["branch","create branch"],["checkout","switch branch"],["merge","join branches"]].map(([cmd,desc])=>(
              <div key={cmd} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                <span style={{ fontSize:9,color:"#2d4a6e",fontWeight:600 }}>git {cmd}</span>
                <span style={{ fontSize:8,color:"#1a2540" }}>{desc}</span>
              </div>
            ))}
          </div>

          {/* Journey */}
          <div style={{ background:"#07090f",border:"1px solid #0f1e34",borderRadius:12,padding:"12px 14px",marginTop:"auto" }}>
            <div style={{ fontSize:8,color:"#1a2540",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10 }}>Journey</div>
            {LEVELS.map((l,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                <div style={{ width:13,height:13,borderRadius:"50%",flexShrink:0,
                  background:i<lvl?"#6366f1":i===lvl?"#6366f115":"#090e1a",
                  border:`1.5px solid ${i<lvl?"#6366f1":i===lvl?"#818cf8":"#1a2540"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,color:"#a5b4fc" }}>
                  {i<lvl?"✓":""}
                </div>
                <span style={{ fontSize:9,color:i<lvl?"#1e2d4a":i===lvl?"#e2e8f0":"#141e2e",
                  textDecoration:i<lvl?"line-through":"none",transition:"color .3s" }}>
                  {l.title}
                </span>
                {i===lvl&&<div style={{ marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:"#818cf8",animation:"pulse 1.2s infinite" }}/>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* XP bottom strip */}
      <div style={{ height:3,background:"#040810",flexShrink:0 }}>
        <div style={{ height:"100%",background:"linear-gradient(90deg,#4f46e5,#818cf8)",width:`${xpPct}%`,transition:"width .5s",boxShadow:"0 0 6px #6366f135" }}/>
      </div>
    </div>
  );
}