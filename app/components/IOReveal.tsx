'use client'

import { useRef } from 'react'
import { useReveal } from '@/app/hooks/useReveal'

const cx = (...c: (string | undefined)[]) => c.filter(Boolean).join(' ')

type Props = {
  children: React.ReactNode
  className?: string
}

export default function IOReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref)
  return (
    <div ref={ref} className={cx('io-reveal', className)}>
      {children}
    </div>
  )
}
