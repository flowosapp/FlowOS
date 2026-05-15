import { useEffect, useRef } from 'react'
import { useFlowStore } from '../store'
import { agendarAlarmeViaSW } from '../services/pwa'

function hojeStr() {
  return new Date().toISOString().split('T')[0]
}

function proximoHorario(horaMinuto: string): Date {
  const [h, m] = horaMinuto.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function dispararNotificacao(title: string, body: string, tag: string, url = '/dashboard') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    tag,
    data: { url },
  })
}

export function useNotificationScheduler() {
  const notifPrefs = useFlowStore(s => s.notifPrefs)
  const habitos = useFlowStore(s => s.habitos)
  const transacoes = useFlowStore(s => s.transacoes)
  const metas = useFlowStore(s => s.metas)

  // Evita agendar o mesmo alarme mais de uma vez por sessão
  const agendadoRef = useRef<Record<string, boolean>>({})

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const hoje = hojeStr()
    const agora = new Date()
    const sesKey = `notif-sched-${hoje}`
    const jaAgendado = agendadoRef.current

    // ── Alarme de hábitos diários ──────────────────────────────────────────
    if (notifPrefs.habitosDiarios && !jaAgendado['habitos']) {
      const alarme = proximoHorario(notifPrefs.horaHabitos)
      const naoConcluidos = habitos.filter(h => !h.datasConcluidas.includes(hoje))

      if (naoConcluidos.length > 0 && alarme > agora) {
        const delay = alarme.getTime() - agora.getTime()
        agendarAlarmeViaSW(
          delay,
          `🔥 ${naoConcluidos.length} hábito${naoConcluidos.length > 1 ? 's' : ''} para hoje`,
          naoConcluidos.slice(0, 3).map(h => `${h.icone} ${h.nome}`).join(' · '),
          '/habitos',
        )
        jaAgendado['habitos'] = true
      }
    }

    // ── Alertas de vencimento financeiro ──────────────────────────────────
    if (notifPrefs.vencimentosFinanceiros && !jaAgendado['financas']) {
      const limite = new Date(agora)
      limite.setDate(limite.getDate() + notifPrefs.diasAntesVencimento)
      const limiteStr = limite.toISOString().split('T')[0]

      const vencendo = transacoes.filter(t =>
        t.status === 'pendente' &&
        t.tipo === 'gasto' &&
        t.dataVencimento >= hoje &&
        t.dataVencimento <= limiteStr
      )

      if (vencendo.length > 0) {
        const alarmeFinancas = proximoHorario(notifPrefs.horaAlertas)
        if (alarmeFinancas > agora) {
          const delay = alarmeFinancas.getTime() - agora.getTime()
          agendarAlarmeViaSW(
            delay,
            `💳 ${vencendo.length} pagamento${vencendo.length > 1 ? 's' : ''} próximo${vencendo.length > 1 ? 's' : ''}`,
            vencendo.slice(0, 2).map(t => t.descricao).join(', '),
            '/financas',
          )
          jaAgendado['financas'] = true
        }
      }
    }

    // ── Alertas de metas ──────────────────────────────────────────────────
    if (notifPrefs.metas && !jaAgendado['metas']) {
      const proximasMetas = metas.filter(m => {
        if (m.status !== 'ativa' || !m.prazo) return false
        const prazo = new Date(m.prazo)
        const diff = Math.ceil((prazo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
        return diff >= 0 && diff <= 7
      })

      if (proximasMetas.length > 0) {
        const alarme = proximoHorario(notifPrefs.horaAlertas)
        if (alarme > agora) {
          const delay = alarme.getTime() - agora.getTime()
          agendarAlarmeViaSW(
            delay + 60_000, // 1 min depois do alerta financeiro
            `🎯 ${proximasMetas.length} meta${proximasMetas.length > 1 ? 's' : ''} com prazo próximo`,
            proximasMetas.slice(0, 2).map(m => m.titulo).join(', '),
            '/crescimento',
          )
          jaAgendado['metas'] = true
        }
      }
    }

    // ── Alarme de acordar (sono) ───────────────────────────────────────────
    if (notifPrefs.sonoAlarme && !jaAgendado['sono']) {
      const alarme = proximoHorario(notifPrefs.horaAcordador)
      if (alarme > agora) {
        const delay = alarme.getTime() - agora.getTime()
        agendarAlarmeViaSW(
          delay,
          '⏰ Hora de acordar!',
          'Bom dia! Comece o dia com energia e foco.',
          '/saude',
        )
        jaAgendado['sono'] = true
      }
    }

    void sesKey
  }, [notifPrefs, habitos, transacoes, metas])

  // ── Verificação periódica (a cada 60s) quando o app está aberto ───────────
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const intervalo = setInterval(() => {
      const agora = new Date()
      const hoje = hojeStr()
      const hhmm = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`

      // Hábitos: dispara no minuto exato configurado
      if (notifPrefs.habitosDiarios && hhmm === notifPrefs.horaHabitos) {
        const naoConcluidos = habitos.filter(h => !h.datasConcluidas.includes(hoje))
        if (naoConcluidos.length > 0) {
          dispararNotificacao(
            `🔥 ${naoConcluidos.length} hábito${naoConcluidos.length > 1 ? 's' : ''} para hoje`,
            naoConcluidos.slice(0, 3).map(h => `${h.icone} ${h.nome}`).join(' · '),
            'flowos-habitos',
            '/habitos',
          )
        }
      }

      // Alarme de acordar
      if (notifPrefs.sonoAlarme && hhmm === notifPrefs.horaAcordador) {
        dispararNotificacao(
          '⏰ Hora de acordar!',
          'Bom dia! Comece o dia com energia e foco.',
          'flowos-sono',
          '/saude',
        )
      }

      // Finanças e metas — dispara no horário de alertas
      if (hhmm === notifPrefs.horaAlertas) {
        if (notifPrefs.vencimentosFinanceiros) {
          const limite = new Date(agora)
          limite.setDate(limite.getDate() + notifPrefs.diasAntesVencimento)
          const limiteStr = limite.toISOString().split('T')[0]
          const vencendo = transacoes.filter(t =>
            t.status === 'pendente' && t.tipo === 'gasto' &&
            t.dataVencimento >= hoje && t.dataVencimento <= limiteStr
          )
          if (vencendo.length > 0) {
            dispararNotificacao(
              `💳 ${vencendo.length} pagamento${vencendo.length > 1 ? 's' : ''} próximo${vencendo.length > 1 ? 's' : ''}`,
              vencendo.slice(0, 2).map(t => t.descricao).join(', '),
              'flowos-financas',
              '/financas',
            )
          }
        }

        if (notifPrefs.metas) {
          const proximasMetas = metas.filter(m => {
            if (m.status !== 'ativa' || !m.prazo) return false
            const prazo = new Date(m.prazo)
            const diff = Math.ceil((prazo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
            return diff >= 0 && diff <= 7
          })
          if (proximasMetas.length > 0) {
            setTimeout(() => dispararNotificacao(
              `🎯 ${proximasMetas.length} meta${proximasMetas.length > 1 ? 's' : ''} com prazo próximo`,
              proximasMetas.slice(0, 2).map(m => m.titulo).join(', '),
              'flowos-metas',
              '/crescimento',
            ), 5000)
          }
        }
      }
    }, 60_000)

    return () => clearInterval(intervalo)
  }, [notifPrefs, habitos, transacoes, metas])
}
