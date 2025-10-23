// Simple test to see if Express works
const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const server = app.listen(3000, () => {
  console.log('Test server running on http://localhost:3000/test');
  console.log('Server object:', typeof server);
});

// Keep alive
setInterval(() => {
  console.log('Still alive...', new Date().toISOString());
}, 5000);
