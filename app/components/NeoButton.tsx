'use client'

type Props = {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
}

export function NeoButton({ children, variant = 'primary', type = 'button', onClick, className = '' }: Props) {
  const base =
    'inline-flex items-center justify-center border-2 border-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] cursor-pointer transition-[box-shadow,transform] duration-150'

  const variants: Record<NonNullable<Props['variant']>, string> = {
    primary:
      'bg-white text-black [box-shadow:6px_6px_0_white] hover:[box-shadow:8px_8px_0_white] hover:-translate-x-[2px] hover:-translate-y-[2px] active:[box-shadow:3px_3px_0_white] active:translate-x-[1px] active:translate-y-[1px]',
    outline:
      'bg-black text-white [box-shadow:6px_6px_0_white] hover:[box-shadow:8px_8px_0_white] hover:-translate-x-[2px] hover:-translate-y-[2px] active:[box-shadow:3px_3px_0_white] active:translate-x-[1px] active:translate-y-[1px]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={[base, variants[variant ?? 'primary'], className].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  )
}
