import { PublicShell } from '../../components/PublicShell'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

const SECTIONS = [
  {
    title: '1. Quais dados coletamos',
    body: `Coletamos apenas o que é necessário para calcular seu Life Score e personalizar a experiência:

• **Dados de hábitos**: nome, frequência, horário de conclusão, streaks.
• **Dados de foco**: duração das sessões, projeto associado, nível de concentração auto-relatado.
• **Dados financeiros**: categorias de gastos, metas, saldo (sem acesso a contas bancárias — você insere manualmente).
• **Dados de saúde**: sono (duração e qualidade auto-relatados), hidratação, dados opcionais do Google Fit / Apple Health.
• **Dados de conta**: e-mail, nome de exibição, foto de perfil (opcional).

Não coletamos localização, contatos, microfone, câmera ou qualquer dado sensível desnecessário.`,
  },
  {
    title: '2. Como usamos seus dados',
    body: `Seus dados são usados exclusivamente para:

• Calcular seu Life Score diário com a fórmula documentada publicamente.
• Gerar insights personalizados via Central IA (Claude) sobre seus padrões.
• Sincronizar seu estado entre dispositivos via Supabase.
• Melhorar o produto via métricas agregadas e anonimizadas.

**Nunca** vendemos, alugamos ou compartilhamos seus dados com terceiros para fins publicitários ou comerciais.`,
  },
  {
    title: '3. IA e seus dados',
    body: `Quando você usa a Central IA, seu histórico recente (configurável: 7, 30 ou 90 dias) é enviado como contexto para a API da Anthropic (Claude). Essa transmissão é protegida por TLS 1.3.

A Anthropic não armazena prompts de usuários de API por padrão. Consulte a política de privacidade da Anthropic para detalhes sobre retenção temporária de dados de API.`,
  },
  {
    title: '4. Segurança e armazenamento',
    body: `Seus dados são armazenados no Supabase (PostgreSQL) com Row Level Security ativa — nenhum usuário pode acessar dados de outro, nem mesmo acidentalmente via bug de aplicação.

Todos os dados são criptografados em repouso (AES-256) e em trânsito (TLS 1.3). Backups automáticos diários com retenção de 30 dias.

O acesso dos funcionários aos dados de produção é auditado, logado e requer autenticação de dois fatores.`,
  },
  {
    title: '5. Seus direitos (LGPD)',
    body: `Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem o direito de:

• **Acesso**: solicitar uma cópia de todos os seus dados em JSON ou CSV.
• **Correção**: editar qualquer dado incorreto diretamente no app.
• **Exclusão**: deletar sua conta e todos os dados associados permanentemente.
• **Portabilidade**: exportar seus dados para uso em outro serviço.
• **Revogação**: revogar o consentimento de coleta a qualquer momento.

Para exercer qualquer direito, acesse Configurações → Privacidade ou envie e-mail para privacidade@flowosapp.io.`,
  },
  {
    title: '6. Contato do DPO',
    body: `Nosso Encarregado de Proteção de Dados (DPO) pode ser contactado em:
privacidade@flowosapp.io · Tempo de resposta: até 5 dias úteis.`,
  },
]

export default function PrivacidadePage() {
  return (
    <PublicShell>
      <p className="pub-section-label">Política de Privacidade</p>
      <h1 className="pub-h1">
        Seus dados,<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>suas regras.</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 560, marginBottom: 16 }}>
        Construímos o FlowOS com privacidade como padrão — não como feature opcional. Esta política explica exatamente o que coletamos, por quê e como você tem controle total sobre isso.
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>Última atualização: 1 de maio de 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {SECTIONS.map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{title}</h2>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', lineHeight: 1.9, fontWeight: 300, whiteSpace: 'pre-line' }}>
              {body.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 4 }}>{line.replace(/\*\*/g, '')}</p>
                }
                if (line.startsWith('• ')) {
                  const parts = line.slice(2).split('**')
                  return (
                    <p key={i} style={{ paddingLeft: 16, marginBottom: 6 }}>
                      <span style={{ color: '#3b82f6', marginRight: 6 }}>·</span>
                      {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{p}</strong> : p)}
                    </p>
                  )
                }
                return line ? <p key={i} style={{ marginBottom: 8 }}>{line}</p> : <br key={i} />
              })}
            </div>
            <div className="pub-divider" />
          </div>
        ))}
      </div>
    </PublicShell>
  )
}
