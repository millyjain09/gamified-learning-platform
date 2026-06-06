import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Swords, Bug, Map, BrainCircuit, ShieldAlert, Play } from 'lucide-react';

const DSAMissions = () => {
  const navigate = useNavigate();
  const [animState, setAnimState] = useState('idle');
  const [selectedMission, setSelectedMission] = useState(null);

  const handleSelect = (path, id) => {
    if (animState !== 'idle') return; 
    setSelectedMission(id);
    setAnimState('launching');

    // Play sci-fi selection sound
    try {
      const selectSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      selectSound.volume = 0.5;
      selectSound.play();
    } catch (e) {}

    setTimeout(() => {
      if (path) navigate(path);
      else {
        alert("Mission Locked. Awaiting Deployment.");
        setAnimState('idle');
        setSelectedMission(null);
      }
    }, 1000); 
  };

  const clipTech = { clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' };

  const games = [
    {
      id: '1v1',
      title: "1VS1 BATTLE",
      desc: "Challenge other coders in real-time algorithm duels. Fastest code wins.",
      icon: <Swords className="w-6 h-6 text-[#FF0055]" />,
      hex: "#FF0055",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop", 
      route: "/games/algo-arena"
    },
    {
      id: 'debug',
      title: "DEBUG CODE",
      desc: "Find and fix the hidden bugs in broken algorithms to restore the system.",
      icon: <Bug className="w-6 h-6 text-[#FFD700]" />,
      hex: "#FFD700",
      img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop", 
      route: "/games/debug"
    },
    {
      id: 'algovillage',
      title: "ALGOVILLAGE",
      desc: "Build your village by solving progressive data structure challenges.",
      icon: <Map className="w-6 h-6 text-[#00FF66]" />,
      hex: "#00FF66",
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop", 
      route: "/games/battle"
    },
    {
      id: 'quiz',
      title: "QUIZ & PREDICT",
      desc: "Rapid-fire output prediction and DSA trivia to test your mental compilation.",
      icon: <BrainCircuit className="w-6 h-6 text-[#00E5FF]" />,
      hex: "#00E5FF",
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
      route: "/games/predict"
    },
    {
      id: 'interview',
      title: "RatMaze",
      desc: "Survival back-to-back mock technical interview questions. The Boss fight.",
      icon: <ShieldAlert className="w-6 h-6 text-[#B026FF]" />,
      hex: "#B026FF",
      img: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop",
      route: "/games/graph"
    }
  ];

  return (
    <>
      <style>{`
        @keyframes launch-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255, 0.4); filter: brightness(1); }
          50% { box-shadow: 0 0 100px 20px rgba(255,255,255, 0.2); filter: brightness(1.3); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255, 0); filter: brightness(1); }
        }
        .animate-launch { animation: launch-pulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}</style>

      <div className="min-h-screen bg-[#0B0F19] text-white p-6 flex flex-col relative overflow-hidden">
        
        {/* --- BG GLOW --- */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#00E5FF]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#FF0055]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0"></div>

        <div className={`max-w-[1400px] mx-auto w-full relative z-10 flex flex-col h-full flex-1 transition-all duration-700 ${animState === 'launching' ? 'opacity-0 scale-95 blur-md pointer-events-none' : 'opacity-100'}`}>
          
          {/* --- HEADER --- */}
          <button onClick={() => navigate('/missions')} className="group flex items-center gap-2 text-[#00E5FF] hover:text-white w-fit mb-8 font-mono bg-white/5 px-4 py-2 border border-white/10 transition-all" style={clipTech}>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO BASE
          </button>

          <div className="mb-10">
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
              DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF0055]">TERMINAL</span>
            </h1>
            <p className="text-slate-400 font-mono mt-2 border-l-2 border-[#00E5FF] pl-4 uppercase text-xs tracking-[0.2em]">Select sub-system to initialize mission</p>
          </div>

          {/* --- GRID LAYOUT --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {games.map((game, index) => (
              <div 
                key={game.id}
                onClick={() => handleSelect(game.route, game.id)}
                style={clipTech}
                className={`group relative flex flex-col min-h-[420px] bg-[#121826] border border-white/10 transition-all duration-500 transform-gpu
                  ${index >= 3 ? 'lg:translate-x-[50%]' : ''} 
                  hover:-translate-y-2 hover:border-white/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                `}
              >
                {/* Clear Image Top */}
                <div className="relative h-[200px] overflow-hidden">
                  <img src={game.img} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121826] to-transparent opacity-60"></div>
                  
                  {/* Floating Icon */}
                  <div 
                    className="absolute bottom-[-20px] left-6 w-12 h-16 rounded-xl flex items-center justify-center rotate-12 backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:rotate-0"
                    style={{ backgroundColor: `${game.hex}20`, boxShadow: `0 0 20px ${game.hex}40` }}
                  >
                    {game.icon}
                  </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 flex flex-col p-6 pt-10">
                  <h2 className="text-2xl font-black italic uppercase tracking-widest text-white mb-3">
                    {game.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 flex-1 border-l-2 pl-3" style={{ borderColor: game.hex }}>
                    {game.desc}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: game.hex }}>
                      LVL.0{index + 1}
                    </span>
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0" style={{ color: game.hex }} />
                  </div>
                </div>

                {/* Accent Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to right, transparent, ${game.hex}, transparent)` }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SELECTED TAKEOVER ANIMATION (No Split) --- */}
        {animState === 'launching' && selectedMission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0F19]">
             <div className="relative flex flex-col items-center animate-launch p-12 max-w-lg w-full text-center" style={clipTech}>
                <div className="mb-8 p-6 rounded-full bg-white/5 border border-white/10">
                   {games.find(g => g.id === selectedMission).icon}
                </div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4">
                   {games.find(g => g.id === selectedMission).title}
                </h1>
                <div className="w-48 h-1 bg-white/10 relative overflow-hidden mt-4">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent animate-[shimmer_1.5s_infinite]" style={{ width: '100%' }}></div>
                </div>
                <p className="text-[#00E5FF] font-mono tracking-[0.4em] text-[10px] mt-8 uppercase animate-pulse">Initializing System Architecture...</p>
             </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DSAMissions;