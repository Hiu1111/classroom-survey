import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants = {
  primary: 'bg-blue-800 text-white hover:bg-blue-900',
  secondary: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
  danger: 'bg-red-800 text-white hover:bg-red-900',
  ghost: 'bg-transparent px-2 text-blue-800 hover:underline',
} as const

export type ButtonVariant = keyof typeof variants

export function buttonClass(variant: ButtonVariant = 'secondary') {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md px-4 py-2 text-center text-base font-medium no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`
}

export function Button({
  variant = 'secondary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={`${buttonClass(variant)} ${className}`} {...props} />
}

export const inputClass =
  'w-full min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:cursor-not-allowed disabled:bg-slate-100'

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-slate-800">
      {children}
    </label>
  )
}

export function FieldErrorText({ id, children }: { id?: string; children?: string }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1 text-sm text-red-800">
      {children}
    </p>
  )
}

export function LoadingState({ message }: { message: string }) {
  return (
    <p className="text-lg text-slate-700" role="status">
      {message}
    </p>
  )
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-red-950">
      {children}
    </p>
  )
}
