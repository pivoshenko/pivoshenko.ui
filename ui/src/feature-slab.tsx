import type { ReactNode } from 'react'
import { Tag, Tags } from './tag'

type FeatureSlabProps = {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  tags?: string[]
  /** Rendered under the copy, typically a path link */
  link?: ReactNode
  media: ReactNode
  /** Put the media on the left instead */
  flip?: boolean
  className?: string
}

export function FeatureSlab({
  eyebrow,
  title,
  body,
  tags = [],
  link,
  media,
  flip = false,
  className = '',
}: FeatureSlabProps) {
  // the copy stays first in the DOM either way, so reading order does not
  // follow the visual flip
  const columns = flip
    ? 'lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]'
    : 'lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]'

  return (
    <article className={`grid items-center gap-8 ${columns} ${className}`}>
      <div className={flip ? 'lg:order-2' : ''}>
        {eyebrow && (
          <p className="type-label fg-subtle flex items-center gap-2">
            {eyebrow}
          </p>
        )}

        <h3
          className={`type-display fg-title text-xl leading-tight ${eyebrow ? 'mt-3' : ''}`}
        >
          {title}
        </h3>

        {body && <p className="type-body fg-body mt-3">{body}</p>}

        {tags.length > 0 && (
          <Tags className="mt-4">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Tags>
        )}

        {link && <div className="mt-5">{link}</div>}
      </div>

      {/* No frame of our own - a screenshot generally carries a window chrome
          already, and a border around that reads as two */}
      <div className={`overflow-hidden rounded-md ${flip ? 'lg:order-1' : ''}`}>
        {media}
      </div>
    </article>
  )
}
