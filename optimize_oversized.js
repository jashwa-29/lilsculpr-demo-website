const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  { src: 'assets/img/claymodeling/blog2.webp', width: 100, height: 100 },
  { src: 'assets/img/claymodeling/blog3.webp', width: 100, height: 100 },
  { src: 'assets/img/claymodeling/car.webp', width: 206, height: 160 },
  { src: 'assets/img/logo.webp', width: 235, height: 128 },
  { src: 'assets/img/claymodeling/Layer.webp', width: 813, height: 542 },
  { src: 'assets/img/claymodeling/1.webp', width: 813, height: 542 },
  { src: 'assets/img/claymodeling/2.webp', width: 813, height: 542 }
];

async function optimize() {
  for (const img of images) {
    const fullPath = path.join('e:/Swiflare React Projects/lil sculputre/html.vecurosoft.com/knirpse/demo', img.src);
    
    try {
      if (fs.existsSync(fullPath)) {
        const buffer = await sharp(fullPath)
          .resize(img.width, img.height, { fit: 'cover' })
          .toBuffer();
        
        fs.writeFileSync(fullPath, buffer);
        console.log(`Optimized ${img.src} to ${img.width}x${img.height}`);
      } else {
        console.warn(`File not found: ${fullPath}`);
      }
    } catch (err) {
      console.error(`Error processing ${img.src}:`, err);
    }
  }
}

optimize();
