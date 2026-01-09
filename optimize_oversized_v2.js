const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  { src: 'assets/img/claymodeling/blog2.webp', dest: 'assets/img/claymodeling/blog2_thumb.webp', width: 100, height: 100 },
  { src: 'assets/img/claymodeling/blog3.webp', dest: 'assets/img/claymodeling/blog3_thumb.webp', width: 100, height: 100 },
  { src: 'assets/img/claymodeling/car.webp', dest: 'assets/img/claymodeling/car_small.webp', width: 206, height: 160 },
  { src: 'assets/img/logo.webp', dest: 'assets/img/logo_small.webp', width: 235, height: 128 },
  { src: 'assets/img/claymodeling/Layer.webp', dest: 'assets/img/claymodeling/Layer_fixed.webp', width: 813, height: 542 },
  { src: 'assets/img/claymodeling/1.webp', dest: 'assets/img/claymodeling/1_fixed.webp', width: 813, height: 542 },
  { src: 'assets/img/claymodeling/2.webp', dest: 'assets/img/claymodeling/2_fixed.webp', width: 813, height: 542 }
];

async function optimize() {
  for (const img of images) {
    const fullPath = path.join('e:/Swiflare React Projects/lil sculputre/html.vecurosoft.com/knirpse/demo', img.src);
    const destPath = path.join('e:/Swiflare React Projects/lil sculputre/html.vecurosoft.com/knirpse/demo', img.dest);
    
    try {
      if (fs.existsSync(fullPath)) {
        await sharp(fullPath)
          .resize(img.width, img.height, { fit: 'cover' })
          .toFile(destPath);
        console.log(`Created ${img.dest} (${img.width}x${img.height})`);
      } else {
        console.warn(`File not found: ${fullPath}`);
      }
    } catch (err) {
      console.error(`Error processing ${img.src}:`, err);
    }
  }
}

optimize();
