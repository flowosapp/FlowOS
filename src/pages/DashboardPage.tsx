import { useState, useEffect, type FormEvent, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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

const DIAS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const DIAS_S = ['D','S','T','Q','Q','S','S']
const MESES  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function hojeStr() { return new Date().toISOString().split('T')[0] }
function diaAtualKey(): DiaSemana {
  return (['dom','seg','ter','qua','qui','sex','sab'] as DiaSemana[])[new Date().getDay()]
}
function saudacao(nome: string) {
  const h = new Date().getHours()
  return h < 12 ? `Bom dia, ${nome}` : h < 18 ? `Boa tarde, ${nome}` : `Boa noite, ${nome}`
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

  // Divide em semanas (12 colunas de 7 dias)
  const weeks: typeof cells[] = []
  for (let w = 0; w < 12; w++) weeks.push(cells.slice(w * 7, w * 7 + 7))

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      {/* Labels dos dias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 1 }}>
        {DIAS_S.map((d, i) => (
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
function ScoreTrendChart({ data, color }: { data: { data: string; score: number }[]; color: string }) {
  if (data.length < 2) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, fontSize: 12, color: 'var(--text-2)' }}>
      Histórico aparece após 2+ dias de uso
    </div>
  )

  const chartData = data.map(d => ({
    label: d.data.slice(5),  // "MM-DD"
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
}) {
  const { habitos, tarefas, transacoes, scoreHistorico, score, focosHoje, habitosHoje } = state
  const hoje = hojeStr()
  const insights: { emoji: string; titulo: string; corpo: string; cor: string }[] = []

  // Tendência de score (última semana vs anterior)
  if (scoreHistorico.length >= 7) {
    const recente = scoreHistorico.slice(-7).map(e => e.score)
    const anterior = scoreHistorico.slice(-14, -7).map(e => e.score)
    if (anterior.length >= 3) {
      const mediaRec = recente.reduce((s, v) => s + v, 0) / recente.length
      const mediaAnt = anterior.reduce((s, v) => s + v, 0) / anterior.length
      const diff = Math.round(mediaRec - mediaAnt)
      if (diff > 0) {
        insights.push({ emoji: '📈', titulo: `+${diff} pts esta semana`, corpo: `Sua pontuação média melhorou ${diff} pontos em relação à semana anterior. Consistência gerando resultados.`, cor: '#10b981' })
      } else if (diff < -5) {
        insights.push({ emoji: '⚠️', titulo: `Queda de ${Math.abs(diff)} pts`, corpo: `Sua pontuação médias caiu ${Math.abs(diff)} pontos esta semana. Revise seus hábitos e tarefas pendentes.`, cor: '#f59e0b' })
      }
    }
  }

  // Melhor dia da semana
  if (habitos.length > 0 && scoreHistorico.length >= 14) {
    const porDia: number[] = Array(7).fill(0).map((_, d) => {
      const dias = scoreHistorico.filter(e => new Date(e.data).getDay() === d)
      return dias.length ? dias.reduce((s, e) => s + e.score, 0) / dias.length : 0
    })
    const melhorDia = porDia.indexOf(Math.max(...porDia.filter(v => v > 0)))
    if (melhorDia >= 0 && porDia[melhorDia] > 0) {
      insights.push({ emoji: '🗓️', titulo: `${DIAS[melhorDia]} é seu melhor dia`, corpo: `Sua performance média às ${DIAS[melhorDia].toLowerCase()} é ${Math.round(porDia[melhorDia])}/100 — ${Math.round(porDia[melhorDia] - score + score * 0)} pts acima da sua média.`, cor: '#3b82f6' })
    }
  }

  // Streak mais alto
  const melhorStreak = habitos.reduce((m, h) => Math.max(m, h.streak), 0)
  if (melhorStreak >= 7) {
    const campeao = habitos.find(h => h.streak === melhorStreak)
    insights.push({ emoji: '🔥', titulo: `${melhorStreak} dias de streak`, corpo: `${campeao?.nome} está em sequência há ${melhorStreak} dias. Não quebre a corrente!`, cor: '#f59e0b' })
  }

  // Finanças do mês
  const mesAtual = hoje.slice(0, 7)
  const transacoesMes = transacoes.filter(t => t.dataLancamento?.startsWith(mesAtual))
  const recMes = transacoesMes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0)
  const gasMes = transacoesMes.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0)
  if (recMes > 0 && gasMes > 0) {
    const taxa = Math.round((gasMes / recMes) * 100)
    if (taxa < 70) {
      insights.push({ emoji: '💰', titulo: `Taxa de gasto: ${taxa}%`, corpo: `Você está gastando ${taxa}% da sua receita deste mês — margem saudável. ${100 - taxa}% está sobrando.`, cor: '#10b981' })
    } else if (taxa > 90) {
      insights.push({ emoji: '💸', titulo: `Gastos elevados: ${taxa}%`, corpo: `Você gastou ${taxa}% da receita deste mês. Identifique onde cortar para aumentar sua margem.`, cor: '#ef4444' })
    }
  }

  // Foco
  if (focosHoje >= 3) {
    insights.push({ emoji: '🎯', titulo: `${focosHoje} sessões de foco hoje`, corpo: 'Excelente concentração! Múltiplas sessões de foco profundo são o diferencial de quem entrega resultados.', cor: '#8b5cf6' })
  }

  // Hábitos de hoje
  if (habitos.length > 0 && habitosHoje === habitos.length) {
    insights.push({ emoji: '✅', titulo: 'Hábitos 100% hoje!', corpo: 'Você concluiu todos os hábitos do dia. Este dia vai contar no seu histórico como uma vitória perfeita.', cor: '#10b981' })
  }

  // Tarefas alta prioridade
  const altasPend = tarefas.filter(t => !t.concluida && t.prioridade === 'alta').length
  if (altasPend > 0 && focosHoje === 0) {
    insights.push({ emoji: '⚡', titulo: `${altasPend} tarefa${altasPend > 1 ? 's' : ''} urgente${altasPend > 1 ? 's' : ''}`, corpo: 'Nenhuma sessão de foco ainda. Entre no Modo Foco e ataque a tarefa mais crítica — 25 minutos de profundidade total.', cor: '#ef4444' })
  }

  // Fallback
  if (insights.length === 0) {
    insights.push({ emoji: '🚀', titulo: 'Continue construindo', corpo: 'Adicione hábitos, defina metas e registre seu progresso para ver insights personalizados aqui.', cor: '#3b82f6' })
  }

  return insights.slice(0, 3)
}

export default function DashboardPage() {
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

  // Registra score do dia atual (uma vez por render do dashboard)
  useEffect(() => {
    registrarScore(score)
  }, [score])

  // Hábitos
  const habitosHoje  = habitos.filter(h => h.datasConcluidas.includes(hoje)).length
  const melhorStreak = useMemo(() => habitos.reduce((m, h) => Math.max(m, h.streak), 0), [habitos])
  const habitosChart = useMemo(() => Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i))
    const s = d.toISOString().split('T')[0]
    const feitos = habitos.filter(h=>h.datasConcluidas.includes(s)).length
    return habitos.length ? Math.round((feitos/habitos.length)*100) : 0
  }), [habitos])

  // Tarefas
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

  // Finanças
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

  // Score ring
  const cx=54, r=46, circ=2*Math.PI*r, filled=(score/100)*circ

  // Score trend (últimos 30 dias)
  const scoreTrend = useMemo(() => {
    const sorted = [...scoreHistorico].sort((a,b) => a.data.localeCompare(b.data))
    return sorted.slice(-30)
  }, [scoreHistorico])

  // Score vs semana passada
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

  const insights = useMemo(() => gerarInsightsAutomaticos({
    habitos, tarefas, transacoes, scoreHistorico, score, focosHoje, habitosHoje
  }), [habitos, tarefas, transacoes, scoreHistorico, score, focosHoje, habitosHoje])

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!novaTarefa.trim()) return
    adicionarTarefa(novaTarefa.trim(), 'media')
    toast.success(`"${novaTarefa.trim()}" adicionada!`, '✅')
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
        toast.success('Todos os hábitos concluídos hoje! 🏆', '🎉')
        setTimeout(() => dispararConfetti({ y: window.innerHeight * 0.4 }), 100)
      }
    }
  }

  const insight = gerarInsightRapido({ habitos, tarefas, score, habitosHoje, treinoHoje: treinoHoje?.nome })

  return (
    <div className="page-container animate-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: tarefaPrincipal ? 16 : 26 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, letterSpacing:'-0.04em', marginBottom:3, lineHeight:1 }}>
            {saudacao(perfil?.nome ?? 'você')} 👋
          </h1>
          <p style={{ fontSize:13, color:'var(--text-1)', letterSpacing:'-0.01em' }}>
            {DIAS[agora.getDay()]}, {agora.getDate()} de {MESES[agora.getMonth()]} · {agora.getFullYear()}
          </p>
          {perfil?.mantra && (
            <p style={{ fontSize:12, color:'var(--text-2)', fontStyle:'italic', marginTop:5 }}>"{perfil.mantra}"</p>
          )}
        </div>
        {!isMobile && (
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn-ghost" onClick={()=>navigate('/saude')} style={{ gap:6, fontSize:13 }}>
              <Heart size={14}/> Saúde
            </button>
            <button className="btn-primary" onClick={()=>navigate('/foco')} style={{ gap:6 }}>
              <Target size={14}/> Iniciar Foco
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
              Foco do Dia
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
            <Target size={12} /> Focar
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
                <div className="label">Pontuação de Vida</div>
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
                {score>=80?'Excelente 🔥':score>=60?'No caminho ⚡':score>=40?'Construindo 💪':'Iniciando 🌱'}
              </div>
              {[
                { label:'Hábitos',  val: habitos.length ? Math.round((habitosHoje/habitos.length)*100) : 0,                cor:'var(--amber)' },
                { label:'Tarefas',  val: tarefas.length ? Math.round((tarefas.filter(t=>t.concluida).length/tarefas.length)*100) : 0, cor:'var(--blue)' },
                { label:'Foco',     val: Math.min(focosHoje*20,100),                                                        cor:'var(--purple)' },
                { label:'Finanças', val: saldoLiq>=0?100:Math.max(0,100+Math.round((saldoLiq/Math.max(totalRec,1))*100)),  cor:'var(--green)' },
              ].map(({ label, val, cor }) => (
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

          {/* Score trend mini chart */}
          {scoreTrend.length >= 2 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
              <div style={{ fontSize: 9, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Activity size={9} /> Histórico — últimos {scoreTrend.length} dias
              </div>
              <ScoreTrendChart data={scoreTrend} color={scoreClr} />
            </div>
          )}
        </div>

        {/* Hábitos */}
        <div className="card animate-in-delay-1">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div>
              <div className="label" style={{ marginBottom:2 }}>Hábitos Hoje</div>
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
              <MiniBarsSVG values={habitosChart} color="var(--amber)" labels={Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return DIAS_S[d.getDay()]})} />
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
              <button className="btn-ghost" onClick={()=>navigate('/habitos')} style={{ width:'100%', fontSize:12 }}>Adicionar hábitos →</button>
            )}
          </div>
          {habitos.length>3 && (
            <button onClick={()=>navigate('/habitos')} style={{ fontSize:11, color:'var(--blue)', background:'none', border:'none', cursor:'pointer', marginTop:8, padding:0 }}>
              +{habitos.length-3} mais →
            </button>
          )}
        </div>

        {/* Finanças */}
        <div className="card animate-in-delay-1">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <div>
              <div className="label" style={{ marginBottom:2 }}>Finanças — {MESES[agora.getMonth()]}</div>
              <div style={{ fontSize:22, fontWeight:900, color:saldoMes>=0?'var(--green)':'var(--red)', letterSpacing:'-0.045em' }}>
                {saldoMes>=0?'+':''}{fmtMoeda(saldoMes,true)}
              </div>
            </div>
            {saldoMes>=0
              ? <TrendingUp size={15} color="var(--green)" style={{ filter:'drop-shadow(0 0 5px rgba(16,185,129,0.6))' }}/>
              : <TrendingDown size={15} color="var(--red)"/>}
          </div>

          {/* Barra receita vs gasto */}
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
                <span style={{ fontSize: 9, color: 'var(--text-2)' }}>Gastos {receitasMes > 0 ? Math.min(100, Math.round((gastosMes/receitasMes)*100)) : 0}%</span>
                <span style={{ fontSize: 9, color: 'var(--text-2)' }}>Sobra {receitasMes > 0 ? Math.max(0, 100 - Math.round((gastosMes/receitasMes)*100)) : 0}%</span>
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
            <div style={{ padding:'6px 8px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.14)', borderRadius:8 }}>
              <div style={{ fontSize:9, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>Receitas</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--green)' }}>{fmtMoeda(receitasMes,true)}</div>
            </div>
            <div style={{ padding:'6px 8px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.14)', borderRadius:8 }}>
              <div style={{ fontSize:9, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>Gastos</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--red)' }}>{fmtMoeda(gastosMes,true)}</div>
            </div>
          </div>

          {(() => { const p=transacoes.filter(t=>t.status==='pendente').length; return p>0 ? (
            <div style={{ padding:'4px 8px', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.18)', borderRadius:6, marginBottom:8 }}>
              <span style={{ fontSize:11, color:'var(--amber)' }}>⚠ {p} pendente{p>1?'s':''}</span>
            </div>
          ):null })()}

          <button onClick={()=>navigate('/financas')} style={{ fontSize:11, color:'var(--blue)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
            Ver finanças <ArrowRight size={11}/>
          </button>
        </div>
      </div>

      {/* ── Row 2: Treino + Meta + Bem-estar ───────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap:14, marginBottom:14 }}>

        {/* Treino */}
        <div className="card card-clickable animate-in-delay-2" onClick={()=>navigate('/saude')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div className="label">Treino de Hoje</div>
            <Dumbbell size={14} color="var(--blue)" style={{ filter:'drop-shadow(0 0 5px rgba(59,130,246,0.5))' }}/>
          </div>
          {treinoHoje&&!treinoHoje.isDescanso ? (
            <>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:'-0.02em', marginBottom:4 }}>{treinoHoje.nome}</div>
              <div style={{ fontSize:12, color:'var(--text-1)', marginBottom:10 }}>{treinoHoje.grupos.join(' · ')} · {treinoHoje.exercicios.length} exercícios</div>
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
              <div style={{ fontSize:13, fontWeight:600, letterSpacing:'-0.02em', marginBottom:3 }}>Dia de Descanso</div>
              <div style={{ fontSize:11, color:'var(--text-2)' }}>Recuperação é parte do treino.</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:13, color:'var(--text-1)', marginBottom:8 }}>Configure um plano com seu Personal Trainer.</div>
              <span style={{ fontSize:11, color:'var(--blue)', display:'flex', alignItems:'center', gap:3 }}>Ir para Saúde <ChevronRight size={11}/></span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="card card-clickable animate-in-delay-2" onClick={()=>metaAtiva&&navigate('/crescimento')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div className="label">Meta em Andamento</div>
            <CalendarCheck size={14} color="var(--purple)" style={{ filter:'drop-shadow(0 0 5px rgba(139,92,246,0.5))' }}/>
          </div>
          {metaAtiva ? (
            <>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:'-0.02em', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{metaAtiva.titulo}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', marginBottom:9 }}>{metaAtiva.categoria}</div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:10, color:'var(--text-2)' }}>Progresso</span>
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
                  {diasAte(metaAtiva.prazo)>0?`⏳ ${diasAte(metaAtiva.prazo)} dias restantes`:'⚠ Prazo atingido'}
                </div>
              )}
            </>
          ) : (
            <div>
              <div style={{ fontSize:13, color:'var(--text-1)', marginBottom:9 }}>Defina metas com prazo para acompanhar aqui.</div>
              <span style={{ fontSize:11, color:'var(--blue)', display:'flex', alignItems:'center', gap:3 }}>Criar meta <ChevronRight size={11}/></span>
            </div>
          )}
        </div>

        {/* Bem-estar */}
        <div className="card card-clickable animate-in-delay-2" onClick={()=>navigate('/saude')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div className="label">Bem-estar</div>
            <Heart size={14} color="var(--red)" style={{ filter:'drop-shadow(0 0 5px rgba(239,68,68,0.5))' }}/>
          </div>
          {ultimoSono ? (
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <div style={{ flex:1, padding:'8px 10px', background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.14)', borderRadius:9 }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                  <Moon size={10} color="var(--blue)"/>
                  <span style={{ fontSize:9, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Sono</span>
                </div>
                <div style={{ fontSize:20, fontWeight:900, color:ultimoSono.horasDormidas>=7?'var(--green)':'var(--amber)', letterSpacing:'-0.04em' }}>{ultimoSono.horasDormidas}h</div>
                <div style={{ fontSize:10, color:'var(--text-2)' }}>{['','😫','😞','😐','😊','🌟'][ultimoSono.qualidade]} qualidade</div>
              </div>
              {ultimoSaude&&(
                <div style={{ flex:1, padding:'8px 10px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.14)', borderRadius:9 }}>
                  <div style={{ fontSize:9, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>Humor</div>
                  <div style={{ fontSize:20, fontWeight:900 }}>{['','😫','😞','😐','😊','🔥'][ultimoSaude.humor]}</div>
                  <div style={{ fontSize:10, color:'var(--text-2)' }}>Energia {['','😩','😕','😐','⚡','🚀'][ultimoSaude.energia]}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize:13, color:'var(--text-1)', marginBottom:10 }}>Registre sono e humor para acompanhar aqui.</div>
          )}
          <span style={{ fontSize:11, color:'var(--blue)', display:'flex', alignItems:'center', gap:3 }}>Ver saúde completa <ChevronRight size={11}/></span>
        </div>
      </div>

      {/* ── Atividade Heatmap + Quick Stats ────────────────────────────────── */}
      {habitos.length > 0 && (
        <div className="card animate-in-delay-2" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div className="label" style={{ marginBottom: 1 }}>Atividade — Últimas 12 Semanas</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                Completude diária de hábitos
              </div>
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
              <div className="label" style={{ marginBottom:2 }}>Tarefas</div>
              <div style={{ fontSize:13, color:'var(--text-1)' }}>
                <span style={{ fontWeight:700, color:'var(--text-0)' }}>{tarefas.filter(t=>!t.concluida).length}</span> pendentes
                <span style={{ color:'var(--text-2)' }}> · {tarefas.filter(t=>t.concluida).length} concluídas</span>
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
                  {f==='todas'?'Todas':f==='alta'?'🔴 Alta':'🟡 Média'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12, minHeight:110 }}>
            {tarefasFiltradas.slice(0,6).map(t=>(
              <button key={t.id} onClick={()=>alternarTarefa(t.id)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
                background:'rgba(255,255,255,0.025)', border:'1px solid var(--border-0)',
                borderRadius:7, cursor:'pointer', width:'100%', textAlign:'left',
                fontFamily:'inherit', transition:'all var(--t-fast)',
              }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.025)')}
              >
                <Circle size={14} color="var(--text-2)"/>
                <span style={{ flex:1, fontSize:12, color:'var(--text-0)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{t.titulo}</span>
                <PrioridadeBadge p={t.prioridade}/>
              </button>
            ))}
            {tarefasFiltradas.length===0&&(
              <div style={{ fontSize:13, color:'var(--text-2)', textAlign:'center', padding:'22px 0' }}>
                {filtroP==='todas'?'✅ Tudo concluído!':`Nenhuma tarefa de prioridade ${filtroP}.`}
              </div>
            )}
          </div>

          <form onSubmit={handleAdd} style={{ display:'flex', gap:7 }}>
            <input className="input-field" placeholder="Adicionar tarefa rápida..." value={novaTarefa} onChange={e=>setNovaTarefa(e.target.value)} style={{ fontSize:12 }}/>
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
              +{tarefasFiltradas.length-6} mais <ArrowRight size={11}/>
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
                <span style={{ fontSize:10, fontWeight:700, color:'var(--purple)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Insight de IA</span>
              </div>
              <Sparkles size={14} color="var(--purple)" style={{ filter:'drop-shadow(0 0 4px rgba(139,92,246,0.6))' }}/>
            </div>
            <p style={{ fontSize:13, color:'var(--text-0)', lineHeight:1.7, marginBottom:13, letterSpacing:'-0.01em' }}>{insight}</p>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--purple)', fontWeight:500 }}>
              Perguntar à IA <ArrowRight size={12}/>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <QuickStat icon={<Zap size={13} color="var(--amber)"/>} label="Focos hoje" val={String(focosHoje)} cor="var(--amber)" onClick={()=>navigate('/foco')}/>
            <QuickStat icon={<Trophy size={13} color="var(--purple)"/>} label="Streak máx." val={melhorStreak>0?`${melhorStreak}d`:'—'} cor="var(--purple)" onClick={()=>navigate('/habitos')}/>
          </div>
        </div>
      </div>

      {/* ── Insights Automáticos ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <BrainCircuit size={14} color="var(--blue)" />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>Insights Automáticos</span>
          <span style={{ fontSize: 10, color: 'var(--text-2)', marginLeft: 4 }}>baseados na sua atividade</span>
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
const PRIO_LBL = { alta:'Alta', media:'Média', baixa:'Baixa' }

function PrioridadeBadge({ p }: { p: string }) {
  const k = (p as keyof typeof PRIO_CLR) in PRIO_CLR ? p as keyof typeof PRIO_CLR : 'baixa'
  return (
    <span style={{ padding:'2px 6px', background:PRIO_BG[k], color:PRIO_CLR[k], border:`1px solid ${PRIO_BD[k]}`, borderRadius:4, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0 }}>
      {PRIO_LBL[k]}
    </span>
  )
}

function gerarInsightRapido({ habitos, tarefas, score, habitosHoje, treinoHoje }:{habitos:{datasConcluidas:string[];nome:string}[];tarefas:{concluida:boolean;prioridade:string}[];score:number;habitosHoje:number;treinoHoje?:string}) {
  if (treinoHoje) return `Seu treino de hoje é ${treinoHoje}. Combinar consistência na academia com seus hábitos diários separa resultados mediocres de transformações reais.`
  if (habitosHoje===0&&habitos.length>0) return `Você ainda não marcou nenhum hábito hoje. Iniciar sua rotina agora pode elevar sua Pontuação de Vida em até 30 pontos.`
  if (score>=80) return `Performance excelente — ${score}/100. Você está operando em alto nível. O efeito composto desta consistência se manifestará em resultados concretos.`
  const alta=tarefas.filter(t=>!t.concluida&&t.prioridade==='alta').length
  if (alta>2) return `${alta} tarefas de alta prioridade pendentes. Entre no Modo Foco e ataque uma por vez — 25 minutos de foco total vale mais que 2h de distração.`
  if (habitosHoje>0&&habitos.length>0) {
    const pct=Math.round((habitosHoje/habitos.length)*100)
    return `${pct}% dos hábitos concluídos. ${pct>=60?'Ótima consistência — você está no caminho certo.':'Cada hábito é um voto em quem você está se tornando. Empurre os restantes hoje.'}`
  }
  return `Configure hábitos, defina metas e registre seus treinos para que o FLOWOS gere insights personalizados sobre sua performance.`
}
