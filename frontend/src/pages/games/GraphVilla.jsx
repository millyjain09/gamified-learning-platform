import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GRID = 11;

const GrowtixRatMaze = () => {
  const animTimer = useRef(null);
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  
  // --- SINGLE EDITOR BOILERPLATE ---
  const initialBoilerplate = `function solve(maze, start, end, size) {
  const path = [];
  const visited = Array(size).fill().map(() => Array(size).fill().map(() => [false, false]));
  let stepCount = 0; // Safety limit

  function backtrack(r, c, hasKey) {
    // Prevent infinite loops from crashing the browser
    if (stepCount++ > 2500) throw new Error("Infinite Loop or Max Steps Exceeded!");

    // Basic bounds checking
    if (r < 0 || c < 0 || r >= size || c >= size || maze[r][c] === 1) return false;
    
    // ⬇️ --- WRITE YOUR LOGIC BELOW --- ⬇️
    // 1. Check if the current cell is 'FIRE'. If yes, return false immediately.
    

    // 2. Check if the current cell is 'DOOR'. If yes, and hasKey is false, return false.
    

    // 3. Update currentKey. If the cell is 'KEY', currentKey becomes true.
    let currentKey = hasKey; // UPDATE THIS
    // ⬆️ --- WRITE YOUR LOGIC ABOVE --- ⬆️

    let kIdx = currentKey ? 1 : 0;
    if (visited[r][c][kIdx]) return false;

    // Log path
    path.push({ r, c, type: 'forward', hasKey: currentKey });
    visited[r][c][kIdx] = true;

    // Reached destination?
    if (r === end.r && c === end.c) return true;

    // Explore: Down, Right, Up, Left
   

    // Backtrack
    path.push({ r, c, type: 'back', hasKey: currentKey });
    return false;
  }

  backtrack(start.r, start.c, false);
  return path;
}`;

  const [code, setCode] = useState(initialBoilerplate);
  const [maze, setMaze] = useState([]);
  const [steps, setSteps] = useState([]);
  const [vizIdx, setVizIdx] = useState(-1);
  const [hasKey, setHasKey] = useState(false);
  const [status, setStatus] = useState('idle');
  const [aiMsg, setAiMsg] = useState("AI Coach: Ready? Complete the logic block to guide the mouse!");
  const [speed, setSpeed] = useState(150);
  const [overlay, setOverlay] = useState({ show: false, icon: '', title: '', btn: '', bg: '', stats: null });
  const [optimalPathLength, setOptimalPathLength] = useState(0);

  // --- BFS to verify Solvability & Find Shortest Path ---
  const getPath = (m, start, target) => {
    let parent = {}, q = [[start[0], start[1], false]], vis = new Set([start[0] + ',' + start[1] + ',false']);
    while (q.length) {
      let [r, c, keyState] = q.shift();
      
      if (r === target[0] && c === target[1]) {
        let path = [], cur = [r, c, keyState];
        while (cur) { 
          path.push(cur); 
          cur = parent[cur[0] + ',' + cur[1] + ',' + cur[2]]; 
        }
        return path.reverse();
      }

      for (let [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        let nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= GRID || nc >= GRID || m[nr][nc] === 1 || m[nr][nc] === 'FIRE') continue;
        
        let nextKeyState = keyState || m[nr][nc] === 'KEY';
        if (m[nr][nc] === 'DOOR' && !nextKeyState) continue; // Cannot pass door without key

        let stateStr = nr + ',' + nc + ',' + nextKeyState;
        if (!vis.has(stateStr)) {
          vis.add(stateStr); 
          parent[stateStr] = [r, c, keyState]; 
          q.push([nr, nc, nextKeyState]);
        }
      }
    }
    return [];
  };

  const newLevel = () => {
    clearInterval(animTimer.current);
    setSteps([]); setVizIdx(-1); setStatus('idle'); setHasKey(false); setOverlay({ show: false });
    
    let m = [], mainRoad = [];
    
    // Ensure we ALWAYS generate a solvable maze
    while (mainRoad.length === 0) {
      m = Array(GRID).fill(1).map(() => Array(GRID).fill(1));
      const carve = (r, c) => {
        m[r][c] = 0;
        let dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]].sort(() => Math.random() - 0.5);
        for (let [dr, dc] of dirs) {
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nc >= 0 && nr < GRID && nc < GRID && m[nr][nc] === 1) {
            m[r + dr / 2][c + dc / 2] = 0; carve(nr, nc);
          }
        }
      };
      carve(0, 0); m[GRID-1][GRID-1] = 0;

      let basePath = getPath(m, [0, 0], [GRID-1, GRID-1]);
      
      if (basePath.length > 5) {
        let doorCell = basePath[Math.floor(basePath.length * 0.7)];
        let keyCell = basePath[Math.floor(basePath.length * 0.3)];
        m[doorCell[0]][doorCell[1]] = 'DOOR';
        m[keyCell[0]][keyCell[1]] = 'KEY';
      }

      let roadSet = new Set(basePath.map(p => `${p[0]},${p[1]}`));
      let fireAdded = 0;
      for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
          if (m[r][c] === 0 && !roadSet.has(`${r},${c}`) && Math.random() > 0.6 && fireAdded < 5) {
            m[r][c] = 'FIRE'; fireAdded++;
          }
        }
      }
      
      mainRoad = getPath(m, [0, 0], [GRID-1, GRID-1]);
    }

    setOptimalPathLength(mainRoad.length); 
    setMaze(m);
    setAiMsg("AI Coach: Level ready. Avoid the fire, grab the key to unlock the door!");
  };

  useEffect(() => { newLevel(); }, []);

  const runCode = (customCode = null) => {
    clearInterval(animTimer.current);
    const codeToEval = customCode !== null ? customCode : code;
    
    try {
      // Create function directly from editor code
      const userFn = new Function('maze', 'start', 'end', 'size', `${codeToEval}\nreturn solve(maze, start, end, size);`);
      
      const t0 = performance.now();
      const pathSteps = userFn(maze.map(r => [...r]), { r: 0, c: 0 }, { r: GRID - 1, c: GRID - 1 }, GRID);
      const t1 = performance.now();
      const execTime = (t1 - t0).toFixed(2);

      if (!pathSteps || pathSteps.length <= 1) {
        setAiMsg("AI Coach: The mouse didn't move! Did your logic return false too early?");
        setOverlay({ show: true, icon: '🛑', title: 'LOGIC FAILED: NO MOVEMENT', btn: 'FIX CODE', bg: 'rgba(30,41,59,0.95)' });
        return;
      }
      
      setSteps(pathSteps);
      animate(pathSteps, execTime);
    } catch (err) {
      // Catch syntax errors and infinite loops
      setAiMsg("AI Coach: Error - " + err.message.split('\n')[0]);
      setOverlay({ show: true, icon: '⚠️', title: 'RUNTIME ERROR', btn: 'FIX CODE', bg: 'rgba(153,27,27,0.95)' });
    }
  };

  const handleWinScore = (userPathLength, execTimeStr) => {
    const execTime = parseFloat(execTimeStr);
    const baseScore = 100;
    const speedBonus = execTime < 2 ? 50 : execTime < 10 ? 30 : 10;
    
    const forwardSteps = steps.filter(s => s.type === 'forward').length;
    const extraSteps = forwardSteps - optimalPathLength;
    const pathBonus = extraSteps <= 0 ? 50 : Math.max(0, 50 - (extraSteps * 2));
    
    const totalEarned = baseScore + speedBonus + pathBonus;

    if (userData && userData.id) {
      const newCoins = (userData.coins || 0) + totalEarned;
      const updatedUser = { ...userData, coins: newCoins };

      axios.post('http://localhost:5000/api/auth/update-stats', {
        userId: userData.id,
        coins: newCoins,
        activeAvatarId: userData.activeAvatarId,
        unlockedAvatars: userData.unlockedAvatars
      }).then(() => {
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); 
      }).catch(err => console.error("Coin update failed", err));
    }

    setOverlay({ 
      show: true, icon: '🧀', title: 'MISSION PASSED', btn: 'NEXT MAZE', bg: 'rgba(6,78,59,0.95)', mode: 'win',
      stats: { baseScore, speedBonus, pathBonus, totalEarned, execTime, forwardSteps }
    });
  };

  const animate = (path, execTime) => {
    setStatus('running');
    let i = 0;
    
    animTimer.current = setInterval(() => {
      if (i >= path.length) { 
        clearInterval(animTimer.current); 
        if (status === 'running') {
            setStatus('lost');
            setAiMsg("AI Coach: You got lost in the maze! Your path didn't reach the cheese.");
            setOverlay({ show: true, icon: '🤔', title: 'LOST IN MAZE', btn: 'RETRY CODE', bg: 'rgba(30,41,59,0.95)' });
        }
        return; 
      }
      
      const s = path[i];
      const cell = maze[s.r][s.c];

      setVizIdx(i);
      setHasKey(s.hasKey);

      // REAL-TIME COLLISION DETECTION
      if (cell === 'FIRE') {
        setStatus('burnt'); clearInterval(animTimer.current);
        setAiMsg("AI Coach: Ouch! The mouse stepped in FIRE. Make sure your logic checks for it.");
        setOverlay({ show: true, icon: '💀', title: 'BURNED ALIVE!', btn: 'FIX CODE', bg: 'rgba(153,27,27,0.95)' });
      } else if (cell === 'DOOR' && !s.hasKey) {
        setStatus('locked'); clearInterval(animTimer.current);
        setAiMsg("AI Coach: You hit a DOOR but don't have the KEY. Did you update currentKey?");
        setOverlay({ show: true, icon: '🔒', title: 'DOOR LOCKED! NEED KEY!', btn: 'FIX CODE', bg: 'rgba(30,41,59,0.95)' });
      } else if (s.r === GRID-1 && s.c === GRID-1 && i === path.length - 1) {
        setStatus('win'); clearInterval(animTimer.current);
        handleWinScore(path.length, execTime); 
      }
      i++;
    }, speed);
  };

  const getSolution = () => {
    const sol = `function solve(maze, start, end, size) {
  const path = [];
  const visited = Array(size).fill().map(() => Array(size).fill().map(() => [false, false]));
  let stepCount = 0;

  function backtrack(r, c, hasKey) {
    if (stepCount++ > 2500) throw new Error("Infinite Loop or Max Steps Exceeded!");

    // Basic bounds checking
    if (r < 0 || c < 0 || r >= size || c >= size || maze[r][c] === 1) return false;
    
    // ⬇️ --- WRITE YOUR LOGIC BELOW --- ⬇️
    // 1. Check if the current cell is 'FIRE'. If yes, return false immediately.
    if (maze[r][c] === 'FIRE') return false;

    // 2. Check if the current cell is 'DOOR'. If yes, and hasKey is false, return false.
    if (maze[r][c] === 'DOOR' && !hasKey) return false;

    // 3. Update currentKey. If the cell is 'KEY', currentKey becomes true.
    let currentKey = hasKey || maze[r][c] === 'KEY'; // UPDATE THIS
    // ⬆️ --- WRITE YOUR LOGIC ABOVE --- ⬆️

    let kIdx = currentKey ? 1 : 0;
    if (visited[r][c][kIdx]) return false;

    // Log path
    path.push({ r, c, type: 'forward', hasKey: currentKey });
    visited[r][c][kIdx] = true;

    // Reached destination?
    if (r === end.r && c === end.c) return true;

    // Explore: Down, Right, Up, Left
    if (backtrack(r + 1, c, currentKey)) return true;
    if (backtrack(r, c + 1, currentKey)) return true;
    if (backtrack(r - 1, c, currentKey)) return true;
    if (backtrack(r, c - 1, currentKey)) return true;

    // Backtrack
    path.push({ r, c, type: 'back', hasKey: currentKey });
    return false;
  }

  backtrack(start.r, start.c, false);
  return path;
}`;
    setCode(sol);
    setTimeout(() => runCode(sol), 100);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-6 flex flex-col gap-6 font-mono overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,242,255,0.05),_transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* ─── HEADER ─── */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 backdrop-blur-xl p-4 md:px-6 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 gap-4">
        <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-blue-500 tracking-[0.2em] uppercase italic">
         RAT_MAZE
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] px-4 py-2 rounded-lg font-black tracking-widest shadow-[0_0_10px_rgba(245,166,35,0.2)]">
            <span>🪙</span> {userData?.coins || 0}
          </div>
          <button onClick={newLevel} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs uppercase tracking-widest border border-white/5 transition-all">
            New Maze
          </button>
          <button onClick={getSolution} className="px-5 py-2 bg-[#312e81] hover:bg-[#4338ca] text-white rounded-lg font-bold text-xs uppercase tracking-widest border border-indigo-500/50 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            Solution
          </button>
          <button onClick={() => runCode()} className="px-6 py-2 bg-gradient-to-r from-[#00f2ff] to-blue-600 hover:brightness-125 text-[#020617] rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)] active:scale-95">
            Deploy Logic
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex flex-col lg:flex-row flex-1 gap-6 min-h-0 z-10">
        
        {/* Editor Panel */}
        <div className="flex-[1.2] bg-[#050b14] rounded-2xl flex flex-col border border-white/10 shadow-2xl overflow-hidden">
          <div className="px-5 py-3 bg-slate-900 border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff007a]/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#f5a623]/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#00f2ff]/50"></div>
              </div>
              <span className="ml-2 text-[#00f2ff]/70">algorithm_logic.js</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span>SPEED: {speed}ms</span>
              <input type="range" min="20" max="500" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-24 accent-[#00f2ff]" />
            </div>
          </div>
          
          <textarea 
            className="flex-1 bg-[#0a101f] text-[#00f2ff] p-5 border-none resize-none outline-none text-xs sm:text-sm leading-relaxed custom-scrollbar shadow-[inset_0_0_20px_rgba(0,242,255,0.05)] focus:bg-[#0c162c] transition-colors" 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            spellCheck="false" 
          />
        </div>

        {/* Game Panel */}
        <div className="flex-1 bg-slate-900/50 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center relative border border-white/10 shadow-xl p-6 overflow-hidden">
          
          <div className="absolute top-4 left-4 right-4 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-lg border border-white/5 z-20">
            <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${status === 'running' ? 'bg-[#00f2ff]' : status === 'burnt' || status === 'locked' ? 'bg-[#ff007a]' : 'bg-[#f5a623]'}`}></div>
            <span className={`text-xs font-mono tracking-wide ${status === 'burnt' || status === 'locked' ? 'text-[#ff007a]' : 'text-slate-300'}`}>{aiMsg}</span>
          </div>

          <div 
            className="grid gap-[2px] md:gap-[3px] p-2 bg-[#020617] rounded-xl border border-white/5 shadow-inner mt-12"
            style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))` }}
          >
            {maze.map((row, r) => row.map((val, c) => {
              const step = steps.slice(0, vizIdx + 1).find(st => st.r === r && st.c === c);
              const isCur = steps[vizIdx]?.r === r && steps[vizIdx]?.c === c;
              
              let bgClass = 'bg-[#0f172a] border-transparent';
              let content = '';

              if (val === 1) bgClass = 'bg-slate-800 border-slate-700';
              else if (val === 'FIRE') { bgClass = 'bg-red-950/50 border-[#ff007a]/30 shadow-[inset_0_0_10px_rgba(255,0,122,0.2)]'; content = '🔥'; }
              else if (val === 'DOOR') { bgClass = hasKey ? 'bg-emerald-950/50 border-emerald-500/30' : 'bg-amber-950/50 border-[#f5a623]/30'; content = hasKey ? '🔓' : '🚪'; }
              else if (val === 'KEY' && !hasKey) { content = '🗝️'; }
              else if (r === GRID-1 && c === GRID-1) { content = '🧀'; }
              
              if (step?.type === 'forward' && val !== 'FIRE' && val !== 'DOOR') bgClass = 'bg-[#00f2ff]/20 border-[#00f2ff]/30';
              else if (step?.type === 'back') bgClass = 'bg-slate-800/50 border-transparent';

              if (isCur) {
                bgClass = `bg-[#020617] border-[#00f2ff] shadow-[0_0_15px_#00f2ff] scale-110 z-10`;
                content = status === 'burnt' ? '💀' : '🐭';
              }

              return (
                <div key={`${r}-${c}`} className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-sm md:text-lg rounded-[4px] border transition-all duration-200 ${bgClass}`}>
                  {content}
                </div>
              );
            }))}
          </div>

          {/* OVERLAY */}
          {overlay.show && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 rounded-2xl backdrop-blur-md animate-fadeIn" style={{ background: overlay.bg }}>
              <div className="text-7xl mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{overlay.icon}</div>
              <div className="text-2xl font-black text-white uppercase tracking-widest mb-6 drop-shadow-md text-center px-4">{overlay.title}</div>
              
              {overlay.stats && (
                <div className="bg-[#020617]/80 border border-white/10 p-6 rounded-xl w-80 mb-6 shadow-2xl backdrop-blur-lg">
                  <div className="text-[10px] text-slate-500 tracking-[0.3em] font-black uppercase border-b border-white/5 pb-2 mb-4 text-center">Algorithm Report</div>
                  <div className="flex justify-between text-sm text-slate-300 mb-2 font-mono"><span>Mission Clear:</span> <span className="text-emerald-400 font-bold">+{overlay.stats.baseScore}</span></div>
                  <div className="flex justify-between text-sm text-slate-300 mb-2 font-mono"><span>Speed ({overlay.stats.execTime}ms):</span> <span className="text-emerald-400 font-bold">+{overlay.stats.speedBonus}</span></div>
                  <div className="flex justify-between text-sm text-slate-300 mb-4 font-mono"><span>Efficiency ({overlay.stats.forwardSteps} steps):</span> <span className="text-emerald-400 font-bold">+{overlay.stats.pathBonus}</span></div>
                  <div className="h-px bg-white/10 w-full mb-4"></div>
                  <div className="flex justify-between text-lg text-white font-black uppercase tracking-widest"><span>Total Earned:</span> <span className="text-[#f5a623] drop-shadow-[0_0_10px_#f5a623]">+{overlay.stats.totalEarned} 🪙</span></div>
                </div>
              )}

              <button 
                className="px-10 py-4 bg-white text-[#020617] rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-slate-200 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)] mt-4"
                onClick={overlay.mode === 'win' ? newLevel : () => setOverlay({show:false})}
              >
                {overlay.btn}
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 242, 255, 0.4); }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default GrowtixRatMaze;