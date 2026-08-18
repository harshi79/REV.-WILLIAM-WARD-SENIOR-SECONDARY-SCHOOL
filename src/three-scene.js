import * as THREE from 'three';

/**
 * A lightweight, GPU-friendly 3D backdrop:
 * floating wireframe + solid geometric shapes and a drifting particle field,
 * with mouse-tilt and scroll parallax, tinted per section ("mood").
 */
const PALETTE = [0x4f9cf0, 0x174ea6, 0x6fb7ff, 0x9ad0ff, 0x2d6bd8, 0x0a1f44];

const MOODS = [
  { light: 0x4f9cf0, particle: 0xbfe0ff }, // home
  { light: 0x6fb7ff, particle: 0xcfe6ff }, // about
  { light: 0x2d6bd8, particle: 0x9ad0ff }, // academics
  { light: 0x4f9cf0, particle: 0xbfe0ff }, // facilities
  { light: 0x174ea6, particle: 0x8fd0ff }, // activities
  { light: 0x6fb7ff, particle: 0xcfe6ff }, // admissions
  { light: 0x4f9cf0, particle: 0xbfe0ff }, // contact
];

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function initScene(canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    140,
  );
  camera.position.set(0, 0, 11);

  const group = new THREE.Group();
  scene.add(group);

  // ---- lights ----
  scene.add(new THREE.AmbientLight(0x9dc4ff, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(6, 8, 10);
  scene.add(key);

  const rim = new THREE.PointLight(0x4f9cf0, 60, 120, 2);
  rim.position.set(-9, -5, 4);
  scene.add(rim);

  const accent = new THREE.PointLight(0x4f9cf0, 55, 110, 2);
  accent.position.set(9, 5, 2);
  scene.add(accent);

  // ---- floating shapes ----
  const geometries = [
    () => new THREE.IcosahedronGeometry(1, 0),
    () => new THREE.OctahedronGeometry(1, 0),
    () => new THREE.TorusGeometry(0.9, 0.32, 12, 48),
    () => new THREE.TorusKnotGeometry(0.72, 0.22, 96, 12),
    () => new THREE.DodecahedronGeometry(0.95, 0),
    () => new THREE.BoxGeometry(1.15, 1.15, 1.15),
    () => new THREE.ConeGeometry(0.85, 1.7, 5),
    () => new THREE.SphereGeometry(0.85, 24, 16),
  ];

  const items = [];
  const shapeCount = isMobile ? 8 : 15;

  for (let i = 0; i < shapeCount; i++) {
    const geometry = pick(geometries)();
    const color = pick(PALETTE);
    const wireframe = Math.random() < 0.36;
    let material;

    if (wireframe) {
      material = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.32,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.32,
        metalness: 0.4,
        emissive: new THREE.Color(color).multiplyScalar(0.16),
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    const scale = rand(0.45, 1.65);
    mesh.scale.setScalar(scale);

    const position = new THREE.Vector3(rand(-10, 10), rand(-6, 6), rand(-6.5, 1.5));
    mesh.position.copy(position);
    mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    group.add(mesh);

    items.push({
      mesh,
      baseY: position.y,
      rotSpeed: new THREE.Vector3(rand(-0.005, 0.005), rand(-0.005, 0.005), rand(-0.004, 0.004)),
      floatAmp: rand(0.25, 0.9),
      floatSpeed: rand(0.3, 0.9),
      phase: rand(0, Math.PI * 2),
    });
  }

  // ---- particle field ----
  const particleCount = isMobile ? 150 : 430;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = rand(-14, 14);
    positions[i * 3 + 1] = rand(-9, 9);
    positions[i * 3 + 2] = rand(-8, 3);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const pMat = new THREE.PointsMaterial({
    color: 0xbfe0ff,
    size: 0.05,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  // ---- interaction state ----
  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const moodTarget = new THREE.Color(0x4f9cf0);
  const moodCurrent = new THREE.Color(0x4f9cf0);
  const particleTarget = new THREE.Color(0xbfe0ff);
  let scrollP = 0;

  function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize, { passive: true });

  function setMood(index) {
    const mood = MOODS[Math.min(Math.max(index, 0), MOODS.length - 1)];
    moodTarget.set(mood.light);
    particleTarget.set(mood.particle);
  }

  // ---- render loop ----
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollP = window.scrollY / maxScroll;

    target.x += (mouse.x - target.x) * 0.05;
    target.y += (mouse.y - target.y) * 0.05;

    if (!reduced) {
      camera.position.x = target.x * 1.25;
      camera.position.y = target.y * 0.9 - scrollP * 1.6;
      camera.lookAt(0, -scrollP * 1.6, 0);

      group.rotation.y = scrollP * Math.PI * 0.5 + t * 0.02;
      group.rotation.x = scrollP * 0.25;

      for (const item of items) {
        item.mesh.rotation.x += item.rotSpeed.x;
        item.mesh.rotation.y += item.rotSpeed.y;
        item.mesh.rotation.z += item.rotSpeed.z;
        item.mesh.position.y =
          item.baseY + Math.sin(t * item.floatSpeed + item.phase) * item.floatAmp;
      }

      particles.rotation.y = t * 0.015;
      particles.rotation.x = Math.sin(t * 0.05) * 0.06;
    } else {
      camera.lookAt(0, 0, 0);
    }

    moodCurrent.lerp(moodTarget, 0.03);
    rim.color.copy(moodCurrent);
    accent.color.copy(moodCurrent);
    pMat.color.lerp(particleTarget, 0.03);

    renderer.render(scene, camera);
  }

  animate();

  return {
    setMood,
    dispose() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };
}
