import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeSceneManager } from '../core/ThreeSceneManager';
import { stages } from '../../data/roadmap-data';
import { i18n } from '../../services/i18n';

export function createNeuralConstellation3D(
  container: HTMLElement,
  onSelectStage: (stageId: string) => void
): { dispose: () => void } {
  const wrapper = document.createElement('div');
  wrapper.className = 'constellation-hero-card';
  container.appendChild(wrapper);

  // Overlay Title & Badge
  const info = document.createElement('div');
  info.className = 'constellation-overlay-info';
  info.innerHTML = `
    <div class="constellation-overlay-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
      <span>3D 认知神经星云</span>
    </div>
    <h2 class="constellation-overlay-title">16 阶段知识拓扑全景</h2>
    <p class="constellation-overlay-desc">悬停探索神经突触连接，点击直达对应学习章节</p>
  `;
  wrapper.appendChild(info);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'constellation-node-tooltip';
  wrapper.appendChild(tooltip);

  const sceneManager = new ThreeSceneManager(wrapper, {
    cameraPos: [0, 1.5, 11],
    fov: 46,
    autoRotate: true,
  });

  const { scene, camera } = sceneManager;
  const nodesGroup = new THREE.Group();
  scene.add(nodesGroup);

  interface NodeData {
    mesh: THREE.Mesh;
    glowMesh: THREE.Mesh;
    id: string;
    num: number;
    title: string;
    isAdv: boolean;
    pos: THREE.Vector3;
  }

  const nodeDataList: NodeData[] = [];

  // Calculate 16 Node Positions in 3D Galaxy Helix
  stages.forEach((stage, idx) => {
    const isAdv = stage.isAdvanced;
    const angle = (idx / stages.length) * Math.PI * 2;
    const radius = isAdv ? 4.2 : 3.2;
    const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.4;
    const y = Math.sin(angle * 2) * 1.2 + (isAdv ? -0.4 : 0.4);
    const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.4;
    const pos = new THREE.Vector3(x, y, z);

    // Core Sphere
    const geom = new THREE.SphereGeometry(isAdv ? 0.22 : 0.28, 24, 24);
    const color = isAdv ? 0x38bdf8 : 0x22c55e;
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(pos);
    nodesGroup.add(mesh);

    // Outer Halo/Glow Sphere
    const glowGeom = new THREE.SphereGeometry(isAdv ? 0.38 : 0.46, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const glowMesh = new THREE.Mesh(glowGeom, glowMat);
    glowMesh.position.copy(pos);
    nodesGroup.add(glowMesh);

    nodeDataList.push({
      mesh,
      glowMesh,
      id: stage.id,
      num: stage.number,
      title: i18n.t(stage.titleKey),
      isAdv,
      pos,
    });
  });

  // Synaptic Connecting Lines (Bezier curves with energy pulses)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: sceneManager.theme.isDark ? 0x334155 : 0x94a3b8,
    transparent: true,
    opacity: 0.45,
  });

  for (let i = 0; i < nodeDataList.length; i++) {
    const nextIdx = (i + 1) % nodeDataList.length;
    const p1 = nodeDataList[i].pos;
    const p2 = nodeDataList[nextIdx].pos;

    const curve = new THREE.QuadraticBezierCurve3(
      p1,
      new THREE.Vector3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 + 0.5, (p1.z + p2.z) / 2),
      p2
    );
    const points = curve.getPoints(20);
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, lineMaterial);
    nodesGroup.add(line);
  }

  // Energy Pulses floating between nodes
  const pulseGeom = new THREE.SphereGeometry(0.08, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6 });
  const pulseSpheres: { mesh: THREE.Mesh; fromIdx: number; progress: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(pulseGeom, pulseMat);
    nodesGroup.add(p);
    pulseSpheres.push({
      mesh: p,
      fromIdx: Math.floor(Math.random() * (stages.length - 1)),
      progress: Math.random(),
    });
  }

  // Raycaster for Hover & Click
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-999, -999);
  let hoveredNode: NodeData | null = null;

  const onMouseMove = (e: MouseEvent) => {
    const rect = wrapper.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const meshes = nodeDataList.map((n) => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const targetNode = nodeDataList.find((n) => n.mesh === hitMesh);

      if (targetNode && targetNode !== hoveredNode) {
        hoveredNode = targetNode;
        wrapper.style.cursor = 'pointer';

        // Animate Hovered Node
        gsap.to(targetNode.mesh.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.3 });
        gsap.to(targetNode.glowMesh.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.3 });

        // Show Tooltip
        const vector = targetNode.pos.clone().project(camera);
        const screenX = ((vector.x + 1) * rect.width) / 2;
        const screenY = ((-vector.y + 1) * rect.height) / 2;

        tooltip.style.left = `${screenX}px`;
        tooltip.style.top = `${screenY}px`;
        tooltip.innerHTML = `
          <div class="tooltip-num">STAGE ${String(targetNode.num).padStart(2, '0')} · ${targetNode.isAdv ? '进阶' : '核心主线'}</div>
          <div class="tooltip-title">${targetNode.title}</div>
          <div class="tooltip-desc">点击立即探索 ➔</div>
        `;
        tooltip.classList.add('visible');
      }
    } else if (hoveredNode) {
      gsap.to(hoveredNode.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      gsap.to(hoveredNode.glowMesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      hoveredNode = null;
      wrapper.style.cursor = 'grab';
      tooltip.classList.remove('visible');
    }
  };

  const onClick = () => {
    if (hoveredNode) {
      // Zoom camera animation then navigate
      gsap.to(camera.position, {
        x: hoveredNode.pos.x * 0.6,
        y: hoveredNode.pos.y * 0.6,
        z: hoveredNode.pos.z + 3,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          onSelectStage(hoveredNode!.id);
        },
      });
    }
  };

  wrapper.addEventListener('mousemove', onMouseMove);
  wrapper.addEventListener('click', onClick);

  // Animation Loop for Pulses & Node Glows
  let time = 0;
  const loop = () => {
    time += 0.015;

    // Pulse moving along paths
    pulseSpheres.forEach((ps) => {
      ps.progress += 0.008;
      if (ps.progress >= 1) {
        ps.progress = 0;
        ps.fromIdx = (ps.fromIdx + 1) % nodeDataList.length;
      }
      const toIdx = (ps.fromIdx + 1) % nodeDataList.length;
      const p1 = nodeDataList[ps.fromIdx].pos;
      const p2 = nodeDataList[toIdx].pos;
      ps.mesh.position.lerpVectors(p1, p2, ps.progress);
    });

    // Gentle floating
    nodeDataList.forEach((n, idx) => {
      n.glowMesh.rotation.y += 0.02;
      n.glowMesh.rotation.z += 0.01;
      n.mesh.position.y = n.pos.y + Math.sin(time * 2 + idx) * 0.06;
    });
  };

  const interval = setInterval(loop, 16);

  return {
    dispose: () => {
      clearInterval(interval);
      wrapper.removeEventListener('mousemove', onMouseMove);
      wrapper.removeEventListener('click', onClick);
      sceneManager.dispose();
      wrapper.remove();
    },
  };
}
