export type Priority = 'alta' | 'media' | 'baixa'
export type KanbanColumn = 'a-fazer' | 'em-progresso' | 'concluido'

// ─── Finance ────────────────────────────────────────────────────────────────

export type TipoTransacao = 'receita' | 'gasto'
export type StatusPagamento = 'pendente' | 'pago' | 'vencido'
export type TipoPagamento = 'unico' | 'recorrente' | 'parcelado' | 'fixo-mensal'

export interface Subcategoria {
  id: string
  nome: string
}

export interface CategoriaFinanceira {
  id: string
  nome: string
  cor: string
  tipo: TipoTransacao | 'ambos'
  subcategorias: Subcategoria[]
}

export interface ContaBancaria {
  id: string
  nome: string
  banco: string
  cor: string
  saldo: number
}

export interface Tag {
  id: string
  nome: string
  cor: string
}

export interface Anexo {
  nome: string
  tipo: string // MIME type
  dataUrl: string // base64
  tamanho: number // bytes
}

export interface Transacao {
  id: string
  tipo: TipoTransacao
  valor: number
  categoriaId: string
  subcategoriaId?: string
  descricao: string
  observacoes?: string
  dataLancamento: string    // data em que foi registrada
  dataVencimento: string    // data de vencimento
  dataEfetivacao?: string   // quando foi pago de fato
  status: StatusPagamento
  tipoPagamento: TipoPagamento
  parcelas?: number         // total de parcelas
  parcelaAtual?: number     // parcela atual
  grupoParcelamento?: string // ID do grupo de parcelas
  contaId?: string          // Pro only
  tagIds?: string[]         // Pro only
  anexos?: Anexo[]
}

// ─── Sono ───────────────────────────────────────────────────────────────────

export type QualidadeSono = 1 | 2 | 3 | 4 | 5

export interface RegistroSono {
  id: string
  data: string
  horaDeitar: string    // "22:30"
  horaAcordar: string   // "06:30"
  horasDormidas: number
  qualidade: QualidadeSono
  notas?: string
}

// ─── Alimentação ─────────────────────────────────────────────────────────────

export type TipoRefeicao = 'cafe' | 'almoco' | 'jantar' | 'lanche' | 'ceia'

export interface ItemRefeicao {
  id: string
  tipo: TipoRefeicao
  descricao: string
  calorias?: number
}

export interface RegistroAlimentacao {
  id: string
  data: string
  refeicoes: ItemRefeicao[]
  agua: number  // copos
}

// ─── Saúde ───────────────────────────────────────────────────────────────────

export type NivelHumor = 1 | 2 | 3 | 4 | 5

export interface RegistroSaude {
  id: string
  data: string
  peso?: number
  humor: NivelHumor
  energia: NivelHumor
  notas?: string
}

export interface Medicamento {
  id: string
  nome: string
  dose: string
  horarios: string[]
  ativo: boolean
}

// ─── Treino ──────────────────────────────────────────────────────────────────

export type CategoriaExercicio = 'musculacao' | 'cardio' | 'esporte' | 'funcional'
export type DiaSemana = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab'

export interface ItemSessao {
  atividadeId: string
  duracaoMin: number
  series?: number
  repeticoes?: number
  peso?: number
}

export interface SessaoTreino {
  id: string
  data: string
  nome: string
  itens: ItemSessao[]
  kcalTotal: number
  notas?: string
}

// ─── Leitura ─────────────────────────────────────────────────────────────────

export type StatusLivro = 'quero-ler' | 'lendo' | 'lido'

export interface Livro {
  id: string
  titulo: string
  autor: string
  paginas: number
  paginaAtual: number
  status: StatusLivro
  categoria: string
  dataInicio?: string
  dataFim?: string
  avaliacao?: 1 | 2 | 3 | 4 | 5
  notas?: string
  pdfUrl?: string
}

// ─── Conhecimento ─────────────────────────────────────────────────────────────

export type StatusCurso = 'ativo' | 'pausado' | 'concluido'

// ─── Faculdade ───────────────────────────────────────────────────────────────

export interface NotaFaculdade {
  id: string
  nome: string       // ex: "P1", "P2", "Trabalho Final"
  valor: number      // 0–10
  peso?: number      // peso percentual para média ponderada
  data?: string
}

export interface TrabalhoFaculdade {
  id: string
  titulo: string
  dataEntrega: string
  entregue: boolean
  nota?: number
}

export type StatusMateria = 'cursando' | 'aprovado' | 'reprovado' | 'trancado'

export interface MateriaFaculdade {
  id: string
  nome: string
  professor?: string
  cargaHoraria?: number
  notas: NotaFaculdade[]
  trabalhos: TrabalhoFaculdade[]
  status: StatusMateria
}

export interface SemestreFaculdade {
  id: string
  numero: number
  ano: number
  materias: MateriaFaculdade[]
  ativo: boolean
}

export interface Curso {
  id: string
  titulo: string
  plataforma: string
  categoria: string
  progresso: number  // 0-100
  status: StatusCurso
  notas?: string
  dataInicio?: string
  dataFim?: string
  tipo?: 'curso' | 'faculdade'
  semestres?: SemestreFaculdade[]
}

export interface NotaAprendizado {
  id: string
  titulo: string
  conteudo: string
  tags: string[]
  data: string
}

// ─── Metas & Objetivos ───────────────────────────────────────────────────────

export type HorizonteMeta = '30d' | '90d' | '1a' | '5a'
export type StatusMeta = 'ativa' | 'concluida' | 'pausada'

export interface MarcoMeta {
  id: string
  titulo: string
  concluido: boolean
}

export interface Meta {
  id: string
  titulo: string
  descricao?: string
  categoria: string
  horizonte: HorizonteMeta
  prazo?: string
  progresso: number  // 0-100
  status: StatusMeta
  marcos: MarcoMeta[]
}

// ─── Personal Trainer ────────────────────────────────────────────────────────

export type ObjetivoTreino = 'hipertrofia' | 'forca' | 'emagrecimento' | 'condicionamento'
export type NivelTreino = 'iniciante' | 'intermediario' | 'avancado'
export type EquipamentoTreino = 'academia' | 'casa' | 'corporal'

export interface ExercicioPlano {
  nome: string
  series: number
  reps: string
  descanso: number
  observacao?: string
}

export interface DiaPlano {
  nome: string
  grupos: string[]
  exercicios: ExercicioPlano[]
  isDescanso: boolean
}

export interface RecordePessoal {
  peso: number
  reps: number
  data: string
}

export interface PlanoTreino {
  id: string
  objetivo: ObjetivoTreino
  nivel: NivelTreino
  equipamento: EquipamentoTreino
  diasPorSemana: number
  cronograma: Partial<Record<DiaSemana, DiaPlano>>
  semanasCompletadas: number
  dataInicio: string
  recordes: Record<string, RecordePessoal>
}

// ─── App ────────────────────────────────────────────────────────────────────

export type Moeda = 'BRL' | 'USD' | 'EUR' | 'GBP'

export interface UserProfile {
  nome: string
  objetivos: string[]
  desafios: string[]
  habitosSelecionados: string[]
  mantra?: string
  moeda?: Moeda
  avatarGradient?: string
  avatarUrl?: string
}

export interface Habito {
  id: string
  nome: string
  icone: string
  cor: string
  streak: number
  datasConcluidas: string[]
  lembrete?: string  // "HH:MM" — horário do lembrete diário
}

export interface NotifPrefs {
  habitosDiarios: boolean
  horaHabitos: string           // "07:00"
  vencimentosFinanceiros: boolean
  diasAntesVencimento: number   // 1 | 2 | 3 | 7
  metas: boolean
  horaAlertas: string           // "09:00"
  sonoAlarme: boolean
  horaAcordador: string         // "07:00"
}

export interface Tarefa {
  id: string
  titulo: string
  prioridade: Priority
  concluida: boolean
  projetoId?: string
  dataVencimento?: string
  coluna: KanbanColumn
}

export interface Projeto {
  id: string
  nome: string
  cor: string
  descricao?: string
  status: 'ativo' | 'pausado' | 'concluido'
}

export interface Mensagem {
  id: string
  papel: 'usuario' | 'assistente'
  conteudo: string
  timestamp: string
}

export interface SessaoFoco {
  tituloTarefa: string
  iniciadoEm: string
  duracao: number
  sessoesCompletas: number
}

export interface ScoreEntry {
  data: string   // "YYYY-MM-DD"
  score: number
}

export interface FlowState {
  perfil: UserProfile | null
  onboardingCompleto: boolean
  isPro: boolean
  userId: string | null
  notifPrefs: NotifPrefs
  scoreHistorico: ScoreEntry[]
  habitos: Habito[]
  tarefas: Tarefa[]
  projetos: Projeto[]
  transacoes: Transacao[]
  categorias: CategoriaFinanceira[]
  contas: ContaBancaria[]
  tags: Tag[]
  mensagens: Mensagem[]
  sessaoFoco: SessaoFoco | null
  focosHoje: number

  // Saúde & Bem-estar
  registrosSono: RegistroSono[]
  registrosAlimentacao: RegistroAlimentacao[]
  registrosSaude: RegistroSaude[]
  medicamentos: Medicamento[]
  sessoesTreino: SessaoTreino[]
  planoDiario: Partial<Record<DiaSemana, string>>  // dia → nome do treino planejado

  // Crescimento
  livros: Livro[]
  metaLivrosPorAno: number
  cursos: Curso[]
  notasAprendizado: NotaAprendizado[]
  metas: Meta[]

  // Remote sync
  hydrateFromRemote: (data: Record<string, unknown>) => void

  // Auth
  setUserId: (id: string | null) => void
  resetStore: () => void

  // Onboarding
  completarOnboarding: (perfil: UserProfile) => void
  atualizarPerfil: (dados: Partial<UserProfile>) => void

  // Pro
  upgradePro: () => void

  // Notificações
  atualizarNotifPrefs: (prefs: Partial<NotifPrefs>) => void

  // Score histórico
  registrarScore: (score: number) => void

  // Hábitos
  adicionarHabito: (nome: string, icone: string, cor: string) => void
  alternarHabito: (habitoId: string, data: string) => void
  removerHabito: (habitoId: string) => void

  // Tarefas & Projetos
  adicionarTarefa: (titulo: string, prioridade: Priority, coluna?: KanbanColumn, projetoId?: string) => void
  alternarTarefa: (tarefaId: string) => void
  moverTarefa: (tarefaId: string, coluna: KanbanColumn) => void
  removerTarefa: (tarefaId: string) => void
  adicionarProjeto: (nome: string, cor: string, descricao?: string) => void

  // Finanças
  adicionarTransacao: (transacao: Omit<Transacao, 'id'>) => void
  atualizarTransacao: (id: string, dados: Partial<Transacao>) => void
  removerTransacao: (id: string) => void
  alternarStatusTransacao: (id: string) => void
  adicionarCategoria: (cat: Omit<CategoriaFinanceira, 'id'>) => void
  atualizarCategoria: (id: string, dados: Partial<CategoriaFinanceira>) => void
  removerCategoria: (id: string) => void
  adicionarConta: (conta: Omit<ContaBancaria, 'id'>) => void
  removerConta: (id: string) => void
  adicionarTag: (tag: Omit<Tag, 'id'>) => void
  removerTag: (id: string) => void

  // IA
  adicionarMensagem: (papel: 'usuario' | 'assistente', conteudo: string) => void
  limparMensagens: () => void

  // Foco
  iniciarFoco: (tituloTarefa: string) => void
  encerrarFoco: () => void
  incrementarFoco: () => void

  // Treino
  adicionarSessaoTreino: (sessao: Omit<SessaoTreino, 'id'>) => void
  removerSessaoTreino: (id: string) => void
  atualizarPlanoDiario: (plano: Partial<Record<DiaSemana, string>>) => void

  // Personal Trainer
  planoTreino: PlanoTreino | null
  criarPlanoTreino: (cfg: Pick<PlanoTreino, 'objetivo' | 'nivel' | 'equipamento' | 'diasPorSemana'>) => void
  removerPlanoTreino: () => void
  avancarSemanaPlano: () => void
  registrarRecorde: (exercicio: string, peso: number, reps: number) => void

  // Sono
  salvarRegistroSono: (registro: Omit<RegistroSono, 'id'>) => void
  removerRegistroSono: (id: string) => void

  // Alimentação
  salvarRegistroAlimentacao: (data: string) => void
  adicionarItemRefeicao: (data: string, item: Omit<ItemRefeicao, 'id'>) => void
  removerItemRefeicao: (data: string, itemId: string) => void
  atualizarAgua: (data: string, copos: number) => void

  // Saúde
  salvarRegistroSaude: (registro: Omit<RegistroSaude, 'id'>) => void
  adicionarMedicamento: (med: Omit<Medicamento, 'id'>) => void
  toggleMedicamento: (id: string) => void
  removerMedicamento: (id: string) => void

  // Leitura
  adicionarLivro: (livro: Omit<Livro, 'id'>) => void
  atualizarLivro: (id: string, dados: Partial<Livro>) => void
  removerLivro: (id: string) => void
  atualizarMetaLivros: (meta: number) => void

  // Conhecimento
  adicionarCurso: (curso: Omit<Curso, 'id'>) => void
  atualizarCurso: (id: string, dados: Partial<Curso>) => void
  removerCurso: (id: string) => void
  adicionarNota: (nota: Omit<NotaAprendizado, 'id'>) => void
  removerNota: (id: string) => void

  // Faculdade
  adicionarSemestre: (cursoId: string, semestre: Omit<SemestreFaculdade, 'id'>) => void
  removerSemestre: (cursoId: string, semestreId: string) => void
  adicionarMateria: (cursoId: string, semestreId: string, materia: Omit<MateriaFaculdade, 'id'>) => void
  atualizarMateria: (cursoId: string, semestreId: string, materiaId: string, dados: Partial<MateriaFaculdade>) => void
  removerMateria: (cursoId: string, semestreId: string, materiaId: string) => void
  adicionarNotaMateria: (cursoId: string, semestreId: string, materiaId: string, nota: Omit<NotaFaculdade, 'id'>) => void
  removerNotaMateria: (cursoId: string, semestreId: string, materiaId: string, notaId: string) => void
  adicionarTrabalhoMateria: (cursoId: string, semestreId: string, materiaId: string, trabalho: Omit<TrabalhoFaculdade, 'id'>) => void
  toggleTrabalhoEntregue: (cursoId: string, semestreId: string, materiaId: string, trabalhoId: string) => void

  // Metas
  adicionarMeta: (meta: Omit<Meta, 'id'>) => void
  atualizarMeta: (id: string, dados: Partial<Meta>) => void
  removerMeta: (id: string) => void
  toggleMarco: (metaId: string, marcoId: string) => void
}
