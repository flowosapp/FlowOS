import { useState, type FormEvent } from 'react'
import { useFlowStore } from '../store'
import { useTranslation } from 'react-i18next'
import type { KanbanColumn, Priority, Tarefa } from '../types'
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

const PRIORIDADES: Priority[] = ['alta', 'media', 'baixa']
const CORES_P: Record<Priority, string> = { alta: '#ef4444', media: '#f59e0b', baixa: '#3b82f6' }
const BG_P: Record<Priority, string> = { alta: 'rgba(239,68,68,0.1)', media: 'rgba(245,158,11,0.1)', baixa: 'rgba(59,130,246,0.1)' }

const PROXIMA: Record<KanbanColumn, KanbanColumn | null> = { 'a-fazer': 'em-progresso', 'em-progresso': 'concluido', 'concluido': null }
const ANTERIOR: Record<KanbanColumn, KanbanColumn | null> = { 'a-fazer': null, 'em-progresso': 'a-fazer', 'concluido': 'em-progresso' }

export default function ProjectsPage() {
  const { t } = useTranslation('projects')

  const COLUNAS: { key: KanbanColumn; label: string; cor: string }[] = [
    { key: 'a-fazer',      label: t('col_todo'),        cor: '#71717a' },
    { key: 'em-progresso', label: t('col_in_progress'), cor: '#3b82f6' },
    { key: 'concluido',    label: t('col_done'),        cor: '#10b981' },
  ]

  const LABELS_P: Record<Priority, string> = {
    alta:  t('prio_high'),
    media: t('prio_medium'),
    baixa: t('prio_low'),
  }

  const tarefas = useFlowStore(s => s.tarefas)
  const projetos = useFlowStore(s => s.projetos)
  const adicionarTarefa = useFlowStore(s => s.adicionarTarefa)
  const removerTarefa = useFlowStore(s => s.removerTarefa)
  const moverTarefa = useFlowStore(s => s.moverTarefa)
  const adicionarProjeto = useFlowStore(s => s.adicionarProjeto)

  const [inputColuna, setInputColuna] = useState<Partial<Record<KanbanColumn, string>>>({})
  const [prioColuna, setPrioColuna] = useState<Partial<Record<KanbanColumn, Priority>>>({})
  const [showNovoProjeto, setShowNovoProjeto] = useState(false)
  const [nomeProjeto, setNomeProjeto] = useState('')
  const [projetoSelecionado, setProjetoSelecionado] = useState<string | 'todos'>('todos')

  const tarefasFiltradas = projetoSelecionado === 'todos' ? tarefas : tarefas.filter(t => t.projetoId === projetoSelecionado)

  function handleAdicionarTarefa(col: KanbanColumn) {
    const titulo = (inputColuna[col] ?? '').trim()
    if (!titulo) return
    const prioridade = prioColuna[col] ?? 'media'
    const projetoId = projetoSelecionado !== 'todos' ? projetoSelecionado : projetos[0]?.id
    adicionarTarefa(titulo, prioridade, col, projetoId)
    setInputColuna(prev => ({ ...prev, [col]: '' }))
  }

  function handleAdicionarProjeto(e: FormEvent) {
    e.preventDefault()
    if (!nomeProjeto.trim()) return
    adicionarProjeto(nomeProjeto.trim(), '#3b82f6')
    setNomeProjeto('')
    setShowNovoProjeto(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h1 className="page-title">{t('page_title')}</h1>
            <p className="page-subtitle">
              {t(tarefas.length === 1 ? 'subtitle_one' : 'subtitle_other', { tasks: tarefas.length, projects: projetos.length })}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowNovoProjeto(true)} style={{ gap: 6 }}>
            <Plus size={15} />
            {t('new_project')}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <TabProjeto label={t('all')} count={tarefas.length} ativo={projetoSelecionado === 'todos'} onClick={() => setProjetoSelecionado('todos')} cor="#71717a" />
          {projetos.map(p => (
            <TabProjeto key={p.id} label={p.nome} count={tarefas.filter(tk => tk.projetoId === p.id).length} ativo={projetoSelecionado === p.id} onClick={() => setProjetoSelecionado(p.id)} cor={p.cor} />
          ))}
        </div>
      </div>

      {showNovoProjeto && (
        <div style={{ padding: '12px 32px', borderBottom: '1px solid var(--border)', background: 'rgba(59,130,246,0.04)', flexShrink: 0 }}>
          <form onSubmit={handleAdicionarProjeto} style={{ display: 'flex', gap: 8, maxWidth: 420 }}>
            <input className="input-field" placeholder={t('project_placeholder')} value={nomeProjeto} onChange={e => setNomeProjeto(e.target.value)} autoFocus style={{ flex: 1 }} />
            <button type="submit" className="btn-primary" disabled={!nomeProjeto.trim()} style={{ opacity: nomeProjeto.trim() ? 1 : 0.4 }}>{t('create')}</button>
            <button type="button" className="btn-ghost" onClick={() => setShowNovoProjeto(false)}>{t('cancel', { ns: 'common' })}</button>
          </form>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
        {COLUNAS.map(col => {
          const tarefasCol = tarefasFiltradas.filter(tk => tk.coluna === col.key)
          return (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.cor, boxShadow: `0 0 6px ${col.cor}80` }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.label}</span>
                </div>
                <span style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>{tarefasCol.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tarefasCol.map(tarefa => (
                  <CartaoTarefa key={tarefa.id} tarefa={tarefa} labelsP={LABELS_P}
                    onRemover={() => removerTarefa(tarefa.id)}
                    onMoverProxima={PROXIMA[col.key] ? () => moverTarefa(tarefa.id, PROXIMA[col.key]!) : undefined}
                    onMoverAnterior={ANTERIOR[col.key] ? () => moverTarefa(tarefa.id, ANTERIOR[col.key]!) : undefined}
                    concluido={col.key === 'concluido'}
                    titleBack={t('move_back')}
                    titleForward={t('move_forward')}
                    titleRemove={t('remove')}
                  />
                ))}

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                  <input className="input-field"
                    placeholder={t('add_task')}
                    value={inputColuna[col.key] ?? ''}
                    onChange={e => setInputColuna(prev => ({ ...prev, [col.key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAdicionarTarefa(col.key)}
                    style={{ background: 'transparent', border: 'none', padding: '4px 0', fontSize: 13 }}
                  />
                  {(inputColuna[col.key] ?? '').length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {PRIORIDADES.map(p => (
                        <button key={p} type="button" onClick={() => setPrioColuna(prev => ({ ...prev, [col.key]: p }))}
                          style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: (prioColuna[col.key] ?? 'media') === p ? BG_P[p] : 'transparent', border: `1px solid ${(prioColuna[col.key] ?? 'media') === p ? CORES_P[p] + '80' : 'var(--border)'}`, color: CORES_P[p], textTransform: 'capitalize' }}>
                          {LABELS_P[p]}
                        </button>
                      ))}
                      <button type="button" className="btn-primary" onClick={() => handleAdicionarTarefa(col.key)} style={{ marginLeft: 'auto', padding: '3px 10px', fontSize: 12 }}>{t('add')}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CartaoTarefa({ tarefa, onRemover, onMoverProxima, onMoverAnterior, concluido, labelsP, titleBack, titleForward, titleRemove }: {
  tarefa: Tarefa
  onRemover: () => void
  onMoverProxima?: () => void
  onMoverAnterior?: () => void
  concluido: boolean
  labelsP: Record<Priority, string>
  titleBack: string
  titleForward: string
  titleRemove: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: 'var(--bg-surface)', border: `1px solid ${concluido ? 'rgba(16,185,129,0.15)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px', transition: 'all 0.15s', opacity: concluido ? 0.7 : 1, boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.3)' : 'none', transform: hovered ? 'translateY(-1px)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ marginTop: 2, flexShrink: 0 }}>
          {concluido ? <CheckCircle2 size={15} color="#10b981" /> : <div style={{ width: 15, height: 15, borderRadius: '50%', border: '1.5px solid var(--border-strong)' }} />}
        </div>
        <span style={{ flex: 1, fontSize: 13, color: concluido ? 'var(--text-tertiary)' : 'var(--text-primary)', lineHeight: 1.4, textDecoration: concluido ? 'line-through' : 'none' }}>
          {tarefa.titulo}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ padding: '2px 7px', background: BG_P[tarefa.prioridade], color: CORES_P[tarefa.prioridade] as string, borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {labelsP[tarefa.prioridade]}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {onMoverAnterior && (
            <BtnAcao onClick={onMoverAnterior} title={titleBack} hoverColor="var(--text-primary)"><ArrowLeft size={13} /></BtnAcao>
          )}
          {onMoverProxima && (
            <BtnAcao onClick={onMoverProxima} title={titleForward} hoverColor="var(--accent)"><ArrowRight size={13} /></BtnAcao>
          )}
          <BtnAcao onClick={onRemover} title={titleRemove} hoverColor="var(--danger)"><Trash2 size={13} /></BtnAcao>
        </div>
      </div>
    </div>
  )
}

function BtnAcao({ onClick, title, hoverColor, children }: { onClick: () => void; title: string; hoverColor: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, borderRadius: 5, transition: 'color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.color = hoverColor)}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
      {children}
    </button>
  )
}

function TabProjeto({ label, count, ativo, onClick, cor }: { label: string; count: number; ativo: boolean; onClick: () => void; cor: string }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: ativo ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${ativo ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`, borderRadius: 20, cursor: 'pointer', fontSize: 13, color: ativo ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: ativo ? 600 : 400, transition: 'all 0.15s' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: cor }} />
      {label}
      <span style={{ background: ativo ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>{count}</span>
    </button>
  )
}
