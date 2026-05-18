import { useTranslation } from 'react-i18next'
import { PublicShell } from '../../components/PublicShell'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

type Section = { title: string; body: string }

const PT: { label: string; h1: string[]; subtitle: string; updated: string; contact: string; email: string; sections: Section[] } = {
  label: 'Contrato de Assinatura',
  h1: ['Seu acordo com', 'o FlowOS.'],
  subtitle: 'Este é o contrato que rege sua relação com o FlowOS. Redigido de forma clara para que você saiba exatamente o que está contratando.',
  updated: 'Versão: 1.0 · Vigência: 1 de maio de 2026 · Partes: você e a FlowOS Tecnologia Ltda.',
  contact: 'Dúvidas contratuais? Envie para',
  email: 'legal@flowosapp.io',
  sections: [
    {
      title: '1. Identificação das Partes',
      body: `Este Contrato de Assinatura de Serviço ("Contrato") é celebrado entre:

CONTRATANTE: Você, pessoa física maior de 18 anos, identificada pelo e-mail cadastrado na plataforma ("Usuário" ou "Assinante").

CONTRATADA: FlowOS Tecnologia Ltda., pessoa jurídica de direito privado, CNPJ 00.000.000/0001-00, com sede em São Paulo, SP, Brasil, proprietária e operadora da plataforma FlowOS acessível em flowosapp.io ("FlowOS" ou "Empresa").

Ao criar uma conta e assinar qualquer plano, o Usuário declara ter lido, compreendido e concordado integralmente com este Contrato, com os Termos de Serviço e com a Política de Privacidade do FlowOS.`,
    },
    {
      title: '2. Objeto do Contrato',
      body: `O objeto deste Contrato é a prestação, pelo FlowOS, de acesso à plataforma SaaS de gestão de vida pessoal, mediante assinatura mensal recorrente, nos seguintes planos:

Plano Starter — R$29/mês: acesso ao Dashboard + Life Score, hábitos ilimitados, Modo Foco (Pomodoro), finanças básicas, PWA mobile e suporte por e-mail. Inclui trial gratuito de 15 dias na primeira assinatura.

Plano Pro — R$49/mês: inclui tudo do Starter, mais Central IA ilimitada, finanças avançadas com metas, relatórios semanais de IA, saúde e sono avançados e suporte prioritário.

Plano Flow+ — R$129/mês: inclui tudo do Pro, mais IA avançada (Gemini Pro), múltiplos perfis/família, acesso à API pública, onboarding 1:1 personalizado e SLA de suporte dedicado.

As funcionalidades detalhadas de cada plano estão descritas em flowosapp.io/precos e podem ser atualizadas conforme disposto na cláusula 9 deste Contrato.`,
    },
    {
      title: '3. Período de Teste Gratuito',
      body: `O plano Starter inclui um período de teste gratuito de 15 (quinze) dias, aplicável apenas à primeira assinatura por CPF e/ou endereço de e-mail.

Durante o trial: nenhum valor é cobrado, o Assinante tem acesso completo às funcionalidades do plano Starter, e pode cancelar a qualquer momento sem ônus.

Ao término do período de trial sem cancelamento, a assinatura é convertida automaticamente em paga, com a primeira cobrança realizada no 16° dia pelo método de pagamento cadastrado.

O FlowOS reserva-se o direito de encerrar trials de contas criadas fraudulentamente ou que violem os Termos de Serviço, sem necessidade de aviso prévio.`,
    },
    {
      title: '4. Preço e Condições de Pagamento',
      body: `Os valores de assinatura são os descritos na cláusula 2, cobrados mensalmente de forma recorrente no cartão de crédito cadastrado, processado via Stripe (PCI-DSS nível 1).

A cobrança ocorre automaticamente na mesma data do início da assinatura em cada mês subsequente. Em caso de falha na cobrança, o FlowOS tentará novamente em 3, 5 e 7 dias; após 3 falhas, a conta será suspensa com aviso por e-mail.

Upgrades: têm efeito imediato. O valor proporcional ao período restante do ciclo atual é creditado como desconto na nova cobrança.

Downgrades: entram em vigor no início do próximo ciclo de cobrança. O Assinante mantém as funcionalidades do plano atual até o fim do ciclo já pago.

Todos os preços são em Reais (BRL) e incluem os impostos aplicáveis. Para usuários internacionais, os preços são exibidos em USD conforme a paridade vigente.`,
    },
    {
      title: '5. Obrigações do FlowOS',
      body: `O FlowOS se compromete a:

• Disponibilizar a plataforma com uptime mínimo de 99,5% mensais, excluindo janelas de manutenção programada (comunicadas com 48h de antecedência).
• Publicar métricas de disponibilidade em tempo real em flowosapp.io/status.
• Manter os dados do Assinante com segurança conforme descrito na Política de Privacidade.
• Notificar o Assinante com antecedência mínima de 30 dias sobre alterações de preço ou funcionalidades materiais.
• Prestar suporte conforme o nível do plano contratado: e-mail (Starter), prioritário (Pro), SLA dedicado (Flow+).
• Cumprir integralmente a LGPD e demais normas aplicáveis à proteção de dados pessoais.`,
    },
    {
      title: '6. Obrigações do Assinante',
      body: `O Assinante se compromete a:

• Fornecer informações verdadeiras e atualizadas no cadastro.
• Manter a confidencialidade de suas credenciais de acesso.
• Usar a plataforma apenas para fins lícitos e conforme os Termos de Serviço.
• Não compartilhar o acesso à conta com terceiros (exceto planos com múltiplos perfis).
• Manter dados de pagamento válidos para garantir a continuidade do serviço.
• Notificar o FlowOS imediatamente sobre uso não autorizado da conta.`,
    },
    {
      title: '7. Suspensão e Cancelamento',
      body: `Cancelamento pelo Assinante: pode ser realizado a qualquer momento em Configurações → Conta → Cancelar Plano. O acesso ao plano continua até o fim do período já pago. Após o cancelamento, os dados ficam disponíveis para exportação por 30 dias.

Suspensão por inadimplência: após 3 tentativas de cobrança falhadas, a conta é suspensa. O Assinante tem 7 dias para regularizar o pagamento antes da exclusão dos dados.

Rescisão pelo FlowOS: em caso de violação grave dos Termos de Serviço, fraude comprovada ou atividade ilícita, o FlowOS pode encerrar o contrato imediatamente, sem reembolso e com comunicação formal por e-mail.

Encerramento de serviço: em caso de descontinuação total da plataforma, o FlowOS notificará os assinantes com mínimo de 90 dias de antecedência e reembolsará proporcionalmente o período não utilizado.`,
    },
    {
      title: '8. Reembolsos',
      body: `Não há reembolsos para períodos já faturados, exceto nas seguintes situações:

(a) Indisponibilidade comprovada do serviço por mais de 72 horas consecutivas no período pago, caso em que o reembolso proporcional será processado automaticamente.
(b) Erro de cobrança por parte do FlowOS, que será corrigido integralmente em até 5 dias úteis.
(c) Determinação legal ou judicial aplicável.

Solicitações de reembolso devem ser enviadas para financeiro@flowosapp.io com descrição do problema e número da transação. O prazo de análise é de até 10 dias úteis.`,
    },
    {
      title: '9. Alterações no Serviço e Preços',
      body: `O FlowOS pode modificar funcionalidades, adicionar ou remover recursos, e ajustar preços mediante as seguintes condições:

Adição de funcionalidades: pode ocorrer a qualquer momento sem aviso prévio, sem ônus para o Assinante.
Remoção de funcionalidades essenciais: aviso mínimo de 30 dias por e-mail. O Assinante pode cancelar sem penalidade dentro desse período.
Ajuste de preços: aviso mínimo de 30 dias por e-mail. O preço novo entra em vigor no ciclo de cobrança seguinte ao aviso. O Assinante pode cancelar sem penalidade.

O uso continuado do serviço após a data de vigência das mudanças constitui aceite das novas condições.`,
    },
    {
      title: '10. Limitação de Responsabilidade e Indenização',
      body: `O FlowOS fornece a plataforma "como está" e não garante que os insights de IA, o Life Score ou quaisquer análises substituam aconselhamento profissional (médico, financeiro, psicológico).

O Assinante é o único responsável pelas decisões tomadas com base nas informações da plataforma. O FlowOS não se responsabiliza por danos indiretos, consequentes ou lucros cessantes.

A responsabilidade total do FlowOS em qualquer disputa está limitada ao valor pago pelo Assinante nos 12 meses anteriores ao evento gerador da responsabilidade.

O Assinante concorda em indenizar o FlowOS por quaisquer reclamações de terceiros decorrentes do uso indevido da plataforma em violação a estes termos.`,
    },
    {
      title: '11. Propriedade Intelectual e Dados',
      body: `Plataforma: o FlowOS — incluindo código-fonte, algoritmos, design, marca, logotipo e documentação — é propriedade exclusiva da FlowOS Tecnologia Ltda., protegido pelas leis brasileiras e internacionais de propriedade intelectual.

Dados do Assinante: os dados inseridos pelo Assinante (hábitos, finanças, anotações, dados de saúde) são de propriedade exclusiva do Assinante. O FlowOS recebe licença não exclusiva, limitada e revogável para processar esses dados unicamente para operar o serviço contratado.

Feedback: sugestões enviadas voluntariamente ao FlowOS podem ser incorporadas ao produto sem obrigação de crédito ou compensação.`,
    },
    {
      title: '12. Confidencialidade',
      body: `Ambas as partes concordam em manter em sigilo informações confidenciais trocadas no contexto desta relação contratual, especialmente dados pessoais e informações de negócio.

O FlowOS trata os dados do Assinante como estritamente confidenciais, conforme a Política de Privacidade. A divulgação de dados a terceiros somente ocorre conforme previsto nesta política ou por determinação legal.`,
    },
    {
      title: '13. Vigência e Renovação',
      body: 'Este Contrato entra em vigor na data de criação da conta e permanece vigente enquanto a assinatura estiver ativa. Renova-se automaticamente mês a mês até o cancelamento por qualquer das partes. O cancelamento não retroage, e os direitos e obrigações relativos a períodos anteriores permanecem válidos.',
    },
    {
      title: '14. Disposições Gerais',
      body: `Integralidade: este Contrato, juntamente com os Termos de Serviço, a Política de Privacidade e a Política de Cookies, constitui o acordo completo entre as partes, substituindo quaisquer entendimentos anteriores.

Divisibilidade: se qualquer cláusula for considerada inválida por autoridade competente, as demais permanecem em pleno vigor.

Cessão: o Assinante não pode ceder seus direitos e obrigações sem consentimento prévio e por escrito do FlowOS. O FlowOS pode ceder o Contrato em caso de fusão, aquisição ou venda de ativos, com aviso de 30 dias.

Lei aplicável: este Contrato é regido pelas leis da República Federativa do Brasil. Disputas serão resolvidas no foro da Comarca de São Paulo, SP, ressalvado o direito do consumidor de eleger seu domicílio conforme o CDC.`,
    },
  ],
}

const EN: typeof PT = {
  label: 'Subscription Agreement',
  h1: ['Your agreement', 'with FlowOS.'],
  subtitle: 'This is the agreement that governs your relationship with FlowOS. Written clearly so you know exactly what you\'re signing up for.',
  updated: 'Version: 1.0 · Effective: May 1, 2026 · Parties: you and FlowOS Tecnologia Ltda.',
  contact: 'Contract questions? Send to',
  email: 'legal@flowosapp.io',
  sections: [
    {
      title: '1. Identification of Parties',
      body: `This Service Subscription Agreement ("Agreement") is entered into between:

SUBSCRIBER: You, an individual at least 18 years of age, identified by the email address registered on the platform ("User" or "Subscriber").

PROVIDER: FlowOS Tecnologia Ltda., a private legal entity incorporated under Brazilian law, headquartered in São Paulo, SP, Brazil, owner and operator of the FlowOS platform accessible at flowosapp.io ("FlowOS" or "Company").

By creating an account and subscribing to any plan, the User declares to have read, understood, and fully agreed to this Agreement, the Terms of Service, and the Privacy Policy of FlowOS.`,
    },
    {
      title: '2. Scope of Agreement',
      body: `The purpose of this Agreement is the provision, by FlowOS, of access to the personal life management SaaS platform, via monthly recurring subscription, under the following plans:

Starter Plan — $9/month: access to Dashboard + Life Score, unlimited habits, Focus Mode (Pomodoro), basic finance, mobile PWA and email support. Includes a 15-day free trial on first subscription.

Pro Plan — $19/month: includes everything in Starter, plus unlimited AI Hub, advanced finance with goals, weekly AI reports, advanced health and sleep, and priority support.

Flow+ Plan — $49/month: includes everything in Pro, plus advanced AI (Gemini Pro), multiple profiles/family, public API access, personalized 1:1 onboarding and dedicated support SLA.

Detailed features of each plan are described at flowosapp.io/pricing and may be updated as set forth in clause 9 of this Agreement.`,
    },
    {
      title: '3. Free Trial Period',
      body: `The Starter plan includes a free trial period of 15 (fifteen) days, applicable only to the first subscription per email address.

During the trial: no amount is charged, the Subscriber has full access to Starter plan features, and may cancel at any time without penalty.

At the end of the trial period without cancellation, the subscription is automatically converted to paid, with the first charge on day 16 via the registered payment method.

FlowOS reserves the right to terminate trials for accounts created fraudulently or in violation of the Terms of Service, without prior notice.`,
    },
    {
      title: '4. Pricing and Payment Terms',
      body: `Subscription amounts are those described in clause 2, billed monthly on a recurring basis to the registered credit card, processed via Stripe (PCI-DSS Level 1).

Billing occurs automatically on the same date as the subscription start date in each subsequent month. In case of billing failure, FlowOS will retry on days 3, 5, and 7; after 3 failures, the account will be suspended with email notice.

Upgrades: take effect immediately. The proportional value for the remaining period of the current cycle is credited as a discount on the new charge.

Downgrades: take effect at the start of the next billing cycle. The Subscriber retains current plan features until the end of the already-paid cycle.

All prices are displayed in USD for international users. Brazilian users are billed in BRL at prevailing rates. Prices include applicable taxes.`,
    },
    {
      title: '5. FlowOS Obligations',
      body: `FlowOS commits to:

• Making the platform available with minimum uptime of 99.5% monthly, excluding scheduled maintenance windows (communicated 48h in advance).
• Publishing real-time availability metrics at flowosapp.io/status.
• Maintaining the Subscriber's data securely as described in the Privacy Policy.
• Notifying the Subscriber with a minimum of 30 days' notice of pricing or material feature changes.
• Providing support according to the subscribed plan level: email (Starter), priority (Pro), dedicated SLA (Flow+).
• Fully complying with LGPD and other applicable data protection regulations.`,
    },
    {
      title: '6. Subscriber Obligations',
      body: `The Subscriber commits to:

• Providing truthful and up-to-date information at registration.
• Maintaining the confidentiality of their access credentials.
• Using the platform only for lawful purposes and in accordance with the Terms of Service.
• Not sharing account access with third parties (except plans with multiple profiles).
• Maintaining valid payment information to ensure service continuity.
• Notifying FlowOS immediately of any unauthorized account use.`,
    },
    {
      title: '7. Suspension and Cancellation',
      body: `Cancellation by Subscriber: may be performed at any time in Settings → Account → Cancel Plan. Access to the plan continues until the end of the already-paid period. After cancellation, data is available for export for 30 days.

Suspension for non-payment: after 3 failed billing attempts, the account is suspended. The Subscriber has 7 days to regularize payment before data deletion.

Termination by FlowOS: in case of serious violation of the Terms of Service, proven fraud, or illegal activity, FlowOS may terminate the agreement immediately, without refund and with formal communication by email.

Service discontinuation: in case of total platform discontinuation, FlowOS will notify subscribers with at least 90 days' notice and will proportionally refund the unused period.`,
    },
    {
      title: '8. Refunds',
      body: `No refunds are issued for already-billed periods, except in the following situations:

(a) Proven service unavailability for more than 72 consecutive hours in the paid period, in which case a proportional refund will be processed automatically.
(b) Billing error by FlowOS, which will be corrected in full within 5 business days.
(c) Applicable legal or judicial determination.

Refund requests must be sent to billing@flowosapp.io with a description of the issue and transaction number. The review period is up to 10 business days.`,
    },
    {
      title: '9. Changes to Service and Pricing',
      body: `FlowOS may modify features, add or remove resources, and adjust pricing under the following conditions:

Feature additions: may occur at any time without prior notice, at no cost to the Subscriber.
Removal of essential features: minimum 30 days' email notice. The Subscriber may cancel without penalty within that period.
Price adjustments: minimum 30 days' email notice. The new price takes effect in the billing cycle following the notice. The Subscriber may cancel without penalty.

Continued use of the service after the effective date of changes constitutes acceptance of the new conditions.`,
    },
    {
      title: '10. Limitation of Liability and Indemnification',
      body: `FlowOS provides the platform "as is" and does not guarantee that AI insights, the Life Score, or any analysis substitutes professional advice (medical, financial, psychological).

The Subscriber is solely responsible for decisions made based on platform information. FlowOS is not liable for indirect, consequential damages, or lost profits.

FlowOS's total liability in any dispute is limited to the amount paid by the Subscriber in the 12 months preceding the event giving rise to liability.

The Subscriber agrees to indemnify FlowOS for any third-party claims arising from misuse of the platform in violation of these terms.`,
    },
    {
      title: '11. Intellectual Property and Data',
      body: `Platform: FlowOS — including source code, algorithms, design, brand, logo, and documentation — is the exclusive property of FlowOS Tecnologia Ltda., protected by Brazilian and international intellectual property laws.

Subscriber data: data entered by the Subscriber (habits, finances, notes, health data) is the exclusive property of the Subscriber. FlowOS receives a non-exclusive, limited, and revocable license to process this data solely to operate the contracted service.

Feedback: suggestions voluntarily submitted to FlowOS may be incorporated into the product without obligation for credit or compensation.`,
    },
    {
      title: '12. Confidentiality',
      body: `Both parties agree to maintain in confidence any confidential information exchanged in the context of this contractual relationship, especially personal data and business information.

FlowOS treats Subscriber data as strictly confidential, in accordance with the Privacy Policy. Disclosure of data to third parties only occurs as provided in this policy or by legal determination.`,
    },
    {
      title: '13. Term and Renewal',
      body: 'This Agreement takes effect on the account creation date and remains in force while the subscription is active. It renews automatically month-to-month until cancelled by either party. Cancellation is not retroactive, and rights and obligations relating to prior periods remain valid.',
    },
    {
      title: '14. General Provisions',
      body: `Entire agreement: this Agreement, together with the Terms of Service, Privacy Policy, and Cookie Policy, constitutes the complete agreement between the parties, superseding any prior understandings.

Severability: if any clause is found invalid by a competent authority, the remaining clauses remain in full force.

Assignment: the Subscriber may not assign rights and obligations without prior written consent from FlowOS. FlowOS may assign the Agreement in the event of merger, acquisition, or asset sale, with 30 days' notice.

Governing law: this Agreement is governed by the laws of the Federative Republic of Brazil. Disputes will be resolved in the courts of São Paulo, SP, subject to consumer rights to elect domicile under applicable law.`,
    },
  ],
}

function renderBody(body: string) {
  return body.split('\n').map((line, i) => {
    if (line.startsWith('• ')) {
      return (
        <p key={i} style={{ paddingLeft: 16, marginBottom: 6 }}>
          <span style={{ color: '#3b82f6', marginRight: 8 }}>·</span>
          {line.slice(2)}
        </p>
      )
    }
    return line ? <p key={i} style={{ marginBottom: 8 }}>{line}</p> : <br key={i} />
  })
}

export default function ContratoPage() {
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
