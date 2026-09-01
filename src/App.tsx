import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, CheckCircle2, ChevronRight, ChevronLeft, Send, MapPin } from 'lucide-react';
import { FormData } from './types';
import { StepVisit } from './components/steps/StepVisit';
import { StepAddress } from './components/steps/StepAddress';
import { StepPersonal } from './components/steps/StepPersonal';
import { StepTechnical } from './components/steps/StepTechnical';
import { StepAttachments } from './components/steps/StepAttachments';
import { isValidCPF } from './utils/validateCPF';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';

const initialData: FormData = {
  statusVisita: '', data: '', agente: '', agendamentoObra: '',
  tipoLogradouro: '', logradouro: '', numero: '', entreNumeros: '', tipoComplemento: '', complemento: '', bairro: '', cidade: '', zeis: '', outrasZeis: '',
  nomeCompleto: '', rg: '', cpf: '', dataNascimento: '', telefone: '', email: '', temCadunico: '',
  matricula: '', identificador: '', numeroHidrometro: '', numeroEconomias: '', tipoAdesao: '', tipoLigacao: '', pavimentoInterno: '', pavimentoExterno: '', situacaoEsgotamento: '', observacoes: '',
  fachada: '', fotoCadunico: '', frenteDocumento: '', versoDocumento: '', folhaAdesao: '', outras0: '', outras1: '', outras2: '',
  latitude: '', longitude: ''
};

const steps = [
  { id: 'visit', title: 'Visita', component: StepVisit },
  { id: 'address', title: 'Endereço', component: StepAddress },
  { id: 'personal', title: 'Pessoal', component: StepPersonal },
  { id: 'technical', title: 'Técnico', component: StepTechnical },
  { id: 'attachments', title: 'Anexos', component: StepAttachments }
];

const getInitialData = (): FormData => {
  const saved = localStorage.getItem('app_form_data');
  return saved ? JSON.parse(saved) : initialData;
};

const getInitialStep = (): number => {
  const saved = localStorage.getItem('app_current_step');
  return saved ? parseInt(saved, 10) : 0;
};

const getInitialAuth = () => {
  const saved = localStorage.getItem('app_auth');
  return saved ? JSON.parse(saved) : { isAuthenticated: false, userRole: '', agentName: '' };
};

export default function App() {
  const initialAuth = getInitialAuth();

  const [data, setData] = useState<FormData>(getInitialData);
  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.isAuthenticated);
  const [userRole, setUserRole] = useState(initialAuth.userRole);
  const [agentName, setAgentName] = useState(initialAuth.agentName);

  useEffect(() => {
    localStorage.setItem('app_form_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('app_current_step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('app_auth', JSON.stringify({ isAuthenticated, userRole, agentName }));
  }, [isAuthenticated, userRole, agentName]);

  const handleLogin = (name: string, role: string) => {
    setIsAuthenticated(true);
    setAgentName(name);
    setUserRole(role);
    setData(prev => ({ ...prev, agente: name }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAgentName('');
    setUserRole('');
    setData(initialData);
    setCurrentStep(0);
    localStorage.removeItem('app_auth');
    localStorage.removeItem('app_form_data');
    localStorage.removeItem('app_current_step');
  };

  useEffect(() => {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setData(d => ({ ...d, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
      });
    }
  }, []);

  const handleChange = (updates: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (stepIndex: number): string | null => {
    const stepId = steps[stepIndex].id;
    if (stepId === 'visit') {
      if (!data.data) return 'Por favor, preencha a data da visita.';
    } else if (stepId === 'address') {
      if (!data.tipoLogradouro || !data.logradouro || !data.numero || !data.tipoComplemento || !data.bairro || !data.cidade) {
        return 'Por favor, preencha todos os campos obrigatórios desta etapa.';
      }
      if (!data.latitude || !data.longitude) {
        return 'Não foi possível capturar a localização GPS automaticamente. Por favor, certifique-se de permitir o acesso à localização no seu navegador.';
      }
    } else if (stepId === 'personal') {
      if (!data.nomeCompleto || !data.cpf || !data.dataNascimento) return 'Por favor, preencha todos os campos obrigatórios desta etapa.';
      if (!isValidCPF(data.cpf)) return 'CPF inválido. Verifique o número digitado.';
      
      const [year, month, day] = data.dataNascimento.split('-').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        return 'O titular deve ser maior de 18 anos.';
      }
      if (data.email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(data.email)) {
          return 'Por favor, insira um e-mail com domínio válido (ex: @gmail.com).';
        }
      }
    } else if (stepId === 'technical') {
      if (!data.tipoAdesao) return 'Por favor, preencha todos os campos obrigatórios desta etapa.';
    } else if (stepId === 'attachments') {
      if (!data.fachada || !data.frenteDocumento || !data.versoDocumento || !data.folhaAdesao) return 'Por favor, preencha todos os campos obrigatórios e anexe os documentos necessários.';
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg('');
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    const error = validateStep(currentStep);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('Buscando localização...');
    
    // Obter localização atualizada no momento do envio
    let finalData = { ...data };
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        finalData.latitude = position.coords.latitude.toString();
        finalData.longitude = position.coords.longitude.toString();
      }
    } catch (err) {
      console.warn("Não foi possível obter a localização", err);
      // Continua com os dados vazios se falhar
    }

    setErrorMsg('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Erro ao enviar dados');
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao enviar os dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === 'admin' || userRole === 'dev' || userRole === 'chefe') {
    return <AdminDashboard onLogout={handleLogout} adminName={agentName} adminRole={userRole} />;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#162A3D] text-white flex overflow-hidden font-sans relative flex-col items-center justify-center p-4">
        <div className='absolute inset-0 overflow-hidden pointer-events-none hidden md:block'>
          <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#42729E]/20 rounded-full blur-[120px]'></div>
          <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#93C1F1]/10 rounded-full blur-[150px]'></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl flex flex-col text-center z-10"
        >
          <div className="w-24 h-24 bg-[#93C1F1]/10 text-[#93C1F1] border border-[#42729E]/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Enviado com Sucesso!</h1>
          <p className="text-[#93C1F1] mb-8 italic">
            Tudo certo. Os dados foram enviados com sucesso. Você pode fechar essa tela.
          </p>
          <button 
            onClick={() => { setIsSuccess(false); setData({ ...initialData, agente: agentName }); setCurrentStep(0); }}
            className="w-full py-3 px-6 rounded-xl bg-[#42729E] hover:bg-[#42729E]/80 text-sm font-semibold shadow-lg shadow-black/20 transition-all text-white"
          >
            Fazer novo cadastro
          </button>
        </motion.div>
      </div>
    );
  }

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-[#162A3D] text-white flex overflow-x-hidden font-sans selection:bg-[#42729E]/30 relative">
      <div className='fixed inset-0 overflow-hidden pointer-events-none hidden md:block'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#42729E]/20 rounded-full blur-[120px]'></div>
        <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#93C1F1]/10 rounded-full blur-[150px]'></div>
      </div>

      <aside className='w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex-col p-8 z-20 hidden md:flex fixed h-full'>
        <div className='flex items-center gap-3 mb-12'>
          <div className='w-10 h-10 bg-gradient-to-tr from-[#42729E] to-[#93C1F1] rounded-xl flex items-center justify-center shadow-lg shadow-black/20'>
            <span className='text-white font-bold text-xl'>A</span>
          </div>
          <h1 className='text-xl font-semibold tracking-tight'>App Adesão</h1>
        </div>
        
        <nav className='flex flex-col gap-2'>
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            return (
              <button 
                key={step.id} 
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isActive ? 'bg-white/10 border border-white/10 text-white' : 'hover:bg-white/5 text-[#93C1F1]'}`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#93C1F1] shadow-[0_0_8px_rgba(147,193,241,0.6)]' : 'bg-[#42729E]/50'}`}></div>
                <span className='text-sm font-medium'>{step.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className='flex-1 flex flex-col p-4 md:p-10 z-10 md:ml-72 min-h-screen'>
        <header className='flex flex-row justify-between items-center mb-8 gap-4 pt-4 md:pt-0 max-w-[328px] md:max-w-2xl mx-auto w-full'>
          <div>
            <h2 className='text-3xl font-bold text-white'>{steps[currentStep].title}</h2>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-[#93C1F1] text-sm hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            Sair
          </button>
        </header>

        {/* Mobile steps progress indicator */}
        <div className="md:hidden flex gap-1 w-full max-w-[328px] md:max-w-2xl mx-auto bg-white/5 rounded-full overflow-hidden mb-6 h-1.5 border border-white/5">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-full flex-1 transition-all duration-500 ${idx <= currentStep ? 'bg-[#93C1F1] shadow-[0_0_8px_rgba(147,193,241,0.6)]' : 'bg-transparent'}`}
            />
          ))}
        </div>

        <section className='flex-1 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col w-full max-w-[328px] md:max-w-2xl mx-auto overflow-hidden'>
          <AnimatePresence mode="wait">
            <CurrentComponent key={steps[currentStep].id} data={data} onChange={handleChange} />
          </AnimatePresence>

          {errorMsg && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div className='mt-8 pt-6 flex gap-3 w-full md:w-auto border-t border-white/10 mt-auto'>
            {currentStep > 0 && (
              <button 
                onClick={handleBack} 
                disabled={isSubmitting}
                className='px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center'
              >
                Voltar
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={handleNext} 
                className='flex-1 px-6 py-2 rounded-lg bg-[#42729E] hover:bg-[#42729E]/80 text-sm font-semibold shadow-lg shadow-black/20 transition-all text-white flex items-center justify-center'
              >
                Próximo
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className='flex-1 px-6 py-2 rounded-lg bg-[#93C1F1] hover:bg-[#93C1F1]/80 text-sm font-semibold shadow-lg shadow-white/10 transition-all text-[#162A3D] flex items-center justify-center gap-2'
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    Salvar
                  </>
                )}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
