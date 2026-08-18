import * as THREE from 'three';
import { ThreeSceneManager } from '../core/ThreeSceneManager';
import { createCardTexture } from '../core/TextureUtils';
import { stages } from '../../data/roadmap-data';

export function createGenericStage3D(container: HTMLElement, stageId: string): { dispose: () => void } {
  const stage = stages.find((s) => s.id === stageId) ?? stages[0];

  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-3d-container';
  container.appendChild(wrapper);

  const sceneManager = new ThreeSceneManager(wrapper, {
    cameraPos: [0, 2.8, 6.8],
    fov: 42,
    autoRotate: false,
  });

  const { scene } = sceneManager;
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // Pedestal Base
  const baseGeom = new THREE.CylinderGeometry(3.6, 4.0, 0.2, 48);
  const baseMat = new THREE.MeshStandardMaterial({
    color: sceneManager.theme.isDark ? 0x111827 : 0xe2e8f0,
    roughness: 0.5,
    metalness: 0.2,
  });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.y = -1.2;
  mainGroup.add(baseMesh);

  // Take top 2 key comparison rows for the 3D cards
  const row1 = stage.rows[0];
  const row2 = stage.rows[1] || stage.rows[0];

  // Android 3D Card (Left)
  const androidTexture = createCardTexture({
    title: 'Android 核心心智',
    code: `${row1.android}\n${row2 !== row1 ? row2.android : ''}`,
    tag: 'ANDROID',
    isAndroid: true,
    bgColor: '#064e3b',
  });
  const cardGeom = new THREE.BoxGeometry(2.6, 1.6, 0.08);
  const androidMat = new THREE.MeshStandardMaterial({
    map: androidTexture,
    roughness: 0.25,
    metalness: 0.15,
  });
  const androidCard = new THREE.Mesh(cardGeom, androidMat);
  androidCard.position.set(-1.6, 0.2, 0);
  androidCard.rotation.y = 0.25;
  mainGroup.add(androidCard);

  // iOS 3D Card (Right)
  const iosTexture = createCardTexture({
    title: 'iOS / SwiftUI 对应范式',
    code: `${row1.ios}\n${row2 !== row1 ? row2.ios : ''}`,
    tag: 'SWIFTUI / IOS',
    isIos: true,
    bgColor: '#0c4a6e',
  });
  const iosMat = new THREE.MeshStandardMaterial({
    map: iosTexture,
    roughness: 0.25,
    metalness: 0.15,
  });
  const iosCard = new THREE.Mesh(cardGeom, iosMat);
  iosCard.position.set(1.6, 0.2, 0);
  iosCard.rotation.y = -0.25;
  mainGroup.add(iosCard);

  // Glowing Bridge Beam connecting the two cards
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0.2, 0.1),
    new THREE.Vector3(0, 0.6, 0.5),
    new THREE.Vector3(0.4, 0.2, 0.1),
  ]);
  const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6 });
  const bridge = new THREE.Mesh(tubeGeom, tubeMat);
  mainGroup.add(bridge);

  // Floating Pulse Energy
  const energyGeom = new THREE.SphereGeometry(0.09, 16, 16);
  const energyMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const energySphere = new THREE.Mesh(energyGeom, energyMat);
  mainGroup.add(energySphere);

  let progress = 0;
  const tickAnim = () => {
    progress = (progress + 0.01) % 1;
    const pt = curve.getPoint(progress);
    energySphere.position.copy(pt);
  };
  const interval = setInterval(tickAnim, 16);

  // Controls Overlay
  const overlay = document.createElement('div');
  overlay.className = 'canvas-3d-overlay-controls';
  overlay.innerHTML = `
    <button class="control-btn-sm" id="btn-spin-stage">
      <span>🔄 360° 旋转全景</span>
    </button>
    <button class="control-btn-sm" id="btn-reset-stage-cam">
      <span>🎯 视角复位</span>
    </button>
  `;
  wrapper.appendChild(overlay);

  const hint = document.createElement('div');
  hint.className = 'canvas-3d-hint';
  hint.innerHTML = `<span>支持鼠标 3D 拖拽与滚轮缩放</span>`;
  wrapper.appendChild(hint);

  let isSpinning = false;
  overlay.querySelector('#btn-spin-stage')?.addEventListener('click', () => {
    isSpinning = !isSpinning;
    if (sceneManager.controls) {
      sceneManager.controls.autoRotate = isSpinning;
    }
    const btn = overlay.querySelector('#btn-spin-stage');
    btn?.classList.toggle('active', isSpinning);
  });

  overlay.querySelector('#btn-reset-stage-cam')?.addEventListener('click', () => {
    sceneManager.resetCamera([0, 2.8, 6.8], [0, 0, 0]);
    if (sceneManager.controls) {
      sceneManager.controls.autoRotate = false;
      isSpinning = false;
      overlay.querySelector('#btn-spin-stage')?.classList.remove('active');
    }
  });

  return {
    dispose: () => {
      clearInterval(interval);
      sceneManager.dispose();
      wrapper.remove();
    },
  };
}
