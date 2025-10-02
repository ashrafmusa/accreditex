// main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      // The preload script is crucial for securely exposing Node.js APIs
      // to your renderer process (your React app).
      preload: path.join(__dirname, 'preload.js'),
      // It's recommended to keep contextIsolation enabled for security.
      contextIsolation: true,
      // It's recommended to disable nodeIntegration for security.
      nodeIntegration: false,
    },
    // You will need to create an assets folder with an icon
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools for debugging (optional).
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create a window when the dock icon is clicked
    // and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});