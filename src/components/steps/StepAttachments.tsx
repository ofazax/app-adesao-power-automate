import React from 'react';
import { FormData } from '../../types';
import { ImageUpload } from '../ImageUpload';

interface StepProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

export const StepAttachments: React.FC<StepProps> = ({ data, onChange }) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">Anexos</h2>
        <p className="text-[#93C1F1] text-sm">Fotos do imóvel e documentos</p>
      </div>

      <ImageUpload 
        label="Fachada" 
        required 
        value={data.fachada} 
        onChange={val => onChange({ fachada: val })} 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ImageUpload 
          label="Frente do Documento" 
          required 
          value={data.frenteDocumento} 
          onChange={val => onChange({ frenteDocumento: val })} 
        />
        <ImageUpload 
          label="Verso do Documento" 
          required 
          value={data.versoDocumento} 
          onChange={val => onChange({ versoDocumento: val })} 
        />
      </div>

      <ImageUpload 
        label="Folha de Adesão" 
        required 
        value={data.folhaAdesao} 
        onChange={val => onChange({ folhaAdesao: val })} 
      />

      <div className="pt-4 border-t border-white/10">
        <h3 className="font-semibold text-white mb-4">Fotos Adicionais (Opcional)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ImageUpload 
            label="Foto CadÚnico" 
            value={data.fotoCadunico} 
            onChange={val => onChange({ fotoCadunico: val })} 
          />
          <ImageUpload 
            label="Outra Foto 1" 
            value={data.outras0} 
            onChange={val => onChange({ outras0: val })} 
          />
          <ImageUpload 
            label="Outra Foto 2" 
            value={data.outras1} 
            onChange={val => onChange({ outras1: val })} 
          />
          <ImageUpload 
            label="Outra Foto 3" 
            value={data.outras2} 
            onChange={val => onChange({ outras2: val })} 
          />
        </div>
      </div>
    </div>
  );
};
