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

// ─── Drawing functions (Untouched) ───────────────────────────────────────────
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
  const [lives, setLives] = useState(3); // NEW: 3 Strike System
  
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1);
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const [phase, setPhase] = useState("playing");
  
  // 'none' | 'granted' | 'denied'
  const [overlay, setOverlay] = useState("none"); 
  const [feedback, setFeedback] = useState(null);

  const canvasRef = useRef(null);
  const tickRef = useRef(0);
  const animRef = useRef(null);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  const hard = streak >= 3;
  const q = questions[qIdx];
  const DURATION = hard ? 8000 : 12000;

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => { setQuestions(shuffle(ALGORITHMS)); }, []);

  useEffect(() => {
    if (!q) return;
    tickRef.current = 0; setAnswered(false); setChosen(null);
    setFeedback(null); setOverlay("none");
    setShuffledOpts(shuffle(q.options)); setTimeLeft(1);
    startRef.current = Date.now();
  }, [qIdx, q, hard]);

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
        setAnswered(true); setStreak(0);
        setLives(l => l - 1);
        setOverlay("denied");
        setFeedback({ correct: false, msg: `System timeout. Optimal sequence was ${q.answer}.` });
      }
    }, 60);
    return () => clearInterval(timerRef.current);
  }, [q, answered, phase, DURATION]);

  // Game Over trigger
  useEffect(() => {
    if (lives <= 0) {
      setTimeout(() => setPhase("end"), 1500);
    }
  }, [lives]);

  const handleAnswer = useCallback((opt) => {
    if (answered || !q || lives <= 0) return;
    clearInterval(timerRef.current); setAnswered(true); setChosen(opt);
    
    const correct = opt === q.answer;
    const bonus = Math.round(timeLeft * 10);
    const basePoints = hard ? 20 : 10;
    const earned = correct ? basePoints + bonus : 0;

    if (correct) {
      setOverlay("granted");
      setScore(s => s + earned); 
      setStreak(s => s + 1);
      setFeedback({ correct: true, msg: q.explain });
    } else {
      setOverlay("denied");
      setStreak(0);
      setLives(l => l - 1);
      setFeedback({ correct: false, msg: q.explain });
    }
  }, [answered, q, timeLeft, hard, lives]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase !== "playing" || answered) return;
      const key = e.key.toUpperCase();
      const index = ['1', '2', '3', '4', 'A', 'B', 'C', 'D'].indexOf(key);
      if (index !== -1) {
        const optionIndex = index % 4;
        if (shuffledOpts[optionIndex]) {
          handleAnswer(shuffledOpts[optionIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answered, phase, handleAnswer, shuffledOpts]);

  const handleNext = () => { qIdx + 1 >= questions.length ? setPhase("end") : setQIdx(i => i + 1); };
  
  const restart = () => { 
    setQuestions(shuffle(ALGORITHMS)); setQIdx(0); setScore(0); setStreak(0); 
    setLives(3); setPhase("playing"); 
  };

  const totalPossible = ALGORITHMS.length * 20;

  // ─── END SCREEN (DECRYPTION REPORT) ──────────────────────────────────────────
  if (phase === "end") {
    const won = lives > 0;
    
    return (
      <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans overflow-hidden">
        <div className={`absolute inset-0 pointer-events-none opacity-20 ${won ? 'bg-[radial-gradient(circle_at_center,_#00f2ff,_transparent)]' : 'bg-[radial-gradient(circle_at_center,_#ff007a,_transparent)]'}`}></div>
        
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom animate-grid-flow"></div>

        <div className="relative z-10 w-full max-w-lg bg-[#020617]/80 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h2 className={`text-sm font-mono uppercase tracking-[0.5em] mb-6 ${won ? 'text-[#00f2ff]' : 'text-[#ff007a]'}`}>
            {won ? "System Decrypted" : "Security Lockout"}
          </h2>
          <div className="text-7xl mb-6 animate-bounce-slow">
              {won ? "🔓" : "🔒"}
          </div>
          <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
            {won ? "Access Granted" : "Access Denied"}
          </h3>
          <p className="text-slate-400 mb-8 font-mono">
            Decryption Score: <span className="text-white font-bold text-2xl">{score}</span>
          </p>
          <button onClick={restart} className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest border transition-all duration-300 ${won ? 'bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]/30 hover:border-[#00f2ff]' : 'bg-[#ff007a]/10 text-[#ff007a] border-[#ff007a]/30 hover:border-[#ff007a]'}`}>
            Reboot Protocol
          </button>
        </div>
      </div>
    );
  }

  if (!q) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-[#00f2ff] font-mono animate-pulse tracking-[0.3em] uppercase">Booting System...</div>;

  // ─── PLAYING SCREEN (HACKER SPEEDRUN HUD) ──────────────────────────────────
  return (
    <div className={`relative min-h-screen w-full bg-[#020617] flex flex-col items-center py-6 px-4 font-sans text-slate-200 overflow-hidden transition-colors duration-200`}>
      
      {/* Dynamic Background Glow based on Streak */}
      <div className="fixed inset-0 pointer-events-none transition-all duration-500" style={{
        background: `radial-gradient(circle at 50% 50%, ${streak >= 3 ? 'rgba(245, 166, 35, 0.08)' : 'rgba(0, 242, 255, 0.05)'}, transparent 70%)`
      }} />

      {/* ─── TOP HUD (HACKER PROTOCOL) ─── */}
      <header className="relative w-full max-w-5xl flex justify-between items-start mb-6 z-20">
        
        {/* Score & Progression */}
        <div className="flex flex-col w-[30%]">
           <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Decryption Sequence</span>
           <div className="flex items-end gap-3">
             <span className="text-4xl font-black text-white leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{score}</span>
             <span className="text-xs text-[#00f2ff] font-mono mb-1">NODE {qIdx + 1}/{questions.length}</span>
           </div>
        </div>

        {/* Center Streak Multiplier */}
        <div className="flex flex-col items-center justify-center">
           <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mb-1">Data Stream</span>
           <div className={`px-4 py-1 rounded-full border-2 font-black text-lg tracking-widest transition-all ${streak >= 3 ? 'bg-[#f5a623]/20 border-[#f5a623] text-[#f5a623] shadow-[0_0_15px_#f5a623] animate-pulse' : streak > 0 ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff]' : 'bg-transparent border-slate-700 text-slate-500'}`}>
              {streak}x COMBO
           </div>
        </div>

        {/* Lives (Firewall Bypasses) */}
        <div className="flex flex-col items-end w-[30%]">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Firewall Bypasses</span>
          <div className="flex gap-2">
            {[1, 2, 3].map((strike) => (
              <div key={strike} className={`w-8 h-8 rounded-lg rotate-45 flex items-center justify-center transition-all duration-300 ${strike <= lives ? 'bg-[#00f2ff]/20 border border-[#00f2ff] shadow-[0_0_10px_#00f2ff]' : 'bg-slate-900 border border-slate-700 opacity-50'}`}>
                <div className={`-rotate-45 text-xs font-black ${strike <= lives ? 'text-[#00f2ff]' : 'text-slate-600'}`}>
                  🛡️
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── MAIN ARENA (Canvas Visualizer) ─── */}
      <main className="relative w-full max-w-5xl z-10 flex flex-col items-center">

        <div className={`w-full relative aspect-[21/9] max-h-[350px] bg-[#050b14] rounded-[2rem] overflow-hidden border-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 group transition-all duration-300 ${overlay === 'granted' ? 'border-[#00f2ff] shadow-[0_0_30px_#00f2ff]' : overlay === 'denied' ? 'border-[#ff007a] shadow-[0_0_30px_#ff007a]' : 'border-slate-800'}`}>
          
          {/* CRT Overlay Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 pointer-events-none mix-blend-screen opacity-50"></div>
          
          {/* Animated Scanner Line */}
          {!answered && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00f2ff] shadow-[0_0_20px_5px_rgba(0,242,255,0.5)] z-10 opacity-70 animate-scanner"></div>
          )}

          {/* Top Canvas Bar (Timer) */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800 z-20">
            <div className={`h-full transition-all duration-100 ease-linear ${timeLeft < 0.3 ? 'bg-[#ff007a] shadow-[0_0_15px_#ff007a]' : 'bg-[#00f2ff] shadow-[0_0_15px_#00f2ff]'}`} style={{ width: `${timeLeft * 100}%` }} />
          </div>

          {/* Hint Overlay */}
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded border border-white/10 z-20 flex items-center gap-3">
            <span className={`text-xs font-black animate-pulse ${hard ? 'text-[#ff007a]' : 'text-[#00f2ff]'}`}>ANALYSIS:</span>
            <span className="text-xs text-white font-mono tracking-wide">{hard ? q.hardHint : q.hint}</span>
          </div>

          {/* SUCCESS / FAIL OVERLAYS */}
          <div className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-300 pointer-events-none ${overlay === 'granted' ? 'bg-[#00f2ff]/20 opacity-100' : overlay === 'denied' ? 'bg-[#ff007a]/20 opacity-100' : 'opacity-0'}`}>
            {overlay === 'granted' && <span className="text-5xl md:text-7xl font-black text-[#00f2ff] tracking-[0.2em] uppercase mix-blend-screen drop-shadow-[0_0_20px_#00f2ff]">ACCESS GRANTED</span>}
            {overlay === 'denied' && <span className="text-5xl md:text-7xl font-black text-[#ff007a] tracking-[0.2em] uppercase mix-blend-screen drop-shadow-[0_0_20px_#ff007a] animate-pulse">ACCESS DENIED</span>}
          </div>

          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain p-6" />
        </div>

        {/* ─── DECRYPTION KEYS (Options Grid) ─── */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
          {shuffledOpts.map((opt, index) => {
            const letter = ['A', 'B', 'C', 'D'][index];
            const isChosen = chosen === opt;
            const isCorrect = opt === q.answer;
            const show = answered;
            
            // Sleek Decryption Key styles
            let baseStyle = "bg-[#0f172a]/80 border-slate-700 text-slate-300 hover:bg-[#1e293b] hover:border-[#00f2ff]/50";
            let iconStyle = "bg-slate-800 text-slate-400";
            
            if (show) {
              if (isCorrect) {
                baseStyle = "bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.2)]";
                iconStyle = "bg-[#00f2ff] text-[#020617]";
              } else if (isChosen && !isCorrect) {
                baseStyle = "bg-[#ff007a]/10 border-[#ff007a] text-[#ff007a] shadow-[0_0_20px_rgba(255,0,122,0.2)]";
                iconStyle = "bg-[#ff007a] text-[#020617]";
              } else {
                baseStyle = "bg-black/40 border-transparent text-slate-600 opacity-30";
              }
            }

            return (
              <button
                key={opt} disabled={answered} onClick={() => handleAnswer(opt)}
                className={`group flex items-center p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 outline-none ${baseStyle} ${!answered ? 'active:scale-95' : 'cursor-default'}`}
              >
                <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-black text-sm mr-4 transition-colors duration-300 border ${iconStyle} ${!show ? 'border-slate-600 group-hover:border-[#00f2ff] group-hover:text-[#00f2ff]' : 'border-transparent'}`}>
                  {letter}
                </div>
                <span className="text-lg font-bold tracking-wide text-left flex-grow font-mono">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* ─── NEXT BUTTON OVERLAY ─── */}
        <div className={`w-full max-w-4xl mt-8 transition-all duration-500 overflow-hidden flex justify-center ${answered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <button onClick={handleNext} className="w-full sm:w-auto px-12 py-4 bg-white text-[#020617] rounded-xl font-black text-sm uppercase tracking-[0.3em] transition-all hover:bg-slate-200 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              {qIdx + 1 >= questions.length ? "Complete Sequence" : "Decrypt Next Node >>"}
            </button>
        </div>

      </main>

      {/* ─── CUSTOM KEYFRAME ANIMATIONS ─── */}
      <style>{`
        @keyframes scanner {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanner {
          animation: scanner 3s ease-in-out infinite;
        }
        @keyframes grid-flow {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        .animate-grid-flow {
          animation: grid-flow 2s linear infinite;
        }
      `}</style>
    </div>
  );
}