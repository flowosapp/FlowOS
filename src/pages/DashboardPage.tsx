import { useState, useEffect, type FormEvent, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFlowStore, calcularPontuacaoVida } from '../store'
import { useIsMobile } from '../hooks/useIsMobile'
import { useToast } from '../contexts/ToastContext'
import { dispararConfetti } from '../utils/confetti'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Flame, CheckCircle2, Circle, ArrowRight, TrendingUp, TrendingDown,
  Sparkles, Target, Plus, Dumbbell, Trophy, Moon, Heart,
  CalendarCheck, ChevronRight, Zap, BrainCircuit, Activity,
} from 'lucide-react'
import type { DiaSemana } from '../types'

type TFn = (key: string, opts?: Record<string, unknown>) => string

function hojeStr() { return new Date().toISOString().split('T')[0] }
function diaAtualKey(): DiaSemana {
  return (['dom','seg','ter','qua','qui','sex','sab'] as DiaSemana[])[new Date().getDay()]
}
function fmtMoeda(n: number, compact = false) {
  if (compact && Math.abs(n) >= 1000)
    return new Intl.NumberFormat('pt-BR',{ style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1 }).format(n)
  return new Intl.NumberFormat('pt-BR',{ style:'currency',currency:'BRL',maximumFractionDigits:0 }).format(n)
}
function diasAte(prazo: string) {
  return Math.ceil((new Date(prazo+'T12:00:00').getTime() - new Date().setHours(12,0,0,0)) / 86400000)
}

// ── Mini bar chart SVG ────────────────────────────────────────────────────────
function MiniBarsSVG({ values, color, labels }: { values: number[]; color: string; labels?: string[] }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <svg width="100%" height="40" viewBox={`0 0 ${values.length * 14} 40`} preserveAspectRatio="none">
        {values.map((v, i) => {
          const h = (v / max) * 38
          return (
            <g key={i}>
              <rect x={i * 14 + 1} y={1} width={12} height={38} rx={3} fill="rgba(255,255,255,0.04)" />
              {v > 0 && (
                <rect x={i * 14 + 1} y={39 - h} width={12} height={h} rx={3}
                  fill={color} fillOpacity={v === max ? 1 : 0.55}
                />
              )}
            </g>
          )
        })}
      </svg>
      {labels && (
        <div style={{ display: 'flex' }}>
          {labels.map((l, i) => (
            <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,system-ui,sans-serif' }}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Habit Heatmap (12 semanas × 7 dias) ──────────────────────────────────────
function HabitHeatmap({ habitos }: { habitos: { datasConcluidas: string[] }[] }) {
  const { t } = useTranslation('dashboard')
  const diasS = t('days_short', { returnObjects: true }) as string[]

  const total = habitos.length || 1
  const cells = useMemo(() => {
    const today = new Date()
    const result: { date: string; pct: number }[] = []
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const s = d.toISOString().split('T')[0]
      const feitos = habitos.filter(h => h.datasConcluidas.includes(s)).length
      result.push({ date: s, pct: Math.round((feitos / total) * 100) })
    }
    return result
  }, [habitos])

  function cellColor(pct: number) {
    if (pct === 0)  return 'rgba(255,255,255,0.05)'
    if (pct < 33)   return 'rgba(245,158,11,0.25)'
    if (pct < 66)   return 'rgba(245,158,11,0.55)'
    if (pct < 100)  return 'rgba(16,185,129,0.5)'
    return '#10b981'
  }

  const weeks: typeof cells[] = []
  for (let w = 0; w < 12; w++) weeks.push(cells.slice(w * 7, w * 7 + 7))

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 1 }}>
        {diasS.map((d, i) => (
          <div key={i} style={{ width: 12, height: 12, fontSize: 8, color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {i % 2 === 0 ? d : ''}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {week.map((cell, di) => (
            <div
              key={di}
              title={`${cell.date}: ${cell.pct}%`}
              style={{
                width: 12, height: 12, borderRadius: 3,
                background: cellColor(cell.pct),
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Score Trend Chart (Recharts) ──────────────────────────────────────────────
function ScoreTrendChart({ data, color, historyHint }: { data: { data: string; score: number }[]; color: string; historyHint: string }) {
  if (data.length < 2) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, fontSize: 12, color: 'var(--text-2)' }}>
      {historyHint}
    </div>
  )

  const chartData = data.map(d => ({
    label: d.data.slice(5),
    score: d.score,
  }))

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 5)} />
        <YAxis domain={[0, 100]} tick={false} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: 'var(--text-secondary)' }}
          formatter={(v: number) => [v, 'Score']}
        />
        <Area type="monotone" dataKey="score" stroke={color} strokeWidth={2} fill="url(#scoreGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Insight Tile ──────────────────────────────────────────────────────────────
function InsightTile({ emoji, titulo, corpo, cor, onClick }: { emoji: string; titulo: string; corpo: string; cor: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px', borderRadius: 12,
        background: `${cor}08`, border: `1px solid ${cor}20`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLDivElement).style.background = `${cor}14`)}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLDivElement).style.background = `${cor}08`)}
    >
      <div style={{ fontSize: 20, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: cor, marginBottom: 4, letterSpacing: '-0.01em' }}>{titulo}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{corpo}</div>
    </div>
  )
}

// ── Automated Insights ────────────────────────────────────────────────────────
function gerarInsightsAutomaticos(state: {
  habitos: { datasConcluidas: string[]; nome: string; streak: number }[]
  tarefas: { concluida: boolean; prioridade: string }[]
  transacoes: { tipo: string; valor: number; dataLancamento: string; status: string }[]
  scoreHistorico: { data: string; score: number }[]
  score: number
  focosHoje: number
  habitosHoje: number
}, t: TFn) {
  const { habitos, tarefas, transacoes, scoreHistorico, focosHoje, habitosHoje } = state
  const hoje = hojeStr()
  const insights: { emoji: string; titulo: string; corpo: string; cor: string }[] = []

  if (scoreHistorico.length >= 7) {
    const recente = scoreHistorico.slice(-7).map(e => e.score)
    const anterior = scoreHistorico.slice(-14, -7).map(e => e.score)
    if (anterior.length >= 3) {
      const mediaRec = recente.reduce((s, v) => s + v, 0) / recente.length
      const mediaAnt = anterior.reduce((s, v) => s + v, 0) / anterior.length
      const diff = Math.round(mediaRec - mediaAnt)
      if (diff > 0) {
        insights.push({ emoji: '📈', titulo: t('insight_score_up_title', { diff }), corpo: t('insight_score_up_body', { diff }), cor: '#10b981' })
      } else if (diff < -5) {
        insights.push({ emoji: '⚠️', titulo: t('insight_score_drop_title', { abs: Math.abs(diff) }), corpo: t('insight_score_drop_body', { abs: Math.abs(diff) }), cor: '#f59e0b' })
      }
    }
  }

  if (habitos.length > 0 && scoreHistorico.length >= 14) {
    const porDia: number[] = Array(7).fill(0).map((_, d) => {
      const dias = scoreHistorico.filter(e => new Date(e.data).getDay() === d)
      return dias.length ? dias.reduce((s, e) => s + e.score, 0) / dias.length : 0
    })
    const melhorDia = porDia.indexOf(Math.max(...porDia.filter(v => v > 0)))
    if (melhorDia >= 0 && porDia[melhorDia] > 0) {
      const dayName = t(`day_${melhorDia}`)
      const dayFull = t(`day_${melhorDia}_full`)
      insights.push({ emoji: '🗓️', titulo: t('insight_best_day_title', { day: dayName }), corpo: t('insight_best_day_body', { day_lc: dayFull, avg: Math.round(porDia[melhorDia]) }), cor: '#3b82f6' })
    }
  }

  const melhorStreak = habitos.reduce((m, h) => Math.max(m, h.streak), 0)
  if (melhorStreak >= 7) {
    const campeao = habitos.find(h => h.streak === melhorStreak)
    insights.push({ emoji: '🔥', titulo: t('insight_streak_title', { days: melhorStreak }), corpo: t('insight_streak_body', { name: campeao?.nome ?? '', days: melhorStreak }), cor: '#f59e0b' })
  }

  const mesAtual = hoje.slice(0, 7)
  const transacoesMes = transacoes.filter(tr => tr.dataLancamento?.startsWith(mesAtual))
  const recMes = transacoesMes.filter(tr => tr.tipo === 'receita').reduce((s, tr) => s + tr.valor, 0)
  const gasMes = transacoesMes.filter(tr => tr.tipo === 'gasto').reduce((s, tr) => s + tr.valor, 0)
  if (recMes > 0 && gasMes > 0) {
    const taxa = Math.round((gasMes / recMes) * 100)
    if (taxa < 70) {
      insights.push({ emoji: '💰', titulo: t('insight_spend_ok_title', { rate: taxa }), corpo: t('insight_spend_ok_body', { rate: taxa, rest: 100 - taxa }), cor: '#10b981' })
    } else if (taxa > 90) {
      insights.push({ emoji: '💸', titulo: t('insight_spend_high_title', { rate: taxa }), corpo: t('insight_spend_high_body', { rate: taxa }), cor: '#ef4444' })
    }
  }

  if (focosHoje >= 3) {
    insights.push({ emoji: '🎯', titulo: t('insight_focus_title', { count: focosHoje }), corpo: t('insight_focus_body'), cor: '#8b5cf6' })
  }

  if (habitos.length > 0 && habitosHoje === habitos.length) {
    insights.push({ emoji: '✅', titulo: t('insight_habits_all_title'), corpo: t('insight_habits_all_body'), cor: '#10b981' })
  }

  const altasPend = tarefas.filter(tr => !tr.concluida && tr.prioridade === 'alta').length
  if (altasPend > 0 && focosHoje === 0) {
    insights.push({ emoji: '⚡', titulo: t('insight_urgent_title', { count: altasPend }), corpo: t('insight_urgent_body'), cor: '#ef4444' })
  }

  if (insights.length === 0) {
    insights.push({ emoji: '🚀', titulo: t('insight_build_title'), corpo: t('insight_build_body'), cor: '#3b82f6' })
  }

  return insights.slice(0, 3)
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const navigate           = useNavigate()
  const perfil             = useFlowStore(s => s.perfil)
  const habitos            = useFlowStore(s => s.habitos)
  const tarefas            = useFlowStore(s => s.tarefas)
  const transacoes         = useFlowStore(s => s.transacoes)
  const focosHoje          = useFlowStore(s => s.focosHoje)
  const metas              = useFlowStore(s => s.metas)
  const planoTreino        = useFlowStore(s => s.planoTreino)
  const registrosSono      = useFlowStore(s => s.registrosSono)
  const registrosSaude     = useFlowStore(s => s.registrosSaude)
  const scoreHistorico     = useFlowStore(s => s.scoreHistorico)
  const alternarHabito     = useFlowStore(s => s.alternarHabito)
  const alternarTarefa     = useFlowStore(s => s.alternarTarefa)
  const adicionarTarefa    = useFlowStore(s => s.adicionarTarefa)
  const registrarScore     = useFlowStore(s => s.registrarScore)

  const toast = useToast()
  const [novaTarefa, setNovaTarefa] = useState('')
  const [filtroP, setFiltroP] = useState<'todas'|'alta'|'media'>('todas')
  const [checkedHabitoIds, setCheckedHabitoIds] = useState<Set<string>>(new Set())

  const hoje   = hojeStr()
  const agora  = new Date()
  const diaKey = diaAtualKey()

  const isMobile  = useIsMobile()
  const score     = calcularPontuacaoVida({ habitos, tarefas, transacoes, focosHoje })
  const scoreClr  = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)'

  const h = agora.getHours()
  const nome = perfil?.nome ?? 'você'
  const saudacao = h < 12 ? t('greeting_morning', { name: nome }) : h < 18 ? t('greeting_afternoon', { name: nome }) : t('greeting_evening', { name: nome })

  // Locale-aware date string
  const dateStr = agora.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Month name for finance header
  const monthName = (() => {
    const raw = agora.toLocaleDateString(i18n.language, { month: 'short' }).replace('.', '')
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  })()

  useEffect(() => {
    registrarScore(score)
  }, [score])

  const habitosHoje  = habitos.filter(h => h.datasConcluidas.includes(hoje)).length
  const melhorStreak = useMemo(() => habitos.reduce((m, h) => Math.max(m, h.streak), 0), [habitos])
  const diasS        = t('days_short', { returnObjects: true }) as string[]
  const habitosChart = useMemo(() => Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i))
    const s = d.toISOString().split('T')[0]
    const feitos = habitos.filter(h=>h.datasConcluidas.includes(s)).length
    return habitos.length ? Math.round((feitos/habitos.length)*100) : 0
  }), [habitos])

  const tarefasFiltradas = useMemo(() => {
    const pend = tarefas.filter(t => !t.concluida)
    if (filtroP === 'alta')  return pend.filter(t => t.prioridade === 'alta')
    if (filtroP === 'media') return pend.filter(t => t.prioridade === 'media')
    return pend.sort((a, b) => ({alta:0,media:1,baixa:2}[a.prioridade]??3) - ({alta:0,media:1,baixa:2}[b.prioridade]??3))
  }, [tarefas, filtroP])

  const tarefaPrincipal = useMemo(() =>
    tarefas.filter(t => !t.concluida && t.prioridade === 'alta')[0]
    ?? tarefas.filter(t => !t.concluida)[0]
    ?? null
  , [tarefas])

  const mesAtual    = hoje.slice(0,7)
  const transMes    = transacoes.filter(t => t.dataLancamento?.startsWith(mesAtual))
  const receitasMes = transMes.filter(t=>t.tipo==='receita').reduce((s,t)=>s+t.valor,0)
  const gastosMes   = transMes.filter(t=>t.tipo==='gasto').reduce((s,t)=>s+t.valor,0)
  const saldoMes    = receitasMes - gastosMes
  const totalRec    = transacoes.filter(t=>t.tipo==='receita').reduce((s,t)=>s+t.valor,0)
  const totalGas    = transacoes.filter(t=>t.tipo==='gasto').reduce((s,t)=>s+t.valor,0)
  const saldoLiq    = totalRec - totalGas

  const treinoHoje = planoTreino?.cronograma[diaKey]
  const metaAtiva  = useMemo(() => {
    const a = metas.filter(m=>m.status==='ativa'&&m.prazo)
    return (a.length ? a.sort((a,b)=>(a.prazo??'').localeCompare(b.prazo??''))[0] : metas.find(m=>m.status==='ativa')) ?? null
  }, [metas])

  const ultimoSono  = registrosSono[0]
  const ultimoSaude = registrosSaude[0]

  const cx=54, r=46, circ=2*Math.PI*r, filled=(score/100)*circ

  const scoreTrend = useMemo(() => {
    const sorted = [...scoreHistorico].sort((a,b) => a.data.localeCompare(b.data))
    return sorted.slice(-30)
  }, [scoreHistorico])

  const scoreDelta = useMemo(() => {
    if (scoreHistorico.length < 2) return null
    const sorted = [...scoreHistorico].sort((a,b) => a.data.localeCompare(b.data))
    const hoje7 = sorted.slice(-7).map(e => e.score)
    const ant7  = sorted.slice(-14,-7).map(e => e.score)
    if (!ant7.length) return null
    const m1 = hoje7.reduce((s,v)=>s+v,0) / hoje7.length
    const m2 = ant7.reduce((s,v)=>s+v,0) / ant7.length
    return Math.round(m1 - m2)
  }, [scoreHistorico])

  const insights = useMemo(() => gerarInsightsAutomaticos(
    { habitos, tarefas, transacoes, scoreHistorico, score, focosHoje, habitosHoje }, t
  ), [habitos, tarefas, transacoes, scoreHistorico, score, focosHoje, habitosHoje, t])

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!novaTarefa.trim()) return
    adicionarTarefa(novaTarefa.trim(), 'media')
    toast.success(t('task_added', { name: novaTarefa.trim() }), '✅')
    setNovaTarefa('')
  }

  function handleAlternarHabito(habitoId: string) {
    const habito = habitos.find(h => h.id === habitoId)
    if (!habito) return
    const jaConcluido = habito.datasConcluidas.includes(hoje)
    alternarHabito(habitoId, hoje)

    if (!jaConcluido) {
      setCheckedHabitoIds(ids => new Set([...ids, habitoId]))
      setTimeout(() => setCheckedHabitoIds(ids => { const n = new Set(ids); n.delete(habitoId); return n }), 400)

      const totalFeitos = habitos.filter(h => h.id !== habitoId ? h.datasConcluidas.includes(hoje) : true).length
      if (totalFeitos === habitos.length && habitos.length > 0) {
        toast.success(t('habits_all_done'), '🎉')
        setTimeout(() => dispararConfetti({ y: window.innerHeight * 0.4 }), 100)
      }
    }
  }

  const insight = gerarInsightRapido({ habitos, tarefas, score, habitosHoje, treinoHoje: treinoHoje?.nome }, t)

  const scoreLabels = [
    { label: t('score_habits'),  val: habitos.length ? Math.round((habitosHoje/habitos.length)*100) : 0,                cor:'var(--amber)' },
    { label: t('score_tasks'),   val: tarefas.length ? Math.round((tarefas.filter(t=>t.concluida).length/tarefas.length)*100) : 0, cor:'var(--blue)' },
    { label: t('score_focus'),   val: Math.min(focosHoje*20,100),                                                        cor:'var(--purple)' },
    { label: t('score_finance'), val: saldoLiq>=0?100:Math.max(0,100+Math.round((saldoLiq/Math.max(totalRec,1))*100)),  cor:'var(--green)' },
  ]

  const pendentes = tarefas.filter(tv=>!tv.concluida).length
  const concluidas = tarefas.filter(tv=>tv.concluida).length

  return (
    <div className="page-container animate-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: tarefaPrincipal ? 16 : 26 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, letterSpacing:'-0.04em', marginBottom:3, lineHeight:1 }}>
            {saudacao} 👋
          </h1>
          <p style={{ fontSize:13, color:'var(--text-1)', letterSpacing:'-0.01em' }}>
            {dateStr}
          </p>
          {perfil?.mantra && (
            <p style={{ fontSize:12, color:'var(--text-2)', fontStyle:'italic', marginTop:5 }}>"{perfil.mantra}"</p>
          )}
        </div>
        {!isMobile && (
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn-ghost" onClick={()=>navigate('/saude')} style={{ gap:6, fontSize:13 }}>
              <Heart size={14}/> {t('go_health')}
            </button>
            <button className="btn-primary" onClick={()=>navigate('/foco')} style={{ gap:6 }}>
              <Target size={14}/> {t('btn_focus')}
            </button>
          </div>
        )}
      </div>

      {/* ── Destaque do dia ─────────────────────────────────────────────────── */}
      {tarefaPrincipal && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
          padding: '13px 16px', borderRadius: 12,
          background: 'linear-gradient(135deg,rgba(59,130,246,0.07),rgba(139,92,246,0.05))',
          border: '1px solid rgba(59,130,246,0.18)',
        }}>
          <Zap size={15} color="#3b82f6" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.5))' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
              {t('focus_today')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tarefaPrincipal.titulo}
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => { alternarTarefa(tarefaPrincipal.id); navigate('/foco') }}
            style={{ gap: 6, fontSize: 12, padding: '6px 14px', flexShrink: 0 }}
          >
            <Target size={12} /> {t('btn_focus')}
          </button>
        </div>
      )}

      {/* ── Row 1: Score + Hábitos + Finanças ──────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr 1fr', gap:14, marginBottom:14 }}>

        {/* Score de Vida */}
        <div className="animate-in-delay-1" style={{
          background:`linear-gradient(135deg,var(--bg-2),rgba(59,130,246,0.04))`,
          border:`1px solid rgba(59,130,246,0.14)`,
          borderRadius:'var(--r-lg)', padding:'18px 20px',
          boxShadow:'var(--shadow-blue),var(--shadow-sm)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom: scoreTrend.length >= 2 ? 12 : 0 }}>
            <div style={{ position:'relative', width:108, height:108, flexShrink:0 }}>
              <svg width={108} height={108} style={{ transform:'rotate(-90deg)' }}>
                <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7}/>
                <circle cx={cx} cy={cx} r={r} fill="none" stroke={scoreClr} strokeWidth={7} strokeLinecap="round"
                  strokeDasharray={`${filled} ${circ}`}
                  style={{ transition:'stroke-dasharray 1.3s cubic-bezier(0.4,0,0.2,1)', filter:`drop-shadow(0 0 4px ${scoreClr})` }}
                />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:26, fontWeight:900, color:scoreClr, lineHeight:1, letterSpacing:'-0.05em', fontVariantNumeric:'tabular-nums' }}>{score}</span>
                <span style={{ fontSize:9, color:'var(--text-2)', marginTop:1 }}>/ 100</span>
              </div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                <div className="label">{t('life_score')}</div>
                {scoreDelta !== null && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                    background: scoreDelta >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                    color: scoreDelta >= 0 ? 'var(--green)' : 'var(--red)',
                  }}>
                    {scoreDelta >= 0 ? '+' : ''}{scoreDelta}
                  </span>
                )}
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:scoreClr, marginBottom:12, letterSpacing:'-0.02em' }}>
                {score>=80?t('common:score_excellent'):score>=60?t('common:score_ontrack'):score>=40?t('common:score_building'):t('common:score_starting')}
              </div>
              {scoreLabels.map(({ label, val, cor }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                  <span style={{ fontSize:10, color:'var(--text-2)', width:44, flexShrink:0 }}>{label}</span>
                  <div className="prog-track" style={{ flex:1 }}>
                    <div className="prog-fill" style={{ width:`${val}%`, background:cor, boxShadow:`0 0 4px ${cor}` }} />
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, color:cor, width:28, textAlign:'right', flexShrink:0 }}>{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {scoreTrend.length >= 2 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
              <div style={{ fontSize: 9, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Activity size={9} /> {t('score_history', { count: scoreTrend.length })}
              </div>
              <ScoreTrendChart data={scoreTrend} color={scoreClr} historyHint={t('history_hint')} />
            </div>
          )}
        </div>

        {/* Hábitos */}
        <div className="card animate-in-delay-1">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div>
              <div className="label" style={{ marginBottom:2 }}>{t('habits_today')}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                <span style={{ fontSize:22, fontWeight:800, color:'var(--amber)', letterSpacing:'-0.04em' }}>{habitosHoje}</span>
                <span style={{ fontSize:13, color:'var(--text-2)' }}>/ {habitos.length}</span>
              </div>
            </div>
            <div style={{ textAlign:'center' }}>
              <Flame size={17} color="var(--amber)" style={{ filter:'drop-shadow(0 0 6px rgba(245,158,11,0.6))' }}/>
              {melhorStreak>0 && <div style={{ fontSize:9, fontWeight:800, color:'var(--amber)', marginTop:2 }}>{melhorStreak}d</div>}
            </div>
          </div>

          {habitos.length > 0 && (
            <div style={{ marginBottom:10 }}>
              <MiniBarsSVG values={habitosChart} color="var(--amber)" labels={Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return diasS[d.getDay()]})} />
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {habitos.slice(0,3).map(h => {
              const feito = h.datasConcluidas.includes(hoje)
              return (
                <button key={h.id} onClick={()=>handleAlternarHabito(h.id)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'5px 9px',
                  background: feito?'rgba(16,185,129,0.07)':'rgba(255,255,255,0.025)',
                  border:`1px solid ${feito?'rgba(16,185,129,0.2)':'var(--border-0)'}`,
                  borderRadius:8, cursor:'pointer', width:'100%', textAlign:'left',
                  transition:'all var(--t-fast)', fontFamily:'inherit',
                }}>
                  <span style={{ fontSize:13 }}>{h.icone}</span>
                  <span style={{ flex:1, fontSize:12, color:feito?'var(--green)':'var(--text-1)', fontWeight:feito?500:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.nome}</span>
                  {feito
                    ? <CheckCircle2 key={`ck-${h.id}`} size={13} color="var(--green)" className={checkedHabitoIds.has(h.id) ? 'check-pop' : ''} style={{ filter:'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }}/>
                    : <Circle size={13} color="var(--text-2)"/>}
                </button>
              )
            })}
            {habitos.length===0 && (
              <button className="btn-ghost" onClick={()=>navigate('/habitos')} style={{ width:'100%', fontSize:12 }}>{t('add_habits')}</button>
            )}
          </div>
          {habitos.length>3 && (
            <button onClick={()=>navigate('/habitos')} style={{ fontSize:11, color:'var(--blue)', background:'none', border:'none', cursor:'pointer', marginTop:8, padding:0 }}>
              {t('more_habits', { count: habitos.length - 3 })}
            </button>
          )}
        </div>

        {/* Finanças */}
        <div className="card animate-in-delay-1">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <div>
              <div className="label" style={{ marginBottom:2 }}>{t('finance_month', { month: monthName })}</div>
              <div style={{ fontSize:22, fontWeight:900, color:saldoMes>=0?'var(--green)':'var(--red)', letterSpacing:'-0.045em' }}>
                {saldoMes>=0?'+':''}{fmtMoeda(saldoMes,true)}
              </div>
            </div>
            {saldoMes>=0
              ? <TrendingUp size={15} color="var(--green)" style={{ filter:'drop-shadow(0 0 5px rgba(16,185,129,0.6))' }}/>
              : <TrendingDown size={15} color="var(--red)"/>}
          </div>

          {(receitasMes > 0 || gastosMes > 0) && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 4 }}>
                {receitasMes > 0 && (
                  <div style={{ display: 'flex', height: '100%' }}>
                    <div style={{ width: `${Math.round((gastosMes/receitasMes)*100).toFixed(0)}%`, background: '#ef4444', borderRadius: '3px 0 0 3px', maxWidth: '100%' }} />
                    <div style={{ flex: 1, background: '#10b981', borderRadius: '0 3px 3px 0' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9, color: 'var(--text-2)' }}>{t('spending_pct', { pct: receitasMes > 0 ? Math.min(100, Math.round((gastosMes/receitasMes)*100)) : 0 })}</span>
                <span style={{ fontSize: 9, color: 'var(--text-2)' }}>{t('saving_pct', { pct: receitasMes > 0 ? Math.max(0, 100 - Math.round((gastosMes/receitasMes)*100)) : 0 })}</span>
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
            <div style={{ padding:'6px 8px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.14)', borderRadius:8 }}>
              <div style={{ fontSize:9, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>{t('income_label')}</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--green)' }}>{fmtMoeda(receitasMes,true)}</div>
            </div>
            <div style={{ padding:'6px 8px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.14)', borderRadius:8 }}>
              <div style={{ fontSize:9, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>{t('expenses_label')}</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--red)' }}>{fmtMoeda(gastosMes,true)}</div>
            </div>
          </div>

          {(() => { const p=transacoes.filter(t=>t.status==='pendente').length; return p>0 ? (
            <div style={{ padding:'4px 8px', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.18)', borderRadius:6, marginBottom:8 }}>
              <span style={{ fontSize:11, color:'var(--amber)' }}>{t('pending_items', { count: p })}</span>
            </div>
          ):null })()}

          <button onClick={()=>navigate('/financas')} style={{ fontSize:11, color:'var(--blue)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
            {t('see_finance')} <ArrowRight size={11}/>
          </button>
        </div>
      </div>

      {/* ── Row 2: Treino + Meta + Bem-estar ───────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap:14, marginBottom:14 }}>

        {/* Treino */}
        <div className="card card-clickable animate-in-delay-2" onClick={()=>navigate('/saude')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div className="label">{t('workout_today')}</div>
            <Dumbbell size={14} color="var(--blue)" style={{ filter:'drop-shadow(0 0 5px rgba(59,130,246,0.5))' }}/>
          </div>
          {treinoHoje&&!treinoHoje.isDescanso ? (
            <>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:'-0.02em', marginBottom:4 }}>{treinoHoje.nome}</div>
              <div style={{ fontSize:12, color:'var(--text-1)', marginBottom:10 }}>{treinoHoje.grupos.join(' · ')} · {t('exercises_count', { count: treinoHoje.exercicios.length })}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {treinoHoje.exercicios.slice(0,3).map((ex,i)=>(
                  <span key={i} className="badge badge-blue" style={{ textTransform:'none', letterSpacing:0, fontSize:10, fontWeight:400 }}>{ex.nome}</span>
                ))}
                {treinoHoje.exercicios.length>3&&<span className="badge" style={{ background:'var(--bg-3)', color:'var(--text-2)', border:'1px solid var(--border-0)', textTransform:'none' }}>+{treinoHoje.exercicios.length-3}</span>}
              </div>
            </>
          ) : treinoHoje?.isDescanso ? (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <div style={{ fontSize:26, marginBottom:5 }}>😴</div>
              <div style={{ fontSize:13, fontWeight:600, letterSpacing:'-0.02em', marginBottom:3 }}>{t('rest_day')}</div>
              <div style={{ fontSize:11, color:'var(--text-2)' }}>{t('rest_day_sub')}</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:13, color:'var(--text-1)', marginBottom:8 }}>{t('no_workout_plan')}</div>
              <span style={{ fontSize:11, color:'var(--blue)', display:'flex', alignItems:'center', gap:3 }}>{t('go_health')} <ChevronRight size={11}/></span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="card card-clickable animate-in-delay-2" onClick={()=>metaAtiva&&navigate('/crescimento')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div className="label">{t('active_goal')}</div>
            <CalendarCheck size={14} color="var(--purple)" style={{ filter:'drop-shadow(0 0 5px rgba(139,92,246,0.5))' }}/>
          </div>
          {metaAtiva ? (
            <>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:'-0.02em', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{metaAtiva.titulo}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', marginBottom:9 }}>{metaAtiva.categoria}</div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:10, color:'var(--text-2)' }}>{t('goal_progress')}</span>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--purple)' }}>{metaAtiva.progresso}%</span>
              </div>
              <div className="prog-track" style={{ marginBottom:9 }}>
                <div className="prog-fill" style={{ width:`${metaAtiva.progresso}%`, background:'linear-gradient(90deg,var(--purple),#6366f1)', boxShadow:'0 0 5px rgba(139,92,246,0.5)' }}/>
              </div>
              {metaAtiva.marcos.find(m=>!m.concluido)&&(
                <div style={{ fontSize:11, color:'var(--text-1)', padding:'3px 8px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-0)', borderRadius:6, marginBottom:7 }}>
                  📌 {metaAtiva.marcos.find(m=>!m.concluido)?.titulo}
                </div>
              )}
              {metaAtiva.prazo&&(
                <div style={{ fontSize:11, color:diasAte(metaAtiva.prazo)<=7?'var(--red)':'var(--text-2)' }}>
                  {diasAte(metaAtiva.prazo)>0 ? t('days_left', { count: diasAte(metaAtiva.prazo) }) : t('deadline_passed')}
                </div>
              )}
            </>
          ) : (
            <div>
              <div style={{ fontSize:13, color:'var(--text-1)', marginBottom:9 }}>{t('no_goal')}</div>
              <span style={{ fontSize:11, color:'var(--blue)', display:'flex', alignItems:'center', gap:3 }}>{t('create_goal')} <ChevronRight size={11}/></span>
            </div>
          )}
        </div>

        {/* Bem-estar */}
        <div className="card card-clickable animate-in-delay-2" onClick={()=>navigate('/saude')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div className="label">{t('wellbeing')}</div>
            <Heart size={14} color="var(--red)" style={{ filter:'drop-shadow(0 0 5px rgba(239,68,68,0.5))' }}/>
          </div>
          {ultimoSono ? (
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <div style={{ flex:1, padding:'8px 10px', background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.14)', borderRadius:9 }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                  <Moon size={10} color="var(--blue)"/>
                  <span style={{ fontSize:9, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{t('sleep_label')}</span>
                </div>
                <div style={{ fontSize:20, fontWeight:900, color:ultimoSono.horasDormidas>=7?'var(--green)':'var(--amber)', letterSpacing:'-0.04em' }}>{ultimoSono.horasDormidas}h</div>
                <div style={{ fontSize:10, color:'var(--text-2)' }}>{['','😫','😞','😐','😊','🌟'][ultimoSono.qualidade]} {t('sleep_quality')}</div>
              </div>
              {ultimoSaude&&(
                <div style={{ flex:1, padding:'8px 10px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.14)', borderRadius:9 }}>
                  <div style={{ fontSize:9, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{t('mood_label')}</div>
                  <div style={{ fontSize:20, fontWeight:900 }}>{['','😫','😞','😐','😊','🔥'][ultimoSaude.humor]}</div>
                  <div style={{ fontSize:10, color:'var(--text-2)' }}>{t('energy_label')} {['','😩','😕','😐','⚡','🚀'][ultimoSaude.energia]}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize:13, color:'var(--text-1)', marginBottom:10 }}>{t('no_wellness')}</div>
          )}
          <span style={{ fontSize:11, color:'var(--blue)', display:'flex', alignItems:'center', gap:3 }}>{t('see_health')} <ChevronRight size={11}/></span>
        </div>
      </div>

      {/* ── Atividade Heatmap ───────────────────────────────────────────────── */}
      {habitos.length > 0 && (
        <div className="card animate-in-delay-2" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div className="label" style={{ marginBottom: 1 }}>{t('activity')}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{t('daily_completion')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-2)' }}>
              <span>0%</span>
              {['rgba(255,255,255,0.05)','rgba(245,158,11,0.25)','rgba(245,158,11,0.55)','rgba(16,185,129,0.5)','#10b981'].map((c,i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
              ))}
              <span>100%</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <HabitHeatmap habitos={habitos} />
          </div>
        </div>
      )}

      {/* ── Row 3: Tarefas + IA ─────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap:14, marginBottom: 14 }}>

        {/* Tarefas */}
        <div className="card animate-in-delay-3">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:13 }}>
            <div>
              <div className="label" style={{ marginBottom:2 }}>{t('tasks')}</div>
              <div style={{ fontSize:13, color:'var(--text-1)' }}>
                <span style={{ fontWeight:700, color:'var(--text-0)' }}>{pendentes}</span> {t('pending_label', { count: pendentes })}
                <span style={{ color:'var(--text-2)' }}> · {concluidas} {t('done_label', { count: concluidas })}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:3 }}>
              {(['todas','alta','media'] as const).map(f=>(
                <button key={f} onClick={()=>setFiltroP(f)} style={{
                  padding:'3px 9px', borderRadius:5, fontSize:10, fontWeight:600,
                  cursor:'pointer', border:'none', fontFamily:'inherit',
                  background:filtroP===f?'var(--blue)':'rgba(255,255,255,0.05)',
                  color:filtroP===f?'#fff':'var(--text-2)',
                  transition:'all var(--t-fast)',
                  boxShadow:filtroP===f?'0 2px 8px rgba(59,130,246,0.3)':'none',
                }}>
                  {f==='todas' ? t('filter_all') : f==='alta' ? t('filter_high') : t('filter_mid')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12, minHeight:110 }}>
            {tarefasFiltradas.slice(0,6).map(tv=>(
              <button key={tv.id} onClick={()=>alternarTarefa(tv.id)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
                background:'rgba(255,255,255,0.025)', border:'1px solid var(--border-0)',
                borderRadius:7, cursor:'pointer', width:'100%', textAlign:'left',
                fontFamily:'inherit', transition:'all var(--t-fast)',
              }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.025)')}
              >
                <Circle size={14} color="var(--text-2)"/>
                <span style={{ flex:1, fontSize:12, color:'var(--text-0)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{tv.titulo}</span>
                <PrioridadeBadge p={tv.prioridade}/>
              </button>
            ))}
            {tarefasFiltradas.length===0&&(
              <div style={{ fontSize:13, color:'var(--text-2)', textAlign:'center', padding:'22px 0' }}>
                {filtroP==='todas' ? t('empty_all') : t('empty_filter', { priority: filtroP })}
              </div>
            )}
          </div>

          <form onSubmit={handleAdd} style={{ display:'flex', gap:7 }}>
            <input className="input-field" placeholder={t('task_placeholder')} value={novaTarefa} onChange={e=>setNovaTarefa(e.target.value)} style={{ fontSize:12 }}/>
            <button type="submit" style={{
              width:34, height:34, background:'var(--grad-brand)', border:'none', borderRadius:8,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              boxShadow:'0 2px 10px rgba(59,130,246,0.3)', transition:'filter var(--t-fast)',
            }}>
              <Plus size={16} color="#fff"/>
            </button>
          </form>
          {tarefasFiltradas.length>6&&(
            <button onClick={()=>navigate('/projetos')} style={{ fontSize:11, color:'var(--blue)', background:'none', border:'none', cursor:'pointer', marginTop:8, padding:0, display:'flex', alignItems:'center', gap:4 }}>
              {t('more_tasks', { count: tarefasFiltradas.length - 6 })} <ArrowRight size={11}/>
            </button>
          )}
        </div>

        {/* IA + quick stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="animate-in-delay-3 card-clickable" onClick={()=>navigate('/ia')} style={{
            flex:1,
            background:'linear-gradient(135deg,var(--bg-2),rgba(139,92,246,0.06))',
            border:'1px solid rgba(139,92,246,0.18)',
            borderRadius:'var(--r-lg)', padding:'18px 20px',
            boxShadow:'var(--shadow-purple),var(--shadow-sm)',
            cursor:'pointer',
            transition:'all var(--t-base)',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div className="pulse-dot"/>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--purple)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('ai_insight')}</span>
              </div>
              <Sparkles size={14} color="var(--purple)" style={{ filter:'drop-shadow(0 0 4px rgba(139,92,246,0.6))' }}/>
            </div>
            <p style={{ fontSize:13, color:'var(--text-0)', lineHeight:1.7, marginBottom:13, letterSpacing:'-0.01em' }}>{insight}</p>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--purple)', fontWeight:500 }}>
              {t('btn_ask_ai')} <ArrowRight size={12}/>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <QuickStat icon={<Zap size={13} color="var(--amber)"/>} label={t('quick_focuses')} val={String(focosHoje)} cor="var(--amber)" onClick={()=>navigate('/foco')}/>
            <QuickStat icon={<Trophy size={13} color="var(--purple)"/>} label={t('quick_best_streak')} val={melhorStreak>0?`${melhorStreak}d`:'—'} cor="var(--purple)" onClick={()=>navigate('/habitos')}/>
          </div>
        </div>
      </div>

      {/* ── Insights Automáticos ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <BrainCircuit size={14} color="var(--blue)" />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{t('auto_insights')}</span>
          <span style={{ fontSize: 10, color: 'var(--text-2)', marginLeft: 4 }}>{t('auto_insights_sub')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 10 }}>
          {insights.map((ins, i) => (
            <InsightTile key={i} {...ins} onClick={ins.cor === '#3b82f6' ? () => navigate('/dashboard') : undefined} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function QuickStat({ icon, label, val, cor, onClick }: { icon: React.ReactNode; label: string; val: string; cor: string; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      padding:'10px 12px', borderRadius:10,
      border:`1px solid ${cor}22`, background:`${cor}09`,
      cursor:'pointer', textAlign:'left', width:'100%', fontFamily:'inherit',
      transition:'all var(--t-fast)',
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 4px 14px ${cor}18`}}
    onMouseLeave={e=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''}}>
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>{icon}<span style={{ fontSize:10, color:'var(--text-2)' }}>{label}</span></div>
      <div style={{ fontSize:20, fontWeight:900, color:cor, letterSpacing:'-0.04em' }}>{val}</div>
    </button>
  )
}

const PRIO_CLR = { alta:'var(--red)', media:'var(--amber)', baixa:'var(--blue)' }
const PRIO_BG  = { alta:'rgba(239,68,68,0.1)', media:'rgba(245,158,11,0.1)', baixa:'rgba(59,130,246,0.1)' }
const PRIO_BD  = { alta:'rgba(239,68,68,0.2)', media:'rgba(245,158,11,0.2)', baixa:'rgba(59,130,246,0.2)' }

function PrioridadeBadge({ p }: { p: string }) {
  const { t } = useTranslation('dashboard')
  const PRIO_LBL = { alta: t('prio_high'), media: t('prio_mid'), baixa: t('prio_low') }
  const k = (p as keyof typeof PRIO_CLR) in PRIO_CLR ? p as keyof typeof PRIO_CLR : 'baixa'
  return (
    <span style={{ padding:'2px 6px', background:PRIO_BG[k], color:PRIO_CLR[k], border:`1px solid ${PRIO_BD[k]}`, borderRadius:4, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0 }}>
      {PRIO_LBL[k]}
    </span>
  )
}

function gerarInsightRapido({ habitos, tarefas, score, habitosHoje, treinoHoje }: {
  habitos: { datasConcluidas: string[]; nome: string }[]
  tarefas: { concluida: boolean; prioridade: string }[]
  score: number
  habitosHoje: number
  treinoHoje?: string
}, t: TFn) {
  if (treinoHoje) return t('quick_workout', { workout: treinoHoje })
  if (habitosHoje === 0 && habitos.length > 0) return t('quick_no_habits')
  if (score >= 80) return t('quick_excellent', { score })
  const alta = tarefas.filter(tv => !tv.concluida && tv.prioridade === 'alta').length
  if (alta > 2) return t('quick_urgent', { count: alta })
  if (habitosHoje > 0 && habitos.length > 0) {
    const pct = Math.round((habitosHoje / habitos.length) * 100)
    return pct >= 60 ? t('quick_habits_ok', { pct }) : t('quick_habits_low', { pct })
  }
  return t('quick_empty')
}
