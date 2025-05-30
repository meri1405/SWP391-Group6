/* eslint-env node */
const fs = require("fs");
const path = require("path");

// Function to create a canvas and draw text on it
function createCanvasAndDraw(
  width,
  height,
  backgroundColor,
  text,
  textColor = "white"
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw text
  ctx.fillStyle = textColor;
  ctx.font = `bold ${Math.floor(width / 15)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Split text into lines if needed
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width < width - 40) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);

  const lineHeight = Math.floor(width / 15) * 1.2;
  const textY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, textY + index * lineHeight);
  });

  return canvas.toDataURL("image/jpeg", 0.9);
}

// Create the images directory if it doesn't exist
const imagesDir = path.join(__dirname, "../public/images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Define the images to create
const images = [
  {
    name: "disease-prevention.jpg",
    width: 800,
    height: 500,
    color: "#3f51b5",
    text: "Phòng ngừa các bệnh trường học",
  },
  {
    name: "school-nutrition.jpg",
    width: 800,
    height: 500,
    color: "#4caf50",
    text: "Dinh dưỡng học đường",
  },
  {
    name: "mental-health.jpg",
    width: 800,
    height: 500,
    color: "#9c27b0",
    text: "Sức khỏe tâm thần học đường",
  },
  {
    name: "about-mission.jpg",
    width: 800,
    height: 400,
    color: "#1976d2",
    text: "Sứ mệnh của chúng tôi",
  },
  {
    name: "about-features.jpg",
    width: 800,
    height: 400,
    color: "#2196f3",
    text: "Tính năng hệ thống",
  },
  {
    name: "about-team.jpg",
    width: 800,
    height: 400,
    color: "#03a9f4",
    text: "Đội ngũ phát triển",
  },
  {
    name: "team-member1.jpg",
    width: 300,
    height: 300,
    color: "#e91e63",
    text: "Nguyễn Văn A",
  },
  {
    name: "team-member2.jpg",
    width: 300,
    height: 300,
    color: "#ff5722",
    text: "Trần Thị B",
  },
  {
    name: "team-member3.jpg",
    width: 300,
    height: 300,
    color: "#795548",
    text: "Lê Văn C",
  },
];

// Create a basic HTML page to generate images
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Image Generator</title>
</head>
<body>
  <div id="result"></div>
  <script>
    const images = ${JSON.stringify(images)};
    const result = document.getElementById('result');
    
    images.forEach(img => {
      const dataUrl = createCanvasAndDraw(img.width, img.height, img.color, img.text);
      result.innerHTML += '<div>' +
        '<h3>' + img.name + '</h3>' +
        '<img src="' + dataUrl + '" width="400">' +
        '<p>Data URL length: ' + dataUrl.length + ' characters</p>' +
        '</div>';
      
      // Send the data URL to the server to save as a file
      fetch('/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: img.name,
          dataUrl: dataUrl
        })
      });
    });
    
    ${createCanvasAndDraw.toString()}
  </script>
</body>
</html>
`;

// Create a server to generate and save the images
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(htmlContent);
  } else if (req.url === "/save-image" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const { name, dataUrl } = JSON.parse(body);
      const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
      const imagePath = path.join(imagesDir, name);

      fs.writeFile(imagePath, base64Data, "base64", (err) => {
        if (err) {
          console.error("Error saving image:", err);
          res.writeHead(500);
          res.end("Error saving image");
        } else {
          console.log(`Saved image: ${name}`);
          res.writeHead(200);
          res.end("Image saved");
        }
      });
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
  console.log("Open the browser to generate and save images");
});
