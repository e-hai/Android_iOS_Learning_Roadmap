import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { get3DThemeColors, ThemeColors } from './ColorTheme';

export interface SceneManagerOptions {
  enableControls?: boolean;
  autoRotate?: boolean;
  cameraPos?: [number, number, number];
  fov?: number;
  onTick?: (delta: number, time: number) => void;
}

export class ThreeSceneManager {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls | null = null;
  public theme: ThemeColors;

  private reqId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private clock = new THREE.Clock();
  public onTickCallback?: (delta: number, time: number) => void;
  private isDisposed = false;
  private isPaused = false;
  private ambientLight: THREE.AmbientLight | null = null;
  private dirLight: THREE.DirectionalLight | null = null;

  constructor(container: HTMLElement, options: SceneManagerOptions = {}) {
    this.container = container;
    this.theme = get3DThemeColors();
    this.onTickCallback = options.onTick;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;
    const fov = options.fov ?? 45;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    const [cx, cy, cz] = options.cameraPos ?? [0, 4, 10];
    this.camera.position.set(cx, cy, cz);

    // 3. Renderer — keep first frame cheap (no shadows, capped DPR)
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isCoarsePointer,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.25 : 1.5));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = false;
    container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (options.enableControls !== false) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.autoRotate = options.autoRotate ?? false;
      this.controls.autoRotateSpeed = 0.8;
      this.controls.maxDistance = 35;
      this.controls.minDistance = 2;
    }

    // 5. Default Lighting
    this.setupLighting();

    // 6. Responsive Resize
    this.setupResize();

    // 7. Start Loop
    this.animate();
  }

  private setupLighting() {
    // Unlit MeshBasicMaterials dominate the constellation; keep lights minimal.
    this.ambientLight = new THREE.AmbientLight(0xffffff, this.theme.isDark ? 0.85 : 1);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, this.theme.isDark ? 0.55 : 0.4);
    this.dirLight.position.set(8, 12, 6);
    this.scene.add(this.dirLight);
  }

  private setupResize() {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.isDisposed || this.isPaused) return;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  public syncSize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public refreshTheme(): void {
    this.theme = get3DThemeColors();
    if (this.ambientLight) this.ambientLight.intensity = this.theme.isDark ? 0.85 : 1;
    if (this.dirLight) this.dirLight.intensity = this.theme.isDark ? 0.55 : 0.4;
  }

  public pause(): void {
    if (this.isDisposed || this.isPaused) return;
    this.isPaused = true;
    if (this.reqId !== null) {
      cancelAnimationFrame(this.reqId);
      this.reqId = null;
    }
  }

  public resume(): void {
    if (this.isDisposed || !this.isPaused) return;
    this.isPaused = false;
    this.syncSize();
    this.clock.getDelta();
    this.animate();
  }

  private animate = () => {
    if (this.isDisposed || this.isPaused) return;

    this.reqId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.controls) {
      this.controls.update();
    }

    if (this.onTickCallback) {
      this.onTickCallback(delta, time);
    }

    this.renderer.render(this.scene, this.camera);
  };

  public resetCamera(pos: [number, number, number] = [0, 4, 10], target: [number, number, number] = [0, 0, 0]) {
    this.camera.position.set(...pos);
    if (this.controls) {
      this.controls.target.set(...target);
      this.controls.update();
    }
  }

  public dispose() {
    this.isDisposed = true;
    this.isPaused = true;

    if (this.reqId !== null) {
      cancelAnimationFrame(this.reqId);
      this.reqId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // Traverse and dispose geometries and materials
    this.scene.traverse((object) => {
      const renderable = object as THREE.Mesh;
      renderable.geometry?.dispose();
      if (renderable.material) {
        if (Array.isArray(renderable.material)) {
          renderable.material.forEach((material) => material.dispose());
        } else {
          renderable.material.dispose();
        }
      }
    });

    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
