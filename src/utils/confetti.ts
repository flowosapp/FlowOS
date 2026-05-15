const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#ef4444', '#84cc16',
]

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number; rot: number; rotV: number
  color: string; alpha: number
  shape: 'rect' | 'circle'
}

export function dispararConfetti(opts?: {
  x?: number
  y?: number
  count?: number
  spread?: number
}) {
  const {
    x      = window.innerWidth / 2,
    y      = window.innerHeight * 0.45,
    count  = 72,
    spread = 1,
  } = opts ?? {}

  const canvas = document.createElement('canvas')
  canvas.style.cssText = [
    'position:fixed', 'inset:0', 'width:100%', 'height:100%',
    'pointer-events:none', 'z-index:9998',
  ].join(';')
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')!

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = (Math.random() * Math.PI * 2)
    const speed = (Math.random() * 8 + 4) * spread
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 6 + 4),
      r:  Math.random() * 5 + 3,
      rot:  Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.22,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    }
  })

  let raf: number

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false

    for (const p of particles) {
      p.x  += p.vx
      p.y  += p.vy
      p.vy += 0.32     // gravity
      p.vx *= 0.99     // air resistance
      p.rot += p.rotV
      p.alpha -= 0.016

      if (p.alpha <= 0) continue
      alive = true

      ctx.save()
      ctx.globalAlpha = Math.max(0, p.alpha)
      ctx.fillStyle   = p.color
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)

      if (p.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, p.r * 0.7, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9)
      }

      ctx.restore()
    }

    if (alive) raf = requestAnimationFrame(draw)
    else { cancelAnimationFrame(raf); canvas.remove() }
  }

  raf = requestAnimationFrame(draw)
}
