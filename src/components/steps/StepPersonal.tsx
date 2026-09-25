import React from 'react';
import { FormData } from '../../types';
import { Input } from '../Input';
import { Select } from '../Select';

interface StepProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const formatCPF = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 9) {
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  } else if (v.length > 6) {
    v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (v.length > 3) {
    v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  return v;
};

const formatRG = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 9) v = v.slice(0, 9);
  if (v.length > 8) {
    v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  } else if (v.length > 5) {
    v = v.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (v.length > 2) {
    v = v.replace(/(\d{2})(\d{1,3})/, '$1.$2');
  }
  return v;
};

const formatTelefone = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else if (v.length > 0) {
    v = v.replace(/^(\d*)/, '($1');
  }
  return v;
};

const formatDataNascimento = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) {
    v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
  } else if (v.length > 2) {
    v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
  }
  return v;
};

export const StepPersonal: React.FC<StepProps> = ({ data, onChange }) => {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">Dados Pessoais</h2>
        <p className="text-[#93C1F1] text-sm">Identificação do morador/proprietário</p>
      </div>

      <Input 
        label="Nome Completo" 
        required 
        value={data.nomeCompleto} 
        onChange={e => onChange({ nomeCompleto: e.target.value.toUpperCase() })} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="RG (Opcional)" 
          type="text"
          placeholder="Deixe em branco se for o novo CIN"
          value={data.rg} 
          onChange={e => onChange({ rg: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15) })} 
        />

        <Input 
          label="CPF" 
          type="text"
          inputMode="numeric"
          required 
          placeholder="000.000.000-00"
          value={formatCPF(data.cpf)} 
          onChange={e => onChange({ cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Data de Nascimento" 
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          required
          value={data.dataNascimento} 
          onChange={e => onChange({ dataNascimento: formatDataNascimento(e.target.value) })} 
        />

        <Input 
          label="Telefone" 
          type="tel"
          inputMode="tel"
          placeholder="(00) 00000-0000"
          value={formatTelefone(data.telefone)} 
          onChange={e => onChange({ telefone: e.target.value.replace(/\D/g, '').slice(0, 11) })} 
        />
      </div>

      <Input 
        label="Email" 
        type="email" 
        value={data.email} 
        onChange={e => onChange({ email: e.target.value.toUpperCase() })} 
      />

      <Select
        label="Tem CadÚnico?"
        value={data.temCadunico}
        onChange={e => onChange({ temCadunico: e.target.value })}
        options={[
          { value: 'Sim', label: 'Sim' },
          { value: 'Não', label: 'Não' },
          { value: 'Não Informado', label: 'Não Informado' }
        ]}
      />
    </div>
  );
};
