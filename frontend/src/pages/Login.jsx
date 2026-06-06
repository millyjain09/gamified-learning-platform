import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Gamepad2, Zap, Cpu } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); 
  
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = isLogin
  ? `${API_URL}/api/auth/login`
  : `${API_URL}/api/auth/register`;
      const payload = isLogin ? { email, password } : { username, email, password };

      const response = await axios.post(url, payload);

      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        setMessage({ type: 'success', text: 'Registration successful! Please login.' });
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Something went wrong!' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestPlay = () => {
    localStorage.setItem('guestMode', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050b14] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] flex items-center justify-center p-4 font-sans selection:bg-[#ff007a] selection:text-white">
      
      {/* Neon Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#00f2ff]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#ff007a]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#0a101f]/90 backdrop-blur-2xl border-t-2 border-t-[#00f2ff] border border-white/5 rounded-xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header / Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
        
          
          <div className="flex items-center justify-center gap-3">
          
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
              Algo<span className="text-[#00f2ff]"></span>Yudh
            </h1>
          </div>
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex bg-[#020617] rounded-lg p-1.5 mb-8 border border-white/5">
          <button 
            onClick={() => { setIsLogin(true); setMessage({type:'', text:''}); }}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${isLogin ? 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/50 shadow-[0_0_15px_rgba(0,242,255,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsLogin(false); setMessage({type:'', text:''}); }}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${!isLogin ? 'bg-[#ff007a]/20 text-[#ff007a] border border-[#ff007a]/50 shadow-[0_0_15px_rgba(255,0,122,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`p-3 rounded-lg mb-6 text-xs font-mono uppercase tracking-widest text-center border ${message.type === 'error' ? 'bg-red-900/20 text-[#ff007a] border-[#ff007a]/50' : 'bg-green-900/20 text-emerald-400 border-emerald-500/50'}`}>
            {message.type === 'error' ? '⚠ ' : '✓ '}{message.text}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#00f2ff] transition-colors" />
              <input type="text" placeholder="Operator Alias" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#050b14] border border-white/5 rounded-lg py-3.5 pl-12 pr-4 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-[#00f2ff] transition-all" required />
            </div>
          )}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#00f2ff] transition-colors" />
            <input type="email" placeholder="Email Array" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#050b14] border border-white/5 rounded-lg py-3.5 pl-12 pr-4 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-[#00f2ff] transition-all" required />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#ff007a] transition-colors" />
            <input type="password" placeholder="Access Key" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#050b14] border border-white/5 rounded-lg py-3.5 pl-12 pr-4 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-[#ff007a] transition-all" required />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-gradient-to-r from-[#00f2ff] to-[#ff007a] text-white font-black italic uppercase tracking-[0.2em] rounded-lg hover:brightness-125 transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95">
            <Zap className="w-4 h-4" /> {loading ? 'Compiling...' : (isLogin ? 'Start Mission' : 'Create Node')}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <div className="relative flex justify-center"><span className="px-3 bg-[#0a101f] text-[10px] text-slate-500 font-bold uppercase tracking-widest">Secondary Protocol</span></div>
        </div>

        {/* Guest Button */}
        <button onClick={handleGuestPlay} className="w-full py-3.5 bg-[#020617] border border-[#00f2ff]/30 text-[#00f2ff] font-black italic uppercase tracking-widest rounded-lg hover:bg-[#00f2ff]/10 hover:border-[#00f2ff] transition-all flex items-center justify-center gap-2 group active:scale-95">
          <Gamepad2 className="w-4 h-4 group-hover:animate-pulse" /> Play As a Guest
        </button>

      </div>
    </div>
  );
};

export default Login;