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

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, this.theme.isDark ? 0.7 : 0.9);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, this.theme.isDark ? 1.4 : 1.2);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(this.theme.iosGlow, 0.6);
    dirLight2.position.set(-10, -5, -10);
    this.scene.add(dirLight2);
  }

  private setupResize() {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.isDisposed) return;
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

  private animate = () => {
    if (this.isDisposed) return;

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
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
