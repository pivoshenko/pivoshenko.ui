import { ArrowRight } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Tag, Tags } from './tag'

type MediaTileProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  src?: string
  alt?: string
  index?: number | string
  tags?: string[]
  meta?: string[]
  action?: ReactNode
  children?: ReactNode
}

export function MediaTile({
  src,
  alt = '',
  index,
  tags,
  meta,
  action = 'details',
  children,
  className = '',
  ...rest
}: MediaTileProps) {
  return (
    <a
      {...rest}
      className={`group flex flex-col surface-card overflow-hidden no-underline fg-primary transition-[border-color,transform,box-shadow] duration-base ease-out hover:border-overlay1 hover:-translate-y-0.5 hover:shadow-lifted motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-ring ${className}`}
    >
      <div className="relative aspect-[16/10] bg-crust overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="block w-full h-full object-cover transition-transform duration-slow ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-60 bg-[radial-gradient(rgb(var(--overlay0))_1px,transparent_1.5px)] bg-[length:16px_16px]"
          />
        )}
        {index != null && (
          <span className="absolute left-3 top-3 px-1.5 py-0.5 rounded-sm bg-crust/[0.72] backdrop-blur-[8px] fg-primary text-[11px] leading-4">
            {typeof index === 'number' ? String(index).padStart(3, '0') : index}
          </span>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 pt-3 px-4 pb-4">
        <Tags>
          {(tags ?? []).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Tags>
        <span className="inline-flex items-center gap-1 self-center whitespace-nowrap fg-subtle text-xs transition-colors duration-fast group-hover:text-accent">
          {action}
          <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
        </span>
        {children && <div className="col-span-2">{children}</div>}
        {(meta ?? []).map((item) => (
          <span key={item} className="type-meta fg-subtle">
            {item}
          </span>
        ))}
      </div>
    </a>
  )
}
