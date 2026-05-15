import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return mobile
}
