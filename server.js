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
} else {
  fs.writeFileSync(dataFile, JSON.stringify({ count: 0 }));
}

// Serve your static files (Index.html, Desktop.html, CSS, JS folders)
app.use(express.static(__dirname));

// API to get current count
app.get('/api/visitors', (req, res) => {
  res.json({ total: visitorCount });
});

// Increment count on every visit to root (or any page)
app.use((req, res, next) => {
  visitorCount++;
  fs.writeFileSync(dataFile, JSON.stringify({ count: visitorCount }));
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Current visitors: ${visitorCount}`);
});