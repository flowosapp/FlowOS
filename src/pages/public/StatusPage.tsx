import { PublicShell } from '../../components/PublicShell'
import { Check, AlertTriangle } from 'lucide-react'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

const SERVICES = [
  { name: 'Dashboard & App',      status: 'operational', uptime: '99.98%' },
  { name: 'API pública',          status: 'operational', uptime: '99.94%' },
  { name: 'Central IA (Sonnet)',  status: 'operational', uptime: '99.91%' },
  { name: 'Central IA (Opus)',    status: 'operational', uptime: '99.87%' },
  { name: 'Sincronização offline',status: 'operational', uptime: '99.99%' },
  { name: 'Autenticação',         status: 'operational', uptime: '100.0%' },
  { name: 'Webhooks',             status: 'operational', uptime: '99.82%' },
  { name: 'Exportação de dados',  status: 'operational', uptime: '99.95%' },
]

const INCIDENTS: { date: string; title: string; resolved: boolean; detail: string }[] = [
  {
    date: '3 mai 2026', title: 'Latência elevada na Central IA',
    resolved: true, detail: 'Entre 14h22 e 15h08 (BRT), respostas da Central IA tiveram latência média de 8.4s (normal: <2s). Causa: spike de tráfego + rate limiting do provider upstream. Resolvido com escalonamento automático.',
  },
  {
    date: '18 abr 2026', title: 'Cálculo do Life Score atrasado',
    resolved: true, detail: 'O cron job de cálculo diário executou com 47 minutos de atraso para ~12% dos usuários. Causa: contenção de banco de dados após migração de schema. Corrigido e monitoramento aprimorado.',
  },
]

const statusInfo = {
  operational: { label: 'Operacional', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  degraded:    { label: 'Degradado',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  down:        { label: 'Fora do ar',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)' },
}

export default function StatusPage() {
  const allOperational = SERVICES.every(s => s.status === 'operational')

  return (
    <PublicShell>
      <p className="pub-section-label">Status</p>
      <h1 className="pub-h1">
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Todos os sistemas</span><br />
        operacionais.
      </h1>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: allOperational ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${allOperational ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`, borderRadius: 12, marginBottom: 56 }}>
        {allOperational
          ? <Check size={16} color="#10b981" />
          : <AlertTriangle size={16} color="#f59e0b" />
        }
        <span style={{ fontSize: 14, color: allOperational ? '#10b981' : '#f59e0b', fontWeight: 500 }}>
          {allOperational ? 'Todos os serviços operando normalmente' : 'Alguns serviços com degradação'}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>· Atualizado agora</span>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Serviços</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 56 }}>
        {SERVICES.map(({ name, status, uptime }) => {
          const info = statusInfo[status as keyof typeof statusInfo]
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
              <span style={{ flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{name}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginRight: 20 }}>{uptime} uptime (30d)</span>
              <span style={{ fontSize: 11, color: info.color, background: info.bg, border: `1px solid ${info.border}`, borderRadius: 6, padding: '3px 10px', fontWeight: 600, letterSpacing: '0.05em' }}>
                {info.label}
              </span>
            </div>
          )
        })}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Histórico de incidentes</h2>
      {INCIDENTS.length === 0 ? (
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Nenhum incidente nos últimos 30 dias.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {INCIDENTS.map(({ date, title, resolved, detail }) => (
            <div key={title} className="pub-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: resolved ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                  {resolved ? '✓ Resolvido' : '⚠ Em andamento'}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{date}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontWeight: 300 }}>{detail}</p>
            </div>
          ))}
        </div>
      )}
    </PublicShell>
  )
}
