import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

/** Constrains content to mobile width with safe-area padding */
export function MobileShell({ children, className = '' }: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className={`w-full max-w-[430px] flex-1 flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  )
}
