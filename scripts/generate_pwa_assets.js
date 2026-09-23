import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const iconsDir = path.join(rootDir, 'Frontend', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. GENERATE VECTOR SVG ICON (Frontend/icons/icon.svg)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="40%" stop-color="#134e4a" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <linearGradient id="primaryTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
    <linearGradient id="accentGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Base Rounded Container -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle Inner Border -->
  <rect x="24" y="24" width="464" height="464" rx="92" fill="none" stroke="url(#primaryTeal)" stroke-width="6" stroke-opacity="0.4" />

  <!-- Shield / Crest Silhouette -->
  <path d="M 256 76 L 396 136 C 396 268 336 376 256 428 C 176 376 116 268 116 136 Z"
        fill="#0f172a" fill-opacity="0.75" stroke="url(#accentGold)" stroke-width="8" filter="url(#shadow)" />

  <!-- Tech Grid / Circuit Accent -->
  <circle cx="256" cy="116" r="8" fill="#2dd4bf" />
  <line x1="256" y1="124" x2="256" y2="152" stroke="#2dd4bf" stroke-width="4" stroke-opacity="0.8" />
  <line x1="196" y1="152" x2="316" y2="152" stroke="#2dd4bf" stroke-width="3" stroke-opacity="0.5" />

  <!-- "IT" Monogram Text -->
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="900" text-anchor="middle">
    <!-- Letter "I" -->
    <path d="M 196 188 H 224 V 328 H 196 Z" fill="url(#primaryTeal)" />
    <!-- Letter "T" -->
    <path d="M 256 188 H 344 V 222 H 316 V 328 H 284 V 222 H 256 Z" fill="#ffffff" />
  </g>

  <!-- Archival Star Badge -->
  <polygon points="256,356 264,374 284,375 268,388 273,408 256,396 239,408 244,388 228,375 248,374"
           fill="url(#accentGold)" />

  <!-- Bottom Archival Arc / Ribbon Banner -->
  <path d="M 180 436 Q 256 460 332 436" fill="none" stroke="url(#primaryTeal)" stroke-width="5" stroke-linecap="round" stroke-opacity="0.85" />
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.join(rootDir, 'Frontend', 'favicon.svg'), svgContent, 'utf-8');
console.log('Created Frontend/icons/icon.svg and Frontend/favicon.svg');

// 2. PNG GENERATION UTILITY
function createPng(width, height, pixelShader) {
  const lineLength = width * 4 + 1;
  const rawData = Buffer.alloc(lineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineLength;
    rawData[rowOffset] = 0; // Filter: None
    const py = y;
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const px = x;
      const [r, g, b, a] = pixelShader(px, py, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    const crcVal = zlib.crc32(Buffer.concat([typeBuf, data]));
    crc.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Color helpers
function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// Shader for DLMS Brand Icons
function dlmsIconShader(px, py, width, height, isMaskable = false) {
  // Normalize coordinates to [-1, 1]
  let nx = (px / width) * 2 - 1;
  let ny = (py / height) * 2 - 1;

  // Background gradient: Deep Slate (#0f172a) to Deep Teal (#134e4a)
  const gradT = (nx + ny + 2) / 4;
  let bgR = Math.round(lerp(15, 19, gradT));
  let bgG = Math.round(lerp(23, 78, gradT));
  let bgB = Math.round(lerp(42, 74, gradT));
  let bgA = 255;

  // If not maskable, round corners (squircle with radius ~0.24)
  if (!isMaskable) {
    const absX = Math.abs(nx);
    const absY = Math.abs(ny);
    const cornerR = 0.28;
    const qx = Math.max(0, absX - (1 - cornerR));
    const qy = Math.max(0, absY - (1 - cornerR));
    const cornerDist = Math.hypot(qx, qy);
    if (cornerDist > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Scale inner content: maskable icon has 15% safe padding (content in central 70%)
  const scale = isMaskable ? 0.72 : 0.88;
  const sx = nx / scale;
  const sy = ny / scale;

  // Check shield crest boundary
  // Shield shape: top horizontal line sy = -0.7 to 0.1, then curves down to (0, 0.72)
  let inShield = false;
  let inShieldBorder = false;

  if (sy >= -0.75 && sy <= 0.72) {
    let shieldWidth = 0;
    if (sy < 0.05) {
      shieldWidth = 0.62;
    } else {
      // Taper down to apex (0, 0.72)
      const prog = (sy - 0.05) / (0.72 - 0.05);
      shieldWidth = 0.62 * (1 - Math.pow(prog, 1.4));
    }

    const distFromShieldEdge = shieldWidth - Math.abs(sx);
    if (distFromShieldEdge >= 0) {
      inShield = true;
      if (distFromShieldEdge < 0.045 || Math.abs(sy - (-0.75)) < 0.035) {
        inShieldBorder = true;
      }
    }
  }

  if (inShieldBorder) {
    // Gold border (#f59e0b)
    return [245, 158, 11, 255];
  }

  if (inShield) {
    // Dark inner shield fill (#09101d)
    bgR = 9;
    bgG = 16;
    bgB = 29;

    // Draw Monogram "IT"
    // "I" block: sx between -0.32 and -0.16, sy between -0.36 and 0.26
    const inI = sx >= -0.32 && sx <= -0.16 && sy >= -0.36 && sy <= 0.26;

    // "T" block:
    // Top bar: sx between -0.04 and 0.38, sy between -0.36 and -0.22
    // Stem: sx between 0.10 and 0.24, sy between -0.22 and 0.26
    const inTTop = sx >= -0.04 && sx <= 0.38 && sy >= -0.36 && sy <= -0.22;
    const inTStem = sx >= 0.10 && sx <= 0.24 && sy >= -0.22 && sy <= 0.26;
    const inT = inTTop || inTStem;

    if (inI) {
      // Teal gradient (#2dd4bf to #0d9488)
      return [45, 212, 191, 255];
    }
    if (inT) {
      // Crisp white (#ffffff)
      return [255, 255, 255, 255];
    }

    // Star / emblem below text: centered at (0, 0.45)
    const starDist = Math.hypot(sx, sy - 0.44);
    if (starDist < 0.075) {
      return [251, 191, 36, 255]; // Amber star
    }

    // Circuit dot above text: centered at (0, -0.56)
    const dotDist = Math.hypot(sx, sy - (-0.56));
    if (dotDist < 0.04) {
      return [45, 212, 191, 255]; // Cyan dot
    }
  }

  return [bgR, bgG, bgB, bgA];
}

// Generate all required PWA icon sizes
const iconSpecs = [
  { file: 'icon-192x192.png', size: 192, maskable: false, dir: iconsDir },
  { file: 'icon-512x512.png', size: 512, maskable: false, dir: iconsDir },
  { file: 'icon-maskable-512x512.png', size: 512, maskable: true, dir: iconsDir },
  { file: 'apple-touch-icon.png', size: 180, maskable: true, dir: path.join(rootDir, 'Frontend') },
  { file: 'favicon.ico', size: 32, maskable: false, dir: path.join(rootDir, 'Frontend') },
];

for (const spec of iconSpecs) {
  const buf = createPng(spec.size, spec.size, (px, py, w, h) =>
    dlmsIconShader(px, py, w, h, spec.maskable)
  );
  const outPath = path.join(spec.dir, spec.file);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${path.relative(rootDir, outPath)} (${spec.size}x${spec.size}, ${buf.length} bytes)`);
}

console.log('PWA icon generation complete.');
