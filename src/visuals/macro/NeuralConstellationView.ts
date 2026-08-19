import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeSceneManager } from '../core/ThreeSceneManager';
import { stages } from '../../data/roadmap-data';
import { i18n } from '../../services/i18n';
import { renderComparisonTable } from '../../components/ComparisonTable';
import { renderArchitectureDiagram } from '../../components/ArchitectureDiagram';

interface PalaceNode {
  mesh: THREE.Mesh;
  haloMesh?: THREE.Mesh;
  type: 'stage' | 'concept' | 'spark';
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
  pos: THREE.Vector3;
}

export function renderNeuralConstellationView(
  onSwitchViewMode: (mode: '3d' | 'doc') => void
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
    starPositions[i] = (Math.random() - 0.5) * 80;
    starPositions[i + 1] = (Math.random() - 0.5) * 60;
    starPositions[i + 2] = (Math.random() - 0.5) * 80;
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: sceneManager.theme.isDark ? 0x64748b : 0x94a3b8,
    size: 0.18,
    transparent: true,
    opacity: 0.65,
  });
  const starField = new THREE.Points(starGeom, starMat);
  scene.add(starField);

  // 2. Build Memory Palace Node Graph
  const allNodes: PalaceNode[] = [];
  const stageHubPositions: { id: string; pos: THREE.Vector3 }[] = [];

  const lineMatDim = new THREE.LineBasicMaterial({
    color: sceneManager.theme.isDark ? 0x1e293b : 0xcbd5e1,
    transparent: true,
    opacity: 0.35,
  });

  const lineMatSynapse = new THREE.LineBasicMaterial({
    color: 0x14b8a6,
    transparent: true,
    opacity: 0.45,
  });

  const lineMatSpark = new THREE.LineBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.35,
  });

  // Level 1: Stage Hubs
  stages.forEach((stage, idx) => {
    const isAdv = stage.isAdvanced;
    const angle = (idx / stages.length) * Math.PI * 2;
    const ringRadius = isAdv ? 17.5 : 13.0;
    const hubX = Math.cos(angle) * ringRadius;
    const hubY = Math.sin(angle * 2) * 2.5 + (isAdv ? -1.0 : 1.0);
    const hubZ = Math.sin(angle) * ringRadius;
    const hubPos = new THREE.Vector3(hubX, hubY, hubZ);
    stageHubPositions.push({ id: stage.id, pos: hubPos });

    // Stage Hub Mesh
    const hubGeom = new THREE.SphereGeometry(0.48, 24, 24);
    const hubColor = isAdv ? 0x38bdf8 : 0x22c55e;
    const hubMat = new THREE.MeshStandardMaterial({
      color: hubColor,
      emissive: hubColor,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.8,
    });
    const hubMesh = new THREE.Mesh(hubGeom, hubMat);
    hubMesh.position.copy(hubPos);
    palaceGroup.add(hubMesh);

    // Outer Rotating Halo
    const haloGeom = new THREE.SphereGeometry(0.72, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: hubColor,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    haloMesh.position.copy(hubPos);
    palaceGroup.add(haloMesh);

    const stageTitle = i18n.t(stage.titleKey);

    allNodes.push({
      mesh: hubMesh,
      haloMesh,
      type: 'stage',
      stageId: stage.id,
      stageTitle,
      isAdv,
      title: stageTitle,
      subtitle: '核心概念 · 黄金避坑秘籍',
      explanation: i18n.t(stage.goalKey),
      pos: hubPos,
    });

    // Level 2: Concept Orbit Nodes (4 key concept pairs)
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

      // Connection to Stage Hub
      const cLineGeom = new THREE.BufferGeometry().setFromPoints([hubPos, cPos]);
      const cLine = new THREE.Line(cLineGeom, lineMatSynapse);
      palaceGroup.add(cLine);

      allNodes.push({
        mesh: cMesh,
        type: 'concept',
        stageId: stage.id,
        stageTitle,
        isAdv,
        title: `${row.android.split('(')[0].trim()} ⟷ ${row.ios.split('(')[0].trim()}`,
        subtitle: '核心语法对照',
        androidCode: row.android,
        iosCode: row.ios,
        explanation: i18n.t(row.note || 'detail.col.android'),
        pos: cPos,
      });
    });

    // Level 3: Golden Pitfall Spark Nodes (4 golden memory sparks)
    const noteKeys = stage.noteKeys || [];
    noteKeys.forEach((nk, nIdx) => {
      const sAngle = (nIdx / 4) * Math.PI * 2 + 0.7;
      const sRadius = 1.8;
      const sPos = new THREE.Vector3(
        hubX + Math.cos(sAngle) * sRadius,
        hubY - 0.9 - Math.sin(sAngle) * 0.3,
        hubZ + Math.sin(sAngle) * sRadius
      );

      const sGeom = new THREE.SphereGeometry(0.16, 16, 16);
      const sMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      });
      const sMesh = new THREE.Mesh(sGeom, sMat);
      sMesh.position.copy(sPos);
      palaceGroup.add(sMesh);

      // Spark connection to Hub
      const sLineGeom = new THREE.BufferGeometry().setFromPoints([hubPos, sPos]);
      const sLine = new THREE.Line(sLineGeom, lineMatSpark);
      palaceGroup.add(sLine);

      const fullText = i18n.t(nk);
      const tagMatch = fullText.match(/^【([^】]+)】\s*(.*)$/) || fullText.match(/^\[([^\]]+)\]\s*(.*)$/);
      const tag = tagMatch ? tagMatch[1] : '避坑法则';
      const body = tagMatch ? tagMatch[2] : fullText;

      allNodes.push({
        mesh: sMesh,
        type: 'spark',
        stageId: stage.id,
        stageTitle,
        isAdv,
        title: `【${tag}】`,
        subtitle: '黄金避坑秘籍',
        noteTag: tag,
        noteBody: body,
        explanation: body,
        pos: sPos,
      });
    });
  });

  // Inter-Hub Synaptic Highways
  for (let i = 0; i < stageHubPositions.length; i++) {
    const nextIdx = (i + 1) % stageHubPositions.length;
    const p1 = stageHubPositions[i].pos;
    const p2 = stageHubPositions[nextIdx].pos;

    const curve = new THREE.QuadraticBezierCurve3(
      p1,
      new THREE.Vector3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 + 1.2, (p1.z + p2.z) / 2),
      p2
    );
    const points = curve.getPoints(24);
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, lineMatDim);
    palaceGroup.add(line);
  }

  // Moving Highway Electrons
  const pulseGeom = new THREE.SphereGeometry(0.1, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
  const pulseSpheres: { mesh: THREE.Mesh; fromIdx: number; progress: number }[] = [];

  for (let i = 0; i < 10; i++) {
    const p = new THREE.Mesh(pulseGeom, pulseMat);
    palaceGroup.add(p);
    pulseSpheres.push({
      mesh: p,
      fromIdx: Math.floor(Math.random() * (stageHubPositions.length - 1)),
      progress: Math.random(),
    });
  }

  // 3. Unified 3D Mode Top Bar (Dedicated in 3D Mode)
  const topBar = document.createElement('div');
  topBar.className = 'constellation-top-bar';
  topBar.innerHTML = `
    <div class="top-bar-left">
      <div class="constellation-title-group">
        <div class="constellation-brand-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>Android ⟷ iOS 3D 认知星云</span>
        </div>
      </div>

      <div class="view-mode-toggle">
        <button class="view-mode-btn active" id="btn-mode-3d" title="当前：3D 星云模式">
          🌌 3D 星云
        </button>
        <button class="view-mode-btn" id="btn-mode-doc" title="切换为文档路线模式">
          📄 文档
        </button>
      </div>
    </div>

    <!-- Center: Palace Search & Filters -->
    <div class="top-bar-center">
      <div class="palace-search-box">
        <svg class="palace-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="palace-search-input" id="palace-search-input" placeholder="在记忆宫殿中穿梭检索..." />
      </div>

      <div class="constellation-filter-tabs">
        <button class="constellation-tab-btn active" data-filter="all">全部节点</button>
        <button class="constellation-tab-btn" data-filter="main">核心主线</button>
        <button class="constellation-tab-btn" data-filter="adv">进阶扩展</button>
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
      <span class="legend-dot legend-dot-hub"></span>
      <span>阶段中心星核</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot legend-dot-concept"></span>
      <span>核心语法概念突触</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot legend-dot-spark"></span>
      <span>黄金避坑记忆灵光</span>
    </div>
  `;
  container.appendChild(legend);

  // 5. 3D Floating Anchor Tooltip (Directly on top of node in 3D space)
  const anchorTooltip = document.createElement('div');
  anchorTooltip.className = 'constellation-node-anchor-tooltip';
  container.appendChild(anchorTooltip);

  // 6. Holographic HUD Lens (Pinned to Bottom-Right Corner)
  const hudLens = document.createElement('div');
  hudLens.className = 'palace-hud-lens';
  container.appendChild(hudLens);

  const renderHudLens = (node: PalaceNode) => {
    let contentHtml = '';

    if (node.type === 'stage') {
      const stage = stages.find((s) => s.id === node.stageId) || stages[0];
      contentHtml = `
        <div class="hud-lens-header">
          <div>
            <div class="hud-lens-badge">
              <span class="chip ${stage.isAdvanced ? 'chip-advanced' : 'chip-main'}" style="font-size:10px;padding:2px 6px;">
                ${stage.isAdvanced ? i18n.t('badge.advanced') : i18n.t('badge.main')}
              </span>
              <span>阶段星核</span>
            </div>
            <h3 class="hud-lens-title">${i18n.t(stage.titleKey)}</h3>
          </div>
          <button class="btn-ghost" id="btn-close-hud" style="padding:4px;" title="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="hud-lens-body">
          <div style="font-size:13px;line-height:1.55;color:var(--color-ink);background:var(--color-accent-soft);padding:10px 12px;border-left:3px solid var(--color-accent);border-radius:4px;">
            ${i18n.t(stage.goalKey)}
          </div>
          <div id="hud-table-mount"></div>
          <div id="hud-diagram-mount"></div>
        </div>
        <div class="hud-lens-footer">
          <span style="font-size:11.5px;color:var(--color-ink-muted);">点击周围子节点查看代码</span>
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
        const tableMount = hudLens.querySelector('#hud-table-mount');
        if (tableMount) {
          tableMount.appendChild(
            renderComparisonTable(stage.rows.slice(0, 3), i18n.t('detail.col.android'), i18n.t('detail.col.ios'), false)
          );
        }
        const diagMount = hudLens.querySelector('#hud-diagram-mount');
        if (diagMount) {
          diagMount.appendChild(renderArchitectureDiagram(stage.id, stage.extraHintKey));
        }
      }
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

    const isMobile = window.innerWidth <= 768;
    const offsetZ = targetNode.type === 'stage' ? 5.5 : 3.8;
    const offsetX = isMobile ? 0 : targetNode.type === 'stage' ? -1.8 : -1.2;

    gsap.to(camera.position, {
      x: targetNode.pos.x + offsetX,
      y: targetNode.pos.y + 0.6,
      z: targetNode.pos.z + offsetZ,
      duration: 0.7,
      ease: 'power2.out',
    });

    if (sceneManager.controls) {
      gsap.to(sceneManager.controls.target, {
        x: targetNode.pos.x,
        y: targetNode.pos.y,
        z: targetNode.pos.z,
        duration: 0.7,
        ease: 'power2.out',
      });
    }

    renderHudLens(targetNode);
  };

  // 7. Raycaster Hover & Click
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-999, -999);
  let hoveredNode: PalaceNode | null = null;

  const onMouseMove = (e: MouseEvent) => {
    const rect = canvasWrap.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const visibleMeshes = allNodes.filter((n) => n.mesh.visible).map((n) => n.mesh);
    const intersects = raycaster.intersectObjects(visibleMeshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const targetNode = allNodes.find((n) => n.mesh === hitMesh);

      if (targetNode && targetNode !== hoveredNode) {
        hoveredNode = targetNode;
        canvasWrap.style.cursor = 'pointer';

        gsap.to(targetNode.mesh.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.2 });
        if (targetNode.haloMesh) {
          gsap.to(targetNode.haloMesh.scale, { x: 1.9, y: 1.9, z: 1.9, duration: 0.2 });
        }

        // Project directly on top of the node in 3D space
        const vector = targetNode.pos.clone().project(camera);
        const screenX = ((vector.x + 1) * rect.width) / 2;
        const screenY = ((-vector.y + 1) * rect.height) / 2;

        anchorTooltip.style.left = `${screenX}px`;
        anchorTooltip.style.top = `${screenY}px`;

        const tagText = targetNode.type === 'stage' ? '阶段星核' : targetNode.type === 'spark' ? '✨ 避坑灵光' : '🎯 概念突触';
        anchorTooltip.innerHTML = `
          <span class="anchor-tooltip-tag">${tagText}</span>
          <span class="anchor-tooltip-title">${targetNode.title}</span>
        `;
        anchorTooltip.classList.add('visible');
      }
    } else if (hoveredNode) {
      gsap.to(hoveredNode.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
      if (hoveredNode.haloMesh) {
        gsap.to(hoveredNode.haloMesh.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
      }
      hoveredNode = null;
      canvasWrap.style.cursor = 'grab';
      anchorTooltip.classList.remove('visible');
    }
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

  const searchInput = topBar.querySelector('#palace-search-input') as HTMLInputElement;
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;

      const matchedNode = allNodes.find((n) =>
        n.title.toLowerCase().includes(q) ||
        (n.androidCode && n.androidCode.toLowerCase().includes(q)) ||
        (n.iosCode && n.iosCode.toLowerCase().includes(q)) ||
        (n.noteBody && n.noteBody.toLowerCase().includes(q))
      );

      if (matchedNode) {
        flyToNode(matchedNode);
        searchInput.blur();
      }
    }
  });

  // Top Filter Tabs
  topBar.querySelectorAll('.constellation-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      topBar.querySelectorAll('.constellation-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';
      allNodes.forEach((n) => {
        const isVisible = filter === 'all' || (filter === 'main' && !n.isAdv) || (filter === 'adv' && n.isAdv);
        n.mesh.visible = isVisible;
        if (n.haloMesh) n.haloMesh.visible = isVisible;
      });
    });
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

  topBar.querySelector('#btn-theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('learning_cockpit_theme', nextTheme);
  });

  // 9. Animation Loop
  let time = 0;
  setInterval(() => {
    time += 0.015;

    // Moving Highway Pulses
    pulseSpheres.forEach((ps) => {
      ps.progress += 0.006;
      if (ps.progress >= 1) {
        ps.progress = 0;
        ps.fromIdx = (ps.fromIdx + 1) % stageHubPositions.length;
      }
      const toIdx = (ps.fromIdx + 1) % stageHubPositions.length;
      const p1 = stageHubPositions[ps.fromIdx].pos;
      const p2 = stageHubPositions[toIdx].pos;
      ps.mesh.position.lerpVectors(p1, p2, ps.progress);
    });

    // Starfield rotation
    starField.rotation.y += 0.0003;

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
