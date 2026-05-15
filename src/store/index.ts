import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  FlowState, UserProfile, Priority, KanbanColumn,
  CategoriaFinanceira, StatusPagamento, NotifPrefs, ScoreEntry,
} from '../types'

const uid = () => Math.random().toString(36).slice(2, 10)
const hoje = () => new Date().toISOString().split('T')[0]
const addDias = (dateStr: string, dias: number) => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + dias)
  return d.toISOString().split('T')[0]
}

// ─── Categorias padrão ──────────────────────────────────────────────────────

const CATEGORIAS_PADRAO: CategoriaFinanceira[] = [
  {
    id: 'moradia', nome: 'Moradia', cor: '#3b82f6', tipo: 'gasto',
    subcategorias: [
      { id: 'aluguel', nome: 'Aluguel' }, { id: 'condominio', nome: 'Condomínio' },
      { id: 'iptu', nome: 'IPTU' }, { id: 'agua', nome: 'Água' },
      { id: 'luz', nome: 'Luz / Energia' }, { id: 'gas', nome: 'Gás' },
      { id: 'internet', nome: 'Internet / TV' },
    ],
  },
  {
    id: 'alimentacao', nome: 'Alimentação', cor: '#10b981', tipo: 'gasto',
    subcategorias: [
      { id: 'mercado', nome: 'Mercado' }, { id: 'restaurante', nome: 'Restaurante' },
      { id: 'delivery', nome: 'Delivery' }, { id: 'padaria', nome: 'Padaria / Café' },
    ],
  },
  {
    id: 'transporte', nome: 'Transporte', cor: '#f59e0b', tipo: 'gasto',
    subcategorias: [
      { id: 'combustivel', nome: 'Combustível' }, { id: 'uber', nome: 'Uber / Táxi' },
      { id: 'manutencao', nome: 'Manutenção' }, { id: 'ipva', nome: 'IPVA / Seguro' },
      { id: 'estacionamento', nome: 'Estacionamento' },
    ],
  },
  {
    id: 'saude', nome: 'Saúde', cor: '#ef4444', tipo: 'gasto',
    subcategorias: [
      { id: 'plano', nome: 'Plano de Saúde' }, { id: 'medicamentos', nome: 'Medicamentos' },
      { id: 'consulta', nome: 'Consultas' }, { id: 'academia', nome: 'Academia' },
    ],
  },
  {
    id: 'educacao', nome: 'Educação', cor: '#8b5cf6', tipo: 'gasto',
    subcategorias: [
      { id: 'mensalidade', nome: 'Mensalidade' }, { id: 'cursos', nome: 'Cursos Online' },
      { id: 'livros', nome: 'Livros / Material' },
    ],
  },
  {
    id: 'lazer', nome: 'Lazer', cor: '#ec4899', tipo: 'gasto',
    subcategorias: [
      { id: 'streaming', nome: 'Streaming' }, { id: 'cinema', nome: 'Cinema / Teatro' },
      { id: 'viagens', nome: 'Viagens' }, { id: 'esportes', nome: 'Esportes' },
    ],
  },
  {
    id: 'servicos', nome: 'Serviços', cor: '#6366f1', tipo: 'gasto',
    subcategorias: [
      { id: 'assinaturas', nome: 'Assinaturas' }, { id: 'seguros', nome: 'Seguros' },
      { id: 'software', nome: 'Software / Apps' },
    ],
  },
  {
    id: 'vestuario', nome: 'Vestuário', cor: '#06b6d4', tipo: 'gasto',
    subcategorias: [
      { id: 'roupas', nome: 'Roupas' }, { id: 'calcados', nome: 'Calçados' },
      { id: 'acessorios', nome: 'Acessórios' },
    ],
  },
  {
    id: 'outros-gasto', nome: 'Outros Gastos', cor: '#71717a', tipo: 'gasto',
    subcategorias: [],
  },
  {
    id: 'salario', nome: 'Salário', cor: '#10b981', tipo: 'receita',
    subcategorias: [
      { id: 'salario-base', nome: 'Salário Base' }, { id: 'bonus', nome: 'Bônus' },
      { id: 'hora-extra', nome: 'Hora Extra' }, { id: 'decimo', nome: '13º / Férias' },
    ],
  },
  {
    id: 'freelance', nome: 'Freelance / Autônomo', cor: '#3b82f6', tipo: 'receita',
    subcategorias: [
      { id: 'projeto', nome: 'Projeto' }, { id: 'consultoria', nome: 'Consultoria' },
    ],
  },
  {
    id: 'investimentos', nome: 'Investimentos', cor: '#f59e0b', tipo: 'receita',
    subcategorias: [
      { id: 'dividendos', nome: 'Dividendos' }, { id: 'rendimentos', nome: 'Rendimentos' },
      { id: 'venda-ativos', nome: 'Venda de Ativos' },
    ],
  },
  {
    id: 'outros-receita', nome: 'Outras Receitas', cor: '#71717a', tipo: 'receita',
    subcategorias: [],
  },
]

const PRESET_HABITOS: Record<string, { icone: string; cor: string }> = {
  'Rotina Matinal': { icone: '☀️', cor: '#f59e0b' },
  'Exercício Físico': { icone: '💪', cor: '#10b981' },
  'Meditação': { icone: '🧘', cor: '#8b5cf6' },
  'Leitura': { icone: '📚', cor: '#3b82f6' },
  'Journaling': { icone: '✍️', cor: '#ec4899' },
  'Trabalho Profundo': { icone: '🎯', cor: '#00d4ff' },
  'Alimentação Saudável': { icone: '🥗', cor: '#10b981' },
  'Horário de Dormir': { icone: '🌙', cor: '#6366f1' },
  'Hidratação': { icone: '💧', cor: '#06b6d4' },
  'Sem Redes Sociais': { icone: '🚫', cor: '#ef4444' },
}

function seedHabitos(selecionados: string[]) {
  return selecionados.slice(0, 6).map(nome => {
    const preset = PRESET_HABITOS[nome] ?? { icone: '⚡', cor: '#3b82f6' }
    return { id: uid(), nome, icone: preset.icone, cor: preset.cor, streak: 0, datasConcluidas: [] as string[] }
  })
}

function seedTarefas(objetivos: string[]) {
  const mapa: Record<string, { titulo: string; prioridade: Priority }[]> = {
    'Produtividade': [
      { titulo: 'Definir as 3 prioridades da semana', prioridade: 'alta' },
      { titulo: 'Configurar blocos de trabalho profundo', prioridade: 'media' },
    ],
    'Crescimento Financeiro': [
      { titulo: 'Revisar orçamento mensal', prioridade: 'alta' },
      { titulo: 'Identificar nova fonte de renda', prioridade: 'media' },
    ],
    'Saúde & Condicionamento': [
      { titulo: 'Agendar treinos da semana', prioridade: 'alta' },
      { titulo: 'Acompanhar alimentação por 7 dias', prioridade: 'media' },
    ],
    'Aprendizado': [
      { titulo: 'Escolher um curso para concluir', prioridade: 'alta' },
      { titulo: 'Definir meta de leitura diária', prioridade: 'baixa' },
    ],
    'Carreira': [
      { titulo: 'Atualizar portfólio / LinkedIn', prioridade: 'alta' },
      { titulo: 'Entrar em contato com um mentor', prioridade: 'media' },
    ],
    'Clareza Mental': [
      { titulo: 'Criar rotina de journaling de 10 min', prioridade: 'media' },
      { titulo: 'Reduzir decisões desnecessárias', prioridade: 'baixa' },
    ],
  }
  const tarefas: Array<{ id: string; titulo: string; prioridade: Priority; concluida: boolean; coluna: KanbanColumn }> = []
  for (const obj of objetivos.slice(0, 2)) {
    for (const t of (mapa[obj] ?? [])) {
      tarefas.push({ id: uid(), titulo: t.titulo, prioridade: t.prioridade, concluida: false, coluna: 'a-fazer' })
    }
  }
  if (tarefas.length === 0) {
    tarefas.push(
      { id: uid(), titulo: 'Definir seu objetivo mais importante', prioridade: 'alta', concluida: false, coluna: 'a-fazer' },
      { id: uid(), titulo: 'Revisar sua rotina diária', prioridade: 'media', concluida: false, coluna: 'a-fazer' },
    )
  }
  return tarefas
}

function seedTransacoes() {
  const h = hoje()
  const venc = addDias(h, 5)
  return [
    {
      id: uid(), tipo: 'receita' as const, valor: 5000, categoriaId: 'salario',
      subcategoriaId: 'salario-base', descricao: 'Salário — Maio/2026',
      observacoes: '', dataLancamento: h, dataVencimento: h,
      dataEfetivacao: h, status: 'pago' as StatusPagamento,
      tipoPagamento: 'fixo-mensal' as const, anexos: [], tagIds: [],
    },
    {
      id: uid(), tipo: 'gasto' as const, valor: 1500, categoriaId: 'moradia',
      subcategoriaId: 'aluguel', descricao: 'Aluguel — Maio/2026',
      observacoes: '', dataLancamento: h, dataVencimento: venc,
      status: 'pendente' as StatusPagamento,
      tipoPagamento: 'fixo-mensal' as const, anexos: [], tagIds: [],
    },
    {
      id: uid(), tipo: 'gasto' as const, valor: 89.9, categoriaId: 'servicos',
      subcategoriaId: 'assinaturas', descricao: 'Netflix + Spotify',
      observacoes: '', dataLancamento: h, dataVencimento: addDias(h, 3),
      status: 'pendente' as StatusPagamento,
      tipoPagamento: 'recorrente' as const, anexos: [], tagIds: [],
    },
  ]
}

// ─── Personal Trainer — gerador de planos ───────────────────────────────────

import type { ObjetivoTreino, NivelTreino, EquipamentoTreino, DiaPlano, DiaSemana, ExercicioPlano } from '../types'

type Ex = ExercicioPlano

const EX = {
  // Peito
  supino:       (s=4,r='8-12'): Ex => ({ nome:'Supino Reto', series:s, reps:r, descanso:90 }),
  supinoInc:    (s=3,r='10-12'): Ex => ({ nome:'Supino Inclinado', series:s, reps:r, descanso:75 }),
  crucifixo:    (): Ex => ({ nome:'Crucifixo', series:3, reps:'12-15', descanso:60 }),
  flexao:       (s=4,r='AMRAP'): Ex => ({ nome:'Flexão', series:s, reps:r, descanso:60 }),
  flexaoDia:    (): Ex => ({ nome:'Flexão Diamante', series:3, reps:'10-12', descanso:60 }),
  // Costas
  puxada:       (s=4,r='8-12'): Ex => ({ nome:'Puxada Frente', series:s, reps:r, descanso:90 }),
  remadaC:      (s=4,r='8-12'): Ex => ({ nome:'Remada Curvada', series:s, reps:r, descanso:90 }),
  remadaU:      (): Ex => ({ nome:'Remada Unilateral', series:3, reps:'10-12', descanso:75 }),
  pulldown:     (): Ex => ({ nome:'Pulldown', series:3, reps:'10-12', descanso:75 }),
  hiperex:      (): Ex => ({ nome:'Hiperextensão', series:3, reps:'12-15', descanso:60 }),
  // Ombros
  desenvolvimento: (s=4,r='8-12'): Ex => ({ nome:'Desenvolvimento', series:s, reps:r, descanso:90 }),
  elevaLat:     (): Ex => ({ nome:'Elevação Lateral', series:3, reps:'12-15', descanso:60 }),
  elevaFront:   (): Ex => ({ nome:'Elevação Frontal', series:3, reps:'12-15', descanso:60 }),
  arnold:       (): Ex => ({ nome:'Desenvolvimento Arnold', series:3, reps:'10-12', descanso:75 }),
  // Bíceps
  roscaDireta:  (s=3,r='10-12'): Ex => ({ nome:'Rosca Direta', series:s, reps:r, descanso:60 }),
  roscaAlt:     (): Ex => ({ nome:'Rosca Alternada', series:3, reps:'10-12', descanso:60 }),
  roscaMart:    (): Ex => ({ nome:'Rosca Martelo', series:3, reps:'10-12', descanso:60 }),
  // Tríceps
  tricCorda:    (): Ex => ({ nome:'Tríceps Corda', series:3, reps:'10-12', descanso:60 }),
  tricTesta:    (): Ex => ({ nome:'Tríceps Testa', series:3, reps:'10-12', descanso:60 }),
  tricMergulho: (): Ex => ({ nome:'Mergulho (Tríceps)', series:3, reps:'AMRAP', descanso:60 }),
  // Pernas
  agacha:       (s=4,r='8-12'): Ex => ({ nome:'Agachamento', series:s, reps:r, descanso:120 }),
  legPress:     (s=4,r='10-15'): Ex => ({ nome:'Leg Press', series:s, reps:r, descanso:90 }),
  extensora:    (): Ex => ({ nome:'Cadeira Extensora', series:3, reps:'12-15', descanso:60 }),
  flexora:      (): Ex => ({ nome:'Cadeira Flexora', series:3, reps:'12-15', descanso:60 }),
  stiff:        (): Ex => ({ nome:'Stiff', series:3, reps:'10-12', descanso:75 }),
  panturrilha:  (): Ex => ({ nome:'Panturrilha', series:4, reps:'15-20', descanso:45 }),
  afundo:       (): Ex => ({ nome:'Afundo', series:3, reps:'12 cada', descanso:60 }),
  gluteo:       (): Ex => ({ nome:'Glúteo 4 Apoios', series:3, reps:'15-20', descanso:45 }),
  // Core
  prancha:      (): Ex => ({ nome:'Prancha', series:3, reps:'60s', descanso:30 }),
  crunch:       (): Ex => ({ nome:'Abdominal Crunch', series:3, reps:'20', descanso:30 }),
  elevPernas:   (): Ex => ({ nome:'Elevação de Pernas', series:3, reps:'15', descanso:45 }),
  russianTwist: (): Ex => ({ nome:'Russian Twist', series:3, reps:'20', descanso:30 }),
  // Cardio / Funcional
  corrida20:    (): Ex => ({ nome:'Corrida Leve', series:1, reps:'20min', descanso:0, observacao:'ritmo conversacional' }),
  hiit:         (): Ex => ({ nome:'HIIT', series:6, reps:'30s on / 30s off', descanso:0 }),
  burpee:       (): Ex => ({ nome:'Burpee', series:4, reps:'12', descanso:60 }),
  jump:         (): Ex => ({ nome:'Jump Squat', series:4, reps:'15', descanso:45 }),
}

// Compound lifts com reps de força
const FORCA = {
  supino:       (): Ex => ({ nome:'Supino Reto', series:5, reps:'3-5', descanso:180, observacao:'cargas máximas' }),
  agacha:       (): Ex => ({ nome:'Agachamento', series:5, reps:'3-5', descanso:180, observacao:'cargas máximas' }),
  deadlift:     (): Ex => ({ nome:'Levantamento Terra', series:4, reps:'3-5', descanso:180, observacao:'cargas máximas' }),
  desenvolvimento: (): Ex => ({ nome:'Desenvolvimento', series:4, reps:'3-5', descanso:180 }),
  remadaC:      (): Ex => ({ nome:'Remada Curvada', series:4, reps:'4-6', descanso:150 }),
  puxada:       (): Ex => ({ nome:'Puxada Frente', series:4, reps:'4-6', descanso:150 }),
}

type Plano = Partial<Record<DiaSemana, DiaPlano>>
const D: DiaSemana[] = ['seg','ter','qua','qui','sex','sab','dom']

function dia(nome: string, grupos: string[], exercicios: Ex[]): DiaPlano {
  return { nome, grupos, exercicios, isDescanso: false }
}
const descanso = (): DiaPlano => ({ nome:'Descanso', grupos:[], exercicios:[], isDescanso:true })

function gerarCronograma(
  objetivo: ObjetivoTreino,
  nivel: NivelTreino,
  equipamento: EquipamentoTreino,
  diasPorSemana: number,
): Plano {
  const gym = equipamento === 'academia'
  void nivel

  // ── Hipertrofia ─────────────────────────────────────────────────────────
  if (objetivo === 'hipertrofia') {
    if (diasPorSemana <= 3) {
      // PPL 3 dias
      const push = dia('Push — Peito, Ombros & Tríceps', ['peito','ombros','triceps'], [
        gym ? EX.supino() : EX.flexao(), gym ? EX.supinoInc() : EX.flexaoDia(),
        EX.desenvolvimento(), EX.elevaLat(), EX.tricCorda(), EX.tricTesta(),
      ])
      const pull = dia('Pull — Costas & Bíceps', ['costas','biceps'], [
        gym ? EX.puxada() : EX.hiperex(), gym ? EX.remadaC() : EX.pulldown(),
        EX.remadaU(), EX.roscaDireta(), EX.roscaAlt(), EX.roscaMart(),
      ])
      const legs = dia('Legs — Pernas & Core', ['pernas','core'], [
        gym ? EX.agacha() : EX.agacha(4,'15-20'), gym ? EX.legPress() : EX.afundo(),
        gym ? EX.extensora() : EX.gluteo(), EX.stiff(), EX.panturrilha(),
        EX.prancha(), EX.crunch(),
      ])
      return { seg:push, ter:descanso(), qua:pull, qui:descanso(), sex:legs, sab:descanso(), dom:descanso() }
    }
    if (diasPorSemana === 4) {
      // Upper / Lower
      const upperA = dia('Upper A — Peito & Costas', ['peito','costas','ombros'], [
        gym ? EX.supino() : EX.flexao(), gym ? EX.puxada() : EX.hiperex(),
        EX.supinoInc(), EX.remadaC(), EX.desenvolvimento(), EX.elevaLat(),
      ])
      const lowerA = dia('Lower A — Pernas (foco quad)', ['pernas','core'], [
        gym ? EX.agacha() : EX.agacha(4,'15-20'), gym ? EX.legPress() : EX.afundo(),
        EX.extensora(), EX.panturrilha(), EX.prancha(), EX.elevPernas(),
      ])
      const upperB = dia('Upper B — Braços & Ombros', ['ombros','biceps','triceps'], [
        EX.desenvolvimento(), EX.elevaLat(), EX.elevaFront(),
        EX.roscaDireta(), EX.roscaMart(), EX.tricCorda(), EX.tricTesta(),
      ])
      const lowerB = dia('Lower B — Pernas (foco post)', ['pernas','core'], [
        EX.stiff(), gym ? EX.flexora() : EX.gluteo(), EX.afundo(),
        EX.panturrilha(), EX.crunch(), EX.russianTwist(),
      ])
      return { seg:upperA, ter:lowerA, qua:descanso(), qui:upperB, sex:lowerB, sab:descanso(), dom:descanso() }
    }
    if (diasPorSemana === 5) {
      // Bro split
      return {
        seg: dia('Peito', ['peito'], [gym?EX.supino():EX.flexao(), EX.supinoInc(), EX.crucifixo(), EX.tricCorda()]),
        ter: dia('Costas', ['costas'], [gym?EX.puxada():EX.hiperex(), EX.remadaC(), EX.remadaU(), EX.pulldown()]),
        qua: dia('Ombros', ['ombros'], [EX.desenvolvimento(), EX.elevaLat(), EX.elevaFront(), EX.arnold()]),
        qui: dia('Pernas', ['pernas','core'], [gym?EX.agacha():EX.agacha(4,'15-20'), gym?EX.legPress():EX.afundo(), EX.stiff(), EX.panturrilha(), EX.prancha()]),
        sex: dia('Bíceps & Tríceps', ['biceps','triceps'], [EX.roscaDireta(), EX.roscaAlt(), EX.roscaMart(), EX.tricCorda(), EX.tricTesta(), EX.tricMergulho()]),
        sab: descanso(), dom: descanso(),
      }
    }
    // 6 dias PPLx2
    return {
      seg: dia('Push A — Peito & Tríceps', ['peito','triceps'], [gym?EX.supino():EX.flexao(), EX.supinoInc(), EX.crucifixo(), EX.tricCorda(), EX.tricTesta()]),
      ter: dia('Pull A — Costas & Bíceps', ['costas','biceps'], [gym?EX.puxada():EX.hiperex(), EX.remadaC(), EX.remadaU(), EX.roscaDireta(), EX.roscaMart()]),
      qua: dia('Legs A — Quad foco', ['pernas','core'], [gym?EX.agacha():EX.agacha(4,'15-20'), gym?EX.legPress():EX.afundo(), EX.extensora(), EX.panturrilha(), EX.prancha()]),
      qui: dia('Push B — Ombros & Peito', ['ombros','peito'], [EX.desenvolvimento(), EX.elevaLat(), EX.elevaFront(), EX.supinoInc(), EX.tricMergulho()]),
      sex: dia('Pull B — Costas & Bíceps', ['costas','biceps'], [EX.pulldown(), EX.remadaC(), EX.hiperex(), EX.roscaAlt(), EX.roscaMart()]),
      sab: dia('Legs B — Post foco', ['pernas','core'], [EX.stiff(), gym?EX.flexora():EX.gluteo(), EX.afundo(), EX.panturrilha(), EX.crunch(), EX.russianTwist()]),
      dom: descanso(),
    }
  }

  // ── Força ────────────────────────────────────────────────────────────────
  if (objetivo === 'forca') {
    const fullBody = (nome: string): DiaPlano => dia(nome, ['peito','costas','pernas'], [
      FORCA.agacha(), FORCA.supino(), FORCA.remadaC(), FORCA.puxada(), EX.prancha(),
    ])
    if (diasPorSemana <= 3) {
      return { seg:fullBody('Full Body A'), ter:descanso(), qua:fullBody('Full Body B'), qui:descanso(), sex:fullBody('Full Body C'), sab:descanso(), dom:descanso() }
    }
    return {
      seg: dia('Upper Força', ['peito','costas','ombros'], [FORCA.supino(), FORCA.remadaC(), FORCA.desenvolvimento(), FORCA.puxada(), EX.elevaLat()]),
      ter: dia('Lower Força', ['pernas'], [FORCA.agacha(), FORCA.deadlift(), EX.afundo(), EX.panturrilha()]),
      qua: descanso(),
      qui: dia('Upper Hipertrofia', ['peito','ombros','biceps','triceps'], [EX.supinoInc(), EX.arnold(), EX.elevaLat(), EX.roscaDireta(), EX.tricCorda()]),
      sex: dia('Lower Hipertrofia', ['pernas','core'], [gym?EX.legPress():EX.afundo(), EX.stiff(), EX.extensora(), EX.panturrilha(), EX.prancha()]),
      sab: diasPorSemana >= 5 ? dia('Full Body Técnico', ['peito','costas','pernas'], [FORCA.supino(), FORCA.agacha(), FORCA.remadaC(), EX.crunch()]) : descanso(),
      dom: descanso(),
    }
  }

  // ── Emagrecimento ────────────────────────────────────────────────────────
  if (objetivo === 'emagrecimento') {
    const circ = (nome: string, exs: Ex[]): DiaPlano => dia(nome, ['full-body'], exs)
    const dias3 = [
      circ('Circuito Total A', [EX.burpee(), EX.agacha(3,'15-20'), EX.flexao(3,'15'), EX.jump(), EX.prancha(), EX.crunch()]),
      circ('HIIT + Core', [EX.hiit(), EX.russianTwist(), EX.elevPernas(), EX.prancha(), EX.crunch()]),
      circ('Circuito Total B', [EX.jump(), gym?EX.legPress(3,'15-20'):EX.afundo(), EX.burpee(), EX.flexao(3,'AMRAP'), EX.russianTwist()]),
    ]
    const schedule: Plano = {}
    const diasAtivos = D.slice(0, 7)
    let ti = 0
    diasAtivos.forEach((d, i) => {
      if (i < diasPorSemana && ti < dias3.length) { schedule[d] = dias3[ti++] }
      else if (i === Math.floor(diasPorSemana / 2)) { schedule[d] = { ...circ('Cardio Leve', [EX.corrida20()]) } }
      else schedule[d] = descanso()
    })
    return schedule
  }

  // ── Condicionamento ──────────────────────────────────────────────────────
  const cond = (nome: string, exs: Ex[]): DiaPlano => dia(nome, ['condicionamento'], exs)
  const diasCond = [
    cond('Força + Cardio', [gym?EX.agacha():EX.agacha(3,'15-20'), gym?EX.remadaC():EX.hiperex(), EX.flexao(), EX.corrida20(), EX.prancha()]),
    cond('HIIT Funcional', [EX.hiit(), EX.burpee(), EX.jump(), EX.russianTwist(), EX.elevPernas()]),
    cond('Força + Mobilidade', [gym?EX.legPress():EX.afundo(), gym?EX.puxada():EX.hiperex(), EX.desenvolvimento(), EX.corrida20(), EX.crunch()]),
  ]
  const condSchedule: Plano = {}
  D.forEach((d, i) => { condSchedule[d] = i < diasPorSemana && i < diasCond.length ? diasCond[i] : descanso() })
  return condSchedule
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      perfil: null,
      onboardingCompleto: false,
      isPro: false,
      userId: null,
      notifPrefs: {
        habitosDiarios: false,
        horaHabitos: '07:00',
        vencimentosFinanceiros: false,
        diasAntesVencimento: 3,
        metas: false,
        horaAlertas: '09:00',
        sonoAlarme: false,
        horaAcordador: '07:00',
      } as NotifPrefs,
      scoreHistorico: [] as ScoreEntry[],
      habitos: [],
      tarefas: [],
      projetos: [],
      transacoes: [],
      categorias: CATEGORIAS_PADRAO,
      contas: [],
      tags: [],
      mensagens: [],
      sessaoFoco: null,
      focosHoje: 0,
      registrosSono: [],
      registrosAlimentacao: [],
      registrosSaude: [],
      medicamentos: [],
      sessoesTreino: [],
      planoDiario: {},
      planoTreino: null,
      livros: [],
      metaLivrosPorAno: 12,
      cursos: [],
      notasAprendizado: [],
      metas: [],

      hydrateFromRemote: (data) => set(data as Partial<FlowState>),

      setUserId: (id) => set({ userId: id }),

      resetStore: () => set({
        perfil: null,
        onboardingCompleto: false,
        isPro: false,
        userId: null,
        notifPrefs: {
          habitosDiarios: false,
          horaHabitos: '07:00',
          vencimentosFinanceiros: false,
          diasAntesVencimento: 3,
          metas: false,
          horaAlertas: '09:00',
          sonoAlarme: false,
          horaAcordador: '07:00',
        } as NotifPrefs,
        scoreHistorico: [] as ScoreEntry[],
        habitos: [],
        tarefas: [],
        projetos: [],
        transacoes: [],
        categorias: CATEGORIAS_PADRAO,
        contas: [],
        tags: [],
        mensagens: [],
        sessaoFoco: null,
        focosHoje: 0,
        registrosSono: [],
        registrosAlimentacao: [],
        registrosSaude: [],
        medicamentos: [],
        sessoesTreino: [],
        planoDiario: {},
        planoTreino: null,
        livros: [],
        metaLivrosPorAno: 12,
        cursos: [],
        notasAprendizado: [],
        metas: [],
      }),

      completarOnboarding: (perfil: UserProfile) => {
        const habitos = seedHabitos(perfil.habitosSelecionados)
        const tarefas = seedTarefas(perfil.objetivos)
        const projeto = {
          id: uid(), nome: `Metas de ${perfil.nome}`, cor: '#3b82f6',
          descricao: 'Objetivos e prioridades pessoais', status: 'ativo' as const,
        }
        const transacoes = seedTransacoes()
        set({
          perfil,
          onboardingCompleto: true,
          habitos,
          tarefas: tarefas.map(t => ({ ...t, projetoId: projeto.id })),
          projetos: [projeto],
          transacoes,
        })
      },

      upgradePro: () => set({ isPro: true }),

      atualizarNotifPrefs: (prefs) => set(s => ({
        notifPrefs: { ...s.notifPrefs, ...prefs },
      })),

      registrarScore: (score) => set(s => {
        const data = new Date().toISOString().split('T')[0]
        const hist = s.scoreHistorico.filter(e => e.data !== data)
        // Mantém máximo 90 dias de histórico
        const novoHist = [...hist, { data, score }].slice(-90)
        return { scoreHistorico: novoHist }
      }),

      atualizarPerfil: (dados) => set(s => ({
        perfil: s.perfil ? { ...s.perfil, ...dados } : s.perfil,
      })),

      // Hábitos
      adicionarHabito: (nome, icone, cor) => {
        set(s => ({
          habitos: [...s.habitos, { id: uid(), nome, icone, cor, streak: 0, datasConcluidas: [] }],
        }))
      },
      alternarHabito: (habitoId, data) => {
        set(s => ({
          habitos: s.habitos.map(h => {
            if (h.id !== habitoId) return h
            const feito = h.datasConcluidas.includes(data)
            const datasConcluidas = feito
              ? h.datasConcluidas.filter(d => d !== data)
              : [...h.datasConcluidas, data]
            return { ...h, datasConcluidas, streak: calcularStreak(datasConcluidas) }
          }),
        }))
      },
      removerHabito: (habitoId) => set(s => ({ habitos: s.habitos.filter(h => h.id !== habitoId) })),

      // Tarefas
      adicionarTarefa: (titulo, prioridade, coluna = 'a-fazer', projetoId) => {
        set(s => ({
          tarefas: [...s.tarefas, { id: uid(), titulo, prioridade, concluida: false, coluna, projetoId }],
        }))
      },
      alternarTarefa: (tarefaId) => {
        set(s => ({
          tarefas: s.tarefas.map(t =>
            t.id === tarefaId ? { ...t, concluida: !t.concluida, coluna: !t.concluida ? 'concluido' : 'a-fazer' } : t
          ),
        }))
      },
      moverTarefa: (tarefaId, coluna) => {
        set(s => ({
          tarefas: s.tarefas.map(t =>
            t.id === tarefaId ? { ...t, coluna, concluida: coluna === 'concluido' } : t
          ),
        }))
      },
      removerTarefa: (tarefaId) => set(s => ({ tarefas: s.tarefas.filter(t => t.id !== tarefaId) })),

      adicionarProjeto: (nome, cor, descricao) => {
        set(s => ({
          projetos: [...s.projetos, { id: uid(), nome, cor, descricao, status: 'ativo' }],
        }))
      },

      // Finanças — Transações
      adicionarTransacao: (transacao) => {
        if (transacao.tipoPagamento === 'parcelado' && transacao.parcelas && transacao.parcelas > 1) {
          const grupoId = uid()
          const novas = Array.from({ length: transacao.parcelas }, (_, i) => ({
            ...transacao,
            id: uid(),
            grupoParcelamento: grupoId,
            parcelaAtual: i + 1,
            dataVencimento: addDias(transacao.dataVencimento, i * 30),
            status: i === 0 ? transacao.status : 'pendente' as StatusPagamento,
            dataEfetivacao: i === 0 ? transacao.dataEfetivacao : undefined,
          }))
          set(s => ({ transacoes: [...novas, ...s.transacoes] }))
        } else {
          set(s => ({ transacoes: [{ ...transacao, id: uid() }, ...s.transacoes] }))
        }
      },
      atualizarTransacao: (id, dados) => {
        set(s => ({
          transacoes: s.transacoes.map(t => t.id === id ? { ...t, ...dados } : t),
        }))
      },
      removerTransacao: (id) => set(s => ({ transacoes: s.transacoes.filter(t => t.id !== id) })),

      alternarStatusTransacao: (id) => {
        set(s => ({
          transacoes: s.transacoes.map(t => {
            if (t.id !== id) return t
            const novoPago = t.status !== 'pago'
            return {
              ...t,
              status: novoPago ? 'pago' : 'pendente',
              dataEfetivacao: novoPago ? hoje() : undefined,
            }
          }),
        }))
      },

      // Finanças — Categorias
      adicionarCategoria: (cat) => {
        set(s => ({ categorias: [...s.categorias, { ...cat, id: uid() }] }))
      },
      atualizarCategoria: (id, dados) => {
        set(s => ({
          categorias: s.categorias.map(c => c.id === id ? { ...c, ...dados } : c),
        }))
      },
      removerCategoria: (id) => set(s => ({ categorias: s.categorias.filter(c => c.id !== id) })),

      // Finanças — Contas
      adicionarConta: (conta) => {
        set(s => ({ contas: [...s.contas, { ...conta, id: uid() }] }))
      },
      removerConta: (id) => set(s => ({ contas: s.contas.filter(c => c.id !== id) })),

      // Finanças — Tags
      adicionarTag: (tag) => {
        set(s => ({ tags: [...s.tags, { ...tag, id: uid() }] }))
      },
      removerTag: (id) => set(s => ({ tags: s.tags.filter(t => t.id !== id) })),

      // IA
      adicionarMensagem: (papel, conteudo) => {
        set(s => ({
          mensagens: [...s.mensagens, { id: uid(), papel, conteudo, timestamp: new Date().toISOString() }],
        }))
      },
      limparMensagens: () => set({ mensagens: [] }),

      // Foco
      iniciarFoco: (tituloTarefa) => {
        set({
          sessaoFoco: {
            tituloTarefa,
            iniciadoEm: new Date().toISOString(),
            duracao: 25,
            sessoesCompletas: get().focosHoje,
          },
        })
      },
      encerrarFoco: () => set({ sessaoFoco: null }),
      incrementarFoco: () => set(s => ({ focosHoje: s.focosHoje + 1 })),

      // Treino
      adicionarSessaoTreino: (sessao) => set(s => ({
        sessoesTreino: [{ ...sessao, id: uid() }, ...s.sessoesTreino],
      })),
      removerSessaoTreino: (id) => set(s => ({ sessoesTreino: s.sessoesTreino.filter(s => s.id !== id) })),
      atualizarPlanoDiario: (plano) => set({ planoDiario: plano }),

      // Personal Trainer
      criarPlanoTreino: (cfg) => {
        const { objetivo, nivel, equipamento, diasPorSemana } = cfg
        const cronograma = gerarCronograma(objetivo, nivel, equipamento, diasPorSemana)
        set({
          planoTreino: {
            id: uid(),
            objetivo,
            nivel,
            equipamento,
            diasPorSemana,
            cronograma,
            semanasCompletadas: 0,
            dataInicio: hoje(),
            recordes: {},
          },
        })
      },
      removerPlanoTreino: () => set({ planoTreino: null }),
      avancarSemanaPlano: () => set(s => s.planoTreino
        ? { planoTreino: { ...s.planoTreino, semanasCompletadas: s.planoTreino.semanasCompletadas + 1 } }
        : {}
      ),
      registrarRecorde: (exercicio, peso, reps) => set(s => {
        if (!s.planoTreino) return {}
        const atual = s.planoTreino.recordes[exercicio]
        const novo1RM = peso * (1 + reps / 30)
        const atual1RM = atual ? atual.peso * (1 + atual.reps / 30) : 0
        if (novo1RM <= atual1RM) return {}
        return {
          planoTreino: {
            ...s.planoTreino,
            recordes: { ...s.planoTreino.recordes, [exercicio]: { peso, reps, data: hoje() } },
          },
        }
      }),

      // Sono
      salvarRegistroSono: (registro) => {
        set(s => {
          const semHoje = s.registrosSono.filter(r => r.data !== registro.data)
          return { registrosSono: [{ ...registro, id: uid() }, ...semHoje] }
        })
      },
      removerRegistroSono: (id) => set(s => ({ registrosSono: s.registrosSono.filter(r => r.id !== id) })),

      // Alimentação
      salvarRegistroAlimentacao: (data) => {
        set(s => {
          if (s.registrosAlimentacao.find(r => r.data === data)) return s
          return { registrosAlimentacao: [{ id: uid(), data, refeicoes: [], agua: 0 }, ...s.registrosAlimentacao] }
        })
      },
      adicionarItemRefeicao: (data, item) => {
        set(s => {
          const existe = s.registrosAlimentacao.find(r => r.data === data)
          if (existe) {
            return {
              registrosAlimentacao: s.registrosAlimentacao.map(r =>
                r.data === data ? { ...r, refeicoes: [...r.refeicoes, { ...item, id: uid() }] } : r
              ),
            }
          }
          return {
            registrosAlimentacao: [
              { id: uid(), data, refeicoes: [{ ...item, id: uid() }], agua: 0 },
              ...s.registrosAlimentacao,
            ],
          }
        })
      },
      removerItemRefeicao: (data, itemId) => {
        set(s => ({
          registrosAlimentacao: s.registrosAlimentacao.map(r =>
            r.data === data ? { ...r, refeicoes: r.refeicoes.filter(i => i.id !== itemId) } : r
          ),
        }))
      },
      atualizarAgua: (data, copos) => {
        set(s => {
          const existe = s.registrosAlimentacao.find(r => r.data === data)
          if (existe) {
            return {
              registrosAlimentacao: s.registrosAlimentacao.map(r =>
                r.data === data ? { ...r, agua: Math.max(0, copos) } : r
              ),
            }
          }
          return {
            registrosAlimentacao: [
              { id: uid(), data, refeicoes: [], agua: Math.max(0, copos) },
              ...s.registrosAlimentacao,
            ],
          }
        })
      },

      // Saúde
      salvarRegistroSaude: (registro) => {
        set(s => {
          const semHoje = s.registrosSaude.filter(r => r.data !== registro.data)
          return { registrosSaude: [{ ...registro, id: uid() }, ...semHoje] }
        })
      },
      adicionarMedicamento: (med) => set(s => ({ medicamentos: [...s.medicamentos, { ...med, id: uid() }] })),
      toggleMedicamento: (id) => set(s => ({
        medicamentos: s.medicamentos.map(m => m.id === id ? { ...m, ativo: !m.ativo } : m),
      })),
      removerMedicamento: (id) => set(s => ({ medicamentos: s.medicamentos.filter(m => m.id !== id) })),

      // Leitura
      adicionarLivro: (livro) => set(s => ({ livros: [{ ...livro, id: uid() }, ...s.livros] })),
      atualizarLivro: (id, dados) => set(s => ({
        livros: s.livros.map(l => l.id === id ? { ...l, ...dados } : l),
      })),
      removerLivro: (id) => set(s => ({ livros: s.livros.filter(l => l.id !== id) })),
      atualizarMetaLivros: (meta) => set({ metaLivrosPorAno: meta }),

      // Conhecimento
      adicionarCurso: (curso) => set(s => ({ cursos: [{ ...curso, id: uid() }, ...s.cursos] })),
      atualizarCurso: (id, dados) => set(s => ({
        cursos: s.cursos.map(c => c.id === id ? { ...c, ...dados } : c),
      })),
      removerCurso: (id) => set(s => ({ cursos: s.cursos.filter(c => c.id !== id) })),
      adicionarNota: (nota) => set(s => ({
        notasAprendizado: [{ ...nota, id: uid() }, ...s.notasAprendizado],
      })),
      removerNota: (id) => set(s => ({ notasAprendizado: s.notasAprendizado.filter(n => n.id !== id) })),

      // Metas
      adicionarMeta: (meta) => set(s => ({ metas: [{ ...meta, id: uid() }, ...s.metas] })),
      atualizarMeta: (id, dados) => set(s => ({
        metas: s.metas.map(m => m.id === id ? { ...m, ...dados } : m),
      })),
      removerMeta: (id) => set(s => ({ metas: s.metas.filter(m => m.id !== id) })),
      toggleMarco: (metaId, marcoId) => set(s => ({
        metas: s.metas.map(m => m.id !== metaId ? m : {
          ...m,
          marcos: m.marcos.map(mk => mk.id === marcoId ? { ...mk, concluido: !mk.concluido } : mk),
          progresso: (() => {
            const updated = m.marcos.map(mk => mk.id === marcoId ? { ...mk, concluido: !mk.concluido } : mk)
            return updated.length > 0 ? Math.round(updated.filter(mk => mk.concluido).length / updated.length * 100) : m.progresso
          })(),
        }),
      })),
    }),
    { name: 'flowos-state-v2' }
  )
)

function calcularStreak(datas: string[]): number {
  if (datas.length === 0) return 0
  const sorted = [...datas].sort().reverse()
  const hojeStr = hoje()
  let streak = 0
  let atual = hojeStr
  for (const d of sorted) {
    if (d === atual) {
      streak++
      const prev = new Date(atual)
      prev.setDate(prev.getDate() - 1)
      atual = prev.toISOString().split('T')[0]
    } else {
      break
    }
  }
  return streak
}

export const DATA_KEYS: (keyof FlowState)[] = [
  'perfil', 'onboardingCompleto', 'isPro', 'notifPrefs', 'scoreHistorico',
  'habitos', 'tarefas', 'projetos', 'transacoes', 'categorias', 'contas', 'tags',
  'mensagens', 'focosHoje',
  'registrosSono', 'registrosAlimentacao', 'registrosSaude',
  'medicamentos', 'sessoesTreino', 'planoDiario', 'planoTreino',
  'livros', 'metaLivrosPorAno', 'cursos', 'notasAprendizado', 'metas',
]

export function calcularPontuacaoVida(state: Pick<FlowState, 'habitos' | 'tarefas' | 'transacoes' | 'focosHoje'>): number {
  const h = hoje()
  const totalHabitos = state.habitos.length
  const habitosConcluidos = state.habitos.filter(ha => ha.datasConcluidas.includes(h)).length
  const pontHabitos = totalHabitos > 0 ? (habitosConcluidos / totalHabitos) * 100 : 50

  const totalTarefas = state.tarefas.length
  const tarefasConcluidas = state.tarefas.filter(t => t.concluida).length
  const pontTarefas = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 50

  const streakMedio = state.habitos.length > 0
    ? state.habitos.reduce((s, ha) => s + ha.streak, 0) / state.habitos.length
    : 0
  const pontStreak = Math.min(streakMedio * 10, 100)

  const pontFoco = Math.min(state.focosHoje * 25, 100)

  const totalT = state.transacoes.length
  const pagas = state.transacoes.filter(t => t.status === 'pago').length
  const pontFinancas = totalT > 0 ? (pagas / totalT) * 80 + 20 : 40

  const score = pontHabitos * 0.3 + pontTarefas * 0.25 + pontStreak * 0.2 + pontFoco * 0.15 + pontFinancas * 0.1
  return Math.round(Math.max(0, Math.min(100, score)))
}
