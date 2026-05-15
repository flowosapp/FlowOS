import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?:        string | number
  height?:       string | number
  borderRadius?: string | number
  style?:        CSSProperties
}

export function Skeleton({ width = '100%', height = 14, borderRadius = 6, style }: SkeletonProps) {
  return <div className="skeleton" style={{ width, height, borderRadius, flexShrink: 0, ...style }} />
}

export function SkeletonCard({ lines = 3, style }: { lines?: number; style?: CSSProperties }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      <Skeleton height={17} width="55%" borderRadius={8} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={11} width={i === lines - 1 ? '40%' : '100%'} />
      ))}
    </div>
  )
}

export function SkeletonRow({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', ...style }}>
      <Skeleton width={36} height={36} borderRadius={9} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton height={12} width="68%" />
        <Skeleton height={10} width="42%" />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        <Skeleton height={26} width="40%" borderRadius={8} />
        <Skeleton height={13} width="26%" />
      </div>
      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr 1fr', gap: 14 }}>
        <SkeletonCard lines={4} style={{ minHeight: 140 }} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
      {/* Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        <SkeletonCard lines={5} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  )
}
