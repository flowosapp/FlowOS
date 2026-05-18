import { useTranslation } from 'react-i18next'
import { PublicShell } from '../../components/PublicShell'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

type Section = { title: string; body: string }

const PT: { label: string; h1: string[]; subtitle: string; updated: string; contact: string; email: string; sections: Section[] } = {
  label: 'Termos de Serviço',
  h1: ['Regras claras,', 'sem letras miúdas.'],
  subtitle: 'Acreditamos em transparência. Nossos termos foram escritos para ser lidos, não para confundir.',
  updated: 'Última atualização: 1 de maio de 2026 · Vigência: imediata para novos usuários',
  contact: 'Dúvidas sobre estes termos? Fale com nosso time jurídico em',
  email: 'legal@flowosapp.io',
  sections: [
    {
      title: '1. Aceitação dos Termos',
      body: 'Ao criar uma conta ou usar o FlowOS, você concorda com estes Termos de Serviço. Se não concordar, não utilize o serviço. Estes termos constituem um contrato legal vinculante entre você ("Usuário") e a FlowOS Tecnologia Ltda. ("FlowOS"). O uso continuado após alterações publicadas implica aceite das novas condições.',
    },
    {
      title: '2. Descrição do Serviço',
      body: 'O FlowOS é uma plataforma SaaS de gestão de vida pessoal que oferece: rastreamento de hábitos com streak automático; controle financeiro pessoal; Modo Foco com timer Pomodoro; módulo de saúde e sono; Central IA com coaching baseado em seus dados; e Life Score diário. O serviço é acessado via web (flowosapp.io) e PWA instalável em dispositivos móveis.',
    },
    {
      title: '3. Elegibilidade',
      body: 'Você deve ter pelo menos 18 anos para usar o FlowOS. Ao aceitar estes termos, declara ser maior de idade ou ter autorização expressa de um responsável legal. É proibido criar contas em nome de terceiros sem autorização. Organizações podem contratar o plano Flow+ para múltiplos usuários mediante acordo separado.',
    },
    {
      title: '4. Conta e Segurança',
      body: 'Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente em seguranca@flowosapp.io caso suspeite de acesso não autorizado. O FlowOS não pode ser responsabilizado por perdas decorrentes de uso não autorizado de sua conta causado por negligência do usuário.',
    },
    {
      title: '5. Planos, Preços e Cobrança',
      body: 'Os planos Starter (R$29/mês), Pro (R$49/mês) e Flow+ (R$129/mês) são cobrados mensalmente via cartão de crédito, processado pela Stripe. A cobrança é automática no mesmo dia de cada mês. Upgrades têm efeito imediato com crédito proporcional ao tempo restante. Downgrades entram em vigor no início do próximo ciclo. Preços podem ser ajustados com aviso de 30 dias por e-mail.',
    },
    {
      title: '6. Período de Teste Gratuito',
      body: 'O plano Starter inclui 15 dias de teste gratuito. Nenhum valor é cobrado durante o trial. Ao final do período, a cobrança mensal começa automaticamente, salvo cancelamento antes do término. Cada CPF/e-mail tem direito a um único período de trial. O FlowOS reserva-se o direito de encerrar trials de contas criadas de forma fraudulenta.',
    },
    {
      title: '7. Cancelamento e Rescisão',
      body: 'Você pode cancelar a assinatura a qualquer momento em Configurações → Conta → Cancelar Plano. O acesso ao plano continua até o fim do período já pago. Após o cancelamento, seus dados ficam disponíveis para exportação por 30 dias; depois são permanentemente excluídos, incluindo backups. O FlowOS pode suspender ou encerrar contas que violem estes termos, com aviso prévio de 48 horas, exceto em casos de violações graves de segurança ou fraude.',
    },
    {
      title: '8. Política de Reembolso',
      body: 'Não há reembolsos para períodos já faturados, exceto: (a) em caso de indisponibilidade comprovada do serviço por mais de 72 horas consecutivas no período pago; (b) por determinação legal aplicável. Erros de cobrança serão corrigidos integralmente. Solicitações de reembolso devem ser enviadas para financeiro@flowosapp.io com a descrição do problema.',
    },
    {
      title: '9. Propriedade Intelectual',
      body: 'O FlowOS — incluindo código-fonte, design, marca, logotipo, algoritmos de Life Score e interfaces — é propriedade exclusiva da FlowOS Tecnologia Ltda., protegido pelas leis brasileiras e internacionais de propriedade intelectual. Os dados que você insere (hábitos, finanças, anotações) são de sua propriedade exclusiva. Concedemos ao FlowOS licença não exclusiva e limitada para processar esses dados unicamente com a finalidade de operar o serviço.',
    },
    {
      title: '10. Uso Aceitável',
      body: 'Você concorda em não: (a) violar leis aplicáveis; (b) tentar acessar dados de outros usuários; (c) realizar engenharia reversa da plataforma; (d) usar a API de forma que exceda os limites documentados; (e) criar contas automatizadas em massa; (f) transmitir malware ou código malicioso; (g) usar o serviço para fins comerciais não autorizados; (h) publicar conteúdo que viole direitos de terceiros.',
    },
    {
      title: '11. Disponibilidade e SLA',
      body: 'O FlowOS se compromete a manter disponibilidade mínima de 99,5% mensais, excluindo janelas de manutenção programada (comunicadas com 48h de antecedência). Indisponibilidade causada por força maior, ações de terceiros (Supabase, Anthropic, Stripe, Vercel) ou desastres naturais não contam para o cálculo de SLA. Métricas de uptime são publicadas em tempo real em flowosapp.io/status.',
    },
    {
      title: '12. Limitação de Responsabilidade',
      body: 'Na extensão máxima permitida pela lei brasileira, o FlowOS não é responsável por: danos indiretos ou consequentes; perda de dados causada por ação ou omissão do usuário; interrupções de serviços de terceiros fora do nosso controle; decisões financeiras, de saúde ou de negócios baseadas nos dados ou insights da plataforma. Nossa responsabilidade total está limitada ao valor pago nos últimos 12 meses de assinatura.',
    },
    {
      title: '13. Alterações nos Termos',
      body: 'Podemos atualizar estes termos mediante notificação por e-mail com antecedência mínima de 30 dias. Alterações materiais serão destacadas no e-mail e na plataforma. O uso continuado do serviço após a data de vigência das novas condições constitui aceite. Versões anteriores estão disponíveis sob solicitação para legal@flowosapp.io.',
    },
    {
      title: '14. Foro e Lei Aplicável',
      body: 'Estes termos são regidos pelas leis da República Federativa do Brasil, em especial o Código Civil (Lei 10.406/02), o CDC (Lei 8.078/90) e o Marco Civil da Internet (Lei 12.965/14). Disputas serão resolvidas no foro da Comarca de São Paulo, SP, com renúncia a qualquer outro, por mais privilegiado que seja. Consumidores que se enquadrem no CDC podem optar pelo foro de seu domicílio.',
    },
  ],
}

const EN: typeof PT = {
  label: 'Terms of Service',
  h1: ['Clear rules,', 'no fine print.'],
  subtitle: 'We believe in transparency. Our terms were written to be read, not to confuse.',
  updated: 'Last updated: May 1, 2026 · Effective: immediately for new users',
  contact: 'Questions about these terms? Contact our legal team at',
  email: 'legal@flowosapp.io',
  sections: [
    {
      title: '1. Acceptance of Terms',
      body: 'By creating an account or using FlowOS, you agree to these Terms of Service. If you disagree, do not use the service. These terms constitute a legally binding contract between you ("User") and FlowOS Tecnologia Ltda. ("FlowOS"). Continued use after published changes implies acceptance of the new conditions.',
    },
    {
      title: '2. Service Description',
      body: 'FlowOS is a personal life management SaaS platform that offers: habit tracking with automatic streaks; personal finance control; Focus Mode with Pomodoro timer; health and sleep module; AI Hub with coaching based on your data; and a daily Life Score. The service is accessed via web (flowosapp.io) and an installable PWA on mobile devices.',
    },
    {
      title: '3. Eligibility',
      body: 'You must be at least 18 years old to use FlowOS. By accepting these terms, you declare that you are of legal age or have express authorization from a legal guardian. It is prohibited to create accounts on behalf of third parties without authorization. Organizations may contract the Flow+ plan for multiple users under a separate agreement.',
    },
    {
      title: '4. Account and Security',
      body: 'You are responsible for maintaining the confidentiality of your access credentials and all activities carried out in your account. Notify us immediately at security@flowosapp.io if you suspect unauthorized access. FlowOS cannot be held liable for losses arising from unauthorized use of your account caused by user negligence.',
    },
    {
      title: '5. Plans, Pricing and Billing',
      body: 'The Starter ($9/month), Pro ($19/month) and Flow+ ($49/month) plans are billed monthly via credit card, processed by Stripe. Billing is automatic on the same day each month. Upgrades take effect immediately with proportional credit for the remaining time. Downgrades take effect at the start of the next billing cycle. Prices may be adjusted with 30 days\' notice by email.',
    },
    {
      title: '6. Free Trial',
      body: 'The Starter plan includes a 15-day free trial. No amount is charged during the trial. At the end of the period, monthly billing begins automatically unless cancelled before it ends. Each email address is entitled to a single trial period. FlowOS reserves the right to terminate trials of fraudulently created accounts.',
    },
    {
      title: '7. Cancellation and Termination',
      body: 'You can cancel your subscription at any time in Settings → Account → Cancel Plan. Access to the plan continues until the end of the already-paid period. After cancellation, your data is available for export for 30 days; then it is permanently deleted, including backups. FlowOS may suspend or terminate accounts that violate these terms, with 48 hours\' prior notice, except in cases of serious security violations or fraud.',
    },
    {
      title: '8. Refund Policy',
      body: 'No refunds are issued for periods already billed, except: (a) in cases of proven service unavailability for more than 72 consecutive hours in the paid period; (b) as required by applicable law. Billing errors will be corrected in full. Refund requests must be sent to billing@flowosapp.io with a description of the issue.',
    },
    {
      title: '9. Intellectual Property',
      body: 'FlowOS — including source code, design, brand, logo, Life Score algorithms and interfaces — is the exclusive property of FlowOS Tecnologia Ltda., protected by Brazilian and international intellectual property laws. The data you enter (habits, finances, notes) is your exclusive property. You grant FlowOS a non-exclusive, limited license to process this data solely for the purpose of operating the service.',
    },
    {
      title: '10. Acceptable Use',
      body: 'You agree not to: (a) violate applicable laws; (b) attempt to access other users\' data; (c) reverse engineer the platform; (d) use the API in ways that exceed documented limits; (e) create automated accounts in bulk; (f) transmit malware or malicious code; (g) use the service for unauthorized commercial purposes; (h) publish content that violates third-party rights.',
    },
    {
      title: '11. Availability and SLA',
      body: 'FlowOS commits to maintaining minimum availability of 99.5% monthly, excluding scheduled maintenance windows (communicated 48h in advance). Unavailability caused by force majeure, third-party actions (Supabase, Anthropic, Stripe, Vercel) or natural disasters do not count toward SLA calculation. Uptime metrics are published in real-time at flowosapp.io/status.',
    },
    {
      title: '12. Limitation of Liability',
      body: 'To the maximum extent permitted by applicable law, FlowOS is not responsible for: indirect or consequential damages; data loss caused by user action or omission; interruptions of third-party services beyond our control; financial, health or business decisions based on platform data or insights. Our total liability is limited to amounts paid in the last 12 months of subscription.',
    },
    {
      title: '13. Changes to Terms',
      body: 'We may update these terms with at least 30 days\' email notice. Material changes will be highlighted in the email and on the platform. Continued use of the service after the effective date of the new conditions constitutes acceptance. Previous versions are available upon request at legal@flowosapp.io.',
    },
    {
      title: '14. Governing Law and Jurisdiction',
      body: 'These terms are governed by the laws of the Federative Republic of Brazil. Disputes will be resolved in the courts of São Paulo, SP, waiving any other jurisdiction, however privileged. Users who qualify as consumers under Brazilian law (CDC) may opt for the court of their domicile.',
    },
  ],
}

function renderBody(body: string) {
  return body.split('\n').map((line, i) => (
    line ? <p key={i} style={{ marginBottom: 6 }}>{line}</p> : <br key={i} />
  ))
}

export default function TermosPage() {
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
          {c.contact} <span style={{ color: '#93c5fd' }}>{c.email}</span>
        </p>
      </div>
    </PublicShell>
  )
}
