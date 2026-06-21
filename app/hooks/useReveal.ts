import { RefObject, useEffect } from 'react'

export function useReveal(
  ref: RefObject<HTMLElement | null>,
  rootMargin = '0px 0px -80px 0px'
): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.classList.add('is-visible')
          io.disconnect()
          return
        }
      },
      { threshold: 0.15, rootMargin }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
}
