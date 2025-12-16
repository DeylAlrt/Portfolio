const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let visitorCount = 0;
const dataFile = path.join(__dirname, 'visitors.json');

// Load count from file
if (fs.existsSync(dataFile)) {
  visitorCount = JSON.parse(fs.readFileSync(dataFile)).count;
}

// Serve static files from root (your HTML, CSS, JS folders, images, everything)
app.use(express.static(__dirname));

// API to get visitor count
app.get('/api/visitors', (req, res) => {
  res.json({ total: visitorCount });
});

// Catch-all route — serve Index.html for root, Desktop.html if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Index.html'));
});

// Optional: if you want /desktop to go straight to Desktop.html
app.get('/desktop', (req, res) => {
  res.sendFile(path.join(__dirname, 'Desktop.html'));
});

// Increment visitor count on every request (except API calls to avoid double count)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    visitorCount++;
    fs.writeFileSync(dataFile, JSON.stringify({ count: visitorCount }));
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
  console.log(`Visit: https://your-site.onrender.com`);
  console.log(`Current visitors: ${visitorCount}`);
});