import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

// Importar imágenes de inicio
import imgHonor      from '../assets/inicio/honor.jpg'
import imgDisciplina from '../assets/inicio/disciplina.jpg'
import imgExcelencia from '../assets/inicio/excelencia.jpg'
import imgCombate    from '../assets/inicio/combate.jpg'

// Importar imágenes de disciplinas
import imgBoxeo      from '../assets/disciplinas/boxeo.jpg'
import imgCombateD   from '../assets/disciplinas/combate.jpg'
import imgDefensa    from '../assets/disciplinas/defensa.jpg'
import imgJudo       from '../assets/disciplinas/judo.jpg'
import imgTaekwondo  from '../assets/disciplinas/takewondo.png'

/* ═══════════════════════════════════════════════════
   DATOS
═══════════════════════════════════════════════════ */
const SLIDES = [
  { id: 0, titulo: 'HONOR',      subtitulo: 'La base de todo combatiente',  desc: 'Cada efectivo porta con orgullo los valores que definen al soldado boliviano.',          color: '#c9a227', accent: '#8b0000', symbol: '⚔', img: imgHonor      },
  { id: 1, titulo: 'DISCIPLINA', subtitulo: 'El arma más poderosa',         desc: 'La constancia y el rigor en el entrenamiento forjan la élite combativa de nuestra nación.', color: '#4ade80', accent: '#166534', symbol: '🛡', img: imgDisciplina },
  { id: 2, titulo: 'EXCELENCIA', subtitulo: 'El estándar que nos define',   desc: 'Superamos nuestros límites a través de evaluación continua y superación permanente.',   color: '#60a5fa', accent: '#1e3a8a', symbol: '★', img: imgExcelencia },
  { id: 3, titulo: 'COMBATE',    subtitulo: 'Preparados para todo',         desc: 'Cinco disciplinas marciales integradas en un sistema de formación único en Bolivia.',    color: '#f97316', accent: '#7c2d12', symbol: '✦', img: imgCombate    },
]

const DISCIPLINAS = [
  { nombre: 'KARATE',           img: imgBoxeo,    color: '#ef4444', desc: 'Kata y Kumite de alto nivel'      },
  { nombre: 'JUDO',             img: imgJudo,     color: '#2C2621', desc: 'Técnica y proyección'             },
  { nombre: 'TAEKWONDO',        img: imgTaekwondo,color: '#A08484', desc: 'Velocidad y precisión'            },
  { nombre: 'BOXEO',            img: imgBoxeo,    color: '#F02308', desc: 'Resistencia explosiva'            },
  { nombre: 'DEFENSA PERSONAL', img: imgDefensa,  color: '#0D0D0E', desc: 'Combate real y táctico'           },
]

const STATS = [
  { valor: '200+', label: 'Efectivos'   },
  { valor: '15',   label: 'Años'        },
  { valor: '5',    label: 'Disciplinas' },
  { valor: '98%',  label: 'Eficiencia'  },
]

/* ═══════════════════════════════════════════════════
   AUDIO SINTÉTICO MARCIAL
═══════════════════════════════════════════════════ */
function createMilitaryAudio(ctx) {
  const master = ctx.createGain()
  master.gain.value = 0.15
  master.connect(ctx.destination)

  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(master)
    o.frequency.setValueAtTime(100, t)
    o.frequency.exponentialRampToValueAtTime(35, t + 0.18)
    g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
    o.start(t); o.stop(t + 0.3)
  }

  function snare(t) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
    const src = ctx.createBufferSource(), g = ctx.createGain()
    const flt = ctx.createBiquadFilter()
    src.buffer = buf; flt.type = 'bandpass'; flt.frequency.value = 2800
    src.connect(flt); flt.connect(g); g.connect(master)
    g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    src.start(t); src.stop(t + 0.15)
  }

  function horn(t, f, dur) {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sawtooth'; o.frequency.value = f
    o.connect(g); g.connect(master)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.22, t + 0.04)
    g.gain.setValueAtTime(0.22, t + dur - 0.04)
    g.gain.linearRampToValueAtTime(0, t + dur)
    o.start(t); o.stop(t + dur)
  }

  function loop(start) {
    const beat = 60 / 94, bar = beat * 4
    kick(start); kick(start + beat * 2); kick(start + beat * 0.5)
    snare(start + beat); snare(start + beat * 3)
    const melody = [[164.81,0.4],[196,0.4],[220,0.4],[196,0.4],[164.81,0.6],[130.81,0.4],[146.83,0.4],[164.81,0.8]]
    let t = start
    melody.forEach(([f, dur]) => { horn(t, f, dur * 0.8); t += dur * beat * 0.72 })
    return start + bar * 2
  }

  let next = ctx.currentTime + 0.05
  function tick() {
    if (ctx.state === 'closed') return
    while (next < ctx.currentTime + 0.5) next = loop(next)
  }
  tick()
  return setInterval(tick, 100)
}

/* ═══════════════════════════════════════════════════
   THREE.JS — FONDO HERO CON IMAGEN 3D DINÁMICA
═══════════════════════════════════════════════════ */
function HeroBackground3D({ containerRef, imgSrc, color }) {
  const rendererRef = useRef(null)
  const planeRef    = useRef(null)
  const frameRef    = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const W = containerRef.current.clientWidth
    const H = containerRef.current.clientHeight

    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.set(0, 0, 4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    renderer.domElement.style.zIndex = '1'
    renderer.domElement.style.pointerEvents = 'none'
    rendererRef.current = renderer

    // Plano con distorsión
    const geo = new THREE.PlaneGeometry(8, 5, 40, 25)
    const loader = new THREE.TextureLoader()
    loader.load(imgSrc, (texture) => {
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.55,
        side: THREE.FrontSide,
      })
      const plane = new THREE.Mesh(geo, mat)
      plane.position.z = -1
      scene.add(plane)
      planeRef.current = plane
    })

    // Luces atmosféricas
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const pt = new THREE.PointLight(color, 3, 12)
    pt.position.set(2, 2, 3)
    scene.add(pt)

    // Partículas de brillo
    const pCount = 180
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      pPos[i*3]   = (Math.random() - 0.5) * 14
      pPos[i*3+1] = (Math.random() - 0.5) * 9
      pPos[i*3+2] = (Math.random() - 0.5) * 4 - 1
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const sparks = new THREE.Points(pGeo, new THREE.PointsMaterial({ color, size: 0.04, transparent: true, opacity: 0.6 }))
    scene.add(sparks)

    let mx = 0, my = 0
    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
        my = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
      }
    }
    window.addEventListener('mousemove', onMove)

    const clock = new THREE.Clock()
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Ondulación del plano
      if (planeRef.current) {
        const pos = planeRef.current.geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i)
          const y = pos.getY(i)
          pos.setZ(i, Math.sin(x * 0.6 + t * 0.6) * 0.12 + Math.sin(y * 0.5 + t * 0.4) * 0.08)
        }
        pos.needsUpdate = true
        planeRef.current.rotation.x = my * 0.04
        planeRef.current.rotation.y = mx * 0.06
      }

      sparks.rotation.z = t * 0.03
      pt.position.x = Math.sin(t * 0.5) * 3
      pt.position.y = Math.cos(t * 0.4) * 2

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!containerRef.current) return
      const W2 = containerRef.current.clientWidth
      const H2 = containerRef.current.clientHeight
      camera.aspect = W2 / H2
      camera.updateProjectionMatrix()
      renderer.setSize(W2, H2)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (containerRef.current?.contains(renderer.domElement))
        containerRef.current.removeChild(renderer.domElement)
    }
  }, [imgSrc, color])

  return null
}

/* ═══════════════════════════════════════════════════
   THREE.JS — ESCUDO MILITAR 3D (Hero derecha)
═══════════════════════════════════════════════════ */
function MilitaryObject3D({ containerRef }) {
  useEffect(() => {
    if (!containerRef.current) return
    const W = containerRef.current.clientWidth
    const H = containerRef.current.clientHeight

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const key = new THREE.DirectionalLight(0xc9a227, 3)
    key.position.set(3, 5, 3); scene.add(key)
    const fill = new THREE.DirectionalLight(0x1a3d26, 1.5)
    fill.position.set(-3, -2, 2); scene.add(fill)
    const rim = new THREE.PointLight(0xff4400, 2, 10)
    rim.position.set(0, -3, -2); scene.add(rim)

    const group = new THREE.Group()
    scene.add(group)

    const shieldShape = new THREE.Shape()
    shieldShape.moveTo(0, 1.8)
    shieldShape.bezierCurveTo(1.2, 1.8, 1.4, 0.8, 1.4, 0.2)
    shieldShape.bezierCurveTo(1.4, -0.8, 0.7, -1.5, 0, -2)
    shieldShape.bezierCurveTo(-0.7, -1.5, -1.4, -0.8, -1.4, 0.2)
    shieldShape.bezierCurveTo(-1.4, 0.8, -1.2, 1.8, 0, 1.8)

    const extCfg = { depth: 0.3, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 4 }
    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, extCfg)
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x1a3d26, metalness: 0.8, roughness: 0.25 })
    const shield = new THREE.Mesh(shieldGeo, shieldMat)
    shield.position.set(-0.15, 0, 0)
    group.add(shield)

    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 1, roughness: 0.1, emissive: 0xc9a227, emissiveIntensity: 0.2 })
    const edgeGeo = new THREE.ExtrudeGeometry(shieldShape, { depth: 0.05, bevelEnabled: false })
    const edge = new THREE.Mesh(edgeGeo, edgeMat)
    edge.scale.setScalar(1.06)
    edge.position.set(-0.15 * 1.06, 0, 0.26)
    group.add(edge)

    const crossMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 1, roughness: 0.1, emissive: 0xc9a227, emissiveIntensity: 0.3 })
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.6, 0.12), crossMat)
    vBar.position.set(0, -0.1, 0.42); group.add(vBar)
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.12), crossMat)
    hBar.position.set(0, 0.35, 0.42); group.add(hBar)

    const starMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1, roughness: 0.05, emissive: 0xffd700, emissiveIntensity: 0.5 })
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), starMat)
    star.position.set(0, 0.35, 0.55); group.add(star)

    const ringCount = 80
    const ringPos = new Float32Array(ringCount * 3)
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2
      const r = 2.2 + Math.sin(i * 0.3) * 0.15
      ringPos[i*3] = Math.cos(angle)*r; ringPos[i*3+1] = Math.sin(angle)*r*0.4; ringPos[i*3+2] = Math.sin(angle*2)*0.3
    }
    const ringGeo = new THREE.BufferGeometry()
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3))
    const ring = new THREE.Points(ringGeo, new THREE.PointsMaterial({ color: 0xc9a227, size: 0.04, transparent: true, opacity: 0.7 }))
    scene.add(ring)

    const pCount = 200
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      const r = 2.5 + Math.random() * 1.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pPos[i*3] = r*Math.sin(phi)*Math.cos(theta); pPos[i*3+1] = r*Math.sin(phi)*Math.sin(theta); pPos[i*3+2] = r*Math.cos(phi)
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc9a227, size: 0.035, transparent: true, opacity: 0.5 }))
    scene.add(pts)

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0
    let isDragging = false, lastMX = 0, lastMY = 0

    const onMove = (e) => {
      if (isDragging) {
        targetX += (e.clientX - lastMX) * 0.008; targetY += (e.clientY - lastMY) * 0.006
        lastMX = e.clientX; lastMY = e.clientY
      } else {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) { targetX = ((e.clientX-rect.left)/rect.width-0.5)*1.2; targetY = -((e.clientY-rect.top)/rect.height-0.5)*0.8 }
      }
    }
    const onDown = (e) => { isDragging = true; lastMX = e.clientX; lastMY = e.clientY }
    const onUp   = ()  => { isDragging = false }

    containerRef.current.addEventListener('mousemove', onMove)
    containerRef.current.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    const clock = new THREE.Clock()
    let frame
    const animate = () => {
      frame = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      currentX += (targetX - currentX) * 0.04
      currentY += (targetY - currentY) * 0.04
      group.rotation.y = currentX + Math.sin(t*0.4)*0.12
      group.rotation.x = currentY + Math.sin(t*0.3)*0.06
      star.rotation.y = t*1.8; star.rotation.z = t*0.9
      ring.rotation.z = t*0.2; ring.rotation.x = Math.sin(t*0.25)*0.3
      pts.rotation.y = t*0.06
      starMat.emissiveIntensity = 0.3 + Math.sin(t*2)*0.2
      key.intensity = 2.5 + Math.sin(t*1.5)*0.5
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!containerRef.current) return
      const W2 = containerRef.current.clientWidth, H2 = containerRef.current.clientHeight
      camera.aspect = W2/H2; camera.updateProjectionMatrix(); renderer.setSize(W2, H2)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      containerRef.current?.removeEventListener('mousemove', onMove)
      containerRef.current?.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (containerRef.current?.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement)
    }
  }, [])
  return null
}

/* ═══════════════════════════════════════════════════
   TARJETA DISCIPLINA CON MODAL 3D
═══════════════════════════════════════════════════ */
function DisciplinaCard({ disc, index, visible }) {
  const [expanded, setExpanded] = useState(false)
  const modalRef = useRef(null)
  const canvasRef = useRef(null)

  // Canvas Three.js dentro del modal
  useEffect(() => {
    if (!expanded || !canvasRef.current) return
    const W = canvasRef.current.clientWidth
    const H = canvasRef.current.clientHeight

    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.set(0, 0, 3.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    canvasRef.current.appendChild(renderer.domElement)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const ptL = new THREE.PointLight(disc.color.replace('#','0x') - 0, 4, 15)
    ptL.position.set(2, 2, 3); scene.add(ptL)

    const loader = new THREE.TextureLoader()
    loader.load(disc.img, (tex) => {
      const geo = new THREE.PlaneGeometry(4, 2.8, 30, 20)
      const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0.9 })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)

      // Partículas de color
      const pCount = 120
      const pPos = new Float32Array(pCount * 3)
      for (let i = 0; i < pCount; i++) {
        pPos[i*3]   = (Math.random() - 0.5) * 6
        pPos[i*3+1] = (Math.random() - 0.5) * 4
        pPos[i*3+2] = (Math.random() - 0.5) * 2
      }
      const pg = new THREE.BufferGeometry()
      pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      const pm = new THREE.Points(pg, new THREE.PointsMaterial({ color: disc.color, size: 0.05, transparent: true, opacity: 0.8 }))
      scene.add(pm)

      let mx = 0, my = 0
      const onM = (e) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
          my = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
        }
      }
      canvasRef.current?.addEventListener('mousemove', onM)

      const clock = new THREE.Clock()
      let frame
      const animate = () => {
        frame = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Ondular imagen
        const pos = mesh.geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i); const y = pos.getY(i)
          pos.setZ(i, Math.sin(x * 1.2 + t * 1.2) * 0.07 + Math.sin(y * 0.9 + t) * 0.05)
        }
        pos.needsUpdate = true

        mesh.rotation.x = my * 0.2
        mesh.rotation.y = mx * 0.3
        pm.rotation.z = t * 0.1
        ptL.position.x = Math.sin(t) * 2
        ptL.position.y = Math.cos(t * 0.7) * 1.5

        renderer.render(scene, camera)
      }
      animate()

      // cleanup local
      const cleanup = () => {
        cancelAnimationFrame(frame)
        canvasRef.current?.removeEventListener('mousemove', onM)
        renderer.dispose()
        if (canvasRef.current?.contains(renderer.domElement))
          canvasRef.current.removeChild(renderer.domElement)
      }
      canvasRef.current._cleanup3d = cleanup
    })

    return () => {
      if (canvasRef.current?._cleanup3d) canvasRef.current._cleanup3d()
      else {
        renderer.dispose()
        if (canvasRef.current?.contains(renderer.domElement))
          canvasRef.current.removeChild(renderer.domElement)
      }
    }
  }, [expanded])

  return (
    <>
      {/* Tarjeta normal */}
      <div
        className="disc-card"
        onClick={() => setExpanded(true)}
        style={{
          padding: 0,
          border: '1px solid rgba(255,255,255,0.07)',
          borderTop: `3px solid ${disc.color}`,
          borderRadius: '0 0 4px 4px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: '#060a06',
          marginTop: index * 18,
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : `translateY(${60 + index * 12}px)`,
          transition: `all 0.7s cubic-bezier(0.175,0.885,0.32,1.275) ${index * 0.1}s`,
          cursor: 'none',
        }}
      >
        {/* Número */}
        <div style={{
          position: 'absolute', top: 10, right: 14,
          fontFamily: 'Cinzel,serif', color: `${disc.color}22`,
          fontSize: 44, fontWeight: 900, lineHeight: 1, zIndex: 2,
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Imagen */}
        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
          <img
            src={disc.img}
            alt={disc.nombre}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.6s ease',
              filter: 'brightness(0.75) saturate(1.2)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          {/* Overlay color */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, transparent 40%, ${disc.color}44 100%)`,
            pointerEvents: 'none',
          }}/>
          {/* Hint */}
          <div style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'Cinzel,serif', color: 'rgba(255,255,255,0.7)',
            fontSize: 8, letterSpacing: '0.3em', whiteSpace: 'nowrap',
          }}>CLICK PARA 3D ✦</div>
        </div>

        {/* Info */}
        <div style={{ padding: '20px 20px 28px' }}>
          <h3 style={{ fontFamily: 'Cinzel,serif', color: 'white', fontSize: 12, letterSpacing: '0.18em', marginBottom: 10 }}>{disc.nombre}</h3>
          <p style={{ fontFamily: 'Cormorant Garamond,serif', color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.6 }}>{disc.desc}</p>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${disc.color},transparent)`, opacity: 0.5 }}/>
      </div>

      {/* Modal 3D */}
      {expanded && (
        <div
          ref={modalRef}
          onClick={() => setExpanded(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(90vw, 800px)', height: 'min(80vh, 520px)',
              border: `2px solid ${disc.color}`,
              borderRadius: 8,
              overflow: 'hidden',
              background: '#0a0f0a',
              boxShadow: `0 0 60px ${disc.color}44`,
              animation: 'scaleIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}
          >
            {/* Canvas 3D */}
            <div ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

            {/* Overlay info */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '32px 32px 28px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 60%, transparent)',
              zIndex: 10,
            }}>
              <h2 style={{
                fontFamily: 'Cinzel Decorative,serif', color: disc.color,
                fontSize: 'clamp(20px,3vw,36px)', fontWeight: 900,
                letterSpacing: '0.1em', marginBottom: 8,
                textShadow: `0 0 20px ${disc.color}88`,
              }}>{disc.nombre}</h2>
              <p style={{ fontFamily: 'Cormorant Garamond,serif', color: 'rgba(255,255,255,0.7)', fontSize: 17 }}>{disc.desc}</p>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setExpanded(false)}
              style={{
                position: 'absolute', top: 16, right: 16, zIndex: 20,
                background: 'rgba(0,0,0,0.6)', border: `1px solid ${disc.color}`,
                borderRadius: '50%', width: 36, height: 36,
                color: disc.color, fontSize: 18, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >×</button>

            {/* Esquinas decorativas */}
            <div style={{ position: 'absolute', top: 10, left: 10, width: 24, height: 24, borderTop: `2px solid ${disc.color}`, borderLeft: `2px solid ${disc.color}` }}/>
            <div style={{ position: 'absolute', bottom: 10, right: 10, width: 24, height: 24, borderBottom: `2px solid ${disc.color}`, borderRight: `2px solid ${disc.color}` }}/>
          </div>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════
   HOOKS UTILITARIOS
═══════════════════════════════════════════════════ */
function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const h = () => setY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return y
}

function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ═══════════════════════════════════════════════════
   PIEZAS QUE SE ENSAMBLAN
═══════════════════════════════════════════════════ */
const PIECES = [
  { dx: -90, dy: -60, symbol: '⚔', size: 32, delay: 0 },
  { dx:  60, dy: -80, symbol: '★', size: 24, delay: 0.1 },
  { dx: -70, dy:  50, symbol: '🛡', size: 28, delay: 0.2 },
  { dx:  80, dy:  60, symbol: '◆', size: 20, delay: 0.15 },
  { dx:   0, dy: -90, symbol: '✦', size: 18, delay: 0.05 },
  { dx:  -5, dy:  80, symbol: '▲', size: 16, delay: 0.25 },
]

function PuzzlePieces({ visible }) {
  return (
    <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 32px' }}>
      {PIECES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: visible
            ? 'translate(-50%, -50%)'
            : `translate(calc(-50% + ${p.dx}px), calc(-50% + ${p.dy}px)) scale(0) rotate(${p.dx * 2}deg)`,
          transition: `all 0.9s cubic-bezier(0.175,0.885,0.32,1.275) ${p.delay}s`,
          fontSize: p.size, opacity: visible ? 0.4 : 0,
          color: '#C92727', pointerEvents: 'none', zIndex: 1,
        }}>{p.symbol}</div>
      ))}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 100, height: 100,
        transition: 'all 1.2s cubic-bezier(0.175,0.885,0.32,1.275) 0.3s',
        opacity: visible ? 1 : 0,
        scale: visible ? '1' : '0.3',
      }}>
        <svg viewBox="0 0 100 120" width="100">
          <defs>
            <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F00B0B"/>
              <stop offset="100%" stopColor="#553533"/>
            </linearGradient>
          </defs>
          <path d="M50 5 L92 22 L92 65 Q92 100 50 115 Q8 100 8 65 L8 22 Z" fill="url(#sg2)" stroke="#660707" strokeWidth="2.5"/>
          <path d="M50 14 L83 28 L83 65 Q83 95 50 108 Q17 95 17 65 L17 28 Z" fill="none" stroke="rgba(15, 5, 2, 0.35)" strokeWidth="1"/>
          <line x1="50" y1="28" x2="50" y2="95" stroke="#6E0505" strokeWidth="2" opacity="0.8"/>
          <line x1="25" y1="55" x2="75" y2="55" stroke="#741706" strokeWidth="2" opacity="0.8"/>
          <text x="50" y="62" textAnchor="middle" fill="#7A0606" fontSize="20" fontFamily="serif">⚔</text>
        </svg>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   CURSOR PERSONALIZADO
═══════════════════════════════════════════════════ */
function CustomCursor() {
  const ringRef = useRef(null)
  const dotRef  = useRef(null)
  useEffect(() => {
    let mx=0,my=0,dx=0,dy=0
    const move = (e) => { mx=e.clientX; my=e.clientY }
    window.addEventListener('mousemove', move)
    let raf
    const loop = () => {
      dx += (mx-dx)*0.1; dy += (my-dy)*0.1
      if (ringRef.current) ringRef.current.style.transform = `translate(${mx-14}px,${my-14}px)`
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${dx-3}px,${dy-3}px)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const down = () => { if(ringRef.current){ringRef.current.style.width='32px';ringRef.current.style.height='32px'} }
    const up   = () => { if(ringRef.current){ringRef.current.style.width='28px';ringRef.current.style.height='28px'} }
    window.addEventListener('mousedown',down); window.addEventListener('mouseup',up)
    return () => { window.removeEventListener('mousemove',move); window.removeEventListener('mousedown',down); window.removeEventListener('mouseup',up); cancelAnimationFrame(raf) }
  }, [])
  return <>
    <div ref={ringRef} style={{ position:'fixed',top:0,left:0,zIndex:9998,pointerEvents:'none',width:28,height:28,borderRadius:'50%',border:'1.5px solid #EB0909',transition:'width 0.15s,height 0.15s',mixBlendMode:'difference' }}/>
    <div ref={dotRef}  style={{ position:'fixed',top:0,left:0,zIndex:9998,pointerEvents:'none',width:6,height:6,borderRadius:'50%',background:'#201A04' }}/>
  </>
}

/* ═══════════════════════════════════════════════════
   PARTÍCULAS PRECALCULADAS
═══════════════════════════════════════════════════ */
const PARTICLES = [...Array(12)].map((_, i) => ({
  left:  `${(i * 19 + 7) % 100}%`,
  bottom:`${(i * 11 + 3) % 40}%`,
  size:  (i % 4) + 2,
  dur:   `${6 + (i % 7)}s`,
  delay: `${(i % 6) * 0.8}s`,
}))

/* ═══════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate  = useNavigate()
  const threeRef  = useRef(null)
  const heroBgRef = useRef(null)
  const scrollY   = useScrollY()

  // Intro telón
  const [introPhase, setIntroPhase] = useState('curtain')
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase('reveal'), 1800)
    const t2 = setTimeout(() => setIntroPhase('done'),   3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Slider
  const [slide,   setSlide]   = useState(0)
  const [sliding, setSliding] = useState(false)
  const [dir,     setDir]     = useState(1)

  const goTo = useCallback((next) => {
    if (sliding) return
    setDir(next > slide ? 1 : -1)
    setSliding(true)
    setTimeout(() => { setSlide(next); setSliding(false) }, 500)
  }, [slide, sliding])

  const nextSlide = useCallback(() => goTo((slide + 1) % SLIDES.length), [slide, goTo])
  const prevSlide = useCallback(() => goTo((slide - 1 + SLIDES.length) % SLIDES.length), [slide, goTo])

  useEffect(() => {
    const t = setInterval(nextSlide, 5500)
    return () => clearInterval(t)
  }, [nextSlide])

  // Audio
  const [audioCtx, setAudioCtx] = useState(null)
  const [playing,  setPlaying]  = useState(false)
  const intervalRef = useRef(null)

  const toggleMusic = () => {
    if (!playing) {
      let ctx = audioCtx
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); setAudioCtx(ctx) }
      if (ctx.state === 'suspended') ctx.resume()
      intervalRef.current = createMilitaryAudio(ctx)
      setPlaying(true)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (audioCtx) audioCtx.suspend()
      setPlaying(false)
    }
  }

  // Reveal sections
  const [statsRef, statsVis] = useReveal()
  const [discRef,  discVis]  = useReveal()
  const [ctaRef,   ctaVis]   = useReveal()

  const S = SLIDES[slide]

  // Número para color Three.js
  const colorHex = parseInt(S.color.replace('#', ''), 16)

  return (
    <div style={{ background: '#060a06', overflowX: 'hidden', fontFamily: 'Georgia, serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;cursor:none!important}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#060a06}
        ::-webkit-scrollbar-thumb{background:#AD1313;border-radius:3px}

        @keyframes curtainLeft{ to{transform:translateX(-100%)} }
        @keyframes curtainRight{ to{transform:translateX(100%)} }
        @keyframes curtainText{ from{opacity:0;letter-spacing:0.8em} to{opacity:1;letter-spacing:0.4em} }
        @keyframes slideInR{ from{transform:translateX(70px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes slideInL{ from{transform:translateX(-70px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes revealUp{ from{transform:translateY(50px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes shimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes glowPulse{ 0%,100%{box-shadow:0 0 15px #C92727,0 0 40px rgba(70, 46, 46, 0.25)} 50%{box-shadow:0 0 30px #C92727,0 0 80px rgba(201, 39, 39, 0.19)} }
        @keyframes floatUp{ 0%{transform:translateY(0) rotate(0deg);opacity:0} 10%{opacity:1} 90%{opacity:0.3} 100%{transform:translateY(-110vh) rotate(720deg);opacity:0} }
        @keyframes scan{ 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
        @keyframes rotateStar{ from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes fadeIn{ from{opacity:0} to{opacity:1} }
        @keyframes scaleIn{ from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }

        .shimmer{
          background:linear-gradient(90deg,#C92727 0%,#F06060 30%,#FFDCDC 50%,#F06060 70%,#C92727 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmer 3s linear infinite;
        }
        .btn-primary{
          background:linear-gradient(135deg,#8b0000,#C92727,#8b0000);background-size:200% 100%;
          border:2px solid #442E2E;border-radius:3px;padding:18px 52px;color:white;
          font-family:'Cinzel',serif;font-size:13px;font-weight:700;letter-spacing:0.25em;
          animation:glowPulse 2.5s ease-in-out infinite;transition:transform 0.2s,letter-spacing 0.3s;
        }
        .btn-primary:hover{transform:scale(1.06);letter-spacing:0.35em}
        .btn-outline{
          background:transparent;border:1px solid rgba(32, 23, 23, 0.4);border-radius:3px;
          padding:18px 40px;color:rgba(255,255,255,0.7);font-family:'Cinzel',serif;
          font-size:12px;letter-spacing:0.2em;transition:all 0.3s;
        }
        .btn-outline:hover{border-color:#C92727;color:#C92727;background:rgba(201, 39, 39, 0.05)}
        .nav-link{color:rgba(255,255,255,0.55);font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.22em;text-decoration:none;transition:color 0.2s}
        .nav-link:hover{color:#C92727}
        .slide-btn{width:52px;height:52px;border-radius:50%;background:rgba(201, 39, 39, 0.1);border:1px solid rgba(201, 39, 39, 0.5);color:#C92727;font-size:20px;display:flex;align-items:center;justify-content:center;transition:all 0.3s}
        .slide-btn:hover{background:rgba(201,162,39,0.2);border-color:#C92727;transform:scale(1.1)}
        .disc-card{transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275),box-shadow 0.3s}
        .disc-card:hover{transform:translateY(-14px) scale(1.04)!important;box-shadow:0 20px 40px rgba(0,0,0,0.4)}
        .stat-card{transition:transform 0.4s,border-color 0.3s}
        .stat-card:hover{transform:translateY(-8px) scale(1.03);border-color:#C92727!important}
        .step-block{transition:all 0.4s}
        .step-block:hover{background:rgba(201,162,39,0.06)!important;transform:translateX(6px)}
      `}</style>

      <CustomCursor />

      {/* ══ INTRO TELÓN ══ */}
      {introPhase !== 'done' && (
        <div style={{ position:'fixed',inset:0,zIndex:9999,pointerEvents: introPhase==='reveal' ? 'none' : 'all' }}>
          <div style={{
            position:'absolute',top:0,left:0,bottom:0,width:'50%',
            background:'linear-gradient(135deg,#0d1a0f 0%,#3D1A1A 50%,#1A0D0D 100%)',
            borderRight:'1px solid rgba(201, 39, 39, 0.3)',
            animation: introPhase==='reveal' ? 'curtainLeft 1.4s cubic-bezier(0.76,0,0.24,1) forwards' : 'none',
            display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:48,
          }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:52,marginBottom:10 }}>⚔️</div>
              <p style={{ fontFamily:'Cinzel,serif',color:'#C92727',fontSize:11,letterSpacing:'0.4em',animation:'curtainText 1s ease-out 0.5s both' }}>EJÉRCITO DE</p>
              <p style={{ fontFamily:'Cinzel,serif',color:'white',fontSize:24,fontWeight:700,letterSpacing:'0.15em',animation:'curtainText 1s ease-out 0.7s both' }}>BOLIVIA</p>
            </div>
          </div>
          <div style={{
            position:'absolute',top:0,right:0,bottom:0,width:'50%',
            background:'linear-gradient(225deg,#1A0D0D 0%,#3D1A1A 50%,#1A0F0D 100%)',
            borderLeft:'1px solid rgba(201, 39, 39, 0.3)',
            animation: introPhase==='reveal' ? 'curtainRight 1.4s cubic-bezier(0.76,0,0.24,1) forwards' : 'none',
            display:'flex',alignItems:'center',justifyContent:'flex-start',paddingLeft:48,
          }}>
            <div>
              <p style={{ fontFamily:'Cinzel,serif',color:'#C92C27',fontSize:11,letterSpacing:'0.4em',animation:'curtainText 1s ease-out 0.6s both' }}>UNIDAD DE</p>
              <p style={{ fontFamily:'Cinzel,serif',color:'white',fontSize:24,fontWeight:700,letterSpacing:'0.15em',animation:'curtainText 1s ease-out 0.8s both' }}>ARTES MARCIALES</p>
            </div>
          </div>
          <div style={{ position:'absolute',top:0,bottom:0,left:'50%',width:1,background:'linear-gradient(to bottom,transparent,#c9a227,transparent)',transform:'translateX(-50%)' }}/>
          <div style={{
            position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
            width:80,height:80,borderRadius:'50%',border:'2px solid #C92727',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:36,background:'rgba(10, 6, 6, 0.8)',
            animation:'glowPulse 1.5s ease-in-out infinite', zIndex:10,
          }}>⚔️</div>
        </div>
      )}

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:200,
        padding:'14px 48px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        background: scrollY > 60 ? 'rgba(10, 6, 6, 0.96)' : 'transparent',
        backdropFilter: scrollY > 60 ? 'blur(16px)' : 'none',
        borderBottom: scrollY > 60 ? '1px solid rgba(201, 39, 39, 0.18)' : 'none',
        transition:'all 0.4s',
      }}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:'50%',border:'1.5px solid #C92727',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,animation:'glowPulse 3s infinite' }}>⚔️</div>
          <div>
            <p style={{ fontFamily:'Cinzel,serif',color:'#C92727',fontSize:9,letterSpacing:'0.2em' }}>UNIDAD DE</p>
            <p style={{ fontFamily:'Cinzel,serif',color:'white',fontSize:12,fontWeight:700,letterSpacing:'0.1em' }}>ARTES MARCIALES</p>
          </div>
        </div>
        <div style={{ display:'flex',gap:36,alignItems:'center' }}>
          {[['inicio','INICIO'],['disciplinas','DISCIPLINAS'],['unidad','UNIDAD']].map(([id,label]) => (
            <a key={id} href={`#${id}`} className="nav-link">{label}</a>
          ))}
        </div>
        <div style={{ display:'flex',gap:12,alignItems:'center' }}>
          <button onClick={toggleMusic} style={{
            background: playing ? 'rgba(201, 39, 39, 0.15)' : 'transparent',
            border:'1px solid rgba(201, 44, 39, 0.35)',borderRadius:6,padding:'7px 14px',
            color:'#C92727',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.15em',
            display:'flex',alignItems:'center',gap:6,transition:'all 0.3s',
          }}>
            <span style={{ fontSize:14 }}>{playing ? '⏸' : '♪'}</span>
            {playing ? 'PAUSAR' : 'MÚSICA'}
          </button>
          <button className="btn-primary" style={{ padding:'9px 22px',fontSize:10 }} onClick={() => navigate('/login')}>
            INGRESAR
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          SECCIÓN 1: HERO
      ══════════════════════════════════════════ */}
      <section id="inicio" style={{ position:'relative', height:'100vh', overflow:'hidden' }}>

        {/* ─── Imagen de fondo con Three.js 3D ─── */}
        <div
          ref={heroBgRef}
          key={`bg-${slide}`}
          style={{ position:'absolute', inset:0, zIndex:1 }}
        >
          <HeroBackground3D containerRef={heroBgRef} imgSrc={S.img} color={colorHex} />
        </div>

        {/* Overlay oscuro sobre la imagen */}
        <div style={{
          position:'absolute', inset:0, zIndex:2,
          background:`linear-gradient(135deg, rgba(10, 6, 6, 0.82) 0%, rgba(10, 6, 6, 0.55) 50%, rgba(10, 6, 6, 0.88) 100%)`,
          transition:'background 0.8s ease',
        }}/>

        {/* Acento de color del slide */}
        <div style={{
          position:'absolute', inset:0, zIndex:2,
          background:`radial-gradient(ellipse at 30% 50%, ${S.accent}44 0%, transparent 65%)`,
          transition:'background 0.8s ease',
        }}/>

        {/* Grid pattern */}
        <div style={{
          position:'absolute', inset:0, zIndex:3,
          backgroundImage:`linear-gradient(rgba(201, 39, 39, 0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201, 39, 39, 0.04) 1px,transparent 1px)`,
          backgroundSize:'80px 80px',
        }}/>

        {/* Línea scan */}
        <div style={{
          position:'absolute', left:0, right:0, height:2,
          background:`linear-gradient(90deg,transparent,${S.color}60,transparent)`,
          animation:'scan 4s linear infinite', zIndex:4, transition:'background 0.8s',
        }}/>

        {/* Partículas */}
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position:'absolute', borderRadius:'50%', pointerEvents:'none',
            left:p.left, bottom:p.bottom, width:p.size, height:p.size,
            background:S.color, opacity:0.5,
            animation:`floatUp ${p.dur} linear ${p.delay} infinite`,
            transition:'background 0.8s', zIndex:4,
          }}/>
        ))}

        {/* Layout: texto izq | 3D derecha */}
        <div style={{
          position:'relative', zIndex:10, height:'100%',
          display:'grid', gridTemplateColumns:'1fr 1fr',
          alignItems:'center', padding:'0 6vw', gap:40,
        }}>

          {/* ── Texto del slide ── */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
              <div style={{ width:48, height:1, background:S.color, transition:'background 0.8s' }}/>
              <span style={{ fontFamily:'Cinzel,serif', color:S.color, fontSize:10, letterSpacing:'0.4em', transition:'color 0.8s' }}>
                {String(slide+1).padStart(2,'0')} / {String(SLIDES.length).padStart(2,'0')}
              </span>
            </div>

            <div style={{
              fontSize:88, lineHeight:1, marginBottom:10,
              animation: sliding ? 'none' : `${dir>0?'slideInR':'slideInL'} 0.6s ease-out`,
              filter:`drop-shadow(0 0 22px ${S.color})`, transition:'filter 0.8s',
            }}>{S.symbol}</div>

            <h1 style={{
              fontFamily:'Cinzel Decorative,Cinzel,serif',
              fontSize:'clamp(52px,7vw,100px)', fontWeight:900, lineHeight:0.95, marginBottom:12,
              animation: sliding ? 'none' : `${dir>0?'slideInR':'slideInL'} 0.5s ease-out 0.05s both`,
            }}>
              <span className="shimmer">{S.titulo}</span>
            </h1>

            <p style={{
              fontFamily:'Cormorant Garamond,Georgia,serif',
              color:'rgba(255, 255, 255, 0.6)', fontSize:20, fontStyle:'italic',
              letterSpacing:'0.06em', marginBottom:18,
              animation: sliding ? 'none' : `${dir>0?'slideInR':'slideInL'} 0.5s ease-out 0.1s both`,
            }}>{S.subtitulo}</p>

            <p style={{
              fontFamily:'Cormorant Garamond,Georgia,serif',
              color:'rgba(180, 42, 42, 0.42)', fontSize:17, lineHeight:1.8,
              maxWidth:420, marginBottom:36,
              animation: sliding ? 'none' : `${dir>0?'slideInR':'slideInL'} 0.5s ease-out 0.15s both`,
            }}>{S.desc}</p>

            <div style={{
              display:'flex', gap:16, flexWrap:'wrap',
              animation: sliding ? 'none' : 'slideInR 0.5s ease-out 0.2s both',
            }}>
              <button className="btn-primary" onClick={() => navigate('/login')}>⊞ INGRESAR AL SISTEMA</button>
              <a href="#disciplinas"><button className="btn-outline">VER DISCIPLINAS ↓</button></a>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:36 }}>
              <button className="slide-btn" onClick={prevSlide}>‹</button>
              <div style={{ display:'flex', gap:8 }}>
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} style={{
                    width: i===slide ? 28 : 8, height:8, borderRadius:4,
                    background: i===slide ? S.color : 'rgba(255,255,255,0.2)',
                    border:'none', transition:'all 0.4s',
                  }}/>
                ))}
              </div>
              <button className="slide-btn" onClick={nextSlide}>›</button>
            </div>
          </div>

          {/* Espacio vacío (sin escudo ni cruz) */}
          <div style={{ height:520 }} />
        </div>

        {/* Scroll indicator */}
        <div style={{
          position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:6,
          opacity: Math.max(0, 1 - scrollY/160), zIndex:10,
        }}>
          <p style={{ fontFamily:'Cinzel,serif', color:'rgba(201, 39, 39, 0.45)', fontSize:8, letterSpacing:'0.4em' }}>EXPLORAR</p>
          <div style={{ width:1, height:44, background:'linear-gradient(to bottom,#C92727,transparent)', animation:'scan 1.8s ease-in-out infinite' }}/>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECCIÓN 2: ESTADÍSTICAS + PIEZAS
      ══════════════════════════════════════════ */}
      <section style={{
        position:'relative', padding:'100px 6vw',
        background:'linear-gradient(180deg,#0A0606 0%,#030101 100%)', overflow:'hidden',
      }}>
        <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#C92727,transparent)' }}/>

        <div ref={statsRef} style={{ textAlign:'center', marginBottom:60 }}>
          <PuzzlePieces visible={statsVis} />
          <p style={{
            fontFamily:'Cinzel,serif', color:'#C92727', fontSize:10, letterSpacing:'0.5em', marginBottom:8,
            opacity:statsVis?1:0, transform:statsVis?'none':'translateY(20px)', transition:'all 0.8s 0.5s',
          }}>CNL. EULOGIO RUIZ PAZ</p>
          <h2 style={{
            fontFamily:'Cinzel Decorative,serif', color:'white', fontSize:'clamp(22px,4vw,38px)', fontWeight:700,
            opacity:statsVis?1:0, transform:statsVis?'none':'translateY(20px)', transition:'all 0.8s 0.65s',
          }}>UNIDAD DE <span className="shimmer">ARTES MARCIALES</span></h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:20, maxWidth:1000, margin:'0 auto' }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-card" style={{
              textAlign:'center', padding:'44px 20px',
              border:'1px solid rgba(201, 39, 39, 0.18)', borderRadius:3,
              background:'rgba(201, 39, 39, 0.02)', position:'relative', overflow:'hidden',
              opacity:statsVis?1:0,
              transform:statsVis?'none':`translateY(${40+i*10}px)`,
              transition:`all 0.7s cubic-bezier(0.175,0.885,0.32,1.275) ${0.7+i*0.12}s`,
            }}>
              <div style={{ position:'absolute',top:0,left:0,width:18,height:18,borderTop:'2px solid #C92727',borderLeft:'2px solid #C92727' }}/>
              <div style={{ position:'absolute',bottom:0,right:0,width:18,height:18,borderBottom:'2px solid #C92727',borderRight:'2px solid #C92727' }}/>
              <div className="shimmer" style={{ fontFamily:'Cinzel Decorative,serif', fontSize:'clamp(38px,5vw,58px)', fontWeight:900 }}>{s.valor}</div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', color:'rgba(255,255,255,0.5)', fontSize:15, marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECCIÓN 3: DISCIPLINAS CON IMÁGENES
      ══════════════════════════════════════════ */}
      <section id="disciplinas" style={{ position:'relative', padding:'110px 6vw', background:'#0A0606', overflow:'hidden' }}>
        <div style={{
          position:'absolute', inset:0, opacity:0.025,
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='104'%3E%3Cpath d='M30 0 L60 17 L60 51 L30 68 L0 51 L0 17 Z' fill='none' stroke='%23c9a227' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize:'60px 104px',
        }}/>

        <div ref={discRef} style={{ textAlign:'center', marginBottom:64 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:18 }}>
            <div style={{ width:70, height:1, background:'linear-gradient(to right,transparent,#C92727)' }}/>
            <span style={{ fontFamily:'Cinzel,serif', color:'#C92727', fontSize:10, letterSpacing:'0.5em' }}>ARTE Y COMBATE</span>
            <div style={{ width:70, height:1, background:'linear-gradient(to left,transparent,#C92727)' }}/>
          </div>
          <h2 style={{
            fontFamily:'Cinzel Decorative,serif', fontSize:'clamp(28px,4.5vw,52px)', color:'white', fontWeight:700,
            opacity:discVis?1:0, transform:discVis?'none':'translateY(30px)', transition:'all 0.8s',
          }}>CINCO <span className="shimmer">DISCIPLINAS</span></h2>
          <p style={{
            fontFamily:'Cormorant Garamond,serif', color:'rgba(255,255,255,0.4)',
            fontSize:15, marginTop:12, fontStyle:'italic',
            opacity:discVis?1:0, transition:'all 0.8s 0.2s',
          }}>Haz click en cada disciplina para explorarla en 3D</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:22, maxWidth:1100, margin:'0 auto' }}>
          {DISCIPLINAS.map((d, i) => (
            <DisciplinaCard key={i} disc={d} index={i} visible={discVis} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECCIÓN 4: MISIÓN + BLOQUES ESCALERA
      ══════════════════════════════════════════ */}
      <section id="unidad" style={{ position:'relative', padding:'120px 6vw', background:'linear-gradient(180deg,#0A0606 0%,#1A0F0D 60%,#0A0606 100%)', overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:`repeating-linear-gradient(-45deg,rgba(201, 39, 39, 0.03) 0px,rgba(201, 39, 39, 0.03) 1px,transparent 1px,transparent 40px)` }}/>

        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
              <div style={{ width:40, height:2, background:'#C92727' }}/>
              <p style={{ fontFamily:'Cinzel,serif', color:'#C92727', fontSize:10, letterSpacing:'0.4em' }}>NUESTRA MISIÓN</p>
            </div>
            <h2 style={{ fontFamily:'Cinzel Decorative,serif', fontSize:'clamp(28px,3.5vw,48px)', color:'white', fontWeight:700, lineHeight:1.1, marginBottom:26 }}>
              FORJANDO<br/><span className="shimmer">GUERREROS</span><br/>DEL SIGLO XXI
            </h2>
            <p style={{ fontFamily:'Cormorant Garamond,serif', color:'rgba(206, 15, 15, 0.6)', fontSize:19, lineHeight:1.85, fontStyle:'italic', marginBottom:40 }}>
              Integramos tradiciones marciales con tecnología de evaluación de vanguardia para garantizar la máxima preparación operacional de cada efectivo del Ejército Boliviano.
            </p>
            <button className="btn-primary" onClick={() => navigate('/login')}>⊞ ACCEDER AL SISTEMA</button>
          </div>

          <div ref={ctaRef} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { n:'01', t:'EVALUACIÓN CONTINUA',  d:'Seguimiento permanente del rendimiento de cada efectivo',                        c:'#C92727' },
              { n:'02', t:'ANÁLISIS 3D AVANZADO', d:'Radar de competencias en tiempo real con visualización tridimensional',           c:'#1A1513' },
              { n:'03', t:'REPORTES PDF',          d:'Informes individuales y generales descargables al instante',                     c:'#FA6060' },
              { n:'04', t:'MOTOR DE IA',           d:'Predicción de rendimiento y alertas automáticas por inteligencia artificial',    c:'#69635E' },
            ].map((item, i) => (
              <div key={i} className="step-block" style={{
                display:'flex', alignItems:'center', gap:18, padding:'18px 22px',
                border:`1px solid rgba(255,255,255,0.07)`,
                borderLeft:`3px solid ${item.c}`,
                borderRadius:'0 4px 4px 0',
                background:`${item.c}08`,
                opacity:ctaVis?1:0,
                transform:ctaVis?'none':`translateX(${60+i*10}px)`,
                transition:`all 0.7s cubic-bezier(0.175,0.885,0.32,1.275) ${i*0.12}s`,
              }}>
                <span style={{ fontFamily:'Cinzel,serif', color:item.c, fontSize:26, fontWeight:900, minWidth:38 }}>{item.n}</span>
                <div>
                  <p style={{ fontFamily:'Cinzel,serif', color:'white', fontSize:11, letterSpacing:'0.15em', marginBottom:4 }}>{item.t}</p>
                  <p style={{ fontFamily:'Cormorant Garamond,serif', color:'rgba(255,255,255,0.45)', fontSize:14 }}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{
        borderTop:'1px solid rgba(201, 39, 39, 0.18)', padding:'28px 6vw', background:'#0A0606',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12,
      }}>
        <p style={{ fontFamily:'Cinzel,serif', color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.2em' }}>
          © {new Date().getFullYear()} UNIDAD DE ARTES MARCIALES · EJÉRCITO DE BOLIVIA
        </p>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#C52222', animation:'glowPulse 2s infinite' }}/>
          <span style={{ fontFamily:'Cinzel,serif', color:'rgba(255,255,255,0.25)', fontSize:8, letterSpacing:'0.2em' }}>SISTEMA OPERATIVO</span>
        </div>
        <p style={{ fontFamily:'Cormorant Garamond,serif', color:'rgba(255,255,255,0.2)', fontSize:13, fontStyle:'italic' }}>CNL. Eulogio Ruiz Paz</p>
      </footer>
    </div>
  )
}