import { useState, useMemo, useRef } from 'react'
import {
  BookOpen, Brain, Target, Plus, Trash2, X,
  ChevronRight, Check, FileText, GraduationCap,
  ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFlowStore } from '../store'
import type {
  StatusLivro, StatusCurso, HorizonteMeta, StatusMeta,
  SemestreFaculdade, MateriaFaculdade, StatusMateria,
} from '../types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10)
const hoje = () => new Date().toISOString().split('T')[0]

function progresso(atual: number, total: number) {
  return total > 0 ? Math.round((atual / total) * 100) : 0
}

type Tab = 'leitura' | 'conhecimento' | 'metas'

function ProgressBar({ value, color = 'var(--accent)', height = 4 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ height, background: 'var(--border)', borderRadius: height }}>
      <div style={{
        height: '100%', width: `${Math.min(value, 100)}%`,
        background: color, borderRadius: height,
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

function ScoreRingSmall({ value, color, size = 52 }: { value: number; color: string; size?: number }) {
  const cx = size / 2
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 700, color }}>{value}%</span>
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CrescimentoPage() {
  const { t } = useTranslation('crescimento')
  const [tab, setTab] = useState<Tab>('leitura')

  const TABS: { id: Tab; icon: typeof BookOpen; label: string }[] = [
    { id: 'leitura',      icon: BookOpen, label: t('tab_reading') },
    { id: 'conhecimento', icon: Brain,    label: t('tab_knowledge') },
    { id: 'metas',        icon: Target,   label: t('tab_goals') },
  ]

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1 className="page-title">{t('page_title')}</h1>
        <p className="page-subtitle">{t('page_subtitle')}</p>
      </div>

      <div style={{
        display: 'flex', gap: 3, marginBottom: 24,
        padding: 4, width: 'fit-content',
        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10,
      }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 7, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
              background: tab === id ? 'var(--bg-elevated)' : 'transparent',
              color: tab === id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.35)' : 'none',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'leitura' && <TabLeitura />}
      {tab === 'conhecimento' && <TabConhecimento />}
      {tab === 'metas' && <TabMetas />}
    </div>
  )
}

// ─── Tab Leitura ─────────────────────────────────────────────────────────────

function TabLeitura() {
  const { t } = useTranslation('crescimento')
  const STATUS_LIVRO: Record<StatusLivro, { label: string; cor: string }> = {
    'quero-ler': { label: t('status_want_to_read'), cor: '#71717a' },
    'lendo':     { label: t('status_reading'),      cor: '#3b82f6' },
    'lido':      { label: t('status_done'),         cor: '#10b981' },
  }
  const livros = useFlowStore(s => s.livros)
  const metaLivrosPorAno = useFlowStore(s => s.metaLivrosPorAno)
  const adicionarLivro = useFlowStore(s => s.adicionarLivro)
  const atualizarLivro = useFlowStore(s => s.atualizarLivro)
  const removerLivro = useFlowStore(s => s.removerLivro)
  const atualizarMetaLivros = useFlowStore(s => s.atualizarMetaLivros)

  const [filtro, setFiltro] = useState<StatusLivro | 'todos'>('todos')
  const [showAdd, setShowAdd] = useState(false)
  const [editandoPaginas, setEditandoPaginas] = useState<string | null>(null)
  const [novaPagina, setNovaPagina] = useState('')

  // Form novo livro
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [paginas, setPaginas] = useState('')
  const [categoria, setCategoria] = useState('')
  const [status, setStatus] = useState<StatusLivro>('quero-ler')
  const [pdfUrl, setPdfUrl] = useState('')
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const livrosLidos = useMemo(() => livros.filter(l => l.status === 'lido').length, [livros])
  const livroAtual = useMemo(() => livros.find(l => l.status === 'lendo'), [livros])
  const livrosFiltrados = useMemo(() =>
    filtro === 'todos' ? livros : livros.filter(l => l.status === filtro),
  [livros, filtro])

  const metaPct = Math.round((livrosLidos / metaLivrosPorAno) * 100)

  function handleAdd() {
    if (!titulo.trim() || !paginas) return
    adicionarLivro({
      titulo: titulo.trim(),
      autor: autor.trim(),
      paginas: Number(paginas),
      paginaAtual: 0,
      status,
      categoria: categoria.trim() || 'Geral',
      dataInicio: status === 'lendo' ? hoje() : undefined,
      pdfUrl: pdfUrl.trim() || undefined,
    })
    setTitulo(''); setAutor(''); setPaginas(''); setCategoria(''); setStatus('quero-ler'); setPdfUrl('')
    setShowAdd(false)
  }

  function handlePdfFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
  }

  function handleAtualizarPagina(id: string) {
    const p = Number(novaPagina)
    if (isNaN(p)) return
    const livro = livros.find(l => l.id === id)
    if (!livro) return
    const finalizado = p >= livro.paginas
    atualizarLivro(id, {
      paginaAtual: Math.min(p, livro.paginas),
      status: finalizado ? 'lido' : 'lendo',
      dataFim: finalizado ? hoje() : undefined,
    })
    setEditandoPaginas(null)
    setNovaPagina('')
  }

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Meta anual + livro atual */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Meta de Leitura {new Date().getFullYear()}</h3>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                {livrosLidos} <span style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 400 }}>/ {metaLivrosPorAno} livros</span>
              </div>
            </div>
            <ScoreRingSmall value={metaPct} color="#3b82f6" />
          </div>
          <ProgressBar value={metaPct} color="#3b82f6" height={5} />
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Meta:</span>
            <input
              type="number"
              className="input-field"
              value={metaLivrosPorAno}
              onChange={e => atualizarMetaLivros(Number(e.target.value))}
              style={{ width: 64, padding: '4px 8px', fontSize: 13 }}
              min={1} max={100}
            />
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>livros/ano</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Lendo Agora</h3>
          {livroAtual ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, color: 'var(--text-primary)' }}>
                {livroAtual.titulo}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>{livroAtual.autor}</div>
              <ProgressBar
                value={progresso(livroAtual.paginaAtual, livroAtual.paginas)}
                color="#10b981" height={6}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {livroAtual.paginaAtual} / {livroAtual.paginas} páginas
                </span>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                  {progresso(livroAtual.paginaAtual, livroAtual.paginas)}%
                </span>
              </div>
              {editandoPaginas === livroAtual.id ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input-field"
                    type="number"
                    value={novaPagina}
                    onChange={e => setNovaPagina(e.target.value)}
                    placeholder="Página atual"
                    style={{ flex: 1 }}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAtualizarPagina(livroAtual.id)}
                  />
                  <button className="btn-primary" onClick={() => handleAtualizarPagina(livroAtual.id)}>
                    OK
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-ghost"
                    onClick={() => { setEditandoPaginas(livroAtual.id); setNovaPagina(String(livroAtual.paginaAtual)) }}
                    style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '7px 12px' }}
                  >
                    Atualizar página
                  </button>
                  {livroAtual.pdfUrl && (
                    <a
                      href={livroAtual.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                      style={{ gap: 6, fontSize: 12, padding: '7px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                      <FileText size={13} /> PDF
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
              Nenhum livro em leitura. Adicione um ou mude o status de um livro para "Lendo".
            </p>
          )}
        </div>
      </div>

      {/* Biblioteca */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Biblioteca ({livros.length})</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['todos', 'lendo', 'quero-ler', 'lido'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                  background: filtro === f ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                  color: filtro === f ? '#fff' : 'var(--text-tertiary)',
                }}
              >
                {f === 'todos' ? 'Todos' : STATUS_LIVRO[f].label}
              </button>
            ))}
            <button className="btn-primary" onClick={() => setShowAdd(v => !v)} style={{ gap: 6, padding: '6px 12px', fontSize: 12 }}>
              <Plus size={13} /> Adicionar
            </button>
          </div>
        </div>

        {showAdd && (
          <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-accent)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
              <input className="input-field" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título do livro *" autoFocus />
              <input className="input-field" value={autor} onChange={e => setAutor(e.target.value)} placeholder="Autor" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <input className="input-field" type="number" value={paginas} onChange={e => setPaginas(e.target.value)} placeholder="Nº páginas *" />
              <input className="input-field" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Categoria" />
              <select className="input-field" value={status} onChange={e => setStatus(e.target.value as StatusLivro)} style={{ cursor: 'pointer' }}>
                <option value="quero-ler">Quero ler</option>
                <option value="lendo">Lendo</option>
                <option value="lido">Já li</option>
              </select>
            </div>
            {/* PDF */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="input-field"
                value={pdfUrl}
                onChange={e => setPdfUrl(e.target.value)}
                placeholder="Link do PDF (opcional) — Google Drive, Dropbox…"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="btn-ghost"
                style={{ gap: 6, fontSize: 12, padding: '8px 12px', flexShrink: 0 }}
              >
                <FileText size={13} /> Arquivo
              </button>
              <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePdfFile} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn-primary" onClick={handleAdd}>Adicionar livro</button>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {livrosFiltrados.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {livros.length === 0 ? 'Sua biblioteca está vazia. Adicione o primeiro livro!' : 'Nenhum livro nessa categoria.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {livrosFiltrados.map(livro => {
              const s = STATUS_LIVRO[livro.status]
              const pct = progresso(livro.paginaAtual, livro.paginas)
              return (
                <div
                  key={livro.id}
                  style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40, height: 54, borderRadius: 4, flexShrink: 0,
                      background: `linear-gradient(160deg, ${s.cor}25, ${s.cor}08)`,
                      border: `1px solid ${s.cor}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    📖
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {livro.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: livro.status === 'lendo' ? 8 : 0 }}>
                      {livro.autor || 'Autor desconhecido'} · {livro.paginas} pág. · {livro.categoria}
                    </div>
                    {livro.status === 'lendo' && (
                      <>
                        <ProgressBar value={pct} color="#3b82f6" height={3} />
                        <span style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3, display: 'block' }}>
                          {livro.paginaAtual} / {livro.paginas} páginas ({pct}%)
                        </span>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {livro.pdfUrl && (
                      <a
                        href={livro.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir PDF"
                        style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', padding: 4 }}
                      >
                        <FileText size={13} />
                      </a>
                    )}
                    <select
                      value={livro.status}
                      onChange={e => atualizarLivro(livro.id, {
                        status: e.target.value as StatusLivro,
                        dataInicio: e.target.value === 'lendo' && !livro.dataInicio ? hoje() : livro.dataInicio,
                        dataFim: e.target.value === 'lido' ? hoje() : undefined,
                      })}
                      style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: `${s.cor}12`, border: `1px solid ${s.cor}30`,
                        color: s.cor, cursor: 'pointer', outline: 'none',
                      }}
                    >
                      <option value="quero-ler">Quero ler</option>
                      <option value="lendo">Lendo</option>
                      <option value="lido">Lido</option>
                    </select>
                    {livro.status === 'lendo' && (
                      <button
                        onClick={() => { setEditandoPaginas(livro.id); setNovaPagina(String(livro.paginaAtual)) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 4 }}
                        title="Atualizar página"
                      >
                        <ChevronRight size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => removerLivro(livro.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab Conhecimento ─────────────────────────────────────────────────────────

const STATUS_MATERIA_CFG: Record<StatusMateria, { label: string; cor: string }> = {
  cursando:  { label: 'Cursando',  cor: '#3b82f6' },
  aprovado:  { label: 'Aprovado',  cor: '#10b981' },
  reprovado: { label: 'Reprovado', cor: '#ef4444' },
  trancado:  { label: 'Trancado',  cor: '#71717a' },
}

function calcMediaMateria(materia: MateriaFaculdade): number | null {
  if (materia.notas.length === 0) return null
  const temPeso = materia.notas.some(n => n.peso != null)
  if (temPeso) {
    const totalPeso = materia.notas.reduce((s, n) => s + (n.peso ?? 1), 0)
    return totalPeso > 0
      ? materia.notas.reduce((s, n) => s + n.valor * (n.peso ?? 1), 0) / totalPeso
      : null
  }
  return materia.notas.reduce((s, n) => s + n.valor, 0) / materia.notas.length
}

function PainelFaculdade({ cursoId }: { cursoId: string }) {
  const cursos = useFlowStore(s => s.cursos)
  const isPro = useFlowStore(s => s.isPro)
  const adicionarMensagem = useFlowStore(s => s.adicionarMensagem)
  const adicionarSemestre = useFlowStore(s => s.adicionarSemestre)
  const adicionarMateria = useFlowStore(s => s.adicionarMateria)
  const atualizarMateria = useFlowStore(s => s.atualizarMateria)
  const removerMateria = useFlowStore(s => s.removerMateria)
  const adicionarNotaMateria = useFlowStore(s => s.adicionarNotaMateria)
  const removerNotaMateria = useFlowStore(s => s.removerNotaMateria)
  const adicionarTrabalhoMateria = useFlowStore(s => s.adicionarTrabalhoMateria)
  const toggleTrabalhoEntregue = useFlowStore(s => s.toggleTrabalhoEntregue)

  const curso = cursos.find(c => c.id === cursoId)
  const semestres = curso?.semestres ?? []

  const [semAtivoId, setSemAtivoId] = useState<string | null>(semestres.find(s => s.ativo)?.id ?? semestres[0]?.id ?? null)
  const [expandidaId, setExpandidaId] = useState<string | null>(null)

  // Forms
  const [showAddSem, setShowAddSem] = useState(false)
  const [semNumero, setSemNumero] = useState('')
  const [semAno, setSemAno] = useState(String(new Date().getFullYear()))

  const [addMateriaId, setAddMateriaId] = useState<string | null>(null)
  const [mNome, setMNome] = useState('')
  const [mProf, setMProf] = useState('')
  const [mCH, setMCH] = useState('')

  const [addNotaId, setAddNotaId] = useState<string | null>(null)
  const [nNome, setNNome] = useState('')
  const [nValor, setNValor] = useState('')
  const [nPeso, setNPeso] = useState('')

  const [addTrabalhoId, setAddTrabalhoId] = useState<string | null>(null)
  const [tTitulo, setTTitulo] = useState('')
  const [tData, setTData] = useState('')

  const semAtivo = semestres.find(s => s.id === semAtivoId)

  function handleAddSem() {
    if (!semNumero) return
    adicionarSemestre(cursoId, {
      numero: Number(semNumero),
      ano: Number(semAno),
      materias: [],
      ativo: semestres.length === 0,
    })
    setShowAddSem(false); setSemNumero('')
    setTimeout(() => {
      const updated = useFlowStore.getState().cursos.find(c => c.id === cursoId)?.semestres
      if (updated) setSemAtivoId(updated[updated.length - 1].id)
    }, 50)
  }

  function handleAddMateria(semestreId: string) {
    if (!mNome.trim()) return
    adicionarMateria(cursoId, semestreId, {
      nome: mNome.trim(),
      professor: mProf.trim() || undefined,
      cargaHoraria: mCH ? Number(mCH) : undefined,
      notas: [], trabalhos: [], status: 'cursando',
    })
    setMNome(''); setMProf(''); setMCH(''); setAddMateriaId(null)
  }

  function handleAddNota(semestreId: string, materiaId: string) {
    if (!nNome.trim() || !nValor) return
    adicionarNotaMateria(cursoId, semestreId, materiaId, {
      nome: nNome.trim(),
      valor: Math.min(10, Math.max(0, Number(nValor))),
      peso: nPeso ? Number(nPeso) : undefined,
      data: hoje(),
    })
    setNNome(''); setNValor(''); setNPeso(''); setAddNotaId(null)
  }

  function handleAddTrabalho(semestreId: string, materiaId: string) {
    if (!tTitulo.trim()) return
    adicionarTrabalhoMateria(cursoId, semestreId, materiaId, {
      titulo: tTitulo.trim(),
      dataEntrega: tData || hoje(),
      entregue: false,
    })
    setTTitulo(''); setTData(''); setAddTrabalhoId(null)
  }

  function handleInsightIA(sem: SemestreFaculdade) {
    const linhas = sem.materias.map(m => {
      const media = calcMediaMateria(m)
      return `- ${m.nome}: média ${media != null ? media.toFixed(1) : 'sem notas'} (${m.status})`
    }).join('\n')
    const prompt = `Analise meu desempenho acadêmico no ${sem.numero}º semestre de ${sem.ano}:\n${linhas}\n\nDê insights sobre onde estou indo bem, onde preciso melhorar, e sugira um plano de estudos para as matérias em risco.`
    adicionarMensagem('usuario', prompt)
    window.location.href = '/ia'
  }

  return (
    <div>
      {/* Tabs de semestres */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {semestres.map(sem => (
          <button
            key={sem.id}
            onClick={() => setSemAtivoId(sem.id)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
              background: semAtivoId === sem.id ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
              color: semAtivoId === sem.id ? '#fff' : 'var(--text-tertiary)',
            }}
          >
            {sem.numero}º · {sem.ano}
          </button>
        ))}
        <button
          onClick={() => setShowAddSem(v => !v)}
          className="btn-ghost"
          style={{ gap: 5, fontSize: 12, padding: '6px 12px' }}
        >
          <Plus size={12} /> Semestre
        </button>
      </div>

      {showAddSem && (
        <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-accent)', display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Semestre</label>
            <input className="input-field" style={{ width: 80 }} type="number" min={1} max={12} value={semNumero} onChange={e => setSemNumero(e.target.value)} placeholder="1" autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Ano</label>
            <input className="input-field" style={{ width: 90 }} type="number" value={semAno} onChange={e => setSemAno(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={handleAddSem} style={{ padding: '8px 16px' }}>Criar</button>
          <button className="btn-ghost" onClick={() => setShowAddSem(false)} style={{ padding: '8px 12px' }}>✕</button>
        </div>
      )}

      {!semAtivo ? (
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Adicione um semestre para começar a cadastrar matérias.</p>
      ) : (
        <div>
          {/* Header semestre + IA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              {semAtivo.materias.length} matérias · {semAtivo.materias.filter(m => m.status === 'aprovado').length} aprovadas
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {isPro && (
                <button
                  className="btn-ghost"
                  onClick={() => handleInsightIA(semAtivo)}
                  style={{ gap: 6, fontSize: 12, padding: '6px 12px' }}
                >
                  <Sparkles size={13} /> Insight IA
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => setAddMateriaId(addMateriaId === semAtivo.id ? null : semAtivo.id)}
                style={{ gap: 6, fontSize: 12, padding: '6px 12px' }}
              >
                <Plus size={13} /> Matéria
              </button>
            </div>
          </div>

          {addMateriaId === semAtivo.id && (
            <div style={{ marginBottom: 12, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <input className="input-field" style={{ flex: 2, minWidth: 160 }} value={mNome} onChange={e => setMNome(e.target.value)} placeholder="Nome da matéria *" autoFocus />
                <input className="input-field" style={{ flex: 1, minWidth: 120 }} value={mProf} onChange={e => setMProf(e.target.value)} placeholder="Professor (opcional)" />
                <input className="input-field" style={{ width: 90 }} type="number" value={mCH} onChange={e => setMCH(e.target.value)} placeholder="C.H." />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={() => handleAddMateria(semAtivo.id)}>Adicionar</button>
                <button className="btn-ghost" onClick={() => setAddMateriaId(null)}>Cancelar</button>
              </div>
            </div>
          )}

          {semAtivo.materias.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Nenhuma matéria cadastrada neste semestre.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {semAtivo.materias.map(mat => {
                const cfg = STATUS_MATERIA_CFG[mat.status]
                const media = calcMediaMateria(mat)
                const isExp = expandidaId === mat.id
                const trabPendentes = mat.trabalhos.filter(t => !t.entregue).length
                return (
                  <div
                    key={mat.id}
                    style={{
                      borderRadius: 12, background: 'var(--bg-elevated)',
                      border: `1px solid ${media != null && media < 5 ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header matéria */}
                    <div
                      style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                      onClick={() => setExpandidaId(isExp ? null : mat.id)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{mat.nome}</span>
                          {mat.professor && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{mat.professor}</span>}
                          {trabPendentes > 0 && (
                            <span style={{ padding: '1px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                              {trabPendentes} entrega{trabPendentes > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {media != null && (
                            <span style={{ fontSize: 13, fontWeight: 800, color: media >= 7 ? '#10b981' : media >= 5 ? '#f59e0b' : '#ef4444' }}>
                              Média: {media.toFixed(1)}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                            {mat.notas.length} nota{mat.notas.length !== 1 ? 's' : ''} · {mat.trabalhos.length} trabalho{mat.trabalhos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                        <select
                          value={mat.status}
                          onChange={e => atualizarMateria(cursoId, semAtivo.id, mat.id, { status: e.target.value as StatusMateria })}
                          onClick={e => e.stopPropagation()}
                          style={{
                            padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                            background: `${cfg.cor}12`, border: `1px solid ${cfg.cor}30`,
                            color: cfg.cor, cursor: 'pointer', outline: 'none',
                          }}
                        >
                          <option value="cursando">Cursando</option>
                          <option value="aprovado">Aprovado</option>
                          <option value="reprovado">Reprovado</option>
                          <option value="trancado">Trancado</option>
                        </select>
                        <button
                          onClick={e => { e.stopPropagation(); removerMateria(cursoId, semAtivo.id, mat.id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                        >
                          <Trash2 size={12} />
                        </button>
                        {isExp ? <ChevronUp size={14} color="var(--text-dim)" /> : <ChevronDown size={14} color="var(--text-dim)" />}
                      </div>
                    </div>

                    {/* Expandido: notas + trabalhos */}
                    {isExp && (
                      <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 14 }}>

                          {/* Notas */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notas</span>
                              <button
                                onClick={() => setAddNotaId(addNotaId === mat.id ? null : mat.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 2 }}
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            {addNotaId === mat.id && (
                              <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <input className="input-field" style={{ fontSize: 12 }} value={nNome} onChange={e => setNNome(e.target.value)} placeholder="Nome (P1, Prova Final…)" autoFocus />
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <input className="input-field" style={{ flex: 1, fontSize: 12 }} type="number" min={0} max={10} step={0.1} value={nValor} onChange={e => setNValor(e.target.value)} placeholder="Nota (0–10)" />
                                  <input className="input-field" style={{ width: 70, fontSize: 12 }} type="number" min={1} max={100} value={nPeso} onChange={e => setNPeso(e.target.value)} placeholder="Peso%" />
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="btn-primary" onClick={() => handleAddNota(semAtivo.id, mat.id)} style={{ flex: 1, justifyContent: 'center', padding: '6px' }}>Salvar</button>
                                  <button className="btn-ghost" onClick={() => setAddNotaId(null)} style={{ padding: '6px 10px' }}>✕</button>
                                </div>
                              </div>
                            )}
                            {mat.notas.length === 0 ? (
                              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Sem notas ainda.</p>
                            ) : (
                              mat.notas.map(n => (
                                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{n.nome}{n.peso ? ` (${n.peso}%)` : ''}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: n.valor >= 7 ? '#10b981' : n.valor >= 5 ? '#f59e0b' : '#ef4444' }}>
                                      {n.valor.toFixed(1)}
                                    </span>
                                    <button onClick={() => removerNotaMateria(cursoId, semAtivo.id, mat.id, n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2 }}>
                                      <X size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Trabalhos */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Entregas</span>
                              <button
                                onClick={() => setAddTrabalhoId(addTrabalhoId === mat.id ? null : mat.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 2 }}
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            {addTrabalhoId === mat.id && (
                              <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <input className="input-field" style={{ fontSize: 12 }} value={tTitulo} onChange={e => setTTitulo(e.target.value)} placeholder="Título do trabalho *" autoFocus />
                                <input className="input-field" type="date" style={{ fontSize: 12 }} value={tData} onChange={e => setTData(e.target.value)} />
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="btn-primary" onClick={() => handleAddTrabalho(semAtivo.id, mat.id)} style={{ flex: 1, justifyContent: 'center', padding: '6px' }}>Salvar</button>
                                  <button className="btn-ghost" onClick={() => setAddTrabalhoId(null)} style={{ padding: '6px 10px' }}>✕</button>
                                </div>
                              </div>
                            )}
                            {mat.trabalhos.length === 0 ? (
                              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Sem entregas cadastradas.</p>
                            ) : (
                              mat.trabalhos.map(t => (
                                <div
                                  key={t.id}
                                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                  onClick={() => toggleTrabalhoEntregue(cursoId, semAtivo.id, mat.id, t.id)}
                                >
                                  <div style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                    background: t.entregue ? '#10b981' : 'transparent',
                                    border: `2px solid ${t.entregue ? '#10b981' : 'var(--border-strong)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {t.entregue && <Check size={9} color="#fff" strokeWidth={3} />}
                                  </div>
                                  <span style={{ flex: 1, fontSize: 12, color: t.entregue ? 'var(--text-tertiary)' : 'var(--text-secondary)', textDecoration: t.entregue ? 'line-through' : 'none' }}>
                                    {t.titulo}
                                  </span>
                                  <span style={{ fontSize: 10, color: 'var(--text-dim)', flexShrink: 0 }}>
                                    {t.dataEntrega}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TabConhecimento() {
  const cursos = useFlowStore(s => s.cursos)
  const notasAprendizado = useFlowStore(s => s.notasAprendizado)
  const adicionarCurso = useFlowStore(s => s.adicionarCurso)
  const atualizarCurso = useFlowStore(s => s.atualizarCurso)
  const removerCurso = useFlowStore(s => s.removerCurso)
  const adicionarNota = useFlowStore(s => s.adicionarNota)
  const removerNota = useFlowStore(s => s.removerNota)

  const [showAddCurso, setShowAddCurso] = useState(false)
  const [tipoNovo, setTipoNovo] = useState<'curso' | 'faculdade'>('curso')
  const [showAddNota, setShowAddNota] = useState(false)
  const [faculdadeAbertaId, setFaculdadeAbertaId] = useState<string | null>(null)

  const [cTitulo, setCTitulo] = useState('')
  const [cPlataforma, setCPlataforma] = useState('')
  const [cCategoria, setCCategoria] = useState('')
  const [cDataInicio, setCDataInicio] = useState('')
  const [cDataFim, setCDataFim] = useState('')

  const [nTitulo, setNTitulo] = useState('')
  const [nConteudo, setNConteudo] = useState('')
  const [nTags, setNTags] = useState('')

  const STATUS_COR: Record<StatusCurso, string> = {
    ativo: '#3b82f6', pausado: '#f59e0b', concluido: '#10b981',
  }

  function handleAddCurso() {
    if (!cTitulo.trim()) return
    adicionarCurso({
      titulo: cTitulo.trim(),
      plataforma: tipoNovo === 'faculdade' ? cPlataforma.trim() || 'Faculdade' : cPlataforma.trim() || 'Outro',
      categoria: cCategoria.trim() || 'Geral',
      progresso: 0,
      status: 'ativo',
      dataInicio: cDataInicio || hoje(),
      dataFim: cDataFim || undefined,
      tipo: tipoNovo,
      semestres: tipoNovo === 'faculdade' ? [] : undefined,
    })
    setCTitulo(''); setCPlataforma(''); setCCategoria(''); setCDataInicio(''); setCDataFim('')
    setShowAddCurso(false)
  }

  function handleAddNota() {
    if (!nTitulo.trim() || !nConteudo.trim()) return
    adicionarNota({
      titulo: nTitulo.trim(),
      conteudo: nConteudo.trim(),
      tags: nTags ? nTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      data: hoje(),
    })
    setNTitulo(''); setNConteudo(''); setNTags('')
    setShowAddNota(false)
  }

  const faculdades = cursos.filter(c => c.tipo === 'faculdade')
  const cursosList = cursos.filter(c => c.tipo !== 'faculdade')
  const cursosAtivos = cursosList.filter(c => c.status === 'ativo')
  const cursosConc = cursosList.filter(c => c.status === 'concluido')
  const cursosPaus = cursosList.filter(c => c.status === 'pausado')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, maxWidth: 1000 }}>

      {/* Cursos + Faculdades */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Faculdades */}
        {(faculdades.length > 0 || showAddCurso) && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <GraduationCap size={16} color="#8b5cf6" />
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Faculdade</h3>
            </div>
            {faculdades.map(f => (
              <div key={f.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{f.titulo}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                      {f.plataforma}{f.dataInicio ? ` · Início: ${f.dataInicio}` : ''}{f.dataFim ? ` · Término: ${f.dataFim}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      onClick={() => setFaculdadeAbertaId(faculdadeAbertaId === f.id ? null : f.id)}
                      className="btn-ghost"
                      style={{ fontSize: 12, padding: '5px 10px', gap: 5 }}
                    >
                      <GraduationCap size={12} /> {faculdadeAbertaId === f.id ? 'Fechar' : 'Gerenciar'}
                    </button>
                    <button
                      onClick={() => removerCurso(f.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {faculdadeAbertaId === f.id && (
                  <div style={{ marginTop: 10 }}>
                    <PainelFaculdade cursoId={f.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cursos */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Cursos & Formações</h3>
            <button className="btn-primary" onClick={() => setShowAddCurso(v => !v)} style={{ gap: 6, padding: '6px 12px', fontSize: 12 }}>
              <Plus size={13} /> Adicionar
            </button>
          </div>

          {showAddCurso && (
            <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-accent)' }}>
              {/* Tipo */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(['curso', 'faculdade'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTipoNovo(t)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      background: tipoNovo === t ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                      color: tipoNovo === t ? '#fff' : 'var(--text-tertiary)',
                    }}
                  >
                    {t === 'curso' ? '📚 Curso' : '🎓 Faculdade'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input className="input-field" value={cTitulo} onChange={e => setCTitulo(e.target.value)} placeholder={tipoNovo === 'faculdade' ? 'Nome da faculdade / curso *' : 'Título do curso *'} autoFocus />
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="input-field" value={cPlataforma} onChange={e => setCPlataforma(e.target.value)} placeholder={tipoNovo === 'faculdade' ? 'Instituição' : 'Plataforma (Udemy, YouTube…)'} style={{ flex: 1 }} />
                  <input className="input-field" value={cCategoria} onChange={e => setCCategoria(e.target.value)} placeholder="Área / Categoria" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Início</label>
                    <input type="date" className="input-field" value={cDataInicio} onChange={e => setCDataInicio(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Término previsto</label>
                    <input type="date" className="input-field" value={cDataFim} onChange={e => setCDataFim(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={handleAddCurso}>Salvar</button>
                  <button className="btn-ghost" onClick={() => setShowAddCurso(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {cursosList.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Nenhum curso cadastrado. Adicione para acompanhar seu progresso.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cursosList.map(curso => {
                const cor = STATUS_COR[curso.status]
                return (
                  <div key={curso.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{curso.titulo}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                          {curso.plataforma} · {curso.categoria}
                          {curso.dataInicio && ` · ${curso.dataInicio}`}
                          {curso.dataFim && ` → ${curso.dataFim}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginLeft: 10 }}>
                        <select
                          value={curso.status}
                          onChange={e => atualizarCurso(curso.id, { status: e.target.value as StatusCurso })}
                          style={{ padding: '2px 6px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${cor}12`, border: `1px solid ${cor}30`, color: cor, cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="ativo">Ativo</option>
                          <option value="pausado">Pausado</option>
                          <option value="concluido">Concluído</option>
                        </select>
                        <button
                          onClick={() => removerCurso(curso.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2 }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar value={curso.progresso} color={cor} height={4} />
                      </div>
                      <input
                        type="number" min={0} max={100}
                        value={curso.progresso}
                        onChange={e => atualizarCurso(curso.id, { progresso: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        style={{ width: 48, padding: '2px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 6, color: cor, fontSize: 12, fontWeight: 700, textAlign: 'center', outline: 'none' }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {cursosList.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {[
                { label: 'Em andamento', value: cursosAtivos.length, color: '#3b82f6' },
                { label: 'Pausados', value: cursosPaus.length, color: '#f59e0b' },
                { label: 'Concluídos', value: cursosConc.length, color: '#10b981' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notas de aprendizado */}
      <div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Notas & Insights</h3>
            <button onClick={() => setShowAddNota(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
              {showAddNota ? <X size={16} /> : <Plus size={16} />}
            </button>
          </div>

          {showAddNota && (
            <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-accent)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input-field" value={nTitulo} onChange={e => setNTitulo(e.target.value)} placeholder="Título do insight *" autoFocus />
              <textarea
                className="input-field"
                value={nConteudo}
                onChange={e => setNConteudo(e.target.value)}
                placeholder="O que você aprendeu?"
                rows={3}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
              <input className="input-field" value={nTags} onChange={e => setNTags(e.target.value)} placeholder="Tags (ex: produtividade, react)" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={handleAddNota} style={{ flex: 1, justifyContent: 'center', padding: '7px' }}>Salvar</button>
                <button className="btn-ghost" onClick={() => setShowAddNota(false)} style={{ padding: '7px 12px' }}>✕</button>
              </div>
            </div>
          )}

          {notasAprendizado.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Registre insights e aprendizados dos seus cursos e leituras.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notasAprendizado.map(nota => (
                <div key={nota.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{nota.titulo}</div>
                    <button onClick={() => removerNota(nota.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2 }}>
                      <X size={12} />
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{nota.conteudo}</p>
                  {nota.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {nota.tags.map(tag => (
                        <span key={tag} style={{ padding: '2px 7px', borderRadius: 4, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 10, fontWeight: 600 }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab Metas ────────────────────────────────────────────────────────────────

function TabMetas() {
  const { t } = useTranslation('crescimento')
  const HORIZONTE_LABEL: Record<HorizonteMeta, { label: string; cor: string }> = {
    '30d': { label: t('horizon_30d'), cor: '#ef4444' },
    '90d': { label: t('horizon_90d'), cor: '#f59e0b' },
    '1a':  { label: t('horizon_1a'),  cor: '#3b82f6' },
    '5a':  { label: t('horizon_5a'),  cor: '#8b5cf6' },
  }
  const metas = useFlowStore(s => s.metas)
  const adicionarMeta = useFlowStore(s => s.adicionarMeta)
  const atualizarMeta = useFlowStore(s => s.atualizarMeta)
  const removerMeta = useFlowStore(s => s.removerMeta)
  const toggleMarco = useFlowStore(s => s.toggleMarco)

  const [filtroHorizonte, setFiltroHorizonte] = useState<HorizonteMeta | 'todos'>('todos')
  const [expandida, setExpandida] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  // Form
  const [mTitulo, setMTitulo] = useState('')
  const [mDescricao, setMDescricao] = useState('')
  const [mCategoria, setMCategoria] = useState('')
  const [mHorizonte, setMHorizonte] = useState<HorizonteMeta>('90d')
  const [mPrazo, setMPrazo] = useState('')
  const [mMarcos, setMMarcos] = useState<string[]>([''])
  const [showAddMarco, setShowAddMarco] = useState<string | null>(null)
  const [novoMarco, setNovoMarco] = useState('')

  const metasFiltradas = useMemo(() =>
    filtroHorizonte === 'todos' ? metas : metas.filter(m => m.horizonte === filtroHorizonte),
  [metas, filtroHorizonte])

  const metasPorHorizonte = useMemo(() => ({
    '30d': metas.filter(m => m.horizonte === '30d'),
    '90d': metas.filter(m => m.horizonte === '90d'),
    '1a':  metas.filter(m => m.horizonte === '1a'),
    '5a':  metas.filter(m => m.horizonte === '5a'),
  }), [metas])

  function handleAdd() {
    if (!mTitulo.trim()) return
    adicionarMeta({
      titulo: mTitulo.trim(),
      descricao: mDescricao.trim() || undefined,
      categoria: mCategoria.trim() || 'Pessoal',
      horizonte: mHorizonte,
      prazo: mPrazo || undefined,
      progresso: 0,
      status: 'ativa',
      marcos: mMarcos.filter(Boolean).map(t => ({ id: uid(), titulo: t, concluido: false })),
    })
    setMTitulo(''); setMDescricao(''); setMCategoria(''); setMPrazo(''); setMMarcos([''])
    setShowAdd(false)
  }

  function handleAddMarco(metaId: string) {
    if (!novoMarco.trim()) return
    const meta = metas.find(m => m.id === metaId)
    if (!meta) return
    atualizarMeta(metaId, {
      marcos: [...meta.marcos, { id: uid(), titulo: novoMarco.trim(), concluido: false }],
    })
    setNovoMarco('')
    setShowAddMarco(null)
  }

  const STATUS_META: Record<StatusMeta, { label: string; cor: string }> = {
    ativa:    { label: 'Ativa',    cor: '#3b82f6' },
    pausada:  { label: 'Pausada',  cor: '#f59e0b' },
    concluida:{ label: 'Concluída',cor: '#10b981' },
  }

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Overview por horizonte */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {(Object.keys(HORIZONTE_LABEL) as HorizonteMeta[]).map(h => {
          const grupo = metasPorHorizonte[h]
          const concluidas = grupo.filter(m => m.status === 'concluida').length
          const info = HORIZONTE_LABEL[h]
          return (
            <button
              key={h}
              onClick={() => setFiltroHorizonte(filtroHorizonte === h ? 'todos' : h)}
              style={{
                background: filtroHorizonte === h ? `${info.cor}12` : 'var(--bg-surface)',
                border: filtroHorizonte === h ? `1px solid ${info.cor}40` : '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: info.cor, lineHeight: 1, marginBottom: 4 }}>
                {grupo.length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {info.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                {concluidas}/{grupo.length} concluídas
              </div>
            </button>
          )
        })}
      </div>

      {/* Lista de metas */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>
            Suas Metas {filtroHorizonte !== 'todos' ? `— ${HORIZONTE_LABEL[filtroHorizonte].label}` : ''}
            <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 400, marginLeft: 8 }}>
              ({metasFiltradas.length})
            </span>
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {filtroHorizonte !== 'todos' && (
              <button className="btn-ghost" onClick={() => setFiltroHorizonte('todos')} style={{ fontSize: 11, padding: '4px 10px' }}>
                Ver todas
              </button>
            )}
            <button className="btn-primary" onClick={() => setShowAdd(v => !v)} style={{ gap: 6, padding: '6px 12px', fontSize: 12 }}>
              <Plus size={13} /> Nova Meta
            </button>
          </div>
        </div>

        {showAdd && (
          <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-accent)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input-field" value={mTitulo} onChange={e => setMTitulo(e.target.value)} placeholder="Título da meta *" autoFocus />
              <textarea
                className="input-field"
                value={mDescricao}
                onChange={e => setMDescricao(e.target.value)}
                placeholder="Descreva sua meta com clareza e especificidade"
                rows={2}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <input className="input-field" value={mCategoria} onChange={e => setMCategoria(e.target.value)} placeholder="Categoria" />
                <select className="input-field" value={mHorizonte} onChange={e => setMHorizonte(e.target.value as HorizonteMeta)} style={{ cursor: 'pointer' }}>
                  <option value="30d">30 dias</option>
                  <option value="90d">90 dias</option>
                  <option value="1a">1 ano</option>
                  <option value="5a">5 anos</option>
                </select>
                <input type="date" className="input-field" value={mPrazo} onChange={e => setMPrazo(e.target.value)} />
              </div>
              <div>
                <label className="label" style={{ marginBottom: 8 }}>Marcos / Milestones</label>
                {mMarcos.map((marco, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <input
                      className="input-field"
                      value={marco}
                      onChange={e => setMMarcos(prev => prev.map((m, j) => j === i ? e.target.value : m))}
                      placeholder={`Marco ${i + 1}`}
                    />
                    {i === mMarcos.length - 1 && (
                      <button onClick={() => setMMarcos(prev => [...prev, ''])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={handleAdd}>Criar meta</button>
                <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {metasFiltradas.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {metas.length === 0
              ? 'Nenhuma meta criada. Defina seus objetivos com clareza e horizonte de tempo.'
              : 'Nenhuma meta nessa categoria.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {metasFiltradas.map(meta => {
              const h = HORIZONTE_LABEL[meta.horizonte]
              const s = STATUS_META[meta.status]
              const isExp = expandida === meta.id
              const marcosConc = meta.marcos.filter(m => m.concluido).length
              return (
                <div
                  key={meta.id}
                  style={{
                    borderRadius: 12,
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${meta.status === 'ativa' ? `${h.cor}20` : 'var(--border)'}`,
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <div
                    style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                    onClick={() => setExpandida(isExp ? null : meta.id)}
                  >
                    <ScoreRingSmall value={meta.progresso} color={h.cor} size={48} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.titulo}</span>
                        <span style={{ padding: '1px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: `${h.cor}15`, color: h.cor, flexShrink: 0 }}>
                          {h.label}
                        </span>
                        <span style={{ padding: '1px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: `${s.cor}15`, color: s.cor, flexShrink: 0 }}>
                          {s.label}
                        </span>
                      </div>
                      {meta.descricao && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {meta.descricao}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                        {meta.categoria} · {meta.marcos.length > 0 ? `${marcosConc}/${meta.marcos.length} marcos` : 'sem marcos'}
                        {meta.prazo && ` · Prazo: ${meta.prazo}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <select
                        value={meta.status}
                        onChange={e => atualizarMeta(meta.id, { status: e.target.value as StatusMeta })}
                        onClick={e => e.stopPropagation()}
                        style={{
                          padding: '3px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                          background: `${s.cor}12`, border: `1px solid ${s.cor}30`,
                          color: s.cor, cursor: 'pointer', outline: 'none',
                        }}
                      >
                        <option value="ativa">Ativa</option>
                        <option value="pausada">Pausada</option>
                        <option value="concluida">Concluída</option>
                      </select>
                      <button
                        onClick={e => { e.stopPropagation(); removerMeta(meta.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expandido: marcos + progresso manual */}
                  {isExp && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ paddingTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {/* Marcos */}
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                            Marcos
                          </div>
                          {meta.marcos.length === 0 ? (
                            <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Sem marcos definidos.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {meta.marcos.map(marco => (
                                <div
                                  key={marco.id}
                                  onClick={() => toggleMarco(meta.id, marco.id)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    cursor: 'pointer', padding: '6px 0',
                                  }}
                                >
                                  <div style={{
                                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                                    background: marco.concluido ? h.cor : 'transparent',
                                    border: `2px solid ${marco.concluido ? h.cor : 'var(--border-strong)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s',
                                  }}>
                                    {marco.concluido && <Check size={10} color="#fff" strokeWidth={3} />}
                                  </div>
                                  <span style={{
                                    fontSize: 13,
                                    color: marco.concluido ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                    textDecoration: marco.concluido ? 'line-through' : 'none',
                                  }}>
                                    {marco.titulo}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {showAddMarco === meta.id ? (
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <input
                                className="input-field"
                                value={novoMarco}
                                onChange={e => setNovoMarco(e.target.value)}
                                placeholder="Novo marco"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleAddMarco(meta.id)}
                                style={{ flex: 1 }}
                              />
                              <button className="btn-primary" onClick={() => handleAddMarco(meta.id)} style={{ padding: '6px 12px' }}>+</button>
                              <button className="btn-ghost" onClick={() => setShowAddMarco(null)} style={{ padding: '6px 10px' }}>✕</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowAddMarco(meta.id)}
                              style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                            >
                              <Plus size={13} /> Adicionar marco
                            </button>
                          )}
                        </div>

                        {/* Progresso manual */}
                        <div style={{ minWidth: 180 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                            Progresso manual
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                              type="range"
                              min={0} max={100}
                              value={meta.progresso}
                              onChange={e => atualizarMeta(meta.id, { progresso: Number(e.target.value) })}
                              style={{ flex: 1, accentColor: h.cor }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 700, color: h.cor, minWidth: 36 }}>{meta.progresso}%</span>
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <ProgressBar value={meta.progresso} color={h.cor} height={6} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
