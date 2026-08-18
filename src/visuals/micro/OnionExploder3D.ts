import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeSceneManager } from '../core/ThreeSceneManager';

export function createOnionExploder3D(container: HTMLElement): { dispose: () => void } {
  // Container markup
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-3d-container';
  container.appendChild(wrapper);

  const sceneManager = new ThreeSceneManager(wrapper, {
    cameraPos: [0, 2.5, 6.5],
    fov: 42,
  });

  const { scene } = sceneManager;

  // State
  let isPaddingFirst = true; // true: .padding().background() vs false: .background().padding()
  let explodeDistance = 0.7; // 0 to 1.8
  const layers: THREE.Mesh[] = [];

  // Group for rotation
  const onionGroup = new THREE.Group();
  scene.add(onionGroup);

  // Define 4 Onion Layers
  const layerDefs = [
    {
      id: 'core',
      name: '0. View 核心: Text("Hello")',
      color: 0x38bdf8,
      w: 2.2,
      h: 0.9,
      depth: 0.08,
      opacity: 0.95,
      isCore: true,
    },
    {
      id: 'padding',
      name: '1. 内边距: .padding(16)',
      color: 0x0d9488,
      w: 3.2,
      h: 1.8,
      depth: 0.05,
      opacity: 0.45,
    },
    {
      id: 'bg',
      name: '2. 背景填充: .background(.blue)',
      color: 0x0284c7,
      w: 3.4,
      h: 2.0,
      depth: 0.05,
      opacity: 0.55,
    },
    {
      id: 'clip',
      name: '3. 形状裁剪: .clipShape(RoundedRectangle)',
      color: 0x22c55e,
      w: 3.6,
      h: 2.2,
      depth: 0.05,
      opacity: 0.35,
    },
  ];

  // Build Layer Meshes
  layerDefs.forEach((def, index) => {
    const geom = new THREE.BoxGeometry(def.w, def.h, def.depth);
    const mat = new THREE.MeshPhysicalMaterial({
      color: def.color,
      transparent: true,
      opacity: def.opacity,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      transmission: 0.3,
      reflectivity: 0.9,
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add border line
    const edges = new THREE.EdgesGeometry(geom);
    const lineMat = new THREE.LineBasicMaterial({ color: def.color, linewidth: 2 });
    const line = new THREE.LineSegments(edges, lineMat);
    mesh.add(line);

    // Initial position
    mesh.position.z = (index - 1.5) * explodeDistance;
    onionGroup.add(mesh);
    layers.push(mesh);
  });

  // Controls Overlay
  const overlay = document.createElement('div');
  overlay.className = 'canvas-3d-overlay-controls';
  overlay.innerHTML = `
    <div class="slider-group">
      <span>3D 爆炸展开</span>
      <input type="range" min="0" max="1.8" step="0.05" value="${explodeDistance}" id="onion-slider" />
    </div>
    <button class="control-btn-sm" id="btn-toggle-order">
      <span>🔀 颠倒修饰符顺序</span>
    </button>
    <button class="control-btn-sm" id="btn-reset-onion-cam">
      <span>🔄 视角复位</span>
    </button>
  `;
  wrapper.appendChild(overlay);

  const hint = document.createElement('div');
  hint.className = 'canvas-3d-hint';
  hint.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    <span>支持鼠标 360° 拖拽旋转与滚轮缩放</span>
  `;
  wrapper.appendChild(hint);

  // Update Layers function
  const updateLayerPositions = () => {
    layers.forEach((mesh, index) => {
      const targetZ = (index - 1.5) * explodeDistance;
      gsap.to(mesh.position, {
        z: targetZ,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  };

  // Slider Event
  const slider = overlay.querySelector('#onion-slider') as HTMLInputElement;
  slider?.addEventListener('input', (e) => {
    explodeDistance = parseFloat((e.target as HTMLInputElement).value);
    updateLayerPositions();
  });

  // Toggle Order Event
  const toggleBtn = overlay.querySelector('#btn-toggle-order') as HTMLButtonElement;
  toggleBtn?.addEventListener('click', () => {
    isPaddingFirst = !isPaddingFirst;
    toggleBtn.classList.toggle('active', !isPaddingFirst);

    if (isPaddingFirst) {
      toggleBtn.innerHTML = `<span>🔀 模式: .padding().background()</span>`;
      // Layer 1 (Padding) before Layer 2 (BG)
      gsap.to(layers[1].scale, { x: 1, y: 1, duration: 0.4 });
      gsap.to(layers[2].scale, { x: 1, y: 1, duration: 0.4 });
    } else {
      toggleBtn.innerHTML = `<span>⚠️ 颠倒: .background().padding()</span>`;
      // Invert visual: Background shrinks tightly to text, Padding is outside
      gsap.to(layers[2].scale, { x: 0.7, y: 0.6, duration: 0.4 });
      gsap.to(layers[1].scale, { x: 1.15, y: 1.15, duration: 0.4 });
    }
  });

  // Reset Camera
  overlay.querySelector('#btn-reset-onion-cam')?.addEventListener('click', () => {
    sceneManager.resetCamera([0, 2.5, 6.5], [0, 0, 0]);
    onionGroup.rotation.set(0, 0, 0);
  });

  // Subtle auto floating animation
  let time = 0;
  const tickAnim = () => {
    time += 0.015;
    onionGroup.rotation.y = Math.sin(time * 0.5) * 0.15 + 0.2;
    onionGroup.rotation.x = Math.cos(time * 0.4) * 0.08 + 0.1;
  };

  const animInterval = setInterval(tickAnim, 16);

  return {
    dispose: () => {
      clearInterval(animInterval);
      sceneManager.dispose();
      wrapper.remove();
    },
  };
}
