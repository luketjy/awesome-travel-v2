'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  index?: number
  className?: string
}

export default function ScrollReveal({ children, index = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('scroll-reveal-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`scroll-reveal${className ? ` ${className}` : ''}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {children}
    </div>
  )
}
