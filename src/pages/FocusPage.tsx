import { useState, useEffect, useRef } from 'react'
import { useFlowStore } from '../store'
import { useTranslation } from 'react-i18next'
import { Play, Pause, RotateCcw, CheckCircle2, Target, Zap } from 'lucide-react'

type ModoKey = 0 | 1 | 2

export default function FocusPage() {
  const { t } = useTranslation('focus')

  const MODOS = [
    { label: t('mode_focus'),       duracao: 25, cor: '#3b82f6', glow: 'rgba(59,130,246,0.2)'  },
    { label: t('mode_short_break'), duracao: 5,  cor: '#10b981', glow: 'rgba(16,185,129,0.2)'  },
    { label: t('mode_long_break'),  duracao: 15, cor: '#8b5cf6', glow: 'rgba(139,92,246,0.2)' },
  ]

  const tarefas        = useFlowStore(s => s.tarefas)
  const focosHoje      = useFlowStore(s => s.focosHoje)
  const incrementarFoco = useFlowStore(s => s.incrementarFoco)

  const [modoIdx, setModoIdx] = useState<ModoKey>(0)
  const [segundos, setSegundos] = useState(MODOS[0].duracao * 60)
  const [rodando, setRodando] = useState(false)
  const [tarefaSel, setTarefaSel] = useState('')
  const [sessoesLocais, setSessoesLocais] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const modo   = MODOS[modoIdx]
  const total  = modo.duracao * 60
  const progresso = 1 - segundos / total

  useEffect(() => {
    if (rodando) {
      intervalRef.current = setInterval(() => {
        setSegundos(s => {
          if (s <= 1) {
            setRodando(false)
            if (modoIdx === 0) { setSessoesLocais(c => c + 1); incrementarFoco() }
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [rodando, modoIdx, incrementarFoco])

  function selecionarModo(idx: ModoKey) {
    setModoIdx(idx); setSegundos(MODOS[idx].duracao * 60); setRodando(false)
  }
  function reiniciar() { setSegundos(modo.duracao * 60); setRodando(false) }

  const mins   = Math.floor(segundos / 60).toString().padStart(2, '0')
  const segs   = (segundos % 60).toString().padStart(2, '0')
  const C      = 2 * Math.PI * 120
  const offset = C - progresso * C
  const total2 = focosHoje + sessoesLocais

  return (
    <div style={{
      height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px', overflowY: 'auto', position: 'relative',
      background: rodando ? `radial-gradient(ellipse at 50% 40%, ${modo.glow} 0%, transparent 55%)` : 'transparent',
      transition: 'background 1.5s ease',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 30 }} className="animate-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <Target size={17} color={modo.cor} style={{ filter: `drop-shadow(0 0 5px ${modo.cor})` }}/>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' }}>{t('page_title')}</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-1)' }}>
            {t(total2 === 1 ? 'sessions_one' : 'sessions_other', { count: total2 })}
          </p>
        </div>

        {/* Seletor modo */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-0)',
          borderRadius: 12, padding: 4, marginBottom: 38,
          boxShadow: 'var(--shadow-sm)',
        }}>
          {MODOS.map((m, i) => (
            <button key={m.label} onClick={() => selecionarModo(i as ModoKey)} style={{
              flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: modoIdx === i ? 600 : 400, fontFamily: 'inherit',
              background: modoIdx === i ? `${m.cor}18` : 'transparent',
              border: `1px solid ${modoIdx === i ? `${m.cor}40` : 'transparent'}`,
              color: modoIdx === i ? m.cor : 'var(--text-1)',
              transition: 'all var(--t-base)',
              boxShadow: modoIdx === i ? `0 0 12px ${m.cor}20` : 'none',
            }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Timer ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 38 }}>
          <div style={{ position: 'relative', width: 280, height: 280 }}>
            {rodando && (
              <div style={{
                position: 'absolute', inset: -12, borderRadius: '50%',
                background: `radial-gradient(ellipse,${modo.glow} 0%,transparent 65%)`,
                pointerEvents: 'none',
                animation: 'fadeIn 0.5s ease',
              }}/>
            )}

            <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="140" cy="140" r="120" fill="none" stroke={`${modo.cor}10`} strokeWidth="14"/>
              <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
              <circle cx="140" cy="140" r="120" fill="none"
                stroke={modo.cor} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={offset}
                style={{
                  transition: rodando ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease',
                  filter: `drop-shadow(0 0 ${rodando ? '14px' : '7px'} ${modo.cor}${rodando ? '99' : '60'})`,
                }}
              />
            </svg>

            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <div style={{
                fontSize: 60, fontWeight: 900,
                letterSpacing: '-0.05em',
                fontVariantNumeric: 'tabular-nums',
                fontFamily: "'JetBrains Mono','Fira Code',monospace",
                lineHeight: 1,
                color: segundos === 0 ? modo.cor : 'var(--text-0)',
                textShadow: segundos === 0 ? `0 0 20px ${modo.cor}` : 'none',
                transition: 'color 0.3s, text-shadow 0.3s',
              }}>
                {mins}:{segs}
              </div>
              <div style={{ fontSize: 11, color: modo.cor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
                {modo.label}
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 34 }}>
          <button onClick={reiniciar} style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-0)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-1)', transition: 'all var(--t-fast)',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.color='var(--text-0)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='var(--text-1)'}}>
            <RotateCcw size={17}/>
          </button>

          <button onClick={() => setRodando(r => !r)} style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `linear-gradient(135deg, ${modo.cor}, ${modo.cor}cc)`,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: rodando
              ? `0 0 32px ${modo.cor}70, 0 0 64px ${modo.cor}25, 0 8px 24px rgba(0,0,0,0.5)`
              : `0 0 18px ${modo.cor}40, 0 4px 18px rgba(0,0,0,0.4)`,
            transition: 'box-shadow 0.4s ease, transform var(--t-fast)',
          }}
          onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.06)')}
          onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
            {rodando
              ? <Pause size={26} color="#fff" strokeWidth={2.5}/>
              : <Play  size={26} color="#fff" strokeWidth={2.5} style={{ marginLeft: 3 }}/>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 44 }}>
            {Array.from({ length: Math.min(sessoesLocais, 4) }).map((_, i) => (
              <CheckCircle2 key={i} size={18} color={modo.cor} style={{ filter: `drop-shadow(0 0 4px ${modo.cor})` }}/>
            ))}
            {sessoesLocais > 4 && <span style={{ fontSize: 12, color: modo.cor, fontWeight: 700 }}>+{sessoesLocais - 4}</span>}
          </div>
        </div>

        {/* Tarefa ativa */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '15px 17px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 11 }}>
            <Zap size={13} color={modo.cor} style={{ filter: `drop-shadow(0 0 4px ${modo.cor})` }}/>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('working_on')}
            </span>
          </div>
          {tarefas.filter(t => !t.concluida).length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--text-2)', textAlign: 'center', padding: '8px 0' }}>{t('all_tasks_done')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {tarefas.filter(tk => !tk.concluida).slice(0, 5).map(tk => (
                <button key={tk.id} onClick={() => setTarefaSel(tk.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px',
                  background: tarefaSel === tk.id ? `${modo.cor}12` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${tarefaSel === tk.id ? `${modo.cor}40` : 'var(--border-0)'}`,
                  borderRadius: 8, cursor: 'pointer', textAlign: 'left', width: '100%',
                  fontFamily: 'inherit', transition: 'all var(--t-fast)',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: tarefaSel === tk.id ? modo.cor : 'var(--text-2)', flexShrink: 0, transition: 'background var(--t-fast)' }}/>
                  <span style={{ fontSize: 13, color: tarefaSel === tk.id ? 'var(--text-0)' : 'var(--text-1)', fontWeight: tarefaSel === tk.id ? 500 : 400, letterSpacing: '-0.01em' }}>
                    {tk.titulo}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {rodando && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)', marginTop: 22, lineHeight: 1.55, animation: 'fadeIn 0.4s ease' }}>
            {t('close_distractions')}
          </p>
        )}
      </div>
    </div>
  )
}
