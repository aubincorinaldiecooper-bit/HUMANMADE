"use client"

import * as React from "react"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type DiscCascadeCredit = {
  label: string
  /** One value, or several lines. */
  value: string | number | Array<string | number>
}

export type DiscCascadeReview = {
  source: string
  quote: string
  /** 0 to 5. Defaults to 5. */
  stars?: number
}

export type DiscCascadeItem = {
  title: string
  /** Square image printed on the disc. */
  src: string
  alt?: string
  credits?: DiscCascadeCredit[]
  /** The first two are shown under the stage. */
  reviews?: DiscCascadeReview[]
  /** "arc" curves the title over the top of the disc, "block" sets it flat above the hub. */
  labelStyle?: "arc" | "block"
  /** Colour of the text printed on the disc. Defaults to white. */
  labelColor?: string
  /** Shown in the catalogue menu and read to screen readers. Falls back to a "Year" credit. */
  year?: string | number
}

export type DiscCascadeNavItem = {
  label: string
  href?: string
  /** Marks the current section. The first item is current when none is marked. */
  current?: boolean
}

export type DiscCascadeCarouselProps = {
  items: DiscCascadeItem[]
  /** Wordmark in the nav, also printed on every disc. */
  brand?: string
  /** Show the top bar (wordmark, links, catalogue menu). The wordmark stays on the discs either way. */
  showNav?: boolean
  nav?: DiscCascadeNavItem[]
  /** Label of the dropdown that lists every item. Pass false to hide it. */
  indexLabel?: string | false
  defaultIndex?: number
  /** Controlled index. Pair with onIndexChange. */
  index?: number
  onIndexChange?: (index: number) => void
  /** Called when the front disc is clicked. */
  onSelect?: (item: DiscCascadeItem, index: number) => void
  loop?: boolean
  /** Milliseconds per item, or true for 4000. Pauses while a disc is hovered or dragged, on keyboard focus and in hidden tabs. */
  autoplay?: number | boolean
  background?: string
  color?: string
  /** Solid colour behind the catalogue menu. Defaults to white. */
  surface?: string
  /** Stylesheet URL for web fonts, added to <head> once. */
  fontHref?: string
  displayFont?: string
  labelFont?: string
  bodyFont?: string
  /** Small instruction in the bottom-left corner. */
  hint?: string
  ariaLabel?: string
  /** What one item is called in button labels and announcements. */
  itemName?: string
  /** Height of the stage. Defaults to the full small viewport height. */
  height?: string
  /** Diameter of a disc, any CSS length. */
  discSize?: string
  /** Strength of the rainbow sheen, 0 to 1. */
  sheen?: number
  /** Seconds per turn of the front disc. 0 stops it. */
  spin?: number
  className?: string
  style?: React.CSSProperties
}

/* ------------------------------------------------------------------ */
/* Constants and helpers                                               */
/* ------------------------------------------------------------------ */

const DISPLAY_FONT = '"Instrument Serif", "Bodoni Moda", Didot, "Times New Roman", serif'
const LABEL_FONT = 'Oswald, "Bebas Neue", Impact, "Arial Narrow", sans-serif'
const BODY_FONT = "Inter, ui-sans-serif, system-ui, sans-serif"

// Average glyph width of the label face, in em. Text on the disc is stretched to
// this width with textLength, so it sits the same before and after fonts load.
const GLYPH = 0.56

// Spring that carries the stack to its target.
const STIFFNESS = 140
const DAMPING = 21

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const mod = (a: number, n: number) => ((a % n) + n) % n
const pad2 = (n: number) => String(n).padStart(2, "0")
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ")

/** Distance of slide i from the current position, wrapped to the nearer side when looping. */
function offsetOf(i: number, pos: number, n: number, loop: boolean) {
  const d = i - pos
  return loop ? mod(d + n / 2, n) - n / 2 : d
}

// Centre-to-centre distance between discs, in disc diameters.
const GAP = 0.9
// How far back each step from the centre sits, in disc diameters.
const DEPTH = 0.3
// How far a side disc turns toward the centre, in degrees.
const TURN = 24

/**
 * Where a disc sits for a given offset. Discs sit in one level row: the centre disc in
 * front, the others a step further back and turned toward the middle. They roll like
 * wheels as they slide.
 */
function layout(d: number, n: number, loop: boolean) {
  const a = Math.abs(d)
  let opacity = clamp(1 - (a - 2.5), 0, 1)
  // When looping, fade discs out before they jump to the other end.
  if (loop) opacity = Math.min(opacity, clamp((n / 2 - a) / 0.5, 0, 1))
  return {
    transform:
      `translate3d(calc(${(GAP * d).toFixed(4)} * var(--dcc-s)), 0, calc(${(-DEPTH * a).toFixed(4)} * var(--dcc-s))) ` +
      `rotateY(${(-TURN * clamp(d, -1, 1)).toFixed(3)}deg)`,
    zIndex: Math.round(100 - 10 * a),
    opacity,
    roll: `${((GAP * 2 * 180) / Math.PI * d).toFixed(2)}deg`,
    glint: `${(66 + 10.8 * d).toFixed(1)}deg`,
  }
}

function slideStyle(d: number, n: number, loop: boolean): React.CSSProperties {
  const l = layout(d, n, loop)
  return {
    transform: l.transform,
    zIndex: l.zIndex,
    opacity: l.opacity < 1 ? Number(l.opacity.toFixed(3)) : undefined,
    visibility: l.opacity <= 0.001 ? "hidden" : undefined,
    ["--dcc-roll" as string]: l.roll,
    ["--dcc-glint" as string]: l.glint,
  }
}

function paintSlide(el: HTMLElement, d: number, n: number, loop: boolean) {
  const l = layout(d, n, loop)
  el.style.transform = l.transform
  el.style.zIndex = String(l.zIndex)
  el.style.opacity = l.opacity < 1 ? l.opacity.toFixed(3) : ""
  el.style.visibility = l.opacity <= 0.001 ? "hidden" : ""
  el.style.setProperty("--dcc-roll", l.roll)
  el.style.setProperty("--dcc-glint", l.glint)
}

const valuesOf = (c: DiscCascadeCredit) => (Array.isArray(c.value) ? c.value : [c.value]).map(String)

function yearOf(item: DiscCascadeItem) {
  if (item.year != null) return String(item.year)
  const c = item.credits?.find((x) => /^year$/i.test(x.label.trim()))
  return c ? valuesOf(c)[0] : undefined
}

/** Split words into `lines` lines so the longest line is as short as possible. */
function splitWords(words: string[], lines: number): string[] {
  if (lines <= 1 || words.length <= 1) return [words.join(" ")]
  let best: string[] = [words.join(" ")]
  let bestLen = Infinity
  for (let k = 1; k <= words.length - lines + 1; k++) {
    const rest = splitWords(words.slice(k), lines - 1)
    const all = [words.slice(0, k).join(" "), ...rest]
    const longest = Math.max(...all.map((l) => l.length))
    if (longest < bestLen) {
      bestLen = longest
      best = all
    }
  }
  return best
}

/** Flat title: as many lines (up to 3) as give the largest type. */
function fitBlock(title: string) {
  const words = title.toUpperCase().split(/\s+/).filter(Boolean)
  let best = { lines: [words.join(" ")], size: 0 }
  for (let n = 1; n <= Math.min(3, words.length); n++) {
    const lines = splitWords(words, n)
    const longest = Math.max(...lines.map((l) => l.length))
    const size = Math.min(20, 32 / (n * 0.98), 112 / (GLYPH * longest))
    if (size > best.size + 0.01) best = { lines, size }
  }
  return best
}

/* ------------------------------------------------------------------ */
/* Disc artwork                                                        */
/* ------------------------------------------------------------------ */

const TEXT_STROKE = {
  stroke: "rgba(0,0,0,.45)",
  strokeLinejoin: "round" as const,
  paintOrder: "stroke",
}

function DiscLabel({ item, brand, id }: { item: DiscCascadeItem; brand?: string; id: string }) {
  const fill = item.labelColor ?? "#ffffff"
  const title = item.title.toUpperCase()
  const credits = (item.credits ?? [])
    .map((c) => `${c.label} ${valuesOf(c).join(" ")}`.toUpperCase())
    .join(" · ")
  // Small caps text along the bottom edge. Squeeze it only if it would wrap past the hub.
  const creditsWidth = credits.length * (5.2 * 0.52 + 0.7)

  let heading: React.ReactNode
  if (item.labelStyle === "block") {
    const { lines, size } = fitBlock(item.title)
    const lead = size * 0.98
    heading = (
      <g fill={fill} fontSize={size.toFixed(2)} fontWeight={700} strokeWidth={0.96} {...TEXT_STROKE}>
        {lines.map((line, k) => (
          <text
            key={k}
            x={100}
            y={(58 - (lines.length - 1 - k) * lead).toFixed(2)}
            textAnchor="middle"
            textLength={(GLYPH * size * line.length).toFixed(1)}
            lengthAdjust="spacingAndGlyphs"
          >
            {line}
          </text>
        ))}
      </g>
    )
  } else {
    const size = Math.min(21, 200 / (GLYPH * Math.max(1, title.length)))
    heading = (
      <text
        fill={fill}
        fontSize={size.toFixed(2)}
        fontWeight={700}
        textAnchor="middle"
        textLength={(GLYPH * size * title.length).toFixed(1)}
        lengthAdjust="spacingAndGlyphs"
        strokeWidth={0.96}
        {...TEXT_STROKE}
      >
        <textPath href={`#${id}top`} startOffset="50%">
          {title}
        </textPath>
      </text>
    )
  }

  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id={`${id}top`} d="M28 100a72 72 0 1 1 144 0" />
        <path id={`${id}bot`} d="M14 100a86 86 0 0 0 172 0" />
      </defs>
      {heading}
      {credits && (
        <text
          fill={fill}
          fontSize={5.2}
          letterSpacing=".7"
          textAnchor="middle"
          opacity={0.86}
          strokeWidth={0.48}
          {...TEXT_STROKE}
          {...(creditsWidth > 240 ? { textLength: 240, lengthAdjust: "spacingAndGlyphs" } : null)}
        >
          <textPath href={`#${id}bot`} startOffset="50%">
            {credits}
          </textPath>
        </text>
      )}
      {brand && (
        <text
          x={100}
          y={150}
          fill={fill}
          fontSize={10}
          fontWeight={800}
          letterSpacing="-.4"
          textAnchor="middle"
          strokeWidth={0.48}
          {...TEXT_STROKE}
        >
          {brand}
        </text>
      )}
    </svg>
  )
}

/** The clear plastic hub and metal ring around the spindle hole. It does not spin. */
function DiscHub({ id }: { id: string }) {
  return (
    <svg className="dcc-hub" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfbfc" />
          <stop offset=".45" stopColor="#a9adb3" />
          <stop offset=".55" stopColor="#eef0f2" />
          <stop offset="1" stopColor="#8f949a" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="35.5" fill="none" stroke={`url(#${id}metal)`} strokeWidth="4" />
      <circle cx="100" cy="100" r="25.5" fill="rgba(232,235,239,.82)" stroke="rgba(232,235,239,.82)" strokeWidth="16" />
      <circle cx="100" cy="100" r="17.6" fill="none" stroke="rgba(255,255,255,.95)" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="22" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth=".6" />
      <circle cx="100" cy="100" r="27" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.6" />
      <circle cx="100" cy="100" r="28.6" fill="none" stroke="rgba(0,0,0,.1)" strokeWidth=".6" />
      <circle cx="100" cy="100" r="33.3" fill="none" stroke="rgba(0,0,0,.16)" strokeWidth=".7" />
      <circle cx="100" cy="100" r="99.3" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" />
    </svg>
  )
}

function Stars({ count = 5 }: { count?: number }) {
  const n = clamp(Math.round(count), 0, 5)
  return (
    <div className="dcc-stars">
      {"★".repeat(n)}
      {n < 5 && <span className="dcc-star-off">{"★".repeat(5 - n)}</span>}
    </div>
  )
}

const Chevron = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const Arrow = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "left" ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} />
  </svg>
)

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type Drag = {
  id: number
  x0: number
  p0: number
  step: number
  moved: boolean
  lastX: number
  lastT: number
  v: number
}

export default function DiscCascadeCarousel({
  items,
  brand,
  showNav = true,
  nav = [],
  indexLabel = "Index",
  defaultIndex = 0,
  index,
  onIndexChange,
  onSelect,
  loop = false,
  autoplay = false,
  background,
  color,
  surface,
  fontHref,
  displayFont = DISPLAY_FONT,
  labelFont = LABEL_FONT,
  bodyFont = BODY_FONT,
  hint,
  ariaLabel = "Carousel",
  itemName = "record",
  height = "100svh",
  discSize = "clamp(170px, min(50vmin, 38vw), 420px)",
  sheen = 0.6,
  spin = 24,
  className,
  style,
}: DiscCascadeCarouselProps) {
  const n = items.length
  const start = n ? clamp(Math.round(index ?? defaultIndex), 0, n - 1) : 0

  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const rootRef = React.useRef<HTMLDivElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const slideRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const menuRef = React.useRef<HTMLDivElement>(null)
  const menuBtnRef = React.useRef<HTMLButtonElement>(null)

  // Position is continuous (2.4 = between items 2 and 3). It lives in refs and is
  // painted straight to the DOM each frame; React only re-renders when the item changes.
  const posRef = React.useRef(start)
  const targetRef = React.useRef(start)
  const velRef = React.useRef(0)
  const rafRef = React.useRef(0)
  const lastTRef = React.useRef(0)
  const dragRef = React.useRef<Drag | null>(null)
  const suppressClickRef = React.useRef(false)
  const reducedRef = React.useRef(false)

  const [current, setCurrent] = React.useState(start)
  const currentRef = React.useRef(start)
  const [dragging, setDragging] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [keyFocus, setKeyFocus] = React.useState(false)
  const [pageHidden, setPageHidden] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)

  const onIndexChangeRef = React.useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange

  const commit = React.useCallback((i: number) => {
    if (i === currentRef.current) return
    currentRef.current = i
    setCurrent(i)
    onIndexChangeRef.current?.(i)
  }, [])

  const paintAll = React.useCallback(() => {
    const p = posRef.current
    slideRefs.current.forEach((el, i) => {
      if (el) paintSlide(el, offsetOf(i, p, n, loop), n, loop)
    })
  }, [n, loop])

  const tick = React.useCallback(
    (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - (lastTRef.current || now - 16)) / 1000))
      lastTRef.current = now
      if (!dragRef.current?.moved) {
        const x = posRef.current - targetRef.current
        velRef.current += (-STIFFNESS * x - DAMPING * velRef.current) * dt
        posRef.current += velRef.current * dt
        if (Math.abs(x) < 1e-4 && Math.abs(velRef.current) < 1e-3) {
          posRef.current = targetRef.current
          velRef.current = 0
          // Keep numbers small after many laps.
          if (loop && n) {
            const lap = Math.floor(targetRef.current / n) * n
            posRef.current -= lap
            targetRef.current -= lap
          }
          paintAll()
          rafRef.current = 0
          lastTRef.current = 0
          return
        }
      }
      paintAll()
      rafRef.current = requestAnimationFrame(tick)
    },
    [paintAll, loop, n],
  )

  const kick = React.useCallback(() => {
    if (reducedRef.current && !dragRef.current?.moved) {
      posRef.current = targetRef.current
      velRef.current = 0
      paintAll()
      return
    }
    if (!rafRef.current) {
      lastTRef.current = 0
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [paintAll, tick])

  React.useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const setTarget = React.useCallback(
    (t: number) => {
      if (!n) return
      const next = loop ? t : clamp(t, 0, n - 1)
      targetRef.current = next
      commit(mod(Math.round(next), n))
      kick()
    },
    [n, loop, commit, kick],
  )

  const goTo = React.useCallback(
    (i: number) => {
      if (!n) return
      if (!loop) return setTarget(clamp(i, 0, n - 1))
      const base = Math.round(targetRef.current)
      let delta = mod(i - mod(base, n), n)
      if (delta > n / 2) delta -= n
      setTarget(base + delta)
    },
    [n, loop, setTarget],
  )

  const next = React.useCallback(() => setTarget(Math.round(targetRef.current) + 1), [setTarget])
  const prev = React.useCallback(() => setTarget(Math.round(targetRef.current) - 1), [setTarget])

  // Controlled index.
  React.useEffect(() => {
    if (index != null && n && clamp(index, 0, n - 1) !== currentRef.current) goTo(index)
  }, [index, n, goTo])

  // Items removed from under us.
  React.useEffect(() => {
    if (n && currentRef.current > n - 1) setTarget(n - 1)
    paintAll()
  }, [n, setTarget, paintAll])

  // Web fonts.
  React.useEffect(() => {
    if (!fontHref) return
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>("link[data-disc-cascade-font]"))
    if (links.some((l) => l.getAttribute("href") === fontHref)) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = fontHref
    link.setAttribute("data-disc-cascade-font", "")
    document.head.appendChild(link)
  }, [fontHref])

  // Reduced motion and tab visibility.
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      reducedRef.current = mq.matches
      setReduced(mq.matches)
    }
    const vis = () => setPageHidden(document.hidden)
    sync()
    vis()
    mq.addEventListener("change", sync)
    document.addEventListener("visibilitychange", vis)
    return () => {
      mq.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", vis)
    }
  }, [])

  // Autoplay.
  const autoplayMs = autoplay === true ? 4000 : typeof autoplay === "number" ? autoplay : 0
  const paused = hovered || dragging || menuOpen || keyFocus || pageHidden || reduced
  React.useEffect(() => {
    if (!autoplayMs || paused || n < 2) return
    const t = window.setTimeout(() => {
      if (!loop && currentRef.current >= n - 1) goTo(0)
      else next()
    }, autoplayMs)
    return () => window.clearTimeout(t)
  }, [autoplayMs, paused, n, loop, current, next, goTo])

  // When the front disc changes: move keyboard focus with it and level out the tilt.
  React.useEffect(() => {
    const els = slideRefs.current
    const active = document.activeElement
    if (active && els.includes(active as HTMLButtonElement) && els[current] && active !== els[current]) {
      els[current]!.focus({ preventScroll: true })
    }
    els.forEach((el) => {
      el?.style.removeProperty("--dcc-px")
      el?.style.removeProperty("--dcc-py")
    })
  }, [current])

  // Close the catalogue on an outside press.
  React.useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [menuOpen])

  React.useEffect(() => {
    if (!menuOpen) return
    const opt = menuRef.current?.querySelector<HTMLButtonElement>(".dcc-opt[aria-current]")
    opt?.focus({ preventScroll: true })
  }, [menuOpen])

  /* ---------------- pointer ---------------- */

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !n) return
    if ((e.target as Element).closest("[data-dcc-ui]")) return
    const s = stageRef.current?.offsetWidth || 300
    dragRef.current = {
      id: e.pointerId,
      x0: e.clientX,
      p0: posRef.current,
      step: s * GAP, // the disc follows the pointer
      moved: false,
      lastX: e.clientX,
      lastT: e.timeStamp,
      v: 0,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dr = dragRef.current
    if (!dr || dr.id !== e.pointerId) return
    const dx = e.clientX - dr.x0
    if (!dr.moved) {
      if (Math.abs(dx) < 6) return
      dr.moved = true
      velRef.current = 0
      rootRef.current?.setPointerCapture(e.pointerId)
      setDragging(true)
    }
    const dt = Math.max(1, e.timeStamp - dr.lastT)
    dr.v = 0.75 * ((e.clientX - dr.lastX) / dt) * 1000 + 0.25 * dr.v
    dr.lastX = e.clientX
    dr.lastT = e.timeStamp

    let p = dr.p0 - dx / dr.step
    if (!loop) {
      // Rubber band past either end.
      if (p < 0) p *= 0.3
      else if (p > n - 1) p = n - 1 + (p - (n - 1)) * 0.3
    }
    posRef.current = p
    commit(mod(Math.round(clamp(p, loop ? -Infinity : 0, loop ? Infinity : n - 1)), n))
    paintAll()
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const dr = dragRef.current
    if (!dr || dr.id !== e.pointerId) return
    dragRef.current = null
    if (!dr.moved) return
    if (rootRef.current?.hasPointerCapture(e.pointerId)) rootRef.current.releasePointerCapture(e.pointerId)
    setDragging(false)
    suppressClickRef.current = true
    window.setTimeout(() => (suppressClickRef.current = false), 0)
    // A flick carries on; a pause before letting go does not.
    const v = e.timeStamp - dr.lastT > 90 ? 0 : -dr.v / dr.step
    const base = Math.round(dr.p0)
    const t = clamp(Math.round(posRef.current + v * 0.14), base - 3, base + 3)
    velRef.current = clamp(v, -10, 10)
    setTarget(t)
  }

  const onSlideClick = (i: number) => {
    if (suppressClickRef.current) return
    if (i !== currentRef.current) goTo(i)
    else onSelect?.(items[i], i)
  }

  const onTilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse" || dragRef.current?.moved) return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--dcc-px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    e.currentTarget.style.setProperty("--dcc-py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }

  const resetTilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.removeProperty("--dcc-px")
    e.currentTarget.style.removeProperty("--dcc-py")
  }

  /* ---------------- keyboard ---------------- */

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest(".dcc-menu")) return
    const keys: Record<string, () => void> = {
      ArrowLeft: prev,
      ArrowRight: next,
      Home: () => goTo(0),
      End: () => goTo(n - 1),
    }
    const fn = keys[e.key]
    if (fn) {
      e.preventDefault()
      fn()
    }
  }

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      setMenuOpen(false)
      menuBtnRef.current?.focus()
      return
    }
    if (e.key === "Tab") return setMenuOpen(false)
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    e.preventDefault()
    const opts = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>(".dcc-opt") ?? [])
    if (!opts.length) return
    const at = opts.indexOf(document.activeElement as HTMLButtonElement)
    const to = e.key === "ArrowDown" ? (at + 1) % opts.length : (at - 1 + opts.length) % opts.length
    opts[to].focus()
  }

  if (!n) return null

  const item = items[current]
  const credits = item.credits ?? []
  const reviews = (item.reviews ?? []).slice(0, 2)
  const year = yearOf(item)
  const noun = itemName.charAt(0).toUpperCase() + itemName.slice(1)
  const anyCurrent = nav.some((l) => l.current)
  const listId = `${uid}list`

  return (
    <>
      <style>{CSS}</style>
      <div
        ref={rootRef}
        className={cx("dcc-root", className)}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        data-spin={spin > 0 ? "" : undefined}
        data-nonav={showNav ? undefined : ""}
        data-dragging={dragging ? "" : undefined}
        style={{
          height,
          background,
          color,
          fontFamily: bodyFont,
          ["--dcc-s" as string]: discSize,
          ["--dcc-surface" as string]: surface,
          ["--dcc-sheen" as string]: sheen,
          ["--dcc-spin" as string]: `${spin || 24}s`,
          ...style,
        }}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onFocus={(e) => setKeyFocus(e.target.matches(":focus-visible"))}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setKeyFocus(false)
        }}
      >
        <div className="dcc-frame" aria-hidden="true" />

        {showNav && (brand || nav.length > 0 || indexLabel !== false) && (
          <nav className="dcc-nav" data-dcc-ui="" aria-label={typeof indexLabel === "string" ? indexLabel : ariaLabel}>
            {brand && <span className="dcc-brand">{brand}</span>}
            {nav.map((l, k) => {
              const isCurrent = l.current ?? (!anyCurrent && k === 0)
              return l.href ? (
                <a key={k} className="dcc-link" href={l.href} aria-current={isCurrent ? "page" : undefined}>
                  {l.label}
                </a>
              ) : (
                <span key={k} className="dcc-link" aria-current={isCurrent ? "true" : undefined}>
                  {l.label}
                </span>
              )
            })}
            {indexLabel !== false && (
              <div className="dcc-menu" ref={menuRef} onKeyDown={onMenuKeyDown}>
                <button
                  ref={menuBtnRef}
                  type="button"
                  className="dcc-menubtn"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-controls={listId}
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  {indexLabel} <Chevron />
                </button>
                {menuOpen && (
                  <ul className="dcc-list" id={listId} role="menu">
                    {items.map((it, i) => (
                      <li key={i} role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="dcc-opt"
                          aria-current={i === current ? "true" : undefined}
                          onClick={() => {
                            goTo(i)
                            setMenuOpen(false)
                            menuBtnRef.current?.focus()
                          }}
                        >
                          <span className="dcc-optn">{pad2(i + 1)}</span>
                          <span className="dcc-optt">{it.title}</span>
                          {yearOf(it) && <span className="dcc-opty">{yearOf(it)}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </nav>
        )}

        <div className="dcc-head" aria-hidden="true">
          <h2 key={`t${current}`} className="dcc-title dcc-in" style={{ fontFamily: displayFont }}>
            {item.title}
          </h2>
          {credits.length > 0 && (
            <dl className="dcc-dl" key={`c${current}`}>
              {credits.map((c, k) => (
                <div key={k} className="dcc-row dcc-in" style={{ ["--i" as string]: k + 1 }}>
                  <dt>{c.label}</dt>
                  <dd>
                    {valuesOf(c).map((v, j) => (
                      <span key={j}>{v}</span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div
          className="dcc-stage"
          ref={stageRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {items.map((it, i) => {
            const d = offsetOf(i, posRef.current, n, loop)
            const active = i === current
            return (
              <button
                key={i}
                ref={(el) => {
                  slideRefs.current[i] = el
                }}
                type="button"
                className="dcc-slide"
                data-active={active ? "" : undefined}
                tabIndex={active ? 0 : -1}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${it.title}`}
                aria-current={active ? "true" : undefined}
                style={slideStyle(d, n, loop)}
                onClick={() => onSlideClick(i)}
                onPointerMove={active ? onTilt : undefined}
                onPointerLeave={active ? resetTilt : undefined}
              >
                <span className="dcc-tilt">
                  <span className="dcc-shade" />
                  <span className="dcc-edge" />
                  <span className="dcc-disc">
                    <span className="dcc-roll">
                      <span className="dcc-idle" style={{ fontFamily: labelFont }}>
                        <img
                          src={it.src}
                          alt={it.alt ?? it.title}
                          draggable={false}
                          decoding="async"
                          loading={Math.abs(d) > 3 ? "lazy" : "eager"}
                          width={600}
                          height={600}
                        />
                        <DiscLabel item={it} brand={brand} id={`${uid}d${i}`} />
                      </span>
                    </span>
                    <DiscHub id={`${uid}d${i}`} />
                    <span className="dcc-sheen" />
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {reviews.length > 0 && (
          <div className="dcc-revs" aria-hidden="true">
            {reviews.map((r, k) => (
              <figure
                key={`${current}-${k}`}
                className="dcc-rev dcc-in"
                style={{ ["--i" as string]: credits.length + k }}
              >
                <Stars count={r.stars ?? 5} />
                <figcaption className="dcc-src">{r.source}</figcaption>
                <blockquote className="dcc-quote" style={{ fontFamily: displayFont }}>
                  {`“${r.quote}”`}
                </blockquote>
              </figure>
            ))}
          </div>
        )}

        {hint && (
          <div className="dcc-hint" aria-hidden="true">
            {hint}
          </div>
        )}

        <div className="dcc-ctl" data-dcc-ui="">
          <button
            type="button"
            className="dcc-btn"
            aria-label={`Previous ${itemName}`}
            disabled={!loop && current === 0}
            onClick={prev}
          >
            <Arrow dir="left" />
          </button>
          <span className="dcc-count" aria-hidden="true">
            <b>{pad2(current + 1)}</b> / {pad2(n)}
          </span>
          <button
            type="button"
            className="dcc-btn"
            aria-label={`Next ${itemName}`}
            disabled={!loop && current === n - 1}
            onClick={next}
          >
            <Arrow dir="right" />
          </button>
        </div>

        <div className="dcc-sr" aria-live="polite" aria-atomic="true">
          {`${noun} ${current + 1} of ${n}: ${item.title}${year ? `, ${year}` : ""}`}
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const CSS = `
.dcc-root{position:relative;overflow:hidden;width:100%;container-type:inline-size;color:var(--color-foreground,#1a1a1a);user-select:none;-webkit-user-select:none;touch-action:pan-y;outline:none;-webkit-tap-highlight-color:transparent;--dcc-pad:clamp(16px,3.6cqw,44px)}
.dcc-root:focus-visible{box-shadow:inset 0 0 0 2px var(--color-primary,currentColor)}
.dcc-root[data-dragging],.dcc-root[data-dragging] .dcc-slide{cursor:grabbing}
.dcc-frame{position:absolute;inset:calc(var(--dcc-pad)*.45);pointer-events:none;z-index:1;border:1px solid color-mix(in srgb,currentColor 14%,transparent)}

.dcc-stage{position:absolute;left:50%;top:52%;width:var(--dcc-s);aspect-ratio:1/1;transform:translate(-50%,-50%);perspective:calc(var(--dcc-s)*3.2)}
.dcc-slide{position:absolute;inset:0;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;border-radius:50%;cursor:pointer;will-change:transform;transform-style:preserve-3d;-webkit-tap-highlight-color:transparent;outline:none}
.dcc-tilt{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.dcc-slide[data-active] .dcc-tilt{transform:translateZ(var(--dcc-lift,0px)) rotateX(calc(var(--dcc-py,0)*-12deg)) rotateY(calc(var(--dcc-px,0)*12deg))}
.dcc-slide[data-active]:hover{--dcc-lift:calc(var(--dcc-s)*.05)}
.dcc-shade{position:absolute;inset:0;border-radius:50%;pointer-events:none;transform:translate3d(0,7%,-18px) scale(.97);background:radial-gradient(circle closest-side,transparent 30%,rgba(0,0,0,.2) 52%,rgba(0,0,0,.1) 80%,transparent 100%)}
.dcc-edge,.dcc-disc{position:absolute;inset:0;border-radius:50%;-webkit-mask:radial-gradient(circle closest-side,transparent 16.6%,#000 17.1%);mask:radial-gradient(circle closest-side,transparent 16.6%,#000 17.1%)}
.dcc-edge{transform:translateZ(-4px);background:linear-gradient(160deg,#d7d9dc,#8d9196 55%,#c4c7cb)}
.dcc-disc{overflow:hidden;background:#cfd2d6;box-shadow:inset 0 0 0 1px rgba(255,255,255,.28),inset 0 0 0 2px rgba(0,0,0,.08)}
.dcc-roll,.dcc-idle{position:absolute;inset:0;border-radius:50%}
.dcc-roll{transform:rotate(var(--dcc-roll,0deg))}
.dcc-root[data-spin] .dcc-idle{animation:dcc-spin var(--dcc-spin,24s) linear infinite;animation-play-state:paused}
.dcc-root[data-spin] .dcc-slide[data-active] .dcc-idle{animation-play-state:running}
.dcc-root[data-dragging] .dcc-slide .dcc-idle{animation-play-state:paused}
@keyframes dcc-spin{to{transform:rotate(1turn)}}
.dcc-idle>img{position:absolute;inset:0;width:100%;height:100%;max-width:none;display:block;object-fit:cover}
.dcc-idle>svg,.dcc-hub{position:absolute;inset:0;width:100%;height:100%;max-width:none;display:block;overflow:visible}
.dcc-hub{pointer-events:none}
.dcc-sheen{position:absolute;inset:0;border-radius:50%;pointer-events:none;mix-blend-mode:screen;opacity:var(--dcc-sheen);background:conic-gradient(from calc(var(--dcc-glint,0deg) + var(--dcc-px,0)*70deg),transparent 0deg,rgba(255,255,255,.5) 16deg,transparent 38deg,transparent 140deg,rgba(150,215,255,.32) 168deg,rgba(255,170,225,.32) 186deg,rgba(255,236,170,.26) 200deg,transparent 224deg,transparent 360deg),radial-gradient(circle at 32% 24%,rgba(255,255,255,.3),transparent 46%)}
.dcc-slide:focus-visible .dcc-disc{box-shadow:inset 0 0 0 3px var(--color-background,#fff),inset 0 0 0 6px var(--color-primary,#171717)}

.dcc-nav{position:absolute;top:calc(var(--dcc-pad)*.9);left:50%;transform:translateX(-50%);z-index:5;display:flex;align-items:center;gap:clamp(12px,1.8cqw,22px);font-size:12px;white-space:nowrap}
.dcc-brand{font-weight:800;font-size:15px;letter-spacing:-.04em;margin-right:clamp(6px,1.4cqw,18px)}
.dcc-link{position:relative;color:inherit;text-decoration:none;opacity:.6;transition:opacity .2s;padding:4px 0}
.dcc-link:hover,.dcc-link[aria-current]{opacity:1}
.dcc-link[aria-current]::after{content:"";position:absolute;left:50%;bottom:-5px;width:3px;height:3px;margin-left:-1.5px;border-radius:50%;background:currentColor}
.dcc-menu{position:relative}
.dcc-menubtn{display:inline-flex;align-items:center;gap:4px;margin:0;padding:4px 0;border:0;background:none;color:inherit;font:inherit;cursor:pointer;opacity:.6;transition:opacity .2s}
.dcc-menubtn:hover,.dcc-menubtn[aria-expanded="true"]{opacity:1}
.dcc-menubtn svg{transition:transform .25s}
.dcc-menubtn[aria-expanded="true"] svg{transform:rotate(180deg)}
.dcc-list{position:absolute;top:calc(100% + 10px);left:50%;transform:translateX(-50%);min-width:240px;margin:0;padding:6px;list-style:none;border-radius:10px;background:color-mix(in oklab,var(--dcc-surface,var(--color-background,#fff)) 86%,transparent);border:1px solid color-mix(in srgb,currentColor 12%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 12px 32px -12px rgba(0,0,0,.28);animation:dcc-drop .22s cubic-bezier(.2,.7,.2,1) both}
@keyframes dcc-drop{from{opacity:0;transform:translate(-50%,-6px)}}
.dcc-opt{display:flex;align-items:baseline;gap:10px;width:100%;margin:0;padding:7px 10px;border:0;border-radius:6px;background:none;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}
.dcc-opt:hover,.dcc-opt:focus-visible{outline:none;background:color-mix(in srgb,currentColor 8%,transparent)}
.dcc-opt[aria-current] .dcc-optt{font-weight:600}
.dcc-optn{font-size:10px;opacity:.45;font-variant-numeric:tabular-nums}
.dcc-opty{margin-left:auto;font-size:10px;opacity:.45;font-variant-numeric:tabular-nums}

.dcc-head{position:absolute;top:var(--dcc-pad);left:var(--dcc-pad);z-index:4;width:clamp(170px,21cqw,290px);pointer-events:none}
.dcc-title{margin:0 0 10px;font-weight:400;font-size:clamp(20px,2.5cqw,34px);line-height:.98;letter-spacing:-.01em;text-transform:uppercase;text-wrap:balance}
.dcc-dl{margin:0}
.dcc-row{display:flex;justify-content:space-between;gap:12px;padding:5px 0 6px;border-top:1px solid color-mix(in srgb,currentColor 55%,transparent)}
.dcc-row dt{font-size:7.5px;line-height:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;opacity:.75}
.dcc-row dd{margin:0;font-size:10.5px;line-height:13px;text-align:right}
.dcc-row dd span{display:block}
.dcc-in{animation:dcc-in .8s cubic-bezier(.2,.7,.1,1) both;animation-delay:calc(var(--i,0)*60ms)}
@keyframes dcc-in{from{opacity:0;transform:translateY(12px);filter:blur(5px)}}

.dcc-revs{position:absolute;bottom:calc(var(--dcc-pad)*1.1);left:50%;transform:translateX(-50%);z-index:4;display:flex;gap:clamp(24px,7cqw,96px);pointer-events:none}
.dcc-rev{width:clamp(130px,15cqw,200px);margin:0;text-align:center}
.dcc-stars{font-size:8px;letter-spacing:3px;margin-bottom:6px}
.dcc-star-off{opacity:.25}
.dcc-src{font-size:6.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px}
.dcc-quote{margin:0;font-size:clamp(13px,1.35cqw,17px);line-height:1.02;text-transform:uppercase;text-wrap:balance}

.dcc-ctl{position:absolute;right:var(--dcc-pad);bottom:var(--dcc-pad);z-index:5;display:flex;align-items:center;gap:10px}
.dcc-btn{display:grid;place-items:center;width:34px;height:34px;margin:0;padding:0;border-radius:999px;border:1px solid color-mix(in srgb,currentColor 22%,transparent);background:none;color:inherit;cursor:pointer;transition:background .2s,opacity .2s,transform .2s}
.dcc-btn:hover:not(:disabled){background:color-mix(in srgb,currentColor 8%,transparent)}
.dcc-btn:active:not(:disabled){transform:scale(.9)}
.dcc-btn:disabled{opacity:.28;cursor:default}
.dcc-btn:focus-visible,.dcc-menubtn:focus-visible,.dcc-link:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.dcc-count{font-size:11px;letter-spacing:.08em;font-variant-numeric:tabular-nums;min-width:58px;text-align:center}
.dcc-count b{font-weight:600}
.dcc-hint{position:absolute;left:var(--dcc-pad);bottom:var(--dcc-pad);z-index:4;font-size:9px;letter-spacing:.18em;text-transform:uppercase;opacity:.45;pointer-events:none;line-height:34px}
.dcc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

@container (max-width:720px){
  .dcc-link{display:none}
  .dcc-rev+.dcc-rev{display:none}
  .dcc-hint{display:none}
  .dcc-head{width:clamp(150px,44cqw,230px);top:calc(var(--dcc-pad)*3.2)}
  .dcc-root[data-nonav] .dcc-head{top:var(--dcc-pad)}
  .dcc-row:nth-child(n+3){display:none}
}
@container (max-width:420px){
  .dcc-revs{bottom:calc(var(--dcc-pad)*4.4)}
}
@media (prefers-reduced-motion:reduce){
  .dcc-root .dcc-idle{animation:none}
  .dcc-in,.dcc-list{animation:none}
  .dcc-tilt,.dcc-btn,.dcc-link,.dcc-menubtn svg{transition:none}
}
`
