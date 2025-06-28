const { app, BrowserWindow, globalShortcut } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const os = require('os');
require('dotenv').config();

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
let win;
let localIP = getLocalIPAddress();
const port = process.env.PORT || 3000;
const serverPath = path.join(__dirname, 'server.js');

function checkServerStatus() {
  const http = require('http');
  const serverURL = `http://${localIP}:${port}`;

  http.get(serverURL, (res) => {
    if (res.statusCode === 200) {
      createWindow();
    }
  }).on('error', (err) => {
    console.log('Waiting for server to start...');
    setTimeout(checkServerStatus, 2000);
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 800,
    fullscreen: true,
    autoHideMenuBar: true,           // Remove window frame/title bar
    alwaysOnTop: true,      // Keep window above others
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL(`http://${localIP}:${port}`);

  win.on('closed', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    globalShortcut.unregisterAll();
    app.quit();
  });

  globalShortcut.register('F11', () => {
    win.setFullScreen(!win.isFullScreen());
  });
}


app.whenReady().then(() => {
  serverProcess = execFile('node', [serverPath], {
    detached: true,
    stdio: 'ignore',
  }, (error) => {
    if (error) {
      console.error(`Error running server: ${error.message}`);
    }
  });

  serverProcess.unref();
  checkServerStatus();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
