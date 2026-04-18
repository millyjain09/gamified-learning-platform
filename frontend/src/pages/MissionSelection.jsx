import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft, Terminal } from 'lucide-react';

const MissionSelection = () => {
  const navigate = useNavigate();
  // State to track animation: 'idle' -> 'expanding' -> 'splitting'
  const [animState, setAnimState] = useState('idle');
  const [selectedMission, setSelectedMission] = useState(null);

  const handleSelect = (path, type) => {
    if (animState !== 'idle') return; 
    setSelectedMission(type);
    
    // Play sci-fi selection sound effect
    try {
      const selectSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      selectSound.volume = 0.6;
      selectSound.play();
    } catch (err) {
      console.log("Sound play prevented by browser:", err);
    }

    // Phase 1: Expand to center
    setAnimState('expanding'); 

    // Phase 2: After 800ms (expansion finish), trigger the vertical split
    setTimeout(() => {
      setAnimState('splitting');
      
      // Phase 3: Wait for the doors to slide open (600ms), then navigate
      setTimeout(() => {
        navigate(path);
      }, 600); 
    }, 800); 
  };

  const clipTech = { clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' };

  // =========================================================
  // REUSABLE CARD CONTENT (To render in Left & Right halves)
  // =========================================================
  const DsaContent = ({ isHovered }) => (
    <>
      {/* Image Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
          alt="Cyber Matrix" 
          className={`w-full h-full object-cover mix-blend-luminosity transition-all duration-700 
            ${animState !== 'idle' ? 'scale-110 opacity-40' : 'opacity-20 group-hover:scale-110 group-hover:opacity-30'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121826] via-[#121826]/80 to-[#00E5FF]/20 mix-blend-multiply"></div>
      </div>

      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent transition-opacity duration-300 z-10
        ${animState !== 'idle' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
      
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-center text-center transition-transform duration-700 p-10
        ${animState !== 'idle' ? '-translate-y-4' : ''}`}
      >
        <div className={`w-20 h-20 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/30 mb-8 transition-all duration-700 backdrop-blur-sm
          ${animState !== 'idle' ? 'scale-125 bg-[#00E5FF]/20 shadow-[0_0_50px_rgba(0,229,255,0.8)] rotate-12' : 'group-hover:scale-110'}`}
        >
          <Terminal className="w-10 h-10 text-[#00E5FF]" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-wider text-white mb-4 group-hover:text-[#00E5FF] transition-colors drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          DSA Dojo
        </h2>
        <p className="text-slate-300 font-medium text-sm leading-relaxed border-l-2 border-[#00E5FF]/50 pl-4 bg-black/20 p-2 rounded-r-lg backdrop-blur-sm">
          Master the core logic. Conquer complex arrays, trees, and dynamic programming in a high-stakes environment.
        </p>
      </div>
    </>
  );

  const FsContent = ({ isHovered }) => (
    <>
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
          alt="Server Architecture" 
          className={`w-full h-full object-cover mix-blend-luminosity transition-all duration-700 
            ${animState !== 'idle' ? 'scale-110 opacity-40' : 'opacity-20 group-hover:scale-110 group-hover:opacity-30'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121826] via-[#121826]/80 to-[#FF0055]/20 mix-blend-multiply"></div>
      </div>

      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF0055] to-transparent transition-opacity duration-300 z-10
        ${animState !== 'idle' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
      
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-center text-center transition-transform duration-700 p-10
        ${animState !== 'idle' ? '-translate-y-4' : ''}`}
      >
        <div className={`w-20 h-20 rounded-xl bg-[#FF0055]/10 flex items-center justify-center border border-[#FF0055]/30 mb-8 transition-all duration-700 backdrop-blur-sm
          ${animState !== 'idle' ? 'scale-125 bg-[#FF0055]/20 shadow-[0_0_50px_rgba(255,0,85,0.8)] rotate-12' : 'group-hover:scale-110'}`}
        >
          <Server className="w-10 h-10 text-[#FF0055]" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-wider text-white mb-4 group-hover:text-[#FF0055] transition-colors drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          Fullstack Fortress
        </h2>
        <p className="text-slate-300 font-medium text-sm leading-relaxed border-l-2 border-[#FF0055]/50 pl-4 bg-black/20 p-2 rounded-r-lg backdrop-blur-sm">
          Build the architecture. Design the interface. Neutralize server errors and deploy full-stack MERN operations.
        </p>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @keyframes energy-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255, 0.7); filter: brightness(1); }
          20% { box-shadow: 0 0 100px 50px rgba(255,255,255, 0); filter: brightness(2); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255, 0); filter: brightness(1); }
        }
        .animate-pulse-select { animation: energy-pulse 0.8s cubic-bezier(0.1, 0.9, 0.2, 1); }
      `}</style>

      <div className="min-h-screen bg-[#0B0F19] text-white p-6 flex flex-col relative overflow-hidden">
        
        {/* --- AMBIENT GLOW ORBS --- */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#00E5FF]/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#FF0055]/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
        <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

        <div className="relative z-10 flex flex-col h-full flex-1">
          
          {/* --- HEADER & BACK BUTTON --- */}
          <div className={`transition-all duration-500 ease-in-out ${animState !== 'idle' ? 'opacity-0 blur-md -translate-y-4 pointer-events-none' : 'opacity-100'}`}>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] md:text-xs px-4 md:px-6 py-2 w-fit mb-8 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]"
              style={clipTech}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#00E5FF]" /> BACK TO BASE
            </button>

            <div className="flex flex-col items-center justify-center mt-10 mb-16">
              <span className="inline-block border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.3em] mb-4" style={clipTech}>
                Awaiting Directive
              </span>
              <h1 className="text-4xl md:text-6xl font-black italic text-center uppercase tracking-widest text-white leading-[0.9]">
                Select Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF0055] drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                  Combat Zone
                </span>
              </h1>
            </div>
          </div>

          {/* --- CARDS CONTAINER --- */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full relative">
            
            {/* ======================================= */}
            {/* DSA Column (Electric Cyan) */}
            {/* ======================================= */}
            <div 
              onClick={() => handleSelect('/dsa-missions', 'dsa')}
              style={clipTech}
              className={`group cursor-pointer relative flex flex-col transform-gpu transition-all duration-[800ms] cubic-bezier(0.25, 1, 0.5, 1) overflow-hidden
                ${animState === 'idle' ? 'bg-[#121826]/80 backdrop-blur-md border border-white/10 hover:border-[#00E5FF]/50 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(0,229,255,0.2)]' : ''}
                
                /* EXPANSION LOGIC FOR DSA */
                ${(animState === 'expanding' || animState === 'splitting') && selectedMission === 'dsa' 
                  ? 'absolute inset-0 md:static z-50 bg-transparent border-transparent scale-[1.05] md:scale-125 md:translate-x-[53%]' 
                  : ''}
                
                /* SHRINK LOGIC FOR DSA (If FS is clicked) */
                ${animState !== 'idle' && selectedMission !== 'dsa' 
                  ? 'opacity-0 scale-75 blur-md pointer-events-none' 
                  : ''}
              `}
            >
              {/* Invisible Hitbox during animation */}
              <div className="relative inset-0 w-full h-full opacity-0 pointer-events-none"><DsaContent /></div>

              {/* LEFT HALF OF THE CARD */}
              <div 
                className={`absolute inset-0 bg-[#121826] border-2 border-[#00E5FF] transition-all duration-[600ms] ease-in-out overflow-hidden flex flex-col
                  ${animState === 'expanding' && selectedMission === 'dsa' ? 'shadow-[0_0_100px_rgba(0,229,255,0.8)] animate-pulse-select' : ''}
                  ${animState === 'splitting' && selectedMission === 'dsa' ? '-translate-x-[100vw] opacity-0' : 'translate-x-0'}
                `}
                style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
              >
                <DsaContent />
              </div>

              {/* RIGHT HALF OF THE CARD */}
              <div 
                className={`absolute inset-0 bg-[#121826] border-2 border-[#00E5FF] transition-all duration-[600ms] ease-in-out overflow-hidden flex flex-col
                  ${animState === 'expanding' && selectedMission === 'dsa' ? 'shadow-[0_0_100px_rgba(0,229,255,0.8)] animate-pulse-select' : ''}
                  ${animState === 'splitting' && selectedMission === 'dsa' ? 'translate-x-[100vw] opacity-0' : 'translate-x-0'}
                `}
                style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}
              >
                <DsaContent />
              </div>
            </div>

            {/* ======================================= */}
            {/* Full Stack Column (Hot Pink) */}
            {/* ======================================= */}
            <div 
              onClick={() => handleSelect('/full-stack', 'fs')}
              style={clipTech}
              className={`group cursor-pointer relative flex flex-col transform-gpu transition-all duration-[800ms] cubic-bezier(0.25, 1, 0.5, 1) overflow-hidden
                ${animState === 'idle' ? 'bg-[#121826]/80 backdrop-blur-md border border-white/10 hover:border-[#FF0055]/50 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,0,85,0.2)]' : ''}
                
                /* EXPANSION LOGIC FOR FULL STACK */
                ${(animState === 'expanding' || animState === 'splitting') && selectedMission === 'fs' 
                  ? 'absolute inset-0 md:static z-50 bg-transparent border-transparent scale-[1.05] md:scale-125 md:-translate-x-[53%]' 
                  : ''}
                
                /* SHRINK LOGIC FOR FULL STACK (If DSA is clicked) */
                ${animState !== 'idle' && selectedMission !== 'fs' 
                  ? 'opacity-0 scale-75 blur-md pointer-events-none' 
                  : ''}
              `}
            >
              {/* Invisible Hitbox */}
              <div className="relative inset-0 w-full h-full opacity-0 pointer-events-none"><FsContent /></div>

              {/* LEFT HALF OF THE CARD */}
              <div 
                className={`absolute inset-0 bg-[#121826] border-2 border-[#FF0055] transition-all duration-[600ms] ease-in-out overflow-hidden flex flex-col
                  ${animState === 'expanding' && selectedMission === 'fs' ? 'shadow-[0_0_100px_rgba(255,0,85,0.8)] animate-pulse-select' : ''}
                  ${animState === 'splitting' && selectedMission === 'fs' ? '-translate-x-[100vw] opacity-0' : 'translate-x-0'}
                `}
                style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
              >
                <FsContent />
              </div>

              {/* RIGHT HALF OF THE CARD */}
              <div 
                className={`absolute inset-0 bg-[#121826] border-2 border-[#FF0055] transition-all duration-[600ms] ease-in-out overflow-hidden flex flex-col
                  ${animState === 'expanding' && selectedMission === 'fs' ? 'shadow-[0_0_100px_rgba(255,0,85,0.8)] animate-pulse-select' : ''}
                  ${animState === 'splitting' && selectedMission === 'fs' ? 'translate-x-[100vw] opacity-0' : 'translate-x-0'}
                `}
                style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}
              >
                <FsContent />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default MissionSelection;