import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (name: string, role: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        setErrorMsg('Usuário ou senha inválidos.');
      } else {
        onLogin(data.name, data.role);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha na conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#162A3D] text-white flex overflow-hidden font-sans relative flex-col items-center justify-center p-4 selection:bg-[#42729E]/30">
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#42729E]/20 rounded-full blur-[120px] hidden md:block'></div>
        <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#93C1F1]/10 rounded-full blur-[150px] hidden md:block'></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl flex flex-col z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className='w-14 h-14 bg-gradient-to-tr from-[#42729E] to-[#93C1F1] rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 mb-4'>
            <ClipboardList className="text-white" size={28} />
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>App Adesão</h1>
          <p className="text-[#93C1F1] text-sm mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80">Usuário</label>
            <input 
              type="text" 
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#93C1F1]/50 transition-all"
              placeholder="Digite seu usuário"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80">Senha</label>
            <input 
              type="password" 
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#93C1F1]/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full py-3 px-6 rounded-xl bg-[#42729E] hover:bg-[#42729E]/80 text-sm font-semibold shadow-lg shadow-black/20 transition-all text-white flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Entrar
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
