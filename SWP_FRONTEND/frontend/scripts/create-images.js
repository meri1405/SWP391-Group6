import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to create a colored image with text
function createImageWithText(width, height, backgroundColor, text, filename) {
  console.log(`Creating image: ${filename} with text: ${text}`);
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(width/15)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Split text into lines if needed
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width < width - 40) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  
  const lineHeight = Math.floor(width/15) * 1.2;
  const textY = height / 2 - (lines.length - 1) * lineHeight / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, textY + index * lineHeight);
  });
  
  // Save image
  const imagePath = path.join(__dirname, '../public/images', filename);
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(imagePath, buffer);
  
  console.log(`Saved: ${imagePath}`);
}

// List of images to create
const images = [
  { name: 'disease-prevention.jpg', width: 800, height: 500, color: '#3f51b5', text: 'Phòng ngừa các bệnh trường học' },
  { name: 'school-nutrition.jpg', width: 800, height: 500, color: '#4caf50', text: 'Dinh dưỡng học đường' },
  { name: 'mental-health.jpg', width: 800, height: 500, color: '#9c27b0', text: 'Sức khỏe tâm thần học đường' },
  { name: 'about-mission.jpg', width: 800, height: 400, color: '#1976d2', text: 'Sứ mệnh của chúng tôi' },
  { name: 'about-features.jpg', width: 800, height: 400, color: '#2196f3', text: 'Tính năng hệ thống' },
  { name: 'about-team.jpg', width: 800, height: 400, color: '#03a9f4', text: 'Đội ngũ phát triển' },
  { name: 'team-member1.jpg', width: 300, height: 300, color: '#e91e63', text: 'Nguyễn Văn A' },
  { name: 'team-member2.jpg', width: 300, height: 300, color: '#ff5722', text: 'Trần Thị B' },
  { name: 'team-member3.jpg', width: 300, height: 300, color: '#795548', text: 'Lê Văn C' }
];

// Create each image
images.forEach(img => {
  createImageWithText(img.width, img.height, img.color, img.text, img.name);
});

console.log('All images created successfully!');
