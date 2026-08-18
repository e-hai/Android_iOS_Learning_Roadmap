import * as THREE from 'three';

export interface CardTextureOptions {
  title: string;
  code: string;
  tag?: string;
  isAndroid?: boolean;
  isIos?: boolean;
  width?: number;
  height?: number;
  bgColor?: string;
  borderColor?: string;
}

export function createCardTexture(options: CardTextureOptions): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const w = options.width ?? 512;
  const h = options.height ?? 256;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  ctx.fillStyle = options.bgColor ?? '#1e293b';
  ctx.beginPath();
  const radius = 24;
  ctx.roundRect(8, 8, w - 16, h - 16, radius);
  ctx.fill();

  // Border
  ctx.lineWidth = 6;
  if (options.isAndroid) {
    ctx.strokeStyle = '#22c55e';
  } else if (options.isIos) {
    ctx.strokeStyle = '#38bdf8';
  } else {
    ctx.strokeStyle = options.borderColor ?? '#475569';
  }
  ctx.stroke();

  // Badge
  if (options.tag) {
    ctx.fillStyle = options.isAndroid ? '#16a34a' : options.isIos ? '#0284c7' : '#0d9488';
    ctx.beginPath();
    ctx.roundRect(24, 24, 140, 36, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(options.tag, 34, 48);
  }

  // Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(options.title, 24, options.tag ? 95 : 55);

  // Code
  ctx.fillStyle = '#38bdf8';
  ctx.font = '19px "SF Mono", Menlo, Consolas, monospace';
  const codeLines = options.code.split('\n');
  let y = options.tag ? 135 : 100;
  for (const line of codeLines.slice(0, 3)) {
    ctx.fillText(line, 24, y);
    y += 30;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
