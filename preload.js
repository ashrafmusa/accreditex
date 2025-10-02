// preload.js

const { contextBridge } = require('electron');

// We are exposing a custom object 'electronAPI' to the window object of our React app.
// This is the secure way to provide Node.js functionality (like accessing env vars)
// to your frontend code.
contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => process.env.API_KEY
});