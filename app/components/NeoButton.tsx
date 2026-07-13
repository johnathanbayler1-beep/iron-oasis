'use client'

import { useRef } from 'react'
import gsap from 'gsap'

type Props = {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
}

// Apple / Vercel tactile button. Glass + inset shadow live in .io-btn (globals);
// GSAP owns the physical press so it springs back instead of snapping.
export function NeoButton({ children, variant = 'primary', type = 'button', onClick, className = '' }: Props) {
  const ref = useRef<HTMLButtonElement>(null)

  const press = () => gsap.to(ref.current, { scale: 0.98, duration: 0.12, ease: 'power2.out' })
  const release = () => gsap.to(ref.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      className={['io-btn', variant === 'primary' ? 'io-btn--accent' : '', className].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  )
}
