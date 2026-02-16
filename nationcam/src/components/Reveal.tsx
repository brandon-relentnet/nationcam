import { useReveal } from '@/hooks/useReveal'

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** If true, staggers children that also have .reveal class */
  stagger?: boolean
}

/**
 * Wrapper that fades children in when they enter the viewport.
 * Uses IntersectionObserver + CSS animations (no JS animation library).
 */
export default function Reveal({
  children,
  className = '',
  stagger = false,
}: RevealProps) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`${stagger ? 'reveal-stagger' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
