/**
 * Script para generar iconos PWA.
 *
 * INSTRUCCIONES:
 * 1. Coloca tu logo/icono base como 'icon-512x512.png' en public/icons/
 * 2. Ejecuta: node scripts/generate-icons.js
 *
 * O bien, usa cualquier generador online como:
 * - https://www.pwabuilder.com/imageGenerator
 * - https://realfavicongenerator.net/
 *
 * Sube tu SVG (public/icons/icon-512x512.svg) y descarga los PNGs
 * en los tamaños: 72, 96, 128, 144, 152, 192, 384, 512
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Verificar que existe el directorio
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generar SVGs simples como placeholder para cada tamaño
sizes.forEach((size) => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);

  if (!fs.existsSync(filepath)) {
    // Crear un SVG placeholder que puede servir como icono
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.125)}" fill="#1e1e1e"/>
  <text x="50%" y="55%" text-anchor="middle" fill="#007ACC" font-family="Arial, sans-serif" font-weight="bold" font-size="${Math.round(size * 0.35)}">JM</text>
</svg>`;

    // Guardar como SVG con extensión png por ahora (los navegadores lo aceptan)
    // Para producción, usa un servicio de conversión real
    const svgPath = filepath.replace('.png', '.svg');
    fs.writeFileSync(svgPath, svg);
    console.log(`Created: ${svgPath}`);
  } else {
    console.log(`Exists: ${filepath}`);
  }
});

console.log('\n✅ SVG placeholders created!');
console.log('💡 Para producción, convierte los SVGs a PNG usando:');
console.log('   https://www.pwabuilder.com/imageGenerator');
