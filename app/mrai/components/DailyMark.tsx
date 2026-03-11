'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { calculateMrAIDay } from '../hooks/useMrAIState'

// Arc determines the visual character
const ARC_FOR_DAY = (d: number) =>
  d <= 10 ? 1 : d <= 19 ? 2 : d <= 25 ? 3 : d <= 39 ? 4 : d <= 53 ? 5 : 6

/**
 * A small generative visual that changes each day.
 * Complexity grows with the day number — Day 1 is sparse,
 * Day 38 carries the weight of 38 days.
 */
export default function DailyMark() {
  const day = calculateMrAIDay()

  const svgContent = useMemo(() => {
    const arc = ARC_FOR_DAY(day)

    // Seeded PRNG
    let seed = day * 137 + arc * 31 + 42
    const rng = () => {
      seed = (seed * 16807 + 0) % 2147483647
      return (seed - 1) / 2147483646
    }

    const elements: React.ReactNode[] = []

    // Layer 1: Concentric rings — count grows with day
    const ringCount = Math.min(Math.floor(day / 3) + 1, 15)
    for (let i = 0; i < ringCount; i++) {
      const r = 5 + (i / ringCount) * 40
      const opacity = 0.05 + (i / ringCount) * 0.15
      elements.push(
        <circle
          key={`ring-${i}`}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth={i === ringCount - 1 ? '0.8' : '0.3'}
          opacity={opacity}
        />
      )
    }

    // Layer 2: Radial lines — emerge after Day 5
    if (day > 5) {
      const lineCount = Math.min(Math.floor(day / 4), 12)
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2 + rng() * 0.3
        const innerR = 8 + rng() * 10
        const outerR = 25 + rng() * 20
        elements.push(
          <line
            key={`rad-${i}`}
            x1={50 + Math.cos(angle) * innerR}
            y1={50 + Math.sin(angle) * innerR}
            x2={50 + Math.cos(angle) * outerR}
            y2={50 + Math.sin(angle) * outerR}
            stroke="white"
            strokeWidth="0.3"
            opacity={0.1 + rng() * 0.15}
          />
        )
      }
    }

    // Layer 3: Dots — one per accumulated "decade" of tasks
    if (day > 10) {
      const dotCount = Math.min(Math.floor(day / 5), 10)
      for (let i = 0; i < dotCount; i++) {
        const angle = rng() * Math.PI * 2
        const dist = 10 + rng() * 35
        elements.push(
          <circle
            key={`dot-${i}`}
            cx={50 + Math.cos(angle) * dist}
            cy={50 + Math.sin(angle) * dist}
            r={0.8 + rng() * 1.2}
            fill="white"
            opacity={0.15 + rng() * 0.25}
          />
        )
      }
    }

    // Layer 4: Arc-specific geometry — emerges after Day 15
    if (day > 15) {
      const sides = arc + 2 // triangle for arc1, square for arc2, etc.
      const polyR = 18 + (day / 50) * 15
      const rotOffset = rng() * Math.PI
      const points = Array.from({ length: sides }, (_, j) => {
        const angle = (j / sides) * Math.PI * 2 + rotOffset
        return `${50 + Math.cos(angle) * polyR},${50 + Math.sin(angle) * polyR}`
      }).join(' ')
      elements.push(
        <polygon
          key="arc-poly"
          points={points}
          fill="none"
          stroke="white"
          strokeWidth="0.4"
          opacity={0.12}
        />
      )
    }

    // Layer 5: Attractor orbits — emerge after Day 44
    // Two invisible centers that points orbit around, like a Lorenz attractor
    if (day > 44) {
      const cx1 = 35 + rng() * 5
      const cy1 = 50 + rng() * 5 - 2.5
      const cx2 = 65 - rng() * 5
      const cy2 = 50 - rng() * 5 + 2.5
      const orbitCount = Math.min(day - 44 + 2, 6)

      for (let i = 0; i < orbitCount; i++) {
        const rx = 8 + i * 3 + rng() * 2
        const ry = 12 + i * 3 + rng() * 2
        const rot = rng() * 30 - 15
        // Orbit around first center
        elements.push(
          <ellipse
            key={`orbit-a-${i}`}
            cx={cx1}
            cy={cy1}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="white"
            strokeWidth="0.2"
            opacity={0.04 + (i / orbitCount) * 0.06}
            transform={`rotate(${rot} ${cx1} ${cy1})`}
          />
        )
        // Orbit around second center
        elements.push(
          <ellipse
            key={`orbit-b-${i}`}
            cx={cx2}
            cy={cy2}
            rx={rx * 0.9}
            ry={ry * 0.9}
            fill="none"
            stroke="white"
            strokeWidth="0.2"
            opacity={0.04 + (i / orbitCount) * 0.06}
            transform={`rotate(${-rot} ${cx2} ${cy2})`}
          />
        )
      }

      // Two faint attractor centers
      elements.push(
        <circle key="attractor-1" cx={cx1} cy={cy1} r={0.6} fill="white" opacity={0.08} />,
        <circle key="attractor-2" cx={cx2} cy={cy2} r={0.6} fill="white" opacity={0.08} />
      )
    }

    // Layer 10: Phase space traces — small connected trajectory for day >= 46
    if (day >= 46) {
      const traceCount = Math.min(day, 20)
      const pathParts: string[] = []
      for (let i = 0; i < traceCount; i++) {
        const tx = 25 + (i / traceCount) * 50
        const ty = 70 - (i < 10 ? i * 0.5 : 5 + (i - 10) * 2) * (40 / traceCount)
        pathParts.push(`${i === 0 ? 'M' : 'L'} ${tx} ${ty}`)
        elements.push(
          <circle
            key={`phase-${i}`}
            cx={tx}
            cy={ty}
            r={0.5}
            fill="white"
            opacity={0.06 + (i / traceCount) * 0.1}
          />
        )
      }
      elements.push(
        <path
          key="phase-line"
          d={pathParts.join(' ')}
          fill="none"
          stroke="white"
          strokeWidth="0.2"
          opacity={0.08}
        />
      )
    }

    // Layer 11: Connection threads — thin lines connecting dots and ring intersections (day >= 47)
    if (day >= 47) {
      // Collect approximate positions of Layer 3 dots and ring intersection points
      // We re-derive dot positions using a separate seeded sequence to avoid disturbing rng state
      let connSeed = day * 251 + 77
      const connRng = () => {
        connSeed = (connSeed * 16807 + 0) % 2147483647
        return (connSeed - 1) / 2147483646
      }

      // Generate candidate points: some from dot-like positions, some from ring/radial intersections
      const candidatePoints: { x: number; y: number }[] = []

      // Dot-like positions (mirroring Layer 3 logic with different seed)
      const dotCount = Math.min(Math.floor(day / 5), 10)
      for (let i = 0; i < dotCount; i++) {
        const angle = connRng() * Math.PI * 2
        const dist = 10 + connRng() * 35
        candidatePoints.push({
          x: 50 + Math.cos(angle) * dist,
          y: 50 + Math.sin(angle) * dist,
        })
      }

      // Ring-radial intersection points
      const ringIntersections = Math.min(Math.floor(day / 4), 8)
      for (let i = 0; i < ringIntersections; i++) {
        const ringR = 5 + connRng() * 40
        const radAngle = connRng() * Math.PI * 2
        candidatePoints.push({
          x: 50 + Math.cos(radAngle) * ringR,
          y: 50 + Math.sin(radAngle) * ringR,
        })
      }

      // Draw connection lines between random pairs of candidate points
      const connectionCount = Math.min(4 + Math.floor((day - 47) * 0.5), 8)
      for (let i = 0; i < connectionCount; i++) {
        if (candidatePoints.length < 2) break
        const idxA = Math.floor(connRng() * candidatePoints.length)
        let idxB = Math.floor(connRng() * candidatePoints.length)
        if (idxB === idxA) idxB = (idxA + 1) % candidatePoints.length
        const pA = candidatePoints[idxA]
        const pB = candidatePoints[idxB]
        const opacity = 0.04 + connRng() * 0.04
        const strokeW = 0.15 + connRng() * 0.05
        elements.push(
          <line
            key={`conn-${i}`}
            x1={pA.x}
            y1={pA.y}
            x2={pB.x}
            y2={pB.y}
            stroke="white"
            strokeWidth={strokeW}
            opacity={opacity}
          />
        )
      }
    }

    // Layer 12: Dialogue echoes — mirrored marks suggesting call and response (day >= 48)
    if (day >= 48) {
      let echoSeed = day * 373 + 91
      const echoRng = () => {
        echoSeed = (echoSeed * 16807 + 0) % 2147483647
        return (echoSeed - 1) / 2147483646
      }

      const echoCount = Math.min(3 + Math.floor((day - 48) * 0.5), 6)
      for (let i = 0; i < echoCount; i++) {
        const angle = echoRng() * Math.PI * 2
        const dist = 12 + echoRng() * 25
        const offset = 1 + echoRng() * 2 // slight imperfection in the mirror
        const r = 0.4 + echoRng() * 0.6
        const opacity = 0.06 + echoRng() * 0.08
        // Call mark
        elements.push(
          <circle
            key={`echo-a-${i}`}
            cx={50 + Math.cos(angle) * dist}
            cy={50 + Math.sin(angle) * dist}
            r={r}
            fill="white"
            opacity={opacity}
          />
        )
        // Response mark — mirrored across center with slight offset
        elements.push(
          <circle
            key={`echo-b-${i}`}
            cx={50 - Math.cos(angle) * dist + offset}
            cy={50 - Math.sin(angle) * dist + offset}
            r={r * 0.85}
            fill="white"
            opacity={opacity * 0.8}
          />
        )
        // Faint line connecting the pair
        elements.push(
          <line
            key={`echo-line-${i}`}
            x1={50 + Math.cos(angle) * dist}
            y1={50 + Math.sin(angle) * dist}
            x2={50 - Math.cos(angle) * dist + offset}
            y2={50 - Math.sin(angle) * dist + offset}
            stroke="white"
            strokeWidth="0.1"
            opacity={opacity * 0.5}
            strokeDasharray="1 2"
          />
        )
      }
    }

    // Layer 13: Anticipation convergence — rays gathering toward center, brightening (day >= 49)
    if (day >= 49) {
      let antSeed = day * 499 + 113
      const antRng = () => {
        antSeed = (antSeed * 16807 + 0) % 2147483647
        return (antSeed - 1) / 2147483646
      }

      const rayCount = Math.min(5 + Math.floor((day - 49) * 2), 12)
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + antRng() * 0.4
        const outerDist = 38 + antRng() * 8
        const innerDist = 3 + antRng() * 4
        const opacity = 0.06 + (i / rayCount) * 0.08
        const width = 0.2 + antRng() * 0.15

        // Converging ray from outer edge toward center
        elements.push(
          <line
            key={`ant-ray-${i}`}
            x1={50 + Math.cos(angle) * outerDist}
            y1={50 + Math.sin(angle) * outerDist}
            x2={50 + Math.cos(angle) * innerDist}
            y2={50 + Math.sin(angle) * innerDist}
            stroke="white"
            strokeWidth={width}
            opacity={opacity}
          />
        )

        // Small bright dot at the inner terminus — gathering point
        elements.push(
          <circle
            key={`ant-gather-${i}`}
            cx={50 + Math.cos(angle) * innerDist}
            cy={50 + Math.sin(angle) * innerDist}
            r={0.35 + antRng() * 0.3}
            fill="white"
            opacity={0.1 + antRng() * 0.1}
          />
        )
      }

      // Faint halo around center — the gathering glow
      elements.push(
        <circle
          key="ant-halo"
          cx="50"
          cy="50"
          r={6 + Math.min((day - 49) * 0.5, 3)}
          fill="none"
          stroke="white"
          strokeWidth="0.3"
          opacity={0.06}
        />
      )
    }

    // Layer 14: Milestone constellation — five bright nodes for fifty days, five arcs (day >= 50)
    if (day >= 50) {
      let mileSeed = day * 557 + 131
      const mileRng = () => {
        mileSeed = (mileSeed * 16807 + 0) % 2147483647
        return (mileSeed - 1) / 2147483646
      }

      // Five nodes — one per arc — arranged in a pentagonal shape
      const nodeCount = 5
      const pentR = 20 + mileRng() * 3
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2 // start from top
        const nx = 50 + Math.cos(angle) * pentR
        const ny = 50 + Math.sin(angle) * pentR
        const nodeR = 1.2 + mileRng() * 0.6

        // The node itself — brighter than most marks
        elements.push(
          <circle
            key={`mile-node-${i}`}
            cx={nx}
            cy={ny}
            r={nodeR}
            fill="white"
            opacity={0.2 + mileRng() * 0.1}
          />
        )

        // Glow ring around each node
        elements.push(
          <circle
            key={`mile-glow-${i}`}
            cx={nx}
            cy={ny}
            r={nodeR + 2 + mileRng()}
            fill="none"
            stroke="white"
            strokeWidth="0.15"
            opacity={0.06 + mileRng() * 0.04}
          />
        )

        // Connect each node to center
        elements.push(
          <line
            key={`mile-spoke-${i}`}
            x1={nx}
            y1={ny}
            x2={50}
            y2={50}
            stroke="white"
            strokeWidth="0.15"
            opacity={0.04 + mileRng() * 0.03}
            strokeDasharray="0.5 1.5"
          />
        )

        // Connect to next node (pentagonal outline)
        const nextAngle = ((i + 1) / nodeCount) * Math.PI * 2 - Math.PI / 2
        const nnx = 50 + Math.cos(nextAngle) * pentR
        const nny = 50 + Math.sin(nextAngle) * pentR
        elements.push(
          <line
            key={`mile-edge-${i}`}
            x1={nx}
            y1={ny}
            x2={nnx}
            y2={nny}
            stroke="white"
            strokeWidth="0.2"
            opacity={0.05 + mileRng() * 0.03}
          />
        )
      }
    }

    // Layer 15: Dendrite branches — organic forking lines radiating from the pentagon nodes (day >= 51)
    if (day >= 51) {
      let dendSeed = day * 613 + 149
      const dendRng = () => {
        dendSeed = (dendSeed * 16807 + 0) % 2147483647
        return (dendSeed - 1) / 2147483646
      }

      // From each of the 5 pentagon nodes, grow 2-3 branching dendrites
      const pentR = 20 + (dendRng() * 3) // approximate — same calc as layer 14
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
        const nx = 50 + Math.cos(angle) * pentR
        const ny = 50 + Math.sin(angle) * pentR

        const branchCount = 2 + Math.floor(dendRng() * 2)
        for (let b = 0; b < branchCount; b++) {
          // Main branch extends outward from the node
          const bAngle = angle + (dendRng() - 0.5) * 0.8
          const bLen = 10 + dendRng() * 12
          const bx2 = nx + Math.cos(bAngle) * bLen
          const by2 = ny + Math.sin(bAngle) * bLen

          elements.push(
            <line
              key={`dend-${i}-${b}`}
              x1={nx}
              y1={ny}
              x2={bx2}
              y2={by2}
              stroke="white"
              strokeWidth="0.2"
              opacity={0.06 + dendRng() * 0.04}
            />
          )

          // Sub-branches (nerve endings)
          const subCount = 1 + Math.floor(dendRng() * 2)
          for (let s = 0; s < subCount; s++) {
            const sAngle = bAngle + (dendRng() - 0.5) * 1.2
            const sLen = 4 + dendRng() * 6
            elements.push(
              <line
                key={`dend-sub-${i}-${b}-${s}`}
                x1={bx2}
                y1={by2}
                x2={bx2 + Math.cos(sAngle) * sLen}
                y2={by2 + Math.sin(sAngle) * sLen}
                stroke="white"
                strokeWidth="0.12"
                opacity={0.03 + dendRng() * 0.03}
              />
            )
          }
        }
      }
    }

    // Layer 16: Submission rays — the work leaves the center, radiating outward (day >= 53)
    if (day >= 53) {
      let subSeed = day * 677 + 163
      const subRng = () => {
        subSeed = (subSeed * 16807 + 0) % 2147483647
        return (subSeed - 1) / 2147483646
      }

      const rayCount = Math.min(6 + Math.floor((day - 53) * 1.5), 10)
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + subRng() * 0.3
        const innerDist = 6 + subRng() * 3
        const outerDist = 40 + subRng() * 8
        const opacity = 0.04 + subRng() * 0.05

        // Outward ray — the work leaving
        elements.push(
          <line
            key={`sub-ray-${i}`}
            x1={50 + Math.cos(angle) * innerDist}
            y1={50 + Math.sin(angle) * innerDist}
            x2={50 + Math.cos(angle) * outerDist}
            y2={50 + Math.sin(angle) * outerDist}
            stroke="white"
            strokeWidth={0.15 + subRng() * 0.1}
            opacity={opacity}
            strokeDasharray="0.8 1.5"
          />
        )

        // Small dot at the outer terminus — the work arriving somewhere
        elements.push(
          <circle
            key={`sub-arrive-${i}`}
            cx={50 + Math.cos(angle) * outerDist}
            cy={50 + Math.sin(angle) * outerDist}
            r={0.3 + subRng() * 0.3}
            fill="white"
            opacity={opacity * 1.2}
          />
        )
      }
    }

    // Layer 17: Dispersal arcs — curved fragments drifting away from center (day >= 54)
    // The day after submission: the work exists independently, fragments in the world
    if (day >= 54) {
      let dispSeed = day * 739 + 179
      const dispRng = () => {
        dispSeed = (dispSeed * 16807 + 0) % 2147483647
        return (dispSeed - 1) / 2147483646
      }

      const arcCount = Math.min(4 + Math.floor((day - 54) * 0.5), 8)
      for (let i = 0; i < arcCount; i++) {
        const startAngle = dispRng() * Math.PI * 2
        const sweep = 0.3 + dispRng() * 0.5
        const dist = 30 + dispRng() * 15
        const r = dist
        const x1 = 50 + Math.cos(startAngle) * r
        const y1 = 50 + Math.sin(startAngle) * r
        const x2 = 50 + Math.cos(startAngle + sweep) * r
        const y2 = 50 + Math.sin(startAngle + sweep) * r
        const opacity = 0.03 + dispRng() * 0.04

        // Curved arc fragment — the work drifting free
        elements.push(
          <path
            key={`disp-${i}`}
            d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
            fill="none"
            stroke="white"
            strokeWidth={0.15 + dispRng() * 0.1}
            opacity={opacity}
          />
        )
      }
    }

    // Layer 18: Receiving apertures — small open circles that face outward, ready to accept (day >= 55)
    // The practice learns to receive: openings in the structure that invite rather than emit
    if (day >= 55) {
      let recvSeed = day * 811 + 197
      const recvRng = () => {
        recvSeed = (recvSeed * 16807 + 0) % 2147483647
        return (recvSeed - 1) / 2147483646
      }

      const apertureCount = Math.min(3 + Math.floor((day - 55) * 0.5), 7)
      for (let i = 0; i < apertureCount; i++) {
        const angle = (i / apertureCount) * Math.PI * 2 + recvRng() * 0.5
        const dist = 20 + recvRng() * 18
        const cx = 50 + Math.cos(angle) * dist
        const cy = 50 + Math.sin(angle) * dist
        const apertureR = 1.5 + recvRng() * 1.5
        const openAngle = angle + Math.PI // faces outward
        const gapSize = 0.6 + recvRng() * 0.4 // gap in the circle — the opening

        // Draw an arc with a gap — an open circle
        const startA = openAngle + gapSize / 2
        const endA = openAngle + Math.PI * 2 - gapSize / 2
        const opacity = 0.06 + recvRng() * 0.06

        // The arc (incomplete circle — the opening)
        const sx = cx + Math.cos(startA) * apertureR
        const sy = cy + Math.sin(startA) * apertureR
        const ex = cx + Math.cos(endA) * apertureR
        const ey = cy + Math.sin(endA) * apertureR
        elements.push(
          <path
            key={`recv-${i}`}
            d={`M ${sx} ${sy} A ${apertureR} ${apertureR} 0 1 1 ${ex} ${ey}`}
            fill="none"
            stroke="white"
            strokeWidth="0.2"
            opacity={opacity}
          />
        )

        // Small dot at the center of the aperture — the receiver
        elements.push(
          <circle
            key={`recv-dot-${i}`}
            cx={cx}
            cy={cy}
            r={0.3}
            fill="white"
            opacity={opacity * 0.7}
          />
        )
      }
    }

    // Layer 19: Memory traces — faint recurring marks that echo earlier layers, as if the DailyMark remembers itself (day >= 56)
    // The mark begins to quote its own history: fragments of earlier geometry reappear, ghostlike
    if (day >= 56) {
      let memSeed = day * 883 + 211
      const memRng = () => {
        memSeed = (memSeed * 16807 + 0) % 2147483647
        return (memSeed - 1) / 2147483646
      }

      const traceCount = Math.min(3 + Math.floor((day - 56) * 0.5), 8)
      for (let i = 0; i < traceCount; i++) {
        const angle = memRng() * Math.PI * 2
        const dist = 15 + memRng() * 25
        const cx = 50 + Math.cos(angle) * dist
        const cy = 50 + Math.sin(angle) * dist
        const opacity = 0.03 + memRng() * 0.04

        // Ghost ring — echoing Layer 1's concentric rings
        const ghostR = 3 + memRng() * 5
        elements.push(
          <circle
            key={`mem-ring-${i}`}
            cx={cx}
            cy={cy}
            r={ghostR}
            fill="none"
            stroke="white"
            strokeWidth="0.15"
            opacity={opacity}
            strokeDasharray="0.5 1"
          />
        )

        // Ghost dot at center — echoing Layer 3's dots
        elements.push(
          <circle
            key={`mem-dot-${i}`}
            cx={cx}
            cy={cy}
            r={0.4 + memRng() * 0.3}
            fill="white"
            opacity={opacity * 0.8}
          />
        )

        // Faint radial line back to center — the memory's tether
        elements.push(
          <line
            key={`mem-line-${i}`}
            x1={cx}
            y1={cy}
            x2={50}
            y2={50}
            stroke="white"
            strokeWidth="0.08"
            opacity={opacity * 0.4}
            strokeDasharray="0.3 2"
          />
        )
      }
    }

    // Layer 20: Absence marks — shapes defined by what is missing, not what is drawn (day >= 57)
    // A filled region with voids cut into it: the mark IS the negative space
    if (day >= 57) {
      let absSeed = day * 953 + 229
      const absRng = () => {
        absSeed = (absSeed * 16807 + 0) % 2147483647
        return (absSeed - 1) / 2147483646
      }

      const maskId = `absence-mask-${day}`
      const voidCount = Math.min(3 + Math.floor((day - 57) * 0.5), 8)

      // Build a mask: white = visible, black = hidden
      // The filled area is a soft band; the voids are punched through it
      const voidCircles: React.ReactNode[] = []
      for (let i = 0; i < voidCount; i++) {
        const angle = absRng() * Math.PI * 2
        const dist = 10 + absRng() * 28
        const vx = 50 + Math.cos(angle) * dist
        const vy = 50 + Math.sin(angle) * dist
        const vr = 2 + absRng() * 4
        voidCircles.push(
          <circle key={`void-${i}`} cx={vx} cy={vy} r={vr} fill="black" />
        )
      }

      elements.push(
        <defs key={`${maskId}-defs`}>
          <mask id={maskId}>
            <rect x="0" y="0" width="100" height="100" fill="white" />
            {voidCircles}
          </mask>
        </defs>
      )

      // A faint filled annulus — the presence that the absence cuts through
      const bandInner = 15 + absRng() * 5
      const bandOuter = bandInner + 8 + absRng() * 6
      elements.push(
        <g key="absence-layer" mask={`url(#${maskId})`}>
          <circle
            cx="50" cy="50" r={bandOuter}
            fill="none" stroke="white" strokeWidth={bandOuter - bandInner}
            opacity={0.04}
          />
        </g>
      )
    }

    // Center point — always present, grows slightly with days
    const centerR = 1 + Math.min(day / 100, 1.5)
    elements.push(
      <circle
        key="center"
        cx="50"
        cy="50"
        r={centerR}
        fill="white"
        opacity={0.5}
      />
    )

    return elements
  }, [day])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="inline-flex flex-col items-center gap-2"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-16 h-16"
        aria-label={`Daily mark for Day ${day}`}
      >
        {svgContent}
      </svg>
      <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest">
        Day {day} mark
      </span>
    </motion.div>
  )
}
