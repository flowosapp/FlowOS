import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useFlowStore } from '../store'
import { useToast } from '../contexts/ToastContext'
import type {
  Transacao, TipoTransacao, StatusPagamento, TipoPagamento,
  Anexo, CategoriaFinanceira, ContaBancaria, Tag as TagType,
} from '../types'
import {
  TrendingUp, TrendingDown, Wallet, Bell, Plus, Trash2, X,
  Edit2, Crown, Lock, Check, ChevronDown, ChevronRight,
  Paperclip, Building2, Tag, AlertCircle, FileText,
  Image as ImageIcon,
} from 'lucide-react'

const hojeStr = () => new Date().toISOString().split('T')[0]

function fmtMoeda(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function fmtData(s: string) {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

const TIPO_PAG_OPTS: { value: TipoPagamento; label: string }[] = [
  { value: 'unico', label: 'Único' },
  { value: 'recorrente', label: 'Recorrente' },
  { value: 'parcelado', label: 'Parcelado' },
  { value: 'fixo-mensal', label: 'Fixo Mensal' },
]

const STATUS_LABEL: Record<StatusPagamento, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  vencido: 'Vencido',
}

const STATUS_COR: Record<StatusPagamento, string> = {
  pago: '#10b981',
  pendente: '#f59e0b',
  vencido: '#ef4444',
}

const CORES_PADRAO = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
]

function corFiltroStatus(v: 'todos' | StatusPagamento, ativo: boolean) {
  if (v === 'todos') {
    return {
      bg: ativo ? 'rgba(59,130,246,0.1)' : 'transparent',
      border: ativo ? 'rgba(59,130,246,0.4)' : 'var(--border)',
      color: ativo ? 'var(--accent)' : 'var(--text-secondary)',
    }
  }
  const cor = STATUS_COR[v]
  return {
    bg: ativo ? `${cor}18` : 'transparent',
    border: ativo ? `${cor}50` : 'var(--border)',
    color: ativo ? cor : 'var(--text-secondary)',
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const { t } = useTranslation(['finance', 'common'])
  const transacoes = useFlowStore(s => s.transacoes)
  const categorias = useFlowStore(s => s.categorias)
  const contas = useFlowStore(s => s.contas)
  const tags = useFlowStore(s => s.tags)
  const isPro = useFlowStore(s => s.isPro)
  const alternarStatus = useFlowStore(s => s.alternarStatusTransacao)
  const removerTransacao = useFlowStore(s => s.removerTransacao)
  const upgradePro = useFlowStore(s => s.upgradePro)

  const [abaAtiva, setAbaAtiva] = useState<'transacoes' | 'categorias' | 'carteira' | 'tags'>('transacoes')
  const [filterTipo, setFilterTipo] = useState<'todos' | TipoTransacao>('todos')
  const [filterStatus, setFilterStatus] = useState<'todos' | StatusPagamento>('todos')
  const [filterCatId, setFilterCatId] = useState('todas')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Transacao | null>(null)

  // Notificações de vencimento (1 dia antes)
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission === 'denied') return
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    const amanhaStr = amanha.toISOString().split('T')[0]
    const vencendo = transacoes.filter(t => t.dataVencimento === amanhaStr && t.status !== 'pago')
    if (!vencendo.length) return
    const notificar = () => {
      vencendo.forEach(t => {
        try { new Notification('FlowOS — Vencimento Amanhã', { body: `${t.descricao}: ${fmtMoeda(t.valor)}`, icon: '/vite.svg' }) } catch { /* noop */ }
      })
    }
    if (Notification.permission === 'granted') notificar()
    else Notification.requestPermission().then(p => { if (p === 'granted') notificar() })
  }, []) // mount only — intentional

  // Resumo do mês corrente
  const mesAtual = new Date().toISOString().slice(0, 7)
  const transacoesMes = transacoes.filter(t => t.dataLancamento.startsWith(mesAtual))
  const totalReceitas = transacoesMes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0)
  const totalGastos = transacoesMes.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0)
  const saldoLiquido = totalReceitas - totalGastos

  const h = hojeStr()
  const em7 = new Date(); em7.setDate(em7.getDate() + 7)
  const em7Str = em7.toISOString().split('T')[0]
  const vencendoBreve = transacoes.filter(t => t.status !== 'pago' && t.dataVencimento >= h && t.dataVencimento <= em7Str)

  const transacoesFiltradas = transacoes
    .filter(t => {
      if (filterTipo !== 'todos' && t.tipo !== filterTipo) return false
      if (filterStatus !== 'todos' && t.status !== filterStatus) return false
      if (filterCatId !== 'todas' && t.categoriaId !== filterCatId) return false
      return true
    })
    .sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento))

  function abrirNova() { setEditando(null); setShowModal(true) }
  function abrirEditar(t: Transacao) { setEditando(t); setShowModal(true) }

  const ABAS = [
    { key: 'transacoes' as const, label: t('tab_transactions'), pro: false },
    { key: 'categorias' as const, label: t('tab_categories'), pro: false },
    { key: 'carteira' as const, label: t('tab_wallet'), pro: false },
    { key: 'tags' as const, label: t('tab_tags'), pro: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 className="page-title">{t('title')}</h1>
            <p className="page-subtitle">{t('summary', { count: transacoes.length, balance: fmtMoeda(saldoLiquido) })}</p>
          </div>
          <button className="btn-primary" onClick={abrirNova} style={{ gap: 6 }}>
            <Plus size={15} />
            {t('new_transaction')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <CardResumo label={t('income_month')} valor={fmtMoeda(totalReceitas)} cor="#10b981"
            icon={<TrendingUp size={16} color="#10b981" />}
            sub={`${transacoesMes.filter(t => t.tipo === 'receita').length}`} />
          <CardResumo label={t('expenses_month')} valor={fmtMoeda(totalGastos)} cor="#ef4444"
            icon={<TrendingDown size={16} color="#ef4444" />}
            sub={`${transacoesMes.filter(t => t.tipo === 'gasto').length}`} />
          <CardResumo label={t('net_balance')} valor={fmtMoeda(saldoLiquido)} cor={saldoLiquido >= 0 ? '#3b82f6' : '#ef4444'}
            icon={<Wallet size={16} color={saldoLiquido >= 0 ? '#3b82f6' : '#ef4444'} />}
            sub={saldoLiquido >= 0 ? '✓' : '!'} />
          <CardResumo label={t('due_7_days')} valor={String(vencendoBreve.length)}
            cor={vencendoBreve.length > 0 ? '#f59e0b' : '#71717a'}
            icon={<Bell size={16} color={vencendoBreve.length > 0 ? '#f59e0b' : '#71717a'} />}
            sub={vencendoBreve.length > 0 ? fmtMoeda(vencendoBreve.reduce((s, t) => s + t.valor, 0)) : ''} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, paddingLeft: 32 }}>
        {ABAS.map(aba => (
          <button key={aba.key} onClick={() => setAbaAtiva(aba.key)}
            style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${abaAtiva === aba.key ? 'var(--accent)' : 'transparent'}`, marginBottom: -1, cursor: 'pointer', fontSize: 13, fontWeight: abaAtiva === aba.key ? 600 : 400, color: abaAtiva === aba.key ? 'var(--accent)' : 'var(--text-secondary)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}>
            {aba.label}
            {aba.pro && !isPro && <Crown size={11} color="#f59e0b" />}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>
        {abaAtiva === 'transacoes' && (
          <AbaTransacoes
            transacoesFiltradas={transacoesFiltradas}
            categorias={categorias}
            filterTipo={filterTipo} setFilterTipo={setFilterTipo}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            filterCatId={filterCatId} setFilterCatId={setFilterCatId}
            onToggleStatus={alternarStatus}
            onRemover={removerTransacao}
            onEditar={abrirEditar}
          />
        )}
        {abaAtiva === 'categorias' && <AbaCategorias />}
        {abaAtiva === 'carteira' && <AbaCarteira isPro={isPro} contas={contas} onUpgrade={upgradePro} />}
        {abaAtiva === 'tags' && <AbaTags isPro={isPro} tags={tags} onUpgrade={upgradePro} />}
      </div>

      {showModal && (
        <ModalTransacao
          transacao={editando}
          categorias={categorias}
          contas={contas}
          tags={tags}
          isPro={isPro}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

// ─── AbaTransacoes ────────────────────────────────────────────────────────────

interface AbaTransacoesProps {
  transacoesFiltradas: Transacao[]
  categorias: CategoriaFinanceira[]
  filterTipo: 'todos' | TipoTransacao
  setFilterTipo: (v: 'todos' | TipoTransacao) => void
  filterStatus: 'todos' | StatusPagamento
  setFilterStatus: (v: 'todos' | StatusPagamento) => void
  filterCatId: string
  setFilterCatId: (v: string) => void
  onToggleStatus: (id: string) => void
  onRemover: (id: string) => void
  onEditar: (t: Transacao) => void
}

function AbaTransacoes({ transacoesFiltradas, categorias, filterTipo, setFilterTipo, filterStatus, setFilterStatus, filterCatId, setFilterCatId, onToggleStatus, onRemover, onEditar }: AbaTransacoesProps) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Filtro tipo */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['todos', 'receita', 'gasto'] as const).map(v => {
            const ativo = filterTipo === v
            return (
              <button key={v} onClick={() => setFilterTipo(v)}
                style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${ativo ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`, background: ativo ? 'rgba(59,130,246,0.1)' : 'transparent', color: ativo ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 12, fontWeight: ativo ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                {v === 'todos' ? t('filter_all') : v === 'receita' ? t('filter_income') : t('filter_expenses')}
              </button>
            )
          })}
        </div>

        {/* Filtro status */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['todos', 'pendente', 'pago', 'vencido'] as const).map(v => {
            const ativo = filterStatus === v
            const estilo = corFiltroStatus(v, ativo)
            return (
              <button key={v} onClick={() => setFilterStatus(v)}
                style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${estilo.border}`, background: estilo.bg, color: estilo.color, fontSize: 12, fontWeight: ativo ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                {v === 'todos' ? 'Todos status' : STATUS_LABEL[v as StatusPagamento]}
              </button>
            )
          })}
        </div>

        {/* Filtro categoria */}
        <select value={filterCatId} onChange={e => setFilterCatId(e.target.value)}
          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
          <option value="todas">Todas categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id} style={{ background: '#161616' }}>{c.nome}</option>)}
        </select>
      </div>

      {transacoesFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)', fontSize: 14 }}>
          Nenhuma transação encontrada.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {transacoesFiltradas.map(t => {
            const cat = categorias.find(c => c.id === t.categoriaId)
            return (
              <LinhaTransacao key={t.id} transacao={t} categoria={cat}
                onToggleStatus={() => onToggleStatus(t.id)}
                onRemover={() => onRemover(t.id)}
                onEditar={() => onEditar(t)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── LinhaTransacao ───────────────────────────────────────────────────────────

function LinhaTransacao({ transacao: t, categoria, onToggleStatus, onRemover, onEditar }: {
  transacao: Transacao
  categoria: CategoriaFinanceira | undefined
  onToggleStatus: () => void
  onRemover: () => void
  onEditar: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const h = hojeStr()
  const vencido = t.status !== 'pago' && t.dataVencimento < h
  const statusDisplay: StatusPagamento = vencido ? 'vencido' : t.status
  const cor = STATUS_COR[statusDisplay]

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 14px', background: hovered ? 'rgba(255,255,255,0.025)' : 'var(--bg-surface)', border: `1px solid ${statusDisplay === 'vencido' ? 'rgba(239,68,68,0.2)' : statusDisplay === 'pago' ? 'rgba(16,185,129,0.1)' : 'var(--border)'}`, borderRadius: 10, transition: 'all 0.15s' }}>
      {/* Ícone tipo */}
      <div style={{ width: 32, height: 32, borderRadius: 8, background: t.tipo === 'receita' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {t.tipo === 'receita' ? <TrendingUp size={15} color="#10b981" /> : <TrendingDown size={15} color="#ef4444" />}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descricao}</span>
          {t.parcelaAtual != null && t.parcelas != null && (
            <span style={{ fontSize: 10, padding: '1px 5px', background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', borderRadius: 4, fontWeight: 700, flexShrink: 0 }}>
              {t.parcelaAtual}/{t.parcelas}
            </span>
          )}
          {t.anexos && t.anexos.length > 0 && <Paperclip size={11} color="var(--text-dim)" />}
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          {categoria && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: categoria.cor, display: 'inline-block' }} />
              {categoria.nome}
            </span>
          )}
          <span>Venc. {fmtData(t.dataVencimento)}</span>
          {t.dataEfetivacao && <span>· Efet. {fmtData(t.dataEfetivacao)}</span>}
        </div>
      </div>

      {/* Direita: valor + status + ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: t.tipo === 'receita' ? '#10b981' : '#ef4444' }}>
          {t.tipo === 'receita' ? '+' : '-'}{fmtMoeda(t.valor)}
        </span>

        <button onClick={onToggleStatus} title={t.status === 'pago' ? 'Marcar como pendente' : 'Marcar como pago'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, border: `1px solid ${cor}40`, background: `${cor}12`, color: cor, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
          {statusDisplay === 'pago' ? <Check size={11} /> : <AlertCircle size={11} />}
          {STATUS_LABEL[statusDisplay]}
        </button>

        <div style={{ display: 'flex', gap: 2, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
          <BtnIcone onClick={onEditar} title="Editar" hoverColor="var(--text-primary)"><Edit2 size={13} /></BtnIcone>
          <BtnIcone onClick={onRemover} title="Remover" hoverColor="var(--danger)"><Trash2 size={13} /></BtnIcone>
        </div>
      </div>
    </div>
  )
}

// ─── ModalTransacao ───────────────────────────────────────────────────────────

function ModalTransacao({ transacao, categorias, contas, tags, isPro, onClose }: {
  transacao: Transacao | null
  categorias: CategoriaFinanceira[]
  contas: ContaBancaria[]
  tags: TagType[]
  isPro: boolean
  onClose: () => void
}) {
  const adicionarTransacao = useFlowStore(s => s.adicionarTransacao)
  const atualizarTransacao = useFlowStore(s => s.atualizarTransacao)
  const toast = useToast()

  const [tipo, setTipo] = useState<TipoTransacao>(transacao?.tipo ?? 'gasto')
  const [descricao, setDescricao] = useState(transacao?.descricao ?? '')
  const [valor, setValor] = useState(transacao ? String(transacao.valor) : '')
  const [categoriaId, setCategoriaId] = useState(transacao?.categoriaId ?? '')
  const [subcategoriaId, setSubcategoriaId] = useState(transacao?.subcategoriaId ?? '')
  const [tipoPag, setTipoPag] = useState<TipoPagamento>(transacao?.tipoPagamento ?? 'unico')
  const [parcelas, setParcelas] = useState(transacao?.parcelas ? String(transacao.parcelas) : '2')
  const [dataLancamento, setDataLancamento] = useState(transacao?.dataLancamento ?? hojeStr())
  const [dataVencimento, setDataVencimento] = useState(transacao?.dataVencimento ?? hojeStr())
  const [dataEfetivacao, setDataEfetivacao] = useState(transacao?.dataEfetivacao ?? '')
  const [status, setStatus] = useState<StatusPagamento>(transacao?.status ?? 'pendente')
  const [observacoes, setObservacoes] = useState(transacao?.observacoes ?? '')
  const [anexos, setAnexos] = useState<Anexo[]>(transacao?.anexos ?? [])
  const [contaId, setContaId] = useState(transacao?.contaId ?? '')
  const [tagIds, setTagIds] = useState<string[]>(transacao?.tagIds ?? [])

  const catsFiltradas = categorias.filter(c => c.tipo === tipo || c.tipo === 'ambos')
  const catSelecionada = categorias.find(c => c.id === categoriaId)
  const podeSubmeter = descricao.trim() && parseFloat(valor) > 0 && categoriaId && dataVencimento

  function handleAnexo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) {
      alert('Arquivo muito grande. Máximo: 1MB.')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setAnexos(prev => [...prev, { nome: file.name, tipo: file.type, dataUrl, tamanho: file.size }])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function toggleTag(id: string) {
    setTagIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const n = parseFloat(valor)
    if (!n || !descricao.trim() || !categoriaId || !dataVencimento) return

    const dados: Omit<Transacao, 'id'> = {
      tipo,
      valor: n,
      categoriaId,
      subcategoriaId: subcategoriaId || undefined,
      descricao: descricao.trim(),
      observacoes: observacoes.trim() || undefined,
      dataLancamento,
      dataVencimento,
      dataEfetivacao: dataEfetivacao || undefined,
      status,
      tipoPagamento: tipoPag,
      parcelas: tipoPag === 'parcelado' ? parseInt(parcelas) || 2 : undefined,
      contaId: contaId || undefined,
      tagIds,
      anexos,
    }

    if (transacao) {
      atualizarTransacao(transacao.id, dados)
      toast.success('Transação atualizada!', '💳')
    } else {
      adicionarTransacao(dados)
      toast.success(`${dados.tipo === 'receita' ? 'Receita' : 'Gasto'} registrado!`, dados.tipo === 'receita' ? '💰' : '💸')
    }
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ padding: '22px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>{transacao ? t('modal_edit') : t('modal_new')}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 6 }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
          {/* Tipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
            {(['receita', 'gasto'] as TipoTransacao[]).map(t => (
              <button key={t} type="button" onClick={() => { setTipo(t); setCategoriaId(''); setSubcategoriaId('') }}
                style={{ padding: '10px', background: tipo === t ? (t === 'receita' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : 'rgba(255,255,255,0.04)', border: `1px solid ${tipo === t ? (t === 'receita' ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)') : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: tipo === t ? (t === 'receita' ? '#10b981' : '#ef4444') : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}>
                {t === 'receita' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {t === 'receita' ? 'Receita' : 'Gasto'}
              </button>
            ))}
          </div>

          {/* Descrição + Valor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 10, marginBottom: 14 }}>
            <div>
              <label className="label">Descrição</label>
              <input className="input-field" placeholder="ex: Aluguel maio/2026" value={descricao} onChange={e => setDescricao(e.target.value)} autoFocus required />
            </div>
            <div>
              <label className="label">Valor (R$)</label>
              <input className="input-field" type="number" placeholder="0,00" min="0.01" step="0.01" value={valor} onChange={e => setValor(e.target.value)} required />
            </div>
          </div>

          {/* Categoria + Subcategoria */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label className="label">Categoria *</label>
              <select className="input-field" value={categoriaId} onChange={e => { setCategoriaId(e.target.value); setSubcategoriaId('') }} required style={{ cursor: 'pointer' }}>
                <option value="">Selecione...</option>
                {catsFiltradas.map(c => <option key={c.id} value={c.id} style={{ background: '#161616' }}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subcategoria</label>
              <select className="input-field" value={subcategoriaId} onChange={e => setSubcategoriaId(e.target.value)} style={{ cursor: 'pointer' }} disabled={!catSelecionada || catSelecionada.subcategorias.length === 0}>
                <option value="">Nenhuma</option>
                {(catSelecionada?.subcategorias ?? []).map(s => <option key={s.id} value={s.id} style={{ background: '#161616' }}>{s.nome}</option>)}
              </select>
            </div>
          </div>

          {/* Tipo de pagamento */}
          <div style={{ marginBottom: 14 }}>
            <label className="label">Tipo de Pagamento</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {TIPO_PAG_OPTS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setTipoPag(opt.value)}
                  style={{ padding: '7px 4px', background: tipoPag === opt.value ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${tipoPag === opt.value ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: tipoPag === opt.value ? 600 : 400, color: tipoPag === opt.value ? 'var(--accent)' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {tipoPag === 'parcelado' && (
            <div style={{ marginBottom: 14 }}>
              <label className="label">Número de Parcelas</label>
              <input className="input-field" type="number" min="2" max="60" value={parcelas} onChange={e => setParcelas(e.target.value)} />
            </div>
          )}

          {/* Datas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label className="label">Data do Lançamento</label>
              <input className="input-field" type="date" value={dataLancamento} onChange={e => setDataLancamento(e.target.value)} />
            </div>
            <div>
              <label className="label">Data de Vencimento *</label>
              <input className="input-field" type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} required />
            </div>
            <div>
              <label className="label">Data da Efetivação</label>
              <input className="input-field" type="date" value={dataEfetivacao} onChange={e => setDataEfetivacao(e.target.value)} />
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 14 }}>
            <label className="label">Status</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['pendente', 'pago'] as StatusPagamento[]).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  style={{ flex: 1, padding: '8px', background: status === s ? `${STATUS_COR[s]}15` : 'rgba(255,255,255,0.04)', border: `1px solid ${status === s ? `${STATUS_COR[s]}50` : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: status === s ? 600 : 400, color: status === s ? STATUS_COR[s] : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}>
                  {s === 'pago' ? <Check size={13} /> : <AlertCircle size={13} />}
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div style={{ marginBottom: 14 }}>
            <label className="label">Observações</label>
            <textarea className="input-field" placeholder="Anotações livres sobre esta transação..." value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} style={{ resize: 'vertical', minHeight: 56 }} />
          </div>

          {/* Anexos */}
          <div style={{ marginBottom: 16 }}>
            <label className="label">Anexos (máx. 1MB por arquivo)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {anexos.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, fontSize: 11 }}>
                  {a.tipo.startsWith('image') ? <ImageIcon size={12} color="var(--accent)" /> : <FileText size={12} color="var(--accent)" />}
                  <span style={{ color: 'var(--text-secondary)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</span>
                  <button type="button" onClick={() => setAnexos(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0, lineHeight: 1 }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                <Paperclip size={13} />
                Adicionar
                <input type="file" accept="image/*,.pdf" onChange={handleAnexo} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Conta bancária */}
          <div style={{ marginBottom: 14 }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Conta Bancária
              {!isPro && contas.length === 0 && <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>(adicione em Minha Carteira)</span>}
            </label>
            <select className="input-field" value={contaId} onChange={e => setContaId(e.target.value)}
              disabled={contas.length === 0} style={{ cursor: contas.length > 0 ? 'pointer' : 'not-allowed', opacity: contas.length === 0 ? 0.5 : 1 }}>
              <option value="">Nenhuma conta</option>
              {contas.map(c => <option key={c.id} value={c.id} style={{ background: '#161616' }}>{c.nome} — {c.banco}</option>)}
            </select>
          </div>

          {/* Tags (Pro) */}
          {isPro && (
            <div style={{ marginBottom: 18 }}>
              <label className="label">Tags</label>
              {tags.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Crie tags na aba Tags.</p>
              ) : (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {tags.map(tag => (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                      style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${tagIds.includes(tag.id) ? `${tag.cor}60` : 'var(--border)'}`, background: tagIds.includes(tag.id) ? `${tag.cor}15` : 'transparent', color: tagIds.includes(tag.id) ? tag.cor : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontWeight: tagIds.includes(tag.id) ? 600 : 400, transition: 'all 0.15s' }}>
                      #{tag.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={!podeSubmeter}
              style={{ flex: 2, opacity: podeSubmeter ? 1 : 0.4 }}>
              {transacao ? 'Salvar Alterações' : tipoPag === 'parcelado' ? `Criar ${parcelas || 2}x Parcelas` : 'Adicionar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── AbaCategorias ────────────────────────────────────────────────────────────

function AbaCategorias() {
  const categorias = useFlowStore(s => s.categorias)
  const adicionarCategoria = useFlowStore(s => s.adicionarCategoria)
  const atualizarCategoria = useFlowStore(s => s.atualizarCategoria)
  const removerCategoria = useFlowStore(s => s.removerCategoria)

  const [expandida, setExpandida] = useState<string | null>(null)
  const [showNova, setShowNova] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novaCor, setNovaCor] = useState('#3b82f6')
  const [novoTipo, setNovoTipo] = useState<'gasto' | 'receita' | 'ambos'>('gasto')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [novaSubNome, setNovaSubNome] = useState<Record<string, string>>({})

  function handleAdicionar(e: FormEvent) {
    e.preventDefault()
    if (!novoNome.trim()) return
    adicionarCategoria({ nome: novoNome.trim(), cor: novaCor, tipo: novoTipo, subcategorias: [] })
    setNovoNome(''); setShowNova(false)
  }

  function salvarEditNome(catId: string) {
    if (editNome.trim()) atualizarCategoria(catId, { nome: editNome.trim() })
    setEditandoId(null)
  }

  function adicionarSub(catId: string) {
    const nome = (novaSubNome[catId] ?? '').trim()
    if (!nome) return
    const cat = categorias.find(c => c.id === catId)
    if (!cat) return
    const subId = Math.random().toString(36).slice(2, 8)
    atualizarCategoria(catId, { subcategorias: [...cat.subcategorias, { id: subId, nome }] })
    setNovaSubNome(prev => ({ ...prev, [catId]: '' }))
  }

  function removerSub(catId: string, subId: string) {
    const cat = categorias.find(c => c.id === catId)
    if (!cat) return
    atualizarCategoria(catId, { subcategorias: cat.subcategorias.filter(s => s.id !== subId) })
  }

  const TIPO_COR: Record<string, string> = { gasto: '#ef4444', receita: '#10b981', ambos: '#3b82f6' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{categorias.length} categorias</span>
        <button className="btn-primary" onClick={() => setShowNova(true)} style={{ gap: 6, padding: '7px 14px', fontSize: 13 }}>
          <Plus size={13} />
          Nova Categoria
        </button>
      </div>

      {showNova && (
        <form onSubmit={handleAdicionar} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, marginBottom: 12 }}>
            <div>
              <label className="label">Nome</label>
              <input className="input-field" placeholder="Nome da categoria" value={novoNome} onChange={e => setNovoNome(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input-field" value={novoTipo} onChange={e => setNovoTipo(e.target.value as 'gasto' | 'receita' | 'ambos')} style={{ cursor: 'pointer' }}>
                <option value="gasto">Gasto</option>
                <option value="receita">Receita</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Cor</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CORES_PADRAO.map(c => (
                <button key={c} type="button" onClick={() => setNovaCor(c)}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: novaCor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: novaCor === c ? `0 0 8px ${c}60` : 'none' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={() => setShowNova(false)} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={!novoNome.trim()} style={{ flex: 2, opacity: novoNome.trim() ? 1 : 0.4 }}>Criar</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categorias.map(cat => {
          const isExp = expandida === cat.id
          return (
            <div key={cat.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.cor, flexShrink: 0 }} />
                {editandoId === cat.id ? (
                  <input className="input-field" value={editNome}
                    onChange={e => setEditNome(e.target.value)}
                    onBlur={() => salvarEditNome(cat.id)}
                    onKeyDown={e => { if (e.key === 'Enter') salvarEditNome(cat.id) }}
                    style={{ flex: 1, padding: '3px 8px', fontSize: 13 }} autoFocus />
                ) : (
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{cat.nome}</span>
                )}
                <span style={{ fontSize: 10, padding: '2px 7px', background: `${TIPO_COR[cat.tipo]}15`, color: TIPO_COR[cat.tipo], borderRadius: 4, fontWeight: 600, textTransform: 'capitalize' }}>{cat.tipo}</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{cat.subcategorias.length} sub</span>
                <BtnIcone onClick={() => { setEditandoId(cat.id); setEditNome(cat.nome) }} title="Editar nome" hoverColor="var(--text-primary)"><Edit2 size={13} /></BtnIcone>
                <BtnIcone onClick={() => removerCategoria(cat.id)} title="Remover" hoverColor="var(--danger)"><Trash2 size={13} /></BtnIcone>
                <BtnIcone onClick={() => setExpandida(isExp ? null : cat.id)} title="Subcategorias" hoverColor="var(--text-primary)">
                  {isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </BtnIcone>
              </div>

              {isExp && (
                <div style={{ padding: '8px 14px 14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {cat.subcategorias.map(sub => (
                      <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px 3px 10px', background: `${cat.cor}10`, border: `1px solid ${cat.cor}30`, borderRadius: 20, fontSize: 12, color: cat.cor }}>
                        {sub.nome}
                        <button onClick={() => removerSub(cat.id, sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cat.cor, opacity: 0.6, padding: 0, lineHeight: 1 }}>
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    {cat.subcategorias.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Sem subcategorias</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="input-field" placeholder="Nova subcategoria..."
                      value={novaSubNome[cat.id] ?? ''}
                      onChange={e => setNovaSubNome(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarSub(cat.id) } }}
                      style={{ flex: 1, padding: '6px 10px', fontSize: 12 }} />
                    <button type="button" className="btn-primary" onClick={() => adicionarSub(cat.id)} style={{ padding: '6px 12px', fontSize: 12 }}>Adicionar</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── AbaCarteira ──────────────────────────────────────────────────────────────

function AbaCarteira({ isPro, contas, onUpgrade }: { isPro: boolean; contas: ContaBancaria[]; onUpgrade: () => void }) {
  const adicionarConta = useFlowStore(s => s.adicionarConta)
  const removerConta = useFlowStore(s => s.removerConta)

  const [showNova, setShowNova] = useState(false)
  const [nome, setNome] = useState('')
  const [banco, setBanco] = useState('')
  const [saldo, setSaldo] = useState('')
  const [cor, setCor] = useState('#3b82f6')

  const maxContas = isPro ? Infinity : 2
  const podeAdicionar = contas.length < maxContas

  function handleAdicionar(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !banco.trim()) return
    adicionarConta({ nome: nome.trim(), banco: banco.trim(), cor, saldo: parseFloat(saldo) || 0 })
    setNome(''); setBanco(''); setSaldo(''); setShowNova(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{contas.length} conta{contas.length !== 1 ? 's' : ''}</span>
          {!isPro && <span style={{ fontSize: 11, color: '#f59e0b' }}>{contas.length}/2 no Starter</span>}
        </div>
        {podeAdicionar ? (
          <button className="btn-primary" onClick={() => setShowNova(true)} style={{ gap: 6, padding: '7px 14px', fontSize: 13 }}>
            <Plus size={13} />Nova Conta
          </button>
        ) : (
          <button onClick={onUpgrade} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, cursor: 'pointer', color: '#f59e0b', fontWeight: 600 }}>
            <Crown size={13} />Upgrade Pro
          </button>
        )}
      </div>

      {showNova && (
        <form onSubmit={handleAdicionar} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label className="label">Nome da Conta</label>
              <input className="input-field" placeholder="ex: Conta Principal" value={nome} onChange={e => setNome(e.target.value)} autoFocus required />
            </div>
            <div>
              <label className="label">Banco / Instituição</label>
              <input className="input-field" placeholder="ex: Nubank, Itaú..." value={banco} onChange={e => setBanco(e.target.value)} required />
            </div>
            <div>
              <label className="label">Saldo Inicial (R$)</label>
              <input className="input-field" type="number" placeholder="0,00" step="0.01" value={saldo} onChange={e => setSaldo(e.target.value)} />
            </div>
            <div>
              <label className="label">Cor</label>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', paddingTop: 6 }}>
                {CORES_PADRAO.map(c => (
                  <button key={c} type="button" onClick={() => setCor(c)}
                    style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: cor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: cor === c ? `0 0 8px ${c}60` : 'none' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={() => setShowNova(false)} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>Adicionar Conta</button>
          </div>
        </form>
      )}

      {contas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
          <Building2 size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.25 }} />
          <p style={{ fontSize: 14 }}>Nenhuma conta cadastrada</p>
          {!isPro && <p style={{ fontSize: 12, marginTop: 4 }}>Você pode adicionar até 2 contas no plano Starter</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {contas.map(conta => (
            <div key={conta.id} style={{ background: `linear-gradient(135deg, ${conta.cor}14, ${conta.cor}06)`, border: `1px solid ${conta.cor}30`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${conta.cor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} color={conta.cor} />
                </div>
                <BtnIcone onClick={() => removerConta(conta.id)} title="Remover" hoverColor="var(--danger)"><Trash2 size={14} /></BtnIcone>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: conta.cor, marginBottom: 4, letterSpacing: '-0.02em' }}>{fmtMoeda(conta.saldo)}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{conta.nome}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{conta.banco}</div>
            </div>
          ))}
        </div>
      )}

      {!isPro && contas.length >= 2 && (
        <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Crown size={20} color="#f59e0b" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Limite do plano Starter atingido</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Faça upgrade para o Pro e adicione contas ilimitadas.</div>
          </div>
          <button onClick={onUpgrade} style={{ padding: '7px 14px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 8, cursor: 'pointer', color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>Upgrade</button>
        </div>
      )}
    </div>
  )
}

// ─── AbaTags ──────────────────────────────────────────────────────────────────

function AbaTags({ isPro, tags, onUpgrade }: { isPro: boolean; tags: TagType[]; onUpgrade: () => void }) {
  const adicionarTag = useFlowStore(s => s.adicionarTag)
  const removerTag = useFlowStore(s => s.removerTag)

  const [nomeTag, setNomeTag] = useState('')
  const [corTag, setCorTag] = useState('#3b82f6')

  function handleAdicionar(e: FormEvent) {
    e.preventDefault()
    if (!nomeTag.trim()) return
    adicionarTag({ nome: nomeTag.trim(), cor: corTag })
    setNomeTag('')
  }

  if (!isPro) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <Lock size={28} color="#f59e0b" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Tags — Recurso Pro</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 340, marginBottom: 24, lineHeight: 1.6 }}>
          Crie tags para categorizar suas transações com mais precisão e gere relatórios detalhados sobre sua movimentação financeira.
        </p>
        <button onClick={onUpgrade} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 10, cursor: 'pointer', color: '#f59e0b', fontSize: 14, fontWeight: 600 }}>
          <Crown size={16} />
          Ativar Plano Pro
        </button>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleAdicionar} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label className="label">Nova Tag</label>
          <input className="input-field" placeholder="ex: Férias, Negócios, Pessoal..." value={nomeTag} onChange={e => setNomeTag(e.target.value)} />
        </div>
        <div>
          <label className="label">Cor</label>
          <div style={{ display: 'flex', gap: 5, paddingTop: 2 }}>
            {CORES_PADRAO.slice(0, 6).map(c => (
              <button key={c} type="button" onClick={() => setCorTag(c)}
                style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: corTag === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: corTag === c ? `0 0 8px ${c}60` : 'none' }} />
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={!nomeTag.trim()} style={{ opacity: nomeTag.trim() ? 1 : 0.4 }}>Adicionar</button>
      </form>

      {tags.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
          <Tag size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.25 }} />
          <p style={{ fontSize: 14 }}>Nenhuma tag criada ainda</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tags.map(tag => (
            <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: `${tag.cor}12`, border: `1px solid ${tag.cor}40`, borderRadius: 20, fontSize: 13, color: tag.cor, fontWeight: 500 }}>
              #{tag.nome}
              <button onClick={() => removerTag(tag.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: tag.cor, opacity: 0.6, padding: 0, lineHeight: 1, transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CardResumo({ label, valor, cor, icon, sub }: { label: string; valor: string; cor: string; icon: ReactNode; sub: string }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {icon}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: cor, letterSpacing: '-0.02em', marginBottom: 3 }}>{valor}</div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</div>
    </div>
  )
}

function BtnIcone({ onClick, title, hoverColor, children }: { onClick: () => void; title: string; hoverColor: string; children: ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 5, borderRadius: 5, transition: 'color 0.15s', lineHeight: 1 }}
      onMouseEnter={e => (e.currentTarget.style.color = hoverColor)}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
      {children}
    </button>
  )
}
