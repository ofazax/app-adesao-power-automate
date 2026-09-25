import React from 'react';
import { FormData } from '../../types';
import { Input } from '../Input';
import { AutocompleteInput } from '../AutocompleteInput';
import { Select } from '../Select';
import { RUAS, BAIRROS } from '../../data/enderecos';
import { MapPin } from 'lucide-react';

interface StepProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const TIPO_LOGRADOURO_OPTIONS = [
  { value: 'R', label: 'RUA' },
  { value: 'BC', label: 'BECO' },
  { value: 'AV', label: 'AVENIDA' },
  { value: 'VI', label: 'VIELA' },
  { value: 'RD', label: 'RODOVIA' },
  { value: 'PR', label: 'PROLONGAMENTO' },
  { value: 'PS', label: 'PASSAGEM' },
  { value: 'ET', label: 'ESTAÇÃO' },
  { value: 'T', label: 'TERMINAL' },
  { value: 'PC', label: 'PRAÇA' }
];

const TIPO_COMPLEMENTO_OPTIONS = [
  { value: 'CA', label: 'CASA' },
  { value: 'LJ', label: 'LOJA' },
  { value: 'AP', label: 'APARTAMENTO' },
  { value: 'BL', label: 'BLOCO' },
  { value: 'AN', label: 'ANDAR' },
  { value: 'LT', label: 'LOTE' },
  { value: 'CD', label: 'CONDOMINIO' },
  { value: 'FS', label: 'FUNDOS' },
  { value: 'LG', label: 'LG' }
];

export const StepAddress: React.FC<StepProps> = ({ data, onChange }) => {
  const sanitizeAddressInput = (text: string) => {
    return text
      .normalize('NFD') // Remove accents
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, ''); // Allow only letters, numbers and spaces
  };

  const handleLogradouroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let text = e.target.value;
    
    // Descobrir o rótulo por extenso do tipo selecionado
    const tipoAtual = TIPO_LOGRADOURO_OPTIONS.find(opt => opt.value === data.tipoLogradouro);
    
    if (tipoAtual) {
      // Remove o nome por extenso (ex: "Rua ") do começo do texto
      const prefixoRegex = new RegExp(`^${tipoAtual.label}\\s+`, 'i');
      text = text.replace(prefixoRegex, '');
      
      // Remove também se a pessoa digitar a própria abreviação (ex: "R ")
      const abrevRegex = new RegExp(`^${tipoAtual.value}\\s+`, 'i');
      text = text.replace(abrevRegex, '');
    }

    text = sanitizeAddressInput(text);
    onChange({ logradouro: text });
  };

  const handleComplementoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let text = e.target.value;
    
    // Descobrir o rótulo por extenso do tipo selecionado
    const tipoAtual = TIPO_COMPLEMENTO_OPTIONS.find(opt => opt.value === data.tipoComplemento);
    
    if (tipoAtual) {
      // Remove o nome por extenso do começo do texto
      const prefixoRegex = new RegExp(`^${tipoAtual.label}\\s+`, 'i');
      text = text.replace(prefixoRegex, '');
      
      // Remove também se a pessoa digitar a própria abreviação
      const abrevRegex = new RegExp(`^${tipoAtual.value}\\s+`, 'i');
      text = text.replace(abrevRegex, '');
    }

    text = sanitizeAddressInput(text);
    onChange({ complemento: text });
  };



  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">Endereço</h2>
        <p className="text-[#93C1F1] text-sm">Localização do imóvel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Tipo de Logradouro"
          required
          value={data.tipoLogradouro}
          onChange={e => {
            onChange({ tipoLogradouro: e.target.value });
            // Opcional: Re-validar o logradouro caso o usuário troque o tipo após já ter digitado
          }}
          options={TIPO_LOGRADOURO_OPTIONS}
        />

        <div className="flex flex-col">
          <AutocompleteInput
            label="Logradouro"
            required
            value={data.logradouro}
            onChange={handleLogradouroChange}
            placeholder="Ex: das Flores"
            autoComplete="off"
            options={RUAS}
          />
          <span className="text-[10px] text-[#93C1F1]/70 mt-1 ml-1">
            Não é necessário repetir o tipo (ex: Rua)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Número"
          type="number"
          min="0"
          required
          value={data.numero}
          onChange={e => onChange({ numero: e.target.value })}
          autoComplete="off"
        />
        <Input
          label="Entre Números"
          type="text"
          placeholder="Ex: 100 e 200"
          value={data.entreNumeros}
          onChange={e => onChange({ entreNumeros: sanitizeAddressInput(e.target.value) })}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Tipo de Complemento"
          required
          value={data.tipoComplemento}
          onChange={e => onChange({ tipoComplemento: e.target.value })}
          options={TIPO_COMPLEMENTO_OPTIONS}
        />

        <div className="flex flex-col">
          <Input
            label="Complemento"
            value={data.complemento}
            onChange={handleComplementoChange}
            placeholder="Ex: 101"
            autoComplete="off"
          />
          <span className="text-[10px] text-[#93C1F1]/70 mt-1 ml-1">
            Não é necessário repetir o tipo (ex: Casa)
          </span>
        </div>
      </div>

      <AutocompleteInput
        label="Bairro"
        required
        value={data.bairro}
        onChange={e => onChange({ bairro: sanitizeAddressInput(e.target.value) })}
        autoComplete="off"
        options={BAIRROS}
      />

      <Select
        label="Cidade"
        required
        value={data.cidade}
        onChange={e => onChange({ cidade: e.target.value })}
        options={[
          { value: 'CONTAGEM', label: 'CONTAGEM' },
          { value: 'BELO HORIZONTE', label: 'BELO HORIZONTE' },
          { value: 'RIBEIRÃO DAS NEVES', label: 'RIBEIRÃO DAS NEVES' },

        ]}
      />

      <Select
        label="ZEIS"
        value={data.zeis}
        onChange={e => onChange({ zeis: e.target.value })}
        options={[
          { value: '', label: 'Selecione uma ZEIS (opcional)' },
          { value: 'Alvorada', label: 'Alvorada' },
          { value: 'Arvoredo', label: 'Arvoredo' },
          { value: 'Avenida II / Colorado', label: 'Avenida II / Colorado' },
          { value: 'Bambu Verde', label: 'Bambu Verde' },
          { value: 'Beatriz', label: 'Beatriz' },
          { value: 'Bela Vista', label: 'Bela Vista' },
          { value: 'Boa Vista / Gangorras', label: 'Boa Vista / Gangorras' },
          { value: 'Bonanza', label: 'Bonanza' },
          { value: 'Buraco da Coruja', label: 'Buraco da Coruja' },
          { value: 'Cândida Ferreira', label: 'Cândida Ferreira' },
          { value: 'Capelinha', label: 'Capelinha' },
          { value: 'Carajás', label: 'Carajás' },
          { value: 'Chácaras Cotia', label: 'Chácaras Cotia' },
          { value: 'Confisco', label: 'Confisco' },
          { value: 'Conjunto Bitácula', label: 'Conjunto Bitácula' },
          { value: 'Conjunto Vitória', label: 'Conjunto Vitória' },
          { value: 'Coqueiros', label: 'Coqueiros' },
          { value: 'Emboabas', label: 'Emboabas' },
          { value: 'Estação Bernardo Monteiro', label: 'Estação Bernardo Monteiro' },
          { value: 'Estrela Dalva', label: 'Estrela Dalva' },
          { value: 'Extensão / Novo Recanto', label: 'Extensão / Novo Recanto' },
          { value: 'Floriano Peixoto', label: 'Floriano Peixoto' },
          { value: 'Francisco Mariano', label: 'Francisco Mariano' },
          { value: 'Gangorras / Feijão Moído', label: 'Gangorras / Feijão Moído' },
          { value: 'Guarani Kaiowá', label: 'Guarani Kaiowá' },
          { value: 'Jardim dos Bandeirantes', label: 'Jardim dos Bandeirantes' },
          { value: 'Jardim Marrocos', label: 'Jardim Marrocos' },
          { value: 'Kaiapós', label: 'Kaiapós' },
          { value: 'Kennedy', label: 'Kennedy' },
          { value: 'Morada Nova', label: 'Morada Nova' },
          { value: 'Morro dos Cabritos', label: 'Morro dos Cabritos' },
          { value: 'Nacional', label: 'Nacional' },
          { value: 'Novo Boa Vista / DNIT', label: 'Novo Boa Vista / DNIT' },
          { value: 'Novo Progresso', label: 'Novo Progresso' },
          { value: 'Oitis', label: 'Oitis' },
          { value: 'Padre Dionísio', label: 'Padre Dionísio' },
          { value: 'Parque São João', label: 'Parque São João' },
          { value: 'Parque Xangri-Lá', label: 'Parque Xangri-Lá' },
          { value: 'Pedra Azul', label: 'Pedra Azul' },
          { value: 'Perobas 1', label: 'Perobas 1' },
          { value: 'Perobas 2', label: 'Perobas 2' },
          { value: 'Progresso Industrial', label: 'Progresso Industrial' },
          { value: 'Rosimeire', label: 'Rosimeire' },
          { value: 'Santa Luzia', label: 'Santa Luzia' },
          { value: 'Santa Terezinha', label: 'Santa Terezinha' },
          { value: 'São Mateus', label: 'São Mateus' },
          { value: 'São Sebastião', label: 'São Sebastião' },
          { value: 'Sapolândia', label: 'Sapolândia' },
          { value: 'Senhora da Conceição', label: 'Senhora da Conceição' },
          { value: 'Sequoia / Teleférico', label: 'Sequoia / Teleférico' },
          { value: 'Tenente Castorino', label: 'Tenente Castorino' },
          { value: 'União da Ressaca', label: 'União da Ressaca' },
          { value: 'Urca', label: 'Urca' },
          { value: 'Verbo Divino', label: 'Verbo Divino' },
          { value: 'Vila dos Porcos', label: 'Vila dos Porcos' },
          { value: 'Vila Epa', label: 'Vila Epa' },
          { value: 'Outras', label: 'Outras' }
        ]}
      />

      {data.zeis === 'Outras' && (
        <Input
          label="Outras ZEIS"
          value={data.outrasZeis}
          onChange={e => onChange({ outrasZeis: sanitizeAddressInput(e.target.value) })}
          required
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 border-t border-white/10 pt-6">
        <Input
          label="Latitude"
          value={data.latitude}
          onChange={e => onChange({ latitude: e.target.value })}
          required
          placeholder="Ex: -19.92345"
        />
        <Input
          label="Longitude"
          value={data.longitude}
          onChange={e => onChange({ longitude: e.target.value })}
          required
          placeholder="Ex: -43.93456"
        />
      </div>
      
      <button
        type="button"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                onChange({ 
                  latitude: pos.coords.latitude.toString(), 
                  longitude: pos.coords.longitude.toString() 
                });
              },
              (err) => {
                alert('Erro ao capturar localização: ' + err.message);
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          } else {
            alert('Geolocalização não suportada neste navegador.');
          }
        }}
        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-white/5 border border-white/10 text-[#93C1F1] hover:bg-white/10 transition-colors text-sm font-medium"
      >
        <MapPin size={18} />
        Pegar localização atual pelo GPS
      </button>
    </div>
  );
};
