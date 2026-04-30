import { useState, useEffect, useRef, useCallback } from "react";

// ─── MODERN CYBER-NEON THEME ─────────────────────────────────────────────────
const THEME = {
  bgBase: "#020617",
  panel: "rgba(15, 23, 42, 0.6)",
  cyan: "#00f2ff",
  pink: "#ff007a",
  amber: "#f5a623",
  white: "#ffffff",
  muted: "#64748b",
  border: "rgba(255, 255, 255, 0.08)"
};

// ─── Algorithm definitions (Logic untouched) ─────────────────────────────────
const ALGORITHMS = [
  { id: "bubble", answer: "Bubble Sort", options: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Quick Sort"], hint: "Watch how adjacent elements interact each pass", hardHint: "Nearly sorted — only a few swaps remain, don't blink", explain: "Adjacent elements swap repeatedly — largest bubbles to the end each pass.", color: THEME.cyan, getArray: (hard) => hard ? [1,2,3,5,4,6,7,8,9,10] : [9,7,5,3,1,8,6,4,2,10] },
  { id: "merge", answer: "Merge Sort", options: ["Merge Sort", "Quick Sort", "Heap Sort", "Radix Sort"], hint: "Notice how the array splits and recombines", hardHint: "Watch carefully — the split could be Merge or Quick Sort", explain: "Divide into halves recursively, sort each half, then merge them together.", color: THEME.pink, getArray: () => [8,3,5,1,9,2,7,4] },
  { id: "bfs", answer: "BFS", options: ["BFS", "DFS", "Dijkstra's", "Prim's"], hint: "Watch which nodes light up and in what order", hardHint: "Level 1 completes before level 2 starts — not depth-first", explain: "Explores level by level — all neighbors before going deeper. Classic BFS!", color: THEME.cyan, getArray: () => null },
  { id: "dfs", answer: "DFS", options: ["DFS", "BFS", "A*", "Bellman-Ford"], hint: "Follow the path — it goes as deep as possible first", hardHint: "Dives all the way down one branch before backtracking", explain: "Goes deep before backtracking — follows one path fully before exploring others.", color: THEME.pink, getArray: () => null },
  { id: "insertion", answer: "Insertion Sort", options: ["Insertion Sort", "Bubble Sort", "Shell Sort", "Selection Sort"], hint: "The left portion stays sorted throughout", hardHint: "Like sorting cards in hand — each element finds its spot on the left", explain: "Each element is inserted into its correct position in the already-sorted left side.", color: THEME.amber, getArray: (hard) => hard ? [3,1,4,1,5,9,2,6] : [5,2,4,6,1,3,7] },
  { id: "selection", answer: "Selection Sort", options: ["Selection Sort", "Insertion Sort", "Bubble Sort", "Merge Sort"], hint: "One swap per pass — a scan hunts for the minimum", hardHint: "The red bar scans the entire unsorted portion each time", explain: "Scans the unsorted portion for the minimum, swaps it to the front — one swap per pass.", color: "#a855f7", getArray: () => [6,3,8,2,7,4,1,5] },
];

const NODES = [ { id:0, x:0.5, y:0.12, label:"A" }, { id:1, x:0.28, y:0.38, label:"B" }, { id:2, x:0.72, y:0.38, label:"C" }, { id:3, x:0.14, y:0.68, label:"D" }, { id:4, x:0.42, y:0.68, label:"E" }, { id:5, x:0.60, y:0.68, label:"F" }, { id:6, x:0.86, y:0.68, label:"G" } ];
const EDGES = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
const BFS_ORDER = [0,1,2,3,4,5,6];
const DFS_ORDER = [0,1,3,4,2,5,6];

// ─── Drawing functions ───────────────────────────────────────────────────────
function drawBubble(ctx, W, H, tick, hard, algoColor) {
  const arr = hard ? [1,2,3,5,4,6,7,8,9,10] : [9,7,5,3,1,8,6,4,2,10];
  let a = [...arr]; let swapIdx = -1;
  const pass = Math.floor(tick / 3) % (a.length * 2);
  for (let i = 0; i < Math.min(pass, a.length - 1); i++) {
    for (let j = 0; j < a.length - 1 - i; j++) { if (a[j] > a[j+1]) { [a[j], a[j+1]] = [a[j+1], a[j]]; swapIdx = j; } }
  }
  drawBars(ctx, a, W, H, swapIdx, algoColor);
}

function drawBars(ctx, arr, W, H, highlightIdx, color) {
  const n = arr.length; const maxV = Math.max(...arr);
  const gap = W * 0.015; const bw = (W - gap * (n + 1)) / n;
  ctx.clearRect(0, 0, W, H);
  arr.forEach((v, i) => {
    const bh = ((v / maxV) * (H - 40)); const x = gap + i * (bw + gap); const y = H - bh - 10;
    const isHl = i === highlightIdx || i === highlightIdx + 1;
    ctx.globalAlpha = isHl ? 1 : 0.2; ctx.fillStyle = isHl ? THEME.pink : color;
    ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 6); ctx.fill();
    if (isHl || ctx.globalAlpha === 0.2) { ctx.shadowColor = isHl ? THEME.pink : color; ctx.shadowBlur = isHl ? 20 : 8; ctx.fill(); ctx.shadowBlur = 0; }
    ctx.globalAlpha = 1;
  });
}

function drawMerge(ctx, W, H, tick) {
  ctx.clearRect(0, 0, W, H); const arr = [8,3,5,1,9,2,7,4]; const maxV = 9;
  const phase = Math.floor(tick / 4) % 4; const n = arr.length; const gap = W * 0.015; const bw = (W - gap * (n + 1)) / n;
  const drawSet = (values, startIdx, color) => {
    values.forEach((v, j) => {
      const i = startIdx + j; const bh = (v / maxV) * (H - 40); ctx.fillStyle = color; ctx.globalAlpha = 0.8; ctx.shadowColor = color; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.roundRect(gap + i * (bw + gap), H - bh - 10, bw, bh, 6); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    });
  };
  if (phase === 0) { arr.forEach((v,i) => { drawSet([v], i, THEME.cyan); }); label(ctx, "Split into individuals", W); }
  else if (phase === 1) { [[3,8],[1,5],[2,9],[4,7]].forEach((p,pi) => drawSet(p.sort((a,b)=>a-b), pi*2, pi%2===0?THEME.pink:THEME.cyan)); label(ctx, "Merge pairs", W); }
  else if (phase === 2) { drawSet([1,3,5,8], 0, THEME.pink); drawSet([2,4,7,9], 4, THEME.amber); label(ctx, "Merge halves", W); }
  else { drawSet([1,2,3,4,5,7,8,9], 0, THEME.cyan); label(ctx, "Fully sorted", W); }
}

function label(ctx, text, W) { ctx.fillStyle = THEME.cyan; ctx.font = "bold 14px 'JetBrains Mono', monospace"; ctx.textAlign = "center"; ctx.fillText(`// ${text.toUpperCase()}`, W / 2, 24); ctx.textAlign = "left"; }

function drawGraph(ctx, W, H, tick, type) {
  ctx.clearRect(0, 0, W, H); const order = type === "bfs" ? BFS_ORDER : DFS_ORDER;
  const step = Math.floor(tick / 2.5) % (order.length + 2); const visited = order.slice(0, step); const current = visited[visited.length - 1];
  EDGES.forEach(([a, b]) => {
    const na = NODES[a], nb = NODES[b]; const bothVisited = visited.includes(a) && visited.includes(b);
    ctx.beginPath(); ctx.moveTo(na.x * W, na.y * H + 10); ctx.lineTo(nb.x * W, nb.y * H + 10);
    ctx.strokeStyle = bothVisited ? (type === 'bfs' ? THEME.cyan : THEME.pink) : "rgba(255,255,255,0.1)"; ctx.lineWidth = bothVisited ? 4 : 2;
    if (bothVisited) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 12; } ctx.stroke(); ctx.shadowBlur = 0;
  });
  NODES.forEach((n) => {
    const isVisited = visited.includes(n.id); const isCurrent = current === n.id;
    const x = n.x * W, y = n.y * H + 10, r = 22; const themeColor = type === 'bfs' ? THEME.cyan : THEME.pink;
    if (isCurrent) { ctx.beginPath(); ctx.arc(x, y, r + 12, 0, Math.PI * 2); ctx.fillStyle = themeColor + "33"; ctx.fill(); }
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = isCurrent ? themeColor : isVisited ? THEME.bgBase : THEME.panel; ctx.fill();
    ctx.strokeStyle = isVisited ? themeColor : THEME.muted; ctx.lineWidth = isCurrent ? 4 : 2;
    if (isVisited) { ctx.shadowColor = themeColor; ctx.shadowBlur = isCurrent ? 20 : 10; } ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = isCurrent ? "#020617" : isVisited ? themeColor : THEME.muted; ctx.font = `bold 16px 'JetBrains Mono', monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(n.label, x, y); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    if (isVisited) { const rank = visited.indexOf(n.id) + 1; ctx.fillStyle = THEME.amber; ctx.font = "bold 12px monospace"; ctx.textAlign = "center"; ctx.fillText(`[${rank}]`, x + 30, y - 20); ctx.textAlign = "left"; }
  });
}

function drawInsertion(ctx, W, H, tick, hard) {
  const arr = hard ? [3,1,4,1,5,9,2,6] : [5,2,4,6,1,3,7]; const a = [...arr]; const n = arr.length;
  const step = Math.floor(tick / 3) % (n + 1);
  for (let i = 1; i <= step && i < n; i++) { let j = i; while (j > 0 && a[j-1] > a[j]) { [a[j], a[j-1]] = [a[j-1], a[j]]; j--; } }
  const gap = W * 0.015, bw = (W - gap * (n + 1)) / n, maxV = Math.max(...arr); ctx.clearRect(0, 0, W, H);
  a.forEach((v, i) => {
    const bh = (v / maxV) * (H - 40); ctx.fillStyle = i < step ? THEME.cyan : i === step ? THEME.amber : THEME.muted; ctx.globalAlpha = i === step ? 1 : 0.4;
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = (i <= step) ? 12 : 0;
    ctx.beginPath(); ctx.roundRect(gap + i*(bw+gap), H-bh-10, bw, bh, 6); ctx.fill(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  });
  if (step > 0) label(ctx, `Left ${step} element${step>1?"s":""} sorted`, W);
}

function drawSelection(ctx, W, H, tick) {
  const arr = [6,3,8,2,7,4,1,5]; const a = [...arr]; const n = arr.length; const pass = Math.floor(tick / 3) % (n + 1);
  for (let i = 0; i < pass; i++) { let m = i; for (let j = i+1; j < n; j++) if (a[j] < a[m]) m = j; [a[i], a[m]] = [a[m], a[i]]; }
  const scan = pass + Math.floor((tick % 3)); const gap = W * 0.015, bw = (W - gap * (n + 1)) / n, maxV = Math.max(...arr); ctx.clearRect(0, 0, W, H);
  a.forEach((v, i) => {
    const bh = (v / maxV) * (H - 40); const isSorted = i < pass; const isScanning = i === Math.min(scan, n-1);
    ctx.fillStyle = isSorted ? THEME.cyan : isScanning ? THEME.pink : "#a855f7"; ctx.globalAlpha = isSorted ? 0.8 : isScanning ? 1 : 0.2;
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = (isSorted || isScanning) ? 15 : 0;
    ctx.beginPath(); ctx.roundRect(gap + i*(bw+gap), H-bh-10, bw, bh, 6); ctx.fill(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  });
  label(ctx, "Scanning for minimum...", W);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GuessTheAlgorithm() {
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1);
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const [phase, setPhase] = useState("playing");
  const [feedback, setFeedback] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [pts, setPts] = useState(0);
  
  // Terminal System Logs
  const [logs, setLogs] = useState(["[SYSTEM] Neural link established.", "[SYSTEM] Awaiting user input..."]);
  const terminalEndRef = useRef(null);

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const tickRef = useRef(0);
  const animRef = useRef(null);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  const hard = streak >= 3;
  const q = questions[qIdx];
  const DURATION = hard ? 8000 : 12000;

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const addLog = useCallback((msg) => {
    setLogs(prev => [...prev.slice(-15), msg]); // Keep last 15 logs
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => { setQuestions(shuffle(ALGORITHMS)); }, []);

  useEffect(() => {
    if (!q) return;
    tickRef.current = 0; setAnswered(false); setChosen(null);
    setFeedback(null); setTimedOut(false); setPts(0);
    setShuffledOpts(shuffle(q.options)); setTimeLeft(1);
    startRef.current = Date.now();
    addLog(`[MODULE ${String(qIdx+1).padStart(2, '0')}] Data matrix loaded.`);
    addLog(`[INFO] ${hard ? q.hardHint : q.hint}`);
  }, [qIdx, q, addLog, hard]);

  useEffect(() => {
    if (!q || phase !== "playing") return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 1000; const H = 300; 
    canvas.width = W; canvas.height = H;
    let last = 0;

    const frame = (ts) => {
      if (ts - last > 180) { tickRef.current++; last = ts; }
      const t = tickRef.current;
      if (q.id === "bubble") drawBubble(ctx, W, H, t, hard, q.color);
      else if (q.id === "merge") drawMerge(ctx, W, H, t);
      else if (q.id === "bfs") drawGraph(ctx, W, H, t, "bfs");
      else if (q.id === "dfs") drawGraph(ctx, W, H, t, "dfs");
      else if (q.id === "insertion") drawInsertion(ctx, W, H, t, hard);
      else if (q.id === "selection") drawSelection(ctx, W, H, t);
      animRef.current = requestAnimationFrame(frame);
    };
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [q, hard, phase]);

  useEffect(() => {
    if (!q || answered || phase !== "playing") return;
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const frac = Math.max(0, 1 - elapsed / DURATION);
      setTimeLeft(frac);
      if (frac <= 0) {
        clearInterval(timerRef.current);
        setTimedOut(true); setAnswered(true); setStreak(0);
        setFeedback({ correct: false, msg: `System timeout. Optimal sequence was ${q.answer}.` });
        addLog(`[WARN] Timeout. Pattern was ${q.answer}.`);
      }
    }, 60);
    return () => clearInterval(timerRef.current);
  }, [q, answered, phase, DURATION, addLog]);

  const handleAnswer = useCallback((opt) => {
    if (answered || !q) return;
    clearInterval(timerRef.current); setAnswered(true); setChosen(opt);
    const correct = opt === q.answer;
    const bonus = Math.round(timeLeft * 10);
    const earned = correct ? (hard ? 20 : 10) + bonus : 0;
    setPts(earned);
    addLog(`[INPUT] User selected: ${opt}`);

    if (correct) {
      setScore(s => s + earned); setStreak(s => s + 1);
      setFeedback({ correct: true, msg: q.explain });
      addLog(`[SUCCESS] Pattern verified. +${earned} pts`);
    } else {
      setStreak(0);
      setFeedback({ correct: false, msg: q.explain });
      addLog(`[ERROR] Invalid sequence. Expected: ${q.answer}`);
    }
  }, [answered, q, timeLeft, hard, addLog]);

  const handleNext = () => { qIdx + 1 >= questions.length ? setPhase("end") : setQIdx(i => i + 1); };
  const restart = () => { 
    setQuestions(shuffle(ALGORITHMS)); setQIdx(0); setScore(0); setStreak(0); setPhase("playing"); 
    setLogs(["[SYSTEM] Neural link re-established. Starting new sequence..."]);
  };

  const handleMouseMove = (e) => {
    if (phase !== "playing") return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setTilt({ x: x * 10, y: y * -10 }); // max 10 degrees tilt
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const total = ALGORITHMS.length * 20;

  // ─── END SCREEN (Dashboard Summary) ──────────────────────────────────────────
  if (phase === "end") {
    const pct = Math.round((score / total) * 100);
    const isMaster = pct >= 80;
    
    return (
      <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00f2ff] rounded-full mix-blend-screen filter blur-[200px] opacity-10 animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ff007a] rounded-full mix-blend-screen filter blur-[200px] opacity-10 animate-blob animation-delay-2000" />
        
        <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur-3xl px-8 py-12 rounded-[40px] border border-white/10 shadow-[0_0_80px_rgba(0,242,255,0.1)] text-center animate-fadeInUp">
          <h2 className="text-xl font-mono text-[#00f2ff] uppercase tracking-[0.4em] mb-8">System Diagnostics</h2>
          <div className="text-8xl mb-8 drop-shadow-[0_0_30px_rgba(255,215,0,0.3)] animate-bounce-slow">
             {isMaster ? "🏆" : pct >= 50 ? "🎯" : "💀"}
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter">
            {isMaster ? "Sequence Mastered" : pct >= 50 ? "Simulation Complete" : "Link Severed"}
          </h3>
          <p className="text-slate-400 mb-12 text-lg font-mono">
            Final Score: <span className="text-[#00f2ff] font-bold text-3xl"> {score} </span> pts
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 min-w-[140px]">
              <div className="text-[#00f2ff] font-black text-3xl mb-1">{ALGORITHMS.length}</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Modules</div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 min-w-[140px]">
              <div className="text-[#ff007a] font-black text-3xl mb-1">{pct}%</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Accuracy</div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 min-w-[140px]">
              <div className="text-[#f5a623] font-black text-3xl mb-1">{hard ? 'ON' : 'OFF'}</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Hard Mode</div>
            </div>
          </div>
          
          <button onClick={restart} className="group relative px-12 py-5 bg-transparent overflow-hidden rounded-full font-black text-sm uppercase tracking-widest text-[#00f2ff] border border-[#00f2ff]/50 hover:border-[#00f2ff] transition-all duration-300">
            <div className="absolute inset-0 bg-[#00f2ff]/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">Reboot Sequence</span>
          </button>
        </div>
      </div>
    );
  }

  if (!q) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-[#00f2ff] font-mono animate-pulse tracking-[0.3em] uppercase">Booting System...</div>;

  // ─── PLAYING SCREEN (Holographic Desktop HUD) ────────────────────────────────
  return (
    <div className="relative min-h-screen w-full bg-[#020617] flex flex-col font-sans text-slate-200 overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 cyber-grid opacity-[0.15] pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#00f2ff] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.07] animate-blob pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#ff007a] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.07] animate-blob animation-delay-2000 pointer-events-none" />
      
      {/* Particle Dust (CSS implementation) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="particle w-1 h-1 bg-[#00f2ff] rounded-full absolute top-[20%] left-[10%] animate-float1 opacity-40 blur-[1px]"></div>
         <div className="particle w-2 h-2 bg-[#ff007a] rounded-full absolute top-[60%] left-[80%] animate-float2 opacity-30 blur-[2px]"></div>
         <div className="particle w-1.5 h-1.5 bg-white rounded-full absolute top-[80%] left-[30%] animate-float3 opacity-50 blur-[1px]"></div>
         <div className="particle w-3 h-3 bg-[#f5a623] rounded-full absolute top-[30%] left-[70%] animate-float1 opacity-20 blur-[3px] animation-delay-2000"></div>
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full py-6 px-8 flex justify-center items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-md shadow-lg">
         <h1 className="text-3xl font-black text-white tracking-[0.3em] uppercase flex items-center gap-4 glitch-wrapper">
           <span className="text-[#00f2ff] text-4xl drop-shadow-[0_0_15px_rgba(0,242,255,0.6)]">🧠</span>
           <span className="glitch" data-text="DEV_QUEST">DEV_QUEST</span>
         </h1>
      </header>

      {/* Main HUD Layout */}
      <main className="relative z-10 flex-grow w-full max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 xl:p-8">
        
        {/* ─── LEFT PANEL: Telemetry ─── */}
        <aside className="xl:col-span-3 flex flex-col gap-6 order-2 xl:order-1">
          {/* Stats Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-white/5 p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f2ff]/10 rounded-bl-full blur-2xl"></div>
             <h3 className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em] mb-6">Telemetry</h3>
             
             <div className="mb-8">
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Total Score</div>
                <div className="text-[#00f2ff] font-black text-5xl drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">{score}</div>
             </div>

             <div className="mb-8">
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Multiplier / Streak</div>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-black ${streak >= 3 ? 'text-[#ff007a] drop-shadow-[0_0_15px_rgba(255,0,122,0.4)]' : 'text-[#f5a623]'}`}>
                    x{streak}
                  </div>
                  {streak >= 2 && <span className="animate-pulse text-2xl">🔥</span>}
                </div>
             </div>

             <div className={`p-4 rounded-xl border ${hard ? 'bg-[#ff007a]/10 border-[#ff007a]/30' : 'bg-slate-800 border-white/5'}`}>
                <div className="text-[10px] uppercase font-bold tracking-widest mb-1 flex justify-between">
                  <span className={hard ? 'text-[#ff007a]' : 'text-slate-400'}>Protocol Status</span>
                  <span className={hard ? 'text-[#ff007a] animate-pulse' : 'text-slate-500'}>{hard ? 'HARD' : 'NORMAL'}</span>
                </div>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${hard ? 'bg-[#ff007a] w-full' : 'bg-[#00f2ff] w-1/3'}`}></div>
                </div>
             </div>
          </div>

          {/* Module Map */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-white/5 p-6 shadow-xl flex-grow hidden xl:flex flex-col">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em] mb-6">Sequence Map</h3>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-800"></div>
              {questions.map((_, i) => (
                <div key={i} className="flex items-center gap-4 relative z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all duration-500 ${
                    i < qIdx ? "bg-[#00f2ff]/20 border-[#00f2ff] text-[#00f2ff]" 
                    : i === qIdx ? "bg-[#ff007a] border-[#ff007a] text-white shadow-[0_0_15px_rgba(255,0,122,0.6)]" 
                    : "bg-[#020617] border-slate-700 text-slate-600"
                  }`}>
                    {i < qIdx ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs uppercase tracking-widest font-mono ${i === qIdx ? 'text-white' : 'text-slate-500'}`}>
                    Module_{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── CENTER PANEL: Main Stage ─── */}
        <section className="xl:col-span-6 flex flex-col order-1 xl:order-2" 
                 onMouseMove={handleMouseMove} 
                 onMouseLeave={handleMouseLeave}
                 style={{ perspective: "1500px" }}>
          
          <div 
            className="w-full flex-grow flex flex-col bg-slate-900/80 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-10 relative overflow-hidden transition-transform duration-200 ease-out preserve-3d"
            style={{ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
          >
            {/* Animated Edge Glow */}
            <div className="absolute inset-[-2px] -z-10 rounded-[34px] overflow-hidden">
               <div className="absolute inset-[-50%] w-[200%] h-[200%] animate-spin-slow" 
                    style={{ background: `conic-gradient(from 0deg, transparent 0 340deg, ${hard ? THEME.pink : THEME.cyan} 360deg)` }}>
               </div>
               <div className="absolute inset-[2px] bg-slate-900 rounded-[32px]"></div>
            </div>

            {/* Stage Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${hard ? 'bg-[#ff007a] shadow-[0_0_10px_#ff007a]' : 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]'}`} />
                <div className="text-xs text-slate-300 uppercase tracking-[0.2em] font-mono">
                  {q.id === "bfs" || q.id === "dfs" ? "Graph_Matrix.exe" : "Array_Matrix.exe"}
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                T-Minus
              </div>
            </div>

            {/* Timer Bar */}
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_currentColor]"
                style={{ 
                  width: `${timeLeft * 100}%`, 
                  backgroundColor: timeLeft > 0.5 ? THEME.cyan : timeLeft > 0.25 ? THEME.amber : THEME.pink,
                  color: timeLeft > 0.5 ? THEME.cyan : timeLeft > 0.25 ? THEME.amber : THEME.pink
                }} 
              />
            </div>

            {/* Arena Canvas */}
            <div className="w-full relative aspect-[21/9] bg-black/60 rounded-2xl overflow-hidden border border-white/5 shadow-inner mb-10 group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00f2ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain p-4 mix-blend-screen" />
              {/* Floor reflection effect */}
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none"></div>
            </div>

            {/* Options Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
              {shuffledOpts.map((opt, index) => {
                const letter = ['A', 'B', 'C', 'D'][index];
                const isChosen = chosen === opt;
                const isCorrect = opt === q.answer;
                const show = answered;
                
                let btnClass = "bg-slate-800/50 border border-white/5 text-slate-300 hover:bg-slate-700/80 hover:border-[#00f2ff]/50";
                let circleClass = "bg-slate-900/80 text-slate-400 border border-white/10";
                
                if (show) {
                  if (isCorrect) {
                    btnClass = "bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.2)]";
                    circleClass = "bg-[#00f2ff] text-[#020617] border-transparent font-black";
                  } else if (isChosen && !isCorrect) {
                    btnClass = "bg-[#ff007a]/10 border-[#ff007a] text-[#ff007a] shadow-[0_0_20px_rgba(255,0,122,0.2)]";
                    circleClass = "bg-[#ff007a] text-[#020617] border-transparent font-black";
                  } else {
                    btnClass = "bg-black/30 border-transparent text-slate-600 opacity-40 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={opt} disabled={answered} onClick={() => handleAnswer(opt)}
                    className={`flex items-center p-3 pr-6 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 ${btnClass} ${!answered && 'active:scale-95 hover:translate-y-[-2px]'}`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 text-lg transition-colors duration-300 ${circleClass}`}>
                      {letter}
                    </div>
                    <span className="text-sm md:text-base">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Next Button Overlay */}
            {answered && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] z-20 animate-slideUp">
                <button onClick={handleNext} className="w-full py-5 bg-gradient-to-r from-[#00f2ff] to-[#3b82f6] text-[#020617] rounded-xl font-black text-sm uppercase tracking-[0.3em] transition-all duration-300 shadow-[0_10px_30px_rgba(0,242,255,0.4)] hover:brightness-125 hover:shadow-[0_10px_40px_rgba(0,242,255,0.6)] active:scale-[0.98]">
                  {qIdx + 1 >= questions.length ? "Compile Final Report >>" : "Initialize Next Module >>"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── RIGHT PANEL: System Terminal ─── */}
        <aside className="xl:col-span-3 flex flex-col order-3 h-[400px] xl:h-auto">
          <div className="bg-[#020617]/90 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-xl flex-grow flex flex-col overflow-hidden relative">
            <div className="bg-slate-900/80 px-5 py-3 border-b border-white/5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff007a]/50"></div>
                <div className="w-3 h-3 rounded-full bg-[#f5a623]/50"></div>
                <div className="w-3 h-3 rounded-full bg-[#00f2ff]/50"></div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-2">sys_terminal.sh</span>
            </div>
            
            <div className="flex-grow p-5 overflow-y-auto font-mono text-xs text-slate-300 flex flex-col gap-2 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`opacity-80 animate-fadeIn ${
                  log.includes('[ERROR]') || log.includes('[WARN]') ? 'text-[#ff007a]' : 
                  log.includes('[SUCCESS]') ? 'text-[#00f2ff]' : 
                  log.includes('[INFO]') ? 'text-[#f5a623]' : 'text-slate-400'
                }`}>
                  <span className="opacity-50 mr-2">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" })}</span>
                  {log}
                </div>
              ))}
              
              {/* Feedback injection into terminal */}
              {answered && feedback && (
                 <div className="mt-4 p-3 bg-white/5 border-l-2 border-[#00f2ff] text-slate-200">
                   <div className="uppercase text-[10px] text-[#00f2ff] mb-1 font-bold">Analysis_Report:</div>
                   {feedback.msg}
                 </div>
              )}
              
              <div ref={terminalEndRef} />
              <div className="flex items-center gap-2 mt-2 text-[#00f2ff]">
                <span>&gt;</span>
                <span className="w-2 h-4 bg-[#00f2ff] animate-pulse"></span>
              </div>
            </div>
          </div>
        </aside>

      </main>

      {/* ─── CSS Animations & Styles ─── */}
      <style>{`
        /* 3D Grid Floor */
        .cyber-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(0, 242, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 242, 255, 0.05) 1px, transparent 1px);
          transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
          transform-origin: top;
        }

        /* 3D Depth Helper */
        .preserve-3d { transform-style: preserve-3d; }

        /* Custom Scrollbar for Terminal */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,242,255,0.3); }

        /* Glitch Text Effect */
        .glitch-wrapper { position: relative; }
        .glitch { position: relative; font-weight: 900; }
        .glitch::before, .glitch::after {
          content: attr(data-text);
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0.8;
        }
        .glitch::before {
          left: 2px; text-shadow: -1px 0 #ff007a;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch::after {
          left: -2px; text-shadow: -1px 0 #00f2ff;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }

        /* Particles */
        @keyframes float1 { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(10px); } 100% { transform: translateY(0) translateX(0); } }
        @keyframes float2 { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-30px) translateX(-15px); } 100% { transform: translateY(0) translateX(0); } }
        @keyframes float3 { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.5); } 100% { transform: translateY(0) scale(1); } }
        .animate-float1 { animation: float1 8s infinite ease-in-out; }
        .animate-float2 { animation: float2 12s infinite ease-in-out; }
        .animate-float3 { animation: float3 10s infinite ease-in-out; }

        @keyframes glitch-anim {
          0% { clip: rect(10px, 9999px, 83px, 0); }
          5% { clip: rect(66px, 9999px, 57px, 0); transform: translate(1px, 1px); }
          10% { clip: rect(14px, 9999px, 49px, 0); transform: translate(-1px, -1px); }
          15% { clip: rect(0,0,0,0); transform: translate(0,0); }
          100% { clip: rect(0,0,0,0); }
        }
        @keyframes glitch-anim2 {
          0% { clip: rect(65px, 9999px, 100px, 0); }
          5% { clip: rect(15px, 9999px, 44px, 0); transform: translate(-1px, 1px); }
          10% { clip: rect(81px, 9999px, 20px, 0); transform: translate(1px, -1px); }
          15% { clip: rect(0,0,0,0); transform: translate(0,0); }
          100% { clip: rect(0,0,0,0); }
        }

        /* General Utilities */
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(50px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 20s infinite alternate ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}