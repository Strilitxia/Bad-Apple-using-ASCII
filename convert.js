/**
 * convert.js - Extracts 160×100 frames, converts to ASCII, and applies RLE compression.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CHARS = ' .:-=+';
const FRAMES_DIR = path.join(__dirname, 'frames_small');  // Update to new directory
const OUT_FILE = path.join(__dirname, 'frames.json');
const WIDTH = 160;
const HEIGHT = 100;

// Function to apply Run-Length Encoding (RLE) to a scanline
function applyRLE(scanline) {
  let encoded = '';
  let count = 1;

  for (let i = 1; i <= scanline.length; i++) {
    if (scanline[i] === scanline[i - 1]) {
      count++;
    } else {
      encoded += (count > 1 ? count : '') + scanline[i - 1];
      count = 1;
    }
  }

  return encoded;
}

// Process a single frame to ASCII + RLE
async function processFrame(filePath) {
  const { data, info } = await sharp(filePath)
    .resize(WIDTH, HEIGHT)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rows = [];

  for (let y = 0; y < HEIGHT; y++) {
    let line = '';
    for (let x = 0; x < WIDTH; x++) {
      const pixelValue = data[y * WIDTH + x];
      const charIndex = Math.floor((pixelValue / 256) * CHARS.length);
      line += CHARS[Math.min(charIndex, CHARS.length - 1)];
    }

    // Apply RLE compression to each scanline
    rows.push(applyRLE(line));
  }

  return rows;
}

// Main processing function
(async () => {
  console.log(`Processing frames in ${FRAMES_DIR}...`);
  const files = fs.readdirSync(FRAMES_DIR).filter(f => /\.png$/i.test(f)).sort();
  
  if (files.length === 0) {
    console.error(`No PNG frames found in ${FRAMES_DIR}`);
    return;
  }

  const framesData = [];

  for (const file of files) {
    const framePath = path.join(FRAMES_DIR, file);
    console.log(`Processing ${file}`);
    const frameData = await processFrame(framePath);
    framesData.push(frameData);
  }

  // Write the compressed data to frames.json
  fs.writeFileSync(OUT_FILE, JSON.stringify(framesData));
  console.log(`✅ Frames processed and saved to ${OUT_FILE}`);
})();
