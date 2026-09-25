import React from 'react';
import { FormData } from '../../types';
import { Input } from '../Input';
import { Select } from '../Select';

interface StepProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

export const StepTechnical: React.FC<StepProps> = ({ data, onChange }) => {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">Dados Técnicos</h2>
        <p className="text-[#93C1F1] text-sm">Detalhes da ligação e infraestrutura</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Matrícula"
          type="text"
          inputMode="numeric"
          value={data.matricula}
          onChange={e => onChange({ matricula: e.target.value.replace(/\D/g, '') })}
        />
        <Input
          label="Identificador"
          type="text"
          inputMode="numeric"
          value={data.identificador}
          onChange={e => onChange({ identificador: e.target.value.replace(/\D/g, '') })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nº do Hidrômetro"
          type="text"
          value={data.numeroHidrometro}
          onChange={e => onChange({ numeroHidrometro: e.target.value.toUpperCase() })}
        />
        <Input
          label="Nº de Economias"
          type="text"
          inputMode="numeric"
          value={data.numeroEconomias}
          onChange={e => onChange({ numeroEconomias: e.target.value.replace(/\D/g, '') })}
        />
      </div>

      <Select
        label="Tipo de Adesão"
        required
        value={data.tipoAdesao}
        onChange={e => onChange({ tipoAdesao: e.target.value })}
        options={[
          { value: 'ÁGUA', label: 'ÁGUA' },
          { value: 'ESGOTO', label: 'ESGOTO' },
          { value: 'ÁGUA E ESGOTO', label: 'ÁGUA E ESGOTO' },
          { value: 'ÁGUA COM TROCA DE TITULARIDADE', label: 'ÁGUA COM TROCA DE TITULARIDADE' },
          { value: 'ESGOTO COM TROCA DE TITULARIDADE', label: 'ESGOTO COM TROCA DE TITULARIDADE' },
          { value: 'ÁGUA E ESGOTO COM TROCA DE TITULARIDADE', label: 'ÁGUA E ESGOTO COM TROCA DE TITULARIDADE' },
          { value: 'ÁGUA COM NEGOCIAÇÃO DE DÉBITO', label: 'ÁGUA COM NEGOCIAÇÃO DE DÉBITO' },
          { value: 'ESGOTO COM NEGOCIAÇÃO', label: 'ESGOTO COM NEGOCIAÇÃO' },
          { value: 'ESGOTO COM TROCA DE TITULARIDADE E NEGOCIAÇÃO', label: 'ESGOTO COM TROCA DE TITULARIDADE E NEGOCIAÇÃO' }
        ]}
      />

      <Input
        label="Tipo de Ligação"
        value={data.tipoLigacao}
        onChange={e => onChange({ tipoLigacao: e.target.value.toUpperCase() })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Pavimento Interno"
          value={data.pavimentoInterno}
          onChange={e => onChange({ pavimentoInterno: e.target.value })}
          options={[
            { value: 'CIMENTADO', label: 'CIMENTADO' },
            { value: 'CERÂMICA', label: 'CERÂMICA' },
            { value: 'TERRA', label: 'TERRA' },
            { value: 'OUTROS', label: 'OUTROS' }
          ]}
        />
        <Select
          label="Pavimento Externo"
          value={data.pavimentoExterno}
          onChange={e => onChange({ pavimentoExterno: e.target.value })}
          options={[
            { value: 'CIMENTADO', label: 'CIMENTADO' },
            { value: 'CERÂMICA', label: 'CERÂMICA' },
            { value: 'TERRA', label: 'TERRA' },
            { value: 'OUTROS', label: 'OUTROS' }
          ]}
        />
      </div>

      <Select
        label="Situação de Esgotamento"
        value={data.situacaoEsgotamento}
        onChange={e => onChange({ situacaoEsgotamento: e.target.value })}
        options={[
          { value: '', label: 'Selecione uma opção (Opcional)' },
          { value: 'GALERIA DE ÁGUAS PLUVIAIS', label: 'GALERIA DE ÁGUAS PLUVIAIS' },
          { value: 'FOSSA', label: 'FOSSA' },
          { value: 'CÓRREGOS', label: 'CÓRREGOS' },
          { value: 'CÉU ABERTO', label: 'CÉU ABERTO' },
          { value: 'REVERSÃO', label: 'REVERSÃO' },
          { value: 'ATIVA / JA LIGADA NA REDE', label: 'ATIVA / JA LIGADA NA REDE' }
        ]}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#93C1F1] uppercase tracking-wider">Observações</label>
        <textarea
          rows={3}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#93C1F1]/50 placeholder:text-[#93C1F1]/40 transition-all text-white resize-none"
          value={data.observacoes}
          onChange={e => onChange({ observacoes: e.target.value.toUpperCase() })}
        />
      </div>
    </div>
  );
};
