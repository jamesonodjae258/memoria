'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface MemorialConstellationCanvasProps {
  className?: string
  theme?: 'chapel' | 'twilight' | 'solace'
  interactive?: boolean
}

export default function MemorialConstellationCanvas({
  className = '',
  theme = 'twilight',
  interactive = true,
}: MemorialConstellationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLit, setIsLit] = useState(true)
  const [tributeCount, setTributeCount] = useState(48)
  const [activeAmbiance, setActiveAmbiance] = useState(theme)

  const flameIntensityRef = useRef(1.0)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. Scene setup (threejs-fundamentals)
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(
      activeAmbiance === 'twilight' ? 0x1a1412 : activeAmbiance === 'chapel' ? 0x221812 : 0x15181c,
      0.035
    )

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 1.2, 5.2)

    // 3. Renderer with ACESFilmic tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Root Group (Object3D hierarchy)
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // 4. Lighting (threejs-lighting)
    const ambientLight = new THREE.AmbientLight(0xd4c596, 0.45)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff3db, 1.2)
    keyLight.position.set(3, 6, 4)
    scene.add(keyLight)

    const candleLight = new THREE.PointLight(0xffaa44, 2.5, 8, 1.8)
    candleLight.position.set(0, 0.85, 0)
    scene.add(candleLight)

    // 5. Materials & Geometries (threejs-materials, threejs-geometry)
    // Brass Candleholder Base
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xa8935d,
      metalness: 0.85,
      roughness: 0.28,
    })

    const baseGeometry = new THREE.CylinderGeometry(0.8, 0.95, 0.12, 48)
    const baseMesh = new THREE.Mesh(baseGeometry, brassMaterial)
    baseMesh.position.y = -0.7
    rootGroup.add(baseMesh)

    const collarGeometry = new THREE.CylinderGeometry(0.4, 0.7, 0.2, 32)
    const collarMesh = new THREE.Mesh(collarGeometry, brassMaterial)
    collarMesh.position.y = -0.55
    rootGroup.add(collarMesh)

    // Ivory Wax Candle
    const candleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5eedc,
      roughness: 0.45,
      metalness: 0.05,
      transmission: 0.25,
      thickness: 0.5,
      ior: 1.45,
    })

    const candleGeometry = new THREE.CylinderGeometry(0.32, 0.35, 1.1, 32)
    const candleMesh = new THREE.Mesh(candleGeometry, candleMaterial)
    candleMesh.position.y = 0.05
    rootGroup.add(candleMesh)

    // Wick
    const wickGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.14, 12)
    const wickMaterial = new THREE.MeshBasicMaterial({ color: 0x221100 })
    const wickMesh = new THREE.Mesh(wickGeometry, wickMaterial)
    wickMesh.position.y = 0.65
    rootGroup.add(wickMesh)

    // 6. Custom GLSL Flame Shader (threejs-shaders)
    const flameVertexShader = `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vPosition = position;
        vec3 pos = position;
        
        // Organic flame flicker fluttering upwards
        float wobble = sin(pos.y * 8.0 + uTime * 6.0) * 0.04 * (pos.y + 0.1);
        float wobbleZ = cos(pos.y * 6.0 + uTime * 4.5) * 0.03 * (pos.y + 0.1);
        pos.x += wobble;
        pos.z += wobbleZ;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `

    const flameFragmentShader = `
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        // Flame color ramp: core blue/white -> warm gold -> deep crimson amber
        float y = clamp(vUv.y, 0.0, 1.0);
        float r = 1.0;
        float g = mix(0.4, 0.95, 1.0 - y * 0.85);
        float b = mix(0.9, 0.15, y * 1.5);

        vec3 innerColor = vec3(1.0, 0.85, 0.4);
        vec3 outerColor = vec3(0.95, 0.35, 0.05);
        vec3 blueBase = vec3(0.2, 0.45, 1.0);

        vec3 col = mix(blueBase, innerColor, smoothstep(0.0, 0.25, y));
        col = mix(col, outerColor, smoothstep(0.3, 0.95, y));

        float alpha = (1.0 - pow(y, 1.6)) * uIntensity;
        gl_FragColor = vec4(col, alpha * 0.92);
      }
    `

    const flameMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
      },
      vertexShader: flameVertexShader,
      fragmentShader: flameFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    const flameGeometry = new THREE.ConeGeometry(0.12, 0.38, 24, 24)
    flameGeometry.translate(0, 0.19, 0)
    const flameMesh = new THREE.Mesh(flameGeometry, flameMaterial)
    flameMesh.position.y = 0.72
    rootGroup.add(flameMesh)

    // Halo Glow Billboard
    const haloGeometry = new THREE.PlaneGeometry(1.6, 1.6)
    const haloMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          float dist = distance(vUv, vec2(0.5));
          float glow = smoothstep(0.5, 0.0, dist);
          glow = pow(glow, 2.2);
          
          float pulse = 0.9 + 0.1 * sin(uTime * 4.0);
          vec3 warmAmber = vec3(1.0, 0.65, 0.25);
          gl_FragColor = vec4(warmAmber, glow * 0.45 * uIntensity * pulse);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial)
    haloMesh.position.y = 0.85
    rootGroup.add(haloMesh)

    // 7. Floating Remembrance Particles & Golden Constellations
    const particleCount = 140
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSpeeds = new Float32Array(particleCount)
    const particleScales = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const radius = 0.6 + Math.random() * 2.8
      const theta = Math.random() * Math.PI * 2
      particlePositions[i3] = Math.cos(theta) * radius
      particlePositions[i3 + 1] = -0.5 + Math.random() * 3.2
      particlePositions[i3 + 2] = Math.sin(theta) * radius
      particleSpeeds[i] = 0.2 + Math.random() * 0.5
      particleScales[i] = 0.5 + Math.random() * 1.5
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xd4c596) },
      },
      vertexShader: `
        uniform float uTime;
        attribute vec3 position;
        varying float vAlpha;

        void main() {
          vec3 pos = position;
          // Upward buoyant drift with soft spiral
          pos.y = mod(pos.y + uTime * 0.18 + 0.8, 3.8) - 0.8;
          pos.x += sin(uTime * 0.8 + pos.y * 2.0) * 0.08;
          pos.z += cos(uTime * 0.7 + pos.y * 2.0) * 0.08;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (16.0 / -mvPosition.z);
          vAlpha = smoothstep(-0.6, 0.4, pos.y) * smoothstep(2.8, 1.8, pos.y);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          float strength = pow(1.0 - (dist * 2.0), 1.8);
          gl_FragColor = vec4(uColor, strength * vAlpha * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    rootGroup.add(particles)

    // 8. Interaction handling (threejs-interaction)
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      mouseRef.current.targetX = x * 0.6
      mouseRef.current.targetY = y * 0.35
    }

    if (interactive) {
      container.addEventListener('pointermove', handlePointerMove)
    }

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // 10. Render & Animation Loop (Clock based)
    const clock = new THREE.Clock()
    let animationFrameId: number

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      rootGroup.rotation.y = elapsed * 0.12 + mouseRef.current.x
      rootGroup.rotation.x = mouseRef.current.y * 0.5

      // Flame intensity lerping for toggle
      const targetIntensity = isLit ? 1.0 : 0.0
      flameIntensityRef.current += (targetIntensity - flameIntensityRef.current) * 0.1

      flameMaterial.uniforms.uTime.value = elapsed
      flameMaterial.uniforms.uIntensity.value = flameIntensityRef.current

      haloMaterial.uniforms.uTime.value = elapsed
      haloMaterial.uniforms.uIntensity.value = flameIntensityRef.current

      particleMaterial.uniforms.uTime.value = elapsed

      candleLight.intensity = (2.2 + Math.sin(elapsed * 8.0) * 0.35 + Math.cos(elapsed * 13.0) * 0.15) * flameIntensityRef.current

      renderer.render(scene, camera)
    }

    animate()

    // 11. Cleanup (proper three.js disposal)
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (interactive) {
        container.removeEventListener('pointermove', handlePointerMove)
      }

      baseGeometry.dispose()
      collarGeometry.dispose()
      candleGeometry.dispose()
      wickGeometry.dispose()
      flameGeometry.dispose()
      haloGeometry.dispose()
      particleGeometry.dispose()

      brassMaterial.dispose()
      candleMaterial.dispose()
      wickMaterial.dispose()
      flameMaterial.dispose()
      haloMaterial.dispose()
      particleMaterial.dispose()

      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [activeAmbiance, isLit, interactive])

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[#E5E2DC] bg-[#1A1310] ${className}`}>
      {/* 3D Canvas Viewport */}
      <div ref={containerRef} className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing touch-none" />

      {/* Overlay UI Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-[#2C221E]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#4D3E35] text-white">
          <span className={`w-2 h-2 rounded-full ${isLit ? 'bg-[#E5B54F] animate-ping' : 'bg-[#6B5E50]'}`} />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4C596]">
            {isLit ? 'Memorial Flame Active' : 'Flame Resting'}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#2C221E]/80 backdrop-blur-md p-1 rounded-lg border border-[#4D3E35]">
          {(['twilight', 'chapel', 'solace'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveAmbiance(mode)}
              className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded transition-colors ${
                activeAmbiance === mode
                  ? 'bg-[#A8935D] text-white'
                  : 'text-[#C5BAA8] hover:text-white hover:bg-white/10'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Interactive Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto text-left">
          <p className="text-xs text-[#E5E0D8] font-display font-medium">
            Virtual Tribute &amp; Perpetual Flame
          </p>
          <p className="text-[10px] text-[#A89886]">
            {tributeCount} stars lit in remembrance today • Drag to orbit scene
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsLit(!isLit)
              if (!isLit) setTributeCount((prev) => prev + 1)
            }}
            className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded bg-[#A8935D] hover:bg-[#BBA76F] text-[#1A1310] transition-all shadow-md active:scale-95"
          >
            {isLit ? 'Extinguish Flame' : 'Light Memorial Candle'}
          </button>
        </div>
      </div>
    </div>
  )
}
