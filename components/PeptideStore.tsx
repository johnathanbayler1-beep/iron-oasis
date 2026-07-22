'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'

type Product = {
  name: string
  tagline: string
  href: string
}

const PRODUCTS: Product[] = [
  { name: 'Recovery', tagline: 'Accelerated repair, engineered for downtime.', href: '#' },
  { name: 'Performance', tagline: 'Output, sustained.', href: '#' },
  { name: 'Longevity', tagline: 'Built for the long horizon.', href: '#' },
]

const GLASS_CARD: React.CSSProperties = {
  background: 'rgba(20,20,20,0.4)',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  border: '1px solid rgba(255,255,255,0.1)',
}

export function PeptideStore() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const cards = sectionRef.current?.querySelectorAll('.io-peptide-card')
    if (!cards?.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full bg-transparent px-6 py-24 md:px-12"
    >
      <div className="relative z-20 mx-auto max-w-6xl">
        <h2 className="text-2xl font-medium text-white md:text-4xl">Peptide Catalog</h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <div
              key={product.name}
              className="io-peptide-card rounded-2xl p-6"
              style={GLASS_CARD}
            >
              <h3 className="text-lg font-medium text-white">{product.name}</h3>
              <p className="mt-2 text-sm text-[#8a8a8a]">{product.tagline}</p>
              <a href={product.href} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="mt-8 border-white/20 bg-white/5 text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  Explore
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
