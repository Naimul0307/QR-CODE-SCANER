const { app, BrowserWindow, globalShortcut } = require('electron');
const { execFile } = require('child_process');  // Use execFile to run server
const path = require('path');
const os = require('os');
require('dotenv').config();  // Load environment variables from .env

// Function to get the local IP address
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

let serverProcess;
let win;  // The BrowserWindow instance
let localIP = getLocalIPAddress();  // Get the local IP address

// Get the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Path to the server file (resolve the path dynamically)
const serverPath = path.join(__dirname, 'server.js');

// Function to check if the server is ready
function checkServerStatus() {
  const http = require('http');
  const serverURL = `http://${localIP}:${port}`;

  http.get(serverURL, (res) => {
    if (res.statusCode === 200) {
      createWindow();  // Server is ready, create the window
    }
  }).on('error', (err) => {
    console.log('Waiting for server to start...');
    setTimeout(checkServerStatus, 2000);  // Retry every 2 seconds
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load the HTML page using the local IP address and port
  win.loadURL(`http://${localIP}:${port}`);

  // Open the DevTools (optional, for debugging)
  win.webContents.openDevTools();

  // Listen for 'close' event to stop the server when the window is closed
  win.on('closed', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  });

  // Register the F11 key to toggle full-screen mode
  globalShortcut.register('F11', () => {
    const isFullScreen = win.isFullScreen();
    win.setFullScreen(!isFullScreen); // Toggle between full-screen and normal mode
  });

  // Clean up the global shortcut when the window is closed
  win.on('closed', () => {
    globalShortcut.unregisterAll();
  });
}

// Start the server in the background when the app is ready
app.whenReady().then(() => {
  // Run the server in the background using execFile (for packaged builds)
  serverProcess = execFile('node', [serverPath], {
    detached: true,
    stdio: 'ignore',  // Ignore stdin, stdout, and stderr
  }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running server: ${error.message}`);
    }
  });

  // Ensure the server process is not blocking the app
  serverProcess.unref();  // Make sure it runs independently of the Electron app

  // Check if the server is ready before creating the window
  checkServerStatus();

  // Quit the app when all windows are closed
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
