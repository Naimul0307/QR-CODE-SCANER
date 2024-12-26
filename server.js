const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Get the local IP address
const localIP = getLocalIPAddress();

// Route to serve the homepage (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to serve form.html (where user submits their data)
app.get('/form.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

// Handle form submission and save data
app.post('/submit-form', (req, res) => {
  const { name, email, phone } = req.body;

  // Validate data
  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required!' });
  }

  // Save data to a JSON file
  const dataPath = path.join(__dirname, 'users.json');
  const userData = { name, email, phone };
  const sanitizedFileName = email.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize for file matching

  fs.readFile(dataPath, 'utf8', (err, data) => {
    let users = [];
    if (!err && data) {
      users = JSON.parse(data);
    }
    users.push(userData);

    fs.writeFile(dataPath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error('Error saving data:', err);
        return res.status(500).json({ success: false, message: 'Error saving data.' });
      }

      console.log('User data saved successfully.');

      // Find the matching image in the images folder
      const imagesFolder = path.join(__dirname, 'public/images');
      const matchingFile = fs.readdirSync(imagesFolder).find((file) => {
        const fileNameWithoutExt = path.parse(file).name;
        return fileNameWithoutExt === sanitizedFileName || fileNameWithoutExt === phone || fileNameWithoutExt === name;
      });

      // Notify all connected WebSocket clients (PC)
      const imageFile = matchingFile ? `/images/${matchingFile}` : '';
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          const message = {
            action: 'show_screen',
            image: imageFile,
            name,
            email,
            phone,
            redirect: true
          };
          client.send(JSON.stringify(message));
        }
      });

      // Respond to the mobile device
      res.json({
        success: true,
        message: 'Data sent successfully!',
        redirect: '/form.html',  // Ensure redirect to screen.html after successful submission
      });
    });
  });
});

// Route to serve screen.html (the page that shows image and user data)
app.get('/screen.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'screen.html'));
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.send(JSON.stringify({ message: 'Connected to server.' }));
});

// Upgrade HTTP server to handle WebSocket connections
app.server = app.listen(port, () => {
  console.log(`Server running at http://${localIP}:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
