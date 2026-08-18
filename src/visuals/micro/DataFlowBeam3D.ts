import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeSceneManager } from '../core/ThreeSceneManager';
import { createCardTexture } from '../core/TextureUtils';

export function createDataFlowBeam3D(container: HTMLElement): { dispose: () => void } {
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-3d-container';
  container.appendChild(wrapper);

  const sceneManager = new ThreeSceneManager(wrapper, {
    cameraPos: [0, 2.5, 7.5],
    fov: 42,
  });

  const { scene } = sceneManager;
  const towersGroup = new THREE.Group();
  scene.add(towersGroup);

  // Layers definition for Architecture
  const androidLayers = [
    { title: '1. UI 界面层', code: '@Composable fun Screen()\nuiState.collectAsState()', tag: 'ANDROID VIEW' },
    { title: '2. 状态机层', code: 'class NewsVM: ViewModel\nval uiState: StateFlow<T>', tag: 'VIEWMODEL' },
    { title: '3. 仓库契约层', code: 'class Repository(api, dao)\nfun getNews(): Flow<T>', tag: 'REPOSITORY' },
    { title: '4. 数据源层', code: 'Retrofit / Room DAO\n@GET / @Query Room', tag: 'DATA SOURCE' },
  ];

  const iosLayers = [
    { title: '1. UI 界面层', code: 'struct ScreenView: View\n@State private var vm: VM', tag: 'SWIFTUI VIEW' },
    { title: '2. 状态机层', code: '@Observable class NewsVM\nvar uiState = UiState()', tag: 'VIEWMODEL' },
    { title: '3. 仓库契约层', code: 'protocol NewsRepoProtocol\nfunc fetch() async throws', tag: 'REPOSITORY' },
    { title: '4. 数据源层', code: 'URLSession / SwiftData\n@Model / URLSession.shared', tag: 'DATA SOURCE' },
  ];

  const androidMeshes: THREE.Mesh[] = [];
  const iosMeshes: THREE.Mesh[] = [];

  // Build Android Tower (Left: X = -2.2)
  androidLayers.forEach((layer, index) => {
    const geom = new THREE.BoxGeometry(2.4, 0.75, 0.1);
    const texture = createCardTexture({
      title: layer.title,
      code: layer.code,
      tag: layer.tag,
      isAndroid: true,
      bgColor: '#064e3b',
    });
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(-2.0, 1.35 - index * 0.9, 0);
    towersGroup.add(mesh);
    androidMeshes.push(mesh);
  });

  // Build iOS Tower (Right: X = +2.2)
  iosLayers.forEach((layer, index) => {
    const geom = new THREE.BoxGeometry(2.4, 0.75, 0.1);
    const texture = createCardTexture({
      title: layer.title,
      code: layer.code,
      tag: layer.tag,
      isIos: true,
      bgColor: '#0c4a6e',
    });
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(2.0, 1.35 - index * 0.9, 0);
    towersGroup.add(mesh);
    iosMeshes.push(mesh);
  });

  // Pulse Beam Particle
  const beamGeom = new THREE.SphereGeometry(0.12, 16, 16);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const pulseBeam = new THREE.Mesh(beamGeom, beamMat);
  pulseBeam.visible = false;
  towersGroup.add(pulseBeam);

  // Controls Overlay
  const overlay = document.createElement('div');
  overlay.className = 'canvas-3d-overlay-controls';
  overlay.innerHTML = `
    <button class="control-btn-sm" id="btn-fire-ios-beam">
      <span>⚡ 模拟 iOS 单向数据流 (UDF)</span>
    </button>
    <button class="control-btn-sm" id="btn-fire-android-beam">
      <span>⚡ 模拟 Android MVI 数据流</span>
    </button>
    <button class="control-btn-sm" id="btn-reset-arch-cam">
      <span>🔄 视角复位</span>
    </button>
  `;
  wrapper.appendChild(overlay);

  const hint = document.createElement('div');
  hint.className = 'canvas-3d-hint';
  hint.innerHTML = `<span>🟢 Android 架构塔 (左) ↔ 🔵 iOS 架构塔 (右)</span>`;
  wrapper.appendChild(hint);

  // Animate Beam Function
  const fireBeam = (isIos: boolean) => {
    const xPos = isIos ? 2.0 : -2.0;
    const targetMeshes = isIos ? iosMeshes : androidMeshes;

    pulseBeam.position.set(xPos, 1.35, 0.2);
    pulseBeam.visible = true;
    beamMat.color.setHex(isIos ? 0x38bdf8 : 0x22c55e);

    // 1. Downward Intent Beam: View ➔ DataSource
    const tl = gsap.timeline({
      onComplete: () => {
        // 2. Upward State Return Beam: DataSource ➔ View
        gsap.to(pulseBeam.position, {
          y: 1.35,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: () => {
            const curY = pulseBeam.position.y;
            targetMeshes.forEach((m) => {
              if (Math.abs(m.position.y - curY) < 0.3) {
                gsap.to(m.scale, { x: 1.06, y: 1.06, yoyo: true, repeat: 1, duration: 0.15 });
              }
            });
          },
          onComplete: () => {
            pulseBeam.visible = false;
          },
        });
      },
    });

    tl.to(pulseBeam.position, {
      y: -1.35,
      duration: 0.7,
      ease: 'power2.in',
      onUpdate: () => {
        const curY = pulseBeam.position.y;
        targetMeshes.forEach((m) => {
          if (Math.abs(m.position.y - curY) < 0.3) {
            gsap.to(m.scale, { x: 1.04, y: 1.04, yoyo: true, repeat: 1, duration: 0.1 });
          }
        });
      },
    });
  };

  overlay.querySelector('#btn-fire-ios-beam')?.addEventListener('click', () => fireBeam(true));
  overlay.querySelector('#btn-fire-android-beam')?.addEventListener('click', () => fireBeam(false));
  overlay.querySelector('#btn-reset-arch-cam')?.addEventListener('click', () => {
    sceneManager.resetCamera([0, 2.5, 7.5], [0, 0, 0]);
  });

  return {
    dispose: () => {
      sceneManager.dispose();
      wrapper.remove();
    },
  };
}
