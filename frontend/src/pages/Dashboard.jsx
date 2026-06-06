import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Coins, Play, Trophy, Cpu, Award, 
  CheckCircle2, Zap, X, ChevronRight, Sword, LogOut, Crosshair, Terminal, Sparkles, LayoutDashboard 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PerfectedGamifiedDashboard = () => {
  const navigate = useNavigate();
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [liveRank, setLiveRank] = useState("...");
  
  // NAVBAR HIDE ON SCROLL LOGIC
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          setShowNavbar(false); 
        } else {
          setShowNavbar(true);  
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // --- 100% PRESERVED BACKEND INTEGRATION LOGIC ---
  const [user, setUser] = useState(() => {
    const savedData = localStorage.getItem('user');
    const parsedUser = savedData ? JSON.parse(savedData) : null;

    return {
      id: parsedUser?.id || null, 
      name: parsedUser?.name || "GUEST_PLAYER",
      coins: parsedUser?.coins || 0,
      max_xp: parsedUser?.max_xp || 5000,
      rank: parsedUser?.rank || 9999,
      level: parsedUser?.level || 1,
      activeAvatarId: parsedUser?.activeAvatarId || 1,
      unlockedAvatars: parsedUser?.unlockedAvatars || [1],
      earnedBadges: parsedUser?.earnedBadges || [],
      realms: parsedUser?.realms || [
        { id: 'dsa', name: 'DSA Dojo', progress: 45, color: 'text-[#00E5FF]' },
        { id: 'fs', name: 'Fullstack Fortress', progress: 12, color: 'text-white' },
      ]
    };
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const guest = localStorage.getItem('guestMode');
    if (!token && !guest) navigate('/');
  }, [navigate]);

  useEffect(() => {
    const fetchRank = async () => {
      if (user.id && user.name !== "GUEST_PLAYER") {
        try {
          const response = await axios.get(`http://localhost:5000/api/auth/rank/${user.id}`);
          setLiveRank(response.data.rank);
        } catch (error) { setLiveRank("?"); }
      } else { setLiveRank("-"); }
    };
    fetchRank();
  }, [user.coins, user.id]); 

  const avatars = [
    { id: 1, name: "Neon Recon", cost: 0, img: "https://api.dicebear.com/7.x/adventurer/svg?seed=NeonRecon&backgroundColor=transparent", isLocked: false },
    { id: 2, name: "Byte Op", cost: 800, img: "https://api.dicebear.com/7.x/adventurer/svg?seed=ByteOp&backgroundColor=transparent", isLocked: true },
    { id: 3, name: "Kernel Cmdr", cost: 1500, img: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kernel&backgroundColor=transparent", isLocked: true },
    { id: 4, name: "Binary Warlord", cost: 5000, img: "https://api.dicebear.com/7.x/adventurer/svg?seed=Warlord&backgroundColor=transparent", isLocked: true },
    { id: 5, name: "Cyber Ghost", cost: 10000, img: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ghost&backgroundColor=transparent", isLocked: true },
    { id: 6, name: "Phantom Striker", cost: 25000, img: "https://api.dicebear.com/7.x/adventurer/svg?seed=Phantom&backgroundColor=transparent", isLocked: true },
  ];

  const badgeLibrary = [
    { id: 1, name: "Code Ninja", desc: "Win 5 consecutive matches", icon: <Sword size={20} className="text-[#00E5FF]" /> },
    { id: 2, name: "Fast Coder", desc: "Solve Rat Maze under 50s", icon: <Zap size={20} className="text-[#FF0055]" /> },
    { id: 3, name: "Logic Architect", desc: "Match optimal path exactly", icon: <Cpu size={20} className="text-white" /> },
  ];

  const handleUnlockOrSelect = async (avatarId) => {
    const avatar = avatars.find(av => av.id === avatarId);
    let newCoins = user.coins;
    let newUnlockedAvatars = [...user.unlockedAvatars];
    let newActiveAvatar = avatarId;

    if (user.unlockedAvatars.includes(avatarId)) {
      newActiveAvatar = avatarId;
    } else if (user.coins >= avatar.cost) {
      if (window.confirm(`Deploy ${avatar.name} for ${avatar.cost} XP?`)) {
        newCoins = user.coins - avatar.cost;
        newUnlockedAvatars.push(avatarId);
      } else return; 
    } else {
      alert(`INSUFFICIENT FUNDS: Need ${avatar.cost - user.coins} more XP!`);
      return;
    }

    const updatedUserData = { ...user, coins: newCoins, unlockedAvatars: newUnlockedAvatars, activeAvatarId: newActiveAvatar };

    try {
      if (user.id) {
        await axios.post('http://localhost:5000/api/auth/update-stats', { userId: user.id, coins: newCoins, activeAvatarId: newActiveAvatar, unlockedAvatars: newUnlockedAvatars });
      }
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    } catch (err) { alert("Error syncing with server! Check your connection."); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestMode');
    navigate('/');
  };

  const currentAvatarImg = avatars.find(av => av.id === user.activeAvatarId).img;

  // --- UNIQUE UI GEOMETRY ---
  const clipTech = { clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' };
  const clipCard = { clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' };
  const clipNav = { clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 30px) 100%, 30px 100%, 0 calc(100% - 15px))' };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans selection:bg-[#00E5FF] selection:text-[#0B0F19] overflow-x-hidden relative">
      
      {/* --- WEB3 GRADIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 bg-[#0B0F19] pointer-events-none"></div>
      {/* Glow Orbs matched to Cyan & Hot Pink */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#00E5FF]/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#FF0055]/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      {/* --- HUD NAVBAR --- */}
      <nav 
        className={`fixed top-0 w-full z-50 flex justify-between items-start px-4 md:px-6 pt-4 pointer-events-none transition-transform duration-500 ease-in-out ${showNavbar ? 'translate-y-0' : '-translate-y-[150%]'}`}
      >
        {/* LOGO */}
        <div className="pointer-events-auto flex items-center gap-2">
            
           <h1 className="text-xl md:text-2xl font-black tracking-widest text-white uppercase italic">
             Algo<span className="text-[#00E5FF]">Yudh</span>
           </h1>
        </div>

        {/* CENTER STATS (Glassmorphism Tech Bar) */}
        <div 
          className="pointer-events-auto hidden lg:flex items-center gap-8 bg-black/30 backdrop-blur-md border-t-2 border-[#00E5FF]/50 px-12 py-3 shadow-[0_10px_30px_rgba(0,229,255,0.1)]"
          style={clipNav}
        >
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-[#00E5FF] font-bold uppercase tracking-[0.2em]">Global Rank</span>
            <span className="text-sm font-black text-white flex items-center gap-1"><Trophy size={12} className="text-[#FF0055]" /> #{liveRank}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10"></div>
          <button onClick={() => setIsBadgeOpen(true)} className="flex flex-col items-center group hover:text-[#00E5FF] transition-colors">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] group-hover:text-[#00E5FF]/70">Achievements</span>
            <span className="text-sm font-black text-white flex items-center gap-1"><Award size={12}/> Badges</span>
          </button>
          <div className="w-[1px] h-6 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-white font-bold uppercase tracking-[0.2em]">XP Balance</span>
            <span className="text-sm font-black text-white flex items-center gap-1"><Coins size={12} className="text-[#00E5FF]" /> {user.coins}</span>
          </div>
        </div>

        {/* LOG OUT */}
        <button 
          onClick={handleLogout}
          className="pointer-events-auto bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-[#00E5FF] hover:border-[#00E5FF] hover:text-[#0B0F19] font-black uppercase text-[10px] md:text-xs px-4 md:px-6 py-2 md:py-2.5 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]"
          style={clipTech}
        >
          LOG OUT <LogOut size={14} />
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 min-h-[90vh] max-w-[1600px] mx-auto px-6 flex flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-12 pt-28 md:pt-32 pb-10">
        
        {/* Left: Typography & CTA */}
        <div className="flex-1 w-full text-center lg:text-left mt-8 lg:mt-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] text-[9px] md:text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.3em] mb-4 md:mb-6" style={clipTech}>
              System Connected // {user.name}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase leading-[0.9] tracking-tighter text-white">
              THE NEXT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF0055] filter drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                GENERATION
              </span> <br />
              OF CODING.
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-4 md:mt-6 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed border-l-2 border-[#00E5FF]/50 pl-4">
              Capture the Virtual DOM. Neutralize state leaks. Level up with your friends and conquer complex data structures in intense real-time duels.
            </p>
            
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/missions')}
                className="bg-gradient-to-r from-[#00E5FF] to-[#FF0055] text-white font-black uppercase italic text-sm md:text-base px-8 md:px-10 py-3 md:py-4 flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all w-full sm:w-auto"
                style={clipTech}
              >
                <Play fill="white" size={18} /> START MISSION
              </motion.button>
              <button
                className="bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 font-black uppercase italic text-xs md:text-sm px-8 py-3 md:py-4 flex items-center justify-center transition-all w-full sm:w-auto"
                style={clipTech}
              >
                EXPLORE HUB
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right: Holographic Avatar Projector */}
        <div className="flex-1 relative flex justify-center items-center w-full h-[300px] sm:h-[400px] lg:h-[500px]">
          {/* Glowing rings */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[450px] lg:h-[450px] border border-[#00E5FF]/30 rounded-full border-dashed"></motion.div>
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] lg:w-[350px] lg:h-[350px] border border-[#FF0055]/30 rounded-full opacity-50"></motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] lg:w-[200px] lg:h-[200px] bg-[#00E5FF]/20 blur-[80px] rounded-full"></div>

          {/* Floating Character */}
          <motion.div
            key={user.activeAvatarId}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
          >
            <img 
              src={currentAvatarImg} 
              className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(0,229,255,0.4)] contrast-125" 
              alt="Active Operator" 
            />
            
            {/* Holographic ID Card attached to avatar */}
            <div className="absolute bottom-0 md:bottom-4 -right-4 lg:-right-10 bg-[#121826]/80 backdrop-blur-md border border-white/10 p-3 md:p-4 min-w-[140px] md:min-w-[160px]" style={clipTech}>
              <Crosshair className="text-[#00E5FF] mb-1 md:mb-2 w-3 h-3 md:w-4 md:h-4" />
              <p className="text-[8px] md:text-[9px] text-[#00E5FF] uppercase font-bold tracking-widest">Active Shell</p>
              <p className="text-xs md:text-sm font-black text-white uppercase italic">{avatars.find(a => a.id === user.activeAvatarId).name}</p>
              <div className="mt-2 w-full h-1 bg-white/10"><div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF0055] w-full"></div></div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* --- SCROLLING MARQUEE DIVIDER --- */}
      <div className="relative z-10 border-y border-white/5 bg-white/[0.02] py-4 overflow-hidden flex whitespace-nowrap">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
          className="flex items-center gap-8 text-sm font-semibold tracking-widest text-slate-300 uppercase"
        >
          {/* Duplicated list for seamless looping */}
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span>PvP Duels</span> <Sparkles className="text-[#FF0055] w-4 h-4 mx-4 opacity-50" />
              <span>DSA Mastery</span> <Sparkles className="text-[#00E5FF] w-4 h-4 mx-4 opacity-50" />
              <span>Fullstack</span> <Sparkles className="text-[#FF0055] w-4 h-4 mx-4 opacity-50" />
              <span>Global Leaderboard</span> <Sparkles className="text-[#00E5FF] w-4 h-4 mx-4 opacity-50" />
              <span>Developer Armory</span> <Sparkles className="text-[#FF0055] w-4 h-4 mx-4 opacity-50" />
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* --- SERVICES / GAME PLAY SECTION --- */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Services</h2>
          <p className="text-slate-400 text-sm">Master your modules and dominate the leaderboards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.realms.map(realm => (
            <motion.div whileHover={{ y: -5 }} key={realm.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-white/[0.08] transition-colors group">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#FF0055]/20 flex items-center justify-center border border-white/10">
                    <LayoutDashboard className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{realm.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Gauntlet Module</p>
                  </div>
                </div>
                <span className="text-3xl font-light text-white">{realm.progress}%</span>
              </div>
              
              {/* Soft Web3 Progress Bar */}
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} whileInView={{ width: `${realm.progress}%` }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF0055] rounded-full"
                />
              </div>
              <button className="mt-8 text-xs font-semibold text-white/70 group-hover:text-white flex items-center gap-1 transition-colors">
                RESUME MODULE <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- ARMORY SECTION --- */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-10 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Operator Armory</h2>
          <p className="text-slate-400 text-sm">Unlock premium shells to customize your developer persona.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {avatars.map((av) => {
            const isUnlocked = user.unlockedAvatars.includes(av.id);
            const isActive = user.activeAvatarId === av.id;

            return (
              <div 
                key={av.id} 
                onClick={() => handleUnlockOrSelect(av.id)}
                className={`relative cursor-pointer transition-all duration-300 rounded-3xl p-4 flex flex-col items-center text-center ${isActive ? 'bg-gradient-to-b from-[#00E5FF]/10 to-white/5 border border-[#00E5FF]/50 shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.08]'}`}
              >
                <div className={`w-full aspect-square rounded-2xl bg-black/20 mb-4 flex items-center justify-center overflow-hidden ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}>
                  <img src={av.img} alt={av.name} className="w-[80%] h-[80%] object-contain hover:scale-110 transition-transform duration-500" />
                </div>
                
                <h3 className="text-xs font-bold text-white mb-2">{av.name}</h3>
                
                <div className="w-full flex items-center justify-center mt-auto">
                  {isUnlocked ? (
                    <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${isActive ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/10 text-slate-300'}`}> 
                      {isActive ? 'Active' : 'Ready'}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-[#FF0055] font-semibold text-xs">
                      <Coins size={12} /> {av.cost}
                    </div>
                  )}
                </div>

                {/* Locked Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Lock className="text-[#00E5FF] mb-2 w-5 h-5" />
                    <span className="text-[10px] font-semibold text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">Unlock</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --- NEW ABOUT / LORE SECTION --- */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-16 md:py-20 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-4 justify-center mb-8 md:mb-12">
           <div className="h-[2px] w-8 md:w-12 bg-gradient-to-r from-transparent to-[#00E5FF]"></div>
           <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-widest text-white">ABOUT <span className="text-[#00E5FF]">THE ARENA</span></h2>
           <div className="h-[2px] w-8 md:w-12 bg-gradient-to-l from-transparent to-[#00E5FF]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1200px] mx-auto">
          {/* Card 1 */}
          <div className="bg-[#121826] border border-white/10 p-6 md:p-8 relative group hover:border-[#00E5FF]/50 transition-colors" style={clipTech}>
            <Terminal className="text-[#00E5FF] w-8 h-8 mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-black uppercase italic text-white mb-3">Learn to Code</h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Dev_Quest is a revolutionary platform combining standard web development concepts with RPG mechanics. Write efficient code to defeat bosses, unlock abilities, and climb the global leaderboards.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-[#121826] border border-white/10 p-6 md:p-8 relative group hover:border-[#FF0055]/50 transition-colors" style={clipTech}>
            <Sword className="text-[#FF0055] w-8 h-8 mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-black uppercase italic text-white mb-3">PvP Duels</h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Challenge other operators in real-time. Optimize your algorithms and manage your state faster than your opponents. The faster and cleaner your code, the stronger your attacks.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#121826] border border-white/10 p-6 md:p-8 relative group hover:border-[#00E5FF]/50 transition-colors" style={clipTech}>
            <Coins className="text-[#00E5FF] w-8 h-8 mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-black uppercase italic text-white mb-3">Earn & Upgrade</h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Every successfully compiled problem grants you XP. Use your earnings to unlock specialized Operator Shells, rare badges, and customize your developer loadout.
            </p>
          </div>
        </div>
      </section>

      {/* --- BADGE MODAL (Glassmorphism Tech UI) --- */}
      <AnimatePresence>
        {isBadgeOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#121826] border border-[#00E5FF]/40 max-w-sm md:max-w-md w-full p-6 md:p-8 shadow-[0_0_50px_rgba(0,229,255,0.2)]" style={clipCard}>
               <div className="flex justify-between items-start mb-6 md:mb-8 border-b border-white/10 pb-4">
                 <div>
                   <h3 className="text-lg md:text-xl font-black uppercase italic text-white tracking-widest">Achievement</h3>
                   <span className="text-[#00E5FF] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Data Log</span>
                 </div>
                 <button onClick={() => setIsBadgeOpen(false)} className="bg-white/5 p-2 hover:bg-[#00E5FF] hover:text-[#0B0F19] transition-colors text-slate-300" style={clipTech}><X size={16}/></button>
               </div>
               
               <div className="space-y-4">
                 {badgeLibrary.map((badge) => {
                   const earned = user.earnedBadges.includes(badge.id);
                   return (
                     <div key={badge.id} className={`p-3 md:p-4 flex gap-4 items-center bg-black/30 transition-all ${earned ? 'border-l-2 border-l-[#00E5FF]' : 'opacity-40 grayscale'}`} style={clipTech}>
                       <div className={`p-2 md:p-3 bg-black/50 shadow-inner ${earned ? 'shadow-[#00E5FF]/20' : ''}`} style={clipTech}>{badge.icon}</div>
                       <div>
                         <p className="font-black text-xs md:text-sm uppercase italic text-white tracking-wide">{badge.name}</p>
                         <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 leading-tight">{badge.desc}</p>
                       </div>
                       {earned && <CheckCircle2 className="text-[#FF0055] ml-auto w-5 h-5" />}
                     </div>
                   );
                 })}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PerfectedGamifiedDashboard;