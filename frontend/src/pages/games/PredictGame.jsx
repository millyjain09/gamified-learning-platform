import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Scissors, Zap, Shield, ArrowLeft, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
const PredictGame = () => {
  const navigate = useNavigate();

  // ---> GET LOGGED IN USER DATA <---
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('user')) || null);

  // --- GAME STATE ---
  const [hp, setHp] = useState(100);
  const [xp, setXp] = useState(0);
  const [temperature, setTemperature] = useState(30);
  const [qIndex, setQIndex] = useState(1);
  const [status, setStatus] = useState('playing'); 
  const [lastAction, setLastAction] = useState(null); 
  const [sessionCoins, setSessionCoins] = useState(0);

  // --- EXPANDED QUESTIONS ---
  const questions = [
    {
      id: 1, concept: "Post/Pre Increment",
      code: `int a = 5, b = 2;\nint c = a++ + ++b;\ncout << c << " " << a << " " << b;`,
      options: [
        { id: 'A', text: '7 6 3', color: 'from-red-900/80 to-red-600/20 border-red-500 text-red-400', isCorrect: false },
        { id: 'B', text: '8 6 3', color: 'from-blue-900/80 to-blue-600/20 border-blue-500 text-blue-400', isCorrect: true },
        { id: 'C', text: '8 5 3', color: 'from-green-900/80 to-green-600/20 border-green-500 text-green-400', isCorrect: false },
        { id: 'D', text: '7 5 2', color: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500 text-yellow-400', isCorrect: false }
      ]
    },
    {
      id: 2, concept: "Nested Loops Break",
      code: `int count = 0;\nfor(int i=0; i<3; i++) {\n  for(int j=0; j<3; j++) {\n    if(j == 1) break;\n    count++;\n  }\n}\ncout << count;`,
      options: [
        { id: 'A', text: '9', color: 'from-red-900/80 to-red-600/20 border-red-500 text-red-400', isCorrect: false },
        { id: 'B', text: '6', color: 'from-blue-900/80 to-blue-600/20 border-blue-500 text-blue-400', isCorrect: false },
        { id: 'C', text: '3', color: 'from-green-900/80 to-green-600/20 border-green-500 text-green-400', isCorrect: true },
        { id: 'D', text: '0', color: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500 text-yellow-400', isCorrect: false }
      ]
    },
    {
      id: 3, concept: "Pointer Arithmetic",
      code: `int arr[] = {10, 20, 30, 40};\nint *p = arr;\n*(p+2) += 5;\ncout << arr[2];`,
      options: [
        { id: 'A', text: '30', color: 'from-red-900/80 to-red-600/20 border-red-500 text-red-400', isCorrect: false },
        { id: 'B', text: '35', color: 'from-blue-900/80 to-blue-600/20 border-blue-500 text-blue-400', isCorrect: true },
        { id: 'C', text: '25', color: 'from-green-900/80 to-green-600/20 border-green-500 text-green-400', isCorrect: false },
        { id: 'D', text: 'Error', color: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500 text-yellow-400', isCorrect: false }
      ]
    },
    {
      id: 4, concept: "Maximum Subarray",
      code: `// Which algorithm is the most optimal for\n// finding the maximum sum contiguous subarray?`,
      options: [
        { id: 'A', text: "Dijkstra's", color: 'from-red-900/80 to-red-600/20 border-red-500 text-red-400', isCorrect: false },
        { id: 'B', text: "Kruskal's", color: 'from-blue-900/80 to-blue-600/20 border-blue-500 text-blue-400', isCorrect: false },
        { id: 'C', text: "Kadane's", color: 'from-green-900/80 to-green-600/20 border-green-500 text-green-400', isCorrect: true },
        { id: 'D', text: "Floyd", color: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500 text-yellow-400', isCorrect: false }
      ]
    },
    {
      id: 5, concept: "DP Time Complexity",
      code: `// What is the time complexity to find the\n// Longest Common Subsequence (LCS) of two\n// strings of lengths M and N using DP?`,
      options: [
        { id: 'A', text: 'O(M + N)', color: 'from-red-900/80 to-red-600/20 border-red-500 text-red-400', isCorrect: false },
        { id: 'B', text: 'O(M * N)', color: 'from-blue-900/80 to-blue-600/20 border-blue-500 text-blue-400', isCorrect: true },
        { id: 'C', text: 'O(2^(M+N))', color: 'from-green-900/80 to-green-600/20 border-green-500 text-green-400', isCorrect: false },
        { id: 'D', text: 'O(M log N)', color: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500 text-yellow-400', isCorrect: false }
      ]
    },
    {
      id: 6, concept: "Graph Traversal",
      code: `// Which data structure is primarily used to\n// implement Breadth-First Search (BFS)?`,
      options: [
        { id: 'A', text: 'Stack', color: 'from-red-900/80 to-red-600/20 border-red-500 text-red-400', isCorrect: false },
        { id: 'B', text: 'Queue', color: 'from-blue-900/80 to-blue-600/20 border-blue-500 text-blue-400', isCorrect: true },
        { id: 'C', text: 'Priority Q', color: 'from-green-900/80 to-green-600/20 border-green-500 text-green-400', isCorrect: false },
        { id: 'D', text: 'Linked List', color: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500 text-yellow-400', isCorrect: false }
      ]
    },
    {
      id: 7, concept: "BST Properties",
      code: `// In a Binary Search Tree (BST), which traversal\n// method visits the nodes in sorted (ascending) order?`,
      options: [
        { id: 'A', text: 'Preorder', color: 'from-red-900/80 to-red-600/20 border-red-500 text-red-400', isCorrect: false },
        { id: 'B', text: 'Inorder', color: 'from-blue-900/80 to-blue-600/20 border-blue-500 text-blue-400', isCorrect: true },
        { id: 'C', text: 'Postorder', color: 'from-green-900/80 to-green-600/20 border-green-500 text-green-400', isCorrect: false }, 
        { id: 'D', text: 'Level-order', color: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500 text-yellow-400', isCorrect: false }
      ]
    },
    {
      id: 8, concept: "Sorting Algorithms",
      code: `// What is the worst-case time complexity\n// of QuickSort?`,
      options: [
        { id: 'A', text: 'O(N log N)', color: 'from-red-900/80 to-red-600/20 border-red-500 text-red-400', isCorrect: false },
        { id: 'B', text: 'O(N)', color: 'from-blue-900/80 to-blue-600/20 border-blue-500 text-blue-400', isCorrect: false },
        { id: 'C', text: 'O(N^2)', color: 'from-green-900/80 to-green-600/20 border-green-500 text-green-400', isCorrect: true },
        { id: 'D', text: 'O(log N)', color: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500 text-yellow-400', isCorrect: false }
      ]
    }
  ];

  const currentQ = questions[qIndex - 1];

  // --- CORE TEMPERATURE (TIMER) LOGIC ---
  useEffect(() => {
    if (status !== 'playing') return;
    
    const heatTimer = setInterval(() => {
      setTemperature((prev) => {
        if (prev >= 98) {
          clearInterval(heatTimer);
          handleMeltdown();
          return 100;
        }
        return prev + 2;
      });
    }, 1000);
    
    return () => clearInterval(heatTimer);
  }, [status, qIndex]);

  const handleMeltdown = () => {
    setHp((prev) => Math.max(0, prev - 30));
    setStatus('feedback');
    setLastAction('error');
    
    setTimeout(() => {
      if (hp - 30 <= 0) {
        setStatus('gameover');
      } else {
        moveToNextQuestion();
      }
    }, 2000);
  };

  // --- WIRE CUT (ANSWER) LOGIC ---
  const handleCutWire = (isCorrect) => {
    if (status !== 'playing') return;
    
    setStatus('feedback');

    if (isCorrect) {
      setLastAction('success');
      setXp(prev => prev + 50);
      setTemperature(prev => Math.max(30, prev - 20));

      const coinsEarned = 20; 
      setSessionCoins(prev => prev + coinsEarned); 

      if (userData && userData.id) {
        const newCoins = (userData.coins || 0) + coinsEarned;
        const updatedUser = { ...userData, coins: newCoins };

        axios.post(`${API_URL}/api/auth/update-stats`, {
          userId: userData.id,
          coins: newCoins,
          activeAvatarId: userData.activeAvatarId,
          unlockedAvatars: userData.unlockedAvatars
        }).then(() => {
          setUserData(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser)); 
        }).catch(err => console.error("Coin update failed", err));
      }
      
      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
    } else {
      setLastAction('error');
      setHp(prev => Math.max(0, prev - 15));
      setTemperature(prev => Math.min(100, prev + 25));
      
      setTimeout(() => {
        if (hp - 15 <= 0 || temperature + 25 >= 100) {
          setStatus('gameover');
        } else {
          moveToNextQuestion();
        }
      }, 2000);
    }
  };

  const moveToNextQuestion = () => {
    if (qIndex < questions.length) {
      setQIndex(prev => prev + 1);
      setStatus('playing');
      setLastAction(null);
    } else {
      setStatus('completed');
    }
  };

  // --- RENDER SCREENS ---
  if (status === 'gameover') {
    return (
      <div className="relative min-h-screen bg-red-950 flex flex-col items-center justify-center text-center p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] z-0 pointer-events-none"></div>
        <div className="z-10 flex flex-col items-center">
          <AlertTriangle className="w-40 h-40 text-red-500 mb-6 animate-pulse drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
          <h1 className="text-7xl font-black tracking-tighter uppercase text-white mb-2 drop-shadow-lg">Core Meltdown</h1>
          <p className="text-red-400 font-mono text-xl mb-8 tracking-widest uppercase">System compromised. Evacuation required.</p>
          
          <div className="bg-black/60 backdrop-blur-md border border-red-500/30 px-8 py-4 rounded-2xl mb-10 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
             <span className="text-yellow-400 font-bold text-2xl tracking-widest">SALVAGED COINS: {sessionCoins} 🪙</span>
          </div>

          <button onClick={() => navigate('/dsa-missions')} className="group relative px-10 py-4 bg-red-900/50 border-2 border-red-500 text-white font-black uppercase tracking-widest rounded-lg hover:bg-red-600 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all duration-300 overflow-hidden">
            <span className="relative z-10">Initiate Evacuation</span>
            <div className="absolute inset-0 h-full w-0 bg-red-500 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
          </button>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] z-0 pointer-events-none"></div>
        <div className="z-10 flex flex-col items-center">
          <CheckCircle2 className="w-32 h-32 text-cyan-400 mb-6 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]" />
          <h1 className="text-6xl font-black tracking-tighter uppercase text-white mb-2">Threat Neutralized</h1>
          <p className="text-cyan-400 font-mono text-xl mb-8 tracking-widest uppercase">Sequence execution flawless. Total XP: {xp}</p>
          
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 px-8 py-4 rounded-2xl mb-10 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
             <span className="text-yellow-400 font-bold text-2xl tracking-widest">COINS SECURED: {sessionCoins} 🪙</span>
          </div>

          <button onClick={() => navigate('/dsa-missions')} className="group relative px-10 py-4 bg-cyan-950/50 border-2 border-cyan-400 text-cyan-300 font-black uppercase tracking-widest rounded-lg hover:text-slate-900 transition-all duration-300 overflow-hidden">
             <span className="relative z-10">Extract & Return</span>
             <div className="absolute inset-0 h-full w-0 bg-cyan-400 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
          </button>
        </div>
      </div>
    );
  }

  // Dynamic background handling for visual feedback
  let bgOverlay = 'bg-slate-950';
  if (status === 'feedback') {
    bgOverlay = lastAction === 'success' ? 'bg-green-950/40' : 'bg-red-950/40';
  } else if (temperature > 80) {
    bgOverlay = 'bg-red-950/20 animate-pulse';
  }

  return (
    <div className={`relative min-h-screen ${bgOverlay} text-slate-200 p-4 md:p-8 font-sans flex flex-col transition-colors duration-500 overflow-hidden`}>
      
      {/* Aesthetic Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>

      {/* --- TELEMETRY DASHBOARD --- */}
      <header className="relative z-10 max-w-6xl mx-auto w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <button onClick={() => navigate('/dsa-missions')} className="flex items-center gap-2 text-slate-400 hover:text-white font-mono tracking-widest text-sm uppercase transition-colors px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
          <ArrowLeft className="w-4 h-4" /> Abort Sequence
        </button>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
             <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Session XP</span>
             <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-1.5 rounded-lg border border-yellow-500/20">
               <Zap className="w-4 h-4 text-yellow-400" />
               <span className="font-black font-mono text-lg text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">{xp}</span>
             </div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="flex flex-col items-center">
             <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">System Integrity</span>
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border ${hp > 50 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20 animate-pulse'}`}>
               <Shield className={`w-4 h-4 ${hp > 50 ? 'text-green-400' : 'text-red-500'}`} />
               <span className={`font-black font-mono text-lg ${hp > 50 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}>{hp}%</span>
             </div>
          </div>
        </div>
      </header>

      {/* --- MAIN GAME AREA --- */}
      <main className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center">
        
        {/* Core Temperature Gauge */}
        <div className="w-full mb-10 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${temperature > 80 ? 'bg-red-500/20 text-red-500 animate-pulse' : temperature > 60 ? 'bg-orange-500/20 text-orange-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs text-slate-400 font-mono uppercase tracking-widest">Reactor Core</h2>
                <div className="text-lg font-black uppercase tracking-widest text-white">Temperature</div>
              </div>
            </div>
            <div className={`font-mono text-4xl font-black ${temperature > 80 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : temperature > 60 ? 'text-orange-500' : 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`}>
              {temperature}°C
            </div>
          </div>
          
          <div className="h-4 w-full flex gap-1 rounded-full overflow-hidden bg-slate-900/50">
             {/* Creating segmented blocks for the thermometer */}
             {[...Array(50)].map((_, i) => {
               const threshold = i * 2; 
               const isActive = temperature > threshold;
               let bgColor = 'bg-slate-800';
               if (isActive) {
                 if (threshold < 60) bgColor = 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]';
                 else if (threshold < 80) bgColor = 'bg-orange-500 shadow-[0_0_10px_#f97316]';
                 else bgColor = 'bg-red-500 shadow-[0_0_10px_#ef4444]';
               }
               return <div key={i} className={`flex-1 h-full transition-colors duration-300 ${bgColor}`} />
             })}
          </div>
        </div>

        {/* The Code Screen (Intercepted Sequence) */}
        <div className={`w-full max-w-4xl bg-black/80 rounded-2xl border ${status === 'feedback' ? (lastAction === 'success' ? 'border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]') : 'border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.1)]'} mb-10 overflow-hidden relative transition-all duration-300`}>
          
          {/* Terminal Header */}
          <div className="bg-slate-900/80 px-6 py-3 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-slate-300 font-mono uppercase tracking-widest">Intercept_Log_{currentQ.id}.sys</span>
            </div>
            <span className="text-[10px] px-3 py-1 bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20 rounded-full">
              TARGET: {currentQ.concept}
            </span>
          </div>
          
          {/* Terminal Body */}
          <div className="p-8 relative">
            {/* Visual Glitch / Scanline inside terminal */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,255,0,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
            
            <pre className={`font-mono text-lg md:text-xl leading-relaxed whitespace-pre-wrap relative z-10 ${status === 'feedback' && lastAction === 'error' ? 'text-red-400' : 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]'}`}>
              {currentQ.code}
              <span className="animate-pulse inline-block w-3 h-5 bg-green-400 ml-1 align-middle opacity-70"></span>
            </pre>
          </div>
        </div>

        {/* Visual Feedback Warning */}
        {status === 'feedback' && (
          <div className={`mb-8 text-2xl md:text-3xl font-black italic uppercase tracking-widest animate-pulse drop-shadow-lg text-center ${lastAction === 'success' ? 'text-green-400' : 'text-red-500'}`}>
            {lastAction === 'success' ? '> OVERRIDE ACCEPTED: COOLING DOWN <' : '> FATAL ERROR: HEAT SPIKE DETECTED <'}
          </div>
        )}

        {/* The Wires (Options) */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt) => {
            const isCut = status === 'feedback' || status === 'completed';
            
            return (
              <button
                key={opt.id}
                onClick={() => handleCutWire(opt.isCorrect)}
                disabled={status !== 'playing'}
                className={`relative group flex items-center justify-between p-4 md:p-6 rounded-xl border bg-gradient-to-r transition-all duration-300 overflow-hidden 
                  ${opt.color} 
                  ${status === 'playing' ? 'hover:scale-[1.02] hover:brightness-125 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95' : 'opacity-60 cursor-not-allowed'}`}
              >
                {/* Visual Wire Graphic Background */}
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.5)_10px,rgba(0,0,0,0.5)_20px)] pointer-events-none"></div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/50 border border-white/20 font-black text-2xl ${isCut ? 'text-slate-500' : 'text-white'}`}>
                    {opt.id}
                  </div>
                  <div className={`font-mono text-xl md:text-2xl font-bold tracking-wider text-left ${isCut ? 'text-slate-300' : 'text-white drop-shadow-md'}`}>
                    {opt.text}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 relative z-10">
                  <Scissors className={`w-6 h-6 transition-transform duration-300 ${status === 'playing' ? 'group-hover:rotate-[-20deg] text-white/80 group-hover:text-white' : 'text-slate-500'}`} />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">CUT</span>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  );
};

export default PredictGame;