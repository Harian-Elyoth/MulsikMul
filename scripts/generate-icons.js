/**
 * Generates minimal solid-color PNG placeholder icons for Expo.
 * Run with: node scripts/generate-icons.js
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makePNG(w, h, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  // compression, filter, interlace = 0

  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(1 + w * 3);
    row[0] = 0; // filter: None
    for (let x = 0; x < w; x++) {
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = b;
    }
    rows.push(row);
  }

  const compressed = zlib.deflateSync(Buffer.concat(rows));

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const assets = path.join(__dirname, '..', 'assets');
const green = [0x2D, 0x6A, 0x4F];   // #2D6A4F brand primary
const white = [0xFF, 0xFF, 0xFF];

const files = [
  { name: 'icon.png',                    size: [1024, 1024], color: green },
  { name: 'splash-icon.png',             size: [200,  200],  color: green },
  { name: 'favicon.png',                 size: [48,   48],   color: green },
  { name: 'android-icon-foreground.png', size: [432,  432],  color: green },
  { name: 'android-icon-background.png', size: [432,  432],  color: green },
  { name: 'android-icon-monochrome.png', size: [432,  432],  color: white },
];

for (const { name, size: [w, h], color: [r, g, b] } of files) {
  const dest = path.join(assets, name);
  fs.writeFileSync(dest, makePNG(w, h, r, g, b));
  console.log(`Created ${name} (${w}×${h})`);
}
