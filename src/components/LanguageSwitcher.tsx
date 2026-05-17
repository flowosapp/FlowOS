import { useTranslation } from 'react-i18next'
import { setLanguage, type AppLanguage } from '../i18n'

export default function LanguageSwitcher({ style }: { style?: React.CSSProperties }) {
  const { i18n } = useTranslation()
  const current = i18n.language as AppLanguage

  function toggle() {
    setLanguage(current === 'pt-BR' ? 'en-US' : 'pt-BR')
  }

  return (
    <button
      onClick={toggle}
      title={current === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        letterSpacing: '0.05em',
        transition: 'all 0.2s',
        ...style,
      }}
      onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#fff' }}
      onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)' }}
    >
      {current === 'pt-BR' ? '🇧🇷 PT' : '🇺🇸 EN'}
    </button>
  )
}
