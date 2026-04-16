import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// PALETA: negro, rojo #cc0000, plomo #6b7280
// Bolitas: muestran materia + puntaje, grandes y visibles, zoom en hover
// Sigue cursor, 3D, sin rotación automática

export default function Radar3D({ competencias = [], nombreCursante = '' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current || competencias.length === 0) return

    const container = mountRef.current
    const W = container.clientWidth
    const H = container.clientHeight

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x080808)

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.set(0, 4.5, 10)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // ── Luces ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const redLight = new THREE.PointLight(0xcc0000, 3, 18)
    redLight.position.set(4, 4, 4)
    scene.add(redLight)
    const grayLight = new THREE.PointLight(0x888888, 1.5, 18)
    grayLight.position.set(-4, 2, -4)
    scene.add(grayLight)

    const grupo = new THREE.Group()
    scene.add(grupo)

    const total = competencias.length
    const radio = 3.5

    // ── Color según puntaje (rojo escala) ─────────────────────────────────
    const getColor = (p) => {
      if (p >= 85) return 0xcc0000      // rojo fuerte
      if (p >= 70) return 0x881111      // rojo oscuro
      if (p >= 50) return 0x4b5563      // plomo
      return 0x374151                    // plomo oscuro
    }

    // ── Anillos de referencia (plomo) ─────────────────────────────────────
    ;[0.25, 0.5, 0.75, 1.0].forEach(f => {
      const geo = new THREE.RingGeometry(radio * f - 0.015, radio * f, 64)
      const mat = new THREE.MeshBasicMaterial({
        color: 0x2a2a2a, side: THREE.DoubleSide,
        transparent: true, opacity: 0.6
      })
      const m = new THREE.Mesh(geo, mat)
      m.rotation.x = -Math.PI / 2
      grupo.add(m)
    })

    // ── Plano base ────────────────────────────────────────────────────────
    const plano = new THREE.Mesh(
      new THREE.CircleGeometry(radio, 64),
      new THREE.MeshBasicMaterial({ color: 0x0d0d0d, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    )
    plano.rotation.x = -Math.PI / 2
    plano.position.y = -0.01
    grupo.add(plano)

    // ── Datos por competencia ─────────────────────────────────────────────
    const puntos = []
    const esferas = []
    const sprites = []

    competencias.forEach((comp, i) => {
      const angulo = (i / total) * Math.PI * 2 - Math.PI / 2
      const valor  = comp.puntaje / 100
      const px = Math.cos(angulo) * radio * valor
      const pz = Math.sin(angulo) * radio * valor
      const py = (comp.puntaje - 50) / 20

      puntos.push(new THREE.Vector3(px, py, pz))

      const color = getColor(comp.puntaje)

      // Eje radial
      const ejeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angulo) * radio, 0, Math.sin(angulo) * radio)
      ])
      grupo.add(new THREE.Line(ejeGeo, new THREE.LineBasicMaterial({ color: 0x1f1f1f })))

      // ── Esfera principal ─────────────────────────────────────────────────
      const esfera = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 32, 32),
        new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0.45,
          roughness: 0.25, metalness: 0.55
        })
      )
      esfera.position.set(px, py, pz)
      esfera.userData = { comp, px, py, pz, color, idx: i }
      grupo.add(esfera)
      esferas.push(esfera)

      // ── Sprite canvas: nombre materia + puntaje grande ───────────────────
      const canvas = document.createElement('canvas')
      canvas.width  = 220
      canvas.height = 140
      const ctx = canvas.getContext('2d')

      // Fondo circular oscuro
      ctx.beginPath()
      ctx.arc(110, 70, 65, 0, Math.PI * 2)
      ctx.fillStyle = '#0d0d0d'
      ctx.fill()

      // Borde de color
      ctx.strokeStyle = comp.puntaje >= 85 ? '#cc0000'
                      : comp.puntaje >= 70 ? '#881111'
                      : '#4b5563'
      ctx.lineWidth = 5
      ctx.stroke()

      // Puntaje — grande y centrado
      ctx.fillStyle = comp.puntaje >= 85 ? '#ff4444'
                    : comp.puntaje >= 70 ? '#cc2222'
                    : '#9ca3af'
      ctx.font = 'bold 46px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(Math.round(comp.puntaje), 110, 58)

      // Nombre de la materia — abajo
      ctx.fillStyle = '#cccccc'
      ctx.font = 'bold 16px Arial'
      const nombre = comp.nombre?.length > 12 ? comp.nombre.substring(0, 11) + '.' : (comp.nombre || '')
      ctx.fillText(nombre, 110, 100)

      // Categoría (pequeña)
      if (comp.categoria) {
        ctx.fillStyle = '#555555'
        ctx.font = '11px Arial'
        const cat = comp.categoria?.length > 14 ? comp.categoria.substring(0, 13) + '.' : comp.categoria
        ctx.fillText(cat, 110, 120)
      }

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true })
      const sprite = new THREE.Sprite(spriteMat)
      const baseY = py + 0.72
      const baseScale = 1.1
      sprite.position.set(px, baseY, pz)
      sprite.scale.set(baseScale, baseScale * (140 / 220), baseScale)
      sprite.userData = { baseY, baseScale }
      grupo.add(sprite)
      sprites.push(sprite)

      // Línea vertical
      const lineaGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(px, 0, pz),
        new THREE.Vector3(px, py, pz)
      ])
      grupo.add(new THREE.Line(lineaGeo,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 })))
    })

    // ── Polígono del radar ────────────────────────────────────────────────
    grupo.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([...puntos, puntos[0]]),
      new THREE.LineBasicMaterial({ color: 0xcc0000, linewidth: 2 })
    ))

    // ── Superficie rellena roja semitransparente ───────────────────────────
    const shape = new THREE.Shape()
    puntos.forEach((p, i) => i === 0 ? shape.moveTo(p.x, p.z) : shape.lineTo(p.x, p.z))
    shape.closePath()
    const superficie = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({ color: 0xcc0000, transparent: true, opacity: 0.07, side: THREE.DoubleSide })
    )
    superficie.rotation.x = -Math.PI / 2
    grupo.add(superficie)

    // ── Partículas rojas/plomo flotantes ──────────────────────────────────
    const pCount = 180
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 18
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    scene.add(new THREE.Points(pGeo,
      new THREE.PointsMaterial({ color: 0xcc0000, size: 0.04, transparent: true, opacity: 0.25 })))

    // ── Raycaster para hover/zoom ─────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    let hoveredIdx = null
    const state = { rotY: 0, rotX: 0.35, targetY: 0, targetX: 0.35 }

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1

      // Parallax suave
      state.targetY = ((e.clientX - rect.left) / rect.width  - 0.5) * 1.2
      state.targetX = ((e.clientY - rect.top)  / rect.height - 0.5) * 0.7

      // Raycasting sobre esferas
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(esferas)

      // Reset todos
      sprites.forEach((sp, idx) => {
        sp.scale.set(sp.userData.baseScale, sp.userData.baseScale * (140 / 220), sp.userData.baseScale)
        sp.position.y = sp.userData.baseY
        esferas[idx].material.emissiveIntensity = 0.45
      })

      hoveredIdx = null
      if (hits.length > 0) {
        const idx = esferas.indexOf(hits[0].object)
        if (idx !== -1) {
          // Zoom al sprite
          const sp = sprites[idx]
          const zScale = 1.9
          sp.scale.set(zScale, zScale * (140 / 220), zScale)
          sp.position.y = sp.userData.baseY + 0.25
          esferas[idx].material.emissiveIntensity = 0.85
          hoveredIdx = idx
          container.style.cursor = 'pointer'
        }
      } else {
        container.style.cursor = 'none'
      }
    }
    container.addEventListener('mousemove', onMouseMove)

    // ── Loop de animación ─────────────────────────────────────────────────
    let frame
    const animate = () => {
      frame = requestAnimationFrame(animate)

      state.rotY += (state.targetY - state.rotY) * 0.05
      state.rotX += (state.targetX - state.rotX) * 0.05

      grupo.rotation.y = state.rotY
      grupo.rotation.x = state.rotX

      // Luz dinámica
      redLight.position.x = Math.sin(Date.now() * 0.0005) * 5
      redLight.position.z = Math.cos(Date.now() * 0.0005) * 5

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      container.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [competencias])

  return (
    <div style={{ position: 'relative', background: '#080808', borderRadius: 12, overflow: 'hidden' }}>
      {/* Nombre del cursante */}
      {nombreCursante && (
        <div style={{
          position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', zIndex: 10,
          pointerEvents: 'none',
        }}>
          <span style={{
            color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: '0.12em',
            background: 'rgba(0,0,0,0.6)', padding: '4px 18px', borderRadius: 20,
            border: '1px solid rgba(204,0,0,0.4)',
          }}>
            {nombreCursante.toUpperCase()}
          </span>
        </div>
      )}

      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '460px',
          cursor: 'none',
        }}
      />
      <p style={{
        position: 'absolute', bottom: 10, right: 14,
        color: '#cc0000', fontSize: 9, opacity: 0.5,
        pointerEvents: 'none', letterSpacing: '0.2em',
      }}>
        MUEVE EL CURSOR · HOVER PARA ZOOM
      </p>
    </div>
  )
}