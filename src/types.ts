export interface FormData {
  // Visit
  statusVisita: string;
  data: string;
  agente: string;
  agendamentoObra: string;

  // Address
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  entreNumeros: string;
  tipoComplemento: string;
  complemento: string;
  bairro: string;
  cidade: string;
  zeis: string;
  outrasZeis: string;

  // Personal
  nomeCompleto: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  temCadunico: string;

  // Tech
  matricula: string;
  identificador: string;
  numeroHidrometro: string;
  numeroEconomias: string;
  tipoAdesao: string;
  tipoLigacao: string;
  pavimentoInterno: string;
  pavimentoExterno: string;
  situacaoEsgotamento: string;
  observacoes: string;

  // Attachments (Base64 strings)
  fachada: string;
  fotoCadunico: string;
  frenteDocumento: string;
  versoDocumento: string;
  folhaAdesao: string;
  outras0: string;
  outras1: string;
  outras2: string;

  // Location
  latitude: string;
  longitude: string;
}
