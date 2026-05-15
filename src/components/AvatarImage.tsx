interface AvatarImageProps {
  avatarUrl?: string
  avatarGradient?: string
  nome?: string
  email?: string
  size?: number
  fontSize?: number
}

export default function AvatarImage({
  avatarUrl,
  avatarGradient = 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
  nome,
  email,
  size = 32,
  fontSize,
}: AvatarImageProps) {
  const letter = nome?.[0]?.toUpperCase() ?? email?.[0]?.toUpperCase() ?? 'U'
  const fSize = fontSize ?? Math.round(size * 0.38)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="Avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          display: 'block',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: avatarGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fSize,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  )
}
