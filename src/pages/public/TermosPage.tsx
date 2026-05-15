import { PublicShell } from '../../components/PublicShell'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

const SECTIONS = [
  {
    title: '1. Aceitação dos termos',
    body: 'Ao criar uma conta ou usar o FlowOS, você concorda com estes Termos de Serviço. Se não concordar, não utilize o serviço. Estes termos constituem um contrato legal entre você e a FlowOS Tecnologia Ltda.',
  },
  {
    title: '2. Descrição do serviço',
    body: 'O FlowOS é uma plataforma SaaS de gestão de vida pessoal que inclui rastreamento de hábitos, módulo financeiro, modo foco (Pomodoro), saúde & sono, e Central IA. O serviço é fornecido "como está" com os níveis de disponibilidade descritos em nossa página de Status.',
  },
  {
    title: '3. Planos e pagamento',
    body: 'Os planos Starter, Pro e Flow+ são cobrados mensalmente via cartão de crédito. O plano Starter inclui 15 dias de teste gratuito sem necessidade de cartão. Upgrades têm efeito imediato com crédito proporcional. Downgrades entram no próximo ciclo. Não há taxas de cancelamento.',
  },
  {
    title: '4. Propriedade intelectual',
    body: 'O FlowOS — incluindo seu código, design, marca e algoritmos — é propriedade exclusiva da FlowOS Tecnologia Ltda. Os dados que você insere no sistema são de sua propriedade e você pode exportá-los a qualquer momento. Não reivindicamos propriedade sobre nenhum dado pessoal do usuário.',
  },
  {
    title: '5. Uso aceitável',
    body: 'Você concorda em não usar o FlowOS para: (a) violar leis aplicáveis; (b) tentar acessar dados de outros usuários; (c) realizar engenharia reversa da plataforma; (d) usar a API de forma que exceda os limites documentados; (e) criar contas automatizadas em massa.',
  },
  {
    title: '6. Disponibilidade e limitação de responsabilidade',
    body: 'Buscamos 99.9% de disponibilidade mensal. Não somos responsáveis por danos indiretos, perda de dados por falha do usuário, ou interrupções de serviços de terceiros (como Anthropic ou Supabase) além do nosso controle. Nossa responsabilidade total é limitada ao valor pago nos últimos 12 meses.',
  },
  {
    title: '7. Cancelamento e rescisão',
    body: 'Você pode cancelar sua conta a qualquer momento em Configurações → Conta → Cancelar. Após o cancelamento, seus dados ficam disponíveis para exportação por 30 dias, depois são permanentemente excluídos. Podemos suspender contas que violem estes termos com aviso prévio de 48h (exceto em casos de violações graves de segurança).',
  },
  {
    title: '8. Alterações nos termos',
    body: 'Podemos atualizar estes termos com aviso por e-mail com 30 dias de antecedência. O uso continuado do serviço após a data de vigência constitui aceite das alterações. Versões anteriores ficam disponíveis sob solicitação.',
  },
  {
    title: '9. Foro e lei aplicável',
    body: 'Estes termos são regidos pelas leis da República Federativa do Brasil. Disputas serão resolvidas no foro da cidade de São Paulo, SP, com renúncia a qualquer outro, por mais privilegiado que seja.',
  },
]

export default function TermosPage() {
  return (
    <PublicShell>
      <p className="pub-section-label">Termos de Serviço</p>
      <h1 className="pub-h1">
        Regras claras,<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>sem letras miúdas.</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 560, marginBottom: 16 }}>
        Acreditamos em transparência. Nossos termos foram escritos para ser lidos, não para confundir.
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>
        Última atualização: 1 de maio de 2026 · Vigência: imediata para novos usuários
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {SECTIONS.map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{title}</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', lineHeight: 1.9, fontWeight: 300 }}>{body}</p>
            <div className="pub-divider" />
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 28px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, marginTop: 16 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>
          Dúvidas sobre estes termos? Fale com nosso time jurídico em <span style={{ color: '#93c5fd' }}>legal@flowos.app</span>
        </p>
      </div>
    </PublicShell>
  )
}
