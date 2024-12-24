const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const port = 3000;

// Set the Content Security Policy header
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self';");
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Get the local IP address of the machine
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Get the local IP address of the machine
const localIP = getLocalIPAddress();

// Route to serve the homepage (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to serve form.html
app.get('/form.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://${localIP}:${port}`);
});
