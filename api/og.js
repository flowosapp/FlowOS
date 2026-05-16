import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

export default function handler(req) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Seu Sistema Operacional de Vida'
  const sub   = searchParams.get('sub')   ?? 'Hábitos · Finanças · Saúde · IA · Life Score'

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: '#060608', position: 'relative', overflow: 'hidden',
        },
        children: [
          // Glow top-left
          { type: 'div', props: { style: { position: 'absolute', top: -80, left: -80, width: 500, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)', borderRadius: '50%' } } },
          // Glow bottom-right
          { type: 'div', props: { style: { position: 'absolute', bottom: -60, right: -60, width: 420, height: 340, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%' } } },

          // Content
          { type: 'div', props: {
            style: { display: 'flex', flexDirection: 'column', padding: '72px 80px', flex: 1 },
            children: [
              // Logo
              { type: 'div', props: {
                style: { display: 'flex', alignItems: 'center', marginBottom: 48 },
                children: [
                  { type: 'div', props: {
                    style: { background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius: 16, padding: '10px 18px', display: 'flex' },
                    children: [{ type: 'span', props: { style: { fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }, children: 'FlowOS' } }],
                  }},
                ],
              }},

              // Title
              { type: 'div', props: {
                style: { fontSize: 64, fontWeight: 900, color: '#f2f2f5', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20, flex: 1 },
                children: title,
              }},

              // Subtitle
              { type: 'div', props: {
                style: { fontSize: 24, color: 'rgba(255,255,255,0.45)', marginBottom: 36, letterSpacing: '-0.3px' },
                children: sub,
              }},

              // Bottom row
              { type: 'div', props: {
                style: { display: 'flex', alignItems: 'center', gap: 16 },
                children: [
                  { type: 'div', props: {
                    style: { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 24, padding: '10px 24px', fontSize: 16, fontWeight: 600, color: '#60a5fa', display: 'flex' },
                    children: '✦ 15 dias grátis',
                  }},
                  { type: 'div', props: {
                    style: { fontSize: 16, color: 'rgba(255,255,255,0.2)' },
                    children: (process.env.FLOWOS_APP_URL ?? 'flowosapp.io').replace(/^https?:\/\//, ''),
                  }},
                ],
              }},
            ],
          }},

          // Bottom gradient bar
          { type: 'div', props: { style: { height: 6, background: 'linear-gradient(90deg,#3b82f6,#06b6d4)', opacity: 0.6 } } },
        ],
      },
    },
    { width: 1200, height: 630 }
  )
}
