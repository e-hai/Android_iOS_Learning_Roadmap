import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeSceneManager } from '../core/ThreeSceneManager';
import { stages } from '../../data/roadmap-data';
import { deepDivesData } from '../../data/deep-dive-data';
import { i18n } from '../../services/i18n';
import { renderComparisonTable } from '../../components/ComparisonTable';
import { renderArchitectureDiagram } from '../../components/ArchitectureDiagram';

interface PalaceNode {
  mesh: THREE.Mesh;
  haloMesh?: THREE.Mesh;
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

export function renderNeuralConstellationView(
  onSwitchViewMode: (mode: '3d' | 'doc') => void,
  knowledgeMode: 'roadmap' | 'deepdive' = 'roadmap',
  deepDivePlatform: 'android' | 'ios' = 'android',
  onSwitchPlatform?: (platform: 'android' | 'ios') => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'constellation-view-container';

  // 1. Canvas Wrap
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'constellation-canvas-wrap';
  container.appendChild(canvasWrap);

  const sceneManager = new ThreeSceneManager(canvasWrap, {
    cameraPos: [0, 16, 32],
    fov: 45,
    autoRotate: true,
  });

  const { scene, camera } = sceneManager;
  const palaceGroup = new THREE.Group();
  scene.add(palaceGroup);

  // Background Starfield
  const starGeom = new THREE.BufferGeometry();
  const starCount = 450;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 120;
    starPositions[i + 1] = (Math.random() - 0.5) * 120;
    starPositions[i + 2] = (Math.random() - 0.5) * 120;
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.6,
    transparent: true,
    opacity: 0.7,
  });
  const stars = new THREE.Points(starGeom, starMat);
  scene.add(stars);

  // 2. Build 3D Holmes Memory Palace Node Network
  const allNodes: PalaceNode[] = [];

  const lineMatSynapse = new THREE.LineBasicMaterial({
    color: knowledgeMode === 'deepdive' ? (deepDivePlatform === 'android' ? 0x10b981 : 0x0ea5e9) : 0x38bdf8,
    transparent: true,
    opacity: 0.3,
  });
  const lineMatGolden = new THREE.LineBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.35,
  });

  const platformName = deepDivePlatform === 'android' ? 'Android' : 'iOS';
  const platformColor = deepDivePlatform === 'android' ? 0x10b981 : 0x0ea5e9;
  const platformEmissive = deepDivePlatform === 'android' ? 0x047857 : 0x0369a1;

  stages.forEach((stage, sIdx) => {
    const stageAngle = (sIdx / stages.length) * Math.PI * 2;
    const stageRadius = 13.0;
    const hubX = Math.cos(stageAngle) * stageRadius;
    const hubZ = Math.sin(stageAngle) * stageRadius;
    const hubY = Math.sin(sIdx * 0.8) * 1.8;
    const hubPos = new THREE.Vector3(hubX, hubY, hubZ);

    const stageTitle = i18n.t(stage.titleKey);

    // Level 1: Stage Core Hub
    const hubGeom = new THREE.SphereGeometry(0.85, 32, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: knowledgeMode === 'deepdive' ? platformColor : 0x0d9488,
      emissive: knowledgeMode === 'deepdive' ? platformEmissive : 0x042f2e,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.3,
    });
    const hubMesh = new THREE.Mesh(hubGeom, hubMat);
    hubMesh.position.copy(hubPos);
    palaceGroup.add(hubMesh);

    // Dynamic Halo Ring
    const haloGeom = new THREE.RingGeometry(1.15, 1.35, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: knowledgeMode === 'deepdive' ? platformColor : 0x14b8a6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    haloMesh.position.copy(hubPos);
    haloMesh.rotation.x = Math.PI / 2;
    palaceGroup.add(haloMesh);

    allNodes.push({
      mesh: hubMesh,
      haloMesh,
      type: 'stage',
      stageId: stage.id,
      stageTitle,
      isAdv: false,
      title: `${String(stage.number).padStart(2, '0')}. ${stageTitle} · ${knowledgeMode === 'deepdive' ? `${platformName} 进阶` : '对照星核'}`,
      subtitle: `阶段 ${String(stage.number).padStart(2, '0')} 星核`,
      pos: hubPos,
    });

    if (knowledgeMode === 'deepdive') {
      // Deep Dive Mode: Orbiting Single-Platform Deep Dive Module Nodes
      const stageDeepData = deepDivesData[stage.id];
      const modules = stageDeepData ? (deepDivePlatform === 'android' ? stageDeepData.android : stageDeepData.ios) : [];

      modules.forEach((mod, mIdx) => {
        const mAngle = (mIdx / modules.length) * Math.PI * 2 + 0.4;
        const mRadius = 2.8 + mIdx * 0.4;
        const mPos = new THREE.Vector3(
          hubX + Math.cos(mAngle) * mRadius,
          hubY + Math.sin(mAngle * 2) * 0.8,
          hubZ + Math.sin(mAngle) * mRadius
        );

        const mGeom = new THREE.DodecahedronGeometry(0.28);
        const mMat = new THREE.MeshStandardMaterial({
          color: platformColor,
          emissive: platformEmissive,
          emissiveIntensity: 0.8,
          roughness: 0.25,
        });
        const mMesh = new THREE.Mesh(mGeom, mMat);
        mMesh.position.copy(mPos);
        palaceGroup.add(mMesh);

        // Connection Line
        const mLineGeom = new THREE.BufferGeometry().setFromPoints([hubPos, mPos]);
        const mLine = new THREE.Line(mLineGeom, lineMatSynapse);
        palaceGroup.add(mLine);

        allNodes.push({
          mesh: mMesh,
          type: 'deepdive',
          stageId: stage.id,
          stageTitle,
          isAdv: false,
          title: `【${mod.tag}】${mod.title}`,
          subtitle: `${platformName} 底层机制专题`,
          noteTag: mod.tag,
          explanation: mod.explanation,
          codeSnippet: mod.codeSnippet,
          pos: mPos,
        });
      });
    } else {
      // Roadmap Mode: Concept Orbit Nodes & Golden Spark Nodes
      const topRows = stage.rows.slice(0, 4);
      topRows.forEach((row, rIdx) => {
        const cAngle = (rIdx / topRows.length) * Math.PI * 2 + 0.3;
        const cRadius = 2.4;
        const cPos = new THREE.Vector3(
          hubX + Math.cos(cAngle) * cRadius,
          hubY + 0.8 + Math.sin(cAngle) * 0.4,
          hubZ + Math.sin(cAngle) * cRadius
        );

        const cGeom = new THREE.SphereGeometry(0.22, 16, 16);
        const cMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.6,
          roughness: 0.3,
        });
        const cMesh = new THREE.Mesh(cGeom, cMat);
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
          subtitle: '核心语法对照',
          androidCode: row.android,
          iosCode: row.ios,
          explanation: i18n.t(row.note || 'detail.col.android'),
          pos: cPos,
        });
      });

      stage.noteKeys.forEach((noteKey, nIdx) => {
        const gAngle = (nIdx / stage.noteKeys.length) * Math.PI * 2 - 0.5;
        const gRadius = 3.6;
        const gPos = new THREE.Vector3(
          hubX + Math.cos(gAngle) * gRadius,
          hubY - 0.7 + Math.sin(gAngle) * 0.3,
          hubZ + Math.sin(gAngle) * gRadius
        );

        const gGeom = new THREE.DodecahedronGeometry(0.18);
        const gMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          emissive: 0xd97706,
          emissiveIntensity: 0.9,
          roughness: 0.1,
        });
        const gMesh = new THREE.Mesh(gGeom, gMat);
        gMesh.position.copy(gPos);
        palaceGroup.add(gMesh);

        const gLineGeom = new THREE.BufferGeometry().setFromPoints([hubPos, gPos]);
        const gLine = new THREE.Line(gLineGeom, lineMatGolden);
        palaceGroup.add(gLine);

        const noteText = i18n.t(noteKey);
        const tagMatch = noteText.match(/^【([^】]+)】\s*(.*)$/) || noteText.match(/^\[([^\]]+)\]\s*(.*)$/);
        const tag = tagMatch ? tagMatch[1] : '避坑秘籍';
        const body = tagMatch ? tagMatch[2] : noteText;

        allNodes.push({
          mesh: gMesh,
          type: 'spark',
          stageId: stage.id,
          stageTitle,
          isAdv: false,
          title: `【${tag}】`,
          subtitle: '黄金避坑灵光',
          noteTag: tag,
          noteBody: body,
          pos: gPos,
        });
      });
    }
  });

  // Inter-Stage Macro Constellation Beams
  for (let i = 0; i < stages.length; i++) {
    const nextIdx = (i + 1) % stages.length;
    const p1 = allNodes.find((n) => n.type === 'stage' && n.stageId === stages[i].id)?.pos;
    const p2 = allNodes.find((n) => n.type === 'stage' && n.stageId === stages[nextIdx].id)?.pos;
    if (p1 && p2) {
      const beamGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const beamMat = new THREE.LineDashedMaterial({
        color: knowledgeMode === 'deepdive' ? platformColor : 0x0d9488,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.35,
      });
      const beam = new THREE.Line(beamGeom, beamMat);
      beam.computeLineDistances();
      palaceGroup.add(beam);
    }
  }

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
          <span>${isDeepDive ? `单端深度进阶 · ${platformName} 3D 星云` : 'Android ⟷ iOS 3D 认知星云'}</span>
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

  // 4. Legend HUD in bottom-left
  const legend = document.createElement('div');
  legend.className = 'palace-legend-hud';
  legend.innerHTML = `
    <div class="legend-item">
      <span class="legend-dot" style="background:${isDeepDive ? (deepDivePlatform === 'android' ? '#10b981' : '#0ea5e9') : '#0d9488'};box-shadow:0 0 6px ${isDeepDive ? (deepDivePlatform === 'android' ? '#10b981' : '#0ea5e9') : '#0d9488'};"></span>
      <span>${isDeepDive ? `${platformName} 阶段星核` : '阶段对照星核'}</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot" style="background:${isDeepDive ? (deepDivePlatform === 'android' ? '#34d399' : '#38bdf8') : '#38bdf8'};"></span>
      <span>${isDeepDive ? '底层机制 / 性能调优专题' : '核心语法对标突触'}</span>
    </div>
  `;
  container.appendChild(legend);

  // 5. Floating Hover Tooltip (Anchor above hovered node)
  const hoverTooltip = document.createElement('div');
  hoverTooltip.className = 'palace-hover-tooltip';
  container.appendChild(hoverTooltip);

  // 6. Holographic Detail Lens (Bottom-right focus HUD)
  const hudLens = document.createElement('div');
  hudLens.className = 'palace-hud-lens';
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
    const meshes = allNodes.map((n) => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const node = allNodes.find((n) => n.mesh === hitMesh);
      if (node && node !== hoveredNode) {
        hoveredNode = node;
        document.body.style.cursor = 'pointer';

        // Update Floating Tooltip
        const tagText = node.noteTag ? `【${node.noteTag}】` : '';
        hoverTooltip.innerHTML = `
          <div class="tooltip-header">
            <span class="tooltip-badge ${node.type}">${node.subtitle || '认知节点'}</span>
          </div>
          <div class="tooltip-title">${tagText}${escapeHtml(node.title)}</div>
        `;
        hoverTooltip.classList.add('visible');

        // Scale up node mesh slightly
        gsap.to(node.mesh.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.2 });
      }
    } else {
      if (hoveredNode) {
        gsap.to(hoveredNode.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
        hoveredNode = null;
        document.body.style.cursor = 'default';
        hoverTooltip.classList.remove('visible');
      }
    }

    if (hoveredNode) {
      const wp = new THREE.Vector3();
      hoveredNode.mesh.getWorldPosition(wp);
      const sp = wp.project(camera);
      const sx = ((sp.x + 1) * rect.width) / 2;
      const sy = ((-sp.y + 1) * rect.height) / 2;

      hoverTooltip.style.left = `${sx}px`;
      hoverTooltip.style.top = `${sy - 32}px`;
    }
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

    gsap.to(camera.position, {
      x: finalCamPos.x,
      y: finalCamPos.y,
      z: finalCamPos.z,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (sceneManager.controls) {
          sceneManager.controls.target.copy(targetPos);
          sceneManager.controls.update();
        }
      },
      onComplete: () => {
        showHudDetail(targetNode);
      },
    });
  };

  const onClick = () => {
    if (hoveredNode) {
      flyToNode(hoveredNode);
    }
  };

  canvasWrap.addEventListener('mousemove', onMouseMove);
  canvasWrap.addEventListener('click', onClick);

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
  let isSpinning = true;
  const spinBtn = topBar.querySelector('#btn-toggle-spin');
  spinBtn?.addEventListener('click', () => {
    isSpinning = !isSpinning;
    if (sceneManager.controls) {
      sceneManager.controls.autoRotate = isSpinning;
    }
    spinBtn.classList.toggle('active', isSpinning);
  });

  topBar.querySelector('#btn-reset-cam')?.addEventListener('click', () => {
    hudLens.classList.remove('active');
    sceneManager.resetCamera([0, 16, 32], [0, 0, 0]);
  });

  const themeBtn = topBar.querySelector('#btn-theme-toggle') as HTMLButtonElement;
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('learning_cockpit_theme', nextTheme);
  });

  // 9. Animation Loop
  let time = 0;
  setInterval(() => {
    time += 0.015;

    // Starfield rotation
    stars.rotation.y += 0.0003;

    // Gentle Node Pulse & Halo Rotation
    allNodes.forEach((n, idx) => {
      if (n.haloMesh) {
        n.haloMesh.rotation.y += 0.015;
        n.haloMesh.rotation.z += 0.008;
      }
      n.mesh.position.y = n.pos.y + Math.sin(time * 2 + idx) * 0.04;
    });
  }, 16);

  return container;
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
