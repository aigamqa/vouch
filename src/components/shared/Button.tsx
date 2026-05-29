import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export function Button({ variant = 'primary', className, children, ...props }: Props) {
  return (
    <button
      className={cn(
        'w-full h-14 rounded-full font-semibold text-base transition-all',
        variant === 'primary' && 'bg-[#FF5E5B] text-white hover:bg-[#e54e4b] active:scale-[0.98]',
        variant === 'secondary' && 'bg-[#E8EEFA] text-[#0F1B3C] hover:bg-[#d5e0f5]',
        variant === 'ghost' && 'bg-transparent text-[#6B7C9F] underline',
        props.disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
