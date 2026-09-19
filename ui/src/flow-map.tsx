'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

// Tailwind cannot express keyframes and globals.css is the design system's, so
// the one animation this component needs lives with it
const DRIFT = `
@media (prefers-reduced-motion: no-preference) {
  .flow-map-wire { animation: flow-map-drift 2.4s linear infinite }
}
@keyframes flow-map-drift { to { stroke-dashoffset: -16 } }
`

export type FlowNode = {
  id: string
  label: ReactNode
  meta?: ReactNode
  icon?: ReactNode
  interactive?: boolean
}

export type FlowColumn = {
  id: string
  label?: string
  nodes: FlowNode[]
  grow?: boolean
}

export type FlowLink = { from: string; to: string }

// == Geometry ==

type Point = { x: number; y: number }

/** A node's two wiring points, in coordinates relative to the diagram wrapper. */
type Anchor = { in: Point; out: Point }

type Frame = {
  width: number
  height: number
  anchors: Record<string, Anchor>
}

// Horizontal control points, so every curve leaves and arrives flat and the fan
// reads as a bundle rather than a scribble. The floor keeps a short hop between
// adjacent columns from collapsing into a straight line
function curve(from: Point, to: Point): string {
  const bend = Math.max(24, (to.x - from.x) / 2)
  return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`
}

// == Lighting ==

const NOTHING: ReadonlySet<string> = new Set()

/** Every node reachable from `start` by following links one way, `start` included. */
function reach(
  links: FlowLink[],
  start: string,
  forward: boolean,
): ReadonlySet<string> {
  const seen = new Set([start])
  const queue = [start]
  // index-walked rather than shifted, so a cycle in the graph still terminates
  // on the seen set instead of spinning
  for (let i = 0; i < queue.length; i++) {
    for (const link of links) {
      const from = forward ? link.from : link.to
      const to = forward ? link.to : link.from
      if (from !== queue[i] || seen.has(to)) continue
      seen.add(to)
      queue.push(to)
    }
  }
  return seen
}

type FlowMapProps = {
  columns: FlowColumn[]
  links: FlowLink[]
  onSelect?: (nodeId: string) => void
  className?: string
}

export function FlowMap({
  columns,
  links,
  onSelect,
  className = '',
}: FlowMapProps) {
  const [lit, setLit] = useState<string | null>(null)
  const [frame, setFrame] = useState<Frame | null>(null)

  const wrapRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef(new Map<string, HTMLElement>())

  // The observer watches the wrapper, which covers mount, every resize and any
  // reflow a changed node set causes - so this never needs to re-subscribe
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let live = true

    const measure = () => {
      const box = wrap.getBoundingClientRect()
      // Below md the wrapper is display:none and every rect is zero - there is
      // nothing to draw, and a zero frame would be a wrong one
      if (!live || box.width === 0) return

      const anchor = (el: HTMLElement): Anchor => {
        const rect = el.getBoundingClientRect()
        const y = rect.top - box.top + rect.height / 2
        return {
          in: { x: rect.left - box.left, y },
          out: { x: rect.right - box.left, y },
        }
      }

      setFrame({
        width: box.width,
        height: box.height,
        anchors: Object.fromEntries(
          Array.from(nodeRefs.current, ([id, el]) => [id, anchor(el)]),
        ),
      })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(wrap)
    // A late webfont reflows every label, and the wrapper itself may not resize
    document.fonts?.ready.then(measure)

    return () => {
      live = false
      observer.disconnect()
    }
  }, [])

  const mobile = columns.flatMap((column) =>
    column.nodes.filter((node) => node.interactive !== false),
  )

  if (columns.every((column) => column.nodes.length === 0)) return null

  // Walking the graph both ways is what lets a chain of any depth light: the
  // hovered node's ancestors, its descendants, and the links between them
  const back = lit === null ? NOTHING : reach(links, lit, false)
  const fwd = lit === null ? NOTHING : reach(links, lit, true)

  // A link with both ends on the same side of the hovered node is on a path
  // through it; one that straddles the two sides is a shortcut and is not
  const wireLit = (link: FlowLink) =>
    (back.has(link.from) && back.has(link.to)) ||
    (fwd.has(link.from) && fwd.has(link.to))

  const labelled = columns.some((column) => column.label)
  const tracks = columns
    .map((column) => (column.grow ? 'minmax(0,1fr)' : 'auto'))
    .join(' ')

  return (
    <div className={`grid gap-6 ${className}`}>
      <style>{DRIFT}</style>

      {/* == Flow == */}

      <div
        ref={wrapRef}
        className="relative mx-auto hidden w-full max-w-5xl md:block"
      >
        {frame && (
          <svg
            viewBox={`0 0 ${frame.width} ${frame.height}`}
            width={frame.width}
            height={frame.height}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0"
          >
            <title>flow wiring</title>

            {links.map((link) => {
              const from = frame.anchors[link.from]
              const to = frame.anchors[link.to]
              if (!from || !to) return null
              return (
                <Wire
                  key={`${link.from}->${link.to}`}
                  d={curve(from.out, to.in)}
                  lit={wireLit(link)}
                />
              )
            })}
          </svg>
        )}

        {/* The track list is data-driven, which is the one thing a Tailwind
            class cannot carry */}
        <div
          className="relative grid items-center gap-x-20 gap-y-4"
          style={{ gridTemplateColumns: tracks }}
        >
          {labelled &&
            columns.map((column) => (
              <span
                key={column.id}
                className={`type-meta fg-muted ${column.grow ? '' : 'text-center'}`}
              >
                {column.label}
              </span>
            ))}

          {columns.map((column) => (
            <ul
              key={column.id}
              className={
                column.grow
                  ? 'm-0 grid min-w-0 list-none gap-3 p-0'
                  : // stretched so the nodes spread against the growing column
                    // rather than bunching at its middle
                    'm-0 flex h-full list-none flex-col justify-around gap-8 self-stretch px-0 py-4'
              }
            >
              {column.nodes.map((node) => (
                <li key={node.id} className="min-w-0">
                  <Tile
                    node={node}
                    lit={back.has(node.id) || fwd.has(node.id)}
                    onSelect={onSelect && (() => onSelect(node.id))}
                    onLight={() => setLit(node.id)}
                    onDim={() => setLit(null)}
                    nodeRef={(el) => {
                      if (el) nodeRefs.current.set(node.id, el)
                      else nodeRefs.current.delete(node.id)
                    }}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* == Narrow Fallback == */}

      {/* Below 768px the columns have no room, so the nodes worth acting on
          stack. The swap is CSS-only, which keeps it right in the prerender */}
      <ul className="m-0 grid list-none gap-2 p-0 md:hidden">
        {mobile.map((node) => (
          <li key={node.id} className="min-w-0">
            <Tile
              node={node}
              lit={false}
              onSelect={onSelect && (() => onSelect(node.id))}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

// == Wire ==

type WireProps = {
  d: string
  lit: boolean
}

function Wire({ d, lit }: WireProps) {
  return (
    <path
      d={d}
      fill="none"
      strokeDasharray="4 4"
      strokeWidth={lit ? 2 : 1}
      className={`flow-map-wire stroke-accent transition-opacity duration-base ease-out ${
        lit ? 'opacity-100' : 'opacity-25'
      }`}
    />
  )
}

// == Tile ==

const tile =
  'surface-card border-card flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left shadow-rest transition duration-base ease-out'

type TileProps = {
  node: FlowNode
  lit: boolean
  onSelect?: () => void
  onLight?: () => void
  onDim?: () => void
  nodeRef?: (el: HTMLElement | null) => void
}

function Tile({ node, lit, onSelect, onLight, onDim, nodeRef }: TileProps) {
  const state = lit
    ? 'border-accent -translate-y-0.5 shadow-lift motion-reduce:translate-y-0'
    : ''

  const body = (
    <>
      {node.icon && (
        <span
          className={`inline-flex shrink-0 ${lit ? 'text-accent' : 'fg-subtle'}`}
        >
          {node.icon}
        </span>
      )}
      <span className="type-label fg-title whitespace-nowrap">
        {node.label}
      </span>
      {node.meta != null && (
        <span className="type-meta fg-muted ml-auto min-w-0 truncate pl-3">
          {node.meta}
        </span>
      )}
    </>
  )

  // A node the site gave nothing to open still lights its chain on hover, so it
  // stays a tile with pointer handlers rather than losing them with the button
  if (node.interactive === false) {
    return (
      <div
        ref={nodeRef}
        onMouseEnter={onLight}
        onMouseLeave={onDim}
        className={`${tile} ${state}`}
      >
        {body}
      </div>
    )
  }

  return (
    <button
      ref={nodeRef}
      type="button"
      onClick={onSelect}
      onMouseEnter={onLight}
      onMouseLeave={onDim}
      onFocus={onLight}
      onBlur={onDim}
      className={`focus-ring cursor-pointer ${tile} ${state}`}
    >
      {body}
    </button>
  )
}
