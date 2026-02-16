import { useEffect, useRef } from 'react'

/**
 * Observes an element and adds the 'revealed' class when it enters the viewport.
 * Works with the `.reveal` / `.reveal.revealed` CSS classes in styles.css.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
      },
    )

    // Observe the container and all .reveal children
    const revealChildren = el.querySelectorAll('.reveal')
    for (const child of revealChildren) {
      observer.observe(child)
    }
    // Also observe the container itself if it has .reveal
    if (el.classList.contains('reveal')) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin])

  return ref
}
