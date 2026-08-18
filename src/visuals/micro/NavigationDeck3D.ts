import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeSceneManager } from '../core/ThreeSceneManager';
import { createCardTexture } from '../core/TextureUtils';

export function createNavigationDeck3D(container: HTMLElement): { dispose: () => void } {
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-3d-container';
  container.appendChild(wrapper);

  const sceneManager = new ThreeSceneManager(wrapper, {
    cameraPos: [0, 4.5, 7.5],
    fov: 40,
  });

  const { scene } = sceneManager;

  const stackGroup = new THREE.Group();
  scene.add(stackGroup);

  // Stack of 3D Cards
  const cards: THREE.Mesh[] = [];
  const cardTitles = ['HomeView (Root)', 'ProductListView (path: 1)', 'DetailView (path: 2)', 'CheckoutView (path: 3)'];

  // Base Pedestal
  const pedGeom = new THREE.CylinderGeometry(2.8, 3.2, 0.2, 32);
  const pedMat = new THREE.MeshStandardMaterial({
    color: sceneManager.theme.isDark ? 0x1e293b : 0xe2e8f0,
    roughness: 0.6,
  });
  const pedestal = new THREE.Mesh(pedGeom, pedMat);
  pedestal.position.y = -1.2;
  stackGroup.add(pedestal);

  // Helper to create a single card
  const buildCard = (index: number, title: string) => {
    const geom = new THREE.BoxGeometry(3.2, 1.8, 0.08);
    const texture = createCardTexture({
      title: title,
      code: index === 0 ? 'NavigationStack(path: $path) {\n  RootView()\n}' : `// Stack Index [${index}]\nNavigationLink(value: item)`,
      tag: index === 0 ? 'ROOT' : `PAGE #${index}`,
      isIos: true,
      bgColor: '#0f172a',
    });

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.2,
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Position in 3D Stack
    mesh.position.set(0, -0.9 + index * 0.45, (index - 1) * 0.15);
    mesh.rotation.x = -Math.PI * 0.18;
    mesh.rotation.y = 0;
    mesh.rotation.z = (index % 2 === 1 ? 1 : -1) * 0.04 * index;

    return mesh;
  };

  // Push Initial Root Card
  const rootCard = buildCard(0, cardTitles[0]);
  stackGroup.add(rootCard);
  cards.push(rootCard);

  // Controls Overlay
  const overlay = document.createElement('div');
  overlay.className = 'canvas-3d-overlay-controls';
  overlay.innerHTML = `
    <button class="control-btn-sm" id="btn-nav-push">
      <span>➕ Push 页面 (path.append)</span>
    </button>
    <button class="control-btn-sm" id="btn-nav-pop">
      <span>⬅️ Pop 返回 (path.removeLast)</span>
    </button>
    <button class="control-btn-sm" id="btn-nav-root">
      <span>🏠 Pop to Root (清空栈)</span>
    </button>
    <button class="control-btn-sm" id="btn-nav-binding">
      <span>✨ @Binding 回传</span>
    </button>
  `;
  wrapper.appendChild(overlay);

  const hint = document.createElement('div');
  hint.className = 'canvas-3d-hint';
  hint.innerHTML = `<span>当前路由深度: <b id="stack-count-badge" style="color:var(--color-accent)">1</b> 层</span>`;
  wrapper.appendChild(hint);

  const updateBadge = () => {
    const b = wrapper.querySelector('#stack-count-badge');
    if (b) b.textContent = String(cards.length);
  };

  // Push Action
  const doPush = () => {
    if (cards.length >= 4) return;
    const nextIdx = cards.length;
    const newCard = buildCard(nextIdx, cardTitles[nextIdx] ?? `SubView #${nextIdx}`);

    // Start high above
    newCard.position.y += 3.5;
    newCard.position.z += 1.5;
    newCard.rotation.z += 0.3;

    stackGroup.add(newCard);
    cards.push(newCard);
    updateBadge();

    gsap.to(newCard.position, {
      x: 0,
      y: -0.9 + nextIdx * 0.45,
      z: (nextIdx - 1) * 0.15,
      duration: 0.5,
      ease: 'back.out(1.4)',
    });

    gsap.to(newCard.rotation, {
      x: -Math.PI * 0.18,
      y: 0,
      z: (nextIdx % 2 === 1 ? 1 : -1) * 0.04 * nextIdx,
      duration: 0.5,
    });
  };

  // Pop Action
  const doPop = () => {
    if (cards.length <= 1) return; // Keep Root
    const topCard = cards.pop()!;
    updateBadge();

    gsap.to(topCard.position, {
      x: 3.5,
      y: topCard.position.y + 1.2,
      z: topCard.position.z + 1.0,
      duration: 0.4,
      ease: 'power2.in',
    });

    gsap.to(topCard.rotation, {
      z: -0.5,
      y: 0.4,
      duration: 0.4,
      onComplete: () => {
        stackGroup.remove(topCard);
        topCard.geometry.dispose();
      },
    });
  };

  // Pop to Root Action
  const doPopRoot = () => {
    while (cards.length > 1) {
      doPop();
    }
  };

  // @Binding Return Effect
  const doBindingReturn = () => {
    if (cards.length <= 1) {
      doPush();
      setTimeout(doBindingReturn, 600);
      return;
    }

    const topCard = cards[cards.length - 1];
    const prevCard = cards[cards.length - 2];

    // Create golden particle burst
    const particleGeom = new THREE.SphereGeometry(0.08, 12, 12);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const particle = new THREE.Mesh(particleGeom, particleMat);
    particle.position.copy(topCard.position);
    stackGroup.add(particle);

    gsap.to(particle.position, {
      x: prevCard.position.x,
      y: prevCard.position.y + 0.2,
      z: prevCard.position.z,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        stackGroup.remove(particle);
        particleGeom.dispose();
        particleMat.dispose();
        // Shake parent card with feedback
        gsap.to(prevCard.position, {
          y: prevCard.position.y + 0.15,
          yoyo: true,
          repeat: 1,
          duration: 0.15,
        });
        // Pop the top card
        setTimeout(doPop, 200);
      },
    });
  };

  overlay.querySelector('#btn-nav-push')?.addEventListener('click', doPush);
  overlay.querySelector('#btn-nav-pop')?.addEventListener('click', doPop);
  overlay.querySelector('#btn-nav-root')?.addEventListener('click', doPopRoot);
  overlay.querySelector('#btn-nav-binding')?.addEventListener('click', doBindingReturn);

  return {
    dispose: () => {
      sceneManager.dispose();
      wrapper.remove();
    },
  };
}
