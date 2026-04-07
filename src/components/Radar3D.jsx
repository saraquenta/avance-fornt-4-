import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Radar3D({ competencias = [] }) {
  const mountRef = useRef(null)
  const stateRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotY: 0,
    rotX: 0.4,
  })

  useEffect(() => {
    if (!mountRef.current || competencias.length === 0) return

    const container = mountRef.current
    const w = container.clientWidth
    const h = container.clientHeight
    const s = stateRef.current

    // ── Escena ──────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a1628)

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    camera.position.set(0, 4, 9)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // ── Luces ───────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const luz1 = new THREE.PointLight(0x4ade80, 2, 20)
    luz1.position.set(5, 5, 5)
    scene.add(luz1)
    
    const luz2 = new THREE.PointLight(0x60a5fa, 1.5, 20)
    luz2.position.set(-5, 3, -5)
    scene.add(luz2)

    // ── Grupo principal ──────────────────────────────
    const grupo = new THREE.Group()
    scene.add(grupo)

    const total = competencias.length
    const radio = 3.5

    // Anillos de referencia
    ;[0.25, 0.5, 0.75, 1.0].forEach(f => {
      const geo = new THREE.RingGeometry(radio * f - 0.02, radio * f, 64)
      const mat = new THREE.MeshBasicMaterial({
        color: 0x1e3a5f, side: THREE.DoubleSide,
        transparent: true, opacity: 0.4
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = -Math.PI / 2
      grupo.add(mesh)
    })

    // Plano base
    const planoGeo = new THREE.CircleGeometry(radio, 64)
    const planoMat = new THREE.MeshBasicMaterial({
      color: 0x0d2137, transparent: true, opacity: 0.5,
      side: THREE.DoubleSide
    })
    const plano = new THREE.Mesh(planoGeo, planoMat)
    plano.rotation.x = -Math.PI / 2
    plano.position.y = -0.01
    grupo.add(plano)

    // ── Competencias ─────────────────────────────────
    const puntos = []

    competencias.forEach((comp, i) => {
      // AQUÍ ESTABA EL ERROR: Se agregó 'angulo' e '(i'
      const angulo = (i / total) * Math.PI * 2 - Math.PI / 2
      const valor = comp.puntaje / 100
      const px = Math.cos(angulo) * radio * valor
      const pz = Math.sin(angulo) * radio * valor
      const py = (comp.puntaje - 50) / 22

      puntos.push(new THREE.Vector3(px, py, pz))

      const color = comp.puntaje >= 85 ? 0x4ade80
                  : comp.puntaje >= 70 ? 0x60a5fa
                  : comp.puntaje >= 50 ? 0xfbbf24
                  : 0xf87171

      // Eje
      const ejeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angulo) * radio, 0, Math.sin(angulo) * radio)
      ])
      grupo.add(new THREE.Line(ejeGeo,
        new THREE.LineBasicMaterial({ color: 0x2d4a6e })))

      // Esfera principal
      const esfera = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 32, 32),
        new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0.7,
          roughness: 0.2, metalness: 0.4
        })
      )
      esfera.position.set(px, py, pz)
      grupo.add(esfera)

      // Aura
      const aura = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12 })
      )
      aura.position.set(px, py, pz)
      grupo.add(aura)

      // Línea vertical
      const lineaGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(px, 0, pz),
        new THREE.Vector3(px, py, pz)
      ])
      grupo.add(new THREE.Line(lineaGeo,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 })))
    })

    // Polígono del radar
    if (puntos.length > 0) {
        grupo.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([...puntos, puntos[0]]),
          new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 })
        ))
    }

    // Partículas de fondo
    const partPos = new Float32Array(300 * 3)
    for (let i = 0; i < 300 * 3; i++) partPos[i] = (Math.random() - 0.5) * 20
    const partGeo = new THREE.BufferGeometry()
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3))
    scene.add(new THREE.Points(partGeo,
      new THREE.PointsMaterial({ color: 0x1e3a5f, size: 0.06 })))

    // ── Manejo de Eventos ────────────────────────────
    const onPointerDown = (e) => {
      s.isDragging = true
      s.prevX = e.clientX || (e.touches && e.touches[0].clientX)
      s.prevY = e.clientY || (e.touches && e.touches[0].clientY)
      renderer.domElement.style.cursor = 'grabbing'
    }

    const onPointerMove = (e) => {
      if (!s.isDragging) return
      const cx = e.clientX || (e.touches && e.touches[0].clientX)
      const cy = e.clientY || (e.touches && e.touches[0].clientY)
      
      s.rotY += (cx - s.prevX) * 0.01
      s.rotX += (cy - s.prevY) * 0.01
      s.rotX = Math.max(-1.4, Math.min(1.4, s.rotX))
      
      s.prevX = cx
      s.prevY = cy
    }

    const onPointerUp = () => {
      s.isDragging = false
      renderer.domElement.style.cursor = 'grab'
    }

    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    // ── Animación ────────────────────────────────────
    let frame
    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!s.isDragging) s.rotY += 0.005
      
      grupo.rotation.y = s.rotY
      grupo.rotation.x = s.rotX
      
      luz1.position.x = Math.sin(Date.now() * 0.001) * 6
      renderer.render(scene, camera)
    }
    animate()

    // ── Limpieza ─────────────────────────────────────
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [competencias])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '420px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#0a1628'
        }}
      />
    </div>
  )
}