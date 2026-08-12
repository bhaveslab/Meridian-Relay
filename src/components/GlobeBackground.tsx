import { useEffect, useRef } from 'react'
import { mountGlobeScene, type GlobeSceneHandle } from '../three/globeScene'

export function GlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let cancelled = false
    let handle: GlobeSceneHandle | null = null

    mountGlobeScene(canvas, document.documentElement).then((h) => {
      if (cancelled) {
        h.dispose()
      } else {
        handle = h
      }
    })

    return () => {
      cancelled = true
      handle?.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="globe-canvas" aria-hidden="true" />
}
