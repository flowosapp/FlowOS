import { useTranslation } from 'react-i18next'
import { PublicShell } from '../../components/PublicShell'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

type Section = { title: string; body: string }

const PT: { label: string; h1: string[]; subtitle: string; updated: string; dpo: string; sections: Section[] } = {
  label: 'Política de Privacidade',
  h1: ['Seus dados,', 'suas regras.'],
  subtitle: 'Construímos o FlowOS com privacidade como padrão — não como feature opcional. Esta política explica exatamente o que coletamos, por quê e como você tem controle total sobre isso.',
  updated: 'Última atualização: 1 de maio de 2026 · Em conformidade com a LGPD (Lei 13.709/2018)',
  dpo: 'privacidade@flowosapp.io',
  sections: [
    {
      title: '1. Controlador dos Dados',
      body: 'O controlador dos seus dados pessoais é a FlowOS Tecnologia Ltda., CNPJ 00.000.000/0001-00, com sede em São Paulo, SP. Para questões de privacidade, nosso Encarregado de Proteção de Dados (DPO) está disponível em privacidade@flowosapp.io com tempo de resposta de até 5 dias úteis.',
    },
    {
      title: '2. Quais dados coletamos',
      body: `Coletamos apenas o mínimo necessário para calcular seu Life Score e personalizar a experiência:

• Dados de conta: e-mail, nome de exibição, foto de perfil (opcional), data de cadastro.
• Dados de hábitos: nome do hábito, frequência configurada, histórico de conclusões, streaks.
• Dados de foco: duração das sessões Pomodoro, projeto associado, nível de concentração auto-relatado.
• Dados financeiros: categorias de gastos, metas financeiras, saldos inseridos manualmente. Não temos acesso a contas bancárias.
• Dados de saúde: sono (duração e qualidade auto-relatados), hidratação, dados opcionais de wearables via integração voluntária.
• Dados de uso: páginas visitadas, funcionalidades usadas, erros técnicos (via PostHog, anonimizados).

Não coletamos: localização GPS, contatos do celular, microfone, câmera, dados biométricos ou qualquer dado sensível além do explicitamente listado acima.`,
    },
    {
      title: '3. Base legal e finalidades do tratamento',
      body: `Tratamos seus dados com base nas seguintes hipóteses legais da LGPD:

• Execução de contrato (art. 7°, V): dados de conta, hábitos, finanças e foco são necessários para prestar o serviço contratado.
• Consentimento (art. 7°, I): integrações com Google Fit, Apple Health e dados de saúde opcionais. Pode ser revogado a qualquer momento.
• Legítimo interesse (art. 7°, IX): métricas agregadas e anonimizadas para melhoria do produto.

Nunca usamos seus dados para publicidade de terceiros, criação de perfis para venda, tomada de decisões automatizadas com efeitos jurídicos ou qualquer finalidade não descrita nesta política.`,
    },
    {
      title: '4. IA e seus dados',
      body: `Quando você usa a Central IA, uma janela configurável do seu histórico (7, 30 ou 90 dias — ajustável em Configurações → IA) é enviada como contexto para a API da Anthropic. Essa transmissão usa TLS 1.3 e os dados são minimizados ao essencial para a resposta.

A Anthropic não armazena prompts de usuários de API por padrão e não usa esses dados para treinamento de modelos. Consulte a política de privacidade da Anthropic em anthropic.com/privacy para detalhes completos sobre retenção temporária.

Você pode desativar totalmente a Central IA e excluir seu histórico de conversas em Configurações → IA → Apagar histórico.`,
    },
    {
      title: '5. Compartilhamento com terceiros',
      body: `Seus dados podem ser compartilhados apenas com os seguintes subprocessadores, todos com contratos de proteção de dados vigentes:

• Supabase (Supabase Inc., EUA): armazenamento e autenticação. Cláusulas Contratuais Padrão da UE aplicáveis.
• Anthropic (Anthropic, EUA): processamento de prompts da Central IA. Conforme política de privacidade de API.
• Stripe (Stripe Inc., EUA): processamento de pagamentos. PCI-DSS nível 1. Não temos acesso a dados completos de cartão.
• Vercel (Vercel Inc., EUA): hospedagem e CDN.
• PostHog (PostHog Inc., EUA): analytics de uso, dados anonimizados.

Nenhum dado é vendido, alugado ou compartilhado com anunciantes, brokers de dados ou qualquer empresa não listada acima.`,
    },
    {
      title: '6. Segurança e armazenamento',
      body: `Seus dados são armazenados no Supabase com Row Level Security (RLS) ativa — nenhum usuário pode acessar dados de outro, nem mesmo por bug de aplicação. O acesso é validado a nível de banco de dados em cada query.

Medidas técnicas aplicadas: criptografia em repouso (AES-256), em trânsito (TLS 1.3), backups automáticos diários com retenção de 30 dias, autenticação de dois fatores obrigatória para acesso de equipe, logs de acesso auditados.

Em caso de incidente de segurança que afete seus dados, notificaremos por e-mail em até 72 horas conforme exigido pela LGPD.`,
    },
    {
      title: '7. Seus direitos (LGPD)',
      body: `Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem os seguintes direitos:

• Acesso: solicitar cópia de todos os seus dados em formato JSON ou CSV.
• Correção: editar qualquer dado incorreto diretamente no app em Configurações → Perfil.
• Exclusão: deletar sua conta e todos os dados associados permanentemente (Configurações → Conta → Excluir conta).
• Portabilidade: exportar seus dados para uso em outro serviço (Configurações → Exportar dados).
• Oposição: opor-se ao tratamento com base em legítimo interesse.
• Revogação de consentimento: desativar integrações opcionais (Google Fit, Apple Health) a qualquer momento.
• Informação sobre compartilhamento: saber com quem seus dados foram compartilhados.

Para exercer qualquer direito, acesse o app diretamente ou envie e-mail para privacidade@flowosapp.io. Responderemos em até 15 dias corridos.`,
    },
    {
      title: '8. Retenção e exclusão de dados',
      body: `Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, seus dados ficam disponíveis para exportação por 30 dias, após os quais são permanentemente excluídos, incluindo backups incrementais.

Dados anonimizados e agregados (sem possibilidade de reidentificação) podem ser mantidos indefinidamente para análise estatística do produto.

Dados de transações financeiras são mantidos pelo período exigido pela legislação fiscal brasileira (5 anos) mesmo após exclusão da conta, em formato mínimo e anonimizado.`,
    },
    {
      title: '9. Cookies e tecnologias de rastreamento',
      body: 'Usamos cookies exclusivamente para autenticação de sessão, preferências de idioma/tema e métricas de performance anonimizadas. Não usamos cookies de rastreamento cross-site, pixels de publicidade ou fingerprinting. Para detalhes completos, consulte nossa Política de Cookies em flowosapp.io/cookies.',
    },
    {
      title: '10. Alterações nesta política',
      body: 'Podemos atualizar esta política com aviso por e-mail com antecedência mínima de 30 dias para alterações materiais. A data de vigência e um resumo das mudanças serão destacados no e-mail e no topo desta página. O uso continuado do serviço após a data de vigência constitui aceite das novas condições. Versões anteriores disponíveis em privacidade@flowosapp.io.',
    },
  ],
}

const EN: typeof PT = {
  label: 'Privacy Policy',
  h1: ['Your data,', 'your rules.'],
  subtitle: 'We built FlowOS with privacy by default — not as an optional feature. This policy explains exactly what we collect, why, and how you have full control over it.',
  updated: 'Last updated: May 1, 2026 · Compliant with LGPD (Brazilian Data Protection Law) and GDPR principles',
  dpo: 'privacy@flowosapp.io',
  sections: [
    {
      title: '1. Data Controller',
      body: 'The data controller for your personal data is FlowOS Tecnologia Ltda., a company incorporated under Brazilian law, headquartered in São Paulo, SP, Brazil. For privacy matters, our Data Protection Officer (DPO) is available at privacy@flowosapp.io with a response time of up to 5 business days.',
    },
    {
      title: '2. Data We Collect',
      body: `We collect only the minimum necessary to calculate your Life Score and personalize your experience:

• Account data: email address, display name, profile photo (optional), registration date.
• Habit data: habit names, configured frequency, completion history, streaks.
• Focus data: Pomodoro session duration, associated project, self-reported concentration level.
• Financial data: spending categories, financial goals, manually entered balances. We have no access to bank accounts.
• Health data: sleep (self-reported duration and quality), hydration, optional wearable data via voluntary integration.
• Usage data: pages visited, features used, technical errors (via PostHog, anonymized).

We do NOT collect: GPS location, phone contacts, microphone, camera, biometric data, or any sensitive data beyond what is explicitly listed above.`,
    },
    {
      title: '3. Legal Basis and Processing Purposes',
      body: `We process your data based on the following legal grounds under LGPD (and equivalent GDPR bases where applicable):

• Contract performance: account, habit, finance and focus data are required to provide the contracted service.
• Consent: Google Fit, Apple Health integrations and optional health data. Can be withdrawn at any time.
• Legitimate interest: aggregated and anonymized metrics for product improvement.

We never use your data for third-party advertising, data brokering, automated decision-making with legal effects, or any purpose not described in this policy.`,
    },
    {
      title: '4. AI and Your Data',
      body: `When you use the AI Hub, a configurable window of your history (7, 30, or 90 days — adjustable in Settings → AI) is sent as context to the Anthropic API. This transmission uses TLS 1.3 and data is minimized to what is essential for the response.

Anthropic does not store API user prompts by default and does not use this data to train models. See Anthropic's privacy policy at anthropic.com/privacy for complete details on temporary retention.

You can disable the AI Hub entirely and delete your conversation history in Settings → AI → Delete history.`,
    },
    {
      title: '5. Third-Party Data Sharing',
      body: `Your data may be shared only with the following sub-processors, all under active data protection agreements:

• Supabase (Supabase Inc., USA): storage and authentication. Standard Contractual Clauses applicable for EU transfers.
• Anthropic (Anthropic, USA): AI Hub prompt processing. Per API privacy policy.
• Stripe (Stripe Inc., USA): payment processing. PCI-DSS Level 1. We have no access to full card data.
• Vercel (Vercel Inc., USA): hosting and CDN.
• PostHog (PostHog Inc., USA): usage analytics, anonymized data.

No data is sold, rented, or shared with advertisers, data brokers, or any company not listed above.`,
    },
    {
      title: '6. Security and Storage',
      body: `Your data is stored in Supabase with Row Level Security (RLS) active — no user can access another user's data, not even through an application bug. Access is validated at the database level on every query.

Applied technical measures: encryption at rest (AES-256), in transit (TLS 1.3), automatic daily backups with 30-day retention, mandatory two-factor authentication for team access, audited access logs.

In the event of a security incident affecting your data, we will notify you by email within 72 hours as required by applicable law.`,
    },
    {
      title: '7. Your Rights',
      body: `You have the following rights regarding your personal data:

• Access: request a copy of all your data in JSON or CSV format.
• Rectification: edit any incorrect data directly in the app under Settings → Profile.
• Erasure: delete your account and all associated data permanently (Settings → Account → Delete account).
• Data portability: export your data for use in another service (Settings → Export data).
• Objection: object to processing based on legitimate interest.
• Consent withdrawal: disable optional integrations (Google Fit, Apple Health) at any time.
• Information about sharing: know with whom your data has been shared.

To exercise any right, use the app directly or send an email to privacy@flowosapp.io. We will respond within 15 calendar days.`,
    },
    {
      title: '8. Data Retention and Deletion',
      body: `We retain your data while your account is active. After cancellation, your data is available for export for 30 days, after which it is permanently deleted, including incremental backups.

Anonymized and aggregated data (with no possibility of re-identification) may be retained indefinitely for product statistical analysis.

Financial transaction data is retained for the period required by Brazilian tax law (5 years) even after account deletion, in minimal and anonymized form.`,
    },
    {
      title: '9. Cookies and Tracking Technologies',
      body: 'We use cookies exclusively for session authentication, language/theme preferences, and anonymized performance metrics. We do not use cross-site tracking cookies, advertising pixels, or fingerprinting. For full details, see our Cookie Policy at flowosapp.io/cookies.',
    },
    {
      title: '10. Changes to This Policy',
      body: 'We may update this policy with at least 30 days\' email notice for material changes. The effective date and a summary of changes will be highlighted in the email and at the top of this page. Continued use of the service after the effective date constitutes acceptance of the new conditions. Previous versions available at privacy@flowosapp.io.',
    },
  ],
}

function renderBody(body: string) {
  return body.split('\n').map((line, i) => {
    if (line.startsWith('• ')) {
      const parts = line.slice(2).split('**')
      return (
        <p key={i} style={{ paddingLeft: 16, marginBottom: 6 }}>
          <span style={{ color: '#3b82f6', marginRight: 8 }}>·</span>
          {parts.map((p, j) => j % 2 === 1
            ? <strong key={j} style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{p}</strong>
            : p)}
        </p>
      )
    }
    return line ? <p key={i} style={{ marginBottom: 8 }}>{line}</p> : <br key={i} />
  })
}

export default function PrivacidadePage() {
  const { i18n } = useTranslation()
  const c = (i18n.language === 'en-US' || i18n.language.startsWith('en')) ? EN : PT

  return (
    <PublicShell>
      <p className="pub-section-label">{c.label}</p>
      <h1 className="pub-h1">
        {c.h1[0]}<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{c.h1[1]}</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 560, marginBottom: 16 }}>{c.subtitle}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>{c.updated}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {c.sections.map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{title}</h2>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', lineHeight: 1.9, fontWeight: 300 }}>
              {renderBody(body)}
            </div>
            <div className="pub-divider" />
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 28px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, marginTop: 16 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>
          {c.label === 'Privacy Policy' ? 'Questions? Contact our DPO at' : 'Dúvidas? Fale com nosso DPO em'}{' '}
          <span style={{ color: '#93c5fd' }}>{c.dpo}</span>
        </p>
      </div>
    </PublicShell>
  )
}
