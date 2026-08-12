// Onboarding-only signature motif: gold wireframe globe with glowing network
// nodes over an ambient gold/cream particle field, with a scroll-linked
// camera dolly so particles appear to drift toward the viewer on scroll.
// Kept out of every other screen — Relay needs to stay fast/reliable in the
// field, so this heavier scene only ever mounts on first-open onboarding.
// three.js is dynamically imported so its ~170KB (gzipped) never lands in
// the main bundle every other screen has to pay for.
import type * as ThreeNS from 'three'

export interface GlobeSceneHandle {
  dispose(): void
}

function makeGlowTexture(THREE: typeof ThreeNS): InstanceType<typeof ThreeNS.CanvasTexture> {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 248, 232, 1)')
  g.addColorStop(0.3, 'rgba(240, 200, 120, 0.9)')
  g.addColorStop(0.6, 'rgba(217, 164, 65, 0.4)')
  g.addColorStop(1, 'rgba(217, 164, 65, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export async function mountGlobeScene(canvas: HTMLCanvasElement, scrollRoot: HTMLElement): Promise<GlobeSceneHandle> {
  const THREE = await import('three')
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const particleCount = isMobile ? 900 : 1800
  const targetFrameMs = isMobile ? 1000 / 30 : 1000 / 60

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500)
  camera.position.set(0, 0, 42)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
  renderer.setSize(window.innerWidth, window.innerHeight, false)

  const glowTex = makeGlowTexture(THREE)

  // Ambient particle field
  const positions = new Float32Array(particleCount * 3)
  const home = new Float32Array(particleCount * 3)
  const phases = new Float32Array(particleCount)
  const colors = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 120
    const y = (Math.random() - 0.5) * 90
    const z = Math.random() * -200 + 50
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    home[i * 3] = x
    home[i * 3 + 1] = y
    home[i * 3 + 2] = z
    phases[i] = Math.random() * Math.PI * 2
    const gold = Math.random() > 0.4
    colors[i * 3] = gold ? 0.85 : 0.95
    colors[i * 3 + 1] = gold ? 0.64 : 0.93
    colors[i * 3 + 2] = gold ? 0.25 : 0.87
  }
  const particleGeo = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const particleMat = new THREE.PointsMaterial({
    size: isMobile ? 1.1 : 1.0,
    map: glowTex,
    transparent: true,
    opacity: 0,
    vertexColors: true,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    alphaTest: 0.01,
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  // Wireframe globe (geodesic sphere)
  const globeGeo = new THREE.IcosahedronGeometry(13, 2)
  const globeEdges = new THREE.EdgesGeometry(globeGeo)
  const globeMat = new THREE.LineBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0 })
  const globe = new THREE.LineSegments(globeEdges, globeMat)
  globe.position.set(0, 0, 10)
  scene.add(globe)

  // Glowing network nodes at a subset of the globe's vertices
  const vertexArray = globeGeo.attributes.position.array as Float32Array
  const vertexCount = vertexArray.length / 3
  const nodeStep = Math.max(1, Math.floor(vertexCount / (isMobile ? 22 : 34)))
  const nodePositions: ThreeNS.Vector3[] = []
  for (let i = 0; i < vertexCount; i += nodeStep) {
    nodePositions.push(new THREE.Vector3(vertexArray[i * 3], vertexArray[i * 3 + 1], vertexArray[i * 3 + 2]))
  }
  const nodeSprites = nodePositions.map((pos, idx) => {
    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xf0c878,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(mat)
    sprite.scale.set(1.4, 1.4, 1)
    sprite.userData.basePos = pos
    sprite.userData.phase = (idx / nodePositions.length) * Math.PI * 2
    globe.add(sprite)
    return sprite
  })

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight, false)
  }
  window.addEventListener('resize', onResize)

  let scrollT = 0
  const onScroll = () => {
    const max = Math.max(scrollRoot.scrollHeight - window.innerHeight, 1)
    scrollT = Math.min(Math.max(window.scrollY / max, 0), 1)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  const clock = new THREE.Clock()
  let lastFrame = 0
  let raf: number | null = null

  function animate(now: number) {
    raf = requestAnimationFrame(animate)
    if (now - lastFrame < targetFrameMs - 2) return
    lastFrame = now
    const t = clock.getElapsedTime()
    const fadeIn = Math.min(t / 1.2, 1)
    particleMat.opacity = 0.8 * fadeIn
    globeMat.opacity = 0.85 * fadeIn
    nodeSprites.forEach((sprite) => {
      const mat = sprite.material as ThreeNS.SpriteMaterial
      const pulse = 0.55 + 0.45 * Math.sin(t * 1.4 + sprite.userData.phase)
      mat.opacity = fadeIn * pulse
    })

    // Scroll-linked dolly: particles drift toward the viewer as they scroll.
    const dollyRange = 130
    camera.position.z = 42 - scrollT * dollyRange
    globe.position.z = camera.position.z - 22
    globe.rotation.y += 0.0026
    globe.rotation.x += 0.0008
    globe.scale.setScalar(0.5 + 0.5 * fadeIn)

    particles.rotation.z = Math.sin(t * 0.04) * 0.03
    particles.position.x = Math.sin(t * 0.024) * 2
    particles.position.y = Math.cos(t * 0.02) * 1.2

    const pos = particleGeo.attributes.position.array as Float32Array
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3
      const iy = ix + 1
      const iz = ix + 2
      pos[ix] = home[ix] + Math.sin(t * 0.12 + phases[i]) * 1.4
      pos[iy] = home[iy] + Math.cos(t * 0.1 + phases[i]) * 1.4
      pos[iz] = home[iz] + Math.sin(t * 0.08 + phases[i] * 1.6) * 0.8
    }
    particleGeo.attributes.position.needsUpdate = true

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(animate)

  return {
    dispose() {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      particleGeo.dispose()
      particleMat.dispose()
      globeEdges.dispose()
      globeMat.dispose()
      globeGeo.dispose()
      glowTex.dispose()
      nodeSprites.forEach((s) => (s.material as ThreeNS.SpriteMaterial).dispose())
      renderer.dispose()
    },
  }
}
