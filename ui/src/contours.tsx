'use client'

import {
  type CSSProperties,
  type HTMLAttributes,
  useEffect,
  useRef,
} from 'react'

// == Noise ==

type Noise3D = (x: number, y: number, z: number) => number

/** 3D value noise with a deterministic permutation table, seeded by `seed`. */
function makeNoise(seed: number): Noise3D {
  const p = new Uint8Array(512)
  const perm: number[] = []
  let s = seed | 0 || 7
  for (let i = 0; i < 256; i++) perm[i] = i
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    const t = perm[i]
    perm[i] = perm[j]
    perm[j] = t
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255]

  const hash = (x: number, y: number, z: number) =>
    p[(p[(p[x & 255] + y) & 255] + z) & 255] / 255
  const fade = (t: number) => t * t * (3 - 2 * t)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  return (x, y, z) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const zi = Math.floor(z)
    const xf = fade(x - xi)
    const yf = fade(y - yi)
    const zf = fade(z - zi)
    const a = lerp(
      lerp(hash(xi, yi, zi), hash(xi + 1, yi, zi), xf),
      lerp(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), xf),
      yf,
    )
    const b = lerp(
      lerp(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), xf),
      lerp(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), xf),
      yf,
    )
    return lerp(a, b, zf)
  }
}

// == Geometry ==

/** Screen point -> the canvas's own coordinates, undoing the lake tilt. */
function unproject(
  m: DOMMatrix,
  u: number,
  v: number,
): [number, number] | null {
  const a1 = m.m11 - u * m.m14
  const b1 = m.m21 - u * m.m24
  const c1 = m.m41 - u * m.m44
  const a2 = m.m12 - v * m.m14
  const b2 = m.m22 - v * m.m24
  const c2 = m.m42 - v * m.m44
  const det = a1 * b2 - a2 * b1
  if (!det) return null
  return [(-c1 * b2 + c2 * b1) / det, (-a1 * c2 + a2 * c1) / det]
}

// == Tokens ==

/** Tokens are `R G B` triples, so a canvas paint string has to be composed. */
function rgb(triple: string, alpha = 1): string {
  return `rgb(${triple} / ${alpha})`
}

// == Variants ==

type ContoursVariant = 'topo' | 'step' | 'dots' | 'ridge'
type ContoursMask = 'none' | 'radial' | 'bottom'

const maskClasses: Record<ContoursMask, string> = {
  none: '',
  radial: 'mask-radial',
  bottom: 'mask-bottom',
}

/* Tailwind cannot express a composite perspective transform, so the lake tilt
   is the one place an inline style is correct here */
const lakeStyle: CSSProperties = {
  transform: 'perspective(900px) rotateX(52deg) scale(1.9) translateY(8%)',
  transformOrigin: '50% 70%',
}

type ContoursProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ContoursVariant
  mask?: ContoursMask
  lake?: boolean
  levels?: number
  cell?: number
  speed?: number
  opacity?: number
  accentEvery?: number
  seed?: number
  interactive?: boolean
  scale?: number
  bump?: number
  reach?: number
  ripple?: boolean
  rowGap?: number
  colorVar?: string
  accentVar?: string
  groundVar?: string
}

export function Contours({
  variant = 'topo',
  mask = 'none',
  lake = false,
  levels = 14,
  cell = 14,
  speed = 1,
  opacity = 1,
  accentEvery = 5,
  seed = 11,
  interactive = true,
  scale = 0.07,
  bump = 0.16,
  reach = 210,
  ripple = true,
  rowGap = 26,
  colorVar = '--overlay0',
  accentVar = '--accent',
  groundVar = '--bg-canvas',
  className = '',
  style,
  ...rest
}: ContoursProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    if (!el || !cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const noise = makeNoise(seed)
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduce = mql.matches
    let raf = 0
    let last = 0
    let visible = true
    let W = 0
    let H = 0
    let dpr = 1
    const t0 = performance.now()

    // == Colors ==

    let line = rgb('87 83 78')
    let hi = rgb('141 167 209')
    let ground = rgb('31 31 30')
    let colorsDirty = true

    const readColors = () => {
      const cs = getComputedStyle(el)
      line = rgb(cs.getPropertyValue(colorVar).trim() || '87 83 78')
      hi = rgb(cs.getPropertyValue(accentVar).trim() || '141 167 209')
      ground = rgb(cs.getPropertyValue(groundVar).trim() || '31 31 30')
      colorsDirty = false
    }

    const size = () => {
      const r = el.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = Math.max(1, r.width)
      H = Math.max(1, r.height)
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
    }

    // == Pointer ==

    /* px/py is where the cursor sits over the field, a is how hard it presses in */
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, seen: false }
    let waves: { x: number; y: number; t0: number }[] = []

    const local = (e: PointerEvent): [number, number] => {
      const r = el.getBoundingClientRect()
      let u = e.clientX - r.left
      let v = e.clientY - r.top
      const tf = getComputedStyle(cv).transform
      if (tf && tf !== 'none' && typeof DOMMatrix !== 'undefined') {
        // matches the lake transform-origin
        const ox = W * 0.5
        const oy = H * 0.7
        const q = unproject(new DOMMatrix(tf), u - ox, v - oy)
        if (q) {
          u = q[0] + ox
          v = q[1] + oy
        }
      }
      return [u, v]
    }

    const onMove = (e: PointerEvent) => {
      const q = local(e)
      ptr.tx = q[0]
      ptr.ty = q[1]
      ptr.ta = 1
      if (!ptr.seen) {
        ptr.x = ptr.tx
        ptr.y = ptr.ty
        ptr.seen = true
      }
    }

    const onLeave = () => {
      ptr.ta = 0
    }

    const onDown = (e: PointerEvent) => {
      if (!ripple) return
      const q = local(e)
      waves.push({ x: q[0], y: q[1], t0: performance.now() })
      if (waves.length > 3) waves.shift()
    }

    // == Field ==

    const field = (
      z: number,
      cols: number,
      rows: number,
      off: number,
      now: number,
    ) => {
      const f = new Float32Array((cols + 1) * (rows + 1))
      const live = ptr.a > 0.004
      const R2 = 2 * reach * reach
      for (let w = waves.length - 1; w >= 0; w--) {
        if ((now - waves[w].t0) / 1000 > 2.4) waves.splice(w, 1)
      }
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          const nx = (x + off) * scale
          const ny = y * scale
          let val =
            noise(nx, ny, z) * 0.65 +
            noise(nx * 2.1 + 5, ny * 2.1 + 9, z * 1.3) * 0.35
          if (live || waves.length) {
            const gx = x * cell
            const gy = y * cell
            const dx = gx - ptr.x
            const dy = gy - ptr.y
            const d2 = dx * dx + dy * dy
            if (live) val += ptr.a * bump * Math.exp(-d2 / R2)
            for (let w = 0; w < waves.length; w++) {
              const wave = waves[w]
              const dt = (now - wave.t0) / 1000
              const wx = gx - wave.x
              const wy = gy - wave.y
              const dist = Math.sqrt(wx * wx + wy * wy) - dt * 340
              val +=
                0.2 *
                Math.exp(-dt * 1.6) *
                Math.exp(-(dist * dist) / 9000) *
                Math.cos(dist / 46)
            }
          }
          f[y * (cols + 1) + x] = val
        }
      }
      return f
    }

    // == Draw ==

    const draw = (now: number) => {
      if (!ctx) return
      if (colorsDirty) readColors()
      const z = reduce ? 0 : ((now - t0) / 1000) * 0.045 * speed
      const drift = reduce ? 0 : ((now - t0) / 1000) * 3 * speed
      const cols = Math.ceil(W / cell) + 1
      const rows = Math.ceil(H / cell) + 1
      ptr.x += (ptr.tx - ptr.x) * 0.16
      ptr.y += (ptr.ty - ptr.y) * 0.16
      ptr.a += (ptr.ta - ptr.a) * 0.08
      const f = field(z, cols, rows, drift / cell, now)
      const C = cols + 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      const at = (gx: number, gy: number) =>
        f[Math.min(rows, Math.max(0, gy)) * C + Math.min(cols, Math.max(0, gx))]

      if (variant === 'dots') {
        // a field of dots that swell where the ground rises
        for (let dy = 0; dy <= rows; dy++) {
          for (let dx = 0; dx <= cols; dx++) {
            const v = at(dx, dy)
            const r = 0.4 + v * 2.6
            if (r <= 0.25) continue
            const accentDot = accentEvery > 0 && v > 0.8
            ctx.beginPath()
            ctx.arc(dx * cell, dy * cell, r, 0, 6.2832)
            ctx.fillStyle = accentDot ? hi : line
            ctx.globalAlpha = accentDot ? 0.75 : 0.35 + v * 0.55
            ctx.fill()
          }
        }
        ctx.globalAlpha = 1
        return
      }

      if (variant === 'ridge') {
        // stacked ridgelines, front rows painted over the ones behind
        const amp = rowGap * 3.2
        const nRows = Math.ceil(H / rowGap) + 2
        for (let ri = 0; ri < nRows; ri++) {
          const baseY = ri * rowGap
          const accentRow = accentEvery > 0 && ri % accentEvery === 0
          ctx.beginPath()
          ctx.moveTo(-2, baseY + amp)
          for (let rx = 0; rx <= cols; rx++) {
            const rv = at(rx, Math.round(baseY / cell))
            ctx.lineTo(rx * cell, baseY - (rv - 0.5) * amp)
          }
          ctx.lineTo(W + 2, baseY + amp)
          ctx.closePath()
          // occlude the row behind
          ctx.fillStyle = ground
          ctx.globalAlpha = 1
          ctx.fill()
          ctx.strokeStyle = accentRow ? hi : line
          ctx.globalAlpha = accentRow ? 0.7 : 0.4 + 0.5 * (ri / nRows)
          ctx.lineWidth = accentRow ? 1.25 : 1
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        return
      }

      for (let l = 1; l <= levels; l++) {
        const th = 0.18 + (l / (levels + 1)) * 0.64
        const isHi = accentEvery > 0 && l % accentEvery === 0
        ctx.beginPath()
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const a = f[y * C + x]
            const b = f[y * C + x + 1]
            const c = f[(y + 1) * C + x + 1]
            const d = f[(y + 1) * C + x]
            const k =
              (a > th ? 8 : 0) |
              (b > th ? 4 : 0) |
              (c > th ? 2 : 0) |
              (d > th ? 1 : 0)
            if (k === 0 || k === 15) continue
            const px = x * cell
            const py = y * cell
            const T: [number, number] = [px + (cell * (th - a)) / (b - a), py]
            const R: [number, number] = [
              px + cell,
              py + (cell * (th - b)) / (c - b),
            ]
            const B: [number, number] = [
              px + (cell * (th - d)) / (c - d),
              py + cell,
            ]
            const L: [number, number] = [px, py + (cell * (th - a)) / (d - a)]
            let segs: [number, number][]
            switch (k) {
              case 1:
              case 14:
                segs = [L, B]
                break
              case 2:
              case 13:
                segs = [B, R]
                break
              case 3:
              case 12:
                segs = [L, R]
                break
              case 4:
              case 11:
                segs = [T, R]
                break
              case 5:
                segs = [L, T, B, R]
                break
              case 6:
              case 9:
                segs = [T, B]
                break
              case 7:
              case 8:
                segs = [L, T]
                break
              case 10:
                segs = [L, B, T, R]
                break
              default:
                continue
            }
            if (variant === 'step') {
              // rectilinear: snap the crossings to the cell edges
              for (let q = 0; q < segs.length; q++) {
                segs[q][0] = Math.round(segs[q][0] / cell) * cell
                segs[q][1] = Math.round(segs[q][1] / cell) * cell
              }
            }
            for (let sg = 0; sg < segs.length; sg += 2) {
              ctx.moveTo(segs[sg][0], segs[sg][1])
              ctx.lineTo(segs[sg + 1][0], segs[sg + 1][1])
            }
          }
        }
        ctx.strokeStyle = isHi ? hi : line
        ctx.globalAlpha = isHi ? 0.55 : 0.5 + 0.4 * (l / levels)
        ctx.lineWidth = isHi ? 1.25 : 1
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      // ~24fps is plenty for a slow drift
      if (!visible || now - last < 42) return
      // a still field with nobody touching it needs no repaint
      if (speed === 0 && !waves.length && ptr.a < 0.004 && ptr.ta < 0.004) {
        return
      }
      last = now
      draw(now)
    }

    // == Wiring ==

    const host = el.parentElement || el
    let listening = false

    const attach = () => {
      if (listening || !interactive) return
      host.addEventListener('pointermove', onMove, {
        passive: true,
      })
      host.addEventListener('pointerleave', onLeave, { passive: true })
      host.addEventListener('pointerdown', onDown, {
        passive: true,
      })
      listening = true
    }

    const detach = () => {
      if (!listening) return
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      listening = false
    }

    const applyMotion = () => {
      if (reduce) {
        cancelAnimationFrame(raf)
        raf = 0
        detach()
        ptr.a = 0
        ptr.ta = 0
        ptr.seen = false
        waves = []
        draw(performance.now())
        return
      }
      attach()
      if (!raf) raf = requestAnimationFrame(loop)
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduce = e.matches
      applyMotion()
    }

    size()
    draw(performance.now())
    applyMotion()
    mql.addEventListener('change', onMotionChange)

    const ro = new ResizeObserver(() => {
      size()
      draw(performance.now())
    })
    ro.observe(el)

    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting
          })
        : null
    if (io) io.observe(el)

    /* the field re-tints when a theme or a data-accent subtree changes under it,
       so the token read cannot be cached once and kept forever */
    const mo = new MutationObserver(() => {
      colorsDirty = true
      if (reduce) draw(performance.now())
    })
    mo.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'data-theme', 'data-accent'],
    })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      if (io) io.disconnect()
      mo.disconnect()
      mql.removeEventListener('change', onMotionChange)
      detach()
    }
  }, [
    variant,
    levels,
    cell,
    speed,
    scale,
    seed,
    accentEvery,
    interactive,
    bump,
    reach,
    ripple,
    rowGap,
    colorVar,
    accentVar,
    groundVar,
  ])

  return (
    <div
      {...rest}
      ref={wrap}
      aria-hidden="true"
      style={{ opacity, ...style }}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${maskClasses[mask]} ${className}`}
    >
      <canvas
        ref={canvas}
        style={lake ? lakeStyle : undefined}
        className="absolute inset-0 block w-full h-full"
      />
    </div>
  )
}
