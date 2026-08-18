import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeSceneManager } from '../core/ThreeSceneManager';
import { stages } from '../../data/roadmap-data';
import { i18n } from '../../services/i18n';
import { renderComparisonTable } from '../../components/ComparisonTable';
import { renderArchitectureDiagram } from '../../components/ArchitectureDiagram';

export function renderNeuralConstellationView(
  onOpenStageInDoc: (stageId: string) => void,
  onSwitchToDocMode: () => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'constellation-view-container';

  // 1. 3D Canvas Wrap
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'constellation-canvas-wrap';
  container.appendChild(canvasWrap);

  const sceneManager = new ThreeSceneManager(canvasWrap, {
    cameraPos: [0, 2.0, 13],
    fov: 48,
    autoRotate: true,
  });

  const { scene, camera } = sceneManager;
  const galaxyGroup = new THREE.Group();
  scene.add(galaxyGroup);

  // Background Star Particles
  const starGeom = new THREE.BufferGeometry();
  const starCount = 300;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 50;
    starPositions[i + 1] = (Math.random() - 0.5) * 40;
    starPositions[i + 2] = (Math.random() - 0.5) * 50;
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: sceneManager.theme.isDark ? 0x64748b : 0x94a3b8,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
  });
  const starField = new THREE.Points(starGeom, starMat);
  scene.add(starField);

  // 2. Build 16 Nodes
  interface ConstellationNode {
    mesh: THREE.Mesh;
    glowMesh: THREE.Mesh;
    id: string;
    num: number;
    title: string;
    isAdv: boolean;
    pos: THREE.Vector3;
  }

  const nodes: ConstellationNode[] = [];

  stages.forEach((stage, idx) => {
    const isAdv = stage.isAdvanced;
    const angle = (idx / stages.length) * Math.PI * 2;
    const radius = isAdv ? 5.2 : 3.8;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle * 2) * 1.5 + (isAdv ? -0.6 : 0.6);
    const z = Math.sin(angle) * radius;
    const pos = new THREE.Vector3(x, y, z);

    // Core Sphere
    const geom = new THREE.SphereGeometry(isAdv ? 0.28 : 0.35, 24, 24);
    const color = isAdv ? 0x38bdf8 : 0x22c55e;
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.8,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(pos);
    galaxyGroup.add(mesh);

    // Glowing Halo
    const glowGeom = new THREE.SphereGeometry(isAdv ? 0.46 : 0.56, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    });
    const glowMesh = new THREE.Mesh(glowGeom, glowMat);
    glowMesh.position.copy(pos);
    galaxyGroup.add(glowMesh);

    nodes.push({
      mesh,
      glowMesh,
      id: stage.id,
      num: stage.number,
      title: i18n.t(stage.titleKey),
      isAdv,
      pos,
    });
  });

  // Synaptic Connection Beams
  const lineMaterial = new THREE.LineBasicMaterial({
    color: sceneManager.theme.isDark ? 0x334155 : 0x94a3b8,
    transparent: true,
    opacity: 0.4,
  });

  for (let i = 0; i < nodes.length; i++) {
    const nextIdx = (i + 1) % nodes.length;
    const p1 = nodes[i].pos;
    const p2 = nodes[nextIdx].pos;

    const curve = new THREE.QuadraticBezierCurve3(
      p1,
      new THREE.Vector3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 + 0.6, (p1.z + p2.z) / 2),
      p2
    );
    const points = curve.getPoints(24);
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, lineMaterial);
    galaxyGroup.add(line);
  }

  // Floating Energy Pulses
  const pulseGeom = new THREE.SphereGeometry(0.09, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6 });
  const pulseSpheres: { mesh: THREE.Mesh; fromIdx: number; progress: number }[] = [];

  for (let i = 0; i < 8; i++) {
    const p = new THREE.Mesh(pulseGeom, pulseMat);
    galaxyGroup.add(p);
    pulseSpheres.push({
      mesh: p,
      fromIdx: Math.floor(Math.random() * (stages.length - 1)),
      progress: Math.random(),
    });
  }

  // 3. Top Floating Bar
  const topBar = document.createElement('div');
  topBar.className = 'constellation-top-bar';
  topBar.innerHTML = `
    <div class="constellation-title-group">
      <div class="constellation-brand-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        <span>3D 认知星云 · 知识图谱</span>
      </div>
    </div>

    <div class="constellation-filter-tabs">
      <button class="constellation-tab-btn active" data-filter="all">全部阶段 (16)</button>
      <button class="constellation-tab-btn" data-filter="main">核心主线 (10)</button>
      <button class="constellation-tab-btn" data-filter="adv">进阶扩展 (6)</button>
    </div>

    <div class="constellation-right-tools">
      <button class="tool-pill-btn active" id="btn-toggle-spin" title="切换 3D 自转">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        <span>3D 旋转</span>
      </button>
      <button class="tool-pill-btn" id="btn-reset-cam" title="全景视角复位">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        <span>全景</span>
      </button>
      <button class="tool-pill-btn" id="btn-switch-doc-mode" style="color:var(--color-accent);font-weight:700;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <span>文档模式</span>
      </button>
    </div>
  `;
  container.appendChild(topBar);

  // 4. Hover Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'constellation-node-tooltip';
  container.appendChild(tooltip);

  // 5. Bottom Quick Track
  const bottomTrack = document.createElement('div');
  bottomTrack.className = 'constellation-bottom-track';
  bottomTrack.innerHTML = stages
    .map(
      (s) => `
    <button class="track-node-dot" data-stage="${s.id}" title="${s.number}. ${i18n.t(s.titleKey)}">
      ${s.number}
    </button>
  `
    )
    .join('');
  container.appendChild(bottomTrack);

  // 6. Sliding 3D Stage Inspector Drawer
  const inspector = document.createElement('div');
  inspector.className = 'constellation-inspector-panel';
  container.appendChild(inspector);

  const renderInspector = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId) || stages[0];
    const stageIndex = stages.findIndex((s) => s.id === stageId);

    // Highlight bottom track dot
    bottomTrack.querySelectorAll('.track-node-dot').forEach((dot) => {
      dot.classList.toggle('active', dot.getAttribute('data-stage') === stageId);
    });

    const noteCardsHtml = (stage.noteKeys || [])
      .map((k) => {
        const text = i18n.t(k);
        const tagMatch = text.match(/^【([^】]+)】\s*(.*)$/) || text.match(/^\[([^\]]+)\]\s*(.*)$/);
        if (tagMatch) {
          const [, tag, body] = tagMatch;
          return `
            <li class="note-item-card" style="padding:10px 12px;">
              <div class="note-item-header">
                <span class="note-item-badge">【${escapeHtml(tag)}】</span>
              </div>
              <div class="note-item-text" style="font-size:12.5px;">${escapeHtml(body)}</div>
            </li>
          `;
        }
        return `
          <li class="note-item-card" style="padding:10px 12px;">
            <div class="note-item-text" style="font-size:12.5px;">${escapeHtml(text)}</div>
          </li>
        `;
      })
      .join('');

    inspector.innerHTML = `
      <div class="inspector-header">
        <div>
          <div class="inspector-stage-meta">
            <span class="chip ${stage.isAdvanced ? 'chip-advanced' : 'chip-main'}" style="font-size:10px;padding:2px 6px;">
              ${stage.isAdvanced ? i18n.t('badge.advanced') : i18n.t('badge.main')}
            </span>
            <span style="font-size:12px;color:var(--color-ink-muted);font-weight:700;">STAGE ${String(stage.number).padStart(2, '0')}</span>
          </div>
          <h2 class="inspector-stage-title">${stage.number}. ${i18n.t(stage.titleKey)}</h2>
        </div>
        <button class="btn-ghost" id="btn-close-inspector" style="padding:6px;" title="关闭详情">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="inspector-body">
        <div>
          <div class="inspector-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            <span>阶段目标</span>
          </div>
          <div class="inspector-goal-box">${i18n.t(stage.goalKey)}</div>
        </div>

        <div>
          <div class="inspector-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span>核心语法与概念对照 (${stage.rows.length} 项)</span>
          </div>
          <div id="inspector-table-container"></div>
        </div>

        <div>
          <div class="inspector-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span>架构与层级结构全景</span>
          </div>
          <div id="inspector-diagram-container"></div>
        </div>

        <div>
          <div class="inspector-section-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>4 大黄金迁移避坑法则</span>
          </div>
          <ul class="notes-grid" style="gap:10px;">
            ${noteCardsHtml}
          </ul>
        </div>
      </div>

      <div class="inspector-footer">
        <div class="inspector-nav-group">
          <button class="btn btn-secondary btn-sm" id="btn-inspector-prev" title="上一阶段">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            <span>上一阶段</span>
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-inspector-next" title="下一阶段">
            <span>下一阶段</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <button class="btn btn-primary btn-sm" id="btn-open-doc-view">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>在文档中打开</span>
        </button>
      </div>
    `;

    // Render Table
    const tableContainer = inspector.querySelector('#inspector-table-container');
    if (tableContainer) {
      tableContainer.appendChild(
        renderComparisonTable(
          stage.rows.slice(0, 4),
          i18n.t('detail.col.android'),
          i18n.t('detail.col.ios'),
          false
        )
      );
    }

    // Render Architecture Diagram
    const diagContainer = inspector.querySelector('#inspector-diagram-container');
    if (diagContainer) {
      diagContainer.appendChild(renderArchitectureDiagram(stage.id, stage.extraHintKey));
    }

    // Open Inspector Slide-in
    inspector.classList.add('open');

    // Event handlers inside Inspector
    inspector.querySelector('#btn-close-inspector')?.addEventListener('click', () => {
      inspector.classList.remove('open');
      bottomTrack.querySelectorAll('.track-node-dot').forEach((d) => d.classList.remove('active'));
      sceneManager.resetCamera([0, 2.0, 13], [0, 0, 0]);
    });

    inspector.querySelector('#btn-open-doc-view')?.addEventListener('click', () => {
      onOpenStageInDoc(stage.id);
    });

    inspector.querySelector('#btn-inspector-prev')?.addEventListener('click', () => {
      const prevIdx = (stageIndex - 1 + stages.length) % stages.length;
      selectNode(stages[prevIdx].id);
    });

    inspector.querySelector('#btn-inspector-next')?.addEventListener('click', () => {
      const nextIdx = (stageIndex + 1) % stages.length;
      selectNode(stages[nextIdx].id);
    });
  };

  const selectNode = (stageId: string) => {
    const targetNode = nodes.find((n) => n.id === stageId);
    if (!targetNode) return;

    if (sceneManager.controls) {
      sceneManager.controls.autoRotate = false;
    }
    const spinBtn = topBar.querySelector('#btn-toggle-spin');
    spinBtn?.classList.remove('active');

    // Camera fly to node with offset to leave room for inspector
    const isMobile = window.innerWidth <= 768;
    const targetCamX = isMobile ? targetNode.pos.x : targetNode.pos.x - 2.2;
    const targetCamY = targetNode.pos.y + 0.4;
    const targetCamZ = targetNode.pos.z + 5.5;

    gsap.to(camera.position, {
      x: targetCamX,
      y: targetCamY,
      z: targetCamZ,
      duration: 0.6,
      ease: 'power2.out',
    });

    if (sceneManager.controls) {
      gsap.to(sceneManager.controls.target, {
        x: targetNode.pos.x,
        y: targetNode.pos.y,
        z: targetNode.pos.z,
        duration: 0.6,
        ease: 'power2.out',
      });
    }

    renderInspector(stageId);
  };

  // 7. Raycaster Hover & Click Events
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-999, -999);
  let hoveredNode: ConstellationNode | null = null;

  const onMouseMove = (e: MouseEvent) => {
    const rect = canvasWrap.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const meshes = nodes.filter((n) => n.mesh.visible).map((n) => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const targetNode = nodes.find((n) => n.mesh === hitMesh);

      if (targetNode && targetNode !== hoveredNode) {
        hoveredNode = targetNode;
        canvasWrap.style.cursor = 'pointer';

        gsap.to(targetNode.mesh.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.25 });
        gsap.to(targetNode.glowMesh.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.25 });

        // Tooltip
        const vector = targetNode.pos.clone().project(camera);
        const screenX = ((vector.x + 1) * rect.width) / 2;
        const screenY = ((-vector.y + 1) * rect.height) / 2;

        tooltip.style.left = `${screenX}px`;
        tooltip.style.top = `${screenY}px`;
        tooltip.innerHTML = `
          <div class="tooltip-num">STAGE ${String(targetNode.num).padStart(2, '0')} · ${targetNode.isAdv ? '进阶' : '核心主线'}</div>
          <div class="tooltip-title">${targetNode.title}</div>
          <div class="tooltip-desc">点击探索全景对照与避坑 ➔</div>
        `;
        tooltip.classList.add('visible');
      }
    } else if (hoveredNode) {
      gsap.to(hoveredNode.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.25 });
      gsap.to(hoveredNode.glowMesh.scale, { x: 1, y: 1, z: 1, duration: 0.25 });
      hoveredNode = null;
      canvasWrap.style.cursor = 'grab';
      tooltip.classList.remove('visible');
    }
  };

  const onClick = () => {
    if (hoveredNode) {
      selectNode(hoveredNode.id);
    }
  };

  canvasWrap.addEventListener('mousemove', onMouseMove);
  canvasWrap.addEventListener('click', onClick);

  // 8. Top Tools Event Listeners
  topBar.querySelectorAll('.constellation-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      topBar.querySelectorAll('.constellation-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';
      nodes.forEach((n) => {
        const isVisible = filter === 'all' || (filter === 'main' && !n.isAdv) || (filter === 'adv' && n.isAdv);
        n.mesh.visible = isVisible;
        n.glowMesh.visible = isVisible;
      });
    });
  });

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
    inspector.classList.remove('open');
    bottomTrack.querySelectorAll('.track-node-dot').forEach((d) => d.classList.remove('active'));
    sceneManager.resetCamera([0, 2.0, 13], [0, 0, 0]);
  });

  topBar.querySelector('#btn-switch-doc-mode')?.addEventListener('click', () => {
    onSwitchToDocMode();
  });

  // Bottom Track Clicks
  bottomTrack.querySelectorAll('.track-node-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const stageId = dot.getAttribute('data-stage');
      if (stageId) selectNode(stageId);
    });
  });

  // 9. Animation Loop
  let time = 0;
  setInterval(() => {
    time += 0.015;

    // Moving Synaptic Pulses
    pulseSpheres.forEach((ps) => {
      ps.progress += 0.007;
      if (ps.progress >= 1) {
        ps.progress = 0;
        ps.fromIdx = (ps.fromIdx + 1) % nodes.length;
      }
      const toIdx = (ps.fromIdx + 1) % nodes.length;
      const p1 = nodes[ps.fromIdx].pos;
      const p2 = nodes[toIdx].pos;
      ps.mesh.position.lerpVectors(p1, p2, ps.progress);
    });

    // Star Rotation
    starField.rotation.y += 0.0004;

    // Gentle Node Pulse
    nodes.forEach((n, idx) => {
      n.glowMesh.rotation.y += 0.015;
      n.glowMesh.rotation.z += 0.008;
      n.mesh.position.y = n.pos.y + Math.sin(time * 2 + idx) * 0.06;
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
