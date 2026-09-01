import React from 'react';
import { FormData } from '../../types';
import { Input } from '../Input';
import { Select } from '../Select';

interface StepProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

export const StepVisit: React.FC<StepProps> = ({ data, onChange }) => {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">Dados da Visita</h2>
        <p className="text-[#93C1F1] text-sm">Informações sobre o atendimento</p>
      </div>

      <Input 
        label="Data" 
        type="date" 
        required 
        value={data.data} 
        onChange={e => onChange({ data: e.target.value })} 
      />
      
      <Select
        label="Status da Visita"
        value={data.statusVisita}
        onChange={e => onChange({ statusVisita: e.target.value })}
        options={[
          { value: '', label: 'Selecione (opcional)' },
          { value: 'Adesão', label: 'Adesão' },
          { value: 'Ausente', label: 'Ausente' },
          { value: 'Inexistente', label: 'Inexistente' },
          { value: 'Recusa', label: 'Recusa' },
          { value: 'Lote', label: 'Lote' }
        ]}
      />

      <Input 
        label="Agente" 
        type="text" 
        value={data.agente} 
        onChange={() => {}} // Não permite alteração manual
        readOnly
      />

      <Input 
        label="Agendamento da Obra" 
        type="text" 
        placeholder="Ex: Qualquer dia, ligar antes..."
        value={data.agendamentoObra} 
        onChange={e => onChange({ agendamentoObra: e.target.value })} 
      />
    </div>
  );
};
