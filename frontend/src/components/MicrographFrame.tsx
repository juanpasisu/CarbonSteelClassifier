import type { ReactNode } from 'react'

interface MicrographFrameProps {
  src: string
  alt: string
  /** Optical zoom simulation; keep mild to avoid deformation. */
  scale?: number
  className?: string
  badge?: string
  footer?: ReactNode
}

/** Square, non-stretched micrograph viewer. */
export function MicrographFrame({
  src,
  alt,
  scale = 1,
  className = '',
  badge,
  footer,
}: MicrographFrameProps) {
  const zoom = Math.min(Math.max(scale, 1), 1.5)

  return (
    <div
      className={`mv-micrograph overflow-hidden rounded-2xl border ${className}`}
      style={{ borderColor: 'var(--mv-border)', background: 'var(--mv-micro-frame)' }}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <img
          alt={alt}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-500"
          decoding="async"
          loading="lazy"
          src={src}
          style={{
            filter: 'none',
            transform: zoom === 1 ? undefined : `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
        {footer}
      </div>
    </div>
  )
}

interface MicrographThumbProps {
  src: string
  alt?: string
  active?: boolean
  onClick?: () => void
  accent?: string
}

/** Square thumbnail for galleries and option cards. */
export function MicrographThumb({
  src,
  alt = '',
  active = false,
  onClick,
  accent,
}: MicrographThumbProps) {
  const border = active && accent ? accent : 'var(--mv-border)'
  const content = (
    <span
      className="mv-micrograph block aspect-square w-full overflow-hidden rounded-md border"
      style={{ borderColor: border, background: 'var(--mv-micro-frame)' }}
    >
      <img
        alt={alt}
        className="h-full w-full object-contain"
        decoding="async"
        loading="lazy"
        src={src}
        style={{ filter: 'none' }}
      />
    </span>
  )

  if (!onClick) {
    return content
  }

  return (
    <button className="shrink-0 w-16 sm:w-20" onClick={onClick} type="button">
      {content}
    </button>
  )
}
