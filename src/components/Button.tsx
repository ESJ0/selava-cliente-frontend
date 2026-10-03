import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'

export function Button({ className = '', ...props }: ComponentProps<'button'>) {
  return <button className={`button ${className}`} {...props} />
}

export function ButtonLink({ className = '', ...props }: ComponentProps<typeof Link>) {
  return <Link className={`button ${className}`} {...props} />
}
