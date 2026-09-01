import * as THREE from 'three';
import { ThreeSceneManager } from '../core/ThreeSceneManager';
import { stages } from '../../data/roadmap-data';
import { deepDiveDomains } from '../../data/deep-dive-data';
import { i18n } from '../../services/i18n';
import { renderComparisonTable } from '../../components/ComparisonTable';
import { renderArchitectureDiagram } from '../../components/ArchitectureDiagram';

interface PalaceNode {
  mesh: THREE.Mesh;
  haloMesh?: THREE.Mesh;
  glowMesh?: THREE.Mesh;
  labelSprite?: THREE.Sprite;
  type: 'stage' | 'concept' | 'spark' | 'deepdive';
  stageId: string;
  stageTitle: string;
  isAdv: boolean;
  title: string;
  subtitle?: string;
  androidCode?: string;
  iosCode?: string;
  explanation?: string;
  noteTag?: string;
  noteBody?: string;
  codeSnippet?: string;
  pos: THREE.Vector3;
}

export interface NeuralConstellationView {
  element: HTMLElement;
  knowledgeKey: string;
  pause: () => void;
  resume: () => void;
  dispose: () => void;
}

type Vec3Tween = {
  object: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  duration: number;
  elapsed: number;
  ease: (t: number) => number;
  onUpdate?: () => void;
  onComplete?: () => void;
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}


function createRoomLabelSprite(title: string, accentHex: string, isDark: boolean): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Soft plate — room placard for memory palace navigation
  const plateW = 480;
  const plateH = 64;
  const plateX = (canvas.width - plateW) / 2;
  const plateY = (canvas.height - plateH) / 2;
  ctx.fillStyle = isDark ? 'rgba(8, 15, 30, 0.72)' : 'rgba(255, 255, 255, 0.82)';
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(plateX, plateY, plateW, plateH, 18);
  } else {
    ctx.rect(plateX, plateY, plateW, plateH);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
  ctx.font = '700 36px "Segoe UI", "PingFang SC", "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = title.length > 14 ? `${title.slice(0, 14)}…` : title;
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0.92,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.6, 0.9, 1);
  return sprite;
}

export function renderNeuralConstellationView(
  onSwitchViewMode: (mode: '3d' | 'doc') => void,
  knowledgeMode: 'roadmap' | 'deepdive' = 'roadmap',
  deepDivePlatform: 'android' | 'ios' = 'android',
  onSwitchPlatform?: (platform: 'android' | 'ios') => void
): NeuralConstellationView {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = document.createElement('div');
  container.className = 'constellation-view-container';

  // 1. Canvas Wrap
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'constellation-canvas-wrap';
  canvasWrap.tabIndex = 0;
  canvasWrap.setAttribute('role', 'application');
  canvasWrap.setAttribute('aria-label', '3D 记忆宫殿星云。可拖动旋转、滚轮缩放；每个主星核是一座知识殿堂，点击进入房间。完整内容也可在文档模式中访问。');
  container.appendChild(canvasWrap);

  const sceneManager = new ThreeSceneManager(canvasWrap, {
    cameraPos: [0, 16, 32],
    fov: 45,
    autoRotate: !prefersReducedMotion,
  });

  const { scene, camera } = sceneManager;
  const palaceGroup = new THREE.Group();
  scene.add(palaceGroup);

  const activeTweens: Vec3Tween[] = [];
  const tweenFrom = new WeakMap<object, { x: number; y: number; z: number }>();

  const killTweensOf = (object: { x: number; y: number; z: number }) => {
    for (let i = activeTweens.length - 1; i >= 0; i--) {
      if (activeTweens[i].object === object) activeTweens.splice(i, 1);
    }
  };

  const tweenTo = (
    object: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    duration: number,
    ease: (t: number) => number,
    onUpdate?: () => void,
    onComplete?: () => void,
  ) => {
    killTweensOf(object);
    tweenFrom.set(object, { x: object.x, y: object.y, z: object.z });
    activeTweens.push({ object, to, duration, elapsed: 0, ease, onUpdate, onComplete });
  };

  const updateTweens = (delta: number) => {
    for (let i = activeTweens.length - 1; i >= 0; i--) {
      const tw = activeTweens[i];
      const from = tweenFrom.get(tw.object);
      if (!from) {
        activeTweens.splice(i, 1);
        continue;
      }
      tw.elapsed += delta;
      const t = Math.min(1, tw.elapsed / tw.duration);
      const e = tw.ease(t);
      tw.object.x = from.x + (tw.to.x - from.x) * e;
      tw.object.y = from.y + (tw.to.y - from.y) * e;
      tw.object.z = from.z + (tw.to.z - from.z) * e;
      tw.onUpdate?.();
      if (t >= 1) {
        activeTweens.splice(i, 1);
        tw.onComplete?.();
      }
    }
  };


  // 1. Memory-palace atmosphere: fog + layered starfield
  const isDarkTheme = sceneManager.theme.isDark;
  scene.fog = new THREE.FogExp2(isDarkTheme ? 0x070d1a : 0xdbe4f0, isDarkTheme ? 0.016 : 0.011);

  const starCount = 160;
  const starGeom = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const radius = 28 + Math.random() * 70;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
    starPositions[i * 3 + 2] = radius * Math.cos(phi);
    const tint = 0.72 + Math.random() * 0.28;
    starColors[i * 3] = tint * (isDarkTheme ? 0.72 : 0.5);
    starColors[i * 3 + 1] = tint * (isDarkTheme ? 0.86 : 0.68);
    starColors[i * 3 + 2] = tint;
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.55,
    vertexColors: true,
    transparent: true,
    opacity: isDarkTheme ? 0.55 : 0.32,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeom, starMat);
  scene.add(stars);

  // 2. Build 3D Memory Palace Node Network
  const allNodes: PalaceNode[] = [];
  const raycastMeshes: THREE.Object3D[] = [];

  const lineMatSynapse = new THREE.LineBasicMaterial({
    color: knowledgeMode === 'deepdive' ? (deepDivePlatform === 'android' ? 0x10b981 : 0x0ea5e9) : 0x38bdf8,
    transparent: true,
    opacity: 0.22,
  });
  const lineMatGolden = new THREE.LineBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.25,
  });

  const platformName = deepDivePlatform === 'android' ? 'Android' : 'iOS';
  const platformColor = deepDivePlatform === 'android' ? 0x10b981 : 0x0ea5e9;
  // Shared low-poly assets — avoid per-node geometry/material allocation
  const geoHubLarge = new THREE.SphereGeometry(1.0, 12, 12);
  const geoHub = new THREE.SphereGeometry(0.85, 12, 12);
  const geoHaloLarge = new THREE.RingGeometry(1.35, 1.5, 24);
  const geoHalo = new THREE.RingGeometry(1.15, 1.3, 24);
  const geoConcept = new THREE.SphereGeometry(0.22, 8, 8);
  const geoModule = new THREE.DodecahedronGeometry(0.28, 0);
  const geoSpark = new THREE.OctahedronGeometry(0.18);
  const matHub = new THREE.MeshBasicMaterial({ color: platformColor });
  const matHubRoadmap = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
  const matHalo = new THREE.MeshBasicMaterial({ color: platformColor, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
  const matHaloRoadmap = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
  const matConcept = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const matModule = new THREE.MeshBasicMaterial({ color: platformColor });
  const matSpark = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  // Soft bloom stand-ins (shared) — keep MeshBasic to stay cheap
  const geoGlowLarge = new THREE.SphereGeometry(1.85, 12, 12);
  const geoGlow = new THREE.SphereGeometry(1.55, 12, 12);
  const matGlow = new THREE.MeshBasicMaterial({
    color: knowledgeMode === 'deepdive' ? platformColor : 0x38bdf8,
    transparent: true,
    opacity: isDarkTheme ? 0.16 : 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const accentCss = '#' + (knowledgeMode === 'deepdive' ? platformColor : 0x38bdf8).toString(16).padStart(6, '0');

  // Central locus — the palace entrance / mental origin
  const locusCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshBasicMaterial({ color: knowledgeMode === 'deepdive' ? platformColor : 0x5eead4 }),
  );
  palaceGroup.add(locusCore);
  const locusGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 12, 12),
    new THREE.MeshBasicMaterial({
      color: knowledgeMode === 'deepdive' ? platformColor : 0x2dd4bf,
      transparent: true,
      opacity: isDarkTheme ? 0.18 : 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  palaceGroup.add(locusGlow);

  // Orbit ring — suggests walking a palace corridor in a circle
  const orbitRing = new THREE.Mesh(
    new THREE.RingGeometry(
      knowledgeMode === 'deepdive' ? 9.4 : 12.4,
      knowledgeMode === 'deepdive' ? 10.6 : 13.6,
      64,
    ),
    new THREE.MeshBasicMaterial({
      color: knowledgeMode === 'deepdive' ? platformColor : 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDarkTheme ? 0.14 : 0.1,
      depthWrite: false,
    }),
  );
  orbitRing.rotation.x = -Math.PI / 2;
  orbitRing.position.y = -2.4;
  palaceGroup.add(orbitRing);

  // Soft dust motes near the palace plane
  const dustCount = 40;
  const dustGeom = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 42;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 42;
  }
  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeom,
    new THREE.PointsMaterial({
      size: 3.8,
      color: knowledgeMode === 'deepdive' ? platformColor : 0x38bdf8,
      transparent: true,
      opacity: isDarkTheme ? 0.07 : 0.045,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  );
  scene.add(dust);

  const decorateStageRoom = (
    _hubMesh: THREE.Mesh,
    _haloMesh: THREE.Mesh,
    hubPos: THREE.Vector3,
    roomTitle: string,
    large: boolean,
  ) => {
    const glowMesh = new THREE.Mesh(large ? geoGlowLarge : geoGlow, matGlow);
    glowMesh.position.copy(hubPos);
    palaceGroup.add(glowMesh);

    const labelSprite = createRoomLabelSprite(roomTitle, accentCss, isDarkTheme);
    labelSprite.position.set(hubPos.x, hubPos.y + (large ? 2.15 : 1.9), hubPos.z);
    palaceGroup.add(labelSprite);

    return { glowMesh, labelSprite };
  };

  if (knowledgeMode === 'deepdive') {
    // 5 Industrial Domains in Deep Dive Mode
    deepDiveDomains.forEach((domain, sIdx) => {
      const stageAngle = (sIdx / deepDiveDomains.length) * Math.PI * 2;
      const stageRadius = 10.0;
      const hubX = Math.cos(stageAngle) * stageRadius;
      const hubZ = Math.sin(stageAngle) * stageRadius;
      const hubY = Math.sin(sIdx * 1.2) * 1.2;
      const hubPos = new THREE.Vector3(hubX, hubY, hubZ);

      const domainTitle = i18n.t(domain.titleKey);

      // Level 1: Domain Star Core (Clean, High-legibility Sphere)
      const hubMesh = new THREE.Mesh(geoHubLarge, matHub);
      hubMesh.position.copy(hubPos);
      palaceGroup.add(hubMesh);

      // Clean Halo Ring
      const haloMesh = new THREE.Mesh(geoHaloLarge, matHalo);
      haloMesh.position.copy(hubPos);
      haloMesh.rotation.x = Math.PI / 2;
      palaceGroup.add(haloMesh);

      const room = decorateStageRoom(hubMesh, haloMesh, hubPos, domainTitle, true);

      allNodes.push({
        mesh: hubMesh,
        haloMesh,
        glowMesh: room.glowMesh,
        labelSprite: room.labelSprite,
        type: 'stage',
        stageId: domain.id,
        stageTitle: domainTitle,
        isAdv: false,
        title: `${domainTitle} · ${platformName} 殿堂`,
        subtitle: `记忆殿堂 ${String(domain.number).padStart(2, '0')}`,
        pos: hubPos,
      });

      // Orbiting Single-Platform Deep Dive Module Nodes
      const modules = deepDivePlatform === 'android' ? domain.deepDive.android : domain.deepDive.ios;

      modules.forEach((mod, mIdx) => {
        const mAngle = (mIdx / modules.length) * Math.PI * 2 + 0.4;
        const mRadius = 2.8 + mIdx * 0.25;
        const mPos = new THREE.Vector3(
          hubX + Math.cos(mAngle) * mRadius,
          hubY + Math.sin(mAngle * 2) * 0.7,
          hubZ + Math.sin(mAngle) * mRadius
        );

        const mMesh = new THREE.Mesh(geoModule, matModule);
        mMesh.position.copy(mPos);
        palaceGroup.add(mMesh);

        // Connection Line
        const mLineGeom = new THREE.BufferGeometry().setFromPoints([hubPos, mPos]);
        const mLine = new THREE.Line(mLineGeom, lineMatSynapse);
        palaceGroup.add(mLine);

        allNodes.push({
          mesh: mMesh,
          type: 'deepdive',
          stageId: domain.id,
          stageTitle: domainTitle,
          isAdv: false,
          title: `【${mod.tag}】${mod.title}`,
          subtitle: `${platformName} 底层专题`,
          noteTag: mod.tag,
          explanation: mod.explanation,
          codeSnippet: mod.codeSnippet,
          pos: mPos,
        });
      });
    });
  } else {
    // 16 Stages in Dual-Platform Roadmap Mode
    stages.forEach((stage, sIdx) => {
      const stageAngle = (sIdx / stages.length) * Math.PI * 2;
      const stageRadius = 13.0;
      const hubX = Math.cos(stageAngle) * stageRadius;
      const hubZ = Math.sin(stageAngle) * stageRadius;
      const hubY = Math.sin(sIdx * 0.8) * 1.5;
      const hubPos = new THREE.Vector3(hubX, hubY, hubZ);

      const stageTitle = i18n.t(stage.titleKey);

      // Level 1: Stage Core Hub
      const hubMesh = new THREE.Mesh(geoHub, matHubRoadmap);
      hubMesh.position.copy(hubPos);
      palaceGroup.add(hubMesh);

      // Dynamic Halo Ring
      const haloMesh = new THREE.Mesh(geoHalo, matHaloRoadmap);
      haloMesh.position.copy(hubPos);
      haloMesh.rotation.x = Math.PI / 2;
      palaceGroup.add(haloMesh);

      const room = decorateStageRoom(hubMesh, haloMesh, hubPos, stageTitle, false);

      allNodes.push({
        mesh: hubMesh,
        haloMesh,
        glowMesh: room.glowMesh,
        labelSprite: room.labelSprite,
        type: 'stage',
        stageId: stage.id,
        stageTitle,
        isAdv: false,
        title: `${stageTitle} · 双端殿堂`,
        subtitle: `记忆殿堂 ${String(stage.number).padStart(2, '0')}`,
        pos: hubPos,
      });

      // Roadmap Mode: Concept Orbit Nodes & Golden Spark Nodes
      const topRows = stage.rows.slice(0, 4);
      topRows.forEach((row, rIdx) => {
        const cAngle = (rIdx / topRows.length) * Math.PI * 2 + 0.3;
        const cRadius = 2.4;
        const cPos = new THREE.Vector3(
          hubX + Math.cos(cAngle) * cRadius,
          hubY + 0.7 + Math.sin(cAngle) * 0.4,
          hubZ + Math.sin(cAngle) * cRadius
        );

        const cMesh = new THREE.Mesh(geoConcept, matConcept);
        cMesh.position.copy(cPos);
        palaceGroup.add(cMesh);

        const cLineGeom = new THREE.BufferGeometry().setFromPoints([hubPos, cPos]);
        const cLine = new THREE.Line(cLineGeom, lineMatSynapse);
        palaceGroup.add(cLine);

        allNodes.push({
          mesh: cMesh,
          type: 'concept',
          stageId: stage.id,
          stageTitle,
          isAdv: false,
          title: `${row.android.split('(')[0].trim()} ⟷ ${row.ios.split('(')[0].trim()}`,
          subtitle: '语法对照突触',
          androidCode: row.android,
          iosCode: row.ios,
          explanation: i18n.t(row.note || 'detail.col.android'),
          pos: cPos,
        });
      });

      stage.noteKeys.forEach((noteKey, nIdx) => {
        const gAngle = (nIdx / stage.noteKeys.length) * Math.PI * 2 - 0.5;
        const gRadius = 3.5;
        const gPos = new THREE.Vector3(
          hubX + Math.cos(gAngle) * gRadius,
          hubY - 0.6 + Math.cos(gAngle) * 0.35,
          hubZ + Math.sin(gAngle) * gRadius
        );

        const gMesh = new THREE.Mesh(geoSpark, matSpark);
        gMesh.position.copy(gPos);
        palaceGroup.add(gMesh);

        const gLineGeom = new THREE.BufferGeometry().setFromPoints([hubPos, gPos]);
        const gLine = new THREE.Line(gLineGeom, lineMatGolden);
        palaceGroup.add(gLine);

        const noteText = i18n.t(noteKey);
        const tagMatch = noteText.match(/^【([^】]+)】\s*(.*)$/) || noteText.match(/^\[([^\]]+)\]\s*(.*)$/);
        const tag = tagMatch ? tagMatch[1] : '双端避坑';
        const body = tagMatch ? tagMatch[2] : noteText;

        allNodes.push({
          mesh: gMesh,
          type: 'spark',
          stageId: stage.id,
          stageTitle,
          isAdv: false,
          title: `【${tag}】${stageTitle}避坑`,
          subtitle: '避坑指南',
          noteTag: tag,
          noteBody: body,
          pos: gPos,
        });
      });
    });
  }

  // Inter-Stage / Inter-Domain Macro Constellation Beams
  const currentList = knowledgeMode === 'deepdive' ? deepDiveDomains : stages;
  for (let i = 0; i < currentList.length; i++) {
    const nextIdx = (i + 1) % currentList.length;
    const p1 = allNodes.find((n) => n.type === 'stage' && n.stageId === currentList[i].id)?.pos;
    const p2 = allNodes.find((n) => n.type === 'stage' && n.stageId === currentList[nextIdx].id)?.pos;
    if (p1 && p2) {
      const beamGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const beamMat = new THREE.LineDashedMaterial({
        color: knowledgeMode === 'deepdive' ? platformColor : 0x0ea5e9,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.25,
      });
      const beam = new THREE.Line(beamGeom, beamMat);
      beam.computeLineDistances();
      palaceGroup.add(beam);
    }
  }

  raycastMeshes.push(...allNodes.map((n) => n.mesh));

  // 3. Unified 3D Mode Top Bar (Dedicated in 3D Mode)
  const isDeepDive = knowledgeMode === 'deepdive';
  const topBar = document.createElement('div');
  topBar.className = 'constellation-top-bar';

  let platformSwitchHtml = '';
  if (isDeepDive) {
    platformSwitchHtml = `
      <div class="header-platform-toggle" style="margin-right:12px;">
        <button class="platform-toggle-btn btn-android ${deepDivePlatform === 'android' ? 'active' : ''}" id="top-btn-android" title="切换为 Android 3D 进阶星云">
          <span class="platform-dot dot-android"></span>
          <span>Android</span>
        </button>
        <button class="platform-toggle-btn btn-ios ${deepDivePlatform === 'ios' ? 'active' : ''}" id="top-btn-ios" title="切换为 iOS 3D 进阶星云">
          <span class="platform-dot dot-ios"></span>
          <span>iOS</span>
        </button>
      </div>
    `;
  }

  topBar.innerHTML = `
    <div class="top-bar-left">
      <div class="constellation-title-group">
        <div class="constellation-brand-badge" style="${isDeepDive ? (deepDivePlatform === 'android' ? 'border-color:#10b981;color:#10b981;' : 'border-color:#0ea5e9;color:#0ea5e9;') : ''}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>${isDeepDive ? `记忆宫殿 · ${platformName} 深度殿堂` : '记忆宫殿 · Android ⟷ iOS 认知星云'}</span>
        </div>
      </div>

      ${platformSwitchHtml}

      <div class="view-mode-toggle">
        <button class="view-mode-btn active" id="btn-mode-3d" title="当前：3D 星云模式">
          🌌 3D 星云
        </button>
        <button class="view-mode-btn" id="btn-mode-doc" title="切换为文档模式">
          📄 文档
        </button>
      </div>
    </div>

    <!-- Right: 3D Tools & Theme -->
    <div class="top-bar-right">
      <label class="constellation-node-picker">
        <span class="sr-only">选择知识节点</span>
        <select id="constellation-node-select" aria-label="选择知识节点">
          <option value="">键盘选择知识节点</option>
        </select>
      </label>
      <button class="tool-pill-btn active" id="btn-toggle-spin" title="切换 3D 星系自转">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        <span>3D 旋转</span>
      </button>
      <button class="tool-pill-btn" id="btn-reset-cam" title="全景视角复位">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        <span>全景</span>
      </button>
      <button class="tool-pill-btn" id="btn-theme-toggle" title="切换主题">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <span>主题</span>
      </button>
    </div>
  `;
  container.appendChild(topBar);
  const nodeSelect = topBar.querySelector<HTMLSelectElement>('#constellation-node-select');
  allNodes.forEach((node, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${node.stageTitle} · ${node.title}`;
    nodeSelect?.appendChild(option);
  });

  // 4. Legend HUD + memory-palace guide in bottom-left
  const legend = document.createElement('div');
  legend.className = 'palace-legend-hud';
  legend.innerHTML = `
    <div class="legend-guide">把每个主星核当作一座房间：先记住位置，再点开装知识。</div>
    <div class="legend-item">
      <span class="legend-dot" style="background:${isDeepDive ? (deepDivePlatform === 'android' ? '#10b981' : '#0ea5e9') : '#0d9488'};box-shadow:0 0 6px ${isDeepDive ? (deepDivePlatform === 'android' ? '#10b981' : '#0ea5e9') : '#0d9488'};"></span>
      <span>${isDeepDive ? `${platformName} 殿堂主星核` : '殿堂主星核（房间）'}</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot" style="background:${isDeepDive ? (deepDivePlatform === 'android' ? '#34d399' : '#38bdf8') : '#38bdf8'};"></span>
      <span>${isDeepDive ? '房间内专题展柜' : '房间内概念展柜'}</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot" style="background:#f59e0b;box-shadow:0 0 6px #f59e0b;"></span>
      <span>${isDeepDive ? '关键路径 / 避坑灯标' : '避坑灯标（金色）'}</span>
    </div>
  `;
  container.appendChild(legend);

  const guideTip = document.createElement('div');
  guideTip.className = 'palace-guide-tip';
  guideTip.innerHTML = `
    <strong>记忆宫殿用法</strong>
    <span>中心是入口 · 圆环是回廊 · 主星核是房间 · 点击房间开始存放对照知识</span>
  `;
  container.appendChild(guideTip);
  const pendingTimers: number[] = [];
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      const index = pendingTimers.indexOf(id);
      if (index >= 0) pendingTimers.splice(index, 1);
      fn();
    }, ms);
    pendingTimers.push(id);
  };
  later(() => guideTip.classList.add('is-visible'), 80);
  later(() => guideTip.classList.add('is-fading'), prefersReducedMotion ? 1200 : 5200);

  // 5. Floating Hover Tooltip (Anchored above hovered star core in 3D space)
  const hoverTooltip = document.createElement('div');
  hoverTooltip.className = 'constellation-node-anchor-tooltip';
  canvasWrap.appendChild(hoverTooltip);

  // 6. Holographic Detail Lens (Bottom-right focus HUD)
  const hudLens = document.createElement('div');
  hudLens.className = 'palace-hud-lens';
  hudLens.setAttribute('role', 'region');
  hudLens.setAttribute('aria-live', 'polite');
  hudLens.setAttribute('aria-label', '知识节点详情');
  container.appendChild(hudLens);

  // 7. Raycasting & Interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredNode: PalaceNode | null = null;

  const onMouseMove = (e: MouseEvent) => {
    const rect = canvasWrap.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(raycastMeshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const node = allNodes.find((n) => n.mesh === hitMesh);
      if (node && node !== hoveredNode) {
        if (hoveredNode) {
          tweenTo(hoveredNode.mesh.scale, { x: 1, y: 1, z: 1 }, 0.18, easeOutQuad);
        }
        hoveredNode = node;
        document.body.style.cursor = 'pointer';

        // Update Floating Tooltip Content
        const tagText = node.noteTag ? `【${node.noteTag}】` : '';
        hoverTooltip.innerHTML = `
          <span class="anchor-tooltip-tag">${node.subtitle || '阶段星核'}</span>
          <span class="anchor-tooltip-title">${tagText}${escapeHtml(node.title)}</span>
        `;
        hoverTooltip.classList.add('visible');

        // Scale up node mesh slightly
        tweenTo(node.mesh.scale, { x: 1.35, y: 1.35, z: 1.35 }, 0.18, easeOutQuad);
      }
    } else {
      if (hoveredNode) {
        tweenTo(hoveredNode.mesh.scale, { x: 1, y: 1, z: 1 }, 0.18, easeOutQuad);
        hoveredNode = null;
        document.body.style.cursor = 'default';
        hoverTooltip.classList.remove('visible');
      }
    }
  };

  const onMouseLeave = () => {
    if (hoveredNode) {
      tweenTo(hoveredNode.mesh.scale, { x: 1, y: 1, z: 1 }, 0.18, easeOutQuad);
      hoveredNode = null;
    }
    document.body.style.cursor = '';
    hoverTooltip.classList.remove('visible');
  };

  const showHudDetail = (node: PalaceNode) => {
    let contentHtml = '';

    if (node.type === 'stage') {
      contentHtml = `
        <div class="hud-lens-header">
          <div>
            <div class="hud-lens-badge">
              <span>🌌 阶段主星核 · ${node.stageTitle}</span>
            </div>
            <h3 class="hud-lens-title">${node.title}</h3>
          </div>
          <button class="btn-ghost" id="btn-close-hud" style="padding:4px;" title="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="hud-lens-body">
          <div id="hud-diagram-mount"></div>
          <div id="hud-table-mount"></div>
        </div>
        <div class="hud-lens-footer">
          <span style="font-size:11.5px;color:var(--color-ink-muted);">点击周围子节点探索深度代码与原理</span>
        </div>
      `;
    } else if (node.type === 'deepdive') {
      // Single Platform Deep Dive Node
      const langLabel = deepDivePlatform === 'android'
        ? (node.codeSnippet && node.codeSnippet.startsWith('#') ? 'TERMINAL' : 'KOTLIN / GRADLE')
        : (node.codeSnippet && (node.codeSnippet.startsWith('(') || node.codeSnippet.startsWith('xcrun') || node.codeSnippet.startsWith('codesign')) ? 'TERMINAL / LLDB' : 'SWIFT');

      let snippetHtml = '';
      if (node.codeSnippet) {
        snippetHtml = `
          <div class="deep-dive-code-block" style="margin-top:12px;">
            <div class="code-block-header">
              <span class="code-block-lang">${langLabel}</span>
              <button class="code-copy-btn" id="btn-copy-hud-code" title="复制代码">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>复制</span>
              </button>
            </div>
            <pre class="deep-dive-pre"><code>${escapeHtml(node.codeSnippet)}</code></pre>
          </div>
        `;
      }

      contentHtml = `
        <div class="hud-lens-header">
          <div>
            <div class="hud-lens-badge" style="${deepDivePlatform === 'android' ? 'color:#10b981;' : 'color:#0ea5e9;'}">
              <span>【${node.noteTag || '底层机制'}】${platformName} 深度进阶 · ${node.stageTitle}</span>
            </div>
            <h3 class="hud-lens-title">${node.title}</h3>
          </div>
          <button class="btn-ghost" id="btn-close-hud" style="padding:4px;" title="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="hud-lens-body">
          <div style="font-size:13.5px;line-height:1.65;color:var(--color-ink);margin-bottom:8px;">
            ${node.explanation || ''}
          </div>
          ${snippetHtml}
        </div>
        <div class="hud-lens-footer">
          <button class="btn btn-secondary btn-sm" id="btn-hud-focus-parent">
            <span>🔍 聚焦父星核 (${node.stageTitle})</span>
          </button>
        </div>
      `;
    } else if (node.type === 'concept') {
      contentHtml = `
        <div class="hud-lens-header">
          <div>
            <div class="hud-lens-badge" style="color:var(--color-ios);">
              <span>🎯 核心概念突触 · ${node.stageTitle}</span>
            </div>
            <h3 class="hud-lens-title">${node.title}</h3>
          </div>
          <button class="btn-ghost" id="btn-close-hud" style="padding:4px;" title="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="hud-lens-body">
          <div class="hud-concept-card">
            <div class="hud-row-target">
              <span class="hud-tag-android">🟢 Android 实现:</span>
            </div>
            <div class="hud-code-snippet">${escapeHtml(node.androidCode || '')}</div>
          </div>
          <div class="hud-concept-card">
            <div class="hud-row-target">
              <span class="hud-tag-ios">🔵 iOS / SwiftUI 对标:</span>
            </div>
            <div class="hud-code-snippet">${escapeHtml(node.iosCode || '')}</div>
          </div>
          <div style="font-size:13px;line-height:1.55;color:var(--color-ink-secondary);">
            <b>机制解析：</b>${node.explanation || ''}
          </div>
        </div>
        <div class="hud-lens-footer">
          <button class="btn btn-secondary btn-sm" id="btn-hud-focus-parent">
            <span>🔍 聚焦父星核 (${node.stageTitle})</span>
          </button>
        </div>
      `;
    } else {
      // Golden Spark
      contentHtml = `
        <div class="hud-lens-header">
          <div>
            <div class="hud-lens-badge" style="color:#fbbf24;">
              <span>✨ 黄金避坑灵光 · ${node.stageTitle}</span>
            </div>
            <h3 class="hud-lens-title">${node.title}</h3>
          </div>
          <button class="btn-ghost" id="btn-close-hud" style="padding:4px;" title="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="hud-lens-body">
          <div style="background:rgba(251, 191, 36, 0.12);border-left:3px solid #fbbf24;padding:12px;border-radius:6px;font-size:13.5px;line-height:1.6;color:var(--color-ink);">
            ${node.noteBody || node.explanation || ''}
          </div>
        </div>
        <div class="hud-lens-footer">
          <button class="btn btn-secondary btn-sm" id="btn-hud-focus-parent">
            <span>🔍 聚焦父星核 (${node.stageTitle})</span>
          </button>
        </div>
      `;
    }

    hudLens.innerHTML = contentHtml;

    if (node.type === 'stage') {
      const stage = stages.find((s) => s.id === node.stageId);
      if (stage) {
        if (knowledgeMode === 'roadmap') {
          const tableMount = hudLens.querySelector('#hud-table-mount');
          if (tableMount) {
            tableMount.appendChild(
              renderComparisonTable(stage.rows.slice(0, 3), i18n.t('detail.col.android'), i18n.t('detail.col.ios'), false)
            );
          }
        }
        const diagMount = hudLens.querySelector('#hud-diagram-mount');
        if (diagMount) {
          diagMount.appendChild(renderArchitectureDiagram(stage.id, stage.extraHintKey));
        }
      }
    }

    if (node.type === 'deepdive' && node.codeSnippet) {
      const copyBtn = hudLens.querySelector('#btn-copy-hud-code');
      copyBtn?.addEventListener('click', () => {
        navigator.clipboard.writeText(node.codeSnippet || '');
        const span = copyBtn.querySelector('span');
        if (span) {
          const original = span.textContent;
          span.textContent = '已复制 ✓';
          setTimeout(() => { span.textContent = original; }, 2000);
        }
      });
    }

    hudLens.classList.add('active');

    hudLens.querySelector('#btn-close-hud')?.addEventListener('click', () => {
      hudLens.classList.remove('active');
    });

    hudLens.querySelector('#btn-hud-focus-parent')?.addEventListener('click', () => {
      const parentHub = allNodes.find((n) => n.type === 'stage' && n.stageId === node.stageId);
      if (parentHub) flyToNode(parentHub);
    });
  };

  const flyToNode = (targetNode: PalaceNode) => {
    if (sceneManager.controls) {
      sceneManager.controls.autoRotate = false;
    }
    const spinBtn = topBar.querySelector('#btn-toggle-spin');
    spinBtn?.classList.remove('active');

    const targetPos = targetNode.pos.clone();
    const camOffset = targetNode.type === 'stage'
      ? targetPos.clone().normalize().multiplyScalar(5).add(new THREE.Vector3(0, 2, 4))
      : targetPos.clone().normalize().multiplyScalar(3).add(new THREE.Vector3(0, 1.2, 2.5));

    const finalCamPos = targetPos.clone().add(camOffset);

    tweenTo(
      camera.position,
      { x: finalCamPos.x, y: finalCamPos.y, z: finalCamPos.z },
      prefersReducedMotion ? 0.01 : 0.9,
      easeInOutCubic,
      () => {
        if (sceneManager.controls) {
          sceneManager.controls.target.copy(targetPos);
          sceneManager.controls.update();
        }
      },
      () => {
        showHudDetail(targetNode);
      },
    );
  };

  const onClick = () => {
    if (hoveredNode) {
      flyToNode(hoveredNode);
    }
  };

  const onNodeSelect = () => {
    if (!nodeSelect?.value) return;
    const node = allNodes[Number(nodeSelect.value)];
    if (node) flyToNode(node);
  };

  canvasWrap.addEventListener('mousemove', onMouseMove);
  canvasWrap.addEventListener('mouseleave', onMouseLeave);
  canvasWrap.addEventListener('click', onClick);
  nodeSelect?.addEventListener('change', onNodeSelect);

  // 8. Top Bar Event Listeners
  topBar.querySelector('#btn-mode-doc')?.addEventListener('click', () => {
    onSwitchViewMode('doc');
  });

  topBar.querySelector('#top-btn-android')?.addEventListener('click', () => {
    if (onSwitchPlatform) onSwitchPlatform('android');
  });
  topBar.querySelector('#top-btn-ios')?.addEventListener('click', () => {
    if (onSwitchPlatform) onSwitchPlatform('ios');
  });

  // Spin, Reset, and Theme Controls
  let isSpinning = !prefersReducedMotion;
  const spinBtn = topBar.querySelector('#btn-toggle-spin');
  spinBtn?.classList.toggle('active', isSpinning);
  spinBtn?.setAttribute('aria-pressed', String(isSpinning));
  spinBtn?.addEventListener('click', () => {
    isSpinning = !isSpinning;
    if (sceneManager.controls) {
      sceneManager.controls.autoRotate = isSpinning;
    }
    spinBtn.classList.toggle('active', isSpinning);
    spinBtn.setAttribute('aria-pressed', String(isSpinning));
  });

  topBar.querySelector('#btn-reset-cam')?.addEventListener('click', () => {
    hudLens.classList.remove('active');
    sceneManager.resetCamera([0, 16, 32], [0, 0, 0]);
  });

  const applyAtmosphereTheme = () => {
    sceneManager.refreshTheme();
    const dark = sceneManager.theme.isDark;
    scene.fog = new THREE.FogExp2(dark ? 0x070d1a : 0xdbe4f0, dark ? 0.016 : 0.011);
    starMat.opacity = dark ? 0.55 : 0.32;
    const dustMat = dust.material as THREE.PointsMaterial;
    dustMat.opacity = dark ? 0.07 : 0.045;
    matGlow.opacity = dark ? 0.16 : 0.12;
    const locusGlowMat = locusGlow.material as THREE.MeshBasicMaterial;
    locusGlowMat.opacity = dark ? 0.18 : 0.12;
  };

  const pauseView = () => {
    pendingTimers.forEach((id) => window.clearTimeout(id));
    pendingTimers.length = 0;
    hoveredNode = null;
    hoverTooltip.classList.remove('visible');
    hudLens.classList.remove('active');
    document.body.style.cursor = '';
    sceneManager.pause();
  };

  const resumeView = () => {
    applyAtmosphereTheme();
    sceneManager.resume();
  };

  const themeBtn = topBar.querySelector('#btn-theme-toggle') as HTMLButtonElement;
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('learning_cockpit_theme', nextTheme);
    applyAtmosphereTheme();
  });

  // 9. Synchronized 3D Animation & Real-Time Star Core Tooltip Tracking
  sceneManager.onTickCallback = (delta, time) => {
    updateTweens(delta);
    if (!prefersReducedMotion) {
      // Subtle star / dust drift
      stars.rotation.y += 0.00012;
      dust.rotation.y -= 0.00008;
      locusCore.rotation.y += 0.004;
      locusGlow.scale.setScalar(1 + Math.sin(time * 1.4) * 0.08);

      // Gentle room floating, halo spin, glow pulse
      allNodes.forEach((n, idx) => {
        if (n.type !== 'stage') return;
        const bob = Math.sin(time * 1.15 + idx) * 0.03;
        n.mesh.position.y = n.pos.y + bob;
        if (n.haloMesh) {
          n.haloMesh.position.y = n.pos.y + bob;
          n.haloMesh.rotation.z += 0.004;
        }
        if (n.glowMesh) {
          n.glowMesh.position.y = n.pos.y + bob;
          const pulse = 1 + Math.sin(time * 1.6 + idx * 0.7) * 0.08;
          n.glowMesh.scale.setScalar(pulse);
        }
        if (n.labelSprite) {
          n.labelSprite.position.y = n.pos.y + bob + 2.0;
        }
      });
    }

    // Real-Time Tooltip Anchor Tracking (Directly above the hovered 3D star core)
    if (hoveredNode) {
      const wp = new THREE.Vector3();
      hoveredNode.mesh.getWorldPosition(wp);
      const sp = wp.project(camera);

      // Check if star core is within camera frustum and facing camera
      if (sp.z > 1) {
        hoverTooltip.classList.remove('visible');
      } else {
        const rect = canvasWrap.getBoundingClientRect();
        const sx = ((sp.x + 1) * rect.width) / 2;
        const sy = ((-sp.y + 1) * rect.height) / 2;

        hoverTooltip.style.left = `${sx}px`;
        hoverTooltip.style.top = `${sy}px`;
        hoverTooltip.classList.add('visible');
      }
    }
  };

  return {
    element: container,
    knowledgeKey: `${knowledgeMode}:${deepDivePlatform}`,
    pause: pauseView,
    resume: resumeView,
    dispose: () => {
      pauseView();
      killTweensOf(camera.position);
      allNodes.forEach((node) => killTweensOf(node.mesh.scale));
      canvasWrap.removeEventListener('mousemove', onMouseMove);
      canvasWrap.removeEventListener('mouseleave', onMouseLeave);
      canvasWrap.removeEventListener('click', onClick);
      nodeSelect?.removeEventListener('change', onNodeSelect);
      sceneManager.onTickCallback = undefined;
      sceneManager.dispose();
    },
  };
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
