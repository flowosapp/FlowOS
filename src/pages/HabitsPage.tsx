import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFlowStore } from '../store'
import { CheckCircle2, Circle, Flame, Plus, Trash2, X } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { dispararConfetti } from '../utils/confetti'
import { track, Events } from '../services/analytics'

const ICONES = ['⚡', '🎯', '💪', '🧘', '📚', '✍️', '🌙', '💧', '🥗', '🚀', '🎨', '🧠', '❤️', '☀️', '🏃', '🎵', '🌿', '💼']
const CORES = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

function ultimos21Dias(): string[] {
  const dias: string[] = []
  for (let i = 20; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dias.push(d.toISOString().split('T')[0])
  }
  return dias
}

export default function HabitsPage() {
  const { t } = useTranslation(['habits', 'common'])
  const habitos = useFlowStore(s => s.habitos)
  const alternarHabito = useFlowStore(s => s.alternarHabito)
  const adicionarHabito = useFlowStore(s => s.adicionarHabito)
  const removerHabito = useFlowStore(s => s.removerHabito)

  const toast = useToast()

  const [showAdd, setShowAdd] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoIcone, setNovoIcone] = useState('⚡')
  const [novaCor, setNovaCor] = useState('#3b82f6')
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const hoje = new Date().toISOString().split('T')[0]
  const ultimos21 = ultimos21Dias()
  const feitosHoje = habitos.filter(h => h.datasConcluidas.includes(hoje)).length
  const streakMedio = habitos.length > 0
    ? Math.round(habitos.reduce((s, h) => s + h.streak, 0) / habitos.length)
    : 0

  function handleAdicionar(e: React.FormEvent) {
    e.preventDefault()
    if (!novoNome.trim()) return
    adicionarHabito(novoNome.trim(), novoIcone, novaCor)
    track(Events.HABIT_CREATED)
    setNovoNome('')
    setNovoIcone('⚡')
    setNovaCor('#3b82f6')
    setShowAdd(false)
    toast.success(`Hábito "${novoNome.trim()}" adicionado!`, '🔥')
  }

  function handleAlternar(habitoId: string, data: string) {
    const habito = habitos.find(h => h.id === habitoId)
    if (!habito) return
    const jaConcluido = habito.datasConcluidas.includes(data)

    alternarHabito(habitoId, data)

    if (!jaConcluido) {
      setCheckedIds(ids => new Set([...ids, habitoId]))
      setTimeout(() => setCheckedIds(ids => { const n = new Set(ids); n.delete(habitoId); return n }), 400)

      // Confetti quando todos os hábitos são concluídos
      const totalFeitos = habitos.filter(h => h.id !== habitoId ? h.datasConcluidas.includes(data) : true).length
      if (totalFeitos === habitos.length) {
        toast.success('Todos os hábitos concluídos hoje! 🎉', '🏆')
        setTimeout(() => dispararConfetti({ y: window.innerHeight * 0.4 }), 120)
      }
    }
  }

  return (
    <div className="page-container animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">
            {t('done_today', { done: feitosHoje, total: habitos.length })}
            {habitos.length > 0 && ` · ${t('avg_streak', { days: streakMedio })}`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ gap: 6 }}>
          <Plus size={15} />
          {t('new_habit')}
        </button>
      </div>

      {/* Modal adicionar */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('new_habit')}</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdicionar}>
              <div style={{ marginBottom: 16 }}>
                <label className="label">{t('habit_name')}</label>
                <input className="input-field" placeholder={t('habit_name_placeholder')} value={novoNome} onChange={e => setNovoNome(e.target.value)} autoFocus />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">{t('icon')}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ICONES.map(icone => (
                    <button key={icone} type="button" onClick={() => setNovoIcone(icone)}
                      style={{ width: 36, height: 36, background: novoIcone === icone ? 'var(--accent-glow)' : 'rgba(255,255,255,0.04)', border: `1px solid ${novoIcone === icone ? 'var(--border-accent)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {icone}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">{t('color')}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {CORES.map(c => (
                    <button key={c} type="button" onClick={() => setNovaCor(c)}
                      style={{ width: 28, height: 28, background: c, border: novaCor === c ? '2px solid #fff' : '2px solid transparent', borderRadius: '50%', cursor: 'pointer', boxShadow: novaCor === c ? `0 0 12px ${c}60` : 'none' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>{t('common:cancel')}</button>
                <button type="submit" className="btn-primary" disabled={!novoNome.trim()} style={{ flex: 2, opacity: novoNome.trim() ? 1 : 0.4 }}>{t('add_habit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {habitos.length === 0 ? (
        <EstadoVazio onAdicionar={() => setShowAdd(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {habitos.map(habito => {
            const feitoHoje = habito.datasConcluidas.includes(hoje)
            return (
              <div key={habito.id} style={{ background: 'var(--bg-surface)', border: `1px solid ${feitoHoje ? `${habito.cor}30` : 'var(--border)'}`, borderRadius: 14, padding: '16px 20px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <button onClick={() => handleAlternar(habito.id, hoje)}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: feitoHoje ? `${habito.cor}20` : 'rgba(255,255,255,0.04)', border: `2px solid ${feitoHoje ? habito.cor : 'var(--border-strong)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', fontSize: 18 }}>
                    {feitoHoje
                      ? <CheckCircle2 key={`done-${habito.id}`} size={18} color={habito.cor} className={checkedIds.has(habito.id) ? 'check-pop' : ''} />
                      : <Circle size={18} color="var(--text-dim)" />}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 22 }}>{habito.icone}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: feitoHoje ? habito.cor : 'var(--text-primary)' }}>{habito.nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>{feitoHoje ? 'Concluído hoje ✓' : 'Pendente hoje'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
                    <Flame size={15} color={habito.streak > 0 ? '#f59e0b' : 'var(--text-dim)'} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: habito.streak > 0 ? '#f59e0b' : 'var(--text-dim)' }}>{habito.streak}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{habito.streak === 1 ? 'dia' : 'dias'}</span>
                  </div>
                  <button onClick={() => { removerHabito(habito.id); toast.info(`"${habito.nome}" removido.`) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 6, borderRadius: 6, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <Trash2 size={15} />
                  </button>
                </div>
                {/* Calendário 21 dias */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {ultimos21.map(d => {
                    const feito = habito.datasConcluidas.includes(d)
                    const ehHoje = d === hoje
                    return (
                      <button key={d} onClick={() => handleAlternar(habito.id, d)} title={d}
                        style={{ flex: 1, height: 8, borderRadius: 2, background: feito ? habito.cor : 'rgba(255,255,255,0.05)', border: ehHoje ? `1px solid ${habito.cor}80` : 'none', cursor: 'pointer', transition: 'all 0.1s', opacity: feito ? 1 : 0.4, boxShadow: feito ? `0 0 4px ${habito.cor}60` : 'none' }} />
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>21 dias atrás</span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Hoje</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EstadoVazio({ onAdicionar }: { onAdicionar: () => void }) {
  const { t } = useTranslation('habits')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 0', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ fontSize: 56, marginBottom: 18, animation: 'float 3s ease-in-out infinite', lineHeight: 1 }}>🔥</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>{t('no_habits_title')}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-1)', marginBottom: 10, maxWidth: 300, lineHeight: 1.7 }}>
        {t('no_habits_desc')}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 28, maxWidth: 280, lineHeight: 1.6 }}>
        {t('no_habits_quote')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        <button className="btn-primary" onClick={onAdicionar} style={{ gap: 7 }}>
          <Plus size={15} />
          {t('add_habit')}
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
          {t('suggestions')}
        </span>
      </div>
    </div>
  )
}
