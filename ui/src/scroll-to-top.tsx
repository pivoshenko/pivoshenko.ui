'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IconButton } from './buttons'

type ScrollToTopProps = {
  threshold?: number
}

export function ScrollToTop({ threshold = 240 }: ScrollToTopProps = {}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return (
    <IconButton
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-5 right-5 z-50 w-9 h-9 transition-all ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <ArrowUp size={14} strokeWidth={2} aria-hidden="true" />
    </IconButton>
  )
}
